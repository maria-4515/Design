# 3D Studio - Modeling, Animation, Video Editing & Compositing Tool

## Overview
A web-based creative suite built with React, Three.js, and Express. Features four integrated editors: 3D modeling with primitives and animation, professional video editing with multi-track timeline, a node-based compositor for visual effects and compositing, and character animation with skeletal rigging.

**AI-Powered Features**: Unique AI capabilities not found in traditional tools like Canva or Blender - including text-to-3D scene generation, AI material suggestions, animation recommendations, and an intelligent chat assistant.

## Features

### AI Assistant (Unique Features)
- **Text-to-Scene Generation**: Describe a scene in natural language and AI generates 3D objects with positions, materials, and lighting
- **Material Suggestions**: AI recommends 5 different material options based on object context (metallic, matte, transparent, etc.)
- **Animation Suggestions**: Get AI-powered animation recommendations for any object with ready-to-apply keyframes
- **Scene Enhancement**: Add complementary objects and lighting to existing scenes via AI
- **Chat Assistant**: Conversational AI that understands your scene context and provides guidance
- **Texture Prompt Generation**: AI creates optimized prompts for seamless texture generation

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

### Compositor Node Editor
- **Visual Node Graph**: Canvas-based node editor with panning, zooming, and bezier curve connections
- **Keying Nodes**: Chroma Key, Luminance Key, Difference Key with adjustable parameters
- **Matte Cleanup**: Dilate/Erode, Blur, Despill nodes for refining mattes
- **Alpha Blending**: Alpha Over, Mix nodes with blend modes (Add, Multiply, Screen, Overlay)
- **Color Correction**: Color Correction, Curves, Levels, Hue/Saturation nodes
- **Transform Nodes**: Position, rotation, scale transformations
- **Input/Output**: Render Layers input, Image input, Composite and Viewer outputs
- **Backdrop Preview**: View node output as canvas backdrop
- **Node Properties**: Parameter editing panel with sliders, color pickers, and options

### Character Animation
- **Skeleton System**: Bone hierarchy with parent/child relationships
- **Pose Editor**: Bone selection and rotation controls with pose library
- **Humanoid Preset**: Pre-configured 20-bone skeleton (spine, arms, legs, head)
- **IK Mode**: Inverse kinematics with CCD solver and configurable chain length
- **Action Editor**: Create reusable animation clips with bone keyframes
- **NLA Editor**: Non-linear animation with strips, blending, and layering
- **Audio Sync**: Audio tracks with waveform visualization and sync markers

## Project Architecture

### Frontend (`client/src/`)
- `App.tsx` - Main application with routing (3D, Video, Compositor, Character editors)
- `pages/Editor.tsx` - 3D editor layout with panels, keyboard shortcuts, and AI panel
- `pages/VideoEditor.tsx` - Video editor layout with timeline and scopes
- `pages/CompositorEditor.tsx` - Compositor editor layout
- `pages/CharacterAnimEditor.tsx` - Character animation editor layout
- `components/Viewport.tsx` - Three.js 3D viewport using React Three Fiber
- `components/Toolbar.tsx` - Top toolbar with tools, edit modes, and actions
- `components/HierarchyPanel.tsx` - Scene object tree with camera selection
- `components/PropertiesPanel.tsx` - Object properties, materials, lights, and camera controls
- `components/Timeline.tsx` - 3D animation timeline with keyframes
- `components/AIPanel.tsx` - AI assistant with scene generation, materials, animations, and chat
- `components/VideoTimeline.tsx` - Video editor 32-track timeline
- `components/VideoPreview.tsx` - Video preview with playback controls
- `components/AudioMixer.tsx` - Audio mixing console with waveforms
- `components/VideoScopes.tsx` - Luma waveform, vectorscope, histogram
- `components/MediaLibrary.tsx` - Media asset management
- `components/ClipProperties.tsx` - Clip editing (speed, effects, transitions)
- `components/SceneManager.tsx` - Scene saving and loading
- `components/NodeEditor.tsx` - Visual node graph editor for compositing
- `components/PoseEditor.tsx` - Bone hierarchy and pose controls
- `components/NlaEditor.tsx` - NLA timeline with strips and audio
- `lib/store.ts` - Zustand state management for 3D editor
- `lib/videoStore.ts` - Zustand state management for video editor
- `lib/compositorStore.ts` - Zustand state management for compositor
- `lib/characterAnimStore.ts` - Zustand state management for character animation
- `lib/performance.ts` - Performance utilities (debounce, throttle, object pooling, memoization)
- `lib/history.ts` - History stack management for undo/redo
- `lib/export.ts` - GLTF/GLB export functionality

