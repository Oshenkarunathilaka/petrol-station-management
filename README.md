# Petrol Station Management System (PSMS)

A professional petrol station operations dashboard built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## Features

- **Dashboard**: Real-time overview of station operations with KPI cards, charts, and recent transactions
- **Fuel Management**: Manage fuel types, prices, and inventory
- **Storage Tanks**: Monitor tank levels and capacity
- **Pumps & Nozzles**: Track pump status and nozzle assignments
- **Meter Readings**: Record and track meter readings
- **Transactions**: Complete transaction history and reporting
- **Deliveries**: Track fuel deliveries and invoices
- **Shifts**: Manage staff shifts and assignments
- **Maintenance**: Log and track maintenance activities
- **Incidents**: Report and monitor station incidents
- **Reports**: Generate and export comprehensive reports
- **Settings**: Configure system preferences and user management

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS 4 with shadcn/ui components
- **Database**: Supabase PostgreSQL with Row Level Security
- **Authentication**: Supabase Auth (to be configured)
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React
- **PDF Export**: jsPDF + AutoTable
- **Forms**: React Hook Form with Zod validation
- **State Management**: React Context + Server Components

## Prerequisites

- Node.js 18.18 or later
- npm or similar package manager
- A Supabase project (for database and auth)

## Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/petrol-station-management.git
   cd petrol-station-management
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
├── supabase/                 # Supabase database migrations and seed scripts
│   ├── migrations/           # Sequential SQL migrations (001_initial, 002_rls, ...)
│   └── seeds/                # Initial and mock seed data
├── public/                   # Static web assets
├── src/
│   ├── app/                  # Next.js App Router (pages, layouts, server actions)
│   │   ├── dashboard/        # Operations & management routes
│   │   ├── login/            # Authentication route
│   │   ├── layout.tsx        # Root application layout
│   │   └── page.tsx          # Root landing & navigation
│   ├── components/           # Feature-driven React UI components
│   │   ├── audit/            # Audit trail viewer & dialogs
│   │   ├── auth/             # Role guards & auth components
│   │   ├── daily-entry/      # Daily station entry components
│   │   ├── dashboard/        # Metric cards & operational charts
│   │   ├── deliveries/       # Fuel delivery forms & status actions
│   │   ├── employees/        # Staff management tables & forms
│   │   ├── expenses/         # Station expense tracking
│   │   ├── fuel/             # Fuel pricing & type managers
│   │   ├── incidents/        # Incident reporting & workflows
│   │   ├── inventory/        # Inventory item tracking & stock movements
│   │   ├── layout/           # Application sidebar & top header
│   │   ├── maintenance/      # Equipment maintenance logs & badges
│   │   ├── profile/          # User profile & account security
│   │   ├── pumps/            # Pump meter readings & nozzle configs
│   │   ├── reports/          # Report filtering & PDF export viewer
│   │   ├── shifts/           # Shift scheduling & assignments
│   │   ├── stock/            # Tank stock reconciliation & history
│   │   ├── suppliers/        # Supplier dialogs & management
│   │   ├── tanks/            # Tank calibration & dip reading forms
│   │   ├── transactions/     # Fuel sales transactions & receipts
│   │   └── ui/               # shadcn/ui reusable design primitives
│   ├── config/               # Route permissions and RBAC configuration
│   ├── hooks/                # Custom React hooks (useToast, useMobile)
│   ├── lib/                  # Business logic, audit logging, & Supabase clients
│   │   └── supabase/         # Supabase browser, server & middleware clients
│   └── types/                # Domain TypeScript types & barrel export
```

## Development

### Running the Dev Server
```bash
npm run dev
```

### Building for Production
```bash
npm run build
npm start
```

### Linting
```bash
npm run lint
```

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key for client-side |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) |
| `NEXT_PUBLIC_APP_URL` | Your application's base URL |

## License

This project is part of the Petrol Station Management System suite.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Database and Auth by [Supabase](https://supabase.com/)

