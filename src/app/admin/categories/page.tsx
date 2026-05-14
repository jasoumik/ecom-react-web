"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Heading } from "@/components/ui";
import { API_URL } from "@/lib/config";
import { useToast } from "@/components/ui/Toast";
import { Table } from "@/components/ui/Table";
import { FullScreenLoader } from "@/components/ui/Loader";
import { FilterBar } from "@/components/ui/FilterBar";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const router = useRouter();
  const { addToast } = useToast();

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
      applyFilters();
  }, [searchQuery, statusFilter, categories]);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/categories`);
      const data = await res.json();
      
      // Flatten categories for table view
      const flatten = (cats: any[], level = 0): any[] => {
          return cats.reduce((acc, cat) => {
              acc.push({ ...cat, level });
              if (cat.children) acc.push(...flatten(cat.children, level + 1));
              return acc;
          }, []);
      };
      
      const flatList = flatten(Array.isArray(data) ? data : []);
      setCategories(flatList);
    } catch (e) {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
      let result = [...categories];

      if (searchQuery) {
          const lower = searchQuery.toLowerCase();
          result = result.filter(c => c.name.toLowerCase().includes(lower));
      }

      if (statusFilter !== 'all') {
          const isActive = statusFilter === 'active';
          result = result.filter(c => c.is_active === isActive);
      }

      setFilteredCategories(result);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure? This will delete all subcategories and products in this category.")) return;
    try {
      const res = await fetch(`${API_URL}/categories/${id}`, { method: "DELETE" });
      if (res.ok) {
        addToast("Category deleted", "success");
        fetchCategories();
      } else {
        addToast("Failed to delete category", "error");
      }
    } catch (e) {
      addToast("Error deleting category", "error");
    }
  };

  if (loading) return <FullScreenLoader />;

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
            <Heading size="md" className="font-sans text-slate-800 dark:text-white mb-0.5">Categories</Heading>
            <p className="text-xs text-slate-500">Manage product categories</p>
        </div>
        <Button onClick={() => router.push("/admin/categories/create")} className="rounded-lg shadow-sm py-2 px-4 text-xs h-auto">
            + Add Category
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex-1 w-full">
            <FilterBar onSearch={setSearchQuery} placeholder="Search categories..." />
          </div>
          <div className="w-full md:w-auto">
              <select 
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs rounded-lg focus:ring-sky-500 focus:border-sky-500 block p-2.5 min-w-[150px]"
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
        data={filteredCategories}
        onRowClick={(cat) => router.push(`/admin/categories/${cat.id}/edit`)}
        columns={[
          {
            header: "Name",
            cell: (cat) => (
              <div className="flex items-center gap-3" style={{ paddingLeft: `${cat.level * 20}px` }}>
                  <div className="font-bold text-slate-900 dark:text-white text-xs">
                      {cat.level > 0 && <span className="text-slate-400 mr-1">↳</span>}
                      {cat.name}
                  </div>
              </div>
            )
          },
          {
            header: "Description",
            cell: (cat) => <span className="text-slate-600 dark:text-slate-400 text-xs max-w-xs truncate block">{cat.description || "N/A"}</span>
          },
          {
            header: "Status",
            cell: (cat) => (
                <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                    cat.is_active 
                    ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' 
                    : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                }`}>
                    {cat.is_active ? 'Active' : 'Inactive'}
                </span>
            )
          },
          {
            header: "Actions",
            className: "text-right",
            cell: (cat) => (
              <div className="flex justify-end gap-1">
                  <button 
                  onClick={(e) => { e.stopPropagation(); router.push(`/admin/categories/${cat.id}/edit`); }}
                  className="p-1.5 rounded text-slate-500 hover:bg-sky-50 hover:text-sky-600 transition-colors"
                  title="Edit"
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                  </button>
                  <button 
                  onClick={(e) => handleDelete(cat.id, e)}
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
