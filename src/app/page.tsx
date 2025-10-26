
import { AboutSection } from '@/components/landing/about-section';
import { FeaturesSection } from '@/components/landing/features-section';
import { Footer } from '@/components/landing/footer';
import { Header } from '@/components/landing/header';
import { HeroSlider } from '@/components/landing/hero-slider';
import { NoticeBoard } from '@/components/landing/notice-board';
import { Testimonials } from '@/components/landing/testimonials';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1">
        <HeroSlider />
        <FeaturesSection />
        <AboutSection />
        <NoticeBoard />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
}
