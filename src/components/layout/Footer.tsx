"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useLanguage } from "@/lib/language-context";
import { useSettings } from "@/lib/settings-context";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, MapPin, Phone, Mail } from "lucide-react";

interface AccordionSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function AccordionSection({ title, children, defaultOpen = false }: AccordionSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-slate-100 dark:border-slate-800 md:border-0">
      {/* Desktop: Always visible */}
      <div className="hidden md:block">
        <h4 className="font-bold text-slate-900 dark:text-white mb-6">{title}</h4>
        {children}
      </div>

      {/* Mobile: Accordion */}
      <div className="md:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full py-4 text-left"
        >
          <span className="font-bold text-slate-900 dark:text-white">{title}</span>
          <ChevronDown
            size={18}
            className={`text-slate-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
          />
        </button>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pb-4">{children}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function Footer() {
  const { t, language } = useLanguage();
  const settings = useSettings();

  const paymentMethods = settings.payment_methods 
    ? settings.payment_methods.split(',').map(m => m.trim()).filter(Boolean)
    : ["bKash", "Nagad", "Visa", "Mastercard", "COD"];

  return (
    <footer className="bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 pt-12 pb-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Free Shipping Banner - Mobile Only */}
        <div className="md:hidden mb-6 -mt-6">
          <div className="bg-gradient-to-r from-rose-400 to-rose-400 text-white rounded-xl p-4 text-center shadow-lg">
            <div className="flex items-center justify-center gap-2 mb-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 18H3c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v11"/>
                <path d="M14 9h4l4 4v4c0 .6-.4 1-1 1h-2"/>
                <circle cx="7" cy="18" r="2"/>
                <circle cx="17" cy="18" r="2"/>
              </svg>
              <span className="font-bold text-sm">
                {language === "bn" ? "বিনামূল্যে শিপিং" : "FREE SHIPPING"}
              </span>
            </div>
            <p className="text-xs text-rose-100">
              {language === "bn"
                ? `৳${settings.free_shipping_threshold || 5000} এর বেশি অর্ডারে • সারা বাংলাদেশে`
                : `On orders over ৳${settings.free_shipping_threshold || 5000} • Whole Bangladesh`
              }
            </p>
          </div>
        </div>

        {/* Social Icons - Always visible on mobile */}
        <div className="flex items-center justify-center gap-4 mb-8 md:hidden">
          <a
            href={settings.facebook_link}
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm touch-target"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.333-4.669 1.212 0 2.493.216 2.493.216v2.733h-1.406c-1.492 0-1.956.926-1.956 1.874v2.25h3.072l-.487 3.47h-2.585v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          </a>
          <a
            href={`https://wa.me/${settings.whatsapp_number}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 rounded-full bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center hover:bg-green-600 hover:text-white transition-all shadow-sm touch-target"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.506-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.536 0 1.52 1.115 2.989 1.264 3.187.149.198 2.19 3.348 5.302 4.695.74.326 1.317.521 1.767.664.75.239 1.433.204 1.975.124.603-.088 1.758-.718 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-0 md:gap-12 mb-8 md:mb-12">
          {/* Brand Section */}
          <div className="space-y-4 text-center md:text-left mb-8 md:mb-0">
            <Link href="/" className="inline-flex items-center gap-2 justify-center md:justify-start">
              <Image
                src="/logo2.png"
                alt={settings.shop_name}
                width={140}
                height={48}
                className="h-10 w-auto object-contain"
              />
              <div className="flex flex-col leading-none text-left">
                <span className="font-bold text-lg text-rose-400 dark:text-rose-300">Replant Glow</span>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">রিপ্ল্যান্ট গ্লো</span>
              </div>
            </Link>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed hidden md:block">
              {t("footer_desc")}
            </p>

            {/* Social Icons - Desktop Only */}
            <div className="hidden md:flex gap-3 pt-2">
              <a href={settings.facebook_link} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.333-4.669 1.212 0 2.493.216 2.493.216v2.733h-1.406c-1.492 0-1.956.926-1.956 1.874v2.25h3.072l-.487 3.47h-2.585v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href={`https://wa.me/${settings.whatsapp_number}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-600 hover:text-white transition-all shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.506-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.536 0 1.52 1.115 2.989 1.264 3.187.149.198 2.19 3.348 5.302 4.695.74.326 1.317.521 1.767.664.75.239 1.433.204 1.975.124.603-.088 1.758-.718 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
              </a>
            </div>
          </div>

          {/* Shop Links */}
          <AccordionSection title={t("shop")}>
            <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
              <li>
                <Link href="/products" className="hover:text-rose-400 transition-colors block py-1">
                  {t("shop_all_products")}
                </Link>
              </li>
              <li>
                <Link href="/products?sort=new" className="hover:text-rose-400 transition-colors block py-1">
                  {t("new_arrivals")}
                </Link>
              </li>
              <li>
                <Link href="/products?sort=best_selling" className="hover:text-rose-400 transition-colors block py-1">
                  {t("best_sellers")}
                </Link>
              </li>
              <li>
                <Link href="/bundles" className="hover:text-rose-400 transition-colors block py-1">
                  {t("bundles_sets")}
                </Link>
              </li>
            </ul>
          </AccordionSection>

          {/* Support Links */}
          <AccordionSection title={t("support")}>
            <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
              <li>
                <Link href="/about" className="hover:text-rose-400 transition-colors block py-1">
                  {t("about")}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-rose-400 transition-colors block py-1">
                  {t("contact")}
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-rose-400 transition-colors block py-1">
                  {t("faqs")}
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-rose-400 transition-colors block py-1">
                  {t("shipping_policy")}
                </Link>
              </li>
            </ul>
          </AccordionSection>

          {/* Contact Info */}
          <AccordionSection title={t("contact")} defaultOpen={true}>
            <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
              <li className="flex gap-3 items-start">
                <MapPin size={16} className="flex-shrink-0 mt-0.5 text-rose-400" />
                <span>{settings.shop_address}</span>
              </li>
              <li>
                <a
                  href={`tel:${settings.shop_phone}`}
                  className="flex gap-3 items-center hover:text-rose-400 transition-colors"
                >
                  <Phone size={16} className="flex-shrink-0 text-rose-400" />
                  <span>{settings.shop_phone}</span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${settings.support_email}`}
                  className="flex gap-3 items-center hover:text-rose-400 transition-colors"
                >
                  <Mail size={16} className="flex-shrink-0 text-rose-400" />
                  <span>{settings.support_email}</span>
                </a>
              </li>
            </ul>
          </AccordionSection>
        </div>

        {/* Payment Methods */}
        <div className="border-t border-slate-100 dark:border-slate-800 pt-6 mb-6">
          <p className="text-xs text-slate-400 text-center mb-3">
            {language === "bn" ? "পেমেন্ট পদ্ধতি" : "Payment Methods"}
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            {paymentMethods.map((method) => (
              <div key={method} className="h-8 px-3 bg-slate-100 dark:bg-slate-800 rounded-md flex items-center text-xs font-medium text-slate-600 dark:text-slate-400">
                {method}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-100 dark:border-slate-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400">
          <p className="text-center md:text-left">
            &copy; {new Date().getFullYear()} {settings.shop_name}. {t("rights_reserved")}
          </p>
          <div className="flex gap-4 md:gap-6">
            <Link href="/privacy" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
              {t("privacy_policy")}
            </Link>
            <Link href="/terms" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
              {t("terms_of_service")}
            </Link>
          </div>
          <p className="hidden md:block">
            {t("developed_by")}{" "}
            <a
              href="https://intovah.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-rose-400 hover:underline"
            >
              Intovah
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
