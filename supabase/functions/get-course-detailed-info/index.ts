// supabase/functions/get-course-detailed-info/index.ts

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
    if (courseId === 'get-course-detailed-info') {
      courseId = url.searchParams.get('courseId') || '';
    }
    
    // For database ID or API course ID
    const apiCourseId = url.searchParams.get('apiCourseId') || '';
    
    // Validate that either courseId or apiCourseId is provided
    if (!courseId && !apiCourseId) {
      return new Response(
        JSON.stringify({ error: "Course ID or API Course ID is required" }),
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
    let dbQuery = supabase.from('courses').select('*');
    
    if (courseId) {
      dbQuery = dbQuery.eq('id', courseId);
    } else if (apiCourseId) {
      dbQuery = dbQuery.eq('api_course_id', apiCourseId);
    }
    
    let { data: existingCourse, error: dbError } = await dbQuery.single();
      
    if (dbError && dbError.code !== 'PGRST116') { // Not found error is acceptable
      console.error("Database error fetching course:", dbError);
    }
    
    // Check if we need to fetch POI data from API
    let needsApiRefresh = false;
    let effectiveApiCourseId = apiCourseId;
    
    if (!existingCourse) {
      console.log(`Course not found in database using provided IDs`);
      return new Response(
        JSON.stringify({ 
          error: "Course not found in database. Please ensure course exists by calling get-course-details first."
        }),
        { 
          status: 404, 
          headers: { 
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          } 
        }
      );
    } else {
      console.log(`Found course ${existingCourse.name} in database`);
      
      // Use the API course ID from the database if not provided
      if (!effectiveApiCourseId) {
        effectiveApiCourseId = existingCourse.api_course_id;
      }
      
      // Check if course has POI data
      const hasPoiData = existingCourse.poi && 
                         Array.isArray(existingCourse.poi) && 
                         existingCourse.poi.length > 0;
                         
      // Check data freshness
      let dataStale = false;
      if (existingCourse.updated_at) {
        const lastUpdateTime = new Date(existingCourse.updated_at).getTime();
        const staleDuration = now.getTime() - lastUpdateTime;
        dataStale = staleDuration > FRESHNESS_THRESHOLD_MS;
        
        if (dataStale) {
          console.log(`POI data is stale, last updated ${Math.floor(staleDuration / (24 * 60 * 60 * 1000))} days ago`);
        }
      }
      
      // Determine if we need to refresh from API
      needsApiRefresh = forceRefresh || !hasPoiData || dataStale;
    }
    
    // If we need API data and have the API key + course ID
    if (needsApiRefresh && GOLF_API_KEY && effectiveApiCourseId) {
      console.log(`Fetching POI data from API for ${effectiveApiCourseId}`);
      
      try {
        // Make API call to get course coordinates/POI
        const apiUrl = `https://www.golfapi.io/api/v2.3/coordinates/${effectiveApiCourseId}`;
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
          console.log("API response received for course coordinates");
          
          // Log summary for debugging
          if (apiData && apiData.coordinates) {
            console.log(`Received ${apiData.coordinates.length} coordinate points from API`);
          }
          
          // Transform coordinates data into our POI structure
          if (apiData && apiData.coordinates && Array.isArray(apiData.coordinates)) {
            console.log("Transforming coordinates data into POI structure");
            
            // Create holePoi map to organize features by hole
            const holePoi = new Map();
            
            // Process each coordinate
            apiData.coordinates.forEach(coord => {
              // Validate coordinate has necessary data
              if (!coord.holeNumber || !coord.latitude || !coord.longitude || !coord.type) {
                console.warn("Skipping invalid coordinate:", coord);
                return;
              }
              
              const holeNumber = parseInt(coord.holeNumber);
              
              // Initialize hole POI structure if not exists
              if (!holePoi.has(holeNumber)) {
                holePoi.set(holeNumber, {
                  hole: holeNumber,
                  greens: [],
                  bunkers: [],
                  hazards: [],
                  tees: []
                });
              }
              
              const holePOIData = holePoi.get(holeNumber);
              
              // Create base point with lat/lng
              const point = {
                lat: parseFloat(coord.latitude),
                lng: parseFloat(coord.longitude)
              };
              
              // Classify coordinate by type and add to appropriate array
              switch(coord.type.toLowerCase()) {
                case 'green':
                case 'green_front':
                case 'green_center':
                case 'green_back':
                  // Determine green location (front, center, back)
                  let location = 'center';
                  if (coord.type.toLowerCase().includes('front')) {
                    location = 'front';
                  } else if (coord.type.toLowerCase().includes('back')) {
                    location = 'back';
                  }
                  
                  holePOIData.greens.push({
                    ...point,
                    location
                  });
                  break;
                  
                case 'bunker':
                case 'bunker_left':
                case 'bunker_right':
                case 'fairway_bunker':
                case 'greenside_bunker':
                  // Determine bunker side and location if available
                  let side = 'center';
                  if (coord.type.toLowerCase().includes('left')) {
                    side = 'left';
                  } else if (coord.type.toLowerCase().includes('right')) {
                    side = 'right';
                  }
                  
                  let bunkerLocation = '';
                  if (coord.type.toLowerCase().includes('fairway')) {
                    bunkerLocation = 'fairway';
                  } else if (coord.type.toLowerCase().includes('greenside')) {
                    bunkerLocation = 'greenside';
                  }
                  
                  holePOIData.bunkers.push({
                    ...point,
                    side,
                    ...(bunkerLocation ? { location: bunkerLocation } : {})
                  });
                  break;
                  
                case 'water':
                case 'water_hazard':
                case 'lateral_hazard':
                case 'hazard':
                  holePOIData.hazards.push({
                    ...point,
                    type: coord.type.toLowerCase().replace('_hazard', '')
                  });
                  break;
                  
                case 'tee':
                case 'tee_box':
                  // Add tee color/name if available
                  const teeName = coord.name || coord.color || "default";
                  holePOIData.tees.push({
                    ...point,
                    name: teeName.toLowerCase()
                  });
                  break;
                  
                default:
                  console.warn(`Unknown coordinate type: ${coord.type}`);
              }
            });
            
            // Convert the map to an array for storage
            const transformedPoi = Array.from(holePoi.values());
            
            console.log(`Transformed data for ${transformedPoi.length} holes`);
            
            // Validate transformed data has reasonable content
            if (transformedPoi.length === 0) {
              console.error("No valid POI data was generated from API response");
              throw new Error("API returned unusable coordinate data");
            }
            
            // Update course in database with new POI data
            const { error: updateError } = await supabase
              .from('courses')
              .update({
                poi: transformedPoi,
                updated_at: now.toISOString()
              })
              .eq('id', existingCourse.id);
              
            if (updateError) {
              console.error("Error updating course with POI data:", updateError);
              throw new Error(`Database error updating course: ${updateError.message}`);
            }
            
            console.log(`Successfully updated course ${existingCourse.name} with POI data`);
            
            // Refresh course data to include updated POI
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
          } else {
            console.error("API response missing coordinates data", apiData);
            throw new Error("API returned invalid coordinates data structure");
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
            
            // For 404, this might mean the course doesn't have coordinate data
            if (errorStatus === 404) {
              console.warn("Course coordinates not found in API");
              // Update the course to mark it as checked for coordinates
              await supabase
                .from('courses')
                .update({
                  updated_at: now.toISOString(),
                  // Set empty POI array to indicate we've checked
                  poi: []
                })
                .eq('id', existingCourse.id);
            } else {
              throw new Error(`API error: ${errorStatus} - ${errorBody}`);
            }
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
    
    // Prepare response data
    // Filter out empty POI arrays for cleaner response
    let responseData = {
      ...existingCourse,
      has_poi_data: false,
      data_refreshed: needsApiRefresh
    };
    
    // Check if there's actual POI data
    if (existingCourse.poi && Array.isArray(existingCourse.poi) && existingCourse.poi.length > 0) {
      // Count total features across all holes
      let featureCount = 0;
      existingCourse.poi.forEach(holePoi => {
        if (holePoi.greens) featureCount += holePoi.greens.length;
        if (holePoi.bunkers) featureCount += holePoi.bunkers.length;
        if (holePoi.hazards) featureCount += holePoi.hazards.length;
        if (holePoi.tees) featureCount += holePoi.tees.length;
      });
      
      responseData.has_poi_data = featureCount > 0;
      responseData.poi_feature_count = featureCount;
    }
    
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
    console.error(`Error in get-course-detailed-info function: ${error}`);
    
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