import { create } from "zustand";
import type {
  CompositorNode,
  NodeConnection,
  CompositorNodeType,
  CompositorGraph,
} from "@shared/schema";
import { createCompositorNode, generateConnectionId } from "@shared/schema";

interface CompositorState {
  // Graph data
  nodes: CompositorNode[];
  connections: NodeConnection[];
  
  // Selection
  selectedNodeId: string | null;
  selectedConnectionId: string | null;
  
  // View state
  viewOffset: { x: number; y: number };
  viewZoom: number;
  
  // Backdrop
  backdropNodeId: string | null;
  backdropZoom: number;
  backdropOffset: { x: number; y: number };
  
  // Dragging state
  isDragging: boolean;
  draggedNodeId: string | null;
  isPanning: boolean;
  isConnecting: boolean;
  connectingFromSocket: { nodeId: string; socketId: string; isInput: boolean } | null;
  
  // Actions
  addNode: (type: CompositorNodeType, position: { x: number; y: number }) => void;
  removeNode: (nodeId: string) => void;
  updateNode: (nodeId: string, updates: Partial<CompositorNode>) => void;
  updateNodePosition: (nodeId: string, position: { x: number; y: number }) => void;
  setNodeParameter: (nodeId: string, paramName: string, value: any) => void;
  duplicateNode: (nodeId: string) => void;
  
  // Connections
  addConnection: (fromNodeId: string, fromSocketId: string, toNodeId: string, toSocketId: string) => void;
  removeConnection: (connectionId: string) => void;
  removeConnectionsForNode: (nodeId: string) => void;
  
  // Selection
  selectNode: (nodeId: string | null) => void;
  selectConnection: (connectionId: string | null) => void;
  
  // View
  setViewOffset: (offset: { x: number; y: number }) => void;
  setViewZoom: (zoom: number) => void;
  pan: (dx: number, dy: number) => void;
  zoomToFit: () => void;
  
  // Backdrop
  setBackdropNode: (nodeId: string | null) => void;
  setBackdropZoom: (zoom: number) => void;
  setBackdropOffset: (offset: { x: number; y: number }) => void;
  
  // Dragging
  startDragging: (nodeId: string) => void;
  stopDragging: () => void;
  startPanning: () => void;
  stopPanning: () => void;
  startConnecting: (nodeId: string, socketId: string, isInput: boolean) => void;
  stopConnecting: () => void;
  
  // Node state
  toggleNodeMuted: (nodeId: string) => void;
  toggleNodeCollapsed: (nodeId: string) => void;
  setNodeAsBackdrop: (nodeId: string) => void;
  
  // Graph management
  clearGraph: () => void;
  loadGraph: (graph: CompositorGraph) => void;
  getGraph: () => CompositorGraph;
  
  // Demo data
  loadDemoGraph: () => void;
}

