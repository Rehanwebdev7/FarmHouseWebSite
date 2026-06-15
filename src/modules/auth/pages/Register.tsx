import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Waves, Mail, User, ShieldAlert, ArrowRight, UserCheck } from "lucide-react";
import { toast } from "sonner";

export const Register: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password) {
      toast.warning("Incomplete Fields", {
        description: "Please supply all field information to initialize profile setup.",
      });
      return;
    }

    toast.success("Account Initialized", {
      description: "Secure profile created. Please log in utilizing your credentials.",
    });

    navigate("/auth/login");
  };

  return (
    <div className="min-h-screen bg-midnight text-chalk flex flex-col justify-center items-center px-6 relative">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[350px] h-[350px] bg-azure-glow rounded-full filter blur-[120px] pointer-events-none opacity-30"></div>

      <div className="w-full max-w-md bg-obsidian border border-white/5 p-8 rounded-lg relative z-10 luxury-card">
        <div className="flex flex-col items-center space-y-3 text-center mb-8">
          <Waves className="w-8 h-8 text-gold animate-pulse" />
          <h1 className="font-serif text-3xl text-chalk tracking-wide">
            Register Guest
          </h1>
          <p className="text-xs text-platinum/50 tracking-wider uppercase">
            Create Access Credentials
          </p>
        </div>

        <form onSubmit={handleRegisterSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-platinum/40 mb-2 font-sans">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3.5 w-4 h-4 text-gold/60" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alexander Wright"
                className="w-full bg-midnight border border-white/10 rounded px-4 py-3 pl-10 text-sm text-chalk focus:outline-none focus:border-gold transition-colors font-sans"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-platinum/40 mb-2 font-sans">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-4 h-4 text-gold/60" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vip.client@bossfarmhouse.com"
                className="w-full bg-midnight border border-white/10 rounded px-4 py-3 pl-10 text-sm text-chalk focus:outline-none focus:border-gold transition-colors font-sans"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-platinum/40 mb-2 font-sans">
              Set Access Code
            </label>
            <div className="relative">
              <ShieldAlert className="absolute left-3 top-3.5 w-4 h-4 text-gold/60" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-midnight border border-white/10 rounded px-4 py-3 pl-10 text-sm text-chalk focus:outline-none focus:border-gold transition-colors font-sans"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full btn-gold py-4 rounded text-xs uppercase tracking-widest font-sans flex items-center justify-center gap-2 mt-6"
          >
            <UserCheck className="w-4 h-4" />
            Initialize Registration
          </button>
        </form>

        <div className="mt-8 text-center text-[10px] text-platinum/40 uppercase tracking-wider font-sans border-t border-white/5 pt-4">
          <p>Already have access credentials?</p>
          <Link
            to="/auth/login"
            className="inline-flex items-center gap-1 text-gold hover:text-white mt-3 transition-colors font-sans"
          >
            Authenticate Here <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
