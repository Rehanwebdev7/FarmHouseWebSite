# Boss Farmhouse Sanctuary

A premium, luxury booking management system and booking portal for Dhule's first completely private farmhouse estate, **Boss Farmhouse**. 

This application provides a highly polished client website for visitors to learn about amenities, verify pool hygiene levels, select booking slots, and check availability. It also features a lead administrator console to manage bookings, configure slots, handle cancellations, and monitor customers.

---

## Project Purpose & Scope

The application streamlines booking operations for **Boss Farmhouse Sanctuary**, ensuring:
* **Absolute Privacy**: Preventing overlapping bookings by utilizing a strict session slot management system.
* **Premium Client Experience**: A high-end visual showcase of the estate (lawns, lounge, pool) for VIP guests.
* **Seamless Operations**: Staff and administrators can easily manage booking entries, record manual bookings, update payments, check guest counts, and process checkout operations.

---

## Roles Implemented

1. **Lead Administrator (Super Admin / Admin)**
   * Access to the admin dashboard panels (`/admin`).
   * View live expected vs. received revenue, outstanding balances, active sessions, and booking counts.
   * Manage slots (Pricing, base capacity, extra member charges, advance deposit requirements).
   * Perform administrative actions (Manual booking wizard, payment collection, guest checkouts, booking cancellations with reason logging).
2. **Customer (VIP Guest)**
   * Access to the premium, responsive public landing page (`/`).
   * Learn about estate guidelines, safety highlights, pool chlorination / pH levels, and location.
   * Book session slots dynamically.

---

## Database & Collections (Zustand Local Storage Store)

Currently, the project functions as a highly optimized React Single Page Application (SPA). To support full data persistence without a database server setup, a client-side database is modeled via a persistent Zustand store (`boss_farmhouse_bookings_db` in browser's local storage). 

The collections and schemas are defined in [bookingStore.ts](file:///d:/PHP%20PROJECTS/BOSS%20FARMHOUSE/src/app/bookingStore.ts):

### 1. `slots`
Stores the session configuration definitions. Default configurations:
* **Morning Sunrise Session** (06:00 AM - 12:00 PM) — Base Price: ₹3,000, Capacity: 10
* **Afternoon Pool Session** (12:00 PM - 06:00 PM) — Base Price: ₹3,000, Capacity: 10
* **Sunset Oasis Lounge Session** (06:00 PM - 12:00 AM) — Base Price: ₹4,000, Capacity: 10
* **Obsidian Night Swim Session** (12:00 AM - 06:00 AM) — Base Price: ₹4,500, Capacity: 10

### 2. `bookings`
Tracks active, completed, and cancelled reservations:
* `id`: Unique booking reference key.
* `date`: Target reservation date (`YYYY-MM-DD`).
* `slotId`: Reference to the selected session slot.
* `customerName` & `customerPhone`: Contact identifiers.
* `membersCount`: Total number of attending guests.
* `totalAmount` & `advanceAmount` & `remainingAmount`: Billing breakdown.
* `paymentStatus`: `"advance_paid"` or `"fully_paid"`.
* `bookingStatus`: `"confirmed"`, `"completed"`, or `"cancelled"`.
* `cancellationReason`: Optional string logged during cancellation.

### 3. `customers`
Stores registered guest directories:
* `name`: Customer full name.
* `phone`: Unique contact mobile number.

### 4. `notifications`
Supports FCM push simulation for real-time foreground updates (e.g. notifications on new bookings or cancellations).

---

## Tech Stack & Setup

* **Framework**: React 18, TypeScript, Vite
* **Routing**: React Router DOM (v7)
* **State Management**: Zustand (with localStorage persistence)
* **Styling**: Tailwind CSS & Vanilla CSS
* **Icons**: Lucide React
* **Micro-Animations**: Framer Motion

### Running the Project Locally

1. **Install dependencies**:
   ```bash
   npm install
   ```
2. **Start the Development Server**:
   ```bash
   npm run dev
   ```
3. **Build the production bundle**:
   ```bash
   npm run build
   ```

*The default login credentials for testing the Lead Admin Console are:*
* **Email**: `admin@bossfarmhouse.com`
* **Access Code**: `admin123`
