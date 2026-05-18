"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, Heading } from "@/components/ui";
import { Input } from "@/components/ui/Input";
import { API_URL } from "@/lib/config";
import { useToast } from "@/components/ui/Toast";
import { MediaPicker } from "@/components/ui/MediaPicker";
import { getImageUrl } from "@/lib/utils";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { RichTextEditor } from "@/components/ui/RichTextEditor";

export default function CreateBundlePage() {
  const [bundle, setBundle] = useState({ 
      title: "", title_bn: "", description: "", description_bn: "", image: "", price: "", original_price: "", is_free_shipping: false, is_active: true 
  });
  const [items, setItems] = useState<{ product_id: string, variant_id?: string, quantity: number, price: number, cost_price: number }[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const router = useRouter();
  const { addToast } = useToast();

  useEffect(() => {
    fetch(`${API_URL}/products?limit=100`)
      .then(res => res.json())
      .then((data: any) => setProducts(data.data || []))
      .catch(console.error);
  }, []);

  // Calculate sum of original prices whenever items change
  useEffect(() => {
      const sum = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
      setBundle(prev => ({ ...prev, original_price: sum.toString() }));
  }, [items]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        const res = await fetch(`${API_URL}/bundles`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...bundle, items }),
        });
        
        if (res.ok) {
            addToast("Bundle created successfully", "success");
            router.push("/admin/bundles");
        } else {
            addToast("Failed to create bundle", "error");
        }
    } catch (e) {
        addToast("Error creating bundle", "error");
    }
  };

  const addItem = () => {
      setItems([...items, { product_id: "", quantity: 1, price: 0, cost_price: 0 }]);
  };

  const removeItem = (index: number) => {
      const newItems = [...items];
      newItems.splice(index, 1);
      setItems(newItems);
  };

  const updateItem = (index: number, field: string, value: any) => {
      const newItems = [...items];
      // @ts-ignore
      newItems[index][field] = value;

      // If product changed, update price and cost price
      if (field === 'product_id') {
          const product = products.find(p => p.id === value);
          if (product) {
              newItems[index].price = parseFloat(product.price);
              newItems[index].cost_price = parseFloat(product.cost_price || 0);
          }
      }

      setItems(newItems);
  };

  const productOptions = products.map((p: any) => ({
      label: p.name,
      value: p.id,
      subLabel: `Price: ৳${p.price} | Cost: ৳${p.cost_price || 0}`
  }));

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <Heading size="md" className="font-sans text-slate-900 dark:text-white">Create Bundle</Heading>
        <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => router.back()} className="rounded-lg py-2 px-4 text-sm h-auto">Cancel</Button>
            <Button type="submit" form="bundle-form" className="rounded-lg shadow-md shadow-pink-500/20 py-2 px-6 text-sm h-auto">Save Bundle</Button>
        </div>
      </div>
      
      <form id="bundle-form" onSubmit={handleCreate} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">Basic Info</h3>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={bundle.is_active} 
                            onChange={e => setBundle({...bundle, is_active: e.target.checked})}
                            className="w-4 h-4 rounded border-slate-300 text-pink-500 focus:ring-pink-500"
                        />
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Active</span>
                    </label>
                </div>
                
                <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <Input label="Title (English)" value={bundle.title} onChange={e => setBundle({...bundle, title: e.target.value})} required className="bg-slate-50/50" />
                        <Input label="Title (Bangla)" value={bundle.title_bn} onChange={e => setBundle({...bundle, title_bn: e.target.value})} className="bg-slate-50/50" />
                    </div>
                    {/* Description as big full-width editors */}
                    <div className="space-y-4">
                        <RichTextEditor
                          label="Description (English)"
                          value={bundle.description}
                          onChange={(val) => setBundle({ ...bundle, description: val })}
                          className="w-full"
                        />
                        <RichTextEditor
                          label="Description (Bangla)"
                          value={bundle.description_bn}
                          onChange={(val) => setBundle({ ...bundle, description_bn: val })}
                          className="w-full"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">Bundle Items</h3>
                    <Button type="button" onClick={addItem} className="h-8 text-xs">+ Add Item</Button>
                </div>
                
                <div className="space-y-3">
                    {items.map((item, index) => (
                        <div key={index} className="flex flex-col sm:flex-row gap-3 items-start sm:items-end bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                            <div className="flex-1 w-full sm:w-auto">
                                <label className="block text-[10px] font-bold text-slate-500 mb-1">Product</label>
                                <SearchableSelect
                                    options={productOptions}
                                    value={item.product_id}
                                    onChange={(val) => updateItem(index, 'product_id', val)}
                                    placeholder="Select Product"
                                    required
                                />
                            </div>
                            <div className="flex gap-3 w-full sm:w-auto">
                                <div className="w-20">
                                    <Input 
                                        label="Qty" 
                                        type="number" 
                                        value={item.quantity} 
                                        onChange={e => updateItem(index, 'quantity', parseInt(e.target.value))} 
                                        className="bg-white h-10"
                                    />
                                </div>
                                <div className="w-24">
                                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Price</label>
                                    <div className="h-10 px-3 py-2 rounded-lg border border-slate-200 bg-slate-100 text-sm flex items-center">
                                        ৳{item.price * item.quantity}
                                    </div>
                                </div>
                                <div className="w-24">
                                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Cost</label>
                                    <div className="h-10 px-3 py-2 rounded-lg border border-slate-200 bg-slate-100 text-sm flex items-center text-slate-500">
                                        ৳{item.cost_price * item.quantity}
                                    </div>
                                </div>
                                <button 
                                    type="button" 
                                    onClick={() => removeItem(index)}
                                    className="h-10 w-10 flex items-center justify-center text-pink-500 hover:bg-pink-50 rounded-lg transition-colors shrink-0 mt-auto"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                    ))}
                    {items.length === 0 && (
                        <p className="text-center text-sm text-slate-400 py-4">No items added to this bundle yet.</p>
                    )}
                </div>
            </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-base text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">Pricing</h3>
                <div className="space-y-4">
                    <Input label="Selling Price" type="number" value={bundle.price} onChange={e => setBundle({...bundle, price: e.target.value})} required className="bg-slate-50/50" />
                    <Input label="Original Price (Sum)" type="number" value={bundle.original_price} onChange={e => setBundle({...bundle, original_price: e.target.value})} className="bg-slate-50/50" readOnly />
                    
                    <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50/50 cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={bundle.is_free_shipping} 
                            onChange={e => setBundle({...bundle, is_free_shipping: e.target.checked})}
                            className="w-4 h-4 rounded border-slate-300 text-pink-500 focus:ring-pink-500"
                        />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Free Shipping</span>
                    </label>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-base text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">Media</h3>
                <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Bundle Image</label>
                    <div className="flex gap-2 mb-2">
                        <Input 
                            className="flex-1 bg-slate-50/50 text-sm" 
                            value={bundle.image} 
                            onChange={e => setBundle({...bundle, image: e.target.value})} 
                            placeholder="Image URL..."
                        />
                        <Button type="button" variant="secondary" onClick={() => setShowMediaPicker(true)} className="rounded-lg py-2 px-3 text-xs h-auto">Select</Button>
                    </div>
                    {bundle.image && (
                        <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                            <img src={getImageUrl(bundle.image)} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                    )}
                </div>
            </div>
        </div>
      </form>

      {showMediaPicker && (
        <MediaPicker 
            onSelect={(url) => {
                setBundle({ ...bundle, image: url });
                setShowMediaPicker(false);
            }}
            onClose={() => setShowMediaPicker(false)}
        />
      )}
    </div>
  );
}
