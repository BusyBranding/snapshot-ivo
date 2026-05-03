# Snapshot — SEO Dashboard
### by Busy Branding

A live SEO dashboard for your clients, powered by SE Ranking + Google Search Console.

---

## Quick Setup (15 minutes)

### Step 1 — Push to GitHub
1. Create a new GitHub repository (e.g. `snapshot-ivo`)
2. Upload all files in this folder
3. Make the repository **public**

### Step 2 — Deploy to Netlify
1. Go to [netlify.com](https://netlify.com) and sign up free
2. Click **"Add new site" → "Import an existing project"**
3. Connect your GitHub repo
4. Build settings will auto-detect from `netlify.toml`
5. Click **Deploy site**

### Step 3 — Add your API keys (Environment Variables)
In Netlify: **Site settings → Environment variables → Add variable**

#### SE Ranking
```
Key:   SERANKING_API_KEY
Value: your_key_here
```
Get your key: SE Ranking → Account → API Keys

#### Google Search Console
```
Key:   GOOGLE_SERVICE_ACCOUNT_JSON
Value: (paste the entire JSON content of your service account key file)
```

**To create a Google Service Account:**
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project (or use existing)
3. Enable the **Google Search Console API**
4. Create a **Service Account** → Create key → JSON
5. Copy the email address of the service account
6. In Search Console → Add user → paste the service account email (give it "Restricted" access)

### Step 4 — Add SE Ranking Site ID
In `public/index.html`, find this line:
```js
serankingSiteId: 'YOUR_SERANKING_SITE_ID',
```
Replace with your project's site ID from SE Ranking.
(SE Ranking → Projects → click your project → the ID is in the URL)

### Step 5 — Redeploy
Trigger a new deploy in Netlify. The dashboard will now show live data.

---

## For a new client
1. Duplicate the repository
2. Update `CONFIG` in `public/index.html`:
   - `clientName`, `clientUrl`, `gscSiteUrl`, `serankingSiteId`, `keywords`
3. Push to GitHub → auto-deploys

---

## What's live vs demo

| Data | Source | Status |
|------|--------|--------|
| Keyword rankings | SE Ranking API | ✅ Live (with API key) |
| Clicks / Impressions | Google Search Console | ✅ Live (with service account) |
| Top pages | Google Search Console | ✅ Live (with service account) |
| GBP calls/views | Google Business Profile API | ⚠️ Demo (GBP API requires OAuth — coming in v2) |

---

## Support
Built by Busy Branding. Questions? You know where to find us.
