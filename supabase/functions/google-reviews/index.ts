const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
const QUERY = 'דיירקט פיקס: תיקוני אייפון עד הבית';
let cache: { at: number; data: unknown } | null = null;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
  try {
    if (cache && Date.now() - cache.at < 10 * 60 * 1000) {
      return new Response(JSON.stringify(cache.data), { headers: { ...cors, 'Content-Type': 'application/json' } });
    }
    const key = Deno.env.get('GOOGLE_MAPS_API_KEY');
    if (!key) throw new Error('missing key');
    const p = new URLSearchParams({ input: QUERY, inputtype: 'textquery', fields: 'place_id,rating,user_ratings_total,name', language: 'iw', key });
    const r = await fetch(`https://maps.googleapis.com/maps/api/place/findplacefromtext/json?${p}`);
    const j = await r.json();
    const c = j.candidates?.[0];
    if (!c) {
      console.error('google-reviews no candidate', j.status, j.error_message);
      return new Response(JSON.stringify({ error: j.status, details: j.error_message }), { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } });
    }
    const data = { rating: c.rating ?? null, count: c.user_ratings_total ?? 0, place_id: c.place_id, name: c.name };
    cache = { at: Date.now(), data };
    return new Response(JSON.stringify(data), { headers: { ...cors, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } });
  }
});
