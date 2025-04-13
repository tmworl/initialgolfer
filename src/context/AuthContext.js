// src/context/AuthContext.js

import React, { createContext, useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Linking } from "react-native";
import { supabase } from "../services/supabase";

// Create an authentication context
export const AuthContext = createContext();

/**
 * Email verification utility
 * Determines if a user has verified their email based on presence of email_confirmed_at
 */
const checkEmailVerification = (userData) => {
  return userData && userData.email_confirmed_at ? true : false;
};

/**
 * AuthProvider Component
 * 
 * Enhanced with persistence capabilities, this provider maintains the user's
 * authentication state across app restarts while preserving all existing
 * functionality including email verification flows.
 */
export const AuthProvider = ({ children }) => {
  // Authentication state
  const [user, setUser] = useState(null);
  const [emailVerified, setEmailVerified] = useState(false);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userPermissions, setUserPermissions] = useState([]);
  
  // Session restoration state
  const [sessionRestored, setSessionRestored] = useState(false);

  /**
   * Load user permissions from the database
   * This is a critical operation that must execute after authentication
   */
  const loadUserPermissions = async (userId) => {
    if (!userId) return;
    
    try {
      console.log("Loading permissions for user:", userId);
      
      const { data, error } = await supabase
        .from("user_permissions")
        .select("*")
        .eq("profile_id", userId)
        .eq("active", true);
        
      if (error) {
        console.error("Error loading user permissions:", error);
        return;
      }
      
      console.log("Loaded permissions:", data?.length);
      setUserPermissions(data || []);
    } catch (err) {
      console.error("Exception loading user permissions:", err);
    }
  };

  /**
   * Permission checking utility
   * Memoized for performance optimization
   */
  const hasPermission = useCallback((productId) => {
    return userPermissions.some(
      permission => permission.permission_id === productId && permission.active
    );
  }, [userPermissions]);

  /**
   * Deep link handler
   * Process verification callbacks from email links
   */
  const handleDeepLink = async (event) => {
    const url = event?.url || event;
    if (!url) return;

    console.log("Received deep link:", url);
    
    // Check if this is a verification callback URL
    if (url.startsWith("mygolfapp://login-callback")) {
      console.log("Processing verification deep link");
      
      try {
        // Refresh the auth state to get the updated verification status
        const { data, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError) {
          console.error("Error refreshing session:", refreshError);
          return;
        }
        
        if (data?.session?.user) {
          setUser(data.session.user);
          
          // Check if email is now verified
          const isVerified = checkEmailVerification(data.session.user);
          setEmailVerified(isVerified);
          
          // Load user permissions
          await loadUserPermissions(data.session.user.id);
          
          if (isVerified && pendingVerificationEmail) {
            console.log("Email verified successfully!");
            // Clear pending verification state
            setPendingVerificationEmail(null);
            await AsyncStorage.removeItem('@GolfApp:pendingVerificationEmail');
          }
        }
      } catch (err) {
        console.error("Error processing verification link:", err);
      }
    }
  };

  /**
   * Authentication initialization and session restoration
   * 
   * This enhanced implementation leverages the persistent storage layer
   * while maintaining the existing verification state management.
   */
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Maintain loading state for UI feedback
        setLoading(true);
        
        // Load pending verification email from storage first
        // This ensures unverified users maintain proper UX across restarts
        const pendingEmail = await AsyncStorage.getItem('@GolfApp:pendingVerificationEmail');
        if (pendingEmail) {
          console.log("Found pending verification for:", pendingEmail);
          setPendingVerificationEmail(pendingEmail);
        }
        
        // Check for existing session with enhanced error handling
        // The Supabase client is now configured to restore from AsyncStorage
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session restoration error:", error);
          // Continue execution to allow fallback authentication options
        } else if (data?.session?.user) {
          console.log("Session restored for user:", data.session.user.email);
          
          // Update auth state with restored session
          setUser(data.session.user);
          setEmailVerified(checkEmailVerification(data.session.user));
          
          // Load user permissions on session restoration
          await loadUserPermissions(data.session.user.id);
        } else {
          console.log("No active session found in storage");
        }
        
        // Mark session restoration as complete regardless of outcome
        setSessionRestored(true);
      } catch (err) {
        console.error("Critical error in authentication initialization:", err);
        // Mark session restoration as complete to unblock UI
        setSessionRestored(true);
      } finally {
        setLoading(false);
      }
    };

    // Initialize authentication
    initAuth();

    /**
     * Auth state change subscription
     * 
     * This synchronizes the UI with auth state changes from any source:
     * - Manual login/logout
     * - Session restoration
     * - Token refresh
     * - External auth events (deep links)
     */
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event);
      
      // Update internal state based on auth changes
      if (session?.user) {
        setUser(session.user);
        setEmailVerified(checkEmailVerification(session.user));
        
        // Load user permissions
        await loadUserPermissions(session.user.id);
        
        // Handle verification state
        if (checkEmailVerification(session.user) && pendingVerificationEmail) {
          setPendingVerificationEmail(null);
          await AsyncStorage.removeItem('@GolfApp:pendingVerificationEmail');
        }
      } else {
        // Clear auth state on logout or session expiration
        setUser(null);
        setEmailVerified(false);
        setUserPermissions([]);
      }
    });

    // Deep link handling setup
    Linking.getInitialURL().then(url => {
      if (url) handleDeepLink(url);
    });
    const linkingListener = Linking.addEventListener('url', handleDeepLink);

    // Cleanup resources on unmount
    return () => {
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
      linkingListener.remove();
    };
  }, [pendingVerificationEmail]);

  /**
   * Enhanced sign-in implementation
   * Leverages persistence layer automatically through supabase client
   */
  const signIn = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password
      });
      
      if (error) {
        setError(error.message);
      } else {
        // Session will be automatically persisted by the enhanced supabase client
        setUser(data.user);
        setEmailVerified(checkEmailVerification(data.user));
        await loadUserPermissions(data.user.id);
      }
    } catch (err) {
      setError("An unexpected error occurred during sign in.");
      console.error("SignIn error:", err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sign-up implementation
   * Creates account and manages verification state
   */
  const signUp = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: "mygolfapp://login-callback"
        }
      });
      
      if (error) {
        if (error.message.includes("already registered") || error.code === "23505") {
          setError("This email is already registered. Please sign in instead.");
        } else {
          setError(error.message);
        }
      } else {
        // Store user but flag as unverified
        setUser(data.user);
        setEmailVerified(false);
        
        // Store pending verification email
        setPendingVerificationEmail(email);
        await AsyncStorage.setItem('@GolfApp:pendingVerificationEmail', email);
      }
    } catch (err) {
      setError("An unexpected error occurred during sign up.");
      console.error("SignUp error:", err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Verification email resend functionality
   */
  const resendVerificationEmail = async (email = null) => {
    setLoading(true);
    setError(null);
    try {
      const emailToVerify = email || pendingVerificationEmail;
      
      if (!emailToVerify) {
        setError("No email address to verify");
        return;
      }
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: emailToVerify,
        options: {
          emailRedirectTo: "mygolfapp://login-callback"
        }
      });
      
      if (error) {
        setError(error.message);
      } else if (email && email !== pendingVerificationEmail) {
        setPendingVerificationEmail(email);
        await AsyncStorage.setItem('@GolfApp:pendingVerificationEmail', email);
      }
    } catch (err) {
      setError("Failed to resend verification email");
      console.error("Resend verification error:", err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Enhanced sign-out with complete persistence cleanup
   * 
   * This implementation ensures that all persisted authentication data
   * is properly cleared during logout, preventing session leakage.
   */
  const signOut = async () => {
    setLoading(true);
    try {
      // The enhanced supabase client will automatically clear persisted session
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        setError(error.message);
      } else {
        // Clear all auth-related state
        setUser(null);
        setEmailVerified(false);
        setPendingVerificationEmail(null);
        setUserPermissions([]);
        
        // Clear any app-specific storage
        await AsyncStorage.removeItem('@GolfApp:pendingVerificationEmail');
        
        console.log("Session terminated and storage cleared");
      }
    } catch (err) {
      setError("Failed to sign out");
      console.error("SignOut error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Expose auth context to the application
  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      error, 
      signIn, 
      signUp, 
      signOut, 
      setError,
      emailVerified,
      pendingVerificationEmail,
      resendVerificationEmail,
      userPermissions,
      hasPermission,
      sessionRestored // New flag to indicate session restoration completion
    }}>
      {children}
    </AuthContext.Provider>
  );
};