"use client";

import { useEffect, useState } from "react";
import { Heading, Button } from "@/components/ui";
import { API_URL } from "@/lib/config";
import { useToast } from "@/components/ui/Toast";
import { FullScreenLoader } from "@/components/ui/Loader";

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
      // Sort settings to ensure stable order
      const sorted = (Array.isArray(data) ? data : []).sort((a: any, b: any) => a.key.localeCompare(b.key));
      setSettings(sorted);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: string, value: string) => {
      setSettings(prev => prev.map(s => s.key === key ? { ...s, value } : s));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save all settings in parallel
      await Promise.all(settings.map(s => 
          fetch(`${API_URL}/settings/${s.key}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ value: s.value }),
          })
      ));
      
      addToast("Settings saved successfully", "success");
      fetchSettings(); // Refresh to be sure
    } catch (e) {
      addToast("Error saving settings", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <FullScreenLoader />;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-3xl">
      <div className="flex justify-between items-center">
        <div>
            <Heading size="md" className="font-sans text-slate-800 dark:text-white mb-0.5">Settings</Heading>
            <p className="text-xs text-slate-500">Configure system preferences</p>
        </div>
        <Button 
            onClick={handleSave} 
            disabled={saving}
            className="rounded-lg shadow-md shadow-sky-500/20 py-2 px-6 text-sm h-auto"
        >
            {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
      
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">General Configuration</h3>
        
        <div className="space-y-5">
            {settings.map(setting => (
                <div key={setting.id} className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 capitalize">
                        {setting.key.replace(/_/g, ' ')}
                    </label>
                    <p className="text-[10px] text-slate-500 mb-1.5">{setting.description}</p>
                    
                    {setting.key === 'inventory_method' ? (
                        <div className="flex gap-3">
                            <label className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all ${setting.value === 'FIFO' ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/20' : 'border-slate-200 dark:border-slate-700'}`}>
                                <input 
                                    type="radio" 
                                    name="inventory_method" 
                                    checked={setting.value === 'FIFO'} 
                                    onChange={() => handleChange('inventory_method', 'FIFO')}
                                    className="w-3.5 h-3.5 text-sky-500 focus:ring-sky-500"
                                />
                                <span className="text-xs font-bold text-slate-900 dark:text-white">FIFO (First-In, First-Out)</span>
                            </label>
                            <label className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all ${setting.value === 'LIFO' ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/20' : 'border-slate-200 dark:border-slate-700'}`}>
                                <input 
                                    type="radio" 
                                    name="inventory_method" 
                                    checked={setting.value === 'LIFO'} 
                                    onChange={() => handleChange('inventory_method', 'LIFO')}
                                    className="w-3.5 h-3.5 text-sky-500 focus:ring-sky-500"
                                />
                                <span className="text-xs font-bold text-slate-900 dark:text-white">LIFO (Last-In, First-Out)</span>
                            </label>
                        </div>
                    ) : (
                        <input 
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white text-sm"
                            value={setting.value}
                            onChange={(e) => handleChange(setting.key, e.target.value)}
                        />
                    )}
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}
