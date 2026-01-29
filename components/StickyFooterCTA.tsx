'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';

interface StickyFooterCTAProps {
    phoneNumber: string;
    productName?: string;
    collectionName?: string;
    ctaText?: string;
    bgColor?: string;
    textColor?: string;
    showAfterScroll?: number; // px después del cual mostrar
}

function extractPhoneNumber(input: string): string {
    if (!input) return '';
    if (/^\d+$/.test(input)) return input;
    const waMatch = input.match(/wa\.me\/(\d+)/);
    if (waMatch) return waMatch[1];
    const apiMatch = input.match(/phone=(\d+)/);
    if (apiMatch) return apiMatch[1];
    return input.replace(/[^\d]/g, '');
}

export function StickyFooterCTA({
    phoneNumber,
    productName,
    collectionName,
    ctaText = '¡Comprar Ahora!',
    bgColor = '#25D366',
    textColor = '#ffffff',
    showAfterScroll = 300
}: StickyFooterCTAProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > showAfterScroll) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [showAfterScroll]);

    if (isDismissed || !isVisible) return null;

    const cleanNumber = extractPhoneNumber(phoneNumber);
    let message = 'Hola, quiero más información';
    if (productName) {
        message = `Hola, me interesa el producto: ${productName}`;
    } else if (collectionName) {
        message = `Hola, me interesa la colección: ${collectionName}`;
    }

    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;

    return (
        <div
            className="fixed left-0 right-0 z-50 px-4 pb-4 md:hidden"
            style={{
                bottom: 'env(safe-area-inset-bottom, 16px)',
            }}
        >
            <div
                className="rounded-2xl shadow-2xl p-3"
                style={{ backgroundColor: bgColor }}
            >
                <div className="flex items-center gap-3">
                    <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 font-bold py-3 px-6 rounded-xl transition-all hover:scale-[1.02] active:scale-95"
                        style={{ backgroundColor: textColor, color: bgColor }}
                    >
                        <MessageCircle className="h-5 w-5" />
                        {ctaText}
                    </a>

                    <button
                        onClick={() => setIsDismissed(true)}
                        className="p-2 rounded-full opacity-70 hover:opacity-100 transition-opacity"
                        style={{ color: textColor }}
                        aria-label="Cerrar"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
            </div>

            <style jsx>{`
                @keyframes slide-up {
                    from { transform: translateY(100%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                div:first-child {
                    animation: slide-up 0.3s ease-out;
                }
            `}</style>
        </div>
    );
}
