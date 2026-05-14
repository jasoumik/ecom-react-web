"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Shield, Truck, Baby, Heart } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  const { language } = useLanguage();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");
      
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user && user.id) {
            // User is logged in, redirect to home or dashboard
            if (user.role === 'admin') {
              router.replace("/admin");
            } else {
              router.replace("/");
            }
            return;
          }
        } catch (e) {
          // Invalid user data, continue to render auth page
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return null; // Or a loading spinner
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white dark:bg-slate-950">
      {/* Left Side - Branding (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-sky-500 via-sky-600 to-sky-700 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute bottom-20 right-20 w-80 h-80 rounded-full bg-white/20 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-center px-16 xl:px-24">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 mb-12">
            <Image
              src="/logo2.png"
              alt="Prithibee"
              width={56}
              height={56}
              className="h-14 w-auto"
            />
            <div>
              <span className="text-3xl font-bold text-white">Prithibee</span>
              <p className="text-sky-200 text-sm">পৃথিবী</p>
            </div>
          </Link>

          {/* Welcome Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6">
              {language === "bn"
                ? "মা ও শিশুর জন্য সেরা পণ্য"
                : "Everything for Mother & Baby"}
            </h1>
            <p className="text-sky-100 text-lg mb-10 leading-relaxed">
              {language === "bn"
                ? "বাংলাদেশের সবচেয়ে বিশ্বস্ত শপ থেকে কেনাকাটা করুন।"
                : "Shop from Bangladesh's most trusted store. Quality products, fast delivery, and exceptional care."}
            </p>
          </motion.div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col gap-4"
          >
            <div className="flex items-center gap-4 text-white">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold">100% Authentic Products</p>
                <p className="text-sm text-sky-200">Genuine brands guaranteed</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-white">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold">Fast Delivery</p>
                <p className="text-sm text-sky-200">All over Bangladesh</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-white">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Heart className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold">Care & Support</p>
                <p className="text-sm text-sky-200">Always here for you</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16 xl:px-24">
        {/* Mobile Logo */}
        <div className="lg:hidden flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo2.png"
              alt="Prithibee"
              width={48}
              height={48}
              className="h-12 w-auto"
            />
            <div>
              <span className="text-2xl font-bold text-sky-600">Prithibee</span>
              <p className="text-slate-500 text-xs">পৃথিবী</p>
            </div>
          </Link>
        </div>

        <div className="w-full max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
              {title}
            </h2>
            <p className="text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          </motion.div>

          {children}

          {/* Mobile Trust Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="lg:hidden mt-10 pt-8 border-t border-slate-100 dark:border-slate-800"
          >
            <div className="flex justify-center gap-6 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <Shield size={14} className="text-sky-500" />
                <span>100% Authentic</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Truck size={14} className="text-sky-500" />
                <span>Fast Delivery</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
