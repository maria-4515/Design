import { useRef, useEffect, useState, useCallback } from "react";
import { useVideoStore } from "@/lib/videoStore";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize2,
  Settings,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function VideoPreview() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  
  const {
    currentTime,
    projectDuration,
    projectFps,
    projectWidth,
    projectHeight,
    isVideoPlaying,
    playbackSpeed,
    masterVolume,
    setCurrentTime,
    toggleVideoPlayback,
    setPlaybackSpeed,
    setMasterVolume,
    clips,
    assets,
  } = useVideoStore();
  
  // Format time as MM:SS:FF
  const formatTime = useCallback((time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const frames = Math.floor((time % 1) * projectFps);
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}:${String(frames).padStart(2, "0")}`;
  }, [projectFps]);
  
  // Playback loop
  useEffect(() => {
    if (!isVideoPlaying) return;
    
    const interval = setInterval(() => {
      const newTime = currentTime + (1 / projectFps) * playbackSpeed;
      if (newTime >= projectDuration) {
        setCurrentTime(0);
      } else {
        setCurrentTime(newTime);
      }
    }, 1000 / projectFps);
    
    return () => clearInterval(interval);
  }, [isVideoPlaying, currentTime, projectFps, projectDuration, playbackSpeed, setCurrentTime]);
  
  // Render preview canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Clear canvas
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Get clips at current time
    const activeClips = clips.filter(c => 
      currentTime >= c.startTime && currentTime < c.startTime + c.duration
    );
    
    // Render each active clip (simple placeholder for now)
    activeClips.forEach((clip) => {
      const asset = clip.assetId ? assets.find(a => a.id === clip.assetId) : null;
      
      if (asset?.type === "image" || asset?.type === "video") {
        // Draw a placeholder with clip info
        ctx.fillStyle = "#2d2d2d";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = "#888";
        ctx.font = "16px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(clip.name, canvas.width / 2, canvas.height / 2);
      }
    });
    
    // If no clips, show empty state
    if (activeClips.length === 0) {
      ctx.fillStyle = "#666";
      ctx.font = "14px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("No media at current time", canvas.width / 2, canvas.height / 2);
    }
    
    // Draw timecode overlay
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(10, canvas.height - 30, 120, 24);
    ctx.fillStyle = "#fff";
    ctx.font = "12px monospace";
    ctx.textAlign = "left";
    ctx.fillText(formatTime(currentTime), 16, canvas.height - 12);
  }, [currentTime, clips, assets, formatTime]);
  
  const handleSkipBack = () => setCurrentTime(Math.max(0, currentTime - 5));
  const handleSkipForward = () => setCurrentTime(Math.min(projectDuration, currentTime + 5));
  
  const speedOptions = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];
  
  return (
    <div className="h-full flex flex-col bg-card" data-testid="video-preview">
      {/* Preview header */}
      <div className="h-8 flex items-center gap-2 px-3 border-b border-border">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Preview
        </span>
        <div className="flex-1" />
        <span className="text-xs text-muted-foreground">
          {projectWidth} x {projectHeight} @ {projectFps}fps
        </span>
      </div>
      
      {/* Preview canvas container */}
      <div 
        ref={containerRef}
        className="flex-1 flex items-center justify-center bg-black overflow-hidden p-2"
      >
        <canvas
          ref={canvasRef}
          width={projectWidth}
          height={projectHeight}
          className="max-w-full max-h-full object-contain"
          style={{ aspectRatio: `${projectWidth} / ${projectHeight}` }}
          data-testid="video-canvas"
        />
      </div>
      
      {/* Playback controls */}
      <div className="h-12 flex items-center gap-2 px-3 border-t border-border">
        {/* Time display */}
        <div className="w-24 text-xs font-mono text-muted-foreground">
          {formatTime(currentTime)}
        </div>
        
        {/* Transport controls */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSkipBack}
            data-testid="video-skip-back"
          >
            <SkipBack className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleVideoPlayback}
            data-testid="video-play-pause"
          >
            {isVideoPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSkipForward}
            data-testid="video-skip-forward"
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Timeline scrubber */}
        <div className="flex-1 px-2">
          <Slider
            value={[currentTime]}
            min={0}
            max={projectDuration}
            step={1 / projectFps}
            onValueChange={([value]) => setCurrentTime(value)}
            data-testid="video-scrubber"
          />
        </div>
        
        {/* Duration display */}
        <div className="w-24 text-xs font-mono text-muted-foreground text-right">
          {formatTime(projectDuration)}
        </div>
        
        {/* Volume control */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setIsMuted(!isMuted);
              setMasterVolume(isMuted ? 1 : 0);
            }}
            data-testid="video-mute"
          >
            {isMuted || masterVolume === 0 ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
          <div className="w-16">
            <Slider
              value={[masterVolume * 100]}
              min={0}
              max={100}
              step={1}
              onValueChange={([value]) => setMasterVolume(value / 100)}
              data-testid="video-volume"
            />
          </div>
        </div>
        
        {/* Speed selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="text-xs">
              {playbackSpeed}x
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {speedOptions.map((speed) => (
              <DropdownMenuItem
                key={speed}
                onClick={() => setPlaybackSpeed(speed)}
              >
                {speed}x
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        
        {/* Settings */}
        <Button variant="ghost" size="icon" data-testid="video-settings">
          <Settings className="h-4 w-4" />
        </Button>
        
        {/* Fullscreen */}
        <Button variant="ghost" size="icon" data-testid="video-fullscreen">
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
