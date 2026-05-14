"use client";

import { useWishlist, type WishlistItem } from "@/lib/wishlist";
import { useCart } from "@/lib/cart";
import { Button, Heading, ResponsiveImage } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { useLanguage } from "@/lib/language-context";
import Link from "next/link";
import { useEffect, useState } from "react";
import { API_URL } from "@/lib/config";
import { getImageUrl } from "@/lib/utils";

interface WishlistUser {
  id: string;
  [key: string]: unknown;
}

export default function WishlistPage() {
  const { items, removeItem } = useWishlist();
  const { addItem } = useCart();
  const { addToast } = useToast();
  const { t } = useLanguage();
  const [user, setUser] = useState<WishlistUser | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) return;
    try {
      const parsed = JSON.parse(userStr) as WishlistUser;
      if (parsed && parsed.id) {
        setUser(parsed);
      }
    } catch {
      // ignore invalid stored user
    }
  }, []);

  const handleRemove = async (id: string) => {
    removeItem(id);
    addToast("Removed from wishlist");
    if (!user) return;

    try {
      await fetch(`${API_URL}/wishlist/${user.id}/${id}`, { method: "DELETE" });
    } catch {
      // ignore network errors for background sync
    }
  };

  const handleAddToCart = (item: WishlistItem) => {
    addItem({
      id: item.id,
      slug: item.slug, // Pass slug
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: 1,
      stock: 999, // Default stock since wishlist doesn't track it. Cart validation will handle real check if implemented.
    });
    addToast(`Added ${item.name} to cart`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Heading size="xl" className="font-sans text-slate-900 dark:text-white mb-8 font-bold">
          My Wishlist <span className="text-slate-400 font-medium text-lg ml-2">({items.length})</span>
        </Heading>

        {items.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl shadow-sm">
            <div className="text-6xl mb-4">❤️</div>
            <p className="text-slate-500 dark:text-slate-400 mb-6">Your wishlist is empty.</p>
            <Link href="/products">
              <Button className="rounded-xl px-8 py-3 shadow-lg shadow-sky-500/20">{t("start_shopping")}</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 group hover:shadow-md transition-all"
              >
                <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-700 mb-4">
                  <Link href={`/products/${item.slug || item.id}`} className="block w-full h-full">
                    <ResponsiveImage
                      src={getImageUrl(item.image)}
                      alt={item.name}
                      width={400}
                      height={400}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-colors shadow-sm"
                    title="Remove"
                  >
                    ✕
                  </button>
                </div>

                <h3 className="font-bold text-slate-900 dark:text-white mb-1 line-clamp-1">
                  <Link href={`/products/${item.slug || item.id}`} className="hover:text-sky-500 transition-colors">
                    {item.name}
                  </Link>
                </h3>
                <div className="text-sky-500 font-bold text-lg mb-4">৳{item.price}</div>

                <Button
                  fullWidth
                  onClick={() => handleAddToCart(item)}
                  className="rounded-xl py-2 text-sm font-bold bg-sky-50 text-sky-600 hover:bg-sky-100 dark:bg-sky-900/30 dark:text-sky-400"
                >
                  {t("add_to_cart")}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
