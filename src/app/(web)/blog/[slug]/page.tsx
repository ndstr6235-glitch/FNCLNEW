import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Section, Container } from "@/components/ui";
import AnimateIn from "@/components/ui/AnimateIn";
import Newsletter from "@/components/sections/Newsletter";
import { blogPosts } from "@/data/blog";

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
  };
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("cs-CZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) notFound();

  return (
    <>
      <Section>
        <Container size="sm">
          <AnimateIn>
            <Link
              href="/blog"
              className="text-accent-600 font-medium hover:text-accent-700 transition-colors"
            >
              &larr; Zpět na blog
            </Link>
            <div className="mt-6 mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-2.5 py-0.5 bg-accent-100 text-accent-700 text-xs font-medium rounded-full">
                  {post.category}
                </span>
                <span className="text-sm text-neutral-400">{formatDate(post.date)}</span>
              </div>
              <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-primary-900 leading-tight">
                {post.title}
              </h1>
            </div>
            <div className="aspect-[21/9] bg-gradient-to-br from-primary-100 via-primary-50 to-accent-50 rounded-xl mb-10 flex items-center justify-center">
              <span className="text-sm uppercase tracking-wider text-primary-300 font-medium">{post.category}</span>
            </div>
            <div className="max-w-none">
              {post.content.map((paragraph, i) => (
                <p key={i} className="text-neutral-700 text-lg leading-relaxed mb-6">
                  {paragraph}
                </p>
              ))}
            </div>
            {/* Back link */}
            <div className="mt-12 pt-8 border-t border-neutral-200">
              <Link
                href="/blog"
                className="text-accent-600 font-medium hover:text-accent-700 transition-colors"
              >
                &larr; Zpět na všechny články
              </Link>
            </div>
          </AnimateIn>
        </Container>
      </Section>
      <Newsletter />
    </>
  );
}
