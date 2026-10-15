import { Star, ShieldCheck } from 'lucide-react';

export interface TestimonialItem {
    name: string;
    city: string;
    text: string;
    rating: number;
    verified: boolean;
}

export interface CustomerReviewsSectionProps {
    title?: string;
    score?: string;
    totalReviewsText?: string;
    items?: TestimonialItem[];
    className?: string;
}

export function CustomerReviewsSection({
    title = 'Clientes felices en toda Venezuela',
    score = '4.8',
    totalReviewsText = '+189 reseñas verificadas',
    items = [],
    className = ''
}: CustomerReviewsSectionProps) {
    if (!items || items.length === 0) return null;

    const parsedScore = parseFloat(score) || 4.8;
    const fullStars = Math.floor(parsedScore);

    return (
        <section className={`py-14 md:py-20 px-4 bg-slate-50/60 border-t border-slate-100 ${className}`}>
            <div className="container mx-auto max-w-6xl">
                {/* Header Superior idéntico a la referencia */}
                <div className="mb-10">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 mb-3">
                        <div className="flex items-center gap-3">
                            <span className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                                {score}
                            </span>
                            <div className="flex flex-col">
                                <div className="flex text-amber-400 gap-0.5">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`h-4 w-4 md:h-5 md:w-5 ${
                                                i < fullStars 
                                                    ? 'fill-amber-400 text-amber-400' 
                                                    : 'text-slate-300 fill-slate-200'
                                            }`}
                                        />
                                    ))}
                                </div>
                                <span className="text-xs md:text-sm font-semibold text-slate-400 mt-0.5">
                                    {totalReviewsText}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Barra de progreso de reputación */}
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mb-6">
                        <div 
                            className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
                            style={{ width: `${Math.min(100, (parsedScore / 5) * 100)}%` }}
                        />
                    </div>

                    {/* Título de la sección */}
                    <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                        {title}
                    </h2>
                </div>

                {/* Grid de Reseñas */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {items.map((item, idx) => {
                        const initial = (item.name || 'C').charAt(0).toUpperCase();
                        // Colores sutiles de fondo para los avatares
                        const avatarColors = [
                            'bg-emerald-50 text-emerald-600 border-emerald-200',
                            'bg-blue-50 text-blue-600 border-blue-200',
                            'bg-purple-50 text-purple-600 border-purple-200',
                            'bg-amber-50 text-amber-600 border-amber-200',
                            'bg-rose-50 text-rose-600 border-rose-200',
                            'bg-indigo-50 text-indigo-600 border-indigo-200',
                        ];
                        const avatarStyle = avatarColors[idx % avatarColors.length];

                        return (
                            <div
                                key={idx}
                                className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow relative"
                            >
                                <div>
                                    {/* Estrellas y Badge de Verificado */}
                                    <div className="flex items-center justify-between gap-2 mb-4">
                                        <div className="flex text-amber-400 gap-0.5">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`h-3.5 w-3.5 ${
                                                        i < (item.rating || 5)
                                                            ? 'fill-amber-400 text-amber-400'
                                                            : 'text-slate-200 fill-slate-100'
                                                    }`}
                                                />
                                            ))}
                                        </div>

                                        {item.verified !== false && (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                                                <ShieldCheck className="h-3 w-3 text-emerald-600" />
                                                Comprador verificado
                                            </span>
                                        )}
                                    </div>

                                    {/* Comentario del cliente */}
                                    <p className="text-slate-700 text-sm leading-relaxed mb-6 font-normal">
                                        "{item.text}"
                                    </p>
                                </div>

                                {/* Autor y Ciudad de Venezuela */}
                                <div className="flex items-center gap-3 pt-4 border-t border-slate-50">
                                    <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs ${avatarStyle}`}>
                                        {initial}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                                        <span className="font-bold text-slate-900">{item.name}</span>
                                        <span>·</span>
                                        <span>{item.city}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
