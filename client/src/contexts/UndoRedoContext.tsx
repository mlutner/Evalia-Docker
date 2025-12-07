import React, { createContext, useCallback, useContext, useRef, useState } from 'react';

interface UndoRedoContextValue<T> {
  state: T;
  setState: (next: T) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const UndoRedoContext = createContext<UndoRedoContextValue<any> | null>(null);

export function UndoRedoProvider<T>({ initialState, children }: { initialState: T; children: React.ReactNode }) {
  const [present, setPresent] = useState<T>(initialState);
  const past = useRef<T[]>([]);
  const future = useRef<T[]>([]);

  const setState = useCallback((next: T) => {
    past.current.push(present);
    setPresent(next);
    future.current = [];
  }, [present]);

  const undo = useCallback(() => {
    const prev = past.current.pop();
    if (prev === undefined) return;
    future.current.push(present);
    setPresent(prev);
  }, [present]);

  const redo = useCallback(() => {
    const next = future.current.pop();
    if (next === undefined) return;
    past.current.push(present);
    setPresent(next);
  }, [present]);

  const value: UndoRedoContextValue<T> = {
    state: present,
    setState,
    undo,
    redo,
    canUndo: past.current.length > 0,
    canRedo: future.current.length > 0,
  };

  return <UndoRedoContext.Provider value={value}>{children}</UndoRedoContext.Provider>;
}

export function useUndoRedo<T>() {
  const ctx = useContext(UndoRedoContext);
  if (!ctx) throw new Error('useUndoRedo must be used within UndoRedoProvider');
  return ctx as UndoRedoContextValue<T>;
}