### Backend (`server/`)
- `routes.ts` - API endpoints for scene CRUD and AI operations
- `storage.ts` - In-memory storage for scenes
- `ai/sceneAI.ts` - AI service for scene generation, material/animation suggestions, chat

### AI Integration (`server/replit_integrations/`)
- `chat/` - Chat storage and conversation management
- `image/` - Image generation via OpenAI gpt-image-1
- `batch/` - Batch processing utilities with rate limiting

### Shared (`shared/`)
- `schema.ts` - TypeScript types and Zod schemas for all data models

## Tech Stack
- **Frontend**: React, Three.js, React Three Fiber, Drei, Zustand, TailwindCSS, Shadcn UI
- **Backend**: Express.js, Node.js
- **AI**: OpenAI GPT-4o (via Replit AI Integrations - no API key needed)
- **Build**: Vite, TypeScript

## Routes
- `/` or `/3d` - 3D Modeling Editor
- `/video` - Video Editor
- `/compositor` - Node-based Compositor
- `/character` - Character Animation Editor

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

## AI API Endpoints
- `POST /api/ai/generate-scene` - Generate 3D scene from text prompt
- `POST /api/ai/suggest-materials` - Get material suggestions for an object
- `POST /api/ai/suggest-animations` - Get animation suggestions for an object
- `POST /api/ai/enhance-scene` - Add objects to enhance existing scene
- `POST /api/ai/chat` - Chat with AI assistant about scene
- `POST /api/ai/texture-prompt` - Generate optimized texture prompts
- `POST /api/generate-image` - Generate images from prompts

## Performance Optimizations
- **Debouncing**: Input handlers and API calls are debounced to prevent excessive updates
- **Throttling**: Scroll and resize handlers throttled for smooth performance
- **Object Pooling**: Reusable object pools for vectors and temporary objects
- **Memoization**: Expensive computations cached with dependency tracking
- **RAF Scheduling**: DOM updates batched via requestAnimationFrame
- **Idle Scheduling**: Low-priority tasks scheduled during browser idle time
- **Zustand Selectors**: Optimized selectors to minimize re-renders

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

## Compositor Node Types
- **Input**: Image, Render Layers, Color
- **Output**: Composite, Viewer
- **Keying**: Chroma Key, Luminance Key, Difference Key
- **Matte**: Dilate/Erode, Blur, Despill
- **Color**: Color Correction, Curves, Levels, Hue/Saturation
- **Mix**: Alpha Over, Mix (with blend modes)
- **Transform**: Transform (position, rotation, scale)
- **Utility**: Set Alpha, Invert

## Character Animation Features
- **Pose Mode**: Select and rotate bones, save/load poses
- **Action Mode**: Create animation clips with keyframes
- **NLA Mode**: Combine actions with blend modes (replace/add/multiply)
- **IK Chains**: Configure chain length 1-10, simplified CCD solver
- **Audio Markers**: Beat, phoneme, event, and custom markers for lip sync

## Recent Changes
- December 2024: Added AI-powered features
  - Text-to-scene generation using GPT-4o
  - AI material suggestions with 5 diverse options
  - AI animation suggestions with keyframe generation
  - Scene enhancement via AI
  - Chat assistant with scene context awareness
  - Texture prompt optimization
  - AI panel integrated into 3D editor with tabs
  - Performance utilities (debouncing, throttling, object pooling)
- December 2024: Added character animation system
  - Bone/skeleton hierarchy with humanoid preset (20 bones)
  - Pose editor with rotation sliders and pose library
  - IK mode with CCD solver and configurable chain length
  - NLA editor with animation strips and blend modes
  - Audio tracks with waveform and sync markers
  - Action editor for reusable animation clips
- December 2024: Added compositor node editor
  - Visual node graph with drag-and-drop connections
  - 20+ node types across 8 categories
  - Chroma key with tolerance, softness, spill suppression
  - Matte cleanup tools (dilate/erode, blur, despill)
  - Color correction with saturation, contrast, gamma, gain, lift
  - Alpha Over blending with premultiply option
  - Viewer node with backdrop preview
  - Pan, zoom, and node property editing
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
- AI panel accessible via Properties tab toggle
