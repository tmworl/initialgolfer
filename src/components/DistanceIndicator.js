// src/components/DistanceIndicator.js
//
// Migration from mixed Text/Typography implementation to consistent Typography usage
// This enhances the premium perception of GPS distance features by aligning with our design system
// and creates a more monetizable premium experience.

import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import Typography from '../ui/components/Typography';
import theme from '../ui/theme';

/**
 * Distance Indicator Component
 * 
 * Shows distances to the green based on GPS or falls back to static hole data.
 * This is a premium feature with high visibility in the user experience, making
 * consistent visual presentation critical for perceived value.
 * 
 * @param {Object} props
 * @param {Object} props.holeData - Current hole data with distance and poi info
 * @param {boolean} props.active - Whether component should actively update location
 * @param {function} props.onPermissionChange - Callback when GPS permission changes
 */
const DistanceIndicator = ({ 
  holeData, 
  active = true,
  onPermissionChange = null
}) => {
  // State for distance calculations
  const [centerDistance, setCenterDistance] = useState(null);
  const [frontDistance, setFrontDistance] = useState(null);
  const [backDistance, setBackDistance] = useState(null);
  
  // State for GPS status
  const [hasPermission, setHasPermission] = useState(null);
  const [usingGPS, setUsingGPS] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [locationSubscription, setLocationSubscription] = useState(null);
  
  // Calculate distance between two coordinate points using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    // Radius of the Earth in yards
    const R = 6371 * 1093.61; // Earth's radius in km converted to yards
    
    // Convert degrees to radians
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    
    // Haversine formula
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return Math.round(distance); // Round to nearest yard
  };
  
  // Helper to find green POI coordinates
  const findGreenCoordinates = useCallback(() => {
    // Default to null values
    let center = null;
    let front = null;
    let back = null;
    
    // Check if hole has POI data with green coordinates
    if (holeData?.poi?.greens && Array.isArray(holeData.poi.greens)) {
      // Find coordinates for each position
      holeData.poi.greens.forEach(greenPoi => {
        if (greenPoi.location === 'center' || greenPoi.location === 'middle') {
          center = { lat: greenPoi.lat, lng: greenPoi.lng };
        } else if (greenPoi.location === 'front') {
          front = { lat: greenPoi.lat, lng: greenPoi.lng };
        } else if (greenPoi.location === 'back') {
          back = { lat: greenPoi.lat, lng: greenPoi.lng };
        }
      });
      
      // If we only have one coordinate, use it for all positions
      if (center && !front && !back) {
        front = center;
        back = center;
      } else if (!center && front && back) {
        // If we have front and back but no center, estimate center
        center = {
          lat: (front.lat + back.lat) / 2,
          lng: (front.lng + back.lng) / 2
        };
      }
    }
    
    return { center, front, back };
  }, [holeData]);
  
  // Request location permissions
  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const hasAccess = status === 'granted';
      
      setHasPermission(hasAccess);
      
      // Call the permission change callback if provided
      if (onPermissionChange) {
        onPermissionChange(hasAccess);
      }
      
      return hasAccess;
    } catch (err) {
      console.error('Error requesting location permission:', err);
      setLocationError('Could not request location permission');
      setHasPermission(false);
      return false;
    }
  };
  
  // Start location tracking
  const startLocationTracking = async () => {
    // Check if we need to request permission
    if (hasPermission === null) {
      const granted = await requestLocationPermission();
      if (!granted) return;
    } else if (hasPermission === false) {
      return; // Permission already denied
    }
    
    try {
      // First stop any existing subscription
      if (locationSubscription) {
        locationSubscription.remove();
      }
      
      // Configure location tracking options
      const options = {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 2000, // Update every 2 seconds
        distanceInterval: 5  // Or when moved 5 meters
      };
      
      // Start watching position
      const subscription = await Location.watchPositionAsync(
        options,
        handleLocationUpdate
      );
      
      setLocationSubscription(subscription);
      setUsingGPS(true);
      setLocationError(null);
      
    } catch (err) {
      console.error('Error starting location tracking:', err);
      setLocationError('GPS error');
      setUsingGPS(false);
      
      // Fall back to static distances
      updateStaticDistances();
    }
  };
  
  // Stop location tracking
  const stopLocationTracking = () => {
    if (locationSubscription) {
      locationSubscription.remove();
      setLocationSubscription(null);
    }
    setUsingGPS(false);
  };
  
  // Handle location updates
  const handleLocationUpdate = (location) => {
    if (!location || !location.coords) {
      setLocationError('Invalid location data');
      return;
    }
    
    const { latitude, longitude } = location.coords;
    
    // Get green coordinates
    const { center, front, back } = findGreenCoordinates();
    
    // Calculate distances if we have coordinates
    if (center) {
      const distanceToCenter = calculateDistance(
        latitude, longitude, center.lat, center.lng
      );
      setCenterDistance(distanceToCenter);
    }
    
    if (front) {
      const distanceToFront = calculateDistance(
        latitude, longitude, front.lat, front.lng
      );
      setFrontDistance(distanceToFront);
    }
    
    if (back) {
      const distanceToBack = calculateDistance(
        latitude, longitude, back.lat, back.lng
      );
      setBackDistance(distanceToBack);
    }
    
    // Update flag to indicate we're using GPS data
    setUsingGPS(true);
  };
  
  // Update static distances from hole data
  const updateStaticDistances = useCallback(() => {
    // Use the static distance from hole data if available
    if (holeData?.distance) {
      setCenterDistance(holeData.distance);
      
      // Estimate front/back distances if not directly available
      // Front is typically ~10 yards less than center
      setFrontDistance(Math.max(0, holeData.distance - 10));
      
      // Back is typically ~10 yards more than center
      setBackDistance(holeData.distance + 10);
    } else {
      setCenterDistance(null);
      setFrontDistance(null);
      setBackDistance(null);
    }
  }, [holeData]);
  
  // Start/stop location updates based on active prop
  useEffect(() => {
    if (active) {
      startLocationTracking();
    } else {
      stopLocationTracking();
    }
    
    // Cleanup on unmount
    return () => {
      stopLocationTracking();
    };
  }, [active]);
  
  // Update static distances when hole data changes or GPS isn't working
  useEffect(() => {
    if (!usingGPS || locationError) {
      updateStaticDistances();
    }
  }, [holeData, usingGPS, locationError, updateStaticDistances]);
  
  // Handle initial permission state on mount
  useEffect(() => {
    const checkPermission = async () => {
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        const hasAccess = status === 'granted';
        setHasPermission(hasAccess);
        
        // If we already have permission, start tracking right away
        if (hasAccess && active) {
          startLocationTracking();
        }
      } catch (err) {
        console.error('Error checking location permission:', err);
        setHasPermission(false);
      }
    };
    
    checkPermission();
  }, []);

  // Determine what content to show based on our current state
  const renderContent = () => {
    // Loading state while checking permission or starting GPS
    if (hasPermission === null) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <Typography variant="caption" style={styles.loadingText}>
            Loading distances...
          </Typography>
        </View>
      );
    }
    
    // If no hole data is available
    if (!holeData) {
      return (
        <Typography variant="body" style={styles.errorText}>
          No hole data available
        </Typography>
      );
    }
    
    // Show distances with appropriate indicators
    return (
      <View style={styles.distancesContainer}>
        {/* GPS indicator */}
        <View style={styles.gpsIndicator}>
          <Ionicons 
            name={usingGPS ? "locate" : "location-outline"} 
            size={14} 
            color={usingGPS ? theme.colors.primary : "#999"} 
          />
        </View>
        
        {/* Center distance (most prominent) */}
        <View style={styles.mainDistanceContainer}>
          <Typography variant="subtitle" weight="bold" style={styles.mainDistance}>
            {centerDistance || holeData.distance || '---'}
          </Typography>
          <Typography variant="caption" style={styles.distanceLabel}>
            yd (C)
          </Typography>
        </View>
        
        {/* Front distance */}
        <View style={styles.secondaryDistanceContainer}>
          <Typography variant="body" style={styles.secondaryDistance}>
            {frontDistance || (holeData.distance ? Math.max(0, holeData.distance - 10) : '---')}
          </Typography>
          <Typography variant="caption" style={styles.distanceLabel}>
            yd (F)
          </Typography>
        </View>
        
        {/* Back distance */}
        <View style={styles.secondaryDistanceContainer}>
          <Typography variant="body" style={styles.secondaryDistance}>
            {backDistance || (holeData.distance ? holeData.distance + 10 : '---')}
          </Typography>
          <Typography variant="caption" style={styles.distanceLabel}>
            yd (B)
          </Typography>
        </View>
      </View>
    );
  };
  
  return (
    <View style={styles.container}>
      {/* Request permission button shown if permission is denied */}
      {hasPermission === false ? (
        <View style={styles.permissionContainer}>
          <Typography variant="body" style={styles.permissionText}>
            GPS access needed for accurate distances
          </Typography>
          <TouchableOpacity 
            style={styles.permissionButton}
            onPress={requestLocationPermission}
          >
            <Typography variant="button" color="#FFF">
              Enable GPS
            </Typography>
          </TouchableOpacity>
        </View>
      ) : (
        renderContent()
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    marginHorizontal: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  loadingText: {
    marginLeft: 8,
    color: '#666',
  },
  distancesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  gpsIndicator: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainDistanceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginRight: 12,
  },
  mainDistance: {
    fontSize: 20,
    marginRight: 2,
  },
  secondaryDistanceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginRight: 6,
  },
  secondaryDistance: {
    fontSize: 16,
    color: '#444',
    marginRight: 2,
  },
  distanceLabel: {
    color: '#666',
  },
  permissionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 4,
  },
  permissionText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
  },
  permissionButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  errorText: {
    color: '#666',
    textAlign: 'center',
  },
});

export default DistanceIndicator;