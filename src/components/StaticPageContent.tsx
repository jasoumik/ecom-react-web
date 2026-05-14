"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/config";
import { Heading } from "@/components/ui";
import { FullScreenLoader } from "@/components/ui/Loader";

export function StaticPageContent({ pageKey, title }: { pageKey: string, title: string }) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/settings`)
      .then(res => res.json())
      .then(data => {
          const setting = data.find((s: any) => s.key === pageKey);
          if (setting) setContent(setting.value);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [pageKey]);

  if (loading) return <FullScreenLoader />;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Heading size="xl" className="font-sans text-slate-900 dark:text-white mb-8 text-center">{title}</Heading>
        <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: content || "<p>Coming soon...</p>" }} />
      </div>
    </div>
  );
}
