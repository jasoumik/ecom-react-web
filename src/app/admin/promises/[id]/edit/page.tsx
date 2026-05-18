"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button, Heading } from "@/components/ui";
import { Input } from "@/components/ui/Input";
import { API_URL } from "@/lib/config";
import { useToast } from "@/components/ui/Toast";
import { MediaPicker } from "@/components/ui/MediaPicker";

export default function EditPromisePage() {
  const [promise, setPromise] = useState<any>(null);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const router = useRouter();
  const params = useParams();
  const { addToast } = useToast();
  const id = params.id as string;

  useEffect(() => {
    fetch(`${API_URL}/promises/${id}`)
      .then(res => res.json())
      .then(setPromise)
      .catch(console.error);
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        const res = await fetch(`${API_URL}/promises/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...promise, order: parseInt(promise.order) }),
        });
        
        if (res.ok) {
            addToast("Promise updated successfully", "success");
            router.push("/admin/promises");
        } else {
            addToast("Failed to update promise", "error");
        }
    } catch (e) {
        addToast("Error updating promise", "error");
    }
  };

  if (!promise) return <div>Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <Heading size="md" className="font-sans text-slate-900 dark:text-white">Edit Promise</Heading>
        <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => router.back()} className="rounded-lg py-2 px-4 text-sm h-auto">Cancel</Button>
            <Button type="submit" form="edit-promise-form" className="rounded-lg shadow-md shadow-pink-500/20 py-2 px-6 text-sm h-auto">Update Promise</Button>
        </div>
      </div>
      
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
        <form id="edit-promise-form" onSubmit={handleUpdate} className="space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3 mb-2">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Promise Details</h3>
              <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                        type="checkbox" 
                        checked={promise.is_active} 
                        onChange={e => setPromise({...promise, is_active: e.target.checked})}
                        className="w-4 h-4 rounded border-slate-300 text-pink-500 focus:ring-pink-500"
                    />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Active</span>
                </label>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Input label="Title (English)" value={promise.title} onChange={e => setPromise({...promise, title: e.target.value})} required className="bg-slate-50/50" />
            <Input label="Title (Bangla)" value={promise.title_bn || ""} onChange={e => setPromise({...promise, title_bn: e.target.value})} className="bg-slate-50/50" />
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Description (English)</label>
                <textarea 
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-slate-500 text-sm"
                value={promise.description} 
                onChange={e => setPromise({...promise, description: e.target.value})} 
                required 
                rows={3}
                />
            </div>
            <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Description (Bangla)</label>
                <textarea 
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-slate-500 text-sm"
                value={promise.description_bn || ""} 
                onChange={e => setPromise({...promise, description_bn: e.target.value})} 
                rows={3}
                />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Icon (Emoji or URL)</label>
            <div className="flex gap-2">
                <Input 
                    className="flex-1 bg-slate-50/50 text-sm" 
                    value={promise.icon} 
                    onChange={e => setPromise({...promise, icon: e.target.value})} 
                    required 
                    placeholder="e.g. 🛡️ or https://..."
                />
                <Button type="button" variant="secondary" onClick={() => setShowMediaPicker(true)} className="rounded-lg py-2 px-3 text-xs h-auto">Select Image</Button>
            </div>
          </div>

          <div className="w-1/3">
            <Input label="Order" type="number" value={promise.order} onChange={e => setPromise({...promise, order: e.target.value})} className="bg-slate-50/50" />
          </div>
        </form>
      </div>

      {showMediaPicker && (
        <MediaPicker 
            onSelect={(url) => {
                setPromise({ ...promise, icon: url });
                setShowMediaPicker(false);
            }}
            onClose={() => setShowMediaPicker(false)}
        />
      )}
    </div>
  );
}
