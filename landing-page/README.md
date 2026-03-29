# DataWise Landing Page

A pixel-perfect React landing page implementation from Figma design.

## Features

- Fully responsive design
- Modern React components
- Clean CSS styling with CSS variables
- All assets loaded from Figma API
- Sections included:
  - Navigation bar
  - Hero banner with image grid
  - Partner logos section
  - About us section with metrics
  - Feature cards
  - Blog section
  - Trial banner with benefits
  - FAQ section
  - Footer with links

## Getting Started

### Installation

```bash
cd landing-page
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view it in your browser.

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
landing-page/
├── index.html
├── package.json
├── vite.config.js
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── components/
│       ├── Navbar.jsx
│       ├── Navbar.css
│       ├── HeroBanner.jsx
│       ├── HeroBanner.css
│       ├── PartnerSection.jsx
│       ├── PartnerSection.css
│       ├── AboutUsSection.jsx
│       ├── AboutUsSection.css
│       ├── FeatureSection.jsx
│       ├── FeatureSection.css
│       ├── BlogSection.jsx
│       ├── BlogSection.css
│       ├── TrialBanner.jsx
│       ├── TrialBanner.css
│       ├── FaqSection.jsx
│       ├── FaqSection.css
│       ├── Footer.jsx
│       └── Footer.css
```

## Design System

The project uses CSS variables for consistent theming:

- Colors: Primary, neutral, text colors
- Spacing: Consistent spacing scale
- Border radius: Standardized corner radii
- Typography: DM Sans and Inter fonts

## Technologies

- React 18
- Vite
- CSS3 with CSS Variables
- Google Fonts (DM Sans, Inter)

## Notes

- All images are loaded from Figma API endpoints
- Design is fully replicated from the original Figma file
- No external UI libraries used - pure CSS implementation
