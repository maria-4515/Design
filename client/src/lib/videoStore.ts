import { create } from "zustand";
import type {
  MediaAsset,
  Track,
  Clip,
  Effect,
  AudioChannel,
  TrackType,
  EffectType,
} from "@shared/schema";
import { createDefaultTracks, generateVideoId } from "@shared/schema";

export type EditorMode = "3d" | "video";

interface VideoEditorState {
  // Editor mode
  editorMode: EditorMode;
  
  // Project settings
  projectDuration: number; // in seconds
  projectFps: number;
  projectWidth: number;
  projectHeight: number;
  
  // Playback state
  currentTime: number; // in seconds
  isVideoPlaying: boolean;
  isScrubbing: boolean;
  playbackSpeed: number;
  
  // Timeline state
  tracks: Track[];
  clips: Clip[];
  selectedClipId: string | null;
  selectedTrackId: string | null;
  
  // Media library
  assets: MediaAsset[];
  selectedAssetId: string | null;
  
  // Audio mixer
  masterVolume: number;
  audioChannels: AudioChannel[];
  
  // Zoom and scroll
  timelineZoom: number; // pixels per second
  timelineScrollX: number;
  
  // Scope visibility
  showWaveform: boolean;
  showVectorscope: boolean;
  showHistogram: boolean;
  
  // Actions
  setEditorMode: (mode: EditorMode) => void;
  
  // Playback actions
  setCurrentTime: (time: number) => void;
  toggleVideoPlayback: () => void;
  setPlaybackSpeed: (speed: number) => void;
  setScrubbing: (scrubbing: boolean) => void;
  
  // Project actions
  setProjectDuration: (duration: number) => void;
  setProjectFps: (fps: number) => void;
  setProjectResolution: (width: number, height: number) => void;
  
  // Track actions
  addTrack: (type: TrackType) => void;
  removeTrack: (trackId: string) => void;
  updateTrack: (trackId: string, updates: Partial<Track>) => void;
  toggleTrackMute: (trackId: string) => void;
  toggleTrackSolo: (trackId: string) => void;
  toggleTrackLock: (trackId: string) => void;
  toggleTrackVisibility: (trackId: string) => void;
  selectTrack: (trackId: string | null) => void;
  
  // Clip actions
  addClip: (trackId: string, assetId: string | null, startTime: number, duration: number) => string;
  removeClip: (clipId: string) => void;
  updateClip: (clipId: string, updates: Partial<Clip>) => void;
  selectClip: (clipId: string | null) => void;
  moveClip: (clipId: string, newTrackId: string, newStartTime: number) => void;
  trimClip: (clipId: string, newInPoint: number, newOutPoint: number) => void;
  splitClip: (clipId: string, splitTime: number) => void;
  
  // Effect actions
  addEffect: (clipId: string, effectType: EffectType) => void;
  removeEffect: (clipId: string, effectId: string) => void;
  updateEffect: (clipId: string, effectId: string, updates: Partial<Effect>) => void;
  
  // Asset actions
  addAsset: (asset: Omit<MediaAsset, "id">) => string;
  removeAsset: (assetId: string) => void;
  selectAsset: (assetId: string | null) => void;
  getAssetById: (assetId: string) => MediaAsset | undefined;
  
  // Audio actions
  setMasterVolume: (volume: number) => void;
  setChannelVolume: (trackId: string, volume: number) => void;
  setChannelPan: (trackId: string, pan: number) => void;
  
  // Timeline actions
  setTimelineZoom: (zoom: number) => void;
  setTimelineScrollX: (scrollX: number) => void;
  
  // Scope actions
  toggleWaveform: () => void;
  toggleVectorscope: () => void;
  toggleHistogram: () => void;
  
  // Utility
  getClipsAtTime: (time: number) => Clip[];
  getClipsOnTrack: (trackId: string) => Clip[];
  getVisibleTracks: () => Track[];
  getAudioTracks: () => Track[];
  getVideoTracks: () => Track[];
}

