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

    // Swipe handling for mobile
    let touchStartX = 0;
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX = e.touches[0].clientX;
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
        <div
            className="fixed inset-0 z-[100] bg-black flex flex-col"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            {/* Header con controles */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent absolute top-0 left-0 right-0 z-10">
                <div className="text-white text-sm bg-white/20 px-3 py-1 rounded-full">
                    {currentIndex + 1} / {images.length}
                </div>

                <button
                    onClick={onClose}
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
                    aria-label="Cerrar"
                >
                    <X className="h-6 w-6" />
                </button>
            </div>

            {/* Contenedor de imagen - ocupa toda la pantalla */}
            <div
                className="flex-1 flex items-center justify-center p-4"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                <div className="relative w-full h-full flex items-center justify-center">
                    <Image
                        src={images[currentIndex]}
                        alt={`${productName} - Imagen ${currentIndex + 1}`}
                        fill
                        className="object-contain"
                        priority
                        sizes="100vw"
                    />
                </div>
            </div>

            {/* Navegación lateral */}
            {images.length > 1 && (
                <>
                    <button
                        onClick={goToPrev}
                        className="absolute left-2 top-1/2 -translate-y-1/2 p-2 md:p-3 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
                        aria-label="Anterior"
                    >
                        <ChevronLeft className="h-6 w-6 md:h-8 md:w-8" />
                    </button>
                    <button
                        onClick={goToNext}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 md:p-3 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
                        aria-label="Siguiente"
                    >
                        <ChevronRight className="h-6 w-6 md:h-8 md:w-8" />
                    </button>
                </>
            )}

            {/* Miniaturas en la parte inferior */}
            {images.length > 1 && (
                <div className="absolute bottom-0 left-0 right-0 pb-6 pt-4 bg-gradient-to-t from-black/80 to-transparent">
                    <div className="flex justify-center gap-2 px-4 overflow-x-auto">
                        {images.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className={`relative flex-shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-lg overflow-hidden border-2 transition-all ${idx === currentIndex
                                        ? 'border-white scale-110'
                                        : 'border-transparent opacity-60 hover:opacity-100'
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
