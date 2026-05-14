"use client";

import type { HeroContent } from "./types";
import { Heading, Text, Button } from "@/components/ui";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";
import { getLocalizedField } from "@/lib/utils";
import {API_URL} from "@/lib/config";

export function HeroSection(props: HeroContent) {
  const { headline, headline_bn, subheadline, subheadline_bn, primaryCta, secondaryCta, stats } = props;
  const { t, language } = useLanguage();
  console.log('debug', API_URL);

  return (
    <section className="hidden md:block w-full bg-white dark:bg-slate-900 py-12 border-b border-slate-100 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <Heading as="h1" size="xl" className="font-sans text-slate-900 dark:text-white text-3xl sm:text-4xl font-bold tracking-tight">
            {getLocalizedField(props, 'headline', language)}
          </Heading>
          
          <Text className="text-base sm:text-lg text-slate-600 dark:text-slate-400">
            {getLocalizedField(props, 'subheadline', language)}
          </Text>

          {/* Restored Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center pt-2">
            <a href={primaryCta.href} className="w-full sm:w-auto">
              <Button className="px-8 py-3 text-sm rounded-full shadow-lg shadow-sky-500/20 bg-sky-600 text-white hover:bg-sky-700 hover:scale-105 transition-all duration-300 w-full font-bold">
                {getLocalizedField(primaryCta, 'label', language)}
              </Button>
            </a>
            {secondaryCta && (
              <a href={secondaryCta.href} className="w-full sm:w-auto">
                <Button variant="outline" className="px-8 py-3 text-sm rounded-full border-2 border-slate-200 text-slate-700 hover:border-sky-600 hover:text-sky-600 hover:bg-white transition-all duration-300 w-full font-bold dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                  {getLocalizedField(secondaryCta, 'label', language)}
                </Button>
              </a>
            )}
          </div>

          {stats && stats.length > 0 && (
            <div className="flex justify-center gap-8 pt-6 border-t border-slate-100 dark:border-slate-800 mt-6">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-xl font-bold text-sky-600 dark:text-sky-400">
                    {stat.value}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    {getLocalizedField(stat, 'label', language)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
