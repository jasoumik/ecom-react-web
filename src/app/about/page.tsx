"use client";

import { Heading, Text, Section, ResponsiveImage, Button } from "@/components/ui";
import { useLanguage } from "@/lib/language-context";
import { useSettings } from "@/lib/settings-context";
import Link from "next/link";

export default function AboutPage() {
  const { t } = useLanguage();
  const settings = useSettings();

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Hero Section */}
      <div className="relative py-16 bg-sky-50 dark:bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#0ea5e9 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <Heading size="xl" className="font-sans text-slate-900 dark:text-white mb-4 font-bold">{t('about')} {settings.shop_name}</Heading>
          <Text className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {t('about_hero_subtitle')}
          </Text>
        </div>
      </div>

      {/* Story Section */}
      <Section>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500">
            <ResponsiveImage 
                src="https://picsum.photos/seed/baby/800/800" 
                alt="Happy Baby" 
                width={800} 
                height={800} 
                className="object-cover w-full h-full"
            />
          </div>
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 text-sky-700 text-xs font-bold uppercase tracking-wider dark:bg-sky-900/30 dark:text-sky-400">
              {t('our_story')}
            </div>
            <Heading size="lg" className="font-sans text-slate-900 dark:text-white font-bold">{t('story_headline')}</Heading>
            <Text className="text-slate-600 dark:text-slate-300 leading-relaxed">
              {t('story_paragraph_1')}
            </Text>
            <Text className="text-slate-600 dark:text-slate-300 leading-relaxed">
              {t('story_paragraph_2')}
            </Text>
          </div>
        </div>
      </Section>

      {/* Values Section */}
      <Section className="bg-slate-50 dark:bg-slate-900/50">
        <div className="text-center mb-16">
            <Heading size="lg" className="font-sans text-slate-900 dark:text-white mb-4 font-bold">{t('our_core_values')}</Heading>
            <Text className="text-slate-600 dark:text-slate-400">{t('values_tagline')}</Text>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
            {[
                { icon: "🛡️", title: t('safety_first'), desc: t('safety_first_desc') },
                { icon: "🌱", title: t('sustainability'), desc: t('sustainability_desc') },
                { icon: "🤝", title: t('community'), desc: t('community_desc') }
            ].map((value, i) => (
                <div key={i} className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 text-center hover:-translate-y-2 transition-transform duration-300">
                    <div className="w-16 h-16 bg-sky-50 dark:bg-slate-700 rounded-2xl flex items-center justify-center text-3xl mb-6 mx-auto shadow-inner">
                        {value.icon}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{value.title}</h3>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{value.desc}</p>
                </div>
            ))}
        </div>
      </Section>

      {/* Team/Contact CTA */}
      <Section>
        <div className="bg-gradient-to-br from-sky-500 to-blue-600 rounded-3xl p-12 text-center text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }}></div>
            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
                <Heading size="xl" className="font-sans font-bold text-white">{t('join_family')}</Heading>
                <p className="text-sky-100 text-lg">
                    {t('join_family_subtitle')}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                    <Link href="/contact">
                        <Button className="inline-block bg-white text-sky-600 px-8 py-3 rounded-xl font-bold hover:bg-sky-50 transition-colors shadow-lg">
                            {t('contact_us')}
                        </Button>
                    </Link>
                    <Link href="/products">
                        <Button variant="outline" className="inline-block bg-sky-600 text-white border border-sky-400 px-8 py-3 rounded-xl font-bold hover:bg-sky-700 transition-colors">
                            {t('start_shopping')}
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
      </Section>
    </div>
  );
}
