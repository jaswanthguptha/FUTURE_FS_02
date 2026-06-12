# LeadFlow CRM

> A full-stack Lead Management System built with React, TypeScript, and Supabase — designed to capture, track, and convert leads efficiently.

🔗 **Live Demo:** [https://future-interns-task-02-crm.vercel.app/](https://future-interns-task-02-crm.vercel.app/)

---

## 📸 Screenshots

### 1. Admin Login
![Admin Login](./screenshot_login.png)
> Secure admin login page with email & password authentication via Supabase Auth. Purple gradient background with a clean centered card layout.

---

### 2. Lead Capture Form (Public)
![Lead Form](./screenshot_lead_form.png)
> Public-facing inquiry form — no login required. Captures name, email, phone, company, lead source, and requirements. Submits directly to the Supabase `leads` table.

---

### 3. Admin Dashboard
![Dashboard](./screenshot_dashboard.png)
> Overview of all lead metrics: Total Leads, New Leads, Contacted, Converted, and Conversion Rate. Includes a Leads by Status breakdown and a Recent Leads panel.

---

### 4. Analytics Page
![Analytics](./screenshot_analytics.png)
> Visual analytics with a donut chart for Leads by Source and a bar chart for Leads by Status. Powered by Recharts.

---

## 🚀 Features

- **Public Lead Form** — Anyone can submit an inquiry without logging in
- **Admin Authentication** — Secure login/signup using Supabase Auth
- **Dashboard Overview** — Real-time stats: total leads, conversion rate, active leads
- **Lead Management** — View, update status, add notes, and schedule follow-ups
- **Lead Detail Page** — Full lead profile with status history, notes, and follow-up tracker
- **Analytics** — Leads by source (donut chart) and leads by status (bar chart)
- **Protected Routes** — Admin-only pages guarded by authentication context
- **Row Level Security** — Supabase RLS policies ensure data safety

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript |
| Routing | React Router DOM v7 |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Icons | Lucide React |
| Backend / DB | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Build Tool | Vite |
| Deployment | Vercel |

---

## 📁 Project Structure

```
FUTURE_FS_02-main/
├── src/
│   ├── components/
│   │   ├── DashboardLayout.tsx     # Sidebar + nav layout
│   │   ├── ProtectedRoute.tsx      # Auth guard component
│   │   └── ErrorBoundary.tsx       # Error handling wrapper
│   ├── context/
│   │   └── AuthContext.tsx         # Global auth state
│   ├── lib/
│   │   └── supabase.ts             # Supabase client init
│   ├── pages/
│   │   ├── HomePage.tsx            # Public lead capture form
│   │   ├── LoginPage.tsx           # Admin login
│   │   ├── SignupPage.tsx          # Admin signup
│   │   ├── DashboardPage.tsx       # Main dashboard
│   │   ├── LeadsPage.tsx           # Leads list & management
│   │   ├── LeadDetailsPage.tsx     # Single lead detail view
│   │   └── AnalyticsPage.tsx       # Charts & metrics
│   ├── types/
│   │   └── index.ts                # TypeScript types
│   ├── App.tsx                     # Root routes
│   └── main.tsx                    # Entry point
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql  # Full DB schema
├── index.html
├── vite.config.ts
├── tailwind.config.js
└── package.json
```

---

## 🗄️ Database Schema

The following tables are created in Supabase:

### `leads`
| Column | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| full_name | TEXT | Lead's full name |
| email | TEXT | Email address |
| phone | TEXT | Phone number (optional) |
| company_name | TEXT | Company (optional) |
| lead_source | TEXT | Website / Referral / LinkedIn / Facebook / Instagram / Other |
| requirement_message | TEXT | Project details (optional) |
| status | TEXT | New → Contacted → Qualified → Proposal Sent → Converted → Closed |
| created_at | TIMESTAMPTZ | Auto timestamp |
| updated_at | TIMESTAMPTZ | Auto-updated on change |

### `notes`
Stores admin notes per lead (linked via `lead_id`).

### `followups`
Tracks scheduled follow-ups with date, description, and completion status.

### `status_history`
Automatically logs every status change via a PostgreSQL trigger.

---

## ⚙️ Local Setup

### Prerequisites
- Node.js 18+
- A Supabase project

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/your-username/FUTURE_FS_02.git
cd FUTURE_FS_02-main

# 2. Install dependencies
npm install

# 3. Create environment file
# Create a .env file in the root:
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# 4. Run the Supabase migration
# Go to your Supabase project → SQL Editor
# Paste and run: supabase/migrations/001_initial_schema.sql

# 5. Start the dev server
npm run dev
```

App will run at `http://localhost:5173`

---

## 🔐 Environment Variables

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous/public key |

> Get these from your Supabase project → Settings → API

---

## 📦 Available Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build locally
npm run lint       # Run ESLint
npm run typecheck  # TypeScript type checking
```

---

## 🚢 Deployment (Vercel)

1. Push your code to GitHub
2. Import the repo on [vercel.com](https://vercel.com)
3. Add the two environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) in Vercel project settings
4. Deploy — Vercel auto-detects Vite and builds correctly

---

## 👤 Author

**T. Jaswanth Guptha**
B.Tech — Artificial Intelligence & Data Science
Vignan's Institute of Information Technology, Visakhapatnam

---

## 📄 License

This project was built as part of the **Future Interns Full-Stack Internship Task 02**.
