// src/services/courseService.js

import { supabase } from './supabase';

/**
 * Course Service
 * 
 * This service handles all interactions with the courses table in the database.
 * It provides functions for searching courses and getting course details.
 */

/**
 * Get all courses from the database
 * 
 * This function fetches all courses from the database with basic information
 * and tee options. It doesn't include the full hole data to keep the query lightweight.
 * 
 * @return {Promise<Array>} - Array of course objects
 */
export const getAllCourses = async () => {
  try {
    console.log('[courseService] Fetching all courses');
    
    // Query the database for all courses
    const { data, error } = await supabase
      .from('courses')
      .select('id, name, club_name, location, tees')
      .order('name');
    
    if (error) {
      console.error('[courseService] Error fetching courses:', error);
      throw error;
    }
    
    console.log('[courseService] Found courses:', data?.length);
    
    // Add flags for tee data availability
    const enhancedData = data?.map(course => ({
      ...course,
      has_tee_data: course.tees !== null && Array.isArray(course.tees) && course.tees.length > 0
    })) || [];
    
    return enhancedData;
  } catch (error) {
    console.error('[courseService] Exception in getAllCourses:', error);
    return [];
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
    
    // Query the database for courses matching the search term in name or location
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
    
    console.log('[courseService] Found courses:', data?.length);
    
    // Add flags for tee data availability
    const enhancedData = data?.map(course => ({
      ...course,
      has_tee_data: course.tees !== null && Array.isArray(course.tees) && course.tees.length > 0
    })) || [];
    
    return enhancedData;
  } catch (error) {
    console.error('[courseService] Exception in searchCourses:', error);
    return [];
  }
};

/**
 * Get recently played courses for a user
 * 
 * Enhanced to return full course details in the same format as getAllCourses
 * and searchCourses for consistency.
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
    
    // Query the database for recent rounds by the user
    const { data: rounds, error: roundsError } = await supabase
      .from('rounds')
      .select('course_id, created_at')
      .eq('profile_id', userId)
      .eq('is_complete', true) // Only consider completed rounds
      .order('created_at', { ascending: false });
    
    if (roundsError) {
      console.error('[courseService] Error getting recent rounds:', roundsError);
      throw roundsError;
    }
    
    if (!rounds || rounds.length === 0) {
      console.log('[courseService] No recent rounds found for user');
      return [];
    }
    
    // Extract unique course IDs from the rounds
    const uniqueCourseIds = [];
    const seenIds = new Set();
    
    for (const round of rounds) {
      if (!seenIds.has(round.course_id)) {
        seenIds.add(round.course_id);
        uniqueCourseIds.push(round.course_id);
        
        // Only get up to the limit of unique courses
        if (uniqueCourseIds.length >= limit) {
          break;
        }
      }
    }
    
    if (uniqueCourseIds.length === 0) {
      return [];
    }
    
    // Get course details for the unique course IDs
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('id, name, club_name, location, tees')
      .in('id', uniqueCourseIds);
    
    if (coursesError) {
      console.error('[courseService] Error getting course details:', coursesError);
      throw coursesError;
    }
    
    console.log('[courseService] Found recent courses:', courses?.length);
    
    // Add flags for tee data availability and maintain the order from the rounds query
    const enhancedAndOrderedCourses = [];
    
    // Preserve the order of uniqueCourseIds (most recently played first)
    for (const courseId of uniqueCourseIds) {
      const course = courses.find(c => c.id === courseId);
      if (course) {
        enhancedAndOrderedCourses.push({
          ...course,
          has_tee_data: course.tees !== null && Array.isArray(course.tees) && course.tees.length > 0
        });
      }
    }
    
    return enhancedAndOrderedCourses;
  } catch (error) {
    console.error('[courseService] Exception in getRecentCourses:', error);
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
  } catch (error) {
    console.error('[courseService] Exception in getCourseById:', error);
    return null;
  }
};