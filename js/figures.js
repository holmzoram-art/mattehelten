// Mattehelten – 3D-figurer (laget med Meshy) vist som animerte bildestriper, med emoji som reserve.
// Alle js-filer deler globalt navnerom (vanlige <script>-tagger i fast rekkefølge, se index.html).
//
// Bildene ligger i img/fig/<id>-<anim>.webp: én vannrett stripe med n kvadratiske rammer (gjennomsiktig).
// Figuren tegnes i ::before på elementet, så elementets egen tekst (emoji) og CSS-animasjoner (hopp, treff, flukt)
// virker som før. Mangler et bilde, eller er figuren ukjent, vises emojien som før.
const FIG={
  troll:{idle:{n:16,ms:1700},taunt:{n:16,ms:1600},hit:{n:12,ms:650},fall:{n:16,ms:1300}},
};
const FIG_BOSS={1:'troll'}; // klassetrinn -> figur for bossen
const FIG_TROLL='troll';    // «Trollet er tilbake!»
const FIG_OK={};            // id -> true (lastet) / false (feilet)
function figPreload(id){
  if(!FIG[id]||id in FIG_OK)return;
  if(typeof Image!=='function'){FIG_OK[id]=false;return;} // uten nettleser (tester): bruk emoji
  FIG_OK[id]=null;
  Object.keys(FIG[id]).forEach(a=>{const im=new Image();
    im.onload=()=>{if(a==='idle'&&FIG_OK[id]!==false){FIG_OK[id]=true;document.querySelectorAll(`[data-fig-want="${id}"]`).forEach(el=>figSet(el,id,el.dataset.figAnim||'idle'));}};
    im.onerror=()=>{if(a==='idle'){FIG_OK[id]=false;document.querySelectorAll(`[data-fig-want="${id}"]`).forEach(figClear);}};
    im.src=`img/fig/${id}-${a}.webp`;});
}
function figClear(el){if(!el)return;clearTimeout(el._figT);el.classList.remove('fig','fig-once','fig-alt');delete el.dataset.figWant;delete el.dataset.figAnim;}
// Viser figur id med animasjon anim. opts.once: spill én gang; opts.then: animasjon etterpå (standard idle), opts.hold: bli på siste ramme
function figSet(el,id,anim,opts){
  if(!el)return false;opts=opts||{};
  if(!FIG[id]){figClear(el);return false;}
  el.dataset.figWant=id;el.dataset.figAnim=anim;
  if(FIG_OK[id]!==true){figPreload(id);if(FIG_OK[id]===false)figClear(el);return false;} // vises når bildet er lastet
  const a=FIG[id][anim]||FIG[id].idle,name=FIG[id][anim]?anim:'idle';
  clearTimeout(el._figT);
  el.style.setProperty('--fig-img',`url("${new URL(`img/fig/${id}-${name}.webp`,document.baseURI).href}")`); // absolutt: url() i variabler løses ellers fra css-mappen
  el.style.setProperty('--fig-n',a.n);el.style.setProperty('--fig-n1',Math.max(1,a.n-1));el.style.setProperty('--fig-ms',a.ms+'ms');
  el.classList.add('fig');el.classList.toggle('fig-once',!!(opts.once||opts.hold));
  el.classList.toggle('fig-alt',!el.classList.contains('fig-alt')); // bytter keyframes-navn så animasjonen starter på nytt
  if(opts.once&&!opts.hold)el._figT=setTimeout(()=>{if(el.dataset.figWant===id&&el.dataset.figAnim===anim)figSet(el,id,opts.then||'idle');},a.ms+30);
  return true;
}
// Kroker brukt av boss.js / review.js (alle med typeof-vern der de kalles)
function figBossId(g){return S&&S.troll?FIG_TROLL:FIG_BOSS[g]||null;}
function figBoss(el,g,anim,opts){const id=figBossId(g);if(!id){figClear(el);return false;}return figSet(el,id,anim||'idle',opts);}
function figBossIntro(g){const el=document.getElementById('bi-emoji');const id=FIG_BOSS[g];if(id)figSet(el,id,'taunt',{once:true});else figClear(el);}
// Last bossbildene tidlig når et trinn har en figur, så de er klare til kampen
if(typeof window!=='undefined')setTimeout(()=>{try{Object.values(FIG_BOSS).forEach(figPreload);}catch(e){}},1500);
