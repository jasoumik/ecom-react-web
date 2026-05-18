"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Heading } from "@/components/ui";
import { API_URL } from "@/lib/config";
import { useToast } from "@/components/ui/Toast";
import { Table } from "@/components/ui/Table";
import { FullScreenLoader } from "@/components/ui/Loader";
import { FilterBar } from "@/components/ui/FilterBar";

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<any[]>([]);
  const [filteredBrands, setFilteredBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const router = useRouter();
  const { addToast } = useToast();

  useEffect(() => {
    fetchBrands();
  }, []);

  useEffect(() => {
      applyFilters();
  }, [searchQuery, statusFilter, brands]);

  const fetchBrands = async () => {
    try {
      const res = await fetch(`${API_URL}/brands`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setBrands(list);
    } catch (e) {
      setBrands([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
      let result = [...brands];

      if (searchQuery) {
          const lower = searchQuery.toLowerCase();
          result = result.filter(b => b.name.toLowerCase().includes(lower));
      }

      if (statusFilter !== 'all') {
          const isActive = statusFilter === 'active';
          result = result.filter(b => b.is_active === isActive);
      }

      setFilteredBrands(result);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure?")) return;
    try {
      const res = await fetch(`${API_URL}/brands/${id}`, { method: "DELETE" });
      if (res.ok) {
        addToast("Brand deleted", "success");
        fetchBrands();
      } else {
        addToast("Failed to delete brand", "error");
      }
    } catch (e) {
      addToast("Error deleting brand", "error");
    }
  };

  if (loading) return <FullScreenLoader />;

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
            <Heading size="md" className="font-sans text-slate-800 dark:text-white mb-0.5">Brands</Heading>
            <p className="text-xs text-slate-500">Manage product brands</p>
        </div>
        <Button onClick={() => router.push("/admin/brands/create")} className="rounded-lg shadow-sm py-2 px-4 text-xs h-auto">
            + Add Brand
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex-1 w-full">
            <FilterBar onSearch={setSearchQuery} placeholder="Search brands..." />
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

      <Table
        data={filteredBrands}
        onRowClick={(brand) => router.push(`/admin/brands/${brand.id}/edit`)}
        columns={[
          {
            header: "Name",
            accessorKey: "name",
            className: "font-bold text-slate-900 dark:text-white text-xs"
          },
          {
            header: "Description",
            accessorKey: "description",
            className: "text-slate-600 dark:text-slate-300 text-xs max-w-xs truncate"
          },
          {
            header: "Status",
            cell: (brand) => (
                <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                    brand.is_active 
                    ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' 
                    : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                }`}>
                    {brand.is_active ? 'Active' : 'Inactive'}
                </span>
            )
          },
          {
            header: "Actions",
            className: "text-right",
            cell: (brand) => (
              <div className="flex justify-end gap-1">
                  <button 
                  onClick={(e) => { e.stopPropagation(); router.push(`/admin/brands/${brand.id}/edit`); }}
                  className="p-1.5 rounded text-slate-500 hover:bg-pink-50 hover:text-pink-600 transition-colors"
                  title="Edit"
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                  </button>
                  <button 
                  onClick={(e) => handleDelete(brand.id, e)}
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
    </div>
  );
}
