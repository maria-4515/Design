# 3D Studio - Modeling & Animation Tool

## Overview
A web-based 3D modeling and animation application built with React, Three.js, and Express. The app provides a professional interface for creating and animating 3D scenes with primitives, and exporting them as GLTF/GLB files.

## Features
- **3D Viewport**: Interactive canvas with orbit controls, grid, and axis helpers
- **Primitive Creation**: Cube, Sphere, Cylinder, Plane, Cone, Torus
- **Transform Tools**: Move, Rotate, Scale with keyboard shortcuts (Q, W, E, R)
- **Scene Hierarchy**: Object list with visibility toggles
- **Properties Panel**: Position, rotation, scale editing with material properties
- **Material Editor**: Color, opacity, metalness, roughness controls
- **Animation Timeline**: Keyframe-based animation with playback controls
- **Export**: GLTF/GLB file export for use in other 3D applications

## Project Architecture

### Frontend (`client/src/`)
- `App.tsx` - Main application with routing
- `pages/Editor.tsx` - Main editor layout with panels
- `components/Viewport.tsx` - Three.js 3D viewport using React Three Fiber
- `components/Toolbar.tsx` - Top toolbar with tools and actions
- `components/HierarchyPanel.tsx` - Scene object tree
- `components/PropertiesPanel.tsx` - Object properties and materials
- `components/Timeline.tsx` - Animation timeline with keyframes
- `lib/store.ts` - Zustand state management
- `lib/export.ts` - GLTF/GLB export functionality

### Backend (`server/`)
- `routes.ts` - API endpoints for scene CRUD operations
- `storage.ts` - In-memory storage for scenes

### Shared (`shared/`)
- `schema.ts` - TypeScript types and Zod schemas for 3D objects, scenes, materials

## Tech Stack
- **Frontend**: React, Three.js, React Three Fiber, Drei, Zustand, TailwindCSS, Shadcn UI
- **Backend**: Express.js, Node.js
- **Build**: Vite, TypeScript

## Keyboard Shortcuts
- **Q**: Select tool
- **W**: Move tool
- **E**: Rotate tool
- **R**: Scale tool
- **Space**: Play/Pause animation
- **Left/Right Arrow**: Previous/Next frame
- **Home/End**: Jump to start/end
- **Delete**: Delete selected object
- **Ctrl+D**: Duplicate selected object
- **Shift+A**: Quick add cube

## Recent Changes
- December 2024: Initial MVP implementation
  - Full 3D viewport with orbit controls
  - Primitive object creation and manipulation
  - Material editor with PBR properties
  - Animation timeline with keyframe support
  - GLTF/GLB export functionality

## User Preferences
- Dark theme enabled by default (professional 3D software aesthetic)
- Collapsible panels for maximizing viewport space
