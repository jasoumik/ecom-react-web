import { Section } from "@/components/ui";
import type { TrustBadge } from "./types";

interface TrustBadgesSectionProps {
  title?: string;
  badges: TrustBadge[];
}

export function TrustBadgesSection({ title, badges }: TrustBadgesSectionProps) {
  return (
    <div className="border-y border-slate-100 bg-white dark:bg-slate-950 dark:border-slate-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {title && (
          <p className="text-center text-xs font-bold uppercase tracking-widest text-slate-400 mb-6 dark:text-slate-500">
            {title}
          </p>
        )}
        <div className="flex flex-wrap justify-center gap-x-12 gap-y-6">
          {badges.map((badge) => (
            <div key={badge.id} className="flex items-center gap-3 opacity-70 hover:opacity-100 transition-opacity">
              <div className="w-2 h-2 rounded-full bg-rose-400"></div>
              <span className="text-sm font-medium text-slate-600 uppercase tracking-wide dark:text-slate-300">
                {badge.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
