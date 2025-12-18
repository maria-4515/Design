# 3D Studio - Modeling & Animation Tool

## Overview
A web-based 3D modeling and animation application built with React, Three.js, and Express. The app provides a professional interface for creating and animating 3D scenes with primitives, and exporting them as GLTF/GLB files.

## Features
- **3D Viewport**: Interactive canvas with orbit controls, grid, and axis helpers
- **Primitive Creation**: Cube, Sphere, Cylinder, Plane, Cone, Torus
- **Transform Tools**: Move, Rotate, Scale with keyboard shortcuts (Q, W, E, R)
- **Scene Hierarchy**: Object list with visibility toggles, object duplication, grouping, and parenting
- **Properties Panel**: Position, rotation, scale editing with material properties
- **Material Editor**: Color, opacity, metalness, roughness controls with 22 PBR preset materials
- **Animation Timeline**: Keyframe-based animation with playback controls for objects and camera
- **Export**: GLTF/GLB file export for use in other 3D applications
- **Undo/Redo**: Full history support with Ctrl+Z/Ctrl+Y
- **Lighting System**: Point, directional, spot, and ambient lights with visual helpers
- **Camera Animation**: Camera keyframes with position/target/FOV interpolation
- **Mesh Editing**: Vertex mode with visualization for selected objects

## Project Architecture

### Frontend (`client/src/`)
- `App.tsx` - Main application with routing
- `pages/Editor.tsx` - Main editor layout with panels and keyboard shortcuts
- `components/Viewport.tsx` - Three.js 3D viewport using React Three Fiber, includes light rendering and vertex visualization
- `components/Toolbar.tsx` - Top toolbar with tools, edit modes, and actions
- `components/HierarchyPanel.tsx` - Scene object tree with camera selection
- `components/PropertiesPanel.tsx` - Object properties, materials, lights, and camera controls
- `components/Timeline.tsx` - Animation timeline with keyframes for objects and camera
- `components/SceneManager.tsx` - Scene saving and loading
- `lib/store.ts` - Zustand state management with undo/redo support
- `lib/history.ts` - History stack management for undo/redo
- `lib/export.ts` - GLTF/GLB export functionality

### Backend (`server/`)
- `routes.ts` - API endpoints for scene CRUD operations
- `storage.ts` - In-memory storage for scenes

### Shared (`shared/`)
- `schema.ts` - TypeScript types and Zod schemas for 3D objects, scenes, materials, lights, camera

## Tech Stack
- **Frontend**: React, Three.js, React Three Fiber, Drei, Zustand, TailwindCSS, Shadcn UI
- **Backend**: Express.js, Node.js
- **Build**: Vite, TypeScript

## Keyboard Shortcuts
- **Q**: Select tool
- **W**: Move tool
- **E**: Rotate tool
- **R**: Scale tool
- **1**: Object mode
- **2**: Vertex mode
- **Space**: Play/Pause animation
- **Left/Right Arrow**: Previous/Next frame
- **Home/End**: Jump to start/end
- **Delete**: Delete selected object
- **Ctrl+D**: Duplicate selected object
- **Ctrl+Z**: Undo
- **Ctrl+Y**: Redo
- **Shift+A**: Quick add cube

## Light Types
- **Point Light**: Omnidirectional light with distance/decay properties
- **Directional Light**: Sun-like parallel rays with rotation-based direction
- **Spot Light**: Cone-shaped light with angle/penumbra controls
- **Ambient Light**: Global fill light for the scene

## Material Library Categories
- **Basic**: White, Grey, Dark Grey, Black, Red, Green, Blue, Yellow, Orange, Purple
- **Metal**: Chrome, Gold, Copper, Brushed Steel
- **Transparent**: Glass, Tinted Glass, Plastic Clear, Water
- **Plastic**: Matte Red, Matte Green, Matte Blue
- **Natural**: Skin, Clay, Wood

## Recent Changes
- December 2024: Added advanced features
  - Undo/redo system with full history support
  - Object duplication, grouping, and parenting relationships
  - Lighting system with 4 light types and visual helpers
  - Camera animation with keyframe support
  - Material library with 22 PBR preset materials
  - Basic mesh editing with vertex mode visualization
- December 2024: Initial MVP implementation
  - Full 3D viewport with orbit controls
  - Primitive object creation and manipulation
  - Material editor with PBR properties
  - Animation timeline with keyframe support
  - GLTF/GLB export functionality

## User Preferences
- Dark theme enabled by default (professional 3D software aesthetic)
- Collapsible panels for maximizing viewport space
