import React, { useRef, useState, useEffect, useCallback } from 'react';
import { RotateCcw, PenTool, Type, Check } from 'lucide-react';

interface SignaturePadProps {
  signerName: string;
  onSignatureCapture: (signatureData: string, isTyped: boolean) => void;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({ signerName, onSignatureCapture }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [mode, setMode] = useState<'draw' | 'type'>('draw');
  const [typedSignature, setTypedSignature] = useState(signerName || '');

  // Synchronize canvas resolution with rendered display size
  const syncCanvasResolution = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const dpr = window.devicePixelRatio || 1;
    
    // Save image data if already drawn
    let tempImg: ImageData | null = null;
    const ctx = canvas.getContext('2d');
    if (ctx && canvas.width > 0 && canvas.height > 0 && hasDrawn) {
      tempImg = ctx.getImageData(0, 0, canvas.width, canvas.height);
    }

    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);

    if (ctx) {
      ctx.scale(dpr, dpr);
      ctx.strokeStyle = '#1e1b4b';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (tempImg) {
        // Redraw if there was previous content
        ctx.putImageData(tempImg, 0, 0);
      }
    }
  }, [hasDrawn]);

  useEffect(() => {
    if (mode === 'draw') {
      // Small timeout to allow modal animation to stabilize layout dimensions
      const timer = setTimeout(() => {
        syncCanvasResolution();
      }, 50);

      window.addEventListener('resize', syncCanvasResolution);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', syncCanvasResolution);
      };
    }
  }, [mode, syncCanvasResolution]);

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e 
      ? (e.touches[0] ? e.touches[0].clientX : e.changedTouches[0]?.clientX || 0)
      : e.clientX;
    const clientY = 'touches' in e 
      ? (e.touches[0] ? e.touches[0].clientY : e.changedTouches[0]?.clientY || 0)
      : e.clientY;

    // Direct 1:1 CSS coordinates since context is scaled by DPR
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCanvasCoordinates(e);

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCanvasCoordinates(e);

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      onSignatureCapture(canvas.toDataURL('image/png'), false);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    setHasDrawn(false);
    onSignatureCapture('', false);
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTypedSignature(e.target.value);
    onSignatureCapture(e.target.value, true);
  };

  return (
    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200" ref={containerRef}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <PenTool className="w-3.5 h-3.5 text-indigo-600" />
          Digital Signature Acknowledgment
        </span>

        {/* Draw vs Type Switcher */}
        <div className="flex items-center bg-slate-200/80 p-0.5 rounded-lg text-xs font-semibold text-slate-700">
          <button
            type="button"
            onClick={() => setMode('draw')}
            className={`px-2.5 py-1 rounded-md transition flex items-center gap-1 ${
              mode === 'draw' ? 'bg-white shadow-sm text-indigo-700' : 'hover:text-slate-900'
            }`}
          >
            <PenTool className="w-3 h-3" />
            Draw
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('type');
              if (typedSignature) onSignatureCapture(typedSignature, true);
            }}
            className={`px-2.5 py-1 rounded-md transition flex items-center gap-1 ${
              mode === 'type' ? 'bg-white shadow-sm text-indigo-700' : 'hover:text-slate-900'
            }`}
          >
            <Type className="w-3 h-3" />
            Type Name
          </button>
        </div>
      </div>

      {mode === 'draw' ? (
        <div>
          <div className="relative bg-white rounded-lg border-2 border-dashed border-slate-300 overflow-hidden cursor-crosshair">
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              style={{ width: '100%', height: '130px', display: 'block' }}
              className="touch-none select-none"
            />
            {!hasDrawn && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-xs text-slate-400 font-medium">
                Sign with mouse, trackpad, or finger here
              </div>
            )}
            <div className="absolute bottom-2 left-3 text-[10px] text-slate-400 pointer-events-none">
              ✕ Sign on the line
            </div>
          </div>
          <div className="flex justify-between items-center mt-2">
            <button
              type="button"
              onClick={clearCanvas}
              className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1 py-1"
            >
              <RotateCcw className="w-3 h-3" />
              Clear Signature
            </button>
            <span className="text-[11px] text-slate-600 font-medium">
              {hasDrawn ? '✓ Signature captured' : 'Awaiting signature'}
            </span>
          </div>
        </div>
      ) : (
        <div>
          <input
            type="text"
            value={typedSignature}
            onChange={handleTypeChange}
            placeholder="Type your full legal name"
            className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-lg font-serif italic text-indigo-950 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          />
          <p className="text-[11px] text-slate-600 mt-1.5 flex items-center gap-1">
            <Check className="w-3 h-3 text-emerald-600" />
            Typing your legal name constitutes an electronic signature under the ESIGN Act.
          </p>
        </div>
      )}
    </div>
  );
};

