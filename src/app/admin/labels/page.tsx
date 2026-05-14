"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Heading } from "@/components/ui";
import { API_URL } from "@/lib/config";
import { useToast } from "@/components/ui/Toast";
import { Table } from "@/components/ui/Table";
import { FullScreenLoader } from "@/components/ui/Loader";
import { FilterBar } from "@/components/ui/FilterBar";

export default function AdminLabelsPage() {
  const [labels, setLabels] = useState<any[]>([]);
  const [filteredLabels, setFilteredLabels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const router = useRouter();
  const { addToast } = useToast();

  useEffect(() => {
    fetchLabels();
  }, []);

  useEffect(() => {
      applyFilters();
  }, [searchQuery, statusFilter, labels]);

  const fetchLabels = async () => {
    try {
      const res = await fetch(`${API_URL}/labels?all=true`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setLabels(list);
    } catch (e) {
      setLabels([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
      let result = [...labels];

      if (searchQuery) {
          const lower = searchQuery.toLowerCase();
          result = result.filter(l => l.name.toLowerCase().includes(lower) || l.slug.toLowerCase().includes(lower));
      }

      if (statusFilter !== 'all') {
          const isActive = statusFilter === 'active';
          result = result.filter(l => l.is_active === isActive);
      }

      setFilteredLabels(result);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this label?")) return;
    try {
      const res = await fetch(`${API_URL}/labels/${id}`, { method: "DELETE" });
      if (res.ok) {
        addToast("Label deleted", "success");
        fetchLabels();
      } else {
        addToast("Failed to delete label", "error");
      }
    } catch (e) {
      addToast("Error deleting label", "error");
    }
  };

  if (loading) return <FullScreenLoader />;

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <Heading size="md" className="font-sans text-slate-800 dark:text-white mb-0.5">Labels</Heading>
          <p className="text-xs text-slate-500">Manage product labels for filtering and promotions</p>
        </div>
        <Button onClick={() => router.push("/admin/labels/create")} className="rounded-lg shadow-sm py-2 px-4 text-xs h-auto">
          + Add Label
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex-1 w-full">
            <FilterBar onSearch={setSearchQuery} placeholder="Search labels..." />
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
        data={filteredLabels}
        onRowClick={(label) => router.push(`/admin/labels/${label.id}/edit`)}
        columns={[
          {
            header: "Color",
            cell: (label) => (
              <div
                className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700"
                style={{ backgroundColor: label.bg_color }}
              >
                <div
                  className="w-full h-full rounded-lg flex items-center justify-center text-xs font-bold"
                  style={{ color: label.color }}
                >
                  A
                </div>
              </div>
            )
          },
          {
            header: "Name",
            accessorKey: "name",
            className: "font-bold text-slate-900 dark:text-white text-sm"
          },
          {
            header: "Name (Bangla)",
            accessorKey: "name_bn",
            className: "text-slate-600 dark:text-slate-400 text-xs"
          },
          {
            header: "Slug",
            accessorKey: "slug",
            className: "text-slate-500 text-xs font-mono"
          },
          {
            header: "Status",
            cell: (label) => (
              <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                label.is_active 
                  ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' 
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
              }`}>
                {label.is_active ? 'Active' : 'Inactive'}
              </span>
            )
          },
          {
            header: "Actions",
            className: "text-right",
            cell: (label) => (
              <div className="flex justify-end gap-1">
                <button
                  onClick={(e) => { e.stopPropagation(); router.push(`/admin/labels/${label.id}/edit`); }}
                  className="p-1.5 rounded text-slate-500 hover:bg-sky-50 hover:text-sky-600 transition-colors"
                  title="Edit"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                </button>
                <button
                  onClick={(e) => handleDelete(label.id, e)}
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
