import { useCharacterAnimStore } from "@/lib/characterAnimStore";
import { PoseEditor } from "@/components/PoseEditor";
import { NlaEditor } from "@/components/NlaEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  HelpCircle,
  Keyboard,
  Info,
  Lightbulb,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

function KeyboardShortcuts() {
  const shortcuts = [
    { key: "Space", action: "Play / Pause animation" },
    { key: "Left/Right", action: "Previous / Next frame" },
    { key: "Home / End", action: "Go to start / end" },
    { key: "K", action: "Add keyframe" },
    { key: "Delete", action: "Delete keyframe" },
    { key: "G", action: "Grab / Move bone" },
    { key: "R", action: "Rotate bone" },
  ];

  return (
    <div className="space-y-2">
      {shortcuts.map((s) => (
        <div key={s.key} className="flex items-center gap-3">
          <Badge variant="outline" className="font-mono text-xs min-w-[80px]">
            {s.key}
          </Badge>
          <span className="text-sm text-muted-foreground">{s.action}</span>
        </div>
      ))}
    </div>
  );
}

function GettingStartedTips() {
  const tips = [
    {
      title: "Create a Skeleton",
      desc: "Use 'Humanoid Preset' for a 20-bone rig, or create bones manually",
    },
    {
      title: "Select Bones",
      desc: "Click bones in the hierarchy to select them for editing",
    },
    {
      title: "Adjust Rotations",
      desc: "Use the sliders to rotate bones in X, Y, Z axes",
    },
    {
      title: "Save Poses",
      desc: "Create pose presets to quickly apply common poses",
    },
    {
      title: "Create Actions",
      desc: "Record keyframes to create reusable animation clips",
    },
    {
      title: "Use NLA Editor",
      desc: "Combine multiple actions with blending for complex animations",
    },
  ];

  return (
    <div className="space-y-3">
      {tips.map((tip, i) => (
        <div key={i} className="flex gap-2">
          <Badge variant="outline" className="h-5 w-5 rounded-full p-0 flex items-center justify-center shrink-0">
            {i + 1}
          </Badge>
          <div>
            <p className="text-sm font-medium">{tip.title}</p>
            <p className="text-xs text-muted-foreground">{tip.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function WelcomePanel({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <div className="h-full flex items-center justify-center p-8">
      <Card className="max-w-lg p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Character Animation</h2>
            <p className="text-sm text-muted-foreground">Create skeletal animations for characters</p>
          </div>
        </div>
        
        <div className="space-y-2 pt-2">
          <p className="text-sm">
            The Character Animation editor lets you create bone-based rigs and animate them 
            using poses, actions, and the Non-Linear Animation (NLA) system.
          </p>
        </div>
        
        <div className="grid grid-cols-3 gap-2 pt-2">
          <div className="text-center p-3 bg-muted rounded-md">
            <PenTool className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-xs font-medium">Pose Mode</p>
            <p className="text-[10px] text-muted-foreground">Edit bone rotations</p>
          </div>
          <div className="text-center p-3 bg-muted rounded-md">
            <Film className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-xs font-medium">Action Mode</p>
            <p className="text-[10px] text-muted-foreground">Create clips</p>
          </div>
          <div className="text-center p-3 bg-muted rounded-md">
            <Layers className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-xs font-medium">NLA Mode</p>
            <p className="text-[10px] text-muted-foreground">Blend actions</p>
          </div>
        </div>
        
        <Button onClick={onGetStarted} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Create Humanoid Skeleton
        </Button>
        
        <p className="text-xs text-center text-muted-foreground">
          This will create a 20-bone skeleton ready for animation
        </p>
      </Card>
    </div>
  );
}

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
      <div className="p-3 border-b border-border">
        <Label className="text-xs font-medium mb-2 block">Actions</Label>
        <div className="flex items-center gap-2 mb-2">
          <Input
            placeholder="New action name..."
            value={newActionName}
            onChange={(e) => setNewActionName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            className="h-8 text-xs flex-1"
            data-testid="input-new-action"
          />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCreate} 
                disabled={!newActionName.trim()}
                data-testid="button-create-action"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Create new action</TooltipContent>
          </Tooltip>
        </div>
        
        <ScrollArea className="h-28">
          <div className="space-y-1">
            {actions.map(action => (
              <div
                key={action.id}
                className={`flex items-center gap-2 p-2 rounded cursor-pointer text-xs ${
                  selectedActionId === action.id ? "bg-primary/20 text-primary" : "hover-elevate"
                }`}
                onClick={() => selectAction(action.id)}
                data-testid={`select-action-${action.id}`}
              >
                <Film className="h-3.5 w-3.5" />
                <span className="flex-1 truncate">{action.name}</span>
                <Badge variant="outline" className="text-[10px]">
                  {action.frameEnd - action.frameStart}f
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 opacity-50 hover:opacity-100"
                  onClick={(e) => { e.stopPropagation(); deleteAction(action.id); }}
                  data-testid={`delete-action-${action.id}`}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
            {actions.length === 0 && (
              <div className="text-center text-muted-foreground text-xs py-4 bg-muted/50 rounded">
                <Film className="h-5 w-5 mx-auto mb-1 opacity-50" />
                No actions yet
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
      
      {/* Keyframe controls */}
      <div className="flex-1 p-3 overflow-auto">
        {selectedAction && skeleton ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-xs font-medium">{selectedAction.name}</Label>
                <p className="text-[10px] text-muted-foreground">
                  Frames {selectedAction.frameStart} - {selectedAction.frameEnd}
                </p>
              </div>
              <Badge variant="secondary" className="text-[10px]">
                Frame {nlaCurrentFrame}
              </Badge>
            </div>
            
            {selectedBoneId ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-2 bg-muted rounded">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="h-3 w-3 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-medium">
                      {skeleton.bones.find(b => b.id === selectedBoneId)?.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Selected bone</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    size="sm"
                    className="text-xs"
                    onClick={() => addKeyframeToBone(selectedBoneId, nlaCurrentFrame)}
                    data-testid="button-add-keyframe"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Add Key
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={() => removeKeyframeFromBone(selectedBoneId, nlaCurrentFrame)}
                    data-testid="button-remove-keyframe"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    Remove
                  </Button>
                </div>
                
                {/* Keyframe list */}
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Keyframes</Label>
                  <div className="flex flex-wrap gap-1 p-2 bg-muted/50 rounded min-h-[32px]">
                    {(selectedAction.boneKeyframes[selectedBoneId] || []).map(kf => (
                      <Badge
                        key={kf.frame}
                        variant={kf.frame === nlaCurrentFrame ? "default" : "secondary"}
                        className="text-[10px]"
                      >
                        {kf.frame}
                      </Badge>
                    ))}
                    {(!selectedAction.boneKeyframes[selectedBoneId] ||
                      selectedAction.boneKeyframes[selectedBoneId].length === 0) && (
                      <span className="text-[10px] text-muted-foreground">No keyframes</span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <User className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs">Select a bone in the Pose Editor</p>
                <p className="text-[10px]">to add keyframes to this action</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-muted-foreground text-xs py-8">
            <Info className="h-6 w-6 mx-auto mb-2 opacity-30" />
            {!selectedAction ? "Select or create an action above" : "Load a skeleton first"}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CharacterAnimEditor() {
  const { 
    animEditorMode, 
    setAnimEditorMode, 
    skeleton,
    loadHumanoidPreset,
  } = useCharacterAnimStore();
  const [, setLocation] = useLocation();
  
  const handleGetStarted = () => {
    loadHumanoidPreset();
  };
  
  return (
    <div className="h-screen flex flex-col bg-background" data-testid="character-anim-editor">
      {/* Top toolbar */}
      <header className="h-11 flex items-center gap-2 px-3 border-b border-border bg-card">
        {/* Logo */}
        <div className="flex items-center gap-1.5 mr-2">
          <User className="h-4 w-4 text-primary" />
          <span className="font-semibold text-sm">Character Animation</span>
        </div>
        
        <div className="w-px h-5 bg-border" />
        
        {/* Editor navigation */}
        <div className="flex items-center gap-1">
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
        </div>
        
        <div className="w-px h-5 bg-border" />
        
        {/* Mode tabs */}
        <Tabs value={animEditorMode} onValueChange={(v) => setAnimEditorMode(v as "pose" | "action" | "nla")}>
          <TabsList className="h-8">
            <TabsTrigger value="pose" className="text-xs gap-1.5 px-3" data-testid="tab-pose">
              <PenTool className="h-3.5 w-3.5" />
              Pose
            </TabsTrigger>
            <TabsTrigger value="action" className="text-xs gap-1.5 px-3" data-testid="tab-action">
              <Film className="h-3.5 w-3.5" />
              Action
            </TabsTrigger>
            <TabsTrigger value="nla" className="text-xs gap-1.5 px-3" data-testid="tab-nla">
              <Layers className="h-3.5 w-3.5" />
              NLA
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex-1" />
        
        {/* Quick actions */}
        {skeleton && (
          <Badge variant="secondary" className="text-xs gap-1">
            <User className="h-3 w-3" />
            {skeleton.bones.length} bones
          </Badge>
        )}
        
        {/* Help */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" data-testid="getting-started">
              <Lightbulb className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Getting Started</DialogTitle>
            </DialogHeader>
            <GettingStartedTips />
          </DialogContent>
        </Dialog>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" data-testid="keyboard-shortcuts">
              <Keyboard className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Keyboard Shortcuts</DialogTitle>
            </DialogHeader>
            <KeyboardShortcuts />
          </DialogContent>
        </Dialog>
      </header>
      
      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        {!skeleton ? (
          <WelcomePanel onGetStarted={handleGetStarted} />
        ) : (
          <>
            {animEditorMode === "pose" && <PoseEditor />}
            {animEditorMode === "action" && (
              <div className="h-full flex">
                <div className="flex-1">
                  <PoseEditor />
                </div>
                <div className="w-72 border-l border-border bg-card">
                  <div className="p-3 border-b border-border flex items-center gap-2">
                    <Film className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Action Editor</span>
                  </div>
                  <ActionEditor />
                </div>
              </div>
            )}
            {animEditorMode === "nla" && <NlaEditor />}
          </>
        )}
      </div>
    </div>
  );
}
