# American Land Trust — Site Template

A pixel-perfect replication of the American Land Trust website, built as a customizable template for rank & rent or client deployment.

## 🚀 Quick Start

1. Clone the repo
2. Edit `js/config.js` with client-specific details
3. Replace logo placeholder with client logo
4. Deploy to Netlify (drag & drop or Git deploy)

## 📁 File Structure

```
├── index.html          # Home page
├── about.html          # About / Team page
├── contact.html        # Contact page with form
├── css/
│   └── styles.css      # All styles
├── js/
│   ├── config.js       # 🔧 EDIT THIS — all content/config
│   └── main.js         # Animations, carousel, interactions
├── images/             # Local images (if any)
├── netlify.toml        # Netlify deployment config
└── README.md           # This file
```

## 🔧 Customization Guide

### Quick Client Swap (config.js)

Edit `js/config.js` to change:

- **Company name, phone, email, address**
- **Hero headline and subtitle**
- **Process steps**
- **Why choose us bullets**
- **Testimonials**
- **Team member bios**
- **Articles**
- **Footer links**

### Logo

Replace the `.logo-placeholder` div in each HTML file with an `<img>` tag pointing to the client's logo.

### Images

Images use Unsplash URLs by default. Replace with client-specific images:
- Hero background
- About section images
- Team member photos
- Article thumbnails

### Colors

Edit CSS variables in `css/styles.css`:

```css
:root {
  --red: #c12037;        /* Primary accent */
  --navy: #213a7e;       /* Secondary color */
  --cream: #ebe8dd;      /* Background accent */
  --dark: #111111;       /* Text color */
}
```

### Fonts

The template uses:
- **DM Serif Text** — Headings
- **Josefin Sans** — Body text
- **Open Sans** — Alternative text

Change via Google Fonts import in `styles.css`.

## 📬 Forms

Forms use **Netlify Forms** (zero config). Forms detected:
- Footer contact form (all pages)
- Contact page main form

Submissions appear in Netlify dashboard → Forms.

## ✨ Features

- ✅ Mobile responsive (hamburger menu, touch-friendly)
- ✅ Animated hero with canvas particle effect
- ✅ Auto-scrolling reviews carousel
- ✅ Scroll-triggered fade-in animations
- ✅ Floating contact bar on scroll
- ✅ Process steps with hover effects
- ✅ Expandable team member bios
- ✅ SEO optimized meta tags
- ✅ Cross-browser compatible
- ✅ Fast loading (no build tools needed)

## 🌐 Deployment

### Netlify (Recommended)
1. Connect GitHub repo to Netlify
2. Publish directory: `.` (root)
3. No build command needed
4. Deploy!

### Manual
Just serve the files from any static host. No build step required.

## 📊 Performance

- Pure HTML/CSS/JS — no frameworks
- Lazy-loaded images
- Optimized animations with `requestAnimationFrame`
- Intersection Observer for scroll triggers
- Minimal DOM manipulation

---

Built as a rank & rent template by CME.
