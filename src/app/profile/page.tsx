"use client";

import { useEffect, useState, useRef } from "react";
import { Button, Heading } from "@/components/ui";
import { API_URL } from "@/lib/config";
import { useToast } from "@/components/ui/Toast";
import { User, Phone, Mail, Camera, Coins, Gift } from "lucide-react";
import PasswordChangeForm from "./PasswordChangeForm";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [points, setPoints] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    avatar: ""
  });
  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
        try {
            const parsed = JSON.parse(storedUser);
            setUser(parsed);
            setFormData({
                name: parsed.name || "",
                email: parsed.email || "",
                phone: parsed.phone || "",
                avatar: parsed.avatar || ""
            });

            // Fetch fresh user data including points
            fetch(`${API_URL}/users/${parsed.id}`)
                .then(res => res.json())
                .then(data => {
                    if (data && data.points !== undefined) {
                        setPoints(data.points);
                    }
                })
                .catch(console.error);

        } catch (e) {
            // Handle error
        }
    }
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append('file', file);

    try {
        const res = await fetch(`${API_URL}/media/upload`, {
            method: 'POST',
            body: uploadData
        });
        if (res.ok) {
            const data = await res.json();
            // Update preview immediately
            setUser((prev: any) => ({ ...prev, avatar: data.url }));
            // Update form data to be saved on submit
            setFormData(prev => ({ ...prev, avatar: data.url }));
            addToast("Photo uploaded. Click Save to apply.", "success");
        } else {
            addToast("Failed to upload photo", "error");
        }
    } catch (e) {
        addToast("Error uploading photo", "error");
    }
  };

  const isLikelyBdPhone = (value: string) => {
    const trimmed = value.replace(/\s+/g, "");
    return /^01[3-9]\d{8}$/.test(trimmed) || /^\+?8801[3-9]\d{8}$/.test(trimmed);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic client-side BD phone validation before hitting backend
    if (formData.phone && !isLikelyBdPhone(formData.phone)) {
      addToast("Please enter a valid Bangladeshi phone number", "error");
      return;
    }

    setLoading(true);
    try {
        const res = await fetch(`${API_URL}/users/${user.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                avatar: formData.avatar
            })
        });

        if (res.ok) {
            const updatedUser = { ...user, ...formData };
            localStorage.setItem("user", JSON.stringify(updatedUser));
            window.dispatchEvent(new Event("storage"));
            addToast("Profile updated successfully", "success");
        } else {
            const errorBody = await res.json().catch(() => null);
            const message = errorBody?.message || "Failed to update profile";
            addToast(message, "error");
        }
    } catch (error) {
        addToast("Something went wrong", "error");
    } finally {
        setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl">
        <div className="mb-8">
            <Heading size="lg" className="font-sans text-slate-900 dark:text-white mb-2">Personal Information</Heading>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Manage your personal details and account settings.</p>
        </div>

        {/* Points Card */}
        <div className="mb-8 bg-gradient-to-r from-amber-500 to-rose-400 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Coins size={120} />
            </div>
            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                    <Gift size={20} />
                    <span className="font-bold text-sm uppercase tracking-wider">Loyalty Points</span>
                </div>
                <div className="text-4xl font-bold mb-1">{points}</div>
                <p className="text-amber-100 text-sm">Earn points on every purchase and redeem them for discounts.</p>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Avatar Section */}
            <div className="flex items-center gap-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="relative group shrink-0">
                    <div className="w-16 h-16 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-2xl overflow-hidden border-2 border-white dark:border-slate-700 shadow-sm">
                        {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-slate-400">👤</span>
                        )}
                    </div>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                    <button 
                        type="button" 
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute -bottom-1 -right-1 p-1.5 bg-rose-400 text-white rounded-full shadow-sm hover:bg-rose-400 transition-colors border-2 border-white dark:border-slate-900"
                    >
                        <Camera size={12} />
                    </button>
                </div>
                <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">Profile Photo</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Upload a new avatar to customize your profile.</p>
                </div>
            </div>

            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Full Name</label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 focus:ring-2 focus:ring-rose-400 outline-none transition-all text-sm font-medium text-slate-900 dark:text-white"
                            placeholder="Enter your name"
                        />
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Phone Number</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input 
                                type="text"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 focus:ring-2 focus:ring-rose-400 outline-none transition-all text-sm font-medium text-slate-900 dark:text-white"
                                placeholder="01XXXXXXXXX or +8801XXXXXXXXX"
                            />
                        </div>
                        <p className="text-[10px] text-slate-400 pl-1">Use your active Bangladeshi mobile number.</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input 
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 focus:ring-2 focus:ring-rose-400 outline-none transition-all text-sm font-medium text-slate-900 dark:text-white"
                                placeholder="Enter your email"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <Button 
                    type="submit" 
                    disabled={loading}
                    className="rounded-xl px-8 py-3 font-bold shadow-lg shadow-rose-400/20 w-full sm:w-auto"
                >
                    {loading ? "Saving Changes..." : "Save Changes"}
                </Button>
            </div>
        </form>

        {/* Password Change Section */}
        <PasswordChangeForm userId={user.id} />
    </div>
  );
}
