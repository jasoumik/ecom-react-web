"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, Heading } from "@/components/ui";
import { FullScreenLoader } from "@/components/ui/Loader";
import { ThemeToggle } from "@/app/ThemeToggle";
import { ToastContainer } from "@/components/ui/Toast";

interface NavItem {
  label: string;
  href?: string;
  icon: React.ReactNode;
  children?: NavItem[];
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(["Catalog", "Sales", "Content", "System"]);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/login");
      return;
    }
    try {
      const parsedUser = JSON.parse(userStr);
      if (parsedUser.role !== "admin") {
        router.push("/");
        return;
      }
      setUser(parsedUser);
      setIsAuthorized(true);
    } catch (e) {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
      setIsMobileMenuOpen(false);
  }, [pathname]);

  const toggleMenu = (label: string) => {
      setExpandedMenus(prev => 
          prev.includes(label) ? prev.filter(m => m !== label) : [...prev, label]
      );
  };

  if (!isAuthorized) {
    return <FullScreenLoader />;
  }

  const navItems: NavItem[] = [
    { 
        label: "Dashboard", 
        href: "/admin", 
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg> 
    },
    { 
      label: "Catalog", 
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>,
      children: [
        { label: "Products", href: "/admin/products", icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"></path><line x1="16" y1="8" x2="2" y2="22"></line><line x1="17.5" y1="15" x2="9" y2="15"></line></svg> },
        { label: "Mother Categories", href: "/admin/mother-categories", icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l9 4.9V17L12 22l-9-4.9V7z"></path></svg> },
        { label: "Categories", href: "/admin/categories", icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg> },
        { label: "Age Groups", href: "/admin/age-groups", icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="4" r="2"></circle><path d="M12 6v6"></path><circle cx="12" cy="14" r="2"></circle><path d="M12 16v4"></path><path d="M6 10h12"></path></svg> },
        { label: "Brands", href: "/admin/brands", icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg> },
        { label: "Bundles", href: "/admin/bundles", icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg> },
        { label: "Batches", href: "/admin/batches", icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg> },
        { label: "Stock Ledger", href: "/admin/stock-ledger", icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg> },
      ]
    },
    { 
      label: "Sales", 
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>,
      children: [
        { label: "Orders", href: "/admin/orders", icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg> },
        { label: "Customers", href: "/admin/customers", icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg> },
        { label: "Wishlists", href: "/admin/wishlists", icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg> },
        { label: "Reviews", href: "/admin/reviews", icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg> },
        { label: "Coupons", href: "/admin/coupons", icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg> },
      ]
    },
    { 
      label: "Content", 
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>,
      children: [
        { label: "Landing Pages", href: "/admin/landing-pages", icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg> },
        { label: "Banners", href: "/admin/banners", icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg> },
        { label: "Labels", href: "/admin/labels", icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg> },
        { label: "Promises", href: "/admin/promises", icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg> },
        { label: "Media", href: "/admin/media", icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg> },
        { label: "Pages", href: "/admin/pages", icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg> },
      ]
    },
    { 
      label: "System", 
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>,
      children: [
        { label: "Settings", href: "/admin/settings", icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg> },
        { label: "Email Templates", href: "/admin/email-templates", icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg> },
        { label: "SMS Templates", href: "/admin/sms-templates", icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg> },
        { label: "Countries", href: "/admin/countries", icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg> },
        { label: "Requests", href: "/admin/requests", icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg> },
        { label: "Delivery", href: "/admin/delivery", icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg> },
      ]
    },
  ];

  const renderNavItem = (item: NavItem) => {
      if (item.children) {
          const isExpanded = expandedMenus.includes(item.label);
          const hasActiveChild = item.children.some(child => pathname === child.href);
          
          return (
              <div key={item.label} className="mb-1">
                  <button 
                      onClick={() => toggleMenu(item.label)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group ${
                          hasActiveChild ? 'text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/50' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800'
                      }`}
                  >
                      <div className="flex items-center gap-3">
                          <span className="text-sky-500">{item.icon}</span>
                          {item.label}
                      </div>
                      <span className={`text-xs transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>▶</span>
                  </button>
                  
                  {isExpanded && (
                      <div className="ml-4 pl-3 border-l border-slate-100 dark:border-slate-800 mt-1 space-y-0.5 animate-in slide-in-from-top-1 duration-200">
                          {item.children.map(child => renderNavItem(child))}
                      </div>
                  )}
              </div>
          );
      }

      const isActive = pathname === item.href;
      return (
        <Link
          key={item.href}
          href={item.href!}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group relative overflow-hidden ${
            isActive
              ? "bg-sky-50 text-sky-600 dark:bg-sky-900/20 dark:text-sky-400"
              : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800"
          }`}
        >
          {isActive && (
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-sky-500 rounded-r-full"></div>
          )}
          <span className={`text-base transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`}>{item.icon}</span>
          {item.label}
        </Link>
      );
  };

  return (
    <div className="min-h-screen bg-[#f4f7fa] dark:bg-slate-900 flex font-sans overflow-hidden">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        w-[240px] bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 flex flex-col z-50 transition-transform duration-300 fixed lg:static h-screen
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-[60px] flex items-center justify-between px-5 border-b border-slate-50 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-sky-400 to-sky-600 rounded-lg flex items-center justify-center text-white text-base font-bold shadow-md shadow-sky-500/20">
              P
            </div>
            <span className="text-base font-bold text-slate-800 dark:text-white tracking-tight">Prithibee Admin</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden text-slate-500">
            ✕
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-3">Menu</div>
          <nav className="space-y-0.5">
            <Link
                href="/"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-all duration-200 group mb-2"
            >
                <span className="text-base transition-transform duration-300 group-hover:scale-110">🏠</span>
                Visit Store
            </Link>
            
            {navItems.map(item => renderNavItem(item))}
          </nav>
        </div>
        
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900">
          <Button 
            variant="outline" 
            fullWidth 
            onClick={() => {
              localStorage.removeItem("user");
              localStorage.removeItem("token");
              router.push("/login");
            }}
            className="border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-red-900/20 dark:hover:text-red-400 rounded-lg py-2 text-xs h-auto"
          >
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300">
        {/* Top Header - Compact */}
        <header className="h-[60px] bg-white/80 backdrop-blur-xl dark:bg-slate-900/80 sticky top-0 z-20 border-b border-slate-100 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
                <button 
                    className="lg:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg dark:hover:bg-slate-800"
                    onClick={() => setIsMobileMenuOpen(true)}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                </button>
                <h2 className="text-base font-bold text-slate-800 dark:text-white capitalize truncate">
                    {pathname.split('/').pop() || 'Dashboard'}
                </h2>
            </div>
            <div className="flex items-center gap-3">
                <ThemeToggle className="hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-xl text-slate-600 dark:text-yellow-400" />
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 text-sm cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                    🔔
                </div>
                <Link href="/admin/profile">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-sky-400 to-blue-500 p-0.5 cursor-pointer hover:scale-105 transition-transform">
                        <div className="w-full h-full bg-white dark:bg-slate-900 rounded-full flex items-center justify-center font-bold text-sky-600 text-xs overflow-hidden">
                            {user?.avatar ? (
                                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                                user?.name?.charAt(0).toUpperCase() || 'A'
                            )}
                        </div>
                    </div>
                </Link>
            </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
            <div className="max-w-[1600px] mx-auto">
                {children}
            </div>
        </div>
        
        {/* Toast Container */}
        <ToastContainer />
      </main>
    </div>
  );
}
