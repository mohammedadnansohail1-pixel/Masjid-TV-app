# Masjid Management Platform - Backend API

A comprehensive NestJS-based REST API for managing mosque operations, including prayer times, announcements, devices, donations, and more.

## Features

### Core Functionality
- **Authentication & Authorization**: JWT-based auth with role-based access control (SUPER_ADMIN, MASJID_ADMIN, CONTENT_EDITOR)
- **Multi-tenancy**: Full support for multiple mosques with proper data isolation
- **Prayer Times Management**: Automatic calculation via Aladhan API + manual override support
- **Device Management**: Pairing system for TV displays and kiosks with 6-digit codes
- **Announcements**: Time-scheduled announcements with priority support
- **Media Library**: File upload system with support for images, videos, and PDFs
- **Content Scheduling**: Advanced scheduling system for displaying content on devices
- **Donation Campaigns**: Campaign management with Stripe integration
- **WebSocket Support**: Real-time updates for connected devices

## Tech Stack

- **Framework**: NestJS 10.x
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with Passport
- **Documentation**: Swagger/OpenAPI
- **File Upload**: Multer
- **Payments**: Stripe
- **Real-time**: Socket.io
- **Validation**: class-validator & class-transformer

## Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL 14+
- Redis (optional, for rate limiting)

## Installation

### 1. Clone and Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Configuration

Create a `.env` file in the backend directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/masjid_db?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# Application
PORT=3000
NODE_ENV=development
BASE_URL="http://localhost:3000"

# CORS
CORS_ORIGIN="http://localhost:3001,http://localhost:5173"

# File Upload
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=52428800  # 50MB in bytes

# Stripe (optional - works in stub mode if not provided)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Redis (optional)
REDIS_HOST="localhost"
REDIS_PORT=6379
```

### 3. Database Setup

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# (Optional) Seed database
npm run prisma:seed
```

### 4. Start Development Server

```bash
npm run start:dev
```

The API will be available at:
- **API**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api/docs
- **Health Check**: http://localhost:3000/health

## Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── migrations/          # Database migrations
├── src/
│   ├── announcements/       # Announcements module
│   ├── auth/                # Authentication & authorization
│   │   ├── guards/          # JWT & roles guards
│   │   ├── strategies/      # Passport strategies
│   │   └── dto/             # Login/register DTOs
│   ├── campaigns/           # Donation campaigns
│   ├── common/              # Shared utilities
│   │   ├── decorators/      # Custom decorators (CurrentUser, Public, Roles)
│   │   └── filters/         # Exception filters
│   ├── config/              # Configuration files
│   ├── database/            # Database module & Prisma service
│   ├── devices/             # Device management & pairing
│   ├── donations/           # Donation processing & Stripe
│   ├── masjids/             # Masjid (mosque) management
│   ├── media/               # Media library & file uploads
│   ├── prayer-times/        # Prayer times & Aladhan API
│   ├── schedules/           # Content scheduling
│   ├── websocket/           # WebSocket gateway
│   ├── app.module.ts        # Root module
│   ├── app.controller.ts    # Health check controller
│   └── main.ts              # Application entry point
└── uploads/                 # Uploaded files directory
```

## API Documentation

Once the server is running, visit http://localhost:3000/api/docs for interactive API documentation.

### Key Endpoints

#### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh JWT token

#### Masjids
- `POST /api/masjids` - Create masjid (SUPER_ADMIN only)
- `GET /api/masjids` - List masjids
- `GET /api/masjids/:id` - Get masjid details
- `PUT /api/masjids/:id` - Update masjid
- `DELETE /api/masjids/:id` - Delete masjid (SUPER_ADMIN only)

#### Prayer Times
- `POST /api/prayer-times` - Create manual prayer time
- `POST /api/prayer-times/calculate` - Calculate monthly prayer times via API
- `GET /api/prayer-times/masjid/:masjidId/today` - Get today's prayer times (public)
- `GET /api/prayer-times/masjid/:masjidId/current-month` - Get current month (public)
- `PUT /api/prayer-times/masjid/:masjidId/date/:date` - Update prayer times

#### Devices
- `POST /api/devices` - Create device & generate pairing code
- `POST /api/devices/pair` - Pair device with code (public)
- `GET /api/devices/masjid/:masjidId` - List devices
- `POST /api/devices/:id/unpair` - Unpair device
- `POST /api/devices/heartbeat/:pairingCode` - Device heartbeat (public)

#### Announcements
- `POST /api/announcements` - Create announcement
- `GET /api/announcements/masjid/:masjidId` - List announcements
- `GET /api/announcements/masjid/:masjidId/active` - Get active announcements (public)
- `PUT /api/announcements/:id` - Update announcement
- `DELETE /api/announcements/:id` - Delete announcement

#### Media
- `POST /api/media/upload` - Upload file
- `GET /api/media/masjid/:masjidId` - List media
- `GET /api/media/masjid/:masjidId/stats` - Get storage stats
- `DELETE /api/media/:id` - Delete media

#### Schedules
- `POST /api/schedules` - Create content schedule
- `GET /api/schedules/masjid/:masjidId` - List schedules
- `GET /api/schedules/masjid/:masjidId/active` - Get active content (public)
- `PUT /api/schedules/:id` - Update schedule
- `DELETE /api/schedules/:id` - Delete schedule

#### Campaigns
- `POST /api/campaigns` - Create campaign
- `GET /api/campaigns/masjid/:masjidId` - List campaigns
- `GET /api/campaigns/masjid/:masjidId/active` - Get active campaigns (public)
- `GET /api/campaigns/:id/stats` - Get campaign statistics
- `PUT /api/campaigns/:id` - Update campaign
- `DELETE /api/campaigns/:id` - Delete campaign

#### Donations
- `POST /api/donations` - Create donation (public)
- `GET /api/donations/masjid/:masjidId` - List donations
- `GET /api/donations/masjid/:masjidId/stats` - Get donation statistics
- `POST /api/donations/:id/refund` - Refund donation
- `POST /api/donations/webhook/stripe` - Stripe webhook handler (public)

## Authentication

The API uses JWT bearer tokens for authentication. Most endpoints require authentication.

### Getting a Token

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@masjid.com",
    "password": "securePassword123",
    "firstName": "Admin",
    "lastName": "User"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@masjid.com",
    "password": "securePassword123"
  }'
```

