"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Heading } from "@/components/ui";
import { API_URL } from "@/lib/config";
import { useToast } from "@/components/ui/Toast";
import { Table } from "@/components/ui/Table";
import { FullScreenLoader } from "@/components/ui/Loader";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { addToast } = useToast();

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const res = await fetch(`${API_URL}/coupons?all=true`);
      const data = await res.json();
      setCoupons(Array.isArray(data) ? data : []);
    } catch (e) {
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    try {
      const res = await fetch(`${API_URL}/coupons/${id}`, { method: "DELETE" });
      if (res.ok) {
        addToast("Coupon deleted", "success");
        fetchCoupons();
      } else {
        addToast("Failed to delete coupon", "error");
      }
    } catch (e) {
      addToast("Error deleting coupon", "error");
    }
  };

  const getCouponStatus = (coupon: any) => {
    const today = new Date().toISOString().split('T')[0];

    if (!coupon.is_active) return { label: 'Inactive', color: 'bg-slate-100 text-slate-600' };
    if (coupon.starts_at && coupon.starts_at > today) return { label: 'Scheduled', color: 'bg-blue-50 text-blue-600' };
    if (!coupon.no_expiry && coupon.expires_at && coupon.expires_at < today) return { label: 'Expired', color: 'bg-red-50 text-red-600' };
    if (coupon.usage_limit && coupon.times_used >= coupon.usage_limit) return { label: 'Exhausted', color: 'bg-orange-50 text-orange-600' };
    return { label: 'Active', color: 'bg-green-50 text-green-600' };
  };

  const formatDate = (date: string | null) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) return <FullScreenLoader />;

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <Heading size="md" className="font-sans text-slate-800 dark:text-white mb-0.5">Coupons</Heading>
          <p className="text-xs text-slate-500">Manage discount codes and promotions</p>
        </div>
        <Button onClick={() => router.push("/admin/coupons/create")} className="rounded-lg shadow-sm py-2 px-4 text-xs h-auto">
          + Add Coupon
        </Button>
      </div>

      <Table
        data={coupons}
        onRowClick={(coupon) => router.push(`/admin/coupons/${coupon.id}/edit`)}
        columns={[
          {
            header: "Code",
            cell: (coupon) => (
              <span className="font-mono font-bold text-sky-600 dark:text-sky-400 text-sm bg-sky-50 dark:bg-sky-900/20 px-2 py-1 rounded">
                {coupon.code}
              </span>
            )
          },
          {
            header: "Name",
            accessorKey: "name",
            className: "text-slate-700 dark:text-slate-300 text-sm"
          },
          {
            header: "Discount",
            cell: (coupon) => (
              <span className="font-bold text-slate-900 dark:text-white text-sm">
                {coupon.type === 'percentage' ? `${coupon.value}%` : `৳${coupon.value}`}
                {coupon.max_discount_amount && coupon.type === 'percentage' && (
                  <span className="text-xs text-slate-500 ml-1">(max ৳{coupon.max_discount_amount})</span>
                )}
              </span>
            )
          },
          {
            header: "Min Order",
            cell: (coupon) => (
              <span className="text-slate-600 dark:text-slate-400 text-xs">
                {coupon.min_order_amount ? `৳${coupon.min_order_amount}` : '—'}
              </span>
            )
          },
          {
            header: "Validity",
            cell: (coupon) => (
              <div className="text-xs text-slate-500">
                {coupon.no_expiry ? (
                  <span className="text-green-600">No Expiry</span>
                ) : (
                  <div>
                    <div>{formatDate(coupon.starts_at)} - {formatDate(coupon.expires_at)}</div>
                  </div>
                )}
              </div>
            )
          },
          {
            header: "Usage",
            cell: (coupon) => (
              <div className="text-xs text-slate-600 dark:text-slate-400">
                <span className="font-bold">{coupon.times_used || 0}</span>
                {coupon.usage_limit ? ` / ${coupon.usage_limit}` : ''}
              </div>
            )
          },
          {
            header: "Status",
            cell: (coupon) => {
              const status = getCouponStatus(coupon);
              return (
                <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${status.color}`}>
                  {status.label}
                </span>
              );
            }
          },
          {
            header: "Actions",
            className: "text-right",
            cell: (coupon) => (
              <div className="flex justify-end gap-1">
                <button
                  onClick={(e) => { e.stopPropagation(); router.push(`/admin/coupons/${coupon.id}/edit`); }}
                  className="p-1.5 rounded text-slate-500 hover:bg-sky-50 hover:text-sky-600 transition-colors"
                  title="Edit"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                </button>
                <button
                  onClick={(e) => handleDelete(coupon.id, e)}
                  className="p-1.5 rounded text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                  title="Delete"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              </div>
            )
          }
        ]}
      />
    </div>
  );
}

