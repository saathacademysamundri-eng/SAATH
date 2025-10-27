
import { BenefitsSection } from '@/components/landing/benefits-section';
import { CtaSection } from '@/components/landing/cta-section';
import { FaqSection } from '@/components/landing/faq-section';
import { Footer } from '@/components/landing/footer';
import { Header } from '@/components/landing/header';
import { HeroSection } from '@/components/landing/hero-section';
import { NewsletterSection } from '@/components/landing/newsletter-section';
import { OptionsSection } from '@/components/landing/options-section';
import { TeachingServices } from '@/components/landing/teaching-services';
import { Testimonials } from '@/components/landing/testimonials';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <TeachingServices />
        <BenefitsSection />
        <OptionsSection />
        <Testimonials />
        <FaqSection />
        <CtaSection />
        <NewsletterSection />
      </main>
      <Footer />
    </div>
  );
}
