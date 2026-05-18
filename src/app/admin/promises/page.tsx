"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Heading } from "@/components/ui";
import { API_URL } from "@/lib/config";
import { useToast } from "@/components/ui/Toast";
import { Table } from "@/components/ui/Table";
import { FullScreenLoader } from "@/components/ui/Loader";

export default function AdminPromisesPage() {
  const [promises, setPromises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { addToast } = useToast();

  useEffect(() => {
    fetchPromises();
  }, []);

  const fetchPromises = async () => {
    try {
      const res = await fetch(`${API_URL}/promises`);
      const data = await res.json();
      setPromises(Array.isArray(data) ? data : []);
    } catch (e) {
      setPromises([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      const res = await fetch(`${API_URL}/promises/${id}`, { method: "DELETE" });
      if (res.ok) {
        addToast("Promise deleted", "success");
        fetchPromises();
      } else {
        addToast("Failed to delete promise", "error");
      }
    } catch (e) {
      addToast("Error deleting promise", "error");
    }
  };

  if (loading) return <FullScreenLoader />;

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
            <Heading size="md" className="font-sans text-slate-800 dark:text-white mb-0.5">Promises</Heading>
            <p className="text-xs text-slate-500">Manage "Why Choose Us" section</p>
        </div>
        <Button onClick={() => router.push("/admin/promises/create")} className="rounded-lg shadow-sm py-2 px-4 text-xs h-auto">
            + Add Promise
        </Button>
      </div>

      <Table
        data={promises}
        columns={[
          {
            header: "Icon",
            cell: (promise) => (
              <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl shadow-sm border border-slate-200 dark:border-slate-700">
                {promise.icon.startsWith('http') ? (
                    <img src={promise.icon} alt={promise.title} className="w-6 h-6 object-contain" />
                ) : (
                    <span>{promise.icon}</span>
                )}
              </div>
            )
          },
          {
            header: "Title",
            accessorKey: "title",
            className: "font-bold text-slate-900 dark:text-white text-xs"
          },
          {
            header: "Description",
            accessorKey: "description",
            className: "text-slate-600 dark:text-slate-300 text-xs max-w-xs truncate"
          },
          {
            header: "Order",
            accessorKey: "order",
            className: "text-slate-500 text-xs"
          },
          {
            header: "Status",
            cell: (promise) => (
                <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                    promise.is_active 
                    ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' 
                    : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                }`}>
                    {promise.is_active ? 'Active' : 'Inactive'}
                </span>
            )
          },
          {
            header: "Actions",
            className: "text-right",
            cell: (promise) => (
              <div className="flex justify-end gap-1">
                  <button 
                  onClick={() => router.push(`/admin/promises/${promise.id}/edit`)}
                  className="p-1.5 rounded text-slate-500 hover:bg-pink-50 hover:text-pink-600 transition-colors"
                  title="Edit"
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                  </button>
                  <button 
                  onClick={() => handleDelete(promise.id)}
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
