import Hero from "@/components/sections/Hero";
import Services from "@/components/sections/Services";
import AboutPreview from "@/components/sections/AboutPreview";
import Stats from "@/components/sections/Stats";
import TeamGrid from "@/components/sections/TeamGrid";
import FeaturedProject from "@/components/sections/FeaturedProject";
import Testimonials from "@/components/sections/Testimonials";
import BlogPreview from "@/components/sections/BlogPreview";
import Newsletter from "@/components/sections/Newsletter";
import CTASection from "@/components/sections/CTASection";
import { team } from "@/data/team";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Services />
      <AboutPreview />
      <Stats />
      <TeamGrid team={team} />
      <FeaturedProject />
      <Testimonials />
      <BlogPreview />
      <CTASection
        title="Nezávazná konzultace"
        description="Bez jakýchkoliv závazků Vám poskytneme individuální poradenství a podporu, abychom Vám pomohli realizovat Vaše budoucí plány."
        primaryLabel="Kontaktujte nás"
        primaryHref="/kontakt"
        phone
      />
      <Newsletter />
    </>
  );
}
