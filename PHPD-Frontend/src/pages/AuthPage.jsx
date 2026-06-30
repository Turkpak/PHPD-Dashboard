import React, { useState } from "react";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Lock,
    Mail,
    ArrowRight,
    Eye,
    EyeOff,
    Menu,
    User,
    ShieldCheck,
    MapPin,
    LogOut,
    Shield,
    HelpCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
            
            // Extract role for accurate routing downstream matching original logic
            const roleForNav =
                data?.role ??
                (data?.is_admin
                    ? "admin"
                    : data?.access?.stakeholder_type?.toLowerCase() ||
                      "client");
                      
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
        <div className="min-h-screen w-full flex flex-col relative font-sans text-slate-800 bg-background">
            
            {/* Main scrollable content area */}
            <div className="flex-1 flex flex-col items-center justify-center px-5 py-10">
                
                {/* Upper Branding Area */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col items-center mb-8 lg:mt-6"
                >
                    <img src="/Assets/PHPD.png" alt="PHPD Logo" className="w-[85vw] max-w-[320px] object-contain mb-6 drop-shadow-sm" />
                    <h2 className="text-3xl font-bold text-[#054332] tracking-tight mb-2">Welcome Back</h2>
                    <p className="text-slate-600/90 font-medium text-[15px]">Punjab Health & Population (PHPD)</p>
                </motion.div>

                {/* Login Card */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="w-full max-w-[420px] bg-white rounded-[2rem] shadow-[0_4px_24px_-8px_rgba(0,0,0,0.06)] p-7 lg:p-8 relative z-10 border border-[#024a35]/25"
                >
                    <form onSubmit={handleSubmit} className="space-y-6">
                        
                        {/* Email Input */}
                        <div className="space-y-2">
                            <Label className="text-[13px] font-bold text-slate-700 ml-1">Email Address</Label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#054332] transition-colors" />
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="name@phpd.gov.pk"
                                    className="h-[52px] pl-11 rounded-2xl bg-white border border-slate-200 focus:bg-white focus:border-[#054332] focus:ring-2 focus:ring-[#054332]/10 transition-all font-medium text-[15px] placeholder:text-slate-300"
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between mx-1">
                                <Label className="text-[13px] font-bold text-slate-700">Password</Label>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#054332] transition-colors" />
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                    className="h-[52px] pl-11 pr-11 rounded-2xl bg-white border border-slate-200 focus:bg-white focus:border-[#054332] focus:ring-2 focus:ring-[#054332]/10 transition-all font-black tracking-widest text-[#054332] placeholder:text-slate-300 placeholder:tracking-normal placeholder:font-medium"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-14 mt-2 bg-[#024a35] text-white rounded-full font-bold text-[16px] shadow-[0_8px_20px_rgba(2,74,53,0.25)] flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Access Portal
                                    <ArrowRight className="w-5 h-5 ml-1" />
                                </>
                            )}
                        </motion.button>
                    </form>

                    {/* Meta Security Footer */}
                    <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col items-center text-center pb-2">
                        <p className="text-[12.5px] text-slate-500 font-medium">
                            Protected by secure institutional encryption.<br/>
                            <a href="#" className="font-bold text-[#054332] hover:underline mt-1 inline-block">Security Policy</a>
                        </p>
                    </div>
                </motion.div>

            </div>

        </div>
    );
}
