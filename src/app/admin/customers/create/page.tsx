"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Heading } from "@/components/ui";
import { Input } from "@/components/ui/Input";
import { API_URL } from "@/lib/config";
import { useToast } from "@/components/ui/Toast";

export default function CreateCustomerPage() {
  const [newCustomer, setNewCustomer] = useState({ name: "", phone: "", email: "", password: "" });
  const router = useRouter();
  const { addToast } = useToast();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        const res = await fetch(`${API_URL}/users`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...newCustomer, role: 'customer' }),
        });
        
        if (res.ok) {
            addToast("Customer created successfully", "success");
            router.push("/admin/customers");
        } else {
            const err = await res.json();
            addToast(err.message || "Failed to create customer", "error");
        }
    } catch (e) {
        addToast("Error creating customer", "error");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <Heading size="md" className="font-sans text-slate-900 dark:text-white">Add Customer</Heading>
        <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => router.back()} className="rounded-lg py-2 px-4 text-sm h-auto">Cancel</Button>
            <Button type="submit" form="customer-form" className="rounded-lg shadow-md shadow-sky-500/20 py-2 px-6 text-sm h-auto">Save Customer</Button>
        </div>
      </div>
      
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
        <form id="customer-form" onSubmit={handleCreate} className="space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3 mb-2">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Customer Details</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Input label="Full Name" value={newCustomer.name} onChange={e => setNewCustomer({...newCustomer, name: e.target.value})} required className="bg-slate-50/50" />
            <Input label="Phone Number" value={newCustomer.phone} onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})} required className="bg-slate-50/50" />
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Input label="Email Address" value={newCustomer.email} onChange={e => setNewCustomer({...newCustomer, email: e.target.value})} className="bg-slate-50/50" />
            <Input label="Password" type="password" value={newCustomer.password} onChange={e => setNewCustomer({...newCustomer, password: e.target.value})} placeholder="Optional (Default: 123456)" className="bg-slate-50/50" />
          </div>
        </form>
      </div>
    </div>
  );
}