export const useCompositorStore = create<CompositorState>((set, get) => ({
  nodes: [],
  connections: [],
  selectedNodeId: null,
  selectedConnectionId: null,
  viewOffset: { x: 0, y: 0 },
  viewZoom: 1,
  backdropNodeId: null,
  backdropZoom: 1,
  backdropOffset: { x: 0, y: 0 },
  isDragging: false,
  draggedNodeId: null,
  isPanning: false,
  isConnecting: false,
  connectingFromSocket: null,
  
  addNode: (type, position) => {
    const node = createCompositorNode(type, position);
    set((state) => ({
      nodes: [...state.nodes, node],
      selectedNodeId: node.id,
    }));
  },
  
  removeNode: (nodeId) => {
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== nodeId),
      connections: state.connections.filter(
        (c) => c.fromNodeId !== nodeId && c.toNodeId !== nodeId
      ),
      selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId,
      backdropNodeId: state.backdropNodeId === nodeId ? null : state.backdropNodeId,
    }));
  },
  
  updateNode: (nodeId, updates) => {
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === nodeId ? { ...n, ...updates } : n
      ),
    }));
  },
  
  updateNodePosition: (nodeId, position) => {
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === nodeId ? { ...n, position } : n
      ),
    }));
  },
  
  setNodeParameter: (nodeId, paramName, value) => {
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === nodeId
          ? { ...n, parameters: { ...n.parameters, [paramName]: value } }
          : n
      ),
    }));
  },
  
  duplicateNode: (nodeId) => {
    const state = get();
    const node = state.nodes.find((n) => n.id === nodeId);
    if (!node) return;
    
    const newNode = createCompositorNode(node.type, {
      x: node.position.x + 50,
      y: node.position.y + 50,
    });
    newNode.parameters = { ...node.parameters };
    
    set((state) => ({
      nodes: [...state.nodes, newNode],
      selectedNodeId: newNode.id,
    }));
  },
  
  addConnection: (fromNodeId, fromSocketId, toNodeId, toSocketId) => {
    const state = get();
    
    // Check if connection already exists
    const exists = state.connections.some(
      (c) =>
        c.fromNodeId === fromNodeId &&
        c.fromSocketId === fromSocketId &&
        c.toNodeId === toNodeId &&
        c.toSocketId === toSocketId
    );
    if (exists) return;
    
    // Remove any existing connection to the same input socket
    const filteredConnections = state.connections.filter(
      (c) => !(c.toNodeId === toNodeId && c.toSocketId === toSocketId)
    );
    
    const connection: NodeConnection = {
      id: generateConnectionId(),
      fromNodeId,
      fromSocketId,
      toNodeId,
      toSocketId,
    };
    
    set({ connections: [...filteredConnections, connection] });
  },
  
  removeConnection: (connectionId) => {
    set((state) => ({
      connections: state.connections.filter((c) => c.id !== connectionId),
      selectedConnectionId:
        state.selectedConnectionId === connectionId ? null : state.selectedConnectionId,
    }));
  },
  
  removeConnectionsForNode: (nodeId) => {
    set((state) => ({
      connections: state.connections.filter(
        (c) => c.fromNodeId !== nodeId && c.toNodeId !== nodeId
      ),
    }));
  },
  
  selectNode: (nodeId) => {
    set({ selectedNodeId: nodeId, selectedConnectionId: null });
  },
  
  selectConnection: (connectionId) => {
    set({ selectedConnectionId: connectionId, selectedNodeId: null });
  },
  
  setViewOffset: (offset) => {
    set({ viewOffset: offset });
  },
  
  setViewZoom: (zoom) => {
    set({ viewZoom: Math.max(0.1, Math.min(4, zoom)) });
  },
  
  pan: (dx, dy) => {
    set((state) => ({
      viewOffset: {
        x: state.viewOffset.x + dx,
        y: state.viewOffset.y + dy,
      },
    }));
  },
  
  zoomToFit: () => {
    const state = get();
    if (state.nodes.length === 0) return;
    
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    state.nodes.forEach((node) => {
      minX = Math.min(minX, node.position.x);
      minY = Math.min(minY, node.position.y);
      maxX = Math.max(maxX, node.position.x + node.width);
      maxY = Math.max(maxY, node.position.y + 100);
    });
    
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    
    set({
      viewOffset: { x: -centerX + 400, y: -centerY + 300 },
      viewZoom: 1,
    });
  },
  
  setBackdropNode: (nodeId) => {
    set({ backdropNodeId: nodeId });
  },
  
  setBackdropZoom: (zoom) => {
    set({ backdropZoom: Math.max(0.1, Math.min(4, zoom)) });
  },
  
  setBackdropOffset: (offset) => {
    set({ backdropOffset: offset });
  },
  
  startDragging: (nodeId) => {
    set({ isDragging: true, draggedNodeId: nodeId });
  },
  
  stopDragging: () => {
    set({ isDragging: false, draggedNodeId: null });
  },
  
  startPanning: () => {
    set({ isPanning: true });
  },
  
  stopPanning: () => {
    set({ isPanning: false });
  },
  
  startConnecting: (nodeId, socketId, isInput) => {
    set({
      isConnecting: true,
      connectingFromSocket: { nodeId, socketId, isInput },
    });
  },
  
  stopConnecting: () => {
    set({ isConnecting: false, connectingFromSocket: null });
  },
  
  toggleNodeMuted: (nodeId) => {
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === nodeId ? { ...n, muted: !n.muted } : n
      ),
    }));
  },
  
  toggleNodeCollapsed: (nodeId) => {
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === nodeId ? { ...n, collapsed: !n.collapsed } : n
      ),
    }));
  },
  
  setNodeAsBackdrop: (nodeId) => {
    const state = get();
    const node = state.nodes.find((n) => n.id === nodeId);
    if (node && (node.type === "viewer" || node.type === "composite")) {
      set({
        nodes: state.nodes.map((n) => ({
          ...n,
          useAsBackdrop: n.id === nodeId,
        })),
        backdropNodeId: nodeId,
      });
    }
  },
  
  clearGraph: () => {
    set({
      nodes: [],
      connections: [],
      selectedNodeId: null,
      selectedConnectionId: null,
      backdropNodeId: null,
    });
  },
  
  loadGraph: (graph) => {
    set({
      nodes: graph.nodes,
      connections: graph.connections,
      backdropNodeId: graph.backdropNodeId,
      backdropZoom: graph.backdropZoom,
      backdropOffset: graph.backdropOffset,
      viewOffset: graph.viewOffset,
      viewZoom: graph.viewZoom,
      selectedNodeId: null,
      selectedConnectionId: null,
    });
  },
  
  getGraph: () => {
    const state = get();
    return {
      id: `graph_${Date.now()}`,
      name: "Compositor",
      nodes: state.nodes,
      connections: state.connections,
      backdropNodeId: state.backdropNodeId,
      backdropZoom: state.backdropZoom,
      backdropOffset: state.backdropOffset,
      viewOffset: state.viewOffset,
      viewZoom: state.viewZoom,
    };
  },
  
  loadDemoGraph: () => {
    // Create a demo compositing setup
    const renderNode = createCompositorNode("render", { x: 100, y: 200 });
    const chromaKeyNode = createCompositorNode("chromaKey", { x: 350, y: 150 });
    const colorCorrNode = createCompositorNode("colorCorrection", { x: 350, y: 350 });
    const alphaOverNode = createCompositorNode("alphaOver", { x: 600, y: 250 });
    const compositeNode = createCompositorNode("composite", { x: 850, y: 200 });
    const viewerNode = createCompositorNode("viewer", { x: 850, y: 350 });
    
    const connections: NodeConnection[] = [
      {
        id: generateConnectionId(),
        fromNodeId: renderNode.id,
        fromSocketId: renderNode.outputs[0].id,
        toNodeId: chromaKeyNode.id,
        toSocketId: chromaKeyNode.inputs[0].id,
      },
      {
        id: generateConnectionId(),
        fromNodeId: renderNode.id,
        fromSocketId: renderNode.outputs[0].id,
        toNodeId: colorCorrNode.id,
        toSocketId: colorCorrNode.inputs[0].id,
      },
      {
        id: generateConnectionId(),
        fromNodeId: colorCorrNode.id,
        fromSocketId: colorCorrNode.outputs[0].id,
        toNodeId: alphaOverNode.id,
        toSocketId: alphaOverNode.inputs[0].id,
      },
      {
        id: generateConnectionId(),
        fromNodeId: chromaKeyNode.id,
        fromSocketId: chromaKeyNode.outputs[0].id,
        toNodeId: alphaOverNode.id,
        toSocketId: alphaOverNode.inputs[1].id,
      },
      {
        id: generateConnectionId(),
        fromNodeId: alphaOverNode.id,
        fromSocketId: alphaOverNode.outputs[0].id,
        toNodeId: compositeNode.id,
        toSocketId: compositeNode.inputs[0].id,
      },
      {
        id: generateConnectionId(),
        fromNodeId: alphaOverNode.id,
        fromSocketId: alphaOverNode.outputs[0].id,
        toNodeId: viewerNode.id,
        toSocketId: viewerNode.inputs[0].id,
      },
    ];
    
    set({
      nodes: [renderNode, chromaKeyNode, colorCorrNode, alphaOverNode, compositeNode, viewerNode],
      connections,
      selectedNodeId: null,
      backdropNodeId: viewerNode.id,
    });
  },
}));
