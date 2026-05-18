"use client";

import {useEffect, useState, useRef} from "react";
import {useParams, useRouter} from "next/navigation";
import {Heading, Button, ResponsiveImage, RatingStars} from "@/components/ui";
import {API_URL} from "@/lib/config";
import {useCart} from "@/lib/cart";
import {useWishlist} from "@/lib/wishlist";
import {useToast} from "@/components/ui/Toast";
import {FullScreenLoader} from "@/components/ui/Loader";
import {Input} from "@/components/ui/Input";
import Link from "next/link";
import {useLanguage} from "@/lib/language-context";
import {getLocalizedField, getImageUrl} from "@/lib/utils";
import {FlagIcon} from "@/components/ui/FlagIcon";
import {
    Minus,
    Plus,
    Heart,
    Share2,
    CheckCircle2,
    AlertCircle,
    Truck,
    ShieldCheck,
    RefreshCw,
    ShoppingCart
} from "lucide-react";

export default function ProductPage() {
    const params = useParams();
    // The param is named 'id' by the folder structure, but it can contain a slug
    const slugOrId = params.id as string;
    const [product, setProduct] = useState<any>(null);
    const [reviews, setReviews] = useState<any[]>([]);
    const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMedia, setSelectedMedia] = useState<string>("");

    // Variant Selection State
    const [selectedSize, setSelectedSize] = useState<string>("");
    const [selectedColor, setSelectedColor] = useState<string>("");
    const [selectedWeight, setSelectedWeight] = useState<string>("");
    const [selectedVariant, setSelectedVariant] = useState<any>(null);
    const [quantity, setQuantity] = useState(1);

    // Notify Me State
    const [showNotifyModal, setShowNotifyModal] = useState(false);
    const [notifyPhone, setNotifyPhone] = useState("");
    const [notifyEmail, setNotifyEmail] = useState("");
    const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

    // Zoom State
    const [isZoomed, setIsZoomed] = useState(false);
    const [mousePos, setMousePos] = useState({x: 0, y: 0});

    const imageRef = useRef<HTMLDivElement>(null);
    const {addItem} = useCart();
    const {addItem: addToWishlist, removeItem: removeFromWishlist, items: wishlistItems} = useWishlist();
    const {addToast} = useToast();
    const router = useRouter();
    const {t, language} = useLanguage();

    useEffect(() => {
        const fetchProduct = async () => {
            if (!slugOrId) return;
            setLoading(true);
            try {
                // Backend findOne now accepts ID or Slug
                const productRes = await fetch(`${API_URL}/products/${slugOrId}`);

                if (productRes.ok) {
                    const data = await productRes.json();
                    setProduct(data);

                    // Fetch reviews using the actual ID from the fetched product
                    fetch(`${API_URL}/reviews/product/${data.id}`)
                        .then(res => res.json())
                        .then(reviewsData => setReviews(Array.isArray(reviewsData) ? reviewsData : []))
                        .catch(console.error);

                    // Fetch related products
                    if (data.category_id) {
                        fetch(`${API_URL}/products?category=${data.category_id}&limit=8`)
                            .then(res => res.json())
                            .then(related => {
                                const list = related.data || related;
                                // Ensure strict category matching on client side as well
                                const filtered = list.filter((p: any) =>
                                    p.id !== data.id &&
                                    (String(p.category_id) === String(data.category_id))
                                );
                                setRelatedProducts(filtered.slice(0, 4));
                            })
                            .catch(console.error);
                    }

                    let media: string[] = [];
                    if (Array.isArray(data.images)) {
                        media = data.images;
                    } else if (typeof data.images === 'string') {
                        try {
                            media = JSON.parse(data.images);
                        } catch (e) {
                            media = [data.images];
                        }
                    }
                    if (media.length > 0) setSelectedMedia(media[0]);

                    if (data.variants && data.variants.length > 0) {
                        const sortedVariants = [...data.variants].sort((a, b) => b.stock - a.stock);
                        const first = sortedVariants[0];
                        if (first.size) setSelectedSize(first.size);
                        if (first.color) setSelectedColor(first.color);
                        if (first.weight) setSelectedWeight(first.weight);
                    }
                } else {
                    setProduct(null);
                }
            } catch (error) {
                console.error("Failed to fetch product", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();

        const userStr = localStorage.getItem("user");
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                setNotifyPhone(user.phone || "");
                setNotifyEmail(user.email || "");
            } catch (e) {
            }
        }
    }, [slugOrId]);

    useEffect(() => {
        if (!product || !product.variants) return;

        const variant = product.variants.find((v: any) => {
            const sizeMatch = !v.size || v.size === selectedSize;
            const colorMatch = !v.color || v.color === selectedColor;
            const weightMatch = !v.weight || v.weight === selectedWeight;
            return sizeMatch && colorMatch && weightMatch;
        });

        if (variant) {
            setSelectedVariant(variant);
        } else {
            const fallback = product.variants.find((v: any) =>
                (selectedWeight && v.weight === selectedWeight) ||
                (selectedSize && v.size === selectedSize)
            );
            if (fallback) setSelectedVariant(fallback);
        }
        setQuantity(1);
    }, [selectedSize, selectedColor, selectedWeight, product]);

    const handleSizeChange = (newSize: string) => {
        setSelectedSize(newSize);
    };

    const handleColorChange = (newColor: string) => {
        setSelectedColor(newColor);
    };

    const handleWeightChange = (newWeight: string) => {
        setSelectedWeight(newWeight);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!imageRef.current) return;
        const {left, top, width, height} = imageRef.current.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;
        setMousePos({x, y});
    };

    const handleAddToCart = () => {
        if (!product) return;

        if (product.has_variants && product.variants.length > 0 && !selectedVariant) {
            addToast("Please select valid options", "error");
            return;
        }

        const finalPrice = selectedVariant ? parseFloat(selectedVariant.price || product.price) : parseFloat(product.price);
        const finalStock = selectedVariant ? parseInt(selectedVariant.stock) : parseInt(product.stock);

        if (finalStock < quantity) {
            addToast(`Only ${finalStock} items available`, "error");
            return;
        }

        let imageUrl = "https://picsum.photos/seed/product-item/700/700";
        if (Array.isArray(product.images) && product.images.length > 0) {
            imageUrl = getImageUrl(product.images[0]);
        } else if (typeof product.images === 'string') {
            try {
                const parsed = JSON.parse(product.images);
                if (Array.isArray(parsed) && parsed.length > 0) imageUrl = getImageUrl(parsed[0]);
            } catch (e) {
            }
        }

        addItem({
            id: product.id,
            slug: product.slug, // Pass slug
            variantId: selectedVariant?.id,
            name: `${getLocalizedField(product, 'name', language)} ${selectedVariant ? `(${[selectedSize, selectedColor, selectedWeight].filter(Boolean).join(' ')})` : ''}`,
            price: finalPrice,
            image: imageUrl,
            quantity: quantity,
            stock: finalStock
        });
        addToast(
            `Added ${quantity} x ${getLocalizedField(product, 'name', language)} to cart`,
            "success",
            {label: "View Cart", href: "/cart"}
        );
    };

    const handleOrderNow = () => {
        const finalStock = selectedVariant ? parseInt(selectedVariant.stock) : parseInt(product.stock);
        if (finalStock < quantity) {
            addToast(`Only ${finalStock} items available`, "error");
            return;
        }
        handleAddToCart();
        router.push('/cart');
    };

    const handleNotifyRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmittingRequest(true);
        try {
            const res = await fetch(`${API_URL}/requests/stock`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    productId: product.id,
                    variantId: selectedVariant?.id,
                    phone: notifyPhone,
                    email: notifyEmail
                }),
            });
            if (res.ok) {
                addToast("Request received! We'll notify you.", "success");
                setShowNotifyModal(false);
            } else {
                addToast("Failed to submit request", "error");
            }
        } catch (e) {
            addToast("Error submitting request", "error");
        } finally {
            setIsSubmittingRequest(false);
        }
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: getLocalizedField(product, 'name', language),
                    text: getLocalizedField(product, 'description', language),
                    url: window.location.href,
                });
            } catch (e) {
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
            addToast("Link copied to clipboard", "success");
        }
    };

    const toggleWishlist = () => {
        if (!product) return;
        const isWishlisted = wishlistItems.some(i => i.id === product.id);

        if (isWishlisted) {
            removeFromWishlist(product.id);
            addToast("Removed from wishlist");
        } else {
            let imageUrl = "https://picsum.photos/seed/product-item/700/700";
            if (Array.isArray(product.images) && product.images.length > 0) {
                imageUrl = getImageUrl(product.images[0]);
            } else if (typeof product.images === 'string') {
                try {
                    const parsed = JSON.parse(product.images);
                    if (Array.isArray(parsed) && parsed.length > 0) imageUrl = getImageUrl(parsed[0]);
                } catch (e) {
                }
            }

            addToWishlist({
                id: product.id,
                name: getLocalizedField(product, 'name', language),
                price: parseFloat(product.price),
                image: imageUrl
            });
            addToast("Added to wishlist");
        }
    };

    const parseReviewImages = (images: any) => {
        if (!images) return [];
        if (Array.isArray(images)) return images;
        try {
            return JSON.parse(images);
        } catch (e) {
            return [];
        }
    };

    if (loading) return <FullScreenLoader/>;
    if (!product) return <div
        className="min-h-screen flex items-center justify-center dark:bg-slate-900 dark:text-white">{t('no_products_found')}</div>;

    let mediaList: string[] = [];
    if (Array.isArray(product.images)) {
        mediaList = product.images;
    } else if (typeof product.images === 'string') {
        try {
            mediaList = JSON.parse(product.images);
        } catch (e) {
            mediaList = [product.images];
        }
    }
    if (mediaList.length === 0) mediaList = ["https://picsum.photos/seed/product-item/700/700"];

    const isVideo = (url: string) => {
        return url.match(/\.(mp4|webm|ogg)$/i);
    };

    const sizes = product.variants ? Array.from(new Set(product.variants.map((v: any) => v.size).filter(Boolean))) : [];
    const colors = product.variants ? Array.from(new Set(product.variants.map((v: any) => v.color).filter(Boolean))) : [];
    const weights = product.variants ? Array.from(new Set(product.variants.map((v: any) => v.weight).filter(Boolean))) : [];

    const currentPrice = selectedVariant ? (selectedVariant.price || product.price) : product.price;
    const currentStock = selectedVariant ? parseInt(selectedVariant.stock) : parseInt(product.stock);
    const currentWeight = selectedVariant?.weight || product.weight;

    const isSizeAvailable = (size: string) => {
        return product.variants.some((v: any) => v.size === size && v.stock > 0);
    };

    const isColorAvailableForSize = (color: string) => {
        if (!selectedSize) return true;
        const variant = product.variants.find((v: any) => v.size === selectedSize && v.color === color);
        return variant && variant.stock > 0;
    };

    const avgRating = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    const isWishlisted = wishlistItems.some(i => i.id === product.id);

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 pb-24 transition-colors duration-300">
            {/* Breadcrumbs */}
            <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <Link href="/" className="hover:text-rose-400">{t('home')}</Link>
                        <span>/</span>
                        <Link href="/products" className="hover:text-rose-400">{t('products')}</Link>
                        <span>/</span>
                        <span
                            className="text-slate-900 dark:text-white font-medium truncate max-w-[200px]">{getLocalizedField(product, 'name', language)}</span>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid md:grid-cols-12 gap-8 lg:gap-12">
                    {/* Left Column: Sticky Media Gallery (Amazon-style) */}
                    <div className="md:col-span-6 lg:col-span-6 md:sticky md:top-24 self-start">
                        <div className="flex flex-col sm:flex-row gap-4 lg:gap-6">
                            {/* Thumbnails - vertical on desktop, horizontal scroll on mobile */}
                            {mediaList.length > 1 && (
                                <div className="order-2 sm:order-1 flex sm:flex-col gap-2 sm:gap-3 overflow-x-auto sm:overflow-y-auto max-h-[480px] sm:max-h-[520px] pr-1 scrollbar-hide">
                                    {mediaList.map((media: string, i: number) => (
                                        <button
                                            key={i}
                                            type="button"
                                            className={`shrink-0 w-16 h-16 sm:w-18 sm:h-18 rounded-xl overflow-hidden bg-white dark:bg-slate-900 cursor-pointer hover:opacity-80 border-2 transition-all ${
                                                selectedMedia === media
                                                    ? 'border-rose-400 ring-2 ring-rose-400/20'
                                                    : 'border-slate-100 dark:border-slate-800'
                                            }`}
                                            onClick={() => setSelectedMedia(media)}
                                            onMouseEnter={() => setSelectedMedia(media)}
                                        >
                                            {isVideo(media) ? (
                                                <div className="w-full h-full relative flex items-center justify-center bg-black">
                                                    <span className="text-white text-xl">▶</span>
                                                    <video
                                                        src={getImageUrl(media)}
                                                        className="absolute inset-0 w-full h-full object-cover opacity-50"
                                                    />
                                                </div>
                                            ) : (
                                                <ResponsiveImage
                                                    src={getImageUrl(media)}
                                                    alt={`Thumbnail ${i}`}
                                                    width={80}
                                                    height={80}
                                                    className="w-full h-full object-contain p-1"
                                                />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Main Image with hover zoom */}
                            <div className="order-1 sm:order-2 flex-1 min-w-0 flex flex-col md:flex-row gap-4">
                                <div
                                    className="flex-1 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 relative group cursor-zoom-in shadow-sm aspect-square"
                                    ref={imageRef}
                                    onMouseMove={handleMouseMove}
                                    onMouseEnter={() => setIsZoomed(true)}
                                    onMouseLeave={() => setIsZoomed(false)}
                                >
                                    {/* Discount Badge */}
                                    {product.old_price && (
                                        <div className="absolute top-4 left-4 z-10 bg-rose-400 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                                            {Math.round(
                                                ((parseFloat(product.old_price) - parseFloat(currentPrice)) /
                                                    parseFloat(product.old_price)) * 100
                                            )}
                                            % OFF
                                        </div>
                                    )}

                                    {isVideo(selectedMedia) ? (
                                        <video
                                            src={getImageUrl(selectedMedia)}
                                            controls
                                            className="w-full h-full object-contain"
                                            autoPlay
                                            muted
                                            loop
                                        />
                                    ) : (
                                        <>
                                            {/* Zoomed background layer (within same card) */}
                                            <div
                                                className="absolute inset-0 w-full h-full"
                                                style={{
                                                    backgroundImage: `url(${getImageUrl(selectedMedia)})`,
                                                    backgroundPosition: isZoomed
                                                        ? `${mousePos.x}% ${mousePos.y}%`
                                                        : 'center',
                                                    backgroundSize: isZoomed ? '200%' : 'contain',
                                                    backgroundRepeat: 'no-repeat',
                                                    transition: isZoomed
                                                        ? 'none'
                                                        : 'background-size 0.3s ease-out, background-position 0.2s ease-out',
                                                }}
                                            />
                                            {/* Base image for non-zoom / mobile */}
                                            <img
                                                src={getImageUrl(selectedMedia)}
                                                alt={getLocalizedField(product, 'name', language)}
                                                className={`absolute inset-0 w-full h-full object-contain p-4 ${
                                                    isZoomed ? 'opacity-0' : 'opacity-100'
                                                }`}
                                            />
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Product Details */}
                    <div className="md:col-span-6 lg:col-span-6 space-y-6 sticky top-24 h-fit">
                        <div>
                            <div className="flex justify-between items-start mb-2">
                                <div
                                    className="text-xs font-bold text-rose-400 uppercase tracking-wider bg-rose-50 dark:bg-rose-900/30 px-2.5 py-1 rounded-md">{getLocalizedField(product, 'category_name', language)}</div>

                                {/* Country Label */}
                                {product.country_id && (
                                    <div
                                        className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-100 dark:border-slate-700">
                                        <span
                                            className="text-xs font-medium text-slate-600 dark:text-slate-300">{getLocalizedField(product, 'country_name', language)}</span>
                                        {product.country_flag && (
                                            product.country_flag.startsWith('http') || product.country_flag.startsWith('/') ? (
                                                <img src={getImageUrl(product.country_flag)} alt="Flag"
                                                     className="w-4 h-2.5 object-cover rounded-sm shadow-sm"/>
                                            ) : (
                                                <div className="w-4 h-2.5 overflow-hidden rounded-sm shadow-sm">
                                                    <FlagIcon code={product.country_flag} className="w-full h-full"/>
                                                </div>
                                            )
                                        )}
                                    </div>
                                )}
                            </div>

                            <Heading as="h1" size="lg"
                                     className="font-sans dark:text-white text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight mb-3 text-slate-900">{getLocalizedField(product, 'name', language)}</Heading>

                            <div className="flex flex-wrap items-center gap-4 mb-6">
                                <div className="flex items-center gap-1">
                                    <RatingStars rating={avgRating} size="sm"/>
                                    <span
                                        className="text-sm font-medium text-slate-500 dark:text-slate-400 ml-1">({reviews.length} {t('reviews')})</span>
                                </div>

                                <div
                                    className={`flex items-center gap-1.5 text-sm font-medium px-2.5 py-0.5 rounded-full ${currentStock > 0 ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-rose-50 text-rose-500 dark:bg-rose-900/20 dark:text-rose-300'}`}>
                                    {currentStock > 0 ? <CheckCircle2 size={14}/> : <AlertCircle size={14}/>}
                                    {currentStock > 0 ? t('in_stock') : t('out_of_stock')}
                                </div>
                            </div>

                            <div
                                className="flex items-end gap-3 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                                <div
                                    className="text-3xl sm:text-4xl font-bold text-rose-400 dark:text-rose-300">৳{currentPrice}</div>
                                {product.old_price && (
                                    <div className="flex flex-col mb-1">
                                        <div
                                            className="text-lg text-slate-400 line-through font-medium">৳{product.old_price}</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Variant Selectors */}
                        {product.has_variants && (
                            <div className="space-y-5">
                                {sizes.length > 0 && (
                                    <div>
                                        <label
                                            className="block text-sm font-bold text-slate-900 dark:text-white mb-3">{t('size')}: <span
                                            className="font-normal text-slate-500">{selectedSize}</span></label>
                                        <div className="flex flex-wrap gap-2">
                                            {sizes.map((size: any) => (
                                                <button
                                                    key={size}
                                                    onClick={() => handleSizeChange(size)}
                                                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all min-w-[3rem] ${
                                                        selectedSize === size
                                                            ? 'border-rose-400 bg-rose-50 text-rose-500 dark:bg-rose-900/30 dark:text-rose-300 ring-1 ring-rose-400'
                                                            : 'border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800'
                                                    }`}
                                                >
                                                    {size}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {colors.length > 0 && (
                                    <div>
                                        <label
                                            className="block text-sm font-bold text-slate-900 dark:text-white mb-3">{t('color')}: <span
                                            className="font-normal text-slate-500">{selectedColor}</span></label>
                                        <div className="flex flex-wrap gap-2">
                                            {colors.map((color: any) => {
                                                const isAvailable = isColorAvailableForSize(color);
                                                return (
                                                    <button
                                                        key={color}
                                                        onClick={() => handleColorChange(color)}
                                                        className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                                                            selectedColor === color
                                                                ? 'border-rose-400 bg-rose-50 text-rose-500 dark:bg-rose-900/30 dark:text-rose-300 ring-1 ring-rose-400'
                                                                : isAvailable
                                                                    ? 'border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800'
                                                                    : 'border-slate-100 text-slate-300 cursor-not-allowed bg-slate-50 dark:bg-slate-800/50 dark:border-slate-800 dark:text-slate-600 opacity-50'
                                                        }`}
                                                    >
                                                        {color}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Weight Selector */}
                                {weights.length > 0 && (
                                    <div>
                                        <label
                                            className="block text-sm font-bold text-slate-900 dark:text-white mb-3">{t('weight')}: <span
                                            className="font-normal text-slate-500">{selectedWeight}</span></label>
                                        <div className="flex flex-wrap gap-2">
                                            {weights.map((weight: any) => (
                                                <button
                                                    key={weight}
                                                    onClick={() => setSelectedWeight(weight)}
                                                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all min-w-[3rem] ${
                                                        selectedWeight === weight
                                                            ? 'border-rose-400 bg-rose-50 text-rose-500 dark:bg-rose-900/30 dark:text-rose-300 ring-1 ring-rose-400'
                                                            : 'border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800'
                                                    }`}
                                                >
                                                    {weight}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Quantity & Actions */}
                        <div className="pt-6">
                            <div className="flex items-center gap-6 mb-6">
                                <div
                                    className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800 rounded-xl p-1.5 border border-slate-200 dark:border-slate-700">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-10 h-10 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-white flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-600 transition-all shadow-sm"
                                    >
                                        <Minus size={18}/>
                                    </button>
                                    <span
                                        className="font-bold w-8 text-center text-slate-900 dark:text-white text-lg">{quantity}</span>
                                    <button
                                        onClick={() => {
                                            if (quantity < currentStock) {
                                                setQuantity(quantity + 1);
                                            } else {
                                                addToast(`Only ${currentStock} items available`, "error");
                                            }
                                        }}
                                        className={`w-10 h-10 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-white flex items-center justify-center transition-all shadow-sm ${quantity >= currentStock ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50 dark:hover:bg-slate-600'}`}
                                        disabled={quantity >= currentStock}
                                    >
                                        <Plus size={18}/>
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                                {currentStock > 0 ? (
                                    <>
                                        <Button
                                            className="flex-1 py-4 text-base rounded-xl bg-rose-400 text-white font-bold shadow-lg shadow-rose-400/20 hover:bg-rose-500 hover:shadow-rose-400/30 transition-all duration-300"
                                            onClick={handleAddToCart}
                                        >
                                            {t('add_to_cart')}
                                        </Button>
                                        <Button
                                            className="flex-1 py-4 text-base rounded-xl bg-slate-900 text-white font-bold shadow-lg hover:bg-slate-800 transition-all duration-300 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                                            onClick={handleOrderNow}
                                        >
                                            {t('buy_now')}
                                        </Button>
                                    </>
                                ) : (
                                    <Button
                                        className="w-full py-4 text-base rounded-xl bg-amber-500 text-white font-bold shadow-lg hover:bg-amber-600 transition-all duration-300"
                                        onClick={() => setShowNotifyModal(true)}
                                    >
                                        {t('notify_me')}
                                    </Button>
                                )}
                            </div>

                            <div className="flex items-center gap-4">
                                <button
                                    onClick={toggleWishlist}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${isWishlisted ? 'border-rose-200 bg-rose-50 text-rose-400 dark:bg-rose-900/20 dark:border-rose-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'}`}
                                >
                                    <Heart size={18} fill={isWishlisted ? "currentColor" : "none"}/>
                                    {isWishlisted ? "Wishlisted" : "Add to Wishlist"}
                                </button>
                                <button
                                    onClick={handleShare}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                                >
                                    <Share2 size={18}/>
                                    Share
                                </button>
                            </div>
                        </div>

                        {/* Trust Badges */}
                        <div
                            className="grid grid-cols-3 gap-4 py-6 border-t border-slate-100 dark:border-slate-800 mt-6">
                            <div className="flex flex-col items-center text-center gap-2">
                                <div
                                    className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center text-rose-400 dark:text-rose-300">
                                    <Truck size={20}/>
                                </div>
                                <span
                                    className="text-xs font-medium text-slate-600 dark:text-slate-300">Fast Delivery</span>
                            </div>
                            <div className="flex flex-col items-center text-center gap-2">
                                <div
                                    className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center text-rose-400 dark:text-rose-300">
                                    <ShieldCheck size={20}/>
                                </div>
                                <span
                                    className="text-xs font-medium text-slate-600 dark:text-slate-300">100% Authentic</span>
                            </div>
                            <div className="flex flex-col items-center text-center gap-2">
                                <div
                                    className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center text-rose-400 dark:text-rose-300">
                                    <RefreshCw size={20}/>
                                </div>
                                <span
                                    className="text-xs font-medium text-slate-600 dark:text-slate-300">Easy Returns</span>
                            </div>
                        </div>

                        {/* Specifications Section - now before Reviews */}
                        {(currentWeight || product.material || selectedVariant?.sku || product.sku) && (
                            <div className="border-t border-slate-100 dark:border-slate-800 pt-8 mt-8">
                                <Heading size="md" className="font-sans text-slate-900 dark:text-white mb-4">
                                    {t('specifications')}
                                </Heading>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-sm">
                                    {(selectedVariant?.material || product.material) && (
                                        <div className="flex justify-between py-2 border-b border-slate-50 dark:border-slate-800">
                                            <span className="text-slate-500">{t('material')}</span>
                                            <span className="font-medium text-slate-900 dark:text-white">{selectedVariant?.material || product.material}</span>
                                        </div>
                                    )}
                                    {currentWeight && (
                                        <div className="flex justify-between py-2 border-b border-slate-50 dark:border-slate-800">
                                            <span className="text-slate-500">{t('weight')}</span>
                                            <span className="font-medium text-slate-900 dark:text-white">{currentWeight}</span>
                                        </div>
                                    )}
                                    {(selectedVariant?.sku || product.sku) && (
                                        <div className="flex justify-between py-2 border-b border-slate-50 dark:border-slate-800">
                                            <span className="text-slate-500">{t('sku')}</span>
                                            <span className="font-medium text-slate-900 dark:text-white">{selectedVariant?.sku || product.sku}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Reviews Section - now comes after Specifications and no longer followed by a separate Specs block */}
                        {/*<div className="border-t border-slate-100 dark:border-slate-800 pt-8">*/}
                        {/*    <Heading size="md" className="font-sans text-slate-900 dark:text-white mb-6">{t('reviews')}</Heading>*/}
                        {/*    <div className="space-y-6">*/}
                        {/*        {reviews.length === 0 ? (*/}
                        {/*            <div*/}
                        {/*                className="text-center py-8 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">*/}
                        {/*                <p className="text-slate-500 dark:text-slate-400 text-sm">{t('no_reviews')}</p>*/}
                        {/*            </div>*/}
                        {/*        ) : (*/}
                        {/*            reviews.map((review) => (*/}
                        {/*                <div key={review.id}*/}
                        {/*                     className="border-b border-slate-100 dark:border-slate-800 pb-6 last:border-0 last:pb-0">*/}
                        {/*                    <div className="flex items-center justify-between mb-2">*/}
                        {/*                        <div className="flex items-center gap-2">*/}
                        {/*                            <div*/}
                        {/*                                className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center text-rose-400 dark:text-rose-300 font-bold text-xs">*/}
                        {/*                                {review.user_name.charAt(0)}*/}
                        {/*                            </div>*/}
                        {/*                            <div>*/}
                        {/*                                <div*/}
                        {/*                                    className="font-bold text-slate-900 dark:text-white text-sm">{review.user_name}</div>*/}
                        {/*                                <RatingStars rating={review.rating} size="sm"/>*/}
                        {/*                            </div>*/}
                        {/*                        </div>*/}
                        {/*                        <div*/}
                        {/*                            className="text-xs text-slate-400">{new Date(review.created_at).toLocaleDateString()}</div>*/}
                        {/*                    </div>*/}
                        {/*                    <p className="text-slate-600 dark:text-slate-300 text-sm mt-2">{review.comment}</p>*/}
                        {/*                    {review.images && (*/}
                        {/*                        <div className="flex gap-2 mt-3">*/}
                        {/*                            {parseReviewImages(review.images).map((img: string, i: number) => (*/}
                        {/*                                <div key={i}*/}
                        {/*                                     className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 dark:border-slate-700">*/}
                        {/*                                    <ResponsiveImage src={getImageUrl(img)} alt="Review"*/}
                        {/*                                                     width={100} height={100}*/}
                        {/*                                                     className="w-full h-full object-cover"/>*/}
                        {/*                                </div>*/}
                        {/*                            ))}*/}
                        {/*                        </div>*/}
                        {/*                    )}*/}
                        {/*                </div>*/}
                        {/*            ))*/}
                        {/*        )}*/}
                        {/*    </div>*/}
                        {/*</div>*/}

                        {/* Description Section */}
                        <div className="border-t border-slate-100 dark:border-slate-800 pt-8 mt-8">
                            <Heading size="md" className="font-sans text-slate-900 dark:text-white mb-4">
                                {t('description')}
                            </Heading>
                            <div
                                className="prose dark:ppink-invert max-w-none text-slate-600 dark:text-slate-300 leading-relaxed text-sm"
                                dangerouslySetInnerHTML={{__html: getLocalizedField(product, 'description', language)}}
                            />
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <div className="mb-16 border-t border-slate-100 dark:border-slate-800 pt-16 mt-16">
                        <Heading size="lg"
                                 className="font-sans text-slate-900 dark:text-white mb-8 text-center">{t('you_might_like')}</Heading>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
                            {relatedProducts.map((p: any) => {
                                let imageUrl = "https://picsum.photos/seed/product-item/700/700";
                                if (Array.isArray(p.images) && p.images.length > 0) {
                                    imageUrl = getImageUrl(p.images[0]);
                                } else if (typeof p.images === 'string') {
                                    try {
                                        const parsed = JSON.parse(p.images);
                                        if (Array.isArray(parsed) && parsed.length > 0) {
                                            imageUrl = getImageUrl(parsed[0]);
                                        } else {
                                            imageUrl = getImageUrl(p.images);
                                        }
                                    } catch (e) {
                                        imageUrl = getImageUrl(p.images);
                                    }
                                }

                                return (
                                    <div key={p.id}
                                         className="group cursor-pointer flex flex-col h-full bg-white dark:bg-slate-800 rounded-xl p-3 shadow-sm hover:shadow-md transition-all border border-slate-100 dark:border-slate-700">
                                        <div
                                            className="relative aspect-square overflow-hidden rounded-lg bg-[#f8f8f8] mb-3 dark:bg-slate-700">
                                            <Link href={`/products/${p.slug || p.id}`} className="block w-full h-full">
                                                <ResponsiveImage
                                                    src={imageUrl}
                                                    alt={getLocalizedField(p, 'name', language)}
                                                    width={400}
                                                    height={400}
                                                    className="object-cover w-full h-full sm:group-hover:scale-110 transition-transform duration-700 ease-out"
                                                />
                                            </Link>
                                        </div>
                                        <div className="space-y-1 text-center flex-grow">
                                            <h3 className="text-sm font-bold text-slate-900 font-sans group-hover:text-rose-400 transition-colors dark:text-white line-clamp-1">
                                                <Link
                                                    href={`/products/${p.slug || p.id}`}>{getLocalizedField(p, 'name', language)}</Link>
                                            </h3>
                                            <div
                                                className="text-lg font-bold text-slate-900 dark:text-white">৳{p.price}</div>
                                        </div>
                                        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                                            <Button
                                                className="w-full py-2 text-xs font-bold rounded-lg bg-rose-400 text-white hover:bg-rose-500 transition-colors flex items-center justify-center gap-2"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();

                                                    if (p.has_variants) {
                                                        router.push(`/products/${p.slug || p.id}`);
                                                        return;
                                                    }

                                                    if (parseInt(p.stock) < 1) {
                                                        addToast(t('out_of_stock'), 'error');
                                                        return;
                                                    }

                                                    addItem({
                                                        id: p.id,
                                                        slug: p.slug,
                                                        name: getLocalizedField(p, 'name', language),
                                                        price: parseFloat(p.price),
                                                        image: imageUrl,
                                                        quantity: 1,
                                                        stock: parseInt(p.stock)
                                                    });
                                                    addToast(`Added ${getLocalizedField(p, 'name', language)} to cart`, 'success');
                                                }}
                                            >
                                                <ShoppingCart size={14}/>
                                                {t('add_to_cart')}
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Sticky Mobile Action Bar */}
            <div
                className="fixed bottom-0 left-0 right-0 p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 sm:hidden z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                <div className="flex gap-3">
                    {currentStock > 0 ? (
                        <>
                            <Button
                                className="flex-1 py-3 text-sm rounded-lg bg-rose-400 text-white font-bold shadow-md"
                                onClick={handleAddToCart}
                            >
                                {t('add_to_cart')}
                            </Button>
                            <Button
                                className="flex-1 py-3 text-sm rounded-lg bg-slate-900 text-white font-bold shadow-md dark:bg-white dark:text-slate-900"
                                onClick={handleOrderNow}
                            >
                                {t('buy_now')}
                            </Button>
                        </>
                    ) : (
                        <Button
                            className="w-full py-3 text-sm rounded-lg bg-amber-500 text-white font-bold shadow-md"
                            onClick={() => setShowNotifyModal(true)}
                        >
                            {t('notify_me')}
                        </Button>
                    )}
                </div>
            </div>

            {/* Notify Me Modal */}
            {showNotifyModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-md p-8 rounded-3xl shadow-2xl relative">
                        <button onClick={() => setShowNotifyModal(false)}
                                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white">✕
                        </button>
                        <Heading size="lg"
                                 className="mb-2 text-slate-900 dark:text-white">{t('request_stock')}</Heading>
                        <p className="text-slate-500 dark:text-slate-400 mb-6">{t('notify_when_available')}</p>

                        <form onSubmit={handleNotifyRequest} className="space-y-4">
                            <Input label={t('phone_number')} value={notifyPhone}
                                   onChange={e => setNotifyPhone(e.target.value)} required placeholder="017..."
                                   disabled={isSubmittingRequest}/>
                            <Input label={t('email_optional')} value={notifyEmail}
                                   onChange={e => setNotifyEmail(e.target.value)} placeholder="you@example.com"
                                   disabled={isSubmittingRequest}/>
                            <Button fullWidth type="submit" disabled={isSubmittingRequest}
                                    className="rounded-xl py-3 mt-2">
                                {isSubmittingRequest ? t('processing') : t('submit_request')}
                            </Button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
