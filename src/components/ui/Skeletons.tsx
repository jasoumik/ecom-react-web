"use client";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`skeleton-shimmer rounded ${className}`}
      aria-hidden="true"
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="aspect-square bg-[#E6F4FF] rounded-2xl skeleton-shimmer" />
      <div className="space-y-2 p-2">
        <div className="h-4 bg-[#E6F4FF] rounded w-3/4 skeleton-shimmer" />
        <div className="h-4 bg-[#E6F4FF] rounded w-1/2 skeleton-shimmer" />
        <div className="h-6 bg-[#E6F4FF] rounded w-1/3 skeleton-shimmer" />
        <div className="h-10 bg-[#E6F4FF] rounded skeleton-shimmer" />
      </div>
    </div>
  );
}

export function CategorySkeleton() {
  return (
    <div className="flex flex-col items-center gap-2 animate-pulse">
      <div className="w-20 h-20 sm:w-28 sm:h-28 bg-[#E6F4FF] rounded-full skeleton-shimmer" />
      <div className="h-3 bg-[#E6F4FF] rounded w-16 skeleton-shimmer" />
    </div>
  );
}

export function AgeTimelineSkeleton() {
  return (
    <div className="flex gap-4 animate-pulse overflow-hidden">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="w-24 h-24 bg-[#E6F4FF] rounded-full flex-shrink-0 skeleton-shimmer" />
      ))}
    </div>
  );
}

export function BannerSkeleton() {
  return (
    <div className="w-full h-[300px] sm:h-[400px] lg:h-[500px] bg-[#E6F4FF] skeleton-shimmer" />
  );
}

export function ProductGridSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {[...Array(count)].map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function CategoryGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="flex gap-4 overflow-hidden">
      {[...Array(count)].map((_, i) => (
        <CategorySkeleton key={i} />
      ))}
    </div>
  );
}

export function TestimonialSkeleton() {
  return (
    <div className="bg-[#E6F4FF]/50 p-6 rounded-xl animate-pulse">
      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="w-4 h-4 bg-[#E6F4FF] rounded skeleton-shimmer" />
        ))}
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-[#E6F4FF] rounded skeleton-shimmer" />
        <div className="h-4 bg-[#E6F4FF] rounded w-3/4 skeleton-shimmer" />
      </div>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[#E6F4FF] rounded-full skeleton-shimmer" />
        <div className="space-y-2">
          <div className="h-3 bg-[#E6F4FF] rounded w-20 skeleton-shimmer" />
          <div className="h-2 bg-[#E6F4FF] rounded w-16 skeleton-shimmer" />
        </div>
      </div>
    </div>
  );
}

