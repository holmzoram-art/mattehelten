// Mattehelten – figurer laget med Meshy, vist som animerte bildestriper og stillbilder. Emoji er alltid reserven.
// Alle js-filer deler globalt navnerom (vanlige <script>-tagger i fast rekkefølge, se index.html).
//
// Registeret er FIG_DATA i js/figdata.js (generert av tools/figsync.js fra img/fig/manifest.json). Ny figur: kopier filene til
// img/fig/ (<id>-<anim>.webp), legg den inn i manifest.json og kjør `node tools/figsync.js`. Koden trenger ingen endring.
// Bildene: img/fig/<id>-<anim>.webp er én vannrett stripe med n kvadratiske rammer (n=1 er stillbilde); <id>-poster.webp er
// heltens plakat; s-/p-/h-atlas.webp er venner, pets og helteplakater. ?v=<hash> i adressen, så filene kan caches for alltid.
//
// To måter å tegne på (elementet beholder alltid emojien sin som tekst, bildet legges bare oppå):
//  1) Bosser og monstre (#enemy-avatar, #bi-emoji, #br-emoji, boss-porten, kista, historien): figSet tegner i ::before (klassen fig),
//     og emojien får font-size 0. Elementets egne CSS-animasjoner (hopp, treff, flukt) virker som før.
//  2) Helter, venner og pets: et eget lag <i class="fig-l"> inni elementet, fordi ::before, ::after og bakgrunnen der brukes av
//     hatt, pet, rangkrone og CSS-vinger. Elementet får data-fig-l (attributt, så className-bytter ikke fjerner det), og emojien skjules
//     med color:transparent, så em-størrelsene til hatt og pet stemmer. En MutationObserver legger laget tilbake når annen kode
//     skriver textContent. Laget vises først når bildet er lastet; til da står emojien.
// Lat lasting: ingenting lastes før load + requestIdleCallback (maks 1 s). Køen figWarm har prioritet (0 = på skjermen nå,
// 1 = neste sannsynlige, 2 = senere) og høyst 2 samtidige nedlastinger. Bosser lastes bare når de kan dukke opp.
// Bare emoji: uten Image (tester), innstillingen fig='emoji' (foreldresiden), navigator.connection.saveData eller 2G.
// Redusert bevegelse: ramme 0 (fall/«hold»: siste ramme). Kroker med typeof-vern i core.js, battle.js, fx.js, boss.js, review.js,
// maps.js, progression.js og fun.js.
const FIG={},FIG_ATLAS={},FIG_FILES={},FIG_MONS={},FIG_DIM={};
const FIG_BOSS={1:'troll',2:'orm'}; // klassetrinn -> figur for bossen
const FIG_TROLL='troll';            // «Trollet er tilbake!»
const FIG_HEROES=['wizard','super','ninja','fairy','robot','fox','dragon','dino','unicorn','astro']; // CHARS-indeks -> heltens key
const FIG_STORY={villain:'n-nullius',zero:'n-nullius-0'};
function figRegister(M){
  if(!M||typeof M!=='object')return 0;let n=0;
  Object.assign(FIG_FILES,M.files||{});Object.assign(FIG_ATLAS,M.atlas||{});
  Object.keys(M.figs||{}).forEach(id=>{const f=M.figs[id];if(!f||!f.anims||!f.anims.idle)return;FIG[id]=f;if(f.tid)FIG_MONS[f.tid]=id;n++;});
  return n;
}
if(typeof FIG_DATA==='object')figRegister(FIG_DATA);

// ---- Av eller på ----
function figNet(){try{const c=typeof navigator!=='undefined'&&navigator.connection;return !!(c&&(c.saveData||/(^|-)2g$/.test(c.effectiveType||'')));}catch(e){return false;}}
function figOn(){
  if(typeof Image!=='function'||typeof document==='undefined'||!document.body)return false;
  try{if(typeof getSetting==='function'&&getSetting('fig')==='emoji')return false;}catch(e){}
  return !figNet();
}
function figRM(){try{return !!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);}catch(e){return false;}}

