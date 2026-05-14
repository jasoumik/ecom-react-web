"use client";

import { useEffect, useState, useMemo } from "react";
import { Heading, ResponsiveImage } from "@/components/ui";
import { API_URL } from "@/lib/config";
import { useLanguage } from "@/lib/language-context";
import { getLocalizedField, getImageUrl } from "@/lib/utils";
import Link from "next/link";
import { FullScreenLoader } from "@/components/ui/Loader";

export default function BrandsPage() {
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { t, language } = useLanguage();

  useEffect(() => {
    fetch(`${API_URL}/brands?public=true`)
      .then(res => res.json())
      .then(data => {
          if (Array.isArray(data)) {
              setBrands(data);
          }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const groupedBrands = useMemo(() => {
    const groups: Record<string, any[]> = {};
    brands.forEach(brand => {
        const name = getLocalizedField(brand, 'name', language) || brand.name || "";
        const firstLetter = name.charAt(0).toUpperCase();
        const key = /[A-Z]/.test(firstLetter) ? firstLetter : '#';
        
        if (!groups[key]) {
            groups[key] = [];
        }
        groups[key].push(brand);
    });
    return groups;
  }, [brands, language]);

  const sortedLetters = useMemo(() => {
      const keys = Object.keys(groupedBrands);
      return keys.sort((a, b) => {
          if (a === '#') return 1;
          if (b === '#') return -1;
          return a.localeCompare(b);
      });
  }, [groupedBrands]);

  const scrollToSection = (letter: string) => {
      const element = document.getElementById(`brand-section-${letter}`);
      if (element) {
          const offset = 120; // Adjust for sticky header
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - offset;
          window.scrollTo({
              top: offsetPosition,
              behavior: "smooth"
          });
      }
  };

  if (loading) return <FullScreenLoader />;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-4">
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        <Heading size="lg" className="font-sans text-slate-900 dark:text-white mb-2 font-bold text-center">All Brands</Heading>
        
        <div className="sticky top-14 sm:top-16 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-sm py-2 z-20 border-b border-slate-200 dark:border-slate-800 mb-4">
            <div className="flex flex-wrap justify-center gap-1">
                {sortedLetters.map((letter) => (
                    <button
                        key={letter}
                        onClick={() => scrollToSection(letter)}
                        className="w-7 h-7 flex items-center justify-center rounded bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold shadow-sm hover:bg-sky-500 hover:text-white dark:hover:bg-sky-500 transition-all border border-slate-200 dark:border-slate-700"
                    >
                        {letter}
                    </button>
                ))}
            </div>
        </div>

        <div className="space-y-6">
            {sortedLetters.map((letter) => (
                <div key={letter} id={`brand-section-${letter}`}>
                    <div className="flex items-center gap-2 mb-2">
                        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">{letter}</h2>
                        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700"></div>
                    </div>
                    
                    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-2 sm:gap-3">
                        {groupedBrands[letter].map((brand) => (
                            <Link 
                                key={brand.id} 
                                href={`/products?brand=${brand.slug || brand.id}`}
                                className="group flex flex-col items-center gap-1"
                            >
                                <div className="w-full aspect-square rounded-lg bg-white shadow-sm flex items-center justify-center p-1.5 overflow-hidden relative group-hover:shadow-md transition-all duration-300 border border-slate-100 dark:border-slate-800">
                                    {brand.logo ? (
                                        <ResponsiveImage 
                                            src={getImageUrl(brand.logo)} 
                                            alt={getLocalizedField(brand, 'name', language)} 
                                            width={80} 
                                            height={80} 
                                            className="w-full h-full object-contain transition-all duration-300"
                                        />
                                    ) : (
                                        <span className="text-xl font-bold text-slate-300 group-hover:text-sky-500 transition-colors">
                                            {getLocalizedField(brand, 'name', language).charAt(0)}
                                        </span>
                                    )}
                                </div>
                                <span className="text-[10px] sm:text-xs font-semibold text-slate-600 dark:text-slate-400 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors text-center line-clamp-1 px-0.5 leading-tight">
                                    {getLocalizedField(brand, 'name', language)}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}
