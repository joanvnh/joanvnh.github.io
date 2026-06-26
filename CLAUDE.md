# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static website for **Dani Rizos Nail's**, a nail salon in Cuba. Built with vanilla HTML/CSS/JavaScript, deployed on Netlify.

## Quick Commands

```bash
# Local development (Python)
python3 -m http.server 8080

# Local development (Node.js)
npx serve .

# Local development (PHP)
php -S localhost:8080
```

The site is fully static—no build step required. Open `index.html` directly or serve via any static server.

## Architecture

### File Structure
```
├── index.html          # Landing page (hero, carousel, services preview, booking form)
├── servicios.html      # Full services catalog with details and pricing
├── galeria.html        # 22-image gallery with lightbox
├── styles.css          # Global styles (~22KB, organized by section)
├── script.js           # All interactive logic (~14KB, modular init* functions)
├── netlify.toml        # Security headers + cache configuration
└── img/                # Assets (logo, hero, services, carousel, gallery)
```

### JavaScript Modules (script.js)

All functionality is initialized via `DOMContentLoaded`:

| Function | Purpose |
|----------|---------|
| `initTheme()` | Light/dark mode with localStorage persistence |
| `initCarousel()` | 5-slide carousel with autoplay, dots, prev/next |
| `initMenu()` | Mobile menu overlay with scroll lock |
| `initBookingForm()` | WhatsApp booking form with live preview |
| `initScrollAnimations()` | Fade-up animations via IntersectionObserver |
| `initScrollSpy()` | Active nav highlighting based on scroll position |
| `initCounter()` | CounterAPI.dev visit tracking |
| `initBackToTop()` | FAB button appears after 400px scroll |
| `initLightbox()` | Gallery modal with keyboard support |
| `sendToGoogleCalendar()` | POST to Google Apps Script for calendar events |

### Key Integrations

1. **WhatsApp Booking**: Form generates pre-filled message → opens `wa.me/5353734528`
2. **Google Calendar**: POST to Apps Script URL (configured in `script.js:435`)
3. **CounterAPI**: Visit counter at footer (`api.counterapi.dev/v2/joan-valerio-noa-hernandezs-team-3793/first-counter-3793`)

### CSS Architecture (styles.css)

Organized by component with CSS variables for theming:
- Variables: `--bg`, `--fg`, `--accent`, `--terracotta`, `--radius`
- Dark mode: `body.dark` class overrides variables
- Utilities: `.fade-up`, `.container`, `.section-kicker`, `.section-title`
- Components: `.header`, `.hero`, `.carousel-*`, `.booking-*`, `.gallery-*`, `.lightbox`

### Netlify Configuration (netlify.toml)

- Security headers: X-Frame-Options, X-XSS-Protection, HSTS
- Aggressive caching for `/img/*`, `*.css`, `*.js` (1 year immutable)

## Common Patterns

### Adding a new page
1. Copy structure from `servicios.html` or `galeria.html`
2. Include: header with nav, page-hero section, main content, footer, WhatsApp FAB, back-to-top button
3. Add `defer` script tag for `script.js`

### Adding a service
1. Add card in `index.html` (`.services-grid`)
2. Add full card in `servicios.html` (`.services-full`)
3. Update `selectService()` call with exact service name

### Modifying booking form
- Form fields use `data-field` attribute for JS binding
- Preview updates on `input` and `change` events
- WhatsApp number: `BUSINESS_WHATSAPP` constant at top of `script.js`

### Google Calendar Integration
The Apps Script URL is hardcoded in `script.js:435`. To configure:
1. Deploy `google_calendar_script.gs` to script.google.com
2. Get deployment URL
3. Replace `SCRIPT_URL` constant

## Design Tokens

```css
--bg: #f8f2ed (light) / #120f10 (dark)
--accent: #8a4d5b (light) / #e8b0bb (dark)
--terracotta: #c88069
--green: #25d366 (WhatsApp)
--radius: 2rem
--serif: Cormorant Garamond
--sans: Manrope
```
