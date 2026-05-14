"use client";

import { useState, useEffect } from "react";
import { Button, Heading } from "@/components/ui";
import { Input } from "@/components/ui/Input";
import { API_URL } from "@/lib/config";
import { useToast } from "@/components/ui/Toast";
import { MediaPicker } from "@/components/ui/MediaPicker";

export default function AdminProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      fetch(`${API_URL}/users/profile/${parsed.id}`)
        .then(res => res.json())
        .then(data => {
            if (data.statusCode && data.statusCode !== 200) {
                console.error("Error fetching profile:", data);
            } else {
                setUser(data);
            }
        })
        .catch(console.error);
    }
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
          name: user.name,
          email: user.email,
          phone: user.phone,
          avatar: user.avatar
      };

      const res = await fetch(`${API_URL}/users/profile/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      if (res.ok) {
        const updatedUser = await res.json();
        setUser(updatedUser);
        const lsUser = JSON.parse(localStorage.getItem("user") || "{}");
        localStorage.setItem("user", JSON.stringify({ ...lsUser, ...updatedUser }));
        window.dispatchEvent(new Event("storage"));
        addToast("Profile updated successfully", "success");
      } else {
        addToast("Failed to update profile", "error");
      }
    } catch (e) {
      addToast("Error updating profile", "error");
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8">
        <Heading size="xl" className="font-sans text-slate-900 dark:text-white mb-2">Admin Profile</Heading>
        <p className="text-slate-500 dark:text-slate-400">Manage your account settings and security.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Avatar & Basic Info */}
        <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[20px] shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center">
                <div className="relative group cursor-pointer mb-4" onClick={() => setShowMediaPicker(true)}>
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-50 dark:border-slate-800 shadow-lg">
                        {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-5xl text-white font-bold">
                                {user.name.charAt(0)}
                            </div>
                        )}
                    </div>
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
                        <span className="text-white text-xs font-bold">Change</span>
                    </div>
                    <div className="absolute bottom-1 right-1 w-8 h-8 bg-white dark:bg-slate-700 rounded-full shadow-md flex items-center justify-center text-sky-500">
                        ✎
                    </div>
                </div>
                <h3 className="font-bold text-xl text-slate-900 dark:text-white mb-1">{user.name}</h3>
                <span className="inline-flex px-3 py-1 rounded-full bg-sky-100 text-sky-700 text-xs font-bold uppercase tracking-wide dark:bg-sky-900/30 dark:text-sky-400">
                    Administrator
                </span>
            </div>
        </div>

        {/* Right Column: Edit Form */}
        <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[20px] shadow-sm border border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">Account Details</h3>
                <form onSubmit={handleUpdate} className="space-y-6">
                    <div className="grid gap-6">
                        <Input label="Full Name" value={user.name} onChange={e => setUser({...user, name: e.target.value})} required />
                        <div className="grid md:grid-cols-2 gap-6">
                            <Input label="Phone Number" value={user.phone} onChange={e => setUser({...user, phone: e.target.value})} required disabled className="bg-slate-50 dark:bg-slate-800 opacity-60 cursor-not-allowed" />
                            <Input label="Email Address" value={user.email || ""} onChange={e => setUser({...user, email: e.target.value})} />
                        </div>
                    </div>
                    
                    <div className="pt-6 flex justify-end">
                        <Button type="submit" className="rounded-xl shadow-lg shadow-sky-500/20 px-8 py-3 text-base">Save Changes</Button>
                    </div>
                </form>
            </div>
        </div>
      </div>

      {showMediaPicker && (
        <MediaPicker 
            context="profile"
            onSelect={(url) => {
                setUser({ ...user, avatar: url });
                setShowMediaPicker(false);
            }}
            onClose={() => setShowMediaPicker(false)}
        />
      )}
    </div>
  );
}
