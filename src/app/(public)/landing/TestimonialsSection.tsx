"use client";

import { Section, Heading, Text, RatingStars } from "@/components/ui";
import type { Testimonial } from "./types";
import { useLanguage } from "@/lib/language-context";
import {getLocalizedField} from "@/lib/utils";

interface TestimonialsSectionProps {
  title: string;
  title_bn?: string;
  items: Testimonial[];
  averageRating?: string;
  totalReviews?: number;
}

export function TestimonialsSection({
  title,
  title_bn,
  items,
  averageRating = "5.0",
  totalReviews = 0,
}: TestimonialsSectionProps) {
  const { t, language } = useLanguage();

  // Don't render if no testimonials
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <Section className="py-6 sm:py-16 border-t border-slate-100 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-3 sm:gap-6 mb-4 sm:mb-10">
          <div className="space-y-1 sm:space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white shadow-sm border border-rose-100 text-rose-400 text-[10px] font-bold uppercase tracking-wider mb-2 sm:mb-3 dark:bg-slate-800 dark:border-slate-700 dark:text-rose-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse"></span>
                  {t('love_notes')}
              </div>
            <Heading size="lg" className="font-sans text-xl sm:text-2xl md:text-3xl text-slate-900 dark:text-white font-bold">
              {title || t('customer_reviews')}
            </Heading>
          </div>
          <div className="flex gap-2 items-center">
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{averageRating}</div>
            <div className="space-y-0.5">
                <RatingStars rating={parseFloat(averageRating)} size="sm" />
                <div className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">{totalReviews}+ {t('reviews')}</div>
            </div>
          </div>
        </div>
        
        {/* Mobile: Horizontal scroll */}
        <div className="sm:hidden overflow-x-auto scrollbar-hide -mx-4 px-4">
          <div className="flex gap-3 pb-2" style={{ width: 'max-content' }}>
            {items.slice(0, 3).map((testimonial) => (
              <div key={testimonial.id} className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 w-[260px] flex-shrink-0">
                <div className="flex gap-1 mb-2">
                  <RatingStars rating={testimonial.rating || 5} size="sm" />
                </div>

                <Text className="text-sm text-slate-700 dark:text-slate-300 mb-3 italic line-clamp-3">
                  "{testimonial.quote}"
                </Text>

                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-400 font-bold text-xs dark:bg-slate-800 dark:text-rose-300">
                    {testimonial.authorName.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white text-xs">{testimonial.authorName}</div>
                    {testimonial.authorRole && (
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">{testimonial.authorRole}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop: Grid */}
        <div className="hidden sm:grid md:grid-cols-3 gap-6">
          {items.map((testimonial) => (
            <div key={testimonial.id} className="bg-slate-50 dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="flex gap-1 mb-4">
                <RatingStars rating={testimonial.rating || 5} size="sm" />
              </div>
              
              <Text className="text-base text-slate-700 dark:text-slate-300 mb-4 italic">
                "{testimonial.quote}"
              </Text>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-400 font-bold text-sm dark:bg-slate-800 dark:text-rose-300">
                  {testimonial.authorName.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white text-sm">{testimonial.authorName}</div>
                  {testimonial.authorRole && (
                    <div className="text-xs text-slate-500 dark:text-slate-400">{testimonial.authorRole}</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
