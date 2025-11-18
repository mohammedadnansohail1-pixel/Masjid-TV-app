# Masjid TV Player

A production-ready React TV Player application for displaying prayer times, announcements, and media content on TV screens in mosques.

## Features

- **Device Registration & Pairing**: Simple 6-digit code pairing system
- **Prayer Time Display**: Three beautiful templates to choose from
- **Real-time Updates**: WebSocket connection for instant content updates
- **Content Rotation**: Automatic rotation between prayer times, announcements, and media
- **Fullscreen Mode**: Auto-enter fullscreen with Ctrl+Q to exit
- **Offline Support**: Cached content for offline functionality
- **Heartbeat System**: Regular check-ins with the backend
- **Responsive Design**: Optimized for TV displays with large fonts and high contrast

## Technology Stack

- **React 18**: Modern UI framework
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **Socket.io Client**: Real-time WebSocket communication
- **Axios**: HTTP client for API requests
- **date-fns**: Date and time utilities

## Prerequisites

- Node.js 18+ and npm
- Backend API server running (see `/backend` directory)
- Modern web browser or TV with browser capabilities

## Installation

1. **Install dependencies:**

```bash
cd tv-player
npm install
```

2. **Configure environment variables:**

Create a `.env` file in the root directory (or copy from `.env.example`):

```env
VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=http://localhost:3000
VITE_HEARTBEAT_INTERVAL=30000
VITE_CONTENT_ROTATION_INTERVAL=10000
VITE_DEBUG=false
```

3. **Run development server:**

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Building for Production

```bash
npm run build
```

The production files will be in the `dist/` directory.

## Deployment Options

### Option 1: Static Hosting (Recommended for TV devices)

1. Build the project: `npm run build`
2. Serve the `dist/` folder using any static file server
3. Example with a simple HTTP server:

```bash
npm install -g serve
serve -s dist -p 5173
```

### Option 2: Docker Deployment

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build and run:

```bash
docker build -t masjid-tv-player .
docker run -p 8080:80 masjid-tv-player
```

### Option 3: Integration with Main Docker Compose

Add to the main `docker-compose.yml`:

```yaml
tv-player:
  build:
    context: ./tv-player
    dockerfile: Dockerfile
  ports:
    - "8080:80"
  environment:
    - VITE_API_URL=http://backend:3000/api
    - VITE_WS_URL=http://backend:3000
  depends_on:
    - backend
```

## Usage

### Initial Setup

1. **Launch the TV Player** on your TV or display device
2. A **6-digit pairing code** will be displayed on the screen
3. **Open the Admin Dashboard** on your computer/phone
4. Navigate to **TV Devices** section
5. Click **"Pair New Device"** and enter the pairing code
6. The TV will **automatically connect** once paired

### Keyboard Shortcuts

- **Ctrl+Q**: Exit fullscreen mode
- **F11**: Toggle fullscreen (browser dependent)

### Content Display

The TV Player automatically rotates through:

1. **Prayer Times**: Displays current and upcoming prayer times
2. **Announcements**: Shows active announcements with images
3. **Media Content**: Displays images, videos, or external URLs

Content rotation timing can be configured via environment variables.

## Templates

Three beautiful templates are available:

### Template 1: Classic Table Layout
- Traditional table format
- All prayers displayed at once
- Clear, easy-to-read design
- Best for: General purpose displays

### Template 2: Modern Card Layout
- Card-based design
- Next prayer highlighted
- Contemporary aesthetic
- Best for: Modern mosques

### Template 3: Minimalist Focus
- Split-screen design
- Large next prayer countdown
- Clean, minimal interface
- Best for: Focused prayer time displays

