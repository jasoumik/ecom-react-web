import * as React from "react";

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  variant?: "default" | "muted" | "highlight" | "blue";
}

export const Section: React.FC<SectionProps> = ({
  variant = "default",
  className,
  children,
  ...props
}) => {
  const base =
    "w-full px-4 py-5 sm:px-6 lg:px-8 flex justify-center";
  const inner =
    "w-full max-w-7xl"; // Increased max-width for more breathing room

  const getVariantClass = () => {
    switch (variant) {
      case "muted":
        return "bg-slate-50/50 dark:bg-slate-900/50";
      case "highlight":
        return "bg-gradient-to-br from-rose-50/50 via-white to-sky-50/50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900";
      case "blue":
        return "bg-sky-50 dark:bg-sky-900/30";
      default:
        return "bg-transparent";
    }
  };

  return (
    <section className={`${base} ${getVariantClass()} ${className ?? ""}`} {...props}>
      <div className={inner}>{children}</div>
    </section>
  );
};
