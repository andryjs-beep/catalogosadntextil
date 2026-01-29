import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';

interface FAQSectionProps {
    faqs: Array<{
        question: string;
        answer: string;
    }>;
}

export function FAQSection({ faqs }: FAQSectionProps) {
    if (!faqs || faqs.length === 0) return null;

    return (
        <section className="py-10 px-4 bg-slate-50">
            <div className="container mx-auto max-w-3xl">
                <div className="text-center mb-6">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4 text-slate-900">
                        Preguntas Frecuentes
                    </h2>
                    <p className="text-slate-600">Todo lo que necesitas saber para comprar con confianza.</p>
                </div>

                <Accordion type="single" collapsible className="w-full space-y-4">
                    {faqs.map((faq, i) => (
                        <AccordionItem
                            key={i}
                            value={`item-${i}`}
                            className="bg-white px-6 rounded-2xl border-none shadow-sm data-[state=open]:shadow-md transition-all duration-300"
                        >
                            <AccordionTrigger className="text-left text-lg font-bold text-slate-900 hover:no-underline py-6">
                                {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-slate-600 text-base leading-relaxed pb-6">
                                {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </section>
    );
}
