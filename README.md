# Strukt - Interactive Project Map

![VS Code Extension](https://img.shields.io/badge/VS%20Code-Extension-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Cytoscape.js](https://img.shields.io/badge/Cytoscape.js-3.33-green)

Visualize your workspace as an interactive, real-time mind map directly in VS Code.

## Features

- **Interactive Visual Tree** - Navigate your project structure as a zoomable, interactive graph
- **Real-time Updates** - Automatically syncs with file system changes
- **Click to Open** - Click any file node to open it in the editor
- **Multiple Layouts** - Choose from breadth-first, COSE, circle, or grid layouts
- **Smart Filtering** - Automatically excludes node_modules, .git, and other common folders
- **Theme Support** - Seamlessly integrates with VS Code's light and dark themes
- **Metadata Tooltips** - View file size and other details on hover

## Usage

1. Open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`)
2. Run `Strukt: Open Project Map`
3. Explore your project visually!

## Commands

- `Strukt: Open Project Map` - Opens the interactive project visualization
- `Strukt: Refresh Project Map` - Manually refresh the visualization

## Configuration

Configure Strukt in your VS Code settings:

```json
{
  "strukt.maxDepth": 10,
  "strukt.excludePatterns": [
    "**/node_modules/**",
    "**/.git/**",
    "**/dist/**"
  ],
  "strukt.showFileExtensions": true,
  "strukt.layout": "breadthfirst"
}
```

## Development

```bash
# Install dependencies
npm install

# Compile and watch
npm run watch

# Run extension
Press F5 in VS Code
```

## Building

```bash
# Build for production
npm run package

# Package extension
npx vsce package
```

## License

MIT

## Credits

Built with [Cytoscape.js](https://js.cytoscape.org/) for graph visualization.
