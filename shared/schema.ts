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

// ===== VIDEO EDITOR TYPES =====

// Media asset types
export const mediaTypeSchema = z.enum(["video", "audio", "image", "scene"]);
export type MediaType = z.infer<typeof mediaTypeSchema>;

// Track types for the 32-track timeline
export const trackTypeSchema = z.enum(["video", "audio", "image", "scene", "mask", "effect", "adjustment"]);
export type TrackType = z.infer<typeof trackTypeSchema>;

// Media asset schema (imported files)
export const mediaAssetSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: mediaTypeSchema,
  url: z.string(),
  duration: z.number().min(0).default(0), // in seconds
  width: z.number().int().optional(),
  height: z.number().int().optional(),
  sampleRate: z.number().int().optional(), // for audio
  channels: z.number().int().optional(), // for audio
  thumbnail: z.string().optional(),
});

export type MediaAsset = z.infer<typeof mediaAssetSchema>;

// Effect types
export const effectTypeSchema = z.enum([
  "brightness", "contrast", "saturation", "hue", "blur", "sharpen",
  "vignette", "sepia", "grayscale", "invert", "chromaKey",
  "colorBalance", "curves", "levels", "exposure", "temperature"
]);
export type EffectType = z.infer<typeof effectTypeSchema>;

// Effect keyframe for animated effects
export const effectKeyframeSchema = z.object({
  time: z.number().min(0), // time in seconds
  value: z.number(),
});

export type EffectKeyframe = z.infer<typeof effectKeyframeSchema>;

// Effect schema
export const effectSchema = z.object({
  id: z.string(),
  type: effectTypeSchema,
  enabled: z.boolean().default(true),
  value: z.number().default(0), // current value
  min: z.number().default(-100),
  max: z.number().default(100),
  keyframes: z.array(effectKeyframeSchema).default([]),
});

export type Effect = z.infer<typeof effectSchema>;

// Transition types
export const transitionTypeSchema = z.enum([
  "none", "fade", "dissolve", "wipe", "slide", "zoom", "push", "iris"
]);
export type TransitionType = z.infer<typeof transitionTypeSchema>;

// Transition schema
export const transitionSchema = z.object({
  type: transitionTypeSchema.default("none"),
  duration: z.number().min(0).default(0.5), // in seconds
  easing: z.enum(["linear", "easeIn", "easeOut", "easeInOut"]).default("easeInOut"),
});

export type Transition = z.infer<typeof transitionSchema>;

// Clip schema (an instance of media on a track)
export const clipSchema = z.object({
  id: z.string(),
  trackId: z.string(),
  assetId: z.string().nullable(), // null for adjustment layers
  name: z.string(),
  startTime: z.number().min(0), // start position on timeline in seconds
  duration: z.number().min(0.01), // clip duration in seconds
  inPoint: z.number().min(0).default(0), // trim start in source media
  outPoint: z.number().min(0).optional(), // trim end in source media
  speed: z.number().min(0.1).max(10).default(1), // playback speed multiplier
  volume: z.number().min(0).max(2).default(1), // audio volume
  opacity: z.number().min(0).max(1).default(1), // visual opacity
  muted: z.boolean().default(false),
  locked: z.boolean().default(false),
  effects: z.array(effectSchema).default([]),
  transitionIn: transitionSchema.optional(),
  transitionOut: transitionSchema.optional(),
  // Transform properties for video/image
  position: vector3Schema.optional(), // x, y for 2D, z for depth
  scale: z.object({ x: z.number(), y: z.number() }).optional(),
  rotation: z.number().optional(), // 2D rotation in degrees
});

export type Clip = z.infer<typeof clipSchema>;

// Track schema
export const trackSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: trackTypeSchema,
  index: z.number().int().min(0).max(31), // 0-31 for 32 tracks
  height: z.number().int().default(48), // track height in pixels
  visible: z.boolean().default(true),
  locked: z.boolean().default(false),
  muted: z.boolean().default(false),
  solo: z.boolean().default(false),
  volume: z.number().min(0).max(2).default(1), // master volume for audio tracks
  clips: z.array(z.string()).default([]), // clip IDs on this track
});

export type Track = z.infer<typeof trackSchema>;

// Adjustment layer schema (special clips that affect layers below)
export const adjustmentLayerSchema = z.object({
  id: z.string(),
  name: z.string(),
  trackId: z.string(),
  startTime: z.number().min(0),
  duration: z.number().min(0.01),
  effects: z.array(effectSchema).default([]),
  blendMode: z.enum(["normal", "multiply", "screen", "overlay", "softLight"]).default("normal"),
  opacity: z.number().min(0).max(1).default(1),
});

export type AdjustmentLayer = z.infer<typeof adjustmentLayerSchema>;

// Audio mixer channel
export const audioChannelSchema = z.object({
  trackId: z.string(),
  volume: z.number().min(0).max(2).default(1),
  pan: z.number().min(-1).max(1).default(0), // -1 = left, 0 = center, 1 = right
  muted: z.boolean().default(false),
  solo: z.boolean().default(false),
});

export type AudioChannel = z.infer<typeof audioChannelSchema>;

