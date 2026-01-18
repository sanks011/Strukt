# Strukt

[![Version](https://img.shields.io/badge/version-0.4.0-blue)](https://marketplace.visualstudio.com/items?itemName=strukt)
[![VS Code](https://img.shields.io/badge/VS%20Code-1.80+-brightgreen)](https://code.visualstudio.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)

**Professional 3D project visualization and AI context management for Visual Studio Code.**

Strukt transforms your workspace into an interactive 3D force-directed graph, enabling intuitive navigation through complex codebases. Includes integrated AI context management for GitHub Copilot, with reusable instruction templates that enhance your development workflow.

---

## Features

### AI Context Manager

Create and manage reusable AI instruction templates that automatically integrate with GitHub Copilot:

- **Template Management** - Create, edit, and organize AI instruction templates
- **GitHub Copilot Integration** - Automatic integration with Copilot's instruction system
- **Path-Specific Instructions** - Apply templates to specific files using glob patterns
- **Import/Export** - Import existing instruction files or export templates
- **Team Collaboration** - Templates saved to `.github/instructions/` for team sharing

### 3D Project Visualization

Navigate your codebase through an interactive 3D force-directed graph:

- **Force-Directed Layout** - Physics-based visualization with radial hierarchy
- **VSCode Icons** - Recognizable file and folder icons
- **Dependency Visualization** - Clear connection lines showing file relationships
- **Layer Expansion** - Explore project structure hierarchically
- **Real-time Sync** - Automatic updates when files change

### Advanced Navigation

- **File Type Filters** - Show or hide specific file types
- **Depth Control** - Adjustable visualization complexity (1-10 levels)
- **Size Filters** - Filter by file size categories
- **Focus Mode** - Isolate and examine specific folders (Ctrl+Click)
- **Smart Search** - Live search with visual highlighting
- **Breadcrumb Navigation** - Track your current location and focus path

### Interaction

- Click files to open in editor
- Click folders to expand or collapse
- Ctrl+Click folders to activate Focus Mode
- Drag nodes to reposition in 3D space
- Mouse wheel to zoom, drag to rotate view

---

## Usage

### Opening Strukt

Open Command Palette: `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)

- **3D Project Map**: Run `Strukt: Open Project Map`
- **AI Context Manager**: Run `Strukt: Set up your AI Context`

### AI Context Manager

1. Open Command Palette and run `Strukt: Set up your AI Context`
2. Click "Create New Template"
3. Enter template name and instructions in Markdown format
4. Optionally specify glob pattern for automatic application (e.g., `**/*.ts`)
5. Select templates and click "Apply Selected to Workspace"
6. Templates are created in `.github/instructions/` and automatically integrate with GitHub Copilot

### 3D Project Map

**Filters**: Click the filter icon to access file type, depth, and size filters

**Focus Mode**: Hold Ctrl (Cmd on Mac) and click any folder to isolate its contents

**Search**: Type in the search bar to highlight matching files

**Navigation**: Use breadcrumbs to track location and navigate between focus levels

---

## Supported File Types

**Languages**: JavaScript, TypeScript, Python, Java, C/C++, C#, Go, Rust, Ruby, PHP, Swift, Kotlin, Scala, Dart, Lua, R

**Web**: HTML, CSS, SCSS, SASS, LESS, Vue, Svelte, React (JSX/TSX)

**Data**: JSON, YAML, TOML, XML, CSV, TSV, SQL

**Images**: PNG, JPG, JPEG, GIF, WEBP, SVG, ICO, BMP, TIFF

**Documents**: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, Markdown

**Configuration**: .env, .gitignore, .npmrc, .editorconfig, .prettierrc, Dockerfile, Makefile

**Archives**: ZIP, RAR, TAR, GZ, 7Z

**Media**: MP4, AVI, MOV, MP3, WAV

Recognizes 40+ common folder types including `src`, `dist`, `build`, `components`, `config`, `test`, `assets`, `node_modules`, `.github`, `.vscode`, and more.

---

## Commands

- `Strukt: Open Project Map` - Open 3D project visualization
- `Strukt: Set up your AI Context` - Manage AI instruction templates
- `Strukt: Refresh Project Map` - Refresh visualization

## Technical Stack

- **VS Code Extension API** - Extension framework
- **TypeScript** - Type-safe development
- **Three.js** - 3D rendering engine
- **3D Force Graph** - Force-directed graph layout
- **Iconify API** - VSCode icon collection
- **esbuild** - Fast bundling

---

## License

MIT License - see LICENSE file for details

---

## Author

**Sankalpa Sarkar**

[LinkedIn](https://www.linkedin.com/in/sankalpacodes) | [GitHub](https://github.com/sanks011) | [Email](mailto:sankalpasarkar68@outlook.com)
