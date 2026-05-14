"use client";

import { useEffect, useState } from "react";
import { Heading, Text, Button, ResponsiveImage } from "@/components/ui";
import { API_URL } from "@/lib/config";
import { useCart } from "@/lib/cart";
import { useToast } from "@/components/ui/Toast";
import { FullScreenLoader } from "@/components/ui/Loader";
import { useLanguage } from "@/lib/language-context";
import { getLocalizedField, getImageUrl } from "@/lib/utils";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";

export default function BundlesPage() {
  const [bundles, setBundles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();
  const { addToast } = useToast();
  const { t, language } = useLanguage();

  useEffect(() => {
    fetchBundles();
  }, []);

  const fetchBundles = async () => {
    try {
      const res = await fetch(`${API_URL}/bundles?public=true`);
      if (res.ok) {
          const data = await res.json();
          setBundles(data || []);
      }
    } catch (error) {
      console.error("Failed to fetch bundles", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (bundle: any, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation to details page
    e.stopPropagation();

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
      stock: 999, // Bundles usually virtual stock
      // isBundle: true
    });

    addToast(
      `Added ${getLocalizedField(bundle, 'title', language)} to cart`,
      "success",
      { label: "View Cart", href: "/cart" }
    );
  };

  if (loading) return <FullScreenLoader />;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
            <Heading size="xl" className="font-sans text-slate-900 dark:text-white mb-2 sm:mb-4 text-2xl sm:text-3xl md:text-4xl">{t('bundles_sets')}</Heading>
            <Text className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
                {t('bundles_desc')}
            </Text>
        </div>

        {bundles.length === 0 ? (
            <div className="text-center py-20">
                <p className="text-slate-500 dark:text-slate-400 mb-6">{t('no_bundles')}</p>
                <Link href="/products">
                    <Button variant="outline" className="rounded-xl">{t('browse_all')}</Button>
                </Link>
            </div>
        ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                {bundles.map((bundle) => {
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
                        <div key={bundle.id} className="group bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-xl transition-all duration-300 flex flex-col">
                            <Link href={`/bundles/${bundle.slug || bundle.id}`} className="block h-full flex flex-col">
                                <div className="relative aspect-[4/3] overflow-hidden">
                                    <ResponsiveImage 
                                        src={imageUrl} 
                                        alt={getLocalizedField(bundle, 'title', language)}
                                        width={600} 
                                        height={450} 
                                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
                                    />
                                    {savings > 0 && (
                                        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-red-500 text-white text-[9px] sm:text-xs font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md shadow-md">
                                            {savings}% {t('off')}
                                        </div>
                                    )}
                                    {bundle.is_free_shipping && (
                                        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-emerald-500 text-white text-[9px] sm:text-xs font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md shadow-md flex items-center gap-1">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 18H3c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v11"/><path d="M14 9h4l4 4v4c0 .6-.4 1-1 1h-2"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>
                                            Free Ship
                                        </div>
                                    )}
                                </div>
                                <div className="p-2 sm:p-4 flex flex-col flex-grow">
                                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-1 line-clamp-1 group-hover:text-sky-600 transition-colors">{getLocalizedField(bundle, 'title', language)}</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-[10px] sm:text-xs mb-2 sm:mb-3 line-clamp-2 flex-grow">{getLocalizedField(bundle, 'description', language)}</p>
                                    
                                    <div className="flex items-center justify-between mt-auto pt-2 sm:pt-3 border-t border-slate-100 dark:border-slate-700 gap-1">
                                        <div>
                                            <div className="text-sm sm:text-lg font-bold text-slate-900 dark:text-white">৳{bundle.price}</div>
                                            {bundle.original_price && (
                                                <div className="text-[9px] sm:text-[10px] text-slate-400 line-through">৳{bundle.original_price}</div>
                                            )}
                                        </div>
                                        <Button 
                                            onClick={(e) => handleAddToCart(bundle, e)}
                                            className="rounded-lg px-2 py-1 sm:px-3 sm:py-1.5 bg-sky-500 hover:bg-sky-600 text-white font-bold shadow-md text-[10px] flex items-center gap-1 h-7 sm:h-8 min-w-0"
                                        >
                                            <ShoppingCart size={12} />
                                            <span className="hidden sm:inline">{t('add_to_cart')}</span>
                                            <span className="sm:hidden">Add</span>
                                        </Button>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    );
                })}
            </div>
        )}
      </div>
    </div>
  );
}
