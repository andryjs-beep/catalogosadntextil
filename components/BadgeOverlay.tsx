'use client';

interface BadgeOverlayProps {
    type: 'bestseller' | 'new' | 'sale' | 'limited' | 'exclusive' | 'custom';
    text?: string;
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    discount?: number; // Para type='sale'
}

const badgeStyles = {
    bestseller: {
        bg: 'bg-gradient-to-r from-yellow-400 to-orange-500',
        text: '🏆 Más Vendido',
        textColor: 'text-white'
    },
    new: {
        bg: 'bg-gradient-to-r from-green-400 to-emerald-500',
        text: '✨ Nuevo',
        textColor: 'text-white'
    },
    sale: {
        bg: 'bg-gradient-to-r from-red-500 to-pink-500',
        text: '🔥 Oferta',
        textColor: 'text-white'
    },
    limited: {
        bg: 'bg-gradient-to-r from-purple-500 to-indigo-500',
        text: '⏰ Edición Limitada',
        textColor: 'text-white'
    },
    exclusive: {
        bg: 'bg-gradient-to-r from-slate-800 to-slate-900',
        text: '⭐ Exclusivo',
        textColor: 'text-white'
    },
    custom: {
        bg: 'bg-primary',
        text: '',
        textColor: 'text-white'
    }
};

const positionClasses = {
    'top-left': 'top-3 left-3',
    'top-right': 'top-3 right-3',
    'bottom-left': 'bottom-3 left-3',
    'bottom-right': 'bottom-3 right-3'
};

export function BadgeOverlay({
    type,
    text,
    position = 'top-left',
    discount
}: BadgeOverlayProps) {
    const style = badgeStyles[type];
    const displayText = type === 'sale' && discount
        ? `🔥 -${discount}%`
        : text || style.text;

    return (
        <div
            className={`
                absolute ${positionClasses[position]} z-10
                ${style.bg} ${style.textColor}
                px-3 py-1.5 rounded-full
                text-xs font-bold uppercase tracking-wide
                shadow-lg animate-pulse-subtle
            `}
        >
            {displayText}

            <style jsx>{`
                @keyframes pulse-subtle {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }
                .animate-pulse-subtle {
                    animation: pulse-subtle 2s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}
