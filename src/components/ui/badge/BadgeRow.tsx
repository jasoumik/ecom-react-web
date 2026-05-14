import * as React from "react";

export interface BadgeItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

export interface BadgeRowProps extends React.HTMLAttributes<HTMLDivElement> {
  items: BadgeItem[];
}

export const BadgeRow: React.FC<BadgeRowProps> = ({ items, className, ...props }) => {
  return (
    <div
      className={`flex flex-wrap items-center gap-3 text-xs text-slate-600 ${
        className ?? ""
      }`}
      {...props}
    >
      {items.map((item) => (
        <div
          key={item.id}
          className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 shadow-sm border border-slate-100"
        >
          {item.icon}
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
};

