// src/ui/Layout.js
import React from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";
import theme from "./theme";

// Layout component wraps content with SafeAreaView and consistent padding.
export default function Layout({ children, style }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.container, style]}>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    padding: theme.spacing.medium,
  },
});
