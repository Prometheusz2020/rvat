"use client";

import React, { useRef, useState, useEffect } from 'react';

interface SignaturePadProps {
    onSave: (signatureData: string) => void;
    onClear: () => void;
    initialData?: string | null;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({ onSave, onClear, initialData }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [isEmpty, setIsEmpty] = useState(true);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx && initialData) {
                const img = new Image();
                img.onload = () => {
                    ctx.drawImage(img, 0, 0);
                    setIsEmpty(false);
                };
                img.src = initialData;
            }
        }
    }, [initialData]);

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        setIsDrawing(true);
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#000';

        const { offsetX, offsetY } = getCoordinates(e, canvas);
        ctx.beginPath();
        ctx.moveTo(offsetX, offsetY);
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Prevent scrolling on touch devices while drawing
        if (e.type === 'touchmove') {
            e.preventDefault();
        }

        const { offsetX, offsetY } = getCoordinates(e, canvas);
        ctx.lineTo(offsetX, offsetY);
        ctx.stroke();
        setIsEmpty(false);
    };

    const stopDrawing = () => {
        if (!isDrawing) return;
        setIsDrawing(false);
        save();
    };

    const getCoordinates = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
        let clientX = 0;
        let clientY = 0;
        if ('touches' in e) {
            if (e.touches && e.touches.length > 0) {
                clientX = e.touches[0].clientX;
                clientY = e.touches[0].clientY;
            } else if (e.changedTouches && e.changedTouches.length > 0) {
                clientX = e.changedTouches[0].clientX;
                clientY = e.changedTouches[0].clientY;
            }
        } else {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        }

        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / (rect.width || 1);
        const scaleY = canvas.height / (rect.height || 1);

        return {
            offsetX: (clientX - rect.left) * scaleX,
            offsetY: (clientY - rect.top) * scaleY
        };
    };

    const clear = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                setIsEmpty(true);
                onClear();
            }
        }
    };

    const save = () => {
        const canvas = canvasRef.current;
        if (canvas && !isEmpty) {
            const dataUrl = canvas.toDataURL('image/png');
            onSave(dataUrl);
        }
    };

    return (
        <div className="flex flex-col items-center gap-2 w-full">
            <div className="border border-gray-400 rounded-lg overflow-hidden touch-none bg-white">
                <canvas
                    ref={canvasRef}
                    width={500}
                    height={200}
                    className="w-full h-auto max-w-[500px] cursor-crosshair block"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    style={{ maxWidth: '100%', height: '200px' }}
                />
            </div>
            <div className="text-xs text-gray-500 mb-2">
                Assine no quadro acima (use o dedo ou mouse)
            </div>
            <button
                type="button"
                onClick={clear}
                className="px-4 py-1 text-sm text-red-600 border border-red-600 rounded hover:bg-red-50"
            >
                Limpar Assinatura
            </button>
        </div>
    );
};
