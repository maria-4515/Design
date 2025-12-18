import { Viewport } from "@/components/Viewport";
import { Toolbar } from "@/components/Toolbar";
import { HierarchyPanel } from "@/components/HierarchyPanel";
import { PropertiesPanel } from "@/components/PropertiesPanel";
import { Timeline } from "@/components/Timeline";
import { useEditorStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  PanelBottomClose,
  PanelBottomOpen,
} from "lucide-react";
import { useEffect } from "react";

export default function Editor() {
  const {
    leftPanelOpen,
    rightPanelOpen,
    bottomPanelOpen,
    toggleLeftPanel,
    toggleRightPanel,
    toggleBottomPanel,
    setActiveTool,
    addObject,
    selectedObjectId,
    duplicateObject,
    removeObject,
    undo,
    redo,
  } = useEditorStore();
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      // Tool shortcuts
      switch (e.key.toLowerCase()) {
        case "q":
          setActiveTool("select");
          break;
        case "w":
          setActiveTool("translate");
          break;
        case "e":
          setActiveTool("rotate");
          break;
        case "r":
          setActiveTool("scale");
          break;
      }
      
      // Object shortcuts
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedObjectId) {
          e.preventDefault();
          removeObject(selectedObjectId);
        }
      }
      
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case "d":
            if (selectedObjectId) {
              e.preventDefault();
              duplicateObject(selectedObjectId);
            }
            break;
          case "z":
            e.preventDefault();
            undo();
            break;
          case "y":
            e.preventDefault();
            redo();
            break;
        }
      }
      
      // Quick add shortcuts with Shift
      if (e.shiftKey) {
        switch (e.key.toLowerCase()) {
          case "a":
            e.preventDefault();
            addObject("cube");
            break;
        }
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setActiveTool, selectedObjectId, duplicateObject, removeObject, addObject, undo, redo]);
  
  return (
    <div className="h-screen w-screen flex flex-col bg-background overflow-hidden" data-testid="editor">
      {/* Toolbar */}
      <Toolbar />
      
      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left panel (Hierarchy) */}
        {leftPanelOpen && (
          <div className="w-64 flex-shrink-0">
            <HierarchyPanel />
          </div>
        )}
        
        {/* Center (Viewport + Timeline) */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* Panel toggle buttons */}
          <div className="absolute top-2 left-2 z-10 flex gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-7 w-7 bg-card/80 backdrop-blur"
                  onClick={toggleLeftPanel}
                  data-testid="toggle-left-panel"
                >
                  {leftPanelOpen ? (
                    <PanelLeftClose className="h-3.5 w-3.5" />
                  ) : (
                    <PanelLeftOpen className="h-3.5 w-3.5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Toggle Hierarchy</TooltipContent>
            </Tooltip>
          </div>
          
          <div className="absolute top-2 right-2 z-10 flex gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-7 w-7 bg-card/80 backdrop-blur"
                  onClick={toggleRightPanel}
                  data-testid="toggle-right-panel"
                >
                  {rightPanelOpen ? (
                    <PanelRightClose className="h-3.5 w-3.5" />
                  ) : (
                    <PanelRightOpen className="h-3.5 w-3.5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Toggle Properties</TooltipContent>
            </Tooltip>
          </div>
          
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-7 w-7 bg-card/80 backdrop-blur"
                  onClick={toggleBottomPanel}
                  data-testid="toggle-bottom-panel"
                >
                  {bottomPanelOpen ? (
                    <PanelBottomClose className="h-3.5 w-3.5" />
                  ) : (
                    <PanelBottomOpen className="h-3.5 w-3.5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Toggle Timeline</TooltipContent>
            </Tooltip>
          </div>
          
          {/* Viewport */}
          <div className="flex-1 overflow-hidden">
            <Viewport />
          </div>
          
          {/* Timeline */}
          {bottomPanelOpen && (
            <div className="h-48 flex-shrink-0">
              <Timeline />
            </div>
          )}
        </div>
        
        {/* Right panel (Properties) */}
        {rightPanelOpen && (
          <div className="w-72 flex-shrink-0">
            <PropertiesPanel />
          </div>
        )}
      </div>
    </div>
  );
}
