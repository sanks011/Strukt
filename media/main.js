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
    
    // Special files
    txt: 'vscode-icons:file-type-text',
    log: 'vscode-icons:file-type-log',
    gitignore: 'vscode-icons:file-type-git',
    env: 'vscode-icons:file-type-dotenv',
    npmrc: 'vscode-icons:file-type-npm',
    editorconfig: 'vscode-icons:file-type-editorconfig',
    prettierrc: 'vscode-icons:file-type-prettier'
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
    // Folders
    if (node.children || node.type === 'directory') {
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
    
    sprite.scale.set(scale, scale, 1);
    
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
          const expandIcon = isExpanded ? '🔼' : '🔽';
          
          return `
            <div style="background: rgba(0,0,0,0.95); padding: 12px; border-radius: 8px; color: white; max-width: 350px; font-family: 'Segoe UI', sans-serif; box-shadow: 0 4px 12px rgba(0,0,0,0.5);">
              <strong style="font-size: 15px; color: #4a9eff;">${node.name}</strong><br/>
              <div style="margin-top: 8px; font-size: 12px; line-height: 1.6;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="font-size: 16px;">${type === 'folder' ? '📁' : '📄'}</span>
                  <span style="color: #fbbf24; font-weight: 500;">${type.toUpperCase()}</span>
                  ${node.children ? `<span style="color: #4ade80; margin-left: auto;">${expandIcon} ${isExpanded ? 'Expanded' : 'Click to expand'}</span>` : ''}
                </div>
                <div style="margin-top: 6px;">
                  <span style="color: #999;">Size:</span> <span style="color: #4ade80; font-weight: 500;">${size}</span>
                </div>
                ${fileCount ? `<div><span style="color: #999;">Files:</span> <span style="color: #fbbf24; font-weight: 500;">${fileCount}</span></div>` : ''}
                ${node.children ? `<div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.1); color: #60a5fa; font-size: 11px;">💡 Click to ${isExpanded ? 'collapse' : 'expand'}</div>` : ''}
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
        
        // Color by file type - instant recognition (kept for backwards compat but sprites override)
        .nodeColor(node => {
          if (node.highlighted) return '#ff00ff'; // Search results
          if (node.modified) return '#ff6b6b'; // Git modified
          if (node.children) return FOLDER_COLOR;
          
          const ext = getFileExtension(node.name);
          return FILE_TYPE_COLORS[ext] || FILE_TYPE_COLORS.default;
        })
        
        .nodeOpacity(0.95)
        .nodeResolution(24)
        
        // Simple, clean connecting lines - NO particles, NO animations
        .linkColor(() => 'rgba(255, 255, 255, 0.3)') // Clean white lines
        .linkWidth(1) // Thin, minimal
        .linkOpacity(0.3)
        .linkDirectionalParticles(0) // NO particles - clean and simple
        .linkDirectionalParticleSpeed(0)
        .linkDirectionalParticleWidth(0)
        
        .onNodeClick(node => {
          console.log('Node clicked:', node);
          
          if (!node) {
            console.warn('No node data on click');
            return;
          }
          
          // Check if it's a file (type === 'file' or has no children array with items)
          const isFile = node.type === 'file' || !node.children || node.children.length === 0;
          
          if (isFile) {
            // It's a file - try to open it
            if (!node.path) {
              console.error('Node has no path:', node);
              return;
            }
            
            console.log('Opening file:', node.path);
            vscode.postMessage({ type: 'openFile', path: node.path });
          } else {
            // It's a folder - toggle expand/collapse
            toggleFolderExpansion(node);
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
    graphData.nodes.forEach(node => node.highlighted = false);

    // Highlight matching nodes
    results.forEach(result => {
      const node = graphData.nodes.find(n => n.path === result.path);
      if (node) {
        node.highlighted = true;
        console.log('Highlighted node:', node.name, node);
      }
    });

    // Force re-render by updating graph data
    graph.nodeColor(graph.nodeColor());
  }

  // Clear search
  function clearSearch() {
    if (!graph) return;
    const graphData = graph.graphData();
    graphData.nodes.forEach(node => node.highlighted = false);
    graph.nodeColor(graph.nodeColor());
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

  // Update graph
  function updateGraph(tree) {
    if (!graph) return;

    currentTree = tree;
    const { nodes, links } = treeToGraph(tree);

    graph.graphData({ nodes, links });
    updateStatistics(tree);

    setTimeout(() => {
      graph.d3ReheatSimulation();
    }, 100);
  }

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
    if (message.type === 'update') {
      updateGraph(message.tree);
      
      // Auto-expand root folder on first load
      if (message.tree && !expandedFolders.has(message.tree.path)) {
        expandedFolders.add(message.tree.path);
        refreshGraph();
      }
    }
  });

  // Initialize
  console.log('Initializing Strukt...');
  setTimeout(() => {
    initParticles();
    init3DGraph();
    vscode.postMessage({ type: 'ready' });
  }, 100);

})();
