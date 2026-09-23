# Rakshan Bhandary — Portfolio

A static personal portfolio with an optional 1.8-second India-to-Germany flight introduction. The intro uses angular country outlines, highlights Germany, and respects reduced-motion preferences. Expand the Accenture and SensoPart cards to read the full experience details. An education section covers the ongoing Freiburg master’s and completed bachelor’s degree.

## Run locally

From the repository root:

```sh
python -m http.server 5173 --bind 127.0.0.1 --directory dist
```

Open http://127.0.0.1:5173/ in your browser.

## Files

- `dist/index.html`: portfolio content and intro scene
- `dist/style.css`: layout, responsive styles, and transitions
- `dist/app.js`: flight animation and replay behavior
- `dist/route-map.svg`: simplified country outlines
- `dist/plane-outline.svg`: Lucide airplane icon
- `scripts/generate-map.py`: map asset generator (Python standard library only)

The `dist` directory is the complete static website and can be hosted directly. No build step or package installation is required.

## Regenerate the map

Download the Natural Earth GeoJSON files into a local `.qa` directory:

- `countries.geojson`: https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson
- `india-pov.geojson`: https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_0_countries_ind.geojson

Run `python scripts/generate-map.py` from the repository root.

Map geometry is public-domain Natural Earth data. India uses the India point-of-view boundary dataset. The outline airplane is from Lucide; its license is included in `dist/lucide-license.txt`. See `dist/map-source.txt` for map source details.

## Interactions

- Skill categories open on hover, keyboard focus, or tap; Escape dismisses the list.
- Experience cards align when collapsed and animate open and closed.
- The master’s timeline is filled to 95% with a gentle pulse and no visible numeric percentage.
- Reduced-motion preferences disable the intro and decorative motion.
- Company and institution logo sources are recorded in `dist/logos/sources.txt`.
