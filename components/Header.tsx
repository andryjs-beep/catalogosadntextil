'use client';

/**
 * Componente Header para páginas públicas de tenant
 * Rediseño Profesional "Tramas" 2026
 */
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, ChevronDown, Instagram, Facebook, Mail, MapPin } from 'lucide-react';
import type { ISocialLinks } from '@/lib/models/Tenant';
import { Badge } from '@/components/ui/badge';

interface Collection {
    _id: string;
    name: string;
    slug: string;
    coverImage?: string;
}

interface HeaderProps {
    logo: string;
    headerText: string;
    socialLinks: ISocialLinks;
    tenantSlug: string;
    collections?: Collection[];
    currentCollectionSlug?: string;
    primaryColor?: string;
}

export function Header({
    logo,
    headerText,
    socialLinks,
    tenantSlug,
    collections = [],
    currentCollectionSlug,
    primaryColor = '#1e40af'
}: HeaderProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProductsOpen, setIsProductsOpen] = useState(false);

    // Bloquear scroll cuando el menú está abierto
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isMenuOpen]);

    return (
        <>
            <header className="sticky top-0 z-[100] bg-white border-b border-slate-100 shadow-sm py-4">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between">
                        {/* Logo HD - Siempre visible en Header Principal */}
                        <Link href={`/t/${tenantSlug}`} className="flex items-center gap-3 group">
                            {logo ? (
                                <div className="relative h-12 w-32 md:h-14 md:w-40">
                                    <Image
                                        src={logo}
                                        alt={headerText || "Logo"}
                                        fill
                                        className="object-contain"
                                        priority
                                        quality={100}
                                    />
                                </div>
                            ) : (
                                <div className="h-12 w-12 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg" style={{ backgroundColor: primaryColor }}>
                                    {tenantSlug.charAt(0).toUpperCase()}
                                </div>
                            )}
                            {headerText && !logo && (
                                <span className="font-black text-xl text-slate-900 tracking-tighter uppercase">
                                    {headerText}
                                </span>
                            )}
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden lg:flex items-center gap-8">
                            <Link href={`/t/${tenantSlug}`} className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors uppercase tracking-widest">Inicio</Link>

                            <div className="relative group/dropdown">
                                <button className="flex items-center gap-1.5 text-sm font-bold text-slate-600 group-hover/dropdown:text-slate-900 transition-colors uppercase tracking-widest">
                                    Productos
                                    <ChevronDown className="h-4 w-4 transition-transform group-hover/dropdown:rotate-180" />
                                </button>

                                {/* Dropdown Megamenu Style */}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-64 bg-white shadow-2xl rounded-2xl border border-slate-100 p-2 opacity-0 invisible group-hover/dropdown:opacity-100 group-hover/dropdown:visible transition-all duration-300 translate-y-2 group-hover/dropdown:translate-y-0">
                                    {collections.map(col => (
                                        <Link
                                            key={col._id}
                                            href={`/t/${tenantSlug}/${col.slug}`}
                                            className="flex items-center p-3 rounded-xl hover:bg-slate-50 transition-colors text-slate-700 font-bold text-sm"
                                        >
                                            {col.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            <Link href={`/t/${tenantSlug}#benefits`} className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors uppercase tracking-widest">Nuestra Empresa</Link>
                            <Link href={socialLinks.googleMapsLink || "#"} target="_blank" className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors uppercase tracking-widest flex items-center gap-1.5">
                                <MapPin className="h-4 w-4" />
                                Ubicación
                            </Link>
                        </nav>

                        {/* Mobile Hamburguesa */}
                        <button
                            onClick={() => setIsMenuOpen(true)}
                            className="lg:hidden p-2 text-slate-900 hover:bg-slate-50 rounded-xl transition-colors"
                            aria-label="Abrir menú"
                        >
                            <Menu className="h-8 w-8" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Sidebar (Drawer) */}
            <div className={`fixed inset-0 z-[1000] lg:hidden transition-all duration-500 ${isMenuOpen ? 'visible' : 'invisible'}`}>
                {/* Backdrop */}
                <div
                    className={`absolute inset-0 bg-slate-950/40 backdrop-blur-md transition-opacity duration-500 ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`}
                    onClick={() => setIsMenuOpen(false)}
                />

                {/* Content */}
                <div className={`absolute top-0 right-0 h-full w-[85%] max-w-sm bg-white shadow-2xl transition-transform duration-500 transform ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>
                    {/* Drawer Header */}
                    <div className="p-6 flex items-center justify-between border-b border-slate-100">
                        <div className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Menú Principal</div>
                        <button
                            onClick={() => setIsMenuOpen(false)}
                            className="p-3 bg-slate-50 text-slate-900 rounded-2xl hover:bg-slate-100 transition-colors"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Drawer Navigation */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        <Link
                            href={`/t/${tenantSlug}`}
                            onClick={() => setIsMenuOpen(false)}
                            className="block py-4 px-6 bg-slate-50 rounded-2xl text-lg font-black text-slate-900 uppercase tracking-tighter hover:bg-slate-100 transition-colors"
                        >
                            Inicio
                        </Link>

                        {/* Accordion Productos */}
                        <div className="rounded-2xl border border-slate-100 overflow-hidden">
                            <button
                                onClick={() => setIsProductsOpen(!isProductsOpen)}
                                className="w-full flex items-center justify-between py-5 px-6 bg-slate-50 hover:bg-slate-100 transition-colors"
                            >
                                <span className="text-lg font-black text-slate-900 uppercase tracking-tighter">Productos</span>
                                <ChevronDown className={`h-6 w-6 text-slate-400 transition-transform duration-300 ${isProductsOpen ? 'rotate-180' : ''}`} />
                            </button>

                            <div className={`transition-all duration-300 ${isProductsOpen ? 'max-h-[500px] py-4' : 'max-h-0'}`}>
                                {collections.map(col => (
                                    <Link
                                        key={col._id}
                                        href={`/t/${tenantSlug}/${col.slug}`}
                                        onClick={() => setIsMenuOpen(false)}
                                        className="block py-3 px-8 text-slate-600 font-bold hover:text-slate-900 transition-colors"
                                    >
                                        {col.name}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <Link
                            href={`/t/${tenantSlug}#benefits`}
                            onClick={() => setIsMenuOpen(false)}
                            className="block py-4 px-6 bg-slate-50 rounded-2xl text-lg font-black text-slate-900 uppercase tracking-tighter hover:bg-slate-100 transition-colors"
                        >
                            Nuestra Empresa
                        </Link>

                        <a
                            href={socialLinks.googleMapsLink || "#"}
                            target="_blank"
                            onClick={() => setIsMenuOpen(false)}
                            className="block py-4 px-6 bg-slate-50 rounded-2xl text-lg font-black text-slate-900 uppercase tracking-tighter hover:bg-slate-100 transition-colors flex items-center gap-3"
                        >
                            <MapPin className="h-6 w-6 text-primary" />
                            Ubicación
                        </a>
                    </div>

                    {/* Drawer Footer (Socials 2026) */}
                    <div className="p-6 border-t border-slate-100 bg-slate-50 flex flex-wrap items-center justify-center gap-4">
                        {socialLinks.instagram && (
                            <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="p-3 bg-white rounded-2xl shadow-sm text-pink-600 hover:scale-110 transition-transform" aria-label="Instagram">
                                <Instagram className="h-5 w-5" />
                            </a>
                        )}
                        {socialLinks.facebook && (
                            <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="p-3 bg-white rounded-2xl shadow-sm text-blue-600 hover:scale-110 transition-transform" aria-label="Facebook">
                                <Facebook className="h-5 w-5" />
                            </a>
                        )}
                        {socialLinks.tiktok && (
                            <a href={socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="p-3 bg-white rounded-2xl shadow-sm text-slate-900 hover:scale-110 transition-transform" aria-label="TikTok">
                                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7.2a8.16 8.16 0 0 0 4.77 1.52v-3.3a4.85 4.85 0 0 1-1-.1z" />
                                </svg>
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
