import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, auth, signOut } from "../lib/firebase";
import { api } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  async function refreshProfile() {
    if (!auth.currentUser) return null;
    try {
      const data = await api("/api/auth/me");
      setProfile(data.user);
      return data.user;
    } catch (error) {
      setProfile(null);
      throw error;
    }
  }

  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }
      try {
        await refreshProfile();
      } catch (error) {
        if (error.status === 401) {
          await signOut(auth);
        }
      } finally {
        setLoading(false);
      }
    });
  }, []);

  const value = useMemo(
    () => ({
      firebaseUser,
      profile,
      loading,
      refreshProfile,
      logout: () => signOut(auth),
    }),
    [firebaseUser, profile, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
