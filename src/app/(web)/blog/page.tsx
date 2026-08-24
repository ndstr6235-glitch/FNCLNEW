import type { Metadata } from "next";
import PageHero from "@/components/sections/PageHero";
import BlogList from "@/components/sections/BlogList";
import Newsletter from "@/components/sections/Newsletter";
import { blogPosts } from "@/data/blog";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Články o nemovitostech, investicích, designu a stavebnictví od Puskin and Partners.",
};

export default function BlogPage() {
  return (
    <>
      <PageHero
        title="Blog"
        subtitle="Novinky, tipy a trendy ze světa nemovitostí"
      />
      <BlogList posts={blogPosts} />
      <Newsletter />
    </>
  );
}
