import { useEditorStore } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Settings2,
  ChevronDown,
  Move,
  RotateCcw,
  Maximize2,
  Palette,
  Key,
  Lightbulb,
  Camera,
  Target,
  Aperture,
} from "lucide-react";
import { useState } from "react";
import type { Vector3, Material } from "@shared/schema";
import { isLightType, presetMaterials } from "@shared/schema";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function Vector3Input({
  label,
  value,
  onChange,
  step = 0.1,
  icon: Icon,
}: {
  label: string;
  value: Vector3;
  onChange: (value: Vector3) => void;
  step?: number;
  icon: typeof Move;
}) {
  const handleChange = (axis: keyof Vector3, val: string) => {
    const num = parseFloat(val) || 0;
    onChange({ ...value, [axis]: num });
  };
  
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        <Label className="text-xs font-medium">{label}</Label>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="space-y-1">
          <Label className="text-[10px] text-red-400">X</Label>
          <Input
            type="number"
            step={step}
            value={value.x.toFixed(2)}
            onChange={(e) => handleChange("x", e.target.value)}
            className="h-7 text-xs font-mono"
            data-testid={`input-${label.toLowerCase()}-x`}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] text-green-400">Y</Label>
          <Input
            type="number"
            step={step}
            value={value.y.toFixed(2)}
            onChange={(e) => handleChange("y", e.target.value)}
            className="h-7 text-xs font-mono"
            data-testid={`input-${label.toLowerCase()}-y`}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] text-blue-400">Z</Label>
          <Input
            type="number"
            step={step}
            value={value.z.toFixed(2)}
            onChange={(e) => handleChange("z", e.target.value)}
            className="h-7 text-xs font-mono"
            data-testid={`input-${label.toLowerCase()}-z`}
          />
        </div>
      </div>
    </div>
  );
}

