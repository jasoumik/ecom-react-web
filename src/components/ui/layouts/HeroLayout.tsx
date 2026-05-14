import * as React from "react";

export interface HeroLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  left: React.ReactNode;
  right?: React.ReactNode;
}

export const HeroLayout: React.FC<HeroLayoutProps> = ({ left, right, className, ...props }) => {
  return (
    <section
      className={`relative w-full px-4 py-20 sm:px-6 lg:px-8 flex justify-center overflow-hidden ${
        className ?? ""
      }`}
      {...props}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-rose-100/40 via-sky-50/40 to-white"></div>
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-rose-100 rounded-full blur-3xl opacity-30"></div>
      <div className="absolute top-1/2 -left-24 w-72 h-72 bg-sky-100 rounded-full blur-3xl opacity-30"></div>

      <div className="w-full max-w-7xl flex flex-col-reverse gap-12 md:flex-row md:items-center">
        <div className="flex-1 space-y-8">{left}</div>
        {right && <div className="flex-1 flex justify-center md:justify-end">{right}</div>}
      </div>
    </section>
  );
};
