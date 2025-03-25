// src/services/insightsService.js

import { supabase } from "./supabase";

/**
 * Get the latest insights for a user
 * 
 * This function fetches the most recent insights record for a user,
 * and can return either the entire insights object or a specific field.
 * 
 * @param {string} userId - The user's profile ID
 * @param {string|null} fieldPath - Optional path to a specific field (e.g., 'summary', 'practiceFocus')
 * @returns {Promise<Object|string|null>} - The requested insights data or null if none exists
 */
export const getLatestInsights = async (userId, fieldPath = null) => {
  try {
    console.log(`[insightsService] Fetching latest insights for user ${userId}`);
    
    // Query the insights table for the latest record for this user
    const { data, error } = await supabase
      .from('insights')
      .select('*')
      .eq('profile_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single(); // Get as single object instead of array
    
    // Handle query error
    if (error) {
      // If the error is PGRST116 (not found), this isn't a true error - the user just has no insights
      if (error.code === 'PGRST116') {
        console.log('[insightsService] No insights found for user');
        return null;
      }
      
      console.error('[insightsService] Error fetching insights:', error);
      throw error;
    }
    
    // If no data returned, return null
    if (!data) {
      console.log('[insightsService] No insights found for user');
      return null;
    }
    
    console.log('[insightsService] Found insights record:', data.id);
    
    // Extract the insights data from the JSONB column
    const insightsData = data.insights;
    
    // If a specific field was requested, return just that field
    if (fieldPath && insightsData) {
      console.log(`[insightsService] Returning specific field: ${fieldPath}`);
      return insightsData[fieldPath] || null;
    }
    
    // Otherwise return the full insights object
    return insightsData;
  } catch (error) {
    console.error('[insightsService] Exception in getLatestInsights:', error);
    // Return null on error rather than throwing - this makes it easier to handle in components
    return null;
  }
};

/**
 * Get insights for a specific round
 * 
 * This function fetches insights that were generated for a specific round,
 * which is useful for showing insights on the round details screen.
 * 
 * @param {string} roundId - The round ID to fetch insights for
 * @param {string|null} fieldPath - Optional path to a specific field
 * @returns {Promise<Object|string|null>} - The requested insights data or null if none exists
 */
export const getRoundInsights = async (roundId, fieldPath = null) => {
  try {
    console.log(`[insightsService] Fetching insights for round ${roundId}`);
    
    // Query the insights table for insights related to this round
    const { data, error } = await supabase
      .from('insights')
      .select('*')
      .eq('round_id', roundId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.log('[insightsService] No insights found for this round');
        return null;
      }
      
      console.error('[insightsService] Error fetching round insights:', error);
      throw error;
    }
    
    if (!data) {
      console.log('[insightsService] No insights found for this round');
      return null;
    }
    
    console.log('[insightsService] Found insights record for round:', data.id);
    
    // Extract the insights data
    const insightsData = data.insights;
    
    // Return specific field if requested
    if (fieldPath && insightsData) {
      return insightsData[fieldPath] || null;
    }
    
    // Otherwise return full insights
    return insightsData;
  } catch (error) {
    console.error('[insightsService] Exception in getRoundInsights:', error);
    return null;
  }
};

/**
 * Submit feedback on insights
 * 
 * This allows users to rate the helpfulness of insights they receive,
 * which can be used to improve the quality of future insights.
 * 
 * @param {string} insightId - The ID of the insight record to rate
 * @param {string} feedback - Feedback text from the user
 * @returns {Promise<boolean>} - Success flag
 */
export const submitInsightFeedback = async (insightId, feedback) => {
  try {
    console.log(`[insightsService] Submitting feedback for insight ${insightId}`);
    
    // Update the insight record with the user's feedback
    const { error } = await supabase
      .from('insights')
      .update({ feedback_rating: feedback })
      .eq('id', insightId);
    
    if (error) {
      console.error('[insightsService] Error submitting feedback:', error);
      return false;
    }
    
    console.log('[insightsService] Feedback submitted successfully');
    return true;
  } catch (error) {
    console.error('[insightsService] Exception in submitInsightFeedback:', error);
    return false;
  }
};