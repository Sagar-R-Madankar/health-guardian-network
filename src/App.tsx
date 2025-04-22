
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AlertProvider } from "@/contexts/AlertContext";
import { DonorProvider } from "@/contexts/DonorContext";
import RequireAuth from "@/components/layout/RequireAuth";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Alerts from "./pages/Alerts";
import DonorRegistration from "./pages/DonorRegistration";
import AdminPredictions from "./pages/AdminPredictions";
import AdminDonors from "./pages/AdminDonors";
import AdminAlerts from "./pages/AdminAlerts";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <AlertProvider>
            <DonorProvider>
              <Toaster />
              <Sonner />
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* User routes */}
                <Route path="/dashboard" element={
                  <RequireAuth>
                    <UserDashboard />
                  </RequireAuth>
                } />
                <Route path="/alerts" element={
                  <RequireAuth>
                    <Alerts />
                  </RequireAuth>
                } />
                <Route path="/donor-registration" element={
                  <RequireAuth>
                    <DonorRegistration />
                  </RequireAuth>
                } />
                <Route path="/profile" element={
                  <RequireAuth>
                    <Profile />
                  </RequireAuth>
                } />
                
                {/* Admin routes */}
                <Route path="/admin/dashboard" element={
                  <RequireAuth requireAdmin>
                    <AdminDashboard />
                  </RequireAuth>
                } />
                <Route path="/admin/predictions" element={
                  <RequireAuth requireAdmin>
                    <AdminPredictions />
                  </RequireAuth>
                } />
                <Route path="/admin/alerts" element={
                  <RequireAuth requireAdmin>
                    <AdminAlerts />
                  </RequireAuth>
                } />
                <Route path="/admin/donors" element={
                  <RequireAuth requireAdmin>
                    <AdminDonors />
                  </RequireAuth>
                } />
                
                {/* Catch-all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </DonorProvider>
          </AlertProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
