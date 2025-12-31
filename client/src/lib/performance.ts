import { useRef, useCallback, useMemo, useEffect } from "react";

/**
 * Performance utilities for the 3D Studio application.
 * Provides memoization, debouncing, throttling, and object pooling.
 */

// ===== DEBOUNCING =====

/**
 * Creates a debounced version of a function that delays execution
 * until after `delay` milliseconds have elapsed since the last call.
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * React hook for debounced values.
 * Useful for search inputs, resize handlers, etc.
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const currentValueRef = useRef(value);
  
  useEffect(() => {
    timerRef.current = setTimeout(() => {
      currentValueRef.current = value;
    }, delay);
    
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [value, delay]);
  
  return currentValueRef.current;
}

/**
 * React hook for debounced callbacks.
 * Prevents excessive API calls or expensive computations.
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  
  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => callback(...args), delay);
    },
    [callback, delay]
  );
}

// ===== THROTTLING =====

/**
 * Creates a throttled version of a function that only executes
 * at most once per `limit` milliseconds.
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    const remaining = limit - (now - lastCall);
    
    if (remaining <= 0) {
      lastCall = now;
      fn(...args);
    } else if (!timeoutId) {
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        timeoutId = null;
        fn(...args);
      }, remaining);
    }
  };
}

/**
 * React hook for throttled callbacks.
 * Useful for scroll handlers, resize observers, etc.
 */
export function useThrottledCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  limit: number
): (...args: Parameters<T>) => void {
  const lastCallRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  
  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      const remaining = limit - (now - lastCallRef.current);
      
      if (remaining <= 0) {
        lastCallRef.current = now;
        callback(...args);
      } else if (!timeoutRef.current) {
        timeoutRef.current = setTimeout(() => {
          lastCallRef.current = Date.now();
          timeoutRef.current = undefined;
          callback(...args);
        }, remaining);
      }
    },
    [callback, limit]
  );
}

// ===== OBJECT POOLING =====

/**
 * Simple object pool for reducing garbage collection pressure.
 * Useful for frequently created/destroyed objects like vectors, matrices.
 */
export class ObjectPool<T> {
  private pool: T[] = [];
  private factory: () => T;
  private reset: (obj: T) => void;
  private maxSize: number;

  constructor(
    factory: () => T,
    reset: (obj: T) => void = () => {},
    maxSize: number = 100
  ) {
    this.factory = factory;
    this.reset = reset;
    this.maxSize = maxSize;
  }

  acquire(): T {
    if (this.pool.length > 0) {
      return this.pool.pop()!;
    }
    return this.factory();
  }

  release(obj: T): void {
    if (this.pool.length < this.maxSize) {
      this.reset(obj);
      this.pool.push(obj);
    }
  }

  clear(): void {
    this.pool.length = 0;
  }

  get size(): number {
    return this.pool.length;
  }
}

// ===== VECTOR3 POOL =====

interface PooledVector3 {
  x: number;
  y: number;
  z: number;
}

export const vector3Pool = new ObjectPool<PooledVector3>(
  () => ({ x: 0, y: 0, z: 0 }),
  (v) => {
    v.x = 0;
    v.y = 0;
    v.z = 0;
  },
  50
);

// ===== MEMOIZATION =====

/**
 * Simple memoization for expensive computations.
 * Caches the last result based on shallow argument comparison.
 */
export function memoize<T extends (...args: unknown[]) => unknown>(
  fn: T
): T {
  let lastArgs: unknown[] | null = null;
  let lastResult: ReturnType<T>;
  
  return ((...args: unknown[]) => {
    if (
      lastArgs !== null &&
      args.length === lastArgs.length &&
      args.every((arg, i) => arg === lastArgs![i])
    ) {
      return lastResult;
    }
    
    lastArgs = args;
    lastResult = fn(...args) as ReturnType<T>;
    return lastResult;
  }) as T;
}

/**
 * React hook for memoizing expensive computations with dependencies.
 * Like useMemo but with explicit dependency tracking.
 */
export function useStableMemo<T>(
  factory: () => T,
  deps: readonly unknown[]
): T {
  return useMemo(factory, deps);
}

// ===== RAF SCHEDULING =====

/**
 * Schedule callback to run on next animation frame.
 * Batches multiple calls to prevent layout thrashing.
 */
const rafCallbacks: Set<() => void> = new Set();
let rafScheduled = false;

function runRafCallbacks() {
  rafScheduled = false;
  const callbacks = Array.from(rafCallbacks);
  rafCallbacks.clear();
  callbacks.forEach((cb) => cb());
}

export function scheduleRaf(callback: () => void): void {
  rafCallbacks.add(callback);
  if (!rafScheduled) {
    rafScheduled = true;
    requestAnimationFrame(runRafCallbacks);
  }
}

/**
 * React hook for RAF-batched updates.
 * Useful for coordinating multiple DOM updates.
 */
export function useRafCallback<T extends (...args: unknown[]) => void>(
  callback: T
): T {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;
  
  return useCallback(
    ((...args: Parameters<T>) => {
      scheduleRaf(() => callbackRef.current(...args));
    }) as T,
    []
  );
}

// ===== SHALLOW COMPARISON =====

/**
 * Shallow comparison for objects.
 * Useful for preventing unnecessary re-renders.
 */
export function shallowEqual<T extends Record<string, unknown>>(
  a: T,
  b: T
): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  
  if (keysA.length !== keysB.length) return false;
  
  return keysA.every((key) => a[key] === b[key]);
}

/**
 * Create a selector that only triggers updates when the selected value changes.
 * Reduces Zustand store subscription updates.
 */
export function createSelector<State, Selected>(
  selector: (state: State) => Selected,
  equalityFn: (a: Selected, b: Selected) => boolean = (a, b) => a === b
): (state: State) => Selected {
  let lastSelected: Selected;
  let lastState: State;
  
  return (state: State) => {
    if (state === lastState) return lastSelected;
    
    const selected = selector(state);
    if (lastSelected !== undefined && equalityFn(lastSelected, selected)) {
      return lastSelected;
    }
    
    lastState = state;
    lastSelected = selected;
    return selected;
  };
}

// ===== BATCH UPDATES =====

/**
 * Batch multiple state updates to prevent intermediate renders.
 */
export function batchUpdates(callback: () => void): void {
  // In React 18+, updates are automatically batched
  // This is a no-op wrapper for compatibility
  callback();
}

// ===== IDLE CALLBACK =====

/**
 * Schedule low-priority work when browser is idle.
 * Useful for non-critical updates like analytics, prefetching.
 */
export function scheduleIdle(
  callback: () => void,
  options?: IdleRequestOptions
): number {
  if (typeof requestIdleCallback !== "undefined") {
    return requestIdleCallback(callback, options);
  }
  // Fallback for Safari
  return setTimeout(callback, options?.timeout || 100) as unknown as number;
}

export function cancelIdle(id: number): void {
  if ("cancelIdleCallback" in window) {
    cancelIdleCallback(id);
  } else {
    clearTimeout(id);
  }
}
