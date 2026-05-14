"use client";

import { useState, useEffect } from "react";
import { Input } from "./Input";
import { Button } from "@/components/ui";

interface FilterBarProps {
  onSearch: (query: string) => void;
  onDateRangeChange?: (start: string, end: string) => void;
  placeholder?: string;
  showDateFilter?: boolean;
}

export function FilterBar({ onSearch, onDateRangeChange, placeholder = "Search...", showDateFilter = false }: FilterBarProps) {
  const [query, setQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(query);
    }, 500);
    return () => clearTimeout(timer);
  }, [query, onSearch]);

  const handleDateChange = () => {
    if (onDateRangeChange) {
      onDateRangeChange(startDate, endDate);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-[20px] shadow-sm border border-slate-100 dark:border-slate-800 mb-6 flex flex-col md:flex-row gap-4 items-end md:items-center justify-between">
      <div className="w-full md:w-1/3">
        <Input 
          placeholder={placeholder} 
          value={query} 
          onChange={(e) => setQuery(e.target.value)} 
          className="bg-slate-50/50"
        />
      </div>
      
      {showDateFilter && (
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Input 
            type="date" 
            value={startDate} 
            onChange={(e) => setStartDate(e.target.value)} 
            className="bg-slate-50/50"
          />
          <span className="text-slate-400">-</span>
          <Input 
            type="date" 
            value={endDate} 
            onChange={(e) => setEndDate(e.target.value)} 
            className="bg-slate-50/50"
          />
          <Button variant="secondary" onClick={handleDateChange} className="rounded-xl">Filter</Button>
        </div>
      )}
    </div>
  );
}
