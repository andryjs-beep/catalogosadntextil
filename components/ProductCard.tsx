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
}: ProductCardProps) {
    const displayImage = coverImage || image;

    return (
        <Link href={`/t/${tenantSlug}/${slug || id}`}>
            <div className="tenant-card group bg-white rounded-2xl overflow-hidden shadow-md cursor-pointer">
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
                            <span className="font-bold text-sm tenant-text-primary">{price}</span>
                        </div>
                    )}
                </div>

                {/* Contenido */}
                <div className="p-4 flex flex-col flex-grow">
                    <h3 className="font-bold text-slate-800 group-hover:tenant-text-primary transition-colors line-clamp-2 text-sm md:text-base mb-2">
                        {name}
                    </h3>

                    <div className="mt-auto pt-2 flex flex-col gap-2">
                        {price && (
                            <p className="font-extrabold text-lg tenant-gradient-text">
                                {price}
                            </p>
                        )}

                        <div className="flex items-center text-[10px] font-black uppercase tracking-tighter tenant-text-primary group-hover:translate-x-1 transition-transform">
                            {ctaText}
                            <span className="ml-1">→</span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
