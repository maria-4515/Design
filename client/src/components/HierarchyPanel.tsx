import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEditorStore } from "@/lib/store";
import type { ObjectType } from "@shared/schema";
import {
  Box,
  Circle,
  Cylinder,
  Square,
  Triangle,
  Donut,
  Eye,
  EyeOff,
  ChevronRight,
  Layers,
} from "lucide-react";

const objectIcons: Record<ObjectType, typeof Box> = {
  cube: Box,
  sphere: Circle,
  cylinder: Cylinder,
  plane: Square,
  cone: Triangle,
  torus: Donut,
};

function ObjectItem({ id, name, type, visible, isSelected }: {
  id: string;
  name: string;
  type: ObjectType;
  visible: boolean;
  isSelected: boolean;
}) {
  const { selectObject, toggleVisibility } = useEditorStore();
  const Icon = objectIcons[type];
  
  return (
    <div
      className={`
        group flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer
        ${isSelected ? "bg-accent text-accent-foreground" : "hover-elevate"}
      `}
      onClick={() => selectObject(id)}
      data-testid={`hierarchy-item-${id}`}
    >
      <ChevronRight className="h-3 w-3 text-muted-foreground" />
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className="flex-1 text-sm truncate">{name}</span>
      <Button
        variant="ghost"
        size="icon"
        className={`h-6 w-6 ${visible ? "opacity-0 group-hover:opacity-100" : "opacity-100"}`}
        onClick={(e) => {
          e.stopPropagation();
          toggleVisibility(id);
        }}
        data-testid={`toggle-visibility-${id}`}
      >
        {visible ? (
          <Eye className="h-3.5 w-3.5" />
        ) : (
          <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </Button>
    </div>
  );
}

export function HierarchyPanel() {
  const { objects, selectedObjectId } = useEditorStore();
  
  return (
    <div className="h-full flex flex-col bg-card border-r border-border" data-testid="hierarchy-panel">
      {/* Header */}
      <div className="h-10 flex items-center gap-2 px-3 border-b border-border">
        <Layers className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Scene Hierarchy
        </span>
      </div>
      
      {/* Object list */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-0.5">
          {objects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Box className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No objects in scene</p>
              <p className="text-xs text-muted-foreground mt-1">
                Use Add to create objects
              </p>
            </div>
          ) : (
            objects.map((object) => (
              <ObjectItem
                key={object.id}
                id={object.id}
                name={object.name}
                type={object.type}
                visible={object.visible}
                isSelected={selectedObjectId === object.id}
              />
            ))
          )}
        </div>
      </ScrollArea>
      
      {/* Footer with count */}
      <div className="h-8 flex items-center justify-between px-3 border-t border-border">
        <span className="text-xs text-muted-foreground">
          {objects.length} object{objects.length !== 1 ? "s" : ""}
        </span>
      </div>
    </div>
  );
}
