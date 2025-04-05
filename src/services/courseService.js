// src/services/courseService.js

import { supabase } from './supabase';
import AsyncStorage from "@react-native-async-storage/async-storage";

// Base URL for edge functions
const EDGE_FUNCTION_BASE_URL = "https://mxqhgktcdmymmwbsbfws.supabase.co/functions/v1";

/**
 * Gets the authentication token for requests
 */
const getAuthToken = async () => {
  try {
    const session = await supabase.auth.getSession();
    return session?.data?.session?.access_token || null;
  } catch (error) {
    console.error('[courseService] Error getting auth token:', error);
    return null;
  }
};

/**
 * =========================================================================
 * SEARCH PREPROCESSING ENGINE - EASILY MODIFIABLE FOR TESTING
 * =========================================================================
 * This function transforms search terms before they're sent to the API
 * Modify this function to experiment with different preprocessing strategies
 * 
 * @param {string} originalQuery - The raw search query from the user
 * @return {string} - The processed query for improved search results
 */
export function preprocessSearchQuery(originalQuery) {
  console.log(`[PREPROCESS] Original: "${originalQuery}"`);
  
  // STEP 1: Remove leading articles (the, a, an)
  let processed = originalQuery.replace(/^(the|a|an)\s+/i, '');
  
  // STEP 2: Filter out common golf terms that don't add search value
  // ===== MODIFY THIS LIST TO TEST DIFFERENT FILTERS =====
  const NOISE_TERMS = [
    'golf',
    'course',
    'club',
    'cc',
    'country'
  ];
  
  // Split into words
  let words = processed.split(/\s+/);
  
  // Remove noise terms
  words = words.filter(word => !NOISE_TERMS.includes(word.toLowerCase()));
  
  // If filtering removed everything, use original query
  if (words.length === 0) {
    console.log(`[PREPROCESS] Filtering removed all terms, using original query`);
    return originalQuery;
  }
  
  // Rejoin words
  processed = words.join(' ');
  
  console.log(`[PREPROCESS] Processed: "${processed}"`);
  return processed;
}

/**
 * Search for courses by name or location
 * 
 * @param {string} searchTerm - The search term to filter courses
 * @return {Promise<Array>} - Array of course objects matching the search
 */
export const searchCourses = async (searchTerm) => {
  try {
    // Validate search term
    if (!searchTerm || searchTerm.trim().length < 3) {
      return [];
    }
    
    const trimmedTerm = searchTerm.trim();
    
    // ===== PREPROCESSING APPLIED HERE =====
    // Apply preprocessing to improve search quality and reduce redundant API calls
    const processedTerm = preprocessSearchQuery(trimmedTerm);
    
    console.log('[courseService] Searching for courses with processed term:', processedTerm);
    
    // Get auth token for request
    const token = await getAuthToken();
    
    // Call edge function for course search
    const response = await fetch(`${EDGE_FUNCTION_BASE_URL}/get-courses?query=${encodeURIComponent(processedTerm)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      }
    });
    
    if (!response.ok) {
      // If edge function fails, fall back to direct database query as backup
      console.warn('[courseService] Edge function failed, falling back to direct query');
      
      const { data, error } = await supabase
        .from('courses')
        .select('id, name, club_name, location, tees, poi')  // Now also requesting POI data
        .or(`name.ilike.%${processedTerm}%,location.ilike.%${processedTerm}%,club_name.ilike.%${processedTerm}%`)
        .order('name')
        .limit(15);
      
      if (error) {
        console.error('[courseService] Error searching courses:', error);
        throw error;
      }
      
      // Format response to match expected structure
      return data?.map(course => ({
        ...course,
        has_tee_data: course.tees !== null && Array.isArray(course.tees) && course.tees.length > 0,
        has_poi_data: course.poi !== null && Array.isArray(course.poi) && course.poi.length > 0
      })) || [];
    }
    
    // Process successful edge function response
    const result = await response.json();
    return result.courses || [];
    
  } catch (error) {
    console.error('[courseService] Exception in searchCourses:', error);
    // Return empty array on error to avoid breaking the UI
    return [];
  }
};

/**
 * Get recently played courses for a user
 * 
 * @param {string} userId - The user's ID
 * @param {number} limit - Maximum number of courses to return
 * @return {Promise<Array>} - Array of recently played course objects
 */
export const getRecentCourses = async (userId, limit = 5) => {
  try {
    if (!userId) {
      console.log('[courseService] No user ID provided for recent courses');
      return [];
    }
    
    console.log('[courseService] Getting recent courses for user:', userId);
    
    // Get auth token for request
    const token = await getAuthToken();
    
    // Call edge function for recent courses
    const response = await fetch(`${EDGE_FUNCTION_BASE_URL}/get-courses?userId=${encodeURIComponent(userId)}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      }
    });
    
    if (!response.ok) {
      // If edge function fails, fall back to direct database query as backup
      console.warn('[courseService] Edge function failed, falling back to direct query');
      
      // Query the database for recent rounds by the user
      const { data: rounds, error: roundsError } = await supabase
        .from('rounds')
        .select('course_id, created_at')
        .eq('profile_id', userId)
        .eq('is_complete', true)
        .order('created_at', { ascending: false });
      
      if (roundsError) {
        console.error('[courseService] Error getting recent rounds:', roundsError);
        throw roundsError;
      }
      
      if (!rounds || rounds.length === 0) {
        return [];
      }
      
      // Extract unique course IDs
      const uniqueCourseIds = [];
      rounds.forEach(round => {
        if (!uniqueCourseIds.includes(round.course_id) && uniqueCourseIds.length < limit) {
          uniqueCourseIds.push(round.course_id);
        }
      });
      
      // Get course details for unique IDs
      const { data: courses, error: coursesError } = await supabase
        .from('courses')
        .select('id, name, club_name, location, tees, poi')  // Now also requesting POI data
        .in('id', uniqueCourseIds);
      
      if (coursesError) {
        console.error('[courseService] Error getting course details:', coursesError);
        throw coursesError;
      }
      
      // Format and order courses to match recent rounds order
      const orderedCourses = [];
      uniqueCourseIds.forEach(courseId => {
        const course = courses.find(c => c.id === courseId);
        if (course) {
          orderedCourses.push({
            ...course,
            has_tee_data: course.tees !== null && Array.isArray(course.tees) && course.tees.length > 0,
            has_poi_data: course.poi !== null && Array.isArray(course.poi) && course.poi.length > 0
          });
        }
      });
      
      return orderedCourses;
    }
    
    // Process successful edge function response
    const result = await response.json();
    return result.recentCourses || [];
    
  } catch (error) {
    console.error('[courseService] Exception in getRecentCourses:', error);
    return [];
  }
};

