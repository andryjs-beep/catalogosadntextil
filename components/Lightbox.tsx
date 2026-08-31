'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

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
    const [touchStartX, setTouchStartX] = useState(0);

    useEffect(() => {
        setCurrentIndex(initialIndex);
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

    // Evitar renderizado en el servidor
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!isOpen || images.length === 0 || !mounted) return null;

    const goToNext = () => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const goToPrev = () => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStartX(e.touches[0].clientX);
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        const touchEndX = e.changedTouches[0].clientX;
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) {
                goToNext();
            } else {
                goToPrev();
            }
        }
    };

    // Usamos createPortal para renderizar fuera del flujo normal del DOM y evitar problemas de z-index
    const lightboxContent = (
        <div className="fixed inset-0 z-[9999] bg-black flex flex-col animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between p-4 absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/70 to-transparent">
                <span className="text-white text-lg font-medium bg-black/40 px-4 py-2 rounded-full">
                    {currentIndex + 1} / {images.length}
                </span>

                <button
                    onClick={onClose}
                    className="p-3 bg-black/40 hover:bg-black/60 rounded-full text-white transition-colors"
                    aria-label="Cerrar"
                >
                    <X className="h-7 w-7" />
                </button>
            </div>

            {/* Imagen principal - ocupa toda la pantalla */}
            <div
                className="flex-1 flex items-center justify-center h-full w-full"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onClick={onClose} // Cerrar al hacer click en el fondo
            >
                <div
                    className="relative w-full h-full max-w-7xl max-h-screen p-2 md:p-8 flex items-center justify-center"
                    onClick={(e) => e.stopPropagation()} // Evitar cierre al hacer click en la imagen
                >
                    <Image
                        src={images[currentIndex]}
                        alt={`${productName} - Imagen ${currentIndex + 1}`}
                        fill
                        className="object-contain drop-shadow-2xl"
                        priority
                        sizes="100vw"
                        quality={90}
                        unoptimized
                    />
                </div>
            </div>

            {/* Flechas de navegación - SIEMPRE VISIBLES Y GRANDES */}
            {images.length > 1 && (
                <>
                    <button
                        onClick={(e) => { e.stopPropagation(); goToPrev(); }}
                        className="absolute left-3 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full text-white shadow-xl transition-all z-20 md:p-5"
                        aria-label="Imagen anterior"
                    >
                        <ChevronLeft className="h-8 w-8 md:h-10 md:w-10" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); goToNext(); }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full text-white shadow-xl transition-all z-20 md:p-5"
                        aria-label="Imagen siguiente"
                    >
                        <ChevronRight className="h-8 w-8 md:h-10 md:w-10" />
                    </button>
                </>
            )}

            {/* Miniaturas */}
            {images.length > 1 && (
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent z-20">
                    <div className="flex justify-center gap-3 overflow-x-auto pb-2 scrollbar-none">
                        {images.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
                                className={`relative flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 transition-all duration-300 ${idx === currentIndex
                                    ? 'border-white scale-110 shadow-lg opacity-100 ring-2 ring-white/50'
                                    : 'border-transparent opacity-50 hover:opacity-100'
                                    }`}
                            >
                                <Image
                                    src={img}
                                    alt={`Miniatura ${idx + 1}`}
                                    fill
                                    className="object-cover"
                                    sizes="80px"
                                    unoptimized
                                />
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    // Verificamos que document exista (solo en cliente)
    if (typeof document === 'undefined') return null;

    return createPortal(lightboxContent, document.body);
}
