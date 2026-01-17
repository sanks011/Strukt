// @ts-check
(function () {
  const vscode = acquireVsCodeApi();
  let graph;
  let currentZoom = 100;

  // Initialize 3D Force Graph
  function init3DGraph() {
    const container = document.getElementById('cy');
    
    // Check if ForceGraph3D is loaded
    if (typeof ForceGraph3D === 'undefined') {
      console.error('ForceGraph3D is not loaded!');
      container.innerHTML = '<div style="color: white; padding: 20px; text-align: center;">Error: 3D Force Graph library not loaded. Please reload the extension.</div>';
      return;
    }
    
    try {
      // @ts-ignore - ForceGraph3D is loaded globally
      graph = ForceGraph3D()(container)
        .backgroundColor('#1e1e1e')
        .nodeLabel('label')
        .nodeColor(node => node.type === 'folder' ? '#0e639c' : '#3794ff')
        .nodeVal(node => node.type === 'folder' ? 8 : 4)
        .nodeOpacity(0.9)
        .linkColor(() => '#ffffff44')
        .linkWidth(1)
        .linkOpacity(0.6)
        .linkDirectionalParticles(2)
        .linkDirectionalParticleWidth(2)
        .linkDirectionalParticleSpeed(0.006)
        .d3AlphaDecay(0.01)
        .d3VelocityDecay(0.3)
        .warmupTicks(100)
        .cooldownTicks(200)
        .enableNodeDrag(true)
        .enableNavigationControls(true)
        .showNavInfo(false)
        .onNodeClick(handleNodeClick)
        .onNodeHover(handleNodeHover);

      // Smooth camera controls
      const controls = graph.controls();
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.rotateSpeed = 0.5;
      controls.zoomSpeed = 2.5;
      controls.minDistance = 50;
      controls.maxDistance = 2000;
      
      console.log('3D Force Graph initialized successfully');
    } catch (error) {
      console.error('Error initializing 3D Force Graph:', error);
      container.innerHTML = '<div style="color: white; padding: 20px; text-align: center;">Error initializing graph: ' + error.message + '</div>';
    }
  }

  // Handle node clicks
  function handleNodeClick(node) {
    if (node && node.type === 'file') {
      vscode.postMessage({
        type: 'openFile',
        path: node.path
      });
    }
    showNodeInfo(node);
  }

  // Handle node hover
  function handleNodeHover(node) {
    if (node) {
      showNodeInfo(node);
      document.body.style.cursor = 'pointer';
    } else {
      const infoElement = document.getElementById('info');
      if (infoElement) {
        infoElement.innerHTML = '';
      }
      document.body.style.cursor = 'default';
    }
  }

  // Show node information
  function showNodeInfo(data) {
    if (!data) return;
    
    const info = document.getElementById('info');
    if (!info) return;
    
    let content = `<strong>${data.label}</strong><br>`;
    content += `Type: ${data.type}<br>`;
    if (data.path) {
      content += `Path: ${data.path}<br>`;
    }
    if (data.size !== undefined) {
      content += `Size: ${formatBytes(data.size)}<br>`;
    }
    if (data.children !== undefined) {
      content += `Children: ${data.children}`;
    }
    info.innerHTML = content;
  }

  // Format bytes to human-readable
  function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  // Convert tree to graph data
  function treeToGraph(tree) {
    const nodes = [];
    const links = [];

    function processNode(node, parentId = null) {
      const nodeId = node.path || node.name;
      
      nodes.push({
        id: nodeId,
        label: node.name,
        type: node.type,
        path: node.path,
        size: node.size,
        children: node.children?.length || 0
      });

      if (parentId) {
        links.push({
          source: parentId,
          target: nodeId
        });
      }

      if (node.children) {
        node.children.forEach(child => processNode(child, nodeId));
      }
    }

    processNode(tree);
    return { nodes, links };
  }

  // Apply layout
  function applyLayout(layout) {
    if (!graph) return;

    switch (layout) {
      case 'hierarchical':
        graph
          .dagMode('td')
          .dagLevelDistance(150);
        break;
      
      case 'radial':
        graph
          .dagMode('radialout')
          .dagLevelDistance(100);
        break;
      
      case 'force-directed':
      default:
        graph.dagMode(null);
        graph.d3Force('charge').strength(-200);
        graph.d3Force('link').distance(80);
        break;
    }
  }

  // Update graph with new data
  function updateGraph(tree, layout = 'force-directed') {
    if (!graph) return;

    const graphData = treeToGraph(tree);
    
    // Apply layout first
    applyLayout(layout);
    
    // Update graph data
    graph.graphData(graphData);
    
    // Zoom to fit after a delay
    setTimeout(() => {
      graph.zoomToFit(1000, 50);
      updateZoomDisplay();
    }, 500);
  }

  // Update zoom display
  function updateZoomDisplay() {
    const zoomLevel = document.getElementById('zoom-level');
    if (zoomLevel && graph) {
      const camera = graph.camera();
      const distance = camera.position.length();
      const zoom = Math.round((1000 / distance) * 100);
      currentZoom = Math.max(5, Math.min(300, zoom));
      zoomLevel.textContent = currentZoom + '%';
      
      const zoomSlider = document.getElementById('zoom-slider');
      if (zoomSlider instanceof HTMLInputElement) {
        zoomSlider.value = currentZoom.toString();
      }
    }
  }

  // Handle messages from extension
  window.addEventListener('message', event => {
    const message = event.data;
    
    switch (message.type) {
      case 'update':
        updateGraph(message.tree, message.layout);
        break;
    }
  });

  // Controls
  document.getElementById('fit')?.addEventListener('click', () => {
    if (graph) {
      graph.zoomToFit(1000, 50);
      setTimeout(updateZoomDisplay, 1100);
    }
  });

  document.getElementById('reset')?.addEventListener('click', () => {
    if (graph) {
      const camera = graph.camera();
      const controls = graph.controls();
      
      // Smooth transition to default position
      const startPos = camera.position.clone();
      const endPos = { x: 0, y: 0, z: 1000 };
      const duration = 800;
      const startTime = Date.now();
      
      function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease out cubic
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        
        camera.position.x = startPos.x + (endPos.x - startPos.x) * easeProgress;
        camera.position.y = startPos.y + (endPos.y - startPos.y) * easeProgress;
        camera.position.z = startPos.z + (endPos.z - startPos.z) * easeProgress;
        
        controls.target.set(0, 0, 0);
        controls.update();
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          updateZoomDisplay();
        }
      }
      
      animate();
    }
  });

  // Zoom slider control
  const zoomSlider = document.getElementById('zoom-slider');

  zoomSlider?.addEventListener('input', (e) => {
    if (e.target instanceof HTMLInputElement && graph) {
      const zoomValue = parseInt(e.target.value);
      const camera = graph.camera();
      const controls = graph.controls();
      
      // Calculate distance from zoom percentage
      const distance = 1000 / (zoomValue / 100);
      
      // Get current direction
      const direction = camera.position.clone().normalize();
      
      // Set new position maintaining direction
      camera.position.copy(direction.multiplyScalar(distance));
      controls.update();
      
      currentZoom = zoomValue;
      const zoomLevel = document.getElementById('zoom-level');
      if (zoomLevel) {
        zoomLevel.textContent = zoomValue + '%';
      }
    }
  });

  // Layout change
  document.getElementById('layout')?.addEventListener('change', (e) => {
    if (e.target instanceof HTMLSelectElement && graph) {
      applyLayout(e.target.value);
      
      // Re-heat simulation for layout change
      graph.numDimensions(3);
      
      setTimeout(() => {
        graph.zoomToFit(1000, 50);
      }, 500);
    }
  });

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init3DGraph);
  } else {
    init3DGraph();
  }

  // Notify extension that webview is ready
  vscode.postMessage({ type: 'ready' });

  // Update zoom display periodically during user interaction
  setInterval(() => {
    if (graph && document.hasFocus()) {
      updateZoomDisplay();
    }
  }, 500);
})();
