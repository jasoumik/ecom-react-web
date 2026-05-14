import * as React from "react";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Skeleton: React.FC<SkeletonProps> = ({ className, ...props }) => {
  const base = "animate-pulse rounded-xl bg-slate-200/80";
  return <div className={`${base} ${className ?? ""}`} {...props} />;
};

