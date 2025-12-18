import { useRef, useEffect, useState } from "react";
import { useCharacterAnimStore } from "@/lib/characterAnimStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Plus,
  Trash2,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Music,
  Film,
  Layers,
  ChevronDown,
  Lock,
  Eye,
  EyeOff,
  Headphones,
} from "lucide-react";
import type { NlaStrip, NlaTrack, AudioSyncTrack } from "@shared/schema";

function NlaTrackRow({ track, strips }: { track: NlaTrack; strips: NlaStrip[] }) {
  const { 
    nlaCurrentFrame, 
    nlaTotalFrames, 
    selectNlaStrip, 
    selectedStripId,
    updateNlaStrip,
  } = useCharacterAnimStore();
  
  const trackStrips = strips.filter(s => track.strips.includes(s.id));
  const pixelsPerFrame = 4;
  
  return (
    <div className="flex border-b border-border" data-testid={`nla-track-${track.id}`}>
      {/* Track header */}
      <div className="w-40 shrink-0 p-2 border-r border-border bg-card flex items-center gap-2">
        <Film className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs flex-1 truncate">{track.name}</span>
        <Button variant="ghost" size="icon" className="h-5 w-5">
          {track.muted ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
        </Button>
      </div>
      
      {/* Track timeline */}
      <div 
        className="flex-1 h-10 relative bg-muted/20"
        style={{ minWidth: nlaTotalFrames * pixelsPerFrame }}
      >
        {trackStrips.map(strip => {
          const left = strip.startFrame * pixelsPerFrame;
          const width = (strip.endFrame - strip.startFrame) * pixelsPerFrame;
          const isSelected = selectedStripId === strip.id;
          
          return (
            <div
              key={strip.id}
              className={`absolute top-1 bottom-1 rounded cursor-pointer ${
                strip.muted ? "opacity-50" : ""
              } ${isSelected ? "ring-2 ring-primary" : ""}`}
              style={{
                left,
                width,
                backgroundColor: `hsl(${(strip.actionId.charCodeAt(0) * 137) % 360}, 60%, 50%)`,
              }}
              onClick={() => selectNlaStrip(strip.id)}
              data-testid={`nla-strip-${strip.id}`}
            >
              <span className="text-[10px] text-white px-1 truncate block">
                {strip.name}
              </span>
            </div>
          );
        })}
        
        {/* Playhead */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-red-500 pointer-events-none z-10"
          style={{ left: nlaCurrentFrame * pixelsPerFrame }}
        />
      </div>
    </div>
  );
}

function AudioTrackRow({ track }: { track: AudioSyncTrack }) {
  const { nlaCurrentFrame, nlaTotalFrames, nlaFps, selectAudioTrack, selectedAudioTrackId } = useCharacterAnimStore();
  const pixelsPerFrame = 4;
  const isSelected = selectedAudioTrackId === track.id;
  
  return (
    <div className="flex border-b border-border" data-testid={`audio-track-${track.id}`}>
      {/* Track header */}
      <div className={`w-40 shrink-0 p-2 border-r border-border flex items-center gap-2 ${
        isSelected ? "bg-primary/10" : "bg-card"
      }`}>
        <Music className="h-3.5 w-3.5 text-green-500" />
        <span className="text-xs flex-1 truncate">{track.name}</span>
        <Button variant="ghost" size="icon" className="h-5 w-5">
          {track.muted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
        </Button>
      </div>
      
      {/* Waveform area */}
      <div 
        className="flex-1 h-10 relative bg-green-950/20 cursor-pointer"
        style={{ minWidth: nlaTotalFrames * pixelsPerFrame }}
        onClick={() => selectAudioTrack(track.id)}
      >
        {/* Simplified waveform visualization */}
        {track.waveformPeaks.length > 0 ? (
          <svg className="w-full h-full">
            {track.waveformPeaks.map((peak, i) => (
              <rect
                key={i}
                x={i * 2}
                y={20 - peak * 20}
                width={1}
                height={peak * 40}
                fill="rgb(34, 197, 94)"
                opacity={0.6}
              />
            ))}
          </svg>
        ) : (
          <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
            {track.audioUrl ? "Loading waveform..." : "No audio"}
          </div>
        )}
        
        {/* Audio markers */}
        {track.markers.map(marker => {
          const frame = marker.time * nlaFps;
          return (
            <div
              key={marker.id}
              className="absolute top-0 bottom-0 w-1 bg-yellow-500"
              style={{ left: frame * pixelsPerFrame }}
              title={marker.name}
            />
          );
        })}
        
        {/* Playhead */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-red-500 pointer-events-none z-10"
          style={{ left: nlaCurrentFrame * pixelsPerFrame }}
        />
      </div>
    </div>
  );
}

function StripProperties() {
  const { nlaStrips, selectedStripId, updateNlaStrip, removeNlaStrip, actions } = useCharacterAnimStore();
  
  const strip = nlaStrips.find(s => s.id === selectedStripId);
  if (!strip) {
    return (
      <div className="p-4 text-center text-muted-foreground text-xs">
        Select a strip to edit
      </div>
    );
  }
  
  const action = actions.find(a => a.id === strip.actionId);
  
  return (
    <ScrollArea className="h-full">
      <div className="p-3 space-y-4">
        <div>
          <Label className="text-xs font-medium">{strip.name}</Label>
          <p className="text-xs text-muted-foreground">Action: {action?.name || "Unknown"}</p>
        </div>
        
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Timing</Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px]">Start</Label>
              <Input
                type="number"
                value={strip.startFrame}
                onChange={(e) => updateNlaStrip(strip.id, { startFrame: parseInt(e.target.value) || 0 })}
                className="h-7 text-xs"
              />
            </div>
            <div>
              <Label className="text-[10px]">End</Label>
              <Input
                type="number"
                value={strip.endFrame}
                onChange={(e) => updateNlaStrip(strip.id, { endFrame: parseInt(e.target.value) || 0 })}
                className="h-7 text-xs"
              />
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Blending</Label>
          
          <div className="flex items-center gap-2">
            <Label className="text-[10px] w-16">Mode</Label>
            <Select
              value={strip.blendMode}
              onValueChange={(v) => updateNlaStrip(strip.id, { blendMode: v as any })}
            >
              <SelectTrigger className="h-7 text-xs flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="replace">Replace</SelectItem>
                <SelectItem value="add">Add</SelectItem>
                <SelectItem value="multiply">Multiply</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label className="text-[10px]">Influence</Label>
              <span className="text-[10px] text-muted-foreground">{Math.round(strip.influence * 100)}%</span>
            </div>
            <Slider
              value={[strip.influence]}
              min={0}
              max={1}
              step={0.01}
              onValueChange={([v]) => updateNlaStrip(strip.id, { influence: v })}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px]">Blend In</Label>
              <Input
                type="number"
                value={strip.blendIn}
                onChange={(e) => updateNlaStrip(strip.id, { blendIn: parseFloat(e.target.value) || 0 })}
                className="h-7 text-xs"
              />
            </div>
            <div>
              <Label className="text-[10px]">Blend Out</Label>
              <Input
                type="number"
                value={strip.blendOut}
                onChange={(e) => updateNlaStrip(strip.id, { blendOut: parseFloat(e.target.value) || 0 })}
                className="h-7 text-xs"
              />
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Playback</Label>
          
          <div className="flex items-center gap-2">
            <Label className="text-[10px] w-16">Scale</Label>
            <Input
              type="number"
              value={strip.scale}
              step={0.1}
              min={0.1}
              max={10}
              onChange={(e) => updateNlaStrip(strip.id, { scale: parseFloat(e.target.value) || 1 })}
              className="h-7 text-xs flex-1"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Label className="text-[10px] w-16">Repeat</Label>
            <Input
              type="number"
              value={strip.repeat}
              min={1}
              onChange={(e) => updateNlaStrip(strip.id, { repeat: parseInt(e.target.value) || 1 })}
              className="h-7 text-xs flex-1"
            />
          </div>
        </div>
        
        <Separator />
        
        <Button
          variant="destructive"
          size="sm"
          className="w-full text-xs"
          onClick={() => removeNlaStrip(strip.id)}
        >
          <Trash2 className="h-3.5 w-3.5 mr-1" />
          Delete Strip
        </Button>
      </div>
    </ScrollArea>
  );
}

export function NlaEditor() {
  const {
    nlaTracks,
    nlaStrips,
    audioTracks,
    nlaCurrentFrame,
    nlaTotalFrames,
    nlaFps,
    isNlaPlaying,
    setNlaCurrentFrame,
    toggleNlaPlayback,
    setNlaTotalFrames,
    addNlaTrack,
    addAudioTrack,
    actions,
    addNlaStrip,
  } = useCharacterAnimStore();
  
  const timelineRef = useRef<HTMLDivElement>(null);
  const pixelsPerFrame = 4;
  
  // Playback loop
  useEffect(() => {
    if (!isNlaPlaying) return;
    
    const interval = setInterval(() => {
      setNlaCurrentFrame((nlaCurrentFrame + 1) % nlaTotalFrames);
    }, 1000 / nlaFps);
    
    return () => clearInterval(interval);
  }, [isNlaPlaying, nlaCurrentFrame, nlaTotalFrames, nlaFps, setNlaCurrentFrame]);
  
  const formatTime = (frame: number) => {
    const seconds = frame / nlaFps;
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const frames = frame % nlaFps;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}:${frames.toString().padStart(2, "0")}`;
  };
  
  return (
    <div className="h-full flex flex-col" data-testid="nla-editor">
      {/* Transport controls */}
      <div className="h-10 flex items-center gap-2 px-3 border-b border-border bg-card">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={() => setNlaCurrentFrame(0)}>
              <SkipBack className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Go to Start</TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={toggleNlaPlayback}>
              {isNlaPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{isNlaPlaying ? "Pause" : "Play"}</TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={() => setNlaCurrentFrame(nlaTotalFrames - 1)}>
              <SkipForward className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Go to End</TooltipContent>
        </Tooltip>
        
        <div className="w-px h-5 bg-border" />
        
        <span className="text-xs font-mono min-w-[80px]">{formatTime(nlaCurrentFrame)}</span>
        
        <Slider
          value={[nlaCurrentFrame]}
          min={0}
          max={nlaTotalFrames - 1}
          step={1}
          onValueChange={([v]) => setNlaCurrentFrame(v)}
          className="w-32"
        />
        
        <Input
          type="number"
          value={nlaCurrentFrame}
          onChange={(e) => setNlaCurrentFrame(parseInt(e.target.value) || 0)}
          className="w-16 h-7 text-xs"
        />
        
        <span className="text-xs text-muted-foreground">/</span>
        
        <Input
          type="number"
          value={nlaTotalFrames}
          onChange={(e) => setNlaTotalFrames(parseInt(e.target.value) || 100)}
          className="w-16 h-7 text-xs"
        />
        
        <div className="flex-1" />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1 text-xs">
              <Plus className="h-3.5 w-3.5" />
              Add Track
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => addNlaTrack(`NLA Track ${nlaTracks.length + 1}`)}>
              <Layers className="h-3.5 w-3.5 mr-2" />
              Animation Track
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => addAudioTrack(`Audio ${audioTracks.length + 1}`)}>
              <Music className="h-3.5 w-3.5 mr-2" />
              Audio Track
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* Timeline content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Timeline area */}
        <div className="flex-1 overflow-auto" ref={timelineRef}>
          {/* Ruler */}
          <div className="flex border-b border-border sticky top-0 z-10 bg-background">
            <div className="w-40 shrink-0 border-r border-border bg-card" />
            <div 
              className="h-6 relative"
              style={{ minWidth: nlaTotalFrames * pixelsPerFrame }}
            >
              {Array.from({ length: Math.ceil(nlaTotalFrames / nlaFps) + 1 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute top-0 h-full flex flex-col items-center"
                  style={{ left: i * nlaFps * pixelsPerFrame }}
                >
                  <div className="h-3 w-px bg-border" />
                  <span className="text-[9px] text-muted-foreground">{i}s</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* NLA Tracks */}
          {nlaTracks.map(track => (
            <NlaTrackRow key={track.id} track={track} strips={nlaStrips} />
          ))}
          
          {/* Audio Tracks */}
          {audioTracks.map(track => (
            <AudioTrackRow key={track.id} track={track} />
          ))}
          
          {nlaTracks.length === 0 && audioTracks.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              <Layers className="h-12 w-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No tracks yet</p>
              <p className="text-xs">Add animation or audio tracks to start</p>
            </div>
          )}
        </div>
        
        {/* Strip properties */}
        <div className="w-52 border-l border-border bg-card shrink-0">
          <div className="p-2 border-b border-border">
            <span className="text-xs font-medium">Strip Properties</span>
          </div>
          <StripProperties />
        </div>
      </div>
      
      {/* Actions library */}
      <div className="h-24 border-t border-border bg-card flex">
        <div className="w-40 shrink-0 p-2 border-r border-border">
          <span className="text-xs font-medium">Actions</span>
        </div>
        <ScrollArea className="flex-1" orientation="horizontal">
          <div className="flex gap-2 p-2">
            {actions.map(action => (
              <div
                key={action.id}
                className="shrink-0 w-28 h-16 rounded bg-muted/50 border border-border p-2 cursor-grab hover-elevate"
                draggable
                onDragEnd={(e) => {
                  // Simple drop handling
                  if (nlaTracks.length > 0) {
                    addNlaStrip(nlaTracks[0].id, action.id, nlaCurrentFrame);
                  }
                }}
                data-testid={`action-${action.id}`}
              >
                <span className="text-xs font-medium truncate block">{action.name}</span>
                <span className="text-[10px] text-muted-foreground">
                  {action.frameEnd - action.frameStart} frames
                </span>
              </div>
            ))}
            {actions.length === 0 && (
              <div className="flex items-center justify-center text-xs text-muted-foreground px-4">
                Create actions in the Action Editor to add them here
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
