# Masjid Admin Dashboard

A modern, production-ready admin dashboard for the Masjid Management Platform built with Next.js 14, TypeScript, Tailwind CSS, and shadcn/ui.

## Features

### Authentication
- **Login Page** - Email/password authentication with validation
- **Register Page** - User registration (first user becomes super admin)
- **Protected Routes** - Automatic redirect for unauthenticated users
- **Role-based Access** - Different permissions for different user roles

### Dashboard Layout
- **Responsive Sidebar** - Collapsible navigation with active link highlighting
- **Top Bar** - User profile dropdown with logout functionality
- **Clean UI** - Modern design with green theme for masjid context

### Masjid Management
- **List View** - Search and filter all masjids
- **Create Masjid** - Add new masjid with location and prayer settings
- **Edit Masjid** - Update masjid information
- **Delete Masjid** - Remove masjids with confirmation dialog

### Prayer Times Management
- **Calendar View** - View prayer times by month and masjid
- **Auto-Calculate** - Generate prayer times based on location and calculation method
- **CSV Upload** - Bulk upload prayer times
- **Manual Edit** - Edit individual prayer times

### Device Management
- **Device List** - View all display devices with pairing status
- **Add Device** - Register new devices with pairing codes
- **Device Settings** - Configure device name and template
- **Status Tracking** - Monitor device online/offline status

### Announcements
- **Create Announcements** - Add announcements with images and priority
- **Priority Levels** - Low, medium, high priority badges
- **Date Range** - Set start and end dates for announcements
- **Active/Inactive** - Toggle announcement visibility

### Content Schedules
- **Schedule Management** - Control what content displays and when
- **Time-based Display** - Set specific time ranges for content
- **Content Types** - Support for announcements, hadiths, Quran, donations

### Donation Campaigns
- **Campaign Cards** - Visual progress bars and funding percentages
- **Create Campaign** - Launch new fundraising campaigns
- **Campaign Details** - View donations and donor information
- **Progress Tracking** - Real-time funding progress

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI)
- **Forms**: React Hook Form + Zod
- **Data Fetching**: TanStack React Query
- **HTTP Client**: Axios
- **Icons**: Lucide React

## Project Structure

```
admin-dashboard/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   │   ├── page.tsx
│   │   │   ├── masjids/
│   │   │   ├── prayer-times/
│   │   │   ├── devices/
│   │   │   ├── announcements/
│   │   │   ├── schedules/
│   │   │   └── donations/
│   │   └── layout.tsx
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   └── providers.tsx
├── components/
│   ├── ui/ (shadcn/ui components)
│   ├── Sidebar.tsx
│   ├── TopBar.tsx
│   └── LoadingSpinner.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useMasjids.ts
│   ├── usePrayerTimes.ts
│   ├── useDevices.ts
│   ├── useAnnouncements.ts
│   ├── useDonations.ts
│   └── use-toast.ts
├── lib/
│   ├── api-client.ts
│   ├── auth.ts
│   └── utils.ts
├── types/
│   └── index.ts
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Backend API running on `http://localhost:3000`

### Installation

1. **Install dependencies**:
   ```bash
   cd admin-dashboard
   npm install
   ```

2. **Configure environment variables**:
   ```bash
   cp .env.local.example .env.local
   ```

   Edit `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3000/api
   NEXT_PUBLIC_APP_NAME=Masjid Admin Dashboard
   NEXT_PUBLIC_APP_URL=http://localhost:3001
   ```

3. **Run development server**:
   ```bash
   npm run dev
   ```

   The dashboard will be available at `http://localhost:3001`

4. **Build for production**:
   ```bash
   npm run build
   npm start
   ```

## Usage

### First Time Setup

1. Navigate to `http://localhost:3001`
2. Click "Register" to create your account
3. The first user automatically becomes a Super Admin
4. Start by adding your first masjid

### Managing Masjids

