import * as React from "react";

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: "h1" | "h2" | "h3" | "h4";
  size?: "xl" | "lg" | "md" | "sm";
}

const sizeClasses: Record<NonNullable<HeadingProps["size"]>, string> = {
  xl: "text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1]",
  lg: "text-3xl sm:text-4xl font-bold tracking-tight",
  md: "text-2xl font-bold tracking-tight",
  sm: "text-xl font-bold tracking-tight",
};

export const Heading: React.FC<HeadingProps> = ({
  as: Tag = "h2",
  size = "lg",
  className,
  ...props
}) => {
  return (
    <Tag
      className={`${sizeClasses[size]} text-slate-900 ${
        className ?? ""
      }`}
      {...props}
    />
  );
};
