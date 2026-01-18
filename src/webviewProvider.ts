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
          vscode.Uri.joinPath(this.extensionUri, 'node_modules', 'three', 'build'),
          vscode.Uri.joinPath(this.extensionUri, 'node_modules', 'particles.js')
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
            console.log('Opening file:', message.path);
            if (!message.path) {
              console.error('No path provided in openFile message');
              return;
            }
            this.openFile(message.path);
            break;
          case 'ready':
            console.log('Webview ready, sending tree data');
            // Send initial data when webview is ready
            this.sendTreeData();
            break;
          case 'refresh':
            console.log('Manual refresh requested');
            // Manual refresh from webview button
            this.sendTreeData();
            break;
        }
      }
    );
  }

  private async sendTreeData(): Promise<void> {
    if (!this.panel) {
      console.log('[Strukt] No panel to send data to');
      return;
    }

    console.log('[Strukt] Sending tree data...');
    const config = vscode.workspace.getConfiguration('strukt');
    const maxDepth = config.get<number>('maxDepth', 10);
    const excludePatterns = config.get<string[]>('excludePatterns', []);
    const showGitStatus = config.get<boolean>('showGitStatus', true);
    const layout = config.get<string>('layout', 'breadthfirst');

    console.log('[Strukt] Config - maxDepth:', maxDepth, 'showGitStatus:', showGitStatus);

    const tree = await this.treeBuilder.buildTree(maxDepth, excludePatterns, showGitStatus);
    console.log('[Strukt] Tree object:', tree);

    // Only send data via postMessage - don't recreate HTML!
    this.panel.webview.postMessage({
      type: 'update',
      tree,
      layout
    });
    console.log('[Strukt] Tree data sent to webview');
  }

  private getHtmlContent(webview: vscode.Webview): string {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, 'media', 'main.js')
    );
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, 'media', 'style.css')
    );
    
    // Use CDN URLs for libraries since node_modules is excluded from package
    const threeUri = 'https://unpkg.com/three@0.159.0/build/three.min.js';
    const forceGraphUri = 'https://unpkg.com/3d-force-graph@1.73.2/dist/3d-force-graph.min.js';
    const particlesUri = 'https://unpkg.com/particles.js@2.0.0/particles.js';

    const nonce = this.getNonce();

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}' https://unpkg.com; img-src https://api.iconify.design data:; worker-src 'none';">
  <link href="${styleUri}" rel="stylesheet">
  <script nonce="${nonce}" src="https://unpkg.com/feather-icons"></script>
  <title>Project Map - Strukt</title>
