# Strukt - Interactive 3D Project Map

![VS Code Extension](https://img.shields.io/badge/VS%20Code-Extension-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Three.js](https://img.shields.io/badge/Three.js-Powered-orange)
![3D Force Graph](https://img.shields.io/badge/3D%20Force%20Graph-Visualization-green)

Visualize your workspace as a stunning **3D interactive force-directed graph** directly in VS Code. Navigate complex project structures with recognizable file/folder icons, smart search highlighting, and intuitive expandable folders.

---

## ✨ Features

### 🎯 Core Visualization
- **3D Force-Directed Graph** - Beautiful physics-based layout with radial hierarchy
- **VSCode Icons Integration** - Instantly recognizable file/folder icons via Iconify CDN (1,467+ icons)
- **Layer-by-Layer Expansion** - Click folders to expand/collapse, exploring your project naturally
- **Real-time Sync** - Automatically updates when files/folders change
- **Smooth Animations** - Buttery-smooth 60fps rendering with Three.js

### 🔍 Smart Search
- **Live Search** - Type to find files instantly (2+ characters)
- **Visual Highlighting** - Matched files stay bright while others fade to 15% opacity
- **Auto-Focus** - Camera automatically centers on search results
- **Connection Dimming** - Links fade to show only relevant connections

### 🎨 Visual Polish
- **Ultra-Thin Edges** - Sleek 0.3px lines for minimal, clean aesthetics
- **File Type Recognition** - 80+ file types with proper icons (JS, TS, Python, CSS, images, fonts, etc.)
- **Folder Type Intelligence** - Recognizes common folders (src, components, tests, assets, dist, etc.)
- **File Extension Badges** - Hover to see file type badges (TS, MD, CSV, etc.)
- **Animated Background** - Subtle particles.js-style background with colored particles

### 🖱️ Interaction
- **Drag Nodes** - Repositions nodes in 3D space
- **Click Files** - Opens in editor
- **Click Folders** - Toggles expansion
- **Zoom & Pan** - Mouse wheel to zoom, drag to rotate
- **Breadcrumb Path** - Shows current hover location

### 📊 Rich Tooltips
- **File Metadata** - Size, file count, path
- **Extension Badge** - Quick file type identification
- **Expansion Status** - Shows if folder is expanded/collapsed
- **No Emojis** - Clean, professional tooltips

### 🎛️ Controls
- **Fit to Screen** - Centers and scales entire project
- **Reset View** - Returns to default camera position
- **Search Bar** - Live file search with clear button
- **Dark/Light Theme** - Automatically matches VS Code theme

---

## 🚀 Usage

1. **Open Command Palette**: `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
2. **Run Command**: `Strukt: Open Project Map`
3. **Explore**: 
   - Click folders to expand/collapse
   - Click files to open in editor
   - Search for files using the search bar
   - Drag nodes to reposition
   - Scroll to zoom, drag to rotate

---

## 🎨 What Makes Strukt Different?

### Before Strukt:
- ❌ Static text-based file trees
- ❌ No visual hierarchy understanding
- ❌ Hard to find files in large projects
- ❌ No spatial memory of project layout

### With Strukt:
- ✅ **3D spatial visualization** - See your entire project at once
- ✅ **VSCode-familiar icons** - Same icons you see in the file explorer
- ✅ **Smart search dimming** - Only see what matters
- ✅ **Expandable folders** - Explore layer by layer, not all at once
- ✅ **Instant file opening** - Click to open, no navigation needed
- ✅ **Beautiful aesthetics** - Professional, sleek design

---

## 🖼️ File Type Support

**80+ file types supported** including:

- **Languages**: JavaScript (js, jsx, mjs, cjs), TypeScript (ts, tsx), Python, Java, C/C++, C#, Go, Rust, Ruby, PHP, Swift, Kotlin, Scala, Dart, Lua, R
- **Web**: HTML, CSS, SCSS, SASS, LESS
- **Data**: JSON, YAML, TOML, XML, CSV, TSV, SQL
- **Images**: PNG, JPG, JPEG, GIF, WEBP, SVG, ICO, BMP, TIFF
- **Fonts**: TTF, OTF, WOFF, WOFF2, EOT
- **Documents**: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX
- **Archives**: ZIP, RAR, TAR, GZ, 7Z
- **Media**: MP4, AVI, MOV, MP3, WAV
- **Config**: .env, .gitignore, .npmrc, .editorconfig, .prettierrc, Dockerfile, Makefile
- **Frameworks**: Vue, Svelte, React (JSX/TSX)
- **Notebooks**: Jupyter (.ipynb)
- **Shell**: Bash, Zsh, PowerShell

**40+ folder types recognized**:
- `src`, `dist`, `build`, `public`, `components`, `config`, `test`, `tests`, `assets`, `images`, `styles`, `css`, `docs`, `utils`, `helpers`, `lib`, `api`, `server`, `backend`, `node_modules`, `.github`, `.vscode`, `.git`, and more!

---

## ⚙️ Commands

- `Strukt: Open Project Map` - Opens the 3D interactive visualization
- `Strukt: Refresh Project Map` - Manually refresh the visualization

---

## 🛠️ Development

```bash
# Install dependencies
npm install

# Compile and watch for changes
npm run watch

# Run extension in development mode
# Press F5 in VS Code to launch Extension Development Host

# Build for production
npm run compile

# Package extension
npx @vscode/vsce package
```

---

## 🏗️ Tech Stack

- **VS Code Extension API** - Extension framework
- **TypeScript** - Type-safe development
- **Three.js** - 3D rendering engine
- **3D Force Graph** - Force-directed graph layout
- **Iconify API** - 275k+ icons (VSCode Icons collection)
- **particles.js** - Animated background
- **esbuild** - Fast bundling

---

## 📦 Project Structure

```
strukt/
├── src/
│   ├── extension.ts          # Main extension entry
│   ├── fileSystemWatcher.ts  # File system monitoring
│   ├── treeBuilder.ts        # File tree construction
│   └── webviewProvider.ts    # Webview management
├── media/
│   ├── main.js               # 3D graph logic
│   └── style.css             # Webview styles
├── dist/                     # Compiled output
└── package.json              # Extension manifest
```

---

## 🎯 Roadmap

- [ ] Git status integration (modified/untracked files)
- [ ] Export project map as image (PNG/SVG)
- [ ] Custom color schemes
- [ ] File size heatmap visualization
- [ ] Recently modified files highlighting
- [ ] Save/restore camera position
- [ ] Multi-workspace support
- [ ] Performance metrics overlay

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

MIT License - see LICENSE file for details

---

## 👨‍💻 Creator

**Sankalpa Sarkar**

- 🌐 LinkedIn: [linkedin.com/in/sankalpacodes](https://www.linkedin.com/in/sankalpacodes)
- 💻 GitHub: [@sanks011](https://github.com/sanks011)
- 📧 Email: sankalpasarkar68@outlook.com
- 📸 Instagram: [@kyunsankalpa](https://instagram.com/kyunsankalpa)
- 🐦 Twitter/X: [@sarkar7522](https://twitter.com/sarkar7522)

---

## 🙏 Credits

- **Iconify** - Icon framework with VSCode Icons collection
- **3D Force Graph** - Force-directed graph visualization
- **Three.js** - 3D rendering engine
- **particles.js** - Background animations
- **VS Code Extension API** - Extension framework

---

## ⭐ Support

If you find Strukt useful, please consider:
- ⭐ Starring the repository
- 🐛 Reporting bugs via GitHub Issues
- 💡 Suggesting features
- 📢 Sharing with other developers

---

**Made with ❤️ for developers who love visual understanding**
