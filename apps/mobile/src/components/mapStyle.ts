// MapLibre style using OpenStreetMap's standard raster tiles. CARTO's vector style decoded to empty tiles in the
// browser and its raster URLs now return an "API key required" placeholder, so OSM is used instead.
// OSM's tile policy allows light demo use with attribution; swap this for a provider with an SLA if the app scales.
export const MAP_STYLE_JS = `{version:8,sources:{osm:{type:'raster',tiles:['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],tileSize:256,maxzoom:19,attribution:'© OpenStreetMap contributors'}},layers:[{id:'osm',type:'raster',source:'osm'}]}`;
