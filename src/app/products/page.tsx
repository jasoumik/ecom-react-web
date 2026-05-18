"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Heading, Text, Button, ResponsiveImage, RatingStars, SkeletonCardGrid } from "@/components/ui";
import { API_URL } from "@/lib/config";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { useToast } from "@/components/ui/Toast";
import { FullScreenLoader } from "@/components/ui/Loader";
import { useLanguage } from "@/lib/language-context";
import { getLocalizedField, getImageUrl } from "@/lib/utils";
import Link from "next/link";
import { ProductRequestButton } from "@/components/ui/ProductRequestButton";
import { Filter, ArrowUpDown, X, ChevronDown, Loader2 } from "lucide-react";

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const categoryId = searchParams.get("category");
  const brandId = searchParams.get("brand");
  const ageId = searchParams.get("age");
  const searchQuery = searchParams.get("search");
  
  const [products, setProducts] = useState<any[]>([]);
  const [category, setCategory] = useState<any>(null);
  const [brand, setBrand] = useState<any>(null);
  const [ageGroup, setAgeGroup] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  
  // Filters
  const [sortBy, setSortBy] = useState("newest");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [appliedMinPrice, setAppliedMinPrice] = useState<number | undefined>(undefined);
  const [appliedMaxPrice, setAppliedMaxPrice] = useState<number | undefined>(undefined);
  const [showFilters, setShowFilters] = useState(false);

  const { addItem } = useCart();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, items: wishlistItems } = useWishlist();
  const { addToast } = useToast();
  const { t, language } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    const userStr = localStorage.getItem("user");
    if (userStr) {
        try {
            setUser(JSON.parse(userStr));
        } catch (e) {}
    }

    // Reset when main params change
    if (categoryId) {
        fetch(`${API_URL}/categories/${categoryId}`)
            .then(res => res.json())
            .then(setCategory)
            .catch(console.error);
        setBrand(null);
        setAgeGroup(null);
        setCategories([]);
    } else if (brandId) {
        fetch(`${API_URL}/brands/${brandId}`)
            .then(res => res.json())
            .then(setBrand)
            .catch(console.error);
        setCategory(null);
        setAgeGroup(null);
        setCategories([]);
    } else if (ageId) {
        fetch(`${API_URL}/age-groups/${ageId}`)
            .then(res => res.json())
            .then(setAgeGroup)
            .catch(console.error);
        
        // Fetch categories for this age group
        fetch(`${API_URL}/categories?public=true&age=${ageId}`)
            .then(res => res.json())
            .then(data => setCategories(Array.isArray(data) ? data : []))
            .catch(console.error);

        setCategory(null);
        setBrand(null);
    } else {
        setCategory(null);
        setBrand(null);
        setAgeGroup(null);
        
        // Fetch all categories for main products page
        fetch(`${API_URL}/categories?public=true`)
            .then(res => res.json())
            .then(data => setCategories(Array.isArray(data) ? data : []))
            .catch(console.error);
    }
  }, [categoryId, searchQuery, brandId, ageId]);

  // Fetch products when filters change
  useEffect(() => {
      setProducts([]);
      setPage(1);
      setHasMore(true);
      fetchProducts(1, true);
  }, [categoryId, searchQuery, brandId, ageId, sortBy, appliedMinPrice, appliedMaxPrice]);

  const fetchProducts = async (pageNum: number, isInitial: boolean = false) => {
    if (isInitial) setLoading(true);
    else setLoadingMore(true);

    let url = `${API_URL}/products?page=${pageNum}&limit=12`;
    
    if (categoryId) url += `&category=${categoryId}`;
    if (brandId) url += `&brand=${brandId}`;
    if (ageId) url += `&age=${ageId}`;
    if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
    
    // Add filters
    if (sortBy) url += `&sort=${sortBy}`;
    if (appliedMinPrice !== undefined) url += `&minPrice=${appliedMinPrice}`;
    if (appliedMaxPrice !== undefined) url += `&maxPrice=${appliedMaxPrice}`;
    
    try {
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        let newProducts = [];
        let total = 0;

        if (data.data && Array.isArray(data.data)) {
            newProducts = data.data;
            total = data.meta.total;
        } else if (Array.isArray(data)) {
            newProducts = data;
            total = data.length;
        }

        if (isInitial) {
            setProducts(newProducts);
        } else {
            setProducts(prev => {
                // Filter out duplicates
                const existingIds = new Set(prev.map(p => p.id));
                const uniqueNewProducts = newProducts.filter((p: any) => !existingIds.has(p.id));
                return [...prev, ...uniqueNewProducts];
            });
        }

        if (newProducts.length === 0 || (isInitial && newProducts.length < 12) || (products.length + newProducts.length >= total)) {
            setHasMore(false);
        } else {
            setHasMore(true);
        }
      }
    } catch (error) {
      console.error("Failed to fetch products", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchProducts(nextPage);
  };

  const applyPriceFilter = () => {
      const min = minPrice ? parseFloat(minPrice) : undefined;
      const max = maxPrice ? parseFloat(maxPrice) : undefined;
      setAppliedMinPrice(min);
      setAppliedMaxPrice(max);
  };

  const clearFilters = () => {
      setMinPrice("");
      setMaxPrice("");
      setAppliedMinPrice(undefined);
      setAppliedMaxPrice(undefined);
      setSortBy("newest");
  };

  const handleAddToCart = (product: any) => {
    let imageUrl = "https://picsum.photos/seed/product-item/700/700";
    if (Array.isArray(product.images) && product.images.length > 0) {
        imageUrl = getImageUrl(product.images[0]);
    } else if (typeof product.images === 'string') {
        try {
            const parsed = JSON.parse(product.images);
            if (Array.isArray(parsed) && parsed.length > 0) imageUrl = getImageUrl(parsed[0]);
        } catch (e) {}
    }

    // If product has variants, redirect to product page instead of adding to cart directly
    if (product.hasMultiplePrices || product.has_variants) {
        window.location.href = `/products/${product.slug || product.id}`;
        return;
    }

    addItem({
      id: product.id,
      slug: product.slug, // Pass slug
      name: getLocalizedField(product, 'name', language),
      price: parseFloat(product.price),
      image: imageUrl,
      quantity: 1,
      stock: parseInt(product.stock) || 0 // Pass stock
    });
    addToast(
      `Added ${getLocalizedField(product, 'name', language)} to cart`,
      "success",
      { label: "View Cart", href: "/cart" }
    );
  };

  const toggleWishlist = async (product: any) => {
    let imageUrl = "https://picsum.photos/seed/product-item/700/700";
    if (Array.isArray(product.images) && product.images.length > 0) {
        imageUrl = getImageUrl(product.images[0]);
    } else if (typeof product.images === 'string') {
        try {
            const parsed = JSON.parse(product.images);
            if (Array.isArray(parsed) && parsed.length > 0) imageUrl = getImageUrl(parsed[0]);
        } catch (e) {}
    }

    const isWishlisted = wishlistItems.some(i => i.id === product.id);

    if (isWishlisted) {
        removeFromWishlist(product.id);
        addToast("Removed from wishlist");
        if (user) {
            try {
                await fetch(`${API_URL}/wishlist/${user.id}/${product.id}`, { method: 'DELETE' });
            } catch (e) {}
        }
    } else {
        addToWishlist({
            id: product.id,
            slug: product.slug, // Pass slug
            name: getLocalizedField(product, 'name', language),
            price: parseFloat(product.price),
            image: imageUrl
        });
        addToast("Added to wishlist");
        if (user) {
            try {
                await fetch(`${API_URL}/wishlist/${user.id}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ productId: product.id })
                });
            } catch (e) {}
        }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Category Banner & Subcategories */}
        {category && (
            <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
                {category.banner_image && (
                    <div className="w-full h-40 sm:h-56 md:h-72 rounded-2xl overflow-hidden mb-8 relative shadow-md group">
                        <ResponsiveImage 
                            src={getImageUrl(category.banner_image)} 
                            alt={getLocalizedField(category, 'name', language)} 
                            width={1200} 
                            height={400} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-end p-6 sm:p-10">
                            <div>
                                <h1 className="text-3xl sm:text-5xl font-bold text-white drop-shadow-lg mb-2">
                                    {getLocalizedField(category, 'name', language)}
                                </h1>
                                {category.description && (
                                    <p className="text-white/90 text-sm sm:text-base max-w-2xl line-clamp-2">
                                        {getLocalizedField(category, 'description', language)}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Always show header for category page */}
                {!category.banner_image && (
                    <div className="text-center mb-8">
                        <Heading size="lg" className="font-sans text-slate-900 dark:text-white font-bold text-2xl sm:text-3xl mb-2">
                            {getLocalizedField(category, 'name', language)}
                        </Heading>
                        {category.description && (
                            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-2xl mx-auto">
                                {getLocalizedField(category, 'description', language)}
                            </p>
                        )}
                    </div>
                )}
                
                {category.children && category.children.length > 0 && (
                    <div className="mb-8">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-4 text-lg">{t('subcategories')}</h3>
                        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                            {category.children.map((sub: any) => (
                                <Link 
                                    key={sub.id} 
                                    href={`/products?category=${sub.slug || sub.id}`}
                                    className="flex flex-col items-center gap-3 min-w-[100px] group"
                                >
                                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 overflow-hidden group-hover:border-rose-400 group-hover:shadow-md transition-all duration-300">
                                        <ResponsiveImage 
                                            src={getImageUrl(sub.image)} 
                                            alt={getLocalizedField(sub, 'name', language)} 
                                            width={100} 
                                            height={100} 
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                    </div>
                                    <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 text-center group-hover:text-rose-400 transition-colors line-clamp-2 max-w-[100px]">
                                        {getLocalizedField(sub, 'name', language)}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        )}

        {/* Brand Header */}
        {brand && (
            <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500 text-center">
                <div className="w-24 h-24 mx-auto rounded-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-center p-0 mb-4 overflow-hidden">
                    {brand.logo ? (
                        <ResponsiveImage 
                            src={getImageUrl(brand.logo)} 
                            alt={getLocalizedField(brand, 'name', language)} 
                            width={160} 
                            height={160} 
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <span className="text-4xl font-bold text-slate-300">{brand.name.charAt(0)}</span>
                    )}
                </div>
                <Heading size="lg" className="font-sans text-slate-900 dark:text-white font-bold text-2xl sm:text-3xl mb-2">
                    {getLocalizedField(brand, 'name', language)}
                </Heading>
                {brand.description && (
                    <p className="text-slate-500 dark:text-slate-400 text-sm max-w-2xl mx-auto">
                        {brand.description}
                    </p>
                )}
            </div>
        )}

        {/* Age Group Header & Categories */}
        {ageGroup && (
            <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="text-center mb-8">
                    <div className="w-20 h-20 mx-auto rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-4xl mb-4">
                        {ageGroup.icon}
                    </div>
                    <Heading size="lg" className="font-sans text-slate-900 dark:text-white font-bold text-2xl sm:text-3xl mb-2">
                        {getLocalizedField(ageGroup, 'label', language)}
                    </Heading>
                    <p className="text-slate-500 dark:text-slate-400 text-sm max-w-2xl mx-auto">
                        {getLocalizedField(ageGroup, 'description', language) || ageGroup.age_range}
                    </p>
                </div>

                {/* Categories for this Age Group */}
                {categories.length > 0 && (
                    <div className="mb-8">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-4 text-lg text-center">{t('browse_categories')}</h3>
                        <div className="flex flex-wrap justify-center gap-4">
                            {categories.map((cat: any) => (
                                <Link 
                                    key={cat.id} 
                                    href={`/products?category=${cat.slug || cat.id}&age=${ageId}`}
                                    className="flex flex-col items-center gap-3 w-[100px] group"
                                >
                                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 overflow-hidden group-hover:border-rose-400 group-hover:shadow-md transition-all duration-300">
                                        <ResponsiveImage 
                                            src={getImageUrl(cat.image)} 
                                            alt={getLocalizedField(cat, 'name', language)} 
                                            width={100} 
                                            height={100} 
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                    </div>
                                    <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 text-center group-hover:text-rose-400 transition-colors line-clamp-2">
                                        {getLocalizedField(cat, 'name', language)}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        )}

          {!category && !brand && !ageGroup && !searchQuery && categories.length > 0 && (
              <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
                  <h3 className="font-bold text-slate-900 dark:text-white mb-4 text-lg text-center">{t('browse_categories')}</h3>
                  <div className="flex flex-wrap justify-center gap-4">
                      {categories.map((cat: any) => (
                          <Link
                              key={cat.id}
                              href={`/products?category=${cat.slug || cat.id}`}
                              className="flex flex-col items-center gap-3 w-[100px] group"
                          >
                              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 overflow-hidden group-hover:border-rose-400 group-hover:shadow-md transition-all duration-300">
                                  <ResponsiveImage
                                      src={getImageUrl(cat.image)}
                                      alt={getLocalizedField(cat, 'name', language)}
                                      width={100}
                                      height={100}
                                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                  />
                              </div>
                              <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 text-center group-hover:text-rose-400 transition-colors line-clamp-2">
                                {getLocalizedField(cat, 'name', language)}
                            </span>
                          </Link>
                      ))}
                  </div>
              </div>
          )}

        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
            <div>
                {!category && !brand && !ageGroup && (
                    <Heading size="lg" className="font-sans text-slate-900 dark:text-white font-bold text-2xl sm:text-3xl">
                        {searchQuery ? `Search results for "${searchQuery}"` : t('shop_all_products')}
                    </Heading>
                )}
                {!category && !brand && !ageGroup && !searchQuery && (
                    <Text className="text-slate-500 dark:text-slate-400 text-sm mt-1">{t('discover_collection')}</Text>
                )}
            </div>
        </div>

        {/* Filters & Sorting Bar */}
        <div className="sticky top-[60px] z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-100 dark:border-slate-800 py-3 mb-6 rounded-xl shadow-sm">
            <div className="px-4 flex flex-wrap items-center justify-between gap-3">
                {/* Mobile Filter Toggle */}
                <button 
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 sm:hidden"
                >
                    <Filter size={16} />
                    Filters
                    {(appliedMinPrice !== undefined || appliedMaxPrice !== undefined) && (
                        <span className="w-2 h-2 rounded-full bg-rose-400" />
                    )}
                </button>

                {/* Desktop Filters / Mobile Collapsible */}
                <div className={`w-full sm:w-auto ${showFilters ? 'block' : 'hidden'} sm:block`}>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 hidden sm:inline">{t('price_range')}:</span>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="number" 
                                    placeholder={t('min_price')} 
                                    value={minPrice}
                                    onChange={(e) => setMinPrice(e.target.value)}
                                    className="w-20 px-2 py-1.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
                                />
                                <span className="text-slate-400">-</span>
                                <input 
                                    type="number" 
                                    placeholder={t('max_price')} 
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(e.target.value)}
                                    className="w-20 px-2 py-1.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
                                />
                                <button 
                                    onClick={applyPriceFilter}
                                    className="px-3 py-1.5 bg-rose-400 text-white text-sm font-medium rounded-lg hover:bg-rose-400 transition-colors"
                                >
                                    {t('apply')}
                                </button>
                            </div>
                        </div>
                        
                        {(appliedMinPrice !== undefined || appliedMaxPrice !== undefined) && (
                            <button 
                                onClick={clearFilters}
                                className="text-xs text-rose-400 hover:underline flex items-center gap-1"
                            >
                                <X size={12} />
                                {t('clear_filters')}
                            </button>
                        )}
                    </div>
                </div>

                {/* Sort Dropdown */}
                <div className="flex items-center gap-2 ml-auto">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 hidden sm:inline">{t('sort_by')}:</span>
                    <div className="relative group">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="appearance-none pl-3 pr-8 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-400 cursor-pointer"
                        >
                            <option value="newest">{t('newest')}</option>
                            <option value="popularity">{t('popularity')}</option>
                            <option value="price_asc">{t('price_low_high')}</option>
                            <option value="price_desc">{t('price_high_low')}</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    </div>
                </div>
            </div>
        </div>

        {loading ? (
            <SkeletonCardGrid count={12} />
        ) : products.length === 0 ? (
            <div className="text-center text-slate-500 dark:text-slate-400 py-20 bg-white dark:bg-slate-800 rounded-2xl shadow-sm flex flex-col items-center justify-center">
                <p className="mb-4">{t('no_products_found')}</p>
                <ProductRequestButton />
            </div>
        ) : (
            <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                {products.map((product: any) => {
                    let imageUrl = "https://picsum.photos/seed/product-item/700/700";
                    if (Array.isArray(product.images) && product.images.length > 0) {
                        imageUrl = getImageUrl(product.images[0]);
                    } else if (typeof product.images === 'string') {
                        try {
                            const parsed = JSON.parse(product.images);
                            if (Array.isArray(parsed) && parsed.length > 0) imageUrl = getImageUrl(parsed[0]);
                        } catch (e) {}
                    }

                    const isWishlisted = mounted && wishlistItems.some(i => i.id === product.id);
                    const hasVariants = product.hasMultiplePrices || product.has_variants;

                    return (
                    <div key={product.id} className="group bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-lg transition-all duration-300 relative flex flex-col">
                        {/* Image Container */}
                        <div className="relative aspect-square bg-slate-50 dark:bg-slate-800 overflow-hidden">
                            <Link href={`/products/${product.slug || product.id}`} className="block w-full h-full">
                                <ResponsiveImage
                                    src={imageUrl}
                                    alt={getLocalizedField(product, 'name', language)}
                                    width={300}
                                    height={300}
                                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                                />
                            </Link>
                            
                            {/* Wishlist Button */}
                            <button 
                                onClick={(e) => { e.preventDefault(); toggleWishlist(product); }}
                                className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm ${
                                    isWishlisted 
                                    ? 'bg-rose-50 text-rose-400' 
                                    : 'bg-white/90 text-slate-400 hover:text-rose-400 hover:bg-white'
                                }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                </svg>
                            </button>
                        </div>
                        
                        {/* Content */}
                        <div className="p-2 sm:p-3 flex flex-col flex-grow">
                            <div className="mb-1">
                                <div className="flex items-center gap-1 mb-1">
                                    <RatingStars rating={parseFloat(product.rating) || 0} size="sm" />
                                    <span className="text-[10px] text-slate-400">({product.reviewCount || 0})</span>
                                </div>
                                <h3 className="text-sm font-bold text-slate-800 dark:text-white line-clamp-2 leading-snug min-h-[2.5em]">
                                    <Link href={`/products/${product.slug || product.id}`} className="hover:text-rose-400 transition-colors">
                                        {getLocalizedField(product, 'name', language)}
                                    </Link>
                                </h3>
                                {/* Category Name */}
                                {product.category_name && (
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                                        {product.category_name}
                                    </p>
                                )}
                            </div>
                            
                            <div className="mt-auto pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                                <div className="text-base font-bold text-rose-400 dark:text-rose-300">
                                    {product.hasMultiplePrices ? (
                                        <span className="text-sm">
                                            ৳{product.minPrice} - ৳{product.maxPrice}
                                        </span>
                                    ) : (
                                        `৳${product.price}`
                                    )}
                                </div>
                                <Button 
                                    onClick={() => handleAddToCart(product)}
                                    className="w-full sm:w-auto py-1.5 px-2 sm:px-3 text-[10px] sm:text-xs font-bold bg-rose-50 text-rose-400 hover:bg-rose-100 dark:bg-rose-900/30 dark:text-rose-300 rounded-lg shadow-sm whitespace-nowrap"
                                >
                                    {hasVariants ? 'View Options' : t('add_to_cart')}
                                </Button>
                            </div>
                        </div>
                    </div>
                    );
                })}
                </div>

                {hasMore && (
                    <div className="mt-12 text-center">
                        <Button 
                            onClick={loadMore} 
                            disabled={loadingMore}
                            className="rounded-full px-8 py-3 bg-rose-400 hover:bg-rose-400 text-white font-bold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loadingMore ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="animate-spin" size={18} />
                                    {t('loading')}
                                </span>
                            ) : (
                                t('load_more')
                            )}
                        </Button>
                    </div>
                )}
            </>
        )}
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<FullScreenLoader />}>
      <ProductsContent />
    </Suspense>
  );
}
