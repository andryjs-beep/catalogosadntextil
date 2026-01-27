/**
 * Componente WhatsAppButton - Botón de contacto por WhatsApp con tracking
 */
'use client';

import { MessageCircle } from 'lucide-react';

interface WhatsAppButtonProps {
    href: string;
    text: string;
    productName?: string;
    tenantId: string;
    productId?: string;
    collectionId?: string;
    className?: string;
    variant?: 'default' | 'floating';
}

export function WhatsAppButton({
    href,
    text,
    productName,
    tenantId,
    productId,
    collectionId,
    className = '',
    variant = 'default',
}: WhatsAppButtonProps) {
    const message = productName
        ? `Hola, me interesa ${productName}`
        : 'Hola, quiero más información';

    const url = href.includes('?')
        ? `${href}&text=${encodeURIComponent(message)}`
        : `${href}?text=${encodeURIComponent(message)}`;

    const trackClick = async () => {
        try {
            await fetch('/api/analytics/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tenantId,
                    type: 'whatsapp_click',
                    productId: productId || undefined,
                    collectionId: collectionId || undefined,
                }),
            });
        } catch {
            // Silenciar errores de tracking
        }
    };

    const handleClick = () => {
        trackClick();
    };

    if (variant === 'floating') {
        return (
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleClick}
                className={`fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#1da851] text-white rounded-full p-4 shadow-2xl hover:scale-110 transition-all duration-300 ${className}`}
                aria-label="Contactar por WhatsApp"
            >
                <MessageCircle className="h-7 w-7" />
            </a>
        );
    }

    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClick}
            className={`inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1da851] text-white font-bold py-3 px-6 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-lg ${className}`}
        >
            <MessageCircle className="h-5 w-5" />
            {text}
        </a>
    );
}
