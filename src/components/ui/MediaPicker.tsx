"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui";
import { API_URL } from "@/lib/config";
import { FullScreenLoader } from "./Loader";

interface MediaPickerProps {
  onSelect: (url: string) => void;
  onClose: () => void;
  context?: string; // 'profile' or 'general'
}

export function MediaPicker({ onSelect, onClose, context = 'general' }: MediaPickerProps) {
  const [folders, setFolders] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const formData = new FormData();
    formData.append("file", e.target.files[0]);
    if (currentFolder) formData.append("folderId", currentFolder);
    if (context) formData.append("context", context);

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/media/upload`, {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        // If context is profile, we might not get a file record back in the list immediately if we chose not to save it to DB.
        // But we need to select it.
        if (context === 'profile') {
            onSelect(`${API_URL}${data.url}`);
            onClose();
        } else {
            fetchMedia(currentFolder);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-4">
            {currentFolder && (
                <button onClick={() => setCurrentFolder(null)} className="text-sky-500 hover:underline text-sm font-bold">
                    ← Back
                </button>
            )}
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Select Media</h3>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:hover:text-white">✕</button>
        </div>
        
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
            <label className="cursor-pointer inline-block">
                <span className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-bold bg-sky-500 text-white hover:bg-sky-600 transition-colors">
                    Upload New File
                </span>
                <input type="file" className="hidden" onChange={handleUpload} />
            </label>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div></div>
          ) : folders.length === 0 && files.length === 0 ? (
            <div className="text-center text-slate-500 py-12">No files found. Upload one to get started.</div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
              {folders.map((folder) => (
                <div 
                    key={folder.id} 
                    className="group relative aspect-square bg-sky-50 dark:bg-slate-800 rounded-xl flex flex-col items-center justify-center cursor-pointer border-2 border-transparent hover:border-sky-200 transition-all"
                    onClick={() => setCurrentFolder(folder.id)}
                >
                    <div className="text-4xl mb-2">📂</div>
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate px-2 w-full text-center">{folder.name}</div>
                </div>
              ))}

              {files.map((file) => (
                <div 
                    key={file.id} 
                    className="group relative aspect-square bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden cursor-pointer border-2 border-transparent hover:border-sky-500 transition-all"
                    onClick={() => onSelect(`${file.url}`)}
                >
                  {file.type === 'image' ? (
                    <img src={`${API_URL}${file.url}`} alt={file.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">📄</div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
