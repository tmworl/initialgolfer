// src/components/SkeletonCourseCard.js

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import theme from '../ui/theme';

/**
 * SkeletonCourseCard Component
 * 
 * Displays a skeleton loading placeholder for course cards
 * with a subtle animation for better user experience.
 */
const SkeletonCourseCard = () => {
  // Animation value for the pulsing effect
  const pulseAnim = useRef(new Animated.Value(0.3)).current;
  
  // Start the pulse animation when component mounts
  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    
    animation.start();
    
    // Clean up animation on unmount
    return () => {
      animation.stop();
    };
  }, [pulseAnim]);
  
  return (
    <Animated.View
      style={[
        styles.container,
        { opacity: pulseAnim }
      ]}
    >
      {/* Course name skeleton */}
      <View style={styles.courseNameSkeleton} />
      
      {/* Club name skeleton */}
      <View style={styles.clubNameSkeleton} />
      
      {/* Location skeleton */}
      <View style={styles.locationSkeleton} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  courseNameSkeleton: {
    height: 20,
    width: '70%',
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 8,
  },
  clubNameSkeleton: {
    height: 16,
    width: '50%',
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 8,
  },
  locationSkeleton: {
    height: 14,
    width: '40%',
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
});

export default SkeletonCourseCard;