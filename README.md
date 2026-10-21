# 🧠 Knowledge & Opportunity Hub | هاب دانش و فرصت‌ها

> A production-grade, personal AI-powered knowledge aggregator, daily news digest, and scored job radar. Built as a mobile-first PWA (iOS "Add to Home Screen" optimized) with a high-performance FastAPI backend.

---

## 🏛 Architecture Diagram

```text
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │                         PERSONAL INGESTION SOURCES                          │
 │                                                                             │
 │  [ Telegram Private Bot ]      [ Daily News RSS Feeds ]      [ Job Radar ]   │
 │   - Text & Web Links            - Hacker News                 - RemoteOK    │
 │   - Photos with Captions        - ArXiv AI Papers             - WeWorkRemote│
 │   - Forwarded Posts             - TechCrunch                  - Jobinja     │
 │                                                                             │
 │                 [ Inbound Email Webhook (Scheduled Agent Tasks) ]           │
 └──────────────┬──────────────────────────────┬──────────────────────┬────────┘
                │                              │                      │
                ▼                              ▼                      ▼
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │                         FASTAPI BACKEND SERVICE                             │
 │                                                                             │
 │   • Webhook Gatekeeper: Secret tokens + TELEGRAM_OWNER_ID verification      │
 │   • Deduplication Engine: SHA-256 fingerprinting on message_id / URL hashes │
 │   • Text Extraction: trafilatura clean body parser with HTTP timeouts       │
 │   • AI Layer: Gemini 2.5 Flash via AIProvider interface (strict JSON schema)│
 │     - Content Enrichment: title, summary, tags[], category, language        │
 │     - Job Match Scoring: 0-100 score + match rationale vs candidate profile │
 │   • APScheduler: Cron jobs (Daily News Digest 07:30, Job Radar 08:00)       │
 │   • Web Push Service: pywebpush (VAPID) grouped alerts                      │
 └──────────────────────────────────────┬──────────────────────────────────────┘
                                        │
                                        ▼ SQLite / PostgreSQL
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │                        DATABASE & CACHING LAYER                             │
 │   • Items (telegram | news | job | email)                                   │
 │   • JobMeta (match_score 0-100, status: new/saved/applied/interview)        │
 │   • Sources (RSS & API endpoints with enable/disable toggles)               │
 │   • User Profile & Settings (skills, salary target, keywords, schedules)    │
 └──────────────────────────────────────┬──────────────────────────────────────┘
                                        │ REST API (Bearer Token)
                                        ▼
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │                     MOBILE-FIRST PWA FRONTEND (React 19)                    │
 │                                                                             │
 │   📱 Designed for iPhone 15 Viewport (100dvh, pb-safe, touch target >=44px) │
 │   🌐 Persian (Farsi) Vazirmatn font by default + English toggle (dir="auto")│
 │   🌓 Dark Mode (#0B0B0F) & Light Mode with Indigo-Violet Gradient Accents    │
 │   ⚡ 5 Frosted Glass Tabs:                                                  │
 │      1. Inbox (Unified feed, pull-to-refresh, swipe to favorite/archive)    │
 │      2. Jobs Radar (Circular match ring, status pipeline, AI reason modal)   │
 │      3. Search (Instant live search, AI tag cloud, category chips)          │
 │      4. Saved (Favorites & Archive manager)                                 │
 │      5. Settings (Profile skills editor, source CRUD, scheduler, API token) │
 │   📦 Offline Support: Service worker cache (Stale-While-Revalidate)         │
 │   🔔 iOS Safari Web Push: Standalone detection + 1-tap permission opt-in     │
 └─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start (Development & Live Preview)

### Option A: Frontend Standalone (AI Studio Live Preview)
The application includes a typed `MockApiClient` seeded with **~40 realistic Persian and English items** (Telegram notes with links, news summaries, job matches with scores and reasons, tags, categories).

All actions work immediately in local memory & `localStorage`:
- Swiping items to favorite or archive
- Editing tags, job pipeline status switcher
- Testing push notifications
- Filtering by categories, tag cloud, and score ranges

```bash
# Run the Vite dev server
npm run dev
# Open http://localhost:3000
```

### Option B: Full-Stack with FastAPI Backend

```bash
# 1. Start the Backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env

