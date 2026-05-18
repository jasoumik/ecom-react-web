"use client";

import { useState } from "react";
import { Section, Heading, Button } from "@/components/ui";
import { useLanguage } from "@/lib/language-context";
import { useToast } from "@/components/ui/Toast";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, CheckCircle, Loader2 } from "lucide-react";
import { API_URL } from "@/lib/config";

export function NewsletterSection() {
  const { t, language } = useLanguage();
  const { addToast } = useToast();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError(language === "bn" ? "ইমেইল প্রয়োজন" : "Email is required");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(language === "bn" ? "সঠিক ইমেইল দিন" : "Please enter a valid email");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/newsletter/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      if (!res.ok) throw new Error("Subscription failed");

      setIsSuccess(true);
      setEmail("");
      addToast(language === "bn" ? "সফলভাবে সাবস্ক্রাইব হয়েছে!" : "Successfully subscribed!");

      // Reset success state after 5 seconds
      setTimeout(() => setIsSuccess(false), 5000);
    } catch {
      setError(language === "bn" ? "সাবস্ক্রিপশন ব্যর্থ হয়েছে" : "Subscription failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Section className="py-8 sm:py-12 md:py-16 bg-linear-to-br from-rose-400 to-rose-300 relative overflow-hidden">
      {/* Background Pattern */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />

      <div className="max-w-2xl mx-auto text-center relative z-10 px-4">
        {/* Icon - smaller on mobile */}
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-6">
          <Mail className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
        </div>

        {/* Heading */}
        <Heading size="lg" className="font-sans font-bold text-white mb-2 sm:mb-3 text-lg sm:text-xl md:text-2xl">
          {language === "bn"
            ? "আমাদের নিউজলেটার সাবস্ক্রাইব করুন"
            : "Subscribe to Our Newsletter"}
        </Heading>

        <p className="text-rose-100 text-xs sm:text-sm md:text-base mb-4 sm:mb-8 max-w-md mx-auto">
          {language === "bn"
            ? "নতুন পণ্য, অফার এবং বিশেষ ছাড়ের খবর পেতে সাবস্ক্রাইব করুন।"
            : "Get updates on new products, exclusive offers, and special discounts."}
        </p>

        {/* Form */}
        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center justify-center gap-3 bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4"
            >
              <CheckCircle className="w-6 h-6 text-green-300" />
              <span className="text-white font-medium">
                {language === "bn" ? "ধন্যবাদ! আপনি সাবস্ক্রাইব হয়েছেন।" : "Thank you! You're now subscribed."}
              </span>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
                <div className="flex-1 relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    placeholder={language === "bn" ? "আপনার ইমেইল" : "Enter your email"}
                    className="w-full h-[52px] px-5 bg-white dark:bg-slate-800 border-2 border-transparent rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-white/50 transition-all placeholder:text-slate-400"
                    style={{ fontSize: '16px' }} // Prevent zoom on iOS
                    disabled={isLoading}
                  />
                  {error && (
                    <p className="absolute -bottom-6 left-0 text-xs text-red-200 font-medium">
                      {error}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="h-[52px] px-8 bg-rose-300 hover:bg-rose-400 text-white font-bold rounded-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[140px]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>{language === "bn" ? "অপেক্ষা করুন..." : "Wait..."}</span>
                    </>
                  ) : (
                    language === "bn" ? "সাবস্ক্রাইব" : "Subscribe"
                  )}
                </Button>
              </div>

              {/* Privacy Note */}
              <p className="text-rose-100/80 text-xs mt-6">
                {language === "bn"
                  ? "সাবস্ক্রাইব করে আপনি আমাদের প্রাইভেসি পলিসিতে সম্মত হচ্ছেন।"
                  : "By subscribing, you agree to our Privacy Policy."}
              </p>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </Section>
  );
}

