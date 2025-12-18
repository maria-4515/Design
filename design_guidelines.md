# Design Guidelines: 3D Modeling & Animation Tool

## Design Approach

**Reference-Based + System Hybrid**: Drawing from professional 3D software (Blender, Cinema 4D, Unity Editor) combined with modern web application patterns. This is a utility-focused professional tool requiring precision, efficiency, and spatial economy.

## Core Design Principles

1. **Maximize Canvas Space**: The 3D viewport is the primary workspace—allocate 60-70% of screen real estate
2. **Information Hierarchy**: Critical tools immediately accessible, secondary options collapsible
3. **Professional Density**: Dense, organized layouts that respect professional workflows
4. **Spatial Consistency**: Fixed panel positions that users can rely on

## Layout System

**Application Structure** (Full viewport, no scrolling):
- Top toolbar: 48px height with tool selection and scene controls
- Left sidebar: 280px collapsible panel for object hierarchy and scene tree
- Right sidebar: 320px collapsible panel for properties and material editor
- Bottom timeline: 200px height for animation keyframes and playback controls
- Central viewport: Remaining space for 3D canvas

**Spacing System**: Use Tailwind units of 1, 2, 4, 6, and 8 for tight, professional spacing. Panels use p-4, buttons use p-2, icons use size-5 or size-6.

## Typography

**Font Stack**:
- Primary: 'Inter' from Google Fonts for UI labels and controls
- Monospace: 'JetBrains Mono' for numerical inputs, coordinates, timecode

**Scale**:
- Panel titles: text-sm font-semibold uppercase tracking-wide
- Property labels: text-xs font-medium
- Input values: text-sm font-mono
- Toolbar labels: text-xs

## Component Library

**Core UI Elements**:
- Icon-only toolbar buttons (32px × 32px) with tooltips
- Numerical inputs with drag-to-adjust capability indicators
- Collapsible panel sections with chevron indicators
- Tab groups for switching between panel contexts (Properties/Materials/Modifiers)

**Specialized Components**:
- Timeline ruler with frame markers and playhead scrubber
- Keyframe diamonds on timeline tracks
- 3D gizmos for transform tools (move/rotate/scale) overlaid on viewport
- Scene hierarchy tree with expand/collapse and object visibility toggles
- Grid overlay on 3D viewport with axis indicators (X/Y/Z)

**Navigation & Controls**:
- Fixed top toolbar divided into sections: File operations, Transform tools, Object creation, Playback controls
- Context menus for right-click operations
- Keyboard shortcut hints in tooltips

**Forms & Inputs**:
- Grouped property fields (Position X/Y/Z, Rotation, Scale as triplets)
- Sliders with numerical input fields for properties like opacity
- Color pickers for material settings
- Dropdown selects for primitive types and material presets

**Data Displays**:
- Object list with type icons (cube, sphere, camera, light)
- Outliner showing parent-child relationships with indentation
- Timeline tracks showing animation curves per property

**Overlays**:
- Floating panels for export dialog
- Modal confirmations for destructive actions
- Toast notifications for save confirmations and errors in top-right corner

## Images

**No hero images or decorative imagery**. This is a professional tool application where every pixel serves functional purpose. The 3D viewport content is the visual focus.

## Accessibility

- High contrast between UI panels and viewport for clear boundaries
- Keyboard shortcuts for all primary tools (noted in tooltips)
- Consistent focus indicators on all interactive elements
- Sufficient target sizes for drag handles and small controls (minimum 24px)

## Critical Constraints

- **Fixed viewport layout**: No scrolling in the main application (panels may scroll internally)
- **Panel resizing**: Users should be able to drag panel edges to resize workspace areas
- **Collapsible sidebars**: Allow full-width viewport when panels are hidden
- **Timeline always docked**: Bottom timeline remains accessible during animation work

## Professional UI Patterns

- **Transform gizmos**: 3D manipulators appear on selected objects (arrows for move, circles for rotate, boxes for scale)
- **Toolbar segmentation**: Visual separators between tool groups using subtle dividers
- **Active tool highlighting**: Currently selected tool shows distinct active state
- **Grid and axis helpers**: Viewport displays ground grid and colored axis lines (X=red, Y=green, Z=blue convention)
- **Frame counter**: Current frame and total frames displayed in timeline header