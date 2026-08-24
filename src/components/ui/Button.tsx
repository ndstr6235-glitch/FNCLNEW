import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-body font-medium transition-all duration-200 rounded-md",
          variant === "primary" &&
            "bg-primary-800 text-white hover:bg-primary-900 active:bg-primary-700",
          variant === "secondary" &&
            "bg-accent-500 text-white hover:bg-accent-600 active:bg-accent-400",
          variant === "outline" &&
            "border-2 border-primary-800 text-primary-800 hover:bg-primary-800 hover:text-white",
          variant === "ghost" && "text-primary-800 hover:bg-primary-50",
          size === "sm" && "px-4 py-2 text-sm",
          size === "md" && "px-6 py-3 text-base",
          size === "lg" && "px-8 py-4 text-lg",
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
export default Button;
