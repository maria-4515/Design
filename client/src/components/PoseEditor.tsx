import { useCharacterAnimStore } from "@/lib/characterAnimStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
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
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Trash2,
  Save,
  RotateCcw,
  ChevronRight,
  ChevronDown,
  Target,
  Move,
  User,
  Bone,
  Upload,
  Download,
} from "lucide-react";
import { useState } from "react";
import type { Bone as BoneType } from "@shared/schema";

function BoneTreeItem({ bone, depth = 0 }: { bone: BoneType; depth?: number }) {
  const { skeleton, selectedBoneId, selectBone, currentPose } = useCharacterAnimStore();
  const [expanded, setExpanded] = useState(true);
  
  const children = skeleton?.bones.filter(b => b.parentId === bone.id) || [];
  const isSelected = selectedBoneId === bone.id;
  const hasRotation = currentPose[bone.id];
  
  return (
    <div>
      <div
        className={`flex items-center gap-1 py-0.5 px-1 rounded cursor-pointer text-xs ${
          isSelected ? "bg-primary/20 text-primary" : "hover-elevate"
        }`}
        style={{ paddingLeft: depth * 12 + 4 }}
        onClick={() => selectBone(bone.id)}
        data-testid={`bone-${bone.id}`}
      >
        {children.length > 0 ? (
          <button onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}>
            {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </button>
        ) : (
          <span className="w-3" />
        )}
        <Bone className="h-3 w-3 text-muted-foreground" />
        <span className="flex-1 truncate">{bone.name}</span>
        {bone.ikEnabled && (
          <Target className="h-3 w-3 text-blue-500" />
        )}
      </div>
      {expanded && children.map(child => (
        <BoneTreeItem key={child.id} bone={child} depth={depth + 1} />
      ))}
    </div>
  );
}

