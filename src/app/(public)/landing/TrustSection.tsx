"use client";

import { Section } from "@/components/ui";
import { useLanguage } from "@/lib/language-context";
import { useSettings } from "@/lib/settings-context";
import { motion } from "framer-motion";
import { Shield, Truck, RefreshCcw, Headphones } from "lucide-react";

interface TrustItem {
  id: string;
  icon: React.ReactNode;
  title: string;
  title_bn: string;
  description: string;
  description_bn: string;
  showOnMobile: boolean;
}

const trustItems: TrustItem[] = [
  {
    id: "authentic",
    icon: <Shield className="w-3.5 h-3.5 sm:w-8 sm:h-8 text-sky-500" />,
    title: "100% Authentic",
    title_bn: "১০০% অথেনটিক",
    description: "Guaranteed genuine products",
    description_bn: "নিশ্চিত আসল পণ্য",
    showOnMobile: true
  },
  {
    id: "delivery",
    icon: <Truck className="w-3.5 h-3.5 sm:w-8 sm:h-8 text-sky-500" />,
    title: "Fast Delivery",
    title_bn: "দ্রুত ডেলিভারি",
    description: "All over Bangladesh",
    description_bn: "সারা বাংলাদেশে",
    showOnMobile: true
  },
  {
    id: "returns",
    icon: <RefreshCcw className="w-3.5 h-3.5 sm:w-8 sm:h-8 text-sky-500" />,
    title: "Easy Returns",
    title_bn: "সহজ রিটার্ন",
    description: "Hassle-free returns",
    description_bn: "ঝামেলা-মুক্ত রিটার্ন",
    showOnMobile: false
  },
  {
    id: "support",
    icon: <Headphones className="w-3.5 h-3.5 sm:w-8 sm:h-8 text-sky-500" />,
    title: "24/7 Support",
    title_bn: "২৪/৭ সাপোর্ট",
    description: "Always here for you",
    description_bn: "সর্বদা আপনার পাশে",
    showOnMobile: false
  }
];

export function TrustSection() {
  const { language, t } = useLanguage();
  const settings = useSettings();

  return (
    <Section className="lg:hidden py-6 sm:py-12 bg-brand-secondary dark:bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 sm:py-4">
        {/* Mobile: Only show 2 items - inline compact style */}
        {/*<div className="flex gap-2 lg:hidden">*/}
        {/*  {trustItems.filter(item => item.showOnMobile).map((item, index) => (*/}
        {/*    <motion.div*/}
        {/*      key={item.id}*/}
        {/*      initial={{ opacity: 0, y: 10 }}*/}
        {/*      animate={{ opacity: 1, y: 0 }}*/}
        {/*      transition={{ delay: index * 0.05, duration: 0.2 }}*/}
        {/*      className="flex-1 bg-white dark:bg-slate-800 px-2 py-1.5 rounded-lg flex items-center gap-1.5"*/}
        {/*    >*/}
        {/*      /!* Icon *!/*/}
        {/*      <div className="w-10 h-10 bg-sky-50 dark:bg-slate-700 rounded flex items-center justify-center">*/}
        {/*        {item.icon}*/}
        {/*      </div>*/}

        {/*      /!* Text *!/*/}
        {/*      <div className="text-left min-w-0">*/}
        {/*        <h3 className="font-bold text-[13px] text-slate-900 dark:text-white leading-tight truncate">*/}
        {/*          {language === "bn" ? item.title_bn : item.title}*/}
        {/*        </h3>*/}
        {/*        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">*/}
        {/*          {language === "bn" ? item.description_bn : item.description}*/}
        {/*        </p>*/}
        {/*      </div>*/}
        {/*    </motion.div>*/}
        {/*  ))}*/}
        {/*</div>*/}

        <div className="lg:hidden mb-2 mt-2">
          <div className="
    relative overflow-hidden
    rounded-xl p-4 text-center shadow-xl
    bg-size-[200%_200%]
    bg-linear-to-r from-sky-400 via-blue-500 to-sky-400
    animate-[aliveGradient_3s_ease_infinite]
  ">

            {/* Moving light sweep */}
            <div className="
      absolute inset-0
      bg-linear-to-r from-transparent via-white/25 to-transparent
      -translate-x-full
      animate-[superShine_2s_infinite]
    "/>

            {/* Glowing border */}
            <div className="
      absolute inset-0 rounded-xl
      animate-[pulseGlow_2.5s_ease-in-out_infinite]
      pointer-events-none
    "/>

            {/* Floating particles */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-2 left-6 w-1 h-1 bg-white rounded-full animate-ping"/>
              <div className="absolute bottom-3 right-8 w-1 h-1 bg-white rounded-full animate-ping delay-300"/>
              <div className="absolute top-4 right-4 w-1 h-1 bg-white rounded-full animate-ping delay-700"/>
            </div>

            <div className="relative z-10 animate-[breath_3s_ease_infinite]">
              <div className="flex items-center justify-center gap-2 mb-1">

                <svg
                    className="animate-[float_2s_ease-in-out_infinite]"
                    xmlns="http://www.w3.org/2000/svg"
                    width="22" height="22"
                    viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2"
                >
                  <path d="M5 18H3c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v11"/>
                  <path d="M14 9h4l4 4v4c0 .6-.4 1-1 1h-2"/>
                  <circle cx="7" cy="18" r="2"/>
                  <circle cx="17" cy="18" r="2"/>
                </svg>

                <span className="font-bold text-sm tracking-wide drop-shadow-md">
          {language === "bn" ? "বিনামূল্যে শিপিং" : "FREE SHIPPING"}
        </span>
              </div>

              <p className="text-xs text-sky-50 font-medium">
                {language === "bn"
                  ? `৳${settings.free_shipping_threshold || 5000} এর বেশি অর্ডারে • সারা বাংলাদেশে`
                  : `On orders over ৳${settings.free_shipping_threshold || 5000} • Whole Bangladesh`
                }
              </p>
            </div>
          </div>
        </div>

        {/* Desktop: Show all 4 items */}
        <div className="hidden lg:grid lg:grid-cols-4 gap-6">
          {trustItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              className="bg-white dark:bg-slate-800 p-6 rounded-2xl text-center hover:shadow-lg transition-all duration-300 group"
            >
              {/* Icon */}
              <div className="w-16 h-16 bg-sky-50 dark:bg-slate-700 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                {item.icon}
              </div>

              {/* Title */}
              <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1">
                {language === "bn" ? item.title_bn : item.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {language === "bn" ? item.description_bn : item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}