// ---- Filer og kø ----
function figFile(id,a){return `${id}-${a}.webp`;}
function figSrc(file){const v=FIG_FILES[file];return v?`img/fig/${file}?v=${v}`:null;}
function figSrcOf(id,a){return FIG[id]&&(a==='poster'?FIG[id].poster:FIG[id].anims[a])?figSrc(figFile(id,a)):null;}
function figAbs(src){try{return new URL(src,document.baseURI).href;}catch(e){return src;}} // url() i variabler løses ellers fra css-mappen
const FIG_IMG={}; // src -> 0 i kø, 1 laster, true lastet, false feilet
let FIG_Q=[],FIG_RUN=0,FIG_GO=false,FIG_SEQ=0;
function figHave(src){return !!src&&FIG_IMG[src]===true;}
// Legg filer i køen. Allerede i kø: prioriteten kan bare gå opp. Gir antall nye.
function figWarm(list,prio){
  if(!figOn())return 0;prio=prio==null?2:prio;let n=0;
  (list||[]).forEach(src=>{if(!src)return;const s=FIG_IMG[src];if(s===true||s===false||s===1)return;
    const q=FIG_Q.find(x=>x.src===src);if(q){if(prio<q.prio)q.prio=prio;return;}
    FIG_IMG[src]=0;FIG_Q.push({src,prio,seq:FIG_SEQ++});n++;});
  figPump();return n;
}
function figPump(){
  if(!FIG_GO)return;
  while(FIG_RUN<2&&FIG_Q.length){
    FIG_Q.sort((a,b)=>a.prio-b.prio||a.seq-b.seq);
    const j=FIG_Q.shift(),im=new Image();FIG_RUN++;FIG_IMG[j.src]=1;
    const end=ok=>{if(FIG_IMG[j.src]!==1)return;FIG_IMG[j.src]=ok;if(ok)FIG_DIM[j.src]={w:im.naturalWidth,h:im.naturalHeight};FIG_RUN--;figRefresh(j.src);figPump();};
    im.onload=()=>end(true);im.onerror=()=>end(false);im.decoding='async';im.src=j.src;
  }
}
function figStart(){if(FIG_GO)return;FIG_GO=true;FIG_LATER.splice(0).forEach(n=>{const f=FIG_SCR[n];if(f)figOnScreen(n,f);});figPump();}
if(typeof window!=='undefined'&&window.addEventListener&&typeof document!=='undefined'){ // ikke i den kritiske stien
  const go=()=>{try{if(typeof window.requestIdleCallback==='function')window.requestIdleCallback(figStart,{timeout:1000});else setTimeout(figStart,300);}catch(e){figStart();}};
  if(document.readyState==='complete')go();else window.addEventListener('load',go);
}
// Et bilde er ferdig: tegn elementene som venter på det
const FIG_PETW=new Set(); // elementer der pet-bildet venter på atlaset
let FIG_PICK=null;        // heltevalget: win-stripen som ble trykket på, men ikke var lastet
function figRefresh(src){try{document.querySelectorAll('[data-fig-want]').forEach(el=>{const s=el._fig;if(s&&s.need&&s.need.includes(src))figPaint(el);});
  const P=FIG_PICK;if(P&&P.src===src){FIG_PICK=null;if(Date.now()-P.t<1500&&typeof figPick==='function')figPick(P.el,P.i);}
  [...FIG_PETW].forEach(el=>{if(!el.isConnected)FIG_PETW.delete(el);else if(typeof figPetDecor==='function')figPetDecor(el);});}catch(e){}}

