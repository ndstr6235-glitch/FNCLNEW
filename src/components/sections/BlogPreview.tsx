import { Section, Container, Heading, Card } from "@/components/ui";
import AnimateIn from "@/components/ui/AnimateIn";
import Link from "next/link";

import { blogPosts as allPosts } from "@/data/blog";

const blogPosts = allPosts.slice(0, 3);

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
          <Heading subtitle="Ze světa nemovitostí a investic">Blog</Heading>
        </AnimateIn>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {blogPosts.map((post, i) => (
            <AnimateIn key={post.slug} delay={i * 100}>
              <Card hover className="h-full flex flex-col">
                <div className="aspect-[16/9] bg-gradient-to-br from-primary-100 via-primary-50 to-accent-50 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-xs uppercase tracking-wider text-primary-400 font-medium">{post.category}</span>
                </div>
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
