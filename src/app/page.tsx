import LandingPage from "./(public)/page";

// This file is kept for compatibility; the main public landing page now lives in `(public)/page.tsx`.
// We explicitly mark this as dynamic because the imported LandingPage uses dynamic data fetching.
export const dynamic = 'force-dynamic';

export default function Home() {
  return <LandingPage />;
}
