import { useRef, useEffect, useCallback, useState } from "react";
import { useCompositorStore } from "@/lib/compositorStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import type { CompositorNode, NodeSocket, CompositorNodeType, NodeParameterDef } from "@shared/schema";
import { compositorNodeDefinitions } from "@shared/schema";
import {
  Plus,
  Trash2,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronRight,
  Copy,
  Image,
  Layers,
  Palette,
  Blend,
  Wand2,
  Move,
  Filter,
  Settings,
  ZoomIn,
  ZoomOut,
  Maximize,
} from "lucide-react";

// Socket colors by type
const socketColors: Record<string, string> = {
  color: "#fbbf24",    // yellow
  alpha: "#a78bfa",    // purple
  vector: "#60a5fa",   // blue
  value: "#6b7280",    // gray
};

// Node header colors by category
const categoryColors: Record<string, string> = {
  input: "#22c55e",    // green
  output: "#ef4444",   // red
  keying: "#8b5cf6",   // purple
  matte: "#a78bfa",    // light purple
  color: "#f59e0b",    // amber
  mix: "#3b82f6",      // blue
  transform: "#06b6d4", // cyan
  filter: "#ec4899",   // pink
  utility: "#6b7280",  // gray
};

function NodeSocket({ socket, nodeId, isHovered }: { socket: NodeSocket; nodeId: string; isHovered: boolean }) {
  const { startConnecting, stopConnecting, addConnection, isConnecting, connectingFromSocket } = useCompositorStore();
  
  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    startConnecting(nodeId, socket.id, socket.isInput);
  };
  
  const handleMouseUp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isConnecting && connectingFromSocket) {
      // Complete connection if valid
      if (connectingFromSocket.isInput !== socket.isInput) {
        if (socket.isInput) {
          addConnection(connectingFromSocket.nodeId, connectingFromSocket.socketId, nodeId, socket.id);
        } else {
          addConnection(nodeId, socket.id, connectingFromSocket.nodeId, connectingFromSocket.socketId);
        }
      }
      stopConnecting();
    }
  };
  
  const isActive = isConnecting && connectingFromSocket?.socketId === socket.id;
  
  return (
    <div
      className={`flex items-center gap-1.5 py-0.5 ${socket.isInput ? "" : "flex-row-reverse"}`}
      data-testid={`socket-${socket.id}`}
    >
      <div
        className={`w-3 h-3 rounded-full border-2 cursor-crosshair transition-transform ${isActive ? "scale-125" : ""}`}
        style={{
          backgroundColor: isHovered || isActive ? socketColors[socket.type] : "transparent",
          borderColor: socketColors[socket.type],
        }}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      />
      <span className="text-[10px] text-muted-foreground">{socket.name}</span>
    </div>
  );
}