// ---- Tegning ----
function figStyle(t,src,n,ms,cls){
  t.style.setProperty('--fig-img',`url("${figAbs(src)}")`);t.style.setProperty('--fig-n',n);t.style.setProperty('--fig-n1',Math.max(1,n-1));
  t.style.setProperty('--fig-ms',(ms||1000)+'ms');t.style.removeProperty('--fig-bs');t.style.removeProperty('--fig-bp');
  ['fig-still','fig-once','fig-hold','fig-f0'].forEach(c=>t.classList.toggle(c,cls.includes(c)));
}
function figLayer(el){
  let L=el._figL;if(!L){L=document.createElement('i');L.className='fig-l';L.setAttribute('aria-hidden','true');el._figL=L;}
  if(L.parentNode!==el)el.appendChild(L);el.setAttribute('data-fig-l','');
  if(!el._figMO&&typeof MutationObserver==='function'){el._figMO=new MutationObserver(()=>{const l=el._figL;if(l&&el.hasAttribute('data-fig-l')&&l.parentNode!==el)el.appendChild(l);});el._figMO.observe(el,{childList:true});}
  return L;
}
function figUnlayer(el){if(!el||!el.removeAttribute)return;el.removeAttribute('data-fig-l');el.removeAttribute('data-fig-r');if(el._figL&&el._figL.parentNode===el)el.removeChild(el._figL);}
function figClear(el){
  if(!el||!el.classList)return;clearTimeout(el._figT);el._fig=null;el._figSrc=null;
  el.classList.remove('fig','fig-once','fig-alt','fig-still','fig-hold','fig-f0');
  if(el.dataset){delete el.dataset.figWant;delete el.dataset.figAnim;}
  figUnlayer(el);
}
// Tegn spesifikasjonen el._fig: {m:'bg'|'l', id, anim, opts} eller {m:'bg'|'l', atlas:'s'|'p'|'h', item}. Gir true når et bilde vises.
function figPaint(el){
  const s=el&&el._fig;if(!s)return false;const layer=s.m==='l';
  if(s.atlas){ // stillbilde fra et atlas (venner, pets, helteplakater)
    const A=FIG_ATLAS[s.atlas],it=A&&A.items&&A.items[s.item],src=A&&figSrc(A.file);s.need=[src];
    if(!it||!figHave(src)){if(layer)figUnlayer(el);return false;}
    const t=layer?figLayer(el):el,c=A.cell||128,d=FIG_DIM[src]||{w:A.w||c,h:A.h||c};
    if(!layer)el.classList.add('fig');
    if(el._figSrc!==src+'#'+s.item){figStyle(t,src,1,0,['fig-still']);t.style.setProperty('--fig-bs',`calc(var(--fs) * ${d.w/c}) calc(var(--fs) * ${d.h/c})`);t.style.setProperty('--fig-bp',`calc(var(--fs) * ${-it[0]/c}) calc(var(--fs) * ${-it[1]/c})`);el._figSrc=src+'#'+s.item;}
    return true;
  }
  const f=FIG[s.id];if(!f){figClear(el);return false;}
  let o=s.opts||{},a=s.anim,src=figSrcOf(s.id,a);const idle=figSrcOf(s.id,a==='poster'?'poster':'idle');s.need=[src,idle];
  if(!figHave(src)){ // vis idle mens den andre lastes; en «én gang»-animasjon som ikke er klar ennå, hoppes over
    if(o.once||o.hold){s.anim='idle';s.opts=o={};}
    if(!figHave(idle)){if(layer)figUnlayer(el);else el.classList.remove('fig');return false;}
    a=a==='poster'?'poster':'idle';src=idle;
  }
  const x=a==='poster'?{n:1,ms:0}:f.anims[a],still=x.n<=1,cls=still?['fig-still']:o.f0?['fig-f0']:[];
  if(!still&&a===s.anim&&(o.once||o.hold))cls.push('fig-once');if(!still&&o.hold&&a===s.anim)cls.push('fig-hold');
  const t=layer?figLayer(el):el,key=src+'|'+cls.join(' ');
  if(!layer){el.classList.add('fig');el.dataset.figAnim=a;}
  if(layer&&f.rank!=null)el.setAttribute('data-fig-r',String(f.rank));
  const hd=a==='poster'&&f.ptop?f.ptop:f.top; // plakaten har egen, tettere ramme
  if(layer&&hd){el.style.setProperty('--fig-hx',hd.x);el.style.setProperty('--fig-hy',hd.y);} // hatt og krone på hodet (figures.css)
  const once=cls.includes('fig-once');
  if(el._figSrc!==key||(once&&s.fresh)){ // ny stripe, eller en «én gang»-animasjon som er bedt om på nytt
    figStyle(t,src,x.n,x.ms,cls);t.classList.toggle('fig-alt',!t.classList.contains('fig-alt')); // nytt keyframes-navn: animasjonen starter på nytt
    el._figSrc=key;clearTimeout(el._figT);
    if(once&&!o.hold){const want=s;el._figT=setTimeout(()=>{if(el._fig===want){el._fig=Object.assign({},want,{anim:o.then||'idle',opts:{}});figPaint(el);}},(x.ms||600)+40);}
  }
  s.fresh=false;
  return true;
}
// Felles: sett spesifikasjonen, legg det som trengs først i køen, og tegn
function figUse(el,spec,warm){
  if(!el||!el.classList)return false;
  if(!figOn()){figClear(el);return false;}
  if(el._fig&&el._fig.m!==spec.m)figClear(el);
  spec.fresh=true;el._fig=spec;if(el.dataset)el.dataset.figWant=spec.id||spec.atlas;
  const now=spec.atlas?[FIG_ATLAS[spec.atlas]&&figSrc(FIG_ATLAS[spec.atlas].file)]:[figSrcOf(spec.id,spec.anim),figSrcOf(spec.id,spec.anim==='poster'?'poster':'idle')];
  figWarm(now,0);if(warm)figWarm(warm,2);
  return figPaint(el);
}

