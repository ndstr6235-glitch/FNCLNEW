import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <p className="text-xl text-gray-600 mt-4">Stránka nebyla nalezena</p>
        <Link
          href="/"
          className="inline-block mt-8 px-6 py-3 bg-primary text-white rounded hover:bg-primary-dark"
        >
          Zpět na hlavní stránku
        </Link>
      </div>
    </div>
  );
}
