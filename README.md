# zoom-canvas-engine

A high-performance, zero-dependency\* zoom & pan engine for [Konva.js](https://konvajs.org/) + React.

> \*Peer dependencies: `react`, `konva`, `react-konva`

## Features

- 🎯 **Pointer-aware zooming** — zooms toward the cursor position, not the origin
- 🔄 **Controlled & uncontrolled modes** — use it your way
- 📐 **Fit-to-content** — auto-center and scale content to fill the viewport
- 🖱️ **Natural panning** — scroll wheel, shift+scroll for horizontal, drag-to-pan
- ⚙️ **Fully configurable** — zoom speed, limits, modifier keys, padding, etc.
- 🎨 **Standalone ZoomControls** — no external UI library needed
- 📦 **TypeScript-first** — fully typed API

## Installation

```bash
npm install zoom-canvas-engine
```

## Peer Dependencies

```bash
npm install react react-dom konva react-konva
```

## Quick Start

### 1. Zero-config (uncontrolled)

```tsx
import { ZoomCanvas, ZoomControls, useZoomCanvas } from 'zoom-canvas-engine';
import { Layer, Rect } from 'react-konva';

function App() {
  const engine = useZoomCanvas();

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <ZoomCanvas width={800} height={600} engine={engine}>
        <Layer>
          <Rect x={100} y={100} width={200} height={200} fill="coral" />
        </Layer>
      </ZoomCanvas>

      <ZoomControls
        zoom={engine.zoom}
        onZoom={engine.setZoom}
        onZoomIn={engine.zoomIn}
        onZoomOut={engine.zoomOut}
        onFit={() => engine.fitToContent(800, 600, 1000, 1000)}
        onReset={engine.reset}
        showReset
        style={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)' }}
      />
    </div>
  );
}
```

### 2. Controlled mode

```tsx
function App() {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  return (
    <ZoomCanvas
      width={800}
      height={600}
      zoom={zoom}
      position={position}
      onZoom={setZoom}
      onPosition={setPosition}
    >
      <Layer>
        <Rect x={0} y={0} width={500} height={500} fill="steelblue" />
      </Layer>
    </ZoomCanvas>
  );
}
```

### 3. With custom config

```tsx
const engine = useZoomCanvas({
  initialZoom: 0.5,
  minZoom: 0.1,
  maxZoom: 10,
  zoomSpeed: 1.15,
  requireModifierToZoom: true, // Ctrl/Cmd + scroll to zoom
  fitPadding: 60,
});
```

## API Reference

### `useZoomCanvas(options?)`

Returns an engine object with:

| Property | Type | Description |
|---|---|---|
| `zoom` | `number` | Current zoom level |
| `position` | `Vector2d` | Current canvas position `{ x, y }` |
| `setZoom(z)` | `(number) => void` | Set zoom (clamped to min/max) |
| `setPosition(p)` | `(Vector2d) => void` | Set position |
| `zoomToPoint(point, zoom)` | | Zoom toward a specific screen coordinate |
| `zoomToCenter(vw, vh, zoom)` | | Zoom toward center of viewport |
| `zoomIn()` / `zoomOut()` | | Step zoom by `zoomSpeed` |
| `fitToContent(vw, vh, cw, ch)` | | Fit & center content in viewport |
| `centerContent(vw, vh, cw, ch)` | | Center without changing zoom |
| `reset()` | | Reset to initial state |
| `config` | `ZoomCanvasConfig` | Resolved configuration |

### `<ZoomCanvas>`

| Prop | Type | Default | Description |
|---|---|---|---|
| `width` | `number` | **required** | Canvas width |
| `height` | `number` | **required** | Canvas height |
| `engine` | `UseZoomCanvasReturn` | — | Pass hook return for full control |
| `zoom` | `number` | — | Controlled zoom |
| `position` | `Vector2d` | — | Controlled position |
| `onZoom` | `(z) => void` | — | Zoom change callback |
| `onPosition` | `(p) => void` | — | Position change callback |
| `draggable` | `boolean` | `config.dragPan` | Override drag behavior |
| `stageRef` | `RefObject` | — | Access Konva Stage |
| `onStageClick` | `(e) => void` | — | Stage background click |
| `config` | `Partial<ZoomCanvasConfig>` | — | Config overrides |

### `<ZoomControls>`

Self-contained zoom UI with +/- buttons, slider, percentage label, fit & reset.

| Prop | Type | Default | Description |
|---|---|---|---|
| `zoom` | `number` | **required** | Current zoom |
| `onZoom` | `(z) => void` | **required** | Zoom change |
| `onZoomIn` / `onZoomOut` | `() => void` | — | Custom step handlers |
| `onFit` | `() => void` | — | Fit button handler |
| `onReset` | `() => void` | — | Reset button handler |
| `showFit` | `boolean` | `true` | Show fit button |
| `showReset` | `boolean` | `false` | Show reset button |
| `showLabel` | `boolean` | `true` | Show percentage |
| `showSlider` | `boolean` | `true` | Show range slider |

## Configuration Defaults

```ts
{
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
}
```

## License

MIT
