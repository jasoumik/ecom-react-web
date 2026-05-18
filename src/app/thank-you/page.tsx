"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button, Heading, Text } from "@/components/ui";
import { useLanguage } from "@/lib/language-context";
import { API_URL } from "@/lib/config";
import Link from "next/link";
import { FullScreenLoader } from "@/components/ui/Loader";

function ThankYouContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(!!orderId);
  const router = useRouter();
  const { t } = useLanguage();

  useEffect(() => {
    if (orderId) {
        fetch(`${API_URL}/orders/${orderId}`)
            .then(res => res.json())
            .then(setOrder)
            .catch(console.error)
            .finally(() => setLoading(false));
    }
  }, [orderId]);

  if (loading) return <FullScreenLoader />;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center py-12 px-4">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-700 text-center max-w-md w-full">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-green-600 dark:text-green-400">
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
        </div>
        
        <Heading size="xl" className="font-sans text-slate-900 dark:text-white mb-2">{t('thank_you_title')}</Heading>
        <Text className="text-slate-600 dark:text-slate-400 mb-8">
            {t('thank_you_subtitle')}
        </Text>
        
        {order && (
            <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl mb-8">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{t('order_number')}</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">#{order.order_number}</p>
            </div>
        )}
        
        <div className="flex flex-col gap-3">
            {orderId && (
                <Link href={`/profile/orders/${orderId}`} className="w-full">
                    <Button variant="outline" fullWidth className="rounded-xl border-2 py-3 h-auto">{t('view_order')}</Button>
                </Link>
            )}
            <Link href="/products" className="w-full">
                <Button fullWidth className="rounded-xl shadow-lg shadow-rose-400/20 py-3 h-auto">{t('continue_shopping')}</Button>
            </Link>
        </div>
      </div>
    </div>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={<FullScreenLoader />}>
      <ThankYouContent />
    </Suspense>
  );
}
