import { siteConfig } from "@/data/site";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <p className="text-lg font-bold">{siteConfig.name}</p>
          <p className="text-sm text-gray-400 mt-2">
            {siteConfig.company.legalName} | IČO: {siteConfig.company.ico}
          </p>
          <p className="text-sm text-gray-400">
            {siteConfig.company.address.street}, {siteConfig.company.address.zip}{" "}
            {siteConfig.company.address.city}
          </p>
          <p className="text-sm text-gray-400 mt-4">
            &copy; {new Date().getFullYear()} {siteConfig.name}. Všechna práva vyhrazena.
          </p>
        </div>
      </div>
    </footer>
  );
}
