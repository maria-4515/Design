import { useRef, useEffect } from "react";
import { useVideoStore } from "@/lib/videoStore";
import { Button } from "@/components/ui/button";
import {
  Activity,
  Target,
  BarChart3,
  Eye,
  EyeOff,
} from "lucide-react";

function LumaWaveform() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { currentTime, isVideoPlaying } = useVideoStore();
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear with dark background
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, width, height);
    
    // Draw grid lines
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 0.5;
    
    // Horizontal grid (IRE levels)
    const ireLabels = [100, 75, 50, 25, 0];
    ireLabels.forEach((ire) => {
      const y = height - (ire / 100) * height;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
      
      // Label
      ctx.fillStyle = "#666";
      ctx.font = "9px monospace";
      ctx.fillText(`${ire}`, 2, y - 2);
    });
    
    // Simulate luma waveform data
    ctx.fillStyle = "rgba(0, 255, 0, 0.5)";
    
    for (let x = 0; x < width; x++) {
      // Generate fake luminance distribution
      const baseY = Math.sin(x * 0.05 + currentTime) * 20 + height * 0.4;
      const spread = Math.random() * 30 + 10;
      
      for (let i = 0; i < 10; i++) {
        const y = baseY + (Math.random() - 0.5) * spread;
        if (y >= 0 && y < height) {
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
  }, [currentTime, isVideoPlaying]);
  
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-1 px-2 py-1 border-b border-border">
        <Activity className="h-3 w-3 text-chart-2" />
        <span className="text-[10px] font-medium">Luma Waveform</span>
      </div>
      <canvas
        ref={canvasRef}
        width={200}
        height={120}
        className="w-full"
        data-testid="luma-waveform"
      />
    </div>
  );
}

function ChromaVectorscope() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { currentTime, isVideoPlaying } = useVideoStore();
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 10;
    
    // Clear with dark background
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, width, height);
    
    // Draw circle and crosshairs
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 0.5;
    
    // Main circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Inner circles
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.66, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.33, 0, Math.PI * 2);
    ctx.stroke();
    
    // Crosshairs
    ctx.beginPath();
    ctx.moveTo(centerX - radius, centerY);
    ctx.lineTo(centerX + radius, centerY);
    ctx.moveTo(centerX, centerY - radius);
    ctx.lineTo(centerX, centerY + radius);
    ctx.stroke();
    
    // Color target boxes (R, Mg, B, Cy, G, Yl)
    const colorTargets = [
      { angle: 103, color: "#ff0000", label: "R" },   // Red
      { angle: 61, color: "#ff00ff", label: "Mg" },   // Magenta
      { angle: 347, color: "#0000ff", label: "B" },   // Blue
      { angle: 283, color: "#00ffff", label: "Cy" },  // Cyan
      { angle: 241, color: "#00ff00", label: "G" },   // Green
      { angle: 167, color: "#ffff00", label: "Yl" },  // Yellow
    ];
    
    colorTargets.forEach(({ angle, color, label }) => {
      const rad = (angle - 90) * (Math.PI / 180);
      const x = centerX + Math.cos(rad) * radius * 0.75;
      const y = centerY + Math.sin(rad) * radius * 0.75;
      
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.strokeRect(x - 4, y - 4, 8, 8);
      
      ctx.fillStyle = "#666";
      ctx.font = "8px monospace";
      ctx.fillText(label, x + 6, y + 3);
    });
    
    // Simulate chroma data points
    ctx.fillStyle = "rgba(0, 255, 0, 0.3)";
    
    for (let i = 0; i < 500; i++) {
      const angle = Math.random() * Math.PI * 2 + currentTime * 0.1;
      const dist = Math.random() * radius * 0.4 + radius * 0.1;
      const x = centerX + Math.cos(angle) * dist;
      const y = centerY + Math.sin(angle) * dist;
      ctx.fillRect(x, y, 1, 1);
    }
  }, [currentTime, isVideoPlaying]);
  
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-1 px-2 py-1 border-b border-border">
        <Target className="h-3 w-3 text-chart-3" />
        <span className="text-[10px] font-medium">Vectorscope</span>
      </div>
      <canvas
        ref={canvasRef}
        width={150}
        height={150}
        className="w-full aspect-square"
        data-testid="vectorscope"
      />
    </div>
  );
}

