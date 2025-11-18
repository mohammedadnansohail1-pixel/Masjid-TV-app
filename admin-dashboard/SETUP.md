# Admin Dashboard Setup Guide

## Quick Start

Follow these steps to get the admin dashboard up and running:

### 1. Install Dependencies

```bash
cd /home/user/Masjid-TV-app/admin-dashboard
npm install
```

This will install all required packages including:
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- shadcn/ui components
- React Query
- React Hook Form
- Zod validation
- Axios

### 2. Environment Configuration

The `.env.local` file has been created with default values:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_APP_NAME=Masjid Admin Dashboard
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

**Important**: Make sure your backend API is running on `http://localhost:3000` before starting the dashboard.

### 3. Start Development Server

```bash
npm run dev
```

The dashboard will be available at: **http://localhost:3001**

### 4. First Time Access

1. Navigate to `http://localhost:3001`
2. You'll be redirected to the login page
3. Click **Register** to create your first account
4. The first user automatically becomes a **Super Admin**
5. After registration, you'll be logged in and redirected to the dashboard

## Project Structure

```
admin-dashboard/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication pages
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/              # Dashboard pages
│   │   ├── dashboard/
│   │   │   ├── page.tsx          # Dashboard home
│   │   │   ├── masjids/          # Masjid management
│   │   │   ├── prayer-times/     # Prayer times
│   │   │   ├── devices/          # Device management
│   │   │   ├── announcements/    # Announcements
│   │   │   ├── schedules/        # Content schedules
│   │   │   └── donations/        # Donation campaigns
│   │   └── layout.tsx
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   └── providers.tsx
├── components/
│   ├── ui/                       # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── table.tsx
│   │   ├── dialog.tsx
│   │   ├── select.tsx
│   │   └── ... (more)
│   ├── Sidebar.tsx
│   ├── TopBar.tsx
│   └── LoadingSpinner.tsx
├── hooks/                        # Custom React hooks
│   ├── useAuth.ts
│   ├── useMasjids.ts
│   ├── usePrayerTimes.ts
│   ├── useDevices.ts
│   ├── useAnnouncements.ts
│   ├── useDonations.ts
│   └── use-toast.ts
├── lib/                          # Utilities
│   ├── api-client.ts            # Axios instance
│   ├── auth.ts                  # Auth service
│   └── utils.ts                 # Helper functions
├── types/
│   └── index.ts                 # TypeScript types
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.mjs
├── .env.local
└── README.md
```

## File Count

- **58 total files** created
- **21 page components** (routes)
- **14 UI components** (shadcn/ui)
- **7 custom hooks** (data fetching)
- **3 layout files** (auth, dashboard, root)
- **Configuration files** (TypeScript, Tailwind, Next.js, ESLint)

## Features Included

### ✅ Authentication
- Login page with email/password
- Registration page
- Auto-redirect for unauthenticated users
- Token-based authentication
- Logout functionality

### ✅ Masjid Management
- List all masjids with search
- Create new masjid
- Edit masjid details
- Delete masjid with confirmation

### ✅ Prayer Times
- View prayer times by month and masjid
- Auto-calculate prayer times
- CSV bulk upload
- Filter by masjid and month

### ✅ Device Management
- List all devices with pairing codes
- Register new devices
- View device status (paired/unpaired)
- Edit device settings
- Delete devices

### ✅ Announcements
- Create announcements with images
- Priority levels (low, medium, high)
- Active/inactive status
- Date range selection
- List and filter announcements

### ✅ Content Schedules
- Schedule management page
- Ready for schedule creation

### ✅ Donations & Campaigns
- Create fundraising campaigns
- View campaign progress with visual bars
- Campaign details page
- Donation history
- Goal tracking

### ✅ UI/UX Features
- Responsive design (mobile, tablet, desktop)
- Collapsible sidebar navigation
- Loading states
- Error handling with toast notifications
- Form validation with inline errors
- Confirmation dialogs for destructive actions
- Search and filter functionality
- Clean, modern design with green theme

## Tech Stack Summary

| Category | Technology |
|----------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui (Radix UI) |
| Forms | React Hook Form |
| Validation | Zod |
| Data Fetching | TanStack React Query |
| HTTP Client | Axios |
| Icons | Lucide React |

## Next Steps

After running `npm install` and `npm run dev`:

1. **Create your admin account** by registering
2. **Add your first masjid** from the Masjids page
3. **Calculate prayer times** for your masjid
4. **Register devices** to display content
5. **Create announcements** for your community
6. **Launch donation campaigns** for fundraising

## Production Build

When ready for production:

```bash
npm run build
npm start
```

This will:
- Create an optimized production build
- Start the server on port 3001
- Enable all Next.js performance optimizations

## Customization

### Change Theme Colors

Edit `app/globals.css` to change the color scheme:

```css
:root {
  --primary: 142 76% 36%;  /* Main green color */
  --secondary: 210 40% 96.1%;
  /* ... other colors */
}
```

### Add New Features

1. Create page in `app/(dashboard)/dashboard/[feature]/page.tsx`
2. Add navigation link in `components/Sidebar.tsx`
3. Create data hook in `hooks/use[Feature].ts`
4. Define types in `types/index.ts`

## Support

For detailed documentation, see [README.md](./README.md)

For issues or questions:
- Check the browser console for errors
- Verify backend API is running
- Check environment variables
- Review API endpoint responses

## License

MIT License
