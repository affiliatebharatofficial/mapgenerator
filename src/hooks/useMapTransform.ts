import { useState, useCallback, useRef } from 'react';

export interface TransformState {
  scale: number;
  translateX: number;
  translateY: number;
  x: number;
  y: number;
  k: number;
}

export function useMapTransform(_containerWidth = 1200, _containerHeight = 800) {
  const [transformState, setTransformState] = useState<{ scale: number; translateX: number; translateY: number }>({
    scale: 1,
    translateX: 0,
    translateY: 0
  });

  const isDragging = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });

  const transform: TransformState = {
    scale: transformState.scale,
    translateX: transformState.translateX,
    translateY: transformState.translateY,
    x: transformState.translateX,
    y: transformState.translateY,
    k: transformState.scale
  };

  const zoomIn = useCallback(() => {
    setTransformState((prev) => ({
      ...prev,
      scale: Math.min(prev.scale * 1.2, 5)
    }));
  }, []);

  const zoomOut = useCallback(() => {
    setTransformState((prev) => ({
      ...prev,
      scale: Math.max(prev.scale / 1.2, 0.3)
    }));
  }, []);

  const resetView = useCallback(() => {
    setTransformState({
      scale: 1,
      translateX: 0,
      translateY: 0
    });
  }, []);

  const fitToScreen = useCallback(() => {
    setTransformState({
      scale: 0.85,
      translateX: 0,
      translateY: 0
    });
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    setTransformState((prev) => {
      const newScale = Math.min(Math.max(prev.scale * zoomFactor, 0.3), 5);
      return {
        ...prev,
        scale: newScale
      };
    });
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0 || e.button === 1) {
      isDragging.current = true;
      startPos.current = { x: e.clientX - transformState.translateX, y: e.clientY - transformState.translateY };
    }
  }, [transformState.translateX, transformState.translateY]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return;
    setTransformState((prev) => ({
      ...prev,
      translateX: e.clientX - startPos.current.x,
      translateY: e.clientY - startPos.current.y
    }));
  }, []);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  return {
    transform,
    setTransform: setTransformState,
    zoomIn,
    zoomOut,
    resetView,
    fitToScreen,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    isDragging: isDragging.current
  };
}
