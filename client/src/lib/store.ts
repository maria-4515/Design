import { create } from "zustand";
import type { SceneObject, ObjectType, ToolType, Material, Vector3 } from "@shared/schema";
import { createDefaultSceneObject } from "@shared/schema";

interface Scene {
  id: string;
  name: string;
  objects: SceneObject[];
  currentFrame: number;
  totalFrames: number;
  fps: number;
}

interface EditorState {
  // Scene data
  sceneId: string | null;
  objects: SceneObject[];
  selectedObjectId: string | null;
  
  // Animation state
  currentFrame: number;
  totalFrames: number;
  fps: number;
  isPlaying: boolean;
  
  // Tool state
  activeTool: ToolType;
  
  // Panel visibility
  leftPanelOpen: boolean;
  rightPanelOpen: boolean;
  bottomPanelOpen: boolean;
  
  // Scene name
  sceneName: string;
  isDirty: boolean;
  
  // Actions
  addObject: (type: ObjectType) => void;
  removeObject: (id: string) => void;
  selectObject: (id: string | null) => void;
  updateObject: (id: string, updates: Partial<SceneObject>) => void;
  duplicateObject: (id: string) => void;
  
  // Transform actions
  setPosition: (id: string, position: Vector3) => void;
  setRotation: (id: string, rotation: Vector3) => void;
  setScale: (id: string, scale: Vector3) => void;
  setMaterial: (id: string, material: Partial<Material>) => void;
  toggleVisibility: (id: string) => void;
  
  // Animation actions
  setCurrentFrame: (frame: number) => void;
  setTotalFrames: (frames: number) => void;
  setFps: (fps: number) => void;
  togglePlayback: () => void;
  addKeyframe: (objectId: string) => void;
  removeKeyframe: (objectId: string, frame: number) => void;
  
  // Tool actions
  setActiveTool: (tool: ToolType) => void;
  
  // Panel actions
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
  toggleBottomPanel: () => void;
  
  // Scene actions
  setSceneName: (name: string) => void;
  clearScene: () => void;
  loadScene: (scene: Scene) => void;
  setSceneId: (id: string | null) => void;
  markClean: () => void;
  getSelectedObject: () => SceneObject | undefined;
}

let objectCounter = 0;

const generateId = () => `obj_${++objectCounter}_${Date.now()}`;

const getObjectName = (type: ObjectType, objects: SceneObject[]) => {
  const typeNames: Record<ObjectType, string> = {
    cube: "Cube",
    sphere: "Sphere",
    cylinder: "Cylinder",
    plane: "Plane",
    cone: "Cone",
    torus: "Torus",
  };
  
  const baseName = typeNames[type];
  const existingCount = objects.filter((o) => o.type === type).length;
  return existingCount > 0 ? `${baseName}.${String(existingCount + 1).padStart(3, "0")}` : baseName;
};

