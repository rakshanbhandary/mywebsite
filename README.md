# Rakshan Bhandary — Portfolio

A static personal portfolio that draws Rakshan’s name as a large outline, then moves it into the heading over one second as the page appears. Reduced-motion users see all content immediately. Expand the Accenture and SensoPart cards for project stories with outcomes, contributions, and relevant tools. An education section covers the ongoing Freiburg master’s and completed bachelor’s degree.

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
- `dist/social-preview.png`: 1200 × 630 share image referenced by Open Graph and Twitter metadata
- `scripts/social-preview.html`: editable HTML source for the share image
- `dist/theme.js`: persistent light/dark theme preference
- `dist/name-reveal.js`: responsive outline-to-heading animation with reduced-motion and interruption support

The `dist` directory is the complete static website and can be hosted directly. No build step or package installation is required.

## Interactions

- The hero pipeline links directly to each work or education entry; work links also open the matching details. The Germany branch shows overlapping master’s study and SensoPart experience. On phones, compact nodes retain the organization, category, and dates.

- Skill categories open on hover, keyboard focus, or tap; Escape dismisses the list.
- Experience cards align when collapsed and animate open and closed.
- The master’s timeline is filled to 95% with a gentle pulse and no visible numeric percentage.
- Reduced-motion preferences disable the page reveal and decorative motion.
- Company and institution logo sources are recorded in `dist/logos/sources.txt`.

## Contact and sharing

The contact section links to email, LinkedIn, and GitHub. The header’s Let’s talk link goes directly to that section. Social metadata uses the public canonical URL `https://rakshanbhandary.pages.dev/`; update the canonical, Open Graph URL, and image URLs together if the domain changes. The share image is a static PNG, so link previews do not need to run JavaScript.

## CV download

The primary hero Download CV button serves `dist/Rakshan_Bhandary_CV.pdf`. Replace that file using the same filename and deploy to update the public download.

## Personal Easter egg

The hero reads “Building something great. One piece at a time.” Hover or focus “One piece” for a comic question-mark bubble. Clicking the words reveals the supplied Luffy illustration (background removed), which stays until refresh. Clicking Luffy toggles a One Piece-inspired palette independently of the light/dark preference. The image loads on activation, and reduced-motion users get a still reveal. Neither the reveal nor the alternate palette persists after a refresh.

The optional theme rolls a tattered parchment open from left to right over the original heading, revealing the name in the ONE PIECE font by Phantom King Graphics. The parchment tilts slightly upward, and the page palette changes only after the unroll finishes. Clicking Luffy again during the animation cancels it. Its moving vertical roll has shaded paper and curled ends; the sheet retains irregular torn edges when open. The original accessible heading remains in place; reduced motion shows the finished scroll immediately. The font is hosted locally and its distributor lists it as public domain (source and archive attribution in `dist/fonts/OnePiece-LICENSE.txt`).
