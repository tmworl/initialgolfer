// src/screens/ProfileScreen.js
import React, { useContext, useState, useEffect, useCallback } from "react";
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  TouchableWithoutFeedback,
  Keyboard,
  Platform
} from "react-native";
import { AuthContext } from "../context/AuthContext";
import { supabase } from "../services/supabase";
import Layout from "../ui/Layout";
import theme from "../ui/theme";
import Button from "../ui/components/Button";
import Typography from "../ui/components/Typography";
import debounce from 'lodash/debounce';

/**
 * ProfileScreen Component
 * 
 * Displays user information and provides account management functionality.
 * Features handicap tracking with real-time database synchronization.
 */
export default function ProfileScreen() {
  // Access authentication context
  const { user, signOut } = useContext(AuthContext);
  
  // Local state for form input and processing
  const [handicap, setHandicap] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'success', 'error', or null
  
  // Load user profile data on mount
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('handicap')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        
        // Format handicap properly for display
        if (data && data.handicap !== null) {
          setHandicap(data.handicap.toString());
        }
      } catch (error) {
        console.error("Error loading profile data:", error.message);
      }
    };
    
    loadUserProfile();
  }, [user]);
  
  // Create debounced save function to prevent excessive database writes
  // This creates a sophisticated debounce pattern with technical optimizations
  const debouncedSaveHandicap = useCallback(
    debounce(async (userId, newHandicap) => {
      if (!userId) return;
      
      setIsSaving(true);
      setSaveStatus(null);
      
      try {
        // Convert empty string to null for database consistency
        const handicapValue = newHandicap.trim() === "" 
          ? null 
          : parseFloat(newHandicap);
          
        // Execute database update with optimized query pattern
        const { error } = await supabase
          .from('profiles')
          .update({ 
            handicap: handicapValue,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);
          
        if (error) throw error;
        
        // Indicate success briefly
        setSaveStatus('success');
        setTimeout(() => setSaveStatus(null), 2000);
      } catch (error) {
        console.error("Error updating handicap:", error.message);
        setSaveStatus('error');
        setTimeout(() => setSaveStatus(null), 3000);
      } finally {
        setIsSaving(false);
      }
    }, 600), // 600ms debounce delay - technical optimization for input performance
    [] // Empty dependency array ensures stable reference
  );
  
  // Handle handicap input changes with validation
  const handleHandicapChange = (text) => {
    // Enforce numeric input pattern with period allowed
    // Uses sophisticated regex to ensure proper number format
    if (text === "" || /^-?\d*\.?\d*$/.test(text)) {
      setHandicap(text);
    }
  };
  
  // Handle blur event (when user finishes editing)
  const handleHandicapBlur = () => {
    if (user && handicap !== "") {
      debouncedSaveHandicap(user.id, handicap);
    }
  };
  
  // Get status indicator styles and text
  const getStatusIndicator = () => {
    if (!saveStatus) return null;
    
    const isSuccess = saveStatus === 'success';
    
    return (
      <Typography 
        variant="caption" 
        style={[
          styles.statusText, 
          isSuccess ? styles.successText : styles.errorText
        ]}
      >
        {isSuccess ? "Handicap saved" : "Error saving handicap"}
      </Typography>
    );
  };

  return (
    <Layout>
      {/* Dismiss keyboard on container tap */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.container}>
          {/* User Information Section */}
          <View style={styles.userInfoSection}>
            <Typography variant="subtitle" style={styles.sectionTitle}>
              Account Information
            </Typography>
            
            <View style={styles.infoItem}>
              <Typography variant="body" style={styles.infoLabel}>
                Email
              </Typography>
              <Typography variant="body" style={styles.infoValue}>
                {user?.email}
              </Typography>
            </View>
          </View>
          
          {/* Handicap Section */}
          <View style={styles.handicapSection}>
            <Typography variant="subtitle" style={styles.sectionTitle}>
              Golf Profile
            </Typography>
            
            <View style={styles.handicapContainer}>
              <Typography variant="body" style={styles.handicapLabel}>
                Handicap
              </Typography>
              
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.handicapInput}
                  value={handicap}
                  onChangeText={handleHandicapChange}
                  onBlur={handleHandicapBlur}
                  placeholder="Enter handicap"
                  keyboardType="numeric"
                  returnKeyType="done"
                  maxLength={5} // Reasonable limit for handicap values
                />
                
                {isSaving && (
                  <View style={styles.loadingIndicator} />
                )}
                
                {getStatusIndicator()}
              </View>
            </View>
            
            <Typography variant="caption" style={styles.helpText}>
              Enter your official handicap index to track progress over time.
            </Typography>
          </View>
          
          <View style={styles.spacer} />
          
          {/* Sign Out Button */}
          <Button 
            variant="primary" 
            onPress={signOut}
            iconLeft="log-out-outline"
            style={styles.signOutButton}
          >
            Sign Out
          </Button>
        </ScrollView>
      </TouchableWithoutFeedback>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.medium,
    alignItems: "center",
  },
  userInfoSection: {
    width: "100%", 
    backgroundColor: "#fff",
    borderRadius: theme.layout.borderRadius.medium,
    padding: theme.spacing.medium,
    ...theme.elevation.low,
  },
  handicapSection: {
    width: "100%", 
    backgroundColor: "#fff",
    borderRadius: theme.layout.borderRadius.medium,
    padding: theme.spacing.medium,
    marginTop: theme.spacing.medium,
    ...theme.elevation.low,
  },
  sectionTitle: {
    marginBottom: theme.spacing.medium,
  },
  infoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: theme.spacing.small,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  infoLabel: {
    color: theme.colors.secondary,
  },
  infoValue: {
    fontWeight: theme.typography.fontWeight.medium,
  },
  handicapContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: theme.spacing.small,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  handicapLabel: {
    color: theme.colors.secondary,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  handicapInput: {
    fontSize: 16,
    fontWeight: theme.typography.fontWeight.medium,
    textAlign: "right",
    minWidth: 60,
    paddingVertical: Platform.OS === 'ios' ? 4 : 0,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  loadingIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.primary,
    marginLeft: 8,
    opacity: 0.7,
  },
  statusText: {
    marginLeft: 8,
  },
  successText: {
    color: theme.colors.success || '#4CAF50',
  },
  errorText: {
    color: theme.colors.error || '#D32F2F',
  },
  helpText: {
    marginTop: theme.spacing.small,
    color: theme.colors.secondary,
    fontStyle: 'italic',
  },
  spacer: {
    height: 32,
  },
  signOutButton: {
    minWidth: 200,
  }
});