"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, Heading } from "@/components/ui";
import { Input } from "@/components/ui/Input";
import { API_URL } from "@/lib/config";
import { useToast } from "@/components/ui/Toast";
import { MediaPicker } from "@/components/ui/MediaPicker";
import { getImageUrl } from "@/lib/utils";

export default function CreateBrandPage() {
  const [newBrand, setNewBrand] = useState({ name: "", name_bn: "", logo: "", description: "", mother_category_id: "", is_active: true });
  const [motherCategories, setMotherCategories] = useState<any[]>([]);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const router = useRouter();
  const { addToast } = useToast();

  useEffect(() => {
    // Fetch mother categories
    fetch(`${API_URL}/mother-categories`)
      .then(res => res.json())
      .then(data => {
          if (Array.isArray(data)) {
            setMotherCategories(data);
          }
      })
      .catch(console.error);
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        const payload = { ...newBrand };
        if (!payload.mother_category_id) delete (payload as any).mother_category_id;

        const res = await fetch(`${API_URL}/brands`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        
        if (res.ok) {
            addToast("Brand created successfully", "success");
            router.push("/admin/brands");
        } else {
            addToast("Failed to create brand", "error");
        }
    } catch (e) {
        addToast("Error creating brand", "error");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <Heading size="md" className="font-sans text-slate-900 dark:text-white">Add Brand</Heading>
        <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => router.back()} className="rounded-lg py-2 px-4 text-sm h-auto">Cancel</Button>
            <Button type="submit" form="brand-form" className="rounded-lg shadow-md shadow-pink-500/20 py-2 px-6 text-sm h-auto">Save Brand</Button>
        </div>
      </div>
      
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
        <form id="brand-form" onSubmit={handleCreate} className="space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3 mb-2">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Brand Details</h3>
              <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                        type="checkbox" 
                        checked={newBrand.is_active} 
                        onChange={e => setNewBrand({...newBrand, is_active: e.target.checked})}
                        className="w-4 h-4 rounded border-slate-300 text-pink-500 focus:ring-pink-500"
                    />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Active</span>
                </label>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Input label="Name (English)" value={newBrand.name} onChange={e => setNewBrand({...newBrand, name: e.target.value})} required className="bg-slate-50/50 dark:bg-slate-800/50" />
            <Input label="Name (Bangla)" value={newBrand.name_bn} onChange={e => setNewBrand({...newBrand, name_bn: e.target.value})} className="bg-slate-50/50 dark:bg-slate-800/50" />
          </div>
          
          <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Mother Category</label>
              <select 
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-slate-900 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none transition-all dark:bg-slate-800/50 dark:border-slate-700 dark:text-white text-sm"
                  value={newBrand.mother_category_id}
                  onChange={e => setNewBrand({...newBrand, mother_category_id: e.target.value})}
              >
                  <option value="">None</option>
                  {motherCategories.map(mc => (
                      <option key={mc.id} value={mc.id}>
                          {mc.name}
                      </option>
                  ))}
              </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Logo URL</label>
            <div className="flex gap-2">
                <Input 
                    className="flex-1 bg-slate-50/50 dark:bg-slate-800/50 text-sm" 
                    value={newBrand.logo} 
                    onChange={e => setNewBrand({...newBrand, logo: e.target.value})} 
                    placeholder="Image URL..."
                />
                <Button type="button" variant="secondary" onClick={() => setShowMediaPicker(true)} className="rounded-lg py-2 px-3 text-xs h-auto">Select</Button>
            </div>
            {newBrand.logo && (
                <div className="mt-2 relative w-24 h-24 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group bg-slate-50 dark:bg-slate-800">
                    <img src={getImageUrl(newBrand.logo)} alt="Preview" className="w-full h-full object-contain p-2" />
                    <button 
                        type="button"
                        onClick={() => setNewBrand({...newBrand, logo: ""})}
                        className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-all shadow-md hover:bg-red-600"
                    >
                        ✕
                    </button>
                </div>
            )}
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
            <textarea 
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-slate-500 text-sm"
              value={newBrand.description} 
              onChange={e => setNewBrand({...newBrand, description: e.target.value})} 
              rows={3}
            />
          </div>
        </form>
      </div>

      {showMediaPicker && (
        <MediaPicker 
            onSelect={(url) => {
                setNewBrand({ ...newBrand, logo: url });
                setShowMediaPicker(false);
            }}
            onClose={() => setShowMediaPicker(false)}
        />
      )}
    </div>
  );
}
