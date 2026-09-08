// Both.AI - WhatsApp Bot + Facebook Login
// Express app, ready to deploy on Vercel (Root Directory: both-v1-sem-firebase)
//
// Valid OAuth Redirect URIs to register in the Meta App dashboard:
//   https://both-ai-alpha.vercel.app/
//   https://both-ai-alpha.vercel.app/auth/callback
//   https://both-ai-alpha.vercel.app/auth/facebook/callback
//   https://both-ai-alpha.vercel.app/api/auth/callback/facebook
//   http://localhost:3000/auth/facebook/callback
//
// Website platform only (no iOS): https://both-ai-alpha.vercel.app/

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const { BASE_URL, landingPage, dashboardPage, privacyPage } = require("./views");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Environment variables
const FB_APP_ID = process.env.FB_APP_ID || "";
const FB_APP_SECRET = process.env.FB_APP_SECRET || "";
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "both-ai-v1-nois";
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN || "";

// Build the real origin from the incoming request so the redirect_uri always
// matches the domain the user is actually on (works on any Vercel URL / custom
// domain). An explicit PUBLIC_URL env var overrides everything if set.
function getBaseUrl(req) {
  if (process.env.PUBLIC_URL) return process.env.PUBLIC_URL.replace(/\/$/, "");
  const proto = (req.headers["x-forwarded-proto"] || "https").split(",")[0].trim();
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  if (host) return `${proto}://${host}`;
  return BASE_URL;
}

function getRedirectUri(req) {
  return `${getBaseUrl(req)}/auth/facebook/callback`;
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Tiny cookie parser (no extra dependency needed)
app.use((req, _res, next) => {
  const header = req.headers.cookie || "";
  req.cookies = header.split(";").reduce((acc, part) => {
    const idx = part.indexOf("=");
    if (idx > -1) {
      const k = part.slice(0, idx).trim();
      const v = part.slice(idx + 1).trim();
      if (k) acc[k] = decodeURIComponent(v);
    }
    return acc;
  }, {});
  next();
});

// In-memory store for the latest webhook payload (visible at /debug)
let lastWebhookPayload = null;

function getSessionUser(req) {
  const raw = req.cookies && req.cookies.both_session;
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Landing / panel pages
// ---------------------------------------------------------------------------

app.get("/", (_req, res) => {
  res
    .type("html")
    .send(landingPage({ fbAppId: FB_APP_ID, whatsappConfigured: Boolean(WHATSAPP_TOKEN) }));
});

app.get("/dashboard", (req, res) => {
  const user = getSessionUser(req);
  if (!user) return res.redirect("/auth/facebook");
  res.type("html").send(dashboardPage({ user }));
});

app.get("/privacy", (_req, res) => {
  res.type("html").send(privacyPage());
});

app.get("/logout", (_req, res) => {
  res.setHeader("Set-Cookie", "both_session=; Path=/; Max-Age=0; SameSite=Lax");
  res.redirect("/");
});

// ---------------------------------------------------------------------------
// Facebook Login (server-side OAuth)
// ---------------------------------------------------------------------------

// GET /auth/facebook -> redirect to the Facebook OAuth dialog
app.get("/auth/facebook", (req, res) => {
  if (!FB_APP_ID) {
    return res
      .status(500)
      .send("FB_APP_ID nao configurado. Defina as variaveis de ambiente no Vercel.");
  }
  const params = new URLSearchParams({
    client_id: FB_APP_ID,
    redirect_uri: getRedirectUri(req),
    scope: "public_profile,email",
    response_type: "code",
  });
  res.redirect(`https://www.facebook.com/v21.0/dialog/oauth?${params.toString()}`);
});

// POST /auth/facebook/token -> client-side JS SDK login.
// The browser (FB.getLoginStatus) sends the accessToken; we verify it against
// the Graph API, load the profile and set the same session cookie used by the
// server-side OAuth flow.
app.post("/auth/facebook/token", async (req, res) => {
  const accessToken = req.body && req.body.accessToken;
  if (!accessToken) {
    return res.status(400).json({ ok: false, error: "Missing accessToken" });
  }

  try {
    // Optional but recommended: verify the token belongs to THIS app.
    if (FB_APP_ID && FB_APP_SECRET) {
      const appToken = `${FB_APP_ID}|${FB_APP_SECRET}`;
      const debugParams = new URLSearchParams({
        input_token: accessToken,
        access_token: appToken,
      });
      const debugRes = await fetch(
        `https://graph.facebook.com/debug_token?${debugParams.toString()}`
      );
      const debugData = await debugRes.json();
      const info = debugData && debugData.data;
      if (!info || !info.is_valid || String(info.app_id) !== String(FB_APP_ID)) {
        console.error("[both-ai] token verification failed:", debugData);
        return res.status(401).json({ ok: false, error: "Invalid access token" });
      }
    }

    // Load the profile with the user-provided token.
    const profileParams = new URLSearchParams({
      fields: "id,name,email,picture",
      access_token: accessToken,
    });
    const profileRes = await fetch(
      `https://graph.facebook.com/v21.0/me?${profileParams.toString()}`
    );
    const profile = await profileRes.json();

    if (!profileRes.ok || !profile.id) {
      console.error("[both-ai] profile fetch failed:", profile);
      return res.status(500).json({ ok: false, error: "Failed to load profile" });
    }

    const session = {
      id: profile.id,
      name: profile.name,
      email: profile.email || null,
    };
    const cookie = `both_session=${encodeURIComponent(
      JSON.stringify(session)
    )}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`;
    res.setHeader("Set-Cookie", cookie);
    res.json({ ok: true, user: session });
  } catch (err) {
    console.error("[both-ai] /auth/facebook/token error:", err);
    res.status(500).json({ ok: false, error: "Internal error" });
  }
});

// GET /auth/facebook/callback -> exchange code, load profile, set session
app.get("/auth/facebook/callback", async (req, res) => {
  const { code, error, error_description: errorDescription } = req.query;

  if (error) {
    return res.status(400).send(`Facebook login error: ${error_description || error}`);
  }
  if (!code) {
    return res.status(400).send("Missing authorization code");
  }

  try {
    // 1) Exchange the code for an access token
    const tokenParams = new URLSearchParams({
      client_id: FB_APP_ID,
      client_secret: FB_APP_SECRET,
      redirect_uri: getRedirectUri(req),
      code: String(code),
    });
    const tokenRes = await fetch(
      `https://graph.facebook.com/v21.0/oauth/access_token?${tokenParams.toString()}`
    );
    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.access_token) {
      console.error("[both-ai] token exchange failed:", tokenData);
      return res.status(500).send("Failed to exchange code for access token");
    }

    // 2) Fetch the user profile
    const profileParams = new URLSearchParams({
      fields: "id,name,email,picture",
      access_token: tokenData.access_token,
    });
    const profileRes = await fetch(
      `https://graph.facebook.com/v21.0/me?${profileParams.toString()}`
    );
    const profile = await profileRes.json();

    if (!profileRes.ok || !profile.id) {
      console.error("[both-ai] profile fetch failed:", profile);
      return res.status(500).send("Failed to load Facebook profile");
    }

    // 3) Set a session cookie and redirect to the dashboard
    const session = {
      id: profile.id,
      name: profile.name,
      email: profile.email || null,
    };
    const cookie = `both_session=${encodeURIComponent(
      JSON.stringify(session)
    )}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`;
    res.setHeader("Set-Cookie", cookie);
    res.redirect("/dashboard");
  } catch (err) {
    console.error("[both-ai] OAuth callback error:", err);
    res.status(500).send("Internal error during Facebook login");
  }
});

// ---------------------------------------------------------------------------
// WhatsApp webhook (Meta Cloud API)
// ---------------------------------------------------------------------------

// GET /webhook -> verification handshake from Meta
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("[both-ai] webhook verified");
    return res.status(200).type("text/plain").send(String(challenge));
  }
  console.warn("[both-ai] webhook verification failed");
  return res.sendStatus(403);
});

