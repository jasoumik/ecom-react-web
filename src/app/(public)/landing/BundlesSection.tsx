"use client";

import { useEffect, useState } from "react";
import { Section, Heading, ResponsiveImage, Button } from "@/components/ui";
import { API_URL } from "@/lib/config";
import { useCart } from "@/lib/cart";
import { useToast } from "@/components/ui/Toast";
import { useLanguage } from "@/lib/language-context";
import { getLocalizedField, getImageUrl } from "@/lib/utils";
import Link from "next/link";
import { motion } from "framer-motion";
import {ShoppingCart, ChevronRight} from "lucide-react";

export function BundlesSection() {
  const [bundles, setBundles] = useState<any[]>([]);
  const { addItem } = useCart();
  const { addToast } = useToast();
  const { t, language } = useLanguage();

  useEffect(() => {
    fetch(`${API_URL}/bundles?public=true`)
      .then(res => res.json())
      .then(data => setBundles(data))
      .catch(console.error);
  }, []);

  const handleAddToCart = (bundle: any, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation to details page
    e.stopPropagation();

    // Use bundle image or first item's image
    let imageUrl = "https://picsum.photos/seed/product-item/700/700";
    if (bundle.image) {
        imageUrl = getImageUrl(bundle.image);
    } else if (bundle.items && bundle.items.length > 0 && bundle.items[0].product_images) {
        try {
            const parsed = JSON.parse(bundle.items[0].product_images);
            if (Array.isArray(parsed) && parsed.length > 0) imageUrl = getImageUrl(parsed[0]);
        } catch (e) {}
    }

    addItem({
      id: bundle.id,
      slug: bundle.slug, // Pass slug
      name: getLocalizedField(bundle, 'title', language),
      price: parseFloat(bundle.price),
      image: imageUrl,
      quantity: 1,
      stock: 999, // Bundles usually virtual stock, or check items stock
      // isBundle: true
    });
    
    addToast(
      `Added ${getLocalizedField(bundle, 'title', language)} to cart`,
      "success",
      { label: "View Cart", href: "/cart" }
    );
  };

  if (bundles.length === 0) return null;

  return (
    <Section className="py-8 sm:py-12 bg-gradient-to-b from-white to-rose-50 dark:from-slate-900 dark:to-slate-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-6 sm:mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-rose-400 text-[10px] font-bold uppercase tracking-wider mb-2 sm:mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse"></span>
              {t('save_more')}
            </div>
            <Heading size="lg" className="font-sans text-slate-900 dark:text-white font-bold text-xl sm:text-2xl md:text-3xl">
              {t('bundles_sets')}
            </Heading>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1 sm:mt-2 max-w-xl">
              {t('bundles_desc')}
            </p>
          </div>
          <Link
              href="/bundles"
              className="text-sm font-bold text-rose-400 hover:text-rose-500 flex items-center gap-1 bg-white dark:bg-slate-800 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm transition-all hover:shadow-md"
          >
            {t('view_all')}
            <ChevronRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {bundles.slice(0, 4).map((bundle, index) => {
            let imageUrl = "https://picsum.photos/seed/product-item/700/700";
            if (bundle.image) {
                imageUrl = getImageUrl(bundle.image);
            } else if (bundle.items && bundle.items.length > 0 && bundle.items[0].product_images) {
                try {
                    const parsed = JSON.parse(bundle.items[0].product_images);
                    if (Array.isArray(parsed) && parsed.length > 0) imageUrl = getImageUrl(parsed[0]);
                } catch (e) {}
            }

            const savings = bundle.original_price ? Math.round(((bundle.original_price - bundle.price) / bundle.original_price) * 100) : 0;

            return (
              <motion.div
                key={bundle.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 dark:border-slate-700 flex flex-col"
              >
                <Link href={`/bundles/${bundle.slug || bundle.id}`} className="block h-full flex flex-col">
                    <div className="relative aspect-[4/3] overflow-hidden">
                    <ResponsiveImage 
                        src={imageUrl} 
                        alt={getLocalizedField(bundle, 'title', language)} 
                        width={400} 
                        height={300} 
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
                    />
                    
                    {/* Badges */}
                    <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-col gap-1 sm:gap-2">
                        {savings > 0 && (
                        <span className="bg-rose-500 text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md shadow-md">
                            {savings}% {t('off')}
                        </span>
                        )}
                        {bundle.is_free_shipping && (
                        <span className="bg-emerald-500 text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md shadow-md flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 18H3c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v11"/><path d="M14 9h4l4 4v4c0 .6-.4 1-1 1h-2"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>
                            Free Ship
                        </span>
                        )}
                    </div>
                    </div>

                    <div className="p-2 sm:p-4 flex flex-col flex-grow">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-1 line-clamp-1 group-hover:text-rose-400 transition-colors">
                        {getLocalizedField(bundle, 'title', language)}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-[10px] sm:text-xs mb-2 sm:mb-3 line-clamp-2 flex-grow">
                        {getLocalizedField(bundle, 'description', language)}
                    </p>
                    
                    <div className="flex items-center justify-between mt-auto pt-2 sm:pt-3 border-t border-slate-100 dark:border-slate-700 gap-1">
                        <div>
                        <div className="text-sm sm:text-lg font-bold text-slate-900 dark:text-white">৳{bundle.price}</div>
                        {bundle.original_price && (
                            <div className="text-[9px] sm:text-[10px] text-slate-400 line-through">৳{bundle.original_price}</div>
                        )}
                        </div>
                        <Button 
                        onClick={(e) => handleAddToCart(bundle, e)}
                        className="rounded-lg px-2 py-1 sm:px-3 sm:py-1.5 bg-rose-400 hover:bg-rose-400 text-white font-bold shadow-md text-[10px] flex items-center gap-1 h-7 sm:h-8 min-w-0"
                        >
                        <ShoppingCart size={12} />
                        <span className="hidden sm:inline">{t('add_to_cart')}</span>
                        <span className="sm:hidden">Add</span>
                        </Button>
                    </div>
                    </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-6 sm:mt-8 text-center md:hidden">
          <Link
              href="/bundles"
              className="text-sm font-bold text-rose-400 hover:text-rose-500 flex items-center gap-1 bg-white dark:bg-slate-800 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm transition-all hover:shadow-md"
          >
            {t('view_all')}
            <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    </Section>
  );
}
