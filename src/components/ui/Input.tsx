import * as React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
            {label}
          </label>
        )}
        <input
          className={`w-full px-4 py-3 rounded-md border bg-white text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-500 ${
            error ? "border-red-500 focus:border-red-500 focus:ring-red-200" : "border-slate-200"
          } ${className ?? ""}`}
          ref={ref}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
