import { BrowserRouter, Routes, Route } from "react-router";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/context/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AuthCallback } from "@/components/auth/AuthCallback";
import { LoginPage } from "@/pages/LoginPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { BrowserPage } from "@/pages/BrowserPage";
import { EditorPage } from "@/pages/EditorPage";

export const App = () => (
  <AuthProvider>
    <TooltipProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route element={<AppLayout />}>
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/repos/:owner/:repo" element={<BrowserPage />} />
              <Route path="/repos/:owner/:repo/edit/*" element={<EditorPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster />
    </TooltipProvider>
  </AuthProvider>
);
