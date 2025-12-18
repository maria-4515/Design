import { z } from "zod";

// Vector3 schema for position, rotation, scale
export const vector3Schema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number(),
});

export type Vector3 = z.infer<typeof vector3Schema>;

// Material schema
export const materialSchema = z.object({
  color: z.string().default("#808080"),
  opacity: z.number().min(0).max(1).default(1),
  metalness: z.number().min(0).max(1).default(0),
  roughness: z.number().min(0).max(1).default(0.5),
});

export type Material = z.infer<typeof materialSchema>;

// Keyframe schema for animation
export const keyframeSchema = z.object({
  frame: z.number().int().min(0),
  position: vector3Schema.optional(),
  rotation: vector3Schema.optional(),
  scale: vector3Schema.optional(),
});

export type Keyframe = z.infer<typeof keyframeSchema>;

// 3D Object types
export const objectTypeSchema = z.enum([
  "cube", "sphere", "cylinder", "plane", "cone", "torus", "group",
  "pointLight", "directionalLight", "spotLight", "ambientLight"
]);
export type ObjectType = z.infer<typeof objectTypeSchema>;

// Light properties schema
export const lightPropertiesSchema = z.object({
  intensity: z.number().min(0).default(1),
  color: z.string().default("#ffffff"),
  castShadow: z.boolean().default(true),
  distance: z.number().min(0).default(0),
  decay: z.number().min(0).default(2),
  angle: z.number().min(0).max(Math.PI / 2).default(Math.PI / 6),
  penumbra: z.number().min(0).max(1).default(0.1),
});

export type LightProperties = z.infer<typeof lightPropertiesSchema>;

export const defaultLightProperties: LightProperties = {
  intensity: 1,
  color: "#ffffff",
  castShadow: true,
  distance: 0,
  decay: 2,
  angle: Math.PI / 6,
  penumbra: 0.1,
};

// Scene object schema
export const sceneObjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: objectTypeSchema,
  position: vector3Schema,
  rotation: vector3Schema,
  scale: vector3Schema,
  material: materialSchema,
  visible: z.boolean().default(true),
  keyframes: z.array(keyframeSchema).default([]),
  parentId: z.string().nullable().default(null),
  children: z.array(z.string()).default([]),
  lightProperties: lightPropertiesSchema.optional(),
});

export type SceneObject = z.infer<typeof sceneObjectSchema>;

// Camera keyframe schema
export const cameraKeyframeSchema = z.object({
  frame: z.number().int().min(0),
  position: vector3Schema,
  target: vector3Schema,
  fov: z.number().min(10).max(120).default(50),
});

export type CameraKeyframe = z.infer<typeof cameraKeyframeSchema>;

// Camera settings schema
export const cameraSettingsSchema = z.object({
  position: vector3Schema.default({ x: 5, y: 5, z: 5 }),
  target: vector3Schema.default({ x: 0, y: 0, z: 0 }),
  fov: z.number().min(10).max(120).default(50),
  keyframes: z.array(cameraKeyframeSchema).default([]),
});

export type CameraSettings = z.infer<typeof cameraSettingsSchema>;

export const defaultCameraSettings: CameraSettings = {
  position: { x: 5, y: 5, z: 5 },
  target: { x: 0, y: 0, z: 0 },
  fov: 50,
  keyframes: [],
};

// Scene schema
export const sceneSchema = z.object({
  id: z.string(),
  name: z.string(),
  objects: z.array(sceneObjectSchema),
  currentFrame: z.number().int().min(0).default(0),
  totalFrames: z.number().int().min(1).default(120),
  fps: z.number().int().min(1).default(24),
  camera: cameraSettingsSchema.default(defaultCameraSettings),
});

export type Scene = z.infer<typeof sceneSchema>;

// Insert schemas
export const insertSceneSchema = sceneSchema.omit({ id: true });
export type InsertScene = z.infer<typeof insertSceneSchema>;

export const insertSceneObjectSchema = sceneObjectSchema.omit({ id: true });
export type InsertSceneObject = z.infer<typeof insertSceneObjectSchema>;

// Transform mode
export type TransformMode = "translate" | "rotate" | "scale";

// Tool type
export type ToolType = "select" | "translate" | "rotate" | "scale";

// Edit mode type
export type EditModeType = "object" | "vertex" | "edge" | "face";

// Default values
export const defaultMaterial: Material = {
  color: "#808080",
  opacity: 1,
  metalness: 0,
  roughness: 0.5,
};

// Preset materials library
export interface PresetMaterial {
  id: string;
  name: string;
  material: Material;
  category: string;
}

