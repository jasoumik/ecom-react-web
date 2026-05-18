"use client";

import { useEffect, useState } from "react";
import { Heading, Button } from "@/components/ui";
import { API_URL } from "@/lib/config";
import { Table } from "@/components/ui/Table";
import { useToast } from "@/components/ui/Toast";
import { useRouter } from "next/navigation";

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const { addToast } = useToast();
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    if (storedUser.id) {
        setUser(storedUser);
        fetchOrders(storedUser.id);
    }
  }, []);

  const fetchOrders = async (userId: string) => {
      try {
        const res = await fetch(`${API_URL}/orders/my-orders?userId=${userId}`);
        const data = await res.json();
        setOrders(data);
      } catch (e) {
          console.error(e);
      }
  };

  const handleCancel = async (orderId: string) => {
      if (!confirm("Are you sure you want to cancel this order?")) return;
      try {
          const res = await fetch(`${API_URL}/orders/${orderId}/cancel`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId: user.id }),
          });
          if (res.ok) {
              addToast("Order cancelled successfully", "success");
              fetchOrders(user.id);
          } else {
              const err = await res.json();
              addToast(err.message || "Failed to cancel order", "error");
          }
      } catch (e) {
          addToast("Error cancelling order", "error");
      }
  };

  return (
    <div className="space-y-6">
      <Heading size="lg" className="font-sans text-slate-900 dark:text-white">My Orders</Heading>

      <Table
        data={orders}
        emptyMessage="You haven't placed any orders yet."
        columns={[
          {
            header: "Order #",
            cell: (order) => <span className="font-bold text-slate-900 dark:text-white">#{order.order_number}</span>
          },
          {
            header: "Date",
            cell: (order) => <span className="text-slate-600 dark:text-slate-300">{new Date(order.created_at).toLocaleDateString()}</span>
          },
          {
            header: "Summary",
            cell: (order) => (
                <div className="text-sm">
                    <div className="text-slate-900 dark:text-white font-medium">{order.items?.length || 0} items</div>
                    <div className="text-slate-500 text-xs">
                        Sub: ৳{order.subtotal} | Del: ৳{order.delivery_charge}
                        {order.discount > 0 && <span className="text-green-600 ml-1">| Disc: -৳{order.discount}</span>}
                    </div>
                </div>
            )
          },
          {
            header: "Total",
            cell: (order) => <span className="font-bold text-slate-900 dark:text-white text-lg">৳{order.total_amount}</span>
          },
          {
            header: "Status",
            cell: (order) => (
              <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-bold capitalize ${
                  order.status === 'completed' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' :
                  order.status === 'pending' ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400' :
                  order.status === 'cancelled' ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' :
                  'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
              }`}>
                  {order.status}
              </span>
            )
          },
          {
            header: "Actions",
            className: "text-right",
            cell: (order) => (
                <div className="flex justify-end gap-2">
                    <Button 
                        variant="outline" 
                        className="text-rose-400 border-rose-200 hover:bg-rose-50 hover:border-rose-200 px-4 py-2 text-xs rounded-xl"
                        onClick={() => router.push(`/profile/orders/${order.id}`)}
                    >
                        View Invoice
                    </Button>
                    {order.status === 'pending' && (
                        <Button 
                            variant="outline" 
                            className="text-red-500 border-red-200 hover:bg-red-50 hover:border-red-300 px-4 py-2 text-xs rounded-xl"
                            onClick={() => handleCancel(order.id)}
                        >
                            Cancel
                        </Button>
                    )}
                </div>
            )
          }
        ]}
        mobileRenderer={(order) => (
            <div className="flex flex-col gap-3 p-2">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="font-bold text-slate-900 dark:text-white">#{order.order_number}</div>
                        <div className="text-xs text-slate-500">{new Date(order.created_at).toLocaleDateString()}</div>
                    </div>
                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                        order.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 
                        order.status === 'cancelled' ? 'bg-red-50 text-red-600' :
                        'bg-amber-50 text-amber-600'
                    }`}>
                        {order.status}
                    </span>
                </div>
                <div className="flex justify-between items-center text-sm border-t border-slate-100 dark:border-slate-800 pt-2 mt-1">
                    <div className="text-slate-600 dark:text-slate-300">
                        {order.items?.length || 0} items
                        <div className="text-xs text-slate-400">Del: ৳{order.delivery_charge}</div>
                    </div>
                    <div className="text-right">
                        <div className="font-bold text-slate-900 dark:text-white text-lg">৳{order.total_amount}</div>
                    </div>
                </div>
                <div className="flex gap-2 mt-2">
                    <Button 
                        variant="outline"
                        onClick={() => router.push(`/profile/orders/${order.id}`)}
                        className="flex-1 rounded-xl text-xs py-2 px-4 border-slate-200 dark:border-slate-700"
                    >
                        Invoice
                    </Button>
                    {order.status === 'pending' && (
                        <Button 
                            variant="outline"
                            onClick={() => handleCancel(order.id)}
                            className="flex-1 rounded-xl text-xs py-2 px-4 text-red-500 border-red-200 hover:bg-red-50"
                        >
                            Cancel
                        </Button>
                    )}
                </div>
            </div>
        )}
      />
    </div>
  );
}