// ---- Bosser og monstre (::before) ----
// Viser figur id med animasjon anim. opts.once: spill én gang; opts.then: animasjon etterpå (standard idle); opts.hold: bli på siste ramme;
// opts.f0: stå stille på ramme 0 (plakat fra en stripe)
function figSet(el,id,anim,opts){
  if(!el)return false;const f=FIG[id];if(!f){figClear(el);return false;}
  anim=f.anims[anim]?anim:'idle';opts=opts||{};
  return figUse(el,{m:'bg',id,anim,opts},opts.f0?null:Object.keys(f.anims).map(a=>figSrcOf(id,a))); // resten av stripene trengs snart (kamp)
}
function figBossId(g){return typeof S!=='undefined'&&S&&S.troll?FIG_TROLL:FIG_BOSS[g]||null;}
function figBoss(el,g,anim,opts){const id=figBossId(g);if(!id||!FIG[id]){figClear(el);return false;}return figSet(el,id,anim||'idle',opts);}
function figBossIntro(g){const el=document.getElementById('bi-emoji'),id=g==='troll'?FIG_TROLL:FIG_BOSS[g];if(id&&FIG[id])figSet(el,id,'taunt',{once:true});else figClear(el);}
// Boss-porten på temakartet: bossens ramme 0 (bare når den er åpen og ikke slått, ellers emoji)
function figBossGate(el,g,open){const id=FIG_BOSS[g];if(!el||!id||!FIG[id]||!open){figClear(el);return false;}return figSet(el,id,'idle',{f0:true});}
// Temaets monster (stillbilde fra 2D): state 'idle' eller 'au'
function figMonId(tid){return FIG_MONS[tid]||null;}
function figMon(el,g,tid,state){const id=figMonId(tid);if(!el||!id){figClear(el);return false;}return figSet(el,id,state==='au'&&FIG[id].anims.au?'au':'idle');}
// Historien og slutten: Nullius og «liten null»
function figStill(el,id){if(!el||!FIG[id]){figClear(el);return false;}return figSet(el,id,'idle');}
function figStory(){
  try{document.querySelectorAll('.story-villain').forEach(e=>figStill(e,FIG_STORY.villain));
    document.querySelectorAll('.end-morph').forEach(m=>{const s=m.querySelectorAll('span');if(s[0])figStill(s[0],FIG_STORY.villain);const z=m.querySelector('.end-zero');if(z)figStill(z,FIG_STORY.zero);});}catch(e){}
}

