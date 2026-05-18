"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Heading } from "@/components/ui";
import { Input } from "@/components/ui/Input";
import { API_URL } from "@/lib/config";
import { useToast } from "@/components/ui/Toast";

export default function CreateCouponPage() {
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { addToast } = useToast();

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, code });
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

      const res = await fetch(`${API_URL}/coupons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        addToast("Coupon created successfully", "success");
        router.push("/admin/coupons");
      } else {
        const error = await res.json();
        addToast(error.message || "Failed to create coupon", "error");
      }
    } catch (e) {
      addToast("Error creating coupon", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <Heading size="md" className="font-sans text-slate-900 dark:text-white">Create Coupon</Heading>
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()} className="rounded-lg py-2 px-4 text-sm h-auto">
            Cancel
          </Button>
          <Button type="submit" form="coupon-form" disabled={isSubmitting} className="rounded-lg shadow-md shadow-pink-500/20 py-2 px-6 text-sm h-auto">
            {isSubmitting ? "Creating..." : "Create Coupon"}
          </Button>
        </div>
      </div>

      <form id="coupon-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-base text-slate-900 dark:text-white mb-4">Basic Information</h3>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Coupon Code</label>
              <div className="flex gap-2">
                <Input
                  value={formData.code}
                  onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
                  required
                  placeholder="e.g., SUMMER20"
                  className="flex-1 bg-slate-50/50 font-mono uppercase"
                />
                <Button type="button" variant="secondary" onClick={generateCode} className="rounded-lg py-2 px-3 text-xs h-auto whitespace-nowrap">
                  Generate
                </Button>
              </div>
            </div>
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
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-slate-900 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white text-sm"
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
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-slate-900 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white text-sm"
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
                className="w-4 h-4 rounded border-slate-300 text-pink-500 focus:ring-pink-500"
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
                className="w-4 h-4 rounded border-slate-300 text-pink-500 focus:ring-pink-500"
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
                className="w-4 h-4 rounded border-slate-300 text-pink-500 focus:ring-pink-500"
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
                className="w-4 h-4 rounded border-slate-300 text-pink-500 focus:ring-pink-500"
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

