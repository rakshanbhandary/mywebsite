import json, math
from pathlib import Path

root = Path(__file__).resolve().parent.parent
features = json.loads((root / '.qa/countries.geojson').read_text(encoding='utf-8'))['features']

def simplify(points, tolerance=1.3):
    if len(points)<3: return points
    ax,ay=points[0]; bx,by=points[-1]
    dx,dy=bx-ax,by-ay
    denom=dx*dx+dy*dy
    distances=[]
    for px,py in points[1:-1]:
        t=max(0,min(1,((px-ax)*dx+(py-ay)*dy)/denom)) if denom else 0
        distances.append(math.hypot(px-ax-t*dx,py-ay-t*dy))
    if max(distances)<=tolerance: return [points[0],points[-1]]
    i=distances.index(max(distances))+1
    return simplify(points[:i+1],tolerance)[:-1]+simplify(points[i:],tolerance)

def path_for(feature, project):
    geometry = feature['geometry']
    polygons = geometry['coordinates'] if geometry['type'] == 'MultiPolygon' else [geometry['coordinates']]
    paths = []
    for polygon in polygons:
        for ring in polygon:
            points = simplify([project(*p[:2]) for p in ring])
            paths.append('M' + 'L'.join(f'{x:.1f},{y:.1f}' for x,y in points) + 'Z')
    return ''.join(paths)

europe = lambda lon, lat: (60 + (lon + 25) * 7, 50 + (71-lat) * 7)
india = europe
eu = [f for f in features if f['properties']['CONTINENT'] == 'Europe']
ind = next(f for f in json.loads((root/'.qa/india-pov.geojson').read_text(encoding='utf-8'))['features'] if f['properties']['ADMIN'] == 'India')
ger = next(f for f in features if f['properties']['ADMIN'] == 'Germany')
eu_path = ''.join(path_for(f, europe) for f in eu)
india_path = path_for(ind, india)
germany_path = path_for(ger, europe)

svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 590"><title>Angular outlines of Europe and India, with Germany highlighted</title><defs>'
svg += '<clipPath id="region"><rect x="45" y="40" width="485" height="385"/></clipPath></defs>'
svg += '<g fill="none" stroke-linejoin="miter" stroke-linecap="round">'
svg += f'<g clip-path="url(#region)"><path d="{eu_path}" stroke="#799ac5" stroke-width="1.4"/>'
svg += f'<path d="{germany_path}" stroke="#e2ecff" stroke-width="2.5"/></g>'
svg += f'<path d="{india_path}" stroke="#9cb8df" stroke-width="1.8"/></g></svg>'
(root/'dist/route-map.svg').write_text(svg,encoding='utf-8')
print('Created angular country outlines without polygon fills.')
