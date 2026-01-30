'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Menu, X, ChevronRight, FolderOpen } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface Collection {
    _id: string;
    name: string;
    slug: string;
    coverImage?: string;
}

interface CollectionMenuProps {
    tenantSlug: string;
    collections: Collection[];
    currentCollectionSlug?: string;
    primaryColor?: string;
}

export function CollectionMenu({
    tenantSlug,
    collections,
    currentCollectionSlug,
    primaryColor = '#1e40af'
}: CollectionMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Cerrar menú al presionar Escape
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    // Bloquear scroll cuando el menú está abierto
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

    // Render del menú usando Portal
    const MenuContent = (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/50 z-[90] backdrop-blur-sm"
                onClick={() => setIsOpen(false)}
            />

            {/* Panel del menú */}
            <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-[95] shadow-2xl animate-slide-in-right">
                {/* Header */}
                <div
                    className="flex items-center justify-between p-6 border-b"
                    style={{ backgroundColor: primaryColor + '10' }}
                >
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Nuestras Colecciones</h2>
                        <p className="text-sm text-slate-500">Explora nuestro catálogo</p>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                        aria-label="Cerrar menú"
                    >
                        <X className="h-6 w-6 text-slate-700" />
                    </button>
                </div>

                {/* Lista de colecciones */}
                <div className="overflow-y-auto h-[calc(100%-100px)] p-4">
                    {collections.length > 0 ? (
                        <div className="space-y-2">
                            {collections.map((collection) => {
                                const isActive = collection.slug === currentCollectionSlug;
                                return (
                                    <Link
                                        key={collection._id}
                                        href={`/t/${tenantSlug}/${collection.slug}`}
                                        onClick={() => setIsOpen(false)}
                                        className={`flex items-center gap-4 p-4 rounded-xl transition-all ${isActive
                                            ? 'bg-slate-100 border-l-4'
                                            : 'hover:bg-slate-50 border-l-4 border-transparent'
                                            }`}
                                        style={isActive ? { borderColor: primaryColor } : {}}
                                    >
                                        {/* Imagen de la colección */}
                                        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                                            {collection.coverImage ? (
                                                <Image
                                                    src={collection.coverImage}
                                                    alt={collection.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <FolderOpen className="h-6 w-6 text-slate-300" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className={`font-semibold truncate ${isActive ? 'text-slate-900' : 'text-slate-700'}`}>
                                                {collection.name}
                                            </h3>
                                            {isActive && (
                                                <span
                                                    className="text-xs font-medium"
                                                    style={{ color: primaryColor }}
                                                >
                                                    Estás aquí
                                                </span>
                                            )}
                                        </div>

                                        {/* Flecha */}
                                        <ChevronRight className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-slate-500' : 'text-slate-400'}`} />
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <FolderOpen className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-500">No hay colecciones disponibles</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-slate-50 border-t">
                    <Link
                        href={`/t/${tenantSlug}`}
                        onClick={() => setIsOpen(false)}
                        className="block text-center text-sm text-slate-600 hover:text-slate-900 transition-colors"
                    >
                        ← Volver al inicio
                    </Link>
                </div>
            </div>
        </>
    );

    if (!mounted) return (
        <button
            onClick={() => setIsOpen(true)}
            className="p-2 border-2 border-slate-200 hover:border-slate-300 rounded-lg transition-colors hover:bg-slate-50"
            aria-label="Abrir menú de colecciones"
        >
            <Menu className="h-6 w-6 text-slate-700" />
        </button>
    );

    return (
        <>
            {/* Botón del menú */}
            <button
                onClick={() => setIsOpen(true)}
                className="p-2 border-2 border-slate-200 hover:border-slate-300 rounded-lg transition-colors hover:bg-slate-50"
                aria-label="Abrir menú de colecciones"
            >
                <Menu className="h-6 w-6 text-slate-700" />
            </button>

            {/* Portal del menú */}
            {isOpen && createPortal(MenuContent, document.body)}
        </>
    );
}


