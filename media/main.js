// @ts-check
(function () {
  // @ts-ignore
  const vscode = acquireVsCodeApi();
  let cy;

  // Initialize Cytoscape
  function initCytoscape() {
    // @ts-ignore - cytoscape is loaded globally
    cy = cytoscape({
      container: document.getElementById('cy'),
      
      style: [
        {
          selector: 'node',
          style: {
            'label': 'data(label)',
            'text-valign': 'center',
            'text-halign': 'center',
            'background-color': 'var(--vscode-editor-background)',
            'border-color': 'var(--vscode-editor-foreground)',
            'border-width': 2,
            'color': 'var(--vscode-editor-foreground)',
            'font-size': '12px',
            'font-family': 'var(--vscode-font-family)',
            'width': '80px',
            'height': '40px',
            'text-wrap': 'wrap',
            'text-max-width': '70px',
            'shape': 'roundrectangle'
          }
        },
        {
          selector: 'node[type="folder"]',
          style: {
            'background-color': 'var(--vscode-button-background)',
            'color': 'var(--vscode-button-foreground)',
            'font-weight': 'bold',
            'width': '100px',
            'height': '50px'
          }
        },
        {
          selector: 'node[type="file"]',
          style: {
            'background-color': 'var(--vscode-editor-background)',
            'border-color': 'var(--vscode-textLink-foreground)',
            'width': '70px',
            'height': '35px'
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': 'var(--vscode-editor-foreground)',
            'target-arrow-color': 'var(--vscode-editor-foreground)',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'opacity': 0.6
          }
        },
        {
          selector: 'node:selected',
          style: {
            'background-color': 'var(--vscode-button-hoverBackground)',
            'border-color': 'var(--vscode-focusBorder)',
            'border-width': 3
          }
        }
      ],

      layout: {
        name: 'breadthfirst',
        directed: true,
        spacingFactor: 1.5,
        animate: false
      },

      wheelSensitivity: 0.2,
      minZoom: 0.1,
      maxZoom: 3
    });

    // Handle node clicks
    cy.on('tap', 'node', function (evt) {
      const node = evt.target;
      const nodeData = node.data();
      
      if (nodeData.type === 'file') {
        vscode.postMessage({
          type: 'openFile',
          path: nodeData.path
        });
      }

      showNodeInfo(nodeData);
    });

    // Handle hover
    cy.on('mouseover', 'node', function (evt) {
      const node = evt.target;
      node.style('cursor', 'pointer');
      showNodeInfo(node.data());
    });

    cy.on('mouseout', 'node', function () {
      const infoElement = document.getElementById('info');
      if (infoElement) {
        infoElement.innerHTML = '';
      }
    });
  }

  // Show node information
  function showNodeInfo(data) {
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

  // Update graph with new data
  function updateGraph(tree, layout = 'breadthfirst') {
    if (!cy) {
      return;
    }

    const elements = [];
    
    function processNode(node, parentId = null) {
      const nodeId = node.path || node.name;
      
      elements.push({
        data: {
          id: nodeId,
          label: node.name,
          type: node.type,
          path: node.path,
          size: node.size,
          children: node.children?.length || 0
        }
      });

      if (parentId) {
        elements.push({
          data: {
            id: `${parentId}-${nodeId}`,
            source: parentId,
            target: nodeId
          }
        });
      }

      if (node.children) {
        node.children.forEach(child => processNode(child, nodeId));
      }
    }

    processNode(tree);

    cy.elements().remove();
    cy.add(elements);
    
    cy.layout({
      name: layout,
      directed: true,
      spacingFactor: 1.5,
      animate: true,
      animationDuration: 500
    }).run();

    cy.fit(50);
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
    cy?.fit(50);
  });

  document.getElementById('reset')?.addEventListener('click', () => {
    cy?.reset();
  });

  document.getElementById('refresh')?.addEventListener('click', () => {
    vscode.postMessage({ type: 'refresh' });
  });

  document.getElementById('layout')?.addEventListener('change', (e) => {
    if (e.target instanceof HTMLSelectElement) {
      const layout = e.target.value;
      if (cy) {
        cy.layout({
          name: layout,
          directed: true,
          spacingFactor: 1.5,
          animate: true,
          animationDuration: 500
        }).run();
      }
    }
  });

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCytoscape);
  } else {
    initCytoscape();
  }

  // Notify extension that webview is ready
  vscode.postMessage({ type: 'ready' });
})();
