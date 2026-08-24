import Link from "next/link";
import { Container } from "@/components/ui";

const offers = [
  { label: "Investice — zhodnocení až 15 % ročně p.a.", href: "/sluzby/investice" },
  { label: "Rekonstrukce od 9 500 Kč/m² s DPH", href: "/sluzby/rekonstrukce" },
  { label: "Stavba od 29 500 Kč/m² s DPH", href: "/sluzby/development" },
  { label: "Vlastní apartmán již od 490 000 Kč", href: "/sluzby/investice" },
];

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center bg-primary-900">
      {/* Background gradient (placeholder for image) */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700">
        <div className="absolute inset-0 bg-primary-900/40" />
      </div>
      <Container className="relative z-10 text-white">
        <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl font-bold max-w-4xl leading-tight">
          S námi roste{" "}
          <span className="text-accent-400">hodnota</span>
        </h1>
        <p className="mt-6 text-lg md:text-xl text-primary-200 max-w-2xl">
          Stavíme od roku 2004. Od roku 2023 spojujeme více než 20 let stavebních
          zkušeností s investičními příležitostmi v pražských nemovitostech.
        </p>
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
          {offers.map((offer) => (
            <Link
              key={offer.href + offer.label}
              href={offer.href}
              className="flex items-center gap-3 px-5 py-3.5 bg-white/10 border border-white/20 rounded-lg text-sm font-medium text-white hover:bg-white/20 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-accent-400 shrink-0" />
              {offer.label}
            </Link>
          ))}
        </div>
        <div className="mt-8">
          <Link
            href="/kontakt"
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium bg-accent-500 text-white rounded-md hover:bg-accent-600 transition-colors"
          >
            Nezávazná konzultace
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
