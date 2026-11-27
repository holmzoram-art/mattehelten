// Mattehelten – Delte innstillinger og datohjelper (brukes av flere moduler)
// Alle js-filer deler globalt navnerom (vanlige <script>-tagger i fast rekkefølge, se index.html).

// mh_settings: { tts:'auto'|'on'|'off', session:<runder per økt>, startGrade:1|2 }
//   tts 'auto' = opplesing på for 1.–2. klasse, av ellers.
const MH_SETTINGS_DEFAULT={tts:'auto',session:4,startGrade:1};
function mhSettings(){try{const s=JSON.parse(localStorage.getItem('mh_settings')||'{}');return s&&typeof s==='object'?s:{};}catch(e){return {};}}
function getSetting(k){const s=mhSettings();return k in s?s[k]:MH_SETTINGS_DEFAULT[k];}
function setSetting(k,v){const s=mhSettings();s[k]=v;localStorage.setItem('mh_settings',JSON.stringify(s));}

// Lokal dato som 'YYYY-MM-DD' (off = antall dager fra i dag)
function mhDay(off){const d=new Date();d.setDate(d.getDate()+(off||0));return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
// Trygg JSON-lesing fra localStorage
function mhLoad(k,def){try{const v=JSON.parse(localStorage.getItem(k));return v==null?def:v;}catch(e){return def;}}
function mhSave(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
