'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from 'lucide-react';

interface LightboxProps {
    images: string[];
    initialIndex?: number;
    isOpen: boolean;
    onClose: () => void;
    productName?: string;
}

export function Lightbox({
    images,
    initialIndex = 0,
    isOpen,
    onClose,
    productName = 'Imagen'
}: LightboxProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [zoom, setZoom] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    useEffect(() => {
        setCurrentIndex(initialIndex);
        setZoom(1);
        setPosition({ x: 0, y: 0 });
    }, [initialIndex, isOpen]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;
            switch (e.key) {
                case 'Escape':
                    onClose();
                    break;
                case 'ArrowLeft':
                    goToPrev();
                    break;
                case 'ArrowRight':
                    goToNext();
                    break;
                case '+':
                    handleZoomIn();
                    break;
                case '-':
                    handleZoomOut();
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, currentIndex]);

    // Bloquear scroll del body cuando lightbox está abierto
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen || images.length === 0) return null;

    const goToNext = () => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
        resetZoom();
    };

    const goToPrev = () => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
        resetZoom();
    };

    const handleZoomIn = () => {
        setZoom((prev) => Math.min(prev + 0.5, 4));
    };

    const handleZoomOut = () => {
        setZoom((prev) => {
            const newZoom = Math.max(prev - 0.5, 1);
            if (newZoom === 1) setPosition({ x: 0, y: 0 });
            return newZoom;
        });
    };

    const resetZoom = () => {
        setZoom(1);
        setPosition({ x: 0, y: 0 });
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (zoom > 1) {
            setIsDragging(true);
            setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging && zoom > 1) {
            setPosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y,
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleDoubleClick = () => {
        if (zoom === 1) {
            setZoom(2);
        } else {
            resetZoom();
        }
    };

    return (
        <div
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            {/* Controles superiores */}
            <div className="absolute top-4 left-0 right-0 flex items-center justify-between px-4 z-10">
                <div className="text-white text-sm bg-black/50 px-3 py-1 rounded-full">
                    {currentIndex + 1} / {images.length}
                </div>

                <div className="flex items-center gap-2">
                    {/* Controles de zoom */}
                    <button
                        onClick={handleZoomOut}
                        disabled={zoom <= 1}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors disabled:opacity-50"
                        title="Alejar"
                    >
                        <ZoomOut className="h-5 w-5" />
                    </button>
                    <span className="text-white text-sm min-w-[50px] text-center">
                        {Math.round(zoom * 100)}%
                    </span>
                    <button
                        onClick={handleZoomIn}
                        disabled={zoom >= 4}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors disabled:opacity-50"
                        title="Acercar"
                    >
                        <ZoomIn className="h-5 w-5" />
                    </button>

                    {/* Cerrar */}
                    <button
                        onClick={onClose}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors ml-4"
                        title="Cerrar (Esc)"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>
            </div>

            {/* Imagen principal */}
            <div
                className="relative w-full h-full flex items-center justify-center overflow-hidden"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onDoubleClick={handleDoubleClick}
                style={{ cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in' }}
            >
                <div
                    className="relative transition-transform duration-200 ease-out"
                    style={{
                        transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
                    }}
                >
                    <Image
                        src={images[currentIndex]}
                        alt={`${productName} - Imagen ${currentIndex + 1}`}
                        width={1200}
                        height={1200}
                        className="max-h-[85vh] w-auto object-contain select-none"
                        priority
                        draggable={false}
                    />
                </div>
            </div>

            {/* Navegación */}
            {images.length > 1 && (
                <>
                    <button
                        onClick={goToPrev}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                        title="Anterior (←)"
                    >
                        <ChevronLeft className="h-8 w-8" />
                    </button>
                    <button
                        onClick={goToNext}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                        title="Siguiente (→)"
                    >
                        <ChevronRight className="h-8 w-8" />
                    </button>
                </>
            )}

            {/* Miniaturas */}
            {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/50 p-2 rounded-xl">
                    {images.slice(0, 8).map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => {
                                setCurrentIndex(idx);
                                resetZoom();
                            }}
                            className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${idx === currentIndex ? 'border-white scale-110' : 'border-transparent opacity-60 hover:opacity-100'
                                }`}
                        >
                            <Image
                                src={img}
                                alt={`Miniatura ${idx + 1}`}
                                fill
                                className="object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}

            {/* Instrucciones */}
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-white/50 text-xs text-center">
                Doble clic para zoom • Arrastra para mover • Flechas para navegar • Esc para cerrar
            </div>
        </div>
    );
}
