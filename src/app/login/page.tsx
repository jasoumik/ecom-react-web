"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/config";
import { useToast } from "@/components/ui/Toast";
import { OtpInput } from "@/components/ui/OtpInput";
import { useLanguage } from "@/lib/language-context";
import Link from "next/link";
import { motion } from "framer-motion";
import { Phone, Lock, ArrowRight, Mail, Eye, EyeOff } from "lucide-react";
import { AuthLayout } from "@/components/ui/AuthLayout";
import { Text } from "@/components/ui";
import { Home } from "lucide-react";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isOtpLogin, setIsOtpLogin] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const router = useRouter();
  const { addToast } = useToast();
  const { t } = useLanguage();

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.role === 'admin') {
          router.replace("/admin");
        } else {
          router.replace("/");
        }
      } catch {
        setIsCheckingAuth(false);
      }
    } else {
      setIsCheckingAuth(false);
    }
  }, [router]);

  // Show loading while checking auth
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
        <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      if (res.ok) {
        const data = await res.json();
        handleSuccess(data);
      } else {
        addToast(t('login_failed'), "error");
        setIsLoading(false);
      }
    } catch (error) {
      addToast(t('error'), "error");
      setIsLoading(false);
    }
  };

  const isLikelyEmail = (value: string) => value.includes('@') && value.includes('.');
  const isLikelyBdPhone = (value: string) => {
    const trimmed = value.replace(/\s+/g, '');
    return /^01[3-9]\d{8}$/.test(trimmed) || /^\+?8801[3-9]\d{8}$/.test(trimmed);
  };

  const validateIdentifier = () => {
    if (!identifier) return false;
    return isLikelyEmail(identifier) || isLikelyBdPhone(identifier);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateIdentifier()) {
      addToast(t('invalid_identifier') || 'Please enter a valid Bangladeshi phone number or email', 'error');
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/otp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier }),
      });
      if (res.ok) {
        setOtpSent(true);
        addToast(t('otp_sent_success'), "success");
      } else if (res.status === 400) {
        addToast(t('invalid_identifier') || 'Invalid phone or email format', 'error');
      } else {
        addToast(t('otp_send_failed'), "error");
      }
    } catch (e) {
      addToast(t('error'), "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 6) {
      addToast(t('invalid_otp') || 'Invalid or incomplete OTP', 'error');
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/otp/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, otp }),
      });
      if (res.ok) {
        const data = await res.json();
        handleSuccess(data);
      } else if (res.status === 401) {
        addToast(t('invalid_otp') || 'Invalid or expired OTP', 'error');
        setIsLoading(false);
      } else if (res.status === 400) {
        addToast(t('invalid_identifier') || 'Invalid phone or email format', 'error');
        setIsLoading(false);
      } else {
        addToast(t('login_failed'), 'error');
        setIsLoading(false);
      }
    } catch (e) {
      addToast(t('error'), "error");
      setIsLoading(false);
    }
  };

  const handleSuccess = (data: any) => {
    localStorage.setItem("token", data.access_token);
    localStorage.setItem("user", JSON.stringify(data.user));
    window.dispatchEvent(new Event("storage"));
    addToast(t('login_success'), "success");
    if (data.user.role === 'admin') {
      router.push("/admin");
    } else {
      router.push("/");
    }
  };

  return (
    <AuthLayout
      title={t('welcome_back')}
      subtitle={t('sign_in_details')}
    >
      {/* Login Method Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mb-8"
      >
        <button
          className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${
            !isOtpLogin 
              ? 'bg-white dark:bg-slate-700 shadow-sm text-sky-600 dark:text-sky-400' 
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
          onClick={() => { setIsOtpLogin(false); setOtpSent(false); }}
          disabled={isLoading}
        >
          {t('password')}
        </button>
        <button
          className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${
            isOtpLogin 
              ? 'bg-white dark:bg-slate-700 shadow-sm text-sky-600 dark:text-sky-400' 
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
          onClick={() => setIsOtpLogin(true)}
          disabled={isLoading}
        >
          {t('otp_login')}
        </button>
      </motion.div>

      {!isOtpLogin ? (
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleLogin}
          className="space-y-6"
        >
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">
              Phone / Email
            </label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors">
                <Mail size={20} />
              </div>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. 017... or name@example.com"
                required
                disabled={isLoading}
                className="w-full h-14 pl-12 pr-4 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-base font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">
              {t('password')}
            </label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors">
                <Lock size={20} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                disabled={isLoading}
                className="w-full h-14 pl-12 pr-12 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-base font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-14 bg-sky-500 hover:bg-sky-600 disabled:bg-sky-400 text-white font-bold rounded-2xl shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 transition-all flex items-center justify-center gap-2 text-base mt-2"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {t('sign_in')}
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </motion.form>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {!otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">
                  Phone / Email
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors">
                    <Mail size={20} />
                  </div>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. 017... or name@example.com"
                    required
                    disabled={isLoading}
                    className="w-full h-14 pl-12 pr-4 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-base font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 bg-sky-500 hover:bg-sky-600 disabled:bg-sky-400 text-white font-bold rounded-2xl shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 transition-all flex items-center justify-center gap-2 text-base mt-2"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {t('send_otp')}
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-6 animate-in fade-in">
              <div className="text-center py-4">
                <div className="w-20 h-20 bg-sky-100 dark:bg-sky-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Phone className="w-10 h-10 text-sky-600 dark:text-sky-400" />
                </div>
                <p className="text-base text-slate-600 dark:text-slate-400 mb-8 font-medium">
                  {t('enter_otp_code', { identifier })}
                </p>
                <OtpInput length={6} onComplete={(val) => setOtp(val)} />
              </div>

              <button
                onClick={handleVerifyOtp}
                disabled={isLoading || otp.length < 6}
                className="w-full h-14 bg-sky-500 hover:bg-sky-600 disabled:bg-sky-400 text-white font-bold rounded-2xl shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 transition-all flex items-center justify-center gap-2 text-base"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {t('verify_login')}
                    <ArrowRight size={20} />
                  </>
                )}
              </button>

              <button
                onClick={() => setOtpSent(false)}
                disabled={isLoading}
                className="w-full text-center text-sm text-sky-600 dark:text-sky-400 hover:underline font-bold"
              >
                {t('change_number_email')}
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* Register Link */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-10 text-center space-y-4"
      >
        <Text className="text-sm text-slate-500 dark:text-slate-400 font-medium">
          {t('dont_have_account')}{" "}
          <Link
            href="/register"
            className="text-sky-600 dark:text-sky-400 font-bold hover:underline"
          >
            {t('create_account')}
          </Link>
        </Text>

        {/* Back to Home Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-slate-400 dark:text-slate-500 hover:text-sky-600 dark:hover:text-sky-400 transition-colors font-medium"
        >
          <Home size={16} />
          <span>{t('back_to_home') || 'Back to Home'}</span>
        </Link>
      </motion.div>
    </AuthLayout>
  );
}