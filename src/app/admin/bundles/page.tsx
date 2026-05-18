"use client";

import { useEffect, useState } from "react";
import { Heading, Button } from "@/components/ui";
import { Table } from "@/components/ui/Table";
import { API_URL } from "@/lib/config";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import { FilterBar } from "@/components/ui/FilterBar";

export default function BundlesPage() {
  const [bundles, setBundles] = useState<any[]>([]);
  const [filteredBundles, setFilteredBundles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { addToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    fetchBundles();
  }, []);

  useEffect(() => {
      applyFilters();
  }, [searchQuery, statusFilter, bundles]);

  const fetchBundles = async () => {
    try {
      const res = await fetch(`${API_URL}/bundles`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setBundles(list);
    } catch (error) {
      console.error("Failed to fetch bundles", error);
      setBundles([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
      let result = [...bundles];

      if (searchQuery) {
          const lower = searchQuery.toLowerCase();
          result = result.filter((b: any) => b.title.toLowerCase().includes(lower));
      }

      if (statusFilter !== 'all') {
          const isActive = statusFilter === 'active';
          result = result.filter((b: any) => b.is_active === isActive);
      }

      setFilteredBundles(result);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this bundle?")) return;
    try {
      const res = await fetch(`${API_URL}/bundles/${id}`, { method: "DELETE" });
      if (res.ok) {
        addToast("Bundle deleted successfully", "success");
        fetchBundles();
      } else {
        addToast("Failed to delete bundle", "error");
      }
    } catch (error) {
      addToast("Error deleting bundle", "error");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <Heading size="md" className="font-sans text-slate-900 dark:text-white">Bundles & Combos</Heading>
        <Link href="/admin/bundles/create">
          <Button className="rounded-lg shadow-md shadow-pink-500/20 py-2 px-4 text-sm h-auto">+ Add Bundle</Button>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex-1 w-full">
            <FilterBar onSearch={setSearchQuery} placeholder="Search bundles..." />
          </div>
          <div className="w-full md:w-auto">
              <select 
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs rounded-lg focus:ring-pink-500 focus:border-pink-500 block p-2.5 min-w-[150px]"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
              >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
              </select>
          </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <Table
          data={filteredBundles}
          onRowClick={(bundle) => router.push(`/admin/bundles/${bundle.id}/edit`)}
          columns={[
            { header: "Title", accessorKey: "title", className: "font-medium text-slate-900 dark:text-white" },
            { header: "Price", cell: (b: any) => `৳${b.price}`, className: "text-slate-600 dark:text-slate-400" },
            { header: "Items", cell: (b: any) => b.items?.length || 0, className: "text-slate-600 dark:text-slate-400" },
            { 
                header: "Status", 
                cell: (b: any) => (
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${b.is_active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                        {b.is_active ? 'Active' : 'Inactive'}
                    </span>
                )
            },
            {
              header: "Actions",
              cell: (bundle: any) => (
                <div className="flex gap-2">
                  <Link href={`/admin/bundles/${bundle.id}/edit`} onClick={(e) => e.stopPropagation()}>
                    <Button variant="outline" className="h-8 px-3 text-xs">Edit</Button>
                  </Link>
                  <Button 
                    variant="outline"
                    className="h-8 px-3 text-xs text-pink-600 hover:text-pink-700 hover:bg-pink-50 border-pink-200"
                    onClick={(e: React.MouseEvent) => handleDelete(bundle.id, e)}
                  >
                    Delete
                  </Button>
                </div>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
