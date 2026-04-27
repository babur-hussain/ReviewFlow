import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute() {
  const { firebaseUser, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="page-center">Loading your workspace...</div>;
  if (!firebaseUser) return <Navigate to="/login" replace state={{ from: location }} />;
  if (profile && !profile.onboardingComplete && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }
  if (profile?.onboardingComplete && location.pathname === "/onboarding") {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
}
