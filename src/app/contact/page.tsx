"use client";

import { useState } from "react";
import { Heading, Text, Button, Section } from "@/components/ui";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { API_URL } from "@/lib/config";
import { useLanguage } from "@/lib/language-context";
import { useSettings } from "@/lib/settings-context";

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();
  const { t } = useLanguage();
  const settings = useSettings();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
        const res = await fetch(`${API_URL}/requests/contact`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
        });
        
        if (res.ok) {
            addToast(t('message_sent_success'), "success");
            setFormData({ name: "", email: "", subject: "", message: "" });
        } else {
            addToast(t('message_sent_error'), "error");
        }
    } catch (e) {
        addToast(t('error_sending_message'), "error");
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Hero */}
      <div className="bg-rose-50 dark:bg-slate-900 py-16 text-center">
        <Heading size="xl" className="font-sans text-slate-900 dark:text-white mb-4 font-bold">{t('contact_us')}</Heading>
        <Text className="text-xl text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
          {t('contact_hero_subtitle')}
        </Text>
      </div>

      <Section>
        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Contact Info */}
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{t('get_in_touch')}</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                {t('contact_desc')}
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-rose-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-2xl text-rose-400">📍</div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">{t('visit_us')}</h4>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                    {settings.shop_address}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-rose-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-2xl text-rose-400">📞</div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">{t('call_us')}</h4>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                    {settings.shop_phone}<br />
                    {t('working_hours')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-rose-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-2xl text-rose-400">✉️</div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">{t('email_us')}</h4>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                    support@replantglow.com<br />
                    info@replantglow.com
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800">
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input 
                label={t('your_name')} 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                required 
                className="bg-slate-50/50"
              />
              <Input 
                label={t('email_address')} 
                type="email" 
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})} 
                required 
                className="bg-slate-50/50"
              />
              <Input 
                label={t('subject')} 
                value={formData.subject} 
                onChange={e => setFormData({...formData, subject: e.target.value})} 
                required 
                className="bg-slate-50/50"
              />
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t('message')}</label>
                <textarea 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-slate-500"
                  value={formData.message} 
                  onChange={e => setFormData({...formData, message: e.target.value})} 
                  required 
                  rows={4}
                  placeholder={t('message_placeholder')}
                />
              </div>
              
              <Button 
                type="submit" 
                fullWidth 
                disabled={isSubmitting}
                className="rounded-xl py-3 text-base shadow-lg shadow-rose-400/20"
              >
                {isSubmitting ? t('sending') : t('send_message')}
              </Button>
            </form>
          </div>
        </div>
      </Section>
    </div>
  );
}
