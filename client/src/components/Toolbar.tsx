import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { useEditorStore } from "@/lib/store";
import { exportSceneToGLTF } from "@/lib/export";
import { useToast } from "@/hooks/use-toast";
import type { ObjectType, ToolType, EditModeType } from "@shared/schema";
import { useCreateScene, useUpdateScene } from "@/hooks/use-scenes";
import { SceneManager } from "./SceneManager";
import {
  MousePointer2,
  Move,
  RotateCcw,
  Maximize2,
  Box,
  Circle,
  Cylinder,
  Square,
  Triangle,
  Donut,
  Plus,
  Download,
  FileDown,
  Trash2,
  Copy,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ChevronDown,
  Save,
  FilePlus,
  Undo2,
  Redo2,
  Lightbulb,
  Sun,
  Flashlight,
  SunDim,
  Hexagon,
  GitCommitHorizontal,
  Grid3x3,
} from "lucide-react";
import { useHistoryStore } from "@/lib/history";

const toolItems: { id: ToolType; icon: typeof MousePointer2; label: string; shortcut: string }[] = [
  { id: "select", icon: MousePointer2, label: "Select", shortcut: "Q" },
  { id: "translate", icon: Move, label: "Move", shortcut: "W" },
  { id: "rotate", icon: RotateCcw, label: "Rotate", shortcut: "E" },
  { id: "scale", icon: Maximize2, label: "Scale", shortcut: "R" },
];

const primitiveItems: { id: ObjectType; icon: typeof Box; label: string }[] = [
  { id: "cube", icon: Box, label: "Cube" },
  { id: "sphere", icon: Circle, label: "Sphere" },
  { id: "cylinder", icon: Cylinder, label: "Cylinder" },
  { id: "plane", icon: Square, label: "Plane" },
  { id: "cone", icon: Triangle, label: "Cone" },
  { id: "torus", icon: Donut, label: "Torus" },
];

const lightItems: { id: ObjectType; icon: typeof Lightbulb; label: string }[] = [
  { id: "pointLight", icon: Lightbulb, label: "Point Light" },
  { id: "directionalLight", icon: Sun, label: "Directional Light" },
  { id: "spotLight", icon: Flashlight, label: "Spot Light" },
  { id: "ambientLight", icon: SunDim, label: "Ambient Light" },
];

const editModeItems: { id: EditModeType; icon: typeof Box; label: string; shortcut: string }[] = [
  { id: "object", icon: Box, label: "Object Mode", shortcut: "1" },
  { id: "vertex", icon: GitCommitHorizontal, label: "Vertex Mode", shortcut: "2" },
];

function ToolButton({ 
  tool, 
  isActive, 
  onClick 
}: { 
  tool: typeof toolItems[0]; 
  isActive: boolean; 
  onClick: () => void;
}) {
  const Icon = tool.icon;
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={isActive ? "secondary" : "ghost"}
          size="icon"
          onClick={onClick}
          className={isActive ? "bg-accent text-accent-foreground" : ""}
          data-testid={`tool-${tool.id}`}
        >
          <Icon className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="flex items-center gap-2">
        <span>{tool.label}</span>
        <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">{tool.shortcut}</kbd>
      </TooltipContent>
    </Tooltip>
  );
}

function EditModeButton({ 
  mode, 
  isActive, 
  onClick 
}: { 
  mode: typeof editModeItems[0]; 
  isActive: boolean; 
  onClick: () => void;
}) {
  const Icon = mode.icon;
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={isActive ? "secondary" : "ghost"}
          size="icon"
          onClick={onClick}
          className={isActive ? "bg-accent text-accent-foreground" : ""}
          data-testid={`editmode-${mode.id}`}
        >
          <Icon className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="flex items-center gap-2">
        <span>{mode.label}</span>
        <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">{mode.shortcut}</kbd>
      </TooltipContent>
    </Tooltip>
  );
}

