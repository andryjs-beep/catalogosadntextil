import { Shield, Truck, Star, Zap, Award, CheckCircle, Heart, Sparkles, LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

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
        <section className="py-10 px-4 bg-white">
            <div className="container mx-auto max-w-7xl">
                <div className="text-center mb-8">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4 text-slate-900">
                        ¿Por Qué Elegirnos?
                    </h2>
                    <div className="w-20 h-1 bg-primary mx-auto rounded-full" />
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {benefits.map((benefit, i) => {
                        const Icon = iconMap[benefit.icon] || Star;
                        return (
                            <Card
                                key={i}
                                className="border-none shadow-none hover:shadow-xl transition-all duration-300 group rounded-2xl p-2"
                            >
                                <CardContent className="pt-8 text-center space-y-4">
                                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                                        <Icon className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900">{benefit.title}</h3>
                                    <p className="text-slate-600 leading-relaxed">
                                        {benefit.description}
                                    </p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
