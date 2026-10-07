# Contact form setup

The React form sends `POST /api/contact`. The Node API sends plain-text email with Nodemailer. A success response means the SMTP server accepted the message, not that inbox delivery is guaranteed. The destination is fixed server-side (`CONTACT_EMAIL`, default `mondalkoushick393@gmail.com`); visitor email is only the `Reply-To` address.

## Local development

1. Use **Node.js 22.9+** (or a newer supported LTS). The start command uses `--env-file-if-exists`.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local` and fill in the SMTP host, port, user, password/app password, and verified plain-address sender. Keep credentials out of source control and never use a `VITE_` prefix for secrets.
4. Run `node --env-file-if-exists=.env.local server/index.mjs` in one terminal.
5. Run `npm run dev` in another. The Vite development proxy routes `/api/contact` to `http://127.0.0.1:8787`. Alternatively serve the built frontend through the same reverse proxy. Visit exactly the origin specified in `PUBLIC_ORIGIN`; update it if you use a different port or hostname.

Use port 587 with `SMTP_SECURE=false` for required STARTTLS; use port 465 with `SMTP_SECURE=true` for implicit TLS. Configure the sender domain and SPF/DKIM with your mail provider. The server returns 503 until required SMTP configuration exists, 502 if sending fails, and never fabricates a successful delivery.

## Production

Build the frontend with `npm run build`. Deploy `dist/` to your web server and run the Node API as a persistent service with runtime secrets supplied by your hosting platform. Reverse proxy `/api/contact` on the **same HTTPS origin** to the API; set `PUBLIC_ORIGIN` to that exact public origin without a trailing slash. Bind with `CONTACT_HOST=0.0.0.0` only if your container/hosting setup needs it. Do not expose SMTP credentials to the frontend. This Node process serves the API only, not the static frontend.

For the GitHub Pages site at `/portfolio/`, use `npm run build:pages`; it sets the Vite base path and keeps the generated asset and resume URLs under `/portfolio/`.

**GitHub Pages and other static-only hosting cannot run this API.** Use a host supporting a Node service and a same-origin API proxy, or deploy an equivalent backend behind your site's origin. Uploading `dist/` alone does not make the contact form deliver email. Vite's development proxy is not a production proxy.

Only matching browser-origin POST requests are accepted; no permissive CORS is enabled. Payloads are capped at 32 KiB, fields have fixed limits, a honeypot rejects automated submissions, and each direct network peer has five attempts per 15 minutes. The limiter holds at most 10,000 peer entries, is per-process, and resets on restart. Forwarded IP headers are deliberately not trusted: behind a proxy all traffic may share its limit. For production scale, enforce real-client rate limits at a trusted reverse proxy/WAF and replace the in-memory limiter with a shared limiter configured for your trusted proxy topology. Origin checks and the honeypot are basic abuse protection, not authentication.

## Verification

Run `node --test tests/contact*.test.mjs` and `npm run build`. Tests use an injected fake SMTP transport and send no real mail. After deployment, submit a real message yourself and check receipt in the configured inbox, spam folders, and provider delivery logs. The application does not log SMTP credentials or message contents.