Templates can be changed from the Admin Dashboard and updates are sent in real-time to the TV.

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:3000/api` |
| `VITE_WS_URL` | WebSocket server URL | Same as API URL |
| `VITE_HEARTBEAT_INTERVAL` | Heartbeat interval (ms) | `30000` (30 seconds) |
| `VITE_CONTENT_ROTATION_INTERVAL` | Content rotation interval (ms) | `10000` (10 seconds) |
| `VITE_DEBUG` | Enable debug mode | `false` |

### Customization

#### Colors

Edit `tailwind.config.js` to customize colors:

```js
colors: {
  islamic: {
    gold: '#D4AF37',
    darkGreen: '#006B3F',
    lightGreen: '#00A86B',
  }
}
```

#### Fonts

Fonts are loaded from Google Fonts in `src/index.css`. You can change them by modifying the import URLs.

## Troubleshooting

### TV Not Connecting

1. Check that the backend is running
2. Verify `VITE_API_URL` is correct
3. Check network connectivity
4. Look at browser console for errors (F12)

### Content Not Updating

1. Check WebSocket connection (green indicator in debug mode)
2. Verify content is active in Admin Dashboard
3. Check browser console for errors
4. Try refreshing the page

### Fullscreen Not Working

1. Some browsers require user interaction to enter fullscreen
2. Click anywhere on the screen after loading
3. Use F11 as an alternative

### Performance Issues

1. Reduce content rotation frequency
2. Optimize images (compress, resize)
3. Limit number of active announcements/media
4. Use a more powerful device

## Development

### Project Structure

```
tv-player/
├── src/
│   ├── components/       # React components
│   │   ├── DeviceSetup.tsx
│   │   ├── PrayerTimeDisplay.tsx
│   │   ├── AnnouncementDisplay.tsx
│   │   ├── ImageSlideshow.tsx
│   │   ├── WebViewContent.tsx
│   │   ├── CurrentTime.tsx
│   │   ├── IslamicDate.tsx
│   │   └── NextPrayerCountdown.tsx
│   ├── hooks/           # Custom React hooks
│   │   ├── useDeviceRegistration.ts
│   │   ├── usePrayerTimes.ts
│   │   ├── useWebSocket.ts
│   │   ├── useContentSchedule.ts
│   │   └── useFullscreen.ts
│   ├── layouts/         # Template layouts
│   │   ├── Template1.tsx
│   │   ├── Template2.tsx
│   │   └── Template3.tsx
│   ├── services/        # API and WebSocket services
│   │   ├── api.ts
│   │   └── websocket.ts
│   ├── utils/           # Utility functions
│   │   ├── prayerUtils.ts
│   │   ├── timeUtils.ts
│   │   └── contentRotation.ts
│   ├── types/           # TypeScript types
│   │   └── index.ts
│   ├── App.tsx          # Main app component
│   ├── main.tsx         # Entry point
│   └── index.css        # Global styles
├── index.html           # HTML template
├── vite.config.ts       # Vite configuration
├── tailwind.config.js   # Tailwind configuration
├── tsconfig.json        # TypeScript configuration
└── package.json         # Dependencies
```

### Adding a New Template

1. Create a new file in `src/layouts/` (e.g., `Template4.tsx`)
2. Import and use prayer time components
3. Add to `PrayerTimeDisplay.tsx` switch statement
4. Update `TemplateType` in `src/types/index.ts`

### Adding a New Content Type

1. Add type to `MediaContent` interface in `src/types/index.ts`
2. Create component in `src/components/`
3. Add to content rotation logic in `App.tsx`
4. Update `contentRotation.ts` helper functions

## API Integration

The TV Player integrates with the backend API:

### Endpoints Used

- `POST /api/tv-devices/register` - Register new device
- `GET /api/tv-devices/:id/pairing-status` - Check pairing status
- `GET /api/tv-devices/:id` - Get device info
- `POST /api/tv-devices/:id/heartbeat` - Send heartbeat
- `GET /api/masjids/:id/prayer-times/today` - Get prayer times
- `GET /api/masjids/:id/content-schedule` - Get content schedule
- `GET /api/masjids/:id/announcements/active` - Get announcements
- `GET /api/masjids/:id/media/active` - Get media

### WebSocket Events

**Received:**
- `prayer_times_updated` - Prayer times changed
- `announcement_updated` - Announcement added/updated/deleted
- `content_updated` - Media content changed
- `template_changed` - Display template changed
- `refresh` - Force refresh the app
- `device_paired` - Device successfully paired

**Emitted:**
- None (TV Player is receive-only)

## Performance Optimization

### Recommended Settings

- **Content Duration**: 10-15 seconds per item
- **Max Active Announcements**: 5-10
- **Max Active Media**: 10-15
- **Image Size**: Max 1920x1080, optimized for web
- **Video**: MP4 format, H.264 codec recommended

### Caching Strategy

- Prayer times cached for offline use
- Content schedule cached locally
- Updates fetched every 5 minutes
- WebSocket provides real-time updates

## Browser Compatibility

Tested and working on:
- ✅ Chrome/Chromium 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Smart TV browsers (Samsung, LG, Sony)

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review browser console logs (F12)
3. Check backend logs
4. Open an issue on GitHub

## License

This project is part of the Masjid TV Management System.

## Credits

Built with React, TypeScript, and Tailwind CSS for the Muslim community.
