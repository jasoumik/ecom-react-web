"use client";

export function Loader() {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative w-20 h-20">
        {/* Mother Circle */}
        <div className="absolute inset-0 border-4 border-sky-100 rounded-full animate-[spin_3s_linear_infinite]"></div>
        <div className="absolute inset-0 border-4 border-t-sky-500 rounded-full animate-[spin_2s_linear_infinite]"></div>
        
        {/* Baby Circle */}
        <div className="absolute inset-4 border-4 border-sky-100 rounded-full animate-[spin_3s_linear_infinite_reverse]"></div>
        <div className="absolute inset-4 border-4 border-b-sky-400 rounded-full animate-[spin_1.5s_linear_infinite_reverse]"></div>
        
        {/* Heart Center */}
        <div className="absolute inset-0 flex items-center justify-center animate-pulse">
        </div>
      </div>
      <p className="text-sky-500 font-bold text-sm animate-pulse">Loading...</p>
    </div>
  );
}

export function FullScreenLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm dark:bg-slate-950/80">
      <Loader />
    </div>
  );
}
