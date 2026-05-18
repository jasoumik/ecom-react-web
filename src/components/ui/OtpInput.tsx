"use client";

import { useState, useRef, useEffect } from "react";

interface OtpInputProps {
  length?: number;
  onComplete: (otp: string) => void;
}

export function OtpInput({ length = 6, onComplete }: OtpInputProps) {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const updateOtpAndMaybeComplete = (newOtp: string[]) => {
    setOtp(newOtp);
    const combinedOtp = newOtp.join("");
    if (combinedOtp.length === length && !newOtp.includes("")) {
      onComplete(combinedOtp);
    }
  };

  const handleChange = (index: number, value: string) => {
    // Allow only digits
    if (!/^[0-9]*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);

    updateOtpAndMaybeComplete(newOtp);

    // Move to next input
    if (value && index < length - 1 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (index: number, e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").replace(/\D/g, ""); // digits only
    if (!pasteData) return;

    const newOtp = [...otp];
    for (let i = 0; i < length && i < pasteData.length; i++) {
      newOtp[i] = pasteData[i];
    }

    updateOtpAndMaybeComplete(newOtp);

    // Focus last filled input
    const lastIndex = Math.min(length - 1, pasteData.length - 1);
    if (lastIndex >= 0 && inputRefs.current[lastIndex]) {
      inputRefs.current[lastIndex]?.focus();
    }
  };

  return (
    <div className="flex gap-2 justify-center">
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={(el) => { inputRefs.current[index] = el; }}
          type="tel"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={(e) => handlePaste(index, e)}
          className="w-10 h-12 text-center text-xl font-bold border border-slate-200 rounded-lg focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition-all bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
        />
      ))}
    </div>
  );
}
