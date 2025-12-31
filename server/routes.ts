import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  generateSceneFromPrompt,
  suggestMaterials,
  suggestAnimations,
  enhanceScene,
  chatWithAssistant,
  generateTexturePrompt,
} from "./ai/sceneAI";
import { registerImageRoutes } from "./replit_integrations/image";
import { registerChatRoutes } from "./replit_integrations/chat";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Register AI integration routes
  registerImageRoutes(app);
  registerChatRoutes(app);

  // Scene CRUD endpoints
  
  // Get all scenes
  app.get("/api/scenes", async (req, res) => {
    try {
      const scenes = await storage.getAllScenes();
      res.json(scenes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch scenes" });
    }
  });
  
  // Get a specific scene
  app.get("/api/scenes/:id", async (req, res) => {
    try {
      const scene = await storage.getScene(req.params.id);
      if (!scene) {
        return res.status(404).json({ error: "Scene not found" });
      }
      res.json(scene);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch scene" });
    }
  });
  
  // Create a new scene
  app.post("/api/scenes", async (req, res) => {
    try {
      const { name, objects, currentFrame, totalFrames, fps } = req.body;
      
      if (!name) {
        return res.status(400).json({ error: "Scene name is required" });
      }
      
      const scene = await storage.createScene({
        name,
        objects: objects || [],
        currentFrame: currentFrame || 0,
        totalFrames: totalFrames || 120,
        fps: fps || 24,
      });
      
      res.status(201).json(scene);
    } catch (error) {
      res.status(500).json({ error: "Failed to create scene" });
    }
  });
  
  // Update a scene
  app.patch("/api/scenes/:id", async (req, res) => {
    try {
      const scene = await storage.updateScene(req.params.id, req.body);
      if (!scene) {
        return res.status(404).json({ error: "Scene not found" });
      }
      res.json(scene);
    } catch (error) {
      res.status(500).json({ error: "Failed to update scene" });
    }
  });
  
  // Delete a scene
  app.delete("/api/scenes/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteScene(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Scene not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete scene" });
    }
  });
  
  // Export scene as GLTF
  app.get("/api/scenes/:id/export", async (req, res) => {
    try {
      const scene = await storage.getScene(req.params.id);
      if (!scene) {
        return res.status(404).json({ error: "Scene not found" });
      }
      
      res.json({
        scene,
        format: req.query.format || "gltf",
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to export scene" });
    }
  });

  // ===== AI ENDPOINTS =====

  // Generate scene from text prompt
  app.post("/api/ai/generate-scene", async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }
      const scene = await generateSceneFromPrompt(prompt);
      res.json(scene);
    } catch (error) {
      console.error("AI scene generation error:", error);
      res.status(500).json({ error: "Failed to generate scene" });
    }
  });

  // Suggest materials for an object
  app.post("/api/ai/suggest-materials", async (req, res) => {
    try {
      const { objectDescription } = req.body;
      if (!objectDescription) {
        return res.status(400).json({ error: "Object description is required" });
      }
      const materials = await suggestMaterials(objectDescription);
      res.json({ materials });
    } catch (error) {
      console.error("AI material suggestion error:", error);
      res.status(500).json({ error: "Failed to suggest materials" });
    }
  });

  // Suggest animations for an object
  app.post("/api/ai/suggest-animations", async (req, res) => {
    try {
      const { objectType, context } = req.body;
      if (!objectType) {
        return res.status(400).json({ error: "Object type is required" });
      }
      const animations = await suggestAnimations(objectType, context || "general scene");
      res.json({ animations });
    } catch (error) {
      console.error("AI animation suggestion error:", error);
      res.status(500).json({ error: "Failed to suggest animations" });
    }
  });

  // Enhance existing scene
  app.post("/api/ai/enhance-scene", async (req, res) => {
    try {
      const { currentScene, enhancement } = req.body;
      if (!currentScene || !enhancement) {
        return res.status(400).json({ error: "Current scene and enhancement prompt are required" });
      }
      const enhanced = await enhanceScene(currentScene, enhancement);
      res.json(enhanced);
    } catch (error) {
      console.error("AI scene enhancement error:", error);
      res.status(500).json({ error: "Failed to enhance scene" });
    }
  });

  // Chat with AI assistant
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { messages, sceneContext } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Messages array is required" });
      }
      const response = await chatWithAssistant(messages, sceneContext);
      res.json({ response });
    } catch (error) {
      console.error("AI chat error:", error);
      res.status(500).json({ error: "Failed to get AI response" });
    }
  });

  // Generate texture prompt
  app.post("/api/ai/texture-prompt", async (req, res) => {
    try {
      const { description } = req.body;
      if (!description) {
        return res.status(400).json({ error: "Description is required" });
      }
      const prompt = await generateTexturePrompt(description);
      res.json({ prompt });
    } catch (error) {
      console.error("AI texture prompt error:", error);
      res.status(500).json({ error: "Failed to generate texture prompt" });
    }
  });

  return httpServer;
}
