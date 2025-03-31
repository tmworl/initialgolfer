import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.31.0';

// Handle both OPTIONS preflight requests and actual function calls
serve(async (req) => {
  // Handle OPTIONS requests for CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey",
        "Access-Control-Max-Age": "86400"
      }
    });
  }

  try {
    console.log("Edge Function called - Golf Pro Insights Test - March 18, 2025");
    
    // Get Claude API key from environment variables
    const CLAUDE_API_KEY = Deno.env.get("CLAUDE_API_KEY") || "";
    
    // Get Supabase credentials from environment variables
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "";
    
    // Check if required API keys exist
    if (!CLAUDE_API_KEY) {
      throw new Error("Missing CLAUDE_API_KEY environment variable");
    }
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing Supabase credentials in environment variables");
    }
    
    console.log("API keys available");
    
    // Parse request body to get any parameters
    let requestBody = {};
    try {
      if (req.body) {
        requestBody = await req.json();
      }
    } catch (e) {
      console.warn("No request body or invalid JSON");
    }
    
    console.log("Request body:", requestBody);
    
    // Extract authorization header (JWT token) from the request
    const authHeader = req.headers.get('Authorization');
    console.log("Auth header present:", !!authHeader);
    
    // Create a Supabase client with the service role key
    // This gives admin access but RLS will still apply based on the user context
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Get user ID either from the JWT or request body (for testing)
    let userId;
    
    if (authHeader) {
      try {
        // Try to get user from the JWT token
        const { data, error } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
        if (error) {
          console.warn("Error getting user from token:", error.message);
          // Fall back to user ID in request body if provided
          userId = requestBody.userId;
        } else if (data?.user) {
          userId = data.user.id;
          console.log("User ID from token:", userId);
        }
      } catch (e) {
        console.warn("Error processing auth token:", e.message);
        // Fall back to user ID in request body if provided
        userId = requestBody.userId;
      }
    } else {
      // No auth header, try to get user ID from request body
      userId = requestBody.userId;
    }
    
    // If we still don't have a user ID, we can't proceed
    if (!userId) {
      throw new Error("Unable to determine user ID. Please ensure you're logged in.");
    }
    
    console.log("Using user ID:", userId);
    
    // Get the triggering round ID if provided (most recent completed round)
    // This will be stored as the primary round for these insights
    const triggeringRoundId = requestBody.roundId || null;
    console.log("Triggering round ID:", triggeringRoundId);
    
    // Query for the user's 5 most recent completed rounds
    const { data: roundsData, error: roundsError } = await supabase
      .from("rounds")
      .select(`
        id,
        score,
        gross_shots,
        created_at,
        is_complete,
        selected_tee_name,
        courses:course_id (
          id,
          name,
          par
        )
      `)
      .eq("profile_id", userId)
      .eq("is_complete", true)
      .order("created_at", { ascending: false })
      .limit(5);
    
    if (roundsError) {
      console.error("Error fetching rounds data:", roundsError);
      throw new Error("Could not retrieve your recent rounds data");
    }
    
    if (!roundsData || roundsData.length === 0) {
      throw new Error("No completed rounds found. Please complete a round first.");
    }
    
    console.log(`Retrieved ${roundsData.length} rounds`);
    
    // Get all round IDs
    const roundIds = roundsData.map(round => round.id);
    
    // Query hole data for these rounds using the new shots table structure
    const { data: allHoleData, error: allHolesError } = await supabase
      .from("shots")
      .select("*")
      .in("round_id", roundIds);
    
    if (allHolesError) {
      console.error("Error fetching shots data:", allHolesError);
      throw new Error("Could not retrieve shot data for your rounds");
    }
    
    console.log(`Retrieved data for ${allHoleData.length} holes across all rounds`);
    
    // Process hole data for each round
    const processedRounds = roundsData.map(round => {
      // Filter holes for this specific round
      const roundHoles = allHoleData.filter(hole => hole.round_id === round.id);
      
      // Initialize shot counts structure (same as before for compatibility)
      const shotCounts = {
        "Tee Shot": { "On Target": 0, "Slightly Off": 0, "Recovery Needed": 0 },
        "Long Shot": { "On Target": 0, "Slightly Off": 0, "Recovery Needed": 0 },
        "Approach": { "On Target": 0, "Slightly Off": 0, "Recovery Needed": 0 },
        "Chip": { "On Target": 0, "Slightly Off": 0, "Recovery Needed": 0 },
        "Putts": { "On Target": 0, "Slightly Off": 0, "Recovery Needed": 0 },
        "Sand": { "On Target": 0, "Slightly Off": 0, "Recovery Needed": 0 },
        "Penalties": { "On Target": 0, "Slightly Off": 0, "Recovery Needed": 0 }
      };
      
      // Get detailed hole-by-hole data for analysis
      const holeDetails = [];
      
      // Process each hole's data
      roundHoles.forEach(hole => {
        // Extract the hole_data JSONB field which contains shot information
        const holeData = hole.hole_data;
        
        // Skip if hole_data is missing or malformed
        if (!holeData || !holeData.shots || !Array.isArray(holeData.shots)) {
          console.warn(`Missing or invalid hole_data for hole ${hole.hole_number} in round ${round.id}`);
          return;
        }
        
        // Add to hole details for detailed analysis
        holeDetails.push({
          holeNumber: hole.hole_number,
          par: holeData.par || null,
          distance: holeData.distance || null,
          index: holeData.index || null,
          features: holeData.features || [],
          totalShots: hole.total_score || holeData.shots.length,
          shots: holeData.shots
        });
        
        // Count shots by type and quality for the aggregate view
        holeData.shots.forEach(shot => {
          // Check if this shot type and result exists in our structure
          if (shotCounts[shot.type] && shotCounts[shot.type][shot.result] !== undefined) {
            shotCounts[shot.type][shot.result]++;
          } else {
            // Log unexpected shot types or results for debugging
            console.warn(`Unexpected shot data - Type: ${shot.type}, Result: ${shot.result}`);
          }
        });
      });
      
      // Format date for readability
      const roundDate = new Date(round.created_at).toLocaleDateString();
      
      // Return processed round data (with both aggregate counts and detailed hole-by-hole data)
      return {
        roundId: round.id,
        date: roundDate,
        totalScore: round.gross_shots,
        par: round.courses?.par || 72, // Default to 72 if par not available
        teeName: round.selected_tee_name || "Unknown",
        shots: shotCounts,              // Aggregate counts for backward compatibility
        holeDetails: holeDetails,       // NEW: Detailed hole-by-hole data
        courseName: round.courses?.name || "Unknown Course"
      };
    });
    
    // Create a formatted golf data object for Claude
    const golfData = {
      rounds: processedRounds,
      totalRounds: processedRounds.length
    };
    
    console.log("Formatted golf data for Claude - round count:", golfData.totalRounds);
    
    // Updated prompt content requesting JSON format for multiple rounds
    const promptContent = `You are a golf pro that is going to provide insights that reduce my overall shots, find patterns and infer as much as you can from the data I give you, context is key. Only use the data I provide you, but sound as human as possible. Don't make anything up about techniques, we don't have more data than what we have given you but you can infer things about tee shot to hole in each hole.

I'm providing data from ${golfData.totalRounds} recent golf rounds. Each round includes shot outcomes categorized by type ("Tee Shot", "Long Shot", "Approach", "Chip", "Putts", "Sand", "Penalties") and quality ("On Target", "Slightly Off", "Recovery Needed"). Use these to infer and give tips, but understand the meaning behind them, don't just quote directly "Slightly Off", be more of a real golf pro and assume if someone thinks something is slightly off, then its not in the best position and their next shot is going to be harder, same with recovery, and vice versa for on target.

When analyzing shot quality, note that "On Target" shots typically indicate successful execution, "Slightly Off" shots indicate minor errors that may still result in acceptable positions, while "Recovery Needed" shots suggest significant problems requiring recovery. When analyzing approach shots, consider their relationship to long shots or drive quality to understand if problems cascade from poor tee shots or if approach shots are independently problematic that then lead onto additional shots elsewhere, same for long shots.

For each round, you also have detailed hole-by-hole information with par, distance, hole index (difficulty), features, and the specific sequence of shots taken. Use this to identify patterns such as:
- Performance on different par types (par 3/4/5)
- Impact of hole distance on scoring
- Shot sequences that commonly lead to problems
- How hazards and features affect play

Look for patterns across these rounds. Identify consistent strengths and weaknesses, and note any trends or improvements over time. Focus on finding the root causes of issues rather than just symptoms.

Please provide your insights in a structured JSON format with the following fields:
{
  "summary": "2-3 sentence overview of my game across my rounds",
  "primaryIssue": "The #1 area consistently costing me overall strokes (1 sentence)",
  "reason": "Why this issue is costly in terms of the sequence of shots in a hole or a whole round (2-3 sentences explaining the impact)",
  "practiceFocus": "Specific practice recommendation based on patterns across rounds",
  "managementTip": "One specific course management tip to address the primary issue",
  "progress": "Note any improvement trends across the analyzed rounds. If no clear progress pattern exists, leave this as null."
}

Your response should be formatted as valid JSON that can be parsed directly. Do not include any explanatory text outside the JSON structure.`;
    
    // Complete prompt with real golf data
    const fullPrompt = `${promptContent}\n\nGolf rounds data: ${JSON.stringify(golfData)}`;
    
    // Log the exact content being sent to Claude
    console.log("======== SENDING DATA TO CLAUDE ========");
    console.log(`Sending data for ${golfData.totalRounds} rounds with ${processedRounds.reduce((sum, round) => sum + (round.holeDetails?.length || 0), 0)} total holes`);
    console.log("=======================================");
    
    // Create a simple request to Claude
    const requestData = {
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: fullPrompt
        }
      ],
    };
    
    // Convert to JSON string
    const claudeRequestBody = JSON.stringify(requestData);
    console.log("Request body prepared, length:", claudeRequestBody.length);
    
    // Call Claude API
    console.log("Calling Claude API...");
    const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": CLAUDE_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: claudeRequestBody
    });
    
    console.log("Claude API response status:", claudeResponse.status);
    
    // Handle error response
    if (!claudeResponse.ok) {
      const errorText = await claudeResponse.text();
      console.error("Claude API error:", errorText);
      throw new Error(`Claude API error: ${claudeResponse.status}`);
    }
    
    // Parse successful response
    const claudeData = await claudeResponse.json();
    const claudeMessage = claudeData.content[0].text;
    console.log("Claude response:", claudeMessage);
    
    // Parse Claude's JSON response
    let insightsJSON;
    try {
      // This will extract and parse the JSON if Claude wrapped it in any markdown code blocks
      const jsonMatch = claudeMessage.match(/```json\s*([\s\S]*?)\s*```/) || 
                         claudeMessage.match(/```\s*([\s\S]*?)\s*```/) ||
                         [null, claudeMessage];
      insightsJSON = JSON.parse(jsonMatch[1] || claudeMessage);
      console.log("Successfully parsed insights JSON");
    } catch (jsonError) {
      console.error("Failed to parse Claude's response as JSON:", jsonError);
      // Fall back to returning the raw text if parsing fails
      insightsJSON = { 
        error: "Failed to parse as JSON",
        rawResponse: claudeMessage
      };
    }
    
    // Prepare the complete insights object to store in the database
    // Include the parsed insights plus metadata about which rounds were analyzed
    const completeInsights = {
      ...insightsJSON,
      analyzedRounds: roundIds,
      generatedAt: new Date().toISOString()
    };
    
    // Store the insights in the database
    let storedInsightsId = null;
    try {
      console.log("Storing insights in database...");
      
      // Insert a new record in the insights table
      const { data: storedInsights, error: insertError } = await supabase
        .from("insights")
        .insert({
          profile_id: userId,                // The user these insights are for
          round_id: triggeringRoundId,       // The round that triggered these insights
          insights: completeInsights,        // The complete insights object
          created_at: new Date().toISOString() // Current timestamp
        })
        .select("id")
        .single();
      
      if (insertError) {
        console.error("Error storing insights:", insertError);
      } else if (storedInsights) {
        console.log("Insights successfully stored with ID:", storedInsights.id);
        storedInsightsId = storedInsights.id;
      }
    } catch (storageError) {
      // Log the error but don't fail the function - we still want to return insights to the user
      console.error("Exception storing insights:", storageError);
    }
    
    // Return both our message and Claude's JSON response
    return new Response(
      JSON.stringify({
        message: "Golf insights generated successfully",
        insights: insightsJSON,
        insightsId: storedInsightsId,        // Include the ID of the stored insights record
        analyzedRounds: roundIds,            // Include which rounds were analyzed
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey"
        } 
      }
    );
  } catch (error) {
    console.error("Error in function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey"
        } 
      }
    );
  }
});