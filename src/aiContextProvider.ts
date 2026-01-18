import * as vscode from 'vscode';
import { AIContextManager } from './aiContextManager';

export class AIContextProvider {
  private panel: vscode.WebviewPanel | undefined;
  private readonly extensionUri: vscode.Uri;
  private readonly manager: AIContextManager;

  constructor(extensionUri: vscode.Uri, manager: AIContextManager) {
    this.extensionUri = extensionUri;
    this.manager = manager;
  }

  public show() {
    if (this.panel) {
      this.panel.reveal(vscode.ViewColumn.One);
      return;
    }

    this.panel = vscode.window.createWebviewPanel(
      'struktAIContext',
      'Strukt AI Context Manager',
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        enableCommandUris: true,
        enableForms: true
      }
    );

    this.panel.iconPath = vscode.Uri.joinPath(this.extensionUri, 'resources', 'strukt-icon.svg');
    this.panel.webview.html = this.getWebviewContent();

    this.panel.webview.onDidReceiveMessage(
      async message => {
        switch (message.command) {
          case 'getTemplates':
            const templates = this.manager.getTemplates();
            const existing = this.manager.getExistingInstructions();
            this.panel?.webview.postMessage({ 
              command: 'templatesLoaded', 
              templates,
              existing
            });
            break;

          case 'saveTemplate':
            await this.manager.saveTemplate(message.template);
            this.panel?.webview.postMessage({ command: 'templateSaved' });
            break;

          case 'deleteTemplate':
            await this.manager.deleteTemplate(message.id);
            this.panel?.webview.postMessage({ command: 'templateDeleted' });
            break;

          case 'applyTemplates':
            const result = await this.manager.applyTemplates(message.templateIds);
            this.panel?.webview.postMessage({ 
              command: 'templatesApplied', 
              result 
            });
            if (result.success) {
              vscode.window.showInformationMessage(result.message);
            } else {
              vscode.window.showErrorMessage(result.message);
            }
            break;

          case 'importTemplate':
            const fileUri = await vscode.window.showOpenDialog({
              canSelectFiles: true,
              canSelectFolders: false,
              canSelectMany: false,
              filters: {
                'Markdown': ['md', 'instructions.md']
              }
            });

            if (fileUri && fileUri[0]) {
              const imported = await this.manager.importTemplateFromFile(fileUri[0].fsPath);
              if (imported) {
                await this.manager.saveTemplate(imported);
                this.panel?.webview.postMessage({ command: 'templateImported', template: imported });
                vscode.window.showInformationMessage(`Template "${imported.name}" imported successfully`);
              }
            }
            break;

          case 'openFile':
            const doc = await vscode.workspace.openTextDocument(message.filepath);
            await vscode.window.showTextDocument(doc);
            break;
        }
      },
      undefined,
      []
    );

