"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, Heading } from "@/components/ui";
import { Input } from "@/components/ui/Input";
import { API_URL } from "@/lib/config";
import { useToast } from "@/components/ui/Toast";
import { MediaPicker } from "@/components/ui/MediaPicker";
import { getImageUrl } from "@/lib/utils";

interface AgeGroup {
  id: string;
  label: string;
  label_bn?: string;
  age_range: string;
  icon: string;
}

export default function CreateCategoryPage() {
  const [newCategory, setNewCategory] = useState({ name: "", name_bn: "", description: "", description_bn: "", image: "", banner_image: "", parent_id: "", age_group_id: "", mother_category_id: "", is_active: true });
  const [categories, setCategories] = useState<any[]>([]);
  const [ageGroups, setAgeGroups] = useState<AgeGroup[]>([]);
  const [motherCategories, setMotherCategories] = useState<any[]>([]);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<'image' | 'banner_image'>('image');
  const router = useRouter();
  const { addToast } = useToast();

  useEffect(() => {
    // Fetch categories
    fetch(`${API_URL}/categories`)
      .then(res => res.json())
      .then(data => {
          const flatten = (cats: any[], level = 0): any[] => {
              return cats.reduce((acc, cat) => {
                  acc.push({ ...cat, level });
                  if (cat.children) acc.push(...flatten(cat.children, level + 1));
                  return acc;
              }, []);
          };
          setCategories(flatten(Array.isArray(data) ? data : []));
      })
      .catch(console.error);

    // Fetch age groups
    fetch(`${API_URL}/age-groups`)
      .then(res => res.json())
      .then(data => {
          if (Array.isArray(data)) {
            setAgeGroups(data);
          }
      })
      .catch(console.error);

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
        const payload = { ...newCategory };
        if (!payload.parent_id) delete (payload as any).parent_id;
        if (!payload.age_group_id) delete (payload as any).age_group_id;
        if (!payload.mother_category_id) delete (payload as any).mother_category_id;

        const res = await fetch(`${API_URL}/categories`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        
        if (res.ok) {
            addToast("Category created successfully", "success");
            router.push("/admin/categories");
        } else {
            addToast("Failed to create category", "error");
        }
    } catch (e) {
        addToast("Error creating category", "error");
    }
  };

  const openMediaPicker = (target: 'image' | 'banner_image') => {
      setMediaPickerTarget(target);
      setShowMediaPicker(true);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <Heading size="md" className="font-sans text-slate-900 dark:text-white">Add Category</Heading>
        <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => router.back()} className="rounded-lg py-2 px-4 text-sm h-auto">Cancel</Button>
            <Button type="submit" form="category-form" className="rounded-lg shadow-md shadow-sky-500/20 py-2 px-6 text-sm h-auto">Save Category</Button>
        </div>
      </div>
      
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
        <form id="category-form" onSubmit={handleCreate} className="space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3 mb-2">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Category Details</h3>
              <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                        type="checkbox" 
                        checked={newCategory.is_active} 
                        onChange={e => setNewCategory({...newCategory, is_active: e.target.checked})}
                        className="w-4 h-4 rounded border-slate-300 text-sky-500 focus:ring-sky-500"
                    />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Active</span>
                </label>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Input label="Name (English)" value={newCategory.name} onChange={e => setNewCategory({...newCategory, name: e.target.value})} required className="bg-slate-50/50 dark:bg-slate-800/50" />
            <Input label="Name (Bangla)" value={newCategory.name_bn} onChange={e => setNewCategory({...newCategory, name_bn: e.target.value})} className="bg-slate-50/50 dark:bg-slate-800/50" />
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Parent Category</label>
                <select 
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all dark:bg-slate-800/50 dark:border-slate-700 dark:text-white text-sm"
                    value={newCategory.parent_id}
                    onChange={e => setNewCategory({...newCategory, parent_id: e.target.value})}
                >
                    <option value="">None (Root Category)</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>
                            {'\u00A0'.repeat(cat.level * 4)}{cat.name}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Mother Category</label>
                <select 
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all dark:bg-slate-800/50 dark:border-slate-700 dark:text-white text-sm"
                    value={newCategory.mother_category_id}
                    onChange={e => setNewCategory({...newCategory, mother_category_id: e.target.value})}
                >
                    <option value="">None</option>
                    {motherCategories.map(mc => (
                        <option key={mc.id} value={mc.id}>
                            {mc.name}
                        </option>
                    ))}
                </select>
            </div>
          </div>

          <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Shop by Age Group</label>
              <select
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all dark:bg-slate-800/50 dark:border-slate-700 dark:text-white text-sm"
                  value={newCategory.age_group_id}
                  onChange={e => setNewCategory({...newCategory, age_group_id: e.target.value})}
              >
                  <option value="">None</option>
                  {ageGroups.map(ag => (
                      <option key={ag.id} value={ag.id}>
                          {ag.icon} {ag.label} ({ag.age_range})
                      </option>
                  ))}
              </select>
              <p className="text-[10px] text-slate-500 mt-1">Optional: Link this category to an age group for "Shop by Age"</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Icon/Thumbnail (Small)</label>
                <div className="flex gap-2">
                    <Input 
                        className="flex-1 bg-slate-50/50 dark:bg-slate-800/50 text-sm" 
                        value={newCategory.image} 
                        onChange={e => setNewCategory({...newCategory, image: e.target.value})} 
                        placeholder="Image URL..."
                    />
                    <Button type="button" variant="secondary" onClick={() => openMediaPicker('image')} className="rounded-lg py-2 px-3 text-xs h-auto">Select</Button>
                </div>
                {newCategory.image && (
                    <div className="mt-2 relative w-24 h-24 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group bg-slate-50 dark:bg-slate-800">
                        <img src={getImageUrl(newCategory.image)} alt="Preview" className="w-full h-full object-contain p-2" />
                        <button 
                            type="button"
                            onClick={() => setNewCategory({...newCategory, image: ""})}
                            className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-all shadow-md hover:bg-red-600"
                        >
                            ✕
                        </button>
                    </div>
                )}
            </div>
            <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Banner Image (Large)</label>
                <div className="flex gap-2">
                    <Input 
                        className="flex-1 bg-slate-50/50 dark:bg-slate-800/50 text-sm" 
                        value={newCategory.banner_image} 
                        onChange={e => setNewCategory({...newCategory, banner_image: e.target.value})} 
                        placeholder="Banner URL..."
                    />
                    <Button type="button" variant="secondary" onClick={() => openMediaPicker('banner_image')} className="rounded-lg py-2 px-3 text-xs h-auto">Select</Button>
                </div>
                {newCategory.banner_image && (
                    <div className="mt-2 relative w-full h-24 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group bg-slate-50 dark:bg-slate-800">
                        <img src={getImageUrl(newCategory.banner_image)} alt="Preview" className="w-full h-full object-cover" />
                        <button 
                            type="button"
                            onClick={() => setNewCategory({...newCategory, banner_image: ""})}
                            className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-all shadow-md hover:bg-red-600"
                        >
                            ✕
                        </button>
                    </div>
                )}
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Description (English)</label>
                <textarea 
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all dark:bg-slate-800/50 dark:border-slate-700 dark:text-white dark:placeholder-slate-500 text-sm"
                value={newCategory.description} 
                onChange={e => setNewCategory({...newCategory, description: e.target.value})} 
                rows={3}
                />
            </div>
            <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Description (Bangla)</label>
                <textarea 
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all dark:bg-slate-800/50 dark:border-slate-700 dark:text-white dark:placeholder-slate-500 text-sm"
                value={newCategory.description_bn} 
                onChange={e => setNewCategory({...newCategory, description_bn: e.target.value})} 
                rows={3}
                />
            </div>
          </div>
        </form>
      </div>

      {showMediaPicker && (
        <MediaPicker 
            onSelect={(url) => {
                setNewCategory({ ...newCategory, [mediaPickerTarget]: url });
                setShowMediaPicker(false);
            }}
            onClose={() => setShowMediaPicker(false)}
        />
      )}
    </div>
  );
}
