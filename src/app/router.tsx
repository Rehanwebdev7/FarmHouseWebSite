import React, { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import AuthGuard from "@/guards/AuthGuard";
import RoleGuard from "@/guards/RoleGuard";
import { APP_ROLES } from "@/config/constants";

// Lazy-loaded Components
const LandingPage = lazy(() => import("@/modules/user/pages/LandingPage"));

// Auth Module Pages
const Login = lazy(() => import("@/modules/auth/pages/Login"));
const Register = lazy(() => import("@/modules/auth/pages/Register"));

// Dashboard Layout Shells
const DashboardLayout = lazy(() => import("@/components/layout/DashboardLayout"));

// Admin Module Pages
const AdminDashboard = lazy(() => import("@/modules/admin/pages/Dashboard"));
const AdminBookings = lazy(() => import("@/modules/admin/pages/Bookings"));
const AdminUsers = lazy(() => import("@/modules/admin/pages/Users"));
const AdminSlots = lazy(() => import("@/modules/admin/pages/Slots"));



// Loading spinner matching premium branding
const LuxuryLoader: React.FC = () => (
  <div className="min-h-screen bg-midnight flex flex-col items-center justify-center space-y-4">
    <div className="relative w-16 h-16">
      <div className="absolute inset-0 rounded-full border-t-2 border-r-2 border-gold animate-spin"></div>
      <div className="absolute inset-2 rounded-full border-b-2 border-l-2 border-azure animate-spin duration-1000"></div>
    </div>
    <p className="font-serif text-gold tracking-widest text-sm uppercase animate-pulse">Boss Farm House</p>
  </div>
);

const Suspended: React.FC<{ component: React.ComponentType }> = ({ component: Component }) => (
  <Suspense fallback={<LuxuryLoader />}>
    <Component />
  </Suspense>
);

export const router = createBrowserRouter([
  // Public Landing Page
  {
    path: "/",
    element: <Suspended component={LandingPage} />,
  },

  // Auth Routes
  {
    path: "/auth",
    children: [
      { path: "", element: <Navigate to="/auth/login" replace /> },
      { path: "login", element: <Suspended component={Login} /> },
      { path: "register", element: <Suspended component={Register} /> },
    ],
  },

  // Admin Dashboard Module
  {
    path: "/admin",
    element: (
      <AuthGuard>
        <RoleGuard allowedRoles={[APP_ROLES.ADMIN]}>
          <Suspended component={DashboardLayout} />
        </RoleGuard>
      </AuthGuard>
    ),
    children: [
      { path: "", element: <Suspended component={AdminDashboard} /> },
      { path: "bookings", element: <Suspended component={AdminBookings} /> },
      { path: "users", element: <Suspended component={AdminUsers} /> },
      { path: "slots", element: <Suspended component={AdminSlots} /> },
    ],
  },

  // Fallback Wildcard redirection
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

export default router;