function BoneHierarchy() {
  const { skeleton, loadHumanoidPreset, createSkeleton } = useCharacterAnimStore();
  
  const rootBones = skeleton?.bones.filter(b => b.parentId === null) || [];
  
  return (
    <div className="h-full flex flex-col">
      <div className="p-2 border-b border-border flex items-center justify-between gap-2">
        <span className="text-xs font-medium">Bones</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => createSkeleton("New Skeleton")}>
              <Bone className="h-3.5 w-3.5 mr-2" />
              New Empty Skeleton
            </DropdownMenuItem>
            <DropdownMenuItem onClick={loadHumanoidPreset}>
              <User className="h-3.5 w-3.5 mr-2" />
              Humanoid Preset
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-1">
          {skeleton ? (
            rootBones.map(bone => (
              <BoneTreeItem key={bone.id} bone={bone} />
            ))
          ) : (
            <div className="p-4 text-center text-muted-foreground text-xs">
              No skeleton loaded.<br />
              Add one to start posing.
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

function BoneProperties() {
  const {
    skeleton,
    selectedBoneId,
    currentPose,
    setBoneRotation,
    updateBone,
    ikMode,
    toggleIkMode,
  } = useCharacterAnimStore();
  
  const bone = skeleton?.bones.find(b => b.id === selectedBoneId);
  const pose = selectedBoneId ? currentPose[selectedBoneId] : null;
  
  if (!bone) {
    return (
      <div className="p-4 text-center text-muted-foreground text-xs">
        Select a bone to edit
      </div>
    );
  }
  
  const rotation = pose?.rotation || { x: 0, y: 0, z: 0 };
  
  const toDegrees = (rad: number) => (rad * 180) / Math.PI;
  const toRadians = (deg: number) => (deg * Math.PI) / 180;
  
  return (
    <div className="p-3 space-y-4">
      <div>
        <Label className="text-xs font-medium">{bone.name}</Label>
      </div>
      
      <div className="space-y-3">
        <Label className="text-xs text-muted-foreground">Rotation</Label>
        
        {["x", "y", "z"].map((axis) => (
          <div key={axis} className="flex items-center gap-2">
            <span className="w-4 text-xs text-muted-foreground uppercase">{axis}</span>
            <Slider
              value={[toDegrees(rotation[axis as keyof typeof rotation])]}
              min={-180}
              max={180}
              step={1}
              onValueChange={([v]) => setBoneRotation(bone.id, {
                ...rotation,
                [axis]: toRadians(v),
              })}
              className="flex-1"
            />
            <Input
              type="number"
              value={Math.round(toDegrees(rotation[axis as keyof typeof rotation]))}
              onChange={(e) => setBoneRotation(bone.id, {
                ...rotation,
                [axis]: toRadians(parseFloat(e.target.value) || 0),
              })}
              className="w-14 h-7 text-xs"
            />
          </div>
        ))}
      </div>
      
      <Separator />
      
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">IK Settings</Label>
        
        <div className="flex items-center justify-between">
          <span className="text-xs">IK Enabled</span>
          <Switch
            checked={bone.ikEnabled}
            onCheckedChange={(v) => updateBone(bone.id, { ikEnabled: v })}
          />
        </div>
        
        {bone.ikEnabled && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Chain Length</span>
            <Input
              type="number"
              value={bone.ikChainLength}
              min={1}
              max={10}
              onChange={(e) => updateBone(bone.id, { ikChainLength: parseInt(e.target.value) || 2 })}
              className="w-16 h-7 text-xs"
            />
          </div>
        )}
        
        <Button
          variant={ikMode ? "default" : "outline"}
          size="sm"
          className="w-full text-xs"
          onClick={toggleIkMode}
        >
          <Target className="h-3.5 w-3.5 mr-1" />
          {ikMode ? "IK Mode Active" : "Enable IK Mode"}
        </Button>
      </div>
    </div>
  );
}

function PoseLibrary() {
  const { poseLibrary, savePose, loadPose, deletePose, resetPose } = useCharacterAnimStore();
  const [newPoseName, setNewPoseName] = useState("");
  
  const handleSave = () => {
    if (newPoseName.trim()) {
      savePose(newPoseName.trim());
      setNewPoseName("");
    }
  };
  
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Pose name..."
          value={newPoseName}
          onChange={(e) => setNewPoseName(e.target.value)}
          className="h-7 text-xs flex-1"
        />
        <Button variant="outline" size="sm" onClick={handleSave} disabled={!newPoseName.trim()}>
          <Save className="h-3.5 w-3.5" />
        </Button>
      </div>
      
      <Button variant="ghost" size="sm" className="w-full text-xs" onClick={resetPose}>
        <RotateCcw className="h-3.5 w-3.5 mr-1" />
        Reset Pose
      </Button>
      
      <div className="space-y-1">
        {poseLibrary.map(pose => (
          <div
            key={pose.id}
            className="flex items-center gap-2 p-1.5 rounded hover-elevate cursor-pointer"
            onClick={() => loadPose(pose.id)}
            data-testid={`pose-${pose.id}`}
          >
            <User className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="flex-1 text-xs truncate">{pose.name}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 text-destructive opacity-0 group-hover:opacity-100"
              onClick={(e) => { e.stopPropagation(); deletePose(pose.id); }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
        {poseLibrary.length === 0 && (
          <div className="text-center text-muted-foreground text-xs py-2">
            No saved poses
          </div>
        )}
      </div>
    </div>
  );
}

export function PoseEditor() {
  return (
    <div className="h-full flex" data-testid="pose-editor">
      {/* Bone hierarchy */}
      <div className="w-48 border-r border-border bg-card">
        <BoneHierarchy />
      </div>
      
      {/* Main viewport area - would show 3D skeleton */}
      <div className="flex-1 bg-muted/30 flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <User className="h-16 w-16 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Skeleton Viewport</p>
          <p className="text-xs">Select bones in hierarchy to pose</p>
        </div>
      </div>
      
      {/* Properties panel */}
      <div className="w-56 border-l border-border bg-card">
        <div className="p-2 border-b border-border">
          <span className="text-xs font-medium">Bone Properties</span>
        </div>
        <ScrollArea className="h-[calc(50%-24px)]">
          <BoneProperties />
        </ScrollArea>
        
        <div className="p-2 border-y border-border">
          <span className="text-xs font-medium">Pose Library</span>
        </div>
        <ScrollArea className="h-[calc(50%-24px)]">
          <div className="p-3">
            <PoseLibrary />
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
