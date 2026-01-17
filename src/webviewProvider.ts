import * as vscode from 'vscode';
import { FileTreeBuilder } from './treeBuilder';
import { FileSystemWatcher } from './fileSystemWatcher';

export class ProjectMapProvider {
  private panel: vscode.WebviewPanel | undefined;
  private treeBuilder: FileTreeBuilder;
  private fileWatcher: FileSystemWatcher;

  constructor(private readonly extensionUri: vscode.Uri) {
    this.treeBuilder = new FileTreeBuilder();
    this.fileWatcher = new FileSystemWatcher();

    // Set up file watcher to trigger refresh
    this.fileWatcher.onDidChange(() => {
      this.refresh();
    });
  }

  public show(): void {
    if (this.panel) {
      this.panel.reveal();
    } else {
      this.createPanel();
    }
  }

  public refresh(): void {
    if (this.panel) {
      this.sendTreeData();
    }
  }

  public dispose(): void {
    this.fileWatcher.dispose();
    this.panel?.dispose();
  }

  private createPanel(): void {
    this.panel = vscode.window.createWebviewPanel(
      'struktProjectMap',
      'Project Map',
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: false,
        localResourceRoots: [
          vscode.Uri.joinPath(this.extensionUri, 'media'),
          vscode.Uri.joinPath(this.extensionUri, 'node_modules', '3d-force-graph', 'dist'),
          vscode.Uri.joinPath(this.extensionUri, 'node_modules', 'three', 'build')
        ]
      }
    );

    this.panel.iconPath = {
      light: vscode.Uri.joinPath(this.extensionUri, 'media', 'icons', 'icon-light.svg'),
      dark: vscode.Uri.joinPath(this.extensionUri, 'media', 'icons', 'icon-dark.svg')
    };

    this.panel.onDidDispose(() => {
      this.panel = undefined;
    });

    // Set HTML only once
    this.panel.webview.html = this.getHtmlContent(this.panel.webview);

    // Handle messages from webview
    this.panel.webview.onDidReceiveMessage(
      message => {
        switch (message.type) {
          case 'openFile':
            this.openFile(message.path);
            break;
          case 'ready':
            // Send initial data when webview is ready
            this.sendTreeData();
            break;
          case 'refresh':
            // Manual refresh from webview button
            this.sendTreeData();
            break;
        }
      }
    );
  }

  private async sendTreeData(): Promise<void> {
    if (!this.panel) {
      return;
    }

    const config = vscode.workspace.getConfiguration('strukt');
    const maxDepth = config.get<number>('maxDepth', 10);
    const excludePatterns = config.get<string[]>('excludePatterns', []);
    const layout = config.get<string>('layout', 'breadthfirst');

    const tree = await this.treeBuilder.buildTree(maxDepth, excludePatterns);

    // Only send data via postMessage - don't recreate HTML!
    this.panel.webview.postMessage({
      type: 'update',
      tree,
      layout
    });
  }

  private getHtmlContent(webview: vscode.Webview): string {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, 'media', 'main.js')
    );
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, 'media', 'style.css')
    );
    const threeUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, 'node_modules', 'three', 'build', 'three.min.js')
    );
    const forceGraphUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, 'node_modules', '3d-force-graph', 'dist', '3d-force-graph.min.js')
    );

    const nonce = this.getNonce();

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
  <link href="${styleUri}" rel="stylesheet">
  <title>Project Map</title>
</head>
<body>
  <div id="controls">
    <button id="fit">Fit to Screen</button>
    <button id="reset">Reset View</button>
    <select id="layout">
      <option value="force-directed">Force Directed</option>
      <option value="hierarchical">Hierarchical</option>
      <option value="radial">Radial</option>
    </select>
    <div id="zoom-container">
      <label for="zoom-slider">Zoom:</label>
      <input type="range" id="zoom-slider" min="5" max="300" value="100" step="5">
      <span id="zoom-level">100%</span>
    </div>
  </div>
  <div id="cy"></div>
  <div id="info"></div>
  
  <script nonce="${nonce}" src="${threeUri}"></script>
  <script nonce="${nonce}" src="${forceGraphUri}"></script>
  <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
  }

  private getNonce(): string {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  private async openFile(relativePath: string): Promise<void> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
      return;
    }

    const fileUri = vscode.Uri.joinPath(workspaceFolders[0].uri, relativePath);
    
    try {
      const document = await vscode.workspace.openTextDocument(fileUri);
      await vscode.window.showTextDocument(document);
    } catch (error) {
      vscode.window.showErrorMessage(`Could not open file: ${relativePath}`);
    }
  }
}
