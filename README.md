# MY NSDA — NSDA Doctors Directory Web Application

A complete, production-ready, responsive medical doctors directory and social networking platform built for **MY NSDA (National Society for Doctors Association)**.

Designed with precision matching the MY NSDA design language, featuring the signature **Red (#E3060B)** splash loader, **Teal (#008F8F)** actions, rounded cards, 5-item mobile bottom navigation, role-based dashboards, and a complete PostgreSQL Supabase backend.

---

## 🎨 Color Palette System

* **Primary Red:** `#E3060B`
* **Teal:** `#008F8F`
* **Dark Teal:** `#007C7C`
* **White:** `#FFFFFF`
* **Background:** `#F7F9FC`
* **Border:** `#E0E6EF`
* **Text:** `#111827`
* **Secondary Text:** `#94A3B8`
* **Soft Red Background:** `#FFF0F0`
* **Soft Teal Background:** `#EFFAFA`
* **Online/Active Status:** `#10B981` (Green reserved strictly for active status)

---

## 🚀 Key Features

1. **Initial Red Splash Screen**:
   - Fullscreen `#E3060B` red viewport.
   - White rounded `N` logo with "MY NSDA", "NSDA DOCTORS DIRECTORY", and tagline *"Stay Connected Professionally & Socially"*.
   - Animated 3-dot pulse loader and automatic smooth transition.

2. **Public Home Page**:
   - Red circular `N` logo header with notification bell and drawer menu.
   - Teal hero banner with directory headline.
   - Search bar with filter toggle.
   - Horizontally scrollable specialty category chips (Orthopaedic, Surgeon, Physician, Cardiologist, etc.).
   - Quick action cards (*Register as Doctor*, *Share App QR*).
   - Featured verified doctors section with real-time cards.

3. **Doctors Directory & Advanced Search**:
   - Live search by doctor name, specialty, hospital, or city.
   - Filter by specialty, city location, and verified doctor status.
   - Multi-mode sorting (Featured, Name A-Z, Name Z-A, Experience, Recently registered).
   - Dynamic counter badge showing matched doctors.
   - Responsive doctor cards with Call (`tel:`), Direct Chat dialog, QR Profile Sharing, and Profile Reporting.

4. **Doctor Profile Page**:
   - Detailed clinical background, degrees, certifications, and SMC/NMC registration number.
   - Hospital and consulting clinic chambers.
   - Consultation fee and available timings.
   - Doctor contact privacy controls: personal phone and email can be hidden or revealed.

5. **Doctor Portal & Registration**:
   - Multi-step registration capturing degrees, specialty, registration number, bio, and profile photo.
   - Automatic `pending` verification status.
   - Doctor dashboard with completion meter, verification status banner, profile editor, and contact visibility toggles.

6. **Admin Dashboard (Moderation & Verification)**:
   - Real-time overview metrics: Total doctors, verified, pending review, active today.
   - Credential verification queue: one-click approve or reject with custom administrative reason.
   - Profile moderation and user reports handling.
   - Medical specialties and city directory management.

7. **Super Admin Dashboard (Full Platform Control)**:
   - Platform Administrator management: create staff admin accounts, toggle/suspend access.
   - Live CMS for public content: About NSDA, Terms & Ethics, Help & Support contact info.
   - Security Audit Trail logs tracking all approvals, rejections, and role changes.
   - System-wide broadcast announcement notifications.

8. **Mobile 5-Item Bottom Navigation**:
   - Fixed bottom bar on mobile screens with iOS safe-area support: **Home**, **Doctors**, **Search**, **Profile**, **More**.
   - Active tab with red pill styling (`#FFF0F0` + `#E3060B`).
   - Seamless top navigation for desktop and tablet screens.

9. **More Page**:
   - Red hero banner matching the uploaded screenshots.
   - Functional menu options: Share App (QR), Register as Doctor, Doctor Login, About NSDA, Interactive 5-Star App Rating modal, Terms & Privacy, Help & Support, Security, Share Directory, and Staff Login.

---

## 🛠️ Tech Stack

* **Frontend:** React 19, Vite, Tailwind CSS 3.4, React Router 7, Lucide React Icons
* **QR & Sharing:** `qrcode.react`, Web Share API
* **Backend:** Supabase PostgreSQL Database, Supabase Auth, Row Level Security (RLS), Supabase Storage

---

## 💻 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Local Development Server
```bash
npm run dev
```

> **Note on Offline / Demo Mode:**
> The app is pre-configured with a dual-mode data layer. If Supabase keys are not set, it operates with rich persistent local data and a quick demo role switcher (Doctor, Admin, Super Admin) in the login page and drawer, allowing immediate testing without any setup!

---

## 🗄️ Supabase Backend Setup

To connect to your live Supabase project:

### 1. Create a Supabase Project
Go to [supabase.com](https://supabase.com) and create a new project.

### 2. Run Database Schema
1. Open your Supabase Project Dashboard.
2. Navigate to **SQL Editor** in the left sidebar.
3. Paste and run the entire contents of [`supabase/schema.sql`](supabase/schema.sql).
   This creates:
   - `profiles`
   - `doctor_profiles`
   - `specialties`
   - `cities`
   - `doctor_documents`
   - `notifications`
   - `reports`
   - `audit_logs`
   - `app_settings`
   - Indexes, triggers, RLS policies, and Storage buckets (`avatars`, `doctor_documents`).

### 3. Run Seed Data
In the Supabase SQL Editor, paste and run [`supabase/seed.sql`](supabase/seed.sql) to seed default specialties, cities, and public app content.

### 4. Configure Environment Variables
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 5. Creating the Initial Super Admin
1. Register a new user in the app at `/register` or through the Supabase Dashboard under **Authentication > Users**.
2. In the Supabase SQL Editor, promote the user to Super Admin by running:
```sql
UPDATE public.profiles
SET role = 'super_admin'
WHERE email = 'your-admin-email@domain.com';
```

---

## 🧪 Testing Roles & Accounts

For instant testing in demo mode, use the **Quick Testing Demo Login** buttons on the `/login` screen or in the slide-out menu drawer:

* **Doctor Role:** Tests profile editing, pending/verified status banners, and privacy toggles.
* **Admin Role:** Tests doctor verification approval/rejection, reports, and specialty/city management.
* **Super Admin Role:** Tests admin management, CMS content editing, broadcast alerts, and audit logs.

---

## 📦 Production Build

```bash
npm run build
npm run preview
```
The compiled static assets will be output in the `dist/` directory, ready to be deployed to Vercel, Netlify, or AWS Amplify.
