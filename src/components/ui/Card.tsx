import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({ children, className, hover = false }: CardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-xl p-6 shadow-card",
        hover && "transition-all duration-300 hover:shadow-elevated hover:-translate-y-1",
        className,
      )}
    >
      {children}
    </div>
  );
}
