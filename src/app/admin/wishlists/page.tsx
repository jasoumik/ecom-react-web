"use client";

import { useEffect, useState } from "react";
import { Heading } from "@/components/ui";
import { API_URL } from "@/lib/config";
import { Table } from "@/components/ui/Table";
import { FullScreenLoader } from "@/components/ui/Loader";
import { formatDate } from "@/lib/utils";

export default function AdminWishlistsPage() {
  const [wishlists, setWishlists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchWishlists(page);
  }, [page]);

  const fetchWishlists = async (pageNum: number) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/wishlist/admin/all?page=${pageNum}&limit=20`);
      const data = await res.json();
      setWishlists(data.data || []);
      setTotalPages(data.meta.totalPages);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading && page === 1) return <FullScreenLoader />;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
            <Heading size="md" className="font-sans text-slate-800 dark:text-white mb-0.5">Wishlists</Heading>
            <p className="text-xs text-slate-500">See what customers are interested in</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <Table
            data={wishlists}
            emptyMessage="No wishlist items found."
            columns={[
            {
                header: "Customer",
                cell: (item) => (
                    <div>
                        <div className="font-bold text-slate-900 dark:text-white text-sm">{item.user_name}</div>
                        <div className="text-xs text-slate-500">{item.user_phone}</div>
                    </div>
                )
            },
            {
                header: "Product",
                cell: (item) => (
                    <div>
                        <div className="font-medium text-slate-800 dark:text-slate-200 text-sm">{item.product_name}</div>
                        <div className="text-xs text-slate-500">৳{item.product_price}</div>
                    </div>
                )
            },
            {
                header: "Date",
                cell: (item) => <span className="text-xs text-slate-500">{formatDate(item.created_at)}</span>
            }
            ]}
        />
        
        {totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-center gap-2">
                <button 
                    disabled={page === 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className="px-3 py-1 rounded border text-sm disabled:opacity-50"
                >
                    Previous
                </button>
                <span className="text-sm py-1">Page {page} of {totalPages}</span>
                <button 
                    disabled={page === totalPages}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    className="px-3 py-1 rounded border text-sm disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        )}
      </div>
    </div>
  );
}
