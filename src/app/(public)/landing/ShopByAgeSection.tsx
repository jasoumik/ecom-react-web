"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Section, Heading } from "@/components/ui";
import { useLanguage } from "@/lib/language-context";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { API_URL } from "@/lib/config";
import { getLocalizedField } from "@/lib/utils";

interface AgeGroup {
  id: string;
  label: string;
  label_bn?: string;
  slug?: string;
  icon: string;
  age_range: string;
  description?: string;
  description_bn?: string;
  sort_order: number;
  is_active: boolean;
}

interface ShopByAgeSectionProps {
  onAgeSelect?: (ageId: string) => void;
}

export function ShopByAgeSection({ onAgeSelect }: ShopByAgeSectionProps) {
  const { t, language } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const scrollRef = useRef<HTMLDivElement>(null);

  const [ageGroups, setAgeGroups] = useState<AgeGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const currentAge = searchParams.get("age") || null;
  const [selectedAge, setSelectedAge] = useState<string | null>(currentAge);

  // Fetch age groups from API
  useEffect(() => {
    const fetchAgeGroups = async () => {
      try {
        const res = await fetch(`${API_URL}/age-groups`);
        if (res.ok) {
          const data = await res.json();
          setAgeGroups(data);
        }
      } catch (error) {
        console.error("Failed to fetch age groups:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgeGroups();
  }, []);

  const handleAgeSelect = useCallback((ageIdOrSlug: string) => {
    setSelectedAge(ageIdOrSlug);

    // Update URL with age filter
    const params = new URLSearchParams(searchParams.toString());
    params.set("age", ageIdOrSlug);
    router.push(`/products?${params.toString()}`, { scroll: false });

    // Callback for parent component
    onAgeSelect?.(ageIdOrSlug);
  }, [router, searchParams, onAgeSelect]);

  if (isLoading) {
    return (
      <Section className="py-8 sm:py-12 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-8">
            <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-3 animate-pulse" />
            <div className="h-8 w-64 bg-slate-200 dark:bg-slate-700 rounded mx-auto mb-2 animate-pulse" />
            <div className="h-4 w-48 bg-slate-200 dark:bg-slate-700 rounded mx-auto animate-pulse" />
          </div>
          <div className="flex justify-center gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="w-32 h-32 bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </Section>
    );
  }

  if (ageGroups.length === 0) return null;

  return (
    <Section className="py-8 sm:py-12 bg-white dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 dark:bg-slate-800 text-sky-600 dark:text-sky-400 text-[10px] font-bold uppercase tracking-wider mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
            {language === "bn" ? "বয়স অনুযায়ী কেনাকাটা" : "Shop by Age"}
          </div>
          <Heading size="md" className="font-sans text-slate-900 dark:text-white font-bold text-xl sm:text-2xl">
            {language === "bn" ? "আপনার শিশুর বয়স নির্বাচন করুন" : "Select Your Baby's Age"}
          </Heading>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
            {language === "bn"
              ? "বয়স অনুযায়ী সঠিক পণ্য খুঁজুন"
              : "Find age-appropriate products for your little one"}
          </p>
        </div>

        {/* Age Timeline - Desktop */}
        <div className="hidden lg:flex justify-center gap-4 relative">
          {/* Timeline Line */}
          <div className="absolute top-12 left-[10%] right-[10%] h-1 bg-slate-200 dark:bg-slate-700 rounded-full" />

          {ageGroups.map((stage) => {
            const isSelected = selectedAge === (stage.slug || stage.id);

            return (
              <motion.button
                key={stage.id}
                onClick={() => handleAgeSelect(stage.slug || stage.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl transition-all duration-300 min-w-[140px] ${
                  isSelected
                    ? "bg-sky-500 text-white shadow-lg shadow-sky-500/30"
                    : "bg-[#E6F4FF] dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-sky-100 dark:hover:bg-slate-700"
                }`}
              >
                {/* Age Icon */}
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl transition-all ${
                  isSelected 
                    ? "bg-white/20" 
                    : "bg-white dark:bg-slate-700 shadow-sm"
                }`}>
                  {stage.icon}
                </div>

                {/* Label */}
                <div className="text-center">
                  <div className="font-bold text-sm">
                    {getLocalizedField(stage, "label", language)}
                  </div>
                  <div className={`text-xs ${isSelected ? "text-white/80" : "text-slate-500 dark:text-slate-400"}`}>
                    {stage.age_range}
                  </div>
                </div>

                {/* Selection indicator */}
                {isSelected && (
                  <motion.div
                    layoutId="ageIndicator"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-sky-500 rotate-45"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Age Timeline - Mobile (Horizontal Scroll) */}
        <div className="lg:hidden">
          <div
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4 -mx-4 px-4"
          >
            {ageGroups.map((stage) => {
              const isSelected = selectedAge === (stage.slug || stage.id);

              return (
                <motion.button
                  key={stage.id}
                  onClick={() => handleAgeSelect(stage.slug || stage.id)}
                  whileTap={{ scale: 0.95 }}
                  className={`flex-shrink-0 snap-center flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-300 min-w-[100px] ${
                    isSelected
                      ? "bg-sky-500 text-white shadow-lg shadow-sky-500/30"
                      : "bg-[#E6F4FF] dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {/* Age Icon */}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all ${
                    isSelected 
                      ? "bg-white/20" 
                      : "bg-white dark:bg-slate-700"
                  }`}>
                    {stage.icon}
                  </div>

                  {/* Label */}
                  <div className="text-center">
                    <div className="font-bold text-xs">
                      {getLocalizedField(stage, "label", language)}
                    </div>
                    <div className={`text-[10px] ${isSelected ? "text-white/80" : "text-slate-500 dark:text-slate-400"}`}>
                      {stage.age_range}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Scroll Indicator Dots */}
          <div className="flex justify-center gap-1.5 mt-2">
            {ageGroups.map((stage) => (
              <div
                key={stage.id}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  selectedAge === (stage.slug || stage.id)
                    ? "w-4 bg-sky-500"
                    : "w-1.5 bg-slate-300 dark:bg-slate-600"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
