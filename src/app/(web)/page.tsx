import Hero from "@/components/sections/Hero";
import Services from "@/components/sections/Services";
import AboutPreview from "@/components/sections/AboutPreview";
import Stats from "@/components/sections/Stats";
import FeaturedProject from "@/components/sections/FeaturedProject";
import Testimonials from "@/components/sections/Testimonials";
import BlogPreview from "@/components/sections/BlogPreview";
import Newsletter from "@/components/sections/Newsletter";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Services />
      <AboutPreview />
      <Stats />
      <FeaturedProject />
      <Testimonials />
      <BlogPreview />
      <Newsletter />
    </>
  );
}
