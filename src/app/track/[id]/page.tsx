"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Heading, Text, Button } from "@/components/ui";
import { API_URL } from "@/lib/config";
import { FullScreenLoader } from "@/components/ui/Loader";
import { formatDate } from "@/lib/utils";
import { useLanguage } from "@/lib/language-context";

const STEPS = ['pending', 'processing', 'shipped', 'delivered'];

export default function TrackingPage() {
  const params = useParams();
  const id = params.id as string;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { t } = useLanguage();

  useEffect(() => {
    fetch(`${API_URL}/orders/${id}`)
      .then(res => res.json())
      .then(setOrder)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <FullScreenLoader />;
  if (!order) return <div className="min-h-screen flex items-center justify-center">Order not found</div>;

  const currentStepIndex = STEPS.indexOf(order.status) === -1 
    ? (order.status === 'cancelled' ? -1 : 0) 
    : STEPS.indexOf(order.status);

  const isCancelled = order.status === 'cancelled';

  // Helper to find timestamp for a status
  const getStatusTime = (status: string) => {
      if (!order.history) return null;
      const entry = order.history.find((h: any) => h.status === status);
      return entry ? new Date(entry.created_at).toLocaleString() : null;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
            <Button variant="outline" onClick={() => router.back()} className="rounded-xl">← {t('back')}</Button>
            <Heading size="lg" className="font-sans text-slate-900 dark:text-white">{t('order_tracking')}</Heading>
        </div>

        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="mb-8 text-center">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{t('order_id')}</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">#{order.order_number}</p>
                {order.estimated_delivery && (
                    <p className="text-sm text-rose-400 mt-2 font-medium">
                        {t('estimated_delivery')}: {formatDate(order.estimated_delivery)}
                    </p>
                )}
            </div>

            {isCancelled ? (
                <div className="text-center p-6 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-800">
                    <p className="text-red-600 dark:text-red-400 font-bold text-lg">{t('cancelled')}</p>
                    <p className="text-red-500 dark:text-red-300 text-sm mt-1">This order has been cancelled.</p>
                    <p className="text-xs text-slate-400 mt-2">{getStatusTime('cancelled')}</p>
                </div>
            ) : (
                <div className="relative">
                    {/* Vertical Line */}
                    <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-slate-100 dark:bg-slate-700"></div>

                    <div className="space-y-8 relative">
                        {STEPS.map((step, index) => {
                            const isCompleted = index <= currentStepIndex;
                            const isCurrent = index === currentStepIndex;
                            const time = getStatusTime(step);
                            
                            return (
                                <div key={step} className="flex gap-6 items-start">
                                    <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                                        isCompleted 
                                        ? 'bg-rose-400 border-rose-400 text-white' 
                                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-300'
                                    }`}>
                                        {isCompleted && (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                        )}
                                    </div>
                                    <div className={`flex-1 pt-1 ${isCompleted ? 'opacity-100' : 'opacity-50'}`}>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className={`font-bold text-base capitalize ${isCurrent ? 'text-rose-400' : 'text-slate-900 dark:text-white'}`}>
                                                    {t(step)}
                                                </h3>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                    {isCurrent ? 'Current Status' : (isCompleted ? 'Completed' : 'Pending')}
                                                </p>
                                            </div>
                                            {time && (
                                                <div className="text-xs text-slate-400 text-right">
                                                    {time}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
