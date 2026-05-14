import * as React from "react";

export interface CardGridProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardGrid: React.FC<CardGridProps> = ({ className, ...props }) => {
  const base =
    "grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
  return <div className={`${base} ${className ?? ""}`} {...props} />;
};

