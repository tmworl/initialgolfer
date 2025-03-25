// src/screens/ProfileScreen.js
import React, { useContext } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { AuthContext } from "../context/AuthContext";
import Layout from "../ui/Layout";
import theme from "../ui/theme";
import Button from "../ui/components/Button";
import Typography from "../ui/components/Typography";

/**
 * ProfileScreen Component
 * 
 * Displays user information and provides account options.
 * Streamlined for production release with focus on essential functionality.
 */
export default function ProfileScreen() {
  const { user, signOut } = useContext(AuthContext);

  return (
    <Layout>
      <ScrollView contentContainerStyle={styles.container}>
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
        
        <View style={styles.spacer} />
        
        <Button 
          variant="primary" 
          onPress={signOut}
          iconLeft="log-out-outline"
          style={styles.signOutButton}
        >
          Sign Out
        </Button>
      </ScrollView>
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
  spacer: {
    height: 32,
  },
  signOutButton: {
    minWidth: 200,
  }
});