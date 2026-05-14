"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart";
import { useEffect, useState, useRef } from "react";
import { useLanguage } from "@/lib/language-context";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Grid3X3, ShoppingCart, User } from "lucide-react";

export function BottomNav() {
  const pathname = usePathname();
  const { totalItems } = useCart();
  const [mounted, setMounted] = useState(false);
  const { t } = useLanguage();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [prevCartCount, setPrevCartCount] = useState(0);
  const [animateBadge, setAnimateBadge] = useState(false);

  useEffect(() => {
    setMounted(true);
    const userStr = localStorage.getItem("user");
    setIsLoggedIn(!!userStr);
  }, []);

  // Animate badge when cart count changes
  const cartCount = mounted ? totalItems() : 0;
  useEffect(() => {
    if (mounted && cartCount > prevCartCount && cartCount > 0) {
      setAnimateBadge(true);
      const timer = setTimeout(() => setAnimateBadge(false), 300);
      return () => clearTimeout(timer);
    }
    setPrevCartCount(cartCount);
  }, [cartCount, prevCartCount, mounted]);

  const navItems = [
    {
      label: t("home"),
      href: "/",
      Icon: Home,
    },
    {
      label: t("categories"),
      href: "/products",
      Icon: Grid3X3,
    },
    {
      label: "Cart",
      href: "/cart",
      Icon: ShoppingCart,
      badge: cartCount > 0 ? cartCount : null,
    },
    {
      label: isLoggedIn ? "Account" : t("login"),
      href: isLoggedIn ? "/profile" : "/login",
      Icon: User,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 z-50 lg:hidden pb-safe">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.Icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center w-full h-full gap-1 transition-colors touch-target"
            >
              <div className="relative">
                {/* Active background pill */}
                {isActive && (
                  <motion.div
                    layoutId="bottomNavIndicator"
                    className="absolute -inset-1.5 bg-sky-100 dark:bg-sky-900/50 rounded-xl"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}

                <Icon
                  size={22}
                  className={`relative z-10 transition-all duration-200 ${
                    isActive
                      ? "text-sky-600 dark:text-sky-400 scale-105"
                      : "text-slate-500 dark:text-slate-400"
                  }`}
                />

                {/* Cart Badge */}
                {item.badge && (
                  <motion.span
                    key={item.badge}
                    initial={{ scale: 0 }}
                    animate={{ scale: animateBadge && item.href === "/cart" ? [1, 1.3, 1] : 1 }}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-orange-400 text-white text-[10px] font-bold rounded-full flex items-center justify-center z-20 shadow-sm"
                  >
                    {item.badge > 9 ? "9+" : item.badge}
                  </motion.span>
                )}
              </div>

              <span
                className={`text-[10px] font-medium transition-colors ${
                  isActive ? "text-sky-600 dark:text-sky-400" : "text-slate-500 dark:text-slate-400"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
