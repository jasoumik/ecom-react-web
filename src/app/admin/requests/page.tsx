"use client";

import { useEffect, useState } from "react";
import { Heading, Button } from "@/components/ui";
import { API_URL } from "@/lib/config";
import { useToast } from "@/components/ui/Toast";
import { Table } from "@/components/ui/Table";
import { FullScreenLoader } from "@/components/ui/Loader";

export default function AdminRequestsPage() {
  const [activeTab, setActiveTab] = useState<'stock' | 'product' | 'contact'>('stock');
  const [stockRequests, setStockRequests] = useState<any[]>([]);
  const [productRequests, setProductRequests] = useState<any[]>([]);
  const [contactMessages, setContactMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    fetchRequests();
  }, [activeTab]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      if (activeTab === 'stock') {
          const res = await fetch(`${API_URL}/requests/stock`);
          const data = await res.json();
          setStockRequests(Array.isArray(data) ? data : []);
      } else if (activeTab === 'product') {
          const res = await fetch(`${API_URL}/requests/product`);
          const data = await res.json();
          setProductRequests(Array.isArray(data) ? data : []);
      } else {
          const res = await fetch(`${API_URL}/requests/contact`);
          const data = await res.json();
          setContactMessages(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleProductRequestStatus = async (id: string, status: string) => {
      try {
          const res = await fetch(`${API_URL}/requests/product/${id}/status`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ status }),
          });
          if (res.ok) {
              addToast(`Request marked as ${status}`, "success");
              fetchRequests();
          } else {
              addToast("Failed to update status", "error");
          }
      } catch (e) {
          addToast("Error updating status", "error");
      }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <Heading size="md" className="font-sans text-slate-800 dark:text-white mb-0.5">Requests</Heading>
        <p className="text-xs text-slate-500">Manage customer requests and messages</p>
      </div>

      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800">
          <button 
            onClick={() => setActiveTab('stock')}
            className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'stock' ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
              Stock Notifications
          </button>
          <button 
            onClick={() => setActiveTab('product')}
            className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'product' ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
              Product Ideas
          </button>
          <button 
            onClick={() => setActiveTab('contact')}
            className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'contact' ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
              Contact Messages
          </button>
      </div>

      {loading ? <FullScreenLoader /> : (
          activeTab === 'stock' ? (
            <Table
                data={stockRequests}
                emptyMessage="No stock requests found."
                columns={[
                {
                    header: "Product",
                    accessorKey: "product_name",
                    className: "font-bold text-slate-900 dark:text-white text-xs"
                },
                {
                    header: "Customer",
                    cell: (req) => (
                        <div>
                            <div className="text-xs font-medium text-slate-900 dark:text-white">{req.phone}</div>
                            <div className="text-[10px] text-slate-500">{req.email || '-'}</div>
                        </div>
                    )
                },
                {
                    header: "Date",
                    cell: (req) => <span className="text-slate-500 dark:text-slate-400 text-xs">{new Date(req.created_at).toLocaleDateString()}</span>
                },
                {
                    header: "Status",
                    cell: (req) => (
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                            req.status === 'notified' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                            {req.status}
                        </span>
                    )
                }
                ]}
            />
          ) : activeTab === 'product' ? (
            <Table
                data={productRequests}
                emptyMessage="No product requests found."
                columns={[
                {
                    header: "Product Idea",
                    cell: (req) => (
                        <div>
                            <div className="font-bold text-slate-900 dark:text-white text-xs">{req.product_name}</div>
                            <div className="text-[10px] text-slate-500 max-w-xs truncate">{req.description}</div>
                        </div>
                    )
                },
                {
                    header: "Customer",
                    cell: (req) => (
                        <div>
                            <div className="text-xs font-medium text-slate-900 dark:text-white">{req.user_name}</div>
                            <div className="text-[10px] text-slate-500">{req.phone}</div>
                        </div>
                    )
                },
                {
                    header: "Date",
                    cell: (req) => <span className="text-slate-500 dark:text-slate-400 text-xs">{new Date(req.created_at).toLocaleDateString()}</span>
                },
                {
                    header: "Status",
                    cell: (req) => (
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                            req.status === 'fulfilled' ? 'bg-green-50 text-green-600' : 
                            req.status === 'rejected' ? 'bg-red-50 text-red-600' :
                            'bg-amber-50 text-amber-600'
                        }`}>
                            {req.status}
                        </span>
                    )
                },
                {
                    header: "Actions",
                    className: "text-right",
                    cell: (req) => (
                        <div className="flex justify-end gap-2">
                            {req.status === 'pending' && (
                                <>
                                    <button 
                                        onClick={() => handleProductRequestStatus(req.id, 'fulfilled')}
                                        className="text-green-600 hover:bg-green-50 p-1 rounded text-[10px] font-bold"
                                    >
                                        Fulfill
                                    </button>
                                    <button 
                                        onClick={() => handleProductRequestStatus(req.id, 'rejected')}
                                        className="text-red-600 hover:bg-red-50 p-1 rounded text-[10px] font-bold"
                                    >
                                        Reject
                                    </button>
                                </>
                            )}
                        </div>
                    )
                }
                ]}
            />
          ) : (
            <Table
                data={contactMessages}
                emptyMessage="No contact messages found."
                columns={[
                {
                    header: "Subject",
                    cell: (msg) => (
                        <div>
                            <div className="font-bold text-slate-900 dark:text-white text-xs">{msg.subject}</div>
                            <div className="text-[10px] text-slate-500 max-w-xs truncate">{msg.message}</div>
                        </div>
                    )
                },
                {
                    header: "Sender",
                    cell: (msg) => (
                        <div>
                            <div className="text-xs font-medium text-slate-900 dark:text-white">{msg.name}</div>
                            <div className="text-[10px] text-slate-500">{msg.email}</div>
                        </div>
                    )
                },
                {
                    header: "Date",
                    cell: (msg) => <span className="text-slate-500 dark:text-slate-400 text-xs">{new Date(msg.created_at).toLocaleString()}</span>
                },
                {
                    header: "Status",
                    cell: (msg) => (
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                            msg.status === 'read' ? 'bg-slate-100 text-slate-600' : 'bg-blue-50 text-blue-600'
                        }`}>
                            {msg.status}
                        </span>
                    )
                }
                ]}
            />
          )
      )}
    </div>
  );
}
