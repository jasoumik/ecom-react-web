"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Heading, Button } from "@/components/ui";
import { API_URL } from "@/lib/config";
import { useToast } from "@/components/ui/Toast";
import { Table } from "@/components/ui/Table";
import { FullScreenLoader } from "@/components/ui/Loader";
import { FilterBar } from "@/components/ui/FilterBar";
import { RatingStars } from "@/components/ui";
import { getImageUrl } from "@/lib/utils";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { addToast } = useToast();

  useEffect(() => {
    fetchReviews(1);
  }, []);

  const fetchReviews = async (page: number) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/reviews?page=${page}&limit=20`);
      const data = await res.json();
      if (data.data && Array.isArray(data.data)) {
          setReviews(data.data);
          setFilteredReviews(data.data);
          setMeta(data.meta);
      } else {
          setReviews([]);
          setFilteredReviews([]);
      }
    } catch (e) {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
      if (!query) {
          setFilteredReviews(reviews);
          return;
      }
      const lower = query.toLowerCase();
      setFilteredReviews(reviews.filter(r => 
          r.product_name?.toLowerCase().includes(lower) || 
          r.user_name?.toLowerCase().includes(lower) ||
          r.comment?.toLowerCase().includes(lower)
      ));
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      const res = await fetch(`${API_URL}/reviews/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        addToast(`Review ${status}`, "success");
        fetchReviews(meta.page);
      } else {
        addToast("Failed to update status", "error");
      }
    } catch (e) {
      addToast("Error updating status", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      const res = await fetch(`${API_URL}/reviews/${id}`, { method: "DELETE" });
      if (res.ok) {
        addToast("Review deleted", "success");
        fetchReviews(meta.page);
      } else {
        addToast("Failed to delete review", "error");
      }
    } catch (e) {
      addToast("Error deleting review", "error");
    }
  };

  const getProductImage = (imageStr: string) => {
      if (!imageStr) return "https://picsum.photos/seed/product-item/700/700";
      try {
          const parsed = JSON.parse(imageStr);
          if (Array.isArray(parsed) && parsed.length > 0) return getImageUrl(parsed[0]);
          return getImageUrl(imageStr); // Fallback if parse works but not array (unlikely)
      } catch (e) {
          return getImageUrl(imageStr); // It's a plain string URL
      }
  };

  if (loading && reviews.length === 0) return <FullScreenLoader />;

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
            <Heading size="md" className="font-sans text-slate-800 dark:text-white mb-0.5">Reviews</Heading>
            <p className="text-xs text-slate-500">Manage customer reviews</p>
        </div>
        <Button onClick={() => router.push("/admin/reviews/create")} className="rounded-lg shadow-sm py-2 px-4 text-xs h-auto">
            + Add Review
        </Button>
      </div>

      <FilterBar onSearch={handleSearch} placeholder="Search reviews..." />

      <Table
        data={filteredReviews}
        columns={[
          {
            header: "Product",
            cell: (review) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-slate-100 overflow-hidden shrink-0">
                        <img 
                            src={getProductImage(review.product_image)} 
                            alt={review.product_name} 
                            className="w-full h-full object-cover" 
                        />
                    </div>
                    <div className="font-bold text-slate-900 dark:text-white text-xs max-w-[150px] truncate" title={review.product_name}>
                        {review.product_name}
                    </div>
                </div>
            )
          },
          {
            header: "User",
            accessorKey: "user_name",
            className: "text-slate-700 dark:text-slate-300 text-xs"
          },
          {
            header: "Rating",
            cell: (review) => <RatingStars rating={review.rating} size="sm" />
          },
          {
            header: "Comment",
            cell: (review) => (
                <div className="text-xs text-slate-600 dark:text-slate-400 max-w-xs truncate" title={review.comment}>
                    {review.comment || '-'}
                </div>
            )
          },
          {
            header: "Status",
            cell: (review) => (
                <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                    review.status === 'approved' ? 'bg-green-50 text-green-600' :
                    review.status === 'rejected' ? 'bg-red-50 text-red-600' :
                    'bg-amber-50 text-amber-600'
                }`}>
                    {review.status}
                </span>
            )
          },
          {
            header: "Date",
            cell: (review) => <span className="text-slate-500 dark:text-slate-400 text-[10px]">{new Date(review.created_at).toLocaleDateString()}</span>
          },
          {
            header: "Actions",
            className: "text-right",
            cell: (review) => (
              <div className="flex justify-end gap-1">
                  {review.status === 'pending' && (
                      <>
                        <button 
                            onClick={() => handleStatusUpdate(review.id, 'approved')}
                            className="p-1.5 rounded text-green-600 hover:bg-green-50 transition-colors"
                            title="Approve"
                        >
                            ✓
                        </button>
                        <button 
                            onClick={() => handleStatusUpdate(review.id, 'rejected')}
                            className="p-1.5 rounded text-amber-600 hover:bg-amber-50 transition-colors"
                            title="Reject"
                        >
                            ✕
                        </button>
                      </>
                  )}
                  <button 
                    onClick={() => handleDelete(review.id)}
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
              onClick={() => fetchReviews(meta.page - 1)}
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
              onClick={() => fetchReviews(meta.page + 1)}
              className="rounded-lg py-1.5 px-3 text-xs h-auto"
          >
              Next
          </Button>
      </div>
    </div>
  );
}
