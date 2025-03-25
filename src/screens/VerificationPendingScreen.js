// src/screens/VerificationPendingScreen.js

import React, { useContext, useState } from "react";
import { View, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../context/AuthContext";
import Typography from "../ui/components/Typography";
import Button from "../ui/components/Button";
import Layout from "../ui/Layout";
import theme from "../ui/theme";

/**
 * VerificationPendingScreen Component
 * 
 * Displayed when a user has signed up but hasn't verified their email yet.
 * Provides clear instructions and the ability to resend the verification email.
 */
export default function VerificationPendingScreen() {
  const { 
    pendingVerificationEmail, 
    resendVerificationEmail, 
    loading, 
    error, 
    setError,
    signOut 
  } = useContext(AuthContext);
  
  // Local state for resend cooldown
  const [resendCooldown, setResendCooldown] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  
  /**
   * Handle resend verification email request
   */
  const handleResendVerification = async () => {
    if (resendCooldown) {
      Alert.alert(
        "Please wait", 
        `You can request another verification email in ${cooldownSeconds} seconds.`
      );
      return;
    }
    
    try {
      await resendVerificationEmail();
      
      // Set cooldown to prevent spam
      setResendCooldown(true);
      setCooldownSeconds(60);
      
      // Start countdown
      const interval = setInterval(() => {
        setCooldownSeconds(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setResendCooldown(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      // Show success message
      Alert.alert(
        "Verification Email Sent",
        "Please check your inbox for the verification link."
      );
    } catch (err) {
      // Error is handled by the context
      console.error("Failed to resend verification:", err);
    }
  };
  
  /**
   * Handle back to login (sign out)
   */
  const handleBackToLogin = () => {
    // Confirm user wants to cancel the verification process
    Alert.alert(
      "Cancel Verification?",
      "Are you sure you want to go back to the login screen? You'll need to verify your email later to use the app.",
      [
        { text: "Stay Here", style: "cancel" },
        { 
          text: "Back to Login", 
          style: "destructive",
          onPress: signOut
        }
      ]
    );
  };
  
  // Clear any existing error when component mounts
  React.useEffect(() => {
    setError(null);
  }, []);
  
  return (
    <Layout>
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <Ionicons 
            name="mail-outline" 
            size={64} 
            color={theme.colors.primary}
          />
        </View>
        
        <Typography 
          variant="title" 
          align="center" 
          style={styles.title}
        >
          Verify Your Email
        </Typography>
        
        <Typography 
          variant="body" 
          align="center" 
          style={styles.description}
        >
          We've sent a verification link to:
        </Typography>
        
        <Typography 
          variant="subtitle" 
          weight="semibold" 
          align="center" 
          style={styles.email}
        >
          {pendingVerificationEmail}
        </Typography>
        
        <Typography 
          variant="body" 
          align="center" 
          style={styles.instructions}
        >
          Please check your inbox and click the verification link to continue.
          The verification link will open this app automatically.
        </Typography>
        
        {/* Show error if present */}
        {error ? (
          <Typography 
            variant="body" 
            color={theme.colors.error} 
            align="center" 
            style={styles.error}
          >
            {error}
          </Typography>
        ) : null}
        
        {/* Resend verification email button */}
        <Button
          variant="outline"
          onPress={handleResendVerification}
          loading={loading}
          disabled={resendCooldown}
          style={styles.resendButton}
        >
          {resendCooldown 
            ? `Resend Available in ${cooldownSeconds}s` 
            : "Resend Verification Email"}
        </Button>
        
        {/* Back to login button */}
        <Button
          variant="text"
          onPress={handleBackToLogin}
          disabled={loading}
          style={styles.backButton}
        >
          Back to Login
        </Button>
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    marginBottom: 16,
  },
  description: {
    marginBottom: 8,
  },
  email: {
    marginBottom: 24,
  },
  instructions: {
    marginBottom: 32,
    textAlign: "center",
  },
  error: {
    marginBottom: 16,
  },
  resendButton: {
    marginBottom: 16,
    minWidth: 240,
  },
  backButton: {
    marginTop: 16,
  }
});