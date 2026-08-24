import { cn } from "@/lib/utils";

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  background?: "white" | "light" | "dark" | "primary";
}

export default function Section({ children, className, background = "white" }: SectionProps) {
  return (
    <section
      className={cn(
        "py-16 md:py-24",
        background === "white" && "bg-white",
        background === "light" && "bg-neutral-50",
        background === "dark" && "bg-primary-900 text-white",
        background === "primary" && "bg-primary-800 text-white",
        className,
      )}
    >
      {children}
    </section>
  );
}
