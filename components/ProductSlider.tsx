'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Expand } from 'lucide-react';
import { Lightbox } from './Lightbox';

interface ProductSliderProps {
    images: string[];
    productName?: string;
    autoPlay?: boolean;
    interval?: number;
}

export function ProductSlider({
    images,
    productName = 'Producto',
    autoPlay = true,
    interval = 4000
}: ProductSliderProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

    // Filtrar imágenes vacías
    const validImages = images.filter(img => img && img.trim() !== '');

    // Si no hay imágenes, mostrar placeholder
    if (validImages.length === 0) {
        return (
            <div className="aspect-square bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl flex items-center justify-center">
                <div className="text-center space-y-3 p-8">
                    <div className="w-16 h-16 bg-slate-300/50 rounded-full mx-auto flex items-center justify-center">
                        <span className="text-3xl">📷</span>
                    </div>
                    <p className="text-slate-400 font-medium">Sin imágenes</p>
                </div>
            </div>
        );
    }

    const goToNext = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % validImages.length);
    }, [validImages.length]);

    const goToPrev = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
    }, [validImages.length]);

    // Auto-play
    useEffect(() => {
        if (!autoPlay || isHovered || validImages.length <= 1 || isLightboxOpen) return;

        const timer = setInterval(goToNext, interval);
        return () => clearInterval(timer);
    }, [autoPlay, isHovered, interval, goToNext, validImages.length, isLightboxOpen]);

    const handleImageClick = () => {
        setIsLightboxOpen(true);
    };

    return (
        <>
            <div
                className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-white group"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Imágenes */}
                <div
                    className="relative w-full h-full cursor-pointer"
                    onClick={handleImageClick}
                >
                    {validImages.map((image, index) => (
                        <div
                            key={index}
                            className={`absolute inset-0 transition-all duration-500 ease-in-out ${index === currentIndex
                                ? 'opacity-100 scale-100'
                                : 'opacity-0 scale-105'
                                }`}
                        >
                            <Image
                                src={image}
                                alt={`${productName} - Imagen ${index + 1}`}
                                fill
                                className="object-cover"
                                priority={index === 0}
                                unoptimized
                            />
                        </div>
                    ))}

                    {/* Overlay de zoom al hover */}
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                        <div className="bg-white/90 p-3 rounded-full shadow-lg">
                            <Expand className="h-6 w-6 text-slate-700" />
                        </div>
                    </div>
                </div>

                {/* Controles de navegación (solo si hay más de 1 imagen) */}
                {validImages.length > 1 && (
                    <>
                        {/* Botón Anterior */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                goToPrev();
                            }}
                            className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all hover:scale-110"
                            style={{ opacity: isHovered ? 1 : 0 }}
                            aria-label="Imagen anterior"
                        >
                            <ChevronLeft className="h-5 w-5 text-slate-700" />
                        </button>

                        {/* Botón Siguiente */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                goToNext();
                            }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all hover:scale-110"
                            style={{ opacity: isHovered ? 1 : 0 }}
                            aria-label="Imagen siguiente"
                        >
                            <ChevronRight className="h-5 w-5 text-slate-700" />
                        </button>

                        {/* Indicadores (dots) */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                            {validImages.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setCurrentIndex(index);
                                    }}
                                    className={`w-2.5 h-2.5 rounded-full transition-all ${index === currentIndex
                                        ? 'bg-white scale-125 shadow-md'
                                        : 'bg-white/50 hover:bg-white/75'
                                        }`}
                                    aria-label={`Ir a imagen ${index + 1}`}
                                />
                            ))}
                        </div>

                        {/* Contador de imágenes */}
                        <div className="absolute top-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                            {currentIndex + 1} / {validImages.length}
                        </div>
                    </>
                )}
            </div>

            {/* Lightbox Modal */}
            <Lightbox
                images={validImages}
                initialIndex={currentIndex}
                isOpen={isLightboxOpen}
                onClose={() => setIsLightboxOpen(false)}
                productName={productName}
            />
        </>
    );
}
