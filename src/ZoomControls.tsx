import React from 'react';

/**
 * Standalone zoom controls — no external UI library dependencies.
 * Renders +/- buttons, a range slider, percentage label, fit & reset buttons.
 * Fully styleable via className / style.
 */
export const ZoomControls: React.FC<{
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
}> = ({
  zoom,
  onZoom,
  onZoomIn,
  onZoomOut,
  onFit,
  onReset,
  minZoom = 5,
  maxZoom = 500,
  className = '',
  style,
  showFit = true,
  showReset = false,
  showLabel = true,
  showSlider = true,
}) => {
  const zoomPercent = Math.round(zoom * 100);

  const btnStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    border: 'none',
    borderRadius: '50%',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: 16,
    fontWeight: 600,
    color: 'inherit',
    transition: 'background 0.15s',
  };

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '6px 16px',
    borderRadius: 9999,
    background: 'white',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.06)',
    fontSize: 12,
    fontFamily: 'system-ui, -apple-system, sans-serif',
    userSelect: 'none',
    ...style,
  };

  const sliderStyle: React.CSSProperties = {
    width: 80,
    height: 4,
    appearance: 'none' as const,
    background: '#e5e5e5',
    borderRadius: 2,
    outline: 'none',
    cursor: 'pointer',
  };

  return (
    <div className={className} style={containerStyle}>
      <button
        style={btnStyle}
        onClick={() => (onZoomOut ? onZoomOut() : onZoom(zoom / 1.15))}
        title="Zoom out"
        onMouseEnter={(e) => (e.currentTarget.style.background = '#f3f3f3')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        −
      </button>

      {showSlider && (
        <input
          type="range"
          min={minZoom}
          max={maxZoom}
          value={zoomPercent}
          onChange={(e) => onZoom(Number(e.target.value) / 100)}
          style={sliderStyle}
          onMouseDown={(e) => e.stopPropagation()}
        />
      )}

      <button
        style={btnStyle}
        onClick={() => (onZoomIn ? onZoomIn() : onZoom(zoom * 1.15))}
        title="Zoom in"
        onMouseEnter={(e) => (e.currentTarget.style.background = '#f3f3f3')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        +
      </button>

      {showLabel && (
        <span style={{ width: 40, textAlign: 'center', fontWeight: 700, fontSize: 11 }}>
          {zoomPercent}%
        </span>
      )}

      {showFit && onFit && (
        <>
          <div style={{ width: 1, height: 16, background: '#e5e5e5' }} />
          <button
            style={{ ...btnStyle, width: 'auto', borderRadius: 4, padding: '2px 8px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}
            onClick={onFit}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#f3f3f3')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            Fit
          </button>
        </>
      )}

      {showReset && onReset && (
        <button
          style={{ ...btnStyle, width: 'auto', borderRadius: 4, padding: '2px 8px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}
          onClick={onReset}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#f3f3f3')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          Reset
        </button>
      )}
    </div>
  );
};
