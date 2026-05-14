"use client";

import { useEffect, useState } from "react";
import { Heading, Text } from "@/components/ui";
import { API_URL } from "@/lib/config";
import { FullScreenLoader } from "@/components/ui/Loader";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch(`${API_URL}/dashboard/stats`)
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <FullScreenLoader />;
  if (!stats) return <div className="p-8 text-center text-slate-500">Failed to load stats.</div>;

  const totalRevenue = stats.totalRevenue || 0;
  const totalOrders = stats.totalOrders || 0;
  const totalProducts = stats.totalProducts || 0;
  const totalUsers = stats.totalUsers || 0;
  const recentOrders = stats.recentOrders || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
            title="Total Revenue" 
            value={`৳${totalRevenue.toLocaleString()}`} 
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>}
            color="from-emerald-400 to-teal-500" 
            trend="+12.5%" 
            trendUp={true}
        />
        <StatCard 
            title="Total Orders" 
            value={totalOrders} 
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>}
            color="from-blue-400 to-indigo-500" 
            trend="+5.2%" 
            trendUp={true}
        />
        <StatCard 
            title="Total Products" 
            value={totalProducts} 
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>}
            color="from-violet-400 to-purple-500" 
            trend="+2.1%" 
            trendUp={true}
        />
        <StatCard 
            title="Total Customers" 
            value={totalUsers} 
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>}
            color="from-amber-400 to-orange-500" 
            trend="+8.4%" 
            trendUp={true}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <h3 className="font-bold text-base text-slate-800 dark:text-white">Recent Orders</h3>
                <button 
                    onClick={() => router.push('/admin/orders')}
                    className="text-xs font-medium text-sky-500 hover:text-sky-600 hover:underline"
                >
                    View All
                </button>
            </div>
            <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-slate-50/50 dark:bg-slate-800/50">
                <tr>
                    <th className="px-4 py-3 font-semibold text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-wider">Order ID</th>
                    <th className="px-4 py-3 font-semibold text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-wider">Customer</th>
                    <th className="px-4 py-3 font-semibold text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-wider">Amount</th>
                    <th className="px-4 py-3 font-semibold text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-wider">Status</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentOrders.length === 0 ? (
                    <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-500 text-xs">No recent orders found</td>
                    </tr>
                ) : (
                    recentOrders.map((order: any) => (
                    <tr key={order.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300 text-xs">#{order.order_number}</td>
                        <td className="px-4 py-3">
                            <div className="font-medium text-slate-900 dark:text-white text-xs">{order.customer_name}</div>
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-900 dark:text-white text-xs">৳{order.total_amount}</td>
                        <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold capitalize tracking-wide ${
                            order.status === 'completed' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' :
                            order.status === 'pending' ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400' :
                            'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                            {order.status}
                        </span>
                        </td>
                    </tr>
                    ))
                )}
                </tbody>
            </table>
            </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 p-4">
            <h3 className="font-bold text-base text-slate-800 dark:text-white mb-4">Analytics</h3>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                        </div>
                        <div>
                            <div className="text-xs font-medium text-slate-500">Sales</div>
                            <div className="font-bold text-slate-900 dark:text-white text-sm">Total Sales</div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="font-bold text-slate-900 dark:text-white text-sm">৳{totalRevenue.toLocaleString()}</div>
                        <div className="text-[10px] text-green-500">+12%</div>
                    </div>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                    <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '70%' }}></div>
                </div>
                
                <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center text-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                        </div>
                        <div>
                            <div className="text-xs font-medium text-slate-500">Users</div>
                            <div className="font-bold text-slate-900 dark:text-white text-sm">New Customers</div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="font-bold text-slate-900 dark:text-white text-sm">{totalUsers}</div>
                        <div className="text-[10px] text-green-500">+5%</div>
                    </div>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                    <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: '45%' }}></div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color, trend, trendUp }: any) {
  return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden group hover:shadow-md transition-all duration-300">
      <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${color} opacity-10 rounded-bl-[60px] transition-transform group-hover:scale-110 duration-500`}></div>
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-3">
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center text-white text-lg shadow-lg shadow-indigo-500/20`}>
                {icon}
            </div>
            {trend && (
                <div className={`flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded ${trendUp ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    {trendUp ? '↑' : '↓'} {trend}
                </div>
            )}
        </div>
        <div>
            <div className="text-2xl font-bold text-slate-800 dark:text-white mb-0.5 tracking-tight">{value}</div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">{title}</div>
        </div>
      </div>
    </div>
  );
}
