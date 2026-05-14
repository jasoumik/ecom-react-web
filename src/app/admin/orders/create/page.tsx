"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button, Heading } from "@/components/ui";
import { Input } from "@/components/ui/Input";
import { API_URL } from "@/lib/config";
import { useToast } from "@/components/ui/Toast";

export default function CreateManualOrderPage() {
  const [order, setOrder] = useState({
    orderSource: "Website",
    customerName: "",
    customerPhone: "",
    customerAddress: "",
    items: [] as any[],
    discount: 0,
    deliveryCharge: 0,
    paymentMethod: "cod",
    paymentStatus: "Pending",
    paidAmount: 0,
    transactionId: "",
    status: "pending"
  });
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);
  
  // Customer Search State
  const [customers, setCustomers] = useState<any[]>([]);
  const [customerSearch, setCustomerSearch] = useState("");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const { addToast } = useToast();

  useEffect(() => {
    fetch(`${API_URL}/products?limit=100`)
      .then(res => res.json())
      .then(data => setProducts(data.data || []));

    fetch(`${API_URL}/users`)
      .then(res => res.json())
      .then(data => setCustomers(data || []));

    // Click outside to close dropdown
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowCustomerDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddItem = () => {
    if (!selectedProduct) return;
    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;

    setOrder({
      ...order,
      items: [...order.items, { productId: selectedProduct, quantity, name: product.name, price: product.price }]
    });
    setSelectedProduct("");
    setQuantity(1);
  };

  const handleRemoveItem = (index: number) => {
      const newItems = [...order.items];
      newItems.splice(index, 1);
      setOrder({ ...order, items: newItems });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/orders/manual`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
      });
      
      if (res.ok) {
        addToast("Manual order created", "success");
        router.push("/admin/orders");
      } else {
        addToast("Failed to create order", "error");
      }
    } catch (e) {
      addToast("Error creating order", "error");
    }
  };

  const calculateTotal = () => {
      const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      return subtotal + (order.deliveryCharge || 0) - (order.discount || 0);
  };

  const totalAmount = calculateTotal();

  const handlePaymentStatusChange = (status: string) => {
      let newPaidAmount = order.paidAmount;
      if (status === 'Paid') {
          newPaidAmount = totalAmount;
      } else if (status === 'Pending') {
          newPaidAmount = 0;
      }
      setOrder({ ...order, paymentStatus: status, paidAmount: newPaidAmount });
  };

  const handlePaidAmountChange = (amount: number) => {
      let newStatus = 'Partial';
      if (amount >= totalAmount) {
          newStatus = 'Paid';
      } else if (amount <= 0) {
          newStatus = 'Pending';
      }
      setOrder({ ...order, paidAmount: amount, paymentStatus: newStatus });
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) || 
    c.phone.includes(customerSearch)
  );

  const selectCustomer = async (customer: any) => {
    setOrder(prev => ({
      ...prev,
      customerName: customer.name,
      customerPhone: customer.phone,
      customerAddress: "" // Reset address initially
    }));
    setCustomerSearch("");
    setShowCustomerDropdown(false);

    // Fetch address
    try {
      const res = await fetch(`${API_URL}/users/${customer.id}/addresses`);
      if (res.ok) {
        const addresses = await res.json();
        if (addresses && addresses.length > 0) {
          // Prefer default address, otherwise take the first one
          const defaultAddr = addresses.find((a: any) => a.is_default) || addresses[0];
          const fullAddress = [defaultAddr.address, defaultAddr.city, defaultAddr.zip].filter(Boolean).join(", ");
          setOrder(prev => ({ ...prev, customerAddress: fullAddress }));
        }
      }
    } catch (err) {
      console.error("Failed to fetch customer address", err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <Heading size="md" className="font-sans text-slate-900 dark:text-white">Create Manual Order</Heading>
        <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => router.back()} className="rounded-lg py-2 px-4 text-sm h-auto">Cancel</Button>
            <Button type="submit" form="manual-order-form" className="rounded-lg shadow-md shadow-sky-500/20 py-2 px-6 text-sm h-auto">Create Order</Button>
        </div>
      </div>
      
      <form id="manual-order-form" onSubmit={handleCreate} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Customer & Order Details */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-base text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">Customer Information</h3>
                
                {/* Customer Search */}
                <div className="mb-6 relative" ref={searchRef}>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Find Existing Customer</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white text-sm"
                    placeholder="Search by name or phone..."
                    value={customerSearch}
                    onChange={(e) => {
                      setCustomerSearch(e.target.value);
                      setShowCustomerDropdown(true);
                    }}
                    onFocus={() => setShowCustomerDropdown(true)}
                  />
                  {showCustomerDropdown && customerSearch && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredCustomers.length > 0 ? (
                        filteredCustomers.map(customer => (
                          <div 
                            key={customer.id}
                            className="px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer text-sm"
                            onClick={() => selectCustomer(customer)}
                          >
                            <div className="font-medium text-slate-900 dark:text-white">{customer.name}</div>
                            <div className="text-xs text-slate-500">{customer.phone}</div>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-sm text-slate-500 text-center">No customers found</div>
                      )}
                    </div>
                  )}
                  <p className="text-[10px] text-slate-400 mt-1">Search to auto-fill details, or manually enter below for new customers.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Order Source</label>
                        <select 
                            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white text-sm"
                            value={order.orderSource}
                            onChange={e => setOrder({...order, orderSource: e.target.value})}
                        >
                            <option value="Website">Website</option>
                            <option value="Facebook">Facebook</option>
                            <option value="Phone">Phone</option>
                            <option value="WhatsApp">WhatsApp</option>
                        </select>
                    </div>
                    <Input label="Customer Name" value={order.customerName} onChange={e => setOrder({...order, customerName: e.target.value})} required className="bg-slate-50/50" />
                </div>
                <div className="space-y-4">
                    <Input label="Mobile Number" value={order.customerPhone} onChange={e => setOrder({...order, customerPhone: e.target.value})} required className="bg-slate-50/50" />
                    <Input label="Address" value={order.customerAddress} onChange={e => setOrder({...order, customerAddress: e.target.value})} required className="bg-slate-50/50" />
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-base text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">Order Items</h3>
                
                <div className="flex gap-3 mb-4 items-end">
                    <div className="flex-1">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Product</label>
                        <select 
                            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white text-sm"
                            value={selectedProduct}
                            onChange={e => setSelectedProduct(e.target.value)}
                        >
                            <option value="">Select Product</option>
                            {products.map(p => (
                                <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</option>
                            ))}
                        </select>
                    </div>
                    <div className="w-20">
                        <Input label="Qty" type="number" value={quantity} onChange={e => setQuantity(parseInt(e.target.value))} className="bg-slate-50/50" min="1" />
                    </div>
                    <Button type="button" onClick={handleAddItem} className="rounded-lg py-2.5 px-4 text-xs h-auto mb-[2px]">Add</Button>
                </div>
                
                {order.items.length > 0 ? (
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700 overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-100 dark:bg-slate-800 text-xs text-slate-500">
                                <tr>
                                    <th className="px-3 py-2">Product</th>
                                    <th className="px-3 py-2 text-center">Qty</th>
                                    <th className="px-3 py-2 text-right">Price</th>
                                    <th className="px-3 py-2 text-right">Total</th>
                                    <th className="px-3 py-2 w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {order.items.map((item, idx) => (
                                    <tr key={idx}>
                                        <td className="px-3 py-2 font-medium">{item.name}</td>
                                        <td className="px-3 py-2 text-center">{item.quantity}</td>
                                        <td className="px-3 py-2 text-right">৳{item.price}</td>
                                        <td className="px-3 py-2 text-right font-bold">৳{item.price * item.quantity}</td>
                                        <td className="px-3 py-2 text-center">
                                            <button type="button" onClick={() => handleRemoveItem(idx)} className="text-red-500 hover:text-red-700">✕</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-8 text-slate-400 text-xs border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-lg">
                        No items added yet
                    </div>
                )}
            </div>
        </div>

        {/* Right Column: Payment & Summary */}
        <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-base text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">Payment</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Payment Method</label>
                        <select 
                            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white text-sm"
                            value={order.paymentMethod}
                            onChange={e => setOrder({...order, paymentMethod: e.target.value})}
                        >
                            <option value="cod">Cash on Delivery</option>
                            <option value="bkash">bKash</option>
                            <option value="nagad">Nagad</option>
                        </select>
                    </div>
                    
                    {/* Transaction ID for non-COD */}
                    {order.paymentMethod !== 'cod' && (
                        <Input 
                            label="Transaction ID" 
                            value={order.transactionId} 
                            onChange={e => setOrder({...order, transactionId: e.target.value})} 
                            className="bg-slate-50/50" 
                        />
                    )}

                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Payment Status</label>
                        <select 
                            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white text-sm"
                            value={order.paymentStatus}
                            onChange={e => handlePaymentStatusChange(e.target.value)}
                        >
                            <option value="Pending">Pending</option>
                            <option value="Partial">Partial</option>
                            <option value="Paid">Paid</option>
                        </select>
                    </div>

                    {/* Paid Amount Input */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Amount Paid</label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-slate-500 text-sm">৳</span>
                            <input 
                                type="number" 
                                className="w-full pl-7 pr-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white text-sm"
                                value={order.paidAmount}
                                onChange={e => handlePaidAmountChange(parseFloat(e.target.value) || 0)}
                                min="0"
                                max={totalAmount}
                            />
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                            <span>Due: ৳{Math.max(0, totalAmount - order.paidAmount)}</span>
                            <span>Total: ৳{totalAmount}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-base text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">Order Summary</h3>
                <div className="space-y-3">
                    <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                        <span>Subtotal</span>
                        <span>৳{order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-600 dark:text-slate-400">Delivery</span>
                        <input 
                            type="number" 
                            className="w-20 px-2 py-1 text-right text-xs border border-slate-200 rounded bg-slate-50"
                            value={order.deliveryCharge}
                            onChange={e => setOrder({...order, deliveryCharge: parseFloat(e.target.value) || 0})}
                        />
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-600 dark:text-slate-400">Discount</span>
                        <input 
                            type="number" 
                            className="w-20 px-2 py-1 text-right text-xs border border-slate-200 rounded bg-slate-50"
                            value={order.discount}
                            onChange={e => setOrder({...order, discount: parseFloat(e.target.value) || 0})}
                        />
                    </div>
                    <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-white pt-3 border-t border-slate-100 dark:border-slate-800">
                        <span>Total</span>
                        <span>৳{totalAmount}</span>
                    </div>
                </div>
            </div>
        </div>
      </form>
    </div>
  );
}
