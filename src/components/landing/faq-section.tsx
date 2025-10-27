
'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useLandingPageContent } from '@/hooks/use-settings';

export function FaqSection() {
  const content = useLandingPageContent();
  const section = content.getSection('faq');

  if (!section) return null;

  const faqs = Array.from({ length: 6 }, (_, i) => ({
    question: content.getElement(`faq${i + 1}Question`)?.text,
    answer: content.getElement(`faq${i + 1}Answer`)?.text,
  }));
  
  const title = content.getElement('faqTitle');

  return (
    <section className="container py-12 md:py-24">
      <div className="mb-12 text-center" style={{ textAlign: title?.style?.textAlign || 'center' }}>
        <h2 className="text-3xl font-bold md:text-4xl">
            {title?.text.split(' ').map((word, i) => 
                word.toLowerCase() === 'question' ? <span key={i} className="text-orange-500">Question </span> : `${word} `
            )}
        </h2>
      </div>
      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 md:grid-cols-2">
        {faqs.map((faq, index) => faq.question && (
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
