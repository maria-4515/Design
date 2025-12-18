import { create } from "zustand";
import type {
  Bone,
  Pose,
  Skeleton,
  AnimationAction,
  NlaTrack,
  NlaStrip,
  AudioSyncTrack,
  AudioMarker,
  Vector3,
} from "@shared/schema";
import {
  generateBoneId,
  generatePoseId,
  generateActionId,
  generateNlaStripId,
  generateNlaTrackId,
  generateAudioMarkerId,
  humanoidBonePreset,
} from "@shared/schema";

interface CharacterAnimState {
  // Skeleton data
  skeleton: Skeleton | null;
  selectedBoneId: string | null;
  
  // Pose editing
  currentPose: Record<string, { rotation: Vector3; position?: Vector3 }>;
  poseLibrary: Pose[];
  
  // Animation actions
  actions: AnimationAction[];
  selectedActionId: string | null;
  
  // NLA
  nlaTracks: NlaTrack[];
  nlaStrips: NlaStrip[];
  nlaCurrentFrame: number;
  nlaTotalFrames: number;
  nlaFps: number;
  isNlaPlaying: boolean;
  selectedStripId: string | null;
  
  // Audio sync
  audioTracks: AudioSyncTrack[];
  selectedAudioTrackId: string | null;
  
  // IK mode
  ikMode: boolean;
  ikTargetBoneId: string | null;
  
  // Editor mode
  animEditorMode: "pose" | "action" | "nla";
  
  // Actions
  // Skeleton
  createSkeleton: (name: string) => void;
  loadHumanoidPreset: () => void;
  addBone: (bone: Omit<Bone, "id">) => void;
  updateBone: (boneId: string, updates: Partial<Bone>) => void;
  removeBone: (boneId: string) => void;
  selectBone: (boneId: string | null) => void;
  
  // Pose
  setBoneRotation: (boneId: string, rotation: Vector3) => void;
  setBonePosition: (boneId: string, position: Vector3) => void;
  savePose: (name: string) => void;
  loadPose: (poseId: string) => void;
  deletePose: (poseId: string) => void;
  resetPose: () => void;
  
  // IK
  toggleIkMode: () => void;
  setIkTarget: (boneId: string, target: Vector3) => void;
  solveIk: (endBoneId: string, targetPosition: Vector3) => void;
  
  // Animation actions
  createAction: (name: string) => void;
  selectAction: (actionId: string | null) => void;
  deleteAction: (actionId: string) => void;
  addKeyframeToBone: (boneId: string, frame: number) => void;
  removeKeyframeFromBone: (boneId: string, frame: number) => void;
  updateActionRange: (actionId: string, start: number, end: number) => void;
  
  // NLA
  addNlaTrack: (name: string) => void;
  removeNlaTrack: (trackId: string) => void;
  addNlaStrip: (trackId: string, actionId: string, startFrame: number) => void;
  updateNlaStrip: (stripId: string, updates: Partial<NlaStrip>) => void;
  removeNlaStrip: (stripId: string) => void;
  selectNlaStrip: (stripId: string | null) => void;
  setNlaCurrentFrame: (frame: number) => void;
  toggleNlaPlayback: () => void;
  setNlaTotalFrames: (frames: number) => void;
  
  // Audio sync
  addAudioTrack: (name: string, audioUrl?: string) => void;
  removeAudioTrack: (trackId: string) => void;
  selectAudioTrack: (trackId: string | null) => void;
  addAudioMarker: (trackId: string, marker: Omit<AudioMarker, "id">) => void;
  removeAudioMarker: (trackId: string, markerId: string) => void;
  updateAudioMarker: (trackId: string, markerId: string, updates: Partial<AudioMarker>) => void;
  
  // Editor mode
  setAnimEditorMode: (mode: "pose" | "action" | "nla") => void;
  
  // Utilities
  getBoneChain: (boneId: string, chainLength: number) => Bone[];
  getWorldPosition: (boneId: string) => Vector3;
}

