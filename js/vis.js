// Mattehelten – Bilder i oppgaver og hint (tierramme, prikker, tallinje, klokke …)
// Alle js-filer deler globalt navnerom (vanlige <script>-tagger i fast rekkefølge, se index.html).
//
// Oppgaver kan ha qd.vis = {kind:'<navn>', ...}. renderVis(v) gir HTML-streng ('' hvis ukjent).
// Nye typer registreres fra hvilken som helst fil:  VIS.minType = v => '<div>…</div>';
// (Bruk alltid window.VIS – aldri const/let/var VIS – så filene ikke kolliderer.)
window.VIS=window.VIS||{};
function renderVis(v){
  if(!v||!v.kind)return '';
  const f=window.VIS[v.kind];
  if(typeof f!=='function')return '';
  try{return f(v)||'';}catch(e){console.warn('renderVis',v.kind,e);return '';}
}
