import * as vscode from 'vscode';
import * as path from 'path';

export interface FileNode {
  name: string;
  type: 'file' | 'folder';
  path: string;
  size?: number;
  children?: FileNode[];
}

export class FileTreeBuilder {
  
  public async buildTree(maxDepth: number, excludePatterns: string[]): Promise<FileNode> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    
    if (!workspaceFolders || workspaceFolders.length === 0) {
      return {
        name: 'No workspace',
        type: 'folder',
        path: '',
        children: []
      };
    }

    const rootFolder = workspaceFolders[0];
    return this.buildNode(rootFolder.uri, '', 0, maxDepth, excludePatterns);
  }

  private async buildNode(
    uri: vscode.Uri,
    relativePath: string,
    currentDepth: number,
    maxDepth: number,
    excludePatterns: string[]
  ): Promise<FileNode> {
    
    const stat = await vscode.workspace.fs.stat(uri);
    const name = path.basename(uri.fsPath);

    // Check if this path should be excluded
    if (this.shouldExclude(relativePath || name, excludePatterns)) {
      return {
        name,
        type: 'folder',
        path: relativePath,
        children: []
      };
    }

    if (stat.type === vscode.FileType.File) {
      return {
        name,
        type: 'file',
        path: relativePath,
        size: stat.size
      };
    }

    // It's a directory
    const node: FileNode = {
      name,
      type: 'folder',
      path: relativePath,
      children: []
    };

    // Stop recursion if we've reached max depth
    if (currentDepth >= maxDepth) {
      return node;
    }

    try {
      const entries = await vscode.workspace.fs.readDirectory(uri);
      
      const childPromises = entries.map(async ([childName]) => {
        const childUri = vscode.Uri.joinPath(uri, childName);
        const childRelativePath = relativePath ? `${relativePath}/${childName}` : childName;
        
        return this.buildNode(
          childUri,
          childRelativePath,
          currentDepth + 1,
          maxDepth,
          excludePatterns
        );
      });

      const children = await Promise.all(childPromises);
      
      // Filter out excluded items and sort (folders first, then files)
      node.children = children
        .filter(child => child.children !== undefined || child.type === 'file')
        .sort((a, b) => {
          if (a.type === b.type) {
            return a.name.localeCompare(b.name);
          }
          return a.type === 'folder' ? -1 : 1;
        });

    } catch (error) {
      console.error(`Error reading directory ${uri.fsPath}:`, error);
    }

    return node;
  }

  private shouldExclude(itemPath: string, excludePatterns: string[]): boolean {
    // Simple glob matching - checks if path contains any of the exclude patterns
    return excludePatterns.some(pattern => {
      const cleanPattern = pattern.replace(/\*\*/g, '').replace(/\*/g, '').replace(/\//g, '');
      return itemPath.includes(cleanPattern);
    });
  }

  public async getFileStats(uri: vscode.Uri): Promise<{ size: number; modified: number }> {
    try {
      const stat = await vscode.workspace.fs.stat(uri);
      return {
        size: stat.size,
        modified: stat.mtime
      };
    } catch {
      return { size: 0, modified: 0 };
    }
  }
}
