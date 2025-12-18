import { useRef, useEffect, useMemo } from "react";
import { useVideoStore } from "@/lib/videoStore";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Volume2,
  VolumeX,
  Headphones,
  Disc,
} from "lucide-react";

function VolumeSlider({ 
  value, 
  onChange,
  vertical = true,
}: { 
  value: number; 
  onChange: (value: number) => void;
  vertical?: boolean;
}) {
  // Convert 0-2 to dB display (-inf to +6dB)
  const toDb = (v: number) => {
    if (v <= 0) return -Infinity;
    return 20 * Math.log10(v);
  };
  
  const dbValue = toDb(value);
  const displayDb = dbValue === -Infinity ? "-inf" : `${dbValue.toFixed(1)}`;
  
  return (
    <div className={`flex ${vertical ? "flex-col items-center" : "flex-row items-center gap-2"}`}>
      {vertical && (
        <div className="h-24 w-6 relative flex items-center justify-center">
          <input
            type="range"
            min={0}
            max={200}
            value={value * 100}
            onChange={(e) => onChange(parseInt(e.target.value) / 100)}
            className="h-24 w-2 accent-primary cursor-pointer"
            style={{
              writingMode: "vertical-lr",
              direction: "rtl",
            }}
          />
        </div>
      )}
      {!vertical && (
        <Slider
          value={[value * 100]}
          min={0}
          max={200}
          step={1}
          onValueChange={([v]) => onChange(v / 100)}
          className="w-20"
        />
      )}
      <span className="text-[10px] text-muted-foreground font-mono mt-1">
        {displayDb}dB
      </span>
    </div>
  );
}

function PanKnob({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  // value is -1 to 1 (L to R)
  const display = value === 0 ? "C" : value < 0 ? `L${Math.abs(Math.round(value * 100))}` : `R${Math.round(value * 100)}`;
  
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center">
        <div 
          className="absolute w-0.5 h-3 bg-primary origin-bottom rounded"
          style={{ 
            transform: `rotate(${value * 135}deg)`,
            bottom: "50%",
          }}
        />
        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
      </div>
      <input
        type="range"
        min={-100}
        max={100}
        value={value * 100}
        onChange={(e) => onChange(parseInt(e.target.value) / 100)}
        className="w-8 h-1 accent-primary cursor-pointer"
      />
      <span className="text-[9px] text-muted-foreground font-mono">{display}</span>
    </div>
  );
}

function LevelMeter({ level }: { level: number }) {
  // level is 0-1 representing audio level
  const height = Math.min(level * 100, 100);
  const isClipping = level > 0.95;
  
  return (
    <div className="w-3 h-20 bg-muted rounded-sm overflow-hidden relative">
      <div 
        className={`absolute bottom-0 left-0 right-0 transition-all duration-75 ${
          isClipping ? "bg-destructive" : level > 0.7 ? "bg-chart-4" : "bg-chart-2"
        }`}
        style={{ height: `${height}%` }}
      />
      {/* Peak markers */}
      <div className="absolute top-0 left-0 right-0 h-px bg-destructive/50" style={{ top: "5%" }} />
      <div className="absolute left-0 right-0 h-px bg-chart-4/50" style={{ top: "30%" }} />
    </div>
  );
}

