export default function CrmLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold">CRM — Fáze 2</h1>
        <p className="text-gray-500 mt-2">Tato sekce bude dostupná v budoucí verzi.</p>
      </div>
      {children}
    </div>
  );
}
