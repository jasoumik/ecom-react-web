"use client";

import { useState, useEffect } from "react";
import { Heading, Button, Text } from "@/components/ui";
import { API_URL } from "@/lib/config";
import { useToast } from "@/components/ui/Toast";
import { FullScreenLoader } from "@/components/ui/Loader";
import { Input } from "@/components/ui/Input";
import { Edit, Trash2, Plus, X } from "lucide-react";
import { FilterBar } from "@/components/ui/FilterBar";

export default function MotherCategoriesPage() {
  const [motherCategories, setMotherCategories] = useState<any[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [formData, setFormData] = useState({ name: "", name_bn: "", slug: "", sort_order: 0 });
  const { addToast } = useToast();

  useEffect(() => {
    fetchMotherCategories();
  }, []);

  const fetchMotherCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/mother-categories`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setMotherCategories(list);
      setFilteredCategories(list);
    } catch (error) {
      console.error(error);
      addToast("Failed to fetch mother categories", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
      if (!query) {
          setFilteredCategories(motherCategories);
          return;
      }
      const lower = query.toLowerCase();
      setFilteredCategories(motherCategories.filter(c => 
          c.name.toLowerCase().includes(lower) || 
          c.name_bn?.toLowerCase().includes(lower) ||
          c.slug.toLowerCase().includes(lower)
      ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingCategory 
        ? `${API_URL}/mother-categories/${editingCategory.id}`
        : `${API_URL}/mother-categories`;
      
      const method = editingCategory ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        addToast(editingCategory ? "Updated successfully" : "Created successfully", "success");
        setIsModalOpen(false);
        fetchMotherCategories();
        setFormData({ name: "", name_bn: "", slug: "", sort_order: 0 });
        setEditingCategory(null);
      } else {
        addToast("Operation failed", "error");
      }
    } catch (error) {
      addToast("Error submitting form", "error");
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure?")) return;
    try {
      const res = await fetch(`${API_URL}/mother-categories/${id}`, { method: "DELETE" });
      if (res.ok) {
        addToast("Deleted successfully", "success");
        fetchMotherCategories();
      } else {
        addToast("Delete failed", "error");
      }
    } catch (error) {
      addToast("Error deleting", "error");
    }
  };

  const openEditModal = (category: any) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      name_bn: category.name_bn || "",
      slug: category.slug,
      sort_order: category.sort_order || 0
    });
    setIsModalOpen(true);
  };

  if (loading) return <FullScreenLoader />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Heading size="lg">Mother Categories</Heading>
        <Button onClick={() => {
            setEditingCategory(null);
            setFormData({ name: "", name_bn: "", slug: "", sort_order: 0 });
            setIsModalOpen(true);
        }}>
          <Plus size={16} className="mr-2" /> Add New
        </Button>
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <FilterBar onSearch={handleSearch} placeholder="Search mother categories..." />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Bangla Name</th>
              <th className="px-6 py-4">Slug</th>
              <th className="px-6 py-4">Order</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredCategories.map((cat) => (
              <tr 
                key={cat.id} 
                onClick={() => openEditModal(cat)}
                className="hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-colors cursor-pointer"
              >
                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{cat.name}</td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{cat.name_bn}</td>
                <td className="px-6 py-4 text-slate-500">{cat.slug}</td>
                <td className="px-6 py-4 text-slate-500">{cat.sort_order}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button 
                        onClick={(e) => { e.stopPropagation(); openEditModal(cat); }}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-500 hover:text-pink-600 transition-colors"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                        onClick={(e) => handleDelete(cat.id, e)}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-500 hover:text-pink-600 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md p-6 rounded-2xl shadow-xl relative">
            <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
                <X size={20} />
            </button>
            
            <Heading size="md" className="mb-6">{editingCategory ? "Edit Category" : "New Category"}</Heading>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input 
                label="Name" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                required 
              />
              <Input 
                label="Bangla Name" 
                value={formData.name_bn} 
                onChange={e => setFormData({...formData, name_bn: e.target.value})} 
              />
              <Input 
                label="Slug" 
                value={formData.slug} 
                onChange={e => setFormData({...formData, slug: e.target.value})} 
                required 
              />
              <Input 
                label="Sort Order" 
                type="number"
                value={formData.sort_order} 
                onChange={e => setFormData({...formData, sort_order: parseInt(e.target.value)})} 
              />
              
              <Button fullWidth type="submit" className="mt-4">
                {editingCategory ? "Update" : "Create"}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
