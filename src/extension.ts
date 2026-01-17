import * as vscode from 'vscode';
import { ProjectMapProvider } from './webviewProvider';

let projectMapProvider: ProjectMapProvider | undefined;

export function activate(context: vscode.ExtensionContext) {
  console.log('Strukt extension is now active');

  // Initialize the webview provider (for command palette and sidebar button)
  projectMapProvider = new ProjectMapProvider(context.extensionUri);

  // Register command to open project map
  const openMapCommand = vscode.commands.registerCommand('strukt.openProjectMap', () => {
    projectMapProvider?.show();
  });

  // Register command to refresh project map
  const refreshMapCommand = vscode.commands.registerCommand('strukt.refreshProjectMap', () => {
    projectMapProvider?.refresh();
  });
  
  context.subscriptions.push(openMapCommand, refreshMapCommand);
}

export function deactivate() {
  projectMapProvider?.dispose();
}
