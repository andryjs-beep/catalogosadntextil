'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

interface ProductGalleryProps {
    images: string[];
    productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isZoomed, setIsZoomed] = useState(false);

    if (!images || images.length === 0) return null;

    const goToPrevious = () => {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const goToNext = () => {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    return (
        <section className="py-8 px-4 bg-white">
            <div className="container mx-auto max-w-6xl">
                <div className="grid md:grid-cols-2 gap-8 items-start">
                    {/* Imagen Principal */}
                    <div className="relative">
                        <div
                            className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 cursor-zoom-in shadow-xl border border-slate-200"
                            onClick={() => setIsZoomed(!isZoomed)}
                        >
                            <Image
                                src={images[currentIndex]}
                                alt={`${productName} - Imagen ${currentIndex + 1}`}
                                fill
                                className={`object-cover transition-transform duration-500 ${isZoomed ? 'scale-150' : 'scale-100'}`}
                                priority
                            />

                            {/* Indicador de zoom */}
                            <div className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full opacity-70 hover:opacity-100 transition-opacity">
                                <ZoomIn className="h-5 w-5" />
                            </div>
                        </div>

                        {/* Flechas de navegación */}
                        {images.length > 1 && (
                            <>
                                <button
                                    onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-800 p-2 rounded-full shadow-lg transition-all hover:scale-110"
                                    aria-label="Imagen anterior"
                                >
                                    <ChevronLeft className="h-6 w-6" />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); goToNext(); }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-800 p-2 rounded-full shadow-lg transition-all hover:scale-110"
                                    aria-label="Imagen siguiente"
                                >
                                    <ChevronRight className="h-6 w-6" />
                                </button>
                            </>
                        )}

                        {/* Indicadores de posición */}
                        {images.length > 1 && (
                            <div className="flex justify-center gap-2 mt-4">
                                {images.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentIndex(index)}
                                        className={`w-3 h-3 rounded-full transition-all ${index === currentIndex
                                                ? 'bg-primary w-8'
                                                : 'bg-slate-300 hover:bg-slate-400'
                                            }`}
                                        aria-label={`Ir a imagen ${index + 1}`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Thumbnails Grid */}
                    {images.length > 1 && (
                        <div className="grid grid-cols-4 gap-3">
                            {images.map((image, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentIndex(index)}
                                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${index === currentIndex
                                            ? 'border-primary ring-2 ring-primary/30'
                                            : 'border-transparent hover:border-slate-300'
                                        }`}
                                >
                                    <Image
                                        src={image}
                                        alt={`${productName} - Miniatura ${index + 1}`}
                                        fill
                                        className="object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
