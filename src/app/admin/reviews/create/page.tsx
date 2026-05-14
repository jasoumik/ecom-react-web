"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, Heading } from "@/components/ui";
import { Input } from "@/components/ui/Input";
import { API_URL } from "@/lib/config";
import { useToast } from "@/components/ui/Toast";
import { RatingStars } from "@/components/ui";

export default function CreateReviewPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [formData, setFormData] = useState({
      productId: "",
      userId: "",
      rating: 5,
      comment: "",
      images: [] as string[]
  });
  const router = useRouter();
  const { addToast } = useToast();

  useEffect(() => {
    // Fetch Products
    fetch(`${API_URL}/products?limit=100`)
      .then(res => res.json())
      .then(data => setProducts(data.data || []))
      .catch(console.error);

    // Fetch Users (Admin only endpoint usually, but we can reuse users list if available or just search)
    // For now, let's assume we can fetch users. If not, we might need a user search.
    // Or we can just let admin select from a list if not too many.
    // Let's try fetching users.
    fetch(`${API_URL}/users`)
        .then(res => res.json())
        .then(data => setUsers(Array.isArray(data) ? data : []))
        .catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        const res = await fetch(`${API_URL}/reviews`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
        });
        
        if (res.ok) {
            addToast("Review created successfully", "success");
            router.push("/admin/reviews");
        } else {
            const err = await res.json();
            addToast(err.message || "Failed to create review", "error");
        }
    } catch (e) {
        addToast("Error creating review", "error");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <Heading size="md" className="font-sans text-slate-900 dark:text-white">Create Manual Review</Heading>
        <Button variant="outline" onClick={() => router.back()} className="rounded-lg py-2 px-4 text-sm h-auto">Cancel</Button>
      </div>
      
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Product</label>
              <select 
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all dark:bg-slate-800/50 dark:border-slate-700 dark:text-white text-sm"
                  value={formData.productId}
                  onChange={e => setFormData({...formData, productId: e.target.value})}
                  required
              >
                  <option value="">Select Product</option>
                  {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
              </select>
          </div>

          <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">User (Author)</label>
              <select 
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all dark:bg-slate-800/50 dark:border-slate-700 dark:text-white text-sm"
                  value={formData.userId}
                  onChange={e => setFormData({...formData, userId: e.target.value})}
                  required
              >
                  <option value="">Select User</option>
                  {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.phone})</option>
                  ))}
              </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Rating</label>
            <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({...formData, rating: star})}
                    className={`text-2xl transition-transform hover:scale-110 ${star <= formData.rating ? 'text-amber-400' : 'text-slate-200 dark:text-slate-700'}`}
                >
                    ★
                </button>
                ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Comment</label>
            <textarea 
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all dark:bg-slate-800/50 dark:border-slate-700 dark:text-white dark:placeholder-slate-500 text-sm"
              value={formData.comment} 
              onChange={e => setFormData({...formData, comment: e.target.value})} 
              rows={4}
              required
              placeholder="Write the review content..."
            />
          </div>

          <Button type="submit" fullWidth className="rounded-lg shadow-md shadow-sky-500/20 py-3 text-sm font-bold">Create Review</Button>
        </form>
      </div>
    </div>
  );
}