### Using the Token

Include the token in the Authorization header:

```bash
curl http://localhost:3000/api/masjids \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## User Roles

- **SUPER_ADMIN**: Full system access, can manage all masjids
- **MASJID_ADMIN**: Full access to their masjid's data
- **CONTENT_EDITOR**: Can manage content (announcements, media, schedules)

The first registered user automatically becomes a SUPER_ADMIN.

## Multi-Tenancy

The system supports multiple mosques (masjids) with complete data isolation:

- Each user belongs to a specific masjid (except SUPER_ADMIN)
- Users can only access data from their own masjid
- SUPER_ADMIN can access all masjids

## Prayer Times

### Automatic Calculation

Prayer times can be automatically calculated using the Aladhan API:

```bash
POST /api/prayer-times/calculate
{
  "masjidId": "clx123...",
  "year": 2024,
  "month": 1,
  "overwrite": false
}
```

This will calculate and save prayer times for the entire month.

### Manual Entry

Prayer times can also be manually entered or updated:

```bash
POST /api/prayer-times
{
  "masjidId": "clx123...",
  "date": "2024-01-15",
  "fajr": "06:00",
  "sunrise": "07:15",
  "dhuhr": "12:30",
  "asr": "15:45",
  "maghrib": "18:00",
  "isha": "19:30",
  "fajrIqamah": "06:15",
  "dhuhrIqamah": "12:45"
}
```

## Device Pairing

Devices (TV displays, kiosks) use a simple pairing system:

1. **Admin creates device**: A 6-digit pairing code is generated
2. **Device enters code**: Device app calls `/api/devices/pair` with the code
3. **Device connects**: Device can now receive real-time updates via WebSocket

## WebSocket Events

Devices can connect to WebSocket for real-time updates:

### Client Events (Device → Server)
- `device:register` - Register device connection
- `device:heartbeat` - Keep connection alive

### Server Events (Server → Device)
- `content:update` - Content has been updated
- `prayerTime:update` - Prayer times updated
- `announcement:update` - New or updated announcement
- `device:reload` - Request device to reload
- `device:template-change` - Change display template

## File Uploads

Media files can be uploaded via the `/api/media/upload` endpoint:

```bash
curl -X POST http://localhost:3000/api/media/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/image.jpg" \
  -F "masjidId=clx123..."
```

Supported formats:
- **Images**: JPEG, PNG, GIF, WebP
- **Videos**: MP4, WebM, OGG
- **Documents**: PDF

## Stripe Integration

The system includes Stripe integration for donations:

1. **Create donation**: Returns a Stripe client secret
2. **Client completes payment**: Using Stripe.js on frontend
3. **Webhook confirms payment**: Updates donation status

If `STRIPE_SECRET_KEY` is not provided, the system operates in stub mode.

## Database Migrations

```bash
# Create a new migration
npm run prisma:migrate dev --name migration_name

# Apply migrations in production
npm run prisma:migrate:deploy

# Reset database (CAUTION: deletes all data)
npx prisma migrate reset

# Open Prisma Studio (GUI for database)
npm run prisma:studio
```

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Production Deployment

### 1. Build the Application

```bash
npm run build
```

### 2. Set Environment Variables

Ensure all production environment variables are set, especially:
- `DATABASE_URL`
- `JWT_SECRET`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

### 3. Run Migrations

```bash
npm run prisma:migrate:deploy
```

### 4. Start the Server

```bash
npm run start:prod
```

### Docker Deployment

```bash
# Build image
docker build -t masjid-api .

# Run container
docker run -p 3000:3000 --env-file .env masjid-api
```

## Security Best Practices

1. **Change JWT_SECRET**: Use a strong, random secret in production
2. **Use HTTPS**: Always use HTTPS in production
3. **Configure CORS**: Restrict CORS_ORIGIN to your frontend domains
4. **Rate Limiting**: Configured by default (100 requests per 15 minutes)
5. **Helmet**: Security headers enabled by default
6. **Input Validation**: All inputs validated with class-validator
7. **SQL Injection**: Protected by Prisma's query builder

## Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
pg_isready

# Test connection
psql $DATABASE_URL
```

### Prisma Issues

```bash
# Regenerate Prisma Client
npm run prisma:generate

# Reset database and migrations
npx prisma migrate reset
```

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

## API Rate Limits

- **Default**: 100 requests per 15 minutes per IP
- **Webhook endpoints**: No rate limiting
- **Public endpoints**: Same rate limiting applies

## Support

For issues and questions:
- Check API documentation at `/api/docs`
- Review this README
- Check application logs

## License

Proprietary - All rights reserved
