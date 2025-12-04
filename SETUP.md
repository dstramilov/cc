# Customer Central - Development Setup Guide

This guide will help you set up the Customer Central project for local development.

## Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Git**
- A **Supabase account** (you'll need access credentials from the project owner)

## 1. Clone the Repository

```bash
git clone https://github.com/dstramilov/cc.git
cd customer-central
```

## 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js 16
- Supabase client libraries
- UI components (shadcn/ui)
- Database tools (pg for migrations)

## 3. Environment Variables Setup

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://krbrlzgacdxkztkghsvj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[ask project owner]

# Server-side Supabase Key (keep this secret!)
SUPABASE_SERVICE_ROLE_KEY=[ask project owner]

# Database Connection (for running migrations)
DATABASE_URL=postgresql://postgres:[password]@db.krbrlzgacdxkztkghsvj.supabase.co:5432/postgres
```

**Important:** 
- Request the `SUPABASE_SERVICE_ROLE_KEY` and database password from the project owner through a secure channel
- **Never commit** `.env.local` to Git (it's already in `.gitignore`)

## 4. Database Setup

If you need to apply migrations to your local Supabase instance:

```bash
# Apply a specific migration
npx tsx scripts/apply-migration.ts
```

**Note:** The migration script is configured to run the latest migration. Edit `scripts/apply-migration.ts` if you need to run a different migration file.

## 5. Run the Development Server

```bash
npm run dev
```

The application will be available at:
- **Main site:** http://localhost:3000
- **Registration:** http://localhost:3000/register
- **Test tenant:** http://test-reg-success.localhost:3000 (after creating a tenant)

## 6. Understanding Multi-Tenant Architecture

This application uses **subdomain-based multi-tenancy**:

- Each tenant gets their own subdomain (e.g., `acme.localhost:3000`)
- The middleware (`src/middleware.ts`) extracts the subdomain and loads the appropriate tenant
- Tenant context is managed by `TenantProvider` in `src/hooks/use-tenant.tsx`

### Testing Multi-Tenancy Locally

1. Register a new tenant at http://localhost:3000/register
2. You'll be redirected to `http://[your-subdomain].localhost:3000/onboarding`
3. The subdomain routing works automatically in modern browsers

## 7. Project Structure

```
customer-central/
├── src/
│   ├── app/              # Next.js app router pages
│   ├── components/       # React components
│   ├── hooks/           # Custom React hooks (including TenantProvider)
│   ├── lib/             # Utility functions and configurations
│   └── middleware.ts    # Subdomain routing and auth middleware
├── migrations/          # Database migration files
├── scripts/            # Utility scripts (migrations, data checks)
├── public/             # Static assets
└── .env.local          # Environment variables (create this yourself)
```

## 8. Common Tasks

### Running Database Migrations

```bash
npx tsx scripts/apply-migration.ts
```

### Checking Tenant Data

```bash
npx tsx scripts/check-tenants.ts
```

### Verifying RPC Functions

```bash
npx tsx scripts/verify-rpc.ts
```

## 9. Supabase Access (Optional)

Ask the project owner to add you as a team member to the Supabase project:
- Project URL: https://supabase.com/dashboard/project/krbrlzgacdxkztkghsvj
- This gives you access to view/manage the database, auth, and storage

## 10. Troubleshooting

### Issue: "Missing Supabase environment variables"
- Make sure `.env.local` exists and contains all required variables
- Restart the dev server after creating/modifying `.env.local`

### Issue: Subdomain routing not working
- Ensure you're using `http://[subdomain].localhost:3000` format
- Some browsers may have issues with `.localhost` - try Chrome or Edge

### Issue: Database connection errors
- Verify your `DATABASE_URL` is correct
- Check that your IP is allowed in Supabase project settings

### Issue: RLS policy errors (406)
- Make sure all migrations have been applied
- Check that RPC functions exist: `check_subdomain_availability` and `get_tenant_by_subdomain`

## 11. Getting Help

- Check the `walkthrough.md` artifact for recent changes and fixes
- Review `task.md` for current development tasks
- Contact the project owner for Supabase credentials and access

## 12. Contributing

1. Create a new branch for your feature: `git checkout -b feature/your-feature-name`
2. Make your changes
3. Test thoroughly (especially multi-tenant functionality)
4. Commit with descriptive messages
5. Push and create a pull request

---

**Security Reminder:** Never commit sensitive credentials. Always use environment variables for API keys and database passwords.