export function Toolbar() {
  const {
    activeTool,
    setActiveTool,
    addObject,
    selectedObjectId,
    removeObject,
    duplicateObject,
    isPlaying,
    togglePlayback,
    currentFrame,
    totalFrames,
    fps,
    setCurrentFrame,
    sceneName,
    objects,
    clearScene,
    sceneId,
    setSceneId,
    markClean,
    isDirty,
    undo,
    redo,
    editMode,
    setEditMode,
  } = useEditorStore();
  const { canUndo, canRedo } = useHistoryStore();
  const { toast } = useToast();
  const createScene = useCreateScene();
  const updateScene = useUpdateScene();
  
  const handleSave = async () => {
    try {
      if (sceneId) {
        await updateScene.mutateAsync({
          id: sceneId,
          name: sceneName,
          objects,
          currentFrame,
          totalFrames,
          fps,
        });
        markClean();
        toast({
          title: "Scene updated",
          description: "Your changes have been saved.",
        });
      } else {
        const newScene = await createScene.mutateAsync({
          name: sceneName,
          objects,
          currentFrame,
          totalFrames,
          fps,
        });
        setSceneId(newScene.id);
        markClean();
        toast({
          title: "Scene saved",
          description: "Your scene has been saved successfully.",
        });
      }
    } catch (error) {
      toast({
        title: "Save failed",
        description: "An error occurred while saving the scene.",
        variant: "destructive",
      });
    }
  };
  
  const handleNew = () => {
    clearScene();
    toast({
      title: "New scene",
      description: "Created a new empty scene.",
    });
  };
  
  const handleExport = async (binary: boolean) => {
    if (objects.length === 0) {
      toast({
        title: "No objects to export",
        description: "Add some objects to your scene first.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await exportSceneToGLTF(objects, sceneName.replace(/\s+/g, "_"), binary);
      toast({
        title: "Export successful",
        description: `Scene exported as ${binary ? "GLB" : "GLTF"} file.`,
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "An error occurred while exporting the scene.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div 
      className="h-12 border-b border-border bg-card flex items-center px-2 gap-1"
      data-testid="toolbar"
    >
      {/* File actions */}
      <div className="flex items-center gap-0.5">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNew}
              data-testid="new-scene"
            >
              <FilePlus className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">New Scene</TooltipContent>
        </Tooltip>
        
        <SceneManager />
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSave}
              disabled={createScene.isPending || updateScene.isPending}
              data-testid="save-scene"
            >
              <Save className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Save Scene (Ctrl+S)</TooltipContent>
        </Tooltip>
      </div>
      
      <Separator orientation="vertical" className="h-6 mx-1" />
      
      {/* Undo/Redo */}
      <div className="flex items-center gap-0.5">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={undo}
              disabled={!canUndo()}
              data-testid="undo"
            >
              <Undo2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="flex items-center gap-2">
            <span>Undo</span>
            <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">Ctrl+Z</kbd>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={redo}
              disabled={!canRedo()}
              data-testid="redo"
            >
              <Redo2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="flex items-center gap-2">
            <span>Redo</span>
            <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">Ctrl+Y</kbd>
          </TooltipContent>
        </Tooltip>
      </div>
      
      <Separator orientation="vertical" className="h-6 mx-1" />
      
      {/* Scene name */}
      <div className="flex items-center gap-2 px-2">
        <span className="text-sm font-medium text-foreground truncate max-w-[140px]" data-testid="scene-name">
          {sceneName}{isDirty ? " *" : ""}
        </span>
      </div>
      
      <Separator orientation="vertical" className="h-6 mx-1" />
      
      {/* Transform tools */}
      <div className="flex items-center gap-0.5">
        {toolItems.map((tool) => (
          <ToolButton
            key={tool.id}
            tool={tool}
            isActive={activeTool === tool.id}
            onClick={() => setActiveTool(tool.id)}
          />
        ))}
      </div>
      
      <Separator orientation="vertical" className="h-6 mx-1" />
      
      {/* Edit mode toggle */}
      <div className="flex items-center gap-0.5">
        {editModeItems.map((mode) => (
          <EditModeButton
            key={mode.id}
            mode={mode}
            isActive={editMode === mode.id}
            onClick={() => setEditMode(mode.id)}
          />
        ))}
      </div>
      
      <Separator orientation="vertical" className="h-6 mx-1" />
      
      {/* Add primitive dropdown */}
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="default" className="gap-1" data-testid="add-object-menu">
                <Plus className="h-4 w-4" />
                <span className="text-xs">Add</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">Add 3D Object</TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="start">
          {primitiveItems.map((item) => {
            const Icon = item.icon;
            return (
              <DropdownMenuItem
                key={item.id}
                onClick={() => addObject(item.id)}
                className="gap-2"
                data-testid={`add-${item.id}`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </DropdownMenuItem>
            );
          })}
          <DropdownMenuSeparator />
          {lightItems.map((item) => {
            const Icon = item.icon;
            return (
              <DropdownMenuItem
                key={item.id}
                onClick={() => addObject(item.id)}
                className="gap-2"
                data-testid={`add-${item.id}`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Object actions */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            disabled={!selectedObjectId}
            onClick={() => selectedObjectId && duplicateObject(selectedObjectId)}
            data-testid="duplicate-object"
          >
            <Copy className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">Duplicate (Ctrl+D)</TooltipContent>
      </Tooltip>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            disabled={!selectedObjectId}
            onClick={() => selectedObjectId && removeObject(selectedObjectId)}
            data-testid="delete-object"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">Delete (Del)</TooltipContent>
      </Tooltip>
      
      <Separator orientation="vertical" className="h-6 mx-1" />
      
      {/* Playback controls */}
      <div className="flex items-center gap-0.5">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentFrame(0)}
              data-testid="go-to-start"
            >
              <SkipBack className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Go to Start</TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePlayback}
              data-testid="toggle-playback"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">{isPlaying ? "Pause" : "Play"} (Space)</TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentFrame(totalFrames - 1)}
              data-testid="go-to-end"
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Go to End</TooltipContent>
        </Tooltip>
        
        <div className="ml-2 px-2 py-1 bg-muted rounded text-xs font-mono">
          <span data-testid="frame-counter">{String(currentFrame + 1).padStart(4, "0")}</span>
          <span className="text-muted-foreground"> / {totalFrames}</span>
        </div>
      </div>
      
      {/* Spacer */}
      <div className="flex-1" />
      
      {/* Export */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="default" className="gap-1" data-testid="export-menu">
            <Download className="h-4 w-4" />
            <span className="text-xs">Export</span>
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleExport(false)} className="gap-2" data-testid="export-gltf">
            <FileDown className="h-4 w-4" />
            <span>Export as GLTF</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport(true)} className="gap-2" data-testid="export-glb">
            <FileDown className="h-4 w-4" />
            <span>Export as GLB</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
