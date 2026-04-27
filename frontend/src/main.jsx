import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AppShell from "./components/AppShell.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Onboarding from "./pages/Onboarding.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import PublicReview from "./pages/PublicReview.jsx";
import ThankYou from "./pages/ThankYou.jsx";
import "./styles/app.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/review/:slug" element={<PublicReview />} />
          <Route path="/review/:slug/thank-you" element={<ThankYou />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/settings" element={<Onboarding editMode />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
