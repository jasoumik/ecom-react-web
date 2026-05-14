"use client";

import { useState, useEffect } from "react";
import { Heading, Button } from "@/components/ui";
import { API_URL } from "@/lib/config";
import { useToast } from "@/components/ui/Toast";
import { Table } from "@/components/ui/Table";
import { Input } from "@/components/ui/Input";
import { RichTextEditor } from "@/components/ui/RichTextEditor";

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const { addToast } = useToast();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await fetch(`${API_URL}/email-templates`);
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
      const res = await fetch(`${API_URL}/email-templates/${editingTemplate.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: editingTemplate.subject,
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
          <Heading size="md" className="font-sans text-slate-800 dark:text-white mb-0.5">Email Templates</Heading>
          <p className="text-xs text-slate-500">Manage email notification templates</p>
        </div>
      </div>

      {!editingTemplate ? (
        <Table
          data={templates}
          columns={[
            { header: "Name", accessorKey: "name", className: "font-medium capitalize" },
            { header: "Subject", accessorKey: "subject" },
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
            <Input 
              label="Subject" 
              value={editingTemplate.subject} 
              onChange={e => setEditingTemplate({...editingTemplate, subject: e.target.value})} 
              required 
            />
            
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                Body (Rich Text)
              </label>
              <div className="mb-2 text-xs text-slate-500">
                Available variables: {editingTemplate.variables?.map((v: string) => (
                  <span key={v} className="font-mono mx-1 bg-slate-100 px-1 rounded">
                    {'{' + '{' + v + '}' + '}'}
                  </span>
                ))}
              </div>
              <RichTextEditor
                value={editingTemplate.body}
                onChange={val => setEditingTemplate({...editingTemplate, body: val})}
                required
              />
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
