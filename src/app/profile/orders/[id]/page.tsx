"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button, Heading, RatingStars } from "@/components/ui";
import { API_URL } from "@/lib/config";
import { FullScreenLoader } from "@/components/ui/Loader";
import { formatDate } from "@/lib/utils";
import { ReviewModal } from "@/components/ui/ReviewModal";
import { useLanguage } from "@/lib/language-context";
import { useSettings } from "@/lib/settings-context";

export default function OrderInvoicePage() {
  const params = useParams();
  const id = params.id as string;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reviewProduct, setReviewProduct] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const router = useRouter();
  const { t } = useLanguage();
  const settings = useSettings();

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
        try {
            setCurrentUser(JSON.parse(userStr));
        } catch (e) {}
    }
    fetchOrder();
  }, [id]);

  const fetchOrder = () => {
    fetch(`${API_URL}/orders/${id}`)
      .then(res => res.json())
      .then(setOrder)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  if (loading) return <FullScreenLoader />;
  if (!order) return <div>Order not found</div>;

  const handlePrint = () => {
    window.print();
  };

  const canReview = currentUser && currentUser.id === order.user_id;

  return (
    <>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-4 sm:py-8 print:bg-white print:p-0 print:min-h-0">
        <div className="max-w-4xl mx-auto px-4 print:max-w-none print:px-0 print:mx-0">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 print:hidden">
            <Button variant="outline" onClick={() => router.back()} className="rounded-xl text-xs sm:text-sm py-2 px-4">← {t('back')}</Button>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button onClick={() => router.push(`/track/${order.id}`)} variant="secondary" className="w-full sm:w-auto rounded-xl text-xs sm:text-sm py-2 px-4 justify-center">
                    {t('track_order')}
                </Button>
                <Button onClick={handlePrint} className="w-full sm:w-auto rounded-xl flex items-center justify-center gap-2 text-xs sm:text-sm py-2 px-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    {t('print_invoice')}
                </Button>
            </div>
          </div>

          <div id="invoice-content" className="bg-white dark:bg-slate-800 p-4 sm:p-10 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 print:shadow-none print:border-0 print:rounded-none print:bg-white print:text-black print:p-0">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-8 border-b border-slate-100 dark:border-slate-700 pb-8 print:border-slate-200">
              <div className="space-y-1 w-full sm:w-auto">
                <h1 className="text-2xl sm:text-3xl font-bold text-sky-500 mb-2 print:text-sky-600">{settings.shop_name}</h1>
                <p className="text-xs sm:text-sm text-slate-500 print:text-slate-600 max-w-xs">{t('footer_desc')}</p>
                <p className="text-xs sm:text-sm text-slate-500 print:text-slate-600 mt-2 font-medium">{settings.shop_address}</p>
                <p className="text-xs sm:text-sm text-slate-500 print:text-slate-600">support@prithibee.com</p>
              </div>
              <div className="text-left sm:text-right w-full sm:w-auto space-y-1">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2 print:text-black uppercase tracking-wide">{t('invoice')}</h2>
                <p className="text-slate-600 dark:text-slate-300 font-medium print:text-slate-700 text-base sm:text-lg">#{order.order_number}</p>
                <p className="text-xs sm:text-sm text-slate-500 print:text-slate-600">{t('date')}: {formatDate(order.created_at)}</p>
                <div className={`mt-2 inline-block px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold capitalize border print:border-slate-300 print:bg-transparent print:text-black ${
                    order.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' :
                    order.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    'bg-slate-50 text-slate-700 border-slate-200'
                }`}>
                    {order.status}
                </div>
              </div>
            </div>

            {/* Bill To */}
            <div className="mb-8 bg-slate-50 dark:bg-slate-700/30 p-4 sm:p-6 rounded-xl sm:rounded-2xl print:bg-transparent print:p-0">
              <h3 className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 print:text-slate-500">{t('bill_to')}</h3>
              <div className="text-slate-900 dark:text-white font-bold text-base sm:text-lg print:text-black mb-1">{order.customer_name}</div>
              <div className="text-slate-600 dark:text-slate-300 print:text-slate-700 mb-1 text-sm">{order.customer_phone}</div>
              <div className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap max-w-md print:text-slate-700 text-sm">{order.customer_address}</div>
            </div>

            {/* Items - Desktop Table */}
            <div className="hidden sm:block overflow-hidden rounded-xl border border-slate-100 dark:border-slate-700 mb-8 print:border-slate-200">
                <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-700/50 print:bg-slate-100">
                    <tr>
                    <th className="text-left py-4 px-6 font-bold text-slate-600 dark:text-slate-300 print:text-slate-700 text-sm">{t('item')}</th>
                    <th className="text-center py-4 px-4 font-bold text-slate-600 dark:text-slate-300 print:text-slate-700 text-sm">{t('quantity')}</th>
                    <th className="text-right py-4 px-4 font-bold text-slate-600 dark:text-slate-300 print:text-slate-700 text-sm">{t('price')}</th>
                    <th className="text-right py-4 px-6 font-bold text-slate-600 dark:text-slate-300 print:text-slate-700 text-sm">{t('total')}</th>
                    <th className="print:hidden w-32"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700 print:divide-slate-200">
                    {order.items.map((item: any) => (
                    <tr key={item.id}>
                        <td className="py-4 px-6 text-slate-900 dark:text-white print:text-black text-sm">
                            <div className="font-medium">{item.product_name}</div>
                            {item.variant_name && <div className="text-xs text-slate-500 mt-0.5">{item.variant_name}</div>}
                        </td>
                        <td className="py-4 px-4 text-center text-slate-600 dark:text-slate-400 print:text-slate-700 text-sm">{item.quantity}</td>
                        <td className="py-4 px-4 text-right text-slate-600 dark:text-slate-400 print:text-slate-700 text-sm">৳{item.price}</td>
                        <td className="py-4 px-6 text-right font-bold text-slate-900 dark:text-white print:text-black text-sm">৳{(item.price * item.quantity).toFixed(2)}</td>
                        <td className="print:hidden text-right px-4">
                            {(order.status === 'completed' || order.status === 'delivered') && (
                                item.review ? (
                                    <div className="flex flex-col items-end">
                                        <RatingStars rating={item.review.rating} size="sm" />
                                        <span className="text-[10px] text-slate-400 mt-1">Reviewed</span>
                                    </div>
                                ) : canReview ? (
                                    <button 
                                        onClick={() => setReviewProduct({ id: item.product_id, name: item.product_name })}
                                        className="text-xs font-bold text-sky-600 hover:text-sky-700 hover:underline whitespace-nowrap bg-sky-50 dark:bg-sky-900/20 px-3 py-1.5 rounded-lg transition-colors"
                                    >
                                        {t('write_review')}
                                    </button>
                                ) : null
                            )}
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>

            {/* Items - Mobile Cards */}
            <div className="sm:hidden space-y-4 mb-8">
                {order.items.map((item: any) => (
                    <div key={item.id} className="bg-slate-50 dark:bg-slate-700/30 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <div className="font-bold text-slate-900 dark:text-white text-sm">{item.product_name}</div>
                                {item.variant_name && <div className="text-xs text-slate-500 mt-0.5">{item.variant_name}</div>}
                            </div>
                            <div className="text-right">
                                <div className="font-bold text-slate-900 dark:text-white text-sm">৳{(item.price * item.quantity).toFixed(2)}</div>
                                <div className="text-xs text-slate-500">{item.quantity} x ৳{item.price}</div>
                            </div>
                        </div>
                        
                        {(order.status === 'completed' || order.status === 'delivered') && (
                            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-600 flex justify-end">
                                {item.review ? (
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-slate-500">Your Review:</span>
                                        <RatingStars rating={item.review.rating} size="sm" />
                                    </div>
                                ) : canReview ? (
                                    <button 
                                        onClick={() => setReviewProduct({ id: item.product_id, name: item.product_name })}
                                        className="text-xs font-bold text-sky-600 hover:text-sky-700 bg-white dark:bg-slate-800 px-4 py-2 rounded-lg shadow-sm border border-slate-200 dark:border-slate-600 w-full"
                                    >
                                        {t('write_review')}
                                    </button>
                                ) : null}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Totals */}
            <div className="flex justify-end mb-8">
              <div className="w-full sm:w-72 space-y-3 bg-slate-50 dark:bg-slate-700/30 p-6 rounded-2xl print:bg-transparent print:p-0">
                <div className="flex justify-between text-slate-600 dark:text-slate-400 print:text-slate-700 text-sm">
                  <span>{t('subtotal')}</span>
                  <span>৳{order.subtotal}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400 print:text-slate-700 text-sm">
                  <span>{t('delivery')}</span>
                  <span>৳{order.delivery_charge}</span>
                </div>
                {parseFloat(order.discount) > 0 && (
                    <div className="flex justify-between text-green-600 print:text-slate-700 text-sm">
                    <span>{t('discount')}</span>
                    <span>-৳{order.discount}</span>
                    </div>
                )}
                {parseFloat(order.points_discount) > 0 && (
                    <div className="flex justify-between text-purple-600 print:text-slate-700 text-sm">
                    <span>Points Redeemed ({order.points_redeemed})</span>
                    <span>-৳{order.points_discount}</span>
                    </div>
                )}
                <div className="flex justify-between text-xl font-bold text-slate-900 dark:text-white border-t-2 border-slate-200 dark:border-slate-600 pt-3 mt-3 print:border-slate-200 print:text-black">
                  <span>{t('total')}</span>
                  <span>৳{order.total_amount}</span>
                </div>
                
                {/* Paid / Due Summary */}
                <div className="border-t border-slate-200 dark:border-slate-600 pt-2 mt-2 print:border-slate-200">
                    <div className="flex justify-between text-sm font-medium text-emerald-600 print:text-black">
                        <span>Paid</span>
                        <span>৳{order.paid_amount || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm font-medium text-red-500 print:text-black">
                        <span>Due</span>
                        <span>৳{Math.max(0, parseFloat(order.total_amount) - (parseFloat(order.paid_amount) || 0))}</span>
                    </div>
                </div>
              </div>
            </div>

            {/* Payment History */}
            {order.payments && order.payments.length > 0 && (
                <div className="mb-8 print:mb-8">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 print:text-black">Payment History</h3>
                    <div className="overflow-hidden rounded-xl border border-slate-100 dark:border-slate-700 print:border-slate-200">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 dark:bg-slate-700/50 print:bg-slate-100">
                                <tr>
                                    <th className="py-3 px-4 font-bold text-slate-600 dark:text-slate-300 print:text-slate-700">Date</th>
                                    <th className="py-3 px-4 font-bold text-slate-600 dark:text-slate-300 print:text-slate-700">Method</th>
                                    <th className="py-3 px-4 font-bold text-slate-600 dark:text-slate-300 print:text-slate-700">Transaction ID</th>
                                    <th className="py-3 px-4 font-bold text-right text-slate-600 dark:text-slate-300 print:text-slate-700">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700 print:divide-slate-200">
                                {order.payments.map((payment: any) => (
                                    <tr key={payment.id}>
                                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400 print:text-black">
                                            {new Date(payment.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="py-3 px-4 text-slate-900 dark:text-white print:text-black capitalize">
                                            {payment.method}
                                        </td>
                                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400 print:text-black font-mono text-xs">
                                            {payment.transaction_id || '-'}
                                        </td>
                                        <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white print:text-black">
                                            ৳{payment.amount}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Footer */}
            <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-700 text-center text-slate-500 text-xs print:border-slate-200 print:text-slate-600">
              <p className="font-medium mb-1">{t('thank_you')}</p>
              <p>{t('queries_contact')} <span className="font-bold text-slate-700 dark:text-slate-300">{settings.shop_phone}</span></p>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { margin: 20px; size: auto; }
          body { visibility: hidden; }
          #invoice-content {
            visibility: visible;
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
            background: white;
            color: black;
          }
          #invoice-content * {
            color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      ` }} />

      {reviewProduct && (
          <ReviewModal 
            productId={reviewProduct.id}
            productName={reviewProduct.name}
            orderId={order.id}
            userId={order.user_id}
            onClose={() => {
                setReviewProduct(null);
                fetchOrder(); // Refresh order to show new review
            }}
            onSuccess={() => {
                fetchOrder(); // Refresh order to show new review
            }}
          />
      )}
    </>
  );
}