function RGBHistogram() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { currentTime, isVideoPlaying } = useVideoStore();
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear with dark background
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, width, height);
    
    // Draw histogram background grid
    ctx.strokeStyle = "#222";
    ctx.lineWidth = 0.5;
    
    for (let i = 0; i <= 4; i++) {
      const x = (i / 4) * width;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    // Generate fake histogram data for RGB channels
    const generateHistogram = () => {
      const data = new Array(256).fill(0);
      // Create a bell curve with some variation
      const mean = 128 + Math.sin(currentTime) * 30;
      const stdDev = 40 + Math.cos(currentTime * 0.5) * 10;
      
      for (let i = 0; i < 256; i++) {
        const x = (i - mean) / stdDev;
        data[i] = Math.exp(-0.5 * x * x) * (0.5 + Math.random() * 0.5);
      }
      return data;
    };
    
    const rHist = generateHistogram();
    const gHist = generateHistogram();
    const bHist = generateHistogram();
    
    // Find max for normalization
    const maxVal = Math.max(...rHist, ...gHist, ...bHist);
    
    // Draw histograms (overlapping)
    const drawHist = (data: number[], color: string) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(0, height);
      
      for (let i = 0; i < 256; i++) {
        const x = (i / 255) * width;
        const y = height - (data[i] / maxVal) * height * 0.9;
        ctx.lineTo(x, y);
      }
      
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();
    };
    
    drawHist(rHist, "rgba(255, 0, 0, 0.3)");
    drawHist(gHist, "rgba(0, 255, 0, 0.3)");
    drawHist(bHist, "rgba(0, 0, 255, 0.3)");
    
    // Draw luminance overlay
    const lumaHist = rHist.map((r, i) => r * 0.299 + gHist[i] * 0.587 + bHist[i] * 0.114);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    
    for (let i = 0; i < 256; i++) {
      const x = (i / 255) * width;
      const y = height - (lumaHist[i] / maxVal) * height * 0.9;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }, [currentTime, isVideoPlaying]);
  
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-1 px-2 py-1 border-b border-border">
        <BarChart3 className="h-3 w-3 text-chart-1" />
        <span className="text-[10px] font-medium">RGB Histogram</span>
      </div>
      <canvas
        ref={canvasRef}
        width={200}
        height={80}
        className="w-full"
        data-testid="histogram"
      />
    </div>
  );
}

export function VideoScopes() {
  const {
    showWaveform,
    showVectorscope,
    showHistogram,
    toggleWaveform,
    toggleVectorscope,
    toggleHistogram,
  } = useVideoStore();
  
  return (
    <div className="h-full flex flex-col bg-card border-l border-border" data-testid="video-scopes">
      {/* Scopes header */}
      <div className="h-8 flex items-center gap-2 px-3 border-b border-border">
        <Activity className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Scopes
        </span>
        
        <div className="flex-1" />
        
        {/* Toggle buttons */}
        <Button
          variant={showWaveform ? "secondary" : "ghost"}
          size="icon"
          className="h-6 w-6"
          onClick={toggleWaveform}
          data-testid="toggle-waveform"
        >
          <Activity className="h-3 w-3" />
        </Button>
        
        <Button
          variant={showVectorscope ? "secondary" : "ghost"}
          size="icon"
          className="h-6 w-6"
          onClick={toggleVectorscope}
          data-testid="toggle-vectorscope"
        >
          <Target className="h-3 w-3" />
        </Button>
        
        <Button
          variant={showHistogram ? "secondary" : "ghost"}
          size="icon"
          className="h-6 w-6"
          onClick={toggleHistogram}
          data-testid="toggle-histogram"
        >
          <BarChart3 className="h-3 w-3" />
        </Button>
      </div>
      
      {/* Scope displays */}
      <div className="flex-1 overflow-y-auto">
        {showWaveform && <LumaWaveform />}
        {showVectorscope && <ChromaVectorscope />}
        {showHistogram && <RGBHistogram />}
        
        {!showWaveform && !showVectorscope && !showHistogram && (
          <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
            Enable a scope to view
          </div>
        )}
      </div>
    </div>
  );
}
