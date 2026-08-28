import React, { createContext, useContext, useEffect, useState } from 'react';
import supabase from '../lib/supabase.js';

const AuthContext = createContext(null);

/**
 * Provides auth state (user, session, role) and helpers (signIn, signOut)
 * to the entire component tree.
 */
export function AuthProvider({ children }) {
  const [session, setSession]     = useState(null);
  const [user, setUser]           = useState(null);
  const [userRole, setUserRole]   = useState(null);
  const [userClubId, setUserClubId] = useState(null);
  const [isExecApproved, setIsExecApproved] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [loading, setLoading]     = useState(true);

  // Fetch extended user profile (role, club_id) from users table
  async function fetchProfile(userId, metadataName = '') {
    if (!userId) {
      setUserRole(null);
      setUserClubId(null);
      setIsExecApproved(false);
      setProfileName('');
      return;
    }
    const { data } = await supabase
      .from('users')
      .select('role, club_id, is_exec_approved, full_name')
      .eq('id', userId)
      .single();

    setUserRole(data?.role ?? null);
    setUserClubId(data?.club_id ?? null);
    setIsExecApproved(data?.is_exec_approved ?? false);
    setProfileName(data?.full_name || metadataName || '');
  }

  useEffect(() => {
    // Bootstrap from existing session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      fetchProfile(s?.user?.id ?? null, s?.user?.user_metadata?.full_name).finally(() => setLoading(false));
    });

    // Listen for auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      fetchProfile(s?.user?.id ?? null, s?.user?.user_metadata?.full_name);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  async function signUp(email, password, fullName, role = 'student', clubId = null) {
    // Pass role + club_id as metadata so the DB trigger can create the
    // public.users row without needing an active session (bypasses RLS).
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          role,
          club_id: clubId || '',
        },
      },
    });
    if (error) throw error;
    return data;
  }

  async function verifySignUpCode(email, token) {
    const { data, error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
    if (error) throw error;
    return data;
  }

  async function resendSignUpCode(email) {
    const { data, error } = await supabase.auth.resend({ type: 'signup', email });
    if (error) throw error;
    return data;
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  const value = {
    session,
    user,
    userRole,
    userClubId,
    isExecApproved,
    profileName,
    loading,
    signIn,
    signUp,
    verifySignUpCode,
    resendSignUpCode,
    signOut,
    isAdmin: userRole === 'admin',
    isExec: userRole === 'club_exec' && isExecApproved,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}

export default AuthContext;