function AudioChannel({ 
  trackId, 
  name, 
  volume, 
  pan, 
  muted, 
  solo,
  level,
}: { 
  trackId: string;
  name: string;
  volume: number;
  pan: number;
  muted: boolean;
  solo: boolean;
  level: number;
}) {
  const { 
    setChannelVolume, 
    setChannelPan, 
    toggleTrackMute, 
    toggleTrackSolo 
  } = useVideoStore();
  
  return (
    <div className="w-20 flex-shrink-0 flex flex-col items-center gap-2 p-2 border-r border-border">
      {/* Channel name */}
      <span className="text-[10px] font-medium truncate w-full text-center">
        {name}
      </span>
      
      {/* Level meter and fader */}
      <div className="flex gap-1 items-center">
        <LevelMeter level={level} />
        <VolumeSlider value={volume} onChange={(v) => setChannelVolume(trackId, v)} />
      </div>
      
      {/* Pan control */}
      <PanKnob value={pan} onChange={(v) => setChannelPan(trackId, v)} />
      
      {/* Mute/Solo buttons */}
      <div className="flex gap-1">
        <Button
          variant={muted ? "destructive" : "ghost"}
          size="icon"
          className="h-6 w-6"
          onClick={() => toggleTrackMute(trackId)}
          data-testid={`mixer-mute-${trackId}`}
        >
          {muted ? (
            <VolumeX className="h-3 w-3" />
          ) : (
            <Volume2 className="h-3 w-3" />
          )}
        </Button>
        
        <Button
          variant={solo ? "default" : "ghost"}
          size="icon"
          className="h-6 w-6"
          onClick={() => toggleTrackSolo(trackId)}
          data-testid={`mixer-solo-${trackId}`}
        >
          <Headphones className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

function WaveformDisplay({ trackId }: { trackId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { clips, assets, projectDuration, timelineZoom, currentTime } = useVideoStore();
  
  // Get audio clips for this track
  const audioClips = clips.filter(c => c.trackId === trackId);
  
  // Draw waveform (simplified placeholder)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, width, height);
    
    // Draw waveform placeholder for each clip
    audioClips.forEach((clip) => {
      const startX = (clip.startTime / projectDuration) * width;
      const clipWidth = (clip.duration / projectDuration) * width;
      
      ctx.fillStyle = "#3b82f6";
      
      // Generate fake waveform data
      const bars = Math.floor(clipWidth / 3);
      for (let i = 0; i < bars; i++) {
        const x = startX + i * 3;
        const barHeight = Math.random() * height * 0.8 + height * 0.1;
        const y = (height - barHeight) / 2;
        ctx.fillRect(x, y, 2, barHeight);
      }
    });
    
    // Draw playhead position
    const playheadX = (currentTime / projectDuration) * width;
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.fillRect(playheadX, 0, 1, height);
  }, [audioClips, projectDuration, currentTime]);
  
  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={60}
      className="w-full h-full"
      data-testid={`waveform-${trackId}`}
    />
  );
}

export function AudioMixer() {
  const {
    tracks,
    audioChannels,
    masterVolume,
    setMasterVolume,
    currentTime,
    isVideoPlaying,
  } = useVideoStore();
  
  // Get audio tracks
  const audioTracks = useMemo(() => 
    tracks.filter(t => t.type === "audio"),
    [tracks]
  );
  
  // Simulate audio levels (in real implementation, would use Web Audio API)
  const getTrackLevel = (trackId: string) => {
    if (!isVideoPlaying) return 0;
    return Math.random() * 0.7 + 0.1; // Fake level
  };
  
  return (
    <div className="h-full flex flex-col bg-card border-l border-border" data-testid="audio-mixer">
      {/* Mixer header */}
      <div className="h-8 flex items-center gap-2 px-3 border-b border-border">
        <Disc className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Audio Mixer
        </span>
      </div>
      
      {/* Waveform display */}
      <div className="h-16 border-b border-border p-1">
        {audioTracks.length > 0 ? (
          <WaveformDisplay trackId={audioTracks[0].id} />
        ) : (
          <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
            No audio tracks
          </div>
        )}
      </div>
      
      {/* Channel strips */}
      <ScrollArea className="flex-1">
        <div className="flex">
          {/* Audio track channels */}
          {audioTracks.map((track) => {
            const channel = audioChannels.find(c => c.trackId === track.id);
            return (
              <AudioChannel
                key={track.id}
                trackId={track.id}
                name={track.name}
                volume={channel?.volume ?? track.volume}
                pan={channel?.pan ?? 0}
                muted={track.muted}
                solo={track.solo}
                level={getTrackLevel(track.id)}
              />
            );
          })}
          
          {/* Master channel */}
          <div className="w-24 flex-shrink-0 flex flex-col items-center gap-2 p-2 bg-muted/30">
            <span className="text-[10px] font-semibold">MASTER</span>
            
            <div className="flex gap-1 items-center">
              <LevelMeter level={isVideoPlaying ? Math.random() * 0.8 + 0.1 : 0} />
              <LevelMeter level={isVideoPlaying ? Math.random() * 0.8 + 0.1 : 0} />
              <VolumeSlider value={masterVolume} onChange={setMasterVolume} />
            </div>
            
            <span className="text-[10px] text-muted-foreground">L   R</span>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
