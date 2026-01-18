# Change Log

All notable changes to the "Strukt" extension will be documented in this file.

## [0.4.0] - 2026-01-18

### AI Context Manager

#### New Features
- Template Management System: Create, edit, delete, and organize AI instruction templates
- GitHub Copilot Integration: Templates automatically saved to `.github/instructions/` for seamless Copilot integration
- Path-Specific Instructions: Use glob patterns to apply templates to specific file types or directories
- Import/Export: Import existing instruction files or share templates
- User & Workspace Templates: Store personal templates or share with team via version control
- Frontmatter Support: Add metadata like description and applyTo patterns
- Live Workspace Detection: See existing instruction files in your workspace
- Professional UI: Clean, minimal black theme matching Strukt's design language

#### Command & Integration
- New command: Strukt: Set up your AI Context
- Accessible from Command Palette and sidebar welcome view
- Templates persist across VS Code sessions
- Automatic file creation in `.github/instructions/`

#### Technical Implementation
- Extension global state for cross-workspace templates
- Markdown with YAML frontmatter support
- Glob pattern validation
- File system integration with error handling
- Template import/export functionality

---

## [0.3.0] - 2026-01-18

### 🎉 Major Feature Release

#### New Features
- **Advanced Filter Sidebar**: Professional collapsible panel with smooth animations
  - File Type Filters: Show/hide JS, TS, JSON, MD, CSS, HTML, and Folders
  - Depth Control: Adjustable slider (1-10 levels) to control visualization depth
  - Size Filters: Filter by Small (<10KB), Medium (10-100KB), Large (>100KB)
  - Real-time Updates: Filters apply instantly without refresh
  - Clear All button: Reset all filters to defaults
  - Collapsible Sections: Organized filter categories
  - Gradient blue design with smooth slide animations

- **Focus Mode**: Isolate and explore specific folders
  - Ctrl+Click any folder to focus on its contents exclusively
  - Interactive breadcrumb navigation showing your focus path
  - Click breadcrumb levels to navigate back through folders
  - Exit Focus button to return to full project view
  - Focus stack tracks navigation history

- **Always-Visible Dependency Lines**: 
  - Beautiful blue connection lines (rgba(74, 158, 255, 0.3))
  - 0.5px professional thickness
  - Permanent visibility showing file/folder relationships
  - Smart opacity during search highlighting

#### Improvements
- Enhanced UI/UX with research-backed best practices
- Removed unnecessary toggles for cleaner interface
- Improved breadcrumb styling with interactive navigation
- Better filter organization and visual hierarchy
- Professional gradient sidebar design
- Optimized real-time filtering performance

#### Technical
- Implemented Microsoft Visual Studio Code Map patterns
- Applied enterprise UX best practices for filtering
- Improved graph visualization controls
- Enhanced keyboard and mouse interaction handling

---

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
- **Ultra-thin Connections**: Sleek connection lines for clean visualization
- **Configurable**: 
  - Adjustable max depth (default: 10 levels)
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
- Export visualization as image
- Custom color themes
- Keyboard navigation shortcuts
- Minimap for large projects
- Performance metrics overlay
