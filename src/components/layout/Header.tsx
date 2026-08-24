import Link from "next/link";
import { siteConfig } from "@/data/site";
import { Logo } from "@/components/ui";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-neutral-200">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        <Logo />
        <div className="hidden md:flex items-center gap-8">
          {siteConfig.navigation.main.map((item) =>
            "children" in item && item.children ? (
              <div key={item.label} className="relative group">
                <button className="text-sm font-medium text-neutral-700 hover:text-primary-800 transition-colors">
                  {item.label}
                </button>
                <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="bg-white rounded-lg shadow-elevated border border-neutral-100 py-2 min-w-[200px]">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block px-4 py-2.5 text-sm text-neutral-700 hover:bg-primary-50 hover:text-primary-800 transition-colors"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <Link
                key={item.label}
                href={item.href}
                className="text-sm font-medium text-neutral-700 hover:text-primary-800 transition-colors"
              >
                {item.label}
              </Link>
            ),
          )}
          <Link
            href="/kontakt"
            className="ml-2 px-5 py-2.5 bg-primary-800 text-white text-sm font-medium rounded-md hover:bg-primary-900 transition-colors"
          >
            Kontaktujte nás
          </Link>
        </div>
      </nav>
    </header>
  );
}
