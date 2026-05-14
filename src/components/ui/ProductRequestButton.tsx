"use client";

import { useState } from "react";
import { Button, Heading } from "@/components/ui";
import { Input } from "./Input";
import { API_URL } from "@/lib/config";
import { useToast } from "./Toast";
import { useLanguage } from "@/lib/language-context";

export function ProductRequestButton() {
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [formData, setFormData] = useState({ productName: "", description: "", userName: "", phone: "", email: "" });
  const { addToast } = useToast();
  const { t } = useLanguage();

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/requests/product`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      if (res.ok) {
        addToast(t('message_sent_success'), "success");
        setIsRequestModalOpen(false);
        setFormData(prev => ({ ...prev, productName: "", description: "" }));
      } else {
        addToast(t('message_sent_error'), "error");
      }
    } catch (e) {
      addToast(t('error_sending_message'), "error");
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsRequestModalOpen(true)}
        className="rounded-xl px-6 py-2 bg-sky-500 hover:bg-sky-600 text-white font-bold shadow-lg shadow-sky-500/20 mt-4"
      >
        {t('request_product')}
      </Button>

      {isRequestModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 w-full max-w-lg p-8 rounded-3xl shadow-2xl relative">
                <button onClick={() => setIsRequestModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white">✕</button>
                <Heading size="lg" className="mb-2 text-slate-900 dark:text-white">{t('request_product_modal_title')}</Heading>
                <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">{t('request_product_modal_subtitle')}</p>
                
                <form onSubmit={handleRequestSubmit} className="space-y-4">
                    <Input label={t('product_name')} value={formData.productName} onChange={e => setFormData({...formData, productName: e.target.value})} required placeholder={t('product_name_placeholder')} />
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t('description_optional')}</label>
                        <textarea 
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-slate-500"
                            value={formData.description} 
                            onChange={e => setFormData({...formData, description: e.target.value})} 
                            rows={3}
                            placeholder={t('description_placeholder')}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input label={t('your_name')} value={formData.userName} onChange={e => setFormData({...formData, userName: e.target.value})} required />
                        <Input label={t('phone_number')} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required />
                    </div>
                    <Input label={t('email_optional')} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    
                    <Button fullWidth type="submit" className="rounded-xl py-3 mt-2">{t('submit_request')}</Button>
                </form>
            </div>
        </div>
      )}
    </>
  );
}
