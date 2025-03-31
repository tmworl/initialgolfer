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
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      }
    });
  }

  try {
    // Get Supabase credentials from environment
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing Supabase credentials in environment variables");
    }
    
    // Create Supabase client with service role key
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Parse the URL to get query parameters
    const url = new URL(req.url);
    const searchQuery = url.searchParams.get('query') || '';
    const userId = url.searchParams.get('userId') || '';
    const limit = parseInt(url.searchParams.get('limit') || '20', 10);
    const noRecent = url.searchParams.get('noRecent') === 'true';
    
    // Authorization handling - extract user context if provided
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
    
    // Determine effective user ID - from query param or auth context
    const effectiveUserId = userId || userFromAuth?.id;
    
    // Initialize results containers
    let courses = [];
    let recentCourses = [];
    
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
            tees
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
            
            // Add has_tee_data flag to match current format
            uniqueRecentCourses.push({
              ...round.courses,
              has_tee_data: round.courses.tees !== null && 
                          Array.isArray(round.courses.tees) && 
                          round.courses.tees.length > 0
            });
          }
        });
        
        recentCourses = uniqueRecentCourses.slice(0, limit);
      }
    }
    
    // CASE 2: Search Query (if provided)
    if (searchQuery.length >= 3) {
      let query = supabase
        .from('courses')
        .select('id, name, club_name, location, tees');
      
      // Apply search filter with case-insensitive pattern matching
      query = query.or(`name.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%,club_name.ilike.%${searchQuery}%`);
      
      const { data: searchData, error: searchError } = await query
        .order('name')
        .limit(limit);
        
      if (!searchError && searchData) {
        // Add has_tee_data flag to match current format
        courses = searchData.map(course => ({
          ...course,
          has_tee_data: course.tees !== null && 
                      Array.isArray(course.tees) && 
                      course.tees.length > 0
        }));
      }
    } 
    // CASE 3: Get all courses (fallback if no search query)
    else if (searchQuery.length === 0) {
      const { data: allData, error: allError } = await supabase
        .from('courses')
        .select('id, name, club_name, location, tees')
        .order('name')
        .limit(limit);
        
      if (!allError && allData) {
        // Add has_tee_data flag to match current format
        courses = allData.map(course => ({
          ...course,
          has_tee_data: course.tees !== null && 
                      Array.isArray(course.tees) && 
                      course.tees.length > 0
        }));
      }
    }
    
    // Prepare the response object to match existing service format
    const response = {
      courses
    };
    
    // Add recentCourses to response if available
    if (recentCourses.length > 0) {
      response.recentCourses = recentCourses;
    }
    
    // Return successful response
    return new Response(
      JSON.stringify(response),
      { 
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        } 
      }
    );
    
  } catch (error) {
    // Handle errors with appropriate status code
    console.error("Error in function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
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