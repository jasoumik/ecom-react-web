"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown, X } from "lucide-react";

interface Option {
    label: string;
    value: string;
    subLabel?: string;
}

interface SearchableSelectProps {
    options: (string | Option)[];
    value: string;
    onChange: (val: string) => void;
    label?: string;
    placeholder?: string;
    className?: string;
    required?: boolean;
}

export function SearchableSelect({ 
    options, 
    value, 
    onChange, 
    label, 
    placeholder,
    className,
    required
}: SearchableSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Normalize options to a consistent format
    const normalizedOptions: Option[] = options.map(opt => 
        typeof opt === 'string' ? { label: opt, value: opt } : opt
    );

    // Find selected option to display its label initially
    useEffect(() => {
        const selected = normalizedOptions.find(o => o.value === value);
        if (selected) {
            setQuery(selected.label);
        } else {
            setQuery("");
        }
    }, [value, options]); // Re-run if value or options change

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                // Revert if invalid or empty
                const selected = normalizedOptions.find(o => o.value === value);
                if (selected) {
                    setQuery(selected.label);
                } else {
                    setQuery("");
                }
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef, value, normalizedOptions]);

    const filteredOptions = normalizedOptions.filter(opt => 
        opt.label.toLowerCase().includes(query.toLowerCase())
    );

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        setQuery("");
        onChange("");
        setIsOpen(true);
    };

    return (
        <div className={`w-full relative group ${className}`} ref={wrapperRef}>
            {label && <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{label}</label>}
            <div className="relative">
                <input
                    type="text"
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50/50 text-slate-900 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white text-sm pr-10"
                    placeholder={placeholder}
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                        // Only clear value if user clears input manually, or keep it?
                        // Usually, typing means searching, so we don't clear value immediately unless we want to enforce selection.
                        // But if we don't clear, the old value remains while typing new query.
                        // Let's clear value if query doesn't match selected label.
                        const selected = normalizedOptions.find(o => o.value === value);
                        if (selected && selected.label !== e.target.value) {
                             // Don't clear onChange yet, wait for selection. 
                             // But if required, maybe we should? 
                             // For now, let's just let them type.
                        }
                    }}
                    onFocus={() => {
                        setIsOpen(true);
                        // Optional: Select text on focus?
                    }}
                    required={required}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {value && (
                        <button 
                            type="button" 
                            onClick={handleClear}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                            <X size={16} />
                        </button>
                    )}
                    <div className="pointer-events-none text-slate-400">
                        <ChevronDown size={16} />
                    </div>
                </div>
            </div>
            {isOpen && filteredOptions.length > 0 && (
                <div className="absolute z-20 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-60 overflow-auto">
                    {filteredOptions.map(opt => (
                        <button
                            key={opt.value}
                            type="button"
                            className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-slate-700 hover:text-rose-400 border-b border-slate-50 dark:border-slate-700/50 last:border-0"
                            onClick={() => {
                                onChange(opt.value);
                                setQuery(opt.label);
                                setIsOpen(false);
                            }}
                        >
                            <div className="font-medium">{opt.label}</div>
                            {opt.subLabel && <div className="text-xs text-slate-400">{opt.subLabel}</div>}
                        </button>
                    ))}
                </div>
            )}
            {isOpen && filteredOptions.length === 0 && (
                <div className="absolute z-20 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-3 text-sm text-slate-500 text-center">
                    No results found
                </div>
            )}
        </div>
    );
}