export const useCharacterAnimStore = create<CharacterAnimState>((set, get) => ({
  skeleton: null,
  selectedBoneId: null,
  currentPose: {},
  poseLibrary: [],
  actions: [],
  selectedActionId: null,
  nlaTracks: [],
  nlaStrips: [],
  nlaCurrentFrame: 0,
  nlaTotalFrames: 250,
  nlaFps: 24,
  isNlaPlaying: false,
  selectedStripId: null,
  audioTracks: [],
  selectedAudioTrackId: null,
  ikMode: false,
  ikTargetBoneId: null,
  animEditorMode: "pose",
  
  createSkeleton: (name) => {
    set({
      skeleton: {
        id: `skel_${Date.now()}`,
        name,
        bones: [],
        poses: [],
        currentPoseId: null,
      },
      currentPose: {},
    });
  },
  
  loadHumanoidPreset: () => {
    const bones: Bone[] = humanoidBonePreset.bones.map((b, index) => ({
      ...b,
      id: generateBoneId() + "_" + index,
      parentId: b.parentId ? humanoidBonePreset.bones.findIndex(pb => pb.name === b.parentId).toString() : null,
    }));
    
    // Fix parent IDs to use actual bone IDs
    const boneMap = new Map<string, string>();
    humanoidBonePreset.bones.forEach((b, i) => {
      boneMap.set(b.name, bones[i].id);
    });
    
    bones.forEach((bone, i) => {
      const preset = humanoidBonePreset.bones[i];
      if (preset.parentId) {
        bone.parentId = boneMap.get(preset.parentId) || null;
      }
    });
    
    const initialPose: Record<string, { rotation: Vector3 }> = {};
    bones.forEach(b => {
      initialPose[b.id] = { rotation: { ...b.rotation } };
    });
    
    set({
      skeleton: {
        id: `skel_${Date.now()}`,
        name: "Humanoid",
        bones,
        poses: [],
        currentPoseId: null,
      },
      currentPose: initialPose,
    });
  },
  
  addBone: (bone) => {
    const state = get();
    if (!state.skeleton) return;
    
    const newBone: Bone = {
      ...bone,
      id: generateBoneId(),
    };
    
    set({
      skeleton: {
        ...state.skeleton,
        bones: [...state.skeleton.bones, newBone],
      },
      currentPose: {
        ...state.currentPose,
        [newBone.id]: { rotation: { ...newBone.rotation } },
      },
    });
  },
  
  updateBone: (boneId, updates) => {
    const state = get();
    if (!state.skeleton) return;
    
    set({
      skeleton: {
        ...state.skeleton,
        bones: state.skeleton.bones.map(b =>
          b.id === boneId ? { ...b, ...updates } : b
        ),
      },
    });
  },
  
  removeBone: (boneId) => {
    const state = get();
    if (!state.skeleton) return;
    
    // Also remove children
    const removeIds = new Set<string>([boneId]);
    let changed = true;
    while (changed) {
      changed = false;
      state.skeleton.bones.forEach(b => {
        if (b.parentId && removeIds.has(b.parentId) && !removeIds.has(b.id)) {
          removeIds.add(b.id);
          changed = true;
        }
      });
    }
    
    const newPose = { ...state.currentPose };
    removeIds.forEach(id => delete newPose[id]);
    
    set({
      skeleton: {
        ...state.skeleton,
        bones: state.skeleton.bones.filter(b => !removeIds.has(b.id)),
      },
      currentPose: newPose,
      selectedBoneId: removeIds.has(state.selectedBoneId || "") ? null : state.selectedBoneId,
    });
  },
  
  selectBone: (boneId) => {
    set({ selectedBoneId: boneId });
  },
  
  setBoneRotation: (boneId, rotation) => {
    const state = get();
    set({
      currentPose: {
        ...state.currentPose,
        [boneId]: {
          ...state.currentPose[boneId],
          rotation,
        },
      },
    });
  },
  
  setBonePosition: (boneId, position) => {
    const state = get();
    set({
      currentPose: {
        ...state.currentPose,
        [boneId]: {
          ...state.currentPose[boneId],
          position,
        },
      },
    });
  },
  
  savePose: (name) => {
    const state = get();
    const pose: Pose = {
      id: generatePoseId(),
      name,
      boneTransforms: { ...state.currentPose },
    };
    
    set({
      poseLibrary: [...state.poseLibrary, pose],
    });
  },
  
  loadPose: (poseId) => {
    const state = get();
    const pose = state.poseLibrary.find(p => p.id === poseId);
    if (!pose) return;
    
    set({
      currentPose: { ...pose.boneTransforms },
    });
  },
  
  deletePose: (poseId) => {
    const state = get();
    set({
      poseLibrary: state.poseLibrary.filter(p => p.id !== poseId),
    });
  },
  
  resetPose: () => {
    const state = get();
    if (!state.skeleton) return;
    
    const resetPose: Record<string, { rotation: Vector3 }> = {};
    state.skeleton.bones.forEach(b => {
      resetPose[b.id] = { rotation: { x: 0, y: 0, z: 0 } };
    });
    
    set({ currentPose: resetPose });
  },
  
  toggleIkMode: () => {
    set(state => ({ ikMode: !state.ikMode }));
  },
  
  setIkTarget: (boneId, target) => {
    const state = get();
    if (!state.skeleton) return;
    
    set({
      skeleton: {
        ...state.skeleton,
        bones: state.skeleton.bones.map(b =>
          b.id === boneId ? { ...b, ikTarget: target } : b
        ),
      },
    });
  },
  
  solveIk: (endBoneId, targetPosition) => {
    const state = get();
    if (!state.skeleton) return;
    
    const bone = state.skeleton.bones.find(b => b.id === endBoneId);
    if (!bone || !bone.ikEnabled) return;
    
    // Simple CCD IK solver
    const chain = get().getBoneChain(endBoneId, bone.ikChainLength);
    if (chain.length === 0) return;
    
    const iterations = 10;
    const newPose = { ...state.currentPose };
    
    for (let iter = 0; iter < iterations; iter++) {
      for (let i = chain.length - 1; i >= 0; i--) {
        const currentBone = chain[i];
        const currentPos = get().getWorldPosition(currentBone.id);
        const endPos = get().getWorldPosition(endBoneId);
        
        // Calculate rotation needed to move end effector towards target
        const toEnd = {
          x: endPos.x - currentPos.x,
          y: endPos.y - currentPos.y,
          z: endPos.z - currentPos.z,
        };
        const toTarget = {
          x: targetPosition.x - currentPos.x,
          y: targetPosition.y - currentPos.y,
          z: targetPosition.z - currentPos.z,
        };
        
        // Simplified rotation calculation (would need proper quaternion math in production)
        const currentRotation = newPose[currentBone.id]?.rotation || { x: 0, y: 0, z: 0 };
        const delta = 0.1;
        
        newPose[currentBone.id] = {
          ...newPose[currentBone.id],
          rotation: {
            x: currentRotation.x + (toTarget.y - toEnd.y) * delta,
            y: currentRotation.y + (toTarget.x - toEnd.x) * delta,
            z: currentRotation.z,
          },
        };
      }
    }
    
    set({ currentPose: newPose });
  },
  
  createAction: (name) => {
    const state = get();
    const action: AnimationAction = {
      id: generateActionId(),
      name,
      boneKeyframes: {},
      frameStart: 0,
      frameEnd: 60,
      loop: true,
      speed: 1,
    };
    
    set({
      actions: [...state.actions, action],
      selectedActionId: action.id,
    });
  },
  
  selectAction: (actionId) => {
    set({ selectedActionId: actionId });
  },
  
  deleteAction: (actionId) => {
    const state = get();
    set({
      actions: state.actions.filter(a => a.id !== actionId),
      selectedActionId: state.selectedActionId === actionId ? null : state.selectedActionId,
      nlaStrips: state.nlaStrips.filter(s => s.actionId !== actionId),
    });
  },
  
  addKeyframeToBone: (boneId, frame) => {
    const state = get();
    if (!state.selectedActionId) return;
    
    const action = state.actions.find(a => a.id === state.selectedActionId);
    if (!action) return;
    
    const boneRotation = state.currentPose[boneId]?.rotation || { x: 0, y: 0, z: 0 };
    const bonePosition = state.currentPose[boneId]?.position;
    
    const existingKeyframes = action.boneKeyframes[boneId] || [];
    const filtered = existingKeyframes.filter(k => k.frame !== frame);
    
    set({
      actions: state.actions.map(a =>
        a.id === state.selectedActionId
          ? {
              ...a,
              boneKeyframes: {
                ...a.boneKeyframes,
                [boneId]: [
                  ...filtered,
                  { frame, rotation: boneRotation, position: bonePosition },
                ].sort((a, b) => a.frame - b.frame),
              },
            }
          : a
      ),
    });
  },
  
  removeKeyframeFromBone: (boneId, frame) => {
    const state = get();
    if (!state.selectedActionId) return;
    
    set({
      actions: state.actions.map(a =>
        a.id === state.selectedActionId
          ? {
              ...a,
              boneKeyframes: {
                ...a.boneKeyframes,
                [boneId]: (a.boneKeyframes[boneId] || []).filter(k => k.frame !== frame),
              },
            }
          : a
      ),
    });
  },
  
  updateActionRange: (actionId, start, end) => {
    const state = get();
    set({
      actions: state.actions.map(a =>
        a.id === actionId ? { ...a, frameStart: start, frameEnd: end } : a
      ),
    });
  },
  
  addNlaTrack: (name) => {
    const state = get();
    const track: NlaTrack = {
      id: generateNlaTrackId(),
      name,
      index: state.nlaTracks.length,
      strips: [],
      muted: false,
      solo: false,
      locked: false,
    };
    
    set({ nlaTracks: [...state.nlaTracks, track] });
  },
  
  removeNlaTrack: (trackId) => {
    const state = get();
    const track = state.nlaTracks.find(t => t.id === trackId);
    if (!track) return;
    
    set({
      nlaTracks: state.nlaTracks.filter(t => t.id !== trackId),
      nlaStrips: state.nlaStrips.filter(s => !track.strips.includes(s.id)),
    });
  },
  
  addNlaStrip: (trackId, actionId, startFrame) => {
    const state = get();
    const action = state.actions.find(a => a.id === actionId);
    if (!action) return;
    
    const strip: NlaStrip = {
      id: generateNlaStripId(),
      actionId,
      name: action.name,
      trackIndex: state.nlaTracks.findIndex(t => t.id === trackId),
      startFrame,
      endFrame: startFrame + (action.frameEnd - action.frameStart),
      blendIn: 0,
      blendOut: 0,
      blendMode: "replace",
      influence: 1,
      scale: 1,
      repeat: 1,
      muted: false,
    };
    
    set({
      nlaStrips: [...state.nlaStrips, strip],
      nlaTracks: state.nlaTracks.map(t =>
        t.id === trackId ? { ...t, strips: [...t.strips, strip.id] } : t
      ),
    });
  },
  
  updateNlaStrip: (stripId, updates) => {
    const state = get();
    set({
      nlaStrips: state.nlaStrips.map(s =>
        s.id === stripId ? { ...s, ...updates } : s
      ),
    });
  },
  
  removeNlaStrip: (stripId) => {
    const state = get();
    set({
      nlaStrips: state.nlaStrips.filter(s => s.id !== stripId),
      nlaTracks: state.nlaTracks.map(t => ({
        ...t,
        strips: t.strips.filter(id => id !== stripId),
      })),
      selectedStripId: state.selectedStripId === stripId ? null : state.selectedStripId,
    });
  },
  
  selectNlaStrip: (stripId) => {
    set({ selectedStripId: stripId });
  },
  
  setNlaCurrentFrame: (frame) => {
    set({ nlaCurrentFrame: Math.max(0, Math.min(frame, get().nlaTotalFrames)) });
  },
  
  toggleNlaPlayback: () => {
    set(state => ({ isNlaPlaying: !state.isNlaPlaying }));
  },
  
  setNlaTotalFrames: (frames) => {
    set({ nlaTotalFrames: Math.max(1, frames) });
  },
  
  addAudioTrack: (name, audioUrl) => {
    const state = get();
    const track: AudioSyncTrack = {
      id: `audio_${Date.now()}`,
      name,
      audioUrl,
      duration: 0,
      markers: [],
      waveformPeaks: [],
      volume: 1,
      muted: false,
    };
    
    set({ audioTracks: [...state.audioTracks, track] });
  },
  
  removeAudioTrack: (trackId) => {
    const state = get();
    set({
      audioTracks: state.audioTracks.filter(t => t.id !== trackId),
      selectedAudioTrackId: state.selectedAudioTrackId === trackId ? null : state.selectedAudioTrackId,
    });
  },
  
  selectAudioTrack: (trackId) => {
    set({ selectedAudioTrackId: trackId });
  },
  
  addAudioMarker: (trackId, marker) => {
    const state = get();
    const newMarker: AudioMarker = {
      ...marker,
      id: generateAudioMarkerId(),
    };
    
    set({
      audioTracks: state.audioTracks.map(t =>
        t.id === trackId
          ? { ...t, markers: [...t.markers, newMarker].sort((a, b) => a.time - b.time) }
          : t
      ),
    });
  },
  
  removeAudioMarker: (trackId, markerId) => {
    const state = get();
    set({
      audioTracks: state.audioTracks.map(t =>
        t.id === trackId
          ? { ...t, markers: t.markers.filter(m => m.id !== markerId) }
          : t
      ),
    });
  },
  
  updateAudioMarker: (trackId, markerId, updates) => {
    const state = get();
    set({
      audioTracks: state.audioTracks.map(t =>
        t.id === trackId
          ? {
              ...t,
              markers: t.markers.map(m =>
                m.id === markerId ? { ...m, ...updates } : m
              ),
            }
          : t
      ),
    });
  },
  
  setAnimEditorMode: (mode) => {
    set({ animEditorMode: mode });
  },
  
  getBoneChain: (boneId, chainLength) => {
    const state = get();
    if (!state.skeleton) return [];
    
    const chain: Bone[] = [];
    let currentId: string | null = boneId;
    
    for (let i = 0; i < chainLength && currentId; i++) {
      const bone = state.skeleton.bones.find(b => b.id === currentId);
      if (!bone) break;
      chain.unshift(bone);
      currentId = bone.parentId;
    }
    
    return chain;
  },
  
  getWorldPosition: (boneId) => {
    const state = get();
    if (!state.skeleton) return { x: 0, y: 0, z: 0 };
    
    let position = { x: 0, y: 0, z: 0 };
    let currentId: string | null = boneId;
    
    while (currentId) {
      const bone = state.skeleton.bones.find(b => b.id === currentId);
      if (!bone) break;
      
      position.x += bone.position.x;
      position.y += bone.position.y;
      position.z += bone.position.z;
      
      currentId = bone.parentId;
    }
    
    return position;
  },
}));