// Video project schema (combines 3D scene + video timeline)
export const videoProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  // Timeline settings
  duration: z.number().min(0).default(60), // project duration in seconds
  fps: z.number().int().min(1).max(120).default(30),
  width: z.number().int().default(1920),
  height: z.number().int().default(1080),
  // Media assets library
  assets: z.array(mediaAssetSchema).default([]),
  // Tracks (up to 32)
  tracks: z.array(trackSchema).default([]),
  // Clips
  clips: z.array(clipSchema).default([]),
  // Audio mixer settings
  masterVolume: z.number().min(0).max(2).default(1),
  audioChannels: z.array(audioChannelSchema).default([]),
});

export type VideoProject = z.infer<typeof videoProjectSchema>;

// Effect presets
export interface EffectPreset {
  id: string;
  name: string;
  category: string;
  effects: Omit<Effect, "id">[];
}

export const effectPresets: EffectPreset[] = [
  { id: "vintage", name: "Vintage Film", category: "Color", effects: [
    { type: "sepia", enabled: true, value: 30, min: 0, max: 100, keyframes: [] },
    { type: "contrast", enabled: true, value: 10, min: -100, max: 100, keyframes: [] },
    { type: "vignette", enabled: true, value: 40, min: 0, max: 100, keyframes: [] },
  ]},
  { id: "noir", name: "Film Noir", category: "Color", effects: [
    { type: "grayscale", enabled: true, value: 100, min: 0, max: 100, keyframes: [] },
    { type: "contrast", enabled: true, value: 30, min: -100, max: 100, keyframes: [] },
  ]},
  { id: "vibrant", name: "Vibrant", category: "Color", effects: [
    { type: "saturation", enabled: true, value: 40, min: -100, max: 100, keyframes: [] },
    { type: "contrast", enabled: true, value: 15, min: -100, max: 100, keyframes: [] },
  ]},
  { id: "cold", name: "Cold Tone", category: "Color", effects: [
    { type: "temperature", enabled: true, value: -30, min: -100, max: 100, keyframes: [] },
  ]},
  { id: "warm", name: "Warm Tone", category: "Color", effects: [
    { type: "temperature", enabled: true, value: 30, min: -100, max: 100, keyframes: [] },
  ]},
  { id: "dreamy", name: "Dreamy", category: "Stylize", effects: [
    { type: "blur", enabled: true, value: 10, min: 0, max: 100, keyframes: [] },
    { type: "brightness", enabled: true, value: 15, min: -100, max: 100, keyframes: [] },
  ]},
  { id: "sharp", name: "Sharp", category: "Stylize", effects: [
    { type: "sharpen", enabled: true, value: 50, min: 0, max: 100, keyframes: [] },
    { type: "contrast", enabled: true, value: 10, min: -100, max: 100, keyframes: [] },
  ]},
];

// Default track configuration (8 video, 8 audio, etc.)
export function createDefaultTracks(): Track[] {
  const tracks: Track[] = [];
  
  // 8 video tracks (top)
  for (let i = 0; i < 8; i++) {
    tracks.push({
      id: `track_video_${i}`,
      name: `Video ${i + 1}`,
      type: "video",
      index: i,
      height: 48,
      visible: true,
      locked: false,
      muted: false,
      solo: false,
      volume: 1,
      clips: [],
    });
  }
  
  // 4 image tracks
  for (let i = 0; i < 4; i++) {
    tracks.push({
      id: `track_image_${i}`,
      name: `Image ${i + 1}`,
      type: "image",
      index: 8 + i,
      height: 48,
      visible: true,
      locked: false,
      muted: false,
      solo: false,
      volume: 1,
      clips: [],
    });
  }
  
  // 4 scene tracks (for 3D scenes)
  for (let i = 0; i < 4; i++) {
    tracks.push({
      id: `track_scene_${i}`,
      name: `Scene ${i + 1}`,
      type: "scene",
      index: 12 + i,
      height: 48,
      visible: true,
      locked: false,
      muted: false,
      solo: false,
      volume: 1,
      clips: [],
    });
  }
  
  // 4 effect/adjustment tracks
  for (let i = 0; i < 4; i++) {
    tracks.push({
      id: `track_effect_${i}`,
      name: `Adjustment ${i + 1}`,
      type: "adjustment",
      index: 16 + i,
      height: 48,
      visible: true,
      locked: false,
      muted: false,
      solo: false,
      volume: 1,
      clips: [],
    });
  }
  
  // 4 mask tracks
  for (let i = 0; i < 4; i++) {
    tracks.push({
      id: `track_mask_${i}`,
      name: `Mask ${i + 1}`,
      type: "mask",
      index: 20 + i,
      height: 48,
      visible: true,
      locked: false,
      muted: false,
      solo: false,
      volume: 1,
      clips: [],
    });
  }
  
  // 8 audio tracks (bottom)
  for (let i = 0; i < 8; i++) {
    tracks.push({
      id: `track_audio_${i}`,
      name: `Audio ${i + 1}`,
      type: "audio",
      index: 24 + i,
      height: 48,
      visible: true,
      locked: false,
      muted: false,
      solo: false,
      volume: 1,
      clips: [],
    });
  }
  
  return tracks;
}

// Helper to generate unique IDs
export const generateVideoId = () => `vid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
