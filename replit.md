# 3D Studio - Modeling, Animation & Video Editing Tool

## Overview
A web-based 3D modeling and animation application built with React, Three.js, and Express. The app provides a professional interface for creating and animating 3D scenes with primitives, and exporting them as GLTF/GLB files. Now includes integrated video editing capabilities with multi-track timeline, audio mixing, and visual scopes.

## Features

### 3D Editor
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

### Video Editor
- **Live Preview**: Real-time video playback with transport controls
- **32-Track Timeline**: Support for video, audio, image, 3D scene, mask, and adjustment tracks
- **Media Library**: Import and organize video, audio, and image assets
- **Audio Mixer**: Per-track volume, pan, mute, solo controls with master output
- **Video Scopes**: Luma waveform, chroma vectorscope, RGB histogram displays
- **Clip Properties**: Speed control, opacity, volume, transitions, effects
- **Effects System**: 16 effect types (brightness, contrast, saturation, blur, etc.)
- **Effect Presets**: Pre-configured effect combinations (Vintage, Noir, Vibrant, etc.)
- **Transitions**: Fade, dissolve, wipe, slide, zoom, push, iris transitions
- **Keyframe Animation**: Animate effect parameters over time

## Project Architecture

### Frontend (`client/src/`)
- `App.tsx` - Main application with routing (3D and Video editors)
- `pages/Editor.tsx` - 3D editor layout with panels and keyboard shortcuts
- `pages/VideoEditor.tsx` - Video editor layout with timeline and scopes
- `components/Viewport.tsx` - Three.js 3D viewport using React Three Fiber
- `components/Toolbar.tsx` - Top toolbar with tools, edit modes, and actions
- `components/HierarchyPanel.tsx` - Scene object tree with camera selection
- `components/PropertiesPanel.tsx` - Object properties, materials, lights, and camera controls
- `components/Timeline.tsx` - 3D animation timeline with keyframes
- `components/VideoTimeline.tsx` - Video editor 32-track timeline
- `components/VideoPreview.tsx` - Video preview with playback controls
- `components/AudioMixer.tsx` - Audio mixing console with waveforms
- `components/VideoScopes.tsx` - Luma waveform, vectorscope, histogram
- `components/MediaLibrary.tsx` - Media asset management
- `components/ClipProperties.tsx` - Clip editing (speed, effects, transitions)
- `components/SceneManager.tsx` - Scene saving and loading
- `lib/store.ts` - Zustand state management for 3D editor
- `lib/videoStore.ts` - Zustand state management for video editor
- `lib/history.ts` - History stack management for undo/redo
- `lib/export.ts` - GLTF/GLB export functionality

### Backend (`server/`)
- `routes.ts` - API endpoints for scene CRUD operations
- `storage.ts` - In-memory storage for scenes

### Shared (`shared/`)
- `schema.ts` - TypeScript types and Zod schemas for 3D objects, scenes, materials, lights, camera, video timeline, clips, tracks, effects

## Tech Stack
- **Frontend**: React, Three.js, React Three Fiber, Drei, Zustand, TailwindCSS, Shadcn UI
- **Backend**: Express.js, Node.js
- **Build**: Vite, TypeScript

## Routes
- `/` or `/3d` - 3D Modeling Editor
- `/video` - Video Editor

## Keyboard Shortcuts

### 3D Editor
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

### Video Editor
- **Space**: Play/Pause video
- **Left/Right Arrow**: Previous/Next frame
- **J/L**: Skip 5 seconds backward/forward
- **Home/End**: Jump to start/end
- **Delete**: Delete selected clip
- **Ctrl+S**: Split clip at playhead

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

## Video Timeline Track Types
- **Video Tracks (8)**: For video clips
- **Image Tracks (4)**: For still images
- **Scene Tracks (4)**: For 3D scene compositions
- **Adjustment Tracks (4)**: For adjustment layers with effects
- **Mask Tracks (4)**: For masking and compositing
- **Audio Tracks (8)**: For audio and music

## Effect Types
- **Color**: Brightness, Contrast, Saturation, Hue, Exposure, Temperature
- **Stylize**: Blur, Sharpen, Vignette, Sepia, Grayscale, Invert
- **Keying**: Chroma Key
- **Advanced**: Color Balance, Curves, Levels

## Recent Changes
- December 2024: Added video editor integration
  - 32-track timeline for video, audio, images, 3D scenes, masks, effects
  - Live preview with transport controls
  - Audio mixer with per-track controls
  - Video scopes (waveform, vectorscope, histogram)
  - Effect system with presets and keyframes
  - Transitions between clips
  - Speed control and clip trimming
- December 2024: Added advanced 3D features
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
- Collapsible panels for maximizing viewport/preview space
