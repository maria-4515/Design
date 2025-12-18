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
export const objectTypeSchema = z.enum(["cube", "sphere", "cylinder", "plane", "cone", "torus"]);
export type ObjectType = z.infer<typeof objectTypeSchema>;

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
});

export type SceneObject = z.infer<typeof sceneObjectSchema>;

// Scene schema
export const sceneSchema = z.object({
  id: z.string(),
  name: z.string(),
  objects: z.array(sceneObjectSchema),
  currentFrame: z.number().int().min(0).default(0),
  totalFrames: z.number().int().min(1).default(120),
  fps: z.number().int().min(1).default(24),
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

// Default values
export const defaultMaterial: Material = {
  color: "#808080",
  opacity: 1,
  metalness: 0,
  roughness: 0.5,
};

export const defaultVector3: Vector3 = { x: 0, y: 0, z: 0 };
export const defaultScale: Vector3 = { x: 1, y: 1, z: 1 };

export function createDefaultSceneObject(type: ObjectType, name: string): Omit<SceneObject, "id"> {
  return {
    name,
    type,
    position: { ...defaultVector3 },
    rotation: { ...defaultVector3 },
    scale: { ...defaultScale },
    material: { ...defaultMaterial },
    visible: true,
    keyframes: [],
  };
}
