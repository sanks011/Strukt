import * as vscode from 'vscode';
import * as path from 'path';
import { GitService, GitStatus } from './gitService';

export interface FileNode {
  name: string;
  type: 'file' | 'folder';
  path: string;
  size?: number;
  children?: FileNode[];
  gitStatus?: 'modified' | 'untracked' | 'staged' | 'deleted';
}

export class FileTreeBuilder {
  private gitService: GitService;

  constructor() {
    this.gitService = new GitService();
  }
  
  public async buildTree(maxDepth: number, excludePatterns: string[], includeGitStatus: boolean = true): Promise<FileNode> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    
    console.log('[Strukt] Building tree with maxDepth:', maxDepth, 'excludePatterns:', excludePatterns);
    console.log('[Strukt] Workspace folders:', workspaceFolders?.length || 0);
    
    if (!workspaceFolders || workspaceFolders.length === 0) {
      console.warn('[Strukt] No workspace folder found!');
      return {
        name: 'No workspace',
        type: 'folder',
        path: '',
        children: []
      };
    }

    // Get Git status if enabled
    const gitStatus = includeGitStatus ? await this.gitService.getGitStatus() : null;

    const rootFolder = workspaceFolders[0];
    console.log('[Strukt] Root folder:', rootFolder.uri.fsPath);
    const tree = await this.buildNode(rootFolder.uri, '', 0, maxDepth, excludePatterns, gitStatus);
    console.log('[Strukt] Tree built with', this.countNodes(tree), 'nodes');
    return tree;
  }

  private countNodes(node: FileNode): number {
    let count = 1;
    if (node.children) {
      for (const child of node.children) {
        count += this.countNodes(child);
      }
    }
    return count;
  }

  private async buildNode(
    uri: vscode.Uri,
    relativePath: string,
    currentDepth: number,
    maxDepth: number,
    excludePatterns: string[],
    gitStatus: GitStatus | null
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
      const fileNode: FileNode = {
        name,
        type: 'file',
        path: relativePath,
        size: stat.size
      };

      // Add git status if available
      if (gitStatus) {
        const status = this.gitService.getFileStatus(uri.fsPath, gitStatus);
        if (status) {
          fileNode.gitStatus = status;
        }
      }

      return fileNode;
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
          excludePatterns,
          gitStatus
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