1. Go to **Masjids** in the sidebar
2. Click **Add Masjid**
3. Fill in masjid details:
   - Name, address, city, state, zip code
   - Contact email and phone
   - Timezone and prayer calculation method
4. Click **Create Masjid**

### Setting Up Prayer Times

1. Go to **Prayer Times**
2. Click **Calculate Times**
3. Select:
   - Masjid
   - Start and end date range
4. Click **Calculate Prayer Times**

The system will automatically generate prayer times based on the masjid's location, timezone, and calculation method.

### Adding Devices

1. Go to **Devices**
2. Click **Add Device**
3. Enter device name and select masjid
4. Copy the generated pairing code
5. Enter the code on your TV display device

### Creating Announcements

1. Go to **Announcements**
2. Click **Create Announcement**
3. Fill in:
   - Title and content
   - Priority level
   - Start and end dates
   - Optional image
4. Click **Create Announcement**

### Creating Donation Campaigns

1. Go to **Donations**
2. Click **Create Campaign**
3. Fill in:
   - Campaign title and description
   - Goal amount
   - Start and end dates
   - Optional campaign image
4. Click **Create Campaign**

## API Integration

The dashboard connects to the backend API at the URL specified in `NEXT_PUBLIC_API_URL`. All requests include:

- **Authentication**: Bearer token in Authorization header
- **Content-Type**: application/json (or multipart/form-data for file uploads)
- **Error Handling**: Automatic token refresh and error toasts

### API Endpoints Used

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/masjids` - List masjids
- `POST /api/masjids` - Create masjid
- `PUT /api/masjids/:id` - Update masjid
- `DELETE /api/masjids/:id` - Delete masjid
- `GET /api/prayer-times` - List prayer times
- `POST /api/prayer-times/calculate` - Calculate prayer times
- `GET /api/devices` - List devices
- `POST /api/devices` - Create device
- `GET /api/announcements` - List announcements
- `POST /api/announcements` - Create announcement
- `GET /api/campaigns` - List campaigns
- `POST /api/campaigns` - Create campaign
- `GET /api/donations` - List donations

## Form Validation

All forms use Zod schemas for validation:

- Email format validation
- Required field checking
- Number range validation
- Date validation
- Password strength requirements
- Custom error messages

## State Management

- **React Query** for server state and caching
- **React Hook Form** for form state
- **Local Storage** for authentication tokens
- **Toast Notifications** for user feedback

## Responsive Design

The dashboard is fully responsive:

- **Mobile**: Single column layout, collapsible sidebar
- **Tablet**: Two column grid for cards
- **Desktop**: Full sidebar, multi-column layouts

## Customization

### Changing Theme Colors

Edit `app/globals.css`:

```css
:root {
  --primary: 142 76% 36%; /* Green theme */
  --secondary: 210 40% 96.1%;
  /* ... other color variables */
}
```

### Adding New Pages

1. Create page in `app/(dashboard)/dashboard/[section]/page.tsx`
2. Add route to `components/Sidebar.tsx` navigation array
3. Create custom hook in `hooks/use[Section].ts`
4. Define types in `types/index.ts`

## Error Handling

- Network errors show toast notifications
- 401 errors automatically redirect to login
- Form validation errors display inline
- Loading states prevent duplicate submissions

## Performance Optimizations

- React Query caching (1 minute stale time)
- Image optimization with Next.js Image
- Code splitting with dynamic imports
- Debounced search inputs

## Security

- JWT token authentication
- Protected routes with middleware
- CSRF protection
- XSS prevention via React
- Role-based access control

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

### Cannot connect to backend

- Verify backend is running on port 3000
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Ensure CORS is enabled in backend

### Authentication not working

- Clear browser localStorage
- Check token expiration
- Verify backend auth endpoints

### Forms not submitting

- Check browser console for validation errors
- Verify all required fields are filled
- Check network tab for API errors

## License

MIT License - see LICENSE file for details

## Support

For issues or questions, please contact the development team or create an issue in the repository.
