// Jednorázové získání GOOGLE_REFRESH_TOKEN pro čtení kalendáře.
// Spusť lokálně:
//   GOOGLE_CLIENT_ID=... GOOGLE_CLIENT_SECRET=... node scripts/google-auth.mjs
// (na Windows PowerShell:
//   $env:GOOGLE_CLIENT_ID="..."; $env:GOOGLE_CLIENT_SECRET="..."; node scripts/google-auth.mjs )
//
// Otevře přihlášení Google, po odsouhlasení vypíše refresh token, který pak
// vložíš do GitHub secrets jako GOOGLE_REFRESH_TOKEN. Token je citlivý — nikam
// ho nevkládej do repa ani neposílej v chatu.

import http from "node:http";

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("Chybí GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET v env. Nastav je a spusť znovu.");
  process.exit(1);
}

const PORT = 53682;
const REDIRECT_URI = `http://localhost:${PORT}`;
const SCOPE = "https://www.googleapis.com/auth/calendar.readonly";

const authUrl =
  "https://accounts.google.com/o/oauth2/v2/auth?" +
  new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: SCOPE,
    access_type: "offline",
    prompt: "consent", // vynutí vrácení refresh_token
  }).toString();

console.log("\n1) Otevři tuto adresu v prohlížeči a přihlas se účtem, který má přístup ke kalendáři:\n");
console.log(authUrl);
console.log("\n2) Po odsouhlasení se vrať sem — token se vypíše níže.\n");

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, REDIRECT_URI);
  const code = url.searchParams.get("code");
  if (!code) {
    res.writeHead(400).end("Chybí code.");
    return;
  }
  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });
    const data = await tokenRes.json();
    res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" }).end("Hotovo. Vrať se do terminálu.");
    if (data.refresh_token) {
      console.log("\n✅ GOOGLE_REFRESH_TOKEN (vlož do GitHub secrets):\n");
      console.log(data.refresh_token);
      console.log("\nTajné — nikam to necommituj ani neposílej.\n");
    } else {
      console.error("\n⚠️ Refresh token nepřišel. Odeber přístup aplikace v https://myaccount.google.com/permissions a zkus znovu.\n", data);
    }
  } catch (err) {
    console.error("Chyba při výměně tokenu:", err);
  } finally {
    server.close();
  }
});

server.listen(PORT);
