"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button, Heading } from "@/components/ui";
import { Input } from "@/components/ui/Input";
import { API_URL } from "@/lib/config";
import { useToast } from "@/components/ui/Toast";
import { FullScreenLoader } from "@/components/ui/Loader";

export default function EditCouponPage() {
  const params = useParams();
  const couponId = params.id as string;
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    type: "percentage" as "percentage" | "fixed",
    value: "",
    min_order_amount: "",
    max_discount_amount: "",
    starts_at: "",
    expires_at: "",
    no_expiry: false,
    usage_limit: "",
    usage_limit_per_user: "",
    first_order_only: false,
    free_shipping: false,
    is_active: true,
  });
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { addToast } = useToast();

  useEffect(() => {
    fetchCoupon();
  }, [couponId]);

  const fetchCoupon = async () => {
    try {
      const [couponRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/coupons/${couponId}`),
        fetch(`${API_URL}/coupons/${couponId}/stats`)
      ]);

      if (couponRes.ok) {
        const data = await couponRes.json();
        setFormData({
          code: data.code || "",
          name: data.name || "",
          description: data.description || "",
          type: data.type || "percentage",
          value: data.value?.toString() || "",
          min_order_amount: data.min_order_amount?.toString() || "",
          max_discount_amount: data.max_discount_amount?.toString() || "",
          starts_at: data.starts_at ? data.starts_at.split('T')[0] : "",
          expires_at: data.expires_at ? data.expires_at.split('T')[0] : "",
          no_expiry: data.no_expiry ?? false,
          usage_limit: data.usage_limit?.toString() || "",
          usage_limit_per_user: data.usage_limit_per_user?.toString() || "",
          first_order_only: data.first_order_only ?? false,
          free_shipping: data.free_shipping ?? false,
          is_active: data.is_active ?? true,
        });
      } else {
        addToast("Coupon not found", "error");
        router.push("/admin/coupons");
      }

      if (statsRes.ok) {
        setStats(await statsRes.json());
      }
    } catch (e) {
      addToast("Error loading coupon", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        value: parseFloat(formData.value) || 0,
        min_order_amount: formData.min_order_amount ? parseFloat(formData.min_order_amount) : null,
        max_discount_amount: formData.max_discount_amount ? parseFloat(formData.max_discount_amount) : null,
        usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
        usage_limit_per_user: formData.usage_limit_per_user ? parseInt(formData.usage_limit_per_user) : null,
        starts_at: formData.starts_at || null,
        expires_at: formData.expires_at || null,
      };

      const res = await fetch(`${API_URL}/coupons/${couponId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        addToast("Coupon updated successfully", "success");
        router.push("/admin/coupons");
      } else {
        const error = await res.json();
        addToast(error.message || "Failed to update coupon", "error");
      }
    } catch (e) {
      addToast("Error updating coupon", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <FullScreenLoader />;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <Heading size="md" className="font-sans text-slate-900 dark:text-white">Edit Coupon</Heading>
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()} className="rounded-lg py-2 px-4 text-sm h-auto">
            Cancel
          </Button>
          <Button type="submit" form="coupon-form" disabled={isSubmitting} className="rounded-lg shadow-md shadow-sky-500/20 py-2 px-6 text-sm h-auto">
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Usage Stats */}
      {stats && (
        <div className="bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20 p-4 rounded-xl border border-sky-100 dark:border-sky-800">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Usage Statistics</h4>
              <p className="text-xs text-slate-500 mt-1">
                Used <span className="font-bold text-sky-600">{stats.totalUsages}</span> times
                {formData.usage_limit && ` out of ${formData.usage_limit}`}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-sky-600">৳{stats.totalDiscount?.toFixed(0) || 0}</div>
              <div className="text-xs text-slate-500">Total Discount Given</div>
            </div>
          </div>
        </div>
      )}

      <form id="coupon-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-base text-slate-900 dark:text-white mb-4">Basic Information</h3>

          <div className="grid md:grid-cols-2 gap-6">
            <Input
              label="Coupon Code"
              value={formData.code}
              onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
              required
              placeholder="e.g., SUMMER20"
              className="bg-slate-50/50 font-mono uppercase"
            />
            <Input
              label="Name (Optional)"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="e.g., Summer Sale Discount"
              className="bg-slate-50/50"
            />
          </div>

          <div className="mt-4">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Description (Internal)</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder="Internal notes about this coupon..."
              rows={2}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white text-sm"
            />
          </div>
        </div>

        {/* Discount Configuration */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-base text-slate-900 dark:text-white mb-4">Discount Configuration</h3>

          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Discount Type</label>
              <select
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value as "percentage" | "fixed"})}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white text-sm"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (৳)</option>
              </select>
            </div>
            <Input
              label={formData.type === 'percentage' ? 'Discount (%)' : 'Discount Amount (৳)'}
              type="number"
              value={formData.value}
              onChange={e => setFormData({...formData, value: e.target.value})}
              required
              placeholder={formData.type === 'percentage' ? 'e.g., 20' : 'e.g., 100'}
              className="bg-slate-50/50"
            />
            {formData.type === 'percentage' && (
              <Input
                label="Max Discount (৳)"
                type="number"
                value={formData.max_discount_amount}
                onChange={e => setFormData({...formData, max_discount_amount: e.target.value})}
                placeholder="e.g., 500"
                className="bg-slate-50/50"
              />
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6 mt-4">
            <Input
              label="Minimum Order Amount (৳)"
              type="number"
              value={formData.min_order_amount}
              onChange={e => setFormData({...formData, min_order_amount: e.target.value})}
              placeholder="e.g., 1000"
              className="bg-slate-50/50"
            />
          </div>
        </div>

        {/* Validity Period */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Validity Period</h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.no_expiry}
                onChange={e => setFormData({...formData, no_expiry: e.target.checked})}
                className="w-4 h-4 rounded border-slate-300 text-sky-500 focus:ring-sky-500"
              />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">No Expiry</span>
            </label>
          </div>

          {!formData.no_expiry && (
            <div className="grid md:grid-cols-2 gap-6">
              <Input
                label="Start Date"
                type="date"
                value={formData.starts_at}
                onChange={e => setFormData({...formData, starts_at: e.target.value})}
                className="bg-slate-50/50"
              />
              <Input
                label="End Date"
                type="date"
                value={formData.expires_at}
                onChange={e => setFormData({...formData, expires_at: e.target.value})}
                className="bg-slate-50/50"
              />
            </div>
          )}
        </div>

        {/* Usage Limits */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-base text-slate-900 dark:text-white mb-4">Usage Limits</h3>

          <div className="grid md:grid-cols-2 gap-6">
            <Input
              label="Total Usage Limit"
              type="number"
              value={formData.usage_limit}
              onChange={e => setFormData({...formData, usage_limit: e.target.value})}
              placeholder="Leave empty for unlimited"
              className="bg-slate-50/50"
            />
            <Input
              label="Limit Per Customer"
              type="number"
              value={formData.usage_limit_per_user}
              onChange={e => setFormData({...formData, usage_limit_per_user: e.target.value})}
              placeholder="Leave empty for unlimited"
              className="bg-slate-50/50"
            />
          </div>
        </div>

        {/* Additional Options */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-base text-slate-900 dark:text-white mb-4">Additional Options</h3>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.first_order_only}
                onChange={e => setFormData({...formData, first_order_only: e.target.checked})}
                className="w-4 h-4 rounded border-slate-300 text-sky-500 focus:ring-sky-500"
              />
              <div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">First Order Only</span>
                <p className="text-xs text-slate-500">Only allow for customers placing their first order</p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.free_shipping}
                onChange={e => setFormData({...formData, free_shipping: e.target.checked})}
                className="w-4 h-4 rounded border-slate-300 text-sky-500 focus:ring-sky-500"
              />
              <div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Include Free Shipping</span>
                <p className="text-xs text-slate-500">Also waive shipping charges when this coupon is applied</p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={e => setFormData({...formData, is_active: e.target.checked})}
                className="w-4 h-4 rounded border-slate-300 text-sky-500 focus:ring-sky-500"
              />
              <div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Active</span>
                <p className="text-xs text-slate-500">Enable this coupon for use</p>
              </div>
            </label>
          </div>
        </div>
      </form>
    </div>
  );
}

