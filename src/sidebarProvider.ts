import * as vscode from 'vscode';
import { FileTreeBuilder } from './treeBuilder';

export class StruktSidebarProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'strukt.projectMapView';
  
  private _view?: vscode.WebviewView;

  constructor(
    private readonly _extensionUri: vscode.Uri,
    private readonly treeBuilder: FileTreeBuilder
  ) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken,
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.joinPath(this._extensionUri, 'media'),
        vscode.Uri.joinPath(this._extensionUri, 'dist')
      ]
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    // Handle messages from webview
    webviewView.webview.onDidReceiveMessage(data => {
      switch (data.type) {
        case 'openFile':
          if (data.path) {
            vscode.workspace.openTextDocument(data.path).then(doc => {
              vscode.window.showTextDocument(doc);
            });
          }
          break;
        case 'requestTree':
          this.updateTreeData();
          break;
      }
    });

    // Send initial tree data
    this.updateTreeData();
  }

  public async updateTreeData() {
    if (this._view) {
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (workspaceFolders && workspaceFolders.length > 0) {
        // Get configuration
        const config = vscode.workspace.getConfiguration('strukt');
        const maxDepth = config.get<number>('maxDepth', 5);
        const excludePatterns = config.get<string[]>('excludePatterns', ['node_modules', '.git', 'dist', 'out', 'build']);
        
        const tree = await this.treeBuilder.buildTree(maxDepth, excludePatterns);
        this._view.webview.postMessage({ 
          type: 'updateTree', 
          tree: tree 
        });
      }
    }
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js')
    );
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'media', 'style.css')
    );

    const nonce = getNonce();

    return `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}' https://unpkg.com; img-src https://api.iconify.design data:; worker-src 'none';">
      <link href="${styleUri}" rel="stylesheet">
      <script nonce="${nonce}" src="https://unpkg.com/feather-icons"></script>
      <title>Strukt Project Map</title>
    </head>
    <body>
      <div id="particles-bg"></div>
      
      <div id="controls">
        <div class="control-group">
          <button id="fit" title="Fit to Screen" style="padding: 6px 12px; font-size: 12px; display: flex; align-items: center; gap: 6px;">
            <i data-feather="maximize"></i> <span>Fit</span>
          </button>
          <button id="reset" title="Reset View" style="padding: 6px 12px; font-size: 12px; display: flex; align-items: center; gap: 6px;">
            <i data-feather="rotate-ccw"></i> <span>Reset</span>
          </button>
        </div>
        
        <div class="search-box">
          <i data-feather="search"></i>
          <input type="text" id="search-input" placeholder="Search files..." />
          <button id="search-clear" title="Clear search"><i data-feather="x"></i></button>
        </div>
        
        <div id="search-info" style="display: none;"></div>
      </div>
      
      <div id="breadcrumb"></div>
      <div id="3d-graph"></div>
      
      <script nonce="${nonce}" src="https://unpkg.com/three"></script>
      <script nonce="${nonce}" src="https://unpkg.com/3d-force-graph"></script>
      <script nonce="${nonce}" src="https://unpkg.com/particles.js@2.0.0/particles.js"></script>
      <script nonce="${nonce}" src="${scriptUri}"></script>
    </body>
    </html>`;
  }
}

function getNonce() {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
