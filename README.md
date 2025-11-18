# Masjid Management Platform

A comprehensive, production-ready SaaS platform for mosque management, featuring prayer time displays, digital signage, and donation management.

## Features

- **Prayer Time Management**: Calculate and manage prayer times for the entire year
- **Digital Signage**: Display content on TVs via web-based player apps (Android TV, Fire TV, Google TV)
- **Content Scheduling**: Create and schedule announcements, images, and websites
- **Donation Management**: Collect donations via online portals, kiosks, and QR codes
- **Multi-tenant**: Support multiple mosques with isolated data
- **Real-time Updates**: WebSocket-based real-time content updates to TV displays
- **Public Widgets**: Embeddable prayer time widgets for mosque websites

## Project Structure

```
masjid-platform/
├── backend/                # NestJS API server
├── admin-dashboard/        # Next.js admin interface
├── tv-player/             # React SPA for TV displays
├── shared/                # Shared TypeScript types
└── docker-compose.yml     # Local development environment
```

## Tech Stack

### Backend
- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL 14+ with Prisma ORM
- **Authentication**: JWT with bcrypt
- **Real-time**: Socket.io
- **Background Jobs**: BullMQ with Redis
- **API Documentation**: Swagger/OpenAPI

### Frontend
- **Admin Dashboard**: Next.js 14 (App Router) with React 18+
- **TV Player**: React 18+ SPA with Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Forms**: React Hook Form with Zod validation
- **State Management**: TanStack Query (React Query)

### External Services
- **Prayer Times**: Aladhan API
- **Payments**: Stripe (integrated)
- **Email**: SendGrid/Resend (stub)
- **SMS**: Twilio (stub)

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- Redis 6+
- Docker and Docker Compose (optional, for easier setup)

### Option 1: Docker Compose (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd masjid-platform

# Start all services
docker-compose up -d

# Run database migrations
cd backend
npm run prisma:migrate

# Access the applications
# - API: http://localhost:3000
# - Admin Dashboard: http://localhost:3001
# - TV Player: http://localhost:3002
# - API Docs: http://localhost:3000/api/docs
```

### Option 2: Manual Setup

#### 1. Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your database credentials

# Run database migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Start the development server
npm run start:dev
```

#### 2. Setup Admin Dashboard

```bash
cd admin-dashboard

# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local

# Start the development server
npm run dev
```

#### 3. Setup TV Player

```bash
cd tv-player

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start the development server
npm run dev
```

## Environment Variables

### Backend (.env)

```env
DATABASE_URL="postgresql://user:password@localhost:5432/masjid_db"
JWT_SECRET="your-secret-key-change-in-production"
JWT_EXPIRES_IN="7d"
PORT=3000

# Redis
REDIS_HOST="localhost"
REDIS_PORT=6379

# Stripe
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""

# AWS S3 (optional)
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
AWS_S3_BUCKET=""
AWS_REGION="us-east-1"

# CORS
CORS_ORIGIN="http://localhost:3001,http://localhost:3002"
```

### Admin Dashboard (.env.local)

```env
NEXT_PUBLIC_API_URL="http://localhost:3000"
NEXT_PUBLIC_WS_URL="ws://localhost:3000"
```

### TV Player (.env)

```env
VITE_API_URL="http://localhost:3000"
VITE_WS_URL="ws://localhost:3000"
```

## API Documentation

Once the backend is running, visit `http://localhost:3000/api/docs` for interactive API documentation (Swagger UI).

## Usage Guide

### 1. Initial Setup

1. Start the backend server
2. Register the first user (automatically becomes Super Admin)
3. Create your first masjid
4. Configure prayer calculation settings

### 2. Prayer Times

- **Auto-calculate**: Use the Aladhan API integration to calculate times for the entire year
- **Manual entry**: Upload CSV or manually enter times
- **Iqamah times**: Set congregation times separately from prayer times

### 3. Device Pairing

1. Open the TV Player app on your display device
2. Note the 6-digit pairing code
3. In the admin dashboard, go to Devices > Add Device
4. Enter the pairing code
5. Configure display template and content rotation settings

### 4. Content Management

- **Announcements**: Create text announcements with optional images
- **Media Library**: Upload images and videos
- **Schedules**: Configure when and how long content should display
- **Templates**: Choose from multiple prayer time display layouts

### 5. Donations

- **Campaigns**: Create fundraising campaigns with goals
- **Payment Methods**: Accept cards, Apple Pay, Google Pay via Stripe
- **Recurring**: Support weekly, monthly, yearly donations
- **Reports**: View donation statistics and export data

## Development

### Database Migrations

```bash
# Create a new migration
npx prisma migrate dev --name migration_name

# Apply migrations in production
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset
```

### Testing

```bash
# Backend unit tests
cd backend
npm run test

# Backend e2e tests
npm run test:e2e

# Frontend tests
cd admin-dashboard
npm run test
```

### Building for Production

```bash
# Backend
cd backend
npm run build
npm run start:prod

# Admin Dashboard
cd admin-dashboard
npm run build
npm run start

# TV Player
cd tv-player
npm run build
npm run preview
```

## Architecture

### Multi-tenancy

All data is isolated by `masjidId`. Users are assigned to a specific masjid and can only access their masjid's data. Super Admins can access all masjids.

### Real-time Updates

WebSocket connections allow:
- Instant content updates to TV displays
- Prayer time changes propagated immediately
- Device status monitoring

### Background Jobs

- **Daily Prayer Calculation**: Pre-calculate next day's times at midnight
- **Content Rotation**: Manage content scheduling and rotation
- **Email Notifications**: Send scheduled emails

### Security

- Password hashing with bcrypt (10 rounds)
- JWT authentication with configurable expiration
- Rate limiting (100 requests/minute per IP)
- CORS configuration
- Input validation on all endpoints
- File upload validation (type, size)

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login
- `POST /auth/refresh` - Refresh token
- `GET /auth/me` - Get current user

### Masjids
- `POST /masjids` - Create masjid
- `GET /masjids` - List masjids
- `GET /masjids/:id` - Get masjid
- `PATCH /masjids/:id` - Update masjid
- `DELETE /masjids/:id` - Delete masjid

### Prayer Times
- `GET /prayer-times/today/:masjidId` - Get today's times
- `GET /prayer-times/month/:masjidId/:year/:month` - Get monthly times
- `POST /prayer-times/calculate` - Calculate times
- `POST /prayer-times/upload` - Bulk upload CSV

### Devices
- `POST /devices` - Register device
- `POST /devices/pair` - Pair device with code
- `GET /devices/:id/playlist` - Get content playlist

### Public API (No authentication required)
- `GET /public/prayer-times/:slug/today` - Public prayer times
- `GET /public/prayer-times/:slug/month/:year/:month` - Public monthly times

[See full API documentation at `/api/docs`]

## Deployment

### Backend Deployment

1. Set production environment variables
2. Run database migrations: `npx prisma migrate deploy`
3. Build: `npm run build`
4. Start: `npm run start:prod`

### Frontend Deployment

Both admin dashboard and TV player can be deployed to:
- Vercel (recommended for Next.js)
- Netlify
- AWS S3 + CloudFront
- Any static hosting service

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Submit a pull request

## License

[Your chosen license]

## Support

For issues and questions, please open a GitHub issue.
