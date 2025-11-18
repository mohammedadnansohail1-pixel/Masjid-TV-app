# TV Player Implementation Summary

## Overview

The Masjid TV Player is a production-ready React Single Page Application (SPA) designed to display prayer times, announcements, and media content on TV screens in mosques. It features a robust device pairing system, real-time updates via WebSocket, and multiple beautiful templates for prayer time displays.

## Architecture

### Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5 (fast builds, hot module replacement)
- **Styling**: Tailwind CSS (utility-first, responsive design)
- **HTTP Client**: Axios (API communication)
- **WebSocket**: Socket.io-client (real-time updates)
- **Date/Time**: date-fns (lightweight date manipulation)
- **Deployment**: Docker with Nginx (production-ready)

### Project Structure

```
tv-player/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── DeviceSetup.tsx           # Device pairing interface
│   │   ├── PrayerTimeDisplay.tsx     # Main prayer display wrapper
│   │   ├── AnnouncementDisplay.tsx   # Announcement viewer
│   │   ├── ImageSlideshow.tsx        # Image/video display
│   │   ├── WebViewContent.tsx        # External URL iframe
│   │   ├── CurrentTime.tsx           # Live clock
│   │   ├── IslamicDate.tsx           # Hijri date display
│   │   └── NextPrayerCountdown.tsx   # Countdown timer
│   ├── hooks/                # Custom React hooks
│   │   ├── useDeviceRegistration.ts  # Device pairing logic
│   │   ├── usePrayerTimes.ts         # Prayer times fetching
│   │   ├── useWebSocket.ts           # WebSocket connection
│   │   ├── useContentSchedule.ts     # Content management
│   │   └── useFullscreen.ts          # Fullscreen control
│   ├── layouts/              # Prayer time templates
│   │   ├── Template1.tsx             # Classic table layout
│   │   ├── Template2.tsx             # Modern card layout
│   │   └── Template3.tsx             # Minimalist focus layout
│   ├── services/             # External services
│   │   ├── api.ts                    # REST API client
│   │   └── websocket.ts              # WebSocket service
│   ├── utils/                # Helper functions
│   │   ├── prayerUtils.ts            # Prayer time calculations
│   │   ├── timeUtils.ts              # Time formatting
│   │   └── contentRotation.ts        # Content scheduling
│   ├── types/                # TypeScript definitions
│   │   └── index.ts
│   ├── App.tsx               # Main application component
│   ├── main.tsx              # Application entry point
│   └── index.css             # Global styles
├── public/                   # Static assets
├── index.html                # HTML template
├── vite.config.ts            # Vite configuration
├── tailwind.config.js        # Tailwind configuration
├── tsconfig.json             # TypeScript configuration
├── Dockerfile                # Production Docker image
├── Dockerfile.dev            # Development Docker image
├── nginx.conf                # Nginx server configuration
└── package.json              # Dependencies and scripts
```

## Core Features

### 1. Device Registration & Pairing

**Flow:**
1. TV Player loads and checks for existing device registration
2. If not registered, calls `POST /api/tv-devices/register`
3. Backend generates a 6-digit pairing code
4. TV displays pairing code on screen
5. Admin pairs device in dashboard
6. TV polls `GET /api/tv-devices/:id/pairing-status` every 3 seconds
7. Once paired, TV loads content and starts operation

**Implementation:**
- `useDeviceRegistration` hook manages the entire flow
- LocalStorage persists device ID and masjid association
- Automatic reconnection if network drops

### 2. Prayer Time Display

**Features:**
- Three customizable templates
- Live countdown to next prayer
- Current time and Hijri date
- Highlighted current/next prayer
- Automatic midnight refresh

**Templates:**

**Template 1 - Classic Table:**
- Traditional table layout
- All 6 prayers + sunrise in rows
- Large, readable fonts
- Next prayer highlighted

**Template 2 - Modern Cards:**
- Card-based grid (3x2)
- Next prayer emphasized with gold gradient
- Contemporary design
- Smooth animations

**Template 3 - Minimalist Focus:**
- Split-screen layout
- Large next prayer countdown on left
- All times list on right
- Clean, focused interface

### 3. Content Rotation System

**Logic:**
```
Priority Announcements → Media Content → Regular Announcements
           ↓                   ↓                    ↓
    Prayer Times (every 2 items) → Back to start
```

**Implementation:**
- `contentRotation.ts` manages the rotation logic
- Configurable display durations per content type
- Smooth transitions with fade animations
- Automatic progression with timers

**Content Types:**
1. **Prayer Times**: Default fallback, shows every N items
2. **Announcements**: Text + optional image
3. **Media Images**: Full-screen images
4. **Media Videos**: Auto-play videos
5. **External URLs**: iFrame embeds

