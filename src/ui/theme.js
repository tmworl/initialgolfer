// src/ui/theme.js
//
// This file defines the central theme for the app, including colors,
// spacing, and typography. It uses system default fonts for a native look
// and better performance without requiring font loading.

import { Platform } from 'react-native';

// Define system font family based on platform
const systemFontFamily = Platform.select({
  ios: 'System',       // San Francisco on iOS
  android: 'Roboto',   // Roboto on Android
  default: undefined,  // Default system font on other platforms
});

// Define theme object with colors, spacing, and typography
export default {
  // Colors - Keep your existing colors
  colors: {
    primary: "#007AFF",     // Primary color for buttons, icons, etc.
    background: "#FFFFFF",  // App background color
    text: "#333333",        // Primary text color
    border: "#CCCCCC",      // Border color for table cells, etc.
    secondary: "#666666",   // Secondary text color for less prominent text
    accent: "#FF8800",      // Accent color for highlights
    success: "#4CAF50",     // Success color for positive feedback
    error: "#D32F2F",       // Error color for negative feedback
  },
  
  // Spacing - Keep your existing spacing
  spacing: {
    small: 8,
    medium: 16,
    large: 24,
  },
  
  // Typography system using platform default fonts
  typography: {
    // Font weights supported by system fonts
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    
    // Standard font sizes
    fontSize: {
      tiny: 10,       // Very small text, legal disclaimers
      small: 12,      // Small text, captions, timestamps
      body: 16,       // Regular body text
      subtitle: 18,   // Subtitles, section headers
      title: 24,      // Screen titles, large headers
      large: 32,      // Extra large text, splash screen
    },
    
    // Line heights for proper spacing
    lineHeight: {
      tight: 1.2,  // For titles and headings (120% of font size)
      normal: 1.5, // For body text (150% of font size)
      loose: 1.8,  // For more readable paragraphs (180% of font size)
    },
    
    // Pre-defined text styles that can be reused
    styles: {
      // Title style for screen headers
      title: {
        fontFamily: systemFontFamily,
        fontWeight: '700',   // bold
        fontSize: 24,
        lineHeight: 1.2 * 24, // lineHeight.tight * fontSize.title
        color: "#333333",     // colors.text
      },
      
      // Subtitle for section headers
      subtitle: {
        fontFamily: systemFontFamily,
        fontWeight: '600',   // semibold
        fontSize: 18,
        lineHeight: 1.2 * 18, // lineHeight.tight * fontSize.subtitle
        color: "#333333",     // colors.text
      },
      
      // Body text style
      body: {
        fontFamily: systemFontFamily,
        fontWeight: '400',   // normal
        fontSize: 16,
        lineHeight: 1.5 * 16, // lineHeight.normal * fontSize.body
        color: "#333333",     // colors.text
      },
      
      // Secondary text style for less important text
      secondary: {
        fontFamily: systemFontFamily,
        fontWeight: '400',   // normal
        fontSize: 14,
        lineHeight: 1.5 * 14, // lineHeight.normal * fontSize.body
        color: "#666666",     // colors.secondary
      },
      
      // Button text style
      button: {
        fontFamily: systemFontFamily,
        fontWeight: '600',   // semibold
        fontSize: 16,
        color: "#FFFFFF",     // White text for buttons
      },
      
      // Small text for captions, timestamps
      caption: {
        fontFamily: systemFontFamily,
        fontWeight: '400',   // normal
        fontSize: 12,
        lineHeight: 1.5 * 12, // lineHeight.normal * fontSize.small
        color: "#666666",     // colors.secondary
      },
    }
  },
  
  // NEW ADDITIONS - Add layout properties
  layout: {
    borderRadius: {
      small: 4,
      medium: 8, 
      large: 16,
      pill: 24,
    },
    screenPadding: 16, // Same as spacing.medium
  },
  
  // NEW ADDITIONS - Add elevation system
  elevation: {
    none: {
      shadowOpacity: 0,
      elevation: 0,
    },
    low: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 1.5,
      elevation: 2,
    },
    medium: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
  }
};