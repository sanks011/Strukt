import * as vscode from 'vscode';
import { ProjectMapProvider } from './webviewProvider';
import { AIContextManager } from './aiContextManager';
import { AIContextProvider } from './aiContextProvider';

let projectMapProvider: ProjectMapProvider | undefined;
let aiContextManager: AIContextManager | undefined;
let aiContextProvider: AIContextProvider | undefined;

export function activate(context: vscode.ExtensionContext) {
  console.log('Strukt extension is now active');

  // Initialize the webview provider (for command palette and sidebar button)
  projectMapProvider = new ProjectMapProvider(context.extensionUri);

  // Initialize AI Context Manager
  aiContextManager = new AIContextManager(context);
  aiContextProvider = new AIContextProvider(context.extensionUri, aiContextManager);

  // Register command to open project map
  const openMapCommand = vscode.commands.registerCommand('strukt.openProjectMap', () => {
    projectMapProvider?.show();
  });

  // Register command to refresh project map
  const refreshMapCommand = vscode.commands.registerCommand('strukt.refreshProjectMap', () => {
    projectMapProvider?.refresh();
  });

  // Register command to open AI Context Manager
  const openAIContextCommand = vscode.commands.registerCommand('strukt.openAIContext', () => {
    aiContextProvider?.show();
  });
  
  context.subscriptions.push(openMapCommand, refreshMapCommand, openAIContextCommand);
}

export function deactivate() {
  projectMapProvider?.dispose();
  aiContextProvider?.dispose();
}
