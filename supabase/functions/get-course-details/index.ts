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
          
          // Log the raw API response for diagnostic purposes
          console.log(`[get-course-details] Raw API response structure for ${apiCourseId}:`, 
            JSON.stringify({
              responseKeys: Object.keys(apiData),
              hasCourse: !!apiData.course,
              hasTees: !!(apiData.tees || (apiData.course && apiData.course.tees)),
              teesCount: (apiData.tees || (apiData.course && apiData.course.tees) || []).length
            })
          );
          
          // Modified logic to handle both root-level and nested course structures
          if (apiData) {
            // Extract course data from either nested or root format
            const course = apiData.course || 
                         (apiData.tees && apiData.courseName ? apiData : null);
            
            if (course && (course.tees || []).length > 0) {
              console.log("Successfully extracted course data with tees");
              
              // Transform tees data
              const transformedTees = [];
              if (course.tees && Array.isArray(course.tees)) {
                course.tees.forEach(tee => {
                  transformedTees.push({
                    id: tee.teeID || `tee_${transformedTees.length + 1}`,
                    name: tee.teeName || "Unnamed",
                    color: tee.teeColor || "#CCCCCC",
                    slope_men: tee.slopeMen || null,
                    slope_women: tee.slopeWomen || null,
                    course_rating_men: tee.courseRatingMen || null,
                    course_rating_women: tee.courseRatingWomen || null,
                    total_distance: calculateTotalDistance(tee) || null
                  });
                });
              }
              
              // Transform holes data
              const transformedHoles = [];
              const parsMen = course.parsMen || [];
              const parsWomen = course.parsWomen || [];
              const indexesMen = course.indexesMen || [];
              const indexesWomen = course.indexesWomen || [];
              
              // Process individual holes
              const numHoles = parseInt(course.numHoles || "18", 10);
              for (let i = 1; i <= numHoles; i++) {
                // Create distances object mapped by tee name
                const distances = {};
                if (course.tees && Array.isArray(course.tees)) {
                  course.tees.forEach(tee => {
                    const holeDistance = tee[`length${i}`];
                    if (holeDistance) {
                      distances[tee.teeName.toLowerCase()] = parseInt(holeDistance, 10);
                    }
                  });
                }
                
                transformedHoles.push({
                  number: i,
                  par_men: parsMen[i-1] || null,
                  par_women: parsWomen[i-1] || null,
                  index_men: indexesMen[i-1] || null,
                  index_women: indexesWomen[i-1] || null,
                  distances: distances
                });
              }
              
              // Create transformed course data
              const transformedCourse = {
                name: course.courseName || course.name,
                api_course_id: course.courseID || course.id,
                club_name: course.clubName || "",
                location: `${course.city || ""}, ${course.state || ""}`.trim(),
                country: course.country || "",
                latitude: course.latitude || null,
                longitude: course.longitude || null,
                num_holes: parseInt(course.numHoles || "18", 10),
                par: calculateCoursePar(parsMen, numHoles),
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
              console.error("API response missing essential course data", apiData);
              throw new Error("API returned invalid course data structure");
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

/**
 * Helper function to calculate total distance from tee data
 */
function calculateTotalDistance(tee) {
  let total = 0;
  const holeCount = 18; // Standard number of holes
  
  for (let i = 1; i <= holeCount; i++) {
    const distance = tee[`length${i}`];
    if (distance && !isNaN(parseInt(distance, 10))) {
      total += parseInt(distance, 10);
    }
  }
  
  return total > 0 ? total : null;
}

/**
 * Helper function to calculate course par from par data
 */
function calculateCoursePar(parData, numHoles) {
  if (!parData || !Array.isArray(parData)) {
    return 72; // Default par for standard course
  }
  
  let totalPar = 0;
  const effectiveHoles = Math.min(parData.length, numHoles);
  
  for (let i = 0; i < effectiveHoles; i++) {
    if (parData[i] && !isNaN(parseInt(parData[i], 10))) {
      totalPar += parseInt(parData[i], 10);
    }
  }
  
  return totalPar > 0 ? totalPar : 72;
}