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
        <Link href={`/t/${tenantSlug}/${slug || id}`} className="group block h-full">
            <div className="product-card bg-card rounded-[1.5rem] overflow-hidden premium-shadow premium-shadow-hover flex flex-col h-full transition-all duration-500">
                {/* Imagen */}
                <div className="aspect-square relative overflow-hidden bg-muted">
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
                            <Package className="h-10 w-10 text-slate-300" />
                        </div>
                    )}

                    {/* Badge de precio refined with glassmorphism */}
                    {price && (
                        <div className="absolute top-3 right-3 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg border border-white/20">
                            <span className="font-black text-xs tracking-tight text-slate-900">{price}</span>
                        </div>
                    )}
                </div>

                {/* Contenido */}
                <div className="p-5 flex flex-col flex-grow">
                    <h3 className="font-black text-slate-900 transition-colors line-clamp-2 text-sm leading-snug mb-3 group-hover:text-primary">
                        {name}
                    </h3>

                    <div className="mt-auto space-y-4">
                        <div className="flex items-center justify-between border-t border-slate-100 border-dotted pt-3">
                            <div className="product-review">
                                <span className="review-name block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                                    {reviewName}
                                </span>
                                <div className="review-stars flex gap-0.5">
                                    {stars.map((isFull, i) => (
                                        <span key={i} className={isFull ? "text-amber-400" : "text-slate-200"} style={{ fontSize: '12px' }}>
                                            ★
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {price && (
                                <p className="font-black text-lg text-primary leading-none">
                                    {price}
                                </p>
                            )}
                        </div>

                        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 group-hover:text-primary transition-all">
                            <span>{ctaText}</span>
                            <span className="transition-transform group-hover:translate-x-1">→</span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
