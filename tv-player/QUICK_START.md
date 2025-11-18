# Quick Start Guide - TV Player

Get the Masjid TV Player running in minutes!

## Prerequisites

- Node.js 18 or higher
- npm (comes with Node.js)
- Backend API running (see `/backend` directory)

## Installation

### Option 1: Automated Setup (Recommended)

```bash
cd tv-player
./setup.sh
```

The script will:
- Check Node.js version
- Install dependencies
- Create .env file
- Display next steps

### Option 2: Manual Setup

```bash
cd tv-player

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your backend URL
nano .env  # or use your favorite editor
```

## Configuration

Edit `.env` file:

```env
# Point to your backend
VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=http://localhost:3000

# Optional: Adjust intervals (in milliseconds)
VITE_HEARTBEAT_INTERVAL=30000
VITE_CONTENT_ROTATION_INTERVAL=10000

# Enable debug mode for development
VITE_DEBUG=true
```

## Running the Application

### Development Mode

```bash
npm run dev
```

Open browser to: **http://localhost:5173**

### Production Build

```bash
# Build the application
npm run build

# Preview the build
npm run preview
```

## Docker Deployment

### Development

```bash
docker-compose -f docker-compose.dev.yml up
```

### Production

```bash
# Build and run using main docker-compose.yml
cd ..
docker-compose up tv-player -d
```

Access at: **http://localhost:8080**

## First Time Setup

1. **Launch the TV Player**
   - Visit http://localhost:5173 (dev) or http://localhost:8080 (production)

2. **Note the Pairing Code**
   - A 6-digit code will be displayed on screen

3. **Pair the Device**
   - Open Admin Dashboard at http://localhost:3001
   - Navigate to "TV Devices"
   - Click "Pair New Device"
   - Enter the 6-digit code

4. **Automatic Connection**
   - TV will automatically connect once paired
   - Content will start displaying

## Keyboard Shortcuts

- **Ctrl+Q**: Exit fullscreen mode
- **F11**: Toggle fullscreen (browser dependent)

## Troubleshooting

### Port Already in Use

```bash
# Change port in vite.config.ts or use environment variable
PORT=5174 npm run dev
```

### Backend Not Accessible

1. Check backend is running: `curl http://localhost:3000/health`
2. Verify `VITE_API_URL` in .env
3. Check firewall settings

### TV Not Pairing

1. Ensure backend is running
2. Check database is accessible
3. Verify pairing code is still valid (expires after 10 minutes)
4. Try refreshing the TV page to get a new code

### Content Not Showing

1. Check if content is marked as "active" in admin dashboard
2. Verify masjid has prayer times configured
3. Look at browser console (F12) for errors
4. Check WebSocket connection (green indicator)

## Development Tips

### Enable Debug Mode

Set `VITE_DEBUG=true` in .env to see:
- WebSocket connection status
- Current content being displayed
- Device and masjid information
- Content rotation index

### Hot Module Replacement

Vite provides instant updates while developing:
- Edit any file
- Changes appear immediately
- No need to refresh

### Browser DevTools

Press F12 to open:
- Console: View logs and errors
- Network: Monitor API calls
- Application: Check LocalStorage

## Testing on Actual TV

### Network Setup

1. Ensure TV and computer are on same network
2. Find your computer's IP address:
   ```bash
   # Linux/Mac
   ifconfig | grep inet

   # Windows
   ipconfig
   ```

3. Update Vite to allow external access:
   ```bash
   npm run dev -- --host
   ```

4. Access from TV browser:
   ```
   http://YOUR_COMPUTER_IP:5173
   ```

### Fullscreen on TV

- Most TV browsers auto-enter fullscreen
- Use TV remote to exit if needed
- Some TVs may require clicking on screen first

## Production Deployment

### Using Docker (Recommended)

```bash
# From project root
docker-compose up -d

# View logs
docker-compose logs -f tv-player

# Stop
docker-compose down
```

### Manual Deployment

```bash
# Build
npm run build

# Serve with any static server
npx serve -s dist -p 8080

# Or use nginx, Apache, etc.
```

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Check [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) for architecture details
- Configure prayer times in the Admin Dashboard
- Add announcements and media content
- Customize templates to match your masjid's branding

## Support

For issues:
1. Check browser console (F12)
2. Review backend logs
3. Verify network connectivity
4. Ensure all services are running

## Quick Reference

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Check code quality |
| `docker-compose up` | Run with Docker |

## URLs

- **Development**: http://localhost:5173
- **Production (Docker)**: http://localhost:8080
- **Backend API**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3001

---

**Ready to go!** Your TV Player should now be running and ready to display prayer times and content.
