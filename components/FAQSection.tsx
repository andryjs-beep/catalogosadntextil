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
        <section className="py-6 px-4 bg-slate-50">
            <div className="container mx-auto max-w-2xl">
                <div className="text-center mb-4">
                    <h2 className="text-xl md:text-2xl font-bold mb-1 text-slate-900">
                        Preguntas Frecuentes
                    </h2>
                    <p className="text-sm text-slate-500">Todo lo que necesitas saber.</p>
                </div>

                <Accordion type="single" collapsible className="w-full space-y-2">
                    {faqs.map((faq, i) => (
                        <AccordionItem
                            key={i}
                            value={`item-${i}`}
                            className="bg-white px-4 rounded-xl border-none shadow-sm"
                        >
                            <AccordionTrigger className="text-left text-sm font-semibold text-slate-900 hover:no-underline py-3">
                                {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-slate-600 text-sm leading-relaxed pb-3">
                                {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </section>
    );
}
