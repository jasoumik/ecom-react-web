import { CategoriesSection } from "./landing/CategoriesSection";
import { FeaturedProductsSection } from "./landing/FeaturedProductsSection";
import { WhyChooseUsSection } from "./landing/WhyChooseUsSection";
import { TestimonialsSection } from "./landing/TestimonialsSection";
import { API_URL } from "@/lib/config";
import { BannerSection } from "./landing/BannerSection";
import { BrandsSection } from "./landing/BrandsSection";
import { ShopByAgeSection } from "./landing/ShopByAgeSection";
import { TrustSection } from "./landing/TrustSection";
import { BundlesSection } from "./landing/BundlesSection";

export const dynamic = 'force-dynamic'; // Fix for dynamic server usage

async function getLandingData() {
  try {
    const res = await fetch(`${API_URL}/public/landing?tenant=default`, { 
      cache: 'no-store' 
    });
    if (!res.ok) throw new Error('Failed to fetch data');
    return res.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}

export default async function LandingPage() {
  const data = await getLandingData();

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0 relative bg-white dark:bg-slate-950">
      {/* Hero Banner Carousel */}
      {data.hero.banners && data.hero.banners.length > 0 && (
        <BannerSection banners={data.hero.banners} />
      )}

      {/* Trust Section - Baby Blue Background */}
      <TrustSection />

      {/* Categories Section */}
      <CategoriesSection categories={data.categories} motherCategories={data.motherCategories} />

      {/* Brands Section */}
      <BrandsSection motherCategories={data.motherCategories} />

      {/* Bundles & Combos Section */}
      <BundlesSection />

      {/* Featured Products */}
      <FeaturedProductsSection {...data.featuredProducts} motherCategories={data.motherCategories} />

      {/* Shop by Age Timeline */}
      <ShopByAgeSection />
      {/* Why Choose Us / Our Promise */}
      <WhyChooseUsSection {...data.whyChooseUs} />

      {/* Testimonials / Social Proof */}
      <TestimonialsSection {...data.testimonials} />

      {/* Call to Action */}
      {/*<CallToActionSection {...data.callToAction} />*/}
    </div>
  );
}
