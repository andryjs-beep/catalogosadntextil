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
            className="w-full py-2 text-sm"
            style={{ backgroundColor: bgColor, color: textColor }}
        >
            <div className="container mx-auto px-4 flex items-center justify-between">
                {/* Información de contacto */}
                <div className="flex items-center gap-4 flex-wrap">
                    {socialLinks.phoneNumber && (
                        <a
                            href={`tel:${socialLinks.phoneNumber}`}
                            className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                        >
                            <Phone className="h-4 w-4" />
                            <span className="hidden sm:inline">{socialLinks.phoneNumber}</span>
                        </a>
                    )}
                    {socialLinks.email && (
                        <a
                            href={`mailto:${socialLinks.email}`}
                            className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                        >
                            <Mail className="h-4 w-4" />
                            <span className="hidden sm:inline">{socialLinks.email}</span>
                        </a>
                    )}
                </div>

                {/* Redes sociales */}
                <div className="flex items-center gap-3">
                    {socialLinks.facebook && (
                        <a
                            href={socialLinks.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:opacity-80 transition-opacity"
                            aria-label="Facebook"
                        >
                            <Facebook className="h-4 w-4" />
                        </a>
                    )}
                    {socialLinks.instagram && (
                        <a
                            href={socialLinks.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:opacity-80 transition-opacity"
                            aria-label="Instagram"
                        >
                            <Instagram className="h-4 w-4" />
                        </a>
                    )}
                    {socialLinks.tiktok && (
                        <a
                            href={socialLinks.tiktok}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:opacity-80 transition-opacity"
                            aria-label="TikTok"
                        >
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
