"use client";

import { useEffect, useState } from "react";
import { Heading, Button } from "@/components/ui";
import { API_URL } from "@/lib/config";
import { useToast } from "@/components/ui/Toast";
import { FullScreenLoader } from "@/components/ui/Loader";

export default function AdminMediaPage() {
  const [folders, setFolders] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [draggedFile, setDraggedFile] = useState<string | null>(null);
  const { addToast } = useToast();

  useEffect(() => {
    fetchMedia(currentFolder);
  }, [currentFolder]);

  const fetchMedia = async (folderId: string | null) => {
    setLoading(true);
    try {
      const [foldersRes, filesRes] = await Promise.all([
        fetch(`${API_URL}/media/folders${folderId ? `?parentId=${folderId}` : ''}`),
        fetch(`${API_URL}/media/files${folderId ? `?folderId=${folderId}` : ''}`)
      ]);
      
      const foldersData = await foldersRes.json();
      const filesData = await filesRes.json();
      
      setFolders(Array.isArray(foldersData) ? foldersData : []);
      setFiles(Array.isArray(filesData) ? filesData : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFolder = async () => {
    const name = prompt("Enter folder name:");
    if (!name) return;
    
    try {
      const res = await fetch(`${API_URL}/media/folders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, parent_id: currentFolder }),
      });
      if (res.ok) {
        addToast("Folder created", "success");
        fetchMedia(currentFolder);
      }
    } catch (e) {
      addToast("Error creating folder", "error");
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const formData = new FormData();
    formData.append("file", e.target.files[0]);
    if (currentFolder) formData.append("folderId", currentFolder);

    try {
      const res = await fetch(`${API_URL}/media/upload`, {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        addToast("File uploaded", "success");
        fetchMedia(currentFolder);
      } else {
        addToast("Upload failed", "error");
      }
    } catch (e) {
      addToast("Error uploading file", "error");
    }
  };

  const handleDeleteFile = async (id: string) => {
    if (!confirm("Delete this file?")) return;
    try {
      await fetch(`${API_URL}/media/files/${id}`, { method: "DELETE" });
      addToast("File deleted", "success");
      fetchMedia(currentFolder);
    } catch (e) {
      addToast("Error deleting file", "error");
    }
  };

  const handleDeleteFolder = async (id: string) => {
    if (!confirm("Delete this folder and all contents?")) return;
    try {
      await fetch(`${API_URL}/media/folders/${id}`, { method: "DELETE" });
      addToast("Folder deleted", "success");
      fetchMedia(currentFolder);
    } catch (e) {
      addToast("Error deleting folder", "error");
    }
  };

  const handleDrop = async (folderId: string) => {
    if (!draggedFile) return;

    try {
      await fetch(`${API_URL}/media/files/${draggedFile}/move`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderId }),
      });
      addToast("File moved", "success");
      fetchMedia(currentFolder);
    } catch (e) {
      addToast("Error moving file", "error");
    } finally {
      setDraggedFile(null);
    }
  };

  if (loading) return <FullScreenLoader />;

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
            {currentFolder && (
                <button onClick={() => setCurrentFolder(null)} className="text-sky-500 hover:underline text-xs font-bold">
                    ← Root
                </button>
            )}
            <div>
                <Heading size="md" className="font-sans text-slate-800 dark:text-white mb-0.5">Media Library</Heading>
                <p className="text-xs text-slate-500">Manage files and assets</p>
            </div>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" onClick={handleCreateFolder} className="rounded-lg py-2 px-3 text-xs h-auto">
                + New Folder
            </Button>
            <label className="cursor-pointer">
                <span className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-xs font-bold tracking-wide transition-all duration-300 bg-sky-500 text-white shadow-sm hover:bg-sky-600 hover:shadow-md">
                    Upload File
                </span>
                <input type="file" className="hidden" onChange={handleUpload} />
            </label>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 min-h-[400px]">
        {folders.length === 0 && files.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <div className="text-4xl mb-2 opacity-50">📁</div>
                <p className="text-xs font-medium">This folder is empty</p>
            </div>
        ) : (
            <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-8 gap-4">
                {folders.map(folder => (
                    <div 
                        key={folder.id} 
                        className="group relative"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => handleDrop(folder.id)}
                    >
                        <div 
                            onClick={() => setCurrentFolder(folder.id)}
                            className="aspect-square bg-sky-50 dark:bg-slate-800 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-sky-100 dark:hover:bg-slate-700 transition-colors border border-transparent hover:border-sky-200"
                        >
                            <div className="text-3xl mb-1">📂</div>
                            <div className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate px-2 w-full text-center">{folder.name}</div>
                        </div>
                        <button 
                            onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder.id); }}
                            className="absolute top-1 right-1 p-1 bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:bg-red-50"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>
                ))}
                
                {files.map(file => (
                    <div 
                        key={file.id} 
                        className="group relative"
                        draggable
                        onDragStart={() => setDraggedFile(file.id)}
                    >
                        <div className="aspect-square bg-slate-50 dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-700">
                            {file.type === 'image' ? (
                                <img src={`${API_URL}${file.url}`} alt={file.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                    📄
                                </div>
                            )}
                        </div>
                        <div className="mt-1.5 text-[10px] text-slate-600 dark:text-slate-400 truncate px-1">{file.name}</div>
                        <button 
                            onClick={() => handleDeleteFile(file.id)}
                            className="absolute top-1 right-1 p-1 bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:bg-red-50"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
}
