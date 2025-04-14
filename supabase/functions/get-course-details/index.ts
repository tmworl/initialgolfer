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
    
    // Resolution path tracking
    let resolutionPath = "unknown";
    
    // Enhanced multi-path entity resolution strategy
    let courseData = null;
    
    // RESOLUTION PATH 1: Direct database ID lookup (primary path)
    if (courseId) {
      console.log(`Attempting direct ID resolution with: ${courseId}`);
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();
        
      if (!error && data) {
        courseData = data;
        resolutionPath = "direct_id";
        console.log(`Successfully resolved course via direct ID: ${data.name}`);
      } else if (error && error.code !== 'PGRST116') {
        // Log non-not-found errors
        console.error("Database error in direct ID resolution:", error);
      }
    }
    
    // RESOLUTION PATH 2: API Course ID lookup (secondary path)
    if (!courseData && (apiCourseId || courseId)) {
      console.log(`Attempting API ID resolution with: ${apiCourseId || courseId}`);
      const effectiveApiId = apiCourseId || courseId;
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('api_course_id', effectiveApiId)
        .single();
        
      if (!error && data) {
        courseData = data;
        resolutionPath = "api_id";
        console.log(`Successfully resolved course via API ID: ${data.name}`);
      } else if (error && error.code !== 'PGRST116') {
        console.error("Database error in API ID resolution:", error);
      }
    }
    
    // Enhanced resolution strategy: If we have a course ID but still no data,
    // attempt to get it from the API directly and persist it
    if (!courseData && GOLF_API_KEY && (apiCourseId || courseId)) {
      try {
        const effectiveApiId = apiCourseId || courseId;
        console.log(`Attempting to fetch course directly from API: ${effectiveApiId}`);
        
        // Call API to get course details
        const apiUrl = `https://www.golfapi.io/api/v2.3/courses/${effectiveApiId}`;
        const apiResponse = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${GOLF_API_KEY}`,
            'Content-Type': 'application/json'
          },
          redirect: 'follow'
        });
        
        if (apiResponse.ok) {
          const course = await apiResponse.json();
          console.log(`API returned course: ${course.clubName}, Course ID: ${course.courseID}`);
          
          // CRITICAL ENHANCEMENT: Handle empty course name by using club name
          const effectiveName = course.courseName || course.clubName;
          
          console.log(`Using effective name for course: ${effectiveName}`);
          
          // Transform API response for our schema
          const transformedCourse = {
            name: effectiveName, // Use club name if course name is empty
            api_course_id: course.courseID,
            club_name: course.clubName,
            location: `${course.city}, ${course.state}`,
            country: course.country,
            latitude: course.latitude,
            longitude: course.longitude,
            num_holes: course.numHoles,
            par: course.parsMen?.reduce((sum, par) => sum + par, 0) || null,
            updated_at: new Date(parseInt(course.timestampUpdated) * 1000).toISOString(),
            
            // Extract tee data
            tees: course.tees ? course.tees.map(tee => ({
              id: tee.teeID,
              name: tee.teeName,
              color: tee.teeColor,
              slope_men: tee.slopeMen || null,
              slope_women: tee.slopeWomen || null,
              total_distance: Array.from({ length: 18 }, (_, i) => Number(tee[`length${i+1}`] || 0)).reduce((a, b) => a + b, 0),
              course_rating_men: tee.courseRatingMen || null,
              course_rating_women: tee.courseRatingWomen || null
            })) : [],
            
            // Extract holes data 
            holes: Array.from({ length: course.numHoles }, (_, i) => {
              const holeNum = i + 1;
              return {
                number: holeNum,
                par_men: course.parsMen?.[i] || null,
                par_women: course.parsWomen?.[i] || null,
                index_men: course.indexesMen?.[i] || null,
                index_women: course.indexesWomen?.[i] || null,
                distances: course.tees ? Object.fromEntries(
                  course.tees.map(tee => [
                    tee.teeName.toLowerCase(), 
                    Number(tee[`length${holeNum}`] || 0)
                  ])
                ) : {}
              };
            })
          };
          
          // First check if course already exists in our database
          const { data: existingCourse, error: existingError } = await supabase
            .from('courses')
            .select('id')
            .eq('api_course_id', transformedCourse.api_course_id)
            .maybeSingle();
            
          if (existingError && existingError.code !== 'PGRST116') {
            console.error("Database error checking for existing course:", existingError);
          }
          
          let savedCourse = null;
          
          if (existingCourse) {
            // Update existing course
            console.log(`Updating existing course in database: ${transformedCourse.name}`);
            const { data: updatedCourse, error: updateError } = await supabase
              .from('courses')
              .update(transformedCourse)
              .eq('id', existingCourse.id)
              .select()
              .single();
              
            if (updateError) {
              console.error("Error updating course from API data:", updateError);
            } else {
              savedCourse = updatedCourse;
              console.log(`Course updated successfully: ${savedCourse.name}`);
            }
          } else {
            // Insert new course
            console.log(`Inserting new course in database: ${transformedCourse.name}`);
            const { data: insertedCourse, error: insertError } = await supabase
              .from('courses')
              .insert({
                ...transformedCourse,
                created_at: new Date().toISOString()
              })
              .select()
              .single();
              
            if (insertError) {
              console.error("Error inserting course from API data:", insertError);
            } else {
              savedCourse = insertedCourse;
              console.log(`Course inserted successfully: ${savedCourse.name}`);
            }
          }
          
          if (savedCourse) {
            courseData = savedCourse;
            resolutionPath = "api_fetch_persist";
          }
        } else {
          // Handle API error
          const errorStatus = apiResponse.status;
          console.error(`API error (${errorStatus}) fetching course`);
          
          try {
            const errorText = await apiResponse.text();
            console.error("API error details:", errorText);
          } catch (e) {
            console.error("Could not parse API error response");
          }
        }
      } catch (apiError) {
        console.error("Error fetching from API:", apiError);
      }
    }
    
    // If we still can't find the course, return an error
    if (!courseData) {
      return new Response(
        JSON.stringify({ 
          error: "Course not found",
          courseId,
          apiCourseId
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
    
    // Check if course data is stale and needs a refresh
    let dataStale = false;
    if (courseData.updated_at) {
      const lastUpdateTime = new Date(courseData.updated_at).getTime();
      const staleDuration = now.getTime() - lastUpdateTime;
      dataStale = staleDuration > FRESHNESS_THRESHOLD_MS;
    }
    
    // Prepare response with resolution metadata
    return new Response(
      JSON.stringify({
        ...courseData,
        has_tee_data: courseData.tees && Array.isArray(courseData.tees) && courseData.tees.length > 0,
        has_poi_data: courseData.poi && Array.isArray(courseData.poi) && courseData.poi.length > 0,
        resolution_path: resolutionPath,
        data_freshness: {
          stale: dataStale,
          last_updated: courseData.updated_at
        }
      }),
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