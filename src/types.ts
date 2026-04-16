import Konva from 'konva';

// ─── Core Types ──────────────────────────────────────────────────────────────

export interface Vector2d {
  x: number;
  y: number;
}

export interface ZoomCanvasState {
  zoom: number;
  position: Vector2d;
}

// ─── Configuration ───────────────────────────────────────────────────────────

export interface ZoomCanvasConfig {
  /** Minimum allowed zoom level. @default 0.05 */
  minZoom: number;
  /** Maximum allowed zoom level. @default 20 */
  maxZoom: number;
  /** Zoom speed multiplier per wheel tick. @default 1.08 */
  zoomSpeed: number;
  /** Whether wheel zooming is enabled. @default true */
  wheelZoom: boolean;
  /** Whether panning via scroll wheel is enabled. @default true */
  wheelPan: boolean;
  /** Whether drag-to-pan is enabled. @default true */
  dragPan: boolean;
  /** Whether Ctrl/Cmd must be held to zoom (false = zoom without modifier). @default false */
  requireModifierToZoom: boolean;
  /** Padding used in fitToContent calculations. @default 40 */
  fitPadding: number;
  /** Initial zoom level. @default 1 */
  initialZoom: number;
  /** Initial position. @default { x: 0, y: 0 } */
  initialPosition: Vector2d;
}

export const DEFAULT_CONFIG: ZoomCanvasConfig = {
  minZoom: 0.05,
  maxZoom: 20,
  zoomSpeed: 1.08,
  wheelZoom: true,
  wheelPan: true,
  dragPan: true,
  requireModifierToZoom: false,
  fitPadding: 40,
  initialZoom: 1,
  initialPosition: { x: 0, y: 0 },
};

// ─── Hook Options & Return ───────────────────────────────────────────────────

export interface UseZoomCanvasOptions extends Partial<ZoomCanvasConfig> {
  /** Controlled zoom value. */
  zoom?: number;
  /** Controlled position value. */
  position?: Vector2d;
  /** Callback fired when zoom changes. */
  onZoomChange?: (zoom: number) => void;
  /** Callback fired when position changes. */
  onPositionChange?: (position: Vector2d) => void;
  /** Callback fired on any state change. */
  onChange?: (state: ZoomCanvasState) => void;
}

export interface UseZoomCanvasReturn {
  zoom: number;
  position: Vector2d;
  setZoom: (zoom: number) => void;
  setPosition: (pos: Vector2d) => void;
  /** Zoom to a specific point on the canvas (point in screen/viewport coordinates). */
  zoomToPoint: (point: Vector2d, newZoom: number) => void;
  /** Zoom to center of the given viewport dimensions. */
  zoomToCenter: (viewportWidth: number, viewportHeight: number, newZoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  /** Fit content rect into viewport, centering it. */
  fitToContent: (viewportWidth: number, viewportHeight: number, contentWidth: number, contentHeight: number) => void;
  /** Center content in viewport without changing zoom. */
  centerContent: (viewportWidth: number, viewportHeight: number, contentWidth: number, contentHeight: number) => void;
  /** Reset to initial zoom and position. */
  reset: () => void;
  config: ZoomCanvasConfig;
  /** @internal wheel handler for ZoomCanvas */
  _handleWheel: (e: Konva.KonvaEventObject<WheelEvent>, stage: Konva.Stage) => void;
  /** @internal drag handler for ZoomCanvas */
  _handleDragEnd: (e: Konva.KonvaEventObject<DragEvent>, stage: Konva.Stage) => void;
  /** @internal viewport size tracker for center-based zoom */
  _setViewportSize: (size: { width: number; height: number }) => void;
}

// ─── Component Props ─────────────────────────────────────────────────────────

export interface ZoomCanvasProps {
  width: number;
  height: number;
  children?: React.ReactNode;
  stageRef?: React.RefObject<Konva.Stage | null>;
  onStageClick?: (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => void;
  /** Override drag-to-pan. When undefined, uses config.dragPan. */
  draggable?: boolean;
  className?: string;
  style?: React.CSSProperties;

  // ── Controlled mode ──
  zoom?: number;
  position?: Vector2d;
  onZoom?: (zoom: number) => void;
  onPosition?: (pos: Vector2d) => void;

  // ── Or pass engine instance for zero-config ──
  engine?: UseZoomCanvasReturn;

  /** Config overrides (only used when engine is NOT provided). */
  config?: Partial<ZoomCanvasConfig>;
}

export interface ZoomControlsProps {
  zoom: number;
  onZoom: (zoom: number) => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onFit?: () => void;
  onReset?: () => void;
  minZoom?: number;
  maxZoom?: number;
  className?: string;
  style?: React.CSSProperties;
  showFit?: boolean;
  showReset?: boolean;
  showLabel?: boolean;
  showSlider?: boolean;
}