# Edit .env with your keys (GEMINI_API_KEY, TELEGRAM_BOT_TOKEN, etc.)
uvicorn main:app --reload --port 8000

# 2. In Frontend:
# Set VITE_API_URL in .env or via Settings tab in the app:
# API URL: http://localhost:8000
# Token: hub_usr_sec_99384721
```

---

## 🛠 Manual Setup Checklist

### 1. Telegram Bot Setup (BotFather)
1. Open Telegram and message [@BotFather](https://t.me/botfather).
2. Send `/newbot`, name your bot (e.g., `MyKnowledgeHubBot`), and choose a username.
3. Copy the HTTP API token provided by BotFather (e.g., `123456789:ABCdefGHI...`).
4. Find your numeric Telegram User ID using [@userinfobot](https://t.me/userinfobot) (e.g. `987654321`).
5. Choose a random secret string for webhook verification (e.g. `MySuperSecretToken_849204`).
6. Set the webhook URL on your public server:
```bash
curl -X POST "https://api.telegram.org/bot<YOUR_TELEGRAM_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-domain.com/webhooks/telegram",
    "secret_token": "MySuperSecretToken_849204",
    "allowed_updates": ["message", "channel_post", "edited_message"]
  }'
```
7. Verify webhook status anytime:
```bash
curl "https://api.telegram.org/bot<YOUR_TELEGRAM_BOT_TOKEN>/getWebhookInfo"
```

---

### 2. VAPID Key Generation for Web Push
To generate your own VAPID key pair:
```bash
npx web-push generate-vapid-keys
```
Copy the output into `/backend/.env`:
```env
VAPID_PUBLIC_KEY="BEl62iUY..."
VAPID_PRIVATE_KEY="your-private-key"
VAPID_CLAIMS_EMAIL="mailto:your-email@example.com"
```

---

### 3. Inbound Email Setup (Gemini / Claude Scheduled Tasks)

#### Via Mailgun / SendGrid Inbound Parse:
1. In your Mailgun dashboard, navigate to **Sending > Inbound Routes**.
2. Create a route matching `tasks@your-domain.com`.
3. Set action: **Forward to URL**: `https://your-domain.com/webhooks/email?token=email_secret_token_123`.

#### Via Cloudflare Email Worker (Free & Zero-Server):
```javascript
export default {
  async email(message, env, ctx) {
    const raw = await message.raw();
    const payload = {
      subject: message.headers.get("subject"),
      from: message.from,
      body: await new Response(message.raw).text(),
      message_id: message.headers.get("message-id"),
    };
    await fetch("https://your-domain.com/webhooks/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Secret": env.EMAIL_WEBHOOK_SECRET,
      },
      body: JSON.stringify(payload),
    });
  }
};
```

---

### 4. Production Deployment with Docker & Caddy (VPS)

#### `/etc/caddy/Caddyfile`:
```caddy
hub.yourdomain.com {
    # Backend API & Webhooks
    handle /api/* {
        reverse_proxy localhost:8000
    }
    handle /webhooks/* {
        reverse_proxy localhost:8000
    }
    handle /healthz {
        reverse_proxy localhost:8000
    }

    # Frontend PWA Static Build
    handle {
        root * /var/www/hub/dist
        try_files {path} /index.html
        file_server
    }
}
```

#### Run with Docker Compose:
```bash
cd backend
docker compose up -d --build
```

---

## 📱 iOS Safari Web Push Troubleshooting

1. **Must be installed on Home Screen**: iOS Safari **only** supports the W3C Push API for web applications launched from the home screen (`display-mode: standalone`). Web pages open inside a regular Safari tab cannot receive background push notifications.
2. **User Gesture Required**: Notification permission (`Notification.requestPermission()`) must be triggered by an explicit tap on the "Enable Web Push" button.
3. **iOS Settings**: If you accidentally denied permission, go to iPhone **Settings > Notifications > Hub** (or **Settings > Safari > Advanced**) and ensure notifications are toggled ON.
4. **HTTPS Required**: Web Push and Service Workers require HTTPS with a valid SSL certificate (provided automatically by Caddy/Cloudflare).
