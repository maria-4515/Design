import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
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
  
  // Export scene as GLTF (returns scene data for client-side GLTF generation)
  app.get("/api/scenes/:id/export", async (req, res) => {
    try {
      const scene = await storage.getScene(req.params.id);
      if (!scene) {
        return res.status(404).json({ error: "Scene not found" });
      }
      
      // Return scene data - actual GLTF conversion happens client-side with Three.js
      res.json({
        scene,
        format: req.query.format || "gltf",
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to export scene" });
    }
  });

  return httpServer;
}
