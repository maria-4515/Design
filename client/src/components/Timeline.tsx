import { useEditorStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ChevronLeft,
  ChevronRight,
  Clock,
  Diamond,
} from "lucide-react";
import { useEffect, useRef } from "react";

function TimelineRuler() {
  const { currentFrame, totalFrames, setCurrentFrame } = useEditorStore();
  const rulerRef = useRef<HTMLDivElement>(null);
  
  const frameWidth = 8; // pixels per frame
  const majorInterval = 10; // major tick every 10 frames
  
  const handleRulerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!rulerRef.current) return;
    const rect = rulerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const frame = Math.floor(x / frameWidth);
    setCurrentFrame(Math.max(0, Math.min(frame, totalFrames - 1)));
  };
  
  return (
    <div
      ref={rulerRef}
      className="h-6 bg-muted relative cursor-pointer select-none"
      onClick={handleRulerClick}
      data-testid="timeline-ruler"
    >
      {/* Frame markers */}
      <div className="absolute inset-0 flex">
        {Array.from({ length: totalFrames }).map((_, i) => (
          <div
            key={i}
            className="flex-shrink-0 border-l border-border/50"
            style={{ width: frameWidth }}
          >
            {i % majorInterval === 0 && (
              <span className="text-[9px] text-muted-foreground ml-0.5">
                {i + 1}
              </span>
            )}
          </div>
        ))}
      </div>
      
      {/* Playhead */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-primary z-10"
        style={{ left: currentFrame * frameWidth }}
      >
        <div className="absolute -top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-primary rotate-45" />
      </div>
    </div>
  );
}

