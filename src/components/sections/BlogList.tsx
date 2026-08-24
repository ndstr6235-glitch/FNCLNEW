import { Section, Container, Card } from "@/components/ui";
import AnimateIn from "@/components/ui/AnimateIn";
import Link from "next/link";

interface BlogPost {
  title: string;
  category: string;
  date: string;
  excerpt: string;
  slug: string;
}

interface BlogListProps {
  posts: readonly BlogPost[];
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("cs-CZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function BlogList({ posts }: BlogListProps) {
  return (
    <Section>
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post, i) => (
            <AnimateIn key={post.slug} delay={i * 100}>
              <Card hover className="h-full flex flex-col">
                <div className="aspect-[16/9] bg-gradient-to-br from-neutral-200 to-neutral-300 rounded-lg mb-4" />
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-2.5 py-0.5 bg-accent-100 text-accent-700 text-xs font-medium rounded-full">
                    {post.category}
                  </span>
                  <span className="text-sm text-neutral-400">{formatDate(post.date)}</span>
                </div>
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
      </Container>
    </Section>
  );
}
