import Link from "next/link";

interface LogoProps {
  variant?: "light" | "dark";
  size?: "sm" | "md" | "lg";
}

export default function Logo({ variant = "dark", size = "md" }: LogoProps) {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  const colorClasses = {
    dark: "text-primary-900",
    light: "text-white",
  };

  return (
    <Link
      href="/"
      className={`font-heading font-bold tracking-tight outline-none focus:outline-none focus-visible:outline-none ${sizeClasses[size]} ${colorClasses[variant]}`}
    >
      Puskin <span className="text-accent-500">&amp;</span> Partners
    </Link>
  );
}
