# Journal App

Next.js + Supabase + tRPC + Prisma

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create `.env`:

```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT-REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Get these values from your Supabase project settings.

### 3. Setup Database

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 4. Run Dev Server

```bash
npm run dev
```

Open <http://localhost:3000>

## Common Commands

```bash
npm run dev              # Start dev server
npx prisma generate      # Generate Prisma client
npx prisma migrate dev   # Run migrations
npx prisma studio        # View database
```

## Supabase Setup

1. Create project at [supabase.com](https://supabase.com)
2. Go to **Authentication** → **Providers** → **Email**
3. Disable "Enable email confirmations"
4. Get your keys from **Project Settings** → **API**
