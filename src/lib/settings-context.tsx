"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { API_URL } from "./config";

interface Settings {
  shop_name: string;
  shop_name_bn: string; // Added Bangla Name
  shop_phone: string;
  shop_address: string;
  support_email: string; // Added Support Email
  facebook_link: string;
  whatsapp_number: string;
  free_shipping_threshold: string;
  payment_methods: string; // Added Payment Methods (comma separated)
  [key: string]: string;
}

const defaultSettings: Settings = {
  shop_name: "Prithibee",
  shop_name_bn: "পৃথিবী",
  shop_phone: "+880 1616-684803",
  shop_address: "Uttara Model Town, Dhaka-1230",
  support_email: "support@prithibee.com",
  facebook_link: "https://www.facebook.com/prithibeeofficial",
  whatsapp_number: "+8801616684803",
  free_shipping_threshold: "5000",
  payment_methods: "bKash,Nagad,Visa,Mastercard,COD",
};

const SettingsContext = createContext<Settings>(defaultSettings);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${API_URL}/settings`);
        const data = await res.json();
        if (Array.isArray(data)) {
          const settingsMap = data.reduce((acc: any, curr: any) => {
            acc[curr.key] = curr.value;
            return acc;
          }, {});
          setSettings((prev) => ({ ...prev, ...settingsMap }));
        }
      } catch (e) {
        console.error("Failed to fetch settings", e);
      }
    };

    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
