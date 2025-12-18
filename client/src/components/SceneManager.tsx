import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useScenes, useDeleteScene, type Scene } from "@/hooks/use-scenes";
import { useEditorStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { FolderOpen, Trash2, FileText, Loader2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function SceneManager() {
  const [open, setOpen] = useState(false);
  const { data: scenes, isLoading, error } = useScenes();
  const deleteScene = useDeleteScene();
  const { loadScene, isDirty, sceneId } = useEditorStore();
  const { toast } = useToast();

  const handleLoadScene = (scene: Scene) => {
    if (isDirty) {
      const confirm = window.confirm(
        "You have unsaved changes. Are you sure you want to load a different scene?"
      );
      if (!confirm) return;
    }
    
    loadScene(scene);
    setOpen(false);
    toast({
      title: "Scene loaded",
      description: `Loaded "${scene.name}" with ${scene.objects.length} objects.`,
    });
  };

  const handleDeleteScene = async (scene: Scene, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const confirm = window.confirm(
      `Are you sure you want to delete "${scene.name}"? This cannot be undone.`
    );
    if (!confirm) return;
    
    try {
      await deleteScene.mutateAsync(scene.id);
      toast({
        title: "Scene deleted",
        description: `"${scene.name}" has been deleted.`,
      });
    } catch {
      toast({
        title: "Delete failed",
        description: "Could not delete the scene.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              data-testid="open-scene"
            >
              <FolderOpen className="h-4 w-4" />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom">Open Scene</TooltipContent>
      </Tooltip>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Open Scene</DialogTitle>
          <DialogDescription>
            Select a saved scene to load into the editor.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[300px] mt-2">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}
          
          {error && (
            <div className="text-center py-8 text-muted-foreground">
              Failed to load scenes. Please try again.
            </div>
          )}
          
          {!isLoading && !error && scenes?.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No saved scenes yet. Create objects and save your first scene!
            </div>
          )}
          
          {!isLoading && !error && scenes && scenes.length > 0 && (
            <div className="space-y-2">
              {scenes.map((scene) => (
                <div
                  key={scene.id}
                  className={`flex items-center gap-3 p-3 rounded-md cursor-pointer hover-elevate ${
                    scene.id === sceneId ? "bg-accent" : "bg-muted/50"
                  }`}
                  onClick={() => handleLoadScene(scene)}
                  data-testid={`scene-item-${scene.id}`}
                >
                  <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{scene.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {scene.objects.length} object{scene.objects.length !== 1 ? "s" : ""}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => handleDeleteScene(scene, e)}
                    disabled={deleteScene.isPending}
                    data-testid={`delete-scene-${scene.id}`}
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
