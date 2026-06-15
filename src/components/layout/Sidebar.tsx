import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, Users, 
  Settings, LogOut, CalendarDays
} from "lucide-react";
import useAuthStore from "@/app/store";

interface SidebarProps {
  onClose?: () => void;
  isMinimized?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ onClose, isMinimized = false }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const getRoleFromPath = () => {
    if (location.pathname.startsWith("/admin")) return "admin";
    return "user";
  };

  const role = getRoleFromPath();

  const handleLogout = () => {
    logout();
    if (onClose) onClose();
    navigate("/auth/login");
  };

  // Simplified navigation structure mapping exactly to Farm House modular panels
  const menuItems = {
    admin: [
      { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
      { name: "Bookings", path: "/admin/bookings", icon: CalendarDays },
      { name: "Customers", path: "/admin/users", icon: Users },
      { name: "Slot configuration", path: "/admin/slots", icon: Settings },
    ],
    user: [],
  };

  const currentMenu = role === "admin" ? menuItems.admin : menuItems.user;

  return (
    <aside className={`min-h-screen bg-obsidian border-r border-border flex flex-col justify-between py-6 transition-all duration-300 ${
      isMinimized ? "w-20" : "w-64"
    }`}>
      <div className="flex flex-col space-y-6">
        {/* Module Header */}
        <div className={`flex items-center transition-all duration-300 ${
          isMinimized ? "justify-center px-0" : "px-6 space-x-2.5"
        }`}>
          <img src="/images/logo.svg" alt="Boss Logo" className="w-7 h-7 object-contain" />
          {!isMinimized && (
            <div className="flex flex-col">
              <span className="font-serif text-base tracking-widest text-gold uppercase font-light">
                Boss Panel
              </span>
              <span className="text-[9px] text-platinum/40 uppercase tracking-widest mt-0.5 animate-fade-in">
                {role === "admin" ? "Lead Admin" : "VIP Guest"} Mode
              </span>
            </div>
          )}
        </div>

        {/* Navigation Node List */}
        <nav className={`flex flex-col space-y-1 ${isMinimized ? "px-0" : "px-3"}`}>
          {currentMenu.map((item) => {
            const Icon = item.icon;
            const isActive = item.path === "/admin" 
              ? location.pathname === "/admin" 
              : location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => onClose && onClose()}
                title={isMinimized ? item.name : undefined}
                className={`flex items-center rounded text-xs uppercase tracking-widest font-sans transition-all duration-300 cursor-pointer ${
                  isMinimized 
                    ? "justify-center py-3.5 px-0 w-12 h-12 mx-auto" 
                    : "space-x-3 px-4 py-3"
                } ${
                  isActive
                    ? "bg-gold/15 text-gold border-l-2 border-gold"
                    : "text-platinum/60 hover:bg-white/5 hover:text-platinum"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-gold" : "text-platinum/40"}`} />
                {!isMinimized && <span className="animate-fade-in">{item.name}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Logout Action */}
      <div className={isMinimized ? "px-0" : "px-4"}>
        <button
          onClick={handleLogout}
          title={isMinimized ? "Exit Panel" : undefined}
          className={`flex items-center rounded text-xs uppercase tracking-widest text-red-400/70 hover:text-red-400 hover:bg-red-500/5 transition-all duration-300 font-sans cursor-pointer ${
            isMinimized 
              ? "justify-center py-3.5 px-0 w-12 h-12 mx-auto" 
              : "space-x-3 px-4 py-3 w-full"
          }`}
        >
          <LogOut className="w-4 h-4 text-red-400/40" />
          {!isMinimized && <span className="animate-fade-in">Exit Panel</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
