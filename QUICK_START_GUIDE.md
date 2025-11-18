# Masjid Management Platform - Quick Start Guide

## Backend Setup (5 Minutes)

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Setup Environment
```bash
cp .env.example .env
# Edit .env and set your DATABASE_URL and JWT_SECRET
```

### 3. Setup Database
```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate
```

### 4. Start Development Server
```bash
npm run start:dev
```

Server will run on: http://localhost:3000
API Docs: http://localhost:3000/api/docs

## First Steps After Starting

### 1. Register First User (Auto-becomes SUPER_ADMIN)
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@masjid.com",
    "password": "SecurePassword123!",
    "firstName": "Admin",
    "lastName": "User"
  }'
```

### 2. Create Your First Masjid
```bash
# Use the token from registration
curl -X POST http://localhost:3000/api/masjids \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Masjid Al-Rahman",
    "slug": "masjid-al-rahman",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "timezone": "America/New_York"
  }'
```

### 3. Calculate Prayer Times
```bash
curl -X POST http://localhost:3000/api/prayer-times/calculate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "masjidId": "YOUR_MASJID_ID",
    "year": 2024,
    "month": 1
  }'
```

### 4. Create a Device
```bash
curl -X POST http://localhost:3000/api/devices \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Main Hall TV",
    "masjidId": "YOUR_MASJID_ID",
    "type": "TV"
  }'
```

## Key API Endpoints

### Authentication
- POST `/api/auth/register` - Register user
- POST `/api/auth/login` - Login
- GET `/api/auth/me` - Get current user

### Masjids
- POST `/api/masjids` - Create masjid
- GET `/api/masjids` - List masjids
- GET `/api/masjids/:id` - Get masjid

### Prayer Times
- POST `/api/prayer-times/calculate` - Calculate monthly
- GET `/api/prayer-times/masjid/:id/today` - Today's times
- GET `/api/prayer-times/masjid/:id/current-month` - Current month

### Devices
- POST `/api/devices` - Create device
- POST `/api/devices/pair` - Pair device
- GET `/api/devices/masjid/:id` - List devices

### Announcements
- POST `/api/announcements` - Create
- GET `/api/announcements/masjid/:id/active` - Active announcements

### Media
- POST `/api/media/upload` - Upload file
- GET `/api/media/masjid/:id` - List media

### Campaigns
- POST `/api/campaigns` - Create campaign
- GET `/api/campaigns/masjid/:id/active` - Active campaigns

### Donations
- POST `/api/donations` - Create donation
- GET `/api/donations/masjid/:id/stats` - Statistics

## Module Overview

✅ **Prayer Times** - Aladhan API integration, manual override
✅ **Devices** - 6-digit pairing, heartbeat monitoring
✅ **Announcements** - Time-scheduled, priority-based
✅ **Media** - File uploads (images, videos, PDFs)
✅ **Schedules** - Content scheduling system
✅ **Campaigns** - Donation campaign management
✅ **Donations** - Stripe integration, refunds
✅ **WebSocket** - Real-time updates for devices
✅ **Auth** - JWT, role-based access
✅ **Masjids** - Multi-tenant mosque management

## File Structure

```
backend/src/
├── announcements/       # Announcements module
├── auth/               # Authentication
├── campaigns/          # Donation campaigns
├── common/             # Shared utilities
├── devices/            # Device management
├── donations/          # Donation processing
├── masjids/            # Masjid management
├── media/              # File uploads
├── prayer-times/       # Prayer times + Aladhan API
├── schedules/          # Content scheduling
├── websocket/          # Real-time updates
├── app.module.ts       # Root module
└── main.ts             # Entry point
```

## Testing the API

Visit http://localhost:3000/api/docs for interactive Swagger documentation.

## Production Deployment Checklist

- [ ] Set strong JWT_SECRET
- [ ] Configure DATABASE_URL for production
- [ ] Set CORS_ORIGIN to your frontend domain
- [ ] Configure Stripe keys for payments
- [ ] Set up file storage (local or S3)
- [ ] Enable HTTPS
- [ ] Configure rate limiting
- [ ] Set up monitoring
- [ ] Configure backups
- [ ] Run `npm run build`
- [ ] Run `npm run prisma:migrate:deploy`
- [ ] Start with `npm run start:prod`

## Support

- **API Documentation**: http://localhost:3000/api/docs
- **Backend README**: /backend/README.md
- **Implementation Summary**: /BACKEND_IMPLEMENTATION_SUMMARY.md

## Common Issues

**Database Connection Error**
- Check PostgreSQL is running
- Verify DATABASE_URL in .env

**JWT Error**
- Ensure JWT_SECRET is set in .env
- Token may be expired, login again

**Port 3000 Already in Use**
- Change PORT in .env
- Or kill process: `lsof -i :3000` then `kill -9 PID`