// POST /webhook -> incoming WhatsApp messages
app.post("/webhook", (req, res) => {
  // Respond quickly so Meta does not retry.
  res.status(200).send("OK");

  const body = req.body;
  lastWebhookPayload = { receivedAt: new Date().toISOString(), body };
  console.log("[both-ai] webhook payload:", JSON.stringify(body));

  try {
    const value = body?.entry?.[0]?.changes?.[0]?.value;
    const messages = value?.messages;
    if (Array.isArray(messages) && messages.length > 0) {
      messages.forEach((msg) => {
        console.log(
          `[both-ai] message from ${msg.from} type=${msg.type} text="${msg.text?.body || ""}"`
        );
      });
    }
  } catch (err) {
    console.error("[both-ai] error parsing webhook:", err);
  }
});

// ---------------------------------------------------------------------------
// Debug + health
// ---------------------------------------------------------------------------

app.get("/debug", (req, res) => {
  res.json({
    status: "OK",
    service: "Both.AI",
    baseUrl: getBaseUrl(req),
    redirectUri: getRedirectUri(req),
    env: {
      FB_APP_ID: Boolean(FB_APP_ID),
      FB_APP_SECRET: Boolean(FB_APP_SECRET),
      VERIFY_TOKEN: Boolean(VERIFY_TOKEN),
      WHATSAPP_TOKEN: Boolean(WHATSAPP_TOKEN),
    },
    lastWebhookPayload,
    timestamp: new Date().toISOString(),
  });
});

app.get("/health", (_req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: "Not Found" });
});

// Error handler
app.use((err, _req, res, _next) => {
  console.error("[both-ai] unhandled error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

// Start the server locally, but export the app for Vercel serverless.
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Both.AI running on http://localhost:${PORT}`);
  });
}

module.exports = app;
