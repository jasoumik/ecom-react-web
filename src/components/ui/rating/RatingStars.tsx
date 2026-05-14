import * as React from "react";

export interface RatingStarsProps {
  rating: number; // 0-5
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const RatingStars: React.FC<RatingStarsProps> = ({ rating, size = "md", className }) => {
  const fullStars = Math.round(rating);
  
  const sizeClass = size === "sm" ? "w-3 h-3" : size === "lg" ? "w-5 h-5" : "w-4 h-4";

  return (
    <div className={`flex items-center gap-0.5 ${className ?? ""}`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill={i < fullStars ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
          className={`${sizeClass} ${i < fullStars ? "text-amber-400" : "text-slate-300"}`}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.545.044.77.77.326 1.163l-4.304 3.86a.562.562 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.304-3.86a.562.562 0 01.326-1.163l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
          />
        </svg>
      ))}
    </div>
  );
};
