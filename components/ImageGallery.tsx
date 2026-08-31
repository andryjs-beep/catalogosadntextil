'use client';

/**
 * ImageGallery - Componente de galería con múltiples modos
 * - album: Grid de imágenes con lightbox
 * - slider-auto: Carrusel automático
 * - slider-manual: Carrusel con flechas
 */
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { Lightbox } from './Lightbox';

interface ImageGalleryProps {
    images: string[];
    mode: 'album' | 'slider-auto' | 'slider-manual';
    sliderSpeed?: number; // segundos
    productName: string;
}

export function ImageGallery({
    images,
    mode,
    sliderSpeed = 3,
    productName,
}: ImageGalleryProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    // Auto-slide para modo slider-auto
    useEffect(() => {
        if (mode !== 'slider-auto' || images.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % images.length);
        }, sliderSpeed * 1000);

        return () => clearInterval(interval);
    }, [mode, sliderSpeed, images.length]);

    const goToPrev = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    }, [images.length]);

    const goToNext = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
    }, [images.length]);

    const openLightbox = (index: number) => {
        setLightboxIndex(index);
        setLightboxOpen(true);
    };

    if (images.length === 0) {
        return (
            <div className="aspect-square bg-slate-100 rounded-2xl flex items-center justify-center">
                <span className="text-slate-400">Sin imágenes</span>
            </div>
        );
    }

    // Modo Álbum - Grid de imágenes
    if (mode === 'album') {
        return (
            <>
                <div className="grid grid-cols-2 gap-2 md:gap-4">
                    {images.map((img, index) => (
                        <div
                            key={index}
                            className={`relative cursor-pointer group overflow-hidden rounded-xl ${index === 0 ? 'col-span-2 aspect-video' : 'aspect-square'
                                }`}
                            onClick={() => openLightbox(index)}
                        >
                            <Image
                                src={img}
                                alt={`${productName} ${index + 1}`}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                                sizes={index === 0 ? '100vw' : '50vw'}
                                unoptimized
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Lightbox */}
                <Lightbox
                    images={images}
                    initialIndex={lightboxIndex}
                    isOpen={lightboxOpen}
                    onClose={() => setLightboxOpen(false)}
                    productName={productName}
                />
            </>
        );
    }

    // Modo Slider (auto o manual)
    return (
        <>
            <div className="relative">
                {/* Main slider image */}
                <div
                    className="relative aspect-square md:aspect-video rounded-2xl overflow-hidden cursor-pointer"
                    onClick={() => openLightbox(currentIndex)}
                >
                    <Image
                        src={images[currentIndex]}
                        alt={`${productName} ${currentIndex + 1}`}
                        fill
                        className="object-cover"
                        priority
                        sizes="100vw"
                        unoptimized
                    />

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

                    {/* Counter */}
                    <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                        {currentIndex + 1} / {images.length}
                    </div>
                </div>

                {/* Navigation arrows */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                goToPrev();
                            }}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all"
                        >
                            <ChevronLeft className="h-6 w-6" />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                goToNext();
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all"
                        >
                            <ChevronRight className="h-6 w-6" />
                        </button>
                    </>
                )}

                {/* Dots indicator */}
                {images.length > 1 && (
                    <div className="flex justify-center gap-2 mt-4">
                        {images.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className={`w-2 h-2 rounded-full transition-all ${index === currentIndex
                                    ? 'bg-slate-900 w-6'
                                    : 'bg-slate-300 hover:bg-slate-400'
                                    }`}
                            />
                        ))}
                    </div>
                )}

                {/* Thumbnails */}
                {images.length > 1 && (
                    <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                        {images.map((img, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all ${index === currentIndex
                                    ? 'ring-2 ring-slate-900 ring-offset-2'
                                    : 'opacity-60 hover:opacity-100'
                                    }`}
                            >
                                <Image
                                    src={img}
                                    alt={`Thumbnail ${index + 1}`}
                                    fill
                                    className="object-cover"
                                    sizes="64px"
                                    unoptimized
                                />
                            </button>
                        ))}
                    </div>
                )}

                {/* Auto-play indicator */}
                {mode === 'slider-auto' && images.length > 1 && (
                    <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-xs flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        Auto {sliderSpeed}s
                    </div>
                )}
            </div>

            {/* Lightbox */}
            <Lightbox
                images={images}
                initialIndex={lightboxIndex}
                isOpen={lightboxOpen}
                onClose={() => setLightboxOpen(false)}
                productName={productName}
            />
        </>
    );
}