export const useEditorStore = create<EditorState>((set, get) => ({
  // Initial state
  sceneId: null,
  objects: [],
  selectedObjectId: null,
  currentFrame: 0,
  totalFrames: 120,
  fps: 24,
  isPlaying: false,
  activeTool: "select",
  leftPanelOpen: true,
  rightPanelOpen: true,
  bottomPanelOpen: true,
  sceneName: "Untitled Scene",
  isDirty: false,
  
  // Object actions
  addObject: (type) => {
    const state = get();
    const name = getObjectName(type, state.objects);
    const newObject: SceneObject = {
      id: generateId(),
      ...createDefaultSceneObject(type, name),
    };
    
    // Position new objects slightly above the ground
    if (type !== "plane") {
      newObject.position.y = type === "sphere" ? 1 : 0.5;
    }
    
    set({
      objects: [...state.objects, newObject],
      selectedObjectId: newObject.id,
      isDirty: true,
    });
  },
  
  removeObject: (id) => {
    const state = get();
    set({
      objects: state.objects.filter((o) => o.id !== id),
      selectedObjectId: state.selectedObjectId === id ? null : state.selectedObjectId,
      isDirty: true,
    });
  },
  
  selectObject: (id) => set({ selectedObjectId: id }),
  
  updateObject: (id, updates) => {
    set({
      objects: get().objects.map((o) => (o.id === id ? { ...o, ...updates } : o)),
      isDirty: true,
    });
  },
  
  duplicateObject: (id) => {
    const state = get();
    const original = state.objects.find((o) => o.id === id);
    if (!original) return;
    
    const newObject: SceneObject = {
      ...original,
      id: generateId(),
      name: `${original.name}.copy`,
      position: {
        x: original.position.x + 1,
        y: original.position.y,
        z: original.position.z,
      },
    };
    
    set({
      objects: [...state.objects, newObject],
      selectedObjectId: newObject.id,
      isDirty: true,
    });
  },
  
  // Transform actions
  setPosition: (id, position) => {
    set({
      objects: get().objects.map((o) => (o.id === id ? { ...o, position } : o)),
      isDirty: true,
    });
  },
  
  setRotation: (id, rotation) => {
    set({
      objects: get().objects.map((o) => (o.id === id ? { ...o, rotation } : o)),
      isDirty: true,
    });
  },
  
  setScale: (id, scale) => {
    set({
      objects: get().objects.map((o) => (o.id === id ? { ...o, scale } : o)),
      isDirty: true,
    });
  },
  
  setMaterial: (id, material) => {
    set({
      objects: get().objects.map((o) =>
        o.id === id ? { ...o, material: { ...o.material, ...material } } : o
      ),
      isDirty: true,
    });
  },
  
  toggleVisibility: (id) => {
    set({
      objects: get().objects.map((o) => (o.id === id ? { ...o, visible: !o.visible } : o)),
      isDirty: true,
    });
  },
  
  // Animation actions
  setCurrentFrame: (frame) => set({ currentFrame: Math.max(0, Math.min(frame, get().totalFrames - 1)) }),
  setTotalFrames: (frames) => set({ totalFrames: Math.max(1, frames), isDirty: true }),
  setFps: (fps) => set({ fps: Math.max(1, Math.min(120, fps)), isDirty: true }),
  togglePlayback: () => set({ isPlaying: !get().isPlaying }),
  
  addKeyframe: (objectId) => {
    const state = get();
    const obj = state.objects.find((o) => o.id === objectId);
    if (!obj) return;
    
    const existingKeyframeIndex = obj.keyframes.findIndex((k) => k.frame === state.currentFrame);
    const newKeyframe = {
      frame: state.currentFrame,
      position: { ...obj.position },
      rotation: { ...obj.rotation },
      scale: { ...obj.scale },
    };
    
    const updatedKeyframes =
      existingKeyframeIndex >= 0
        ? obj.keyframes.map((k, i) => (i === existingKeyframeIndex ? newKeyframe : k))
        : [...obj.keyframes, newKeyframe].sort((a, b) => a.frame - b.frame);
    
    set({
      objects: state.objects.map((o) =>
        o.id === objectId ? { ...o, keyframes: updatedKeyframes } : o
      ),
      isDirty: true,
    });
  },
  
  removeKeyframe: (objectId, frame) => {
    set({
      objects: get().objects.map((o) =>
        o.id === objectId
          ? { ...o, keyframes: o.keyframes.filter((k) => k.frame !== frame) }
          : o
      ),
      isDirty: true,
    });
  },
  
  // Tool actions
  setActiveTool: (tool) => set({ activeTool: tool }),
  
  // Panel actions
  toggleLeftPanel: () => set({ leftPanelOpen: !get().leftPanelOpen }),
  toggleRightPanel: () => set({ rightPanelOpen: !get().rightPanelOpen }),
  toggleBottomPanel: () => set({ bottomPanelOpen: !get().bottomPanelOpen }),
  
  // Scene actions
  setSceneName: (name) => set({ sceneName: name, isDirty: true }),
  clearScene: () => set({ 
    sceneId: null,
    objects: [], 
    selectedObjectId: null, 
    currentFrame: 0,
    sceneName: "Untitled Scene",
    isDirty: false,
  }),
  loadScene: (scene) => set({
    sceneId: scene.id,
    sceneName: scene.name,
    objects: scene.objects,
    currentFrame: scene.currentFrame,
    totalFrames: scene.totalFrames,
    fps: scene.fps,
    selectedObjectId: null,
    isDirty: false,
  }),
  setSceneId: (id) => set({ sceneId: id }),
  markClean: () => set({ isDirty: false }),
  getSelectedObject: () => {
    const state = get();
    return state.objects.find((o) => o.id === state.selectedObjectId);
  },
}));
