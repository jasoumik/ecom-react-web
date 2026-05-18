"use client";

import { Section, Heading, Text, Button } from "@/components/ui";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";
import { useSettings } from "@/lib/settings-context";
import { getLocalizedField } from "@/lib/utils";

interface CallToActionProps {
  title: string;
  title_bn?: string;
  subtitle: string;
  subtitle_bn?: string;
  primaryCta: { label: string; label_bn?: string; href: string };
  secondaryText: string;
}

export function CallToActionSection({
  title,
  title_bn,
  subtitle,
  subtitle_bn,
  primaryCta,
  secondaryText,
}: CallToActionProps) {
  const { t, language } = useLanguage();
  const settings = useSettings();

  return (
    <Section className="py-16 bg-gradient-to-br from-rose-300 to-rose-200 text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }}></div>
      <div className="max-w-4xl mx-auto text-center relative z-10 px-4">
        <Heading size="xl" className="font-sans font-bold text-white mb-4">
          {getLocalizedField({title, title_bn}, 'title', language)}
        </Heading>
        <Text className="text-rose-100 text-lg mb-8">
          {getLocalizedField({subtitle, subtitle_bn}, 'subtitle', language)}
        </Text>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href={primaryCta.href}>
            <Button className="!bg-white !text-rose-400 hover:!bg-rose-50 px-8 py-3 rounded-full font-bold shadow-lg border-none">
              {getLocalizedField(primaryCta, 'label', language)}
            </Button>
          </Link>
          <Text className="text-rose-100 text-sm flex items-center justify-center sm:justify-start">
            {t('free_shipping_over', { amount: settings.free_shipping_threshold })}
          </Text>
        </div>
      </div>
    </Section>
  );
}
