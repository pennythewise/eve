import { DOE_NEARBY, USER_POS } from '../data/demo';
import { MAP_STYLE_JS } from './mapStyle';

// MapLibre page (OpenStreetMap raster tiles) for the Recycle tab: DOE points, the user, and a driver marker driven by postMessage({ driver }).
export function recycleMapHtml() {
  return `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
<link rel="stylesheet" href="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css">
<style>
html,body,#m{margin:0;height:100%;background:#E6F3F0;font-family:Inter,system-ui,sans-serif}
.maplibregl-ctrl-attrib{font-size:8px}
.doe{width:32px;height:42px;filter:drop-shadow(0 2px 3px rgba(0,0,0,.4));cursor:pointer}.doe svg{display:block}.dot{width:14px;height:14px;border-radius:50%;background:#0A9C8A;border:2.5px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,.4);cursor:pointer}
.me{width:18px;height:18px;border-radius:50%;background:#2F6FED;border:3px solid #fff;box-shadow:0 0 0 6px rgba(47,111,237,.25)}
.drv{width:34px;height:34px;border-radius:50%;background:#054F49;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center}
.pop b{font-size:13px;color:#0B2B28}.pop div{font-size:12px;color:#5E7B77;margin-top:2px}.pop a{display:inline-block;margin-top:6px;color:#0A9C8A;font-weight:600;font-size:12px;text-decoration:none}
</style></head><body><div id="m"></div>
<script src="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js"></script>
<script>
var P=${JSON.stringify(DOE_NEARBY.map((p) => ({ n: p.name, a: p.area, km: p.km, h: p.hours, t: p.phone, i: p.items, lat: p.lat, lng: p.lng })))},U=${JSON.stringify(USER_POS)};
var map=new maplibregl.Map({container:'m',style:${MAP_STYLE_JS},center:[U.lng,U.lat],zoom:12.5,attributionControl:{compact:true}});
var fb=new maplibregl.LngLatBounds([U.lng,U.lat],[U.lng,U.lat]);P.slice(0,3).forEach(function(p){fb.extend([p.lng,p.lat])});fb.extend([101.642,3.095]);
map.fitBounds(fb,{padding:{top:50,bottom:30,left:40,right:40},maxZoom:14,duration:0});
P.forEach(function(p,i){
  var el=document.createElement('div'),big=i<3;
  if(big){el.className='doe';
    el.innerHTML='<svg width="32" height="42" viewBox="0 0 32 42"><path d="M16 40.5C16 40.5 3 26 3 15a13 13 0 0 1 26 0c0 11-13 25.5-13 25.5z" fill="#0A9C8A" stroke="#fff" stroke-width="2.5"/><text x="16" y="20" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-weight="700" font-size="14" fill="#fff">'+String.fromCharCode(65+i)+'</text></svg>';
  }else el.className='dot';
  var info='<div class="pop"><b>'+p.n+'</b><div>'+p.a+' · '+p.km+' km'+(p.h?' · '+p.h:'')+'</div>'+(p.t?'<div>Tel '+p.t+'</div>':'')+(p.i&&p.i.length?'<div>Accepts: '+p.i.join(', ')+'</div>':'')+'<a target="_blank" href="https://www.google.com/maps/dir/?api=1&destination='+p.lat+','+p.lng+'">Directions</a></div>';
  var pop=new maplibregl.Popup({offset:big?[0,-36]:[0,-8],closeButton:false,maxWidth:'220px'}).setHTML(info);
  new maplibregl.Marker({element:el,anchor:big?'bottom':'center'}).setLngLat([p.lng,p.lat]).setPopup(pop).addTo(map);
});
var me=document.createElement('div');me.className='me';new maplibregl.Marker({element:me}).setLngLat([U.lng,U.lat]).addTo(map);
var dEl=document.createElement('div');dEl.className='drv';
dEl.innerHTML='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>';
var drv=null,cur=null,tgt=null;
function raf(){if(drv&&cur&&tgt){cur[0]+=(tgt[0]-cur[0])*.12;cur[1]+=(tgt[1]-cur[1])*.12;drv.setLngLat(cur)}requestAnimationFrame(raf)}raf();
var pending=null,ready=false;
function apply(m){
  var d=m&&m.driver;
  if(!d){if(drv){drv.remove();drv=null;cur=null;tgt=null}return}
  tgt=[d.lng,d.lat];
  if(!drv){cur=tgt.slice();drv=new maplibregl.Marker({element:dEl}).setLngLat(cur).addTo(map)}
}
window.__msg=function(m){if(ready)apply(m);else pending=m};
window.addEventListener('message',function(e){try{window.__msg(JSON.parse(e.data))}catch(_){}});
map.on('load',function(){ready=true;if(pending)apply(pending)});
</script></body></html>`;
}
