/**
 * Componente ProductCard - Card de producto para galería
 */
import Image from 'next/image';
import Link from 'next/link';
import { Package } from 'lucide-react';

interface ProductCardProps {
    id: string;
    slug?: string;
    name: string;
    price: string;
    image: string;
    coverImage?: string;
    tenantSlug: string;
    collectionSlug: string;
    ctaText?: string;
    reviewName?: string;
    starRating?: number;
}

export function ProductCard({
    id,
    slug,
    name,
    price,
    image,
    coverImage,
    tenantSlug,
    collectionSlug,
    ctaText = 'Ver catálogo',
    reviewName = 'Cliente Verificado',
    starRating = 5
}: ProductCardProps) {
    const displayImage = coverImage || image;

    // Generar estrellas
    const stars = Array.from({ length: 5 }, (_, i) => i < starRating);

    return (
        <Link href={`/t/${tenantSlug}/${slug || id}`}>
            <div className="product-card tenant-card group bg-white rounded-2xl overflow-hidden shadow-md cursor-pointer flex flex-col h-full transition-transform hover:-translate-y-1">
                {/* Imagen */}
                <div className="aspect-square relative overflow-hidden">
                    {displayImage ? (
                        <Image
                            src={displayImage}
                            alt={name}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                            <Package className="h-12 w-12 text-slate-300" />
                        </div>
                    )}

                    {/* Badge de precio */}
                    {price && (
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-md">
                            <span className="font-bold text-sm" style={{ color: 'var(--color-primary)' }}>{price}</span>
                        </div>
                    )}
                </div>

                {/* Contenido */}
                <div className="p-4 flex flex-col flex-grow">
                    <h3 className="font-bold text-slate-800 transition-colors line-clamp-2 text-sm md:text-base mb-2 group-hover:text-[var(--color-primary)]">
                        {name}
                    </h3>

                    <div className="mt-auto">
                        {price && (
                            <p className="font-extrabold text-lg mb-2" style={{ color: 'var(--color-primary)' }}>
                                {price}
                            </p>
                        )}

                        <div className="product-review pt-3 mr-2 border-t border-slate-100 border-dotted">
                            <span className="review-name block text-[11px] font-medium mb-1" style={{ color: 'var(--color-review-text)' }}>
                                {reviewName}
                            </span>
                            <div className="review-stars flex gap-0.5">
                                {stars.map((isFull, i) => (
                                    <span key={i} style={{ color: isFull ? 'var(--color-star-on)' : 'var(--color-star-off)', fontSize: '14px' }}>
                                        {isFull ? '★' : '☆'}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center text-[10px] font-black uppercase tracking-tighter mt-4 transition-transform group-hover:translate-x-1" style={{ color: 'var(--color-primary)' }}>
                            {ctaText}
                            <span className="ml-1">→</span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
