# Change Log

All notable changes to the "Strukt" extension will be documented in this file.

## [0.1.0] - 2026-01-17

### Initial Release 🎉

#### Features
- **3D Project Visualization**: Interactive force-directed graph showing your entire project structure
- **Smart Icons**: 80+ file type icons and 40+ folder type icons using VSCode Icons collection via Iconify
- **Real-time Search**: Search for files with visual fade effect on non-matching nodes
- **Interactive Controls**: 
  - Fit to Screen button for optimal viewing
  - Reset View to restore default camera position
  - Mouse controls for pan, zoom, and rotate
- **Particle Background**: Beautiful animated particle effect for enhanced visuals
- **Activity Bar Integration**: Quick access via sidebar icon
- **File Opening**: Click any node to open the file directly in editor
- **Ultra-thin Connections**: Sleek 0.3px connection lines for clean visualization
- **Configurable**: 
  - Adjustable max depth (default: 5 levels)
  - Exclude patterns (node_modules, .git, dist, out, build)
  - Node size based on file size
  - Color-coded by file type

#### Supported File Types
JavaScript, TypeScript, Python, CSS, HTML, JSON, Markdown, Images (PNG, JPG, SVG, ICO, WebP), 
Fonts (TTF, OTF, WOFF), Documents (PDF, DOC, XLS, PPT), Archives (ZIP, RAR, TAR), 
Configuration files, and many more!

#### Technical
- Built with Three.js for 3D rendering
- Force-directed graph layout using 3D Force Graph
- Iconify API integration for high-quality icons
- Real-time file system watching
- Efficient tree building with configurable depth

---

### Future Roadmap
- Git integration (show modified/untracked files)
- Advanced filtering options
- Keyboard navigation
- Minimap for large projects
- Export visualization as image
- Custom color themes
