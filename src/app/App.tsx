import React from "react";
import { RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { router } from "@/app/router";

// Instantiate the global TanStack Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes stale time
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Sonner Toast Engine */}
      <Toaster 
        theme="dark" 
        position="top-right" 
        expand={false} 
        richColors 
        toastOptions={{
          style: {
            background: "#121212",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            color: "#F5F5F7",
            fontFamily: "Plus Jakarta Sans, sans-serif"
          }
        }}
      />
      {/* Route mounting bridge */}
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
};

export default App;
