"use client";

import { useState, useEffect } from "react";
import { Button, Heading } from "@/components/ui";
import { Input } from "./Input";
import { API_URL } from "@/lib/config";
import { useToast } from "./Toast";
import { useSettings } from "@/lib/settings-context";
import { useLanguage } from "@/lib/language-context";

export function FloatingActionGroup() {
  const [isOpen, setIsOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [formData, setFormData] = useState({ productName: "", description: "", userName: "", phone: "", email: "" });
  const { addToast } = useToast();
  const settings = useSettings();
  const { t } = useLanguage();

  useEffect(() => {
      // Open by default on desktop
      if (window.innerWidth >= 640) {
          setIsOpen(true);
      }

      const userStr = localStorage.getItem("user");
      if (userStr) {
          try {
              const user = JSON.parse(userStr);
              setFormData(prev => ({ ...prev, userName: user.name || "", phone: user.phone || "", email: user.email || "" }));
          } catch (e) {}
      }
  }, []);

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

  const whatsappNumber = settings.whatsapp_number || "+8801616684803";
  const whatsappMessage = "Hi, I'm interested in a product from Prithibee.";
  const whatsappLink = `https://wa.me/${whatsappNumber.replace('+', '')}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <>
      {/* Adjusted bottom position for mobile to avoid sticky product bar. Increased z-index to be above sticky bars. */}
      {/* Added pointer-events-none to container to prevent blocking clicks on page content */}
      <div className="fixed bottom-22 sm:bottom-20 right-6 z-50 flex flex-col items-end gap-3 pointer-events-none">
        {/* Expanded Actions */}
        <div className={`flex flex-col gap-3 transition-all duration-300 origin-bottom ${isOpen ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-90 translate-y-10 pointer-events-none'}`}>
            
            {/* WhatsApp Button */}
            <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-[#25D366] text-white px-4 py-3 rounded-full shadow-lg hover:bg-[#20ba5a] transition-transform hover:scale-105 group"
            >
                <span className="text-sm font-bold whitespace-nowrap">{t('chat_on_whatsapp')}</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.015-1.04 2.535 0 1.52 1.115 2.988 1.264 3.186.149.198 2.19 3.348 5.302 4.695.74.325 1.317.521 1.767.664.75.237 1.433.204 1.975.124.603-.088 1.758-.718 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
            </a>

            {/* Request Product Button */}
            <button
                onClick={() => { setIsRequestModalOpen(true); setIsOpen(false); }}
                className="flex items-center gap-3 bg-sky-500 text-white px-4 py-3 rounded-full shadow-lg hover:bg-sky-600 transition-transform hover:scale-105 group"
            >
                <span className="text-sm font-bold whitespace-nowrap">{t('request_product')}</span>
                <span className="text-xl">💡</span>
            </button>
        </div>

        {/* Main Toggle Button */}
        <button 
            onClick={() => setIsOpen(!isOpen)}
            className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-white transition-all duration-300 hover:scale-110 pointer-events-auto ${isOpen ? 'bg-slate-800 rotate-45' : 'bg-sky-600'}`}
            aria-label={t('toggle_actions')}
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
        </button>
      </div>

      {/* Request Product Modal */}
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
