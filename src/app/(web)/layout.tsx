import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function WebLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
