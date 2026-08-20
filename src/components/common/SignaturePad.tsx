import React, { useRef, useState, useEffect } from 'react';
import { RotateCcw, PenTool, Type, Check } from 'lucide-react';

interface SignaturePadProps {
  signerName: string;
  onSignatureCapture: (signatureData: string, isTyped: boolean) => void;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({ signerName, onSignatureCapture }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [mode, setMode] = useState<'draw' | 'type'>('draw');
  const [typedSignature, setTypedSignature] = useState(signerName || '');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = '#1e1b4b';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [mode]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
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

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    onSignatureCapture('', false);
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTypedSignature(e.target.value);
    onSignatureCapture(e.target.value, true);
  };

  return (
    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
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
              width={480}
              height={140}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full h-[120px] touch-none"
            />
            {!hasDrawn && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-xs text-slate-400 font-medium">
                Sign with mouse or finger here
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
            <span className="text-[11px] text-slate-600">
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
