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
                        {footerText ? (
                            <p className="text-slate-300 text-sm md:text-base font-medium">{footerText}</p>
                        ) : (
                            <p className="text-slate-500 text-sm">
                                © {currentYear} Todos los derechos reservados
                            </p>
                        )}
                    </div>

                    {/* Redes sociales */}
                    <div className="flex flex-wrap justify-center gap-6 mt-4 md:mt-0">
                        {socialLinks.instagram && (
                            <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 hover:scale-110 transition-transform">
                                <svg width="32" height="32" viewBox="0 0 32 32">
                                    <defs>
                                        <radialGradient id="ig-grad" r="150%" cx="30%" cy="107%">
                                            <stop stopColor="#fdf497" offset="0%" />
                                            <stop stopColor="#fdf497" offset="5%" />
                                            <stop stopColor="#fd5949" offset="45%" />
                                            <stop stopColor="#d6249f" offset="60%" />
                                            <stop stopColor="#285AEB" offset="90%" />
                                        </radialGradient>
                                    </defs>
                                    <rect width="32" height="32" rx="8" fill="url(#ig-grad)" />
                                    <rect x="7" y="7" width="18" height="18" rx="4" fill="none" stroke="#fff" strokeWidth="2.5" />
                                    <circle cx="16" cy="16" r="4.5" fill="none" stroke="#fff" strokeWidth="2.5" />
                                    <circle cx="21.5" cy="10.5" r="1.5" fill="#fff" />
                                </svg>
                                <span className="text-[11px] font-bold text-slate-300">Instagram</span>
                            </a>
                        )}
                        {socialLinks.facebook && (
                            <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 hover:scale-110 transition-transform">
                                <svg width="32" height="32" viewBox="0 0 32 32">
                                    <circle cx="16" cy="16" r="16" fill="#1877F2" />
                                    <path fill="#ffffff" d="M19 10h2v-3h-3c-2.76 0-5 2.24-5 5v2h-2v3h2v10h3v-10h3l1-3h-4v-2c0-.55.45-1 1-1z" />
                                </svg>
                                <span className="text-[11px] font-bold text-slate-300">Facebook</span>
                            </a>
                        )}
                        {socialLinks.tiktok && (
                            <a href={socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 hover:scale-110 transition-transform">
                                <svg width="32" height="32" viewBox="0 0 32 32">
                                    <rect width="32" height="32" rx="8" fill="#000000" />
                                    <path fill="#ffffff" d="M16 6c1.1 0 2.2.01 3.3.02.07 1.3.53 2.6 1.47 3.5 1 .93 2.27 1.36 3.56 1.5v3.4c-1.2-.04-2.43-.3-3.53-.82-.48-.22-.92-.5-1.36-.8v6.26c.01 1.64-.55 3.3-1.62 4.6-1.3 1.55-3.28 2.45-5.36 2.43-2.69-.03-5.26-1.87-6-4.47-.36-1.28-.33-2.65.18-3.85.88-2.12 3.07-3.48 5.34-3.4v3.4c-1.4.06-2.72 1.05-3.1 2.4-.3 1.02-.05 2.17.7 2.87.85.83 2.14 1.07 3.23.6 1-.4 1.62-1.38 1.65-2.46.06-4.25.02-8.5.03-12.75h3.2z" />
                                </svg>
                                <span className="text-[11px] font-bold text-slate-300">TikTok</span>
                            </a>
                        )}
                        {socialLinks.whatsappLink && (
                            <a href={socialLinks.whatsappLink} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 hover:scale-110 transition-transform">
                                <svg width="32" height="32" viewBox="0 0 32 32">
                                    <rect width="32" height="32" rx="8" fill="#25D366" />
                                    <path fill="#ffffff" d="M16 6c-5.5 0-10 4.5-10 10 0 1.8.5 3.5 1.4 5l-1.5 4.6 4.8-1.5c1.4.8 3 1.3 4.8 1.3 5.5 0 10-4.5 10-10S21.5 6 16 6zm5.5 14.5c-.3.8-1.4 1.2-2 1.3-.5.1-1.2.1-3.4-.8-2.6-1.1-4.3-3.8-4.4-4-.1-.1-1.1-1.4-1.1-2.7 0-1.2.6-1.9.9-2.2.2-.2.5-.3.8-.3h.5c.2 0 .5-.1.7.5.3.7.8 1.9.8 2.1s-.1.4-.2.6c-.1.2-.2.3-.3.5s-.3.3-.4.5c-.2.2-.3.4-.1.7.2.3.9 1.5 2 2.5 1.3 1.2 2.5 1.6 2.8 1.7.3.1.5.1.7-.1.2-.2.8-1 1-1.3.2-.3.5-.3.7-.2.3.1 1.7.8 1.9 1 .2.1.4.2.4.3.1.2.1.8-.2 1.5z" />
                                </svg>
                                <span className="text-[11px] font-bold text-slate-300">WhatsApp</span>
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </footer>
    );
}
