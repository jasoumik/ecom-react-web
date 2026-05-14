"use client";

import { useEffect, useState } from "react";
import { Heading, Button } from "@/components/ui";
import { API_URL } from "@/lib/config";
import { useToast } from "@/components/ui/Toast";
import { Table } from "@/components/ui/Table";
import { FullScreenLoader } from "@/components/ui/Loader";

export default function AdminBatchesPage() {
  const [batches, setBatches] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    fetchBatches(1);
  }, []);

  const fetchBatches = async (page: number) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/products/batches?page=${page}&limit=20`);
      const data = await res.json();
      if (data.data && Array.isArray(data.data)) {
          setBatches(data.data);
          setMeta(data.meta);
      } else {
          setBatches([]);
      }
    } catch (e) {
      setBatches([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This will reduce product stock.")) return;
    try {
      const res = await fetch(`${API_URL}/products/batches/${id}`, { method: "DELETE" });
      if (res.ok) {
        addToast("Batch deleted", "success");
        fetchBatches(meta.page);
      } else {
        addToast("Failed to delete batch", "error");
      }
    } catch (e) {
      addToast("Error deleting batch", "error");
    }
  };

  if (loading && batches.length === 0) return <FullScreenLoader />;

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div>
        <Heading size="md" className="font-sans text-slate-800 dark:text-white mb-0.5">Batches</Heading>
        <p className="text-xs text-slate-500">Overview of all inventory batches</p>
      </div>

      <Table
        data={batches}
        columns={[
          {
            header: "Batch #",
            accessorKey: "batch_number",
            className: "font-bold text-slate-900 dark:text-white text-xs"
          },
          {
            header: "Product",
            cell: (batch) => (
                <div>
                    <div className="font-bold text-slate-900 dark:text-white text-xs">{batch.product_name}</div>
                    <div className="text-[10px] text-slate-500">SKU: {batch.product_sku || '-'}</div>
                </div>
            )
          },
          {
            header: "Quantity",
            cell: (batch) => (
                <div className="text-xs">
                    <span className="font-bold text-slate-900 dark:text-white">{batch.remaining_quantity}</span>
                    <span className="text-slate-400 text-[10px] ml-1">/ {batch.quantity}</span>
                </div>
            )
          },
          {
            header: "Prices",
            cell: (batch) => (
                <div className="text-xs">
                    <div className="text-slate-600 dark:text-slate-300">Buy: ৳{batch.purchase_price}</div>
                    <div className="text-slate-600 dark:text-slate-300">Sell: ৳{batch.selling_price}</div>
                </div>
            )
          },
          {
            header: "Expiry",
            cell: (batch) => <span className="text-slate-500 dark:text-slate-400 text-xs">{batch.expiry_date ? new Date(batch.expiry_date).toLocaleDateString() : '-'}</span>
          },
          {
            header: "Date",
            cell: (batch) => <span className="text-slate-500 dark:text-slate-400 text-xs">{new Date(batch.purchase_date).toLocaleDateString()}</span>
          },
          {
            header: "Actions",
            className: "text-right",
            cell: (batch) => (
              <div className="flex justify-end">
                  <button 
                  onClick={() => handleDelete(batch.id)}
                  className="p-1.5 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  title="Delete"
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  </button>
              </div>
            )
          }
        ]}
      />
      
      {/* Pagination */}
      <div className="flex justify-between items-center pt-2">
          <Button 
              variant="outline" 
              disabled={meta.page === 1}
              onClick={() => fetchBatches(meta.page - 1)}
              className="rounded-lg py-1.5 px-3 text-xs h-auto"
          >
              Previous
          </Button>
          <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              Page {meta.page} of {meta.totalPages}
          </span>
          <Button 
              variant="outline" 
              disabled={meta.page === meta.totalPages}
              onClick={() => fetchBatches(meta.page + 1)}
              className="rounded-lg py-1.5 px-3 text-xs h-auto"
          >
              Next
          </Button>
      </div>
    </div>
  );
}
