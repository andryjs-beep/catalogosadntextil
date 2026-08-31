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
        <Link href={`/${slug}`} className="collection-card group block">
            <div className="relative overflow-hidden rounded-[2rem] bg-card premium-shadow premium-shadow-hover transition-all duration-500">
                {/* Imagen */}
                <div className="aspect-[4/5] relative overflow-hidden bg-muted">
                    {coverImage && coverImage.trim() !== '' ? (
                        <Image
                            src={coverImage}
                            alt={name}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            unoptimized
                        />
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                            <FolderOpen className="h-12 w-12 text-slate-300" />
                        </div>
                    )}
                    {/* Overlay refined */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    {/* Badge for product count */}
                    {productCount !== undefined && (
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-900 shadow-sm">
                            {productCount} Items
                        </div>
                    )}
                </div>

                {/* Contenido */}
                <div className="p-6">
                    <h3 className="font-black text-xl text-slate-900 mb-2 group-hover:text-primary transition-colors leading-tight">
                        {name}
                    </h3>

                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-primary/60 group-hover:text-primary transition-all">
                        <span>{ctaText || 'Explorar'}</span>
                        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                    </div>
                </div>

                {/* Accent line - More subtle */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
            </div>
        </Link>
    );
}
