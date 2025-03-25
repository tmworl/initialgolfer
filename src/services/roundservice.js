// src/services/roundservice.js

import { supabase } from "./supabase";

/**
 * Create a new round record in Supabase.
 * 
 * @param {string} profile_id - The current user's profile ID.
 * @param {string} course_id - The ID of the course.
 * @param {string} tee_id - The ID of the selected tee.
 * @param {string} tee_name - The name of the selected tee.
 * @returns {object} The newly created round record.
 */
export const createRound = async (profile_id, course_id, tee_id, tee_name) => {
  console.log("[createRound] Attempting to create a new round", { 
    profile_id, 
    course_id,
    tee_id,
    tee_name
  });
  
  // Insert a new round record into the rounds table
  const { data, error } = await supabase
    .from("rounds")
    .insert({
      profile_id,
      course_id,
      is_complete: false, // New round is not complete
      selected_tee_id: tee_id,
      selected_tee_name: tee_name
    })
    .select(); // Returns the inserted record(s)

  if (error) {
    console.error("[createRound] Error creating round:", error);
    throw error;
  }

  console.log("[createRound] Round created successfully:", data[0]);
  return data[0]; // Return the newly created round record
};

/**
 * Save hole data for a specific hole
 * 
 * This function saves hole data including shots in the new
 * hole-centric format to the shots table.
 * 
 * @param {string} round_id - The ID of the round
 * @param {number} hole_number - The hole number (1-18)
 * @param {object} hole_data - The hole data including par, distance, and shots
 * @param {number} total_score - The total number of shots for this hole
 * @returns {object} The saved record
 */
export const saveHoleData = async (round_id, hole_number, hole_data, total_score) => {
  console.log("[saveHoleData] Saving data for hole", hole_number, "in round", round_id);
  
  try {
    // Upsert the hole data (insert if not exists, update if exists)
    const { data, error } = await supabase
      .from("shots")
      .upsert({
        round_id,
        hole_number,
        hole_data,
        total_score
      }, {
        onConflict: 'round_id,hole_number', // Handle the unique constraint
        returning: 'representation' // Return the full record
      });
    
    if (error) {
      console.error("[saveHoleData] Error saving hole data:", error);
      throw error;
    }
    
    console.log("[saveHoleData] Hole data saved successfully:", data);
    return data;
  } catch (error) {
    console.error("[saveHoleData] Exception in saveHoleData:", error);
    throw error;
  }
};

/**
 * Get all hole data for a round
 * 
 * @param {string} round_id - The ID of the round
 * @returns {Array} Array of hole data records
 */
export const getRoundHoleData = async (round_id) => {
  console.log("[getRoundHoleData] Getting hole data for round", round_id);
  
  try {
    const { data, error } = await supabase
      .from("shots")
      .select("*")
      .eq("round_id", round_id)
      .order("hole_number", { ascending: true });
    
    if (error) {
      console.error("[getRoundHoleData] Error getting hole data:", error);
      throw error;
    }
    
    console.log("[getRoundHoleData] Found hole data:", data?.length, "holes");
    return data || [];
  } catch (error) {
    console.error("[getRoundHoleData] Exception in getRoundHoleData:", error);
    return [];
  }
};

/**
 * Complete a round by updating its is_complete flag and calculating final statistics.
 * Works with the new shots data structure.
 * 
 * @param {string} round_id - The ID of the round to complete.
 * @returns {object} The updated round record.
 */
export const completeRound = async (round_id) => {
  try {
    console.log("[completeRound] Calculating final statistics for round:", round_id);
    
    // 1. Get the course_id from the round
    const { data: roundData, error: roundError } = await supabase
      .from("rounds")
      .select("course_id, profile_id, selected_tee_name") 
      .eq("id", round_id)
      .single();
      
    if (roundError) throw roundError;
    
    // 2. Get the par value for that course
    const { data: courseData, error: courseError } = await supabase
      .from("courses")
      .select("par")
      .eq("id", roundData.course_id)
      .single();
      
    if (courseError) throw courseError;
    
    const coursePar = courseData.par || 72; // Default to 72 if par is not set
    
    // 3. Get all hole records for this round
    const { data: holeRecords, error: holesError } = await supabase
      .from("shots")
      .select("total_score")
      .eq("round_id", round_id);
      
    if (holesError) throw holesError;
    
    // 4. Calculate total gross shots by summing the total_score for each hole
    let grossShots = 0;
    holeRecords.forEach(hole => {
      grossShots += hole.total_score || 0;
    });
    
    // 5. Calculate score relative to par
    const score = grossShots - coursePar;
    
    console.log("[completeRound] Statistics calculated:", {
      coursePar,
      grossShots,
      score
    });
    
    // 6. Update the round record with calculated values and mark as complete
    const { data, error } = await supabase
      .from("rounds")
      .update({ 
        is_complete: true,
        gross_shots: grossShots,
        score: score
      })
      .eq("id", round_id)
      .select();

    if (error) {
      console.error("[completeRound] Error completing round:", error);
      throw error;
    }

    console.log("[completeRound] Round completed successfully:", data);
    
    // 7. Trigger insights generation
    try {
      console.log("[completeRound] Triggering insights generation Edge Function");
      
      supabase.functions.invoke('analyze-golf-performance', {
        body: { 
          userId: roundData.profile_id,
          roundId: round_id
        }
      }).then(({ data: insightsData, error: insightsError }) => {
        if (insightsError) {
          console.error("[completeRound] Error from insights Edge Function:", insightsError);
        } else {
          console.log("[completeRound] Insights generated successfully:", insightsData);
        }
      }).catch(err => {
        console.error("[completeRound] Exception calling insights Edge Function:", err);
      });
      
    } catch (insightsError) {
      console.error("[completeRound] Failed to trigger insights generation:", insightsError);
    }

    return data;
  } catch (error) {
    console.error("[completeRound] Error in complete round process:", error);
    throw error;
  }
};