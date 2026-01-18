import * as vscode from 'vscode';

export interface GitStatus {
  modified: Set<string>;
  untracked: Set<string>;
  staged: Set<string>;
  deleted: Set<string>;
}

export class GitService {
  private gitExtension: any;
  private repository: any;

  constructor() {
    this.initializeGit();
  }

  private async initializeGit(): Promise<void> {
    try {
      // Get Git extension
      const gitExtension = vscode.extensions.getExtension('vscode.git');
      if (!gitExtension) {
        console.log('[Strukt Git] Git extension not found');
        return;
      }

      if (!gitExtension.isActive) {
        await gitExtension.activate();
      }

      this.gitExtension = gitExtension.exports;
      const api = this.gitExtension.getAPI(1);

      if (api.repositories.length > 0) {
        this.repository = api.repositories[0];
        console.log('[Strukt Git] Git repository initialized');
      } else {
        console.log('[Strukt Git] No Git repository found');
      }
    } catch (error) {
      console.error('[Strukt Git] Error initializing Git:', error);
    }
  }

  public async getGitStatus(): Promise<GitStatus> {
    const status: GitStatus = {
      modified: new Set(),
      untracked: new Set(),
      staged: new Set(),
      deleted: new Set()
    };

    if (!this.repository) {
      await this.initializeGit();
      if (!this.repository) {
        console.log('[Strukt Git] No repository available');
        return status;
      }
    }

    try {
      // Use diffWithHEAD to get working tree changes
      const workingTreeChanges = await this.repository.diffWithHEAD();
      console.log('[Strukt Git] Working tree changes:', workingTreeChanges.length);
      
      for (const change of workingTreeChanges) {
        const path = change.uri.fsPath;
        
        // Status enum from Git extension:
        // 0 = INDEX_MODIFIED
        // 1 = INDEX_ADDED
        // 2 = INDEX_DELETED
        // 3 = INDEX_RENAMED
        // 4 = INDEX_COPIED
        // 5 = MODIFIED
        // 6 = DELETED
        // 7 = UNTRACKED
        // 8 = IGNORED
        // 9 = INTENT_TO_ADD
        
        if (change.status === 7) {
          // Untracked
          status.untracked.add(path);
          console.log('[Strukt Git] Untracked:', path);
        } else if (change.status === 5) {
          // Modified
          status.modified.add(path);
          console.log('[Strukt Git] Modified:', path);
        } else if (change.status === 6) {
          // Deleted
          status.deleted.add(path);
          console.log('[Strukt Git] Deleted:', path);
        }
      }

      // Get index (staged) changes
      const indexChanges = await this.repository.diffIndexWithHEAD();
      console.log('[Strukt Git] Index changes:', indexChanges.length);
      
      for (const change of indexChanges) {
        const path = change.uri.fsPath;
        status.staged.add(path);
        console.log('[Strukt Git] Staged:', path);
      }

      console.log('[Strukt Git] Final status:', {
        modified: status.modified.size,
        untracked: status.untracked.size,
        staged: status.staged.size,
        deleted: status.deleted.size
      });

    } catch (error) {
      console.error('[Strukt Git] Error getting status:', error);
    }

    return status;
  }

  public getFileStatus(filePath: string, gitStatus: GitStatus): 'modified' | 'untracked' | 'staged' | 'deleted' | null {
    // Normalize path for comparison (convert backslashes to forward slashes, remove drive letters)
    const normalizedPath = filePath.replace(/\\/g, '/').replace(/^[a-zA-Z]:/, '');
    
    console.log('[Strukt Git] Checking file:', normalizedPath);
    
    // Check all paths in git status
    for (const path of gitStatus.staged) {
      const normalizedGitPath = path.replace(/\\/g, '/').replace(/^[a-zA-Z]:/, '');
      if (normalizedPath.endsWith(normalizedGitPath) || normalizedGitPath.endsWith(normalizedPath)) {
        console.log('[Strukt Git] ✅ STAGED:', normalizedPath);
        return 'staged';
      }
    }
    
    for (const path of gitStatus.modified) {
      const normalizedGitPath = path.replace(/\\/g, '/').replace(/^[a-zA-Z]:/, '');
      if (normalizedPath.endsWith(normalizedGitPath) || normalizedGitPath.endsWith(normalizedPath)) {
        console.log('[Strukt Git] ✅ MODIFIED:', normalizedPath);
        return 'modified';
      }
    }
    
    for (const path of gitStatus.untracked) {
      const normalizedGitPath = path.replace(/\\/g, '/').replace(/^[a-zA-Z]:/, '');
      if (normalizedPath.endsWith(normalizedGitPath) || normalizedGitPath.endsWith(normalizedPath)) {
        console.log('[Strukt Git] ✅ UNTRACKED:', normalizedPath);
        return 'untracked';
      }
    }
    
    for (const path of gitStatus.deleted) {
      const normalizedGitPath = path.replace(/\\/g, '/').replace(/^[a-zA-Z]:/, '');
      if (normalizedPath.endsWith(normalizedGitPath) || normalizedGitPath.endsWith(normalizedPath)) {
        console.log('[Strukt Git] ✅ DELETED:', normalizedPath);
        return 'deleted';
      }
    }
    
    return null;
  }

  public dispose(): void {
    this.repository = null;
    this.gitExtension = null;
  }
}



