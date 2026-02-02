/**
 * Componente Header para páginas públicas de tenant
 * Diseño profesional con logo grande y menú de navegación
 */
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Instagram, Facebook, Menu, X, ChevronDown, Home, Users, MapPin, ShoppingBag } from 'lucide-react';
import type { ISocialLinks, IBranding } from '@/lib/models/Tenant';

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
    branding?: IBranding;
}

export function Header({
    logo,
    headerText,
    socialLinks,
    tenantSlug,
    collections = [],
    currentCollectionSlug,
    primaryColor,
    branding
}: HeaderProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [productsDropdownOpen, setProductsDropdownOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 bg-white shadow-sm">
            <div className="container mx-auto px-4">
                {/* Desktop Header */}
                <div className="flex items-center justify-between py-4">
                    {/* Logo - Más grande y centrado */}
                    <Link href={`/t/${tenantSlug}`} className="flex items-center gap-4">
                        {logo ? (
                            <Image
                                src={logo}
                                alt="Logo"
                                width={180}
                                height={60}
                                className="h-14 md:h-16 w-auto object-contain"
                                priority
                            />
                        ) : (
                            <div className="h-14 w-14 rounded-xl tenant-bg-primary flex items-center justify-center">
                                <span className="text-white font-bold text-2xl">
                                    {tenantSlug.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        )}
                    </Link>

                    {/* Menú de navegación - Desktop */}
                    <nav className="hidden lg:flex items-center gap-1">
                        <Link
                            href={`/t/${tenantSlug}`}
                            className="px-4 py-2 text-slate-700 hover:text-slate-900 font-medium transition-colors"
                        >
                            Inicio
                        </Link>

                        {/* Dropdown Productos */}
                        {collections.length > 0 && (
                            <div className="relative">
                                <button
                                    onMouseEnter={() => setProductsDropdownOpen(true)}
                                    onMouseLeave={() => setProductsDropdownOpen(false)}
                                    className="flex items-center gap-1 px-4 py-2 text-slate-700 hover:text-slate-900 font-medium transition-colors"
                                >
                                    Productos
                                    <ChevronDown className={`h-4 w-4 transition-transform ${productsDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {productsDropdownOpen && (
                                    <div
                                        onMouseEnter={() => setProductsDropdownOpen(true)}
                                        onMouseLeave={() => setProductsDropdownOpen(false)}
                                        className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50"
                                    >
                                        {collections.map((col) => (
                                            <Link
                                                key={col._id}
                                                href={`/t/${tenantSlug}/${col.slug}`}
                                                className={`block px-4 py-2 text-sm hover:bg-slate-50 transition-colors ${currentCollectionSlug === col.slug
                                                        ? 'text-blue-600 font-medium bg-blue-50'
                                                        : 'text-slate-700'
                                                    }`}
                                            >
                                                {col.name}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {socialLinks.address && (
                            <Link
                                href={socialLinks.googleMapsLink || '#ubicacion'}
                                target={socialLinks.googleMapsLink ? '_blank' : undefined}
                                className="px-4 py-2 text-slate-700 hover:text-slate-900 font-medium transition-colors"
                            >
                                Ubicación
                            </Link>
                        )}
                    </nav>

                    {/* Redes sociales - Desktop */}
                    <div className="hidden lg:flex items-center gap-3">
                        {socialLinks.instagram && (
                            <a
                                href={socialLinks.instagram}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 text-white hover:scale-110 transition-transform"
                                aria-label="Instagram"
                            >
                                <Instagram className="h-5 w-5" />
                            </a>
                        )}
                        {socialLinks.facebook && (
                            <a
                                href={socialLinks.facebook}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-full bg-blue-600 text-white hover:scale-110 transition-transform"
                                aria-label="Facebook"
                            >
                                <Facebook className="h-5 w-5" />
                            </a>
                        )}
                        {socialLinks.tiktok && (
                            <a
                                href={socialLinks.tiktok}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-full bg-black text-white hover:scale-110 transition-transform"
                                aria-label="TikTok"
                            >
                                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7.2a8.16 8.16 0 0 0 4.77 1.52v-3.3a4.85 4.85 0 0 1-1-.1z" />
                                </svg>
                            </a>
                        )}
                    </div>

                    {/* Botón menú móvil */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="lg:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="lg:hidden border-t border-slate-200 py-4 space-y-2">
                        <Link
                            href={`/t/${tenantSlug}`}
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                        >
                            <Home className="h-5 w-5" />
                            Inicio
                        </Link>

                        {collections.length > 0 && (
                            <div className="px-4">
                                <div className="flex items-center gap-3 py-3 text-slate-700 font-medium">
                                    <ShoppingBag className="h-5 w-5" />
                                    Productos
                                </div>
                                <div className="ml-8 space-y-1">
                                    {collections.map((col) => (
                                        <Link
                                            key={col._id}
                                            href={`/t/${tenantSlug}/${col.slug}`}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className={`block py-2 text-sm ${currentCollectionSlug === col.slug
                                                    ? 'text-blue-600 font-medium'
                                                    : 'text-slate-600 hover:text-slate-900'
                                                }`}
                                        >
                                            {col.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {socialLinks.address && (
                            <Link
                                href={socialLinks.googleMapsLink || '#ubicacion'}
                                target={socialLinks.googleMapsLink ? '_blank' : undefined}
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                            >
                                <MapPin className="h-5 w-5" />
                                Ubicación
                            </Link>
                        )}

                        {/* Redes Sociales Móvil */}
                        <div className="flex items-center gap-3 px-4 pt-4 border-t border-slate-200 mt-4">
                            {socialLinks.instagram && (
                                <a
                                    href={socialLinks.instagram}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 text-white"
                                >
                                    <Instagram className="h-5 w-5" />
                                </a>
                            )}
                            {socialLinks.facebook && (
                                <a
                                    href={socialLinks.facebook}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 rounded-full bg-blue-600 text-white"
                                >
                                    <Facebook className="h-5 w-5" />
                                </a>
                            )}
                            {socialLinks.tiktok && (
                                <a
                                    href={socialLinks.tiktok}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 rounded-full bg-black text-white"
                                >
                                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7.2a8.16 8.16 0 0 0 4.77 1.52v-3.3a4.85 4.85 0 0 1-1-.1z" />
                                    </svg>
                                </a>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}
