import Link from "next/link";
import { siteConfig } from "@/data/site";
import { Logo } from "@/components/ui";

export default function Footer() {
  return (
    <footer className="bg-primary-900 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Logo & Contact */}
          <div>
            <Logo variant="light" size="lg" />
            <p className="mt-4 text-primary-300 text-sm leading-relaxed">
              {siteConfig.company.legalName}
              <br />
              IČO: {siteConfig.company.ico}
            </p>
            <div className="mt-4 space-y-1 text-sm text-primary-300">
              <p>{siteConfig.company.address.street}</p>
              <p>
                {siteConfig.company.address.zip} {siteConfig.company.address.city}
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-sm font-semibold text-accent-400 uppercase tracking-wider mb-4">
              Navigace
            </h3>
            <ul className="space-y-2">
              {siteConfig.navigation.main.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm text-primary-300 hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-accent-400 uppercase tracking-wider mb-4">
              Kontakt
            </h3>
            <div className="space-y-2 text-sm text-primary-300">
              <p>
                <a href={`mailto:${siteConfig.contact.email}`} className="hover:text-white transition-colors">
                  {siteConfig.contact.email}
                </a>
              </p>
              <p>
                <a href={`tel:${siteConfig.contact.phone.replace(/\s/g, "")}`} className="hover:text-white transition-colors">
                  {siteConfig.contact.phone}
                </a>
              </p>
              <p>{siteConfig.contact.hours}</p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-primary-800 text-center text-sm text-primary-400">
          &copy; {new Date().getFullYear()} {siteConfig.name}. Všechna práva vyhrazena.
        </div>
      </div>
    </footer>
  );
}
