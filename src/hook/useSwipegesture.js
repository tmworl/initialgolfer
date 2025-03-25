// src/hooks/useSwipegesture.js

import { useRef } from 'react';
import { PanResponder } from 'react-native';

/**
 * Custom hook to handle horizontal swipe gestures.
 *
 * @param {Object} config - Configuration options.
 * @param {number} config.threshold - Minimum horizontal distance (in pixels) to recognize a swipe (default is 50).
 * @param {Function} config.onSwipeLeft - Callback for when a left swipe is detected.
 * @param {Function} config.onSwipeRight - Callback for when a right swipe is detected.
 *
 * @returns {Object} panHandlers to be spread into a View.
 */
const useSwipegesture = ({ threshold = 20, onSwipeLeft, onSwipeRight } = {}) => {
  const startXRef = useRef(0);

  const panResponder = PanResponder.create({
    // Only capture the gesture if horizontal movement is significantly larger than vertical movement.
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return Math.abs(gestureState.dx) > 1.2 * Math.abs(gestureState.dy);
    },
    onPanResponderGrant: (evt, gestureState) => {
      startXRef.current = gestureState.moveX;
    },
    onPanResponderRelease: (evt, gestureState) => {
      const dx = gestureState.moveX - startXRef.current;
      if (Math.abs(dx) < threshold) return;
      if (dx > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (dx < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    },
    onPanResponderTerminate: () => {},
  });

  return panResponder.panHandlers;
};

export default useSwipegesture;
