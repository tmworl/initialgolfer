// supabase/functions/get-courses/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.31.0';

/**
 * =========================================================================
 * SERVER-SIDE SEARCH PREPROCESSING ENGINE
 * =========================================================================
 * This preprocessing pipeline transforms raw search queries to enhance recall
 * while reducing redundant API calls. Maintains a clear separation between
 * input standardization and database interaction layers.
 */
function preprocessSearchQuery(originalQuery: string): string {
  console.log(`[SERVER PREPROCESS] Original query: "${originalQuery}"`);
  
  // STEP 1: Remove leading articles (the, a, an)
  let processed = originalQuery.replace(/^(the|a|an)\s+/i, '');
  
  // STEP 2: Filter out domain-specific noise terms 
  // ===== MODIFY THIS ARRAY TO ADJUST FILTERING STRATEGY =====
  const NOISE_TERMS = [
    'golf',
    'course',
    'club',
    'cc',
    'country',
    'links'
  ];
  
  // Split into discrete tokens
  let tokens = processed.split(/\s+/);
  
  // Filter out noise terms while preserving meaningful identifiers
  tokens = tokens.filter(term => !NOISE_TERMS.includes(term.toLowerCase()));
  
  // Preserve query integrity - use original if filtering would leave nothing
  if (tokens.length === 0) {
    console.log(`[SERVER PREPROCESS] Filtering removed all terms, reverting to original`);
    return originalQuery;
  }
  
  // Reconstruct the processed query
  processed = tokens.join(' ');
  
  console.log(`[SERVER PREPROCESS] Processed query: "${processed}"`);
  return processed;
}

