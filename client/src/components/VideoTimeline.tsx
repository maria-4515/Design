import { useRef, useEffect, useState, useCallback } from "react";
import { useVideoStore } from "@/lib/videoStore";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Plus,
  Minus,
  Scissors,
  Trash2,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Film,
  Music,
  Image,
  Box,
  Layers,
  Circle,
} from "lucide-react";
import type { Track, Clip, TrackType } from "@shared/schema";

const TRACK_HEIGHT = 48;
const HEADER_WIDTH = 200;

function TrackTypeIcon({ type }: { type: TrackType }) {
  switch (type) {
    case "video":
      return <Film className="h-3.5 w-3.5" />;
    case "audio":
      return <Music className="h-3.5 w-3.5" />;
    case "image":
      return <Image className="h-3.5 w-3.5" />;
    case "scene":
      return <Box className="h-3.5 w-3.5" />;
    case "adjustment":
      return <Layers className="h-3.5 w-3.5" />;
    case "mask":
      return <Circle className="h-3.5 w-3.5" />;
    case "effect":
      return <Layers className="h-3.5 w-3.5" />;
    default:
      return <Film className="h-3.5 w-3.5" />;
  }
}

function TrackHeader({ track }: { track: Track }) {
  const { 
    toggleTrackMute, 
    toggleTrackLock, 
    toggleTrackVisibility,
    toggleTrackSolo,
    selectedTrackId,
    selectTrack,
  } = useVideoStore();
  
  const isSelected = selectedTrackId === track.id;
  
  return (
    <div
      className={`h-12 flex items-center gap-2 px-2 border-b border-border cursor-pointer ${
        isSelected ? "bg-accent/30" : "hover-elevate"
      }`}
      onClick={() => selectTrack(track.id)}
      data-testid={`track-header-${track.id}`}
    >
      <TrackTypeIcon type={track.type} />
      <span className="flex-1 text-xs truncate">{track.name}</span>
      
      <div className="flex items-center gap-0.5">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={(e) => {
            e.stopPropagation();
            toggleTrackMute(track.id);
          }}
          data-testid={`track-mute-${track.id}`}
        >
          {track.muted ? (
            <VolumeX className="h-3 w-3 text-destructive" />
          ) : (
            <Volume2 className="h-3 w-3" />
          )}
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={(e) => {
            e.stopPropagation();
            toggleTrackVisibility(track.id);
          }}
          data-testid={`track-visibility-${track.id}`}
        >
          {track.visible ? (
            <Eye className="h-3 w-3" />
          ) : (
            <EyeOff className="h-3 w-3 text-muted-foreground" />
          )}
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={(e) => {
            e.stopPropagation();
            toggleTrackLock(track.id);
          }}
          data-testid={`track-lock-${track.id}`}
        >
          {track.locked ? (
            <Lock className="h-3 w-3 text-chart-4" />
          ) : (
            <Unlock className="h-3 w-3" />
          )}
        </Button>
      </div>
    </div>
  );
}

function ClipBlock({ clip, zoom }: { clip: Clip; zoom: number }) {
  const { selectedClipId, selectClip, assets, currentTime } = useVideoStore();
  const isSelected = selectedClipId === clip.id;
  const asset = clip.assetId ? assets.find(a => a.id === clip.assetId) : null;
  
  const left = clip.startTime * zoom;
  const width = clip.duration * zoom;
  
  // Determine clip color based on asset type
  const getClipColor = () => {
    if (!asset) return "bg-chart-3"; // Adjustment layer
    switch (asset.type) {
      case "video":
        return "bg-chart-1";
      case "audio":
        return "bg-chart-2";
      case "image":
        return "bg-chart-4";
      case "scene":
        return "bg-chart-5";
      default:
        return "bg-primary";
    }
  };
  
  const isActive = currentTime >= clip.startTime && currentTime < clip.startTime + clip.duration;
  
  return (
    <div
      className={`absolute top-1 bottom-1 rounded-md cursor-pointer transition-all ${getClipColor()} ${
        isSelected ? "ring-2 ring-primary ring-offset-1 ring-offset-background" : ""
      } ${isActive ? "opacity-100" : "opacity-80"}`}
      style={{ left, width: Math.max(width, 4) }}
      onClick={(e) => {
        e.stopPropagation();
        selectClip(clip.id);
      }}
      data-testid={`clip-${clip.id}`}
    >
      <div className="h-full px-2 flex items-center overflow-hidden">
        <span className="text-[10px] text-white truncate font-medium drop-shadow-sm">
          {clip.name}
        </span>
      </div>
      
      {/* Speed indicator */}
      {clip.speed !== 1 && (
        <div className="absolute top-0.5 right-1 text-[8px] bg-black/50 px-1 rounded text-white">
          {clip.speed}x
        </div>
      )}
      
      {/* Effect indicator */}
      {clip.effects.length > 0 && (
        <div className="absolute bottom-0.5 right-1 text-[8px] bg-black/50 px-1 rounded text-white">
          FX: {clip.effects.length}
        </div>
      )}
    </div>
  );
}

