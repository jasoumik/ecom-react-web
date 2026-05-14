"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button, Heading } from "@/components/ui";
import { Input } from "@/components/ui/Input";
import { API_URL } from "@/lib/config";
import { useToast } from "@/components/ui/Toast";
import { FlagIcon, FLAGS } from "@/components/ui/FlagIcon";

export default function EditCountryPage() {
  const [country, setCountry] = useState<any>(null);
  const router = useRouter();
  const params = useParams();
  const { addToast } = useToast();
  const id = params.id as string;

  useEffect(() => {
    fetch(`${API_URL}/countries/${id}`)
      .then(res => res.json())
      .then(setCountry)
      .catch(console.error);
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        const res = await fetch(`${API_URL}/countries/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(country),
        });
        
        if (res.ok) {
            addToast("Country updated successfully", "success");
            router.push("/admin/countries");
        } else {
            addToast("Failed to update country", "error");
        }
    } catch (e) {
        addToast("Error updating country", "error");
    }
  };

  if (!country) return <div>Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <Heading size="md" className="font-sans text-slate-900 dark:text-white">Edit Country</Heading>
        <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => router.back()} className="rounded-lg py-2 px-4 text-sm h-auto">Cancel</Button>
            <Button type="submit" form="edit-country-form" className="rounded-lg shadow-md shadow-sky-500/20 py-2 px-6 text-sm h-auto">Update Country</Button>
        </div>
      </div>
      
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
        <form id="edit-country-form" onSubmit={handleUpdate} className="space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3 mb-2">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Country Details</h3>
              <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                        type="checkbox" 
                        checked={country.is_active} 
                        onChange={e => setCountry({...country, is_active: e.target.checked})}
                        className="w-4 h-4 rounded border-slate-300 text-sky-500 focus:ring-sky-500"
                    />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Active</span>
                </label>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Input label="Country Name (English)" value={country.name} onChange={e => setCountry({...country, name: e.target.value})} required className="bg-slate-50/50 dark:bg-slate-800/50" />
            <Input label="Country Name (Bangla)" value={country.name_bn || ""} onChange={e => setCountry({...country, name_bn: e.target.value})} className="bg-slate-50/50 dark:bg-slate-800/50" />
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Input label="ISO Code (e.g. BD)" value={country.code} onChange={e => setCountry({...country, code: e.target.value.toUpperCase()})} required maxLength={3} className="bg-slate-50/50 dark:bg-slate-800/50" />
            
            <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Flag Icon</label>
                <select 
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all dark:bg-slate-800/50 dark:border-slate-700 dark:text-white text-sm"
                    value={country.flag || ""}
                    onChange={e => setCountry({...country, flag: e.target.value})}
                >
                    <option value="">Select Flag</option>
                    {Object.keys(FLAGS).filter(k => k !== 'DEFAULT').map(code => (
                        <option key={code} value={code}>{code}</option>
                    ))}
                </select>
            </div>
          </div>

          {country.flag && (
            <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                <div className="w-16 h-10 shadow-sm rounded overflow-hidden">
                    <FlagIcon code={country.flag} className="w-full h-full" />
                </div>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Selected Flag Preview</span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
