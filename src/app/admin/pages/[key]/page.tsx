"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Heading, Button } from "@/components/ui";
import { API_URL } from "@/lib/config";
import { useToast } from "@/components/ui/Toast";
import { RichTextEditor } from "@/components/ui/RichTextEditor";

const PAGES: Record<string, string> = {
    'page_terms': 'Terms & Conditions',
    'page_privacy': 'Privacy Policy',
    'page_shipping': 'Shipping Policy',
    'page_faq': 'FAQ',
};

export default function EditPageContent() {
  const params = useParams();
  const key = params.key as string;
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    fetch(`${API_URL}/settings`)
      .then(res => res.json())
      .then(data => {
          const setting = data.find((s: any) => s.key === key);
          if (setting) setContent(setting.value);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [key]);

  const handleSave = async () => {
    try {
        const res = await fetch(`${API_URL}/settings/${key}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ value: content }),
        });
        
        if (res.ok) {
            addToast("Page content updated", "success");
            router.push("/admin/pages");
        } else {
            addToast("Failed to update content", "error");
        }
    } catch (e) {
        addToast("Error updating content", "error");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <Heading size="md" className="font-sans text-slate-900 dark:text-white">Edit {PAGES[key] || key}</Heading>
        <div className="flex gap-3">
            <Button variant="outline" onClick={() => router.back()} className="rounded-lg py-2 px-4 text-sm h-auto">Cancel</Button>
            <Button onClick={handleSave} className="rounded-lg shadow-md shadow-sky-500/20 py-2 px-6 text-sm h-auto">Save Changes</Button>
        </div>
      </div>
      
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
        <RichTextEditor
            label="Content"
            value={content}
            onChange={setContent}
            className="min-h-[500px]"
        />
      </div>
    </div>
  );
}