// ---- Helter (eget lag) ----
function figHeroKey(i){if(i==null)i=typeof getCharIdx==='function'?getCharIdx():0;return FIG_HEROES[i]||null;}
// Høyeste rang som finnes for helten, høyst rank (standard: rangen nå). Ingen: null (emoji)
function figHeroId(rank,key){
  key=key||figHeroKey();if(!key)return null;
  let r=rank==null?(typeof getEvoTier==='function'?getEvoTier():0):+rank||0;
  for(r=Math.min(4,Math.max(0,r));r>=0;r--)if(FIG[`h-${key}-r${r}`])return `h-${key}-r${r}`;
  return null;
}
// Helten i elementet. anim: idle|atk|block|win (mangler: behold animasjonen som går, ellers idle). opts: once, then, hold, rank, key
function figHero(el,anim,opts){
  opts=opts||{};const id=figHeroId(opts.rank,opts.key);
  if(!el||!id){figClear(el);return false;}
  const cur=el._fig&&el._fig.m==='l'&&el._fig.id===id?el._fig:null;
  if(anim==null){if(cur)return figPaint(el);anim='idle';}
  if(!FIG[id].anims[anim])anim='idle';
  const warm=el.id==='player-avatar'?['atk','block'].map(a=>figSrcOf(id,a)):null; // kampen trenger angrep og blokk snart
  return figUse(el,{m:'l',id,anim,opts:{once:!!opts.once,then:opts.then,hold:!!opts.hold}},warm);
}
// Heltens plakat (ett lite bilde) i rangen nå; uten plakat: emoji
function figHeroPoster(el,opts){
  opts=opts||{};const id=figHeroId(opts.rank,opts.key);
  if(!el||!id||!FIG[id].poster){figClear(el);return false;}
  if(el._fig&&el._fig.id===id&&el._fig.anim==='poster')return figPaint(el);
  return figUse(el,{m:'l',id,anim:'poster',opts:{}});
}
// Heltevalget: plakat for helt i (atlas h hvis det finnes, ellers plakaten til rang 0)
function figHeroCard(el,i){
  const k=FIG_HEROES[i];if(!el||!k){figClear(el);return false;}
  const A=FIG_ATLAS.h;if(A&&A.items&&A.items[k])return figUse(el,{m:'l',atlas:'h',item:k});
  return figHeroPoster(el,{key:k,rank:0});
}
// Kjør fn når skjermen vises (med en gang hvis den alt vises), så skjulte skjermer ikke laster bilder
const FIG_SCR={},FIG_LATER=[];
function figOnScreen(n,fn){
  const el=typeof document!=='undefined'&&document.getElementById('screen-'+n);if(!el||!el.classList)return;
  if(!FIG_GO){FIG_SCR[n]=fn;FIG_LATER.push(n);return;} // før start: sjekk igjen når figurene starter (oppstarten bytter skjerm)
  if(el.classList.contains('active')){FIG_SCR[n]=null;fn();return;}
  FIG_SCR[n]=fn;if(el._figScr||typeof MutationObserver!=='function')return;
  el._figScr=new MutationObserver(()=>{const f=FIG_SCR[n];if(f&&el.classList.contains('active')){FIG_SCR[n]=null;f();}});
  el._figScr.observe(el,{attributes:true,attributeFilter:['class']});
}
function figCharGrid(){figOnScreen('chars',()=>{try{document.querySelectorAll('#char-grid .char-card .char-emoji').forEach((e,i)=>figHeroCard(e,i));}catch(e){}});}
// Trykk på en helt i heltevalget: win én gang (hentes nå), så plakaten igjen
function figPick(el,i){
  const k=FIG_HEROES[i],id=k&&figHeroId(0,k);if(!el||!id||!FIG[id].anims.win)return false;
  const win=figSrcOf(id,'win');
  if(!figHave(win)){FIG_PICK={el,i,src:win,t:Date.now()};figWarm([win],0);return false;} // spilles når den kommer (innen 1,5 s)
  figUse(el,{m:'l',id,anim:'win',opts:{once:true}});
  clearTimeout(el._figP);el._figP=setTimeout(()=>{if(el._fig&&el._fig.id===id)figHeroCard(el,i);},(FIG[id].anims.win.ms||1200)+60);
  return true;
}
// Neste rang (etter en boss-seier) og egen helt i kamp: legg i køen
function figWarmHero(rank){const id=figHeroId(rank);if(id)figWarm(['poster','idle','win','atk','block'].map(a=>figSrcOf(id,a)),1);}

