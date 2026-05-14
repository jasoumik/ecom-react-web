"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Heading, Text, Button, ResponsiveImage, RatingStars } from "@/components/ui";
import { API_URL } from "@/lib/config";
import { useToast } from "@/components/ui/Toast";
import { FullScreenLoader } from "@/components/ui/Loader";
import { Input } from "@/components/ui/Input";
import { useLanguage } from "@/lib/language-context";
import { getLocalizedField, getImageUrl } from "@/lib/utils";
import { useSettings } from "@/lib/settings-context";
import { DISTRICTS, DHAKA_METRO_THANAS, DHAKA_SUBURBS } from "@/lib/bd-locations";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { CheckCircle2, Truck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const isLikelyBdPhone = (value: string) => {
  const trimmed = value.replace(/\s+/g, "");
  return /^01[3-9]\d{8}$/.test(trimmed) || /^\+8801[3-9]\d{8}$/.test(trimmed);
};

export default function BuyNowPage() {
  const params = useParams();
  const slugOrId = params.id as string;
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  
  // Checkout State
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [district, setDistrict] = useState("");
  const [thana, setThana] = useState("");
  
  const [deliveryCharges, setDeliveryCharges] = useState<any[]>([]);
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [transactionId, setTransactionId] = useState("");
  const [paymentPhone, setPaymentPhone] = useState(""); // Added payment phone
  const [paymentNumbers, setPaymentNumbers] = useState<any>({});
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState<string[]>(["cod", "bkash", "nagad"]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [saveAddress, setSaveAddress] = useState(false);
  
  // Variant State
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  
  // Image State
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Zoom State
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const imageRef = useRef<HTMLDivElement>(null);

  const { addToast } = useToast();
  const router = useRouter();
  const { t, language } = useLanguage();
  const settings = useSettings();

  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  // Derive simple specs similar to product details page
  const currentWeight = useMemo(() => {
    if (selectedVariant?.weight) return selectedVariant.weight;
    if (product?.weight) return product.weight;
    return null;
  }, [selectedVariant, product]);

  const rawDescription = getLocalizedField(product, 'description', language) || '';
  const descriptionWordCount = useMemo(
    () => rawDescription.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).filter(Boolean).length,
    [rawDescription]
  );

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
        try {
            const parsedUser = JSON.parse(userStr);
            setUser(parsedUser);
            setCustomerName(parsedUser.name || "");
            setCustomerPhone(parsedUser.phone || "");
            fetchAddresses(parsedUser.id);
        } catch (e) {}
    }

    const fetchProduct = async () => {
      try {
        const res = await fetch(`${API_URL}/products/${slugOrId}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
          
          if (data.variants && data.variants.length > 0) {
              const sortedVariants = [...data.variants].sort((a, b) => b.stock - a.stock);
              const first = sortedVariants[0];
              if (first.size) setSelectedSize(first.size);
              if (first.color) setSelectedColor(first.color);
          }
        }
      } catch (error) {
        console.error("Failed to fetch product", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    fetchDeliveryCharges();
    fetchSettings();
  }, [slugOrId]);

  const fetchAddresses = async (userId: string) => {
      try {
          const res = await fetch(`${API_URL}/users/${userId}/addresses`);
          if (res.ok) {
              const data = await res.json();
              setSavedAddresses(Array.isArray(data) ? data : []);
              // Auto-select default address
              const defaultAddr = data.find((a: any) => a.is_default) || data[0];
              if (defaultAddr) handleAddressSelect(defaultAddr);
          }
      } catch (e) {}
  };

  const fetchDeliveryCharges = async () => {
      try {
          const res = await fetch(`${API_URL}/delivery`);
          const data = await res.json();
          setDeliveryCharges(data);
      } catch (e) {}
  };

  const fetchSettings = async () => {
      try {
          const res = await fetch(`${API_URL}/settings`);
          const data = await res.json();
          const numbers: any = {};
          data.forEach((s: any) => {
              if (s.key === 'bkash_number') numbers.bkash = s.value;
              if (s.key === 'nagad_number') numbers.nagad = s.value;
              if (s.key === 'payment_methods') {
                  // Ensure COD is always first if present
                  let methods = s.value.split(',').map((m: string) => m.trim().toLowerCase());
                  if (methods.includes('cod')) {
                      methods = ['cod', ...methods.filter((m: string) => m !== 'cod')];
                  }
                  setAvailablePaymentMethods(methods);
              }
          });
          setPaymentNumbers(numbers);
      } catch (e) {}
  };

  // Update Delivery Charge based on District and Thana
  useEffect(() => {
    if (deliveryCharges.length === 0) return;

    let targetCharge;
    
    if (!district) {
        setSelectedDeliveryId("");
        return;
    }

    if (district === "Dhaka") {
        if (!thana) {
            setSelectedDeliveryId(""); // Wait for thana selection
            return;
        }

        if (DHAKA_METRO_THANAS.includes(thana)) {
            targetCharge = deliveryCharges.find(d => d.name.toLowerCase().includes("inside dhaka"));
        } else if (DHAKA_SUBURBS.includes(thana)) {
            targetCharge = deliveryCharges.find(d => d.name.toLowerCase().includes("outside dhaka metro"));
        } else {
            targetCharge = deliveryCharges.find(d => d.name.toLowerCase().includes("inside dhaka"));
        }
    } else {
        targetCharge = deliveryCharges.find(d => d.name.toLowerCase().includes("outside dhaka") && !d.name.toLowerCase().includes("metro"));
    }

    // Fallback logic
    if (!targetCharge) {
        if (district === "Dhaka") targetCharge = deliveryCharges.find(d => d.name.toLowerCase().includes("dhaka"));
        else targetCharge = deliveryCharges.find(d => d.name.toLowerCase().includes("outside"));
    }

    if (targetCharge) {
        setSelectedDeliveryId(targetCharge.id);
    }
  }, [district, thana, deliveryCharges]);

  useEffect(() => {
      if (!product || !product.variants) return;
      const variant = product.variants.find((v: any) => {
          const sizeMatch = !v.size || v.size === selectedSize;
          const colorMatch = !v.color || v.color === selectedColor;
          return sizeMatch && colorMatch;
      });
      setSelectedVariant(variant);
  }, [selectedSize, selectedColor, product]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!imageRef.current) return;
    const { left, top, width, height } = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePos({ x, y });
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    
    if (product.has_variants && product.variants.length > 0 && !selectedVariant) {
        addToast("Please select valid options (Size/Color)", "error");
        return;
    }

    if (!customerName || !customerPhone || !customerAddress) {
        addToast("Please fill in all required fields", "error");
        return;
    }

    if (!isLikelyBdPhone(customerPhone)) {
        addToast("Please enter a valid Bangladeshi phone number", "error");
        return;
    }

    if (!district) {
        addToast("Please select your district", "error");
        return;
    }
    if (district === "Dhaka" && !thana) {
        addToast("Please select your area/thana", "error");
        return;
    }
    if (!selectedDeliveryId) {
        addToast("Please select a valid delivery area", "error");
        return;
    }
    
    if (!paymentMethod) {
        addToast("Please select a payment method", "error");
        return;
    }

    if ((paymentMethod === 'bkash' || paymentMethod === 'nagad')) {
        if (!transactionId) {
            addToast("Please enter transaction ID", "error");
            return;
        }
        if (!paymentPhone) {
            addToast("Please enter the phone number you sent money from", "error");
            return;
        }
        if (!isLikelyBdPhone(paymentPhone)) {
            addToast("Please enter a valid Bangladeshi sender phone number", "error");
            return;
        }
    }

    setIsSubmitting(true);
    try {
      const locationString = district === "Dhaka" ? `${thana}, ${district}` : district;
      const fullAddress = `${customerAddress}, ${locationString}`;

      // Save address if requested AND not already saved
      const isAddressSaved = savedAddresses.some(addr => addr.address.toLowerCase() === customerAddress.toLowerCase());
      if (user && saveAddress && customerAddress && !isAddressSaved) {
          await fetch(`${API_URL}/users/${user.id}/addresses`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ address: customerAddress, city: locationString, type: 'Home', is_default: false }),
          });
      }

      const orderData = {
        customerName,
        customerPhone,
        customerAddress: fullAddress,
        deliveryChargeId: selectedDeliveryId,
        paymentMethod,
        transactionId: (paymentMethod === 'bkash' || paymentMethod === 'nagad') ? transactionId : undefined,
        paymentPhone: (paymentMethod === 'bkash' || paymentMethod === 'nagad') ? paymentPhone : undefined,
        items: [{
            productId: product.id,
            variantId: selectedVariant?.id,
            quantity: quantity
        }],
        orderSource: 'Landing Page'
      };

      const res = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (res.ok) {
        const data = await res.json();
        addToast("Order placed successfully!", "success");
        router.push(`/thank-you?orderId=${data.id}`);
      } else {
        const errorData = await res.json();
        addToast(errorData.message || "Failed to place order.", "error");
      }
    } catch (error) {
      addToast("Error placing order.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddressSelect = (address: any) => {
      setCustomerName(user?.name || "");
      setCustomerPhone(user?.phone || "");
      setCustomerAddress(address.address);
      if (address.city) {
          const parts = address.city.split(',').map((p: string) => p.trim());
          if (parts.length > 1) {
              setDistrict(parts[1]);
              setThana(parts[0]);
          } else {
              setDistrict(address.city);
              setThana("");
          }
      }
  };

  if (loading) return <FullScreenLoader />;
  if (!product) return <div className="min-h-screen flex items-center justify-center">Product not found</div>;

  const currentPrice = selectedVariant ? (selectedVariant.price || product.price) : product.price;
  const selectedDelivery = deliveryCharges.find(d => d.id === selectedDeliveryId);
  const deliveryAmount = selectedDelivery ? parseFloat(selectedDelivery.amount) : 0;
  
  // Free Shipping Logic
  const subtotal = parseFloat(currentPrice) * quantity;
  const freeShippingThreshold = parseFloat(settings.free_shipping_threshold || "5000");
  const isFreeShipping = subtotal >= freeShippingThreshold;
  const finalDeliveryAmount = isFreeShipping ? 0 : deliveryAmount;
  const totalAmount = subtotal + finalDeliveryAmount;
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const progress = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  const sizes = product.variants ? Array.from(new Set(product.variants.map((v: any) => v.size).filter(Boolean))) : [];
  const colors = product.variants ? Array.from(new Set(product.variants.map((v: any) => v.color).filter(Boolean))) : [];

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

  const currentImage = mediaList[selectedImageIndex] || mediaList[0];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans">
      {/* Simple Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 py-4 text-center sticky top-0 z-50">
          <h1 className="text-2xl font-bold text-sky-500">{settings.shop_name}</h1>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8 pb-32">
        {/* Product Hero */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden mb-8">
            <div
                className="aspect-video w-full relative bg-slate-100 dark:bg-slate-700 cursor-zoom-in group"
                ref={imageRef}
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
            >
                <div
                    className="absolute inset-0 w-full h-full"
                    style={{
                        backgroundImage: `url(${getImageUrl(currentImage)})`,
                        backgroundPosition: isZoomed ? `${mousePos.x}% ${mousePos.y}%` : "center",
                        backgroundSize: isZoomed ? "200%" : "contain",
                        backgroundRepeat: "no-repeat",
                        transition: isZoomed ? "none" : "background-size 0.2s ease-out, background-position 0.2s ease-out",
                    }}
                />
                {/* Fallback image for SEO and when JS is disabled; hidden when zoomed */}
                <img
                    src={getImageUrl(currentImage)}
                    alt={getLocalizedField(product, "name", language)}
                    className={`absolute inset-0 w-full h-full object-contain p-2 ${
                        isZoomed ? "opacity-0" : "opacity-100"
                    }`}
                />
            </div>
            
            {/* Image Thumbnails */}
            {mediaList.length > 1 && (
                <div className="flex gap-2 p-4 overflow-x-auto">
                    {mediaList.map((img, i) => (
                        <button 
                            key={i} 
                            onClick={() => setSelectedImageIndex(i)}
                            className={`w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${selectedImageIndex === i ? 'border-sky-500 ring-2 ring-sky-500/20' : 'border-slate-200 dark:border-slate-700'}`}
                        >
                            <ResponsiveImage 
                                src={getImageUrl(img)} 
                                alt={`Thumbnail ${i}`} 
                                width={64} 
                                height={64} 
                                className="w-full h-full object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}

            <div className="p-6 sm:p-8">
                <Heading size="lg" className="font-sans text-slate-900 dark:text-white mb-3 leading-tight text-xl sm:text-2xl md:text-3xl">
                    {getLocalizedField(product, 'name', language)}
                </Heading>
                
                <div className="flex flex-wrap items-baseline gap-2 sm:gap-3 mb-6">
                    <div className="text-2xl sm:text-3xl font-black text-sky-600 dark:text-sky-400 break-words max-w-full">
                      ৳{currentPrice}
                    </div>
                    {product.old_price && (
                      <div className="text-base sm:text-xl text-slate-400 line-through break-words max-w-full">
                        ৳{product.old_price}
                      </div>
                    )}
                    {product.old_price && (
                        <div className="bg-red-100 text-red-600 text-[10px] sm:text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap">
                            SAVE ৳{parseFloat(product.old_price) - parseFloat(currentPrice)}
                        </div>
                    )}
                </div>

                {/* Variants */}
                {product.has_variants && (
                    <div className="space-y-4 mb-6 p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-100 dark:border-slate-700">
                        {sizes.length > 0 && (
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{t('size')}</label>
                                <div className="flex flex-wrap gap-2">
                                    {sizes.map((size: any) => (
                                        <button
                                            key={size}
                                            onClick={() => setSelectedSize(size)}
                                            className={`px-4 py-2 rounded-lg border text-sm font-bold transition-all ${
                                                selectedSize === size 
                                                ? 'border-sky-500 bg-sky-500 text-white shadow-md' 
                                                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300'
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
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{t('color')}</label>
                                <div className="flex flex-wrap gap-2">
                                    {colors.map((color: any) => (
                                        <button
                                            key={color}
                                            onClick={() => setSelectedColor(color)}
                                            className={`px-4 py-2 rounded-lg border text-sm font-bold transition-all ${
                                                selectedColor === color 
                                                ? 'border-sky-500 bg-sky-500 text-white shadow-md' 
                                                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300'
                                            }`}
                                        >
                                            {color}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Quantity */}
                <div className="flex items-center gap-4 mb-6">
                    <span className="font-bold text-slate-700 dark:text-slate-300">{t('quantity')}:</span>
                    <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-700 rounded-xl p-1">
                        <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 bg-white dark:bg-slate-600 rounded-lg shadow-sm font-bold text-lg">-</button>
                        <span className="w-8 text-center font-bold text-lg">{quantity}</span>
                        <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 bg-white dark:bg-slate-600 rounded-lg shadow-sm font-bold text-lg">+</button>
                    </div>
                </div>

                {/* Specifications Section (if available) */}
                {(currentWeight || product?.material || selectedVariant?.sku || product?.sku) && (
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-6 mt-6">
                    <Heading size="md" className="font-sans text-slate-900 dark:text-white mb-3">
                      {t('specifications')}
                    </Heading>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-sm">
                      {(selectedVariant?.material || product?.material) && (
                        <div className="flex justify-between py-2 border-b border-slate-50 dark:border-slate-800">
                          <span className="text-slate-500">{t('material')}</span>
                          <span className="font-medium text-slate-900 dark:text-white">{selectedVariant?.material || product?.material}</span>
                        </div>
                      )}
                      {currentWeight && (
                        <div className="flex justify-between py-2 border-b border-slate-50 dark:border-slate-800">
                          <span className="text-slate-500">{t('weight')}</span>
                          <span className="font-medium text-slate-900 dark:text-white">{currentWeight}</span>
                        </div>
                      )}
                      {(selectedVariant?.sku || product?.sku) && (
                        <div className="flex justify-between py-2 border-b border-slate-50 dark:border-slate-800">
                          <span className="text-slate-500">{t('sku')}</span>
                          <span className="font-medium text-slate-900 dark:text-white">{selectedVariant?.sku || product?.sku}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Description Section with rich text and see more */}
                <div className="border-t border-slate-100 dark:border-slate-800 pt-6 mt-6">
                  <Heading size="md" className="font-sans text-slate-900 dark:text-white mb-3">
                    {t('description')}
                  </Heading>
                  <div
                    className={
                      "prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 leading-relaxed text-sm " +
                      (isDescriptionExpanded || descriptionWordCount <= 100
                        ? "max-h-none"
                        : "max-h-[30rem] overflow-hidden")
                    }
                    dangerouslySetInnerHTML={{ __html: rawDescription }}
                  />
                  {descriptionWordCount > 100 && (
                    <button
                      type="button"
                      onClick={() => setIsDescriptionExpanded((prev) => !prev)}
                      className="mt-3 text-xs font-bold text-sky-600 hover:text-sky-700"
                    >
                      {isDescriptionExpanded ? t('see_less') : t('see_more')}
                    </button>
                  )}
                </div>
            </div>
        </div>

        {/* Order Form */}
        <div id="order-form" className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl shadow-lg border-2 border-sky-100 dark:border-slate-700">
            <Heading size="lg" className="font-sans text-slate-900 dark:text-white mb-6 text-center">{t('fill_form_to_confirm')}</Heading>
            
            {/* Order Summary Top */}
            <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-100 dark:border-slate-700">
                <div className="flex flex-wrap items-start gap-3 mb-4">
                    <div className="w-16 h-16 rounded-lg bg-white p-1 border border-slate-200 overflow-hidden shrink-0">
                        <img src={getImageUrl(currentImage)} alt={getLocalizedField(product, 'name', language)} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm text-slate-900 dark:text-white flex flex-wrap items-center gap-1">
                            <span className="text-sm sm:text-lg truncate max-w-full">{user?.name || getLocalizedField(product, 'name', language)}</span>
                            {user?.phone && (
                              <span className="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 break-words">
                                {user.phone}
                              </span>
                            )}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 break-words">
                            {selectedVariant ? [selectedSize, selectedColor].filter(Boolean).join(' / ') : ''}
                        </div>
                        <div className="font-bold text-sky-600 dark:text-sky-400 mt-1 text-sm sm:text-base break-words">
                          ৳{currentPrice} x {quantity}
                        </div>
                    </div>
                    <div className="text-right ml-auto">
                        <div className="font-bold text-base sm:text-lg text-slate-900 dark:text-white break-words max-w-full">
                          ৳{subtotal}
                        </div>
                    </div>
                </div>
                
                {/* Free Shipping Bar */}
                <div className="mt-4">
                    <div className="flex justify-between text-xs mb-1.5">
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                            {isFreeShipping ? t('free_shipping_unlocked') : t('add_more_free_shipping', { amount: amountToFreeShipping.toString() })}
                        </span>
                        <span className="font-bold text-sky-600 dark:text-sky-400">{progress.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                        <div 
                            className={`h-full rounded-full transition-all duration-500 ${isFreeShipping ? 'bg-emerald-500' : 'bg-sky-500'}`} 
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            <form onSubmit={handlePlaceOrder} className="space-y-5">
                {/* Saved Addresses - Animated */}
                {savedAddresses.length > 0 && (
                    <div className="mb-4 animate-in fade-in slide-in-from-top-2 duration-500">
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Saved Addresses</label>
                            <span className="text-[10px] text-sky-500 font-medium bg-sky-50 px-2 py-0.5 rounded-full">Tap to select</span>
                        </div>
                        <div className="space-y-2">
                            {savedAddresses.map(addr => (
                                <button
                                    key={addr.id}
                                    type="button"
                                    onClick={() => handleAddressSelect(addr)}
                                    className={`w-full text-left p-3 rounded-xl border transition-all duration-200 group relative overflow-hidden ${
                                        customerAddress === addr.address 
                                        ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/20 ring-1 ring-sky-500' 
                                        : 'border-slate-200 dark:border-slate-700 hover:border-sky-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                                    }`}
                                >
                                    <div className="flex justify-between items-center">
                                        <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                                            <span className="text-lg">{addr.type === 'Home' ? '🏠' : addr.type === 'Office' ? '🏢' : '📍'}</span>
                                            {addr.type}
                                        </div>
                                        {customerAddress === addr.address && (
                                            <span className="text-sky-500 text-xs font-bold animate-in zoom-in">Selected</span>
                                        )}
                                    </div>
                                    <div className="text-xs text-slate-500 truncate mt-1 pl-7">{addr.address}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <Input 
                    label={t('full_name')} 
                    value={customerName} 
                    onChange={e => setCustomerName(e.target.value)} 
                    required 
                    placeholder={t('enter_your_name')}
                    className="bg-slate-50/50"
                />
                <Input 
                    label={t('phone_number')} 
                    value={customerPhone} 
                    onChange={e => setCustomerPhone(e.target.value)} 
                    required 
                    placeholder={t('enter_mobile_number')}
                    className="bg-slate-50/50"
                />
                
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="w-full">
                        <SearchableSelect 
                            label="District"
                            placeholder="Select District"
                            options={DISTRICTS}
                            value={district}
                            onChange={(val) => {
                                setDistrict(val);
                                setThana("");
                            }}
                        />
                    </div>
                    
                    {district === "Dhaka" && (
                        <div className="w-full animate-in fade-in slide-in-from-left-2">
                            <SearchableSelect 
                                label="Area / Thana"
                                placeholder="Select Thana"
                                options={[...DHAKA_METRO_THANAS, ...DHAKA_SUBURBS].sort()}
                                value={thana}
                                onChange={setThana}
                            />
                        </div>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t('address')}</label>
                    <textarea 
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-slate-500 resize-none"
                        value={customerAddress} 
                        onChange={(e) => setCustomerAddress(e.target.value)} 
                        required 
                        rows={3}
                        placeholder={t('enter_full_address')}
                    />
                </div>
                
                {user && (
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <div className="relative flex items-center">
                            <input 
                                type="checkbox" 
                                checked={saveAddress} 
                                onChange={e => setSaveAddress(e.target.checked)}
                                className="peer w-5 h-5 rounded border-slate-300 text-sky-500 focus:ring-sky-500 transition-all cursor-pointer"
                            />
                        </div>
                        <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-sky-600 transition-colors">Save this address for future</span>
                    </label>
                )}

                <div className="space-y-3">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">{t('delivery_area')}</label>
                    <div className="p-4 bg-sky-50 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-800 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-sky-500 shadow-sm">
                                <Truck size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">Delivery Charge</p>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">
                                    {selectedDelivery ? selectedDelivery.name : "Select address to calculate"}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-lg font-bold text-slate-900 dark:text-white">
                                {isFreeShipping ? <span className="text-emerald-600">FREE</span> : `৳${selectedDelivery ? selectedDelivery.amount : 0}`}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">{t('payment_method')}</label>
                    <div className="grid grid-cols-3 gap-2">
                        {availablePaymentMethods.map(method => {
                            const methodKey = method.toLowerCase();
                            const isSelected = paymentMethod === methodKey;
                            
                            return (
                                <motion.label 
                                    key={methodKey} 
                                    className={`flex flex-col items-center justify-center p-3 rounded-xl border cursor-pointer transition-all relative overflow-hidden ${isSelected ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/20 shadow-md' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'}`}
                                    whileTap={{ scale: 0.98 }}
                                    animate={{ 
                                        borderColor: isSelected ? '#0ea5e9' : 'rgba(226, 232, 240, 1)',
                                        backgroundColor: isSelected ? 'rgba(14, 165, 233, 0.1)' : 'transparent'
                                    }}
                                >
                                    <input type="radio" name="payment" value={methodKey} checked={isSelected} onChange={() => setPaymentMethod(methodKey)} className="hidden" />
                                    
                                    {isSelected && (
                                        <motion.div 
                                            layoutId="check-buy"
                                            className="absolute top-2 right-2 text-sky-500"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                        >
                                            <CheckCircle2 size={16} fill="currentColor" className="text-white" />
                                        </motion.div>
                                    )}

                                    {methodKey === 'bkash' ? (
                                        <img src="https://freelogopng.com/images/all_img/1656234745bkash-app-logo-png.png" alt="Bkash" className="h-8 w-auto mb-1 object-contain" />
                                    ) : methodKey === 'nagad' ? (
                                        <img src="https://freelogopng.com/images/all_img/1679248787Nagad-Logo.png" alt="Nagad" className="h-8 w-auto mb-1 object-contain" />
                                    ) : methodKey === 'visa' ? (
                                        <span className="text-xl mb-1 font-bold text-blue-700">VISA</span>
                                    ) : methodKey === 'mastercard' ? (
                                        <span className="text-xl mb-1 font-bold text-red-600">MC</span>
                                    ) : (
                                        <span className="text-2xl mb-1">💵</span>
                                    )}
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 text-center leading-tight capitalize">
                                        {methodKey === 'cod' ? 'Cash on Delivery' : method}
                                    </span>
                                </motion.label>
                            );
                        })}
                    </div>
                    
                    <AnimatePresence mode="wait">
                        {(paymentMethod === 'bkash' || paymentMethod === 'nagad') && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700 mt-2">
                                    <div className="mb-4 text-sm text-slate-600 dark:text-slate-300">
                                        <p className="mb-2 font-bold text-slate-900 dark:text-white">How to pay with {paymentMethod === 'bkash' ? 'bKash' : 'Nagad'}:</p>
                                        <ol className="list-decimal list-inside space-y-1 text-xs">
                                            <li>Go to your {paymentMethod === 'bkash' ? 'bKash' : 'Nagad'} App or dial <span className="font-bold text-sky-600">{paymentMethod === 'bkash' ? '*247#' : '*167#'}</span></li>
                                            <li>Choose "Send Money"</li>
                                            <li>Enter Number: <span className="font-bold text-slate-900 dark:text-white select-all bg-yellow-100 dark:bg-yellow-900/30 px-1 rounded">{paymentMethod === 'bkash' ? paymentNumbers.bkash : paymentNumbers.nagad}</span></li>
                                            <li>Enter Amount: <span className="font-bold text-slate-900 dark:text-white">৳{totalAmount}</span></li>
                                            <li>Enter Reference: <span className="font-bold text-slate-900 dark:text-white">1</span></li>
                                            <li>Enter your PIN to confirm</li>
                                        </ol>
                                    </div>
                                    
                                    <div className="grid gap-3">
                                        <Input 
                                            label="Your Phone Number (Sender)" 
                                            value={paymentPhone} 
                                            onChange={(e) => setPaymentPhone(e.target.value)} 
                                            placeholder="017..." 
                                            required 
                                            className="bg-white dark:bg-slate-900"
                                        />
                                        <Input 
                                            label="Transaction ID" 
                                            placeholder="Enter TrxID" 
                                            required 
                                            value={transactionId}
                                            onChange={(e) => setTransactionId(e.target.value)}
                                            className="bg-white dark:bg-slate-900"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Order Summary */}
                <div className="bg-slate-50 dark:bg-slate-700/30 p-4 rounded-xl space-y-2 border border-slate-100 dark:border-slate-700">
                    <div className="flex justify-between text-sm">
                        <span>{t('product_price')}</span>
                        <span>৳{parseFloat(currentPrice) * quantity}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span>{t('delivery_charge')}</span>
                        <span className={isFreeShipping ? 'text-green-600 font-bold' : ''}>
                            {isFreeShipping ? 'FREE' : `৳${deliveryAmount}`}
                        </span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t border-slate-200 dark:border-slate-600 pt-2 mt-2">
                        <span>{t('total')}</span>
                        <span>৳{totalAmount}</span>
                    </div>
                </div>

                <Button 
                    fullWidth 
                    type="submit" 
                    disabled={isSubmitting}
                    className="py-4 text-lg shadow-xl shadow-sky-500/20 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl font-bold animate-pulse"
                >
                    {isSubmitting ? t('processing') : t('confirm_order')}
                </Button>
            </form>
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] sm:hidden">
          <Button 
            fullWidth 
            className="py-3 text-lg rounded-xl bg-sky-500 text-white font-bold shadow-lg"
            onClick={() => document.getElementById('order-form')?.scrollIntoView({ behavior: 'smooth' })}
          >
            {t('click_to_order')}
          </Button>
      </div>
    </div>
  );
}
