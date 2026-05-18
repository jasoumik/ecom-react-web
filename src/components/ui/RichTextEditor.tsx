"use client";

// TipTap-based rich text editor
import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Italic, List, ListOrdered, Heading1, Heading2 } from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  className?: string;
}

interface ToolbarButtonProps {
  icon: React.ComponentType<{ size?: number }>;
  onClick: () => void;
  isActive?: boolean;
  title: string;
}

function ToolbarButton({ icon: Icon, onClick, isActive, title }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={`p-1.5 rounded text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${
        isActive ? "bg-slate-200 dark:bg-slate-600" : ""
      }`}
      title={title}
    >
      <Icon size={16} />
    </button>
  );
}

export function RichTextEditor({ value, onChange, label, required, className }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value || "",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const handleEditorClick = () => {
    editor?.chain().focus().run();
  };

  return (
    <div className={`space-y-2 ${className ?? ""}`}>
      {label && (
        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div
        className={`border rounded-lg overflow-hidden transition-all ${
          editor?.isFocused ? "border-rose-400 ring-2 ring-rose-100" : "border-slate-200 dark:border-slate-700"
        }`}
      >
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
          <ToolbarButton
            icon={Bold}
            title="Bold"
            isActive={editor?.isActive("bold")}
            onClick={() => editor?.chain().focus().toggleBold().run()}
          />
          <ToolbarButton
            icon={Italic}
            title="Italic"
            isActive={editor?.isActive("italic")}
            onClick={() => editor?.chain().focus().toggleItalic().run()}
          />
          <div className="w-px h-4 bg-slate-300 dark:bg-slate-600 mx-1" />
          <ToolbarButton
            icon={Heading1}
            title="Heading 1"
            isActive={editor?.isActive("heading", { level: 1 })}
            onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
          />
          <ToolbarButton
            icon={Heading2}
            title="Heading 2"
            isActive={editor?.isActive("heading", { level: 2 })}
            onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          />
          <div className="w-px h-4 bg-slate-300 dark:bg-slate-600 mx-1" />
          <ToolbarButton
            icon={List}
            title="Bullet List"
            isActive={editor?.isActive("bulletList")}
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
          />
          <ToolbarButton
            icon={ListOrdered}
            title="Numbered List"
            isActive={editor?.isActive("orderedList")}
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          />
        </div>

        {/* Editor */}
        <div
          className="min-h-[200px] max-h-[500px] overflow-y-auto bg-white dark:bg-slate-900 cursor-text"
          onClick={handleEditorClick}
        >
          {editor ? (
            <EditorContent
              editor={editor}
              className="p-4 prose dark:ppink-invert max-w-none text-sm text-slate-900 dark:text-slate-50 focus:outline-none"
            />
          ) : (
            <div className="p-4 text-sm text-slate-400">Loading editor...</div>
          )}
        </div>
      </div>
    </div>
  );
}
