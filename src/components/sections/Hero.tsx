import Link from "next/link";
import { Container } from "@/components/ui";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center bg-primary-900">
      {/* Background gradient (placeholder for image) */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700">
        <div className="absolute inset-0 bg-primary-900/40" />
      </div>
      <Container className="relative z-10 text-white">
        <p className="text-accent-400 font-medium uppercase tracking-widest text-sm mb-4">
          Praha &bull; Stavby &bull; Reality &bull; Investice
        </p>
        <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl font-bold max-w-4xl leading-tight">
          20 let stavíme,{" "}
          <span className="text-accent-400">teď i investujeme</span>
        </h1>
        <p className="mt-6 text-lg md:text-xl text-primary-200 max-w-2xl">
          Stavíme od roku 2004. Od roku 2023 spojujeme stavební know-how
          s investičními příležitostmi v pražských nemovitostech.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/sluzby/development"
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium bg-accent-500 text-white rounded-md hover:bg-accent-600 transition-colors"
          >
            Naše služby
          </Link>
          <Link
            href="/kontakt"
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium border-2 border-white text-white rounded-md hover:bg-white hover:text-primary-900 transition-colors"
          >
            Kontaktujte nás
          </Link>
        </div>
      </Container>
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg className="w-6 h-6 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7" />
        </svg>
      </div>
    </section>
  );
}
