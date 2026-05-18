"use client";

import { useEffect, useState } from "react";
import { Heading, Button } from "@/components/ui";
import { API_URL } from "@/lib/config";
import { useToast } from "@/components/ui/Toast";
import { FullScreenLoader } from "@/components/ui/Loader";

const WATERMARK_KEYS = [
  "watermark_enabled",
  "watermark_type",
  "watermark_text",
  "watermark_image",
  "watermark_opacity",
  "watermark_position",
  "watermark_size",
];

const POSITIONS = [
  { value: "northwest", label: "↖", title: "Top Left" },
  { value: "north", label: "↑", title: "Top Center" },
  { value: "northeast", label: "↗", title: "Top Right" },
  { value: "west", label: "←", title: "Middle Left" },
  { value: "center", label: "◎", title: "Center" },
  { value: "east", label: "→", title: "Middle Right" },
  { value: "southwest", label: "↙", title: "Bottom Left" },
  { value: "south", label: "↓", title: "Bottom Center" },
  { value: "southeast", label: "↘", title: "Bottom Right" },
];

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${API_URL}/settings`);
      const data = await res.json();
      const sorted = (Array.isArray(data) ? data : []).sort((a: any, b: any) =>
        a.key.localeCompare(b.key)
      );
      setSettings(sorted);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => prev.map((s) => (s.key === key ? { ...s, value } : s)));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all(
        settings.map((s) =>
          fetch(`${API_URL}/settings/${s.key}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ value: s.value }),
          })
        )
      );
      addToast("Settings saved successfully", "success");
      fetchSettings();
    } catch (e) {
      addToast("Error saving settings", "error");
    } finally {
      setSaving(false);
    }
  };

  const wm = (key: string) => settings.find((s) => s.key === key)?.value ?? "";
  const generalSettings = settings.filter((s) => !WATERMARK_KEYS.includes(s.key));
  const wmEnabled = wm("watermark_enabled") === "true";
  const wmType = wm("watermark_type") || "text";
  const wmPosition = wm("watermark_position") || "southeast";

  if (loading) return <FullScreenLoader />;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-3xl">
      <div className="flex justify-between items-center">
        <div>
          <Heading size="md" className="font-sans text-slate-800 dark:text-white mb-0.5">
            Settings
          </Heading>
          <p className="text-xs text-slate-500">Configure system preferences</p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg shadow-md shadow-pink-500/20 py-2 px-6 text-sm h-auto"
        >
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {/* General Settings */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
          General Configuration
        </h3>
        <div className="space-y-5">
          {generalSettings.map((setting) => (
            <div key={setting.id} className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 capitalize">
                {setting.key.replace(/_/g, " ")}
              </label>
              <p className="text-[10px] text-slate-500 mb-1.5">{setting.description}</p>

              {setting.key === "inventory_method" ? (
                <div className="flex gap-3">
                  {["FIFO", "LIFO"].map((method) => (
                    <label
                      key={method}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all ${
                        setting.value === method
                          ? "border-pink-500 bg-pink-50 dark:bg-pink-900/20"
                          : "border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      <input
                        type="radio"
                        name="inventory_method"
                        checked={setting.value === method}
                        onChange={() => handleChange("inventory_method", method)}
                        className="w-3.5 h-3.5 text-pink-500 focus:ring-pink-500"
                      />
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {method === "FIFO" ? "FIFO (First-In, First-Out)" : "LIFO (Last-In, First-Out)"}
                      </span>
                    </label>
                  ))}
                </div>
              ) : (
                <input
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white text-sm"
                  value={setting.value}
                  onChange={(e) => handleChange(setting.key, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Watermark Configuration */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-5">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Watermark Configuration
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Automatically apply a brand watermark to all uploaded images as WebP
            </p>
          </div>
          {/* Enable toggle */}
          <button
            type="button"
            onClick={() => handleChange("watermark_enabled", wmEnabled ? "false" : "true")}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
              wmEnabled ? "bg-pink-500" : "bg-slate-200 dark:bg-slate-700"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                wmEnabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        <div className={`space-y-5 ${!wmEnabled ? "opacity-40 pointer-events-none" : ""}`}>
          {/* Watermark Type */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
              Watermark Type
            </label>
            <div className="flex gap-3">
              {[
                { value: "text", label: "Text" },
                { value: "image", label: "Image" },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-all ${
                    wmType === opt.value
                      ? "border-pink-500 bg-pink-50 dark:bg-pink-900/20"
                      : "border-slate-200 dark:border-slate-700"
                  }`}
                >
                  <input
                    type="radio"
                    checked={wmType === opt.value}
                    onChange={() => handleChange("watermark_type", opt.value)}
                    className="w-3.5 h-3.5 text-pink-500 focus:ring-pink-500"
                  />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Text or Image input */}
          {wmType === "text" ? (
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                Watermark Text
              </label>
              <input
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white text-sm"
                placeholder="Your Brand Name"
                value={wm("watermark_text")}
                onChange={(e) => handleChange("watermark_text", e.target.value)}
              />
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Watermark Image URL
                </label>
                <input
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white text-sm"
                  placeholder="https://..."
                  value={wm("watermark_image")}
                  onChange={(e) => handleChange("watermark_image", e.target.value)}
                />
              </div>
              {wm("watermark_image") && (
                <div className="w-24 h-16 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                  <img
                    src={wm("watermark_image")}
                    alt="Watermark preview"
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                </div>
              )}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Watermark Width (px)
                </label>
                <input
                  type="number"
                  min={50}
                  max={500}
                  className="w-28 px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white text-sm"
                  value={wm("watermark_size")}
                  onChange={(e) => handleChange("watermark_size", e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Opacity */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              Opacity — <span className="text-pink-500 font-mono">{parseFloat(wm("watermark_opacity") || "0.5").toFixed(1)}</span>
            </label>
            <input
              type="range"
              min={0.1}
              max={1}
              step={0.1}
              value={parseFloat(wm("watermark_opacity") || "0.5")}
              onChange={(e) => handleChange("watermark_opacity", e.target.value)}
              className="w-full h-1.5 rounded-full accent-pink-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>10%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Position Grid */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
              Position
            </label>
            <div className="grid grid-cols-3 gap-1.5 w-40">
              {POSITIONS.map((pos) => (
                <button
                  key={pos.value}
                  type="button"
                  title={pos.title}
                  onClick={() => handleChange("watermark_position", pos.value)}
                  className={`h-10 rounded-lg text-base font-bold transition-all border ${
                    wmPosition === pos.value
                      ? "bg-pink-500 border-pink-500 text-white shadow-sm shadow-pink-500/30"
                      : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-pink-300"
                  }`}
                >
                  {pos.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
