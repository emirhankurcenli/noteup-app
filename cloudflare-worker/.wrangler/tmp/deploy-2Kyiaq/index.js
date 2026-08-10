// index.js
var index_default = {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Authorization, Content-Type"
    };
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }
    const url = new URL(request.url);
    const filename = url.searchParams.get("filename") || url.pathname.replace(/^\//, "");
    if (request.method === "GET") {
      if (!filename) {
        return new Response(JSON.stringify({ error: "Missing filename" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      const object = await env.BUCKET.get(filename);
      if (!object) {
        return new Response("Not Found", { status: 404, headers: corsHeaders });
      }
      const headers = new Headers(corsHeaders);
      headers.set("Content-Type", object.httpMetadata?.contentType || "application/octet-stream");
      headers.set("Cache-Control", "public, max-age=31536000");
      return new Response(object.body, { headers });
    }
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || authHeader !== "Bearer NoteUp_R2_Secured_Token_4c96795b") {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
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
        url: `https://soft-hall-b2cd.kurkral.workers.dev/${filename}`
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
    return new Response(JSON.stringify({ error: "Method not allowed." }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
};
export {
  index_default as default
};
//# sourceMappingURL=index.js.map