// ---- Venner og pets (atlas) ----
function figSidekick(el,idx){if(!el)return false;const A=FIG_ATLAS.s;if(!A||!A.items||!A.items[String(idx)]){figClear(el);return false;}return figUse(el,{m:'l',atlas:'s',item:String(idx)});}
function figPet(el,pid){if(!el)return false;const A=FIG_ATLAS.p;if(!A||!A.items||!A.items[pid]){figClear(el);return false;}return figUse(el,{m:'l',atlas:'p',item:pid});}
// Pet ved siden av helten ([data-pg-pet]::after): bildet settes via data-pg-pet-img og variabler (CSS i figures.css)
function figPetDecor(el){
  if(!el||!el.getAttribute)return false;const e=el.getAttribute('data-pg-pet'),A=FIG_ATLAS.p;
  const it=e&&A&&typeof PG_ITEMS!=='undefined'?PG_ITEMS.find(i=>i.slot==='pet'&&i.emoji===e):null,pos=it&&A.items&&A.items[it.id],src=pos&&figSrc(A.file);
  if(!pos||!figOn()){el.removeAttribute('data-pg-pet-img');return false;}
  if(!figHave(src)){FIG_PETW.add(el);figWarm([src],1);el.removeAttribute('data-pg-pet-img');return false;} // figRefresh prøver igjen
  FIG_PETW.delete(el);const c=A.cell||128,d=FIG_DIM[src]||{w:A.w||c,h:A.h||c};
  el.style.setProperty('--pet-img',`url("${figAbs(src)}")`);
  el.style.setProperty('--pet-bs',`calc(var(--ps) * ${d.w/c}) calc(var(--ps) * ${d.h/c})`);el.style.setProperty('--pet-bp',`calc(var(--ps) * ${-pos[0]/c}) calc(var(--ps) * ${-pos[1]/c})`);
  el.setAttribute('data-pg-pet-img','');return true;
}

// ---- Neste sannsynlige: egen helt i kamp og monsteret (eller bossen) bak «Gå til kamp» ----
function figWarmNext(){
  if(!figOn())return 0;const L=[];const h=figHeroId();
  if(h)['idle','atk','block'].forEach(a=>L.push(figSrcOf(h,a)));
  let n=null;try{if(typeof nextFight==='function')n=nextFight();}catch(e){}
  if(n&&n.topic){const id=figMonId(n.topic.id);if(id)L.push(figSrcOf(id,'idle'),figSrcOf(id,'au'));}
  if(n&&(n.boss||n.troll)){const id=n.troll?FIG_TROLL:FIG_BOSS[n.g];if(id&&FIG[id])L.push(figSrcOf(id,'idle'),figSrcOf(id,'taunt'));}
  return figWarm(L,1);
}

// ---- Foreldreinnstillingen «Figurer: 3D / emoji» er endret ----
function figSetting(){
  if(!figOn()){try{document.querySelectorAll('[data-fig-want]').forEach(figClear);document.querySelectorAll('[data-pg-pet-img]').forEach(e=>e.removeAttribute('data-pg-pet-img'));}catch(e){}return false;}
  try{if(typeof renderHUD==='function')renderHUD();if(typeof updateSidekick==='function')updateSidekick();figCharGrid();}catch(e){}
  figWarmNext();return true;
}
