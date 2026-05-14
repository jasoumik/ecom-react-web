"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Heading, Button } from "@/components/ui";
import { API_URL } from "@/lib/config";
import { Table } from "@/components/ui/Table";
import { FullScreenLoader } from "@/components/ui/Loader";
import { FilterBar } from "@/components/ui/FilterBar";

export default function StockLedgerPage() {
  const [movements, setMovements] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchMovements(1);
  }, []);

  const fetchMovements = async (page: number) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/products/stock-movements?page=${page}&limit=20`);
      const data = await res.json();
      if (data.data && Array.isArray(data.data)) {
          setMovements(data.data);
          setMeta(data.meta);
      } else {
          setMovements([]);
      }
    } catch (e) {
      setMovements([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading && movements.length === 0) return <FullScreenLoader />;

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
            <Heading size="md" className="font-sans text-slate-800 dark:text-white mb-0.5">Stock Ledger</Heading>
            <p className="text-xs text-slate-500">Audit trail of all inventory changes</p>
        </div>
        <Button onClick={() => router.push('/admin/stock-adjustment')} className="rounded-lg shadow-sm py-2 px-4 text-xs h-auto">
            Adjust Stock
        </Button>
      </div>

      <FilterBar onSearch={() => {}} placeholder="Search by product..." />

      <Table
        data={movements}
        columns={[
          {
            header: "Date",
            cell: (m) => <span className="text-slate-500 dark:text-slate-400 text-xs">{new Date(m.created_at).toLocaleString()}</span>
          },
          {
            header: "Product",
            accessorKey: "product_name",
            className: "font-bold text-slate-900 dark:text-white text-xs"
          },
          {
            header: "Change",
            cell: (m) => (
                <span className={`font-bold text-xs ${m.quantity_change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {m.quantity_change > 0 ? '+' : ''}{m.quantity_change}
                </span>
            )
          },
          {
            header: "Type",
            cell: (m) => (
                <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                    m.type === 'sale' ? 'bg-blue-50 text-blue-600' :
                    m.type === 'batch_purchase' ? 'bg-green-50 text-green-600' :
                    m.type === 'return_restock' ? 'bg-purple-50 text-purple-600' :
                    m.type === 'correction_add' ? 'bg-emerald-50 text-emerald-600' :
                    ['wastage', 'broken', 'offline_sale'].includes(m.type) ? 'bg-red-50 text-red-600' :
                    'bg-slate-100 text-slate-600'
                }`}>
                    {m.type.replace(/_/g, ' ')}
                </span>
            )
          },
          {
            header: "Reason",
            accessorKey: "reason",
            className: "text-slate-600 dark:text-slate-300 text-xs"
          }
        ]}
      />
      
      {/* Pagination */}
      <div className="flex justify-between items-center pt-2">
          <Button 
              variant="outline" 
              disabled={meta.page === 1}
              onClick={() => fetchMovements(meta.page - 1)}
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
              onClick={() => fetchMovements(meta.page + 1)}
              className="rounded-lg py-1.5 px-3 text-xs h-auto"
          >
              Next
          </Button>
      </div>
    </div>
  );
}
