import { useRef, useState } from "react";
import { useVideoStore } from "@/lib/videoStore";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  FolderOpen,
  Film,
  Music,
  Image,
  Box,
  Trash2,
  Search,
  Upload,
  Plus,
} from "lucide-react";
import type { MediaType, MediaAsset } from "@shared/schema";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function MediaTypeIcon({ type }: { type: MediaType }) {
  switch (type) {
    case "video":
      return <Film className="h-4 w-4 text-chart-1" />;
    case "audio":
      return <Music className="h-4 w-4 text-chart-2" />;
    case "image":
      return <Image className="h-4 w-4 text-chart-4" />;
    case "scene":
      return <Box className="h-4 w-4 text-chart-5" />;
    default:
      return <Film className="h-4 w-4" />;
  }
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function AssetCard({ asset, isSelected, onClick, onDoubleClick }: { 
  asset: MediaAsset; 
  isSelected: boolean;
  onClick: () => void;
  onDoubleClick: () => void;
}) {
  return (
    <div
      className={`p-2 rounded-md cursor-pointer transition-colors ${
        isSelected ? "bg-accent ring-1 ring-primary" : "hover-elevate"
      }`}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      data-testid={`asset-${asset.id}`}
    >
      {/* Thumbnail */}
      <div className="aspect-video bg-muted rounded-sm mb-2 flex items-center justify-center overflow-hidden">
        {asset.thumbnail ? (
          <img 
            src={asset.thumbnail} 
            alt={asset.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <MediaTypeIcon type={asset.type} />
        )}
      </div>
      
      {/* Info */}
      <div className="flex items-center gap-1">
        <MediaTypeIcon type={asset.type} />
        <span className="text-xs truncate flex-1">{asset.name}</span>
      </div>
      
      {/* Details */}
      <div className="flex items-center gap-2 mt-1">
        {asset.duration > 0 && (
          <span className="text-[10px] text-muted-foreground">
            {formatDuration(asset.duration)}
          </span>
        )}
        {asset.width && asset.height && (
          <span className="text-[10px] text-muted-foreground">
            {asset.width}x{asset.height}
          </span>
        )}
      </div>
    </div>
  );
}

export function MediaLibrary() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<MediaType | "all">("all");
  
  const {
    assets,
    selectedAssetId,
    selectAsset,
    addAsset,
    removeAsset,
    addClip,
    tracks,
    selectedTrackId,
  } = useVideoStore();
  
  // Filter assets
  const filteredAssets = assets.filter((asset) => {
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || asset.type === filterType;
    return matchesSearch && matchesType;
  });
  
  // Group by type
  const groupedAssets = {
    video: filteredAssets.filter(a => a.type === "video"),
    audio: filteredAssets.filter(a => a.type === "audio"),
    image: filteredAssets.filter(a => a.type === "image"),
    scene: filteredAssets.filter(a => a.type === "scene"),
  };
  
  const handleImport = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    for (const file of Array.from(files)) {
      const url = URL.createObjectURL(file);
      let type: MediaType = "video";
      let duration = 0;
      let width: number | undefined;
      let height: number | undefined;
      
      if (file.type.startsWith("video/")) {
        type = "video";
        // Get video metadata
        const video = document.createElement("video");
        video.src = url;
        await new Promise((resolve) => {
          video.onloadedmetadata = () => {
            duration = video.duration;
            width = video.videoWidth;
            height = video.videoHeight;
            resolve(null);
          };
        });
      } else if (file.type.startsWith("audio/")) {
        type = "audio";
        // Get audio duration
        const audio = document.createElement("audio");
        audio.src = url;
        await new Promise((resolve) => {
          audio.onloadedmetadata = () => {
            duration = audio.duration;
            resolve(null);
          };
        });
      } else if (file.type.startsWith("image/")) {
        type = "image";
        duration = 5; // Default duration for images
        // Get image dimensions
        const img = document.createElement("img");
        img.src = url;
        await new Promise((resolve) => {
          img.onload = () => {
            width = img.naturalWidth;
            height = img.naturalHeight;
            resolve(null);
          };
        });
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
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  
  const handleAddToTimeline = (asset: MediaAsset) => {
    // Find appropriate track
    let trackId: string | null = selectedTrackId;
    
    if (!trackId) {
      // Find first track of matching type
      const matchingTrack = tracks.find(t => {
        if (asset.type === "video") return t.type === "video";
        if (asset.type === "audio") return t.type === "audio";
        if (asset.type === "image") return t.type === "image";
        if (asset.type === "scene") return t.type === "scene";
        return false;
      });
      trackId = matchingTrack?.id ?? null;
    }
    
    if (trackId) {
      addClip(trackId, asset.id, 0, asset.duration || 5);
    }
  };
  
  const handleDeleteAsset = () => {
    if (selectedAssetId) {
      removeAsset(selectedAssetId);
    }
  };
  
  // Add demo assets for testing
  const addDemoAssets = () => {
    addAsset({
      name: "Sample Video.mp4",
      type: "video",
      url: "",
      duration: 30,
      width: 1920,
      height: 1080,
    });
    addAsset({
      name: "Background Music.mp3",
      type: "audio",
      url: "",
      duration: 120,
    });
    addAsset({
      name: "Logo.png",
      type: "image",
      url: "",
      duration: 5,
      width: 512,
      height: 512,
    });
    addAsset({
      name: "3D Scene",
      type: "scene",
      url: "",
      duration: 10,
    });
  };
  
  return (
    <div className="h-full flex flex-col bg-card border-r border-border" data-testid="media-library">
      {/* Header */}
      <div className="h-8 flex items-center gap-2 px-3 border-b border-border">
        <FolderOpen className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Media
        </span>
        <div className="flex-1" />
        <span className="text-[10px] text-muted-foreground">
          {assets.length} items
        </span>
      </div>
      
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b border-border">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs"
          onClick={handleImport}
          data-testid="import-media"
        >
          <Upload className="h-3.5 w-3.5 mr-1" />
          Import
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 text-xs">
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add Demo
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={addDemoAssets}>
              Add Sample Assets
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <div className="flex-1" />
        
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={handleDeleteAsset}
          disabled={!selectedAssetId}
          data-testid="delete-asset"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
      
      {/* Search and filter */}
      <div className="flex items-center gap-2 p-2 border-b border-border">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-7 pl-7 text-xs"
            data-testid="search-assets"
          />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-7 text-xs">
              {filterType === "all" ? "All" : filterType}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setFilterType("all")}>All</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterType("video")}>Video</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterType("audio")}>Audio</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterType("image")}>Image</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterType("scene")}>Scene</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* Asset grid */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredAssets.length === 0 ? (
            <div className="text-center py-8">
              <FolderOpen className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-xs text-muted-foreground">
                {assets.length === 0 ? "No media imported" : "No matching media"}
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 text-xs text-primary"
                onClick={handleImport}
              >
                Import media files
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {filteredAssets.map((asset) => (
                <AssetCard
                  key={asset.id}
                  asset={asset}
                  isSelected={selectedAssetId === asset.id}
                  onClick={() => selectAsset(asset.id)}
                  onDoubleClick={() => handleAddToTimeline(asset)}
                />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
      
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*,audio/*,image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