/**
 * Get all courses from the database
 * 
 * @return {Promise<Array>} - Array of course objects
 */
export const getAllCourses = async () => {
  try {
    console.log('[courseService] Fetching all courses');
    
    // Get auth token for request
    const token = await getAuthToken();
    
    // Call edge function for all courses
    const response = await fetch(`${EDGE_FUNCTION_BASE_URL}/get-courses`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      }
    });
    
    if (!response.ok) {
      // If edge function fails, fall back to direct database query
      console.warn('[courseService] Edge function failed, falling back to direct query');
      
      const { data, error } = await supabase
        .from('courses')
        .select('id, name, club_name, location, tees, poi') // Now also requesting POI data
        .order('name');
      
      if (error) {
        console.error('[courseService] Error fetching courses:', error);
        throw error;
      }
      
      // Add has_tee_data and has_poi_data flags
      return data?.map(course => ({
        ...course,
        has_tee_data: course.tees !== null && Array.isArray(course.tees) && course.tees.length > 0,
        has_poi_data: course.poi !== null && Array.isArray(course.poi) && course.poi.length > 0
      })) || [];
    }
    
    // Process successful edge function response
    const result = await response.json();
    return result.courses || [];
    
  } catch (error) {
    console.error('[courseService] Exception in getAllCourses:', error);
    return [];
  }
};

/**
 * Get full course details by ID, with enhanced POI data
 * 
 * @param {string} courseId - The course ID to fetch
 * @param {boolean} forcePOIRefresh - Force refresh of POI data even if already present
 * @return {Promise<Object|null>} - The course object or null if not found
 */
export const getCourseById = async (courseId, forcePOIRefresh = false) => {
  try {
    if (!courseId) {
      console.error('[courseService] No course ID provided');
      return null;
    }
    
    console.log('[courseService] Getting course details for ID:', courseId);
    
    // Get auth token for request
    const token = await getAuthToken();
    
    // First, get basic course details
    const response = await fetch(`${EDGE_FUNCTION_BASE_URL}/get-course-details/${courseId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      }
    });
    
    let courseData = null;
    
    if (!response.ok) {
      // If edge function fails, fall back to direct database query
      console.warn('[courseService] Edge function failed, falling back to direct query');
      
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();
      
      if (error) {
        console.error('[courseService] Error getting course details:', error);
        throw error;
      }
      
      courseData = data;
    } else {
      // Process successful edge function response
      courseData = await response.json();
    }
    
    // If course has no POI data or a refresh is forced, try to get detailed POI information
    if (courseData && (forcePOIRefresh || !courseData.poi || !Array.isArray(courseData.poi) || courseData.poi.length === 0)) {
      console.log('[courseService] Fetching detailed POI data for course');
      
      // Call the detailed info edge function to get POI data
      const detailResponse = await fetch(`${EDGE_FUNCTION_BASE_URL}/get-course-detailed-info/${courseId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        }
      });
      
      if (detailResponse.ok) {
        const detailData = await detailResponse.json();
        
        // If detailed data has POI information, merge it with our course data
        if (detailData && detailData.poi && Array.isArray(detailData.poi) && detailData.poi.length > 0) {
          console.log('[courseService] Merging POI data from detailed info');
          courseData.poi = detailData.poi;
          courseData.has_poi_data = true;
        }
      } else {
        console.warn('[courseService] Could not fetch detailed POI data');
      }
    }
    
    // Add flags for data presence
    if (courseData) {
      courseData.has_tee_data = courseData.tees !== null && 
                              Array.isArray(courseData.tees) && 
                              courseData.tees.length > 0;
                              
      courseData.has_poi_data = courseData.poi !== null && 
                             Array.isArray(courseData.poi) && 
                             courseData.poi.length > 0;
    }
    
    return courseData;
    
  } catch (error) {
    console.error('[courseService] Exception in getCourseById:', error);
    return null;
  }
};

/**
 * Pre-load POI data for a course if needed
 * This is particularly useful before starting a round to ensure
 * we have the most complete POI data available
 * 
 * @param {string} courseId - The course ID to fetch POI data for
 * @return {Promise<Object|null>} - The course with POI data or null if error
 */
export const ensureCourseHasPoiData = async (courseId) => {
  try {
    // Get the course with a forced POI refresh
    const course = await getCourseById(courseId, true);
    
    if (course && course.has_poi_data) {
      console.log('[courseService] Course has POI data:', course.poi.length, 'elements');
      return course;
    } else {
      console.log('[courseService] Course does not have POI data after refresh attempt');
      return course; // Return the course anyway, just without POI data
    }
  } catch (error) {
    console.error('[courseService] Error ensuring course has POI data:', error);
    return null;
  }
};