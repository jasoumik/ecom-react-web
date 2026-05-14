import * as React from "react";
import { Skeleton } from "./Skeleton";

export interface SkeletonTextProps {
  lines?: number;
}

export const SkeletonText: React.FC<SkeletonTextProps> = ({ lines = 3 }) => {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className="h-3 w-full" />
      ))}
    </div>
  );
};
