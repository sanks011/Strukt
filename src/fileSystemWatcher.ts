import * as vscode from 'vscode';

export class FileSystemWatcher {
  private watchers: vscode.FileSystemWatcher[] = [];
  private changeEmitter = new vscode.EventEmitter<void>();
  private debounceTimer: NodeJS.Timeout | undefined;
  private readonly debounceDelay = 500; // milliseconds

  public readonly onDidChange = this.changeEmitter.event;

  constructor() {
    this.setupWatchers();
  }

  private setupWatchers(): void {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
      return;
    }

    // Watch for file changes, excluding build artifacts and common ignore folders
    const patterns = [
      '**/*.{js,ts,jsx,tsx,py,java,cpp,c,h,css,html,json,md,txt,xml,yaml,yml}',
      '**/{src,lib,app,components,pages,models,views,controllers}/**',
    ];

    patterns.forEach(pattern => {
      const watcher = vscode.workspace.createFileSystemWatcher(
        new vscode.RelativePattern(workspaceFolders[0], pattern)
      );

      watcher.onDidCreate(() => this.onFileChange());
      watcher.onDidDelete(() => this.onFileChange());
      // Don't watch file content changes - only structural changes
      // watcher.onDidChange(() => this.onFileChange());

      this.watchers.push(watcher);
    });
  }

  private onFileChange(): void {
    // Debounce the change event to avoid excessive updates
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.changeEmitter.fire();
    }, this.debounceDelay);
  }

  public dispose(): void {
    this.watchers.forEach(watcher => watcher.dispose());
    this.watchers = [];
    
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    
    this.changeEmitter.dispose();
  }
}
