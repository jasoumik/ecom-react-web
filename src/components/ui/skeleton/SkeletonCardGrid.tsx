import * as React from "react";
import { Skeleton } from "./Skeleton";

export interface SkeletonCardGridProps {
  count?: number;
}

export const SkeletonCardGrid: React.FC<SkeletonCardGridProps> = ({ count = 3 }) => {
  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-40" />
      ))}
    </div>
  );
};

