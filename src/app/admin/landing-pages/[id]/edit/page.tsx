"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button, Heading } from "@/components/ui";
import { Input } from "@/components/ui/Input";
import { API_URL } from "@/lib/config";
import { useToast } from "@/components/ui/Toast";

export default function EditLandingPage() {
  const [page, setPage] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const router = useRouter();
  const params = useParams();
  const { addToast } = useToast();
  const id = params.id as string;

  useEffect(() => {
    fetch(`${API_URL}/landing-pages/${id}`)
      .then(res => res.json())
      .then(setPage)
      .catch(console.error);

    fetch(`${API_URL}/products?limit=100`)
      .then(res => res.json())
      .then(data => {
          const list = data.data || data;
          setProducts(Array.isArray(list) ? list : []);
      })
      .catch(console.error);
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        const res = await fetch(`${API_URL}/landing-pages/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(page),
        });
        
        if (res.ok) {
            addToast("Landing page updated successfully", "success");
            router.push("/admin/landing-pages");
        } else {
            addToast("Failed to update page", "error");
        }
    } catch (e) {
        addToast("Error updating page", "error");
    }
  };

  if (!page) return <div>Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <Heading size="md" className="font-sans text-slate-900 dark:text-white">Edit Landing Page</Heading>
        <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => router.back()} className="rounded-lg py-2 px-4 text-sm h-auto">Cancel</Button>
            <Button type="submit" form="edit-page-form" className="rounded-lg shadow-md shadow-pink-500/20 py-2 px-6 text-sm h-auto">Update Page</Button>
        </div>
      </div>
      
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
        <form id="edit-page-form" onSubmit={handleUpdate} className="space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3 mb-2">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Page Details</h3>
              <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                        type="checkbox" 
                        checked={page.is_active} 
                        onChange={e => setPage({...page, is_active: e.target.checked})}
                        className="w-4 h-4 rounded border-slate-300 text-pink-500 focus:ring-pink-500"
                    />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Active</span>
                </label>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Input label="Page Title" value={page.title} onChange={e => setPage({...page, title: e.target.value})} required className="bg-slate-50/50 dark:bg-slate-800/50" />
            <Input label="Slug (URL)" value={page.slug} onChange={e => setPage({...page, slug: e.target.value})} required className="bg-slate-50/50 dark:bg-slate-800/50" />
          </div>
          
          <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Select Product</label>
              <select 
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-slate-900 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none transition-all dark:bg-slate-800/50 dark:border-slate-700 dark:text-white text-sm"
                  value={page.product_id}
                  onChange={e => setPage({...page, product_id: e.target.value})}
                  required
              >
                  <option value="">Select a Product</option>
                  {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
              </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Custom Description (Optional)</label>
            <textarea 
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none transition-all dark:bg-slate-800/50 dark:border-slate-700 dark:text-white dark:placeholder-slate-500 text-sm"
              value={page.description || ""} 
              onChange={e => setPage({...page, description: e.target.value})} 
              rows={4}
            />
          </div>

          <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Theme</label>
              <select 
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-slate-900 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none transition-all dark:bg-slate-800/50 dark:border-slate-700 dark:text-white text-sm"
                  value={page.theme || "default"}
                  onChange={e => setPage({...page, theme: e.target.value})}
              >
                  <option value="default">Default</option>
                  <option value="dark">Dark Mode</option>
                  <option value="festive">Festive</option>
                  <option value="minimal">Minimal</option>
              </select>
          </div>
        </form>
      </div>
    </div>
  );
}
