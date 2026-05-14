"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button, Heading } from "@/components/ui";
import { Input } from "@/components/ui/Input";
import { API_URL } from "@/lib/config";
import { useToast } from "@/components/ui/Toast";
import { MediaPicker } from "@/components/ui/MediaPicker";
import { getImageUrl } from "@/lib/utils";
import { FullScreenLoader } from "@/components/ui/Loader";

const AVAILABLE_ROUTES = [
    { label: "Home", value: "/" },
    { label: "All Products", value: "/products" },
    { label: "New Arrivals", value: "/products?sort=new" },
    { label: "Best Sellers", value: "/products?sort=best_selling" },
    { label: "About Us", value: "/about" },
    { label: "Contact", value: "/contact" },
];

const POSITIONS = [
    { label: "Hero Banner", value: "hero" },
    { label: "Sidebar", value: "sidebar" },
    { label: "Popup", value: "popup" },
    { label: "Category Page", value: "category" },
    { label: "Checkout", value: "checkout" },
];

export default function EditBannerPage() {
  const [formData, setFormData] = useState<any>(null);
  const [labels, setLabels] = useState<any[]>([]);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const params = useParams();
  const { addToast } = useToast();
  const id = params.id as string;

  useEffect(() => {
    fetchBanner();
    fetchLabels();
  }, [id]);

  const fetchBanner = async () => {
    try {
      const res = await fetch(`${API_URL}/banners/${id}`);
      const data = await res.json();
      setFormData({
        ...data,
        starts_at: data.starts_at ? data.starts_at.split('T')[0] : "",
        expires_at: data.expires_at ? data.expires_at.split('T')[0] : "",
        no_expiry: data.no_expiry ?? true,
        label_id: data.label_id || "",
        position: data.position || "hero",
        target: data.target || "_self",
      });
    } catch (e) {
      addToast("Error loading banner", "error");
      router.push("/admin/banners");
    }
  };

  const fetchLabels = async () => {
    try {
      const res = await fetch(`${API_URL}/labels`);
      const data = await res.json();
      setLabels(Array.isArray(data) ? data : []);
    } catch (e) {
      setLabels([]);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
        const payload = {
          ...formData,
          order: parseInt(formData.order) || 0,
          label_id: formData.label_id || null,
          starts_at: formData.starts_at || null,
          expires_at: formData.expires_at || null,
        };

        const res = await fetch(`${API_URL}/banners/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (res.ok) {
            addToast("Banner updated successfully", "success");
            router.push("/admin/banners");
        } else {
            addToast("Failed to update banner", "error");
        }
    } catch (e) {
        addToast("Error updating banner", "error");
    } finally {
        setIsSubmitting(false);
    }
  };

  if (!formData) return <FullScreenLoader />;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <Heading size="md" className="font-sans text-slate-900 dark:text-white">Edit Banner</Heading>
        <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => router.back()} className="rounded-lg py-2 px-4 text-sm h-auto">Cancel</Button>
            <Button type="submit" form="edit-banner-form" disabled={isSubmitting} className="rounded-lg shadow-md shadow-sky-500/20 py-2 px-6 text-sm h-auto">
              {isSubmitting ? "Updating..." : "Update Banner"}
            </Button>
        </div>
      </div>

      <form id="edit-banner-form" onSubmit={handleUpdate} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Banner Details</h3>
              <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={e => setFormData({...formData, is_active: e.target.checked})}
                        className="w-4 h-4 rounded border-slate-300 text-sky-500 focus:ring-sky-500"
                    />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Active</span>
              </label>
          </div>

          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Input label="Title (English)" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required className="bg-slate-50/50 dark:bg-slate-800/50" />
              <Input label="Title (Bangla)" value={formData.title_bn || ""} onChange={e => setFormData({...formData, title_bn: e.target.value})} className="bg-slate-50/50 dark:bg-slate-800/50" />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Image URL</label>
              <div className="flex gap-2 mb-2">
                  <Input
                      className="flex-1 bg-slate-50/50 dark:bg-slate-800/50 text-sm"
                      value={formData.image}
                      onChange={e => setFormData({...formData, image: e.target.value})}
                      required
                      placeholder="Image URL..."
                  />
                  <Button type="button" variant="secondary" onClick={() => setShowMediaPicker(true)} className="rounded-lg py-2 px-3 text-xs h-auto">Select</Button>
              </div>
              {formData.image && (
                  <div className="relative w-full h-40 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 group">
                      <img src={getImageUrl(formData.image)} alt="Preview" className="w-full h-full object-cover" />
                      <button
                          type="button"
                          onClick={() => setFormData({...formData, image: ""})}
                          className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                          ✕
                      </button>
                  </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Position</label>
                <select
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all dark:bg-slate-800/50 dark:border-slate-700 dark:text-white text-sm"
                    value={formData.position}
                    onChange={e => setFormData({...formData, position: e.target.value})}
                >
                    {POSITIONS.map(pos => (
                        <option key={pos.value} value={pos.value}>{pos.label}</option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Associated Label</label>
                <select
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all dark:bg-slate-800/50 dark:border-slate-700 dark:text-white text-sm"
                    value={formData.label_id}
                    onChange={e => setFormData({...formData, label_id: e.target.value})}
                >
                    <option value="">No Label</option>
                    {labels.map(label => (
                        <option key={label.id} value={label.id}>{label.name}</option>
                    ))}
                </select>
                <p className="text-xs text-slate-500 mt-1">Link banner to a product label for filtering</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Link Route</label>
              <div className="flex flex-col gap-2">
                  <select
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all dark:bg-slate-800/50 dark:border-slate-700 dark:text-white text-sm"
                      value={AVAILABLE_ROUTES.some(r => r.value === formData.link) ? formData.link : "custom"}
                      onChange={e => {
                          const val = e.target.value;
                          if (val !== "custom") setFormData({...formData, link: val});
                          else if (AVAILABLE_ROUTES.some(r => r.value === formData.link)) setFormData({...formData, link: ""});
                      }}
                  >
                      <option value="">Select a Route</option>
                      {AVAILABLE_ROUTES.map(route => (
                          <option key={route.value} value={route.value}>{route.label} ({route.value})</option>
                      ))}
                      <option value="custom">Custom URL...</option>
                  </select>

                  {(!AVAILABLE_ROUTES.some(r => r.value === formData.link) || formData.link === "") && (
                      <Input
                          placeholder="Enter custom URL (e.g. /products/123)"
                          value={formData.link || ""}
                          onChange={e => setFormData({...formData, link: e.target.value})}
                          className="bg-slate-50/50 dark:bg-slate-800/50"
                      />
                  )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Input label="Display Order" type="number" value={formData.order} onChange={e => setFormData({...formData, order: e.target.value})} className="bg-slate-50/50 dark:bg-slate-800/50" />

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Link Target</label>
                <select
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all dark:bg-slate-800/50 dark:border-slate-700 dark:text-white text-sm"
                    value={formData.target}
                    onChange={e => setFormData({...formData, target: e.target.value})}
                >
                    <option value="_self">Same Tab</option>
                    <option value="_blank">New Tab</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Scheduling */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Scheduling</h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                  type="checkbox"
                  checked={formData.no_expiry}
                  onChange={e => setFormData({...formData, no_expiry: e.target.checked})}
                  className="w-4 h-4 rounded border-slate-300 text-sky-500 focus:ring-sky-500"
              />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">No Expiry</span>
            </label>
          </div>

          {!formData.no_expiry && (
            <div className="grid md:grid-cols-2 gap-6">
              <Input
                label="Start Date"
                type="date"
                value={formData.starts_at}
                onChange={e => setFormData({...formData, starts_at: e.target.value})}
                className="bg-slate-50/50 dark:bg-slate-800/50"
              />
              <Input
                label="End Date"
                type="date"
                value={formData.expires_at}
                onChange={e => setFormData({...formData, expires_at: e.target.value})}
                className="bg-slate-50/50 dark:bg-slate-800/50"
              />
            </div>
          )}

          {formData.no_expiry && (
            <p className="text-sm text-slate-500">This banner will be displayed indefinitely until manually deactivated.</p>
          )}
        </div>
      </form>

      {showMediaPicker && (
        <MediaPicker
            onSelect={(url) => {
                setFormData({ ...formData, image: url });
                setShowMediaPicker(false);
            }}
            onClose={() => setShowMediaPicker(false)}
        />
      )}
    </div>
  );
}

