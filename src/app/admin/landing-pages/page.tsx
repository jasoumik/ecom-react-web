"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Heading } from "@/components/ui";
import { API_URL } from "@/lib/config";
import { useToast } from "@/components/ui/Toast";
import { Table } from "@/components/ui/Table";
import { FullScreenLoader } from "@/components/ui/Loader";
import { FilterBar } from "@/components/ui/FilterBar";

export default function AdminLandingPages() {
  const [pages, setPages] = useState<any[]>([]);
  const [filteredPages, setFilteredPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { addToast } = useToast();

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const res = await fetch(`${API_URL}/landing-pages`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setPages(list);
      setFilteredPages(list);
    } catch (e) {
      setPages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
      if (!query) {
          setFilteredPages(pages);
          return;
      }
      const lower = query.toLowerCase();
      setFilteredPages(pages.filter(p => p.title.toLowerCase().includes(lower) || p.slug.toLowerCase().includes(lower)));
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      const res = await fetch(`${API_URL}/landing-pages/${id}`, { method: "DELETE" });
      if (res.ok) {
        addToast("Page deleted", "success");
        fetchPages();
      } else {
        addToast("Failed to delete page", "error");
      }
    } catch (e) {
      addToast("Error deleting page", "error");
    }
  };

  if (loading) return <FullScreenLoader />;

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
            <Heading size="md" className="font-sans text-slate-800 dark:text-white mb-0.5">Landing Pages</Heading>
            <p className="text-xs text-slate-500">Manage custom product landing pages</p>
        </div>
        <Button onClick={() => router.push("/admin/landing-pages/create")} className="rounded-lg shadow-sm py-2 px-4 text-xs h-auto">
            + Create Page
        </Button>
      </div>

      <FilterBar onSearch={handleSearch} placeholder="Search pages..." />

      <Table
        data={filteredPages}
        columns={[
          {
            header: "Title",
            accessorKey: "title",
            className: "font-bold text-slate-900 dark:text-white text-xs"
          },
          {
            header: "Slug",
            cell: (page) => (
                <a href={`/offer/${page.slug}`} target="_blank" className="text-pink-500 hover:underline text-xs font-mono">
                    /offer/{page.slug}
                </a>
            )
          },
          {
            header: "Product",
            accessorKey: "product_name",
            className: "text-slate-600 dark:text-slate-400 text-xs"
          },
          {
            header: "Status",
            cell: (page) => (
                <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                    page.is_active 
                    ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' 
                    : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                }`}>
                    {page.is_active ? 'Active' : 'Inactive'}
                </span>
            )
          },
          {
            header: "Actions",
            className: "text-right",
            cell: (page) => (
              <div className="flex justify-end gap-1">
                  <button 
                  onClick={() => router.push(`/admin/landing-pages/${page.id}/edit`)}
                  className="p-1.5 rounded text-slate-500 hover:bg-pink-50 hover:text-pink-600 transition-colors"
                  title="Edit"
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                  </button>
                  <button 
                  onClick={() => handleDelete(page.id)}
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
