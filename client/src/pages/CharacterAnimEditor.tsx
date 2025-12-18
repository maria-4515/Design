import { useCharacterAnimStore } from "@/lib/characterAnimStore";
import { PoseEditor } from "@/components/PoseEditor";
import { NlaEditor } from "@/components/NlaEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Link, useLocation } from "wouter";
import {
  Box,
  Film,
  Hexagon,
  User,
  Layers,
  PenTool,
  Plus,
  Trash2,
  Play,
  Settings,
} from "lucide-react";
import { useState } from "react";

function ActionEditor() {
  const {
    actions,
    selectedActionId,
    createAction,
    selectAction,
    deleteAction,
    skeleton,
    selectedBoneId,
    nlaCurrentFrame,
    addKeyframeToBone,
    removeKeyframeFromBone,
  } = useCharacterAnimStore();
  
  const [newActionName, setNewActionName] = useState("");
  
  const handleCreate = () => {
    if (newActionName.trim()) {
      createAction(newActionName.trim());
      setNewActionName("");
    }
  };
  
  const selectedAction = actions.find(a => a.id === selectedActionId);
  
  return (
    <div className="h-full flex flex-col" data-testid="action-editor">
      {/* Actions list */}
      <div className="p-2 border-b border-border">
        <div className="flex items-center gap-2 mb-2">
          <Input
            placeholder="New action name..."
            value={newActionName}
            onChange={(e) => setNewActionName(e.target.value)}
            className="h-7 text-xs flex-1"
          />
          <Button variant="outline" size="sm" onClick={handleCreate} disabled={!newActionName.trim()}>
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
        
        <ScrollArea className="h-24">
          <div className="space-y-1">
            {actions.map(action => (
              <div
                key={action.id}
                className={`flex items-center gap-2 p-1.5 rounded cursor-pointer text-xs ${
                  selectedActionId === action.id ? "bg-primary/20 text-primary" : "hover-elevate"
                }`}
                onClick={() => selectAction(action.id)}
                data-testid={`select-action-${action.id}`}
              >
                <Film className="h-3.5 w-3.5" />
                <span className="flex-1 truncate">{action.name}</span>
                <span className="text-[10px] text-muted-foreground">
                  {action.frameEnd - action.frameStart}f
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5"
                  onClick={(e) => { e.stopPropagation(); deleteAction(action.id); }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
            {actions.length === 0 && (
              <div className="text-center text-muted-foreground text-xs py-4">
                No actions created yet
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
      
      {/* Keyframe controls */}
      <div className="flex-1 p-3">
        {selectedAction && skeleton ? (
          <div className="space-y-3">
            <div>
              <Label className="text-xs font-medium">Action: {selectedAction.name}</Label>
              <p className="text-[10px] text-muted-foreground">
                Frame {selectedAction.frameStart} - {selectedAction.frameEnd}
              </p>
            </div>
            
            {selectedBoneId && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  Bone: {skeleton.bones.find(b => b.id === selectedBoneId)?.name}
                </Label>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs"
                    onClick={() => addKeyframeToBone(selectedBoneId, nlaCurrentFrame)}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Add Keyframe
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs"
                    onClick={() => removeKeyframeFromBone(selectedBoneId, nlaCurrentFrame)}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    Remove
                  </Button>
                </div>
                
                {/* Show keyframes for this bone */}
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Keyframes:</Label>
                  <div className="flex flex-wrap gap-1">
                    {(selectedAction.boneKeyframes[selectedBoneId] || []).map(kf => (
                      <span
                        key={kf.frame}
                        className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded"
                      >
                        {kf.frame}
                      </span>
                    ))}
                    {(!selectedAction.boneKeyframes[selectedBoneId] ||
                      selectedAction.boneKeyframes[selectedBoneId].length === 0) && (
                      <span className="text-[10px] text-muted-foreground">None</span>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {!selectedBoneId && (
              <div className="text-center text-muted-foreground text-xs py-4">
                Select a bone in the Pose Editor to add keyframes
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-muted-foreground text-xs">
            {!selectedAction ? "Select or create an action" : "Load a skeleton first"}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CharacterAnimEditor() {
  const { animEditorMode, setAnimEditorMode } = useCharacterAnimStore();
  const [, setLocation] = useLocation();
  
  return (
    <div className="h-screen flex flex-col bg-background" data-testid="character-anim-editor">
      {/* Top toolbar */}
      <header className="h-10 flex items-center gap-2 px-3 border-b border-border bg-card">
        {/* Editor navigation */}
        <div className="flex items-center gap-1 mr-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLocation("/3d")}
                data-testid="nav-3d-editor"
              >
                <Box className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>3D Editor</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLocation("/video")}
                data-testid="nav-video-editor"
              >
                <Film className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Video Editor</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLocation("/compositor")}
                data-testid="nav-compositor"
              >
                <Hexagon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Compositor</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="default"
                size="icon"
                data-testid="nav-character-anim"
              >
                <User className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Character Animation</TooltipContent>
          </Tooltip>
        </div>
        
        <div className="w-px h-5 bg-border" />
        
        {/* Mode tabs */}
        <Tabs value={animEditorMode} onValueChange={(v) => setAnimEditorMode(v as any)}>
          <TabsList className="h-8">
            <TabsTrigger value="pose" className="text-xs gap-1 px-2">
              <PenTool className="h-3.5 w-3.5" />
              Pose
            </TabsTrigger>
            <TabsTrigger value="action" className="text-xs gap-1 px-2">
              <Film className="h-3.5 w-3.5" />
              Action
            </TabsTrigger>
            <TabsTrigger value="nla" className="text-xs gap-1 px-2">
              <Layers className="h-3.5 w-3.5" />
              NLA
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex-1" />
        
        <span className="text-sm font-medium">Character Animation</span>
      </header>
      
      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        {animEditorMode === "pose" && <PoseEditor />}
        {animEditorMode === "action" && (
          <div className="h-full flex">
            <div className="flex-1">
              <PoseEditor />
            </div>
            <div className="w-64 border-l border-border bg-card">
              <div className="p-2 border-b border-border">
                <span className="text-xs font-medium">Action Editor</span>
              </div>
              <ActionEditor />
            </div>
          </div>
        )}
        {animEditorMode === "nla" && <NlaEditor />}
      </div>
    </div>
  );
}