</head>
<body>
  <div id="particles-bg"></div>
  
  <div id="controls">
    <div class="control-group">
      <button id="fit" title="Fit to Screen" style="padding: 6px 12px; font-size: 12px; display: flex; align-items: center; gap: 6px;"><i data-feather="maximize"></i> <span>Fit to Screen</span></button>
      <button id="reset" title="Reset View" style="padding: 6px 12px; font-size: 12px; display: flex; align-items: center; gap: 6px;"><i data-feather="rotate-ccw"></i> <span>Reset View</span></button>
    </div>
    
    <div class="search-box">
      <i data-feather="search"></i>
      <input type="text" id="search-input" placeholder="Search files..." />
      <button id="search-clear" title="Clear search"><i data-feather="x"></i></button>
    </div>
    
    <div id="search-info" style="display: none;"></div>
  </div>
  
  <div id="breadcrumb"></div>
  
  <!-- Filter Sidebar -->
  <div id="filter-sidebar" class="collapsed">
    <button id="toggle-sidebar" title="Toggle Filters">
      <i data-feather="sliders"></i>
    </button>
    
    <div class="sidebar-content">
      <div class="sidebar-header">
        <h3><i data-feather="filter"></i> Filters</h3>
        <button id="clear-filters" title="Clear All Filters">
          <i data-feather="refresh-cw"></i> Reset
        </button>
      </div>
      
      <!-- File Type Filter -->
      <div class="filter-section">
        <div class="section-header" data-section="file-types">
          <i data-feather="chevron-down"></i>
          <span>File Types</span>
        </div>
        <div class="section-content" id="file-types-content">
          <label class="filter-checkbox">
            <input type="checkbox" value="js" checked>
            <span>JavaScript (.js)</span>
          </label>
          <label class="filter-checkbox">
            <input type="checkbox" value="ts" checked>
            <span>TypeScript (.ts)</span>
          </label>
          <label class="filter-checkbox">
            <input type="checkbox" value="json" checked>
            <span>JSON (.json)</span>
          </label>
          <label class="filter-checkbox">
            <input type="checkbox" value="md" checked>
            <span>Markdown (.md)</span>
          </label>
          <label class="filter-checkbox">
            <input type="checkbox" value="css" checked>
            <span>CSS (.css)</span>
          </label>
          <label class="filter-checkbox">
            <input type="checkbox" value="html" checked>
            <span>HTML (.html)</span>
          </label>
          <label class="filter-checkbox">
            <input type="checkbox" value="folder" checked>
            <span>Folders</span>
          </label>
        </div>
      </div>
      
      <!-- Depth Filter -->
      <div class="filter-section">
        <div class="section-header" data-section="depth">
          <i data-feather="chevron-down"></i>
          <span>Depth Level</span>
        </div>
        <div class="section-content" id="depth-content">
          <div class="slider-control">
            <label>Max Depth: <span id="depth-value">10</span></label>
            <input type="range" id="depth-slider" min="1" max="10" value="10" step="1">
          </div>
        </div>
      </div>
      
      <!-- Size Filter -->
      <div class="filter-section">
        <div class="section-header" data-section="size">
          <i data-feather="chevron-down"></i>
          <span>File Size</span>
        </div>
        <div class="section-content" id="size-content">
          <label class="filter-checkbox">
            <input type="checkbox" name="size-filter" value="all" checked>
            <span>All Sizes</span>
          </label>
          <label class="filter-checkbox">
            <input type="checkbox" name="size-filter" value="small">
            <span>Small (&lt; 10 KB)</span>
          </label>
          <label class="filter-checkbox">
            <input type="checkbox" name="size-filter" value="medium">
            <span>Medium (10-100 KB)</span>
          </label>
          <label class="filter-checkbox">
            <input type="checkbox" name="size-filter" value="large">
            <span>Large (&gt; 100 KB)</span>
          </label>
        </div>
      </div>
    </div>
  </div>
  
  <div id="cy"></div>
  
  <script nonce="${nonce}">
    // Load libraries in order with nonce attributes
    const nonce = '${nonce}';
    const script1 = document.createElement('script');
    script1.nonce = nonce;
    script1.src = '${particlesUri}';
    script1.onload = () => {
      console.log('particles.js loaded');
      const script2 = document.createElement('script');
      script2.nonce = nonce;
      script2.src = '${threeUri}';
      script2.onload = () => {
        console.log('Three.js loaded');
        const script3 = document.createElement('script');
        script3.nonce = nonce;
        script3.src = '${forceGraphUri}';
        script3.onload = () => {
          console.log('ForceGraph3D loaded');
          const script4 = document.createElement('script');
          script4.nonce = nonce;
          script4.src = '${scriptUri}';
          script4.onload = () => {
            // Replace all feather icon placeholders with actual SVG icons
            if (typeof feather !== 'undefined') {
              feather.replace();
            }
          };
          document.body.appendChild(script4);
        };
        document.body.appendChild(script3);
      };
      document.body.appendChild(script2);
    };
    document.body.appendChild(script1);
  </script>
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
      console.error('No workspace folder found');
      vscode.window.showErrorMessage('No workspace folder is open');
      return;
    }

    console.log('Attempting to open file:', relativePath);
    
    // Handle both relative and absolute paths
    let fileUri: vscode.Uri;
    if (relativePath.includes(':')) {
      // Absolute path (Windows/Unix)
      fileUri = vscode.Uri.file(relativePath);
    } else {
      // Relative path
      fileUri = vscode.Uri.joinPath(workspaceFolders[0].uri, relativePath);
    }
    
    console.log('Resolved file URI:', fileUri.toString());
    
    try {
      const document = await vscode.workspace.openTextDocument(fileUri);
      await vscode.window.showTextDocument(document);
      console.log('File opened successfully');
    } catch (error) {
      console.error('Failed to open file:', error);
      vscode.window.showErrorMessage(`Could not open file: ${relativePath}`);
    }
  }
}
