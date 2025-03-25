// src/screens/AuthScreen.js

import React, { useState, useContext, useEffect } from "react";
import { View, TextInput, StyleSheet, ActivityIndicator } from "react-native";
import { AuthContext } from "../context/AuthContext";
// Import design system components
import Button from "../ui/components/Button";
import Typography from "../ui/components/Typography";
import theme from "../ui/theme";

export default function AuthScreen({ navigation }) {
  // Retrieve auth state and methods from our context.
  const { user, loading, error, signIn, signUp, setError } = useContext(AuthContext);
  // isLogin toggles between "Sign In" and "Create Account" modes.
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // formError is for local validation errors (e.g., empty fields).
  const [formError, setFormError] = useState("");

  // When a user is authenticated, immediately navigate to the main app.
  useEffect(() => {
    if (user) {
      navigation.replace("Main");
    }
  }, [user, navigation]);

  // Validate that email and password are provided and meet basic criteria.
  const validateForm = () => {
    if (!email || !password) {
      setFormError("Please fill in all fields");
      return false;
    }
    if (password.length < 6) {
      setFormError("Password must be at least 6 characters");
      return false;
    }
    return true;
  };

  // On form submission, either call signIn or signUp based on the current mode.
  const handleSubmit = async () => {
    setFormError("");
    setError(null);
    if (!validateForm()) return;

    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
    } catch (err) {
      console.error("Authentication error:", err);
    }
  };

  return (
    <View style={styles.container}>
      <Typography variant="title" align="center" style={styles.title}>
        {isLogin ? "Sign In" : "Create Account"}
      </Typography>

      {/* Show form error if present */}
      {formError ? (
        <Typography variant="body" color={theme.colors.error} align="center" style={styles.error}>
          {formError}
        </Typography>
      ) : null}
      
      {/* Show auth error if present */}
      {error ? (
        <Typography variant="body" color={theme.colors.error} align="center" style={styles.error}>
          {error}
        </Typography>
      ) : null}

      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {/* Primary action button with loading state */}
      <Button
        variant="primary"
        onPress={handleSubmit}
        loading={loading}
        style={styles.submitButton}
        fullWidth={true}
      >
        {isLogin ? "Sign In" : "Create Account"}
      </Button>

      {/* Toggle between sign in and sign up modes */}
      <Button
        variant="text"
        onPress={() => {
          setIsLogin(!isLogin);
          setFormError("");
          setError(null);
        }}
        style={styles.toggleButton}
      >
        {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff"
  },
  title: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
    fontSize: 16,
  },
  error: {
    marginBottom: 10,
  },
  submitButton: {
    marginTop: 10,
    marginBottom: 15,
  },
  toggleButton: {
    marginTop: 5,
  }
});