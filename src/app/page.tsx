import { HeroSection } from '@/components/home/hero-section';
import { WhyChooseUs } from '@/components/home/why-choose-us';
import { ProcessSteps } from '@/components/home/process-steps';
import { AllPets } from '@/components/home/all-pets';
import { TestimonialsCarousel } from '@/components/home/testimonials-carousel';
import { LocationMap } from '@/components/home/location-map';

export default function Home() {
  return (
    <>
      <HeroSection />
      <WhyChooseUs />
      <ProcessSteps />
      <AllPets />
      <TestimonialsCarousel />
      <LocationMap />
    </>
  );
}

    