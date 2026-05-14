"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Heading } from "@/components/ui";
import { Input } from "@/components/ui/Input";
import { API_URL } from "@/lib/config";
import { useToast } from "@/components/ui/Toast";
import { FlagIcon, FLAGS } from "@/components/ui/FlagIcon";

export default function CreateCountryPage() {
  const [newCountry, setNewCountry] = useState({ name: "", name_bn: "", code: "", flag: "", is_active: true });
  const router = useRouter();
  const { addToast } = useToast();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        const res = await fetch(`${API_URL}/countries`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newCountry),
        });
        
        if (res.ok) {
            addToast("Country created successfully", "success");
            router.push("/admin/countries");
        } else {
            addToast("Failed to create country", "error");
        }
    } catch (e) {
        addToast("Error creating country", "error");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <Heading size="md" className="font-sans text-slate-900 dark:text-white">Add Country</Heading>
        <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => router.back()} className="rounded-lg py-2 px-4 text-sm h-auto">Cancel</Button>
            <Button type="submit" form="country-form" className="rounded-lg shadow-md shadow-sky-500/20 py-2 px-6 text-sm h-auto">Save Country</Button>
        </div>
      </div>
      
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
        <form id="country-form" onSubmit={handleCreate} className="space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3 mb-2">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Country Details</h3>
              <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                        type="checkbox" 
                        checked={newCountry.is_active} 
                        onChange={e => setNewCountry({...newCountry, is_active: e.target.checked})}
                        className="w-4 h-4 rounded border-slate-300 text-sky-500 focus:ring-sky-500"
                    />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Active</span>
                </label>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Input label="Country Name (English)" value={newCountry.name} onChange={e => setNewCountry({...newCountry, name: e.target.value})} required className="bg-slate-50/50 dark:bg-slate-800/50" />
            <Input label="Country Name (Bangla)" value={newCountry.name_bn} onChange={e => setNewCountry({...newCountry, name_bn: e.target.value})} className="bg-slate-50/50 dark:bg-slate-800/50" />
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Input label="ISO Code (e.g. BD)" value={newCountry.code} onChange={e => setNewCountry({...newCountry, code: e.target.value.toUpperCase()})} required maxLength={3} className="bg-slate-50/50 dark:bg-slate-800/50" />
            
            <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Flag Icon</label>
                <select 
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all dark:bg-slate-800/50 dark:border-slate-700 dark:text-white text-sm"
                    value={newCountry.flag}
                    onChange={e => setNewCountry({...newCountry, flag: e.target.value})}
                >
                    <option value="">Select Flag</option>
                    {Object.keys(FLAGS).filter(k => k !== 'DEFAULT').map(code => (
                        <option key={code} value={code}>{code}</option>
                    ))}
                </select>
            </div>
          </div>

          {newCountry.flag && (
            <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                <div className="w-16 h-10 shadow-sm rounded overflow-hidden">
                    <FlagIcon code={newCountry.flag} className="w-full h-full" />
                </div>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Selected Flag Preview</span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
