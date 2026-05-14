"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ResponsiveImage, Button } from "@/components/ui";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";
import { getLocalizedField, getImageUrl } from "@/lib/utils";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Banner } from "./types";

interface BannerSectionProps {
    banners: Banner[];
}

export function BannerSection({ banners }: BannerSectionProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const { t, language } = useLanguage();
    const containerRef = useRef<HTMLDivElement>(null);

    // Auto-scroll carousel
    useEffect(() => {
        if (banners.length <= 1 || isPaused) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % banners.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [banners.length, isPaused]);

    const goToSlide = useCallback((index: number) => {
        setCurrentIndex(index);
    }, []);

    const goNext = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, [banners.length]);

    const goPrev = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
    }, [banners.length]);

    // Handle swipe gestures
    const handleDragEnd = useCallback((_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        const threshold = 50;
        if (info.offset.x > threshold) {
            goPrev();
        } else if (info.offset.x < -threshold) {
            goNext();
        }
    }, [goNext, goPrev]);

    if (!banners || banners.length === 0) return null;

    const currentBanner = banners[currentIndex];

    console.log("currentBanner", currentBanner);
    return (
        <section
            ref={containerRef}
            className="w-full bg-slate-50 dark:bg-slate-950 relative overflow-hidden"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
        >
            <div className="relative w-full h-[25vh] min-h-[160px] max-h-[220px] sm:h-[45vh] sm:min-h-[350px] sm:max-h-[500px] lg:h-[60vh] lg:max-h-[700px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0"
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.2}
                        onDragEnd={handleDragEnd}
                        style={{ touchAction: "pan-y" }} // Allow vertical scrolling
                    >
                        {/* Background Image */}
                        <div className="absolute inset-0">
                            <ResponsiveImage
                                src={getImageUrl(currentBanner.src)}
                                alt={getLocalizedField(currentBanner, 'alt', language)}
                                width={1920}
                                height={800}
                                className="object-cover w-full h-full"
                                priority
                            />
                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent lg:from-black/60 lg:via-black/30" />
                            {/* Mobile: Bottom gradient for text readability */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent lg:hidden" />
                        </div>

                        {/* Content Overlay */}
                        <div className="absolute inset-0 flex items-end lg:items-center pb-8 sm:pb-16 lg:pb-0 px-3 sm:px-8 lg:px-16 xl:px-24 z-10 pointer-events-none">
                            <div className="max-w-xl space-y-2 sm:space-y-4 lg:space-y-6 pointer-events-auto">
                                {/* Dynamic Label Badge - Hidden on mobile */}
                                {currentBanner.label_name && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                        className="hidden sm:inline-block"
                                    >
                                        <span 
                                            className="px-3 py-1.5 text-white text-xs font-bold uppercase tracking-wider rounded-md shadow-lg"
                                            style={{ backgroundColor: currentBanner.label_color || '#0ea5e9' }}
                                        >
                                            {getLocalizedField({ name: currentBanner.label_name, name_bn: currentBanner.label_name_bn }, 'name', language)}
                                        </span>
                                    </motion.div>
                                )}

                                {/* Headline */}
                                <motion.h1
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-lg sm:text-3xl lg:text-5xl xl:text-6xl font-extrabold text-white leading-tight drop-shadow-md"
                                >
                                    {getLocalizedField(currentBanner, 'alt', language)}
                                </motion.h1>

                                {/* CTA Button */}
                                <motion.div
                                    initial={{ opacity: 0, y: 24 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="pt-1 sm:pt-2"
                                >
                                    <Link href={currentBanner.link || '/products'}>
                                        <Button className="bg-sky-500 hover:bg-sky-600 text-white border-none font-bold px-4 py-2 sm:px-6 sm:py-2.5 rounded-full shadow-lg text-xs sm:text-sm min-h-[36px] sm:min-h-[44px]">
                                            {t('shop_now')}
                                        </Button>
                                    </Link>
                                </motion.div>

                                {/* Trust Badges - Tablet Only (Hidden on mobile and desktop) */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="hidden sm:grid lg:hidden grid-cols-2 gap-2 pt-4"
                                >
                                    <div className="flex items-center gap-2 text-white/90 text-xs">
                                        <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        <span>{t('authentic')}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-white/90 text-xs">
                                        <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        <span>{t('fast_delivery')}</span>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Slider Navigation Arrows - Desktop */}
                {banners.length > 1 && (
                    <>
                        <button
                            onClick={goPrev}
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-slate-900 transition-all z-20 hidden sm:flex shadow-lg"
                            aria-label="Previous slide"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <button
                            onClick={goNext}
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-slate-900 transition-all z-20 hidden sm:flex shadow-lg"
                            aria-label="Next slide"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </>
                )}

                {/* Slider Indicators */}
                {banners.length > 1 && (
                    <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-20">
                        {banners.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => goToSlide(idx)}
                                className={`h-1.5 rounded-full transition-all duration-300 shadow-sm backdrop-blur-sm ${
                                    idx === currentIndex
                                        ? 'w-8 bg-white'
                                        : 'w-2 bg-white/50 hover:bg-white/80'
                                }`}
                                aria-label={`Go to slide ${idx + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
