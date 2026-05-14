"use client";

import Link from "next/link";
import { ThemeToggle } from "@/app/ThemeToggle";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { API_URL } from "@/lib/config";
import { useSettings } from "@/lib/settings-context";
import { useLanguage } from "@/lib/language-context";
import { getLocalizedField, getImageUrl } from "@/lib/utils";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Menu,
  X,
  Phone,
  ChevronDown,
  ChevronRight,
  Clock,
  TrendingUp,
} from "lucide-react";

export function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOverlayOpen, setIsSearchOverlayOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [popularSearches, setPopularSearches] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [expandedMobileCategories, setExpandedMobileCategories] = useState<string[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isTopBarVisible, setIsTopBarVisible] = useState(true);
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const megaMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { totalItems, clearCart } = useCart();
  const { items: wishlistItems, clearWishlist } = useWishlist();
  const [mounted, setMounted] = useState(false);
  const settings = useSettings();
  const { t, language } = useLanguage();

  useEffect(() => {
    setMounted(true);
    const checkUser = () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser && storedUser !== "undefined" && storedUser !== "null") {
        try {
          const parsed = JSON.parse(storedUser);
          if (parsed && parsed.id) {
            setUser(parsed);
          } else {
            setUser(null);
          }
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setIsLoadingUser(false);
    };

    const storedSearches = localStorage.getItem("recentSearches");
    if (storedSearches) {
      try {
        setRecentSearches(JSON.parse(storedSearches));
      } catch {}
    }

    checkUser();
    fetchCategories();
    fetchPopularSearches();
    window.addEventListener("storage", checkUser);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("storage", checkUser);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle scroll
  useEffect(() => {
    let lastScrollY = 0;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          setIsScrolled(currentScrollY > 50);

          // Only toggle top bar visibility with significant scroll changes (at least 10px)
          const scrollDiff = currentScrollY - lastScrollY;
          if (scrollDiff > 10 && currentScrollY > 100) {
            setIsTopBarVisible(false);
          } else if (scrollDiff < -10 || currentScrollY <= 50) {
            setIsTopBarVisible(true);
          }

          lastScrollY = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/categories?public=true`);
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      console.error("Failed to fetch categories");
    }
  };

  const fetchPopularSearches = async () => {
      try {
          const [brandsRes, catsRes] = await Promise.all([
              fetch(`${API_URL}/brands?public=true`),
              fetch(`${API_URL}/categories?public=true`)
          ]);
          
          const brands = await brandsRes.json();
          const cats = await catsRes.json();
          
          const newPopular: string[] = [];
          
          // Add some brands
          if (Array.isArray(brands)) {
              newPopular.push(...brands.slice(0, 5).map((b: any) => b.name));
          }
          
          // Add some categories
          if (Array.isArray(cats)) {
              newPopular.push(...cats.slice(0, 3).map((c: any) => c.name));
          }
          
          setPopularSearches(newPopular.slice(0, 8));
      } catch (e) {
          console.error("Failed to fetch popular searches", e);
      }
  };

  // Debounce search suggestions
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length >= 3) {
        fetchSuggestions(searchQuery);
      } else {
        setSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchSuggestions = async (query: string) => {
    try {
      const res = await fetch(`${API_URL}/products?search=${encodeURIComponent(query)}&limit=5`);
      const data = await res.json();
      if (data.data && Array.isArray(data.data)) {
        setSuggestions(data.data);
      } else {
        setSuggestions([]);
      }
    } catch {
      setSuggestions([]);
    }
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
      setShowSuggestions(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchQuery);
  };

  const performSearch = (query: string) => {
    if (query.trim()) {
      const updatedSearches = [query, ...recentSearches.filter((s) => s !== query)].slice(0, 5);
      setRecentSearches(updatedSearches);
      localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));

      setShowSuggestions(false);
      setIsSearchOverlayOpen(false);
      router.push(`/products?search=${encodeURIComponent(query)}`);
    }
  };

  const handleMegaMenuEnter = useCallback((categoryId: string) => {
    if (megaMenuTimeoutRef.current) {
      clearTimeout(megaMenuTimeoutRef.current);
    }
    setActiveMegaMenu(categoryId);
  }, []);

  const handleMegaMenuLeave = useCallback(() => {
    megaMenuTimeoutRef.current = setTimeout(() => {
      setActiveMegaMenu(null);
    }, 200);
  }, []);

  const toggleMobileCategory = (categoryId: string) => {
    setExpandedMobileCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId]
    );
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    clearCart();
    clearWishlist();
    window.dispatchEvent(new Event("storage"));
    router.push("/login");
  };

  const isLoggedIn = user && user.id;
  const shopName = getLocalizedField(
    { name: settings.shop_name, name_bn: settings.shop_name_bn },
    "name",
    language
  );
  const cartCount = mounted ? totalItems() : 0;
  const wishlistCount = mounted ? wishlistItems.length : 0;

  return (
    <>
      {/* Top Offer Bar */}
      <div
        className={`bg-sky-500 text-white overflow-hidden transition-all duration-300 ease-in-out ${
          isTopBarVisible ? 'max-h-10 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-2 text-[10px] sm:text-xs font-bold tracking-wide py-1.5 px-4">
          <div className="hidden sm:block">
            {t("free_shipping_offer", { threshold: settings.free_shipping_threshold })}
          </div>

          {/* Mobile: Social Links with Text */}
          <div className="flex sm:hidden items-center gap-3 w-full justify-center">
            <a
              href={settings.facebook_link || "https://facebook.com"}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-sky-100 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.333-4.669 1.212 0 2.493.216 2.493.216v2.733h-1.406c-1.492 0-1.956.926-1.956 1.874v2.25h3.072l-.487 3.47h-2.585v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>Facebook</span>
            </a>
            <span className="text-white/40">|</span>
            <a
              href={`https://wa.me/${(settings.whatsapp_number || "+8801616684803").replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-sky-100 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.015-1.04 2.535 0 1.52 1.115 2.988 1.264 3.186.149.198 2.19 3.348 5.302 4.695.74.325 1.317.521 1.767.664.75.237 1.433.204 1.975.124.603-.088 1.758-.718 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
              </svg>
              <span>WhatsApp</span>
            </a>
            <span className="text-white/40">|</span>
            <a
              href={`tel:${settings.shop_phone || "+8801616684803"}`}
              className="flex items-center gap-1 hover:text-sky-100 transition-colors"
            >
              <Phone size={12} />
              <span>Call</span>
            </a>
          </div>

          {/* Desktop: Phone & Social */}
          <div className="hidden sm:flex items-center gap-4">
            <a
              href={settings.facebook_link}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-sky-100 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.333-4.669 1.212 0 2.493.216 2.493.216v2.733h-1.406c-1.492 0-1.956.926-1.956 1.874v2.25h3.072l-.487 3.47h-2.585v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
            <a
              href={`tel:${settings.shop_phone}`}
              className="flex items-center gap-1 hover:text-sky-100 transition-colors"
            >
              <Phone size={12} />
              <span>{settings.shop_phone}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header
        className={`sticky top-0 z-50 bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 transition-all duration-300 ${
          isScrolled ? "shadow-md" : ""
        }`}
      >
        <div className="max-w-7xl mx-auto px-4">
          {/* Desktop Header */}
          <div className="hidden lg:flex items-center justify-between h-[60px]">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <Image
                src="/logo2.png"
                alt={shopName}
                width={48}
                height={48}
                className="h-10 w-auto object-contain"
              />
              <div className="flex flex-col leading-none">
                <span className="font-bold text-lg text-sky-600 dark:text-sky-400">PrithiBee</span>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">পৃথিবী</span>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="flex items-center gap-1">
{/* Categories with Mega Menu */}
              <div
                className="relative"
                onMouseEnter={() => handleMegaMenuEnter("categories")}
                onMouseLeave={() => {
                  handleMegaMenuLeave();
                  setHoveredCategory(null);
                }}
              >
                <button className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 transition-colors rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                  {t("categories")}
                  <ChevronDown size={16} className={`transition-transform ${activeMegaMenu === "categories" ? "rotate-180" : ""}`} />
                </button>

                {/* Mega Menu - Two Panel Layout */}
                <AnimatePresence>
                  {activeMegaMenu === "categories" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 w-[750px] bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 mt-2 overflow-hidden"
                      onMouseEnter={() => handleMegaMenuEnter("categories")}
                      onMouseLeave={() => {
                        handleMegaMenuLeave();
                        setHoveredCategory(null);
                      }}
                    >
                      <div className="flex">
                        {/* Left Panel - Parent Categories */}
                        <div className="w-[280px] bg-slate-50 dark:bg-slate-800/50 p-4 border-r border-slate-100 dark:border-slate-800 max-h-[400px] overflow-y-auto">
                          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 px-2">
                            Categories
                          </h3>
                          <div className="space-y-1">
                            {categories.map((parentCategory: any) => {
                              const hasChildren = parentCategory.children && parentCategory.children.length > 0;
                              const isHovered = hoveredCategory === parentCategory.id;

                              return (
                                <div
                                  key={parentCategory.id}
                                  onMouseEnter={() => setHoveredCategory(parentCategory.id)}
                                  className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-all ${
                                    isHovered 
                                      ? 'bg-white dark:bg-slate-800 shadow-sm' 
                                      : 'hover:bg-white/50 dark:hover:bg-slate-800/50'
                                  }`}
                                >
                                  <Link
                                    href={`/products?category=${parentCategory.slug || parentCategory.id}`}
                                    className="flex items-center gap-3 flex-1"
                                  >
                                    <div className="w-9 h-9 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700 flex-shrink-0">
                                      <Image
                                        src={getImageUrl(parentCategory.image)}
                                        alt={getLocalizedField(parentCategory, "name", language)}
                                        width={36}
                                        height={36}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                    <span className={`text-sm font-medium transition-colors ${
                                      isHovered 
                                        ? 'text-sky-600 dark:text-sky-400' 
                                        : 'text-slate-700 dark:text-slate-300'
                                    }`}>
                                      {getLocalizedField(parentCategory, "name", language)}
                                    </span>
                                  </Link>
                                  {hasChildren && (
                                    <ChevronRight
                                      size={16}
                                      className={`transition-colors ${
                                        isHovered 
                                          ? 'text-sky-600 dark:text-sky-400' 
                                          : 'text-slate-400'
                                      }`}
                                    />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                            <Link
                              href="/products"
                              className="flex items-center gap-2 px-2 py-2 text-sm font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300"
                            >
                              {t("view_all")} Products
                              <ChevronRight size={16} />
                            </Link>
                          </div>
                        </div>

                        {/* Right Panel - Subcategories */}
                        <div className="flex-1 p-6 max-h-[400px] overflow-y-auto">
                          {hoveredCategory ? (
                            (() => {
                              const parentCategory = categories.find((c: any) => c.id === hoveredCategory);
                              const subCategories = parentCategory?.children || [];

                              if (!parentCategory) return null;

                              return (
                                <div>
                                  <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                                      <Image
                                        src={getImageUrl(parentCategory.image)}
                                        alt={getLocalizedField(parentCategory, "name", language)}
                                        width={48}
                                        height={48}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                    <div>
                                      <h3 className="font-semibold text-slate-900 dark:text-white">
                                        {getLocalizedField(parentCategory, "name", language)}
                                      </h3>
                                      <Link
                                        href={`/products?category=${parentCategory.slug || parentCategory.id}`}
                                        className="text-xs text-sky-600 dark:text-sky-400 hover:underline"
                                      >
                                        View all products →
                                      </Link>
                                    </div>
                                  </div>

                                  {subCategories.length > 0 ? (
                                    <div className="grid grid-cols-2 gap-2">
                                      {subCategories.map((subCat: any) => (
                                        <Link
                                          key={subCat.id}
                                          href={`/products?category=${subCat.slug || subCat.id}`}
                                          className="flex items-center gap-2 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
                                        >
                                          <div className="w-2 h-2 rounded-full bg-sky-500 group-hover:scale-125 transition-transform" />
                                          <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-sky-600 dark:group-hover:text-sky-400">
                                            {getLocalizedField(subCat, "name", language)}
                                          </span>
                                        </Link>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="text-center py-8">
                                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                                        No subcategories available
                                      </p>
                                      <Link
                                        href={`/products?category=${parentCategory.slug || parentCategory.id}`}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-lg text-sm font-medium hover:bg-sky-600 transition-colors"
                                      >
                                        Browse Products
                                        <ChevronRight size={16} />
                                      </Link>
                                    </div>
                                  )}
                                </div>
                              );
                            })()
                          ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center py-8">
                              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                                <ChevronRight size={24} className="text-slate-400" />
                              </div>
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                Hover over a category to see subcategories
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link
                href="/products"
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 transition-colors rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                {t("shop")}
              </Link>
              <Link
                href="/brands"
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 transition-colors rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Brands
              </Link>
            </nav>

            {/* Search Bar */}
            <div ref={searchRef} className="relative flex-1 max-w-md mx-6">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder={t("search_placeholder")}
                    className="w-full h-10 pl-11 pr-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                  />
                </div>
              </form>

              {/* Search Suggestions Dropdown */}
              <AnimatePresence>
                {showSuggestions && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden z-50"
                  >
                    {/* Show search results if query >= 3 and has results */}
                    {searchQuery.length >= 3 && suggestions.length > 0 ? (
                      <div className="p-2">
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 px-2">
                          Search Results
                        </p>
                        {suggestions.map((product) => (
                          <Link
                            key={product.id}
                            href={`/products/${product.slug || product.id}`}
                            onClick={() => setShowSuggestions(false)}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
                          >
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800">
                              <Image
                                src={getImageUrl(product.images?.[0])}
                                alt={product.name}
                                width={40}
                                height={40}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 line-clamp-1">
                                {getLocalizedField(product, "name", language)}
                              </p>
                              <p className="text-sm font-bold text-orange-500">৳{product.price}</p>
                            </div>
                          </Link>
                        ))}
                        <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                            <Link
                                href={`/products?search=${encodeURIComponent(searchQuery)}`}
                                className="block w-full py-2 text-center text-sm font-bold text-sky-600 hover:bg-sky-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                onClick={() => setShowSuggestions(false)}
                            >
                                View all results for "{searchQuery}"
                            </Link>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 space-y-4">
                        {/* Minimum characters hint */}
                        {searchQuery.length > 0 && searchQuery.length < 3 && (
                          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                            <Search size={16} />
                            <span>Type at least 3 characters to search</span>
                          </div>
                        )}

                        {/* No results message */}
                        {searchQuery.length >= 3 && suggestions.length === 0 && (
                          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                            <Search size={16} />
                            <span>No products found for "{searchQuery}"</span>
                          </div>
                        )}

                        {/* Popular Searches */}
                        <div>
                          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1">
                            <TrendingUp size={12} /> Popular Searches
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {popularSearches.map((term) => (
                              <button
                                key={term}
                                onClick={() => performSearch(term)}
                                className="px-3 py-1.5 text-sm bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 rounded-full hover:bg-sky-100 dark:hover:bg-sky-900/50 transition-colors"
                              >
                                {term}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Recent Searches */}
                        {recentSearches.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1">
                              <Clock size={12} /> Recent Searches
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {recentSearches.map((term) => (
                                <button
                                  key={term}
                                  onClick={() => performSearch(term)}
                                  className="px-3 py-1.5 text-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                >
                                  {term}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              <LanguageToggle />
              <ThemeToggle />

              {/* Wishlist */}
              <Link
                href="/wishlist"
                className="relative p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors touch-target"
              >
                <Heart size={22} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce-in">
                    {wishlistCount > 9 ? "9+" : wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link
                href="/cart"
                className="relative p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors touch-target"
              >
                <ShoppingCart size={22} />
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-orange-400 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                  >
                    {cartCount > 9 ? "9+" : cartCount}
                  </motion.span>
                )}
              </Link>

              {/* User */}
              {isLoggedIn ? (
                <div className="relative group">
                  <button className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors touch-target">
                    <User size={22} />
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                      <p className="font-medium text-slate-900 dark:text-white truncate">{user.name}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                    </div>
                    <div className="p-2">
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg"
                      >
                        My Account
                      </Link>
                      <Link
                        href="/profile/orders"
                        className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg"
                      >
                        My Orders
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg"
                      >
                        {t("logout")}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors touch-target"
                  title={t("login")}
                >
                  <User size={22} />
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Header */}
          <div className="flex lg:hidden items-center justify-between h-14">
            {/* Left - Hamburger Menu + Logo */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 -ml-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors touch-target"
              >
                <Menu size={24} />
              </button>

              {/* Logo - Same as Desktop */}
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="/logo2.png"
                  alt={shopName}
                  width={36}
                  height={36}
                  className="h-8 w-auto object-contain"
                />
                <div className="flex flex-col leading-none">
                  <span className="font-bold text-base text-sky-600 dark:text-sky-400">PrithiBee</span>
                  <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">পৃথিবী</span>
                </div>
              </Link>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsSearchOverlayOpen(true)}
                className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors touch-target"
              >
                <Search size={22} />
              </button>
              <Link
                href="/cart"
                className="relative p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors touch-target"
              >
                <ShoppingCart size={22} />
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-orange-400 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                  >
                    {cartCount > 9 ? "9+" : cartCount}
                  </motion.span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* Trust Bar (Desktop Only) */}
        <div className="hidden lg:block border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div className="max-w-7xl mx-auto px-4 py-2">
            <div className="flex justify-center gap-8 text-xs text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                {t("authentic")}
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Easy Returns
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Secure Payment
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Search Overlay */}
      <AnimatePresence>
        {isSearchOverlayOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#E6F4FF] dark:bg-slate-950 z-[60] overflow-y-auto"
          >
            <div className="p-4">
              <div className="flex items-center gap-3 mb-6">
                <form onSubmit={handleSearch} className="flex-1">
                  <div className="relative">
                    <Search
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      ref={searchInputRef}
                      autoFocus
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t("search_placeholder")}
                      className="w-full h-12 pl-11 pr-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-base focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    />
                  </div>
                </form>
                <button
                  onClick={() => setIsSearchOverlayOpen(false)}
                  className="text-slate-600 dark:text-slate-400 font-medium"
                >
                  Cancel
                </button>
              </div>

              {/* Minimum characters hint */}
              {searchQuery.length > 0 && searchQuery.length < 3 && (
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 p-3 rounded-lg mb-4">
                  <Search size={16} />
                  <span>Type at least 3 characters to search</span>
                </div>
              )}

              {/* No results message */}
              {searchQuery.length >= 3 && suggestions.length === 0 && (
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 p-3 rounded-lg mb-4">
                  <Search size={16} />
                  <span>No products found for "{searchQuery}"</span>
                </div>
              )}

              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
                    <Clock size={14} /> Recent
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((term) => (
                      <button
                        key={term}
                        onClick={() => performSearch(term)}
                        className="px-4 py-2 text-sm bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full shadow-sm"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Trending Searches */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
                  <TrendingUp size={14} /> Trending
                </h3>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((term) => (
                    <button
                      key={term}
                      onClick={() => performSearch(term)}
                      className="px-4 py-2 text-sm bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full shadow-sm"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search Results */}
              {suggestions.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">
                    Results
                  </h3>
                  <div className="space-y-2">
                    {suggestions.map((product) => (
                      <Link
                        key={product.id}
                        href={`/products/${product.slug || product.id}`}
                        onClick={() => setIsSearchOverlayOpen(false)}
                        className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm"
                      >
                        <div className="w-14 h-14 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700">
                          <Image
                            src={getImageUrl(product.images?.[0])}
                            alt={product.name}
                            width={56}
                            height={56}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-slate-800 dark:text-white line-clamp-1">
                            {getLocalizedField(product, "name", language)}
                          </p>
                          <p className="text-lg font-bold text-orange-500">৳{product.price}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <div className="mt-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <Link
                          href={`/products?search=${encodeURIComponent(searchQuery)}`}
                          className="block w-full py-3 text-center text-sm font-bold text-white bg-sky-500 hover:bg-sky-600 rounded-xl transition-colors shadow-sm"
                          onClick={() => setIsSearchOverlayOpen(false)}
                      >
                          View all results for "{searchQuery}"
                      </Link>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-[60]"
            />

            {/* Menu Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-[85%] max-w-sm bg-white dark:bg-slate-950 z-[61] overflow-y-auto"
            >
              {/* Menu Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
                <Link
                  href="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2"
                >
                  <Image
                    src="/logo2.png"
                    alt={shopName}
                    width={40}
                    height={40}
                    className="h-9 w-auto object-contain"
                  />
                  <div className="flex flex-col leading-none">
                    <span className="font-bold text-lg text-sky-600 dark:text-sky-400">PrithiBee</span>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">পৃথিবী</span>
                  </div>
                </Link>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors touch-target"
                >
                  <X size={24} />
                </button>
              </div>

              {/* User Section */}
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                {isLoggedIn ? (
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-sky-100 dark:bg-sky-900/50 flex items-center justify-center text-sky-600 dark:text-sky-400 font-bold text-lg">
                      {user.name?.charAt(0) || "U"}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{user.name}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
                    </div>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3"
                  >
                    <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400">
                      <User size={24} />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{t("login")}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Sign in to your account</p>
                    </div>
                  </Link>
                )}
              </div>

              {/* Navigation Links */}
              <nav className="p-4">
                <Link
                  href="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl"
                >
                  {t("home")}
                </Link>

                {/* Categories Accordion */}
                <div>
                  <button
                    onClick={() => toggleMobileCategory("main-categories")}
                    className="flex items-center justify-between w-full px-4 py-3 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl"
                  >
                    <span>{t("categories")}</span>
                    <ChevronDown
                      size={18}
                      className={`transition-transform duration-200 ${
                        expandedMobileCategories.includes("main-categories") ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {expandedMobileCategories.includes("main-categories") && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="pl-2 pb-2 space-y-1">
                          {categories.map((parentCategory: any) => {
                              const subCategories = parentCategory.children || [];
                              const hasSubCategories = subCategories.length > 0;
                              const isExpanded = expandedMobileCategories.includes(parentCategory.id);

                              return (
                                <div key={parentCategory.id} className="border-l-2 border-slate-100 dark:border-slate-800 ml-2">
                                  {hasSubCategories ? (
                                    // Parent category with subcategories - entire row is clickable to expand
                                    <button
                                      onClick={() => toggleMobileCategory(parentCategory.id)}
                                      className="flex items-center justify-between w-full px-3 py-2.5 text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg"
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                                          <Image
                                            src={getImageUrl(parentCategory.image)}
                                            alt={getLocalizedField(parentCategory, "name", language)}
                                            width={32}
                                            height={32}
                                            className="w-full h-full object-cover"
                                          />
                                        </div>
                                        <div className="flex flex-col items-start">
                                          <span className="text-sm font-medium">
                                            {getLocalizedField(parentCategory, "name", language)}
                                          </span>
                                          <span className="text-xs text-slate-400 dark:text-slate-500">
                                            {subCategories.length} subcategories
                                          </span>
                                        </div>
                                      </div>
                                      <ChevronRight
                                        size={18}
                                        className={`text-slate-400 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}
                                      />
                                    </button>
                                  ) : (
                                    // Parent category without subcategories - link directly
                                    <Link
                                      href={`/products?category=${parentCategory.slug || parentCategory.id}`}
                                      onClick={() => setIsMobileMenuOpen(false)}
                                      className="flex items-center gap-3 px-3 py-2.5 text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg"
                                    >
                                      <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                                        <Image
                                          src={getImageUrl(parentCategory.image)}
                                          alt={getLocalizedField(parentCategory, "name", language)}
                                          width={32}
                                          height={32}
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                      <span className="text-sm font-medium">
                                        {getLocalizedField(parentCategory, "name", language)}
                                      </span>
                                    </Link>
                                  )}

                                  {/* Subcategories */}
                                  <AnimatePresence>
                                    {hasSubCategories && isExpanded && (
                                      <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden"
                                      >
                                        <div className="ml-4 pl-4 pb-2 pt-1 space-y-0.5 border-l-2 border-sky-100 dark:border-sky-900">
                                          {/* View all link for parent category */}
                                          <Link
                                            href={`/products?category=${parentCategory.slug || parentCategory.id}`}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="block px-3 py-2 text-sm font-medium text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/30 rounded-lg"
                                          >
                                            View All {getLocalizedField(parentCategory, "name", language)}
                                          </Link>
                                          {subCategories.map((subCat: any) => (
                                            <Link
                                              key={subCat.id}
                                              href={`/products?category=${subCat.slug || subCat.id}`}
                                              onClick={() => setIsMobileMenuOpen(false)}
                                              className="block px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
                                            >
                                              {getLocalizedField(subCat, "name", language)}
                                            </Link>
                                          ))}
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              );
                            })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <Link
                  href="/products"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl"
                >
                  {t("shop")}
                </Link>

                <Link
                  href="/products?sort=new"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl"
                >
                  {t("new_arrivals")}
                </Link>

                <Link
                  href="/bundles"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl"
                >
                  {t("bundles_sets")}
                </Link>

                <Link
                  href="/about"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl"
                >
                  {t("about")}
                </Link>

                <Link
                  href="/brands"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl"
                >
                  Brands
                </Link>

                <Link
                  href="/wishlist"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between px-4 py-3 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl"
                >
                  <span className="flex items-center gap-3">
                    <Heart size={18} />
                    Wishlist
                  </span>
                  {wishlistCount > 0 && (
                    <span className="w-6 h-6 bg-rose-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
              </nav>

              {/* Bottom Section */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 mt-auto">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Language</span>
                  <LanguageToggle />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Theme</span>
                  <ThemeToggle />
                </div>

                {isLoggedIn && (
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full mt-4 px-4 py-3 text-rose-600 border border-rose-200 dark:border-rose-800 rounded-xl text-center font-medium hover:bg-rose-50 dark:hover:bg-rose-900/20"
                  >
                    {t("logout")}
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
