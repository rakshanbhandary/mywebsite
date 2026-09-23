# Rakshan Bhandary — Portfolio

A static personal portfolio that shows Rakshan’s name immediately, then fades in the rest of the page after half a second. Reduced-motion users see all content immediately. Expand the Accenture and SensoPart cards to read the full experience details. An education section covers the ongoing Freiburg master’s and completed bachelor’s degree.

## Run locally

From the repository root:

```sh
python -m http.server 5173 --bind 127.0.0.1 --directory dist
```

Open http://127.0.0.1:5173/ in your browser.

## Files

- `dist/index.html`: portfolio content
- `dist/style.css`: layout, responsive styles, and transitions
- `dist/app.js`: toolkit interactions and independent experience-card animations
- `dist/theme.js`: persistent light/dark theme preference

The `dist` directory is the complete static website and can be hosted directly. No build step or package installation is required.

## Interactions

- Skill categories open on hover, keyboard focus, or tap; Escape dismisses the list.
- Experience cards align when collapsed and animate open and closed.
- The master’s timeline is filled to 95% with a gentle pulse and no visible numeric percentage.
- Reduced-motion preferences disable the page reveal and decorative motion.
- Company and institution logo sources are recorded in `dist/logos/sources.txt`.
