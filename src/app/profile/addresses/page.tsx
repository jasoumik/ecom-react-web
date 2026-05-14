"use client";

import { useEffect, useState } from "react";
import { Heading, Button } from "@/components/ui";
import { Input } from "@/components/ui/Input";
import { API_URL } from "@/lib/config";
import { useToast } from "@/components/ui/Toast";
import { DISTRICTS, DHAKA_METRO_THANAS, DHAKA_SUBURBS } from "@/lib/bd-locations";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { AlertTriangle } from "lucide-react";

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newAddress, setNewAddress] = useState({ type: "Home", address: "", city: "", zip: "", is_default: false });
  const { addToast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  
  const [district, setDistrict] = useState("");
  const [thana, setThana] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.id) {
        setUserId(user.id);
        fetchAddresses(user.id);
    }
  }, []);

  // Update city when district/thana changes
  useEffect(() => {
      if (district === "Dhaka") {
          setNewAddress(prev => ({ ...prev, city: thana ? `${thana}, ${district}` : district }));
      } else {
          setNewAddress(prev => ({ ...prev, city: district }));
      }
  }, [district, thana]);

  const fetchAddresses = async (uid: string) => {
    const res = await fetch(`${API_URL}/users/${uid}/addresses`);
    const data = await res.json();
    setAddresses(data);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    
    if (!district) {
        addToast("Please select a district", "error");
        return;
    }
    if (district === "Dhaka" && !thana) {
        addToast("Please select an area/thana", "error");
        return;
    }

    try {
      const res = await fetch(`${API_URL}/users/${userId}/addresses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAddress),
      });
      if (res.ok) {
        addToast("Address added", "success");
        setIsAdding(false);
        setNewAddress({ type: "Home", address: "", city: "", zip: "", is_default: false });
        setDistrict("");
        setThana("");
        fetchAddresses(userId);
      } else {
        addToast("Failed to add address", "error");
      }
    } catch (e) {
      addToast("Error adding address", "error");
    }
  };

  const handleDeleteClick = (id: string) => {
    setConfirmDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!userId || !confirmDeleteId) return;
    try {
      await fetch(`${API_URL}/users/${userId}/addresses/${confirmDeleteId}`, { method: "DELETE" });
      addToast("Address deleted", "success");
      fetchAddresses(userId);
    } catch (e) {
      addToast("Error deleting address", "error");
    } finally {
        setConfirmDeleteId(null);
    }
  };

  return (
    <div className="max-w-4xl relative">
      {/* Confirmation Toast/Modal */}
      {confirmDeleteId && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-start justify-center sm:justify-end p-4 sm:p-6 bg-black/20 backdrop-blur-sm sm:bg-transparent sm:backdrop-blur-none pointer-events-auto">
              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-sm animate-in slide-in-from-bottom-10 fade-in duration-300 mb-16 sm:mb-0">
                  <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-500 flex items-center justify-center shrink-0">
                          <AlertTriangle size={20} />
                      </div>
                      <div className="flex-1">
                          <h4 className="font-bold text-slate-900 dark:text-white mb-1">Delete Address?</h4>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Are you sure you want to remove this address? This action cannot be undone.</p>
                          <div className="flex gap-3 justify-end">
                              <button 
                                  onClick={() => setConfirmDeleteId(null)}
                                  className="px-4 py-2 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
                              >
                                  Cancel
                              </button>
                              <button 
                                  onClick={confirmDelete}
                                  className="px-4 py-2 rounded-lg text-sm font-bold bg-red-500 text-white hover:bg-red-600 shadow-sm transition-colors"
                              >
                                  Delete
                              </button>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
            <Heading size="lg" className="font-sans text-slate-900 dark:text-white mb-1">My Addresses</Heading>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Manage your shipping addresses for faster checkout.</p>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)} className="w-full sm:w-auto rounded-xl shadow-lg shadow-sky-500/20 px-6 py-2.5">
            {isAdding ? "Cancel" : "+ Add New"}
        </Button>
      </div>

      {isAdding && (
        <div className="bg-slate-50 dark:bg-slate-800/50 p-6 sm:p-8 rounded-3xl border border-slate-100 dark:border-slate-800 mb-8 animate-in fade-in slide-in-from-top-4">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-6">New Address Details</h3>
            <form onSubmit={handleAdd} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                    <Input label="Label (e.g. Home, Office)" value={newAddress.type} onChange={e => setNewAddress({...newAddress, type: e.target.value})} required className="bg-white" />
                    <SearchableSelect 
                        label="District"
                        placeholder="Select District"
                        options={DISTRICTS}
                        value={district}
                        onChange={(val) => {
                            setDistrict(val);
                            setThana("");
                        }}
                        className="bg-white"
                    />
                </div>
                
                {district === "Dhaka" && (
                    <div className="grid md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2">
                        <SearchableSelect 
                            label="Area / Thana"
                            placeholder="Select Thana"
                            options={[...DHAKA_METRO_THANAS, ...DHAKA_SUBURBS].sort()}
                            value={thana}
                            onChange={setThana}
                            className="bg-white"
                        />
                        <div className="hidden md:block"></div>
                    </div>
                )}

                <Input label="Street Address" value={newAddress.address} onChange={e => setNewAddress({...newAddress, address: e.target.value})} required className="bg-white" />
                
                <div className="grid md:grid-cols-2 gap-6">
                    <Input label="Zip Code" value={newAddress.zip} onChange={e => setNewAddress({...newAddress, zip: e.target.value})} required className="bg-white" />
                    <div className="flex items-center pt-8">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${newAddress.is_default ? 'bg-sky-500 border-sky-500' : 'border-slate-300 bg-white'}`}>
                                {newAddress.is_default && <span className="text-white text-sm">✓</span>}
                            </div>
                            <input 
                                type="checkbox" 
                                checked={newAddress.is_default} 
                                onChange={e => setNewAddress({...newAddress, is_default: e.target.checked})}
                                className="hidden"
                            />
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-sky-600 transition-colors">Set as Default Address</span>
                        </label>
                    </div>
                </div>
                <div className="pt-4 flex justify-end">
                    <Button type="submit" className="w-full sm:w-auto rounded-xl px-8 py-3 shadow-md">Save Address</Button>
                </div>
            </form>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {addresses.map((addr) => (
            <div key={addr.id} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all relative group">
                {addr.is_default && (
                    <span className="absolute top-6 right-6 bg-sky-100 text-sky-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide dark:bg-sky-900/30 dark:text-sky-400">
                        Default
                    </span>
                )}
                <div className="flex items-center gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${
                        addr.type.toLowerCase().includes('home') ? 'bg-rose-50 text-rose-500' : 
                        addr.type.toLowerCase().includes('office') ? 'bg-blue-50 text-blue-500' : 
                        'bg-slate-100 text-slate-500'
                    }`}>
                        {addr.type.toLowerCase().includes('home') ? '🏠' : addr.type.toLowerCase().includes('office') ? '🏢' : '📍'}
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-lg">{addr.type}</h3>
                        <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">Shipping Address</p>
                    </div>
                </div>

                <div className="space-y-1 pl-16">
                    <p className="text-slate-700 dark:text-slate-300 text-sm font-medium leading-relaxed">{addr.address}</p>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">{addr.city}, {addr.zip}</p>
                </div>

                <div className="absolute bottom-6 right-6">
                    <button
                        onClick={() => handleDeleteClick(addr.id)}
                        className="text-red-500 hover:bg-red-50 p-2 rounded-xl transition-colors"
                        title="Delete Address"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                </div>
            </div>
        ))}

        {addresses.length === 0 && !isAdding && (
            <div className="col-span-2 flex flex-col items-center justify-center py-10 sm:py-16 px-4 text-center text-slate-400 bg-slate-50 dark:bg-slate-800/30 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                <div className="text-4xl mb-4 opacity-50">📍</div>
                <p className="font-medium">No addresses saved yet</p>
                <p className="text-xs sm:text-sm mt-1 max-w-xs mx-auto">Add an address to speed up your checkout process.</p>
            </div>
        )}
      </div>
    </div>
  );
}