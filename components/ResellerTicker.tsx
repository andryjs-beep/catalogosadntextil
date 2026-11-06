'use client';

import { useMemo } from 'react';

interface ResellerTickerProps {
    enabled?: boolean;
    text?: string;
    bgColor?: string;
    textColor?: string;
    speed?: 'slow' | 'normal' | 'fast';
    direction?: 'left' | 'right';
}

export function ResellerTicker({
    enabled = false,
    text = '',
    bgColor = '#0f172a',
    textColor = '#ffffff',
    speed = 'normal',
    direction = 'left',
}: ResellerTickerProps) {
    if (!enabled || !text || !text.trim()) return null;

    // Velocidad de desplazamiento
    const speedSeconds = {
        slow: 40,
        normal: 22,
        fast: 12,
    }[speed] || 22;

    const animDirection = direction === 'right' ? 'reverse' : 'normal';

    return (
        <div
            className="w-full overflow-hidden py-2 border-y border-white/10 relative z-30 shadow-xs"
            style={{ backgroundColor: bgColor, color: textColor }}
        >
            <style>{`
                @keyframes reseller-marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .reseller-marquee-track {
                    display: inline-flex;
                    white-space: nowrap;
                    will-change: transform;
                    animation: reseller-marquee ${speedSeconds}s linear infinite ${animDirection};
                }
                .reseller-marquee-track:hover {
                    animation-play-state: paused;
                }
            `}</style>

            <div className="reseller-marquee-track">
                {/* 4 repeticiones para garantizar un ciclo infinito continuo sin saltos */}
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="inline-flex items-center gap-6 px-4">
                        <span className="text-xs md:text-sm font-black tracking-wider uppercase">
                            {text}
                        </span>
                        <span className="opacity-40 text-xs">✦</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