function CompositorNodeComponent({ node }: { node: CompositorNode }) {
  const {
    selectedNodeId,
    selectNode,
    updateNodePosition,
    startDragging,
    stopDragging,
    isDragging,
    draggedNodeId,
    toggleNodeCollapsed,
    toggleNodeMuted,
    viewZoom,
  } = useCompositorStore();
  
  const [isHovered, setIsHovered] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const nodeStartRef = useRef<{ x: number; y: number } | null>(null);
  
  const isSelected = selectedNodeId === node.id;
  const def = compositorNodeDefinitions.find(d => d.type === node.type);
  const headerColor = def ? categoryColors[def.category] : categoryColors.utility;
  
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    selectNode(node.id);
    startDragging(node.id);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    nodeStartRef.current = { ...node.position };
  };
  
  useEffect(() => {
    if (!isDragging || draggedNodeId !== node.id) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragStartRef.current || !nodeStartRef.current) return;
      const dx = (e.clientX - dragStartRef.current.x) / viewZoom;
      const dy = (e.clientY - dragStartRef.current.y) / viewZoom;
      updateNodePosition(node.id, {
        x: nodeStartRef.current.x + dx,
        y: nodeStartRef.current.y + dy,
      });
    };
    
    const handleMouseUp = () => {
      stopDragging();
      dragStartRef.current = null;
      nodeStartRef.current = null;
    };
    
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, draggedNodeId, node.id, viewZoom, updateNodePosition, stopDragging]);
  
  return (
    <div
      className={`absolute select-none ${node.muted ? "opacity-50" : ""}`}
      style={{
        left: node.position.x,
        top: node.position.y,
        width: node.width,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-testid={`node-${node.id}`}
    >
      <Card
        className={`overflow-visible ${isSelected ? "ring-2 ring-primary" : ""}`}
      >
        {/* Header */}
        <div
          className="px-2 py-1 flex items-center gap-1 cursor-move rounded-t-md"
          style={{ backgroundColor: headerColor }}
          onMouseDown={handleMouseDown}
        >
          <button
            className="text-white/80 hover:text-white"
            onClick={(e) => { e.stopPropagation(); toggleNodeCollapsed(node.id); }}
          >
            {node.collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
          <span className="text-xs font-medium text-white flex-1 truncate">{node.name}</span>
          <button
            className="text-white/80 hover:text-white"
            onClick={(e) => { e.stopPropagation(); toggleNodeMuted(node.id); }}
          >
            {node.muted ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
          </button>
        </div>
        
        {/* Content */}
        {!node.collapsed && (
          <div className="p-1.5 bg-card">
            {/* Inputs */}
            <div className="space-y-0.5">
              {node.inputs.map((socket) => (
                <NodeSocket key={socket.id} socket={socket} nodeId={node.id} isHovered={isHovered} />
              ))}
            </div>
            
            {/* Outputs */}
            <div className="space-y-0.5 mt-1">
              {node.outputs.map((socket) => (
                <NodeSocket key={socket.id} socket={socket} nodeId={node.id} isHovered={isHovered} />
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

function ConnectionLine({ connection }: { connection: { fromX: number; fromY: number; toX: number; toY: number; type: string } }) {
  const { fromX, fromY, toX, toY, type } = connection;
  
  // Create a bezier curve
  const dx = toX - fromX;
  const controlOffset = Math.min(Math.abs(dx) * 0.5, 100);
  const path = `M ${fromX} ${fromY} C ${fromX + controlOffset} ${fromY}, ${toX - controlOffset} ${toY}, ${toX} ${toY}`;
  
  return (
    <path
      d={path}
      fill="none"
      stroke={socketColors[type] || "#6b7280"}
      strokeWidth={2}
      className="pointer-events-none"
    />
  );
}

function NodePropertiesPanel() {
  const { selectedNodeId, nodes, setNodeParameter, removeNode, duplicateNode, setNodeAsBackdrop } = useCompositorStore();
  
  const node = nodes.find(n => n.id === selectedNodeId);
  if (!node) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
        Select a node to view properties
      </div>
    );
  }
  
  const def = compositorNodeDefinitions.find(d => d.type === node.type);
  if (!def) return null;
  
  return (
    <ScrollArea className="h-full">
      <div className="p-3 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-medium text-sm">{node.name}</h3>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => duplicateNode(node.id)}>
              <Copy className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeNode(node.id)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        
        {/* Viewer backdrop option */}
        {(node.type === "viewer" || node.type === "composite") && (
          <div className="flex items-center justify-between">
            <Label className="text-xs">Use as Backdrop</Label>
            <Switch
              checked={node.useAsBackdrop}
              onCheckedChange={() => setNodeAsBackdrop(node.id)}
            />
          </div>
        )}
        
        {/* Parameters */}
        {def.parameters.map((param) => (
          <div key={param.name} className="space-y-1.5">
            <Label className="text-xs">{param.label}</Label>
            {param.type === "number" && (
              <div className="flex items-center gap-2">
                <Slider
                  value={[node.parameters[param.name] ?? param.default]}
                  min={param.min ?? 0}
                  max={param.max ?? 100}
                  step={param.step ?? 0.01}
                  onValueChange={([v]) => setNodeParameter(node.id, param.name, v)}
                  className="flex-1"
                />
                <Input
                  type="number"
                  value={node.parameters[param.name] ?? param.default}
                  onChange={(e) => setNodeParameter(node.id, param.name, parseFloat(e.target.value) || 0)}
                  className="w-16 h-7 text-xs"
                />
              </div>
            )}
            {param.type === "color" && (
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={node.parameters[param.name] ?? param.default}
                  onChange={(e) => setNodeParameter(node.id, param.name, e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer"
                />
                <Input
                  value={node.parameters[param.name] ?? param.default}
                  onChange={(e) => setNodeParameter(node.id, param.name, e.target.value)}
                  className="flex-1 h-7 text-xs"
                />
              </div>
            )}
            {param.type === "boolean" && (
              <Switch
                checked={node.parameters[param.name] ?? param.default}
                onCheckedChange={(v) => setNodeParameter(node.id, param.name, v)}
              />
            )}
            {param.type === "enum" && param.options && (
              <Select
                value={node.parameters[param.name] ?? param.default}
                onValueChange={(v) => setNodeParameter(node.id, param.name, v)}
              >
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {param.options.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

const nodeCategories = [
  { id: "input", label: "Input", icon: Image },
  { id: "output", label: "Output", icon: Layers },
  { id: "keying", label: "Keying", icon: Wand2 },
  { id: "matte", label: "Matte", icon: Filter },
  { id: "color", label: "Color", icon: Palette },
  { id: "mix", label: "Mix", icon: Blend },
  { id: "transform", label: "Transform", icon: Move },
  { id: "utility", label: "Utility", icon: Settings },
];

export function NodeEditor() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  
  const {
    nodes,
    connections,
    viewOffset,
    viewZoom,
    pan,
    setViewZoom,
    zoomToFit,
    isPanning,
    startPanning,
    stopPanning,
    addNode,
    selectedNodeId,
    isConnecting,
    connectingFromSocket,
    stopConnecting,
    backdropNodeId,
    loadDemoGraph,
  } = useCompositorStore();
  
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const panStartRef = useRef<{ x: number; y: number; offsetX: number; offsetY: number } | null>(null);
  
  // Handle canvas panning
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      e.preventDefault();
      startPanning();
      panStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        offsetX: viewOffset.x,
        offsetY: viewOffset.y,
      };
    }
  };
  
  useEffect(() => {
    if (!isPanning) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!panStartRef.current) return;
      const dx = e.clientX - panStartRef.current.x;
      const dy = e.clientY - panStartRef.current.y;
      pan(dx - (viewOffset.x - panStartRef.current.offsetX), dy - (viewOffset.y - panStartRef.current.offsetY));
    };
    
    const handleMouseUp = () => {
      stopPanning();
      panStartRef.current = null;
    };
    
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isPanning, pan, stopPanning, viewOffset]);
  
  // Track mouse position for connection preview
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        setMousePos({
          x: (e.clientX - rect.left - viewOffset.x) / viewZoom,
          y: (e.clientY - rect.top - viewOffset.y) / viewZoom,
        });
      }
    };
    
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [viewOffset, viewZoom]);
  
  // Cancel connection on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isConnecting) {
        stopConnecting();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isConnecting, stopConnecting]);
  
  // Handle zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setViewZoom(viewZoom * delta);
  };
  
  // Calculate connection positions
  const getSocketPosition = (nodeId: string, socketId: string): { x: number; y: number } | null => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return null;
    
    const socket = [...node.inputs, ...node.outputs].find(s => s.id === socketId);
    if (!socket) return null;
    
    const socketIndex = socket.isInput
      ? node.inputs.findIndex(s => s.id === socketId)
      : node.outputs.findIndex(s => s.id === socketId);
    
    const headerHeight = 24;
    const socketHeight = 16;
    const inputsHeight = node.inputs.length * socketHeight;
    
    const y = node.position.y + headerHeight + 6 + 
      (socket.isInput ? socketIndex * socketHeight : inputsHeight + 4 + socketIndex * socketHeight) + 8;
    const x = socket.isInput ? node.position.x : node.position.x + node.width;
    
    return { x, y };
  };
  
  const connectionLines = connections.map(conn => {
    const fromPos = getSocketPosition(conn.fromNodeId, conn.fromSocketId);
    const toPos = getSocketPosition(conn.toNodeId, conn.toSocketId);
    if (!fromPos || !toPos) return null;
    
    const fromNode = nodes.find(n => n.id === conn.fromNodeId);
    const socket = fromNode?.outputs.find(s => s.id === conn.fromSocketId);
    
    return {
      id: conn.id,
      fromX: fromPos.x,
      fromY: fromPos.y,
      toX: toPos.x,
      toY: toPos.y,
      type: socket?.type || "color",
    };
  }).filter(Boolean);
  
  // Connection preview
  const connectionPreview = isConnecting && connectingFromSocket ? (() => {
    const pos = getSocketPosition(connectingFromSocket.nodeId, connectingFromSocket.socketId);
    if (!pos) return null;
    
    const node = nodes.find(n => n.id === connectingFromSocket.nodeId);
    const socket = node ? [...node.inputs, ...node.outputs].find(s => s.id === connectingFromSocket.socketId) : null;
    
    return {
      fromX: connectingFromSocket.isInput ? mousePos.x : pos.x,
      fromY: connectingFromSocket.isInput ? mousePos.y : pos.y,
      toX: connectingFromSocket.isInput ? pos.x : mousePos.x,
      toY: connectingFromSocket.isInput ? pos.y : mousePos.y,
      type: socket?.type || "color",
    };
  })() : null;
  
  const handleAddNode = (type: CompositorNodeType) => {
    addNode(type, { x: 400 - viewOffset.x, y: 300 - viewOffset.y });
  };
  
  return (
    <div className="h-full flex" data-testid="node-editor">
      {/* Canvas */}
      <div className="flex-1 relative overflow-hidden bg-muted/30">
        {/* Toolbar */}
        <div className="absolute top-2 left-2 z-10 flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="sm" className="h-7 text-xs gap-1">
                <Plus className="h-3.5 w-3.5" />
                Add
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {nodeCategories.map(cat => (
                <DropdownMenuSub key={cat.id}>
                  <DropdownMenuSubTrigger>
                    <cat.icon className="h-3.5 w-3.5 mr-2" />
                    {cat.label}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    {compositorNodeDefinitions
                      .filter(def => def.category === cat.id)
                      .map(def => (
                        <DropdownMenuItem key={def.type} onClick={() => handleAddNode(def.type)}>
                          {def.label}
                        </DropdownMenuItem>
                      ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={loadDemoGraph}>
                Load Demo Setup
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setViewZoom(viewZoom * 1.2)}>
            <ZoomIn className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setViewZoom(viewZoom * 0.8)}>
            <ZoomOut className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={zoomToFit}>
            <Maximize className="h-3.5 w-3.5" />
          </Button>
          
          <span className="text-xs text-muted-foreground ml-2">{Math.round(viewZoom * 100)}%</span>
        </div>
        
        {/* Backdrop preview */}
        {backdropNodeId && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
            <div className="w-64 h-48 bg-gradient-to-br from-blue-500 to-purple-600 rounded" />
          </div>
        )}
        
        {/* Canvas container */}
        <div
          ref={canvasRef}
          className={`w-full h-full ${isPanning ? "cursor-grabbing" : "cursor-default"}`}
          onMouseDown={handleCanvasMouseDown}
          onWheel={handleWheel}
          onClick={() => { if (!isConnecting) stopConnecting(); }}
        >
          {/* Grid pattern */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <defs>
              <pattern
                id="grid"
                width={20 * viewZoom}
                height={20 * viewZoom}
                patternUnits="userSpaceOnUse"
                x={viewOffset.x % (20 * viewZoom)}
                y={viewOffset.y % (20 * viewZoom)}
              >
                <circle cx={1} cy={1} r={1} fill="currentColor" className="text-border" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
          
          {/* Connections SVG */}
          <svg
            ref={svgRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{
              transform: `translate(${viewOffset.x}px, ${viewOffset.y}px) scale(${viewZoom})`,
              transformOrigin: "0 0",
            }}
          >
            {connectionLines.map((conn) => conn && (
              <ConnectionLine key={conn.id} connection={conn} />
            ))}
            {connectionPreview && (
              <ConnectionLine connection={{ ...connectionPreview, id: "preview" } as any} />
            )}
          </svg>
          
          {/* Nodes container */}
          <div
            className="absolute"
            style={{
              transform: `translate(${viewOffset.x}px, ${viewOffset.y}px) scale(${viewZoom})`,
              transformOrigin: "0 0",
            }}
          >
            {nodes.map((node) => (
              <CompositorNodeComponent key={node.id} node={node} />
            ))}
          </div>
        </div>
      </div>
      
      {/* Properties panel */}
      <div className="w-56 border-l border-border bg-card">
        <div className="p-2 border-b border-border">
          <span className="text-xs font-medium">Properties</span>
        </div>
        <NodePropertiesPanel />
      </div>
    </div>
  );
}
