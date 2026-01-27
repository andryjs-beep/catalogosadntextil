/**
 * Componente CollectionCard - Card de colección para home
 */
import Image from 'next/image';
import Link from 'next/link';
import { FolderOpen, ArrowRight } from 'lucide-react';

interface CollectionCardProps {
    name: string;
    slug: string;
    coverImage: string;
    tenantSlug: string;
    ctaText: string;
    productCount?: number;
}

export function CollectionCard({
    name,
    slug,
    coverImage,
    tenantSlug,
    ctaText,
    productCount,
}: CollectionCardProps) {
    return (
        <Link href={`/t/${tenantSlug}/${slug}`}>
            <div className="tenant-card group relative overflow-hidden rounded-2xl bg-white shadow-lg cursor-pointer">
                {/* Imagen */}
                <div className="aspect-square relative overflow-hidden">
                    {coverImage ? (
                        <Image
                            src={coverImage}
                            alt={name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                            <FolderOpen className="h-16 w-16 text-slate-300" />
                        </div>
                    )}
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Contenido */}
                <div className="p-4">
                    <h3 className="font-bold text-lg text-slate-900 mb-1 group-hover:tenant-text-primary transition-colors">
                        {name}
                    </h3>
                    {productCount !== undefined && (
                        <p className="text-sm text-slate-500 mb-3">
                            {productCount} productos
                        </p>
                    )}
                    <div className="flex items-center gap-2 text-sm font-medium tenant-text-primary">
                        {ctaText || 'Ver Catálogo'}
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                </div>

                {/* Borde inferior con color accent */}
                <div className="absolute bottom-0 left-0 right-0 h-1 tenant-bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
            </div>
        </Link>
    );
}