function CollapsibleSection({
  title,
  icon: Icon,
  defaultOpen = true,
  children,
}: {
  title: string;
  icon: typeof Settings2;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center gap-2 w-full py-2 hover-elevate rounded">
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform ${
            isOpen ? "" : "-rotate-90"
          }`}
        />
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs font-semibold uppercase tracking-wide flex-1 text-left">
          {title}
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2 pb-4 space-y-4">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}

function CameraProperties() {
  const { camera, setCameraPosition, setCameraTarget, setCameraFov, addCameraKeyframe } = useEditorStore();
  
  return (
    <div className="h-full flex flex-col bg-card border-l border-border" data-testid="properties-panel">
      <div className="h-10 flex items-center gap-2 px-3 border-b border-border">
        <Settings2 className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Properties
        </span>
      </div>
      
      <div className="px-3 py-3 border-b border-border">
        <Label className="text-xs text-muted-foreground">Camera</Label>
        <p className="text-sm font-medium mt-1" data-testid="selected-camera-name">
          Main Camera
        </p>
        <p className="text-xs text-muted-foreground">Scene camera</p>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          <CollapsibleSection title="Camera" icon={Camera}>
            <Vector3Input
              label="Position"
              value={camera.position}
              onChange={setCameraPosition}
              step={0.5}
              icon={Move}
            />
            <Vector3Input
              label="Target"
              value={camera.target}
              onChange={setCameraTarget}
              step={0.5}
              icon={Target}
            />
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Aperture className="h-3.5 w-3.5 text-muted-foreground" />
                  <Label className="text-xs font-medium">Field of View</Label>
                </div>
                <span className="text-xs font-mono text-muted-foreground">
                  {camera.fov.toFixed(0)}°
                </span>
              </div>
              <Slider
                value={[camera.fov]}
                min={10}
                max={120}
                step={1}
                onValueChange={([val]) => setCameraFov(val)}
                data-testid="slider-camera-fov"
              />
            </div>
          </CollapsibleSection>
          
          <Separator />
          
          <CollapsibleSection title="Animation" icon={Key}>
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                {camera.keyframes.length} keyframe{camera.keyframes.length !== 1 ? "s" : ""}
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={addCameraKeyframe}
                className="w-full gap-2"
                data-testid="add-camera-keyframe-button"
              >
                <Key className="h-3.5 w-3.5" />
                Add Camera Keyframe
              </Button>
              {camera.keyframes.length > 0 && (
                <div className="space-y-1">
                  {camera.keyframes.map((kf) => (
                    <div
                      key={kf.frame}
                      className="flex items-center justify-between px-2 py-1 bg-muted rounded text-xs"
                    >
                      <span className="font-mono">Frame {kf.frame + 1}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CollapsibleSection>
        </div>
      </ScrollArea>
    </div>
  );
}

export function PropertiesPanel() {
  const { objects, selectedObjectId, isCameraSelected, setPosition, setRotation, setScale, setMaterial, addKeyframe, setLightProperties } = useEditorStore();
  const selectedObject = objects.find((o) => o.id === selectedObjectId);
  const isLight = selectedObject ? isLightType(selectedObject.type) : false;
  
  if (isCameraSelected) {
    return <CameraProperties />;
  }
  
  if (!selectedObject) {
    return (
      <div className="h-full flex flex-col bg-card border-l border-border" data-testid="properties-panel">
        <div className="h-10 flex items-center gap-2 px-3 border-b border-border">
          <Settings2 className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Properties
          </span>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-sm text-muted-foreground text-center">
            Select an object to view properties
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-full flex flex-col bg-card border-l border-border" data-testid="properties-panel">
      {/* Header */}
      <div className="h-10 flex items-center gap-2 px-3 border-b border-border">
        <Settings2 className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Properties
        </span>
      </div>
      
      {/* Object name */}
      <div className="px-3 py-3 border-b border-border">
        <Label className="text-xs text-muted-foreground">Object</Label>
        <p className="text-sm font-medium mt-1" data-testid="selected-object-name">
          {selectedObject.name}
        </p>
        <p className="text-xs text-muted-foreground capitalize">{selectedObject.type}</p>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {/* Transform section */}
          <CollapsibleSection title="Transform" icon={Move}>
            <Vector3Input
              label="Position"
              value={selectedObject.position}
              onChange={(pos) => setPosition(selectedObject.id, pos)}
              step={0.1}
              icon={Move}
            />
            <Vector3Input
              label="Rotation"
              value={selectedObject.rotation}
              onChange={(rot) => setRotation(selectedObject.id, rot)}
              step={5}
              icon={RotateCcw}
            />
            <Vector3Input
              label="Scale"
              value={selectedObject.scale}
              onChange={(scl) => setScale(selectedObject.id, scl)}
              step={0.1}
              icon={Maximize2}
            />
          </CollapsibleSection>
          
          <Separator />
          
          {/* Material section */}
          <CollapsibleSection title="Material" icon={Palette}>
            <div className="space-y-4">
              {/* Material presets */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Material Preset</Label>
                <Select
                  onValueChange={(value) => {
                    const preset = presetMaterials.find((p) => p.id === value);
                    if (preset) {
                      setMaterial(selectedObject.id, preset.material);
                    }
                  }}
                >
                  <SelectTrigger className="h-8 text-xs" data-testid="select-material-preset">
                    <SelectValue placeholder="Choose a preset..." />
                  </SelectTrigger>
                  <SelectContent>
                    {["Basic", "Metal", "Transparent", "Plastic", "Natural"].map((category) => (
                      <SelectGroup key={category}>
                        <SelectLabel className="text-xs font-semibold">{category}</SelectLabel>
                        {presetMaterials
                          .filter((p) => p.category === category)
                          .map((preset) => (
                            <SelectItem key={preset.id} value={preset.id}>
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-3 h-3 rounded-sm border border-border"
                                  style={{ backgroundColor: preset.material.color }}
                                />
                                {preset.name}
                              </div>
                            </SelectItem>
                          ))}
                      </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Color picker */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Color</Label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={selectedObject.material.color}
                    onChange={(e) => setMaterial(selectedObject.id, { color: e.target.value })}
                    className="w-8 h-8 rounded cursor-pointer border border-border"
                    data-testid="input-color"
                  />
                  <Input
                    value={selectedObject.material.color}
                    onChange={(e) => setMaterial(selectedObject.id, { color: e.target.value })}
                    className="h-7 text-xs font-mono flex-1"
                    data-testid="input-color-hex"
                  />
                </div>
              </div>
              
              {/* Opacity */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium">Opacity</Label>
                  <span className="text-xs font-mono text-muted-foreground">
                    {(selectedObject.material.opacity * 100).toFixed(0)}%
                  </span>
                </div>
                <Slider
                  value={[selectedObject.material.opacity]}
                  min={0}
                  max={1}
                  step={0.01}
                  onValueChange={([val]) => setMaterial(selectedObject.id, { opacity: val })}
                  data-testid="slider-opacity"
                />
              </div>
              
              {/* Metalness */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium">Metalness</Label>
                  <span className="text-xs font-mono text-muted-foreground">
                    {(selectedObject.material.metalness * 100).toFixed(0)}%
                  </span>
                </div>
                <Slider
                  value={[selectedObject.material.metalness]}
                  min={0}
                  max={1}
                  step={0.01}
                  onValueChange={([val]) => setMaterial(selectedObject.id, { metalness: val })}
                  data-testid="slider-metalness"
                />
              </div>
              
              {/* Roughness */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium">Roughness</Label>
                  <span className="text-xs font-mono text-muted-foreground">
                    {(selectedObject.material.roughness * 100).toFixed(0)}%
                  </span>
                </div>
                <Slider
                  value={[selectedObject.material.roughness]}
                  min={0}
                  max={1}
                  step={0.01}
                  onValueChange={([val]) => setMaterial(selectedObject.id, { roughness: val })}
                  data-testid="slider-roughness"
                />
              </div>
            </div>
          </CollapsibleSection>
          
          <Separator />
          
          {/* Light section - only for lights */}
          {isLight && selectedObject.lightProperties && (
            <>
              <CollapsibleSection title="Light" icon={Lightbulb}>
                <div className="space-y-4">
                  {/* Light Color */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Light Color</Label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={selectedObject.lightProperties.color}
                        onChange={(e) => setLightProperties(selectedObject.id, { color: e.target.value })}
                        className="w-8 h-8 rounded cursor-pointer border border-border"
                        data-testid="input-light-color"
                      />
                      <Input
                        value={selectedObject.lightProperties.color}
                        onChange={(e) => setLightProperties(selectedObject.id, { color: e.target.value })}
                        className="h-7 text-xs font-mono flex-1"
                        data-testid="input-light-color-hex"
                      />
                    </div>
                  </div>
                  
                  {/* Intensity */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-medium">Intensity</Label>
                      <span className="text-xs font-mono text-muted-foreground">
                        {selectedObject.lightProperties.intensity.toFixed(2)}
                      </span>
                    </div>
                    <Slider
                      value={[selectedObject.lightProperties.intensity]}
                      min={0}
                      max={10}
                      step={0.1}
                      onValueChange={([val]) => setLightProperties(selectedObject.id, { intensity: val })}
                      data-testid="slider-light-intensity"
                    />
                  </div>
                  
                  {/* Cast Shadow - for point, directional, spot */}
                  {selectedObject.type !== "ambientLight" && (
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-medium">Cast Shadow</Label>
                      <Switch
                        checked={selectedObject.lightProperties.castShadow}
                        onCheckedChange={(checked) => setLightProperties(selectedObject.id, { castShadow: checked })}
                        data-testid="switch-cast-shadow"
                      />
                    </div>
                  )}
                  
                  {/* Distance - for point and spot */}
                  {(selectedObject.type === "pointLight" || selectedObject.type === "spotLight") && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-medium">Distance</Label>
                        <span className="text-xs font-mono text-muted-foreground">
                          {selectedObject.lightProperties.distance?.toFixed(1) ?? 0}
                        </span>
                      </div>
                      <Slider
                        value={[selectedObject.lightProperties.distance ?? 0]}
                        min={0}
                        max={100}
                        step={1}
                        onValueChange={([val]) => setLightProperties(selectedObject.id, { distance: val })}
                        data-testid="slider-light-distance"
                      />
                    </div>
                  )}
                  
                  {/* Decay - for point and spot */}
                  {(selectedObject.type === "pointLight" || selectedObject.type === "spotLight") && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-medium">Decay</Label>
                        <span className="text-xs font-mono text-muted-foreground">
                          {selectedObject.lightProperties.decay?.toFixed(2) ?? 2}
                        </span>
                      </div>
                      <Slider
                        value={[selectedObject.lightProperties.decay ?? 2]}
                        min={0}
                        max={5}
                        step={0.1}
                        onValueChange={([val]) => setLightProperties(selectedObject.id, { decay: val })}
                        data-testid="slider-light-decay"
                      />
                    </div>
                  )}
                  
                  {/* Angle - for spot only */}
                  {selectedObject.type === "spotLight" && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-medium">Angle</Label>
                        <span className="text-xs font-mono text-muted-foreground">
                          {((selectedObject.lightProperties.angle ?? Math.PI / 3) * 180 / Math.PI).toFixed(0)}°
                        </span>
                      </div>
                      <Slider
                        value={[selectedObject.lightProperties.angle ?? Math.PI / 3]}
                        min={0}
                        max={Math.PI / 2}
                        step={0.01}
                        onValueChange={([val]) => setLightProperties(selectedObject.id, { angle: val })}
                        data-testid="slider-light-angle"
                      />
                    </div>
                  )}
                  
                  {/* Penumbra - for spot only */}
                  {selectedObject.type === "spotLight" && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-medium">Penumbra</Label>
                        <span className="text-xs font-mono text-muted-foreground">
                          {((selectedObject.lightProperties.penumbra ?? 0) * 100).toFixed(0)}%
                        </span>
                      </div>
                      <Slider
                        value={[selectedObject.lightProperties.penumbra ?? 0]}
                        min={0}
                        max={1}
                        step={0.01}
                        onValueChange={([val]) => setLightProperties(selectedObject.id, { penumbra: val })}
                        data-testid="slider-light-penumbra"
                      />
                    </div>
                  )}
                </div>
              </CollapsibleSection>
              
              <Separator />
            </>
          )}
          
          {/* Animation section */}
          <CollapsibleSection title="Animation" icon={Key}>
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                {selectedObject.keyframes.length} keyframe{selectedObject.keyframes.length !== 1 ? "s" : ""}
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => addKeyframe(selectedObject.id)}
                className="w-full gap-2"
                data-testid="add-keyframe-button"
              >
                <Key className="h-3.5 w-3.5" />
                Add Keyframe
              </Button>
              {selectedObject.keyframes.length > 0 && (
                <div className="space-y-1">
                  {selectedObject.keyframes.map((kf) => (
                    <div
                      key={kf.frame}
                      className="flex items-center justify-between px-2 py-1 bg-muted rounded text-xs"
                    >
                      <span className="font-mono">Frame {kf.frame + 1}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CollapsibleSection>
        </div>
      </ScrollArea>
    </div>
  );
}
