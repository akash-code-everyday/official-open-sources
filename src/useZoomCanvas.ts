import { useState, useCallback, useMemo, useRef } from 'react';
import Konva from 'konva';
import {
  Vector2d,
  ZoomCanvasConfig,
  DEFAULT_CONFIG,
  UseZoomCanvasOptions,
  UseZoomCanvasReturn,
} from './types';

/** @internal viewport size tracked by ZoomCanvas */
export interface ViewportSize { width: number; height: number; }

/**
 * Clamp a value between min and max.
 */
const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

/**
 * Core hook for zoom & pan state management.
 *
 * Supports both **controlled** and **uncontrolled** modes:
 * - Uncontrolled: just call `useZoomCanvas()` — it manages its own state.
 * - Controlled: pass `zoom`, `position`, `onZoomChange`, `onPositionChange`.
 *
 * @example
 * ```tsx
 * // Uncontrolled (simplest)
 * const engine = useZoomCanvas({ initialZoom: 0.8 });
 *
 * // Controlled
 * const [zoom, setZoom] = useState(1);
 * const [pos, setPos] = useState({ x: 0, y: 0 });
 * const engine = useZoomCanvas({ zoom, position: pos, onZoomChange: setZoom, onPositionChange: setPos });
 * ```
 */
export const useZoomCanvas = (options: UseZoomCanvasOptions = {}): UseZoomCanvasReturn => {
  const config = useMemo<ZoomCanvasConfig>(
    () => ({ ...DEFAULT_CONFIG, ...options }),
    // We intentionally spread — config rarely changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      options.minZoom, options.maxZoom, options.zoomSpeed,
      options.wheelZoom, options.wheelPan, options.dragPan,
      options.requireModifierToZoom, options.fitPadding,
      options.initialZoom, options.initialPosition,
    ],
  );

  // ── Internal state (used in uncontrolled mode) ──────────────────────────
  const [internalZoom, setInternalZoom] = useState(config.initialZoom);
  const [internalPosition, setInternalPosition] = useState<Vector2d>(config.initialPosition);

  // ── Determine controlled vs uncontrolled ────────────────────────────────
  const isZoomControlled = options.zoom !== undefined;
  const isPositionControlled = options.position !== undefined;

  const zoom = isZoomControlled ? options.zoom! : internalZoom;
  const position = isPositionControlled ? options.position! : internalPosition;

  // Use refs for latest callbacks to avoid stale closures
  const callbacksRef = useRef(options);
  callbacksRef.current = options;

  // ── Viewport tracking (set by ZoomCanvas component) ─────────────────────
  const viewportRef = useRef<ViewportSize>({ width: 0, height: 0 });
  const setViewportSize = useCallback((size: ViewportSize) => {
    viewportRef.current = size;
  }, []);

  // ── State updaters ──────────────────────────────────────────────────────
  // setZoom always zooms from the viewport center so content stays centered.
  const updateZoom = useCallback(
    (newZoom: number) => {
      const clamped = clamp(newZoom, config.minZoom, config.maxZoom);
      const vp = viewportRef.current;
      // Zoom toward center of viewport
      const cx = vp.width / 2;
      const cy = vp.height / 2;
      const canvasX = (cx - position.x) / zoom;
      const canvasY = (cy - position.y) / zoom;
      const newPos = {
        x: cx - canvasX * clamped,
        y: cy - canvasY * clamped,
      };
      if (!isZoomControlled) setInternalZoom(clamped);
      if (!isPositionControlled) setInternalPosition(newPos);
      callbacksRef.current.onZoomChange?.(clamped);
      callbacksRef.current.onPositionChange?.(newPos);
      callbacksRef.current.onChange?.({ zoom: clamped, position: newPos });
    },
    [config.minZoom, config.maxZoom, isZoomControlled, isPositionControlled, position, zoom],
  );

  const updatePosition = useCallback(
    (newPos: Vector2d) => {
      if (!isPositionControlled) setInternalPosition(newPos);
      callbacksRef.current.onPositionChange?.(newPos);
      callbacksRef.current.onChange?.({ zoom, position: newPos });
    },
    [isPositionControlled, zoom],
  );

  const updateBoth = useCallback(
    (newZoom: number, newPos: Vector2d) => {
      const clamped = clamp(newZoom, config.minZoom, config.maxZoom);
      if (!isZoomControlled) setInternalZoom(clamped);
      if (!isPositionControlled) setInternalPosition(newPos);
      callbacksRef.current.onZoomChange?.(clamped);
      callbacksRef.current.onPositionChange?.(newPos);
      callbacksRef.current.onChange?.({ zoom: clamped, position: newPos });
    },
    [config.minZoom, config.maxZoom, isZoomControlled, isPositionControlled],
  );

  // ── Zoom to a specific screen-space point ───────────────────────────────
  const zoomToPoint = useCallback(
    (point: Vector2d, newZoom: number) => {
      const clamped = clamp(newZoom, config.minZoom, config.maxZoom);
      // Convert pointer position to canvas-space before zoom
      const canvasPoint = {
        x: (point.x - position.x) / zoom,
        y: (point.y - position.y) / zoom,
      };
      // After zoom, the same canvas point should stay under the pointer
      const newPos = {
        x: point.x - canvasPoint.x * clamped,
        y: point.y - canvasPoint.y * clamped,
      };
      updateBoth(clamped, newPos);
    },
    [zoom, position, config.minZoom, config.maxZoom, updateBoth],
  );

  // ── Zoom to center of viewport ──────────────────────────────────────────
  const zoomToCenter = useCallback(
    (viewportWidth: number, viewportHeight: number, newZoom: number) => {
      zoomToPoint({ x: viewportWidth / 2, y: viewportHeight / 2 }, newZoom);
    },
    [zoomToPoint],
  );

  // ── Step zoom ───────────────────────────────────────────────────────────
  const zoomIn = useCallback(() => {
    updateZoom(zoom * config.zoomSpeed);
  }, [zoom, config.zoomSpeed, updateZoom]);

  const zoomOut = useCallback(() => {
    updateZoom(zoom / config.zoomSpeed);
  }, [zoom, config.zoomSpeed, updateZoom]);

  // ── Fit content to viewport ─────────────────────────────────────────────
  const fitToContent = useCallback(
    (vw: number, vh: number, cw: number, ch: number) => {
      const pad = config.fitPadding;
      const scaleX = (vw - pad * 2) / cw;
      const scaleY = (vh - pad * 2) / ch;
      const newZoom = clamp(Math.min(scaleX, scaleY), config.minZoom, config.maxZoom);
      const newPos = {
        x: (vw - cw * newZoom) / 2,
        y: (vh - ch * newZoom) / 2,
      };
      updateBoth(newZoom, newPos);
    },
    [config.fitPadding, config.minZoom, config.maxZoom, updateBoth],
  );

  // ── Center without changing zoom ────────────────────────────────────────
  const centerContent = useCallback(
    (vw: number, vh: number, cw: number, ch: number) => {
      updatePosition({
        x: (vw - cw * zoom) / 2,
        y: (vh - ch * zoom) / 2,
      });
    },
    [zoom, updatePosition],
  );

  // ── Reset ───────────────────────────────────────────────────────────────
  const reset = useCallback(() => {
    updateBoth(config.initialZoom, config.initialPosition);
  }, [config.initialZoom, config.initialPosition, updateBoth]);

  // ── Internal: wheel handler (used by ZoomCanvas) ────────────────────────
  const _handleWheel = useCallback(
    (e: Konva.KonvaEventObject<WheelEvent>, stage: Konva.Stage) => {
      e.evt.preventDefault();

      const hasModifier = e.evt.ctrlKey || e.evt.metaKey;
      const shouldZoom = config.requireModifierToZoom ? hasModifier : !e.evt.shiftKey;

      if (shouldZoom && config.wheelZoom) {
        const pointer = stage.getPointerPosition();
        if (!pointer) return;

        const direction = e.evt.deltaY > 0 ? -1 : 1;
        const newZoom = direction > 0 ? zoom * config.zoomSpeed : zoom / config.zoomSpeed;
        zoomToPoint(pointer, newZoom);
      } else if (config.wheelPan) {
        // Pan mode
        const dx = e.evt.shiftKey ? -e.evt.deltaY : -e.evt.deltaX;
        const dy = e.evt.shiftKey ? 0 : -e.evt.deltaY;
        updatePosition({ x: position.x + dx, y: position.y + dy });
      }
    },
    [zoom, position, config, zoomToPoint, updatePosition],
  );

  // ── Internal: drag end handler ──────────────────────────────────────────
  const _handleDragEnd = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>, stage: Konva.Stage) => {
      if (e.target === stage) {
        updatePosition({ x: e.target.x(), y: e.target.y() });
      }
    },
    [updatePosition],
  );

  return {
    zoom,
    position,
    setZoom: updateZoom,
    setPosition: updatePosition,
    zoomToPoint,
    zoomToCenter,
    zoomIn,
    zoomOut,
    fitToContent,
    centerContent,
    reset,
    config,
    _handleWheel,
    _handleDragEnd,
    /** @internal used by ZoomCanvas to track viewport size */
    _setViewportSize: setViewportSize,
  };
};
