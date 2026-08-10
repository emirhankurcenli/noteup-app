// index.js
var index_default = {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Authorization, Content-Type"
    };
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || authHeader !== "Bearer NoteUp_R2_Secured_Token_4c96795b") {
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
export {
  index_default as default
};
//# sourceMappingURL=index.js.map
