import Image from 'next/image';
import { Star } from 'lucide-react';

interface Testimonial {
    name: string;
    role?: string;
    text: string;
    avatar?: string;
    rating?: number;
}

interface TestimonialSectionProps {
    testimonials: Testimonial[];
    title?: string;
    subtitle?: string;
}

export function TestimonialSection({
    testimonials,
    title = 'Lo que dicen nuestros clientes',
    subtitle = 'Miles de clientes satisfechos nos respaldan'
}: TestimonialSectionProps) {
    if (!testimonials || testimonials.length === 0) return null;

    return (
        <section className="py-16 px-4 bg-slate-50">
            <div className="container mx-auto max-w-6xl">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
                        {title}
                    </h2>
                    <p className="text-slate-600">{subtitle}</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {testimonials.map((testimonial, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 hover:shadow-xl transition-shadow"
                        >
                            {/* Rating Stars */}
                            {testimonial.rating && (
                                <div className="flex gap-1 mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`h-5 w-5 ${i < testimonial.rating!
                                                    ? 'text-yellow-400 fill-yellow-400'
                                                    : 'text-slate-200'
                                                }`}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Texto */}
                            <p className="text-slate-600 mb-6 italic">"{testimonial.text}"</p>

                            {/* Autor */}
                            <div className="flex items-center gap-3">
                                {testimonial.avatar ? (
                                    <div className="relative w-12 h-12 rounded-full overflow-hidden">
                                        <Image
                                            src={testimonial.avatar}
                                            alt={testimonial.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                        <span className="text-primary font-bold text-lg">
                                            {testimonial.name.charAt(0)}
                                        </span>
                                    </div>
                                )}
                                <div>
                                    <p className="font-semibold text-slate-900">{testimonial.name}</p>
                                    {testimonial.role && (
                                        <p className="text-sm text-slate-500">{testimonial.role}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
