import { LogOut, Settings } from "lucide-react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function AppShell() {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/dashboard" className="brand-mark">ReviewFlow</Link>
        <div className="topbar-actions">
          <span>{profile?.email}</span>
          <Link className="icon-button" to="/settings" title="Account settings"><Settings size={18} /></Link>
          <button className="icon-button" onClick={handleLogout} title="Sign out"><LogOut size={18} /></button>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
