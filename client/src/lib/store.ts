import { create } from "zustand";
import type { SceneObject, ObjectType, ToolType, Material, Vector3, LightProperties, CameraSettings, CameraKeyframe, EditModeType } from "@shared/schema";
import { createDefaultSceneObject, defaultCameraSettings } from "@shared/schema";
import { useHistoryStore } from "./history";

interface Scene {
  id: string;
  name: string;
  objects: SceneObject[];
  currentFrame: number;
  totalFrames: number;
  fps: number;
  camera?: CameraSettings;
}

interface EditorState {
  // Scene data
  sceneId: string | null;
  objects: SceneObject[];
  selectedObjectId: string | null;
  
  // Camera state
  camera: CameraSettings;
  isCameraSelected: boolean;
  
  // Animation state
  currentFrame: number;
  totalFrames: number;
  fps: number;
  isPlaying: boolean;
  
  // Tool state
  activeTool: ToolType;
  editMode: EditModeType;
  selectedVertexIndex: number | null;
  
  // Panel visibility
  leftPanelOpen: boolean;
  rightPanelOpen: boolean;
  bottomPanelOpen: boolean;
  
  // Scene name
  sceneName: string;
  isDirty: boolean;
  
  // Actions
  addObject: (type: ObjectType) => void;
  addGeneratedObject: (obj: { type: ObjectType; name?: string; position?: Vector3; rotation?: Vector3; scale?: Vector3; material?: Partial<Material> }) => void;
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
  setLightProperties: (id: string, properties: Partial<LightProperties>) => void;
  
  // Animation actions
  setCurrentFrame: (frame: number) => void;
  setTotalFrames: (frames: number) => void;
  setFps: (fps: number) => void;
  togglePlayback: () => void;
  addKeyframe: (objectId: string) => void;
  removeKeyframe: (objectId: string, frame: number) => void;
  
  // Tool actions
  setActiveTool: (tool: ToolType) => void;
  setEditMode: (mode: EditModeType) => void;
  selectVertex: (index: number | null) => void;
  
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
  
  // History actions
  saveToHistory: () => void;
  undo: () => void;
  redo: () => void;
  
  // Grouping and parenting actions
  groupSelectedObjects: (objectIds: string[]) => void;
  ungroupObject: (groupId: string) => void;
  setParent: (childId: string, parentId: string | null) => void;
  getChildren: (parentId: string) => SceneObject[];
  getRootObjects: () => SceneObject[];
  
  // Camera actions
  selectCamera: () => void;
  setCameraPosition: (position: Vector3) => void;
  setCameraTarget: (target: Vector3) => void;
  setCameraFov: (fov: number) => void;
  addCameraKeyframe: () => void;
  removeCameraKeyframe: (frame: number) => void;
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
    group: "Group",
    pointLight: "Point Light",
    directionalLight: "Directional Light",
    spotLight: "Spot Light",
    ambientLight: "Ambient Light",
  };
  
  const baseName = typeNames[type];
  const existingCount = objects.filter((o) => o.type === type).length;
  return existingCount > 0 ? `${baseName}.${String(existingCount + 1).padStart(3, "0")}` : baseName;
};

// Initialize history on module load
setTimeout(() => {
  useHistoryStore.getState().initialize([], null);
}, 0);

