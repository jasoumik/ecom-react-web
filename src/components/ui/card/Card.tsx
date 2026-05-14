import * as React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card: React.FC<CardProps> = ({ className, ...props }) => {
  const base =
    "rounded-3xl border border-slate-100 bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-6 sm:p-8";
  return <div className={`${base} ${className ?? ""}`} {...props} />;
};
