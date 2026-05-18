"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Heading, Text, Button, ResponsiveImage } from "@/components/ui";
import { API_URL } from "@/lib/config";
import { useCart } from "@/lib/cart";
import { useToast } from "@/components/ui/Toast";
import { FullScreenLoader } from "@/components/ui/Loader";
import { useLanguage } from "@/lib/language-context";
import { getLocalizedField, getImageUrl } from "@/lib/utils";
import Link from "next/link";
import { ShoppingCart, CheckCircle2, Truck, ShieldCheck, RefreshCw } from "lucide-react";

export default function BundleDetailsPage() {
  const params = useParams();
  const slugOrId = params.id as string;
  const [bundle, setBundle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();
  const { addToast } = useToast();
  const { t, language } = useLanguage();
  const router = useRouter();

  useEffect(() => {
    if (slugOrId) {
        fetch(`${API_URL}/bundles/${slugOrId}`)
        .then(res => {
            if (!res.ok) throw new Error("Bundle not found");
            return res.json();
        })
        .then(data => setBundle(data))
        .catch(err => {
            console.error(err);
            router.push('/bundles');
        })
        .finally(() => setLoading(false));
    }
  }, [slugOrId, router]);

  const handleAddToCart = () => {
    if (!bundle) return;

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
      stock: 999,
      // isBundle: true
    });
    
    addToast(
      `Added ${getLocalizedField(bundle, 'title', language)} to cart`,
      "success",
      { label: "View Cart", href: "/cart" }
    );
  };

  if (loading) return <FullScreenLoader />;
  if (!bundle) return null;

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
    <div className="min-h-screen bg-white dark:bg-slate-950 pb-24 transition-colors duration-300">
      {/* Breadcrumbs */}
      <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <Link href="/" className="hover:text-rose-400">{t('home')}</Link>
                  <span>/</span>
                  <Link href="/bundles" className="hover:text-rose-400">{t('bundles_sets')}</Link>
                  <span>/</span>
                  <span className="text-slate-900 dark:text-white font-medium truncate max-w-[200px]">{getLocalizedField(bundle, 'title', language)}</span>
              </div>
          </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Image */}
          <div className="md:col-span-6 lg:col-span-6">
            <div className="aspect-square rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 relative shadow-sm">
                <ResponsiveImage 
                    src={imageUrl} 
                    alt={getLocalizedField(bundle, 'title', language)} 
                    width={800} 
                    height={800} 
                    className="w-full h-full object-cover"
                />
                {savings > 0 && (
                    <div className="absolute top-4 left-4 z-10 bg-rose-400 text-white text-sm font-bold px-4 py-2 rounded-full shadow-md">
                        {savings}% {t('off')}
                    </div>
                )}
            </div>
          </div>

          {/* Right Column: Details */}
          <div className="md:col-span-6 lg:col-span-6 space-y-6">
            <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-900/30 text-rose-400 dark:text-rose-300 text-xs font-bold uppercase tracking-wider mb-3">
                    {t('bundles_sets')}
                </div>
                <Heading as="h1" size="lg" className="font-sans dark:text-white text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight mb-3 text-slate-900">
                    {getLocalizedField(bundle, 'title', language)}
                </Heading>
                <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed">
                    {getLocalizedField(bundle, 'description', language)}
                </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-end gap-3 mb-2">
                    <div className="text-3xl sm:text-4xl font-bold text-rose-400 dark:text-rose-300">৳{bundle.price}</div>
                    {bundle.original_price && (
                        <div className="text-lg text-slate-400 line-through font-medium mb-1">৳{bundle.original_price}</div>
                    )}
                </div>
                {bundle.is_free_shipping && (
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm font-bold">
                        <CheckCircle2 size={16} />
                        Free Shipping Included
                    </div>
                )}
            </div>

            {/* Bundle Items List */}
            <div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-4 text-lg">What's Inside</h3>
                <div className="space-y-3">
                    {bundle.items?.map((item: any) => {
                        let itemImage = "https://picsum.photos/seed/default/100/100";
                        try {
                            const parsed = JSON.parse(item.product_images);
                            if (Array.isArray(parsed) && parsed.length > 0) itemImage = getImageUrl(parsed[0]);
                        } catch (e) {}

                        return (
                            <div key={item.id} className="flex items-center gap-4 p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                                <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-800 shrink-0 border border-slate-100 dark:border-slate-700">
                                    <ResponsiveImage src={itemImage} alt={item.product_name} width={64} height={64} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <div className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1">{item.product_name}</div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                        Qty: {item.quantity} 
                                        {item.variant_size && ` • Size: ${item.variant_size}`}
                                        {item.variant_color && ` • Color: ${item.variant_color}`}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="pt-4">
                <Button 
                    className="w-full py-4 text-base rounded-xl bg-rose-400 text-white font-bold shadow-lg shadow-rose-400/20 hover:bg-rose-500 hover:shadow-rose-400/30 transition-all duration-300 flex items-center justify-center gap-2"
                    onClick={handleAddToCart}
                >
                    <ShoppingCart size={20} />
                    {t('add_to_cart')}
                </Button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 py-6 border-t border-slate-100 dark:border-slate-800 mt-2">
                <div className="flex flex-col items-center text-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center text-rose-400 dark:text-rose-300">
                        <Truck size={20} />
                    </div>
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Fast Delivery</span>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center text-rose-400 dark:text-rose-300">
                        <ShieldCheck size={20} />
                    </div>
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">100% Authentic</span>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center text-rose-400 dark:text-rose-300">
                        <RefreshCw size={20} />
                    </div>
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Easy Returns</span>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
