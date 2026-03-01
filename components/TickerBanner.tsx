'use client';

import { useEffect, useRef } from 'react';

interface TickerBannerProps {
    text: string;
    bgColor?: string;
    textColor?: string;
    speed?: 'slow' | 'normal' | 'fast';
    direction?: 'left' | 'right';
    enabled?: boolean;
}

export function TickerBanner({
    text,
    bgColor = '#000000',
    textColor = '#ffffff',
    speed = 'normal',
    direction = 'left',
    enabled = true
}: TickerBannerProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    if (!enabled || !text) return null;

    // Velocidades en pixeles por segundo
    const speedMap = {
        slow: 30,
        normal: 60,
        fast: 100
    };

    const pixelsPerSecond = speedMap[speed] || speedMap.normal;

    // Repetir el texto para crear efecto infinito
    const repeatedText = `${text}  •  `.repeat(15);

    // Calcular duración basada en el ancho del contenido
    // Estimamos ~8px por carácter en promedio
    const contentWidth = repeatedText.length * 8;
    const duration = contentWidth / pixelsPerSecond;

    const animationStyle = {
        animation: `ticker-scroll ${duration}s linear infinite`,
        animationDirection: direction === 'right' ? 'reverse' : 'normal',
    };

    return (
        <>
            <style>{`
                @keyframes ticker-scroll {
                    0% {
                        transform: translateX(0);
                    }
                    100% {
                        transform: translateX(-50%);
                    }
                }
            `}</style>
            <div
                ref={containerRef}
                className="w-full overflow-hidden py-2.5 relative z-50 ticker-container"
                style={{ backgroundColor: 'var(--color-ticker-bg)' }}
            >
                <div
                    className="whitespace-nowrap inline-flex"
                    style={{
                        ...animationStyle,
                        color: 'var(--color-ticker-text)',
                    }}
                >
                    <span className="inline-block text-sm font-medium tracking-wide px-4">
                        {repeatedText}
                    </span>
                    <span className="inline-block text-sm font-medium tracking-wide px-4">
                        {repeatedText}
                    </span>
                </div>
            </div>
        </>
    );
}
