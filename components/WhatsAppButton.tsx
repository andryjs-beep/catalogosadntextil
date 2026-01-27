/**
 * Componente WhatsAppButton - Botón de contacto por WhatsApp con tracking
 * Genera automáticamente enlaces en formato wa.me
 */
'use client';

import { MessageCircle } from 'lucide-react';

interface WhatsAppButtonProps {
    href: string; // Puede ser número directo, URL wa.me, o URL api.whatsapp
    text: string;
    productName?: string;
    collectionName?: string;
    tenantId: string;
    productId?: string;
    collectionId?: string;
    className?: string;
    variant?: 'default' | 'floating';
}

/**
 * Extrae el número de teléfono limpio desde diferentes formatos:
 * - +584121234567
 * - 584121234567
 * - https://wa.me/584121234567
 * - https://api.whatsapp.com/send?phone=584121234567
 */
function extractPhoneNumber(input: string): string {
    if (!input) return '';

    // Si ya es un número limpio
    if (/^\d+$/.test(input)) return input;

    // Extraer de URL wa.me
    const waMatch = input.match(/wa\.me\/(\d+)/);
    if (waMatch) return waMatch[1];

    // Extraer de URL api.whatsapp.com
    const apiMatch = input.match(/phone=(\d+)/);
    if (apiMatch) return apiMatch[1];

    // Limpiar cualquier formato de número (+, -, espacios, paréntesis)
    const cleanNumber = input.replace(/[^\d]/g, '');
    return cleanNumber;
}

export function WhatsAppButton({
    href,
    text,
    productName,
    collectionName,
    tenantId,
    productId,
    collectionId,
    className = '',
    variant = 'default',
}: WhatsAppButtonProps) {
    // Extraer número limpio
    const phoneNumber = extractPhoneNumber(href);

    // Construir mensaje dinámico con el producto/colección
    let message = 'Hola, quiero más información';
    if (productName) {
        message = `Hola, me interesa el producto: ${productName}`;
    } else if (collectionName) {
        message = `Hola, me interesa la colección: ${collectionName}`;
    }

    // Generar URL en formato correcto wa.me
    const url = phoneNumber
        ? `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
        : '#'; // Fallback si no hay número

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
