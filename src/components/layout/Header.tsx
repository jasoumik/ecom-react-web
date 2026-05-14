"use client";

import Link from "next/link";
import { Button } from "@/components/ui";
import { ThemeToggle } from "@/app/ThemeToggle";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { API_URL } from "@/lib/config";
import { useSettings } from "@/lib/settings-context";
import { useLanguage } from "@/lib/language-context";
import { getLocalizedField, getImageUrl } from "@/lib/utils";
import Image from "next/image";
import { User } from "lucide-react";

export function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [popularSearches, setPopularSearches] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [expandedMobileCategories, setExpandedMobileCategories] = useState<string[]>([]);
  const [isMobileCategoriesOpen, setIsMobileCategoriesOpen] = useState(true);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { totalItems } = useCart();
  const { items: wishlistItems } = useWishlist();
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
        } catch (e) {
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
        } catch (e) {}
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

  const fetchCategories = async () => {
      try {
          const res = await fetch(`${API_URL}/categories?public=true`);
          const data = await res.json();
          setCategories(Array.isArray(data) ? data : []);
      } catch (e) {
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

  const toggleMobileCategory = (categoryId: string) => {
      setExpandedMobileCategories(prev => 
          prev.includes(categoryId) 
              ? prev.filter(id => id !== categoryId) 
              : [...prev, categoryId]
      );
  };

  // Debounce search suggestions
  useEffect(() => {
      const timer = setTimeout(() => {
          // Trigger search only if 3 or more characters
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
              // Use backend results directly (backend handles case-insensitive search)
              setSuggestions(data.data);
          } else {
              setSuggestions([]);
          }
      } catch (e) {
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
      const updatedSearches = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
      setRecentSearches(updatedSearches);
      localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
      
      setShowSuggestions(false);
      setIsSearchOpen(false);
      router.push(`/products?search=${encodeURIComponent(query)}`);
    }
  };

  const clearSearch = () => {
      setSearchQuery("");
      setSuggestions([]);
  };

  const handleLogout = () => {
    setIsLoggingOut(true);
    // Simulate a small delay for better UX
    setTimeout(() => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setUser(null);
        window.dispatchEvent(new Event("storage")); // Notify other components
        router.push("/login");
        setIsLoggingOut(false);
    }, 500);
  };

  const isLoggedIn = user && user.id;

  // Helper to get shop name
  const shopName = getLocalizedField({ name: settings.shop_name, name_bn: settings.shop_name_bn }, 'name', language);

  return (
    <>
      {/* Top Offer Bar */}
      <div className="bg-sky-500 text-white py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-2 text-[10px] sm:text-xs font-bold tracking-wide">
          {/* Desktop: Free Shipping Text */}
          <div className="hidden sm:block">
            {t('free_shipping_offer', { threshold: settings.free_shipping_threshold })}
          </div>

          {/* Mobile: Social Icons */}
          <div className="flex sm:hidden items-center gap-4 w-full justify-center">
             <a href={settings.facebook_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-sky-100 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.333-4.669 1.212 0 2.493.216 2.493.216v2.733h-1.406c-1.492 0-1.956.926-1.956 1.874v2.25h3.072l-.487 3.47h-2.585v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                <span>Facebook</span>
             </a>
             <a href={`https://wa.me/${settings.whatsapp_number}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-sky-100 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.015-1.04 2.535 0 1.52 1.115 2.988 1.264 3.186.149.198 2.19 3.348 5.302 4.695.74.325 1.317.521 1.767.664.75.237 1.433.204 1.975.124.603-.088 1.758-.718 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                <span>WhatsApp</span>
             </a>
          </div>

          {/* Desktop: Phone Number & Socials */}
          <div className="hidden sm:flex items-center gap-4 justify-end">
            <a href={settings.facebook_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-sky-100 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.333-4.669 1.212 0 2.493.216 2.493.216v2.733h-1.406c-1.492 0-1.956.926-1.956 1.874v2.25h3.072l-.487 3.47h-2.585v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
            <a href={`tel:${settings.shop_phone}`} className="flex items-center gap-1 hover:text-sky-100 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.536 0 1.52 1.115 2.988 1.264 3.186.149.198 2.19 3.349 5.302 4.695.74.326 1.317.521 1.767.664.75.238 1.433.204 1.975.124.603-.088 1.758-.718 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <span>{settings.shop_phone}</span>
            </a>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md shadow-sm dark:bg-slate-950/95 dark:border-b dark:border-slate-800 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 sm:h-20 items-center justify-between gap-2 sm:gap-4">
            {/* Left: Mobile Menu & Logo */}
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                <button 
                    className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg dark:text-slate-300 dark:hover:bg-slate-800 shrink-0"
                    onClick={() => setIsMobileMenuOpen(true)}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                </button>

                <Link href="/" className="flex items-center gap-2 shrink-0">
                    <Image 
                        src="/logo3.png"
                        alt={settings.shop_name} 
                        width={120} 
                        height={50}
                        className="h-8 sm:h-10 w-auto object-contain"
                        priority
                    />
                    <span className="font-bold text-lg text-sky-600 dark:text-sky-400">
                        {language === 'bn' ? 'পৃথিবী' : 'PrithiBee'}
                    </span>
                </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6 ml-4">
                {/* Categories Dropdown */}
                <div className="relative group">
                    <button className="flex items-center gap-1 text-sm font-bold text-slate-600 hover:text-sky-500 transition-colors dark:text-slate-300 dark:hover:text-sky-400 py-4">
                        {t('categories')}
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </button>
                    <div className="absolute top-full left-0 w-64 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0">
                        {categories.map((cat) => (
                            <div key={cat.id} className="relative group/sub">
                                <Link 
                                    href={`/products?category=${cat.id}`}
                                    className="flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-slate-800 hover:text-sky-600 dark:hover:text-sky-400"
                                >
                                    {getLocalizedField(cat, 'name', language)}
                                    {cat.children && cat.children.length > 0 && (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="-rotate-90"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                    )}
                                </Link>
                                {cat.children && cat.children.length > 0 && (
                                    <div className="absolute top-0 left-full ml-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 p-2 opacity-0 invisible group-hover/sub:opacity-100 group-hover/sub:visible transition-all duration-200">
                                        {cat.children.map((sub: any) => (
                                            <Link 
                                                key={sub.id}
                                                href={`/products?category=${sub.id}`}
                                                className="block px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-slate-800 hover:text-sky-600 dark:hover:text-sky-400"
                                            >
                                                {getLocalizedField(sub, 'name', language)}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                <Link href="/products" className="text-sm font-bold text-slate-600 hover:text-sky-500 transition-colors dark:text-slate-300 dark:hover:text-sky-400">{t('shop')}</Link>
                <Link href="/brands" className="text-sm font-bold text-slate-600 hover:text-sky-500 transition-colors dark:text-slate-300 dark:hover:text-sky-400">Brands</Link>
            </nav>

            {/* Desktop Search Bar */}
            <div className="hidden lg:flex flex-1 max-w-md mx-auto relative" ref={searchRef}>
              <form onSubmit={handleSearch} className="w-full relative">
                <input
                  type="text"
                  placeholder={t('search_placeholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all dark:bg-slate-900 dark:border-slate-700 dark:text-white dark:placeholder-slate-500"
                />
                {searchQuery && (
                    <button 
                        type="button"
                        onClick={clearSearch}
                        className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                )}
                <button 
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-500 transition-colors p-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </button>
              </form>
              {/* Suggestions Dropdown */}
              {showSuggestions && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                      {searchQuery.trim().length === 0 ? (
                          <div className="p-4 text-sm text-slate-500">
                              {recentSearches.length > 0 && (
                                  <div className="mb-4">
                                      <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Recent Searches</h4>
                                      <div className="flex flex-wrap gap-2">
                                          {recentSearches.map(s => (
                                              <button key={s} onClick={() => performSearch(s)} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs hover:bg-sky-50 dark:hover:bg-sky-900/30 transition-colors">
                                                  {s}
                                              </button>
                                          ))}
                                      </div>
                                  </div>
                              )}
                              <div>
                                  <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Popular</h4>
                                  <div className="flex flex-wrap gap-2">
                                      {popularSearches.map(s => (
                                          <button key={s} onClick={() => performSearch(s)} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs hover:bg-sky-50 dark:hover:bg-sky-900/30 transition-colors">
                                              {s}
                                          </button>
                                      ))}
                                  </div>
                              </div>
                          </div>
                      ) : searchQuery.trim().length < 3 ? (
                          <div className="p-4 text-sm text-slate-500">Keep typing to see suggestions...</div>
                      ) : suggestions.length > 0 ? (
                          <>
                            <ul>
                                {suggestions.map((product) => (
                                    <li key={product.id}>
                                        <Link 
                                            href={`/products/${product.id}`}
                                            className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3"
                                            onClick={() => setShowSuggestions(false)}
                                        >
                                            <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0">
                                                <Image src={getImageUrl(product.images?.[0])} alt={product.name} width={40} height={40} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 truncate">
                                                <div className="font-bold truncate">{getLocalizedField(product, 'name', language)}</div>
                                                <div className="text-xs text-slate-500">৳{product.price}</div>
                                            </div>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                            <div className="p-2 border-t border-slate-100 dark:border-slate-800">
                                <Link
                                    href={`/products?search=${encodeURIComponent(searchQuery)}`}
                                    className="block w-full py-2 text-center text-sm font-bold text-sky-600 hover:bg-sky-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                    onClick={() => setShowSuggestions(false)}
                                >
                                    View all results for "{searchQuery}"
                                </Link>
                            </div>
                          </>
                      ) : (
                          <div className="p-4 text-sm text-slate-500">No products found for "{searchQuery}".</div>
                      )}
                  </div>
              )}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              {/* Mobile Search Toggle */}
              <button 
                className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors dark:text-slate-300 dark:hover:bg-slate-800"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </button>

              {/* Language Toggle - Hidden on Mobile */}
              <div className="hidden sm:block">
                  <LanguageToggle className="p-1.5 sm:p-2 rounded-xl text-slate-600 dark:text-slate-300 text-xs sm:text-sm" />
              </div>

              {/* Theme Toggle - Hidden on Mobile */}
              <div className="hidden sm:block">
                  <ThemeToggle className="p-1.5 sm:p-2 rounded-xl text-slate-600 dark:text-yellow-400 text-xs sm:text-sm" />
              </div>

              {/* Wishlist Icon - Hidden on Mobile */}
              <Link href="/wishlist" className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors dark:text-slate-300 dark:hover:bg-slate-800 hidden sm:block">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
                {mounted && wishlistItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {wishlistItems.length}
                  </span>
                )}
              </Link>

              {/* Cart Icon */}
              <Link href="/cart" className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors dark:text-slate-300 dark:hover:bg-slate-800">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                {mounted && totalItems() > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {totalItems()}
                  </span>
                )}
              </Link>

              <div className="flex items-center gap-1 sm:gap-2">
                {isLoadingUser ? (
                    // Loading Skeleton for User Button
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
                ) : isLoggedIn ? (
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Link href="/profile" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center text-sky-600 dark:text-sky-400 font-bold text-sm border border-sky-200 dark:border-sky-800 group-hover:border-sky-400 transition-colors">
                            {user.avatar ? (
                                <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                            ) : (
                                user.name.charAt(0).toUpperCase()
                            )}
                        </div>
                    </Link>
                    {/* Hide Logout on Mobile */}
                    <button 
                      onClick={handleLogout}
                      className="p-2 rounded-xl text-red-500 hover:bg-red-50 transition-colors hidden sm:block"
                      title={t('logout')}
                    >
                      {isLoggingOut ? (
                          <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                          </svg>
                      )}
                    </button>
                  </div>
                ) : (
                  <>
                      <Link href="/login" className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors dark:text-slate-300 dark:hover:bg-slate-800">
                          <User size={20} />
                      </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
              <div className="absolute top-0 left-0 bottom-0 w-10/12 max-w-[320px] bg-white dark:bg-slate-950 shadow-2xl overflow-y-auto animate-in slide-in-from-left duration-300 flex flex-col h-full border-r border-slate-100 dark:border-slate-800">
                  
                  {/* User Profile Section (Top) */}
                  <div className="p-6 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex justify-between items-start mb-4">
                          <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                            <Image 
                                src="/logo3.png" 
                                alt={settings.shop_name} 
                                width={100} 
                                height={32} 
                                className="h-8 w-auto object-contain"
                            />
                          </Link>
                          <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white">✕</button>
                      </div>
                      
                      {isLoggedIn ? (
                          <div className="flex items-center gap-3 mt-4">
                              <div className="w-12 h-12 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center text-sky-600 dark:text-sky-400 font-bold text-lg border border-sky-200 dark:border-sky-800">
                                  {user.avatar ? (
                                      <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                                  ) : (
                                      user.name.charAt(0).toUpperCase()
                                  )}
                              </div>
                              <div>
                                  <div className="font-bold text-slate-900 dark:text-white">{user.name}</div>
                                  <div className="text-xs text-slate-500 dark:text-slate-400">{user.phone}</div>
                              </div>
                          </div>
                      ) : (
                          <div className="mt-4">
                              <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">Welcome! Please login to continue.</p>
                              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                                  <Button fullWidth className="rounded-xl py-2.5 font-bold shadow-sm">
                                      {t('login')}
                                  </Button>
                              </Link>
                          </div>
                      )}
                  </div>
                  
                  <nav className="flex-1 p-4 space-y-1">
                      <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500 dark:text-slate-400"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                          {t('home')}
                      </Link>
                      
                      <Link href="/products" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500 dark:text-slate-400"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                          {t('shop')}
                      </Link>

                      <Link href="/brands" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500 dark:text-slate-400"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
                          Brands
                      </Link>

                      <Link href="/wishlist" className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                          <div className="flex items-center gap-3">
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500 dark:text-slate-400"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                              <span>Wishlist</span>
                          </div>
                          {mounted && wishlistItems.length > 0 && (
                              <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                  {wishlistItems.length}
                              </span>
                          )}
                      </Link>

                      {/* Categories Accordion */}
                      <div className="pt-2 pb-2">
                          <button 
                            onClick={() => setIsMobileCategoriesOpen(!isMobileCategoriesOpen)}
                            className="flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                          >
                              <div className="flex items-center gap-3">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500 dark:text-slate-400"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                                  {t('categories')}
                              </div>
                              <span className={`text-xs transition-transform duration-200 ${isMobileCategoriesOpen ? 'rotate-180' : ''}`}>▼</span>
                          </button>
                          
                          {isMobileCategoriesOpen && (
                              <div className="pl-4 pr-2 space-y-1 mt-1 animate-in slide-in-from-top-2">
                                  {categories.map(cat => (
                                      <div key={cat.id} className="rounded-lg overflow-hidden">
                                          <div className="flex items-center justify-between w-full text-left">
                                              <Link 
                                                href={`/products?category=${cat.id}`}
                                                className="flex-1 py-2 px-4 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                              >
                                                  {getLocalizedField(cat, 'name', language)}
                                              </Link>
                                              {cat.children && cat.children.length > 0 && (
                                                  <button 
                                                    onClick={() => toggleMobileCategory(cat.id)}
                                                    className="p-2 text-slate-400 hover:text-sky-500"
                                                  >
                                                      <span className={`text-xs transition-transform block ${expandedMobileCategories.includes(cat.id) ? 'rotate-180' : ''}`}>▼</span>
                                                  </button>
                                              )}
                                          </div>
                                          
                                          {cat.children && cat.children.length > 0 && expandedMobileCategories.includes(cat.id) && (
                                              <div className="pl-4 border-l-2 border-slate-100 dark:border-slate-800 ml-4 mb-2 space-y-1">
                                                  {cat.children.map((sub: any) => (
                                                      <Link 
                                                        key={sub.id}
                                                        href={`/products?category=${sub.id}`}
                                                        className="block py-1.5 px-2 text-xs text-slate-500 dark:text-slate-500 hover:text-sky-600 dark:hover:text-sky-400"
                                                        onClick={() => setIsMobileMenuOpen(false)}
                                                      >
                                                          {getLocalizedField(sub, 'name', language)}
                                                      </Link>
                                                  ))}
                                              </div>
                                          )}
                                      </div>
                                  ))}
                              </div>
                          )}
                      </div>

                      <div className="border-t border-slate-100 dark:border-slate-800 my-2"></div>
                  </nav>

                  {/* Bottom Actions */}
                  <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-4">
                      <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Settings</span>
                          <div className="flex gap-2">
                              <LanguageToggle className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm text-xs" />
                              <ThemeToggle className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm text-xs" />
                          </div>
                      </div>
                      
                      {/* Facebook Link */}
                      <a href={settings.facebook_link} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#1877F2]/10 text-[#1877F2] text-xs font-bold hover:bg-[#1877F2]/20 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.333-4.669 1.212 0 2.493.216 2.493.216v2.733h-1.406c-1.492 0-1.956.926-1.956 1.874v2.25h3.072l-.487 3.47h-2.585v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                          Follow on Facebook
                      </a>

                      {isLoggedIn && (
                          <button 
                              onClick={handleLogout}
                              className="flex items-center justify-center gap-2 text-red-500 font-bold w-full py-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-xs"
                          >
                              {isLoggingOut ? (
                                  <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                              )}
                              {t('logout')}
                          </button>
                      )}
                  </div>
              </div>
          </div>
      )}

      {/* Mobile Search Overlay */}
      {isSearchOpen && (
        <div className="fixed top-20 left-0 right-0 z-[60] bg-white/95 backdrop-blur-md border-b border-sky-100 p-4 lg:hidden animate-in slide-in-from-top-2 duration-200 dark:bg-slate-950/95 dark:border-slate-800 shadow-lg">
          <form onSubmit={handleSearch} className="w-full relative">
            <input
              type="text"
              placeholder={t('search_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              className="w-full px-5 py-3 rounded-2xl border border-sky-200 bg-sky-50/50 text-sky-900 placeholder-sky-400 text-base focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all dark:bg-slate-900 dark:border-slate-700 dark:text-white dark:placeholder-slate-400 dark:focus:border-sky-500 dark:focus:ring-sky-900"
            />
            {searchQuery && (
                <button 
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-10 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            )}
            <button 
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-sky-500 text-white hover:bg-sky-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
          </form>
          {/* Mobile Suggestions Dropdown */}
          {searchQuery.trim().length > 0 && (
              <div className="mt-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
                  {searchQuery.trim().length < 3 ? (
                      <div className="p-4 text-sm text-slate-500">Keep typing to see suggestions...</div>
                  ) : suggestions.length > 0 ? (
                      <>
                        <ul>
                            {suggestions.map((product) => (
                                <li key={product.id}>
                                    <Link 
                                        href={`/products/${product.id}`}
                                        className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3"
                                        onClick={() => setIsSearchOpen(false)}
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0">
                                            <Image src={getImageUrl(product.images?.[0])} alt={product.name} width={40} height={40} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 truncate">
                                            <div className="font-bold truncate">{getLocalizedField(product, 'name', language)}</div>
                                            <div className="text-xs text-slate-500">৳{product.price}</div>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                        <div className="p-2 border-t border-slate-100 dark:border-slate-800">
                            <Link
                                href={`/products?search=${encodeURIComponent(searchQuery)}`}
                                className="block w-full py-2 text-center text-sm font-bold text-sky-600 hover:bg-sky-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                onClick={() => setIsSearchOpen(false)}
                            >
                                View all results for "{searchQuery}"
                            </Link>
                        </div>
                      </>
                  ) : (
                      <div className="p-4 text-sm text-slate-500">No products found for "{searchQuery}".</div>
                  )}
              </div>
          )}
          {/* Recent & Popular for Mobile (When query is empty) */}
          {searchQuery.trim().length === 0 && (
              <div className="mt-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden p-4">
                  {recentSearches.length > 0 && (
                      <div className="mb-4">
                          <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Recent Searches</h4>
                          <div className="flex flex-wrap gap-2">
                              {recentSearches.map(s => (
                                  <button key={s} onClick={() => performSearch(s)} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs hover:bg-sky-50 dark:hover:bg-sky-900/30 transition-colors">
                                      {s}
                                  </button>
                              ))}
                          </div>
                      </div>
                  )}
                  <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Popular</h4>
                      <div className="flex flex-wrap gap-2">
                          {popularSearches.map(s => (
                              <button key={s} onClick={() => performSearch(s)} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs hover:bg-sky-50 dark:hover:bg-sky-900/30 transition-colors">
                                  {s}
                              </button>
                          ))}
                      </div>
                  </div>
              </div>
          )}
        </div>
      )}
    </>
  );
}
