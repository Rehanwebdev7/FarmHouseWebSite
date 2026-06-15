import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Key, ShieldCheck, Mail, ArrowRight } from "lucide-react";
import { APP_ROLES } from "@/config/constants";
import useAuthStore from "@/app/store";
import { toast } from "sonner";

export const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const loginStore = useAuthStore((state) => state.login);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.warning("Incomplete Fields", {
        description: "Please enter your administrator credentials.",
      });
      return;
    }

    // Check mock admin credentials
    if (email === "admin@bossfarmhouse.com" && password === "admin123") {
      const mockToken = "mock_admin_jwt_token";
      const userProfile = {
        name: "Admin Control",
        email: "admin@bossfarmhouse.com",
      };
      loginStore(mockToken, APP_ROLES.ADMIN, userProfile);
      
      toast.success("Administrator Session Restored", {
        description: "Authorized control panel access granted.",
      });
      navigate("/admin", { replace: true });
    } else {
      toast.error("Authentication Refused", {
        description: "Invalid credentials. Use admin@bossfarmhouse.com / admin123.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-midnight text-chalk flex flex-col justify-center items-center px-4 sm:px-6 py-10 relative bg-grain-texture overflow-y-auto">
      {/* Subtle background overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-50 z-0 pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[350px] h-[350px] bg-gold-glow rounded-full filter blur-[120px] pointer-events-none opacity-20"></div>

      {/* Main card */}
      <div className="w-full max-w-md bg-obsidian/80 border border-white/10 p-6 sm:p-8 rounded-xl relative z-10 luxury-card shadow-2xl my-auto">
        <div className="flex flex-col items-center space-y-2.5 text-center mb-6">
          <img src="/images/logo.svg" alt="Boss Logo" className="w-10 h-10 object-contain" />
          <h1 className="font-serif text-2xl sm:text-3xl text-chalk tracking-wide">
            Boss Sanctuary
          </h1>
          <p className="text-[9px] text-platinum/40 tracking-wider uppercase font-sans font-semibold">
            Lead Administrator Access Gate
          </p>
        </div>

        <form onSubmit={handleLoginSubmit} className="space-y-4">
          {/* Admin Email */}
          <div>
            <label className="block text-[9px] sm:text-[10px] uppercase tracking-widest text-platinum/40 mb-1.5 font-sans font-semibold">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-gold/60" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@bossfarmhouse.com"
                className="w-full bg-midnight border border-white/10 rounded px-4 py-2.5 sm:py-3 pl-10 text-xs sm:text-sm text-chalk focus:outline-none focus:border-gold transition-colors font-sans"
              />
            </div>
          </div>

          {/* Access Code */}
          <div>
            <label className="block text-[9px] sm:text-[10px] uppercase tracking-widest text-platinum/40 mb-1.5 font-sans font-semibold">
              Access Code
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-3 w-4 h-4 text-gold/60" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-midnight border border-white/10 rounded px-4 py-2.5 sm:py-3 pl-10 text-xs sm:text-sm text-chalk focus:outline-none focus:border-gold transition-colors font-sans"
              />
            </div>
            <p className="text-[8px] sm:text-[9px] text-platinum/40 mt-2">
              Tip: Credentials are <strong className="text-gold">admin@bossfarmhouse.com / admin123</strong>.
            </p>
          </div>

          <button
            type="submit"
            className="w-full btn-gold py-3 sm:py-4 rounded text-xs uppercase tracking-widest font-sans flex items-center justify-center gap-2 mt-4 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            Enter Sanctuary
          </button>
        </form>

        <div className="mt-6 text-center text-[9px] sm:text-[10px] text-platinum/40 uppercase tracking-wider font-sans border-t border-white/5 pt-4">
          <p>Mock login session is preserved in local storage.</p>
          <a
            href="/"
            className="inline-flex items-center gap-1 text-gold hover:text-white mt-2.5 transition-colors cursor-pointer"
          >
            Return to Public Portal <ArrowRight className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