function ObjectTrack({
  objectId,
  objectName,
  keyframes,
  totalFrames,
  currentFrame,
}: {
  objectId: string;
  objectName: string;
  keyframes: { frame: number }[];
  totalFrames: number;
  currentFrame: number;
}) {
  const { selectObject, selectedObjectId, removeKeyframe } = useEditorStore();
  const isSelected = selectedObjectId === objectId;
  const frameWidth = 8;
  
  return (
    <div
      className={`flex border-b border-border ${isSelected ? "bg-accent/30" : ""}`}
      onClick={() => selectObject(objectId)}
      data-testid={`track-${objectId}`}
    >
      {/* Track label */}
      <div className="w-32 flex-shrink-0 px-2 py-1.5 border-r border-border bg-card">
        <span className="text-xs truncate block">{objectName}</span>
      </div>
      
      {/* Track keyframes */}
      <div className="flex-1 relative h-8">
        <div className="absolute inset-0 flex">
          {Array.from({ length: totalFrames }).map((_, i) => (
            <div
              key={i}
              className={`flex-shrink-0 border-l border-border/20 ${
                i === currentFrame ? "bg-primary/10" : ""
              }`}
              style={{ width: frameWidth }}
            />
          ))}
        </div>
        
        {/* Keyframe diamonds */}
        {keyframes.map((kf) => (
          <div
            key={kf.frame}
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 cursor-pointer group"
            style={{ left: kf.frame * frameWidth + frameWidth / 2 }}
            onClick={(e) => {
              e.stopPropagation();
            }}
            onDoubleClick={(e) => {
              e.stopPropagation();
              removeKeyframe(objectId, kf.frame);
            }}
          >
            <Diamond
              className="h-3 w-3 fill-chart-4 text-chart-4 group-hover:scale-125 transition-transform"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function Timeline() {
  const {
    objects,
    currentFrame,
    totalFrames,
    fps,
    isPlaying,
    setCurrentFrame,
    setTotalFrames,
    setFps,
    togglePlayback,
  } = useEditorStore();
  
  // Playback animation loop
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentFrame((currentFrame + 1) % totalFrames);
    }, 1000 / fps);
    
    return () => clearInterval(interval);
  }, [isPlaying, currentFrame, totalFrames, fps, setCurrentFrame]);
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      switch (e.key) {
        case " ":
          e.preventDefault();
          togglePlayback();
          break;
        case "ArrowLeft":
          setCurrentFrame(Math.max(0, currentFrame - 1));
          break;
        case "ArrowRight":
          setCurrentFrame(Math.min(totalFrames - 1, currentFrame + 1));
          break;
        case "Home":
          setCurrentFrame(0);
          break;
        case "End":
          setCurrentFrame(totalFrames - 1);
          break;
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentFrame, totalFrames, togglePlayback, setCurrentFrame]);
  
  const objectsWithKeyframes = objects.filter((o) => o.keyframes.length > 0);
  
  return (
    <div className="h-full flex flex-col bg-card border-t border-border" data-testid="timeline-panel">
      {/* Timeline header */}
      <div className="h-10 flex items-center gap-2 px-3 border-b border-border">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Timeline
        </span>
        
        <div className="flex-1" />
        
        {/* Playback controls */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setCurrentFrame(0)}
            data-testid="timeline-go-start"
          >
            <SkipBack className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setCurrentFrame(Math.max(0, currentFrame - 1))}
            data-testid="timeline-prev-frame"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant={isPlaying ? "secondary" : "ghost"}
            size="icon"
            className="h-7 w-7"
            onClick={togglePlayback}
            data-testid="timeline-play"
          >
            {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setCurrentFrame(Math.min(totalFrames - 1, currentFrame + 1))}
            data-testid="timeline-next-frame"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setCurrentFrame(totalFrames - 1)}
            data-testid="timeline-go-end"
          >
            <SkipForward className="h-3.5 w-3.5" />
          </Button>
        </div>
        
        {/* Frame display */}
        <div className="flex items-center gap-2 ml-2">
          <span className="text-xs text-muted-foreground">Frame:</span>
          <Input
            type="number"
            min={1}
            max={totalFrames}
            value={currentFrame + 1}
            onChange={(e) => setCurrentFrame(parseInt(e.target.value, 10) - 1 || 0)}
            className="h-7 w-16 text-xs font-mono"
            data-testid="timeline-frame-input"
          />
          <span className="text-xs text-muted-foreground">/ {totalFrames}</span>
        </div>
        
        {/* FPS control */}
        <div className="flex items-center gap-2 ml-4">
          <Label className="text-xs text-muted-foreground">FPS:</Label>
          <Input
            type="number"
            min={1}
            max={120}
            value={fps}
            onChange={(e) => setFps(parseInt(e.target.value, 10) || 24)}
            className="h-7 w-12 text-xs font-mono"
            data-testid="timeline-fps-input"
          />
        </div>
        
        {/* Duration control */}
        <div className="flex items-center gap-2 ml-4">
          <Label className="text-xs text-muted-foreground">Duration:</Label>
          <Input
            type="number"
            min={1}
            max={9999}
            value={totalFrames}
            onChange={(e) => setTotalFrames(parseInt(e.target.value, 10) || 120)}
            className="h-7 w-16 text-xs font-mono"
            data-testid="timeline-duration-input"
          />
        </div>
      </div>
      
      {/* Timeline content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Ruler */}
        <div className="flex border-b border-border">
          <div className="w-32 flex-shrink-0 border-r border-border bg-card" />
          <div className="flex-1 overflow-x-auto">
            <TimelineRuler />
          </div>
        </div>
        
        {/* Tracks */}
        <ScrollArea className="flex-1">
          {objects.length === 0 ? (
            <div className="flex items-center justify-center h-full py-8">
              <p className="text-sm text-muted-foreground">
                Add objects and keyframes to see animation tracks
              </p>
            </div>
          ) : (
            <div>
              {objects.map((object) => (
                <ObjectTrack
                  key={object.id}
                  objectId={object.id}
                  objectName={object.name}
                  keyframes={object.keyframes}
                  totalFrames={totalFrames}
                  currentFrame={currentFrame}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
