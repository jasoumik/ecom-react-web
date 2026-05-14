"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { SettingsProvider } from "@/lib/settings-context";
import { LanguageProvider } from "@/lib/language-context";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            refetchOnWindowFocus: true,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>
        <LanguageProvider>{children}</LanguageProvider>
      </SettingsProvider>
    </QueryClientProvider>
  );
}

