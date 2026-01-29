'use client';

import { useState, useEffect } from 'react';
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

    if (!isOpen || images.length === 0) return null;

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

    return (
        <div className="fixed inset-0 z-[9999] bg-black flex flex-col">
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
                className="flex-1 flex items-center justify-center"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                <Image
                    src={images[currentIndex]}
                    alt={`${productName} - Imagen ${currentIndex + 1}`}
                    fill
                    className="object-contain p-2"
                    priority
                    sizes="100vw"
                />
            </div>

            {/* Flechas de navegación - SIEMPRE VISIBLES Y GRANDES */}
            {images.length > 1 && (
                <>
                    <button
                        onClick={goToPrev}
                        className="absolute left-3 top-1/2 -translate-y-1/2 p-4 bg-white/90 hover:bg-white rounded-full text-black shadow-xl transition-all z-20"
                        aria-label="Imagen anterior"
                    >
                        <ChevronLeft className="h-8 w-8" />
                    </button>
                    <button
                        onClick={goToNext}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-4 bg-white/90 hover:bg-white rounded-full text-black shadow-xl transition-all z-20"
                        aria-label="Imagen siguiente"
                    >
                        <ChevronRight className="h-8 w-8" />
                    </button>
                </>
            )}

            {/* Miniaturas */}
            {images.length > 1 && (
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent z-10">
                    <div className="flex justify-center gap-3 overflow-x-auto pb-2">
                        {images.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className={`relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-3 transition-all ${idx === currentIndex
                                        ? 'border-white scale-110 shadow-lg'
                                        : 'border-transparent opacity-50 hover:opacity-100'
                                    }`}
                            >
                                <Image
                                    src={img}
                                    alt={`Miniatura ${idx + 1}`}
                                    fill
                                    className="object-cover"
                                    sizes="64px"
                                />
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
