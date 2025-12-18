import { useVideoStore } from "@/lib/videoStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Settings,
  Clock,
  Volume2,
  Eye,
  Zap,
  Layers,
  Trash2,
  Plus,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { EffectType, TransitionType } from "@shared/schema";
import { effectPresets } from "@shared/schema";

const EFFECT_TYPES: { value: EffectType; label: string }[] = [
  { value: "brightness", label: "Brightness" },
  { value: "contrast", label: "Contrast" },
  { value: "saturation", label: "Saturation" },
  { value: "hue", label: "Hue" },
  { value: "blur", label: "Blur" },
  { value: "sharpen", label: "Sharpen" },
  { value: "vignette", label: "Vignette" },
  { value: "sepia", label: "Sepia" },
  { value: "grayscale", label: "Grayscale" },
  { value: "invert", label: "Invert" },
  { value: "exposure", label: "Exposure" },
  { value: "temperature", label: "Temperature" },
];

const TRANSITION_TYPES: { value: TransitionType; label: string }[] = [
  { value: "none", label: "None" },
  { value: "fade", label: "Fade" },
  { value: "dissolve", label: "Dissolve" },
  { value: "wipe", label: "Wipe" },
  { value: "slide", label: "Slide" },
  { value: "zoom", label: "Zoom" },
  { value: "push", label: "Push" },
  { value: "iris", label: "Iris" },
];

const SPEED_PRESETS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 4];