function TrackLane({ track, zoom }: { track: Track; zoom: number }) {
  const { clips, selectTrack, selectedTrackId } = useVideoStore();
  const trackClips = clips.filter(c => c.trackId === track.id);
  const isSelected = selectedTrackId === track.id;
  
  return (
    <div
      className={`h-12 relative border-b border-border ${
        isSelected ? "bg-accent/10" : ""
      } ${track.locked ? "opacity-50" : ""}`}
      onClick={() => selectTrack(track.id)}
      data-testid={`track-lane-${track.id}`}
    >
      {trackClips.map((clip) => (
        <ClipBlock key={clip.id} clip={clip} zoom={zoom} />
      ))}
    </div>
  );
}

function TimelineRuler({ zoom, duration }: { zoom: number; duration: number }) {
  const { currentTime, setCurrentTime, projectFps } = useVideoStore();
  const rulerRef = useRef<HTMLDivElement>(null);
  
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!rulerRef.current) return;
    const rect = rulerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const time = x / zoom;
    setCurrentTime(Math.max(0, Math.min(time, duration)));
  };
  
  // Calculate tick intervals based on zoom
  const majorInterval = zoom > 100 ? 1 : zoom > 50 ? 5 : zoom > 20 ? 10 : 30;
  const minorInterval = majorInterval / 5;
  
  const formatRulerTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    if (minutes > 0) {
      return `${minutes}:${String(seconds).padStart(2, "0")}`;
    }
    return `${seconds}s`;
  };
  
  return (
    <div
      ref={rulerRef}
      className="h-6 bg-muted relative cursor-pointer select-none"
      onClick={handleClick}
      style={{ width: duration * zoom }}
      data-testid="timeline-ruler"
    >
      {/* Time markers */}
      {Array.from({ length: Math.ceil(duration / minorInterval) + 1 }).map((_, i) => {
        const time = i * minorInterval;
        if (time > duration) return null;
        const isMajor = time % majorInterval === 0;
        
        return (
          <div
            key={i}
            className="absolute top-0 bottom-0"
            style={{ left: time * zoom }}
          >
            <div 
              className={`w-px ${isMajor ? "h-full bg-border" : "h-2 bg-border/50"}`}
            />
            {isMajor && (
              <span className="absolute top-1 left-1 text-[9px] text-muted-foreground">
                {formatRulerTime(time)}
              </span>
            )}
          </div>
        );
      })}
      
      {/* Playhead */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-primary z-20 pointer-events-none"
        style={{ left: currentTime * zoom }}
      >
        <div className="absolute -top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary rotate-45" />
      </div>
    </div>
  );
}

