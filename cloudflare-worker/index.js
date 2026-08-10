export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Authorization, Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const authHeader = request.headers.get("Authorization");
    const validToken = env.AUTH_TOKEN;
    if (!validToken) {
      return new Response(JSON.stringify({ error: "Server misconfiguration" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    if (!authHeader || authHeader !== `Bearer ${validToken}`) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const url = new URL(request.url);
    const filename = url.searchParams.get("filename");
    if (!filename) {
      return new Response(JSON.stringify({ error: "Missing filename parameter" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    if (request.method === "POST") {
      const blob = await request.blob();
      await env.BUCKET.put(filename, blob);
      
      return new Response(JSON.stringify({ 
        success: true, 
        url: `https://pub-84d47d4e3cb245c3866855146de77a64.r2.dev/${filename}` 
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    } 
    
    if (request.method === "DELETE") {
      await env.BUCKET.delete(filename);
      return new Response(JSON.stringify({ success: true, message: "File deleted successfully from R2" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ error: "Method not allowed. Only POST and DELETE are accepted." }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
};
