import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const OCR_API_URL = "https://api.ocr.space/parse/image";

const corsHeaders = (origin: string | null) => {
  const headers = new Headers({
    "Access-Control-Allow-Headers": "authorization, content-type, x-client-info, apikey",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Cache-Control": "no-store",
  });
  if (origin) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Access-Control-Allow-Credentials", "true");
  }
  return headers;
};

serve(async (req) => {
  const origin = req.headers.get("Origin");

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...Object.fromEntries(corsHeaders(origin).entries()), "Content-Type": "application/json" },
    });
  }

  const apiKey = Deno.env.get("OCR_API_KEY");
  if (!apiKey) {
    console.error('[ocr-proxy] OCR_API_KEY is not configured');
    return new Response(JSON.stringify({ error: "OCR_API_KEY_NOT_CONFIGURED" }), {
      status: 500,
      headers: { ...Object.fromEntries(corsHeaders(origin).entries()), "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const { base64Image } = body;

    if (!base64Image || typeof base64Image !== "string" || base64Image.length < 100) {
      console.error('[ocr-proxy] Invalid image data, length:', base64Image?.length);
      return new Response(JSON.stringify({ error: "INVALID_IMAGE_DATA" }), {
        status: 400,
        headers: { ...Object.fromEntries(corsHeaders(origin).entries()), "Content-Type": "application/json" },
      });
    }

    const formData = new FormData();
    formData.append("base64Image", base64Image);
    formData.append("apikey", apiKey);
    formData.append("language", "eng");
    formData.append("detectOrientation", "true");
    formData.append("OCREngine", "2");
    formData.append("scale", "true");

    console.log('[ocr-proxy] Sending request to OCR API, image size:', base64Image.length);

    const ocrResponse = await fetch(OCR_API_URL, {
      method: "POST",
      body: formData,
    });

    console.log('[ocr-proxy] OCR API response status:', ocrResponse.status);

    let ocrData: any;
    try {
      ocrData = await ocrResponse.json();
    } catch (parseError) {
      const text = await ocrResponse.text();
      console.error('[ocr-proxy] Failed to parse OCR response as JSON, status:', ocrResponse.status, 'body preview:', text.slice(0, 300));
      return new Response(JSON.stringify({ error: `OCR_UPSTREAM_ERROR: ${ocrResponse.status} ${text.slice(0, 200)}` }), {
        status: 502,
        headers: { ...Object.fromEntries(corsHeaders(origin).entries()), "Content-Type": "application/json" },
      });
    }

    console.log('[ocr-proxy] OCR response data:', JSON.stringify(ocrData).slice(0, 500));

    if (ocrData.IsErroredOnProcessing) {
      const errMsg = ocrData.ErrorMessage?.[0] || "OCR_PROCESSING_ERROR";
      console.error('[ocr-proxy] OCR processing error:', errMsg);
      if (errMsg.includes("quota") || errMsg.includes("limit")) {
        return new Response(JSON.stringify({ error: "OCR_QUOTA_EXCEEDED" }), {
          status: 429,
          headers: { ...Object.fromEntries(corsHeaders(origin).entries()), "Content-Type": "application/json" },
        });
      }
      if (errMsg.includes("key") || errMsg.includes("invalid")) {
        return new Response(JSON.stringify({ error: "OCR_API_KEY_INVALID" }), {
          status: 401,
          headers: { ...Object.fromEntries(corsHeaders(origin).entries()), "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: `OCR_PROCESSING_ERROR: ${errMsg}` }), {
        status: 500,
        headers: { ...Object.fromEntries(corsHeaders(origin).entries()), "Content-Type": "application/json" },
      });
    }

    const parsedResults = ocrData.ParsedResults;
    if (!parsedResults || !Array.isArray(parsedResults) || parsedResults.length === 0) {
      console.warn('[ocr-proxy] No parsed results in OCR response');
      return new Response(JSON.stringify({ error: "OCR_NO_TEXT" }), {
        status: 422,
        headers: { ...Object.fromEntries(corsHeaders(origin).entries()), "Content-Type": "application/json" },
      });
    }

    const text = parsedResults.map((r: any) => r.ParsedText || "").join("\n").trim();
    if (!text) {
      console.warn('[ocr-proxy] Parsed results empty after joining');
      return new Response(JSON.stringify({ error: "OCR_NO_TEXT" }), {
        status: 422,
        headers: { ...Object.fromEntries(corsHeaders(origin).entries()), "Content-Type": "application/json" },
      });
    }

    console.log('[ocr-proxy] Success, text length:', text.length);
    return new Response(JSON.stringify({ text }), {
      status: 200,
      headers: { ...Object.fromEntries(corsHeaders(origin).entries()), "Content-Type": "application/json" },
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : "OCR_NETWORK_ERROR";
    console.error('[ocr-proxy] Unexpected error:', err);
    return new Response(JSON.stringify({ error: message }), {
      status: 502,
      headers: { ...Object.fromEntries(corsHeaders(origin).entries()), "Content-Type": "application/json" },
    });
  }
});
