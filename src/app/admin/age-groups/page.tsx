"use client";

import { useState, useEffect } from "react";
import { Section, Heading, Button } from "@/components/ui";
import { API_URL } from "@/lib/config";
import { useToast } from "@/components/ui/Toast";
import { Plus, Pencil, Trash2, Save, X } from "lucide-react";

interface AgeGroup {
  id: string;
  label: string;
  label_bn?: string;
  icon: string;
  age_range: string;
  description?: string;
  description_bn?: string;
  sort_order: number;
  is_active: boolean;
}

const emptyAgeGroup: Partial<AgeGroup> = {
  label: "",
  label_bn: "",
  icon: "👶",
  age_range: "",
  description: "",
  description_bn: "",
  sort_order: 0,
  is_active: true,
};

const emojiOptions = ["👶", "🍼", "🧸", "🎈", "🎨", "🧒", "👧", "👦", "🎒", "📚"];

export default function AgeGroupsPage() {
  const [ageGroups, setAgeGroups] = useState<AgeGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<AgeGroup>>(emptyAgeGroup);
  const [isCreating, setIsCreating] = useState(false);
  const { addToast } = useToast();

  const fetchAgeGroups = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/age-groups?includeInactive=true`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAgeGroups(data);
      }
    } catch (error) {
      addToast("Failed to fetch age groups", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAgeGroups();
  }, []);

  const handleCreate = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/age-groups`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...editForm,
          sort_order: ageGroups.length + 1,
        }),
      });

      if (res.ok) {
        addToast("Age group created successfully", "success");
        setIsCreating(false);
        setEditForm(emptyAgeGroup);
        fetchAgeGroups();
      } else {
        addToast("Failed to create age group", "error");
      }
    } catch (error) {
      addToast("Failed to create age group", "error");
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/age-groups/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });

      if (res.ok) {
        addToast("Age group updated successfully", "success");
        setEditingId(null);
        setEditForm(emptyAgeGroup);
        fetchAgeGroups();
      } else {
        addToast("Failed to update age group", "error");
      }
    } catch (error) {
      addToast("Failed to update age group", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this age group?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/age-groups/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        addToast("Age group deleted successfully", "success");
        fetchAgeGroups();
      } else {
        addToast("Failed to delete age group", "error");
      }
    } catch (error) {
      addToast("Failed to delete age group", "error");
    }
  };

  const startEditing = (ageGroup: AgeGroup) => {
    setEditingId(ageGroup.id);
    setEditForm(ageGroup);
    setIsCreating(false);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm(emptyAgeGroup);
    setIsCreating(false);
  };

  if (isLoading) {
    return (
      <Section className="py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-48" />
            <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded" />
          </div>
        </div>
      </Section>
    );
  }

  return (
    <Section className="py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <Heading size="lg" className="text-slate-900 dark:text-white">
            Age Groups
          </Heading>
          {!isCreating && (
            <Button
              onClick={() => {
                setIsCreating(true);
                setEditingId(null);
                setEditForm(emptyAgeGroup);
              }}
              className="bg-sky-500 hover:bg-sky-600 text-white"
            >
              <Plus size={18} className="mr-2" />
              Add Age Group
            </Button>
          )}
        </div>

        {/* Create Form */}
        {isCreating && (
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 mb-6 border border-slate-200 dark:border-slate-700 shadow-sm">
            <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">Create New Age Group</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Label (English) *
                </label>
                <input
                  type="text"
                  value={editForm.label || ""}
                  onChange={(e) => setEditForm({ ...editForm, label: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  placeholder="e.g., Newborn"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Label (Bangla)
                </label>
                <input
                  type="text"
                  value={editForm.label_bn || ""}
                  onChange={(e) => setEditForm({ ...editForm, label_bn: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  placeholder="e.g., নবজাতক"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Icon *
                </label>
                <div className="flex gap-2 flex-wrap">
                  {emojiOptions.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setEditForm({ ...editForm, icon: emoji })}
                      className={`w-10 h-10 rounded-lg text-2xl flex items-center justify-center transition-all ${
                        editForm.icon === emoji
                          ? "bg-sky-500 ring-2 ring-sky-300"
                          : "bg-slate-100 dark:bg-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Age Range *
                </label>
                <input
                  type="text"
                  value={editForm.age_range || ""}
                  onChange={(e) => setEditForm({ ...editForm, age_range: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  placeholder="e.g., 0-3 months"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Description (English)
                </label>
                <input
                  type="text"
                  value={editForm.description || ""}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  placeholder="e.g., Essentials for your newborn"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Description (Bangla)
                </label>
                <input
                  type="text"
                  value={editForm.description_bn || ""}
                  onChange={(e) => setEditForm({ ...editForm, description_bn: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  placeholder="e.g., নবজাতকের জন্য প্রয়োজনীয়"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={editForm.is_active ?? true}
                  onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
                  className="w-4 h-4 rounded"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Active
                </label>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleCreate} className="bg-sky-500 hover:bg-sky-600 text-white">
                <Save size={16} className="mr-2" />
                Create
              </Button>
              <Button onClick={cancelEditing} variant="outline">
                <X size={16} className="mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Age Groups List */}
        <div className="space-y-3">
          {ageGroups.map((ageGroup) => (
            <div
              key={ageGroup.id}
              className={`bg-white dark:bg-slate-800 rounded-xl p-4 border transition-all ${
                editingId === ageGroup.id
                  ? "border-sky-500 shadow-lg"
                  : "border-slate-200 dark:border-slate-700"
              } ${!ageGroup.is_active ? "opacity-60" : ""}`}
            >
              {editingId === ageGroup.id ? (
                /* Edit Mode */
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Label (English)
                      </label>
                      <input
                        type="text"
                        value={editForm.label || ""}
                        onChange={(e) => setEditForm({ ...editForm, label: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Label (Bangla)
                      </label>
                      <input
                        type="text"
                        value={editForm.label_bn || ""}
                        onChange={(e) => setEditForm({ ...editForm, label_bn: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Icon
                      </label>
                      <div className="flex gap-2 flex-wrap">
                        {emojiOptions.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => setEditForm({ ...editForm, icon: emoji })}
                            className={`w-10 h-10 rounded-lg text-2xl flex items-center justify-center transition-all ${
                              editForm.icon === emoji
                                ? "bg-sky-500 ring-2 ring-sky-300"
                                : "bg-slate-100 dark:bg-slate-700 hover:bg-slate-200"
                            }`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Age Range
                      </label>
                      <input
                        type="text"
                        value={editForm.age_range || ""}
                        onChange={(e) => setEditForm({ ...editForm, age_range: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Description (English)
                      </label>
                      <input
                        type="text"
                        value={editForm.description || ""}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Description (Bangla)
                      </label>
                      <input
                        type="text"
                        value={editForm.description_bn || ""}
                        onChange={(e) => setEditForm({ ...editForm, description_bn: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`is_active_${ageGroup.id}`}
                        checked={editForm.is_active ?? true}
                        onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
                        className="w-4 h-4 rounded"
                      />
                      <label htmlFor={`is_active_${ageGroup.id}`} className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Active
                      </label>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleUpdate(ageGroup.id)} className="bg-sky-500 hover:bg-sky-600 text-white">
                      <Save size={16} className="mr-2" />
                      Save
                    </Button>
                    <Button onClick={cancelEditing} variant="outline">
                      <X size={16} className="mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                /* View Mode */
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-sky-50 dark:bg-slate-700 flex items-center justify-center text-2xl">
                      {ageGroup.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 dark:text-white">{ageGroup.label}</h3>
                        {ageGroup.label_bn && (
                          <span className="text-sm text-slate-500">({ageGroup.label_bn})</span>
                        )}
                        {!ageGroup.is_active && (
                          <span className="px-2 py-0.5 text-xs bg-slate-200 dark:bg-slate-600 rounded-full">
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {ageGroup.age_range}
                        {ageGroup.description && ` • ${ageGroup.description}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEditing(ageGroup)}
                      className="p-2 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(ageGroup.id)}
                      className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {ageGroups.length === 0 && !isCreating && (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400">
            <p className="mb-4">No age groups yet.</p>
            <Button
              onClick={() => setIsCreating(true)}
              className="bg-sky-500 hover:bg-sky-600 text-white"
            >
              <Plus size={18} className="mr-2" />
              Create First Age Group
            </Button>
          </div>
        )}
      </div>
    </Section>
  );
}

