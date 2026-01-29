'use client';

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
    if (!enabled || !text) return null;

    // Velocidades de animación
    const speedMap = {
        slow: '40s',
        normal: '25s',
        fast: '15s'
    };

    const animationDuration = speedMap[speed] || speedMap.normal;
    const animationDirection = direction === 'right' ? 'reverse' : 'normal';

    // Repetir el texto para crear efecto infinito
    const repeatedText = `${text}  •  `.repeat(10);

    return (
        <div
            className="w-full overflow-hidden py-2 relative"
            style={{ backgroundColor: bgColor }}
        >
            <div
                className="whitespace-nowrap inline-block animate-ticker"
                style={{
                    color: textColor,
                    animationDuration,
                    animationDirection,
                }}
            >
                <span className="inline-block text-sm font-medium tracking-wide">
                    {repeatedText}
                </span>
                <span className="inline-block text-sm font-medium tracking-wide">
                    {repeatedText}
                </span>
            </div>

            <style jsx>{`
                @keyframes ticker {
                    0% {
                        transform: translateX(0);
                    }
                    100% {
                        transform: translateX(-50%);
                    }
                }
                .animate-ticker {
                    animation-name: ticker;
                    animation-timing-function: linear;
                    animation-iteration-count: infinite;
                }
            `}</style>
        </div>
    );
}
