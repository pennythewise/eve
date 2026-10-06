import { routeNodes } from '../data/route';
import { MAP_STYLE_JS } from './mapStyle';

// Self-contained MapLibre GL page on OpenStreetMap raster tiles (see mapStyle.ts).
// Road geometry comes from the public OSRM demo server, with straight lines as a fallback if it is unreachable.
export function routeMapHtml(reached: number) {
  return `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
<link rel="stylesheet" href="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css">
<style>
html,body,#m{margin:0;height:100%;background:#E6F3F0}
.maplibregl-ctrl-attrib{font-size:8px}
.pin{width:16px;height:16px;border-radius:50%;border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35)}
.pin.lit{box-shadow:0 0 0 4px rgba(10,156,138,.25),0 1px 4px rgba(0,0,0,.35)}
.pin.dim{opacity:.35;box-shadow:none}
.pin.cur::after{content:"";position:absolute;left:-10px;top:-10px;width:36px;height:36px;border-radius:50%;background:inherit;opacity:.3;animation:p 1.6s ease-out infinite}
@keyframes p{0%{transform:scale(.4);opacity:.5}100%{transform:scale(1.2);opacity:0}}
.item{width:14px;height:14px;border-radius:50%;background:#D64545;border:3px solid #fff;box-shadow:0 0 0 3px rgba(214,69,69,.35)}
</style></head><body><div id="m"></div>
<script src="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js"></script>
<script>
window.onerror=function(m){var d=document.createElement('div');d.style.cssText='position:fixed;left:4px;bottom:4px;z-index:9;background:#fff;color:#b00;font:11px sans-serif;padding:4px';d.textContent='map: '+m;document.body.appendChild(d)};
var N=${JSON.stringify(routeNodes)},R=${reached};
var b=new maplibregl.LngLatBounds();N.forEach(function(n){b.extend([n.lng,n.lat])});
var map=new maplibregl.Map({container:'m',style:${MAP_STYLE_JS},bounds:b,fitBoundsOptions:{padding:30},
  attributionControl:{compact:true}});
N.forEach(function(n,i){
  var el=document.createElement('div'),lit=i<=R;el.className='pin'+(i===R?' cur':'')+(lit?' lit':' dim');
  el.style.background='#0A9C8A';el.style.borderColor='#fff';
  new maplibregl.Marker({element:el}).setLngLat([n.lng,n.lat]).addTo(map);
});
function leg(a,b){
  var u='https://router.project-osrm.org/route/v1/driving/'+a.lng+','+a.lat+';'+b.lng+','+b.lat+'?overview=full&geometries=geojson';
  var ctl=new AbortController(),t=setTimeout(function(){ctl.abort()},5000);
  return fetch(u,{signal:ctl.signal}).then(function(r){return r.json()}).then(function(j){clearTimeout(t);return j.routes[0].geometry.coordinates})
    .catch(function(){return null});
}
function dist(p,q){var r=Math.PI/180,x=(q[0]-p[0])*r*Math.cos((p[1]+q[1])*r/2),y=(q[1]-p[1])*r;return Math.sqrt(x*x+y*y)*6371000}
var legs=[0,1,2].map(function(i){return[[N[i].lng,N[i].lat],[N[i+1].lng,N[i+1].lat]]});
var cum=[];function meas(i){var c=[0];for(var k=1;k<legs[i].length;k++)c.push(c[k-1]+dist(legs[i][k-1],legs[i][k]));cum[i]=c}
legs.forEach(function(_,i){meas(i)});
function feat(c){return{type:'Feature',geometry:{type:'LineString',coordinates:c}}}
var drawn=false;
function draw(){
  if(drawn)return;drawn=true;
  legs.forEach(function(pts,i){
    var done=i<R;
    map.addSource('l'+i,{type:'geojson',data:feat(pts)});
    if(done)map.addLayer({id:'g'+i,type:'line',source:'l'+i,layout:{'line-cap':'round','line-join':'round'},paint:{'line-color':'#0A9C8A','line-width':11,'line-opacity':.22,'line-blur':3}});
    map.addLayer({id:'c'+i,type:'line',source:'l'+i,layout:{'line-cap':'round','line-join':'round'},paint:{'line-color':'#fff','line-width':done?9:7,'line-opacity':.9}});
    map.addLayer({id:'l'+i,type:'line',source:'l'+i,layout:{'line-cap':done?'round':'butt','line-join':'round'},
      paint:done?{'line-color':'#0A9C8A','line-width':5}:{'line-color':'#3E5B57','line-width':3.5,'line-dasharray':[1.2,1.8]}});
    leg(N[i],N[i+1]).then(function(c){if(!c)return;legs[i]=c;meas(i);map.getSource('l'+i).setData(feat(c))});
  });
  if(R>=legs.length)return;
  var el=document.createElement('div');el.className='item';
  var dot=new maplibregl.Marker({element:el}).setLngLat(legs[R][0]).addTo(map);
  var t0=performance.now(),DUR=9000;
  (function tick(now){
    var pts=legs[R],c=cum[R],total=c[c.length-1];
    var d=(((now-t0)%DUR)/DUR)*total,k=1;
    while(k<c.length-1&&c[k]<d)k++;
    var f=(d-c[k-1])/Math.max(c[k]-c[k-1],1e-6);
    dot.setLngLat([pts[k-1][0]+(pts[k][0]-pts[k-1][0])*f,pts[k-1][1]+(pts[k][1]-pts[k-1][1])*f]);
    requestAnimationFrame(tick);
  })(t0);
}
map.on('style.load',draw);map.on('load',draw);map.on('styledata',function(){if(map.isStyleLoaded())draw()});
if(map.isStyleLoaded())draw();
</script></body></html>`;
}
