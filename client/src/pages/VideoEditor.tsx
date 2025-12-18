import { useEffect } from "react";
import { VideoPreview } from "@/components/VideoPreview";
import { VideoTimeline } from "@/components/VideoTimeline";
import { AudioMixer } from "@/components/AudioMixer";
import { VideoScopes } from "@/components/VideoScopes";
import { MediaLibrary } from "@/components/MediaLibrary";
import { ClipProperties } from "@/components/ClipProperties";
import { useVideoStore } from "@/lib/videoStore";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

export default function VideoEditor() {
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [showScopes, setShowScopes] = useState(true);
  const [showMixer, setShowMixer] = useState(false);
  
  const {
    isVideoPlaying,
    toggleVideoPlayback,
    setCurrentTime,
    currentTime,
    projectDuration,
    projectFps,
    setEditorMode,
  } = useVideoStore();
  
  // Set editor mode on mount
  useEffect(() => {
    setEditorMode("video");
    return () => setEditorMode("3d");
  }, [setEditorMode]);
  
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
    <div className="h-screen w-screen flex flex-col bg-background overflow-hidden" data-testid="video-editor">
      {/* Toolbar */}
      <div className="h-10 flex items-center gap-2 px-3 border-b border-border bg-card">
        {/* Logo / Home */}
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-1.5">
            <Film className="h-4 w-4" />
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
        
        <div className="w-px h-5 bg-border" />
        
        {/* File actions */}
        <Button variant="ghost" size="icon" data-testid="new-project">
          <FolderOpen className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" data-testid="save-project">
          <Save className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" data-testid="export-video">
          <Download className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-5 bg-border" />
        
        {/* Undo/Redo */}
        <Button variant="ghost" size="icon" data-testid="undo">
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" data-testid="redo">
          <Redo2 className="h-4 w-4" />
        </Button>
        
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
        
        {/* Settings */}
        <Button variant="ghost" size="icon" data-testid="settings">
          <Settings className="h-4 w-4" />
        </Button>
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
