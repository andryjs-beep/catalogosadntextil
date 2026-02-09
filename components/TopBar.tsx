/**
 * Componente TopBar - Barra superior de contacto
 * Muestra teléfono, email e iconos de redes sociales
 */
import { Phone, Mail, Instagram, Facebook } from 'lucide-react';
import type { ISocialLinks, IBranding } from '@/lib/models/Tenant';

interface TopBarProps {
    socialLinks: ISocialLinks;
    branding: IBranding;
}

export function TopBar({ socialLinks, branding }: TopBarProps) {
    // Si no está habilitado, no renderizar
    if (!branding.topBarEnabled) return null;

    const bgColor = branding.topBarBgColor || '#1e40af';
    const textColor = branding.topBarTextColor || '#ffffff';

    return (
        <div
            className="w-full py-2 text-xs md:text-sm border-b border-white/10"
            style={{ backgroundColor: bgColor, color: textColor }}
        >
            <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-2">
                {/* Email (Centro/Izquierda en Desktop) */}
                {socialLinks.email && (
                    <a
                        href={`mailto:${socialLinks.email}`}
                        className="flex items-center gap-1.5 hover:opacity-80 transition-opacity font-medium tracking-tight"
                    >
                        <Mail className="h-3 w-3" />
                        <span>{socialLinks.email}</span>
                    </a>
                )}

                {/* Redes sociales (Iconos alineados 2026) */}
                <div className="flex items-center gap-5">
                    {socialLinks.instagram && (
                        <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform" aria-label="Instagram">
                            <Instagram className="h-4 w-4" />
                        </a>
                    )}
                    {socialLinks.facebook && (
                        <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform" aria-label="Facebook">
                            <Facebook className="h-4 w-4" />
                        </a>
                    )}
                    {socialLinks.x && (
                        <a href={socialLinks.x} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform" aria-label="X (Twitter)">
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                        </a>
                    )}
                    {socialLinks.youtube && (
                        <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform" aria-label="YouTube">
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                            </svg>
                        </a>
                    )}
                    {socialLinks.tiktok && (
                        <a href={socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform" aria-label="TikTok">
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7.2a8.16 8.16 0 0 0 4.77 1.52v-3.3a4.85 4.85 0 0 1-1-.1z" />
                            </svg>
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}
