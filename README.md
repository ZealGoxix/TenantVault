# 🔒 TenantVault

**Secure Move-Out Evidence Chain Platform**

> A neutral, tamper-evident platform that creates a court-admissible evidence record for rental property inspections — eliminating he-said/she-said disputes over security deposits.

**Stack:** Next.js 14 · Supabase · Tailwind CSS · Vercel · Resend · @react-pdf/renderer

Live Demo: https://tenant-vault.vercel.app/

---

## Features

- 🏠 **Inspection cases** — landlord creates a case per property, shares invite link with tenant
- 📸 **Secure photo upload** — direct-to-Supabase Storage, private bucket, signed URLs with 1hr TTL
- 🔒 **Immutable evidence** — no UPDATE/DELETE endpoints or RLS policies on evidence
- 📋 **Tamper-evident audit log** — INSERT-only table, every action timestamped
- 📄 **PDF export** — court-ready report with all photos, captions, and full audit log
- 🛡️ **PostgreSQL RLS** — cross-tenant data isolation even with valid JWT

---

## Local Development

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) account (free)
- A [Resend](https://resend.com) account (free)

### 1. Clone & install

```bash
git clone https://github.com/YOUR_USERNAME/tenantvault.git
cd tenantvault
npm install
```

### 2. Set up Supabase

1. Go to [supabase.com](https://supabase.com) → New project
2. Note your **Project URL** and **anon key** from Settings → API
3. Open the **SQL Editor** and run the entire contents of:
   ```
   supabase/migrations/001_init.sql
   ```
   This creates all 4 tables, RLS policies, the storage bucket, and the auto-profile trigger.

### 3. Configure environment

```bash
cp .env.example .env.local
```

Fill in `.env.local` with your Supabase URL, anon key, service role key, Resend API key, and `http://localhost:3000` as the app URL.

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deployment to Vercel (Free)

### Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "Initial TenantVault build"
gh repo create tenantvault --public --push
# OR: create repo on github.com and push manually
```

### Step 2 — Import to Vercel

1. Go to [vercel.com](https://vercel.com) → Add New Project
2. Import your GitHub repo
3. Framework preset: **Next.js** (auto-detected)
4. Click **Deploy** (will fail — env vars needed first)

### Step 3 — Add environment variables

In Vercel dashboard → Your project → Settings → Environment Variables, add:

| Variable | Value | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` | From Supabase Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` | From Supabase Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` | ⚠️ Server-only — mark as secret |
| `RESEND_API_KEY` | `re_...` | From resend.com |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` | Your Vercel URL |

### Step 4 — Configure Supabase Auth redirect URLs

In Supabase dashboard → Authentication → URL Configuration:

- **Site URL:** `https://your-app.vercel.app`
- **Redirect URLs:** `https://your-app.vercel.app/auth/callback`

### Step 5 — Redeploy

In Vercel → Deployments → click the three-dot menu → Redeploy.

### Step 6 — Test end-to-end

1. Register as a landlord
2. Create an inspection case
3. Copy the invite link
4. Open in a private/incognito window
5. Register as a tenant using the invite link
6. Upload photos from both sides
7. Export the PDF

---

## Security Architecture

### Row Level Security (RLS)

Every table has RLS enabled. The policies enforce:

- **cases:** only landlord or tenant of that specific case can read it
- **evidence:** same — parties of the case only; no UPDATE/DELETE policy exists
- **audit_logs:** INSERT-only — no UPDATE or DELETE policy at any privilege level
- **profiles:** users can only read/update their own profile

Even if an attacker obtains a valid JWT, the database engine rejects queries to other users' data.

### Storage Security

- Bucket is **private** — no public URLs exist
- All photo access uses `createSignedUrl()` with a **1-hour TTL**
- Upload paths include `user_id` to prevent path traversal: `inspections/{case_id}/{user_id}/{uuid}.ext`
- MIME type is enforced by the bucket's `allowed_mime_types` setting

### API Security

- Next.js middleware validates Supabase JWT on every protected route
- Service role key is used only server-side for audit log writes
- No raw SQL — all queries use the Supabase JS client (parameterized)
- File size enforced by Supabase Storage bucket config (10MB)

---

## Project Structure

```
tenantvault/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── layout.tsx                  # Root layout with fonts
│   ├── globals.css                 # Tailwind + custom components
│   ├── auth/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── callback/route.ts       # OAuth/email confirmation handler
│   │   └── signout/route.ts
│   ├── dashboard/page.tsx          # Landlord case list
│   ├── cases/
│   │   ├── new/page.tsx            # Case creation form
│   │   └── [id]/page.tsx           # Case detail — galleries, upload, audit log
│   ├── invite/
│   │   └── [token]/page.tsx        # Tenant invite acceptance
│   └── api/
│       ├── invite/[token]/route.ts # Links tenant to case
│       └── pdf/[caseId]/route.ts   # PDF generation endpoint
├── components/
│   ├── EvidenceUploader.tsx        # Drag-and-drop upload with captions
│   ├── EvidenceGallery.tsx         # Photo grid with signed URLs
│   ├── AuditTimeline.tsx           # Audit log display
│   ├── InviteLinkBox.tsx           # Copy-to-clipboard invite link
│   ├── TenantJoinForm.tsx          # Tenant register/login on invite page
│   ├── CaseActions.tsx             # Close case button (landlord only)
│   └── EvidenceReport.tsx          # @react-pdf/renderer PDF document
├── lib/
│   └── supabase/
│       ├── client.ts               # Browser Supabase client
│       └── server.ts               # Server + service role clients
├── types/index.ts                  # TypeScript types for all tables
├── middleware.ts                   # JWT validation on protected routes
└── supabase/
    └── migrations/
        └── 001_init.sql            # All tables, RLS, storage bucket
```

---

## Total Cost: $0/month

| Service | Free Tier |
|---|---|
| Vercel | Hobby — unlimited deployments |
| Supabase | 500MB DB, 1GB storage, 50MB file uploads |
| Resend | 3,000 emails/month |

---

## Interview Talking Points

**Q: What is Row Level Security?**
RLS enforces access at the PostgreSQL engine level — not just the application layer. A stolen JWT still can't read another tenant's data because the database itself rejects the query.

**Q: Why signed URLs instead of public storage?**
Public URLs are permanent and guessable. Signed URLs expire after 1 hour and must be freshly generated by an authenticated server request — leaked URLs become useless quickly.

**Q: How is the audit log tamper-evident?**
The `audit_logs` table has no UPDATE or DELETE RLS policy — at any privilege level in the app. Entries are append-only by design, making the log reliable as legal evidence.

**Q: How do you handle file upload security?**
Three layers: declared MIME type check, Supabase bucket `allowed_mime_types` enforcement, and a hard 10MB limit configured at the storage bucket level — not just the client.
