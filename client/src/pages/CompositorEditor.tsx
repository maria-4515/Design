import { useEffect } from "react";
import { NodeEditor } from "@/components/NodeEditor";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Box,
  Film,
  Layers,
  Save,
  FolderOpen,
  Download,
  Undo2,
  Redo2,
  Play,
  RefreshCw,
} from "lucide-react";
import { Link } from "wouter";
import { useCompositorStore } from "@/lib/compositorStore";

export default function CompositorEditor() {
  const { loadDemoGraph, nodes } = useCompositorStore();
  
  // Load demo graph if empty
  useEffect(() => {
    if (nodes.length === 0) {
      loadDemoGraph();
    }
  }, []);
  
  return (
    <div className="h-screen w-screen flex flex-col bg-background overflow-hidden" data-testid="compositor-editor">
      {/* Toolbar */}
      <div className="h-10 flex items-center gap-2 px-3 border-b border-border bg-card">
        {/* Logo / Home */}
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-1.5">
            <Layers className="h-4 w-4" />
            <span className="font-semibold text-sm">Compositor</span>
          </Button>
        </Link>
        
        <div className="w-px h-5 bg-border" />
        
        {/* Mode switcher */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href="/3d">
              <Button variant="ghost" size="icon" data-testid="switch-to-3d">
                <Box className="h-4 w-4" />
              </Button>
            </Link>
          </TooltipTrigger>
          <TooltipContent>3D Editor</TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href="/video">
              <Button variant="ghost" size="icon" data-testid="switch-to-video">
                <Film className="h-4 w-4" />
              </Button>
            </Link>
          </TooltipTrigger>
          <TooltipContent>Video Editor</TooltipContent>
        </Tooltip>
        
        <div className="w-px h-5 bg-border" />
        
        {/* File actions */}
        <Button variant="ghost" size="icon" data-testid="new-project">
          <FolderOpen className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" data-testid="save-project">
          <Save className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" data-testid="export">
          <Download className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-5 bg-border" />
        
        {/* Undo/Redo */}
        <Button variant="ghost" size="icon" data-testid="undo">
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" data-testid="redo">
          <Redo2 className="h-4 w-4" />
        </Button>
        
        <div className="flex-1" />
        
        {/* Render actions */}
        <Button variant="ghost" size="sm" className="gap-1.5 text-xs" data-testid="refresh-preview">
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
        <Button variant="default" size="sm" className="gap-1.5 text-xs" data-testid="render">
          <Play className="h-3.5 w-3.5" />
          Render
        </Button>
      </div>
      
      {/* Main content - Node Editor */}
      <div className="flex-1 overflow-hidden">
        <NodeEditor />
      </div>
    </div>
  );
}