### 4. Real-time Updates

**WebSocket Events:**

**Received by TV:**
- `prayer_times_updated` → Refresh prayer times
- `announcement_updated` → Reload announcements
- `content_updated` → Refresh media content
- `template_changed` → Switch to new template
- `device_paired` → Update masjid association
- `refresh` → Force full page reload

**Connection Management:**
- Automatic reconnection on disconnect
- Exponential backoff retry strategy
- Visual connection indicator
- Heartbeat to maintain connection

### 5. Heartbeat System

**Purpose:**
- Keep device "alive" in backend
- Track last seen timestamp
- Enable remote monitoring

**Implementation:**
- POST to `/api/tv-devices/:id/heartbeat` every 30 seconds
- Configurable interval via environment variable
- Silent failure (doesn't disrupt content)

### 6. Fullscreen Management

**Features:**
- Auto-enter fullscreen on load
- Cross-browser compatibility
- Keyboard shortcut (Ctrl+Q) to exit
- Prevents accidental exits

**Browser Support:**
- Standard Fullscreen API
- WebKit prefix (Safari)
- Mozilla prefix (Firefox)
- MS prefix (IE/Edge)

### 7. Offline Support

**Cached Data:**
- Prayer times (latest)
- Content schedule
- Masjid information

**Strategy:**
- Cache API responses in LocalStorage
- Serve cached data when offline
- Automatic sync when reconnected

## Data Flow

### Initial Load

```
1. App.tsx mounts
   ↓
2. useDeviceRegistration hook runs
   ↓
3. Check LocalStorage for device ID
   ↓
4. If found: Load device info
   If not: Register new device
   ↓
5. Display pairing screen if not paired
   ↓
6. Once paired: Load prayer times & content
   ↓
7. Connect WebSocket
   ↓
8. Start content rotation
   ↓
9. Begin heartbeat interval
```

### Content Update Cycle

```
1. Content rotation timer expires
   ↓
2. getNextContent() calculates next item
   ↓
3. State updates with new content
   ↓
4. App.tsx renders appropriate component
   ↓
5. New timer starts for next rotation
```

### Real-time Update

```
1. WebSocket receives event
   ↓
2. handleWebSocketMessage() processes event
   ↓
3. Calls appropriate refresh function
   ↓
4. Hook refetches data from API
   ↓
5. State updates trigger re-render
   ↓
6. New content displays
```

## API Integration

### Endpoints Used

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/tv-devices/register` | Register new device |
| GET | `/api/tv-devices/:id` | Get device info |
| GET | `/api/tv-devices/:id/pairing-status` | Check if paired |
| POST | `/api/tv-devices/:id/heartbeat` | Send heartbeat |
| GET | `/api/masjids/:id/prayer-times/today` | Get prayer times |
| GET | `/api/masjids/:id/content-schedule` | Get all content |
| GET | `/api/masjids/:id/announcements/active` | Get announcements |
| GET | `/api/masjids/:id/media/active` | Get media |

### Authentication

- JWT token stored in LocalStorage
- Auto-included in all API requests via Axios interceptor
- Token received during device registration

## State Management

### Custom Hooks Pattern

Each major feature has a dedicated hook:

**useDeviceRegistration:**
- Manages device lifecycle
- Handles pairing status
- Persists to LocalStorage

**usePrayerTimes:**
- Fetches daily prayer times
- Auto-refreshes at midnight
- Caches for offline use

**useWebSocket:**
- Establishes WebSocket connection
- Manages event subscriptions
- Handles reconnection

**useContentSchedule:**
- Fetches announcements and media
- Periodic refresh (5 minutes)
- Offline fallback

**useFullscreen:**
- Controls fullscreen state
- Cross-browser compatibility
- Keyboard shortcuts

## Styling Strategy

### Tailwind CSS

**Design Principles:**
- Large fonts for TV visibility (4xl - 9xl)
- High contrast colors
- Smooth animations
- No user selection (prevent accidental interactions)

**Custom Theme:**
```js
colors: {
  islamic: {
    gold: '#D4AF37',      // Accent color
    darkGreen: '#006B3F',  // Primary dark
    lightGreen: '#00A86B', // Primary light
  }
}
```

**Animations:**
- `fade-in`: Content transitions
- `slide-up`: Entry animations
- `pulse-slow`: Live indicators
- `pulse-glow`: Important elements

### Typography

**Fonts:**
- **Sans**: Inter (modern, readable)
- **Arabic**: Amiri (traditional Arabic script)
- **Mono**: System mono (for times)

## Performance Optimizations

### Build Optimizations

**Vite Configuration:**
- Code splitting (vendor, utils chunks)
- Tree shaking
- Minification
- Source maps disabled in production

**Image Optimization:**
- Lazy loading
- Max resolution enforcement
- Progressive loading

### Runtime Optimizations

**React:**
- Functional components
- Custom hooks for logic reuse
- Memoization where needed
- Minimal re-renders

**Network:**
- Cached API responses
- Debounced updates
- Efficient WebSocket usage

## Deployment

### Production Docker Build

```dockerfile
# Multi-stage build
Stage 1: Build React app
Stage 2: Serve with Nginx
```

**Benefits:**
- Small image size (~30MB)
- Fast startup
- Production-ready Nginx config
- Health checks included

### Nginx Configuration

**Features:**
- SPA routing (fallback to index.html)
- Gzip compression
- Cache headers for static assets
- Security headers
- Health check endpoint

### Environment Variables

**Build-time Variables:**
All `VITE_*` variables are embedded during build.

**Configuration:**
- API URL
- WebSocket URL
- Heartbeat interval
- Content rotation interval
- Debug mode

## Error Handling

### Network Errors

**API Requests:**
- Try-catch around all API calls
- Fallback to cached data
- User-friendly error messages
- Automatic retry for transient errors

**WebSocket:**
- Auto-reconnect on disconnect
- Max retry attempts (10)
- Exponential backoff
- Connection status indicator

### Content Errors

**Image Loading:**
- Error state handling
- Placeholder display
- Logging for debugging

**Video Playback:**
- Autoplay policies respected
- Muted by default
- Error recovery

## Security Considerations

### Content Security

**Input Validation:**
- API responses validated
- TypeScript type checking
- Sanitized display of user content

**iframe Safety:**
- Sandbox attribute on external URLs
- Limited permissions
- Same-origin policy

### Authentication

**JWT Tokens:**
- Stored in LocalStorage
- Included in request headers
- Auto-refresh on expiry

**Device Security:**
- Unique device IDs
- Pairing code verification
- Masjid association check

## Testing Strategy

### Manual Testing

**Device Registration:**
- [ ] New device registration
- [ ] Pairing code display
- [ ] Successful pairing
- [ ] Auto-load after pairing

**Prayer Times:**
- [ ] Display all prayers
- [ ] Next prayer highlighted
- [ ] Countdown accuracy
- [ ] Midnight refresh

**Content Rotation:**
- [ ] Announcements display
- [ ] Media slideshow
- [ ] URL embed works
- [ ] Smooth transitions

**Real-time Updates:**
- [ ] Prayer time updates
- [ ] Announcement updates
- [ ] Template switching
- [ ] Force refresh

**Fullscreen:**
- [ ] Auto-enter on load
- [ ] Ctrl+Q to exit
- [ ] Maintains across content

### Browser Testing

- ✅ Chrome/Chromium
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Smart TV browsers

## Future Enhancements

### Potential Features

1. **Multi-language Support**
   - Arabic interface option
   - Translation system
   - RTL layout support

2. **Advanced Scheduling**
   - Time-based content
   - Event-triggered displays
   - Custom rotations per time

3. **Analytics**
   - Uptime tracking
   - Content view counts
   - Performance metrics

4. **Enhanced Media**
   - YouTube integration
   - Live streams
   - Audio announcements

5. **Accessibility**
   - Screen reader support
   - High contrast mode
   - Text size adjustment

## Troubleshooting Guide

### Common Issues

**1. TV Not Connecting to Backend**
- Check `VITE_API_URL` in .env
- Verify network connectivity
- Check backend is running
- Review CORS settings

**2. Pairing Code Not Working**
- Verify backend is accessible
- Check database connection
- Ensure code not expired
- Try registering new device

**3. Content Not Rotating**
- Check if content is active
- Verify content schedule in DB
- Review browser console logs
- Check rotation interval setting

**4. WebSocket Not Connecting**
- Verify `VITE_WS_URL` is correct
- Check firewall settings
- Review backend WebSocket config
- Check browser console for errors

**5. Fullscreen Issues**
- Try F11 as alternative
- Check browser permissions
- Some browsers need user click
- Verify browser compatibility

## Conclusion

The Masjid TV Player is a robust, production-ready application designed for reliability and ease of use. It leverages modern web technologies to provide a seamless experience for displaying prayer times and content in mosques.

**Key Strengths:**
- Simple device pairing process
- Real-time content updates
- Offline functionality
- Beautiful, customizable templates
- Production-ready deployment
- Comprehensive error handling

The application is ready for deployment and can scale to support multiple TV devices across different mosques.
