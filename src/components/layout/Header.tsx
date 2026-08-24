import Link from "next/link";
import { siteConfig } from "@/data/site";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          {siteConfig.name}
        </Link>
        <div className="hidden md:flex gap-6">
          {siteConfig.navigation.main.map((item) => (
            <Link key={item.label} href={item.href} className="text-sm hover:text-primary">
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