export function VideoTimeline() {
  const {
    tracks,
    clips,
    projectDuration,
    timelineZoom,
    setTimelineZoom,
    currentTime,
    selectedClipId,
    removeClip,
    splitClip,
    addTrack,
  } = useVideoStore();
  
  const timelineRef = useRef<HTMLDivElement>(null);
  
  // Sort tracks by index
  const sortedTracks = [...tracks].sort((a, b) => a.index - b.index);
  
  // Group tracks by type for organization
  const videoTracks = sortedTracks.filter(t => t.type === "video");
  const imageTracks = sortedTracks.filter(t => t.type === "image");
  const sceneTracks = sortedTracks.filter(t => t.type === "scene");
  const adjustmentTracks = sortedTracks.filter(t => t.type === "adjustment");
  const maskTracks = sortedTracks.filter(t => t.type === "mask");
  const audioTracks = sortedTracks.filter(t => t.type === "audio");
  
  const handleZoomIn = () => setTimelineZoom(timelineZoom * 1.25);
  const handleZoomOut = () => setTimelineZoom(timelineZoom / 1.25);
  
  const handleDeleteClip = () => {
    if (selectedClipId) {
      removeClip(selectedClipId);
    }
  };
  
  const handleSplitClip = () => {
    if (selectedClipId) {
      splitClip(selectedClipId, currentTime);
    }
  };
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedClipId) {
          e.preventDefault();
          handleDeleteClip();
        }
      }
      
      if (e.key === "s" && e.ctrlKey) {
        e.preventDefault();
        handleSplitClip();
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedClipId, currentTime]);
  
  return (
    <div className="h-full flex flex-col bg-card border-t border-border" data-testid="video-timeline">
      {/* Timeline toolbar */}
      <div className="h-8 flex items-center gap-2 px-3 border-b border-border">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Timeline
        </span>
        
        <div className="flex-1" />
        
        {/* Track controls */}
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => addTrack("video")}
          data-testid="add-video-track"
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
        
        <div className="w-px h-4 bg-border" />
        
        {/* Clip controls */}
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={handleSplitClip}
          disabled={!selectedClipId}
          data-testid="split-clip"
        >
          <Scissors className="h-3.5 w-3.5" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={handleDeleteClip}
          disabled={!selectedClipId}
          data-testid="delete-clip"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
        
        <div className="w-px h-4 bg-border" />
        
        {/* Zoom controls */}
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={handleZoomOut}
          data-testid="zoom-out"
        >
          <Minus className="h-3.5 w-3.5" />
        </Button>
        
        <span className="text-xs text-muted-foreground w-12 text-center">
          {Math.round(timelineZoom)}px/s
        </span>
        
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={handleZoomIn}
          data-testid="zoom-in"
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
      
      {/* Timeline content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Track headers */}
        <div className="w-48 flex-shrink-0 border-r border-border overflow-y-auto">
          <div className="h-6 border-b border-border bg-muted" /> {/* Ruler spacer */}
          
          {/* Video tracks */}
          {videoTracks.map((track) => (
            <TrackHeader key={track.id} track={track} />
          ))}
          
          {/* Image tracks */}
          {imageTracks.map((track) => (
            <TrackHeader key={track.id} track={track} />
          ))}
          
          {/* Scene tracks */}
          {sceneTracks.map((track) => (
            <TrackHeader key={track.id} track={track} />
          ))}
          
          {/* Adjustment tracks */}
          {adjustmentTracks.map((track) => (
            <TrackHeader key={track.id} track={track} />
          ))}
          
          {/* Mask tracks */}
          {maskTracks.map((track) => (
            <TrackHeader key={track.id} track={track} />
          ))}
          
          {/* Audio tracks */}
          {audioTracks.map((track) => (
            <TrackHeader key={track.id} track={track} />
          ))}
        </div>
        
        {/* Timeline lanes */}
        <ScrollArea className="flex-1">
          <div 
            ref={timelineRef}
            className="relative"
            style={{ minWidth: projectDuration * timelineZoom }}
          >
            {/* Ruler */}
            <TimelineRuler zoom={timelineZoom} duration={projectDuration} />
            
            {/* Playhead line through all tracks */}
            <div
              className="absolute top-6 bottom-0 w-0.5 bg-primary/50 z-10 pointer-events-none"
              style={{ left: currentTime * timelineZoom }}
            />
            
            {/* Track lanes */}
            {videoTracks.map((track) => (
              <TrackLane key={track.id} track={track} zoom={timelineZoom} />
            ))}
            
            {imageTracks.map((track) => (
              <TrackLane key={track.id} track={track} zoom={timelineZoom} />
            ))}
            
            {sceneTracks.map((track) => (
              <TrackLane key={track.id} track={track} zoom={timelineZoom} />
            ))}
            
            {adjustmentTracks.map((track) => (
              <TrackLane key={track.id} track={track} zoom={timelineZoom} />
            ))}
            
            {maskTracks.map((track) => (
              <TrackLane key={track.id} track={track} zoom={timelineZoom} />
            ))}
            
            {audioTracks.map((track) => (
              <TrackLane key={track.id} track={track} zoom={timelineZoom} />
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
