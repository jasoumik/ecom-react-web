"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button, Heading } from "@/components/ui";
import { Input } from "@/components/ui/Input";
import { API_URL } from "@/lib/config";
import { useToast } from "@/components/ui/Toast";
import { MediaPicker } from "@/components/ui/MediaPicker";
import { FullScreenLoader } from "@/components/ui/Loader";
import { getImageUrl } from "@/lib/utils";

export default function EditBrandPage() {
  const [brand, setBrand] = useState({ name: "", name_bn: "", logo: "", description: "", mother_category_id: "", is_active: true });
  const [motherCategories, setMotherCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const router = useRouter();
  const params = useParams();
  const { addToast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
        try {
            const [brandRes, motherRes] = await Promise.all([
                fetch(`${API_URL}/brands/${params.id}`),
                fetch(`${API_URL}/mother-categories`)
            ]);

            if (brandRes.ok) {
                const data = await brandRes.json();
                setBrand({
                    name: data.name,
                    name_bn: data.name_bn || "",
                    logo: data.logo || "",
                    description: data.description || "",
                    mother_category_id: data.mother_category_id || "",
                    is_active: data.is_active
                });
            }

            if (motherRes.ok) {
                const data = await motherRes.json();
                if (Array.isArray(data)) setMotherCategories(data);
            }
        } catch (e) {
            console.error(e);
            addToast("Failed to load data", "error");
        } finally {
            setLoading(false);
        }
    };

    fetchData();
  }, [params.id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        const payload = { ...brand };
        if (!payload.mother_category_id) delete (payload as any).mother_category_id;

        const res = await fetch(`${API_URL}/brands/${params.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        
        if (res.ok) {
            addToast("Brand updated successfully", "success");
            router.push("/admin/brands");
        } else {
            addToast("Failed to update brand", "error");
        }
    } catch (e) {
        addToast("Error updating brand", "error");
    }
  };

  if (loading) return <FullScreenLoader />;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <Heading size="md" className="font-sans text-slate-900 dark:text-white">Edit Brand</Heading>
        <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => router.back()} className="rounded-lg py-2 px-4 text-sm h-auto">Cancel</Button>
            <Button type="submit" form="brand-form" className="rounded-lg shadow-md shadow-pink-500/20 py-2 px-6 text-sm h-auto">Update Brand</Button>
        </div>
      </div>
      
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
        <form id="brand-form" onSubmit={handleUpdate} className="space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3 mb-2">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Brand Details</h3>
              <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                        type="checkbox" 
                        checked={brand.is_active} 
                        onChange={e => setBrand({...brand, is_active: e.target.checked})}
                        className="w-4 h-4 rounded border-slate-300 text-pink-500 focus:ring-pink-500"
                    />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Active</span>
                </label>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Input label="Name (English)" value={brand.name} onChange={e => setBrand({...brand, name: e.target.value})} required className="bg-slate-50/50" />
            <Input label="Name (Bangla)" value={brand.name_bn} onChange={e => setBrand({...brand, name_bn: e.target.value})} className="bg-slate-50/50" />
          </div>
          
          <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Mother Category</label>
              <select 
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-slate-900 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white text-sm"
                  value={brand.mother_category_id}
                  onChange={e => setBrand({...brand, mother_category_id: e.target.value})}
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
                    className="flex-1 bg-slate-50/50 text-sm" 
                    value={brand.logo} 
                    onChange={e => setBrand({...brand, logo: e.target.value})} 
                    placeholder="Image URL..."
                />
                <Button type="button" variant="secondary" onClick={() => setShowMediaPicker(true)} className="rounded-lg py-2 px-3 text-xs h-auto">Select</Button>
            </div>
            {brand.logo && (
                <div className="mt-2 relative w-24 h-24 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group bg-slate-50 dark:bg-slate-800">
                    <img src={getImageUrl(brand.logo)} alt="Preview" className="w-full h-full object-contain p-2" />
                    <button 
                        type="button"
                        onClick={() => setBrand({...brand, logo: ""})}
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
              value={brand.description} 
              onChange={e => setBrand({...brand, description: e.target.value})} 
              rows={3}
            />
          </div>
        </form>
      </div>

      {showMediaPicker && (
        <MediaPicker 
            onSelect={(url) => {
                setBrand({ ...brand, logo: url });
                setShowMediaPicker(false);
            }}
            onClose={() => setShowMediaPicker(false)}
        />
      )}
    </div>
  );
}
