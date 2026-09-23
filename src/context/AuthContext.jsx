import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  getStoredAuthSession,
  setStoredAuthSession,
  loginWithCredentials,
  registerDoctorAccount,
  logoutSession,
  DEMO_USERS,
} from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      // Check if Supabase has an active session
      if (isSupabaseConfigured() && supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            setUser({
              id: session.user.id,
              email: session.user.email,
              full_name: profile?.full_name || session.user.user_metadata?.full_name || 'Doctor',
              role: profile?.role || 'doctor',
              avatar_url: profile?.avatar_url || session.user.user_metadata?.avatar_url || null,
              phone: profile?.phone || '',
            });
            setLoading(false);
            return;
          }
        } catch (e) {
          console.warn('Supabase session load error', e);
        }
      }

      // Check local storage session
      const stored = getStoredAuthSession();
      if (stored?.user) {
        setUser(stored.user);
      }
      setLoading(false);
    };

    initializeAuth();

    // Supabase auth state listener
    if (isSupabaseConfigured() && supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (session?.user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            setUser({
              id: session.user.id,
              email: session.user.email,
              full_name: profile?.full_name || session.user.user_metadata?.full_name || 'Doctor',
              role: profile?.role || 'doctor',
              avatar_url: profile?.avatar_url || session.user.user_metadata?.avatar_url || null,
              phone: profile?.phone || '',
            });
          } else if (event === 'SIGNED_OUT') {
            setUser(null);
            setStoredAuthSession(null);
          }
        }
      );

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  const login = async (email, password) => {
    const session = await loginWithCredentials(email, password);
    setUser(session.user);
    return session.user;
  };

  const registerDoctor = async (doctorData) => {
    const session = await registerDoctorAccount(doctorData);
    setUser(session.user);
    return session.user;
  };

  const logout = async () => {
    await logoutSession();
    setUser(null);
  };

  // Quick role switcher for testing & evaluation
  const switchRole = (roleKey) => {
    if (DEMO_USERS[roleKey]) {
      const selected = DEMO_USERS[roleKey];
      setUser(selected);
      setStoredAuthSession({ user: selected, token: 'demo-token-' + roleKey });
      return selected;
    }
  };

  const updateProfile = (updates) => {
    setUser((prev) => {
      const updated = { ...prev, ...updates };
      setStoredAuthSession({ user: updated, token: 'local-token' });
      return updated;
    });
  };

  const role = user?.role || 'guest';
  const isAuthenticated = !!user;
  const isDoctor = role === 'doctor';
  const isAdmin = role === 'admin' || role === 'super_admin';
  const isSuperAdmin = role === 'super_admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        loading,
        isAuthenticated,
        isDoctor,
        isAdmin,
        isSuperAdmin,
        login,
        registerDoctor,
        logout,
        switchRole,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
