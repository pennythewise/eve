// The /sim demo controller page, served as one plain HTML document.
export const simPage = `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>EVE demo controller</title>
<script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"></script>
<style>
:root{--p:#0A9C8A;--pd:#067A6D;--deep:#054F49;--soft:#D9F3EE;--bg:#F4FAF9;--t:#0B2B28;--m:#5E7B77;--b:#DCEBE8;--d:#D64545}
*{box-sizing:border-box}body{margin:0;font-family:Inter,system-ui,sans-serif;background:var(--bg);color:var(--t);padding:28px}
h1{margin:0 0 4px;font-size:28px}.sub{color:var(--m);margin-bottom:22px}
.grid{display:grid;grid-template-columns:1.2fr 1fr;gap:20px;max-width:1100px}@media(max-width:860px){.grid{grid-template-columns:1fr}}
.card{background:#fff;border-radius:20px;padding:22px;box-shadow:0 2px 8px rgba(0,0,0,.06)}
.stage{background:linear-gradient(135deg,var(--p),var(--deep));color:#fff;border-radius:20px;padding:22px;margin-bottom:20px}
.stage .n{font-size:64px;font-weight:700;line-height:1}.stage .l{font-size:20px;margin-top:6px;opacity:.95}
.steps{display:flex;gap:6px;margin-top:16px}.steps i{flex:1;height:8px;border-radius:4px;background:rgba(255,255,255,.25)}.steps i.on{background:#fff}
.row{display:flex;gap:12px;margin-bottom:12px}
button{font:inherit;font-weight:600;border:0;border-radius:16px;padding:20px 18px;font-size:20px;cursor:pointer;flex:1}
.next{background:var(--p);color:#fff;font-size:26px;padding:28px}.next:active{background:var(--pd)}
.back{background:#fff;color:var(--p);border:2px solid var(--p)}.reset{background:#fff;color:var(--d);border:2px solid var(--d)}
.tg{display:flex;align-items:center;justify-content:space-between;padding:16px 4px;border-top:1px solid var(--b);font-size:18px;cursor:pointer}
.sw{width:54px;height:30px;border-radius:15px;background:var(--b);position:relative;transition:.2s}.sw::after{content:"";position:absolute;left:3px;top:3px;width:24px;height:24px;border-radius:12px;background:#fff;transition:.2s}
.on .sw{background:var(--d)}.on .sw::after{left:27px}
.qrs{display:flex;flex-wrap:wrap;gap:16px}.qr{text-align:center;font-size:14px;color:var(--m)}.qr canvas{border:1px solid var(--b);border-radius:12px}
.chip{display:inline-block;padding:4px 12px;border-radius:99px;background:var(--soft);color:var(--pd);font-weight:600;font-size:14px}
h3{margin:0 0 12px}
</style></head><body>
<h1>EVE demo controller</h1><div class="sub">Press Next step and watch the phone update within 2 seconds.</div>
<div class="grid"><div>
<div class="stage"><div class="n" id="n">0</div><div class="l" id="l"></div><div class="steps" id="steps"></div></div>
<div class="card"><div class="row"><button class="back" onclick="act('back')">Back</button><button class="next" onclick="act('next')" style="flex:2">Next step</button></div>
<div class="row"><button class="reset" onclick="act('reset')">Reset</button></div>
<h3 style="margin-top:18px">Story toggles</h3>
<div class="tg" id="t-weightShortfall" onclick="tg('weightShortfall')"><span>Weight shortfall</span><span class="sw"></span></div>
<div class="tg" id="t-unlicensedRecycler" onclick="tg('unlicensedRecycler')"><span>Unlicensed recycler</span><span class="sw"></span></div>
<div class="tg" id="t-tamper" onclick="tg('tamper')"><span>Tamper</span><span class="sw"></span></div>
<div style="margin-top:10px"><span class="chip" id="hs"></span></div></div></div>
<div class="card"><h3>QR codes for Scan QR</h3><div class="qrs" id="qrs"></div></div></div>
<script>
var LABELS=${JSON.stringify([
  'Fresh start', 'Item registered', 'Pickup requested', 'Driver assigned', 'On the way',
  'Picked up', 'At DOE collection point', 'At licensed recycler', 'Material recovered', 'Received by manufacturer',
])};
var QRS=[["Driver Aiman","eve:driver:AIMAN"],["Collection point (nearest)","eve:point:DOE-NEAREST"],["Collection point (2nd nearest)","eve:point:DOE-SECOND"]];
function render(s){
  document.getElementById('n').textContent=s.stage;document.getElementById('l').textContent=LABELS[s.stage];
  document.getElementById('steps').innerHTML=LABELS.map(function(_,i){return '<i class="'+(i<=s.stage?'on':'')+'"></i>'}).join('');
  ['weightShortfall','unlicensedRecycler','tamper'].forEach(function(k){document.getElementById('t-'+k).className='tg'+(s[k]?' on':'')});
  document.getElementById('hs').textContent=s.handoverSigned?'Handover signed on phone':'Waiting for phone to scan driver QR';
}
function post(p,b){return fetch(p,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b||{})}).then(function(r){return r.json()}).then(render)}
function act(a){post('/api/sim/'+a)}function tg(k){post('/api/sim/toggle',{key:k})}
setInterval(function(){fetch('/api/state').then(function(r){return r.json()}).then(render)},1000);
fetch('/api/state').then(function(r){return r.json()}).then(render);
var q=document.getElementById('qrs');
QRS.forEach(function(x){var d=document.createElement('div');d.className='qr';var c=document.createElement('canvas');d.appendChild(c);d.appendChild(document.createElement('br'));d.appendChild(document.createTextNode(x[0]));q.appendChild(d);QRCode.toCanvas(c,x[1],{width:170,margin:1})});
</script></body></html>`;
