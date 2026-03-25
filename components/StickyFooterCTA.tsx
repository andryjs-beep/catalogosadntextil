'use client';

import { WhatsAppButton, WhatsAppIcon } from './WhatsAppButton';
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface StickyFooterCTAProps {
    phoneNumber: string;
    productName?: string;
    collectionName?: string;
    ctaText?: string;
    bgColor?: string;
    textColor?: string;
    showAfterScroll?: number;
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
        <>
            {/* Espaciador para evitar que el contenido quede oculto */}
            <div className="h-24 md:hidden" />

            {/* Barra fija */}
            <div
                className="fixed bottom-0 left-0 right-0 z-[60] md:hidden"
                style={{
                    paddingBottom: '24px',
                    background: `linear-gradient(to top, ${bgColor} 70%, transparent)`
                }}
            >
                <div className="px-4 pt-4">
                    <div className="flex items-center gap-3">
                        <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-2 font-black py-4 px-6 rounded-2xl shadow-2xl transition-all active:scale-95"
                            style={{ backgroundColor: textColor, color: bgColor }}
                        >
                            <WhatsAppIcon className="h-6 w-6" />
                            <span className="text-lg">{ctaText}</span>
                        </a>

                        <button
                            onClick={() => setIsDismissed(true)}
                            className="p-3 rounded-full shadow-lg"
                            style={{ backgroundColor: textColor, color: bgColor }}
                            aria-label="Cerrar"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
