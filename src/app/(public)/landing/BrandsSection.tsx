"use client";

import React, { useEffect, useState, useRef } from "react";
import { Section, Heading, ResponsiveImage } from "@/components/ui";
import { API_URL } from "@/lib/config";
import { useLanguage } from "@/lib/language-context";
import { getLocalizedField, getImageUrl } from "@/lib/utils";
import Link from "next/link";
import { motion } from "framer-motion";
import { Baby, Heart, LayoutGrid, ChevronRight } from "lucide-react";

interface MotherCategoryTab {
  id: string;
  slug?: string;
  name: string;
  name_bn?: string;
}

interface Brand {
  id: string;
  name: string;
  name_bn?: string;
  slug?: string;
  logo?: string;
  website?: string;
  mother_category_id?: string;
}

interface BrandsSectionProps {
  motherCategories?: MotherCategoryTab[];
}

export function BrandsSection({ motherCategories = [] }: BrandsSectionProps) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedMotherCategory, setSelectedMotherCategory] = useState<string | null>(null);
  const { t, language } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`${API_URL}/brands?public=true`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setBrands(data);
        }
      })
      .catch(console.error);
  }, []);

  if (brands.length === 0) return null;

  const filteredBrands = selectedMotherCategory
    ? brands.filter((b) => b.mother_category_id === selectedMotherCategory)
    : brands;

  const duplicatedBrands = filteredBrands.length > 5
    ? [...filteredBrands, ...filteredBrands, ...filteredBrands]
    : filteredBrands;

  const getIcon = (slug?: string): React.ReactNode => {
    if (slug === "baby-care") return <Baby size={16} />;
    if (slug === "mom-care") return <Heart size={16} />;
    return <LayoutGrid size={16} />;
  };

  const currentSelectionName = selectedMotherCategory
    ? getLocalizedField(motherCategories.find((mc) => mc.id === selectedMotherCategory), "name", language)
    : "";

  return (
    <Section className="py-8 sm:py-12 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {motherCategories.length > 0 && (
          <div className="flex justify-center mb-8">
            <div className="inline-flex bg-slate-50 dark:bg-slate-800 p-1.5 rounded-full shadow-inner">
              {/* Mother categories first */}
              {motherCategories.map((mc) => (
                <button
                  key={mc.id}
                  onClick={() => setSelectedMotherCategory(mc.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all relative ${
                    selectedMotherCategory === mc.id
                      ? "text-white"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  }`}
                >
                  {selectedMotherCategory === mc.id && (
                    <motion.div
                      layoutId="activeTabBrand"
                      className="absolute inset-0 bg-rose-400 rounded-full shadow-md"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    {getIcon(mc.slug)}
                    {getLocalizedField(mc, "name", language)}
                  </span>
                </button>
              ))}

              {/* All last */}
              <button
                onClick={() => setSelectedMotherCategory(null)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all relative ${
                  selectedMotherCategory === null
                    ? "text-white"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
              >
                {selectedMotherCategory === null && (
                  <motion.div
                    layoutId="activeTabBrand"
                    className="absolute inset-0 bg-rose-400 rounded-full shadow-md"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <LayoutGrid size={16} />
                  {language === "bn" ? "সব" : "All"}
                </span>
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-6 gap-4 items-start">
          <div>
            <Heading size="md" className="font-sans text-slate-900 dark:text-white font-bold text-xl sm:text-2xl text-left">
              {selectedMotherCategory
                ? `${t('top_brands')} - ${currentSelectionName}`
                : t('top_brands')
              }
            </Heading>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 text-left">
              {language === "bn" ? "বিশ্বস্ত ব্র্যান্ড থেকে পণ্য" : "Products from trusted brands"}
            </p>
          </div>
          
          <Link
            href="/brands"
            className="text-sm font-bold text-rose-400 hover:text-rose-500 hover:underline flex items-center gap-1 bg-white/50 px-4 py-2 rounded-full backdrop-blur-sm border border-slate-200 dark:border-slate-700 shadow-sm transition-all hover:shadow-md dark:bg-slate-800/50 self-start sm:self-auto"
          >
            {t('view_all')}
            <ChevronRight size={16} />
          </Link>
        </div>

        {/* Infinite Logo Carousel */}
        <div
          ref={containerRef}
          className="relative overflow-hidden"
        >
          {/* Gradient fade on edges */}
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white dark:from-slate-900 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white dark:from-slate-900 to-transparent z-10 pointer-events-none" />

          {/* Scrolling container */}
          {filteredBrands.length > 0 ? (
              <motion.div
                className="flex gap-8 py-4"
                animate={filteredBrands.length > 5 ? {
                  x: [0, -100 * filteredBrands.length],
                } : {}}
                transition={filteredBrands.length > 5 ? {
                  x: {
                    repeat: Infinity,
                    repeatType: "loop",
                    duration: filteredBrands.length * 3,
                    ease: "linear",
                  },
                } : {}}
                style={{ justifyContent: filteredBrands.length <= 5 ? 'center' : 'flex-start' }}
              >
                {duplicatedBrands.map((brand, index) => (
                  <Link
                    key={`${brand.id}-${index}`}
                    href={`/products?brand=${brand.slug || brand.id}`}
                    className="group flex-shrink-0 flex flex-col items-center gap-3 min-w-[100px] sm:min-w-[120px]"
                  >
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-white shadow-sm flex items-center justify-center overflow-hidden relative group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                      {brand.logo ? (
                        <ResponsiveImage
                          src={getImageUrl(brand.logo)}
                          alt={getLocalizedField(brand, 'name', language)}
                          width={96}
                          height={96}
                          className="w-full h-full object-cover transition-all duration-300"
                        />
                      ) : (
                        <span className="text-3xl font-bold text-slate-300 group-hover:text-rose-400 transition-colors">
                          {brand.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 group-hover:text-rose-400 dark:group-hover:text-rose-300 transition-colors text-center line-clamp-1">
                      {getLocalizedField(brand, 'name', language)}
                    </span>
                  </Link>
                ))}
              </motion.div>
          ) : (
              <div className="text-center py-8 text-slate-500">No brands found for this category.</div>
          )}
        </div>
      </div>
    </Section>
  );
}
