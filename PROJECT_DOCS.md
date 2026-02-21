# BusConnect — Project Documentation

## Table of Contents
- [Technologies Used](#technologies-used)
- [Database Schema](#database-schema)
- [Application Flow](#application-flow)

---

## Technologies Used

### Core Framework & Language
| Technology | Version | Purpose |
|---|---|---|
| Next.js | ^16.1.6 | Full-stack React framework (App Router) |
| React | ^19.0.0 | UI library |
| TypeScript | ^5 | Type-safe JavaScript |

### Database
| Technology | Version | Purpose |
|---|---|---|
| Neon (PostgreSQL) | ^1.0.2 | Serverless Postgres database (`@neondatabase/serverless`) |

### Authentication & Security
| Technology | Version | Purpose |
|---|---|---|
| jose | ^5.2.3 | JWT signing & verification (HS256, 7-day expiry) |
| bcryptjs | ^2.4.3 | Password hashing |
| cookies-next | ^4.1.1 | Cookie management for HTTP-only auth tokens |
| jsonwebtoken | ^9.0.2 | Additional JWT utilities |

### Styling & UI
| Technology | Version | Purpose |
|---|---|---|
| Tailwind CSS | ^3.4.1 | Utility-first CSS framework |
| lucide-react | ^0.468.0 | Icon library |
| clsx | ^2.1.0 | Conditional class name utility |
| tailwind-merge | ^2.2.1 | Merge Tailwind classes without conflicts |
| react-hot-toast | ^2.4.1 | Toast notifications |

### Utilities
| Technology | Version | Purpose |
|---|---|---|
| date-fns | ^3.3.1 | Date formatting and manipulation |
| dotenv | ^17.3.1 | Environment variable loading |

### Dev Tools
| Technology | Purpose |
|---|---|
| ESLint + eslint-config-next | Code linting |
| PostCSS + Autoprefixer | CSS processing |

---

## Database Schema

### Entity Relationship Overview

```
users ──< bookings >── schedules ──< routes
                           │
                         buses >── routes
                           
routes ──< stops
```

---

### Table: `users`
| Column | Type | Constraints | Description |
|---|---|---|---|
| id | SERIAL | PRIMARY KEY | Auto-increment user ID |
| name | TEXT | NOT NULL | Full name |
| email | TEXT | UNIQUE, NOT NULL | Login email |
| password_hash | TEXT | NOT NULL | bcrypt hashed password |
| phone | TEXT | | Contact number |
| role | TEXT | NOT NULL, DEFAULT 'passenger' | `passenger` or `admin` |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Record creation time |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update time |

---

### Table: `routes`
| Column | Type | Constraints | Description |
|---|---|---|---|
| id | SERIAL | PRIMARY KEY | Auto-increment route ID |
| route_number | TEXT | UNIQUE, NOT NULL | e.g., `IND-101` |
| origin | TEXT | NOT NULL | Departure city |
| destination | TEXT | NOT NULL | Arrival city |
| distance_km | NUMERIC | NOT NULL | Total distance |
| duration_minutes | INTEGER | NOT NULL | Estimated travel time |
| base_fare | NUMERIC | NOT NULL | Starting ticket price (₹) |
| status | TEXT | DEFAULT 'active' | `active` or `inactive` |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Record creation time |

---

### Table: `buses`
| Column | Type | Constraints | Description |
|---|---|---|---|
| id | SERIAL | PRIMARY KEY | Auto-increment bus ID |
| bus_number | TEXT | UNIQUE, NOT NULL | Vehicle registration (e.g., `MH-01-AB-1234`) |
| route_id | INTEGER | FK → routes(id) | Assigned route |
| capacity | INTEGER | NOT NULL | Total seat count |
| bus_type | TEXT | NOT NULL, DEFAULT 'standard' | `standard`, `luxury`, `express`, or `sleeper` |
| amenities | TEXT | | Comma-separated list (e.g., AC, WiFi) |
| status | TEXT | DEFAULT 'active' | `active`, `inactive`, or `maintenance` |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Record creation time |

---

### Table: `schedules`
| Column | Type | Constraints | Description |
|---|---|---|---|
| id | SERIAL | PRIMARY KEY | Auto-increment schedule ID |
| bus_id | INTEGER | NOT NULL, FK → buses(id) | Assigned bus |
| route_id | INTEGER | NOT NULL, FK → routes(id) | Assigned route |
| departure_time | TEXT | NOT NULL | e.g., `06:00` |
| arrival_time | TEXT | NOT NULL | e.g., `09:30` |
| travel_date | DATE | NOT NULL | Date of travel |
| available_seats | INTEGER | NOT NULL | Remaining bookable seats |
| price | NUMERIC | NOT NULL | Ticket price for this schedule (₹) |
| status | TEXT | DEFAULT 'scheduled' | `scheduled`, `departed`, `arrived`, or `cancelled` |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Record creation time |

---

### Table: `bookings`
| Column | Type | Constraints | Description |
|---|---|---|---|
| id | SERIAL | PRIMARY KEY | Auto-increment booking ID |
| user_id | INTEGER | NOT NULL, FK → users(id) | Booking owner |
| schedule_id | INTEGER | NOT NULL, FK → schedules(id) | Booked schedule |
| booking_reference | TEXT | UNIQUE, NOT NULL | Unique reference code |
| passenger_name | TEXT | NOT NULL | Traveller name |
| passenger_email | TEXT | NOT NULL | Traveller email |
| passenger_phone | TEXT | NOT NULL | Traveller phone |
| seat_number | TEXT | NOT NULL | Assigned seat |
| total_fare | NUMERIC | NOT NULL | Final amount paid (₹) |
| status | TEXT | DEFAULT 'confirmed' | `confirmed`, `cancelled`, or `completed` |
| payment_status | TEXT | DEFAULT 'paid' | `paid`, `pending`, or `refunded` |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Booking timestamp |

---

### Table: `stops`
| Column | Type | Constraints | Description |
|---|---|---|---|
| id | SERIAL | PRIMARY KEY | Auto-increment stop ID |
| route_id | INTEGER | NOT NULL, FK → routes(id) | Parent route |
| stop_name | TEXT | NOT NULL | Intermediate stop name |
| stop_order | INTEGER | NOT NULL | Stop sequence number |
| arrival_offset_minutes | INTEGER | DEFAULT 0 | Minutes offset from departure |

---

## Application Flow

### 1. Authentication Flow

```
User visits /login or /register
        │
        ▼
POST /api/auth/register  ──►  Hash password (bcrypt)  ──►  INSERT into users
POST /api/auth/login     ──►  Verify password          ──►  Sign JWT (HS256, 7d)
                                                             │
                                                             ▼
                                              Set HTTP-only cookie: auth_token
                                                             │
                                                             ▼
                                              Redirect to home / dashboard
```

- Token is stored as an HTTP-only cookie (`auth_token`).
- All protected API routes call `getSession()` from `src/lib/auth.ts`, which reads and verifies the cookie.
- Logout hits `POST /api/auth/logout`, which clears the cookie.

---

### 2. Schedule Search Flow

```
User fills SearchForm (origin, destination, date)
        │
        ▼
GET /api/schedules/search?from=&to=&date=
        │
        ▼
Query schedules JOIN routes JOIN buses
        │
        ▼
Return list of Schedule objects
        │
        ▼
/search page renders BusCard components
```

---

### 3. Booking Flow

```
User selects a schedule  ──►  /book/[scheduleId]
        │
        ▼
GET /api/schedules/[scheduleId]  ──►  Load schedule + booked seats
        │
        ▼
User fills passenger details + selects seat
        │
        ▼
POST /api/bookings
  ├── Verify auth session
  ├── Check seat availability
  ├── Generate booking_reference
  ├── INSERT into bookings
  └── Decrement available_seats in schedules
        │
        ▼
Redirect to /booking-confirmation/[reference]
```

---

### 4. My Bookings Flow

```
User visits /my-bookings  ──►  ProtectedRoute checks session
        │
        ▼
GET /api/bookings/my-bookings  ──►  Query bookings WHERE user_id = session.userId
        │
        ▼
Display list of bookings with status

User clicks Cancel
        │
        ▼
PATCH /api/bookings/[bookingId]/cancel
  ├── Verify ownership
  ├── UPDATE booking status = 'cancelled'
  └── Restore available_seats in schedules
```

---

### 5. Admin Flow

```
User with role = 'admin' visits /admin
        │
        ▼
Middleware / API checks role from JWT payload
        │
        ▼
GET /api/admin/stats   ──►  Aggregate counts (users, bookings, revenue)
GET /api/admin/users   ──►  Full user list
```

---

### 6. Profile Update Flow

```
User visits /profile  ──►  GET /api/auth/me  ──►  Return current session user
        │
        ▼
User edits name / phone
        │
        ▼
PATCH /api/profile  ──►  UPDATE users SET name, phone WHERE id = session.userId
```

---

## Seed Data Summary

| Entity | Count |
|---|---|
| Users | 3 (1 admin, 2 passengers) |
| Routes | 15 (major Indian city pairs) |
| Buses | 27 (standard, luxury, express, sleeper) |
| Schedules | ~180+ (generated for next 7 days across all routes) |

### Demo Credentials
| Role | Email | Password |
|---|---|---|
| Admin | admin@busservice.com | admin123 |
| Passenger | rahul@example.com | password123 |
| Passenger | priya@example.com | password123 |
