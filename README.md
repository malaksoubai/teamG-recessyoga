# Recess Yoga Studio — Substitute Request App

A web application for managing substitute teaching requests at Recess Yoga Studio. Instructors can post and claim substitute requests, and admins can approve class type changes.

**Live app:** https://recess-yoga-sub-request.vercel.app

---

## Tech Stack

- **Framework:** Next.js 16 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS, shadcn/ui
- **API layer:** tRPC v11
- **Database ORM:** Drizzle ORM
- **Backend/Auth/DB:** Supabase (PostgreSQL)
- **Email notifications:** Resend
- **Hosting:** Vercel

---

## Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) v18 or higher
- [npm](https://www.npmjs.com/) (comes with Node.js)
- A [Supabase](https://supabase.com/) project
- A [Resend](https://resend.com/) account (for email notifications)

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/hyacinp/teamG-recessyoga.git
cd teamG-recessyoga
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root of the project with the following variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=supabase_anon_key
DATABASE_URL=your_supabase_database_connection_string

# App
NEXT_PUBLIC_APP_URL=https://recess-yoga-sub-request.vercel.app

# Resend (email notifications)
RESEND_API_KEY= ...
RESEND_FROM_EMAIL=verified_sender_email
```


### 4. Set up the database

Run the Drizzle schema push to create all tables in your Supabase database:

```bash
npx drizzle-kit push
```

Then run the seed migrations in Supabase's SQL editor (in order):

1. `supabase/migrations/001_rls_policies.sql` — sets up row-level security policies
2. `supabase/migrations/002_seed_class_types.sql` — seeds the initial class types

### 5. Configure Supabase Auth redirect URLs

In your Supabase dashboard, go to **Authentication → URL Configuration** and set:

- **Site URL:** `http://localhost:3000`
- **Redirect URLs:** `http://localhost:3000/auth/callback`

### 6. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the local development server |
| `npm run build` | Build the app for production |
| `npm run start` | Start the production build locally |
| `npm run lint` | Run ESLint |
| `npm run db:push` | Push the Drizzle schema to the database |
| `npm run db:generate` | Generate Drizzle migration files |
| `npm run db:studio` | Open Drizzle Studio to browse the database |

---

## Deployment (Vercel)

The app is deployed on Vercel. To deploy your own instance:

1. Push the repo to GitHub
2. Import the project in [Vercel](https://vercel.com/)
3. Add all environment variables from `.env` in **Vercel → Settings → Environment Variables**, setting `NEXT_PUBLIC_APP_URL` to your production URL
4. Update Supabase Auth redirect URLs to include your production domain

---

## Project Structure

```
app/
  db/           # Drizzle schema
  server/       # tRPC routers and context
  notifications/# Email notification templates
  api/trpc/     # tRPC HTTP handler
  (pages)/      # Next.js App Router pages
components/     # React components
hooks/          # Custom React hooks
lib/            # Supabase client, tRPC client, utilities
supabase/
  migrations/   # SQL seed files
drizzle/        # Generated Drizzle migration files
```
