"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Heading, Text, Button, ResponsiveImage, RatingStars } from "@/components/ui";
import { API_URL } from "@/lib/config";
import { useToast } from "@/components/ui/Toast";
import { FullScreenLoader } from "@/components/ui/Loader";
import { Input } from "@/components/ui/Input";
import { useLanguage } from "@/lib/language-context";
import { getLocalizedField, getImageUrl } from "@/lib/utils";
import { useSettings } from "@/lib/settings-context";

export default function LandingOfferPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [landingPage, setLandingPage] = useState<any>(null);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  
  // Checkout State
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [deliveryCharges, setDeliveryCharges] = useState<any[]>([]);
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [transactionId, setTransactionId] = useState("");
  const [paymentNumbers, setPaymentNumbers] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Variant State
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  
  // Image State
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Zoom State
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLDivElement>(null);

  const { addToast } = useToast();
  const router = useRouter();
  const { t, language } = useLanguage();
  const settings = useSettings();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch Landing Page Config
        const lpRes = await fetch(`${API_URL}/landing-pages/slug/${slug}`);
        if (!lpRes.ok) throw new Error("Landing page not found");
        const lpData = await lpRes.json();
        setLandingPage(lpData);

        // 2. Fetch Product
        const productRes = await fetch(`${API_URL}/products/${lpData.product_id}`);
        if (productRes.ok) {
          const productData = await productRes.json();
          setProduct(productData);
          
          if (productData.variants && productData.variants.length > 0) {
              const sortedVariants = [...productData.variants].sort((a: any, b: any) => b.stock - a.stock);
              const first = sortedVariants[0];
              if (first.size) setSelectedSize(first.size);
              if (first.color) setSelectedColor(first.color);
          }
        }
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    fetchDeliveryCharges();
    fetchSettings();
  }, [slug]);

  const fetchDeliveryCharges = async () => {
      try {
          const res = await fetch(`${API_URL}/delivery`);
          const data = await res.json();
          setDeliveryCharges(data);
          if (data.length > 0) setSelectedDeliveryId(data[0].id);
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
          });
          setPaymentNumbers(numbers);
      } catch (e) {}
  };

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

    if ((paymentMethod === 'bkash' || paymentMethod === 'nagad') && !transactionId) {
        addToast("Please enter transaction ID", "error");
        return;
    }

    setIsSubmitting(true);
    try {
      const orderData = {
        customerName,
        customerPhone,
        customerAddress,
        deliveryChargeId: selectedDeliveryId,
        paymentMethod,
        transactionId: (paymentMethod === 'bkash' || paymentMethod === 'nagad') ? transactionId : undefined,
        items: [{
            productId: product.id,
            variantId: selectedVariant?.id,
            quantity: quantity
        }],
        orderSource: `Landing Page: ${landingPage.title}`
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

  if (loading) return <FullScreenLoader />;
  if (!landingPage || !product) return <div className="min-h-screen flex items-center justify-center">Page not found</div>;

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

  // Theme Logic (Basic implementation)
  const isDarkTheme = landingPage.theme === 'dark';
  const bgClass = isDarkTheme ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900';
  const cardClass = isDarkTheme ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100';

  return (
    <div className={`min-h-screen font-sans ${bgClass}`}>
      {/* Simple Header */}
      <header className={`${isDarkTheme ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} border-b py-4 text-center sticky top-0 z-50`}>
          <h1 className="text-2xl font-bold text-sky-500">{settings.shop_name}</h1>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8 pb-32">
        {/* Product Hero */}
        <div className={`${cardClass} rounded-3xl shadow-sm border overflow-hidden mb-8`}>
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
                        backgroundPosition: isZoomed ? `${mousePos.x}% ${mousePos.y}%` : 'center',
                        backgroundSize: isZoomed ? '200%' : 'contain',
                        backgroundRepeat: 'no-repeat',
                        transition: isZoomed ? 'none' : 'background-size 0.3s ease-out, background-position 0.2s ease-out'
                    }}
                />
                <img 
                    src={getImageUrl(currentImage)} 
                    alt={landingPage.title || getLocalizedField(product, 'name', language)} 
                    className={`absolute inset-0 w-full h-full object-contain p-2 ${isZoomed ? 'opacity-0' : 'opacity-100'}`} 
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
                <Heading size="lg" className={`font-sans mb-3 leading-tight text-xl sm:text-2xl md:text-3xl ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>
                    {landingPage.title || getLocalizedField(product, 'name', language)}
                </Heading>
                
                <div className="flex flex-wrap items-center gap-3 mb-6">
                    <div className="text-3xl font-black text-sky-600 dark:text-sky-400">৳{currentPrice}</div>
                    {product.old_price && <div className="text-xl text-slate-400 line-through">৳{product.old_price}</div>}
                    {product.old_price && (
                        <div className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap">
                            SAVE ৳{parseFloat(product.old_price) - parseFloat(currentPrice)}
                        </div>
                    )}
                </div>

                {/* Variants */}
                {product.has_variants && (
                    <div className={`space-y-4 mb-6 p-4 rounded-xl border ${isDarkTheme ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
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
                                                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300'
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
                                                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300'
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
                    <span className={`font-bold ${isDarkTheme ? 'text-slate-300' : 'text-slate-700'}`}>{t('quantity')}:</span>
                    <div className={`flex items-center gap-3 rounded-xl p-1 ${isDarkTheme ? 'bg-slate-800' : 'bg-slate-100'}`}>
                        <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className={`w-10 h-10 rounded-lg shadow-sm font-bold text-lg ${isDarkTheme ? 'bg-slate-700' : 'bg-white'}`}>-</button>
                        <span className="w-8 text-center font-bold text-lg">{quantity}</span>
                        <button onClick={() => setQuantity(quantity + 1)} className={`w-10 h-10 rounded-lg shadow-sm font-bold text-lg ${isDarkTheme ? 'bg-slate-700' : 'bg-white'}`}>+</button>
                    </div>
                </div>

                <div className={`prose max-w-none leading-relaxed ${isDarkTheme ? 'prose-invert text-slate-300' : 'text-slate-600'}`}>
                    {/* Use custom description if available, else product description */}
                    {landingPage.description || getLocalizedField(product, 'description', language)}
                </div>
            </div>
        </div>

        {/* Order Form */}
        <div id="order-form" className={`${cardClass} p-6 sm:p-8 rounded-3xl shadow-lg border-2 border-sky-100 dark:border-slate-700`}>
            <Heading size="lg" className={`font-sans mb-6 text-center ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>{t('fill_form_to_confirm')}</Heading>
            
            {/* Order Summary Top */}
            <div className={`mb-6 p-4 rounded-xl border ${isDarkTheme ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                <div className="flex items-center gap-4 mb-4">
                    <div className={`w-16 h-16 rounded-lg p-1 border overflow-hidden shrink-0 ${isDarkTheme ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                        <img src={getImageUrl(currentImage)} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1">
                        <div className={`font-bold text-sm line-clamp-1 ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>{getLocalizedField(product, 'name', language)}</div>
                        <div className={`text-xs ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>
                            {selectedVariant ? [selectedSize, selectedColor].filter(Boolean).join(' / ') : ''}
                        </div>
                        <div className="font-bold text-sky-600 dark:text-sky-400">৳{currentPrice} x {quantity}</div>
                    </div>
                    <div className="text-right">
                        <div className={`font-bold text-lg ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>৳{subtotal}</div>
                    </div>
                </div>
                
                {/* Free Shipping Bar */}
                <div className="mt-4">
                    <div className="flex justify-between text-xs mb-1.5">
                        <span className={`font-bold ${isDarkTheme ? 'text-slate-300' : 'text-slate-700'}`}>
                            {isFreeShipping ? t('free_shipping_unlocked') : t('add_more_free_shipping', { amount: amountToFreeShipping.toString() })}
                        </span>
                        <span className="font-bold text-sky-600 dark:text-sky-400">{progress.toFixed(0)}%</span>
                    </div>
                    <div className={`h-2 w-full rounded-full overflow-hidden ${isDarkTheme ? 'bg-slate-700' : 'bg-slate-200'}`}>
                        <div 
                            className={`h-full rounded-full transition-all duration-500 ${isFreeShipping ? 'bg-emerald-500' : 'bg-sky-500'}`} 
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            <form onSubmit={handlePlaceOrder} className="space-y-5">
                <Input 
                    label={t('full_name')} 
                    value={customerName} 
                    onChange={e => setCustomerName(e.target.value)} 
                    required 
                    placeholder={t('enter_your_name')}
                    className={isDarkTheme ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50/50'}
                />
                <Input 
                    label={t('phone_number')} 
                    value={customerPhone} 
                    onChange={e => setCustomerPhone(e.target.value)} 
                    required 
                    placeholder={t('enter_mobile_number')}
                    className={isDarkTheme ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50/50'}
                />
                <div>
                    <label className={`block text-sm font-bold mb-2 ${isDarkTheme ? 'text-slate-300' : 'text-slate-700'}`}>{t('address')}</label>
                    <textarea 
                        className={`w-full px-4 py-3 rounded-xl border focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all resize-none ${isDarkTheme ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'border-slate-200 bg-slate-50/50 text-slate-900 placeholder-slate-400'}`}
                        value={customerAddress} 
                        onChange={(e) => setCustomerAddress(e.target.value)} 
                        required 
                        rows={3}
                        placeholder={t('enter_full_address')}
                    />
                </div>

                <div className="space-y-3">
                    <label className={`block text-sm font-bold ${isDarkTheme ? 'text-slate-300' : 'text-slate-700'}`}>{t('delivery_area')}</label>
                    <div className="grid grid-cols-1 gap-2">
                        {deliveryCharges.map(charge => (
                            <label key={charge.id} className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${selectedDeliveryId === charge.id ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/20' : 'border-slate-200 dark:border-slate-700'}`}>
                                <div className="flex items-center gap-3">
                                    <input 
                                        type="radio" 
                                        name="delivery" 
                                        value={charge.id}
                                        checked={selectedDeliveryId === charge.id}
                                        onChange={() => setSelectedDeliveryId(charge.id)}
                                        className="w-4 h-4 text-sky-500 focus:ring-sky-500"
                                    />
                                    <span className={`text-sm font-medium ${isDarkTheme ? 'text-slate-300' : 'text-slate-700'}`}>{getLocalizedField(charge, 'name', language)}</span>
                                </div>
                                <div className="text-right">
                                    {isFreeShipping ? (
                                        <>
                                            <span className="text-xs text-slate-400 line-through mr-2">৳{charge.amount}</span>
                                            <span className="text-sm font-bold text-emerald-600">FREE</span>
                                        </>
                                    ) : (
                                        <span className="text-sm font-bold text-slate-900 dark:text-white">৳{charge.amount}</span>
                                    )}
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="space-y-3">
                    <label className={`block text-sm font-bold ${isDarkTheme ? 'text-slate-300' : 'text-slate-700'}`}>{t('payment_method')}</label>
                    <div className="grid grid-cols-3 gap-2">
                        <label className={`flex flex-col items-center justify-center p-3 rounded-xl border cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'}`}>
                            <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="hidden" />
                            <span className="text-2xl mb-1">💵</span>
                            <span className={`text-xs font-bold ${isDarkTheme ? 'text-slate-300' : 'text-slate-700'} text-center leading-tight`}>{t('cod')}</span>
                        </label>
                        <label className={`flex flex-col items-center justify-center p-3 rounded-xl border cursor-pointer transition-all ${paymentMethod === 'bkash' ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'}`}>
                            <input type="radio" name="payment" value="bkash" checked={paymentMethod === 'bkash'} onChange={() => setPaymentMethod('bkash')} className="hidden" />
                            <img src="https://freelogopng.com/images/all_img/1656234745bkash-app-logo-png.png" alt="Bkash" className="h-8 w-auto mb-1 object-contain" />
                            <span className={`text-xs font-bold ${isDarkTheme ? 'text-slate-300' : 'text-slate-700'}`}>Bkash</span>
                        </label>
                        <label className={`flex flex-col items-center justify-center p-3 rounded-xl border cursor-pointer transition-all ${paymentMethod === 'nagad' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'}`}>
                            <input type="radio" name="payment" value="nagad" checked={paymentMethod === 'nagad'} onChange={() => setPaymentMethod('nagad')} className="hidden" />
                            <img src="https://freelogopng.com/images/all_img/1679248787Nagad-Logo.png" alt="Nagad" className="h-8 w-auto mb-1 object-contain" />
                            <span className={`text-xs font-bold ${isDarkTheme ? 'text-slate-300' : 'text-slate-700'}`}>Nagad</span>
                        </label>
                    </div>
                    
                    {(paymentMethod === 'bkash' || paymentMethod === 'nagad') && (
                        <div className={`animate-in fade-in slide-in-from-top-2 p-4 rounded-xl border ${isDarkTheme ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                            <p className={`text-sm mb-2 ${isDarkTheme ? 'text-slate-300' : 'text-slate-600'}`}>
                                Please send money to <span className={`font-bold ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>{paymentMethod === 'bkash' ? paymentNumbers.bkash : paymentNumbers.nagad}</span>
                            </p>
                            <Input 
                                label="Transaction ID" 
                                placeholder="Enter TrxID" 
                                required 
                                value={transactionId}
                                onChange={(e) => setTransactionId(e.target.value)}
                                className={isDarkTheme ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white'}
                            />
                        </div>
                    )}
                </div>

                {/* Order Summary */}
                <div className={`p-4 rounded-xl space-y-2 border ${isDarkTheme ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                    <div className="flex justify-between text-sm">
                        <span>{t('product_price')}</span>
                        <span>৳{parseFloat(currentPrice) * quantity}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span>{t('delivery_charge')}</span>
                        <span>৳{deliveryAmount}</span>
                    </div>
                    <div className={`flex justify-between text-lg font-bold border-t pt-2 mt-2 ${isDarkTheme ? 'border-slate-600' : 'border-slate-200'}`}>
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
      <div className={`fixed bottom-0 left-0 right-0 p-4 border-t z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] sm:hidden ${isDarkTheme ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
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