    this.panel.onDidDispose(
      () => {
        this.panel = undefined;
      },
      null,
      []
    );
  }

  public dispose() {
    this.panel?.dispose();
  }

  private getWebviewContent(): string {
    const nonce = this.getNonce();
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; font-src https://fonts.googleapis.com https://fonts.gstatic.com; style-src 'unsafe-inline' https://fonts.googleapis.com; script-src 'nonce-${nonce}';">
  <title>Strukt AI Context Manager</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0d1117; color: #c9d1d9; padding: 0; overflow-x: hidden; }
    .header { background: #010409; padding: 28px 36px; border-bottom: 1px solid #21262d; position: sticky; top: 0; z-index: 100; }
    .header h1 { font-size: 26px; font-weight: 600; margin-bottom: 10px; color: #f0f6fc; letter-spacing: -0.02em; }
    .header p { color: #8b949e; font-size: 14px; line-height: 1.6; }
    .container { padding: 32px; max-width: 1400px; margin: 0 auto; }
    .section { margin-bottom: 32px; }
    .section-title { font-size: 17px; font-weight: 600; margin-bottom: 18px; color: #f0f6fc; letter-spacing: -0.01em; }
    .card { background: #161b22; border: 1px solid #30363d; border-radius: 6px; padding: 24px; margin-bottom: 16px; }
    .button-group { display: flex; gap: 10px; margin-bottom: 24px; flex-wrap: wrap; }
    button { background: #238636; color: #ffffff; border: 1px solid #2ea043; padding: 9px 18px; border-radius: 6px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.15s; font-family: inherit; }
    button:hover { background: #2ea043; border-color: #3fb950; }
    button.secondary { background: transparent; color: #c9d1d9; border: 1px solid #30363d; }
    button.secondary:hover { background: #21262d; border-color: #8b949e; }
    button.danger { background: #da3633; border-color: #f85149; color: #ffffff; }
    button.danger:hover { background: #f85149; }
    button:disabled { opacity: 0.5; cursor: not-allowed; }
    .template-list { display: grid; gap: 16px; }
    .template-item { background: #0d1117; border: 1px solid #30363d; border-radius: 6px; padding: 18px; display: flex; align-items: flex-start; gap: 14px; transition: all 0.15s; }
    .template-item:hover { border-color: #58a6ff; background: #161b22; }
    .template-item.selected { border-color: #58a6ff; background: #161b22; }
    .template-checkbox { width: 18px; height: 18px; cursor: pointer; flex-shrink: 0; margin-top: 2px; }
    .template-content { flex: 1; }
    .template-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
    .template-name { font-size: 16px; font-weight: 600; color: #f0f6fc; }
    .template-actions { display: flex; gap: 8px; }
    .template-actions button { padding: 5px 12px; font-size: 12px; }
    .template-meta { color: #8b949e; font-size: 13px; margin-bottom: 10px; }
    .template-description { color: #c9d1d9; font-size: 14px; line-height: 1.6; margin-bottom: 10px; }
    .template-preview { background: #010409; border: 1px solid #21262d; border-radius: 6px; padding: 14px; font-family: 'SF Mono', 'Monaco', 'Cascadia Code', 'Consolas', monospace; font-size: 13px; color: #c9d1d9; white-space: pre-wrap; max-height: 120px; overflow-y: auto; line-height: 1.5; }
    .form-group { margin-bottom: 20px; }
    .form-group label { display: block; margin-bottom: 8px; font-size: 14px; font-weight: 500; color: #f0f6fc; }
    .form-group input, .form-group textarea { width: 100%; background: #0d1117; border: 1px solid #30363d; border-radius: 6px; padding: 10px 12px; color: #c9d1d9; font-size: 14px; font-family: inherit; }
    .form-group textarea { font-family: 'SF Mono', 'Monaco', 'Cascadia Code', 'Consolas', monospace; min-height: 220px; resize: vertical; line-height: 1.5; }
    .form-group input:focus, .form-group textarea:focus { outline: none; border-color: #58a6ff; background: #010409; }
    .form-hint { font-size: 12px; color: #8b949e; margin-top: 6px; line-height: 1.4; }
    .empty-state { text-align: center; padding: 60px 24px; color: #8b949e; }
    .empty-state-icon { font-size: 64px; margin-bottom: 20px; color: #30363d; font-weight: 300; }
    .empty-state-text { font-size: 17px; margin-bottom: 10px; color: #c9d1d9; font-weight: 500; }
    .empty-state-hint { font-size: 14px; color: #8b949e; }
    code { background: #161b22; padding: 3px 7px; border-radius: 6px; font-family: 'SF Mono', 'Monaco', 'Cascadia Code', 'Consolas', monospace; font-size: 12px; color: #f0f6fc; border: 1px solid #30363d; }
    .existing-files { background: #0d1117; border: 1px solid #30363d; border-radius: 6px; padding: 18px; }
    .file-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #21262d; }
    .file-item:last-child { border-bottom: none; }
    .file-path { font-family: 'SF Mono', 'Monaco', 'Cascadia Code', 'Consolas', monospace; font-size: 13px; color: #8b949e; }
    .file-action { padding: 4px 12px; font-size: 12px; }
    .modal { display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(1, 4, 9, 0.85); z-index: 1000; align-items: center; justify-content: center; }
    .modal.active { display: flex; }
    .modal-content { background: #161b22; border: 1px solid #30363d; border-radius: 12px; padding: 36px; max-width: 800px; width: 90%; max-height: 90vh; overflow-y: auto; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; }
    .modal-title { font-size: 22px; font-weight: 600; color: #f0f6fc; letter-spacing: -0.02em; }
    .modal-close { background: transparent; color: #8b949e; padding: 8px; font-size: 22px; line-height: 1; border: none; cursor: pointer; }
    .modal-close:hover { color: #f0f6fc; }
    .status-message { padding: 14px 18px; border-radius: 6px; margin-bottom: 18px; font-size: 14px; display: none; font-weight: 500; }
    .status-message.success { background: #0f5323; border: 1px solid #1a7f37; color: #7ee787; display: block; }
    .status-message.error { background: #490202; border: 1px solid #f85149; color: #ffa198; display: block; }
    .info-box { background: #0c2d6b; border: 1px solid #1f6feb; border-radius: 6px; padding: 18px; margin-bottom: 28px; font-size: 14px; color: #c9d1d9; line-height: 1.6; }
    .info-box strong { color: #58a6ff; font-weight: 600; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Strukt AI Context Manager</h1>
    <p>Create and manage AI instruction templates that automatically integrate with GitHub Copilot</p>
  </div>

  <div class="container">
    <div id="statusMessage" class="status-message"></div>

    <div class="info-box">
      <strong>How it works:</strong> Templates are saved to <code>.github/instructions/</code> and automatically included in all GitHub Copilot chat requests. Use glob patterns to apply instructions to specific files only.
    </div>

    <div class="section">
      <div class="section-title">Your Templates</div>
      <div class="button-group">
        <button id="createBtn">Create New Template</button>
        <button class="secondary" id="importBtn">Import from File</button>
        <button class="secondary" id="applyBtn" disabled>Apply Selected to Workspace</button>
      </div>

      <div id="templateList" class="template-list">
        <div class="empty-state">
          <div class="empty-state-icon">{ }</div>
          <div class="empty-state-text">No templates yet</div>
          <div class="empty-state-hint">Create your first AI instruction template to get started</div>
        </div>
      </div>
    </div>

    <div class="section" id="existingSection" style="display: none;">
      <div class="section-title">Existing Instructions in Workspace</div>
      <div id="existingFiles" class="existing-files"></div>
    </div>
  </div>

  <div id="templateModal" class="modal">
    <div class="modal-content">
      <div class="modal-header">
        <div class="modal-title" id="modalTitle">Create New Template</div>
        <button class="modal-close" id="modalCloseBtn">×</button>
      </div>

      <form id="templateForm">
        <input type="hidden" id="templateId">

        <div class="form-group">
          <label for="templateName">Template Name</label>
          <input type="text" id="templateName" placeholder="e.g., Backend Standards" required>
          <div class="form-hint">A descriptive name for this template</div>
        </div>

        <div class="form-group">
          <label for="templateDescription">Description (optional)</label>
          <input type="text" id="templateDescription" placeholder="e.g., Coding standards for backend services">
          <div class="form-hint">Brief description of what these instructions cover</div>
        </div>

        <div class="form-group">
          <label for="templateApplyTo">Apply To (glob pattern, optional)</label>
          <input type="text" id="templateApplyTo" placeholder="e.g., **/*.ts or src/backend/**">
          <div class="form-hint">File pattern to auto-apply. Leave empty for manual use. Examples: **/*.py, src/**/*.tsx</div>
        </div>

        <div class="form-group">
          <label for="templateContent">Instructions (Markdown)</label>
          <textarea id="templateContent" placeholder="Write your AI instructions here...

Example:
- Always use TypeScript strict mode
- Follow REST API naming conventions
- Include error handling in all async functions
- Write unit tests for all business logic" required></textarea>
          <div class="form-hint">These instructions will be provided to GitHub Copilot</div>
        </div>

        <div class="button-group">
          <button type="submit">Save Template</button>
          <button type="button" class="secondary" id="modalCancelBtn">Cancel</button>
        </div>
      </form>
    </div>
  </div>

  <div id="confirmModal" class="modal">
    <div class="modal-content" style="max-width: 420px; padding: 24px;">
      <div style="margin-bottom: 18px;">
        <div class="modal-title" style="font-size: 18px;">Confirm Delete</div>
      </div>
      <div style="margin-bottom: 24px; color: #c9d1d9; font-size: 14px; line-height: 1.6;">
        <p id="confirmMessage" style="margin: 0;">Are you sure you want to delete this template?</p>
      </div>
      <div class="button-group" style="margin-bottom: 0;">
        <button class="danger" id="confirmDeleteBtn">Delete</button>
        <button type="button" class="secondary" id="confirmCancelBtn">Cancel</button>
      </div>
    </div>
  </div>

  <script nonce="${nonce}">
    const vscode = acquireVsCodeApi();
    let templates = [];
    let existingInstructions = { copilotInstructions: null, customInstructions: [] };

    window.addEventListener('message', event => {
      const message = event.data;
      
      switch (message.command) {
        case 'templatesLoaded':
          templates = message.templates;
          existingInstructions = message.existing;
          renderTemplates();
          renderExistingFiles();
          break;

        case 'templateSaved':
          showStatus('Template saved successfully', 'success');
          document.getElementById('templateModal').classList.remove('active');
          loadTemplates();
          break;

        case 'templateDeleted':
          showStatus('Template deleted', 'success');
          loadTemplates();
          break;

        case 'templateImported':
          templates.push(message.template);
          renderTemplates();
          break;

        case 'templatesApplied':
          if (message.result.success) {
            showStatus(message.result.message, 'success');
            loadTemplates();
          } else {
            showStatus(message.result.message, 'error');
          }
          break;
      }
    });

    function loadTemplates() {
      vscode.postMessage({ command: 'getTemplates' });
    }

    function renderTemplates() {
      const container = document.getElementById('templateList');
      
      if (templates.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">{ }</div><div class="empty-state-text">No templates yet</div><div class="empty-state-hint">Create your first AI instruction template to get started</div></div>';
        return;
      }

      const html = templates.map(t => {
        const desc = t.description ? '<div class="template-description">' + escapeHtml(t.description) + '</div>' : '';
        const meta = t.applyTo ? '<div class="template-meta">Auto-applies to: <code>' + escapeHtml(t.applyTo) + '</code></div>' : '<div class="template-meta">Manual application only</div>';
        const preview = escapeHtml(t.content.substring(0, 200)) + (t.content.length > 200 ? '...' : '');
        
        return '<div class="template-item" data-id="' + t.id + '">' +
          '<input type="checkbox" class="template-checkbox">' +
          '<div class="template-content">' +
            '<div class="template-header">' +
              '<div class="template-name">' + escapeHtml(t.name) + '</div>' +
              '<div class="template-actions">' +
                '<button class="secondary" data-action="edit" data-id="' + t.id + '">Edit</button>' +
                '<button class="danger" data-action="delete" data-id="' + t.id + '">Delete</button>' +
              '</div>' +
            '</div>' +
            desc +
            meta +
            '<div class="template-preview">' + preview + '</div>' +
          '</div>' +
        '</div>';
      }).join('');
      
      container.innerHTML = html;
    }

    function renderExistingFiles() {
      const section = document.getElementById('existingSection');
      const container = document.getElementById('existingFiles');
      
      const hasFiles = existingInstructions.copilotInstructions || existingInstructions.customInstructions.length > 0;
      
      if (!hasFiles) {
        section.style.display = 'none';
        return;
      }

      section.style.display = 'block';
      
      let html = '';
      
      if (existingInstructions.copilotInstructions) {
        html += '<div class="file-item">' +
          '<div class="file-path">.github/copilot-instructions.md</div>' +
          '<button class="secondary file-action" data-action="open" data-path="' + escapeHtml(existingInstructions.copilotInstructions) + '">Open</button>' +
        '</div>';
      }

      existingInstructions.customInstructions.forEach(file => {
        const filename = file.split(/[\\/]/).pop();
        html += '<div class="file-item">' +
          '<div class="file-path">.github/instructions/' + filename + '</div>' +
          '<button class="secondary file-action" data-action="open" data-path="' + escapeHtml(file) + '">Open</button>' +
        '</div>';
      });

      container.innerHTML = html;
    }

    document.addEventListener('click', function(e) {
      let target = e.target;
      
      // Find the actual button if we clicked inside it
      if (target.tagName !== 'BUTTON' && target.closest('button')) {
        target = target.closest('button');
      }
      
      if (target.id === 'createBtn') {
        document.getElementById('modalTitle').textContent = 'Create New Template';
        document.getElementById('templateForm').reset();
        document.getElementById('templateId').value = '';
        document.getElementById('templateModal').classList.add('active');
      }
      
      else if (target.id === 'importBtn') {
        vscode.postMessage({ command: 'importTemplate' });
      }
      
      else if (target.id === 'applyBtn') {
        const selected = Array.from(document.querySelectorAll('.template-checkbox:checked'))
          .map(cb => cb.closest('.template-item').dataset.id);
        
        if (selected.length > 0) {
          vscode.postMessage({ command: 'applyTemplates', templateIds: selected });
        }
      }
      
      else if (target.id === 'modalCloseBtn' || target.id === 'modalCancelBtn') {
        document.getElementById('templateModal').classList.remove('active');
      }
      
      else if (target.tagName === 'BUTTON' && target.dataset.action === 'edit') {
        const id = target.dataset.id;
        const template = templates.find(t => t.id === id);
        if (template) {
          document.getElementById('modalTitle').textContent = 'Edit Template';
          document.getElementById('templateId').value = template.id;
          document.getElementById('templateName').value = template.name;
          document.getElementById('templateDescription').value = template.description || '';
          document.getElementById('templateApplyTo').value = template.applyTo || '';
          document.getElementById('templateContent').value = template.content;
          document.getElementById('templateModal').classList.add('active');
        }
      }
      
      else if (target.tagName === 'BUTTON' && target.dataset.action === 'delete') {
        const id = target.dataset.id;
        const template = templates.find(t => t.id === id);
        if (template) {
          document.getElementById('confirmMessage').textContent = 'Delete template "' + template.name + '"?';
          document.getElementById('confirmDeleteBtn').dataset.deleteId = id;
          document.getElementById('confirmModal').classList.add('active');
        }
      }
      
      else if (target.id === 'confirmDeleteBtn') {
        const id = target.dataset.deleteId;
        if (id) {
          vscode.postMessage({ command: 'deleteTemplate', id });
          document.getElementById('confirmModal').classList.remove('active');
        }
      }
      
      else if (target.id === 'confirmCancelBtn') {
        document.getElementById('confirmModal').classList.remove('active');
      }
      
      else if (target.tagName === 'BUTTON' && target.dataset.action === 'open') {
        vscode.postMessage({ command: 'openFile', filepath: target.dataset.path });
      }
    });

    document.addEventListener('change', function(e) {
      if (e.target.classList.contains('template-checkbox')) {
        const checked = document.querySelectorAll('.template-checkbox:checked');
        document.getElementById('applyBtn').disabled = checked.length === 0;
        
        document.querySelectorAll('.template-item').forEach(item => {
          const checkbox = item.querySelector('.template-checkbox');
          item.classList.toggle('selected', checkbox.checked);
        });
      }
    });

    function showStatus(message, type) {
      const el = document.getElementById('statusMessage');
      el.textContent = message;
      el.className = 'status-message ' + type;
      setTimeout(function() {
        el.className = 'status-message';
      }, 5000);
    }

    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    document.getElementById('templateForm').addEventListener('submit', function(e) {
      e.preventDefault();

      const template = {
        id: document.getElementById('templateId').value || Date.now() + '-' + Math.random().toString(36).substr(2, 9),
        name: document.getElementById('templateName').value,
        description: document.getElementById('templateDescription').value || undefined,
        applyTo: document.getElementById('templateApplyTo').value || undefined,
        content: document.getElementById('templateContent').value
      };

      vscode.postMessage({ command: 'saveTemplate', template });
    });

    loadTemplates();
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
}
