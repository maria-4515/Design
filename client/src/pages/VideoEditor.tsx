import { useEffect, useState, useCallback } from "react";
import { VideoPreview } from "@/components/VideoPreview";
import { VideoTimeline } from "@/components/VideoTimeline";
import { AudioMixer } from "@/components/AudioMixer";
import { VideoScopes } from "@/components/VideoScopes";
import { MediaLibrary } from "@/components/MediaLibrary";
import { ClipProperties } from "@/components/ClipProperties";
import { useVideoStore } from "@/lib/videoStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Box,
  Film,
  Layers,
  Save,
  FolderOpen,
  Download,
  Settings,
  Undo2,
  Redo2,
  User,
  Upload,
  Image,
  Music,
  HelpCircle,
  Keyboard,
} from "lucide-react";
import { Link } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

function KeyboardShortcuts() {
  const shortcuts = [
    { key: "Space", action: "Play / Pause" },
    { key: "Left/Right", action: "Previous / Next frame" },
    { key: "J / L", action: "Skip 5 seconds" },
    { key: "Home / End", action: "Go to start / end" },
    { key: "I / O", action: "Set in / out point" },
    { key: "Delete", action: "Delete selected clip" },
    { key: "Ctrl+S", action: "Split clip at playhead" },
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

function WelcomeOverlay({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-20">
      <div className="bg-card border border-border rounded-lg p-6 max-w-md text-center space-y-4">
        <div className="flex justify-center gap-3">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Film className="h-6 w-6 text-primary" />
          </div>
        </div>
        <h2 className="text-xl font-semibold">Welcome to Video Editor</h2>
        <p className="text-sm text-muted-foreground">
          Import videos, images, and audio to create your project. 
          Drag media from the library to the timeline, or drop files directly.
        </p>
        <div className="flex flex-wrap justify-center gap-2 pt-2">
          <Badge variant="secondary" className="gap-1">
            <Film className="h-3 w-3" />
            Videos
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <Image className="h-3 w-3" />
            Images
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <Music className="h-3 w-3" />
            Audio
          </Badge>
        </div>
        <Button onClick={onDismiss} className="mt-4">
          Get Started
        </Button>
      </div>
    </div>
  );
}

export default function VideoEditor() {
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [showScopes, setShowScopes] = useState(false);
  const [showMixer, setShowMixer] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  
  const {
    isVideoPlaying,
    toggleVideoPlayback,
    setCurrentTime,
    currentTime,
    projectDuration,
    projectFps,
    setEditorMode,
    assets,
    addAsset,
  } = useVideoStore();
  
  // Set editor mode on mount
  useEffect(() => {
    setEditorMode("video");
    // Hide welcome if there are already assets
    if (assets.length > 0) {
      setShowWelcome(false);
    }
    return () => setEditorMode("3d");
  }, [setEditorMode, assets.length]);
  
  // Handle file drop
  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setShowWelcome(false);
    
    const files = Array.from(e.dataTransfer.files);
    for (const file of files) {
      const url = URL.createObjectURL(file);
      let type: "video" | "audio" | "image" | "scene" = "video";
      let duration = 0;
      let width: number | undefined;
      let height: number | undefined;
      
      if (file.type.startsWith("video/")) {
        type = "video";
        const video = document.createElement("video");
        video.src = url;
        await new Promise((resolve) => {
          video.onloadedmetadata = () => {
            duration = video.duration;
            width = video.videoWidth;
            height = video.videoHeight;
            resolve(null);
          };
          video.onerror = resolve;
        });
      } else if (file.type.startsWith("audio/")) {
        type = "audio";
        const audio = document.createElement("audio");
        audio.src = url;
        await new Promise((resolve) => {
          audio.onloadedmetadata = () => {
            duration = audio.duration;
            resolve(null);
          };
          audio.onerror = resolve;
        });
      } else if (file.type.startsWith("image/")) {
        type = "image";
        duration = 5;
        const img = document.createElement("img");
        img.src = url;
        await new Promise((resolve) => {
          img.onload = () => {
            width = img.naturalWidth;
            height = img.naturalHeight;
            resolve(null);
          };
          img.onerror = resolve;
        });
      } else {
        continue;
      }
      
      addAsset({
        name: file.name,
        type,
        url,
        duration,
        width,
        height,
      });
    }
  }, [addAsset]);
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      switch (e.key) {
        case " ":
          e.preventDefault();
          toggleVideoPlayback();
          break;
        case "ArrowLeft":
          setCurrentTime(Math.max(0, currentTime - 1 / projectFps));
          break;
        case "ArrowRight":
          setCurrentTime(Math.min(projectDuration, currentTime + 1 / projectFps));
          break;
        case "Home":
          setCurrentTime(0);
          break;
        case "End":
          setCurrentTime(projectDuration);
          break;
        case "j":
          setCurrentTime(Math.max(0, currentTime - 5));
          break;
        case "l":
          setCurrentTime(Math.min(projectDuration, currentTime + 5));
          break;
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleVideoPlayback, setCurrentTime, currentTime, projectDuration, projectFps]);
  
  return (
    <div 
      className="h-screen w-screen flex flex-col bg-background overflow-hidden" 
      data-testid="video-editor"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {/* Drag overlay */}
      {isDragging && (
        <div className="absolute inset-0 bg-primary/10 border-4 border-dashed border-primary z-50 flex items-center justify-center pointer-events-none">
          <div className="bg-card p-6 rounded-lg text-center">
            <Upload className="h-12 w-12 mx-auto mb-3 text-primary" />
            <p className="text-lg font-medium">Drop media files here</p>
            <p className="text-sm text-muted-foreground">Videos, images, and audio files</p>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="h-11 flex items-center gap-2 px-3 border-b border-border bg-card">
        {/* Logo / Home */}
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-1.5">
            <Film className="h-4 w-4 text-primary" />
            <span className="font-semibold text-sm">Video Editor</span>
          </Button>
        </Link>
        
        <div className="w-px h-5 bg-border" />
        
        {/* Mode switcher */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href="/3d">
              <Button variant="ghost" size="icon" data-testid="switch-to-3d">
                <Box className="h-4 w-4" />
              </Button>
            </Link>
          </TooltipTrigger>
          <TooltipContent>3D Editor</TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href="/compositor">
              <Button variant="ghost" size="icon" data-testid="switch-to-compositor">
                <Layers className="h-4 w-4" />
              </Button>
            </Link>
          </TooltipTrigger>
          <TooltipContent>Compositor</TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href="/character">
              <Button variant="ghost" size="icon" data-testid="switch-to-character">
                <User className="h-4 w-4" />
              </Button>
            </Link>
          </TooltipTrigger>
          <TooltipContent>Character Animation</TooltipContent>
        </Tooltip>
        
        <div className="w-px h-5 bg-border" />
        
        {/* Import button - prominent */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5" data-testid="import-media">
              <Upload className="h-3.5 w-3.5" />
              Import Media
            </Button>
          </TooltipTrigger>
          <TooltipContent>Import videos, images, or audio</TooltipContent>
        </Tooltip>
        
        <div className="w-px h-5 bg-border" />
        
        {/* File actions */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" data-testid="new-project">
              <FolderOpen className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>New Project</TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" data-testid="save-project">
              <Save className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Save Project</TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" data-testid="export-video">
              <Download className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Export Video</TooltipContent>
        </Tooltip>
        
        <div className="w-px h-5 bg-border" />
        
        {/* Undo/Redo */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" data-testid="undo">
              <Undo2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" data-testid="redo">
              <Redo2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Redo (Ctrl+Y)</TooltipContent>
        </Tooltip>
        
        <div className="flex-1" />
        
        {/* View toggles */}
        <Button
          variant={showScopes ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setShowScopes(!showScopes)}
          className="text-xs"
          data-testid="toggle-scopes"
        >
          Scopes
        </Button>
        <Button
          variant={showMixer ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setShowMixer(!showMixer)}
          className="text-xs"
          data-testid="toggle-mixer"
        >
          Mixer
        </Button>
        
        <div className="w-px h-5 bg-border" />
        
        {/* Help */}
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
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" data-testid="settings">
              <Settings className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Settings</TooltipContent>
        </Tooltip>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left panel (Media Library) */}
        {leftPanelOpen && (
          <div className="w-64 flex-shrink-0">
            <MediaLibrary />
          </div>
        )}
        
        {/* Center content */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* Welcome overlay for first time */}
          {showWelcome && assets.length === 0 && (
            <WelcomeOverlay onDismiss={() => setShowWelcome(false)} />
          )}
          
          {/* Panel toggle buttons */}
          <div className="absolute top-2 left-2 z-10">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-7 w-7 bg-card/80 backdrop-blur"
                  onClick={() => setLeftPanelOpen(!leftPanelOpen)}
                  data-testid="toggle-left-panel"
                >
                  {leftPanelOpen ? (
                    <PanelLeftClose className="h-3.5 w-3.5" />
                  ) : (
                    <PanelLeftOpen className="h-3.5 w-3.5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Toggle Media Library</TooltipContent>
            </Tooltip>
          </div>
          
          <div className="absolute top-2 right-2 z-10">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-7 w-7 bg-card/80 backdrop-blur"
                  onClick={() => setRightPanelOpen(!rightPanelOpen)}
                  data-testid="toggle-right-panel"
                >
                  {rightPanelOpen ? (
                    <PanelRightClose className="h-3.5 w-3.5" />
                  ) : (
                    <PanelRightOpen className="h-3.5 w-3.5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Toggle Properties</TooltipContent>
            </Tooltip>
          </div>
          
          {/* Preview and Scopes row */}
          <div className="flex-1 flex overflow-hidden">
            {/* Preview */}
            <div className="flex-1 min-w-0">
              <VideoPreview />
            </div>
            
            {/* Scopes */}
            {showScopes && (
              <div className="w-56 flex-shrink-0">
                <VideoScopes />
              </div>
            )}
            
            {/* Audio Mixer */}
            {showMixer && (
              <div className="w-64 flex-shrink-0">
                <AudioMixer />
              </div>
            )}
          </div>
          
          {/* Timeline */}
          <div className="h-64 flex-shrink-0">
            <VideoTimeline />
          </div>
        </div>
        
        {/* Right panel (Clip Properties) */}
        {rightPanelOpen && (
          <div className="w-64 flex-shrink-0">
            <ClipProperties />
          </div>
        )}
      </div>
    </div>
  );
}
