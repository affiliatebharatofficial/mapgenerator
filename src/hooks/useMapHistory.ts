import { useState, useCallback, useEffect } from 'react';
import type { FantasyMap } from '../types/map';

export function useMapHistory(initialMap: FantasyMap) {
  const [history, setHistory] = useState<FantasyMap[]>([initialMap]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const currentMap = history[currentIndex] || initialMap;

  const pushState = useCallback((newMap: FantasyMap) => {
    setHistory((prev) => {
      const nextHistory = prev.slice(0, currentIndex + 1);
      return [...nextHistory, newMap];
    });
    setCurrentIndex((prev) => prev + 1);
  }, [currentIndex]);

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, history.length]);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  // Keyboard shortcut listener for Ctrl+Z and Ctrl+Shift+Z / Cmd+Z
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore when typing in input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          redo();
        } else {
          e.preventDefault();
          undo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  return {
    currentMap,
    pushState,
    undo,
    redo,
    canUndo,
    canRedo,
    resetHistory: (map: FantasyMap) => {
      setHistory([map]);
      setCurrentIndex(0);
    }
  };
}
