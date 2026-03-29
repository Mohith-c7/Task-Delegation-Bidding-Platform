# Launch UI Landing Page - Q-VEDHA

A dark-themed landing page for Q-VEDHA's Quantum-Classical Hybrid LLMs platform, built with React and Vite.

## Design

This landing page is based on the Launch UI design from Figma:
https://www.figma.com/design/YRBNEBcy2cCNprourOBYLH/Launch-UI

## Features

- Dark theme with gradient effects and glows
- Responsive design
- Interactive FAQ accordion
- Pricing comparison cards
- Feature showcase with bento grid layout
- Partner logos section
- Full footer with social links

## Tech Stack

- React 18
- Vite
- Pure CSS (no frameworks)
- Google Fonts (Inter)

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

4. Preview production build:
```bash
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── Navbar.jsx/css      # Navigation bar
│   ├── Hero.jsx/css        # Hero section with CTA
│   ├── Logos.jsx/css       # Partner logos
│   ├── Features.jsx/css    # AlphaV model showcase
│   ├── Pricing.jsx/css     # Pricing tiers
│   ├── FAQ.jsx/css         # FAQ accordion
│   └── Footer.jsx/css      # Footer with links
├── App.jsx                 # Main app component
├── App.css                 # Global app styles
├── index.css               # CSS variables and reset
└── main.jsx                # Entry point
```

## Design System

The project uses CSS variables for consistent theming:
- Dark background (#09090b)
- Gradient text effects
- Indigo/Violet accent colors
- Consistent spacing scale
- Border radius tokens

## Components

- **Navbar**: Logo and navigation links
- **Hero**: Main headline with product mockup and glowing effects
- **Logos**: Partner/client logo showcase
- **Features**: Bento grid showcasing AlphaV models (1-4)
- **Pricing**: Three-tier pricing (Free, Pro, Team)
- **FAQ**: Accordion-style frequently asked questions
- **Footer**: Links, social media, and copyright

## Browser Support

Modern browsers with ES6+ support.
