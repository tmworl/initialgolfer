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
    
    // *** PRODUCT PERMISSION CHECK ***
    // Check if user has product_a permission (Insights product)
    let hasProductA = false;
    try {
      // Direct query for product_a permission
      const { data: permissions, error: permissionsError } = await supabase
        .from("user_permissions")
        .select("*")
        .eq("profile_id", userId)
        .eq("permission_id", "product_a")
        .eq("active", true);
      
      if (permissionsError) {
        console.error("Error checking product permissions:", permissionsError);
      } else {
        // User has product_a if they have at least one active permission record
        hasProductA = permissions && permissions.length > 0;
        console.log("User has product_a permission:", hasProductA);
      }
    } catch (permissionError) {
      console.error("Exception checking product permissions:", permissionError);
    }
    
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
          par,
          club_name,
          location,
          country,
          holes
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
      // Extract time data for temporal analysis
      const roundDate = new Date(round.created_at);
      const roundTime = roundDate.toTimeString().split(' ')[0];
      const roundTimestamp = roundDate.getTime();
      
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
        
        // Extract timestamps for temporal analysis
        const holeTimestamps = holeData.shots
          .filter(shot => shot.timestamp)
          .map(shot => new Date(shot.timestamp).getTime());
          
        // Calculate timing within the round if possible
        const holeTimeInfo = {
          startTime: holeTimestamps.length > 0 ? Math.min(...holeTimestamps) : null,
          endTime: holeTimestamps.length > 0 ? Math.max(...holeTimestamps) : null,
          duration: holeTimestamps.length >= 2 ? 
            (Math.max(...holeTimestamps) - Math.min(...holeTimestamps)) / 1000 / 60 : null, // in minutes
          sequenceInRound: hole.hole_number // Natural sequence of the hole
        };
        
        // Add to hole details for detailed analysis
        holeDetails.push({
          holeNumber: hole.hole_number,
          par: holeData.par || null,
          distance: holeData.distance || null,
          index: holeData.index || null,
          features: holeData.features || [],
          totalShots: hole.total_score || holeData.shots.length,
          shots: holeData.shots,
          timeInfo: holeTimeInfo,
          // Add POI data if available
          poi: holeData.poi || null
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
      
      // Find course-specific hole data if available
      let courseHoleData = null;
      if (round.courses && round.courses.holes && Array.isArray(round.courses.holes)) {
        courseHoleData = round.courses.holes;
      }
      
      // Return processed round data (with both aggregate counts and detailed hole-by-hole data)
      return {
        roundId: round.id,
        date: roundDate.toLocaleDateString(),
        time: roundTime,
        timestamp: roundTimestamp,
        totalScore: round.gross_shots,
        par: round.courses?.par || 72, // Default to 72 if par not available
        teeName: round.selected_tee_name || "Unknown",
        shots: shotCounts,              // Aggregate counts for backward compatibility
        holeDetails: holeDetails,       // Detailed hole-by-hole data
        courseName: round.courses?.name || "Unknown Course",
        courseInfo: {
          name: round.courses?.name || "Unknown Course",
          clubName: round.courses?.club_name || null,
          location: round.courses?.location || null,
          country: round.courses?.country || null,
          holes: courseHoleData
        }
      };
    });
    
    // *** BIFURCATION BASED ON PRODUCT PERMISSION ***
    // Create different data objects and prompts based on product_a permission
    let golfData;
    let promptContent;
    let maxTokens;
    
    if (hasProductA) {
      // PRODUCT A USERS: Full data and comprehensive analysis
      console.log("Using product_a data and prompt strategy");
      
      // Full data for product_a users
      golfData = {
        rounds: processedRounds,
        totalRounds: processedRounds.length
      };
      
      maxTokens = 10000; // Comprehensive response for paid product
      
      // Existing premium prompt - unchanged from original
      promptContent = `You are a professional golf coach providing premium insights to a subscriber. Create personalized, specific, and actionable insights focused on helping them improve. Think beyond basic analysis - create longitudinal, spatial, and sequence-based insights that demonstrate extraordinary value.

I'm providing data from ${golfData.totalRounds} recent golf rounds. Each round includes detailed shot-by-shot information including shot types, outcomes, and timestamps, as well as course and spatial data when available.

As you analyze this data, focus on these high-value dimensions:

1. SHOT SEQUENCE ANALYSIS:
   - Identify how one shot affects the next in the sequence (e.g., how poor tee shots lead to challenging approaches)
   - Find patterns in shot sequences that consistently cost strokes
   - Analyze how recovery shots compound across holes

2. SPATIAL INTELLIGENCE:
   - Use course-specific information when available to provide contextual insights
   - Relate performance to specific course features and challenges
   - Consider how hole layouts might affect strategy and performance

3. TEMPORAL PATTERNS:
   - Look for time-based performance variations (early vs. late round)
   - Identify fatigue patterns or concentration changes
   - Note if performance varies based on time of day or round duration

4. SKILL PROGRESSION PATHWAY:
   - Create a forward-looking improvement roadmap
   - Suggest specific, practical practice routines targeting the issues you identify
   - Provide a clear path from current performance to improved outcomes

5. CAUSAL INFERENCE:
   - Make reasonable inferences about causes (e.g., 3-putts likely from poor approach shots)
   - Connect outcome patterns to skill gaps
   - Identify the root causes of recurring issues

Remember to stay grounded in the data provided. While you should make reasonable inferences, don't invent techniques or specifics that aren't supported by the data. Be specific and concise, focusing on insights that have the greatest potential impact on scoring.

Please provide your insights as an array of cards in this JSON format:
{
  "cards": [{
    "id": string,           // Unique identifier for each insight
    "title": string,        // Dynamic card title based on the insight
    "content": string,      // Main insight content
    "type": string,         // "sequence", "spatial", "temporal", "pattern"
    "priority": number,     // Display order (1 highest)
    "icon": {
      "name": string,      // Ionicons name
      "color": string      // Optional hex color
    },
    "variant": string     // "standard", "highlight", "alert", "success"
  }]
}

Generate as many cards as needed to convey valuable insights. Each card should focus on a specific aspect of the player's game. Order cards by importance using the priority field.`;

    } else {
      // NON-PRODUCT A USERS: Limited data with conversion hooks
      console.log("Using non-product_a data and prompt strategy");
      
      // Limit data volume to reduce API costs and create conversion opportunity
      const limitedRounds = processedRounds.slice(0, 1); 
      
      golfData = {
        rounds: limitedRounds,
        totalRounds: limitedRounds.length,
        limitedData: true
      };
      
      maxTokens = 4000; // Reduced response size for non-paying users
      
      // Conversion-optimized prompt for non-product_a users
      promptContent = `You are a professional golf coach providing basic insights to a free user. Your goal is to provide some valuable analysis while clearly demonstrating the benefits of upgrading to premium insights.

I'm providing LIMITED data from just ${golfData.totalRounds} recent golf round. Premium subscribers receive analysis from 5 recent rounds for more comprehensive pattern detection.

Create a set of insight cards that provide genuine value while strategically demonstrating what the user would gain from premium access:

1. Create one "Summary" card that provides actual useful insights from the limited data available
2. Create 4 additional "Premium Feature" cards that preview advanced insights available only with a premium subscription

Each premium feature card should:
- Provide a glimpse of value (what could be learned) without giving complete insights
- Use a different, compelling call-to-action highlighting unique premium benefits
- Test different psychological triggers (fear of missing out, desire to improve, competitive advantage, etc.)

For these conversion-optimized cards, emphasize how much more accurate and valuable the insights would be with more rounds of data (which premium users receive).

Important: Keep the content professional and value-focused. Don't use aggressive sales tactics, but clearly demonstrate the limitations of the current analysis and the benefits of upgrading.

Please provide your insights as an array of cards in this JSON format:
{
  "cards": [{
    "id": string,           // Unique identifier for each insight
    "title": string,        // Dynamic card title based on the insight
    "content": string,      // Main insight content (valuable but incomplete for premium cards)
    "type": string,         // "summary", "premium-feature"
    "priority": number,     // Display order (1 highest)
    "icon": {
      "name": string,      // Ionicons name
      "color": string      // Optional hex color
    },
    "variant": string,     // "standard", "highlight", "alert", "success"
    "cta_text": string     // Compelling upgrade call-to-action (only for premium feature cards)
  }]
}

Create one summary card and four premium feature cards. For the premium feature cards, use different approaches to demonstrate value and drive conversion.`;
    }
    
    console.log("Formatted golf data for Claude - round count:", golfData.totalRounds);
    
    // Complete prompt with real golf data
    const fullPrompt = `${promptContent}\n\nGolf rounds data: ${JSON.stringify(golfData)}`;
    
    // Log the exact content being sent to Claude
    console.log("======== SENDING DATA TO CLAUDE ========");
    console.log(`Sending data for ${golfData.totalRounds} rounds with ${processedRounds.reduce((sum, round) => sum + (round.holeDetails?.length || 0), 0)} total holes`);
    console.log("=======================================");
    
    // Create a simple request to Claude
    const requestData = {
      model: "claude-3-7-sonnet-20250219",
      max_tokens: maxTokens, // Adjusted based on product permission
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
    
    // Parse Claude's JSON response with enhanced business-logic transformation
    let insightsJSON;
    let completeInsights;
    
    try {
      // Regex extraction remains the same - it correctly handles markdown code blocks
      const jsonMatch = claudeMessage.match(/```json\s*([\s\S]*?)\s*```/) || 
                         claudeMessage.match(/```\s*([\s\S]*?)\s*```/) ||
                         [null, claudeMessage];
      insightsJSON = JSON.parse(jsonMatch[1] || claudeMessage);
      console.log("Successfully parsed insights JSON");
      
      // *** RESPONSE TRANSFORMATION BASED ON PRODUCT PERMISSION ***
      if (hasProductA) {
        // PRODUCT A USERS: Transform for premium experience
        const tieredInsightsFormat = {
          // Extract primary summary from highest priority card
          summary: insightsJSON.cards?.[0]?.content || "Analysis is being generated based on your recent play.",
          // Transform all cards to a format compatible with the premium insights renderer
          tieredInsights: insightsJSON.cards?.map(card => ({
            id: card.id,
            title: card.title,
            content: card.content,
            iconName: card.icon?.name || "analytics-outline", // Map icon names for UI compatibility
            variant: mapCardVariantToUi(card.variant) // Normalize variant names for UI
          })) || []
        };
        
        // Support legacy field patterns for backwards compatibility
        if (insightsJSON.cards && insightsJSON.cards.length > 0) {
          // Map specific card types to legacy fields for backwards compatibility
          const typeToField = {
            "sequence": "primaryIssue",
            "pattern": "reason",
            "spatial": "practiceFocus",
            "temporal": "managementTip"
          };
          
          // Find the highest priority card of each type to map to legacy fields
          Object.entries(typeToField).forEach(([type, fieldName]) => {
            const matchingCards = insightsJSON.cards.filter(c => c.type === type);
            if (matchingCards.length > 0) {
              // Sort by priority and take the highest priority card for this category
              const highestPriorityCard = matchingCards.sort((a, b) => a.priority - b.priority)[0];
              tieredInsightsFormat[fieldName] = highestPriorityCard.content;
            }
          });
          
          // Add null progress to maintain schema compatibility
          tieredInsightsFormat.progress = "null";
        }
        
        // Create complete insights object with metadata
        completeInsights = {
          ...tieredInsightsFormat,
          analyzedRounds: roundIds,
          generatedAt: new Date().toISOString(),
          productAccess: "product_a" // Track which product access generated these insights
        };
      } else {
        // NON-PRODUCT A USERS: Transform for conversion experience
        const conversionInsightsFormat = {
          // Extract summary from the first card (should be the summary type)
          summary: insightsJSON.cards?.find(card => card.type === "summary")?.content || 
                   "Complete a round to get basic insights about your game.",
          
          // Transform all cards to include CTA for premium feature cards
          tieredInsights: insightsJSON.cards?.map(card => ({
            id: card.id,
            title: card.title,
            content: card.content,
            iconName: card.icon?.name || "analytics-outline",
            variant: mapCardVariantToUi(card.variant),
            // Add CTA for premium feature cards - NO isPremiumFeature flag
            ctaText: card.type === "premium-feature" ? (card.cta_text || "Unlock Premium Insights") : undefined
          })) || []
        };
        
        // Add placeholder legacy fields with conversion hooks for compatibility
        conversionInsightsFormat.primaryIssue = "Upgrade to premium insights to receive detailed analysis of your primary technical issues.";
        conversionInsightsFormat.reason = "Premium insights include root cause analysis based on comprehensive shot pattern detection.";
        conversionInsightsFormat.practiceFocus = "Unlock premium insights for personalized practice recommendations tailored to your game.";
        conversionInsightsFormat.managementTip = "Premium insights include course management strategies designed for your playing style.";
        conversionInsightsFormat.progress = "null";
        
        // Create complete insights object with metadata
        completeInsights = {
          ...conversionInsightsFormat,
          analyzedRounds: roundIds.slice(0, 1), // Only used most recent round for free tier
          generatedAt: new Date().toISOString(),
          productAccess: null // Indicate no product access
        };
      }
      
    } catch (jsonError) {
      console.error("Failed to parse Claude's response as JSON:", jsonError);
      // Fall back to returning the raw text if parsing fails
      completeInsights = { 
        error: "Failed to parse as JSON",
        rawResponse: claudeMessage,
        analyzedRounds: roundIds,
        generatedAt: new Date().toISOString(),
        productAccess: hasProductA ? "product_a" : null
      };
    }
    
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
        insights: completeInsights,
        insightsId: storedInsightsId,        // Include the ID of the stored insights record
        analyzedRounds: roundIds,            // Include which rounds were analyzed
        timestamp: new Date().toISOString(),
        productAccess: hasProductA ? "product_a" : null // Track product access level
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

/**
 * UI Variant Mapping
 * 
 * Maps Claude's variant values to our UI system for consistent presentation
 */
function mapCardVariantToUi(variant) {
  const variantMap = {
    "filled": "highlight",
    "outlined": "standard",
    "alert": "alert",
    "success": "success",
    "highlight": "highlight",
    "standard": "standard"
  };
  
  return variantMap[variant] || "standard";
}