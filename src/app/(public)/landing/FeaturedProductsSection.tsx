"use client";

import { Section, Heading, ResponsiveImage, Button } from "@/components/ui";
import type { FeaturedProduct } from "./types";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { useToast } from "@/components/ui/Toast";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";
import { getImageUrl, getLocalizedField } from "@/lib/utils";
import { useEffect, useState, useCallback } from "react";
import { API_URL } from "@/lib/config";
import { motion } from "framer-motion";
import { Heart, ShoppingCart, ChevronRight, Star } from "lucide-react";

interface MotherCategoryTab {
  id: string;
  slug?: string;
  name: string;
  name_bn?: string;
}

interface FeaturedProductsSectionProps {
  title: string;
  subtitle?: string;
  products: FeaturedProduct[];
  viewAllHref?: string;
  motherCategories?: MotherCategoryTab[];
}

export function FeaturedProductsSection({
  title,
  subtitle,
  products,
  viewAllHref,
  motherCategories = [],
}: FeaturedProductsSectionProps) {
  const { addItem } = useCart();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, items: wishlistItems } = useWishlist();
  const { addToast } = useToast();
  const { t, language } = useLanguage();
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [animatingProductId, setAnimatingProductId] = useState<string | null>(null);
  const [heartAnimatingId, setHeartAnimatingId] = useState<string | null>(null);
  const [selectedMotherCategory, setSelectedMotherCategory] = useState<string | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) return;
    try {
      const parsed = JSON.parse(userStr) as { id: string };
      if (parsed && parsed.id) {
        setUser(parsed);
      }
    } catch {
      // ignore invalid stored user
    }
  }, []);

  const handleAddToCart = useCallback((product: FeaturedProduct, e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    const priceValue = parseFloat(product.price.replace(/[^0-9.]/g, ""));

    addItem({
      id: product.id,
      slug: product.slug, // Pass slug
      name: getLocalizedField(product, "name", language),
      price: isNaN(priceValue) ? 0 : priceValue,
      image: product.image.src,
      quantity: 1,
      stock: 999,
    });

    setAnimatingProductId(product.id);
    setTimeout(() => setAnimatingProductId(null), 500);

    addToast(
      `Added ${getLocalizedField(product, "name", language)} to cart`,
      "success",
      { label: "View Cart", href: "/cart" }
    );
  }, [addItem, addToast, language]);

  const toggleWishlist = useCallback(
    async (product: FeaturedProduct, e?: React.MouseEvent) => {
      e?.preventDefault();
      e?.stopPropagation();

      const priceValue = parseFloat(product.price.replace(/[^0-9.]/g, ""));
      const isWishlisted = wishlistItems.some((i) => i.id === product.id);

      setHeartAnimatingId(product.id);
      setTimeout(() => setHeartAnimatingId(null), 500);

      if (isWishlisted) {
        removeFromWishlist(product.id);
        addToast("Removed from wishlist");
        if (user) {
          try {
            await fetch(`${API_URL}/wishlist/${user.id}/${product.id}`, { method: "DELETE" });
          } catch {}
        }
      } else {
        addToWishlist({
          id: product.id,
          slug: product.slug, // Pass slug
          name: getLocalizedField(product, "name", language),
          price: isNaN(priceValue) ? 0 : priceValue,
          image: product.image.src,
        });
        addToast("Added to wishlist");
        if (user) {
          try {
            await fetch(`${API_URL}/wishlist/${user.id}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ productId: product.id }),
            });
          } catch {}
        }
      }
    },
    [addToast, addToWishlist, removeFromWishlist, user, wishlistItems, language]
  );

  const filteredProducts = selectedMotherCategory
    ? products.filter((p) => (p as any).mother_category_id === selectedMotherCategory)
    : products;

  // Limit to maximum 10 products per tab
  const displayProducts = filteredProducts.slice(0, 10);

  return (
    <Section variant="blue" className="py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mother category tabs (optional) */}
        {motherCategories.length > 0 && (
          <div className="flex justify-center mb-6 sm:mb-8">
            <div className="inline-flex bg-white dark:bg-slate-800 p-1.5 rounded-full shadow-sm border border-slate-100 dark:border-slate-700">
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
                      layoutId="activeTabFeatured"
                      className="absolute inset-0 bg-rose-400 rounded-full"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
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
                    layoutId="activeTabFeatured"
                    className="absolute inset-0 bg-rose-400 rounded-full"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  {language === "bn" ? "সব" : "All"}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 sm:mb-8 gap-3">
          <div>
            <Heading
              size="md"
              className="font-sans text-slate-900 dark:text-white font-bold text-xl sm:text-2xl tracking-tight"
            >
              {title}
            </Heading>
            {subtitle && (
              <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base mt-1 font-medium">
                {subtitle}
              </p>
            )}
          </div>
          {viewAllHref && (
            <Link
              href={viewAllHref}
              className="text-sm font-bold text-rose-400 hover:text-rose-500 flex items-center gap-1 bg-white/50 dark:bg-slate-800/50 px-4 py-2 rounded-full backdrop-blur-sm border border-slate-200 dark:border-slate-700 shadow-sm transition-all hover:shadow-md"
            >
              {t("view_all")}
              <ChevronRight size={16} />
            </Link>
          )}
        </div>

        {/* Products Grid */}
        <div className="relative group">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {displayProducts.map((product, index) => {
              const isWishlisted = wishlistItems.some((i) => i.id === product.id);
              const isAnimating = animatingProductId === product.id;
              const isHeartAnimating = heartAnimatingId === product.id;

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  className="group/card bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative flex flex-col"
                >
                  {/* Image Container */}
                  <div className="relative aspect-square overflow-hidden">
                    <Link href={product.href} className="block w-full h-full">
                      <ResponsiveImage
                        src={getImageUrl(product.image.src)}
                        alt={getLocalizedField(product, "name", language)}
                        width={300}
                        height={300}
                        className="object-cover w-full h-full group-hover/card:scale-105 transition-transform duration-500 ease-out"
                      />
                    </Link>

                    {/* Badges */}
                    {product.tag && (
                      <div className="absolute top-2 left-2 z-10">
                        <span className="bg-rose-300 text-white px-2 py-1 text-[10px] font-bold uppercase tracking-wide rounded-md shadow-sm">
                          {product.tag}
                        </span>
                      </div>
                    )}

                    {/* Wishlist Button */}
                    <motion.button
                      onClick={(e) => toggleWishlist(product, e)}
                      animate={isHeartAnimating && !isWishlisted ? { scale: [1, 1.3, 1] } : {}}
                      className={`absolute top-2 right-2 z-20 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 shadow-md touch-target ${
                        isWishlisted
                          ? "bg-rose-500 text-white"
                          : "bg-white/90 dark:bg-slate-700/90 text-slate-400 hover:text-rose-500"
                      }`}
                    >
                      <Heart
                        size={18}
                        fill={isWishlisted ? "currentColor" : "none"}
                        className={isHeartAnimating ? "animate-heart-beat" : ""}
                      />
                    </motion.button>
                  </div>

                  {/* Content */}
                  <div className="p-3 flex flex-col flex-grow">
                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-1">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={12}
                            className={i < (product.rating || 5) ? "text-amber-400 fill-amber-400" : "text-slate-200"}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">({product.reviewCount || 0})</span>
                    </div>

                    {/* Product Name */}
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-2 leading-snug min-h-[2.5em] mb-2">
                      <Link href={product.href} className="hover:text-rose-400 transition-colors">
                        {getLocalizedField(product, "name", language)}
                      </Link>
                    </h3>

                    {/* Price & Add to Cart */}
                    <div className="mt-auto pt-2 space-y-2">
                      <div className="text-lg font-bold text-rose-400">{product.price}</div>

                      <motion.div animate={isAnimating ? { scale: [1, 0.95, 1] } : {}}>
                        <Button
                          onClick={(e: React.MouseEvent) => handleAddToCart(product, e)}
                          className={`w-full py-2.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 min-h-[40px] transition-colors ${
                            isAnimating ? "bg-green-500 text-white" : "bg-rose-400 text-white hover:bg-rose-400"
                          }`}
                        >
                          <ShoppingCart size={14} />
                          {isAnimating ? "✓ Added!" : t("add_to_cart")}
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </Section>
  );
}
