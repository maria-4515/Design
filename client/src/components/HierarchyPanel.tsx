import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEditorStore } from "@/lib/store";
import type { ObjectType, SceneObject } from "@shared/schema";
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
  ChevronDown,
  Layers,
  FolderOpen,
  Folder,
  Ungroup,
} from "lucide-react";
import { useState, createContext, useContext } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";

const objectIcons: Record<ObjectType, typeof Box> = {
  cube: Box,
  sphere: Circle,
  cylinder: Cylinder,
  plane: Square,
  cone: Triangle,
  torus: Donut,
  group: Folder,
};

interface MultiSelectContextValue {
  multiSelectedIds: string[];
  onMultiSelect: (id: string, isCtrlKey: boolean) => void;
}

const MultiSelectContext = createContext<MultiSelectContextValue>({
  multiSelectedIds: [],
  onMultiSelect: () => {},
});

function ObjectItem({ 
  object, 
  depth = 0,
}: {
  object: SceneObject;
  depth?: number;
}) {
  const { 
    selectObject, 
    toggleVisibility, 
    objects,
    duplicateObject,
    removeObject,
    ungroupObject,
    selectedObjectId,
  } = useEditorStore();
  
  const { multiSelectedIds, onMultiSelect } = useContext(MultiSelectContext);
  
  const [isExpanded, setIsExpanded] = useState(true);
  
  const children = objects.filter((o) => o.parentId === object.id);
  const hasChildren = children.length > 0;
  const isGroup = object.type === "group";
  const isSelected = selectedObjectId === object.id;
  const isMultiSelected = multiSelectedIds.includes(object.id);
  
  const Icon = isGroup 
    ? (isExpanded ? FolderOpen : Folder) 
    : objectIcons[object.type];
  
  const handleClick = (e: React.MouseEvent) => {
    if (e.ctrlKey || e.metaKey) {
      onMultiSelect(object.id, true);
    } else {
      onMultiSelect(object.id, false);
      selectObject(object.id);
    }
  };
  
  return (
    <div data-testid={`hierarchy-item-container-${object.id}`}>
      <ContextMenu>
        <ContextMenuTrigger>
          <div
            className={`
              group flex items-center gap-1 px-2 py-1.5 rounded-md cursor-pointer
              ${isSelected || isMultiSelected ? "bg-accent text-accent-foreground" : "hover-elevate"}
              ${isMultiSelected && !isSelected ? "ring-1 ring-primary" : ""}
            `}
            style={{ paddingLeft: `${depth * 16 + 8}px` }}
            onClick={handleClick}
            data-testid={`hierarchy-item-${object.id}`}
          >
            <Button
              variant="ghost"
              size="icon"
              className={`h-5 w-5 p-0 ${hasChildren ? "" : "invisible"}`}
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              data-testid={`toggle-expand-${object.id}`}
            >
              {isExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </Button>
            <Icon className={`h-4 w-4 ${isGroup ? "text-primary" : "text-muted-foreground"}`} />
            <span className="flex-1 text-sm truncate">{object.name}</span>
            <Button
              variant="ghost"
              size="icon"
              className={`h-6 w-6 ${object.visible ? "opacity-0 group-hover:opacity-100" : "opacity-100"}`}
              onClick={(e) => {
                e.stopPropagation();
                toggleVisibility(object.id);
              }}
              data-testid={`toggle-visibility-${object.id}`}
            >
              {object.visible ? (
                <Eye className="h-3.5 w-3.5" />
              ) : (
                <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
              )}
            </Button>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem 
            onClick={() => duplicateObject(object.id)}
            data-testid={`context-duplicate-${object.id}`}
          >
            Duplicate
          </ContextMenuItem>
          {isGroup && (
            <ContextMenuItem 
              onClick={() => ungroupObject(object.id)}
              data-testid={`context-ungroup-${object.id}`}
            >
              <Ungroup className="h-4 w-4 mr-2" />
              Ungroup
            </ContextMenuItem>
          )}
          <ContextMenuSeparator />
          <ContextMenuItem 
            onClick={() => removeObject(object.id)}
            className="text-destructive"
            data-testid={`context-delete-${object.id}`}
          >
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      
      {hasChildren && isExpanded && (
        <div data-testid={`hierarchy-children-${object.id}`}>
          {children.map((child) => (
            <ObjectItem
              key={child.id}
              object={child}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function HierarchyPanel() {
  const { objects, selectedObjectId, groupSelectedObjects } = useEditorStore();
  const [multiSelectedIds, setMultiSelectedIds] = useState<string[]>([]);
  
  const rootObjects = objects.filter((o) => o.parentId === null);
  
  const handleMultiSelect = (id: string, isCtrlKey: boolean) => {
    if (isCtrlKey) {
      setMultiSelectedIds((prev) => 
        prev.includes(id) 
          ? prev.filter((i) => i !== id) 
          : [...prev, id]
      );
    } else {
      setMultiSelectedIds([]);
    }
  };
  
  const handleGroup = () => {
    if (multiSelectedIds.length >= 2) {
      groupSelectedObjects(multiSelectedIds);
      setMultiSelectedIds([]);
    }
  };
  
  return (
    <MultiSelectContext.Provider value={{ multiSelectedIds, onMultiSelect: handleMultiSelect }}>
      <div className="h-full flex flex-col bg-card border-r border-border" data-testid="hierarchy-panel">
        <div className="h-10 flex items-center justify-between gap-2 px-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Hierarchy
            </span>
          </div>
          {multiSelectedIds.length >= 2 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleGroup}
              data-testid="button-group-objects"
            >
              <Folder className="h-3.5 w-3.5 mr-1" />
              Group ({multiSelectedIds.length})
            </Button>
          )}
        </div>
        
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
              rootObjects.map((object) => (
                <ObjectItem
                  key={object.id}
                  object={object}
                />
              ))
            )}
          </div>
        </ScrollArea>
        
        <div className="h-8 flex items-center justify-between px-3 border-t border-border">
          <span className="text-xs text-muted-foreground">
            {objects.length} object{objects.length !== 1 ? "s" : ""}
            {multiSelectedIds.length > 0 && ` (${multiSelectedIds.length} selected)`}
          </span>
        </div>
      </div>
    </MultiSelectContext.Provider>
  );
}
