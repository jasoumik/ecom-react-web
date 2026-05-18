"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Heading } from "@/components/ui";
import { Input } from "@/components/ui/Input";
import { API_URL } from "@/lib/config";
import { useToast } from "@/components/ui/Toast";
import { MediaPicker } from "@/components/ui/MediaPicker";

export default function CreatePromisePage() {
  const [newPromise, setNewPromise] = useState({ title: "", title_bn: "", description: "", description_bn: "", icon: "", order: "0", is_active: true });
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const router = useRouter();
  const { addToast } = useToast();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        const res = await fetch(`${API_URL}/promises`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...newPromise, order: parseInt(newPromise.order) }),
        });
        
        if (res.ok) {
            addToast("Promise created successfully", "success");
            router.push("/admin/promises");
        } else {
            addToast("Failed to create promise", "error");
        }
    } catch (e) {
        addToast("Error creating promise", "error");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <Heading size="md" className="font-sans text-slate-900 dark:text-white">Add Promise</Heading>
        <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => router.back()} className="rounded-lg py-2 px-4 text-sm h-auto">Cancel</Button>
            <Button type="submit" form="promise-form" className="rounded-lg shadow-md shadow-pink-500/20 py-2 px-6 text-sm h-auto">Save Promise</Button>
        </div>
      </div>
      
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
        <form id="promise-form" onSubmit={handleCreate} className="space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3 mb-2">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Promise Details</h3>
              <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                        type="checkbox" 
                        checked={newPromise.is_active} 
                        onChange={e => setNewPromise({...newPromise, is_active: e.target.checked})}
                        className="w-4 h-4 rounded border-slate-300 text-pink-500 focus:ring-pink-500"
                    />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Active</span>
                </label>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Input label="Title (English)" value={newPromise.title} onChange={e => setNewPromise({...newPromise, title: e.target.value})} required className="bg-slate-50/50" />
            <Input label="Title (Bangla)" value={newPromise.title_bn} onChange={e => setNewPromise({...newPromise, title_bn: e.target.value})} className="bg-slate-50/50" />
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Description (English)</label>
                <textarea 
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-slate-500 text-sm"
                value={newPromise.description} 
                onChange={e => setNewPromise({...newPromise, description: e.target.value})} 
                required 
                rows={3}
                />
            </div>
            <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Description (Bangla)</label>
                <textarea 
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-slate-500 text-sm"
                value={newPromise.description_bn} 
                onChange={e => setNewPromise({...newPromise, description_bn: e.target.value})} 
                rows={3}
                />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Icon (Emoji or URL)</label>
            <div className="flex gap-2">
                <Input 
                    className="flex-1 bg-slate-50/50 text-sm" 
                    value={newPromise.icon} 
                    onChange={e => setNewPromise({...newPromise, icon: e.target.value})} 
                    required 
                    placeholder="e.g. 🛡️ or https://..."
                />
                <Button type="button" variant="secondary" onClick={() => setShowMediaPicker(true)} className="rounded-lg py-2 px-3 text-xs h-auto">Select Image</Button>
            </div>
          </div>

          <div className="w-1/3">
            <Input label="Order" type="number" value={newPromise.order} onChange={e => setNewPromise({...newPromise, order: e.target.value})} className="bg-slate-50/50" />
          </div>
        </form>
      </div>

      {showMediaPicker && (
        <MediaPicker 
            onSelect={(url) => {
                setNewPromise({ ...newPromise, icon: url });
                setShowMediaPicker(false);
            }}
            onClose={() => setShowMediaPicker(false)}
        />
      )}
    </div>
  );
}
