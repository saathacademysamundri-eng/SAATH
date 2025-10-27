'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'What types of courses are available?',
    answer:
      'We offer a wide range of courses, from performance-based skills to personal development and future-focused learning.',
  },
  {
    question: 'How do I track my progress in a course?',
    answer:
      'You can track your progress through your student dashboard, which shows completed lessons, grades, and feedback from instructors.',
  },
  {
    question: 'How do I sign up for courses?',
    answer:
      'You can sign up for courses directly through our website. Simply browse our course catalog and click the "Enroll Now" button on the course page.',
  },
  {
    question: 'Can I get a certificate after completing a course?',
    answer: 'Yes, upon successful completion of any course, you will receive a verifiable digital certificate to showcase your achievement.',
  },
  {
    question: 'What types of courses are available?',
    answer:
      'We offer a wide range of courses, from performance-based skills to personal development and future-focused learning.',
  },
  {
    question: 'Can I access the platform on mobile?',
    answer: 'Absolutely! Our platform is fully responsive and works seamlessly on desktops, tablets, and mobile devices for learning on the go.',
  },
];

export function FaqSection() {
  return (
    <section className="container py-12 md:py-24">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-bold md:text-4xl">
          General <span className="text-primary">Question</span>
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
