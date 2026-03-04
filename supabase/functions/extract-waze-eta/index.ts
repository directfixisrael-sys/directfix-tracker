import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { wazeLink } = await req.json();

    if (!wazeLink) {
      return new Response(
        JSON.stringify({ error: 'No Waze link provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract URL from shared text (user may paste full share text)
    const urlMatch = wazeLink.match(/https:\/\/waze\.com\/ul[^\s]*/);
    const url = urlMatch ? urlMatch[0] : wazeLink;

    console.log('Fetching Waze URL:', url);

    // Fetch the Waze page
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'he-IL,he;q=0.9,en;q=0.8',
      },
      redirect: 'follow',
    });

    const html = await response.text();
    console.log('Fetched HTML length:', html.length);

    let eta: string | null = null;

    // Try multiple patterns to find ETA in Waze page
    // Pattern 1: Look for ETA in meta tags
    const ogDescMatch = html.match(/property="og:description"\s+content="([^"]*)"/) 
      || html.match(/content="([^"]*)".*property="og:description"/);
    if (ogDescMatch) {
      console.log('OG description:', ogDescMatch[1]);
      // Look for time patterns like "5 min", "10 דקות", etc.
      const timeMatch = ogDescMatch[1].match(/(\d+)\s*(min|mins|minute|minutes|דקות|דקה)/i);
      if (timeMatch) {
        eta = `${timeMatch[1]} דקות`;
      }
    }

    // Pattern 2: Look for ETA in JSON-LD or embedded data
    const jsonLdMatch = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/);
    if (jsonLdMatch && !eta) {
      try {
        const jsonData = JSON.parse(jsonLdMatch[1]);
        console.log('JSON-LD data:', JSON.stringify(jsonData));
      } catch (e) {
        // ignore parse errors
      }
    }

    // Pattern 3: Look for ETA in page content - common Waze patterns
    if (!eta) {
      const etaPatterns = [
        /eta["\s:]+(\d+)\s*(min|mins|minute|minutes|דקות|דקה)/i,
        /arrival["\s:]+(\d+)\s*(min|mins|minute|minutes)/i,
        /(\d+)\s*(min|mins|minute|minutes|דקות|דקה)\s*(away|left|remaining|נותרו)/i,
        /"duration"[:\s]*"?(\d+)"?/i,
        /"eta"[:\s]*"?(\d+)"?/i,
        /time["\s:]*(\d+)\s*(min|דקות)/i,
        /ETA:\s*(\d{1,2}:\d{2})/i,
        /(\d{1,2}:\d{2})\s*(AM|PM)?/i,
      ];

      for (const pattern of etaPatterns) {
        const match = html.match(pattern);
        if (match) {
          console.log('ETA pattern match:', match[0]);
          if (match[0].includes(':') && !match[0].toLowerCase().includes('eta')) {
            // It's a time format like "14:30"
            eta = match[1].includes(':') ? match[1] : `${match[1]} דקות`;
          } else {
            eta = `${match[1]} דקות`;
          }
          break;
        }
      }
    }

    // Pattern 4: Look in script tags for route data
    if (!eta) {
      const scriptMatches = html.matchAll(/totalRouteTime["\s:]*(\d+)/gi);
      for (const match of scriptMatches) {
        const minutes = Math.round(parseInt(match[1]) / 60);
        if (minutes > 0 && minutes < 300) {
          eta = `${minutes} דקות`;
          break;
        }
      }
    }

    // Pattern 5: Look for any "minutes" mention in structured data
    if (!eta) {
      const dataMatch = html.match(/["']?(?:duration|time|eta|minutes|totalTime)["']?\s*[=:]\s*["']?(\d+)["']?/i);
      if (dataMatch) {
        const val = parseInt(dataMatch[1]);
        if (val > 0 && val < 300) {
          eta = `${val} דקות`;
        }
      }
    }

    console.log('Extracted ETA:', eta);

    return new Response(
      JSON.stringify({ eta, success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error extracting Waze ETA:', error);
    return new Response(
      JSON.stringify({ error: error.message, eta: null }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
