"use client";

import { useState } from "react";
import { Button, Heading } from "@/components/ui";
import { API_URL } from "@/lib/config";
import { useToast } from "@/components/ui/Toast";
import { Lock, Eye, EyeOff } from "lucide-react";

export default function PasswordChangeForm({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
        addToast("New passwords do not match", "error");
        return;
    }

    if (formData.newPassword.length < 6) {
        addToast("Password must be at least 6 characters long", "error");
        return;
    }

    setLoading(true);
    try {
        const res = await fetch(`${API_URL}/users/${userId}/password`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            })
        });

        if (res.ok) {
            addToast("Password changed successfully", "success");
            setFormData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: ""
            });
        } else {
            const data = await res.json();
            addToast(data.message || "Failed to change password", "error");
        }
    } catch (error) {
        addToast("Something went wrong", "error");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800">
        <div className="mb-6">
            <Heading size="md" className="font-sans text-slate-900 dark:text-white mb-2">Change Password</Heading>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Ensure your account is using a long, random password to stay secure.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
            <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Current Password</label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type={showCurrentPassword ? "text" : "password"}
                        value={formData.currentPassword}
                        onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                        className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 focus:ring-2 focus:ring-rose-400 outline-none transition-all text-sm font-medium text-slate-900 dark:text-white"
                        placeholder="Enter current password"
                        required
                    />
                    <button 
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                        {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">New Password</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type={showNewPassword ? "text" : "password"}
                            value={formData.newPassword}
                            onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                            className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 focus:ring-2 focus:ring-rose-400 outline-none transition-all text-sm font-medium text-slate-900 dark:text-white"
                            placeholder="New password"
                            required
                        />
                        <button 
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                            {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Confirm Password</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="password"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 focus:ring-2 focus:ring-rose-400 outline-none transition-all text-sm font-medium text-slate-900 dark:text-white"
                            placeholder="Confirm password"
                            required
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <Button 
                    type="submit" 
                    disabled={loading}
                    variant="outline"
                    className="rounded-xl px-8 py-3 font-bold border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 w-full sm:w-auto"
                >
                    {loading ? "Updating..." : "Update Password"}
                </Button>
            </div>
        </form>
    </div>
  );
}
