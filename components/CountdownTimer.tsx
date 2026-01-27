'use client';

import { useState, useEffect } from 'react';

interface CountdownTimerProps {
    /** Duración del timer en minutos (se reinicia al entrar) */
    durationMinutes?: number;
    /** Título sobre el contador */
    title?: string;
    /** Subtítulo bajo el contador */
    subtitle?: string;
    /** Color de fondo de las cajas */
    bgColor?: string;
    /** Color del texto */
    textColor?: string;
    /** Mostrar u ocultar el componente */
    show?: boolean;
}

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

export function CountdownTimer({
    durationMinutes = 30,
    title = '⚡ ¡OFERTA POR TIEMPO LIMITADO!',
    subtitle = 'Aprovecha antes de que termine',
    bgColor = '#ef4444',
    textColor = '#ffffff',
    show = true
}: CountdownTimerProps) {
    const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);

        // Obtener o crear fecha de expiración
        const storageKey = 'countdown_expiry';
        let expiryTime = localStorage.getItem(storageKey);

        // Si no existe o ya expiró, reiniciar
        if (!expiryTime || new Date(expiryTime) <= new Date()) {
            const newExpiry = new Date(Date.now() + durationMinutes * 60 * 1000);
            localStorage.setItem(storageKey, newExpiry.toISOString());
            expiryTime = newExpiry.toISOString();
        }

        const calculateTimeLeft = () => {
            const expiry = new Date(expiryTime!);
            const now = new Date();
            const difference = expiry.getTime() - now.getTime();

            if (difference <= 0) {
                // Reiniciar automáticamente
                const newExpiry = new Date(Date.now() + durationMinutes * 60 * 1000);
                localStorage.setItem(storageKey, newExpiry.toISOString());
                expiryTime = newExpiry.toISOString();
                return { days: 0, hours: 0, minutes: durationMinutes, seconds: 0 };
            }

            return {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60)
            };
        };

        setTimeLeft(calculateTimeLeft());
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [durationMinutes]);

    if (!show || !mounted) return null;

    const TimeBox = ({ value, label }: { value: number; label: string }) => (
        <div className="flex flex-col items-center">
            <div
                className="w-16 h-16 md:w-20 md:h-20 rounded-xl flex items-center justify-center text-2xl md:text-4xl font-black shadow-lg animate-pulse-subtle"
                style={{ backgroundColor: bgColor, color: textColor }}
            >
                {String(value).padStart(2, '0')}
            </div>
            <span className="text-xs md:text-sm font-semibold mt-2 uppercase tracking-wider opacity-80">
                {label}
            </span>
        </div>
    );

    return (
        <section className="py-6 px-4 bg-gradient-to-r from-red-600 via-red-500 to-orange-500">
            <div className="container mx-auto max-w-4xl text-center text-white">
                <h3 className="text-xl md:text-2xl font-bold mb-2 animate-bounce">
                    {title}
                </h3>
                <p className="text-sm md:text-base opacity-90 mb-6">{subtitle}</p>

                <div className="flex justify-center gap-3 md:gap-6">
                    {timeLeft.days > 0 && <TimeBox value={timeLeft.days} label="Días" />}
                    <TimeBox value={timeLeft.hours} label="Horas" />
                    <TimeBox value={timeLeft.minutes} label="Min" />
                    <TimeBox value={timeLeft.seconds} label="Seg" />
                </div>
            </div>

            <style jsx>{`
                @keyframes pulse-subtle {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.02); }
                }
                .animate-pulse-subtle {
                    animation: pulse-subtle 1s ease-in-out infinite;
                }
            `}</style>
        </section>
    );
}
