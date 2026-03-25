/**
 * Componente WhatsAppButton - Botón de contacto por WhatsApp con tracking
 * Genera automáticamente enlaces en formato wa.me
 */
'use client';

interface WhatsAppButtonProps {
    href: string; // Puede ser número directo, URL wa.me, o URL api.whatsapp
    text: string;
    productName?: string;
    collectionName?: string;
    tenantId: string;
    productId?: string;
    collectionId?: string;
    className?: string;
    variant?: 'default' | 'floating' | 'large';
}

/**
 * Icono oficial de WhatsApp en SVG para máxima nitidez
 */
export const WhatsAppIcon = ({ className }: { className?: string }) => (
    <svg
        viewBox="0 0 24 24"
        className={className}
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .011 5.403 0 12.039c0 2.12.54 4.19 1.565 6.04L0 24l6.109-1.603a11.83 11.83 0 005.934 1.583h.005c6.635 0 12.038-5.405 12.041-12.042a11.815 11.815 0 00-3.676-8.51z" />
    </svg>
);

/**
 * Extrae el número de teléfono limpio desde diferentes formatos
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
    return input.replace(/[^\d]/g, '');
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

    // Construir mensaje dinámico
    let message = 'Hola, quiero más información';
    if (productName) {
        message = `Hola, me interesa el producto: ${productName}`;
    } else if (collectionName) {
        message = `Hola, me interesa la colección: ${collectionName}`;
    }

    // Generar URL wa.me
    const url = phoneNumber
        ? `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
        : '#';

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
            // Silenciar
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
                className={`fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-full p-4 shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 premium-shadow ${className}`}
                aria-label="Contactar por WhatsApp"
            >
                <WhatsAppIcon className="h-10 w-10" />
            </a>
        );
    }

    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClick}
            className={`
                inline-flex items-center justify-center gap-4 bg-[#25D366] hover:bg-[#128C7E] text-white 
                font-black rounded-[2rem] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] 
                shadow-2xl hover:shadow-[#25D366]/20 premium-shadow text-center leading-tight
                ${variant === 'large' ? 'w-full py-7 px-8 text-2xl md:text-3xl lg:text-4xl' : 'py-5 px-10 text-xl md:text-2xl'}
                ${className}
            `}
        >
            <WhatsAppIcon className={`${variant === 'large' ? 'h-10 w-10 md:h-12 md:w-12' : 'h-7 w-7'} flex-shrink-0`} />
            <span className="flex-1">{text}</span>
        </a>
    );
}

