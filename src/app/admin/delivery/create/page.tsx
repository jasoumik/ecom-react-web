"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Heading } from "@/components/ui";
import { Input } from "@/components/ui/Input";
import { API_URL } from "@/lib/config";
import { useToast } from "@/components/ui/Toast";

export default function CreateDeliveryChargePage() {
  const [newCharge, setNewCharge] = useState({ name: "", name_bn: "", amount: "", is_active: true });
  const router = useRouter();
  const { addToast } = useToast();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        const res = await fetch(`${API_URL}/delivery`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newCharge),
        });
        
        if (res.ok) {
            addToast("Delivery charge created successfully", "success");
            router.push("/admin/delivery");
        } else {
            addToast("Failed to create delivery charge", "error");
        }
    } catch (e) {
        addToast("Error creating delivery charge", "error");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <Heading size="md" className="font-sans text-slate-900 dark:text-white">Add Delivery Charge</Heading>
        <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => router.back()} className="rounded-lg py-2 px-4 text-sm h-auto">Cancel</Button>
            <Button type="submit" form="delivery-form" className="rounded-lg shadow-md shadow-sky-500/20 py-2 px-6 text-sm h-auto">Save Charge</Button>
        </div>
      </div>
      
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
        <form id="delivery-form" onSubmit={handleCreate} className="space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3 mb-2">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Charge Details</h3>
              <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                        type="checkbox" 
                        checked={newCharge.is_active} 
                        onChange={e => setNewCharge({...newCharge, is_active: e.target.checked})}
                        className="w-4 h-4 rounded border-slate-300 text-sky-500 focus:ring-sky-500"
                    />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Active</span>
                </label>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Input label="Name (English)" value={newCharge.name} onChange={e => setNewCharge({...newCharge, name: e.target.value})} required className="bg-slate-50/50" />
            <Input label="Name (Bangla)" value={newCharge.name_bn} onChange={e => setNewCharge({...newCharge, name_bn: e.target.value})} className="bg-slate-50/50" />
          </div>
          
          <Input label="Amount" type="number" value={newCharge.amount} onChange={e => setNewCharge({...newCharge, amount: e.target.value})} required className="bg-slate-50/50" />
        </form>
      </div>
    </div>
  );
}
