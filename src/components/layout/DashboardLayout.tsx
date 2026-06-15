import React, { useState, useEffect } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { 
  Menu, X, Waves,
  LayoutDashboard, CalendarDays, Users, Settings,
  Bell, User, LogOut, Shield, Edit, Info, Calendar, XCircle,
  ChevronLeft, ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "@/components/layout/Sidebar";
import useBookingStore from "@/app/bookingStore";
import useAuthStore from "@/app/store";
import fcmService from "@/services/fcmService";
import { toast } from "sonner";

export const DashboardLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isProfileEditMode, setIsProfileEditMode] = useState(false);
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(() => localStorage.getItem("boss_sidebar_minimized") === "true");

  const handleToggleMinimize = () => {
    setIsSidebarMinimized((prev) => {
      const next = !prev;
      localStorage.setItem("boss_sidebar_minimized", String(next));
      return next;
    });
  };

  // Profile fields state
  const { user, logout, updateProfile } = useAuthStore();
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");

  const { 
    notifications, 
    addNotification, 
    markNotificationsAsRead, 
    clearNotifications 
  } = useBookingStore();

  const navigate = useNavigate();
  const location = useLocation();

  // FCM Service Initializer & Listener
  useEffect(() => {
    // Request permission & retrieve mock token in debug logs
    fcmService.requestPermissionAndGetToken();

    // Attach simulated push listener (Foreground capture)
    const unsubscribe = fcmService.onMessageListener((payload) => {
      addNotification({
        title: payload.title,
        body: payload.body,
        type: "new_booking"
      });
    });

    return () => {
      unsubscribe();
    };
  }, [addNotification]);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName || !editEmail) {
      toast.warning("Missing Fields", {
        description: "Name and Email are required.",
      });
      return;
    }
    updateProfile({
      name: editName,
      email: editEmail,
      phone: editPhone,
    });
    setIsProfileEditMode(false);
    toast.success("Profile Updated", {
      description: "Admin credentials have been updated successfully.",
    });
  };

  const formatRelativeTime = (isoString: string) => {
    try {
      const now = new Date();
      const date = new Date(isoString);
      const diffMs = now.getTime() - date.getTime();
      if (diffMs < 0) return "Just now";
      const diffSec = Math.floor(diffMs / 1000);
      if (diffSec < 60) return "Just now";
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHr = Math.floor(diffMin / 60);
      if (diffHr < 24) return `${diffHr}h ago`;
      const diffDays = Math.floor(diffHr / 24);
      return `${diffDays}d ago`;
    } catch {
      return "";
    }
  };

  const mobileMenuItems = [
    { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
    { name: "Bookings", path: "/admin/bookings", icon: CalendarDays },
    { name: "Customers", path: "/admin/users", icon: Users },
    { name: "Slots", path: "/admin/slots", icon: Settings },
  ];

  return (
    <div className="h-screen w-screen bg-midnight text-chalk flex overflow-hidden select-none">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block h-screen sticky top-0 shrink-0 z-20">
        <Sidebar isMinimized={isSidebarMinimized} />
      </div>

      {/* Mobile Drawer Backdrop & Sidebar Slideout */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-30 bg-black/60 lg:hidden cursor-pointer"
              onClick={() => setIsSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 bottom-0 left-0 z-40 w-64 lg:hidden"
            >
              <Sidebar onClose={() => setIsSidebarOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Panel Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Control Bar */}
        <header className="h-16 border-b border-border bg-obsidian/40 flex items-center justify-between px-6 shrink-0 z-10">
          <div className="flex items-center space-x-4">
            {/* Mobile Sidebar Trigger */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-platinum hover:text-gold lg:hidden transition-colors cursor-pointer"
              aria-label="Toggle Navigation"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Desktop Sidebar Toggle Button */}
            <button
              onClick={handleToggleMinimize}
              className="hidden lg:flex text-platinum/50 hover:text-gold transition-colors items-center space-x-2 text-xs uppercase tracking-widest cursor-pointer"
              aria-label="Toggle Sidebar"
            >
              {isSidebarMinimized ? (
                <>
                  <ChevronRight className="w-4 h-4 text-gold animate-pulse" />
                  <span className="hidden sm:inline">Expand Menu</span>
                </>
              ) : (
                <>
                  <ChevronLeft className="w-4 h-4 text-gold" />
                  <span className="hidden sm:inline">Collapse Menu</span>
                </>
              )}
            </button>
          </div>

          {/* Center Brand Link */}
          <Link to="/" className="flex items-center space-x-2">
            <Waves className="w-4.5 h-4.5 text-gold" />
            <span className="font-serif text-sm tracking-wider text-chalk uppercase font-light">
              Boss <span className="text-gold italic font-normal">Sanctuary</span>
            </span>
          </Link>

          {/* Right Navigation Controls */}
          <div className="flex items-center space-x-2 relative">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsNotifDropdownOpen(!isNotifDropdownOpen);
                  setIsProfileDropdownOpen(false);
                }}
                className="relative p-2 text-platinum/70 hover:text-gold hover:bg-white/5 rounded-full transition-all cursor-pointer"
                aria-label="Notifications"
              >
                <Bell className="w-4.5 h-4.5" />
                {notifications.some(n => !n.read) && (
                  <span className="absolute top-1 right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              <AnimatePresence>
                {isNotifDropdownOpen && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-40 bg-transparent cursor-pointer"
                      onClick={() => setIsNotifDropdownOpen(false)}
                    />
                    
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-72 sm:w-80 md:w-96 bg-obsidian/95 border border-white/10 rounded-lg shadow-2xl backdrop-blur-xl z-50 overflow-hidden font-sans text-chalk"
                    >
                      <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/[0.02]">
                        <div className="flex items-center space-x-2">
                          <Bell className="w-4 h-4 text-gold" />
                          <span className="text-xs uppercase tracking-widest font-semibold text-platinum">Notifications</span>
                          {notifications.filter(n => !n.read).length > 0 && (
                            <span className="text-[9px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full font-bold">
                              {notifications.filter(n => !n.read).length} New
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => markNotificationsAsRead()}
                            className="text-[10px] text-gold hover:underline cursor-pointer"
                          >
                            Mark all read
                          </button>
                          <span className="text-white/20 text-[10px]">•</span>
                          <button
                            onClick={() => clearNotifications()}
                            className="text-[10px] text-red-400 hover:underline cursor-pointer"
                          >
                            Clear
                          </button>
                        </div>
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-white/5 scrollbar-thin">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center flex flex-col items-center justify-center space-y-2">
                            <Bell className="w-8 h-8 text-platinum/15 stroke-[1.5]" />
                            <p className="text-xs text-platinum/40">Your sanctuary is running smoothly</p>
                            <p className="text-[10px] text-platinum/20">No notifications found</p>
                          </div>
                        ) : (
                          notifications.map((notif) => {
                            let NotifIcon = Info;
                            let iconColor = "text-blue-400 bg-blue-500/10";
                            if (notif.type === "new_booking") {
                              NotifIcon = Calendar;
                              iconColor = "text-gold bg-gold/10";
                            } else if (notif.type === "cancellation") {
                              NotifIcon = XCircle;
                              iconColor = "text-red-400 bg-red-500/10";
                            }

                            return (
                              <div
                                key={notif.id}
                                className={`p-4 hover:bg-white/[0.02] transition-colors flex gap-3 relative ${
                                  !notif.read ? "bg-white/[0.01]" : ""
                                }`}
                              >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${iconColor}`}>
                                  <NotifIcon className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2">
                                    <p className={`text-xs font-medium truncate ${!notif.read ? "text-chalk" : "text-platinum/60"}`}>
                                      {notif.title}
                                    </p>
                                    <span className="text-[9px] text-platinum/30 shrink-0">
                                      {formatRelativeTime(notif.timestamp)}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-platinum/50 mt-0.5 line-clamp-2 leading-relaxed">
                                    {notif.body}
                                  </p>
                                </div>
                                {!notif.read && (
                                  <div className="absolute top-4 right-4 w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsProfileDropdownOpen(!isProfileDropdownOpen);
                  setIsNotifDropdownOpen(false);
                }}
                className="flex items-center space-x-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-2 py-1 transition-all cursor-pointer"
              >
                <div className="w-5.5 h-5.5 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center text-[10px] font-bold text-gold uppercase tracking-wider font-sans">
                  {user?.name ? user.name.split(" ").map(n => n[0]).join("").slice(0, 2) : "AD"}
                </div>
                <span className="text-[10px] text-platinum/80 uppercase tracking-widest font-sans font-medium hidden sm:inline max-w-[90px] truncate">
                  {user?.name || "Admin"}
                </span>
              </button>

              <AnimatePresence>
                {isProfileDropdownOpen && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-40 bg-transparent cursor-pointer"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    />
                    
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-52 bg-obsidian/95 border border-white/10 rounded-lg shadow-2xl backdrop-blur-xl z-50 overflow-hidden font-sans text-chalk"
                    >
                      <div className="p-4 border-b border-white/5 bg-white/[0.02]">
                        <p className="text-xs font-semibold text-chalk truncate">{user?.name || "Admin Control"}</p>
                        <p className="text-[9px] text-platinum/40 truncate mt-0.5">{user?.email || "admin@bossfarmhouse.com"}</p>
                        <div className="inline-block mt-2 px-2 py-0.5 rounded-full bg-gold/10 border border-gold/20 text-[8px] text-gold uppercase tracking-wider font-semibold">
                          Lead Administrator
                        </div>
                      </div>

                      <div className="p-1 space-y-0.5">
                        <button
                          onClick={() => {
                            setIsProfileDropdownOpen(false);
                            setEditName(user?.name || "Admin Control");
                            setEditEmail(user?.email || "admin@bossfarmhouse.com");
                            setEditPhone(user?.phone || "+91 93711 13786");
                            setIsProfileModalOpen(true);
                          }}
                          className="w-full text-left px-3 py-2 text-xs rounded text-platinum/70 hover:text-gold hover:bg-white/5 transition-all flex items-center space-x-2 cursor-pointer"
                        >
                          <User className="w-3.5 h-3.5 text-platinum/40" />
                          <span>My Profile</span>
                        </button>
                        
                        <hr className="border-white/5 my-1" />

                        <button
                          onClick={() => {
                            setIsProfileDropdownOpen(false);
                            logout();
                            navigate("/auth/login");
                          }}
                          className="w-full text-left px-3 py-2 text-xs rounded text-red-400 hover:bg-red-500/10 transition-all flex items-center space-x-2 cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5 text-red-400/60" />
                          <span>Exit Panel</span>
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Content Render Outlet */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10 bg-luxury-gradient pb-24 lg:pb-10">
          <Outlet />
        </main>
      </div>

      {/* Profile Details Dialog */}
      <AnimatePresence>
        {isProfileModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
              onClick={() => {
                setIsProfileModalOpen(false);
                setIsProfileEditMode(false);
              }}
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-obsidian border border-white/10 rounded-xl w-full max-w-sm overflow-hidden relative z-10 font-sans shadow-2xl"
            >
              <div className="p-5 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-gold/10 border border-gold/25 flex items-center justify-center">
                    <User className="w-4.5 h-4.5 text-gold" />
                  </div>
                  <div>
                    <h2 className="text-xs font-serif text-chalk tracking-wide uppercase">Admin Profile</h2>
                    <p className="text-[9px] text-platinum/40 uppercase tracking-widest">Security Credentials</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsProfileModalOpen(false);
                    setIsProfileEditMode(false);
                  }}
                  className="text-platinum/50 hover:text-chalk p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {isProfileEditMode ? (
                  <form onSubmit={handleProfileSave} className="space-y-4">
                    <div>
                      <label className="block text-[9px] uppercase tracking-widest text-platinum/40 mb-1 font-semibold">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full bg-midnight border border-white/10 rounded px-3 py-2 text-xs text-chalk focus:outline-none focus:border-gold transition-colors font-sans"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] uppercase tracking-widest text-platinum/40 mb-1 font-semibold">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        className="w-full bg-midnight border border-white/10 rounded px-3 py-2 text-xs text-chalk focus:outline-none focus:border-gold transition-colors font-sans"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] uppercase tracking-widest text-platinum/40 mb-1 font-semibold">
                        Contact Phone
                      </label>
                      <input
                        type="text"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        placeholder="+91 XXXXX XXXXX"
                        className="w-full bg-midnight border border-white/10 rounded px-3 py-2 text-xs text-chalk focus:outline-none focus:border-gold transition-colors font-sans"
                      />
                    </div>

                    <div className="flex space-x-2 pt-2 border-t border-white/5">
                      <button
                        type="button"
                        onClick={() => setIsProfileEditMode(false)}
                        className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded py-2 text-xs text-platinum hover:text-chalk uppercase tracking-widest transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 btn-gold rounded py-2 text-xs uppercase tracking-widest cursor-pointer"
                      >
                        Save Profile
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-3.5">
                    <div className="grid grid-cols-3 gap-1 border-b border-white/5 pb-2.5">
                      <span className="text-[9px] uppercase tracking-widest text-platinum/40 font-semibold">Full Name</span>
                      <span className="col-span-2 text-xs text-chalk font-medium">{user?.name || "Admin Control"}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-1 border-b border-white/5 pb-2.5">
                      <span className="text-[9px] uppercase tracking-widest text-platinum/40 font-semibold">Email</span>
                      <span className="col-span-2 text-xs text-chalk font-medium truncate">{user?.email || "admin@bossfarmhouse.com"}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-1 border-b border-white/5 pb-2.5">
                      <span className="text-[9px] uppercase tracking-widest text-platinum/40 font-semibold">Phone</span>
                      <span className="col-span-2 text-xs text-chalk font-medium">{user?.phone || "+91 93711 13786"}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-1 border-b border-white/5 pb-2.5">
                      <span className="text-[9px] uppercase tracking-widest text-platinum/40 font-semibold">System Role</span>
                      <span className="col-span-2 text-xs text-gold font-bold flex items-center space-x-1">
                        <Shield className="w-3.5 h-3.5" />
                        <span>Lead Administrator</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-1 border-b border-white/5 pb-2.5">
                      <span className="text-[9px] uppercase tracking-widest text-platinum/40 font-semibold">Last Session</span>
                      <span className="col-span-2 text-xs text-platinum/60 font-medium">
                        {user?.lastLogin || "Just Now"}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-1 pb-1">
                      <span className="text-[9px] uppercase tracking-widest text-platinum/40 font-semibold">FCM Status</span>
                      <span className="col-span-2 text-[9px] text-emerald-400 font-mono flex items-center space-x-1 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">
                        <span>fcm_registered_ok</span>
                      </span>
                    </div>

                    <div className="pt-3 border-t border-white/5">
                      <button
                        onClick={() => {
                          setEditName(user?.name || "Admin Control");
                          setEditEmail(user?.email || "admin@bossfarmhouse.com");
                          setEditPhone(user?.phone || "+91 93711 13786");
                          setIsProfileEditMode(true);
                        }}
                        className="w-full btn-gold py-2.5 rounded text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        Edit Profile Info
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Tab Bar (Capacitor Native Feel) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-obsidian border-t border-border flex items-center justify-around px-2 z-30 pb-safe">
        {mobileMenuItems.map((item) => {
          const Icon = item.icon;
          // Sub-path checks to keep booking, slot sub-pages highlighted
          const isActive = item.path === "/admin" 
            ? location.pathname === "/admin" 
            : location.pathname.startsWith(item.path);

          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center justify-center space-y-1 py-1 px-3 rounded text-[9px] uppercase tracking-wider font-sans cursor-pointer transition-colors ${
                isActive ? "text-gold" : "text-platinum/40"
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform duration-250 ${isActive ? "scale-105" : ""}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default DashboardLayout;