export const useVideoStore = create<VideoEditorState>((set, get) => ({
  // Initial state
  editorMode: "3d",
  
  projectDuration: 60,
  projectFps: 30,
  projectWidth: 1920,
  projectHeight: 1080,
  
  currentTime: 0,
  isVideoPlaying: false,
  isScrubbing: false,
  playbackSpeed: 1,
  
  tracks: createDefaultTracks(),
  clips: [],
  selectedClipId: null,
  selectedTrackId: null,
  
  assets: [],
  selectedAssetId: null,
  
  masterVolume: 1,
  audioChannels: [],
  
  timelineZoom: 50, // 50 pixels per second
  timelineScrollX: 0,
  
  showWaveform: true,
  showVectorscope: false,
  showHistogram: true,
  
  // Actions
  setEditorMode: (mode) => set({ editorMode: mode }),
  
  // Playback actions
  setCurrentTime: (time) => set({ 
    currentTime: Math.max(0, Math.min(time, get().projectDuration)) 
  }),
  
  toggleVideoPlayback: () => set({ isVideoPlaying: !get().isVideoPlaying }),
  
  setPlaybackSpeed: (speed) => set({ 
    playbackSpeed: Math.max(0.1, Math.min(10, speed)) 
  }),
  
  setScrubbing: (scrubbing) => set({ isScrubbing: scrubbing }),
  
  // Project actions
  setProjectDuration: (duration) => set({ 
    projectDuration: Math.max(1, duration) 
  }),
  
  setProjectFps: (fps) => set({ 
    projectFps: Math.max(1, Math.min(120, fps)) 
  }),
  
  setProjectResolution: (width, height) => set({ 
    projectWidth: Math.max(1, width),
    projectHeight: Math.max(1, height),
  }),
  
  // Track actions
  addTrack: (type) => {
    const state = get();
    const existingOfType = state.tracks.filter(t => t.type === type).length;
    const maxIndex = Math.max(...state.tracks.map(t => t.index), -1);
    
    const newTrack: Track = {
      id: generateVideoId(),
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${existingOfType + 1}`,
      type,
      index: maxIndex + 1,
      height: 48,
      visible: true,
      locked: false,
      muted: false,
      solo: false,
      volume: 1,
      clips: [],
    };
    
    set({ tracks: [...state.tracks, newTrack] });
  },
  
  removeTrack: (trackId) => {
    const state = get();
    const clipIdsToRemove = state.clips.filter(c => c.trackId === trackId).map(c => c.id);
    
    set({
      tracks: state.tracks.filter(t => t.id !== trackId),
      clips: state.clips.filter(c => c.trackId !== trackId),
      selectedTrackId: state.selectedTrackId === trackId ? null : state.selectedTrackId,
      selectedClipId: clipIdsToRemove.includes(state.selectedClipId ?? "") ? null : state.selectedClipId,
    });
  },
  
  updateTrack: (trackId, updates) => {
    set({
      tracks: get().tracks.map(t => t.id === trackId ? { ...t, ...updates } : t),
    });
  },
  
  toggleTrackMute: (trackId) => {
    const state = get();
    set({
      tracks: state.tracks.map(t => t.id === trackId ? { ...t, muted: !t.muted } : t),
    });
  },
  
  toggleTrackSolo: (trackId) => {
    const state = get();
    set({
      tracks: state.tracks.map(t => t.id === trackId ? { ...t, solo: !t.solo } : t),
    });
  },
  
  toggleTrackLock: (trackId) => {
    const state = get();
    set({
      tracks: state.tracks.map(t => t.id === trackId ? { ...t, locked: !t.locked } : t),
    });
  },
  
  toggleTrackVisibility: (trackId) => {
    const state = get();
    set({
      tracks: state.tracks.map(t => t.id === trackId ? { ...t, visible: !t.visible } : t),
    });
  },
  
  selectTrack: (trackId) => set({ selectedTrackId: trackId }),
  
  // Clip actions
  addClip: (trackId, assetId, startTime, duration) => {
    const state = get();
    const asset = assetId ? state.assets.find(a => a.id === assetId) : null;
    const clipId = generateVideoId();
    
    const newClip: Clip = {
      id: clipId,
      trackId,
      assetId,
      name: asset?.name || "Adjustment",
      startTime,
      duration,
      inPoint: 0,
      speed: 1,
      volume: 1,
      opacity: 1,
      muted: false,
      locked: false,
      effects: [],
    };
    
    set({
      clips: [...state.clips, newClip],
      tracks: state.tracks.map(t => 
        t.id === trackId ? { ...t, clips: [...t.clips, clipId] } : t
      ),
      selectedClipId: clipId,
    });
    
    return clipId;
  },
  
  removeClip: (clipId) => {
    const state = get();
    const clip = state.clips.find(c => c.id === clipId);
    if (!clip) return;
    
    set({
      clips: state.clips.filter(c => c.id !== clipId),
      tracks: state.tracks.map(t => ({
        ...t,
        clips: t.clips.filter(id => id !== clipId),
      })),
      selectedClipId: state.selectedClipId === clipId ? null : state.selectedClipId,
    });
  },
  
  updateClip: (clipId, updates) => {
    set({
      clips: get().clips.map(c => c.id === clipId ? { ...c, ...updates } : c),
    });
  },
  
  selectClip: (clipId) => set({ selectedClipId: clipId }),
  
  moveClip: (clipId, newTrackId, newStartTime) => {
    const state = get();
    const clip = state.clips.find(c => c.id === clipId);
    if (!clip) return;
    
    const oldTrackId = clip.trackId;
    
    set({
      clips: state.clips.map(c => 
        c.id === clipId ? { ...c, trackId: newTrackId, startTime: Math.max(0, newStartTime) } : c
      ),
      tracks: state.tracks.map(t => {
        if (t.id === oldTrackId) {
          return { ...t, clips: t.clips.filter(id => id !== clipId) };
        }
        if (t.id === newTrackId) {
          return { ...t, clips: [...t.clips, clipId] };
        }
        return t;
      }),
    });
  },
  
  trimClip: (clipId, newInPoint, newOutPoint) => {
    const state = get();
    const clip = state.clips.find(c => c.id === clipId);
    if (!clip) return;
    
    const newDuration = newOutPoint - newInPoint;
    
    set({
      clips: state.clips.map(c => 
        c.id === clipId ? { 
          ...c, 
          inPoint: newInPoint, 
          outPoint: newOutPoint,
          duration: newDuration / c.speed,
        } : c
      ),
    });
  },
  
  splitClip: (clipId, splitTime) => {
    const state = get();
    const clip = state.clips.find(c => c.id === clipId);
    if (!clip) return;
    
    const clipEndTime = clip.startTime + clip.duration;
    if (splitTime <= clip.startTime || splitTime >= clipEndTime) return;
    
    const firstDuration = splitTime - clip.startTime;
    const secondDuration = clipEndTime - splitTime;
    const secondInPoint = clip.inPoint + (firstDuration * clip.speed);
    
    const secondClipId = generateVideoId();
    const secondClip: Clip = {
      ...clip,
      id: secondClipId,
      name: `${clip.name} (2)`,
      startTime: splitTime,
      duration: secondDuration,
      inPoint: secondInPoint,
    };
    
    set({
      clips: [
        ...state.clips.map(c => 
          c.id === clipId ? { ...c, duration: firstDuration } : c
        ),
        secondClip,
      ],
      tracks: state.tracks.map(t => 
        t.id === clip.trackId ? { ...t, clips: [...t.clips, secondClipId] } : t
      ),
    });
  },
  
  // Effect actions
  addEffect: (clipId, effectType) => {
    const state = get();
    const newEffect: Effect = {
      id: generateVideoId(),
      type: effectType,
      enabled: true,
      value: 0,
      min: -100,
      max: 100,
      keyframes: [],
    };
    
    set({
      clips: state.clips.map(c => 
        c.id === clipId ? { ...c, effects: [...c.effects, newEffect] } : c
      ),
    });
  },
  
  removeEffect: (clipId, effectId) => {
    set({
      clips: get().clips.map(c => 
        c.id === clipId ? { ...c, effects: c.effects.filter(e => e.id !== effectId) } : c
      ),
    });
  },
  
  updateEffect: (clipId, effectId, updates) => {
    set({
      clips: get().clips.map(c => 
        c.id === clipId ? {
          ...c,
          effects: c.effects.map(e => e.id === effectId ? { ...e, ...updates } : e),
        } : c
      ),
    });
  },
  
  // Asset actions
  addAsset: (asset) => {
    const id = generateVideoId();
    const newAsset: MediaAsset = { ...asset, id };
    set({ assets: [...get().assets, newAsset] });
    return id;
  },
  
  removeAsset: (assetId) => {
    const state = get();
    set({
      assets: state.assets.filter(a => a.id !== assetId),
      selectedAssetId: state.selectedAssetId === assetId ? null : state.selectedAssetId,
    });
  },
  
  selectAsset: (assetId) => set({ selectedAssetId: assetId }),
  
  getAssetById: (assetId) => get().assets.find(a => a.id === assetId),
  
  // Audio actions
  setMasterVolume: (volume) => set({ 
    masterVolume: Math.max(0, Math.min(2, volume)) 
  }),
  
  setChannelVolume: (trackId, volume) => {
    const state = get();
    const existing = state.audioChannels.find(c => c.trackId === trackId);
    
    if (existing) {
      set({
        audioChannels: state.audioChannels.map(c => 
          c.trackId === trackId ? { ...c, volume: Math.max(0, Math.min(2, volume)) } : c
        ),
      });
    } else {
      set({
        audioChannels: [...state.audioChannels, {
          trackId,
          volume: Math.max(0, Math.min(2, volume)),
          pan: 0,
          muted: false,
          solo: false,
        }],
      });
    }
  },
  
  setChannelPan: (trackId, pan) => {
    const state = get();
    const existing = state.audioChannels.find(c => c.trackId === trackId);
    
    if (existing) {
      set({
        audioChannels: state.audioChannels.map(c => 
          c.trackId === trackId ? { ...c, pan: Math.max(-1, Math.min(1, pan)) } : c
        ),
      });
    } else {
      set({
        audioChannels: [...state.audioChannels, {
          trackId,
          volume: 1,
          pan: Math.max(-1, Math.min(1, pan)),
          muted: false,
          solo: false,
        }],
      });
    }
  },
  
  // Timeline actions
  setTimelineZoom: (zoom) => set({ 
    timelineZoom: Math.max(10, Math.min(200, zoom)) 
  }),
  
  setTimelineScrollX: (scrollX) => set({ 
    timelineScrollX: Math.max(0, scrollX) 
  }),
  
  // Scope actions
  toggleWaveform: () => set({ showWaveform: !get().showWaveform }),
  toggleVectorscope: () => set({ showVectorscope: !get().showVectorscope }),
  toggleHistogram: () => set({ showHistogram: !get().showHistogram }),
  
  // Utility
  getClipsAtTime: (time) => {
    return get().clips.filter(c => 
      time >= c.startTime && time < c.startTime + c.duration
    );
  },
  
  getClipsOnTrack: (trackId) => {
    return get().clips.filter(c => c.trackId === trackId);
  },
  
  getVisibleTracks: () => {
    return get().tracks.filter(t => t.visible);
  },
  
  getAudioTracks: () => {
    return get().tracks.filter(t => t.type === "audio");
  },
  
  getVideoTracks: () => {
    return get().tracks.filter(t => t.type === "video" || t.type === "image" || t.type === "scene");
  },
}));
