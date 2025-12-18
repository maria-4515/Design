import { randomUUID } from "crypto";

// Scene types (matching frontend schema)
interface Vector3 {
  x: number;
  y: number;
  z: number;
}

interface Material {
  color: string;
  opacity: number;
  metalness: number;
  roughness: number;
}

interface Keyframe {
  frame: number;
  position?: Vector3;
  rotation?: Vector3;
  scale?: Vector3;
}

type ObjectType = "cube" | "sphere" | "cylinder" | "plane" | "cone" | "torus";

interface SceneObject {
  id: string;
  name: string;
  type: ObjectType;
  position: Vector3;
  rotation: Vector3;
  scale: Vector3;
  material: Material;
  visible: boolean;
  keyframes: Keyframe[];
}

interface Scene {
  id: string;
  name: string;
  objects: SceneObject[];
  currentFrame: number;
  totalFrames: number;
  fps: number;
}

type InsertScene = Omit<Scene, "id">;

export interface IStorage {
  getScene(id: string): Promise<Scene | undefined>;
  getAllScenes(): Promise<Scene[]>;
  createScene(scene: InsertScene): Promise<Scene>;
  updateScene(id: string, scene: Partial<InsertScene>): Promise<Scene | undefined>;
  deleteScene(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private scenes: Map<string, Scene>;

  constructor() {
    this.scenes = new Map();
  }

  async getScene(id: string): Promise<Scene | undefined> {
    return this.scenes.get(id);
  }

  async getAllScenes(): Promise<Scene[]> {
    return Array.from(this.scenes.values());
  }

  async createScene(insertScene: InsertScene): Promise<Scene> {
    const id = randomUUID();
    const scene: Scene = { ...insertScene, id };
    this.scenes.set(id, scene);
    return scene;
  }

  async updateScene(id: string, updates: Partial<InsertScene>): Promise<Scene | undefined> {
    const existing = this.scenes.get(id);
    if (!existing) return undefined;
    
    const updated: Scene = { ...existing, ...updates };
    this.scenes.set(id, updated);
    return updated;
  }

  async deleteScene(id: string): Promise<boolean> {
    return this.scenes.delete(id);
  }
}

export const storage = new MemStorage();
