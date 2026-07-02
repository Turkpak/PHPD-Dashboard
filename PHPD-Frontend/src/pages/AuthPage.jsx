import React, { useState } from "react";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Mail, ArrowRight, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { login as apiLogin } from "@/api/auth";

export default function AuthPage() {
    const [, setLocation] = useLocation();
    const { setUser, startSession } = useAuth();
    const { toast } = useToast();

    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const data = await apiLogin({ email, password });
            setUser(data);
            startSession();
            const roleForNav =
                data?.role ??
                (data?.is_admin
                    ? "admin"
                    : data?.access?.stakeholder_type?.toLowerCase() || "client");
            localStorage.setItem("userRole", roleForNav);
            setLocation("/");
            toast({ title: "Welcome", description: "Login successful." });
        } catch (err) {
            toast({
                title: "Login failed",
                description: err instanceof Error ? err.message : "Invalid credentials",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        /*
         * Full-screen split layout on lg+:
         *   Left  — decorative green brand panel (hidden on mobile)
         *   Right — login form, always visible
         *
         * On mobile/tablet: single centered column, no split.
         */
        <div className="min-h-screen w-full flex flex-col lg:flex-row bg-background overflow-hidden">

            {/* ── LEFT BRAND PANEL (lg+) ─────────────────────────── */}
            <div
                className="hidden lg:flex lg:w-[45%] xl:w-[42%] flex-col items-center justify-center
                           bg-gradient-to-br from-[#054332] via-[#033828] to-[#021f17]
                           relative overflow-hidden px-12 py-16 shrink-0"
            >
                {/* Subtle decorative rings */}
                <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                    <div className="absolute top-[-120px] left-[-120px] w-[420px] h-[420px] rounded-full border border-white/5" />
                    <div className="absolute top-[-60px] left-[-60px] w-[320px] h-[320px] rounded-full border border-white/5" />
                    <div className="absolute bottom-[-80px] right-[-80px] w-[380px] h-[380px] rounded-full border border-white/5" />
                </div>

                <motion.div
                    initial={{ opacity: 0, x: -24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="relative z-10 flex flex-col items-center text-center"
                >
                    <img
                        src="/Assets/PHPD.png"
                        alt="PHPD Logo"
                        className="w-48 xl:w-56 object-contain drop-shadow-[0_8px_32px_rgba(255,255,255,0.12)] mb-10"
                    />
                    <h1 className="text-3xl xl:text-4xl font-bold text-white tracking-tight leading-tight mb-4">
                        PHPD Progress<br />Dashboard
                    </h1>
                    <p className="text-white/60 text-sm xl:text-base leading-relaxed max-w-xs">
                        Punjab Health & Population Department — centralised project tracking and analytics platform.
                    </p>

                    {/* Feature pills */}
                    <div className="mt-10 flex flex-col gap-3 w-full max-w-xs">
                        {[
                            "Real-time project monitoring",
                            "GIS boundary visualisation",
                            "Financial & budget analytics",
                            "Role-based access control",
                        ].map((text) => (
                            <div
                                key={text}
                                className="flex items-center gap-3 bg-white/8 border border-white/10
                                           rounded-xl px-4 py-2.5 text-white/80 text-xs xl:text-sm font-medium"
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                                {text}
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Footer credit */}
                <p className="absolute bottom-6 text-white/30 text-xs z-10">
                    © {new Date().getFullYear()} NESPAK. All rights reserved.
                </p>
            </div>

            {/* ── RIGHT FORM PANEL ───────────────────────────────── */}
            <div className="flex-1 flex flex-col items-center justify-center
                            px-5 sm:px-8 py-10 sm:py-12 min-h-screen lg:min-h-0">

                {/* Mobile-only logo + heading */}
                <motion.div
                    initial={{ opacity: 0, y: -16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45 }}
                    className="lg:hidden flex flex-col items-center mb-8"
                >
                    <img
                        src="/Assets/PHPD.png"
                        alt="PHPD Logo"
                        className="w-[min(72vw,220px)] object-contain mb-5 drop-shadow-sm"
                    />
                    <h2 className="text-2xl sm:text-3xl font-bold text-[#054332] tracking-tight mb-1 text-center">
                        Welcome Back
                    </h2>
                    <p className="text-slate-500 text-sm sm:text-[15px] font-medium text-center">
                        Punjab Health &amp; Population (PHPD)
                    </p>
                </motion.div>

                {/* Desktop heading (inside form panel, above card) */}
                <motion.div
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45 }}
                    className="hidden lg:block mb-8 text-center"
                >
                    <h2 className="text-2xl xl:text-3xl font-bold text-[#054332] tracking-tight mb-1">
                        Sign in to your account
                    </h2>
                    <p className="text-slate-500 text-sm">
                        Enter your credentials to access the dashboard.
                    </p>
                </motion.div>

                {/* Login Card */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="w-full max-w-[440px] bg-white rounded-2xl sm:rounded-[2rem]
                               shadow-[0_4px_32px_-8px_rgba(0,0,0,0.08)]
                               p-6 sm:p-8 border border-[#024a35]/20"
                >
                    <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">

                        {/* Email */}
                        <div className="space-y-1.5">
                            <Label
                                htmlFor="auth-email"
                                className="text-[13px] font-bold text-slate-700 ml-0.5"
                            >
                                Email Address
                            </Label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4
                                                text-slate-400 group-focus-within:text-[#054332] transition-colors
                                                pointer-events-none" />
                                <Input
                                    id="auth-email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    autoComplete="email"
                                    placeholder="name@phpd.gov.pk"
                                    className="h-[52px] pl-11 rounded-xl sm:rounded-2xl bg-white
                                               border border-slate-200
                                               focus:border-[#054332] focus:ring-2 focus:ring-[#054332]/10
                                               transition-all font-medium text-[15px] placeholder:text-slate-300"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <Label
                                htmlFor="auth-password"
                                className="text-[13px] font-bold text-slate-700 ml-0.5"
                            >
                                Password
                            </Label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4
                                                text-slate-400 group-focus-within:text-[#054332] transition-colors
                                                pointer-events-none" />
                                <Input
                                    id="auth-password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    autoComplete="current-password"
                                    placeholder="••••••••"
                                    className="h-[52px] pl-11 pr-12 rounded-xl sm:rounded-2xl bg-white
                                               border border-slate-200
                                               focus:border-[#054332] focus:ring-2 focus:ring-[#054332]/10
                                               transition-all font-black tracking-widest text-[#054332]
                                               placeholder:text-slate-300 placeholder:tracking-normal
                                               placeholder:font-medium"
                                />
                                {/* Toggle show/hide — min 44×44 touch target */}
                                <button
                                    type="button"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                    onClick={() => setShowPassword((v) => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2
                                               h-9 w-9 flex items-center justify-center rounded-lg
                                               text-slate-400 hover:text-slate-600 transition-colors
                                               focus-visible:outline-none focus-visible:ring-2
                                               focus-visible:ring-[#054332]/40"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-[52px] sm:h-14 mt-1 bg-[#024a35] text-white
                                       rounded-full font-bold text-base sm:text-[16px]
                                       shadow-[0_8px_20px_rgba(2,74,53,0.25)]
                                       flex items-center justify-center gap-2
                                       transition-all disabled:opacity-70 disabled:cursor-not-allowed
                                       focus-visible:outline-none focus-visible:ring-2
                                       focus-visible:ring-[#054332] focus-visible:ring-offset-2"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Access Portal
                                    <ArrowRight className="w-5 h-5 ml-1" aria-hidden="true" />
                                </>
                            )}
                        </motion.button>
                    </form>

                    {/* Security footer */}
                    <div className="mt-7 pt-5 border-t border-slate-100 flex flex-col items-center text-center">
                        <p className="text-[12px] sm:text-[12.5px] text-slate-400 font-medium leading-relaxed">
                            Protected by secure institutional encryption.{" "}
                            <a
                                href="#"
                                className="font-bold text-[#054332] hover:underline underline-offset-2
                                           focus-visible:outline-none focus-visible:ring-1
                                           focus-visible:ring-[#054332] rounded"
                            >
                                Security Policy
                            </a>
                        </p>
                    </div>
                </motion.div>

                {/* Mobile-only bottom copyright */}
                <p className="lg:hidden mt-8 text-xs text-slate-400 text-center">
                    © {new Date().getFullYear()} NESPAK. All rights reserved.
                </p>
            </div>
        </div>
    );
}
