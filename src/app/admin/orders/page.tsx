"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Heading, Button } from "@/components/ui";
import { API_URL } from "@/lib/config";
import { useToast } from "@/components/ui/Toast";
import { Table } from "@/components/ui/Table";
import { FilterBar } from "@/components/ui/FilterBar";
import { Input } from "@/components/ui/Input";

const STATUS_OPTIONS = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Status Modal State
  const [statusModal, setStatusModal] = useState<{ id: string, status: string } | null>(null);
  const [statusComment, setStatusComment] = useState("");

  // Payment Modal State
  const [paymentModal, setPaymentModal] = useState<{ 
      id: string, 
      total: number, 
      paid: number, 
      orderNumber: string,
      paymentPhone?: string,
      transactionId?: string
  } | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [transactionId, setTransactionId] = useState("");
  const [paymentNote, setPaymentNote] = useState("");
  const [orderPayments, setOrderPayments] = useState<any[]>([]);

  const router = useRouter();
  const { addToast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
        const res = await fetch(`${API_URL}/orders`);
        const data = await res.json();
        setOrders(data);
        setFilteredOrders(data);
    } catch (e) {
        setOrders([]);
    } finally {
        setLoading(false);
    }
  };

  const fetchOrderPayments = async (orderId: string) => {
      try {
          const res = await fetch(`${API_URL}/orders/${orderId}`);
          const data = await res.json();
          setOrderPayments(data.payments || []);
          
          // Update modal with latest payment info from order
          setPaymentModal(prev => prev ? ({
              ...prev,
              paymentPhone: data.payment_phone,
              transactionId: data.transaction_id
          }) : null);
      } catch (e) {
          console.error("Failed to fetch payments");
      }
  };

  const handleSearch = (query: string) => {
      if (!query) {
          setFilteredOrders(orders);
          return;
      }
      const lower = query.toLowerCase();
      setFilteredOrders(orders.filter(o => 
          o.order_number?.toString().includes(lower) || 
          o.customer_name?.toLowerCase().includes(lower) ||
          o.customer_phone?.includes(lower)
      ));
  };

  const confirmStatusUpdate = async () => {
    if (!statusModal) return;
    
    try {
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;

      const res = await fetch(`${API_URL}/orders/${statusModal.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            status: statusModal.status,
            comment: statusComment,
            userId: user?.id
        }),
      });
      
      if (res.ok) {
        addToast(`Order marked as ${statusModal.status}`, "success");
        fetchOrders();
        setStatusModal(null);
        setStatusComment("");
      } else {
        const err = await res.json();
        addToast(err.message || "Failed to update status", "error");
      }
    } catch (e) {
      addToast("Error updating status", "error");
    }
  };

  const handleAddPayment = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!paymentModal) return;

      try {
          const res = await fetch(`${API_URL}/orders/${paymentModal.id}/payments`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                  amount: parseFloat(paymentAmount),
                  method: paymentMethod,
                  transactionId,
                  note: paymentNote
              })
          });

          if (res.ok) {
              addToast("Payment added successfully", "success");
              fetchOrders(); // Refresh list to update totals/status
              fetchOrderPayments(paymentModal.id); // Refresh payments list
              setPaymentAmount("");
              setTransactionId("");
              setPaymentNote("");
              // Update local modal state to reflect new paid amount
              setPaymentModal(prev => prev ? ({ ...prev, paid: prev.paid + parseFloat(paymentAmount) }) : null);
          } else {
              addToast("Failed to add payment", "error");
          }
      } catch (e) {
          addToast("Error adding payment", "error");
      }
  };

  const openPaymentModal = (order: any) => {
      setPaymentModal({
          id: order.id,
          total: parseFloat(order.total_amount),
          paid: parseFloat(order.paid_amount || 0),
          orderNumber: order.order_number,
          paymentPhone: order.payment_phone,
          transactionId: order.transaction_id
      });
      setPaymentAmount("");
      setTransactionId("");
      setPaymentNote("");
      fetchOrderPayments(order.id);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
            <Heading size="md" className="font-sans text-slate-800 dark:text-white mb-0.5">Orders</Heading>
            <p className="text-xs text-slate-500">Manage orders</p>
        </div>
        <Button onClick={() => router.push("/admin/orders/create")} className="rounded-lg shadow-sm py-2 px-4 text-xs h-auto">
            + Create Order
        </Button>
      </div>

      <FilterBar onSearch={handleSearch} placeholder="Search orders..." />

      <Table
        data={filteredOrders}
        columns={[
          {
            header: "ID",
            cell: (order) => <span className="font-medium text-slate-700 dark:text-slate-300 text-xs">#{order.order_number}</span>
          },
          {
            header: "Source",
            cell: (order) => (
                <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                    {order.order_source || 'Website'}
                </span>
            )
          },
          {
            header: "Customer",
            cell: (order) => (
                <div>
                    <div className="font-bold text-slate-900 dark:text-white text-xs">{order.customer_name}</div>
                    <div className="text-[10px] text-slate-500">{order.customer_phone}</div>
                </div>
            )
          },
          {
            header: "Payment",
            cell: (order) => {
                const paid = parseFloat(order.paid_amount || 0);
                const total = parseFloat(order.total_amount);
                const status = order.payment_status || (paid >= total ? 'Paid' : paid > 0 ? 'Partial' : 'Pending');
                
                return (
                    <div>
                        <div className={`text-[10px] font-bold uppercase ${
                            status === 'Paid' ? 'text-emerald-600' : 
                            status === 'Partial' ? 'text-blue-600' : 
                            'text-amber-600'
                        }`}>
                            {status}
                        </div>
                        <div className="text-[10px] text-slate-500">
                            {paid > 0 ? `৳${paid} / ৳${total}` : `৳${total}`}
                        </div>
                    </div>
                );
            }
          },
          {
            header: "Status",
            cell: (order) => (
                <select
                    value={order.status}
                    onChange={(e) => setStatusModal({ id: order.id, status: e.target.value })}
                    className={`text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded border-none focus:ring-0 cursor-pointer ${
                        order.status === 'completed' || order.status === 'delivered' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' :
                        order.status === 'pending' ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400' :
                        order.status === 'cancelled' ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' :
                        'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                >
                    {STATUS_OPTIONS.map(s => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
            )
          },
          {
            header: "Actions",
            className: "text-right",
            cell: (order) => (
              <div className="flex justify-end gap-1">
                  <button 
                    onClick={() => openPaymentModal(order)}
                    className="p-1.5 rounded text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                    title="Manage Payments"
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                  </button>
                  <button 
                    onClick={() => router.push(`/profile/orders/${order.id}`)} 
                    className="p-1.5 rounded text-slate-500 hover:bg-sky-50 hover:text-sky-600 transition-colors"
                    title="View Invoice"
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  </button>
              </div>
            )
          }
        ]}
      />

      {/* Status Update Modal */}
      {statusModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
              <div className="bg-white dark:bg-slate-900 w-full max-w-sm p-6 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Update Status</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                      Change status to <span className="font-bold uppercase">{statusModal.status}</span>?
                  </p>
                  
                  <div className="mb-6">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Comment (Optional)</label>
                      <textarea 
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-slate-500 text-sm"
                          value={statusComment}
                          onChange={(e) => setStatusComment(e.target.value)}
                          rows={3}
                          placeholder="Add a note about this status change..."
                      />
                  </div>
                  
                  <div className="flex justify-end gap-3">
                      <Button variant="outline" onClick={() => { setStatusModal(null); setStatusComment(""); }} className="rounded-lg py-2 px-4 text-xs h-auto">Cancel</Button>
                      <Button onClick={confirmStatusUpdate} className="rounded-lg py-2 px-4 text-xs h-auto bg-sky-500 text-white hover:bg-sky-600">Confirm Update</Button>
                  </div>
              </div>
          </div>
      )}

      {/* Payment Modal */}
      {paymentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
              <div className="bg-white dark:bg-slate-900 w-full max-w-md p-6 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">Payments - Order #{paymentModal.orderNumber}</h3>
                      <button onClick={() => setPaymentModal(null)} className="text-slate-400 hover:text-slate-600">✕</button>
                  </div>

                  {/* Customer Payment Info (if available) */}
                  {(paymentModal.paymentPhone || paymentModal.transactionId) && (
                      <div className="bg-sky-50 dark:bg-sky-900/20 p-4 rounded-xl mb-6 border border-sky-100 dark:border-sky-800">
                          <h4 className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-2">Customer Payment Details</h4>
                          <div className="grid grid-cols-2 gap-4">
                              {paymentModal.paymentPhone && (
                                  <div>
                                      <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase">Sender Phone</div>
                                      <div className="font-bold text-slate-900 dark:text-white text-sm">{paymentModal.paymentPhone}</div>
                                  </div>
                              )}
                              {paymentModal.transactionId && (
                                  <div>
                                      <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase">Transaction ID</div>
                                      <div className="font-mono font-bold text-slate-900 dark:text-white text-sm">{paymentModal.transactionId}</div>
                                  </div>
                              )}
                          </div>
                      </div>
                  )}

                  {/* Summary */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl mb-6 grid grid-cols-3 gap-4 text-center">
                      <div>
                          <div className="text-xs text-slate-500 mb-1">Total</div>
                          <div className="font-bold text-slate-900 dark:text-white">৳{paymentModal.total}</div>
                      </div>
                      <div>
                          <div className="text-xs text-slate-500 mb-1">Paid</div>
                          <div className="font-bold text-emerald-600">৳{paymentModal.paid}</div>
                      </div>
                      <div>
                          <div className="text-xs text-slate-500 mb-1">Due</div>
                          <div className="font-bold text-red-500">৳{Math.max(0, paymentModal.total - paymentModal.paid)}</div>
                      </div>
                  </div>

                  {/* Add Payment Form */}
                  <form onSubmit={handleAddPayment} className="space-y-4 mb-6 border-b border-slate-100 dark:border-slate-800 pb-6">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Add Payment</h4>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Amount</label>
                              <Input 
                                  type="number" 
                                  value={paymentAmount} 
                                  onChange={e => setPaymentAmount(e.target.value)} 
                                  required 
                                  min="1"
                                  max={paymentModal.total - paymentModal.paid}
                                  placeholder="Amount"
                                  className="bg-slate-50/50"
                              />
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Method</label>
                              <select 
                                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white text-sm"
                                  value={paymentMethod}
                                  onChange={e => setPaymentMethod(e.target.value)}
                              >
                                  <option value="cod">Cash</option>
                                  <option value="bkash">bKash</option>
                                  <option value="nagad">Nagad</option>
                                  <option value="bank">Bank Transfer</option>
                              </select>
                          </div>
                      </div>
                      {paymentMethod !== 'cod' && (
                          <Input 
                              label="Transaction ID" 
                              value={transactionId} 
                              onChange={e => setTransactionId(e.target.value)} 
                              className="bg-slate-50/50"
                          />
                      )}
                      <Input 
                          label="Note (Optional)" 
                          value={paymentNote} 
                          onChange={e => setPaymentNote(e.target.value)} 
                          className="bg-slate-50/50"
                      />
                      <Button type="submit" className="w-full rounded-lg py-2 text-sm bg-emerald-500 hover:bg-emerald-600 text-white">
                          Add Payment
                      </Button>
                  </form>

                  {/* Payment History */}
                  <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Payment History</h4>
                      {orderPayments.length > 0 ? (
                          <div className="space-y-2">
                              {orderPayments.map((payment: any) => (
                                  <div key={payment.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/30 rounded-lg text-sm">
                                      <div>
                                          <div className="font-medium text-slate-900 dark:text-white">৳{payment.amount} <span className="text-slate-400 font-normal">via {payment.method}</span></div>
                                          <div className="text-xs text-slate-500">{new Date(payment.created_at).toLocaleDateString()}</div>
                                          {payment.note && <div className="text-xs text-slate-400 mt-0.5">{payment.note}</div>}
                                      </div>
                                      {payment.transaction_id && (
                                          <div className="text-xs bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded text-slate-600 dark:text-slate-300 font-mono">
                                              {payment.transaction_id}
                                          </div>
                                      )}
                                  </div>
                              ))}
                          </div>
                      ) : (
                          <div className="text-center py-4 text-slate-400 text-xs">No payments recorded yet</div>
                      )}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}
