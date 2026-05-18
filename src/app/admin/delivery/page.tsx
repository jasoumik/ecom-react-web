"use client";

import { useEffect, useState } from "react";
import { Heading, Button } from "@/components/ui";
import { API_URL } from "@/lib/config";
import { useToast } from "@/components/ui/Toast";
import { Table } from "@/components/ui/Table";
import { FullScreenLoader } from "@/components/ui/Loader";
import { Input } from "@/components/ui/Input";

export default function AdminDeliveryPage() {
  const [charges, setCharges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCharge, setEditingCharge] = useState<any>(null);
  const [formData, setFormData] = useState({ name: "", name_bn: "", amount: "" });
  const { addToast } = useToast();

  useEffect(() => {
    fetchCharges();
  }, []);

  const fetchCharges = async () => {
    try {
      const res = await fetch(`${API_URL}/delivery`);
      const data = await res.json();
      setCharges(Array.isArray(data) ? data : []);
    } catch (e) {
      setCharges([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingCharge ? `${API_URL}/delivery/${editingCharge.id}` : `${API_URL}/delivery`;
      const method = editingCharge ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name: formData.name,
            name_bn: formData.name_bn,
            amount: parseFloat(formData.amount)
        }),
      });

      if (res.ok) {
        addToast(editingCharge ? "Updated successfully" : "Created successfully", "success");
        fetchCharges();
        closeModal();
      } else {
        addToast("Operation failed", "error");
      }
    } catch (e) {
      addToast("Error saving delivery charge", "error");
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure?")) return;
    try {
      const res = await fetch(`${API_URL}/delivery/${id}`, { method: "DELETE" });
      if (res.ok) {
        addToast("Deleted successfully", "success");
        fetchCharges();
      } else {
        addToast("Failed to delete", "error");
      }
    } catch (e) {
      addToast("Error deleting", "error");
    }
  };

  const openModal = (charge?: any) => {
    if (charge) {
      setEditingCharge(charge);
      setFormData({ name: charge.name, name_bn: charge.name_bn || "", amount: charge.amount });
    } else {
      setEditingCharge(null);
      setFormData({ name: "", name_bn: "", amount: "" });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCharge(null);
  };

  if (loading) return <FullScreenLoader />;

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
            <Heading size="md" className="font-sans text-slate-800 dark:text-white mb-0.5">Delivery Charges</Heading>
            <p className="text-xs text-slate-500">Manage shipping rates</p>
        </div>
        <Button onClick={() => openModal()} className="rounded-lg shadow-sm py-2 px-4 text-xs h-auto">
            + Add Charge
        </Button>
      </div>

      <Table
        data={charges}
        onRowClick={(charge) => openModal(charge)}
        columns={[
          {
            header: "Name (EN)",
            accessorKey: "name",
            className: "font-bold text-slate-900 dark:text-white text-xs"
          },
          {
            header: "Name (BN)",
            accessorKey: "name_bn",
            className: "text-slate-600 dark:text-slate-400 text-xs font-bengali"
          },
          {
            header: "Amount",
            cell: (charge) => <span className="font-bold text-slate-900 dark:text-white text-xs">৳{charge.amount}</span>
          },
          {
            header: "Actions",
            className: "text-right",
            cell: (charge) => (
              <div className="flex justify-end gap-1">
                  <button 
                    onClick={(e) => { e.stopPropagation(); openModal(charge); }}
                    className="p-1.5 rounded text-slate-500 hover:bg-pink-50 hover:text-pink-600 transition-colors"
                    title="Edit"
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                  </button>
                  <button 
                    onClick={(e) => handleDelete(charge.id, e)}
                    className="p-1.5 rounded text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                    title="Delete"
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  </button>
              </div>
            )
          }
        ]}
      />

      {/* Modal */}
      {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
              <div className="bg-white dark:bg-slate-900 w-full max-w-md p-6 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{editingCharge ? 'Edit Charge' : 'Add Charge'}</h3>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                      <Input 
                        label="Name (English)" 
                        value={formData.name} 
                        onChange={e => setFormData({...formData, name: e.target.value})} 
                        required 
                        placeholder="e.g. Inside Dhaka"
                        className="bg-slate-50/50 dark:bg-slate-800/50"
                      />
                      <Input 
                        label="Name (Bangla)" 
                        value={formData.name_bn} 
                        onChange={e => setFormData({...formData, name_bn: e.target.value})} 
                        placeholder="e.g. ঢাকার ভিতরে"
                        className="bg-slate-50/50 dark:bg-slate-800/50"
                      />
                      <Input 
                        label="Amount (৳)" 
                        type="number"
                        value={formData.amount} 
                        onChange={e => setFormData({...formData, amount: e.target.value})} 
                        required 
                        placeholder="60"
                        className="bg-slate-50/50 dark:bg-slate-800/50"
                      />
                      
                      <div className="flex justify-end gap-3 pt-2">
                          <Button type="button" variant="outline" onClick={closeModal} className="rounded-lg py-2 px-4 text-xs h-auto">Cancel</Button>
                          <Button type="submit" className="rounded-lg py-2 px-4 text-xs h-auto bg-pink-500 text-white hover:bg-pink-600">Save</Button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
}
