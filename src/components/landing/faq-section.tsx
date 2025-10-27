
'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useSettings } from '@/hooks/use-settings';

export function FaqSection() {
  const { settings } = useSettings();
  const faqs = [
    { question: settings.faq1Question, answer: settings.faq1Answer },
    { question: settings.faq2Question, answer: settings.faq2Answer },
    { question: settings.faq3Question, answer: settings.faq3Answer },
    { question: settings.faq4Question, answer: settings.faq4Answer },
    { question: settings.faq5Question, answer: settings.faq5Answer },
    { question: settings.faq6Question, answer: settings.faq6Answer },
  ];

  return (
    <section className="container py-12 md:py-24">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-bold md:text-4xl">
            {settings.faqTitle.split(' ').map((word, i) => 
                word.toLowerCase() === 'question' ? <span key={i} className="text-orange-500">Question </span> : `${word} `
            )}
        </h2>
      </div>
      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 md:grid-cols-2">
        {faqs.map((faq, index) => (
          <Accordion key={index} type="single" collapsible>
            <AccordionItem value={`item-${index}`} className="rounded-lg border border-green-200 bg-green-50 px-4 dark:bg-green-900/20 dark:border-green-800">
              <AccordionTrigger className="text-left font-semibold">{faq.question}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
            </AccordionItem>
          </Accordion>
        ))}
      </div>
    </section>
  );
}
