import { Section, Container, Heading, Card } from "@/components/ui";
import AnimateIn from "@/components/ui/AnimateIn";
import Link from "next/link";

const blogPosts = [
  {
    title: "Jak investovat do nemovitostí v roce 2026",
    excerpt: "Přehled aktuálních trendů a příležitostí na pražském realitním trhu.",
    date: "2026-08-15",
    slug: "jak-investovat-do-nemovitosti-2026",
  },
  {
    title: "5 kroků k úspěšné rekonstrukci",
    excerpt: "Kompletní průvodce rekonstrukcí od plánování po předání hotového projektu.",
    date: "2026-08-01",
    slug: "5-kroku-k-uspesne-rekonstrukci",
  },
  {
    title: "Proč investovat do Prahy?",
    excerpt: "Praha jako jedno z nejatraktivnějších měst pro investice do nemovitostí.",
    date: "2026-07-20",
    slug: "proc-investovat-do-prahy",
  },
];

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("cs-CZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function BlogPreview() {
  return (
    <Section background="light">
      <Container>
        <AnimateIn>
          <Heading subtitle="Novinky ze světa nemovitostí a investic">Z našeho blogu</Heading>
        </AnimateIn>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {blogPosts.map((post, i) => (
            <AnimateIn key={post.slug} delay={i * 100}>
              <Card hover className="h-full flex flex-col">
                {/* Placeholder image */}
                <div className="aspect-[16/9] bg-gradient-to-br from-neutral-200 to-neutral-300 rounded-lg mb-4" />
                <p className="text-sm text-neutral-400 mb-2">{formatDate(post.date)}</p>
                <h3 className="font-heading text-lg font-bold text-primary-900 mb-2">
                  {post.title}
                </h3>
                <p className="text-neutral-500 text-sm flex-1 mb-4">{post.excerpt}</p>
                <Link
                  href={`/blog/${post.slug}`}
                  className="text-accent-600 font-medium text-sm hover:text-accent-700 transition-colors"
                >
                  Číst více &rarr;
                </Link>
              </Card>
            </AnimateIn>
          ))}
        </div>
        <AnimateIn delay={400}>
          <div className="text-center mt-12">
            <Link
              href="/blog"
              className="inline-flex items-center justify-center px-6 py-3 border-2 border-primary-800 text-primary-800 font-medium rounded-md hover:bg-primary-800 hover:text-white transition-colors"
            >
              Všechny články &rarr;
            </Link>
          </div>
        </AnimateIn>
      </Container>
    </Section>
  );
}
