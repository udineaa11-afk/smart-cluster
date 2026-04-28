# Smart Cluster

Platform manajemen klaster perumahan cerdas untuk komunitas RT/RW di Indonesia.

## Fitur

- **Berita & Pengumuman** — Informasi publik dan privat untuk warga
- **Peta Interaktif** — Map builder dengan custom polygon untuk blok, fasilitas, taman, dll.
- **Autentikasi** — Login role-based (admin, warga, security)
- **Dashboard** — Panel admin dengan statistik klaster
- **Keamanan Gerbang** — Pencatatan pengunjung masuk/keluar
- **Registrasi Kucing** — Peta kucing terdaftar di lingkungan klaster
- **Feature Flags** — Fitur dinamis per klaster (multi-tenant)
- **Hierarki RT/RW** — Struktur organisasi klaster
- **Super Admin Panel** — Dashboard SaaS untuk app owner (billing, subscription, tenant management)
- **Subscription Plans** — Paket langganan (Gratis, Dasar, Premium, Enterprise)

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Database:** SQLite (via Prisma ORM)
- **Maps:** Leaflet + React-Leaflet
- **Icons:** Lucide React

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Installation

```bash
npm install
```

### Database Setup

```bash
npx prisma migrate dev
```

### Seed Data (Optional)

```bash
npx tsx prisma/seed.ts
```

Test accounts after seeding:

| Role        | Email                    | Password    | URL           |
| ----------- | ------------------------ | ----------- | ------------- |
| Super Admin | super@smartcluster.id    | super123    | /admin/login  |
| Admin       | admin@smartcluster.id    | admin123    | /login        |
| Warga       | siti@smartcluster.id     | warga123    | /login        |
| Security    | security@smartcluster.id | security123 | /login        |

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/
│   ├── api/           # API routes (auth, news, map, gate, cats, feature-flags)
│   ├── dashboard/     # Protected dashboard pages
│   │   ├── news/      # News management
│   │   ├── map/       # Map builder
│   │   ├── gate/      # Security gate log
│   │   ├── cats/      # Cat registry
│   │   ├── feature-flags/
│   │   └── settings/  # Cluster settings
│   ├── login/         # Login page
│   ├── register/      # Registration page
│   └── peta/          # Public map page
├── components/
│   ├── layout/        # Navbar, Sidebar
│   ├── map/           # MapView component
│   └── ui/            # Button, Input, Card, Badge
├── lib/
│   ├── auth.ts        # Authentication utilities
│   ├── db.ts          # Prisma client
│   ├── feature-flags.ts
│   └── utils.ts       # Helper functions
└── generated/         # Prisma generated client
```

## Multi-Tenant Architecture

Each cluster has its own isolated data:
- Users belong to a cluster, and optionally to an RW and RT
- News, map blocks, gate entries, and cats are scoped to a cluster
- Feature flags can be toggled independently per cluster

## SaaS Architecture

Smart Cluster is a two-sided SaaS platform:

### App Owner (Super Admin)
- Manage all clusters/tenants from `/admin`
- Create subscription plans with usage limits
- View billing, revenue, and usage statistics
- Onboard new clusters with their admin accounts

### Cluster Manager (Admin)
- Manage their own cluster from `/dashboard`
- Toggle feature flags for their cluster
- Manage news, maps, gate security, and more

## Roles

| Role          | Access                                     |
| ------------- | ------------------------------------------ |
| `super_admin` | SaaS owner — manage all tenants, billing   |
| `admin`       | Full cluster access, manage settings       |
| `rw_admin`    | Manage RW-level data, news, map            |
| `rt_admin`    | Manage RT-level data, news, map            |
| `warga`       | View news, map, register cats              |
| `security`    | Gate management, visitor logging           |
| Guest         | Public news and map only (no login needed) |
