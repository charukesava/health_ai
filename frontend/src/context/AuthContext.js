import { createContext, useContext, useEffect, useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "../firebase";

// 🔐 CREATE CONTEXT
const AuthContext = createContext();

// 🔑 ADMIN EMAIL LIST (PROJECT SAFE METHOD)
const ADMIN_EMAILS = ["charukesava.k@gmail.com", "youradmin@email.com"];

// 🔒 PROVIDER
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔁 TRACK AUTH STATE
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // ✅ SIGN UP WITH EMAIL VERIFICATION
  const signup = async (email, password) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(cred.user);
    await signOut(auth); // 🔒 block access until verified
  };

  // 🔐 LOGIN — BLOCK IF EMAIL NOT VERIFIED
  const login = async (email, password) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);

      if (!cred.user.emailVerified) {
        await signOut(auth);
        const err = new Error("Please verify your email before logging in.");
        err.code = "auth/email-not-verified";
        throw err;
      }

      return cred;
    } catch (error) {
      throw error;
    }
  };

  // 🔵 GOOGLE LOGIN
  const googleLogin = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  // 🚪 LOGOUT
  const logout = async () => {
    await signOut(auth);
  };

  // 🧠 ADMIN CHECK (FIXED)
  const isAdmin = user ? ADMIN_EMAILS.includes(user.email) : false;

  // 📦 CONTEXT VALUE
  const value = {
    user,
    loading,
    signup,
    login,
    googleLogin,
    logout,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ✅ CUSTOM HOOK
export function useAuth() {
  return useContext(AuthContext);
}