export const useEditorStore = create<EditorState>((set, get) => ({
  // Initial state
  sceneId: null,
  objects: [],
  selectedObjectId: null,
  camera: { ...defaultCameraSettings },
  isCameraSelected: false,
  currentFrame: 0,
  totalFrames: 120,
  fps: 24,
  isPlaying: false,
  activeTool: "select",
  editMode: "object",
  selectedVertexIndex: null,
  leftPanelOpen: true,
  rightPanelOpen: true,
  bottomPanelOpen: true,
  sceneName: "Untitled Scene",
  isDirty: false,
  
  // Object actions
  addObject: (type) => {
    const state = get();
    useHistoryStore.getState().pushState(state.objects, state.selectedObjectId);
    
    const name = getObjectName(type, state.objects);
    const newObject: SceneObject = {
      id: generateId(),
      ...createDefaultSceneObject(type, name),
    };
    
    if (type === "pointLight" || type === "spotLight") {
      newObject.position.y = 5;
    } else if (type === "directionalLight") {
      newObject.position = { x: 5, y: 10, z: 5 };
    } else if (type !== "plane" && type !== "group" && type !== "ambientLight") {
      newObject.position.y = type === "sphere" ? 1 : 0.5;
    }
    
    set({
      objects: [...state.objects, newObject],
      selectedObjectId: newObject.id,
      isDirty: true,
    });
  },
  
  addGeneratedObject: (obj) => {
    const state = get();
    useHistoryStore.getState().pushState(state.objects, state.selectedObjectId);
    
    const name = obj.name || getObjectName(obj.type, state.objects);
    const defaultObj = createDefaultSceneObject(obj.type, name);
    
    const newObject: SceneObject = {
      id: generateId(),
      ...defaultObj,
      name,
      position: obj.position || defaultObj.position,
      rotation: obj.rotation || defaultObj.rotation,
      scale: obj.scale || defaultObj.scale,
      material: obj.material ? { ...defaultObj.material, ...obj.material } : defaultObj.material,
    };
    
    set({
      objects: [...state.objects, newObject],
      selectedObjectId: newObject.id,
      isDirty: true,
    });
  },
  
  removeObject: (id) => {
    const state = get();
    useHistoryStore.getState().pushState(state.objects, state.selectedObjectId);
    
    const objectToRemove = state.objects.find((o) => o.id === id);
    if (!objectToRemove) return;
    
    const getDescendants = (parentId: string): string[] => {
      const children = state.objects.filter((o) => o.parentId === parentId);
      return children.flatMap((c) => [c.id, ...getDescendants(c.id)]);
    };
    const idsToRemove = new Set([id, ...getDescendants(id)]);
    
    let updatedObjects = state.objects.filter((o) => !idsToRemove.has(o.id));
    
    if (objectToRemove.parentId) {
      updatedObjects = updatedObjects.map((o) =>
        o.id === objectToRemove.parentId
          ? { ...o, children: o.children.filter((c) => c !== id) }
          : o
      );
    }
    
    set({
      objects: updatedObjects,
      selectedObjectId: idsToRemove.has(state.selectedObjectId ?? "") ? null : state.selectedObjectId,
      isDirty: true,
    });
  },
  
  selectObject: (id) => set({ selectedObjectId: id, isCameraSelected: false, selectedVertexIndex: null }),
  
  updateObject: (id, updates) => {
    const state = get();
    useHistoryStore.getState().pushState(state.objects, state.selectedObjectId);
    
    set({
      objects: state.objects.map((o) => (o.id === id ? { ...o, ...updates } : o)),
      isDirty: true,
    });
  },
  
  duplicateObject: (id) => {
    const state = get();
    useHistoryStore.getState().pushState(state.objects, state.selectedObjectId);
    
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
      parentId: null,
      children: [],
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
  
  setLightProperties: (id, properties) => {
    set({
      objects: get().objects.map((o) =>
        o.id === id && o.lightProperties
          ? { ...o, lightProperties: { ...o.lightProperties, ...properties } }
          : o
      ),
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
  
  setEditMode: (mode) => set({ editMode: mode, selectedVertexIndex: null }),
  
  selectVertex: (index) => set({ selectedVertexIndex: index }),
  
  // Panel actions
  toggleLeftPanel: () => set({ leftPanelOpen: !get().leftPanelOpen }),
  toggleRightPanel: () => set({ rightPanelOpen: !get().rightPanelOpen }),
  toggleBottomPanel: () => set({ bottomPanelOpen: !get().bottomPanelOpen }),
  
  // Scene actions
  setSceneName: (name) => set({ sceneName: name, isDirty: true }),
  clearScene: () => {
    useHistoryStore.getState().clear();
    set({ 
      sceneId: null,
      objects: [], 
      selectedObjectId: null, 
      currentFrame: 0,
      sceneName: "Untitled Scene",
      isDirty: false,
    });
    useHistoryStore.getState().initialize([], null);
  },
  loadScene: (scene) => {
    useHistoryStore.getState().clear();
    set({
      sceneId: scene.id,
      sceneName: scene.name,
      objects: scene.objects,
      currentFrame: scene.currentFrame,
      totalFrames: scene.totalFrames,
      fps: scene.fps,
      selectedObjectId: null,
      isDirty: false,
    });
    useHistoryStore.getState().initialize(scene.objects, null);
  },
  setSceneId: (id) => set({ sceneId: id }),
  markClean: () => set({ isDirty: false }),
  getSelectedObject: () => {
    const state = get();
    return state.objects.find((o) => o.id === state.selectedObjectId);
  },
  
  // History actions
  saveToHistory: () => {
    const state = get();
    useHistoryStore.getState().pushState(state.objects, state.selectedObjectId);
  },
  
  undo: () => {
    const entry = useHistoryStore.getState().undo();
    if (entry) {
      set({
        objects: entry.objects,
        selectedObjectId: entry.selectedObjectId,
        isDirty: true,
      });
    }
  },
  
  redo: () => {
    const entry = useHistoryStore.getState().redo();
    if (entry) {
      set({
        objects: entry.objects,
        selectedObjectId: entry.selectedObjectId,
        isDirty: true,
      });
    }
  },
  
  // Grouping and parenting actions
  groupSelectedObjects: (objectIds) => {
    const state = get();
    if (objectIds.length < 2) return;
    
    useHistoryStore.getState().pushState(state.objects, state.selectedObjectId);
    
    const groupName = getObjectName("group", state.objects);
    const groupId = generateId();
    const objectIdSet = new Set(objectIds);
    
    const selectedObjects = state.objects.filter((o) => objectIdSet.has(o.id));
    const parentIds = selectedObjects.map((o) => o.parentId);
    const commonParent = parentIds.every((p) => p === parentIds[0]) ? parentIds[0] : null;
    
    const newGroup: SceneObject = {
      id: groupId,
      name: groupName,
      type: "group",
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      material: { color: "#808080", opacity: 1, metalness: 0, roughness: 0.5 },
      visible: true,
      keyframes: [],
      parentId: commonParent,
      children: objectIds,
    };
    
    const updatedObjects = state.objects.map((o) => {
      if (objectIdSet.has(o.id)) {
        const cleanedChildren = o.children.filter((c) => !objectIdSet.has(c));
        return { ...o, parentId: groupId, children: cleanedChildren };
      }
      if (o.id === commonParent) {
        const newChildren = o.children.filter((c) => !objectIdSet.has(c));
        newChildren.push(groupId);
        return { ...o, children: newChildren };
      }
      if (o.children.some((c) => objectIdSet.has(c))) {
        return { ...o, children: o.children.filter((c) => !objectIdSet.has(c)) };
      }
      return o;
    });
    
    set({
      objects: [...updatedObjects, newGroup],
      selectedObjectId: groupId,
      isDirty: true,
    });
  },
  
  ungroupObject: (groupId) => {
    const state = get();
    const group = state.objects.find((o) => o.id === groupId);
    if (!group || group.type !== "group") return;
    
    useHistoryStore.getState().pushState(state.objects, state.selectedObjectId);
    
    const updatedObjects = state.objects
      .map((o) => {
        if (o.parentId === groupId) {
          return { ...o, parentId: group.parentId };
        }
        return o;
      })
      .filter((o) => o.id !== groupId);
    
    if (group.parentId) {
      const parentIndex = updatedObjects.findIndex((o) => o.id === group.parentId);
      if (parentIndex !== -1) {
        updatedObjects[parentIndex] = {
          ...updatedObjects[parentIndex],
          children: [
            ...updatedObjects[parentIndex].children.filter((c) => c !== groupId),
            ...group.children,
          ],
        };
      }
    }
    
    set({
      objects: updatedObjects,
      selectedObjectId: null,
      isDirty: true,
    });
  },
  
  setParent: (childId, parentId) => {
    const state = get();
    const child = state.objects.find((o) => o.id === childId);
    if (!child) return;
    
    useHistoryStore.getState().pushState(state.objects, state.selectedObjectId);
    
    let updatedObjects = state.objects.map((o) => {
      if (o.id === childId) {
        return { ...o, parentId };
      }
      if (o.id === child.parentId && child.parentId !== null) {
        return { ...o, children: o.children.filter((c) => c !== childId) };
      }
      if (o.id === parentId) {
        return { ...o, children: [...o.children, childId] };
      }
      return o;
    });
    
    set({
      objects: updatedObjects,
      isDirty: true,
    });
  },
  
  getChildren: (parentId) => {
    return get().objects.filter((o) => o.parentId === parentId);
  },
  
  getRootObjects: () => {
    return get().objects.filter((o) => o.parentId === null);
  },
  
  // Camera actions
  selectCamera: () => {
    set({ isCameraSelected: true, selectedObjectId: null });
  },
  
  setCameraPosition: (position) => {
    set((state) => ({
      camera: { ...state.camera, position },
      isDirty: true,
    }));
  },
  
  setCameraTarget: (target) => {
    set((state) => ({
      camera: { ...state.camera, target },
      isDirty: true,
    }));
  },
  
  setCameraFov: (fov) => {
    set((state) => ({
      camera: { ...state.camera, fov },
      isDirty: true,
    }));
  },
  
  addCameraKeyframe: () => {
    const state = get();
    const frame = state.currentFrame;
    const existingIndex = state.camera.keyframes.findIndex((k) => k.frame === frame);
    
    const newKeyframe: CameraKeyframe = {
      frame,
      position: { ...state.camera.position },
      target: { ...state.camera.target },
      fov: state.camera.fov,
    };
    
    let newKeyframes: CameraKeyframe[];
    if (existingIndex >= 0) {
      newKeyframes = [...state.camera.keyframes];
      newKeyframes[existingIndex] = newKeyframe;
    } else {
      newKeyframes = [...state.camera.keyframes, newKeyframe].sort((a, b) => a.frame - b.frame);
    }
    
    set({
      camera: { ...state.camera, keyframes: newKeyframes },
      isDirty: true,
    });
  },
  
  removeCameraKeyframe: (frame) => {
    const state = get();
    set({
      camera: {
        ...state.camera,
        keyframes: state.camera.keyframes.filter((k) => k.frame !== frame),
      },
      isDirty: true,
    });
  },
}));
