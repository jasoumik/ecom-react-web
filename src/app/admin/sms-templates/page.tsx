"use client";

import { useState, useEffect } from "react";
import { Heading, Button } from "@/components/ui";
import { API_URL } from "@/lib/config";
import { useToast } from "@/components/ui/Toast";
import { Table } from "@/components/ui/Table";

export default function SmsTemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const { addToast } = useToast();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await fetch(`${API_URL}/sms-templates`);
      const data = await res.json();
      setTemplates(data);
    } catch (e) {
      addToast("Failed to fetch templates", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplate) return;

    try {
      const res = await fetch(`${API_URL}/sms-templates/${editingTemplate.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body: editingTemplate.body,
        }),
      });

      if (res.ok) {
        addToast("Template updated successfully", "success");
        setEditingTemplate(null);
        fetchTemplates();
      } else {
        addToast("Failed to update template", "error");
      }
    } catch (e) {
      addToast("Error updating template", "error");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <Heading size="md" className="font-sans text-slate-800 dark:text-white mb-0.5">SMS Templates</Heading>
          <p className="text-xs text-slate-500">Manage SMS notification templates</p>
        </div>
      </div>

      {!editingTemplate ? (
        <Table
          data={templates}
          columns={[
            { header: "Name", accessorKey: "name", className: "font-medium capitalize" },
            { 
              header: "Body", 
              cell: (row) => (
                <div className="max-w-md truncate text-slate-600 dark:text-slate-400 text-sm">
                  {row.body}
                </div>
              )
            },
            { 
              header: "Variables", 
              cell: (row) => (
                <div className="flex gap-1 flex-wrap">
                  {row.variables?.map((v: string) => (
                    <span key={v} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs text-slate-600 dark:text-slate-400 font-mono">
                      {v}
                    </span>
                  ))}
                </div>
              )
            },
            {
              header: "Actions",
              className: "text-right",
              cell: (row) => (
                <div className="flex justify-end">
                  <Button 
                    variant="outline" 
                    onClick={() => setEditingTemplate(row)}
                    className="text-xs h-8 px-3 rounded-lg shadow-sm"
                  >
                    Edit
                  </Button>
                </div>
              )
            }
          ]}
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white capitalize">Edit Template: {editingTemplate.name.replace(/_/g, ' ')}</h3>
            <Button variant="outline" onClick={() => setEditingTemplate(null)} className="rounded-lg shadow-sm h-10 px-4">Cancel</Button>
          </div>

          <form onSubmit={handleUpdate} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                Message Body
              </label>
              <div className="mb-2 text-xs text-slate-500">
                Available variables: {editingTemplate.variables?.map((v: string) => (
                  <span key={v} className="font-mono mx-1 bg-slate-100 px-1 rounded">
                    {'{' + '{' + v + '}' + '}'}
                  </span>
                ))}
              </div>
              <textarea 
                className="w-full h-32 px-4 py-3 rounded-lg border border-slate-200 bg-slate-50/50 text-slate-900 font-mono text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                value={editingTemplate.body}
                onChange={e => setEditingTemplate({...editingTemplate, body: e.target.value})}
                required
              />
              <p className="text-xs text-slate-400 mt-2 text-right">
                {editingTemplate.body.length} characters
              </p>
            </div>

            <div className="flex justify-end">
              <Button type="submit" className="bg-sky-600 hover:bg-sky-700 text-white rounded-lg shadow-md h-10 px-6">Save Changes</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