export function ClipProperties() {
  const {
    clips,
    assets,
    selectedClipId,
    updateClip,
    addEffect,
    removeEffect,
    updateEffect,
  } = useVideoStore();
  
  const selectedClip = clips.find(c => c.id === selectedClipId);
  const asset = selectedClip?.assetId ? assets.find(a => a.id === selectedClip.assetId) : null;
  
  if (!selectedClip) {
    return (
      <div className="h-full flex flex-col bg-card border-l border-border" data-testid="clip-properties">
        <div className="h-8 flex items-center gap-2 px-3 border-b border-border">
          <Settings className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Properties
          </span>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xs text-muted-foreground">Select a clip to edit</p>
        </div>
      </div>
    );
  }
  
  const handleAddEffect = (effectType: EffectType) => {
    addEffect(selectedClip.id, effectType);
  };
  
  const handleApplyPreset = (presetId: string) => {
    const preset = effectPresets.find(p => p.id === presetId);
    if (!preset) return;
    
    // Add all effects from preset
    preset.effects.forEach((effect) => {
      addEffect(selectedClip.id, effect.type);
      // Find the newly added effect and update its value
      const newEffectId = clips.find(c => c.id === selectedClip.id)?.effects.find(
        e => e.type === effect.type
      )?.id;
      if (newEffectId) {
        updateEffect(selectedClip.id, newEffectId, { value: effect.value });
      }
    });
  };
  
  return (
    <div className="h-full flex flex-col bg-card border-l border-border" data-testid="clip-properties">
      {/* Header */}
      <div className="h-8 flex items-center gap-2 px-3 border-b border-border">
        <Settings className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Properties
        </span>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-4">
          {/* Clip info */}
          <div>
            <h4 className="text-xs font-medium mb-2">Clip Info</h4>
            <div className="space-y-2">
              <div>
                <Label className="text-[10px]">Name</Label>
                <Input
                  value={selectedClip.name}
                  onChange={(e) => updateClip(selectedClip.id, { name: e.target.value })}
                  className="h-7 text-xs"
                  data-testid="clip-name"
                />
              </div>
              
              {asset && (
                <div className="text-[10px] text-muted-foreground">
                  Source: {asset.name}
                </div>
              )}
            </div>
          </div>
          
          <Separator />
          
          {/* Timing */}
          <div>
            <div className="flex items-center gap-1 mb-2">
              <Clock className="h-3 w-3" />
              <h4 className="text-xs font-medium">Timing</h4>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-[10px]">Start Time</Label>
                <Input
                  type="number"
                  value={selectedClip.startTime.toFixed(2)}
                  onChange={(e) => updateClip(selectedClip.id, { startTime: parseFloat(e.target.value) || 0 })}
                  className="h-7 text-xs"
                  step={0.1}
                  min={0}
                  data-testid="clip-start-time"
                />
              </div>
              
              <div>
                <Label className="text-[10px]">Duration</Label>
                <Input
                  type="number"
                  value={selectedClip.duration.toFixed(2)}
                  onChange={(e) => updateClip(selectedClip.id, { duration: parseFloat(e.target.value) || 0.1 })}
                  className="h-7 text-xs"
                  step={0.1}
                  min={0.1}
                  data-testid="clip-duration"
                />
              </div>
              
              <div>
                <Label className="text-[10px]">In Point</Label>
                <Input
                  type="number"
                  value={selectedClip.inPoint.toFixed(2)}
                  onChange={(e) => updateClip(selectedClip.id, { inPoint: parseFloat(e.target.value) || 0 })}
                  className="h-7 text-xs"
                  step={0.1}
                  min={0}
                  data-testid="clip-in-point"
                />
              </div>
              
              <div>
                <Label className="text-[10px]">Speed</Label>
                <Select
                  value={selectedClip.speed.toString()}
                  onValueChange={(v) => updateClip(selectedClip.id, { speed: parseFloat(v) })}
                >
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SPEED_PRESETS.map((speed) => (
                      <SelectItem key={speed} value={speed.toString()}>
                        {speed}x
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <Separator />
          
          {/* Audio/Opacity */}
          <div>
            <div className="flex items-center gap-1 mb-2">
              <Volume2 className="h-3 w-3" />
              <h4 className="text-xs font-medium">Audio & Opacity</h4>
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label className="text-[10px]">Volume</Label>
                  <span className="text-[10px] text-muted-foreground">
                    {Math.round(selectedClip.volume * 100)}%
                  </span>
                </div>
                <Slider
                  value={[selectedClip.volume * 100]}
                  min={0}
                  max={200}
                  step={1}
                  onValueChange={([v]) => updateClip(selectedClip.id, { volume: v / 100 })}
                  data-testid="clip-volume"
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label className="text-[10px]">Opacity</Label>
                  <span className="text-[10px] text-muted-foreground">
                    {Math.round(selectedClip.opacity * 100)}%
                  </span>
                </div>
                <Slider
                  value={[selectedClip.opacity * 100]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={([v]) => updateClip(selectedClip.id, { opacity: v / 100 })}
                  data-testid="clip-opacity"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label className="text-[10px]">Muted</Label>
                <Switch
                  checked={selectedClip.muted}
                  onCheckedChange={(checked) => updateClip(selectedClip.id, { muted: checked })}
                  data-testid="clip-muted"
                />
              </div>
            </div>
          </div>
          
          <Separator />
          
          {/* Transitions */}
          <div>
            <div className="flex items-center gap-1 mb-2">
              <Layers className="h-3 w-3" />
              <h4 className="text-xs font-medium">Transitions</h4>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-[10px]">In</Label>
                <Select
                  value={selectedClip.transitionIn?.type || "none"}
                  onValueChange={(v) => updateClip(selectedClip.id, { 
                    transitionIn: { 
                      type: v as TransitionType, 
                      duration: selectedClip.transitionIn?.duration || 0.5,
                      easing: "easeInOut",
                    } 
                  })}
                >
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TRANSITION_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-[10px]">Out</Label>
                <Select
                  value={selectedClip.transitionOut?.type || "none"}
                  onValueChange={(v) => updateClip(selectedClip.id, { 
                    transitionOut: { 
                      type: v as TransitionType, 
                      duration: selectedClip.transitionOut?.duration || 0.5,
                      easing: "easeInOut",
                    } 
                  })}
                >
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TRANSITION_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <Separator />
          
          {/* Effects */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                <h4 className="text-xs font-medium">Effects</h4>
              </div>
              
              <Select onValueChange={(v) => handleAddEffect(v as EffectType)}>
                <SelectTrigger className="h-6 w-6 p-0">
                  <Plus className="h-3 w-3" />
                </SelectTrigger>
                <SelectContent>
                  {EFFECT_TYPES.map((effect) => (
                    <SelectItem key={effect.value} value={effect.value}>
                      {effect.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Effect presets */}
            <div className="mb-2">
              <Select onValueChange={handleApplyPreset}>
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue placeholder="Apply preset..." />
                </SelectTrigger>
                <SelectContent>
                  {effectPresets.map((preset) => (
                    <SelectItem key={preset.id} value={preset.id}>
                      {preset.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Active effects */}
            <div className="space-y-2">
              {selectedClip.effects.length === 0 ? (
                <p className="text-[10px] text-muted-foreground text-center py-2">
                  No effects applied
                </p>
              ) : (
                selectedClip.effects.map((effect) => (
                  <div 
                    key={effect.id}
                    className="p-2 rounded-md bg-muted/50"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={effect.enabled}
                          onCheckedChange={(checked) => 
                            updateEffect(selectedClip.id, effect.id, { enabled: checked })
                          }
                          className="h-4 w-7"
                        />
                        <span className="text-[10px] font-medium capitalize">
                          {effect.type}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={() => removeEffect(selectedClip.id, effect.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Slider
                        value={[effect.value]}
                        min={effect.min}
                        max={effect.max}
                        step={1}
                        onValueChange={([v]) => 
                          updateEffect(selectedClip.id, effect.id, { value: v })
                        }
                        disabled={!effect.enabled}
                        className="flex-1"
                      />
                      <span className="text-[10px] text-muted-foreground w-8 text-right">
                        {effect.value}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
