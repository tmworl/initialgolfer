// src/context/AuthContext.js

import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Linking } from "react-native";
import { supabase } from "../services/supabase";

// Create an authentication context
export const AuthContext = createContext();

// Utility function to check email verification status
const checkEmailVerification = (userData) => {
  return userData && userData.email_confirmed_at ? true : false;
};

// AuthProvider wraps the entire app and provides auth state and functions
export const AuthProvider = ({ children }) => {
  // 'user' holds the currently authenticated user, or null if not authenticated.
  const [user, setUser] = useState(null);
  // 'emailVerified' tracks whether the user has verified their email
  const [emailVerified, setEmailVerified] = useState(false);
  // 'pendingVerificationEmail' stores the email address awaiting verification
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState(null);
  // 'loading' tracks whether an auth operation is in progress.
  const [loading, setLoading] = useState(true);
  // 'error' stores any error messages from auth operations.
  const [error, setError] = useState(null);

  // Handle deep links for email verification
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

  // On mount, check if a session already exists and restore verification state.
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check for existing session
        const { data } = await supabase.auth.getSession();
        
        if (data?.session?.user) {
          setUser(data.session.user);
          // Set email verification status based on email_confirmed_at
          setEmailVerified(checkEmailVerification(data.session.user));
        } else {
          // No active session, check for pending verification
          const pendingEmail = await AsyncStorage.getItem('@GolfApp:pendingVerificationEmail');
          if (pendingEmail) {
            setPendingVerificationEmail(pendingEmail);
          }
        }
      } catch (err) {
        console.error("Error checking auth session:", err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Subscribe to auth state changes. This ensures our UI always reflects the latest auth state.
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event);
      
      if (session?.user) {
        setUser(session.user);
        // Update email verification status
        const isVerified = checkEmailVerification(session.user);
        setEmailVerified(isVerified);
        
        // If user is now verified and we had a pending verification, clear it
        if (isVerified && pendingVerificationEmail) {
          setPendingVerificationEmail(null);
          AsyncStorage.removeItem('@GolfApp:pendingVerificationEmail');
        }
      } else {
        setUser(null);
        setEmailVerified(false);
      }
    });

    // Set up deep link handling
    // First, check if the app was opened with a URL
    Linking.getInitialURL().then(url => {
      if (url) handleDeepLink(url);
    });

    // Then listen for future URL events
    const linkingListener = Linking.addEventListener('url', handleDeepLink);

    // Clean up subscriptions when the component unmounts.
    return () => {
      authListener.subscription.unsubscribe();
      linkingListener.remove();
    };
  }, [pendingVerificationEmail]);

  // signIn: Calls Supabase to sign in with email and password.
  const signIn = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
      } else {
        setUser(data.user);
        setEmailVerified(checkEmailVerification(data.user));
      }
    } catch (err) {
      setError("An unexpected error occurred during sign in.");
      console.error("SignIn error:", err);
    } finally {
      setLoading(false);
    }
  };

  // signUp: Calls Supabase to create a new account.
  // Note: You can adjust the emailRedirectTo option based on your native environment.
  const signUp = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: "mygolfapp://login-callback" // Use our configured redirect
        }
      });
      
      if (error) {
        // Check specifically for duplicate account errors
        if (error.message.includes("already registered") || error.code === "23505") {
          setError("This email is already registered. Please sign in instead.");
        } else {
          setError(error.message);
        }
      } else {
        // Store the user but flag as unverified
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

  // resendVerificationEmail: Resends the verification email.
  const resendVerificationEmail = async (email = null) => {
    setLoading(true);
    setError(null);
    try {
      // Use provided email or fall back to pending email
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
      } else {
        // If a new email was provided, update the pending verification
        if (email && email !== pendingVerificationEmail) {
          setPendingVerificationEmail(email);
          await AsyncStorage.setItem('@GolfApp:pendingVerificationEmail', email);
        }
      }
    } catch (err) {
      setError("Failed to resend verification email");
      console.error("Resend verification error:", err);
    } finally {
      setLoading(false);
    }
  };

  // signOut: Calls Supabase to end the session.
  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        setError(error.message);
      } else {
        setUser(null);
        setEmailVerified(false);
        setPendingVerificationEmail(null);
        await AsyncStorage.removeItem('@GolfApp:pendingVerificationEmail');
      }
    } catch (err) {
      setError("Failed to sign out");
      console.error("SignOut error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Provide the state and functions to any child component.
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
      resendVerificationEmail
    }}>
      {children}
    </AuthContext.Provider>
  );
};