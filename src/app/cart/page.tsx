"use client";

import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { Button, Heading, Text } from "@/components/ui";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/config";
import { useToast } from "@/components/ui/Toast";
import { useLanguage } from "@/lib/language-context";
import { Trash2, Heart, Minus, Plus, Gift, ArrowRight, CheckCircle2, Tag, Truck } from "lucide-react";
import Link from "next/link";
import { getImageUrl, getLocalizedField } from "@/lib/utils";
import { Input } from "@/components/ui/Input";
import { FullScreenLoader } from "@/components/ui/Loader";
import { DISTRICTS, DHAKA_METRO_THANAS, DHAKA_SUBURBS } from "@/lib/bd-locations";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { motion, AnimatePresence } from "framer-motion";

interface DeliveryCharge {
  id: string;
  name: string;
  amount: string | number;
}

interface Coupon {
  code: string;
  type: "percentage" | "fixed";
  value: string | number;
}

interface PaymentNumbers {
  bkash?: string;
  nagad?: string;
}

interface UserAddress {
  id: string;
  type: string;
  address: string;
  city?: string;
  phone?: string;
  is_default?: boolean;
}

const parseAmount = (value: string | number): number =>
  typeof value === "number" ? value : parseFloat(value);

const isLikelyBdPhone = (value: string) => {
  const trimmed = value.replace(/\s+/g, "");
  return /^01[3-9]\d{8}$/.test(trimmed) || /^\+8801[3-9]\d{8}$/.test(trimmed);
};

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice, totalItems, clearCart, addItem } = useCart();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, items: wishlistItems } = useWishlist();
  const [deliveryCharges, setDeliveryCharges] = useState<DeliveryCharge[]>([]);
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string>("");
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(5000);
  const [savedAddresses, setSavedAddresses] = useState<UserAddress[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  
  // Checkout Form State
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [district, setDistrict] = useState("");
  const [thana, setThana] = useState("");
  
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [transactionId, setTransactionId] = useState("");
  const [paymentPhone, setPaymentPhone] = useState(""); // Added payment phone
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [paymentNumbers, setPaymentNumbers] = useState<PaymentNumbers>({});
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState<string[]>(["cod", "bkash", "nagad"]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [saveAddress, setSaveAddress] = useState(false);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  
  // Gift & Points
  const [isGift, setIsGift] = useState(false);
  const [giftMessage, setGiftMessage] = useState("");
  const [userPoints, setUserPoints] = useState(0);
  const [redeemPoints, setRedeemPoints] = useState("");
  const [pointsRedemptionRate, setPointsRedemptionRate] = useState(0.1); // Default 1 point = 0.1 BDT
  const [pointsEarningRate, setPointsEarningRate] = useState(1); // Default 1 point per 100 BDT

  const [isClientMounted, setIsClientMounted] = useState(false); // New state for client-side mount

  const router = useRouter();
  const { addToast } = useToast();
  const { t, language } = useLanguage();

  // Fetch Data
  useEffect(() => {
    setIsClientMounted(true); // Component has mounted on client
    const fetchData = async () => {
      try {
        // Fetch Settings
        const settingsRes = await fetch(`${API_URL}/settings`);
        const settingsData = await settingsRes.json();
        const threshold = settingsData.find((s: any) => s.key === "free_shipping_threshold");
        if (threshold) setFreeShippingThreshold(parseFloat(threshold.value));
        
        const numbers: PaymentNumbers = {};
        settingsData.forEach((s: any) => {
            if (s.key === "bkash_number") numbers.bkash = s.value;
            if (s.key === "nagad_number") numbers.nagad = s.value;
            if (s.key === "payment_methods") {
                // Ensure COD is always first if present
                let methods = s.value.split(',').map((m: string) => m.trim().toLowerCase());
                if (methods.includes('cod')) {
                    methods = ['cod', ...methods.filter((m: string) => m !== 'cod')];
                }
                setAvailablePaymentMethods(methods);
            }
            if (s.key === "points_redemption_rate") setPointsRedemptionRate(parseFloat(s.value));
            if (s.key === "points_earning_rate") setPointsEarningRate(parseFloat(s.value));
        });
        setPaymentNumbers(numbers);

        // Fetch Delivery Charges
        const deliveryRes = await fetch(`${API_URL}/delivery`);
        const deliveryData = await deliveryRes.json();
        setDeliveryCharges(deliveryData);
        
        // Fetch User Address & Points
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const parsedUser = JSON.parse(userStr);
          setUser(parsedUser);
          setCustomerName(parsedUser.name || "");
          setCustomerPhone(parsedUser.phone || "");
          
          // Fetch fresh user data for points
          const userRes = await fetch(`${API_URL}/users/${parsedUser.id}`);
          if (userRes.ok) {
              const userData = await userRes.json();
              setUserPoints(userData.points || 0);
          }
          
          const addressRes = await fetch(`${API_URL}/users/${parsedUser.id}/addresses`);
          const addressData = await addressRes.json();
          if (Array.isArray(addressData) && addressData.length > 0) {
            setSavedAddresses(addressData);
            const defaultAddr = addressData.find((a: any) => a.is_default) || addressData[0];
            setCustomerAddress(defaultAddr.address);
            if (defaultAddr.city) {
                // Try to parse city if it contains comma (e.g. "Thana, District")
                const parts = defaultAddr.city.split(',').map((p: string) => p.trim());
                if (parts.length > 1) {
                    setDistrict(parts[1]);
                    setThana(parts[0]);
                } else {
                    setDistrict(defaultAddr.city);
                }
            }
          } else {
              setIsAddingNewAddress(true);
          }
        } else {
            setIsAddingNewAddress(true);
        }

        // Fetch Recommendations
        const productsRes = await fetch(`${API_URL}/products?limit=5&sort=popularity`);
        const productsData = await productsRes.json();
        setRelatedProducts(productsData.data || []);

      } catch (error) {
        console.error("Error fetching cart data", error);
      }
    };

    fetchData();
  }, []);

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
            // Inside Dhaka
            targetCharge = deliveryCharges.find(d => d.name.toLowerCase().includes("inside dhaka"));
        } else if (DHAKA_SUBURBS.includes(thana)) {
            // Outside Dhaka Metro
            targetCharge = deliveryCharges.find(d => d.name.toLowerCase().includes("outside dhaka metro"));
        } else {
            // Fallback for unknown thana in Dhaka
            targetCharge = deliveryCharges.find(d => d.name.toLowerCase().includes("inside dhaka"));
        }
    } else {
        // Outside Dhaka (General)
        targetCharge = deliveryCharges.find(d => d.name.toLowerCase().includes("outside dhaka") && !d.name.toLowerCase().includes("metro"));
    }

    // Fallback logic if exact match fails
    if (!targetCharge) {
        if (district === "Dhaka") targetCharge = deliveryCharges.find(d => d.name.toLowerCase().includes("dhaka"));
        else targetCharge = deliveryCharges.find(d => d.name.toLowerCase().includes("outside"));
    }

    if (targetCharge) {
        setSelectedDeliveryId(targetCharge.id);
    }
  }, [district, thana, deliveryCharges]);

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    try {
      const res = await fetch(`${API_URL}/coupons/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, amount: totalPrice() }),
      });
      if (res.ok) {
        const coupon: Coupon = await res.json();
        setAppliedCoupon(coupon);
        addToast(t("coupon_applied"), "success");
      } else {
        const err = await res.json();
        addToast(err.message || t("invalid_coupon"), "error");
        setAppliedCoupon(null);
      }
    } catch {
      addToast(t("error_validating_coupon"), "error");
    }
  };

  const handlePlaceOrder = async () => {
    if (items.length === 0) return;
    if (!customerName || !customerPhone || !customerAddress) {
        addToast("Please fill in all shipping details", "error");
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

    // Enforce Bangladeshi phone validation on checkout
    if (!isLikelyBdPhone(customerPhone)) {
        addToast("Please enter a valid Bangladeshi phone number", "error");
        return;
    }

    if (!selectedDeliveryId) {
        addToast(t("select_delivery_area"), "error");
        return;
    }
    
    if (!paymentMethod) {
        addToast("Please select a payment method", "error");
        return;
    }

    if ((paymentMethod === "bkash" || paymentMethod === "nagad")) {
        if (!transactionId) {
            addToast(t("enter_transaction_id"), "error");
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

    const pointsToRedeem = parseInt(redeemPoints) || 0;
    if (pointsToRedeem > userPoints) {
        addToast("Insufficient points", "error");
        return;
    }

    setIsSubmitting(true);
    try {
      // Combine address with district/thana for storage
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
        userId: user?.id,
        deliveryChargeId: selectedDeliveryId,
        couponCode: appliedCoupon ? appliedCoupon.code : undefined,
        paymentMethod,
        transactionId: (paymentMethod === 'bkash' || paymentMethod === 'nagad') ? transactionId : undefined,
        paymentPhone: (paymentMethod === 'bkash' || paymentMethod === 'nagad') ? paymentPhone : undefined, // Added
        isGift,
        giftMessage: isGift ? giftMessage : undefined,
        redeemPoints: pointsToRedeem > 0 ? pointsToRedeem : undefined,
        items: items.map(item => ({
            productId: item.id,
            variantId: item.variantId,
            quantity: item.quantity
        }))
      };

      const res = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (res.ok) {
        const data = await res.json();
        addToast(t("order_placed_successfully"), "success");
        clearCart();
        router.push(`/thank-you?orderId=${data.id}`);
      } else {
        const errorData = await res.json();
        addToast(errorData.message || t("order_place_failed"), "error");
      }
    } catch (error) {
      addToast(t("order_place_error"), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddressSelect = (address: UserAddress) => {
    setCustomerName(user?.name || "");
    setCustomerPhone(user?.phone || "");
    setCustomerAddress(address.address);
    if (address.city) {
        const parts = address.city.split(',').map(p => p.trim());
        if (parts.length > 1) {
            setDistrict(parts[1]);
            setThana(parts[0]);
        } else {
            setDistrict(address.city);
            setThana("");
        }
    }
    setIsAddingNewAddress(false);
  };

  const toggleWishlist = (item: any) => {
      const isWishlisted = wishlistItems.some(i => i.id === item.id);
      if (isWishlisted) {
          removeFromWishlist(item.id);
          addToast("Removed from wishlist");
      } else {
          addToWishlist({
              id: item.id,
              name: item.name,
              price: item.price,
              image: item.image,
              slug: item.slug
          });
          addToast("Added to wishlist");
      }
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

    addItem({
      id: product.id,
      slug: product.slug,
      name: getLocalizedField(product, 'name', language),
      price: parseFloat(product.price),
      image: imageUrl,
      quantity: 1,
      stock: parseInt(product.stock) || 999
    });
    addToast(
      `Added ${getLocalizedField(product, 'name', language)} to cart`,
      "success"
    );
  };

  const selectedDelivery = deliveryCharges.find(d => d.id === selectedDeliveryId);
  const currentTotal = totalPrice();
  const isFreeShipping = currentTotal >= freeShippingThreshold;
  const shippingCost = isFreeShipping ? 0 : (selectedDelivery ? Number(selectedDelivery.amount) : 0);
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - currentTotal);
  const progressPercent = Math.min(100, (currentTotal / freeShippingThreshold) * 100);

  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === "percentage") {
      discountAmount = (totalPrice() * parseAmount(appliedCoupon.value)) / 100;
    } else {
      discountAmount = parseAmount(appliedCoupon.value);
    }
  }
  
  const pointsDiscount = (parseInt(redeemPoints) || 0) * pointsRedemptionRate;
  const totalDiscount = discountAmount + pointsDiscount;
  
  const grandTotal = Math.max(0, currentTotal + shippingCost - totalDiscount);
  const earnedPoints = Math.floor((grandTotal / 100) * pointsEarningRate);

  if (!isClientMounted || (isClientMounted && items.length === 0 && totalItems() > 0)) {
    // Show loader if not mounted yet, or if items are empty but totalItems (from zustand) is not 0 (still loading from persist)
    return <FullScreenLoader />;
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#f1f2f4] dark:bg-slate-950 px-4">
        <div className="w-32 h-32 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-sm">
            <img src="/static/empty-cart.svg" alt="Empty Cart" className="w-16 h-16 opacity-50" onError={(e) => e.currentTarget.src = "https://cdn-icons-png.flaticon.com/512/2038/2038854.png"} />
        </div>
        <Heading className="mb-2 text-slate-800 dark:text-white text-xl font-bold">{t("your_cart_empty")}</Heading>
        <Text className="text-slate-500 mb-8 text-center max-w-md text-sm">Looks like you haven't added anything to your cart yet.</Text>
        <Button onClick={() => router.push("/products")} className="rounded-md px-8 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-medium shadow-sm">{t("start_shopping")}</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1f2f4] dark:bg-slate-950 py-6 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Cart Header / Select All */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-sm shadow-sm border border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <input type="checkbox" checked readOnly className="w-4 h-4 text-sky-600 rounded border-gray-300 focus:ring-sky-500" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Select All ({items.length} Items)
                    </span>
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                    Total: <span className="font-bold text-slate-900 dark:text-white">৳{currentTotal}</span>
                </div>
            </div>

            {/* Free Shipping Progress */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-sm shadow-sm border border-slate-200 dark:border-slate-800">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        {isFreeShipping ? t('free_shipping_unlocked') : t('add_more_free_shipping', { amount: amountToFreeShipping.toString() })}
                    </span>
                    <span className="text-xs font-bold text-sky-500">{Math.round(progressPercent)}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div 
                        className={`h-full rounded-full transition-all duration-500 ${isFreeShipping ? 'bg-emerald-500' : 'bg-sky-500'}`} 
                        style={{ width: `${progressPercent}%` }}
                    ></div>
                </div>
            </div>

            {/* Cart Items List */}
            <div className="bg-white dark:bg-slate-900 rounded-sm shadow-sm border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
                {items.map((item) => {
                    const qty = Number(item.quantity) || 1;
                    const stock = item.stock !== undefined ? Number(item.stock) : 999;
                    const isWishlisted = wishlistItems.some(i => i.id === item.id);

                    return (
                        <div key={`${item.id}-${item.variantId}`} className="p-4 flex gap-4 items-start group">
                            <div className="pt-1">
                                <input type="checkbox" checked readOnly className="w-4 h-4 text-sky-600 rounded border-gray-300 focus:ring-sky-500" />
                            </div>
                            
                            {/* Image */}
                            <div className="w-20 h-28 shrink-0 border border-slate-100 dark:border-slate-700 rounded-sm overflow-hidden bg-slate-50">
                                <img src={getImageUrl(item.image)} alt={item.name} className="w-full h-full object-cover" />
                            </div>

                            {/* Details */}
                            <div className="flex-1 min-w-0">
                                <Link href={`/products/${item.slug || item.id}`} className="text-sm font-medium text-slate-800 dark:text-white hover:text-sky-600 line-clamp-2 mb-1">
                                    {item.name}
                                </Link>

                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    {/* Actions */}
                                    <div className="flex items-center gap-4">
                                        <button 
                                            onClick={() => removeItem(item.id, item.variantId)}
                                            className="text-slate-400 hover:text-red-500 transition-colors" 
                                            title="Remove"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                        <button 
                                            onClick={() => toggleWishlist(item)}
                                            className={`transition-colors ${isWishlisted ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'}`} 
                                            title="Wishlist"
                                        >
                                            <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} />
                                        </button>
                                    </div>

                                    {/* Quantity */}
                                    <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-sm">
                                        <button 
                                            onClick={() => updateQuantity(item.id, Math.max(1, qty - 1), item.variantId)}
                                            className="w-8 h-8 flex items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                                        >
                                            <Minus size={14} />
                                        </button>
                                        <input 
                                            type="text" 
                                            value={qty} 
                                            readOnly 
                                            className="w-10 h-8 text-center text-sm font-medium text-slate-900 dark:text-white border-x border-slate-200 dark:border-slate-700 bg-transparent"
                                        />
                                        <button 
                                            onClick={() => {
                                                if (qty < stock) updateQuantity(item.id, qty + 1, item.variantId);
                                                else addToast(t("only_x_items_available", { stock: String(stock) }), "error");
                                            }}
                                            className={`w-8 h-8 flex items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 ${qty >= stock ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>

                                    {/* Price */}
                                    <div className="text-right">
                                        <p className="text-base font-bold text-slate-900 dark:text-white">৳{item.price}</p>
                                        {/* Mock original price for demo */}
                                        <p className="text-xs text-slate-400 line-through">৳{Math.round(Number(item.price) * 1.2)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Shipping & Billing Form */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-sm shadow-sm border border-slate-200 dark:border-slate-800">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <h4 className="font-bold text-slate-800 dark:text-white text-base">Shipping Details</h4>
                    {user && savedAddresses.length > 0 && (
                        <button 
                            onClick={() => setIsAddingNewAddress(!isAddingNewAddress)}
                            className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
                        >
                            {isAddingNewAddress ? "Select Saved Address" : "+ Add New Address"}
                        </button>
                    )}
                </div>
                
                {/* Saved Addresses Selection */}
                {user && savedAddresses.length > 0 && !isAddingNewAddress && (
                    <div className="mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="space-y-3">
                            {savedAddresses.map(addr => (
                                <button
                                    key={addr.id}
                                    type="button"
                                    onClick={() => handleAddressSelect(addr)}
                                    className={`w-full text-left p-4 rounded-lg border transition-all duration-200 group relative overflow-hidden ${
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
                                            <span className="text-sky-500 text-xs font-bold flex items-center gap-1">
                                                <CheckCircle2 size={14} /> Selected
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-xs text-slate-500 truncate mt-1 pl-8">{addr.address}</div>
                                    {addr.city && <div className="text-xs text-slate-400 truncate mt-0.5 pl-8">{addr.city}</div>}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Address Form */}
                {(isAddingNewAddress || !user || savedAddresses.length === 0) && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <Input 
                                label={t('full_name')} 
                                value={customerName} 
                                onChange={(e) => setCustomerName(e.target.value)} 
                                required 
                                className="bg-slate-50/50"
                            />
                            <Input 
                                label={t('phone_number')} 
                                value={customerPhone} 
                                onChange={(e) => setCustomerPhone(e.target.value)} 
                                placeholder="017..." 
                                required 
                                className="bg-slate-50/50"
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div className="w-full">
                                <SearchableSelect 
                                    label="District"
                                    placeholder="Select District"
                                    options={DISTRICTS}
                                    value={district}
                                    onChange={(val) => {
                                        setDistrict(val);
                                        setThana(""); // Reset thana when district changes
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

                        <div className="w-full mb-4">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t('address')}</label>
                            <textarea 
                                className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-slate-500 resize-none text-sm"
                                value={customerAddress} 
                                onChange={(e) => setCustomerAddress(e.target.value)} 
                                required 
                                rows={2}
                                placeholder="House, Road, Area"
                            />
                        </div>
                        
                        {user && (
                            <label className="flex items-center gap-2 cursor-pointer group mb-4">
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
                    </div>
                )}

                <div className="mb-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between p-4 bg-sky-50 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-800 rounded-lg">
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

                <h4 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider mt-6 mb-3">{t('payment_method')}</h4>
                <div className="grid grid-cols-3 gap-3">
                    {availablePaymentMethods.map(method => {
                        const methodKey = method.toLowerCase();
                        const isSelected = paymentMethod === methodKey;
                        
                        return (
                            <motion.label 
                                key={methodKey} 
                                className={`flex flex-col items-center justify-center p-3 rounded-lg border cursor-pointer transition-all relative overflow-hidden ${isSelected ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/20 shadow-md' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'}`}
                                whileTap={{ scale: 0.98 }}
                                animate={{ 
                                    borderColor: isSelected ? '#0ea5e9' : 'rgba(226, 232, 240, 1)',
                                    backgroundColor: isSelected ? 'rgba(14, 165, 233, 0.1)' : 'transparent'
                                }}
                            >
                                <input type="radio" name="payment" value={methodKey} checked={isSelected} onChange={() => setPaymentMethod(methodKey)} className="hidden" />
                                
                                {isSelected && (
                                    <motion.div 
                                        layoutId="check"
                                        className="absolute top-2 right-2 text-sky-500"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                    >
                                        <CheckCircle2 size={16} fill="currentColor" className="text-white" />
                                    </motion.div>
                                )}

                                {methodKey === 'bkash' ? (
                                    <img src="https://freelogopng.com/images/all_img/1656234745bkash-app-logo-png.png" alt="Bkash" className="h-8 w-auto mb-2 object-contain" />
                                ) : methodKey === 'nagad' ? (
                                    <img src="https://freelogopng.com/images/all_img/1679248787Nagad-Logo.png" alt="Nagad" className="h-8 w-auto mb-2 object-contain" />
                                ) : methodKey === 'visa' ? (
                                    <span className="text-xl mb-1 font-bold text-blue-700">VISA</span>
                                ) : methodKey === 'mastercard' ? (
                                    <span className="text-xl mb-1 font-bold text-red-600">MC</span>
                                ) : (
                                    <span className="text-2xl mb-2">💵</span>
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
                            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 mt-4">
                                <div className="mb-4 text-sm text-slate-600 dark:text-slate-300">
                                    <p className="mb-2 font-bold text-slate-900 dark:text-white">How to pay with {paymentMethod === 'bkash' ? 'bKash' : 'Nagad'}:</p>
                                    <ol className="list-decimal list-inside space-y-1 text-xs">
                                        <li>Go to your {paymentMethod === 'bkash' ? 'bKash' : 'Nagad'} App or dial <span className="font-bold text-sky-600">{paymentMethod === 'bkash' ? '*247#' : '*167#'}</span></li>
                                        <li>Choose "Send Money"</li>
                                        <li>Enter Number: <span className="font-bold text-slate-900 dark:text-white select-all bg-yellow-100 dark:bg-yellow-900/30 px-1 rounded">{paymentMethod === 'bkash' ? paymentNumbers.bkash : paymentNumbers.nagad}</span></li>
                                        <li>Enter Amount: <span className="font-bold text-slate-900 dark:text-white">৳{grandTotal}</span></li>
                                        <li>Enter Reference: <span className="font-bold text-slate-900 dark:text-white">1</span></li>
                                        <li>Enter your PIN to confirm</li>
                                    </ol>
                                </div>
                                
                                <div className="grid gap-4">
                                    <Input 
                                        label="Your Phone Number (Sender)" 
                                        value={paymentPhone} 
                                        onChange={(e) => setPaymentPhone(e.target.value)} 
                                        placeholder="017..." 
                                        required 
                                        className="bg-white"
                                    />
                                    <Input 
                                        label="Transaction ID" 
                                        value={transactionId} 
                                        onChange={(e) => setTransactionId(e.target.value)} 
                                        placeholder="e.g. 8X92..." 
                                        required 
                                        className="bg-white"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

          </div>

          {/* RIGHT COLUMN - SUMMARY */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-4">
                
                {/* Checkout Summary Card */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-sm shadow-sm border border-slate-200 dark:border-slate-800">
                    <h4 className="font-bold text-slate-800 dark:text-white text-base mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">Checkout Summary</h4>
                    
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between text-slate-600 dark:text-slate-400">
                            <span>Subtotal</span>
                            <span className="font-medium text-slate-900 dark:text-white">৳{currentTotal}</span>
                        </div>
                        <div className="flex justify-between text-slate-600 dark:text-slate-400">
                            <span>Discount</span>
                            <span className="text-red-500">-৳{discountAmount}</span>
                        </div>
                        {pointsDiscount > 0 && (
                            <div className="flex justify-between text-purple-600 font-medium">
                                <span>Points Redeemed</span>
                                <span>-৳{pointsDiscount}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-slate-600 dark:text-slate-400 items-center">
                            <span>Delivery & Service</span>
                            <span className="font-medium text-slate-900 dark:text-white">
                                {isFreeShipping ? <span className="text-emerald-600 font-bold">FREE</span> : `৳${shippingCost}`}
                            </span>
                        </div>
                        
                        <div className="border-t border-slate-100 dark:border-slate-800 pt-3 mt-2">
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-slate-900 dark:text-white">Total</span>
                                <span className="font-bold text-lg text-slate-900 dark:text-white">৳{grandTotal}</span>
                            </div>
                            <div className="flex justify-between items-center mt-2">
                                <span className="font-bold text-slate-900 dark:text-white">Payable Total</span>
                                <span className="font-bold text-lg text-slate-900 dark:text-white">৳{grandTotal}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Coupon Input */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-sm shadow-sm border border-slate-200 dark:border-slate-800">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">{t('coupon_code')}</label>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <input 
                            className="flex-1 px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white text-sm w-full"
                            placeholder="Enter code"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                        />
                        <Button 
                            variant="secondary" 
                            onClick={handleApplyCoupon} 
                            className="rounded-lg text-sm font-bold px-6 py-2.5 h-auto w-full sm:w-auto bg-slate-800 text-white hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600"
                        >
                            {t('apply')}
                        </Button>
                    </div>
                    {appliedCoupon && (
                        <div className="flex items-center gap-2 text-sm text-green-600 mt-3 bg-green-50 dark:bg-green-900/20 p-2 rounded border border-green-100 dark:border-green-900">
                            <Tag size={16} />
                            <span className="font-medium">Coupon "{appliedCoupon.code}" applied!</span>
                        </div>
                    )}
                </div>

                {/* Earn Points Card */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-sm shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-2xl">
                            🪙
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">You will earn</p>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{earnedPoints} Points</p>
                        </div>
                    </div>
                    <img src="/static/earn-points.svg" alt="" className="w-6 h-6 opacity-50" onError={(e) => e.currentTarget.style.display = 'none'} />
                </div>

                {/* Points Redemption */}
                {user && userPoints > 0 && (
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-sm shadow-sm border border-slate-200 dark:border-slate-800">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Redeem Points</span>
                            <span className="text-xs text-slate-500">Balance: {userPoints}</span>
                        </div>
                        <div className="flex gap-2">
                            <input 
                                type="number"
                                className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none"
                                placeholder="Points to use"
                                value={redeemPoints}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    if (!isNaN(val) && val <= userPoints) {
                                        setRedeemPoints(e.target.value);
                                    } else if (e.target.value === '') {
                                        setRedeemPoints('');
                                    }
                                }}
                            />
                        </div>
                        {pointsDiscount > 0 && (
                            <p className="text-xs text-green-600 mt-1">
                                Saving ৳{pointsDiscount}
                            </p>
                        )}
                    </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3">
                    <Button 
                        fullWidth 
                        onClick={handlePlaceOrder}
                        disabled={isSubmitting}
                        className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 rounded-md shadow-md shadow-sky-200 dark:shadow-none flex items-center justify-center gap-2"
                    >
                        <span>{isSubmitting ? t('loading') : t('place_order')}</span>
                        <ArrowRight size={18} />
                    </Button>
                    
                    <Button 
                        fullWidth 
                        variant="outline"
                        onClick={() => setIsGift(!isGift)}
                        className={`border-sky-200 text-sky-600 hover:bg-sky-50 dark:border-slate-700 dark:text-sky-400 dark:hover:bg-slate-800 font-bold py-3 rounded-md flex items-center justify-center gap-2 ${isGift ? 'bg-sky-50 border-sky-500' : ''}`}
                    >
                        <Gift size={18} />
                        <span>{isGift ? "Gift Order Active" : "Order as Gift"}</span>
                    </Button>
                    
                    {isGift && (
                        <div className="animate-in fade-in slide-in-from-top-2">
                            <textarea 
                                className="w-full px-3 py-2 rounded-lg border border-sky-200 bg-sky-50/30 text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all text-sm"
                                rows={2}
                                placeholder="Add a gift message..."
                                value={giftMessage}
                                onChange={(e) => setGiftMessage(e.target.value)}
                            />
                        </div>
                    )}
                </div>

                <p className="text-xs text-center text-slate-400">
                    {t('secure_checkout')}
                </p>

            </div>
          </div>

        </div>

        {/* RELATED PRODUCTS / RECOMMENDATIONS */}
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-6">
                <div className="w-1 h-6 bg-sky-500 rounded-full"></div>
                <Heading size="lg" className="font-sans text-slate-800 dark:text-white text-lg font-bold">
                    You might also like to add
                </Heading>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {relatedProducts.map((product) => {
                    let imageUrl = "https://picsum.photos/seed/product-item/700/700";
                    if (Array.isArray(product.images) && product.images.length > 0) {
                        imageUrl = getImageUrl(product.images[0]);
                    } else if (typeof product.images === 'string') {
                        try {
                            const parsed = JSON.parse(product.images);
                            if (Array.isArray(parsed) && parsed.length > 0) imageUrl = getImageUrl(parsed[0]);
                            else imageUrl = getImageUrl(product.images);
                        } catch {
                            imageUrl = getImageUrl(product.images);
                        }
                    }

                    return (
                      <div key={product.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-md p-3 hover:shadow-md transition-shadow group">
                        <Link href={`/products/${product.slug || product.id}`}>
                          <div className="aspect-[2/3] bg-slate-50 dark:bg-slate-800 rounded-sm overflow-hidden mb-3 relative">
                            <img
                              src={imageUrl}
                              alt={getLocalizedField(product, 'name', language)}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                          <h4 className="text-xs font-bold text-slate-800 dark:text-white line-clamp-2 mb-1 h-8">
                              {getLocalizedField(product, 'name', language)}
                          </h4>
                        </Link>
                        {product.author && (
                            <p className="text-xs text-slate-500 mb-2 truncate">
                                {product.author}
                            </p>
                        )}
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-bold text-sky-600">৳{product.price}</span>
                            <span className="text-xs text-slate-400 line-through">৳{Math.round(product.price * 1.2)}</span>
                        </div>
                        <button 
                            onClick={() => handleAddToCart(product)}
                            className="w-full bg-white border border-slate-200 text-slate-900 text-xs font-bold py-1.5 rounded shadow-sm hover:bg-sky-50 hover:text-sky-600 hover:border-sky-200 transition-all"
                        >
                            Add to Cart
                        </button>
                      </div>
                    );
                })}
            </div>
        </div>

      </div>
    </div>
  );
}
