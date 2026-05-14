import * as React from "react";
import { BadgeRow, BadgeItem } from "../badge/BadgeRow";

export interface TrustBarProps {
  title?: string;
  items: BadgeItem[];
}

export const TrustBar: React.FC<TrustBarProps> = ({ title, items }) => {
  return (
    <div className="flex flex-col gap-4">
      {title && (
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {title}
        </p>
      )}
      <BadgeRow items={items} />
    </div>
  );
};

