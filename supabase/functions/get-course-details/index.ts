// supabase/functions/get-course-details/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.31.0';

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
    
    // Parse URL to get course ID from path or query param
    const url = new URL(req.url);
    
    // First try to get ID from path
    const pathParts = url.pathname.split('/');
    let courseId = pathParts[pathParts.length - 1];
    
    // If not in path, try query param
    if (courseId === 'get-course-details') {
      courseId = url.searchParams.get('courseId') || '';
    }
    
    // Validate course ID is provided
    if (!courseId) {
      return new Response(
        JSON.stringify({ error: "Course ID is required" }),
        { 
          status: 400, 
          headers: { 
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          } 
        }
      );
    }
    
    // Force refresh parameter (optional)
    const forceRefresh = url.searchParams.get('refresh') === 'true';
    
    // Get the current timestamp
    const now = new Date();
    
    // Define data freshness threshold (90 days in milliseconds)
    const FRESHNESS_THRESHOLD_MS = 90 * 24 * 60 * 60 * 1000; // 90 days
    
    // First, try to get course from database
    let { data: existingCourse, error: dbError } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();
      
    if (dbError && dbError.code !== 'PGRST116') { // Not found error is acceptable
      console.error("Database error fetching course:", dbError);
    }
    
    // Check if we need to fetch from API
    let needsApiRefresh = false;
    let apiCourseId = null;
    
    if (!existingCourse) {
      console.log(`Course ${courseId} not found in database`);
      needsApiRefresh = true;
    } else {
      console.log(`Found course ${existingCourse.name} in database`);
      
      // Store API course ID for potential API call
      apiCourseId = existingCourse.api_course_id;
      
      // Check if course has complete tee and hole data
      const hasTeeData = existingCourse.tees && 
                         Array.isArray(existingCourse.tees) && 
                         existingCourse.tees.length > 0;
                         
      const hasHoleData = existingCourse.holes && 
                          Array.isArray(existingCourse.holes) && 
                          existingCourse.holes.length > 0;
                          
      // Check data freshness
      let dataStale = false;
      if (existingCourse.updated_at) {
        const lastUpdateTime = new Date(existingCourse.updated_at).getTime();
        const staleDuration = now.getTime() - lastUpdateTime;
        dataStale = staleDuration > FRESHNESS_THRESHOLD_MS;
        
        if (dataStale) {
          console.log(`Course data is stale, last updated ${Math.floor(staleDuration / (24 * 60 * 60 * 1000))} days ago`);
        }
      }
      
      // Determine if we need to refresh from API
      needsApiRefresh = forceRefresh || !hasTeeData || !hasHoleData || dataStale;
    }
    
    // If we need API data and have the API key + course ID
    if (needsApiRefresh && GOLF_API_KEY && apiCourseId) {
      console.log(`Fetching course details from API for ${apiCourseId}`);
      
      try {
        // Make API call to get course details
        const apiUrl = `https://www.golfapi.io/api/v2.3/courses/${apiCourseId}`;
        const apiResponse = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${GOLF_API_KEY}`,
            'Content-Type': 'application/json'
          },
          redirect: 'follow'
        });
        
        if (apiResponse.ok) {
          // Parse API response
          const apiData = await apiResponse.json();
          console.log("API response received for course details");
          
          // Log full response for debugging (in production, you might want to limit this)
          console.log("API Response:", JSON.stringify(apiData));
          
          // If we have course data
          if (apiData && apiData.course) {
            const course = apiData.course;
            
            // Transform tees data
            const transformedTees = [];
            if (course.tees && Array.isArray(course.tees)) {
              course.tees.forEach(tee => {
                transformedTees.push({
                  id: tee.id || `tee_${transformedTees.length + 1}`,
                  name: tee.name || "Unnamed",
                  color: tee.color || "#CCCCCC",
                  slope_men: tee.slopeMen || null,
                  slope_women: tee.slopeWomen || null,
                  course_rating_men: tee.courseRatingMen || null,
                  course_rating_women: tee.courseRatingWomen || null,
                  total_distance: tee.totalYards || tee.totalDistance || null
                });
              });
            }
            
            // Transform holes data
            const transformedHoles = [];
            if (course.holes && Array.isArray(course.holes)) {
              course.holes.forEach(hole => {
                // Create distances object mapped by tee name
                const distances = {};
                if (hole.teeDistances && Array.isArray(hole.teeDistances)) {
                  hole.teeDistances.forEach(teeDistance => {
                    // Find tee name from tee ID
                    const tee = course.tees.find(t => t.id === teeDistance.teeId);
                    if (tee && tee.name) {
                      distances[tee.name.toLowerCase()] = teeDistance.yards;
                    }
                  });
                }
                
                transformedHoles.push({
                  number: hole.number,
                  par_men: hole.parMen || hole.par || null,
                  par_women: hole.parWomen || hole.par || null,
                  index_men: hole.indexMen || hole.index || null,
                  index_women: hole.indexWomen || hole.index || null,
                  distances: distances
                });
              });
            }
            
            // Create transformed course data
            const transformedCourse = {
              name: course.name,
              api_course_id: course.id,
              club_name: course.club?.name || "",
              location: `${course.location?.city || ""}, ${course.location?.state || ""}`.trim(),
              country: course.location?.country || "",
              latitude: course.location?.latitude || null,
              longitude: course.location?.longitude || null,
              num_holes: course.numHoles || 18,
              par: course.par || null,
              tees: transformedTees,
              holes: transformedHoles,
              updated_at: now.toISOString()
            };
            
            // Validate transformed data meets minimum requirements
            const isValid = 
              transformedCourse.name && 
              transformedCourse.par && 
              transformedTees.length > 0 && 
              transformedHoles.length > 0;
              
            if (!isValid) {
              console.error("Transformed course data is incomplete");
              // Log specific validation failures
              if (!transformedCourse.name) console.error("Missing course name");
              if (!transformedCourse.par) console.error("Missing course par");
              if (transformedTees.length === 0) console.error("Missing tee data");
              if (transformedHoles.length === 0) console.error("Missing hole data");
              
              throw new Error("API returned incomplete course data");
            }
            
            // Update course in database if needed
            if (existingCourse) {
              console.log(`Updating existing course: ${existingCourse.name}`);
              
              // Merge data strategy - keep existing data for fields not present in API data
              const mergedCourse = {
                ...existingCourse,
                ...transformedCourse,
                // Preserve ID
                id: existingCourse.id,
                // Preserve created_at
                created_at: existingCourse.created_at
              };
              
              const { error: updateError } = await supabase
                .from('courses')
                .update(mergedCourse)
                .eq('id', existingCourse.id);
                
              if (updateError) {
                console.error("Error updating course:", updateError);
                throw new Error(`Database error updating course: ${updateError.message}`);
              }
              
              // Refresh updated course data
              const { data: updatedCourse, error: refreshError } = await supabase
                .from('courses')
                .select('*')
                .eq('id', existingCourse.id)
                .single();
                
              if (refreshError) {
                console.error("Error fetching updated course:", refreshError);
              } else {
                existingCourse = updatedCourse;
              }
            } else if (apiCourseId) {
              console.log(`Creating new course from API data: ${transformedCourse.name}`);
              
              // Insert new course
              const { data: newCourse, error: insertError } = await supabase
                .from('courses')
                .insert({
                  ...transformedCourse,
                  created_at: now.toISOString()
                })
                .select()
                .single();
                
              if (insertError) {
                console.error("Error inserting course:", insertError);
                throw new Error(`Database error inserting course: ${insertError.message}`);
              }
              
              existingCourse = newCourse;
            }
          } else {
            console.error("API response missing course data", apiData);
            throw new Error("API returned invalid course data structure");
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
              console.error("Golf API authentication error - please check API key");
            }
            
            throw new Error(`API error: ${errorStatus} - ${errorBody}`);
          } catch (parseError) {
            console.error(`Could not parse error response: ${parseError}`);
            throw new Error(`API error: ${errorStatus}`);
          }
        }
      } catch (apiError) {
        console.error(`Exception in API processing: ${apiError}`);
        
        // If we have existing course data, return it despite the API error
        if (existingCourse) {
          console.log("Returning existing course data despite API error");
          // Continue execution and return existing data
        } else {
          throw apiError; // Re-throw if we have no fallback data
        }
      }
    }
    
    // If we still don't have course data, report error
    if (!existingCourse) {
      return new Response(
        JSON.stringify({ 
          error: "Course not found",
          courseId
        }),
        { 
          status: 404, 
          headers: { 
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          } 
        }
      );
    }
    
    // Add metadata about data freshness
    const responseData = {
      ...existingCourse,
      has_complete_data: !!(existingCourse.tees?.length > 0 && existingCourse.holes?.length > 0),
      data_refreshed: needsApiRefresh
    };
    
    // Return the course data
    return new Response(
      JSON.stringify(responseData),
      { 
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        } 
      }
    );
    
  } catch (error) {
    console.error(`Error in get-course-details function: ${error}`);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        } 
      }
    );
  }
});