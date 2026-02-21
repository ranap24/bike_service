
---

# 🚲 BikeService – Full Stack Next.js Architecture Context

## 1. Project Overview

BikeService is a full-stack ride-booking web application similar to Uber and Rapido.

This application allows:

* Riders to book bike rides
* Captains to accept and complete rides
* Admins to monitor system activity
* Real-time ride tracking
* Secure payments
* Rating system

The entire system is built using **a single Next.js application** (frontend + backend).

---

# 2. Core Technology Stack

## Framework

* Next.js (App Router)
* TypeScript (strict mode enabled)

## Database

* PostgreSQL
* Prisma ORM

## State & Data

* React Server Components
* Server Actions
* Zustand (client global state)
* React Query (server state)

## Real-Time

* Pusher / Ably (recommended)
  OR
* Custom WebSocket server (if self-hosted)

## Authentication

* NextAuth OR custom JWT implementation

## Payments

* Stripe OR Razorpay

## Maps

* Google Maps API

---

# 3. Full Stack Project Structure

```
/app
  /(public)
    page.tsx

  /(auth)
    /login
    /register

  /(rider)
    /book
    /ride/[id]
    /history

  /(captain)
    /dashboard
    /ride/[id]

  /(admin)
    /dashboard

  /api
    /auth
    /rides
    /captains
    /payments
    /webhooks

/components
/lib
  db.ts
  auth.ts
  socket.ts
/services
/store
/types
/hooks
/utils
/constants
/config
/prisma
  schema.prisma
/middleware.ts
```

---

# 4. Architectural Principles

## Golden Rule

UI → Server Action / API Route → Service Layer → Prisma → Database

Never:

* Access database directly from components
* Expose secrets to client
* Trust client-submitted price or status

---

# 5. Component Architecture Rules

## Server Components (Default)

Use for:

* Data fetching
* Protected pages
* SEO pages
* Initial ride data

## Client Components

Use only when:

* Using React hooks
* Handling forms
* Managing local UI state
* Real-time updates

Always add:

```
"use client"
```

Avoid unnecessary client components.

---

# 6. Backend Inside Next.js

All backend logic lives inside:

```
/app/api/**/route.ts
```

Example structure:

* GET → fetch data
* POST → create
* PATCH → update
* DELETE → remove

Keep route handlers thin.

Route handlers must:

* Validate input
* Call service layer
* Return standardized response

---

# 7. Service Layer Rules

All business logic must live in:

```
/services
```

Examples:

* rideService.ts
* authService.ts
* paymentService.ts
* captainService.ts

Rules:

* No UI logic
* No request/response objects
* Only business logic
* Return typed responses

---

# 8. Naming Conventions

## Files

Components → PascalCase.tsx
Hooks → useSomething.ts
Services → somethingService.ts
Utils → something.util.ts
Types → something.types.ts
Constants → UPPER_SNAKE_CASE

---

## Variables

Boolean → isLoading, hasArrived
Arrays → rides, captains
IDs → rideId, userId

---

## Functions

Use verbs:

* createRide()
* assignCaptain()
* calculateFare()
* completeRide()
* cancelRide()

---

# 9. Prisma Database Standards

Every model must include:

* id (UUID)
* createdAt
* updatedAt

Example structure:

```
id        String   @id @default(uuid())
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
```

---

## Required Models

* User
* Captain
* Ride
* Payment
* Rating

Use enums for:

* RideStatus
* UserRole
* PaymentStatus

Add indexes for:

* userId
* captainId
* rideStatus

Never trust ride status from client.

---

# 10. Ride Lifecycle Flow

1. Rider selects pickup & drop
2. Fare calculated on server
3. Ride created in database
4. Captains notified (real-time)
5. Captain accepts
6. Ride status updated
7. Live location tracking
8. Ride completed
9. Payment processed
10. Rating submitted

All status transitions must be validated server-side.

---

# 11. Authentication Rules

* Short-lived access token
* Refresh token in httpOnly cookie
* Middleware protection
* Role-based access control

Protect routes:

* /rider/*
* /captain/*
* /admin/*

Never store tokens in localStorage (if avoidable).

---

# 12. Middleware Responsibilities

middleware.ts should:

* Check authentication
* Check user role
* Redirect unauthorized users
* Prevent access to restricted dashboards

---

# 13. State Management Rules

## Local State (useState)

Use for:

* Forms
* Modals
* Toggles
* Map interactions

## Global State (Zustand)

Use for:

* Auth session
* Active ride
* Live coordinates

## Server State (React Query)

Use for:

* Ride history
* Admin data
* Captain list
* Analytics

Never duplicate server state in Zustand.

---

# 14. Error Handling Standard

Unified response format:

```
{
  success: boolean,
  data?: any,
  message?: string,
  code?: string
}
```

Rules:

* Use try/catch in services
* Log server errors
* Show toast notifications on frontend
* Handle 401 globally

---

# 15. Security Best Practices

* Validate all inputs using Zod
* Rate limit ride creation
* Prevent double ride requests
* Verify captain availability server-side
* Validate payment webhooks
* Sanitize user inputs
* Use HTTPS only
* Implement CORS policy

Never trust client-calculated fare.

---

# 16. Performance Best Practices

* Use React Suspense
* Dynamic imports for heavy components
* Lazy load maps
* Pagination for history
* Debounce search inputs
* Cache static data
* Use edge runtime when applicable

Avoid large client bundles.

---

# 17. Coding Standards

* Strict TypeScript mode
* No any types
* No business logic inside components
* Max 200 lines per component
* Use absolute imports
* ESLint enforced
* Prettier formatting
* No console.log in production

---

# 18. Environment Variables

Use:

.env.local

Example:

```
DATABASE_URL=
NEXTAUTH_SECRET=
NEXT_PUBLIC_GOOGLE_MAPS_KEY=
STRIPE_SECRET_KEY=
REDIS_URL=
```

Never commit environment files.

---

# 19. Deployment Strategy

Option A (Recommended)

* Deploy to Vercel
* Neon/Supabase for Postgres
* Upstash for Redis

Option B

* Deploy standalone Next build
* Use PM2
* Host on VPS

---

# 20. Scalability Strategy

Even in single app:

* Keep services modular
* Separate ride matching logic
* Abstract payment layer
* Use Redis pub/sub for scaling real-time
* Design for microservice extraction in future

---

# 21. Future Features

* Surge pricing
* Scheduled rides
* Referral program
* Wallet system
* Heat maps
* Multi-city support
* AI ride matching

---

# Final Engineering Philosophy

This is a **single full-stack Next.js application** that:

* Serves frontend UI
* Handles backend APIs
* Manages authentication
* Executes business logic
* Connects to database
* Supports real-time updates

One repository.
One deployment.
Production-ready architecture.

---

End of context.md
