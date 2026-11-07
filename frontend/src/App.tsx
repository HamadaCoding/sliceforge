import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import { AppShell } from "./components/layout/AppShell";
import { GuestRoute } from "./components/auth/GuestRoute";
import { HomePage } from "./pages/HomePage";
import { EnginePage } from "./pages/EnginePage";
import { ContactPage } from "./pages/ContactPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { NotFoundPage } from "./pages/NotFoundPage";

/**
 * App Root Component
 * 
 * Configures client-side React Router routing, hydrates user session tokens
 * on initial launch, and protects guest routes with auth guards.
 */
export const App: React.FC = () => {
  const hydrateSession = useAuthStore((state) => state.hydrate);

  useEffect(() => {
    // Validate existing session token against backend on mount
    void hydrateSession();
  }, [hydrateSession]);

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/engine" element={<EnginePage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route
            path="/login"
            element={
              <GuestRoute>
                <LoginPage />
              </GuestRoute>
            }
          />
          <Route
            path="/register"
            element={
              <GuestRoute>
                <RegisterPage />
              </GuestRoute>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
