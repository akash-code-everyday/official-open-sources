import React, { useRef } from 'react';
import { Stage } from 'react-konva';
import Konva from 'konva';
import { ZoomCanvasProps, DEFAULT_CONFIG } from './types';
import { useZoomCanvas } from './useZoomCanvas';

/**
 * A fully self-contained zoom & pan canvas powered by Konva.
 *
 * **Three usage modes:**
 *
 * 1. **Engine mode** (recommended): pass `engine={useZoomCanvas()}` for full control.
 * 2. **Controlled mode**: pass `zoom`, `position`, `onZoom`, `onPosition`.
 * 3. **Uncontrolled mode**: pass nothing — the component manages its own state.
 *
 * @example
 * ```tsx
 * // Engine mode (recommended)
 * const engine = useZoomCanvas({ initialZoom: 0.5 });
 * <ZoomCanvas width={800} height={600} engine={engine}>
 *   <Layer>...</Layer>
 * </ZoomCanvas>
 *
 * // Uncontrolled mode (zero config)
 * <ZoomCanvas width={800} height={600}>
 *   <Layer>...</Layer>
 * </ZoomCanvas>
 * ```
 */
export const ZoomCanvas: React.FC<ZoomCanvasProps> = ({
  width,
  height,
  children,
  stageRef: externalStageRef,
  onStageClick,
  draggable,
  className,
  style,
  zoom: controlledZoom,
  position: controlledPosition,
  onZoom,
  onPosition,
  engine: externalEngine,
  config: configOverrides,
}) => {
  const internalStageRef = useRef<Konva.Stage>(null);
  const stageRef = externalStageRef || internalStageRef;

  // If no engine is provided, create an internal one
  const internalEngine = useZoomCanvas({
    ...configOverrides,
    zoom: controlledZoom,
    position: controlledPosition,
    onZoomChange: onZoom,
    onPositionChange: onPosition,
  });

  const engine = externalEngine || internalEngine;

  // Keep engine aware of viewport dimensions for center-based zoom
  React.useEffect(() => {
    engine._setViewportSize({ width, height });
  }, [width, height, engine._setViewportSize]);

  const isDragEnabled = draggable ?? engine.config.dragPan;

  return (
    <div className={className} style={{ overflow: 'hidden', ...style }}>
      <Stage
        ref={stageRef}
        width={width}
        height={height}
        scaleX={engine.zoom}
        scaleY={engine.zoom}
        x={engine.position.x}
        y={engine.position.y}
        draggable={isDragEnabled}
        onWheel={(e) => {
          engine._handleWheel(e, stageRef.current || e.target.getStage()!);
        }}
        onClick={onStageClick}
        onTap={onStageClick}
        onDragEnd={(e) => {
          engine._handleDragEnd(e, stageRef.current || e.target.getStage()!);
        }}
      >
        {children}
      </Stage>
    </div>
  );
};
