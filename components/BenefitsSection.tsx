import { Shield, Truck, Star, Zap, Award, CheckCircle, Heart, Sparkles, LucideIcon } from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
    shield: Shield,
    truck: Truck,
    star: Star,
    zap: Zap,
    award: Award,
    'check-circle': CheckCircle,
    heart: Heart,
    sparkles: Sparkles,
};

interface BenefitsSectionProps {
    benefits: Array<{
        icon: string;
        title: string;
        description: string;
    }>;
}

export function BenefitsSection({ benefits }: BenefitsSectionProps) {
    if (!benefits || benefits.length === 0) return null;

    return (
        <section className="py-6 px-4 bg-white">
            <div className="container mx-auto max-w-6xl">
                <div className="text-center mb-4">
                    <h2 className="text-xl md:text-2xl font-bold mb-2 text-slate-900">
                        ¿Por Qué Elegirnos?
                    </h2>
                    <div className="w-12 h-0.5 bg-primary mx-auto rounded-full" />
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {benefits.map((benefit, i) => {
                        const Icon = iconMap[benefit.icon] || Star;
                        return (
                            <div
                                key={i}
                                className="text-center p-3 rounded-xl hover:bg-slate-50 transition-all"
                            >
                                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                                    <Icon className="w-5 h-5 text-primary" />
                                </div>
                                <h3 className="text-sm font-bold text-slate-900 mb-1">{benefit.title}</h3>
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    {benefit.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
