"use client";

import { Heading, Button } from "@/components/ui";
import Link from "next/link";

const PAGES = [
    { key: 'page_terms', title: 'Terms & Conditions', path: '/terms' },
    { key: 'page_privacy', title: 'Privacy Policy', path: '/privacy' },
    { key: 'page_shipping', title: 'Shipping Policy', path: '/shipping' },
    { key: 'page_faq', title: 'FAQ', path: '/faq' },
];

export default function AdminPagesList() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <Heading size="md" className="font-sans text-slate-900 dark:text-white">Static Pages</Heading>
      </div>
      
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {PAGES.map((page) => (
                <div key={page.key} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white">{page.title}</h3>
                        <div className="text-xs text-slate-500 mt-1">Public Path: <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">{page.path}</code></div>
                    </div>
                    <Link href={`/admin/pages/${page.key}`}>
                        <Button variant="outline" className="rounded-lg py-1.5 px-4 text-xs h-auto">Edit Content</Button>
                    </Link>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}
