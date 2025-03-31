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
    console.log('[courseService] Searching for courses with term:', trimmedTerm);
    
    // Get auth token for request
    const token = await getAuthToken();
    
    // Call edge function for course search
    const response = await fetch(`${EDGE_FUNCTION_BASE_URL}/get-courses?query=${encodeURIComponent(trimmedTerm)}`, {
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
        .select('id, name, club_name, location, tees')
        .or(`name.ilike.%${trimmedTerm}%,location.ilike.%${trimmedTerm}%,club_name.ilike.%${trimmedTerm}%`)
        .order('name')
        .limit(15);
      
      if (error) {
        console.error('[courseService] Error searching courses:', error);
        throw error;
      }
      
      // Format response to match expected structure
      return data?.map(course => ({
        ...course,
        has_tee_data: course.tees !== null && Array.isArray(course.tees) && course.tees.length > 0
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
        .select('id, name, club_name, location, tees')
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
            has_tee_data: course.tees !== null && Array.isArray(course.tees) && course.tees.length > 0
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
        .select('id, name, club_name, location, tees')
        .order('name');
      
      if (error) {
        console.error('[courseService] Error fetching courses:', error);
        throw error;
      }
      
      // Add has_tee_data flag
      return data?.map(course => ({
        ...course,
        has_tee_data: course.tees !== null && Array.isArray(course.tees) && course.tees.length > 0
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
 * Get full course details by ID
 * 
 * @param {string} courseId - The course ID to fetch
 * @return {Promise<Object|null>} - The course object or null if not found
 */
export const getCourseById = async (courseId) => {
  try {
    console.log('[courseService] Getting course details for ID:', courseId);
    
    // Get auth token for request
    const token = await getAuthToken();
    
    // Call edge function for course details
    const response = await fetch(`${EDGE_FUNCTION_BASE_URL}/get-course-details/${courseId}`, {
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
        .select('*')
        .eq('id', courseId)
        .single();
      
      if (error) {
        console.error('[courseService] Error getting course details:', error);
        throw error;
      }
      
      return data;
    }
    
    // Process successful edge function response
    return await response.json();
    
  } catch (error) {
    console.error('[courseService] Exception in getCourseById:', error);
    return null;
  }
};