"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Heading } from "@/components/ui";
import { API_URL } from "@/lib/config";
import { useToast } from "@/components/ui/Toast";
import { Table } from "@/components/ui/Table";
import { FullScreenLoader } from "@/components/ui/Loader";

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { addToast } = useToast();

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const res = await fetch(`${API_URL}/banners?all=true`);
      const data = await res.json();
      setBanners(Array.isArray(data) ? data : []);
    } catch (e) {
      setBanners([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure?")) return;
    try {
      const res = await fetch(`${API_URL}/banners/${id}`, { method: "DELETE" });
      if (res.ok) {
        addToast("Banner deleted", "success");
        fetchBanners();
      } else {
        addToast("Failed to delete banner", "error");
      }
    } catch (e) {
      addToast("Error deleting banner", "error");
    }
  };

  const getBannerStatus = (banner: any) => {
    const today = new Date().toISOString().split('T')[0];

    if (!banner.is_active) return { label: 'Inactive', color: 'bg-slate-100 text-slate-600' };
    if (banner.starts_at && banner.starts_at > today) return { label: 'Scheduled', color: 'bg-blue-50 text-blue-600' };
    if (!banner.no_expiry && banner.expires_at && banner.expires_at < today) return { label: 'Expired', color: 'bg-red-50 text-red-600' };
    return { label: 'Active', color: 'bg-green-50 text-green-600' };
  };

  const formatDate = (date: string | null) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) return <FullScreenLoader />;

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
            <Heading size="md" className="font-sans text-slate-800 dark:text-white mb-0.5">Banners</Heading>
            <p className="text-xs text-slate-500">Manage homepage banners and promotions</p>
        </div>
        <Button onClick={() => router.push("/admin/banners/create")} className="rounded-lg shadow-sm py-2 px-4 text-xs h-auto">
            + Add Banner
        </Button>
      </div>

      <Table
        data={banners}
        onRowClick={(banner) => router.push(`/admin/banners/${banner.id}/edit`)}
        columns={[
          {
            header: "Image",
            cell: (banner) => (
              <div className="w-24 h-10 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 dark:border-slate-700">
                <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
              </div>
            )
          },
          {
            header: "Title",
            accessorKey: "title",
            className: "font-bold text-slate-900 dark:text-white text-xs"
          },
          {
            header: "Position",
            cell: (banner) => (
              <span className="text-xs text-slate-600 dark:text-slate-400 capitalize">
                {banner.position || 'hero'}
              </span>
            )
          },
          {
            header: "Label",
            cell: (banner) => banner.label_name ? (
              <span
                className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold"
                style={{ backgroundColor: banner.label_bg_color || '#eff6ff', color: banner.label_color || '#3b82f6' }}
              >
                {banner.label_name}
              </span>
            ) : (
              <span className="text-xs text-slate-400">—</span>
            )
          },
          {
            header: "Schedule",
            cell: (banner) => (
              <div className="text-xs text-slate-500">
                {banner.no_expiry ? (
                  <span className="text-green-600">No Expiry</span>
                ) : (
                  <span>{formatDate(banner.starts_at)} - {formatDate(banner.expires_at)}</span>
                )}
              </div>
            )
          },
          {
            header: "Status",
            cell: (banner) => {
              const status = getBannerStatus(banner);
              return (
                <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${status.color}`}>
                  {status.label}
                </span>
              );
            }
          },
          {
            header: "Order",
            accessorKey: "order",
            className: "text-slate-600 dark:text-slate-300 text-xs"
          },
          {
            header: "Actions",
            className: "text-right",
            cell: (banner) => (
              <div className="flex justify-end gap-1">
                  <button 
                  onClick={(e) => { e.stopPropagation(); router.push(`/admin/banners/${banner.id}/edit`); }}
                  className="p-1.5 rounded text-slate-500 hover:bg-pink-50 hover:text-pink-600 transition-colors"
                  title="Edit"
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                  </button>
                  <button 
                  onClick={(e) => handleDelete(banner.id, e)}
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
