"use client";

import { create } from "zustand";
import Link from "next/link";
import { ShoppingCart, ArrowRight } from "lucide-react";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
  action?: {
    label: string;
    href: string;
  };
}

interface ToastStore {
  toasts: Toast[];
  addToast: (message: string, type?: "success" | "error" | "info", action?: { label: string; href: string }) => void;
  removeToast: (id: string) => void;
}

export const useToast = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (message, type = "info", action) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({ toasts: [...state.toasts, { id, message, type, action }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 5000); // Increased duration to 5s for better visibility of action
  },
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 pointer-events-none w-full max-w-sm px-4 sm:px-0">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            pointer-events-auto w-full p-4 rounded-xl shadow-2xl border animate-in slide-in-from-right-full fade-in duration-300 backdrop-blur-md
            ${
              toast.type === "success"
                ? "bg-white/95 border-emerald-100 text-emerald-900 dark:bg-slate-800/95 dark:border-emerald-900/30 dark:text-emerald-100"
                : toast.type === "error"
                ? "bg-white/95 border-red-100 text-red-900 dark:bg-slate-800/95 dark:border-red-900/30 dark:text-red-100"
                : "bg-white/95 border-rose-100 text-rose-900 dark:bg-slate-800/95 dark:border-rose-900/30 dark:text-rose-100"
            }
          `}
        >
          <div className="flex items-start gap-3">
            <div className={`
                w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5
                ${
                    toast.type === "success" ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400" :
                    toast.type === "error" ? "bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400" :
                    "bg-rose-100 text-rose-400 dark:bg-rose-900/50 dark:text-rose-300"
                }
            `}>
                {toast.type === "success" && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                )}
                {toast.type === "error" && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                )}
                {toast.type === "info" && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                )}
            </div>
            
            <div className="flex-1 min-w-0">
                <p className="font-bold text-sm mb-1 capitalize">{toast.type === 'success' ? 'Success' : toast.type === 'error' ? 'Error' : 'Info'}</p>
                <p className="text-sm opacity-90 leading-snug mb-3">{toast.message}</p>

                {toast.action && (
                  <Link
                    href={toast.action.href}
                    onClick={() => removeToast(toast.id)}
                    className={`
                      inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-sm w-full justify-center
                      ${
                        toast.type === "success" 
                          ? "bg-emerald-600 text-white hover:bg-emerald-700" 
                          : "bg-rose-400 text-white hover:bg-rose-500"
                      }
                    `}
                  >
                    {toast.action.label === 'View Cart' && <ShoppingCart size={16} />}
                    {toast.action.label}
                    <ArrowRight size={16} />
                  </Link>
                )}
            </div>
            
            <button 
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
