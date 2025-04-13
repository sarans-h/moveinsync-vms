import React, { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { RefreshCw, ZoomIn, ZoomOut, PlusCircle } from 'lucide-react'

// Level mapping
const levelHierarchy = ['national', 'regional', 'state', 'city', 'local']

function VendorHierarchy() {
  const [treeData, setTreeData] = useState(null)
  const [draggedNode, setDraggedNode] = useState(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const [showAddModal, setShowAddModal] = useState(false)
  const [targetNodeForAdd, setTargetNodeForAdd] = useState(null)
  const [newVendorData, setNewVendorData] = useState({
    name: '',
    email: '',
    password: '',
    vendorLevel: '',
    location: {
      address: '',
      city: '',
      state: '',
      country: ''
    },
    contact: {
      phone: ''
    }
  })
  const containerRef = useRef(null)
  const [showContextMenu, setShowContextMenu] = useState(false)
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 })
  const [contextMenuNode, setContextMenuNode] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingVendor, setEditingVendor] = useState(null)
  const [editingPermissions, setEditingPermissions] = useState({
    createVendors: false,
    processPayments: false,
    vehicleOnboarding: false,
    driverOnboarding: false,
    assignVehicle: false
  })
  const [errorMessage, setErrorMessage] = useState(null)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userResponse = await axios.get('http://localhost:3002/api/vendors/verify', {
          withCredentials: true
        })
        const userId = userResponse.data.data.vendor._id;
        // console.log(userId)

        const hierarchyResponse = await axios.get(`http://localhost:3002/api/vendors/${userId}/hierarchy-tree`, {
          withCredentials: true
        });
        const hierarchyData = hierarchyResponse.data.data.hierarchyTree;
        setTreeData(addPositionsIfNeeded(hierarchyData));
        console.log(hierarchyData)
        // Arrange nodes in a single line
        if (containerRef.current) {
          const initialPanX = 0;
          setPan({ x: initialPanX, y: 0 });
        }
      } catch (err) {
        console.error('Error fetching hierarchy:', err);
      }
    };

    fetchUserData();
  }, []);

  const addPositionsIfNeeded = (tree) => {
    let xOffset = 0;
    const processNode = (node) => {
      node.position = { x: xOffset, y: 0 };
      xOffset += 200; // Space between nodes
      if (node.children) {
        node.children.forEach(processNode);
      }
      return node;
    };
    return processNode(tree);
  };

  const handleRefresh = () => {
    if (treeData) {
      const resetTreeData = addPositionsIfNeeded(JSON.parse(JSON.stringify(treeData)));
      setTreeData(resetTreeData);
    }
    setZoom(1);
    setPan({ x: 0, y: 0 }); // Reset pan to default
  }

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 2))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 0.5))
  }

  const handleNodeDragStart = (e, node) => {
    e.stopPropagation(); // Prevent background panning
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    setDraggedNode(node);
    setDragOffset({ x: offsetX, y: offsetY });
  };

  const handleNodeDrag = (e) => {
    if (!draggedNode) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - containerRect.left - dragOffset.x - pan.x) / zoom;
    const y = (e.clientY - containerRect.top - dragOffset.y - pan.y) / zoom;
    updateNodePosition(draggedNode.id, x, y);
  };

  const handleNodeDragEnd = () => {
    setDraggedNode(null);
  };

  const handlePanStart = (e) => {
    if (e.target === containerRef.current) { // Only pan when clicking on the background
      setIsPanning(true);
      const startX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
      const startY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
      setPanStart({ x: startX - pan.x, y: startY - pan.y });
    }
  };

  const handlePanMove = (e) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  };

  const handlePanEnd = () => {
    setIsPanning(false);
  };

  const updateNodePosition = (nodeId, x, y) => {
    const updateNodeInTree = (node) => {
      if (node.id === nodeId) {
        return { ...node, position: { x, y } }
      }
      if (node.children && node.children.length > 0) {
        return {
          ...node,
          children: node.children.map(child => updateNodeInTree(child))
        }
      }
      return node
    }
    setTreeData(prevData => updateNodeInTree(prevData))
  }

  const openAddNodeModal = (node) => {
    setTargetNodeForAdd(node)
    setShowAddModal(true)
    const nextLevel = getNextLevel(node.level)
    setNewVendorData(prev => ({
      ...prev,
      name: `New ${nextLevel.charAt(0).toUpperCase() + nextLevel.slice(1)} Vendor`,
      vendorLevel: nextLevel,
      email: `${nextLevel.toLowerCase()}${Date.now()}@example.com`,
    //   password: `${nextLevel.toLowerCase()}123`,
    }))
  }

  const getNextLevel = (currentLevel) => {
    const currentIndex = levelHierarchy.indexOf(currentLevel)
    if (currentIndex >= 0 && currentIndex < levelHierarchy.length - 1) {
      return levelHierarchy[currentIndex + 1]
    }
    return 'local'
  }

  const handleInputChange = (e, section) => {
    const { name, value } = e.target;
    if (section) {
      setNewVendorData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [name]: value
        }
      }));
    } else {
      setNewVendorData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const addNewNode = async () => {
    try {
      const response = await axios.post('http://localhost:3002/api/vendors/register/sub-vendor', newVendorData, {
        withCredentials: true
      });
      
      if (response.data.success) {
        const newNode = {
          id: response.data.data.vendor._id,
          name: newVendorData.name,
          level: newVendorData.vendorLevel,
          identity: response.data.data.vendor.identity,
          position: {
            x: targetNodeForAdd.position.x,
            y: targetNodeForAdd.position.y + 150
          },
          children: []
        };

        const updatedTree = JSON.parse(JSON.stringify(treeData));
        const updateNodeChildren = (node) => {
          if (node.id === targetNodeForAdd.id) {
            node.children = [...(node.children || []), newNode];
            return true;
          }
          if (node.children && node.children.length > 0) {
            for (let child of node.children) {
              if (updateNodeChildren(child)) return true;
            }
          }
          return false;
        };
        
        updateNodeChildren(updatedTree);
        setTreeData(updatedTree);
        setShowAddModal(false);
        setNewVendorData({
          name: '',
          email: '',
          password: '',
          vendorLevel: '',
          location: {
            address: '',
            city: '',
            state: '',
            country: ''
          },
          contact: {
            phone: ''
          }
        });
        setErrorMessage(null); // Clear any existing error messages
      }
    } catch (error) {
      console.error('Error adding new vendor:', error);
      setErrorMessage(error.response?.data?.message || 'Failed to add new vendor. Please try again.');
    }
  };

  const renderConnections = () => {
    const connections = []
    const addConnectionsForNode = (node) => {
      if (!node?.children || node?.children?.length === 0) return
      const parentX = node.position.x
      const parentY = node.position.y
      node.children.forEach((child) => {
        const childX = child.position.x
        const childY = child.position.y
        connections.push(
          <path
            key={`${node.id}-${child.id}`}
            d={`M ${parentX + 75} ${parentY + 60} 
                C ${parentX + 75} ${parentY + 90}, 
                  ${childX + 75} ${childY - 30}, 
                  ${childX + 75} ${childY}`}
            stroke="#555"
            fill="none"
            strokeWidth="2"
            markerEnd="url(#arrowhead)"
          />
        )
        addConnectionsForNode(child)
      })
    }
    addConnectionsForNode(treeData)
    return connections
  }

  const handleContextMenu = (e, node) => {
    // Only show context menu for direct children of root
    if (treeData && treeData.children && treeData.children.some(child => child.id === node.id)) {
      e.preventDefault();
      setContextMenuNode(node);
      setContextMenuPosition({ x: e.clientX, y: e.clientY });
      setShowContextMenu(true);
    }
  };

  const handleContextMenuClose = () => {
    setShowContextMenu(false);
    setContextMenuNode(null);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showContextMenu && !e.target.closest('.context-menu')) {
        handleContextMenuClose();
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showContextMenu]);

  const handleDeleteVendor = async () => {
    try {
      const response = await axios.delete(`http://localhost:3002/api/vendors/${contextMenuNode.id}`, {
        withCredentials: true
      });
      
      if (response.data.success) {
        // Remove the node from the tree
        const updatedTree = JSON.parse(JSON.stringify(treeData));
        const removeNode = (node) => {
          if (node.children) {
            node.children = node.children.filter(child => child.id !== contextMenuNode.id);
            node.children.forEach(child => removeNode(child));
          }
        };
        removeNode(updatedTree);
        setTreeData(updatedTree);
        handleContextMenuClose();
      }
    } catch (error) {
      console.error('Error deleting vendor:', error);
      setErrorMessage(error.response?.data?.message || 'Failed to delete vendor');
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  const handleEditVendor = () => {
    if (contextMenuNode) {
      setEditingVendor(contextMenuNode);
      setEditingPermissions(contextMenuNode.permissions || {
        createVendors: false,
        processPayments: false,
        vehicleOnboarding: false,
        driverOnboarding: false,
        assignVehicle: false
      });
      setShowEditModal(true);
      handleContextMenuClose();
    }
  };

  const handlePermissionChange = (permission) => {
    setEditingPermissions(prev => ({
      ...prev,
      [permission]: !prev[permission]
    }));
  };

  const findParentNode = (node, targetId) => {
    if (!node || !node.children) return null;
    
    // Check if any of the children match the target
    if (node.children.some(child => child.id === targetId)) {
      return node;
    }
    
    // Recursively check children
    for (const child of node.children) {
      const parent = findParentNode(child, targetId);
      if (parent) return parent;
    }
    
    return null;
  };

  const handleSavePermissions = async () => {
    try {
      // Get the original permissions from the node
      const originalPermissions = editingVendor.permissions || {
        createVendors: false,
        processPayments: false,
        vehicleOnboarding: false,
        driverOnboarding: false,
        assignVehicle: false
      };

      // Find which permissions have changed
      const changedPermissions = Object.entries(editingPermissions).filter(
        ([key, value]) => originalPermissions[key] !== value
      );

      // Find the parent node
      const parentNode = findParentNode(treeData, editingVendor.id);
      if (!parentNode) {
        throw new Error('Parent node not found');
      }

      // Process each changed permission
      for (const [permission, newValue] of changedPermissions) {
        const endpoint = newValue ? 'grant-permission' : 'revoke-permission';
        try {
          const response = await axios.post(
            `http://localhost:3002/api/vendors/${parentNode.id}/${endpoint}`,
            {
              childId: editingVendor.id,
              permission: permission
            },
            { withCredentials: true }
          );

          if (!response.data.success) {
            throw new Error(response.data.message || `Failed to update permission: ${permission}`);
          }
        } catch (error) {
          // Handle validation errors specifically
          if (error.response?.status === 400) {
            const errorMessage = error.response.data.message || 'Invalid request. Please check the values and try again.';
            setErrorMessage(errorMessage);
            return; // Stop processing further permissions if one fails
          }
          throw error; // Re-throw other types of errors
        }
      }

      // Update the tree with new permissions
      const updatedTree = JSON.parse(JSON.stringify(treeData));
      const updateNodePermissions = (node) => {
        if (node.id === editingVendor.id) {
          return { ...node, permissions: editingPermissions };
        }
        if (node.children && node.children.length > 0) {
          return {
            ...node,
            children: node.children.map(child => updateNodePermissions(child))
          };
        }
        return node;
      };
      setTreeData(updateNodePermissions(updatedTree));
      setShowEditModal(false);
      setErrorMessage(null); // Clear any error messages on success
    } catch (error) {
      console.error('Error updating permissions:', error);
      setErrorMessage(error.response?.data?.message || error.message || 'Failed to update permissions');
    }
  };

  const renderAllNodes = () => {
    const nodes = []
    const renderNode = (node) => {
      if (!node || !node.position) return;

      const nodeWidth = 150
      const nodeHeight = 60
      const isRootChild = treeData && treeData.children && treeData.children.some(child => child.id === node.id);
      nodes.push(
        <div
          key={node.id}
          draggable
          onDragStart={(e) => handleNodeDragStart(e, node)}
          onContextMenu={(e) => handleContextMenu(e, node)}
          style={{
            position: 'absolute',
            left: `${node.position.x}px`,
            top: `${node.position.y}px`,
            width: `${nodeWidth}px`,
            height: `${nodeHeight}px`,
            border: '2px solid #333',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'move',
            backgroundColor: draggedNode === node ? 'rgba(100, 149, 237, 0.5)' : 'white',
            color: '#333',
            fontSize: '14px',
            textAlign: 'center',
            padding: '4px',
            boxSizing: 'border-box',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            zIndex: 10,
            transition: 'transform 0.2s ease',
          }}
        >
          <div>
            <div className="font-semibold">{node.name}</div>
            <div style={{ fontSize: '10px', opacity: 0.8 }}>
              {node.level} • {node.identity}
            </div>
          </div>
          <div 
            style={{
              position: 'absolute',
              right: '-8px',
              bottom: '-8px',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: '#4CAF50',
              color: 'white',
              cursor: 'pointer',
              zIndex: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={(e) => {
              e.stopPropagation()
              openAddNodeModal(node)
            }}
          >
            <PlusCircle size={16} />
          </div>
        </div>
      )
      if (node.children && node.children.length > 0) {
        node.children.forEach(child => renderNode(child))
      }
    }
    renderNode(treeData)
    return nodes
  }

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (draggedNode) {
        handleNodeDrag(e);
      }
    };
    const handleMouseUp = () => {
      if (draggedNode) {
        handleNodeDragEnd();
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggedNode, dragOffset, zoom, pan]);

  useEffect(() => {
    const handleTouchMove = (e) => {
      if (isPanning) {
        const touch = e.touches[0];
        setPan({
          x: touch.clientX - panStart.x,
          y: touch.clientY - panStart.y,
        });
      }
    };

    const handleTouchEnd = () => {
      setIsPanning(false);
    };

    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isPanning, panStart]);

  return (
    <div 
      className="relative w-full h-full bg-gray-100 overflow-hidden border-2 border-gray-300 rounded-lg"
      style={{ height: '600px', width: '100%' }}
    >
      {errorMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{errorMessage}</span>
            <span 
              className="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer"
              onClick={() => setErrorMessage(null)}
            >
              <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <title>Close</title>
                <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
              </svg>
            </span>
          </div>
        </div>
      )}
      <svg style={{ width: 0, height: 0 }}>
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#555" />
          </marker>
        </defs>
      </svg>
      <div className="absolute top-4 right-4 z-30 flex gap-2">
        <button 
          onClick={handleZoomIn}
          className="flex items-center justify-center p-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
        >
          <ZoomIn size={16} />
        </button>
        <button 
          onClick={handleZoomOut}
          className="flex items-center justify-center p-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
        >
          <ZoomOut size={16} />
        </button>
        <button 
          onClick={handleRefresh}
          className="flex items-center justify-center p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          <RefreshCw size={16} className="mr-1" />
          Reset
        </button>
      </div>
      <div 
        ref={containerRef}
        className="tree-container"
        style={{ 
          position: 'relative',
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          cursor: isPanning ? 'grabbing' : 'grab',
          transition: 'transform 0.2s ease',
        }}
        onMouseDown={handlePanStart}
        onMouseMove={handlePanMove}
        onMouseUp={handlePanEnd}
        onMouseLeave={handlePanEnd}
        onTouchStart={handlePanStart}
        onTouchMove={handlePanMove}
        onTouchEnd={handlePanEnd}
      >
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
            transformOrigin: '0 0',
          }}
        >
          <svg
            style={{
              position: 'absolute',
              width: '2000px',
              height: '2000px',
              pointerEvents: 'none',
            }}
          >
            {renderConnections()}
          </svg>
          {renderAllNodes()}
        </div>
      </div>
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Add New Sub-Vendor</h3>
            
            {errorMessage && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                <div className="flex justify-between items-center">
                  <span>{errorMessage}</span>
                  <button 
                    onClick={() => setErrorMessage(null)}
                    className="text-red-700 hover:text-red-900"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vendor Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={newVendorData.name}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={newVendorData.email}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={newVendorData.password}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vendor Level
                </label>
                <input
                  type="text"
                  name="vendorLevel"
                  value={newVendorData.vendorLevel}
                  disabled
                  className="w-full p-2 border border-gray-300 rounded bg-gray-100"
                />
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Location Details</h4>
                <div className="space-y-2">
                  <input
                    type="text"
                    name="address"
                    value={newVendorData.location.address}
                    onChange={(e) => handleInputChange(e, 'location')}
                    placeholder="Address"
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                  <input
                    type="text"
                    name="city"
                    value={newVendorData.location.city}
                    onChange={(e) => handleInputChange(e, 'location')}
                    placeholder="City"
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                  <input
                    type="text"
                    name="state"
                    value={newVendorData.location.state}
                    onChange={(e) => handleInputChange(e, 'location')}
                    placeholder="State"
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                  <input
                    type="text"
                    name="country"
                    value={newVendorData.location.country}
                    onChange={(e) => handleInputChange(e, 'location')}
                    placeholder="Country"
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={newVendorData.contact.phone}
                  onChange={(e) => handleInputChange(e, 'contact')}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={addNewNode}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add Vendor
              </button>
            </div>
          </div>
        </div>
      )}
      {showContextMenu && contextMenuNode && (
        <div
          className="context-menu fixed shadow-lg bg-white rounded-md py-2 z-50"
          style={{
            left: `${contextMenuPosition.x}px`,
            top: `${contextMenuPosition.y}px`,
            minWidth: '200px',
          }}
        >
          <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
            View Details
          </div>
          <div 
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
            onClick={handleEditVendor}
          >
            Edit Vendor
          </div>
          <div 
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-red-600"
            onClick={handleDeleteVendor}
          >
            Delete Vendor
          </div>
        </div>
      )}
      {showEditModal && editingVendor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Edit Vendor Permissions</h3>
            <div className="mb-4">
              <div className="font-medium mb-2">{editingVendor.name}</div>
              <div className="text-sm text-gray-600 mb-4">
                {editingVendor.level} • {editingVendor.identity}
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="createVendors"
                  checked={editingPermissions.createVendors}
                  onChange={() => handlePermissionChange('createVendors')}
                  className="mr-2"
                />
                <label htmlFor="createVendors">Create Vendors</label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="processPayments"
                  checked={editingPermissions.processPayments}
                  onChange={() => handlePermissionChange('processPayments')}
                  className="mr-2"
                />
                <label htmlFor="processPayments">Process Payments</label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="vehicleOnboarding"
                  checked={editingPermissions.vehicleOnboarding}
                  onChange={() => handlePermissionChange('vehicleOnboarding')}
                  className="mr-2"
                />
                <label htmlFor="vehicleOnboarding">Vehicle Onboarding</label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="driverOnboarding"
                  checked={editingPermissions.driverOnboarding}
                  onChange={() => handlePermissionChange('driverOnboarding')}
                  className="mr-2"
                />
                <label htmlFor="driverOnboarding">Driver Onboarding</label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="assignVehicle"
                  checked={editingPermissions.assignVehicle}
                  onChange={() => handlePermissionChange('assignVehicle')}
                  className="mr-2"
                />
                <label htmlFor="assignVehicle">Assign Vehicle</label>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePermissions}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VendorHierarchy 