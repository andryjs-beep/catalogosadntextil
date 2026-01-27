/**
 * Componente Header para páginas públicas de tenant
 */
import Link from 'next/link';
import Image from 'next/image';
import { Instagram, Facebook } from 'lucide-react';
import type { ISocialLinks } from '@/lib/models/Tenant';

interface HeaderProps {
    logo: string;
    headerText: string;
    socialLinks: ISocialLinks;
    tenantSlug: string;
}

export function Header({ logo, headerText, socialLinks, tenantSlug }: HeaderProps) {
    return (
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href={`/t/${tenantSlug}`} className="flex items-center gap-3">
                        {logo ? (
                            <Image
                                src={logo}
                                alt="Logo"
                                width={48}
                                height={48}
                                className="h-12 w-auto object-contain"
                            />
                        ) : (
                            <div className="h-12 w-12 rounded-xl tenant-bg-primary flex items-center justify-center">
                                <span className="text-white font-bold text-xl">
                                    {tenantSlug.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        )}
                        {headerText && (
                            <span className="font-semibold text-lg text-slate-800 hidden md:block">
                                {headerText}
                            </span>
                        )}
                    </Link>

                    {/* Redes sociales */}
                    <div className="flex items-center gap-3">
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
                </div>
            </div>
        </header>
    );
}
