import { cn } from "@/lib/utils";

interface HeadingProps {
  children: React.ReactNode;
  as?: "h1" | "h2" | "h3" | "h4";
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  subtitle?: string;
}

export default function Heading({
  children,
  as: Tag = "h2",
  size = "lg",
  className,
  subtitle,
}: HeadingProps) {
  return (
    <div className="mb-8 md:mb-12">
      <Tag
        className={cn(
          "font-heading font-bold text-primary-900",
          size === "sm" && "text-xl md:text-2xl",
          size === "md" && "text-2xl md:text-3xl",
          size === "lg" && "text-3xl md:text-4xl",
          size === "xl" && "text-4xl md:text-5xl",
          size === "2xl" && "text-5xl md:text-6xl lg:text-7xl",
          className,
        )}
      >
        {children}
      </Tag>
      {subtitle && <p className="mt-4 text-lg text-neutral-500 max-w-2xl">{subtitle}</p>}
    </div>
  );
}
