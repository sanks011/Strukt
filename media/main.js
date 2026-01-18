// Strukt - Interactive Project Map Extension
// Enhanced 3D visualization with ACTUALLY USEFUL features

(function() {
  const vscode = acquireVsCodeApi();
  let graph;
  let currentTree = null;
  let expandedFolders = new Set(); // Track which folders are expanded
  let allNodes = []; // Store all nodes for filtering
  let allLinks = []; // Store all links for filtering

  // File type color mapping - INSTANT VISUAL RECOGNITION
  const FILE_TYPE_COLORS = {
    js: '#f7df1e', ts: '#3178c6', tsx: '#61dafb', jsx: '#61dafb',
    py: '#3776ab', java: '#b07219', cpp: '#f34b7d', c: '#555555',
    cs: '#178600', go: '#00add8', rs: '#dea584', rb: '#701516',
    php: '#4f5d95', css: '#1572b6', scss: '#c6538c', html: '#e34c26',
    json: '#0ead69', xml: '#e44b23', md: '#083fa1', txt: '#cccccc',
    yaml: '#cb171e', yml: '#cb171e', sql: '#e38c00', sh: '#89e051',
    default: '#888888'
  };

  const FOLDER_COLOR = '#4a9eff';

  // Git status colors - VISUAL GIT INTEGRATION!
  const GIT_STATUS_COLORS = {
    modified: '#e2c08d',    // Yellow/orange - modified files
    untracked: '#73c991',   // Green - new untracked files
    staged: '#6fce6f',      // Bright green - staged files
    deleted: '#f48771'      // Red - deleted files
  };

  // ========================================
  // ICON MAPPING SYSTEM - Making it USEFUL!
  // ========================================

  // Texture cache to avoid reloading same icons
  const textureCache = new Map();

  // Iconify API CDN - Much better icon source!
  const ICONIFY_BASE = 'https://api.iconify.design';

  // File extension to icon mapping using VSCode Icons (more accurate!)
  const FILE_ICON_MAP = {
    // JavaScript ecosystem
    js: 'vscode-icons:file-type-js-official',
    jsx: 'vscode-icons:file-type-reactjs',
    ts: 'vscode-icons:file-type-typescript-official',
    tsx: 'vscode-icons:file-type-reactts',
    json: 'vscode-icons:file-type-json',
    
    // Web
    html: 'vscode-icons:file-type-html',
    htm: 'vscode-icons:file-type-html',
    css: 'vscode-icons:file-type-css',
    scss: 'vscode-icons:file-type-scss',
    sass: 'vscode-icons:file-type-sass',
    less: 'vscode-icons:file-type-less',
    
    // Python
    py: 'vscode-icons:file-type-python',
    pyw: 'vscode-icons:file-type-python',
    ipynb: 'vscode-icons:file-type-jupyter',
    
    // C family
    c: 'vscode-icons:file-type-c',
    cpp: 'vscode-icons:file-type-cpp',
    cc: 'vscode-icons:file-type-cpp',
    cxx: 'vscode-icons:file-type-cpp',
    h: 'vscode-icons:file-type-cheader',
    hpp: 'vscode-icons:file-type-cpp',
    cs: 'vscode-icons:file-type-csharp',
    
    // Other languages
    java: 'vscode-icons:file-type-java',
    go: 'vscode-icons:file-type-go',
    rs: 'vscode-icons:file-type-rust',
    rb: 'vscode-icons:file-type-ruby',
    php: 'vscode-icons:file-type-php',
    swift: 'vscode-icons:file-type-swift',
    kt: 'vscode-icons:file-type-kotlin',
    scala: 'vscode-icons:file-type-scala',
    
    // Markup & Data
    md: 'vscode-icons:file-type-markdown',
    xml: 'vscode-icons:file-type-xml',
    yaml: 'vscode-icons:file-type-yaml',
    yml: 'vscode-icons:file-type-yaml',
    toml: 'vscode-icons:file-type-toml',
    csv: 'vscode-icons:file-type-excel',
    tsv: 'vscode-icons:file-type-excel',
    
    // Shell
    sh: 'vscode-icons:file-type-shell',
    bash: 'vscode-icons:file-type-shell',
    zsh: 'vscode-icons:file-type-shell',
    ps1: 'vscode-icons:file-type-powershell',
    
    // Build & Config
    dockerfile: 'vscode-icons:file-type-docker',
    makefile: 'vscode-icons:file-type-makefile',
    gradle: 'vscode-icons:file-type-gradle',
    
    // Databases
    sql: 'vscode-icons:file-type-sql',
    
    // Frameworks
    vue: 'vscode-icons:file-type-vue',
    svelte: 'vscode-icons:file-type-svelte',
    
    // Other
    dart: 'vscode-icons:file-type-dart',
    lua: 'vscode-icons:file-type-lua',
    r: 'vscode-icons:file-type-r',
    
    // Module types
    mjs: 'vscode-icons:file-type-js-official',
    cjs: 'vscode-icons:file-type-js-official',
    
    // Images
    png: 'vscode-icons:file-type-image',
    jpg: 'vscode-icons:file-type-image',
    jpeg: 'vscode-icons:file-type-image',
    gif: 'vscode-icons:file-type-image',
    webp: 'vscode-icons:file-type-image',
    svg: 'vscode-icons:file-type-svg',
    ico: 'vscode-icons:file-type-favicon',
    bmp: 'vscode-icons:file-type-image',
    tiff: 'vscode-icons:file-type-image',
    
    // Fonts
    ttf: 'vscode-icons:file-type-font',
    otf: 'vscode-icons:file-type-font',
    woff: 'vscode-icons:file-type-font',
    woff2: 'vscode-icons:file-type-font',
    eot: 'vscode-icons:file-type-font',
    
    // Documents
    pdf: 'vscode-icons:file-type-pdf',
    doc: 'vscode-icons:file-type-word',
    docx: 'vscode-icons:file-type-word',
    xls: 'vscode-icons:file-type-excel',
    xlsx: 'vscode-icons:file-type-excel',
    ppt: 'vscode-icons:file-type-powerpoint',
    pptx: 'vscode-icons:file-type-powerpoint',
    
    // Archives
    zip: 'vscode-icons:file-type-zip',
    rar: 'vscode-icons:file-type-zip',
    tar: 'vscode-icons:file-type-zip',
    gz: 'vscode-icons:file-type-zip',
    '7z': 'vscode-icons:file-type-zip',
    
    // Video/Audio
    mp4: 'vscode-icons:file-type-video',
    avi: 'vscode-icons:file-type-video',
    mov: 'vscode-icons:file-type-video',
    mp3: 'vscode-icons:file-type-audio',
    wav: 'vscode-icons:file-type-audio',
    
    // Special files
    txt: 'vscode-icons:file-type-text',
    log: 'vscode-icons:file-type-log',
    gitignore: 'vscode-icons:file-type-git',
    env: 'vscode-icons:file-type-dotenv',
    npmrc: 'vscode-icons:file-type-npm',
    editorconfig: 'vscode-icons:file-type-editorconfig',
    prettierrc: 'vscode-icons:file-type-prettier',
    
    // License & Readme
    license: 'vscode-icons:file-type-license',
    readme: 'vscode-icons:file-type-readme'
  };

  // Special folder name detection - Now with proper VSCode icons!
  const FOLDER_ICON_MAP = {
    // Common dev folders
    'src': 'vscode-icons:folder-type-src',
    'dist': 'vscode-icons:folder-type-dist',
    'build': 'vscode-icons:folder-type-buildtools',
    'public': 'vscode-icons:folder-type-public',
    
    // Component folders
    'components': 'vscode-icons:folder-type-component',
    'component': 'vscode-icons:folder-type-component',
    
    // Config
    'config': 'vscode-icons:folder-type-config',
    'configs': 'vscode-icons:folder-type-config',
    
    // Tests
    'test': 'vscode-icons:folder-type-test',
    'tests': 'vscode-icons:folder-type-test',
    '__tests__': 'vscode-icons:folder-type-test',
    'spec': 'vscode-icons:folder-type-test',
    
    // Assets
    'assets': 'vscode-icons:folder-type-assets',
    'images': 'vscode-icons:folder-type-images',
    'img': 'vscode-icons:folder-type-images',
    'static': 'vscode-icons:folder-type-public',
    
    // Styles
    'styles': 'vscode-icons:folder-type-css',
    'css': 'vscode-icons:folder-type-css',
    'scss': 'vscode-icons:folder-type-sass',
    
    // Docs
    'docs': 'vscode-icons:folder-type-docs',
    'doc': 'vscode-icons:folder-type-docs',
    'documentation': 'vscode-icons:folder-type-docs',
    
    // Utility
    'utils': 'vscode-icons:folder-type-utils',
    'helpers': 'vscode-icons:folder-type-helper',
    'lib': 'vscode-icons:folder-type-library',
    'libraries': 'vscode-icons:folder-type-library',
    
    // Server/API
    'api': 'vscode-icons:folder-type-api',
    'server': 'vscode-icons:folder-type-server',
    'backend': 'vscode-icons:folder-type-server',
    
    // Git/Editor
    'node_modules': 'vscode-icons:folder-type-node',
    '.github': 'vscode-icons:folder-type-github',
    '.vscode': 'vscode-icons:folder-type-vscode',
    '.git': 'vscode-icons:folder-type-git'
  };

  // Default fallback icons (using data URIs for guaranteed availability)
  const DEFAULT_FOLDER_CLOSED = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM0YTllZmYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMjIgMTlhMiAyIDAgMCAxLTIgMkg0YTIgMiAwIDAgMS0yLTJWNWEyIDIgMCAwIDEgMi0yaDVsMiAzaDlhMiAyIDAgMCAxIDIgMnoiPjwvcGF0aD48L3N2Zz4=';
  const DEFAULT_FOLDER_OPEN = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmQ3MDAiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMjIgMTlhMiAyIDAgMCAxLTIgMkg0YTIgMiAwIDAgMS0yLTJWNWEyIDIgMCAwIDEgMi0yaDVsMiAzaDlhMiAyIDAgMCAxIDIgMnptMCA2SDRhMiAyIDAgMCAxLTItMlY4YTIgMiAwIDAgMSAyLTJoNCI+PC9wYXRoPjwvc3ZnPg==';
  const DEFAULT_FILE_ICON = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM4ODg4ODgiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMTMgMkg2YTIgMiAwIDAgMC0yIDJ2MTZhMiAyIDAgMCAwIDIgMmgxMmEyIDIgMCAwIDAgMi0yVjlsLTctN3oiPjwvcGF0aD48cG9seWxpbmUgcG9pbnRzPSIxMyAyIDEzIDkgMjAgOSI+PC9wb2x5bGluZT48L3N2Zz4=';

  /**
   * Get icon URL for a node (file or folder)
   */
  function getIconUrl(node) {
    // Folders - check both type and children property
    if (node.type === 'directory' || node.children !== undefined) {
      const isExpanded = expandedFolders.has(node.path);
      const folderName = node.name.toLowerCase();
      
      // Check if special folder
      if (FOLDER_ICON_MAP[folderName]) {
        const iconId = FOLDER_ICON_MAP[folderName];
        return `${ICONIFY_BASE}/${iconId}.svg?color=%234a9eff`;
      }
      
      // Default folder icons
      if (isExpanded) {
        return `${ICONIFY_BASE}/vscode-icons:default-folder-opened.svg?color=%23ffd700`;
      }
      return `${ICONIFY_BASE}/vscode-icons:default-folder.svg?color=%234a9eff`;
    }
    
    // Files - check special filenames first
    const fileName = node.name.toLowerCase();
    
    // Special filename patterns
    const specialFiles = {
      '.gitignore': 'vscode-icons:file-type-git',
      '.gitattributes': 'vscode-icons:file-type-git',
      '.env': 'vscode-icons:file-type-dotenv',
      '.env.local': 'vscode-icons:file-type-dotenv',
      '.env.example': 'vscode-icons:file-type-dotenv',
      '.npmrc': 'vscode-icons:file-type-npm',
      'package.json': 'vscode-icons:file-type-npm',
      'package-lock.json': 'vscode-icons:file-type-npm',
      '.editorconfig': 'vscode-icons:file-type-editorconfig',
      '.prettierrc': 'vscode-icons:file-type-prettier',
      'prettier.config.js': 'vscode-icons:file-type-prettier',
      'dockerfile': 'vscode-icons:file-type-docker',
      'makefile': 'vscode-icons:file-type-makefile',
      'readme.md': 'vscode-icons:file-type-readme',
      'readme': 'vscode-icons:file-type-readme'
    };
    
    if (specialFiles[fileName] || (fileName.startsWith('dockerfile.'))) {
      const iconId = specialFiles[fileName] || 'vscode-icons:file-type-docker';
      return `${ICONIFY_BASE}/${iconId}.svg`;
    }
    
    // Check extension
    const ext = getFileExtension(node.name);
    const iconId = FILE_ICON_MAP[ext];
    
    if (iconId) {
      return `${ICONIFY_BASE}/${iconId}.svg`;
    }
    
    // Default file icon
    return `${ICONIFY_BASE}/vscode-icons:default-file.svg`;
  }

  /**
   * Create a 3D sprite icon for a node
   * Based on: https://github.com/vasturiano/3d-force-graph/issues/408
   */
  function createNodeSprite(node) {
    const iconUrl = getIconUrl(node);
    
    // Check cache first
    let texture = textureCache.get(iconUrl);
    
    if (!texture) {
      // Load texture
      texture = new THREE.TextureLoader().load(
        iconUrl,
        // Success callback
        (loadedTexture) => {
          console.log('✅ Loaded icon:', iconUrl);
        },
        // Progress callback
        undefined,
        // Error callback
        (error) => {
          console.warn('⚠️ Failed to load icon:', iconUrl, error);
          // Try fallback
          const fallbackUrl = node.children ? DEFAULT_FOLDER_CLOSED : DEFAULT_FILE_ICON;
          if (iconUrl !== fallbackUrl) {
            texture = new THREE.TextureLoader().load(fallbackUrl);
            textureCache.set(iconUrl, texture);
          }
        }
      );
      
      textureCache.set(iconUrl, texture);
    }
    
    // Create sprite material
    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      opacity: 0.9,
      depthWrite: false // Prevent z-fighting
    });
    
    // Create sprite
    const sprite = new THREE.Sprite(material);
    
    // Size based on node type and size
    let scale;
    if (node.children) {
      // Folders - larger and more prominent
      const totalSize = calculateTotalSize(node);
      scale = Math.max(20, Math.min(45, totalSize / 6000));
    } else {
      // Files - smaller, sized by file size
      const size = node.size || 1000;
      scale = Math.max(8, Math.min(25, size / 2000));
    }
    
    // Add glow effect for Git-modified files - CRAZY VISIBLE!
    if (node.gitStatus) {
      scale = scale * 1.5; // Make Git files 50% larger
    }
    
    sprite.scale.set(scale, scale, 1);
    
    // Store sprite reference on node for opacity updates during search
    node.__sprite = sprite;
    
    return sprite;
  }

  // Initialize particles.js background - MORE BEAUTIFUL!
  function initParticles() {
    if (typeof particlesJS === 'undefined') return;
    particlesJS('particles-bg', {
      particles: {
        number: { value: 80, density: { enable: true, value_area: 800 } },
        color: { value: ['#4a9eff', '#ffd700', '#4ade80', '#f87171'] },
        shape: { type: 'circle' },
        opacity: { value: 0.3, random: true },
        size: { value: 3, random: true },
        line_linked: {
          enable: true, distance: 150, color: '#4a9eff',
          opacity: 0.2, width: 1.5
        },
        move: {
          enable: true, speed: 1.2, direction: 'none',
          random: true, straight: false, out_mode: 'out'
        }
      },
      interactivity: {
        detect_on: 'canvas',
        events: {
          onhover: { enable: true, mode: 'grab' },
          onclick: { enable: true, mode: 'push' },
          resize: true
        },
        modes: {
          grab: { distance: 180, line_linked: { opacity: 0.5 } },
          push: { particles_nb: 3 }
        }
      },
      retina_detect: true
    });
  }

  // Initialize 3D Graph with USEFUL features
  function init3DGraph() {
    const container = document.getElementById('cy');
    
    if (typeof ForceGraph3D === 'undefined') {
      container.innerHTML = '<div style="color: red; padding: 20px;">ForceGraph3D not loaded</div>';
      return null;
    }

    try {
      graph = ForceGraph3D()(container)
        .backgroundColor('rgba(30, 30, 30, 0.0)') // Transparent for particles
        .showNavInfo(false)
        .enableNodeDrag(true) // Enable node dragging for interaction
        .enableNavigationControls(true)
        .dagMode('radialout') // Radial layout - root at center, files radiating out
        .dagLevelDistance(80) // Distance between hierarchy levels
        
        // Rich tooltips with FILE PATH - actually useful!
        .nodeLabel(node => {
          const type = node.children ? 'folder' : 'file';
          const size = node.size ? formatBytes(node.size) : 'N/A';
          const fileCount = node.children ? countFiles(node) : null;
          const isExpanded = node.children && expandedFolders.has(node.path);
          const ext = !node.children && node.name.includes('.') ? node.name.split('.').pop().toUpperCase() : null;
          
          // Git status badge
          const gitBadge = node.gitStatus ? {
            modified: '<span style="color: #e2c08d; background: rgba(226, 192, 141, 0.15); padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 600;">● MODIFIED</span>',
            untracked: '<span style="color: #73c991; background: rgba(115, 201, 145, 0.15); padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 600;">● UNTRACKED</span>',
            staged: '<span style="color: #6fce6f; background: rgba(111, 206, 111, 0.15); padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 600;">● STAGED</span>',
            deleted: '<span style="color: #f48771; background: rgba(244, 135, 113, 0.15); padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 600;">● DELETED</span>'
          }[node.gitStatus] : '';
          
          return `
            <div style="background: rgba(0,0,0,0.95); padding: 12px; border-radius: 8px; color: white; max-width: 350px; font-family: 'Segoe UI', sans-serif; box-shadow: 0 4px 12px rgba(0,0,0,0.5);">
              <strong style="font-size: 15px; color: #4a9eff;">${node.name}</strong><br/>
              <div style="margin-top: 8px; font-size: 12px; line-height: 1.6;">
                <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                  <span style="color: #fbbf24; font-weight: 500;">${type.toUpperCase()}</span>
                  ${ext ? `<span style="color: #a78bfa; background: rgba(167, 139, 250, 0.1); padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 600;">${ext}</span>` : ''}
                  ${gitBadge}
                  ${node.children ? `<span style="color: #4ade80; margin-left: auto;">${isExpanded ? 'Expanded' : 'Click to expand'}</span>` : ''}
                </div>
                <div style="margin-top: 6px;">
                  <span style="color: #999;">Size:</span> <span style="color: #4ade80; font-weight: 500;">${size}</span>
                </div>
                ${fileCount ? `<div><span style="color: #999;">Files:</span> <span style="color: #fbbf24; font-weight: 500;">${fileCount}</span></div>` : ''}
                ${node.children ? `<div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.1); color: #60a5fa; font-size: 11px;">Click to ${isExpanded ? 'collapse' : 'expand'}</div>` : ''}
                <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.1); color: #9ca3af; font-size: 10px; font-family: 'Consolas', monospace;">${node.path}</div>
              </div>
            </div>
          `;
        })
        
        // Node size = file size (HELPS FIND BLOAT!)
        .nodeVal(node => {
          if (node.children) {
            // Folders are larger and more visible
            const totalSize = calculateTotalSize(node);
            return Math.max(20, Math.min(45, totalSize / 6000));
          } else {
            // Files sized by actual file size
            const size = node.size || 1000;
            return Math.max(8, Math.min(25, size / 2000));
          }
        })
        
        // ⭐ SPRITE ICONS - Making it ACTUALLY useful for developers!
        // Replace boring colored balls with recognizable file/folder icons
        .nodeThreeObject(node => createNodeSprite(node))
        
        // Color by file type and Git status - instant recognition
        .nodeColor(node => {
          if (node.highlighted) return '#ff00ff'; // Search results (highest priority)
          
          // Git status colors (high priority)
          if (node.gitStatus) {
            return GIT_STATUS_COLORS[node.gitStatus] || FILE_TYPE_COLORS.default;
          }
          
          // Folder color
          if (node.children) return FOLDER_COLOR;
          
          // File type color
          const ext = getFileExtension(node.name);
          return FILE_TYPE_COLORS[ext] || FILE_TYPE_COLORS.default;
        })
        
        .nodeOpacity(node => {
          // Fade non-matching nodes during search
          const graphData = graph ? graph.graphData() : null;
          const hasHighlights = graphData && graphData.nodes.some(n => n.highlighted);
          
          if (hasHighlights) {
            return node.highlighted ? 1.0 : 0.15; // Dim non-matching nodes
          }
          return 0.95; // Normal opacity
        })
        .nodeResolution(24)
        
        // Simple, clean blue connecting lines - always visible
        .linkColor(() => 'rgba(74, 158, 255, 0.3)') // Blue lines
        .linkWidth(0.5) // Consistent width
        .linkOpacity(link => {
          // Fade links during search if neither node is highlighted
          const graphData = graph ? graph.graphData() : null;
          const hasHighlights = graphData && graphData.nodes.some(n => n.highlighted);
          
          if (hasHighlights) {
            const sourceHighlighted = link.source.highlighted;
            const targetHighlighted = link.target.highlighted;
            return (sourceHighlighted || targetHighlighted) ? 0.4 : 0.05;
          }
          return 0.4;
        })
        .linkDirectionalParticles(0) // NO particles - clean and simple
        .linkDirectionalParticleSpeed(0)
        .linkDirectionalParticleWidth(0)
        
        .onNodeClick((node, event) => {
          console.log('Node clicked:', node);
          
          if (!node) {
            console.warn('No node data on click');
            return;
          }
          
          // Check if it's a folder (has type='directory' or has children property)
          const isFolder = node.type === 'directory' || (node.children !== undefined);
          
          if (isFolder) {
            // Ctrl+Click = Focus Mode
            if (event && (event.ctrlKey || event.metaKey)) {
              console.log('Focus mode activated for:', node.path);
              focusOnFolder(node);
              return;
            }
            
            // Regular click - toggle expand/collapse
            console.log('Toggling folder:', node.path);
            toggleFolderExpansion(node);
          } else {
            // It's a file - try to open it
            if (!node.path) {
              console.error('Node has no path:', node);
              return;
            }
            
            console.log('Opening file:', node.path);
            vscode.postMessage({ type: 'openFile', path: node.path });
          }
        })
        .onNodeHover(node => {
          updateBreadcrumb(node);
          container.style.cursor = node ? 'pointer' : 'grab';
        })
        
        .d3VelocityDecay(0.25)
        .warmupTicks(100)
        .cooldownTicks(300);

      // Radial hierarchy forces - clearer structure
      graph.d3Force('charge').strength(-200);
      graph.d3Force('link').distance(link => {
        // Folders farther apart, files closer to parent
        return link.source.children ? 80 : 45;
      });

      console.log('3D Graph initialized');
      return graph;
    } catch (error) {
      console.error('❌ Graph init error:', error);
      container.innerHTML = `<div style="color: red; padding: 20px;">Error: ${error.message}</div>`;
      return null;
    }
  }

  // Convert tree to graph with hierarchy
  // Convert tree to graph with hierarchy (respecting expanded state)
  function treeToGraph(tree) {
    allNodes = [];
    allLinks = [];

    function traverse(node, parent = null, level = 0, shouldShow = true) {
      const nodeData = {
        id: node.path,
        name: node.name,
        path: node.path,
        type: node.type,
        size: node.size || 0,
        children: node.children,
        level: level,
        modified: false,
        highlighted: false,
        parent: parent
      };
      
      allNodes.push(nodeData);

      if (parent && shouldShow) {
        allLinks.push({
          source: parent.path,
          target: node.path
        });
      }

      // Only traverse children if this folder is expanded
      if (node.children) {
        const isExpanded = expandedFolders.has(node.path);
        node.children.forEach(child => {
          traverse(child, node, level + 1, shouldShow && isExpanded);
        });
      }
    }

    traverse(tree);
    
    // Filter visible nodes and links
    const visibleNodes = allNodes.filter(node => {
      if (!node.parent) return true; // Root is always visible
      return isNodeVisible(node);
    });
    
    const visibleNodeIds = new Set(visibleNodes.map(n => n.id));
    const visibleLinks = allLinks.filter(link => 
      visibleNodeIds.has(link.source) && visibleNodeIds.has(link.target)
    );
    
    return { nodes: visibleNodes, links: visibleLinks };
  }
  
  // Check if node should be visible based on parent expansion
  function isNodeVisible(node) {
    if (!node.parent) return true;
    if (!expandedFolders.has(node.parent.path)) return false;
    return isNodeVisible(node.parent);
  }
  
  // Toggle folder expansion
  function toggleFolderExpansion(node) {
    const wasExpanded = expandedFolders.has(node.path);
    
    if (wasExpanded) {
      // Collapse: remove this folder and all descendants from expanded set
      console.log('🔽 Collapsing folder:', node.name);
      expandedFolders.delete(node.path);
      collapseDescendants(node);
    } else {
      // Expand: add to expanded set
      console.log('🔼 Expanding folder:', node.name);
      expandedFolders.add(node.path);
    }
    
    // Rebuild and update graph
    refreshGraph();
  }
  
  // Collapse all descendants
  function collapseDescendants(node) {
    if (node.children) {
      node.children.forEach(child => {
        if (child.children) {
          expandedFolders.delete(child.path);
          collapseDescendants(child);
        }
      });
    }
  }
  
  // Refresh graph with current expanded state
  function refreshGraph() {
    if (!currentTree || !graph) return;
    
    const graphData = treeToGraph(currentTree);
    
    // Smooth transition
    graph.graphData(graphData);
    
    // Update sprites for expanded/collapsed state
    setTimeout(() => {
      graph.refresh();
    }, 100);
  }
  
  // Expand all folders
  function expandAll() {
    console.log('🔼 Expanding all folders');
    
    function addAllFolders(node) {
      if (node.children) {
        expandedFolders.add(node.path);
        node.children.forEach(child => addAllFolders(child));
      }
    }
    
    if (currentTree) {
      addAllFolders(currentTree);
      refreshGraph();
    }
  }
  
  // Collapse all folders except root
  function collapseAll() {
    console.log('🔽 Collapsing all folders');
    
    const rootPath = currentTree?.path;
    expandedFolders.clear();
    
    // Keep root expanded
    if (rootPath) {
      expandedFolders.add(rootPath);
    }
    
    refreshGraph();
  }

  // Calculate total size recursively
  function calculateTotalSize(node) {
    let total = node.size || 0;
    if (node.children) {
      node.children.forEach(child => {
        total += calculateTotalSize(child);
      });
    }
    return total;
  }

  // Count total files in folder
  function countFiles(node) {
    let count = 0;
    if (node.children) {
      node.children.forEach(child => {
        if (child.children) {
          count += countFiles(child);
        } else {
          count++;
        }
      });
    }
    return count;
  }

  // Get file extension
  function getFileExtension(filename) {
    const parts = filename.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
  }

  // Format bytes
  function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  // Update breadcrumb
  function updateBreadcrumb(node) {
    const breadcrumb = document.getElementById('breadcrumb');
    if (!node) {
      breadcrumb.textContent = '';
      return;
    }
    breadcrumb.textContent = node.path;
  }

  // Focus on node
  function focusOnNode(node) {
    if (!graph) return;
    
    // Find the actual node in graph data (search result might be from tree)
    const graphData = graph.graphData();
    const graphNode = graphData.nodes.find(n => n.path === node.path || n.id === node.id);
    
    if (!graphNode) {
      console.warn('Node not found in graph:', node);
      return;
    }

    // If node doesn't have position yet, wait for physics to settle
    if (graphNode.x === undefined || graphNode.y === undefined || graphNode.z === undefined) {
      console.log('Waiting for node position...');
      setTimeout(() => focusOnNode(node), 500);
      return;
    }
    
    const distance = 180;
    const distRatio = 1 + distance / Math.hypot(graphNode.x, graphNode.y, graphNode.z);

    graph.cameraPosition(
      {
        x: graphNode.x * distRatio,
        y: graphNode.y * distRatio,
        z: graphNode.z * distRatio
      },
      graphNode,
      1200
    );
    
    console.log('Focused on node:', graphNode.name, 'at', graphNode.x, graphNode.y, graphNode.z);
  }

  // Search files
  function searchFiles(query) {
    if (!currentTree || !query) {
      clearSearch();
      return;
    }

    const results = [];
    const lowerQuery = query.toLowerCase();

    function search(node) {
      if (node.name.toLowerCase().includes(lowerQuery)) {
        results.push(node);
      }
      if (node.children) {
        node.children.forEach(search);
      }
    }

    search(currentTree);
    highlightSearchResults(results);
    updateSearchInfo(results.length);
    
    if (results.length > 0) {
      focusOnNode(results[0]);
    }
  }

  // Highlight search results
  function highlightSearchResults(results) {
    if (!graph) return;

    const graphData = graph.graphData();
    
    // Reset all highlights
    graphData.nodes.forEach(node => {
      node.highlighted = false;
      // Reset sprite opacity
      if (node.__sprite && node.__sprite.material) {
        node.__sprite.material.opacity = 0.9;
      }
    });

    // Highlight matching nodes
    results.forEach(result => {
      const node = graphData.nodes.find(n => n.path === result.path);
      if (node) {
        node.highlighted = true;
        console.log('Highlighted node:', node.name, node);
        // Keep sprite fully visible
        if (node.__sprite && node.__sprite.material) {
          node.__sprite.material.opacity = 1.0;
        }
      }
    });
    
    // Fade non-highlighted sprites
    graphData.nodes.forEach(node => {
      if (!node.highlighted && node.__sprite && node.__sprite.material) {
        node.__sprite.material.opacity = 0.15;
      }
    });

    // Force re-render to apply opacity changes
    graph.nodeOpacity(graph.nodeOpacity());
    graph.linkOpacity(graph.linkOpacity());
  }

  // Clear search
  function clearSearch() {
    if (!graph) return;
    const graphData = graph.graphData();
    graphData.nodes.forEach(node => {
      node.highlighted = false;
      // Restore sprite opacity
      if (node.__sprite && node.__sprite.material) {
        node.__sprite.material.opacity = 0.9;
      }
    });
    
    // Restore normal opacity
    graph.nodeOpacity(graph.nodeOpacity());
    graph.linkOpacity(graph.linkOpacity());
    
    updateSearchInfo(0);
  }

  // Update search info
  function updateSearchInfo(count) {
    const info = document.getElementById('search-info');
    if (count > 0) {
      info.textContent = `Found ${count} match${count !== 1 ? 'es' : ''}`;
      info.style.display = 'block';
    } else {
      info.style.display = 'none';
    }
  }

  // Calculate statistics
  function calculateStatistics(tree) {
    const stats = {
      totalFiles: 0,
      totalFolders: 0,
      totalSize: 0,
      deepestLevel: 0,
      fileTypes: {},
      largestFiles: []
    };

    function traverse(node, level = 0) {
      stats.deepestLevel = Math.max(stats.deepestLevel, level);

      if (node.children) {
        stats.totalFolders++;
        node.children.forEach(child => traverse(child, level + 1));
      } else {
        stats.totalFiles++;
        const size = node.size || 0;
        stats.totalSize += size;
        
        stats.largestFiles.push({ name: node.name, size, path: node.path });
        stats.largestFiles.sort((a, b) => b.size - a.size);
        if (stats.largestFiles.length > 10) stats.largestFiles.pop();
        
        const ext = getFileExtension(node.name);
        if (ext) {
          stats.fileTypes[ext] = (stats.fileTypes[ext] || 0) + 1;
        }
      }
    }

    traverse(tree);
    return stats;
  }

  // Update statistics UI
  function updateStatistics(tree) {
    const stats = calculateStatistics(tree);
    
    document.getElementById('total-files').textContent = stats.totalFiles;
    document.getElementById('total-folders').textContent = stats.totalFolders;
    document.getElementById('total-size').textContent = formatBytes(stats.totalSize);
    document.getElementById('deepest-level').textContent = stats.deepestLevel;
    
    // File types
    const typeList = document.getElementById('file-types');
    typeList.innerHTML = '';
    Object.entries(stats.fileTypes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .forEach(([type, count]) => {
        const li = document.createElement('li');
        const color = FILE_TYPE_COLORS[type] || FILE_TYPE_COLORS.default;
        li.innerHTML = `<span style="color: ${color}; font-size: 14px;">●</span> .${type}: <strong>${count}</strong>`;
        typeList.appendChild(li);
      });

    // Largest files
    const largestList = document.getElementById('largest-files');
    largestList.innerHTML = '';
    stats.largestFiles.slice(0, 5).forEach(file => {
      const li = document.createElement('li');
      li.innerHTML = `<div style="overflow: hidden; text-overflow: ellipsis;">${file.name}</div><small style="color: #4ade80;">${formatBytes(file.size)}</small>`;
      li.style.cursor = 'pointer';
      li.onclick = () => {
        const node = graph.graphData().nodes.find(n => n.path === file.path);
        if (node) focusOnNode(node);
      };
      largestList.appendChild(li);
    });
  }

  // Count Git status files
  function countGitStatus(tree) {
    const counts = { modified: 0, untracked: 0, staged: 0, deleted: 0 };
    
    function traverse(node) {
      if (node.gitStatus) {
        counts[node.gitStatus]++;
      }
      if (node.children) {
        node.children.forEach(traverse);
      }
    }
    
    traverse(tree);
    return counts;
  }

  // Update Git panel
  function updateGitPanel(tree) {
    const counts = countGitStatus(tree);
    
    document.getElementById('git-modified').textContent = counts.modified;
    document.getElementById('git-untracked').textContent = counts.untracked;
    document.getElementById('git-staged').textContent = counts.staged;
    document.getElementById('git-deleted').textContent = counts.deleted;
    
    console.log('[Strukt UI] Git counts:', counts);
  }

  // Update graph
  function updateGraph(tree) {
    if (!graph) return;

    currentTree = tree;
    const { nodes, links } = treeToGraph(tree);

    graph.graphData({ nodes, links });

    setTimeout(() => {
      graph.d3ReheatSimulation();
    }, 100);
  }


  // Git highlight toggle
  let gitHighlightEnabled = true;
  
  document.getElementById('toggle-git-highlight')?.addEventListener('click', function() {
    gitHighlightEnabled = !gitHighlightEnabled;
    this.classList.toggle('active');
    
    if (graph) {
      const graphData = graph.graphData();
      graphData.nodes.forEach(node => {
        if (node.gitStatus && !gitHighlightEnabled) {
          // Dim git-highlighted nodes
          if (node.__sprite) {
            node.__sprite.material.opacity = 0.3;
          }
        } else {
          // Restore
          if (node.__sprite) {
            node.__sprite.material.opacity = 0.9;
          }
        }
      });
    }
  });

  // Toggle Git panel
  document.getElementById('toggle-git-panel')?.addEventListener('click', function() {
    const panel = document.querySelector('.git-content');
    if (panel.style.display === 'none') {
      panel.style.display = 'flex';
      this.textContent = '−';
    } else {
      panel.style.display = 'none';
      this.textContent = '+';
    }
  });

  // ============ FILTER SIDEBAR FUNCTIONALITY ============
  
  // Filter state
  const filterState = {
    fileTypes: new Set(['js', 'ts', 'json', 'md', 'css', 'html', 'folder']),
    maxDepth: 10,
    sizeFilter: 'all',
    showLabels: true
  };

  // Toggle sidebar
  document.getElementById('toggle-sidebar')?.addEventListener('click', () => {
    const sidebar = document.getElementById('filter-sidebar');
    sidebar.classList.toggle('collapsed');
  });

  // Clear all filters
  document.getElementById('clear-filters')?.addEventListener('click', () => {
    // Reset file types
    filterState.fileTypes = new Set(['js', 'ts', 'json', 'md', 'css', 'html', 'folder']);
    document.querySelectorAll('#file-types-content input[type="checkbox"]').forEach(cb => {
      cb.checked = true;
    });
    
    // Reset depth
    filterState.maxDepth = 10;
    document.getElementById('depth-slider').value = 10;
    document.getElementById('depth-value').textContent = 10;
    
    // Reset size
    filterState.sizeFilter = 'all';
    document.querySelectorAll('input[name="size-filter"]').forEach(cb => {
      cb.checked = cb.value === 'all';
    });
    
    // Reset display options
    filterState.showLabels = true;
    document.getElementById('show-labels').checked = true;
    
    applyFilters();
  });

  // Section collapse/expand
  document.querySelectorAll('.section-header').forEach(header => {
    header.addEventListener('click', () => {
      header.classList.toggle('collapsed');
      const content = header.nextElementSibling;
      content.classList.toggle('hidden');
    });
  });

  // File type filters
  document.querySelectorAll('#file-types-content input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      const value = e.target.value;
      if (e.target.checked) {
        filterState.fileTypes.add(value);
      } else {
        filterState.fileTypes.delete(value);
      }
      applyFilters();
    });
  });

  // Depth slider
  document.getElementById('depth-slider')?.addEventListener('input', (e) => {
    const value = parseInt(e.target.value);
    filterState.maxDepth = value;
    document.getElementById('depth-value').textContent = value;
    applyFilters();
  });

  // Size filters
  document.querySelectorAll('input[name="size-filter"]').forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      if (e.target.checked) {
        // Uncheck others
        document.querySelectorAll('input[name="size-filter"]').forEach(cb => {
          if (cb !== e.target) cb.checked = false;
        });
        filterState.sizeFilter = e.target.value;
        applyFilters();
      }
    });
  });

  // Display options - Show Labels toggle
  document.getElementById('show-labels')?.addEventListener('change', (e) => {
    filterState.showLabels = e.target.checked;
    // Note: This only affects static labels, hover tooltips remain active via onNodeHover
  });

  // Apply filters to graph
  function applyFilters() {
    if (!graph || !currentTree) return;
    
    console.log('[Strukt] Applying filters:', filterState);
    
    // Filter the tree data
    const filteredData = filterTree(currentTree);
    
    // Convert to graph format
    const { nodes, links } = treeToGraph(filteredData);
    
    // Update graph
    graph.graphData({ nodes, links });
    
    // Reheat simulation
    setTimeout(() => {
      graph.d3ReheatSimulation();
    }, 100);
  }

  // Filter tree based on current filter state
  function filterTree(node, depth = 0) {
    if (!node) return null;
    
    // Check depth limit
    if (depth > filterState.maxDepth) return null;
    
    // Check file type
    const isFolder = node.children && node.children.length > 0;
    const ext = node.name.split('.').pop().toLowerCase();
    
    if (isFolder) {
      if (!filterState.fileTypes.has('folder')) return null;
    } else {
      if (!filterState.fileTypes.has(ext)) return null;
    }
    
    // Check file size
    if (!isFolder && filterState.sizeFilter !== 'all') {
      const sizeKB = (node.size || 0) / 1024;
      if (filterState.sizeFilter === 'small' && sizeKB >= 10) return null;
      if (filterState.sizeFilter === 'medium' && (sizeKB < 10 || sizeKB >= 100)) return null;
      if (filterState.sizeFilter === 'large' && sizeKB < 100) return null;
    }
    
    // Create filtered node
    const filteredNode = { ...node };
    
    // Recursively filter children
    if (node.children) {
      filteredNode.children = node.children
        .map(child => filterTree(child, depth + 1))
        .filter(child => child !== null);
      
      // If folder has no visible children after filtering, hide it
      if (filteredNode.children.length === 0) return null;
    }
    
    return filteredNode;
  }

  // ============ FOCUS MODE FUNCTIONALITY ============
  
  let focusedNode = null;
  const focusStack = []; // For breadcrumb navigation

  // Focus on a specific folder (isolate its contents)
  function focusOnFolder(node) {
    if (!node || !node.children) {
      console.warn('[Strukt] Cannot focus on non-folder node');
      return;
    }
    
    console.log('[Strukt] Focusing on folder:', node.name);
    
    // Add to focus stack for breadcrumb navigation
    if (!focusedNode) {
      focusStack.push({ name: 'Root', node: currentTree });
    }
    focusStack.push({ name: node.name, node: node });
    
    // Set focused node
    focusedNode = node;
    
    // Update graph with focused tree
    updateFocusedGraph();
    
    // Update breadcrumb
    updateFocusBreadcrumb();
  }

  // Exit focus mode (go back one level)
  function exitFocus() {
    if (focusStack.length === 0) return;
    
    focusStack.pop(); // Remove current
    
    if (focusStack.length === 0) {
      // Back to root
      focusedNode = null;
      updateGraph(currentTree);
    } else {
      // Go to parent
      focusedNode = focusStack[focusStack.length - 1].node;
      updateFocusedGraph();
    }
    
    updateFocusBreadcrumb();
  }

  // Navigate to specific level in focus stack
  function navigateToFocusLevel(index) {
    if (index < 0 || index >= focusStack.length) return;
    
    // Remove all levels after the target
    focusStack.splice(index + 1);
    
    if (index === 0) {
      focusedNode = null;
      updateGraph(currentTree);
    } else {
      focusedNode = focusStack[index].node;
      updateFocusedGraph();
    }
    
    updateFocusBreadcrumb();
  }

  // Update graph with focused tree
  function updateFocusedGraph() {
    if (!graph || !focusedNode) return;
    
    console.log('[Strukt] Updating focused graph');
    
    // Convert focused node to graph format
    const { nodes, links } = treeToGraph(focusedNode);
    
    // Update graph
    graph.graphData({ nodes, links });
    
    // Reheat simulation
    setTimeout(() => {
      graph.d3ReheatSimulation();
    }, 100);
  }

  // Update breadcrumb to show focus path
  function updateFocusBreadcrumb() {
    const breadcrumb = document.getElementById('breadcrumb');
    if (!breadcrumb) return;
    
    if (focusStack.length === 0) {
      breadcrumb.style.display = 'none';
      return;
    }
    
    breadcrumb.style.display = 'block';
    
    // Build breadcrumb HTML with navigation
    const crumbs = focusStack.map((item, index) => {
      const isLast = index === focusStack.length - 1;
      return `<span class="breadcrumb-item ${isLast ? 'active' : ''}" data-index="${index}">${item.name}</span>`;
    }).join('<span class="breadcrumb-separator">›</span>');
    
    breadcrumb.innerHTML = crumbs + ' <button id="exit-focus" title="Exit Focus Mode"><i data-feather="x-circle"></i></button>';
    
    // Replace feather icons
    if (typeof feather !== 'undefined') feather.replace();
    
    // Add click handlers for breadcrumb navigation
    breadcrumb.querySelectorAll('.breadcrumb-item').forEach((item, index) => {
      if (!item.classList.contains('active')) {
        item.style.cursor = 'pointer';
        item.addEventListener('click', () => navigateToFocusLevel(index));
      }
    });
    
    // Exit focus button
    document.getElementById('exit-focus')?.addEventListener('click', () => {
      focusStack.length = 0;
      focusedNode = null;
      updateGraph(currentTree);
      breadcrumb.style.display = 'none';
    });
  }

  // ============ END FOCUS MODE FUNCTIONALITY ============

  // ============ END FILTER FUNCTIONALITY ============

  // Event handlers
  document.getElementById('fit')?.addEventListener('click', () => {
    if (graph) graph.zoomToFit(800, 100);
  });

  document.getElementById('reset')?.addEventListener('click', () => {
    if (graph) graph.zoomToFit(1000, 50);
  });

  document.getElementById('search-input')?.addEventListener('input', (e) => {
    const query = e.target.value;
    query.length >= 2 ? searchFiles(query) : clearSearch();
  });

  document.getElementById('search-clear')?.addEventListener('click', () => {
    document.getElementById('search-input').value = '';
    clearSearch();
  });

  document.getElementById('toggle-stats')?.addEventListener('click', () => {
    const panel = document.getElementById('stats-panel');
    panel.classList.toggle('collapsed');
  });

  // Messages from extension
  window.addEventListener('message', event => {
    const message = event.data;
    console.log('[Strukt Webview] Received message:', message.type, message);
    if (message.type === 'update') {
      console.log('[Strukt Webview] Tree data:', message.tree);
      updateGraph(message.tree);
      
      // Auto-expand root folder on first load
      if (message.tree && !expandedFolders.has(message.tree.path)) {
        expandedFolders.add(message.tree.path);
        refreshGraph();
      }
    }
  });

  // Initialize
  console.log('[Strukt Webview] Initializing Strukt...');
  setTimeout(() => {
    initParticles();
    init3DGraph();
    console.log('[Strukt Webview] Sending ready message to extension');
    vscode.postMessage({ type: 'ready' });
  }, 100);

})();
