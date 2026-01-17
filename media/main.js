// Strukt - Interactive Project Map Extension
// Enhanced 3D visualization with ACTUALLY USEFUL features

(function() {
  const vscode = acquireVsCodeApi();
  let graph;
  let currentTree = null;

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

  // Devicon CDN base URL
  const DEVICON_BASE = 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons';

  // File extension to Devicon icon mapping
  const FILE_ICON_MAP = {
    // JavaScript ecosystem
    js: 'javascript/javascript-original.svg',
    jsx: 'react/react-original.svg',
    ts: 'typescript/typescript-original.svg',
    tsx: 'react/react-original.svg',
    json: 'json/json-original.svg',
    
    // Web
    html: 'html5/html5-original.svg',
    htm: 'html5/html5-original.svg',
    css: 'css3/css3-original.svg',
    scss: 'sass/sass-original.svg',
    sass: 'sass/sass-original.svg',
    less: 'less/less-plain-wordmark.svg',
    
    // Python
    py: 'python/python-original.svg',
    pyw: 'python/python-original.svg',
    ipynb: 'jupyter/jupyter-original.svg',
    
    // C family
    c: 'c/c-original.svg',
    cpp: 'cplusplus/cplusplus-original.svg',
    cc: 'cplusplus/cplusplus-original.svg',
    cxx: 'cplusplus/cplusplus-original.svg',
    h: 'c/c-original.svg',
    hpp: 'cplusplus/cplusplus-original.svg',
    cs: 'csharp/csharp-original.svg',
    
    // Other languages
    java: 'java/java-original.svg',
    go: 'go/go-original-wordmark.svg',
    rs: 'rust/rust-original.svg',
    rb: 'ruby/ruby-original.svg',
    php: 'php/php-original.svg',
    swift: 'swift/swift-original.svg',
    kt: 'kotlin/kotlin-original.svg',
    scala: 'scala/scala-original.svg',
    
    // Markup & Data
    md: 'markdown/markdown-original.svg',
    xml: 'xml/xml-original.svg',
    yaml: 'yaml/yaml-original.svg',
    yml: 'yaml/yaml-original.svg',
    toml: 'toml/toml-original.svg',
    
    // Shell
    sh: 'bash/bash-original.svg',
    bash: 'bash/bash-original.svg',
    zsh: 'bash/bash-original.svg',
    ps1: 'powershell/powershell-original.svg',
    
    // Build & Config
    dockerfile: 'docker/docker-original.svg',
    makefile: 'cmake/cmake-original.svg',
    gradle: 'gradle/gradle-original.svg',
    
    // Databases
    sql: 'mysql/mysql-original.svg',
    
    // Frameworks
    vue: 'vuejs/vuejs-original.svg',
    svelte: 'svelte/svelte-original.svg',
    
    // Other
    dart: 'dart/dart-original.svg',
    lua: 'lua/lua-original.svg',
    r: 'r/r-original.svg',
    
    // Special files
    txt: 'default', // Will use DEFAULT_FILE_ICON
    log: 'default',
    gitignore: 'git/git-original.svg',
    env: 'nodejs/nodejs-original.svg',
    npmrc: 'npm/npm-original-wordmark.svg',
    editorconfig: 'vscode/vscode-original.svg',
    prettierrc: 'prettier/prettier-original.svg'
  };

  // Special folder name detection
  const FOLDER_ICON_MAP = {
    // Frontend/UI folders
    'components': 'react/react-original.svg',
    'component': 'react/react-original.svg',
    'views': 'vuejs/vuejs-original.svg',
    'pages': 'nextjs/nextjs-original.svg',
    'layouts': 'html5/html5-original.svg',
    
    // Backend folders
    'server': 'nodejs/nodejs-original.svg',
    'api': 'nodejs/nodejs-original.svg',
    'backend': 'nodejs/nodejs-original.svg',
    'services': 'nodejs/nodejs-original.svg',
    
    // Frontend client
    'client': 'react/react-original.svg',
    'frontend': 'react/react-original.svg',
    'app': 'react/react-original.svg',
    
    // Common folders
    'src': 'javascript/javascript-original.svg',
    'lib': 'npm/npm-original-wordmark.svg',
    'utils': 'javascript/javascript-original.svg',
    'helpers': 'javascript/javascript-original.svg',
    'config': 'yaml/yaml-original.svg',
    'configs': 'yaml/yaml-original.svg',
    
    // Build/Deploy
    'dist': 'webpack/webpack-original.svg',
    'build': 'webpack/webpack-original.svg',
    'public': 'html5/html5-original.svg',
    '.github': 'github/github-original.svg',
    '.vscode': 'vscode/vscode-original.svg',
    
    // Testing
    'tests': 'jest/jest-plain.svg',
    'test': 'jest/jest-plain.svg',
    '__tests__': 'jest/jest-plain.svg',
    'spec': 'jest/jest-plain.svg',
    
    // Assets
    'assets': 'figma/figma-original.svg',
    'images': 'figma/figma-original.svg',
    'img': 'figma/figma-original.svg',
    'icons': 'figma/figma-original.svg',
    'static': 'html5/html5-original.svg',
    
    // Styles
    'styles': 'css3/css3-original.svg',
    'css': 'css3/css3-original.svg',
    'scss': 'sass/sass-original.svg',
    
    // Documentation
    'docs': 'markdown/markdown-original.svg',
    'doc': 'markdown/markdown-original.svg',
    'documentation': 'markdown/markdown-original.svg',
    
    // Database
    'models': 'mysql/mysql-original.svg',
    'database': 'mysql/mysql-original.svg',
    'migrations': 'mysql/mysql-original.svg',
    
    // Node modules
    'node_modules': 'npm/npm-original-wordmark.svg',
    'packages': 'npm/npm-original-wordmark.svg',
    'vendor': 'composer/composer-original.svg'
  };

  // Default fallback icons (using data URIs for guaranteed availability)
  const DEFAULT_FOLDER_ICON = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM0YTllZmYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMjIgMTlhMiAyIDAgMCAxLTIgMkg0YTIgMiAwIDAgMS0yLTJWNWEyIDIgMCAwIDEgMi0yaDVsMiAzaDlhMiAyIDAgMCAxIDIgMnoiPjwvcGF0aD48L3N2Zz4=';
  const DEFAULT_FILE_ICON = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM4ODg4ODgiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMTMgMkg2YTIgMiAwIDAgMC0yIDJ2MTZhMiAyIDAgMCAwIDIgMmgxMmEyIDIgMCAwIDAgMi0yVjlsLTctN3oiPjwvcGF0aD48cG9seWxpbmUgcG9pbnRzPSIxMyAyIDEzIDkgMjAgOSI+PC9wb2x5bGluZT48L3N2Zz4=';

  /**
   * Get icon URL for a node (file or folder)
   */
  function getIconUrl(node) {
    // Folders
    if (node.children || node.type === 'directory') {
      const folderName = node.name.toLowerCase();
      if (FOLDER_ICON_MAP[folderName]) {
        return `${DEVICON_BASE}/${FOLDER_ICON_MAP[folderName]}`;
      }
      return DEFAULT_FOLDER_ICON;
    }
    
    // Files - check special filenames first
    const fileName = node.name.toLowerCase();
    
    // Special filename patterns
    if (fileName === '.gitignore' || fileName === '.gitattributes') {
      return `${DEVICON_BASE}/git/git-original.svg`;
    }
    if (fileName === '.env' || fileName === '.env.local' || fileName === '.env.example') {
      return `${DEVICON_BASE}/nodejs/nodejs-original.svg`;
    }
    if (fileName === '.npmrc' || fileName === 'package.json' || fileName === 'package-lock.json') {
      return `${DEVICON_BASE}/npm/npm-original-wordmark.svg`;
    }
    if (fileName === '.editorconfig') {
      return `${DEVICON_BASE}/vscode/vscode-original.svg`;
    }
    if (fileName === '.prettierrc' || fileName === 'prettier.config.js') {
      return `${DEVICON_BASE}/prettier/prettier-original.svg`;
    }
    if (fileName === 'dockerfile' || fileName.startsWith('dockerfile.')) {
      return `${DEVICON_BASE}/docker/docker-original.svg`;
    }
    if (fileName === 'makefile') {
      return `${DEVICON_BASE}/cmake/cmake-original.svg`;
    }
    if (fileName === 'readme.md' || fileName === 'readme') {
      return `${DEVICON_BASE}/markdown/markdown-original.svg`;
    }
    
    // Check extension
    const ext = getFileExtension(node.name);
    const mapping = FILE_ICON_MAP[ext];
    
    if (mapping && mapping !== 'default') {
      return `${DEVICON_BASE}/${mapping}`;
    }
    
    return DEFAULT_FILE_ICON;
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
          const fallbackUrl = node.children ? DEFAULT_FOLDER_ICON : DEFAULT_FILE_ICON;
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

  // Initialize particles.js background
  function initParticles() {
    if (typeof particlesJS === 'undefined') return;
    particlesJS('particles-bg', {
      particles: {
        number: { value: 60, density: { enable: true, value_area: 800 } },
        color: { value: '#4a9eff' },
        shape: { type: 'circle' },
        opacity: { value: 0.25, random: false },
        size: { value: 2, random: true },
        line_linked: {
          enable: true, distance: 150, color: '#4a9eff',
          opacity: 0.15, width: 1
        },
        move: {
          enable: true, speed: 0.8, direction: 'none',
          random: false, straight: false, out_mode: 'out'
        }
      },
      interactivity: {
        detect_on: 'canvas',
        events: {
          onhover: { enable: true, mode: 'grab' },
          resize: true
        },
        modes: {
          grab: { distance: 140, line_linked: { opacity: 0.4 } }
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
        .enableNodeDrag(false) // Disable drag to maintain hierarchy
        .enableNavigationControls(true)
        .dagMode('radialout') // Radial layout - root at center, files radiating out
        .dagLevelDistance(80) // Distance between hierarchy levels
        
        // Rich tooltips with FILE PATH - actually useful!
        .nodeLabel(node => {
          const type = node.children ? 'folder' : 'file';
          const size = node.size ? formatBytes(node.size) : 'N/A';
          const fileCount = node.children ? countFiles(node) : null;
          
          return `
            <div style="background: rgba(0,0,0,0.9); padding: 10px; border-radius: 6px; color: white; max-width: 350px; font-family: 'Segoe UI', sans-serif;">
              <strong style="font-size: 14px; color: #4a9eff;">${node.name}</strong><br/>
              <div style="margin-top: 6px; font-size: 12px;">
                <div><span style="color: #ffd700;">${type === 'folder' ? '📁' : '📄'}</span> ${type}</div>
                <div>Size: <span style="color: #4ade80;">${size}</span></div>
                ${fileCount ? `<div>Files: <span style="color: #fbbf24;">${fileCount}</span></div>` : ''}
                <div style="margin-top: 4px; color: #999; font-size: 11px;">${node.path}</div>
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
        
        .nodeOpacity(0.9)
        .nodeResolution(20)
        
        .linkColor(() => 'rgba(74, 158, 255, 0.25)')
        .linkWidth(1.5)
        .linkOpacity(0.25)
        .linkDirectionalParticles(2)
        .linkDirectionalParticleSpeed(0.003)
        .linkDirectionalParticleWidth(1.5)
        
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
            // It's a folder - focus on it
            console.log('Focusing on folder:', node.name);
            focusOnNode(node);
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
  function treeToGraph(tree) {
    const nodes = [];
    const links = [];

    function traverse(node, parent = null, level = 0) {
      const nodeData = {
        id: node.path,
        name: node.name,
        path: node.path,
        type: node.type,
        size: node.size || 0,
        children: node.children,
        level: level,
        modified: false,
        highlighted: false
      };
      
      nodes.push(nodeData);

      if (parent) {
        links.push({
          source: parent.path,
          target: node.path
        });
      }

      if (node.children) {
        node.children.forEach(child => traverse(child, node, level + 1));
      }
    }

    traverse(tree);
    return { nodes, links };
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
