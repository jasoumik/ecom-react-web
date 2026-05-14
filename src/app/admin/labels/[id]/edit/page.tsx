"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button, Heading } from "@/components/ui";
import { Input } from "@/components/ui/Input";
import { API_URL } from "@/lib/config";
import { useToast } from "@/components/ui/Toast";
import { FullScreenLoader } from "@/components/ui/Loader";

const PRESET_COLORS = [
  { color: '#3b82f6', bg: '#eff6ff', name: 'Blue' },
  { color: '#22c55e', bg: '#f0fdf4', name: 'Green' },
  { color: '#f59e0b', bg: '#fffbeb', name: 'Amber' },
  { color: '#ef4444', bg: '#fef2f2', name: 'Red' },
  { color: '#8b5cf6', bg: '#f5f3ff', name: 'Purple' },
  { color: '#ec4899', bg: '#fdf2f8', name: 'Pink' },
  { color: '#06b6d4', bg: '#ecfeff', name: 'Cyan' },
  { color: '#64748b', bg: '#f8fafc', name: 'Slate' },
];

export default function EditLabelPage() {
  const params = useParams();
  const labelId = params.id as string;
  const [formData, setFormData] = useState({
    name: "",
    name_bn: "",
    slug: "",
    color: "#3b82f6",
    bg_color: "#eff6ff",
    description: "",
    is_active: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { addToast } = useToast();

  useEffect(() => {
    fetchLabel();
  }, [labelId]);

  const fetchLabel = async () => {
    try {
      const res = await fetch(`${API_URL}/labels/${labelId}`);
      if (res.ok) {
        const data = await res.json();
        setFormData({
          name: data.name || "",
          name_bn: data.name_bn || "",
          slug: data.slug || "",
          color: data.color || "#3b82f6",
          bg_color: data.bg_color || "#eff6ff",
          description: data.description || "",
          is_active: data.is_active ?? true,
        });
      } else {
        addToast("Label not found", "error");
        router.push("/admin/labels");
      }
    } catch (e) {
      addToast("Error loading label", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleColorPreset = (preset: typeof PRESET_COLORS[0]) => {
    setFormData({
      ...formData,
      color: preset.color,
      bg_color: preset.bg,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/labels/${labelId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        addToast("Label updated successfully", "success");
        router.push("/admin/labels");
      } else {
        const error = await res.json();
        addToast(error.message || "Failed to update label", "error");
      }
    } catch (e) {
      addToast("Error updating label", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <FullScreenLoader />;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <Heading size="md" className="font-sans text-slate-900 dark:text-white">Edit Label</Heading>
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()} className="rounded-lg py-2 px-4 text-sm h-auto">
            Cancel
          </Button>
          <Button type="submit" form="label-form" disabled={isSubmitting} className="rounded-lg shadow-md shadow-sky-500/20 py-2 px-6 text-sm h-auto">
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
        <form id="label-form" onSubmit={handleSubmit} className="space-y-6">
          {/* Preview */}
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 flex items-center gap-4">
            <span className="text-xs font-bold text-slate-500">Preview:</span>
            <span
              className="inline-flex px-3 py-1 rounded-full text-xs font-bold"
              style={{ backgroundColor: formData.bg_color, color: formData.color }}
            >
              {formData.name || 'Label Name'}
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Input
              label="Name (English)"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              required
              placeholder="e.g., New Arrivals"
              className="bg-slate-50/50"
            />
            <Input
              label="Name (Bangla)"
              value={formData.name_bn}
              onChange={e => setFormData({...formData, name_bn: e.target.value})}
              placeholder="e.g., নতুন পণ্য"
              className="bg-slate-50/50"
            />
          </div>

          <Input
            label="Slug"
            value={formData.slug}
            onChange={e => setFormData({...formData, slug: e.target.value})}
            required
            placeholder="e.g., new-arrivals"
            className="bg-slate-50/50 font-mono text-sm"
          />

          {/* Color Presets */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Color Theme</label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handleColorPreset(preset)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    formData.color === preset.color 
                      ? 'ring-2 ring-offset-2 ring-sky-500' 
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: preset.bg, color: preset.color }}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Text Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={formData.color}
                  onChange={e => setFormData({...formData, color: e.target.value})}
                  className="w-12 h-10 rounded-lg border border-slate-200 cursor-pointer"
                />
                <Input
                  value={formData.color}
                  onChange={e => setFormData({...formData, color: e.target.value})}
                  className="flex-1 bg-slate-50/50 font-mono text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Background Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={formData.bg_color}
                  onChange={e => setFormData({...formData, bg_color: e.target.value})}
                  className="w-12 h-10 rounded-lg border border-slate-200 cursor-pointer"
                />
                <Input
                  value={formData.bg_color}
                  onChange={e => setFormData({...formData, bg_color: e.target.value})}
                  className="flex-1 bg-slate-50/50 font-mono text-sm"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder="Optional description for admin reference..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white text-sm"
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={e => setFormData({...formData, is_active: e.target.checked})}
              className="w-4 h-4 rounded border-slate-300 text-sky-500 focus:ring-sky-500"
            />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Active</span>
          </label>
        </form>
      </div>
    </div>
  );
}