export const presetMaterials: PresetMaterial[] = [
  { id: "default-gray", name: "Default Gray", category: "Basic", material: { color: "#808080", opacity: 1, metalness: 0, roughness: 0.5 } },
  { id: "matte-white", name: "Matte White", category: "Basic", material: { color: "#ffffff", opacity: 1, metalness: 0, roughness: 0.9 } },
  { id: "matte-black", name: "Matte Black", category: "Basic", material: { color: "#1a1a1a", opacity: 1, metalness: 0, roughness: 0.9 } },
  { id: "glossy-red", name: "Glossy Red", category: "Basic", material: { color: "#e53935", opacity: 1, metalness: 0.1, roughness: 0.2 } },
  { id: "glossy-blue", name: "Glossy Blue", category: "Basic", material: { color: "#1e88e5", opacity: 1, metalness: 0.1, roughness: 0.2 } },
  { id: "glossy-green", name: "Glossy Green", category: "Basic", material: { color: "#43a047", opacity: 1, metalness: 0.1, roughness: 0.2 } },
  { id: "gold", name: "Gold", category: "Metal", material: { color: "#ffd700", opacity: 1, metalness: 1, roughness: 0.3 } },
  { id: "silver", name: "Silver", category: "Metal", material: { color: "#c0c0c0", opacity: 1, metalness: 1, roughness: 0.2 } },
  { id: "copper", name: "Copper", category: "Metal", material: { color: "#b87333", opacity: 1, metalness: 1, roughness: 0.35 } },
  { id: "bronze", name: "Bronze", category: "Metal", material: { color: "#cd7f32", opacity: 1, metalness: 0.9, roughness: 0.4 } },
  { id: "brushed-steel", name: "Brushed Steel", category: "Metal", material: { color: "#888888", opacity: 1, metalness: 0.95, roughness: 0.5 } },
  { id: "chrome", name: "Chrome", category: "Metal", material: { color: "#e8e8e8", opacity: 1, metalness: 1, roughness: 0.05 } },
  { id: "glass", name: "Glass", category: "Transparent", material: { color: "#ffffff", opacity: 0.3, metalness: 0, roughness: 0.05 } },
  { id: "frosted-glass", name: "Frosted Glass", category: "Transparent", material: { color: "#f0f0f0", opacity: 0.5, metalness: 0, roughness: 0.6 } },
  { id: "tinted-glass", name: "Tinted Glass", category: "Transparent", material: { color: "#88ccff", opacity: 0.4, metalness: 0, roughness: 0.1 } },
  { id: "plastic-white", name: "Plastic White", category: "Plastic", material: { color: "#f5f5f5", opacity: 1, metalness: 0, roughness: 0.4 } },
  { id: "plastic-black", name: "Plastic Black", category: "Plastic", material: { color: "#222222", opacity: 1, metalness: 0, roughness: 0.4 } },
  { id: "rubber", name: "Rubber", category: "Plastic", material: { color: "#2d2d2d", opacity: 1, metalness: 0, roughness: 0.95 } },
  { id: "wood-oak", name: "Oak Wood", category: "Natural", material: { color: "#c19a6b", opacity: 1, metalness: 0, roughness: 0.7 } },
  { id: "wood-walnut", name: "Walnut Wood", category: "Natural", material: { color: "#5d432c", opacity: 1, metalness: 0, roughness: 0.65 } },
  { id: "marble-white", name: "White Marble", category: "Natural", material: { color: "#f0f0f0", opacity: 1, metalness: 0.1, roughness: 0.3 } },
  { id: "concrete", name: "Concrete", category: "Natural", material: { color: "#9e9e9e", opacity: 1, metalness: 0, roughness: 0.85 } },
];

export const defaultVector3: Vector3 = { x: 0, y: 0, z: 0 };
export const defaultScale: Vector3 = { x: 1, y: 1, z: 1 };

export const isLightType = (type: ObjectType): boolean => {
  return ["pointLight", "directionalLight", "spotLight", "ambientLight"].includes(type);
};

export function createDefaultSceneObject(type: ObjectType, name: string): Omit<SceneObject, "id"> {
  const baseObject = {
    name,
    type,
    position: { ...defaultVector3 },
    rotation: { ...defaultVector3 },
    scale: { ...defaultScale },
    material: { ...defaultMaterial },
    visible: true,
    keyframes: [],
    parentId: null,
    children: [],
  };
  
  if (isLightType(type)) {
    return {
      ...baseObject,
      lightProperties: { ...defaultLightProperties },
    };
  }
  
  return baseObject;
}
