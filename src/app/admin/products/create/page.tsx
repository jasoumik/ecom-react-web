"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, Heading } from "@/components/ui";
import { Input } from "@/components/ui/Input";
import { API_URL } from "@/lib/config";
import { useToast } from "@/components/ui/Toast";
import { MediaPicker } from "@/components/ui/MediaPicker";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { getImageUrl } from "@/lib/utils";
import { SearchableSelect } from "@/components/ui/SearchableSelect";

const STORAGE_KEY = "create_product_draft";

export default function CreateProductPage() {
  const [newProduct, setNewProduct] = useState({ 
      name: "", name_bn: "", price: "", old_price: "", cost_price: "", description: "", description_bn: "", images: "", category_id: "", brand_id: "", stock: "", sku: "",
      size: "", weight: "", color: "", material: "", is_active: true, country_id: "", age_groups: [] as string[]
  });
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [ageGroups, setAgeGroups] = useState<any[]>([]);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const router = useRouter();
  const { addToast } = useToast();

  // Load from local storage on mount
  useEffect(() => {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
          try {
              setNewProduct(JSON.parse(saved));
          } catch (e) {
              console.error("Failed to parse saved draft", e);
          }
      }
      setIsLoaded(true);
  }, []);

  // Save to local storage on change
  useEffect(() => {
      if (!isLoaded) return;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProduct));
  }, [newProduct, isLoaded]);

  useEffect(() => {
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

    fetch(`${API_URL}/brands`)
      .then(res => res.json())
      .then(data => setBrands(Array.isArray(data) ? data : []))
      .catch(console.error);

    fetch(`${API_URL}/countries`)
      .then(res => res.json())
      .then(data => setCountries(Array.isArray(data) ? data : []))
      .catch(console.error);

    fetch(`${API_URL}/age-groups`)
      .then(res => res.json())
      .then(data => setAgeGroups(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const imagesArray = newProduct.images.split(",").map(s => s.trim()).filter(Boolean);
    
    const payload: any = { 
        ...newProduct, 
        images: imagesArray,
        price: parseFloat(newProduct.price) || 0,
        stock: parseInt(newProduct.stock) || 0,
        old_price: newProduct.old_price ? parseFloat(newProduct.old_price) : null,
        cost_price: newProduct.cost_price ? parseFloat(newProduct.cost_price) : null,
    };

    if (!payload.brand_id) delete payload.brand_id;
    if (!payload.country_id) delete payload.country_id;
    if (!payload.category_id) delete payload.category_id;
    
    try {
        const res = await fetch(`${API_URL}/products`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        
        if (res.ok) {
            addToast("Product created successfully", "success");
            localStorage.removeItem(STORAGE_KEY); // Clear draft
            router.push("/admin/products");
        } else {
            const errorData = await res.json();
            addToast(errorData.message || "Failed to create product", "error");
        }
    } catch (e) {
        addToast("Error creating product", "error");
    }
  };

  const toggleAgeGroup = (id: string) => {
      setNewProduct(prev => {
          const exists = prev.age_groups.includes(id);
          return {
              ...prev,
              age_groups: exists 
                  ? prev.age_groups.filter(g => g !== id)
                  : [...prev.age_groups, id]
          };
      });
  };

  // Prepare options for SearchableSelect
  const categoryOptions = categories.map(cat => ({
      label: `${'\u00A0'.repeat(cat.level * 4)}${cat.name}`,
      value: cat.id
  }));

  const brandOptions = brands.map(brand => ({
      label: brand.name,
      value: brand.id
  }));

  const countryOptions = countries.map(country => ({
      label: country.name,
      value: country.id
  }));

  if (!isLoaded) return null; // Prevent hydration mismatch or flash of empty content

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sticky top-0 z-10 bg-slate-50/80 dark:bg-black/80 backdrop-blur-md py-4 -mx-4 px-4 border-b border-slate-200/50 dark:border-slate-800/50">
        <div>
            <Heading size="lg" className="font-sans text-slate-900 dark:text-white">Add Product</Heading>
            <p className="text-sm text-slate-500 dark:text-slate-400">Create a new product in your catalog</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
            <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1 sm:flex-none rounded-lg py-2.5 px-4 text-sm h-auto">Cancel</Button>
            <Button type="submit" form="product-form" className="flex-1 sm:flex-none rounded-lg shadow-lg shadow-sky-500/20 py-2.5 px-6 text-sm h-auto font-bold">Save Product</Button>
        </div>
      </div>
      
      <form id="product-form" onSubmit={handleCreate} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Main Info */}
        <div className="lg:col-span-2 space-y-8">
            {/* Basic Info Section */}
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="w-1 h-6 bg-sky-500 rounded-full"></span>
                        Basic Information
                    </h3>
                    <label className="flex items-center gap-2 cursor-pointer bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700">
                        <input 
                            type="checkbox" 
                            checked={newProduct.is_active} 
                            onChange={e => setNewProduct({...newProduct, is_active: e.target.checked})}
                            className="w-4 h-4 rounded border-slate-300 text-sky-500 focus:ring-sky-500"
                        />
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Active Status</span>
                    </label>
                </div>
                
                <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <Input label="Product Name (English)" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} required className="bg-slate-50/50 dark:bg-slate-800/50" placeholder="e.g. Premium Baby Diapers" />
                        <Input label="Product Name (Bangla)" value={newProduct.name_bn} onChange={e => setNewProduct({...newProduct, name_bn: e.target.value})} className="bg-slate-50/50 dark:bg-slate-800/50" placeholder="e.g. প্রিমিয়াম বেবি ডায়াপার" />
                    </div>
                    
                    <div className="space-y-6">
                        <RichTextEditor
                          label="Description (English)"
                          value={newProduct.description}
                          onChange={(val) => setNewProduct({ ...newProduct, description: val })}
                          className="w-full"
                        />
                        <RichTextEditor
                          label="Description (Bangla)"
                          value={newProduct.description_bn}
                          onChange={(val) => setNewProduct({ ...newProduct, description_bn: val })}
                          className="w-full"
                        />
                    </div>
                </div>
            </div>

            {/* Pricing & Inventory Section */}
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-4 mb-6 flex items-center gap-2">
                    <span className="w-1 h-6 bg-emerald-500 rounded-full"></span>
                    Pricing & Inventory
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Input label="Selling Price" type="number" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} required className="bg-slate-50/50 dark:bg-slate-800/50 font-medium" placeholder="0.00" />
                    <Input label="Old Price (Compare At)" type="number" value={newProduct.old_price} onChange={e => setNewProduct({...newProduct, old_price: e.target.value})} className="bg-slate-50/50 dark:bg-slate-800/50" placeholder="0.00" />
                    <Input label="Cost Price (Internal)" type="number" value={newProduct.cost_price} onChange={e => setNewProduct({...newProduct, cost_price: e.target.value})} className="bg-slate-50/50 dark:bg-slate-800/50" placeholder="0.00" />
                    <Input label="Initial Stock" type="number" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} required className="bg-slate-50/50 dark:bg-slate-800/50" placeholder="0" />
                    <Input label="SKU (Stock Keeping Unit)" value={newProduct.sku} onChange={e => setNewProduct({...newProduct, sku: e.target.value})} className="bg-slate-50/50 dark:bg-slate-800/50" placeholder="e.g. PROD-001" />
                </div>
            </div>

            {/* Attributes Section */}
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-4 mb-6 flex items-center gap-2">
                    <span className="w-1 h-6 bg-purple-500 rounded-full"></span>
                    Attributes
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Input label="Size" placeholder="e.g. M, L, XL" value={newProduct.size} onChange={e => setNewProduct({...newProduct, size: e.target.value})} className="bg-slate-50/50 dark:bg-slate-800/50" />
                    <Input label="Weight" placeholder="e.g. 500g" value={newProduct.weight} onChange={e => setNewProduct({...newProduct, weight: e.target.value})} className="bg-slate-50/50 dark:bg-slate-800/50" />
                    <Input label="Color" placeholder="e.g. Red" value={newProduct.color} onChange={e => setNewProduct({...newProduct, color: e.target.value})} className="bg-slate-50/50 dark:bg-slate-800/50" />
                    <Input label="Material" placeholder="e.g. Cotton" value={newProduct.material} onChange={e => setNewProduct({...newProduct, material: e.target.value})} className="bg-slate-50/50 dark:bg-slate-800/50" />
                </div>
            </div>
        </div>

        {/* Right Column: Organization & Media */}
        <div className="lg:col-span-1 space-y-8">
            {/* Organization Section */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-4 mb-6 flex items-center gap-2">
                    <span className="w-1 h-6 bg-orange-500 rounded-full"></span>
                    Organization
                </h3>
                <div className="space-y-6">
                    <SearchableSelect
                        label="Category"
                        options={categoryOptions}
                        value={newProduct.category_id}
                        onChange={(val) => setNewProduct({...newProduct, category_id: val})}
                        placeholder="Select Category"
                        required
                    />
                    
                    <SearchableSelect
                        label="Brand"
                        options={brandOptions}
                        value={newProduct.brand_id}
                        onChange={(val) => setNewProduct({...newProduct, brand_id: val})}
                        placeholder="Select Brand"
                    />

                    <SearchableSelect
                        label="Country of Origin"
                        options={countryOptions}
                        value={newProduct.country_id}
                        onChange={(val) => setNewProduct({...newProduct, country_id: val})}
                        placeholder="Select Country"
                    />
                    
                    {/* Age Groups Selection */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Shop by Age</label>
                        <div className="space-y-2 max-h-60 overflow-y-auto p-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-800/50">
                            {ageGroups.map(group => (
                                <label key={group.id} className="flex items-center gap-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 p-2 rounded-lg transition-colors">
                                    <input 
                                        type="checkbox" 
                                        checked={newProduct.age_groups.includes(group.id)}
                                        onChange={() => toggleAgeGroup(group.id)}
                                        className="w-4 h-4 rounded border-slate-300 text-sky-500 focus:ring-sky-500"
                                    />
                                    <span className="text-sm text-slate-700 dark:text-slate-300">{group.label} <span className="text-slate-400 text-xs">({group.age_range})</span></span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Media Section */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-4 mb-6 flex items-center gap-2">
                    <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                    Media
                </h3>
                <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Product Images</label>
                    <div className="flex gap-2 mb-4">
                        <Input 
                            className="flex-1 bg-slate-50/50 dark:bg-slate-800/50 text-sm" 
                            value={newProduct.images} 
                            onChange={e => setNewProduct({...newProduct, images: e.target.value})} 
                            placeholder="Image URLs..."
                        />
                        <Button type="button" variant="secondary" onClick={() => setShowMediaPicker(true)} className="rounded-lg py-2 px-4 text-xs h-auto">Select</Button>
                    </div>
                    {newProduct.images && (
                        <div className="grid grid-cols-3 gap-3">
                            {newProduct.images.split(',').map((img: string, i: number) => (
                                <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group bg-slate-50 dark:bg-slate-800">
                                    <img src={getImageUrl(img.trim())} alt="Preview" className="w-full h-full object-cover" />
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            const newImages = newProduct.images.split(',').map(s => s.trim()).filter((_, idx) => idx !== i).join(', ');
                                            setNewProduct({...newProduct, images: newImages});
                                        }}
                                        className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-all shadow-md hover:bg-red-600"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
      </form>

      {showMediaPicker && (
        <MediaPicker 
            onSelect={(url) => {
                const currentImages = newProduct.images ? newProduct.images.split(',').map(s => s.trim()).filter(Boolean) : [];
                setNewProduct({ ...newProduct, images: [...currentImages, url].join(', ') });
                setShowMediaPicker(false);
            }}
            onClose={() => setShowMediaPicker(false)}
        />
      )}
    </div>
  );
}
