import { create } from "zustand";
import type { SceneObject } from "@shared/schema";

interface HistoryEntry {
  objects: SceneObject[];
  selectedObjectId: string | null;
}

interface HistoryState {
  past: HistoryEntry[];
  present: HistoryEntry | null;
  future: HistoryEntry[];
  maxHistory: number;
  
  initialize: (objects: SceneObject[], selectedObjectId: string | null) => void;
  pushState: (objects: SceneObject[], selectedObjectId: string | null) => void;
  undo: () => HistoryEntry | null;
  redo: () => HistoryEntry | null;
  canUndo: () => boolean;
  canRedo: () => boolean;
  clear: () => void;
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  past: [],
  present: null,
  future: [],
  maxHistory: 50,
  
  initialize: (objects, selectedObjectId) => {
    set({
      past: [],
      present: {
        objects: JSON.parse(JSON.stringify(objects)),
        selectedObjectId,
      },
      future: [],
    });
  },
  
  pushState: (objects, selectedObjectId) => {
    const state = get();
    const newEntry: HistoryEntry = {
      objects: JSON.parse(JSON.stringify(objects)),
      selectedObjectId,
    };
    
    const newPast = state.present 
      ? [...state.past, state.present]
      : state.past;
    
    if (newPast.length > state.maxHistory) {
      newPast.shift();
    }
    
    set({
      past: newPast,
      present: newEntry,
      future: [],
    });
  },
  
  undo: () => {
    const state = get();
    if (state.past.length === 0) return null;
    
    const newPast = [...state.past];
    const previous = newPast.pop()!;
    
    const newFuture = state.present 
      ? [state.present, ...state.future]
      : state.future;
    
    set({
      past: newPast,
      present: previous,
      future: newFuture,
    });
    
    return previous;
  },
  
  redo: () => {
    const state = get();
    if (state.future.length === 0) return null;
    
    const [next, ...newFuture] = state.future;
    
    const newPast = state.present 
      ? [...state.past, state.present]
      : state.past;
    
    set({
      past: newPast,
      present: next,
      future: newFuture,
    });
    
    return next;
  },
  
  canUndo: () => get().past.length > 0,
  canRedo: () => get().future.length > 0,
  
  clear: () => set({ past: [], present: null, future: [] }),
}));
