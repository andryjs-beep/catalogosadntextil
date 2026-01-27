/**
 * Componente Footer para páginas públicas de tenant
 */
import { Instagram, Facebook, MessageCircle } from 'lucide-react';
import type { ISocialLinks } from '@/lib/models/Tenant';

interface FooterProps {
    footerText: string;
    socialLinks: ISocialLinks;
}

export function Footer({ footerText, socialLinks }: FooterProps) {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-slate-900 text-white py-12">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    {/* Texto del footer */}
                    <div className="text-center md:text-left">
                        {footerText && (
                            <p className="text-slate-300 mb-2">{footerText}</p>
                        )}
                        <p className="text-slate-500 text-sm">
                            © {currentYear} Todos los derechos reservados
                        </p>
                    </div>

                    {/* Redes sociales */}
                    <div className="flex items-center gap-4">
                        {socialLinks.instagram && (
                            <a
                                href={socialLinks.instagram}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-400 hover:text-white transition-colors"
                                aria-label="Instagram"
                            >
                                <Instagram className="h-6 w-6" />
                            </a>
                        )}
                        {socialLinks.facebook && (
                            <a
                                href={socialLinks.facebook}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-400 hover:text-white transition-colors"
                                aria-label="Facebook"
                            >
                                <Facebook className="h-6 w-6" />
                            </a>
                        )}
                        {socialLinks.whatsappLink && (
                            <a
                                href={socialLinks.whatsappLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-400 hover:text-green-400 transition-colors"
                                aria-label="WhatsApp"
                            >
                                <MessageCircle className="h-6 w-6" />
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </footer>
    );
}