serve(async (req) => {
  // Handle OPTIONS for CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey",
        "Access-Control-Max-Age": "86400"
      }
    });
  }

  try {
    // Get Supabase credentials from environment
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    // Get Golf API key from environment
    const GOLF_API_KEY = Deno.env.get("GOLF_API_KEY") || "";
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing Supabase credentials in environment variables");
    }
    
    // Create Supabase client with service role key
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Parse URL to get query parameters
    const url = new URL(req.url);
    const searchQuery = url.searchParams.get('query') || '';
    const userId = url.searchParams.get('userId') || '';
    const limit = parseInt(url.searchParams.get('limit') || '20', 10);
    const noRecent = url.searchParams.get('noRecent') === 'true';
    
    // Get authorization header for user context
    const authHeader = req.headers.get('Authorization');
    let userFromAuth = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      try {
        const { data: userData, error: authError } = await supabase.auth.getUser(token);
        if (!authError && userData) {
          userFromAuth = userData.user;
        }
      } catch (e) {
        console.error("Auth validation error:", e);
      }
    }
    
    // Determine effective user ID
    const effectiveUserId = userId || userFromAuth?.id;
    
    // Initialize results containers
    let courses = [];
    let recentCourses = [];
    let apiSearchPerformed = false;
    let apiSearchError = null;
    
    // CASE 1: Recent Courses (if userId provided and not explicitly skipped)
    if (effectiveUserId && !noRecent) {
      const { data: recentData, error: recentError } = await supabase
        .from('rounds')
        .select(`
          course_id,
          created_at,
          courses:course_id (
            id, 
            name, 
            club_name, 
            location, 
            tees,
            poi
          )
        `)
        .eq('profile_id', effectiveUserId)
        .eq('is_complete', true)
        .order('created_at', { ascending: false });
        
      if (!recentError && recentData) {
        // Extract unique courses from recent rounds
        const uniqueCourseIds = [];
        const uniqueRecentCourses = [];
        
        recentData.forEach(round => {
          if (round.courses && !uniqueCourseIds.includes(round.courses.id)) {
            uniqueCourseIds.push(round.courses.id);
            
            // Add has_tee_data flag
            uniqueRecentCourses.push({
              ...round.courses,
              has_tee_data: round.courses.tees !== null && 
                          Array.isArray(round.courses.tees) && 
                          round.courses.tees.length > 0,
              has_poi_data: round.courses.poi !== null && 
                          Array.isArray(round.courses.poi) && 
                          round.courses.poi.length > 0
            });
          }
        });
        
        recentCourses = uniqueRecentCourses.slice(0, limit);
        console.log(`Found ${recentCourses.length} recent courses for user`);
      }
    }
    
    // CASE 2: Search Query (if provided)
    if (searchQuery.length >= 3) {
      // Apply preprocessing to the search query
      const processedQuery = preprocessSearchQuery(searchQuery);
      console.log(`Executing search with processed query: "${processedQuery}"`);
      
      // Search database first
      let query = supabase
        .from('courses')
        .select('id, name, club_name, location, tees, poi, country, num_holes');
      
      // Apply search filter with case-insensitive pattern matching using processed query
      query = query.or(`name.ilike.%${processedQuery}%,location.ilike.%${processedQuery}%,club_name.ilike.%${processedQuery}%`);
      
      const { data: dbCourses, error: dbError } = await query
        .order('name')
        .limit(limit);
        
      if (!dbError && dbCourses) {
        courses = dbCourses.map(course => ({
          ...course,
          has_tee_data: course.tees !== null && 
                      Array.isArray(course.tees) && 
                      course.tees.length > 0,
          has_poi_data: course.poi !== null && 
                      Array.isArray(course.poi) && 
                      course.poi.length > 0
        }));
        console.log(`Database query returned ${courses.length} courses`);
      }
      
      // Fall back to API only when database has insufficient results (< 1)
      // This represents a strategic architectural decision to minimize API usage
      if (courses.length < 1 && GOLF_API_KEY) {
        apiSearchPerformed = true;
        console.log("Insufficient database results, calling external API");
        
        try {
          // Apply preprocessing to API query as well
          // Store original for analytics correlation
          const originalApiQuery = searchQuery;
          const processedApiQuery = processedQuery;
          
          // Construct API URL for Golf API using processed query
          const apiUrl = `https://www.golfapi.io/api/v2.3/courses?name=${encodeURIComponent(processedApiQuery)}`;
          
          // Call Golf API with Bearer token authentication
          const apiResponse = await fetch(apiUrl, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${GOLF_API_KEY}`,
              'Content-Type': 'application/json'
            },
            redirect: 'follow'
          });
          
          if (apiResponse.ok) {
            const apiData = await apiResponse.json();
            console.log(`API returned ${apiData.numCourses} courses`);
            
            if (apiData.courses && Array.isArray(apiData.courses)) {
              // Transform API data to our DB schema
              const transformedCourses = apiData.courses
                .map(course => {
                  // Log generic names but don't filter them out - allow them into the database
                  if (course.courseName === "18-hole course" || 
                      course.courseName === "9-hole course") {
                    console.log(`Generic Name Course Detected: ${course.courseName} for ${course.clubName}, ID: ${course.courseID}`);
                  }
                  
                  return {
                    name: course.courseName,
                    api_course_id: course.courseID,
                    club_name: course.clubName,
                    location: `${course.city}, ${course.state}`,
                    country: course.country,
                    latitude: null,  // Will be populated with detailed info
                    longitude: null, // Will be populated with detailed info
                    num_holes: course.numHoles,
                    par: null,       // Will be populated with detailed info
                    tees: [],        // Will be populated with detailed info
                    holes: [],       // Will be populated with detailed info
                    updated_at: new Date(parseInt(course.timestampUpdated) * 1000).toISOString()
                  };
                });
                
              // Strategic persistence approach: store API results for future queries
              if (transformedCourses.length > 0) {
                console.log(`Persisting ${transformedCourses.length} courses from API to database`);
                
                // Process each course individually for better error resilience
                for (const course of transformedCourses) {
                  // Check if course already exists
                  const { data: existingCourse, error: existingError } = await supabase
                    .from('courses')
                    .select('id')
                    .eq('api_course_id', course.api_course_id)
                    .maybeSingle();
                    
                  if (existingError) {
                    console.error(`Error checking for existing course: ${existingError.message}`);
                    continue;
                  }
                  
                  if (existingCourse) {
                    // Update existing course
                    const { error: updateError } = await supabase
                      .from('courses')
                      .update({
                        name: course.name,
                        club_name: course.club_name,
                        location: course.location,
                        country: course.country,
                        num_holes: course.num_holes,
                        updated_at: course.updated_at
                      })
                      .eq('id', existingCourse.id);
                      
                    if (updateError) {
                      console.error(`Error updating course: ${updateError.message}`);
                    } else {
                      console.log(`Updated course: ${course.name}`);
                    }
                  } else {
                    // Insert new course
                    const { data: insertedCourse, error: insertError } = await supabase
                      .from('courses')
                      .insert({
                        ...course,
                        created_at: new Date().toISOString()
                      })
                      .select()
                      .single();
                      
                    if (insertError) {
                      console.error(`Error inserting course: ${insertError.message}`);
                    } else {
                      console.log(`Inserted new course: ${course.name}`);
                    }
                  }
                }
                
                // Refresh results to include newly added courses
                const refreshQuery = `name.ilike.%${processedQuery}%,location.ilike.%${processedQuery}%,club_name.ilike.%${processedQuery}%`;
                console.log(`Refreshing results with query: ${refreshQuery}`);
                
                const { data: refreshedCourses, error: refreshError } = await supabase
                  .from('courses')
                  .select('id, name, club_name, location, tees, poi, country, num_holes')
                  .or(refreshQuery)
                  .order('name')
                  .limit(limit);
                  
                if (!refreshError && refreshedCourses) {
                  courses = refreshedCourses.map(course => ({
                    ...course,
                    has_tee_data: course.tees !== null && 
                              Array.isArray(course.tees) && 
                              course.tees.length > 0,
                    has_poi_data: course.poi !== null && 
                              Array.isArray(course.poi) && 
                              course.poi.length > 0
                  }));
                  console.log(`After API integration: ${courses.length} courses available`);
                }
              }
            } else {
              console.error("API returned unexpected data structure:", apiData);
              apiSearchError = "Unexpected API response format";
            }
          } else {
            // Handle API error
            const errorStatus = apiResponse.status;
            let errorMessage = `API returned status ${errorStatus}`;
            
            try {
              const errorBody = await apiResponse.text();
              console.error(`API error (${errorStatus}): ${errorBody}`);
              
              // Check for auth errors specifically
              if (errorStatus === 401 || errorStatus === 403) {
                apiSearchError = "API authentication failed";
                console.error("Golf API authentication error - please check API key");
              } else {
                apiSearchError = `API error: ${errorStatus}`;
              }
              
              // Log the full error for debugging
              console.error(`Full API error response: ${errorBody}`);
              
            } catch (parseError) {
              console.error(`Could not parse error response: ${parseError}`);
              apiSearchError = `API error: ${errorStatus}`;
            }
          }
        } catch (apiError) {
          console.error(`Exception calling Golf API: ${apiError}`);
          apiSearchError = "API connection error";
        }
      }
    } else if (searchQuery.length > 0 && searchQuery.length < 3) {
      console.log(`Search query too short (${searchQuery.length} chars): "${searchQuery}"`);
    } else if (searchQuery.length === 0) {
      // If no search query, get popular courses
      const { data: popularCourses, error: popularError } = await supabase
        .from('courses')
        .select('id, name, club_name, location, tees, poi, country, num_holes')
        .order('name')
        .limit(limit);
        
      if (!popularError && popularCourses) {
        courses = popularCourses.map(course => ({
          ...course,
          has_tee_data: course.tees !== null && 
                      Array.isArray(course.tees) && 
                      course.tees.length > 0,
          has_poi_data: course.poi !== null && 
                      Array.isArray(course.poi) && 
                      course.poi.length > 0
        }));
        console.log(`Found ${courses.length} popular courses`);
      }
    }
    
    // Prepare response
    const response = {
      courses,
      apiSearchPerformed,
      apiSearchError,
      totalResults: courses.length,
      searchQuery: searchQuery || null
    };
    
    // Add recent courses if available
    if (recentCourses.length > 0) {
      response.recentCourses = recentCourses;
    }
    
    // Return results
    return new Response(
      JSON.stringify(response),
      { 
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey"
        } 
      }
    );
    
  } catch (error) {
    console.error(`Error in get-courses function: ${error}`);
    
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
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey"
        } 
      }
    );
  }
});