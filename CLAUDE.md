# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SpendTracker is a mobile-first Personal Finance PWA for tracking income, expenses, and savings. Built with Next.js 16 (App Router), Supabase for backend/auth, and shadcn/ui components.

## Commands

```bash
npm run dev        # Start dev server (Turbopack, PWA disabled)
npm run build      # Production build with Webpack
npm run lint       # Run ESLint
npm start          # Serve production build
```

## Architecture

### Tech Stack
- **Next.js 16** with App Router and React 19
- **Supabase** for auth (email/password) and PostgreSQL database
- **shadcn/ui** (new-york style) with Tailwind CSS v4
- **next-pwa** for PWA capabilities (disabled in dev)

### Directory Structure
```
src/
├── app/                    # Next.js pages and routes
│   ├── page.tsx           # Main app (client component, tab-based UI)
│   ├── login/page.tsx     # Auth page (server component)
│   └── auth/              # OAuth callback, password reset
├── components/            # React components
│   ├── *-tab.tsx         # Tab content components
│   └── ui/               # shadcn/ui primitives
├── lib/
│   └── supabase/         # Client, server, and middleware setup
└── types/index.ts        # TypeScript types and category definitions
```

### Data Flow
- Main `page.tsx` fetches all user data (transactions, presets) and manages state
- Tab components receive data as props and callback functions for mutations
- Optimistic updates with rollback on error for transactions
- Supabase middleware refreshes auth session on every request

### Database Tables
- `st_transactions` - User transactions (income, expenses, savings)
- `st_presets` - Quick-add templates for recurring transactions

### Authentication
- Supabase email/password auth with JWT sessions
- Protected routes redirect to `/login` if unauthenticated
- Public routes: `/login`, `/auth/*`

## Key Patterns

### Category System
12 core categories defined in `src/types/index.ts` with emoji identifiers and subcategories. Categories are typed as union literals for type safety.

### Transaction Types
- **Income**: Added to monthly total
- **Expense**: Has "fundedFrom" field (income/savings/emergency)
- **Savings**: Tracked cumulatively (all-time total)

### Styling Conventions
- Semantic colors: Income (green), Expenses (orange), Savings (blue)
- Dark mode only (hardcoded)
- OKLch color model in globals.css
- Mobile-first layout (max-width container)

### Component Conventions
- Server components for pages that need SSR auth checks
- Client components (`"use client"`) for interactive UI
- shadcn/ui components in `src/components/ui/`

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```
