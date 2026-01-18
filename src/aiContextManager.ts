import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export interface Template {
  id: string;
  name: string;
  content: string;
  applyTo?: string;
  description?: string;
}

export class AIContextManager {
  private context: vscode.ExtensionContext;
  private readonly STORAGE_KEY = 'strukt.aiContextTemplates';

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  // Get all templates
  getTemplates(): Template[] {
    return this.context.globalState.get<Template[]>(this.STORAGE_KEY, []);
  }

  // Save template
  async saveTemplate(template: Template): Promise<void> {
    const templates = this.getTemplates();
    const index = templates.findIndex(t => t.id === template.id);
    
    if (index >= 0) {
      templates[index] = template;
    } else {
      templates.push(template);
    }
    
    await this.context.globalState.update(this.STORAGE_KEY, templates);
  }

  // Delete template
  async deleteTemplate(id: string): Promise<void> {
    const templates = this.getTemplates().filter(t => t.id !== id);
    await this.context.globalState.update(this.STORAGE_KEY, templates);
  }

  // Apply templates to workspace
  async applyTemplates(templateIds: string[]): Promise<{ success: boolean; message: string; filesCreated: string[] }> {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      return { success: false, message: 'No workspace folder open', filesCreated: [] };
    }

    const templates = this.getTemplates().filter(t => templateIds.includes(t.id));
    if (templates.length === 0) {
      return { success: false, message: 'No templates selected', filesCreated: [] };
    }

    const instructionsDir = path.join(workspaceFolder.uri.fsPath, '.github', 'instructions');
    
    // Create .github/instructions directory if it doesn't exist
    if (!fs.existsSync(instructionsDir)) {
      fs.mkdirSync(instructionsDir, { recursive: true });
    }

    const filesCreated: string[] = [];

    try {
      for (const template of templates) {
        // Sanitize filename
        const filename = this.sanitizeFilename(template.name);
        const filepath = path.join(instructionsDir, `${filename}.instructions.md`);

        // Build file content with frontmatter
        let content = '';
        
        // Add frontmatter if applyTo or description exists
        if (template.applyTo || template.description) {
          content += '---\n';
          if (template.applyTo) {
            content += `applyTo: "${template.applyTo}"\n`;
          }
          if (template.description) {
            content += `description: "${template.description}"\n`;
          }
          content += '---\n\n';
        }

        content += template.content;

        fs.writeFileSync(filepath, content, 'utf8');
        filesCreated.push(filepath);
      }

      return {
        success: true,
        message: `Successfully created ${filesCreated.length} instruction file(s) in .github/instructions/`,
        filesCreated
      };
    } catch (error) {
      return {
        success: false,
        message: `Error creating files: ${error instanceof Error ? error.message : 'Unknown error'}`,
        filesCreated: []
      };
    }
  }

  // Get existing instruction files in workspace
  getExistingInstructions(): { copilotInstructions: string | null; customInstructions: string[] } {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      return { copilotInstructions: null, customInstructions: [] };
    }

    const githubDir = path.join(workspaceFolder.uri.fsPath, '.github');
    const instructionsDir = path.join(githubDir, 'instructions');

    const result = {
      copilotInstructions: null as string | null,
      customInstructions: [] as string[]
    };

    // Check for copilot-instructions.md
    const copilotFile = path.join(githubDir, 'copilot-instructions.md');
    if (fs.existsSync(copilotFile)) {
      result.copilotInstructions = copilotFile;
    }

    // Check for custom instructions
    if (fs.existsSync(instructionsDir)) {
      const files = fs.readdirSync(instructionsDir);
      result.customInstructions = files
        .filter(f => f.endsWith('.instructions.md'))
        .map(f => path.join(instructionsDir, f));
    }

    return result;
  }

  // Sanitize filename
  private sanitizeFilename(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  // Generate a unique ID
  generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Import template from file
  async importTemplateFromFile(filepath: string): Promise<Template | null> {
    try {
      const content = fs.readFileSync(filepath, 'utf8');
      const filename = path.basename(filepath, '.instructions.md');
      
      // Parse frontmatter if exists
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n\n([\s\S]*)$/);
      
      let applyTo: string | undefined;
      let description: string | undefined;
      let actualContent = content;

      if (frontmatterMatch) {
        const frontmatter = frontmatterMatch[1];
        actualContent = frontmatterMatch[2];

        const applyToMatch = frontmatter.match(/applyTo:\s*"([^"]+)"/);
        if (applyToMatch) {
          applyTo = applyToMatch[1];
        }

        const descMatch = frontmatter.match(/description:\s*"([^"]+)"/);
        if (descMatch) {
          description = descMatch[1];
        }
      }

      return {
        id: this.generateId(),
        name: filename.replace(/-/g, ' '),
        content: actualContent.trim(),
        applyTo,
        description
      };
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to import template: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return null;
    }
  }
}
