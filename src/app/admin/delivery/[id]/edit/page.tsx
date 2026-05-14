"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button, Heading } from "@/components/ui";
import { Input } from "@/components/ui/Input";
import { API_URL } from "@/lib/config";
import { useToast } from "@/components/ui/Toast";

export default function EditDeliveryChargePage() {
  const [charge, setCharge] = useState<any>(null);
  const router = useRouter();
  const params = useParams();
  const { addToast } = useToast();
  const id = params.id as string;

  useEffect(() => {
    fetch(`${API_URL}/delivery/${id}`)
      .then(res => res.json())
      .then(setCharge)
      .catch(console.error);
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        const res = await fetch(`${API_URL}/delivery/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(charge),
        });
        
        if (res.ok) {
            addToast("Delivery charge updated successfully", "success");
            router.push("/admin/delivery");
        } else {
            addToast("Failed to update delivery charge", "error");
        }
    } catch (e) {
        addToast("Error updating delivery charge", "error");
    }
  };

  if (!charge) return <div>Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <Heading size="md" className="font-sans text-slate-900 dark:text-white">Edit Delivery Charge</Heading>
        <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => router.back()} className="rounded-lg py-2 px-4 text-sm h-auto">Cancel</Button>
            <Button type="submit" form="edit-delivery-form" className="rounded-lg shadow-md shadow-sky-500/20 py-2 px-6 text-sm h-auto">Update Charge</Button>
        </div>
      </div>
      
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
        <form id="edit-delivery-form" onSubmit={handleUpdate} className="space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3 mb-2">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Charge Details</h3>
              <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                        type="checkbox" 
                        checked={charge.is_active} 
                        onChange={e => setCharge({...charge, is_active: e.target.checked})}
                        className="w-4 h-4 rounded border-slate-300 text-sky-500 focus:ring-sky-500"
                    />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Active</span>
                </label>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Input label="Name (English)" value={charge.name} onChange={e => setCharge({...charge, name: e.target.value})} required className="bg-slate-50/50" />
            <Input label="Name (Bangla)" value={charge.name_bn || ""} onChange={e => setCharge({...charge, name_bn: e.target.value})} className="bg-slate-50/50" />
          </div>
          
          <Input label="Amount" type="number" value={charge.amount} onChange={e => setCharge({...charge, amount: e.target.value})} required className="bg-slate-50/50" />
        </form>
      </div>
    </div>
  );
}
