import { create } from "zustand";
import { type AppRole } from "@/config/constants";

interface UserProfile {
  name: string;
  email: string;
  phone?: string;
  lastLogin?: string;
}

interface AuthSlice {
  token: string | null;
  role: AppRole | null;
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (token: string, role: AppRole, user: UserProfile) => void;
  logout: () => void;
  updateProfile: (user: Partial<UserProfile>) => void;
}

const getStoredUser = (): UserProfile | null => {
  const stored = localStorage.getItem("boss_user_profile");
  if (!stored) {
    // If auth token is present but profile is not, seed a default admin profile
    if (localStorage.getItem("boss_auth_token") && localStorage.getItem("boss_user_role") === "admin") {
      return { 
        name: "Admin Control", 
        email: "admin@bossfarmhouse.com",
        phone: "+91 93711 13786",
        lastLogin: new Date().toLocaleDateString("en-US", { 
          month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" 
        })
      };
    }
    return null;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
};

export const useAuthStore = create<AuthSlice>((set) => ({
  token: localStorage.getItem("boss_auth_token"),
  role: localStorage.getItem("boss_user_role") as AppRole | null,
  user: getStoredUser(),
  isAuthenticated: !!localStorage.getItem("boss_auth_token"),

  login: (token, role, user) => {
    const userWithLogin = {
      ...user,
      lastLogin: new Date().toLocaleDateString("en-US", { 
        month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" 
      })
    };
    localStorage.setItem("boss_auth_token", token);
    localStorage.setItem("boss_user_role", role);
    localStorage.setItem("boss_user_profile", JSON.stringify(userWithLogin));
    set({ token, role, user: userWithLogin, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem("boss_auth_token");
    localStorage.removeItem("boss_user_role");
    localStorage.removeItem("boss_user_profile");
    set({ token: null, role: null, user: null, isAuthenticated: false });
  },

  updateProfile: (updatedUser) => {
    set((state) => {
      const newUser = state.user ? { ...state.user, ...updatedUser } : null;
      if (newUser) {
        localStorage.setItem("boss_user_profile", JSON.stringify(newUser));
      }
      return { user: newUser };
    });
  }
}));

export default useAuthStore;
