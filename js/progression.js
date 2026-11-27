// Mattehelten – Progresjon: seremonier, butikk, streak, belønninger
// Alle js-filer deler globalt navnerom (vanlige <script>-tagger i fast rekkefølge, se index.html).

// ============================================================
// PROGRESSION
// ============================================================
// Makes progress visible: unlock ceremonies on the maps, rewards that count up, celebrations in the big moments
// (stars that fly in, BESTÅTT/MESTRET, boss win, the troll's crown), a NIVÅ OPP toast, next goals, a coin shop and play days.
// Hooks (one line each): renderHUD, buildGradeMap, buildTopicMap, showChest (pgChest),
// closeChest (pgChestClose), buildResults, openHeroCard, showBossResult/trollResult (pgBossResult), lvlFor (pgLvlSize).
// localStorage: mh_shop_owned, mh_shop_equipped, mh_pg_seen (unlocks already celebrated). Spilledager 🌙: prog.days (fun.js).
// Nivåkurven: prog.lv0 (første nivå med ny kurve, i mh_prog3).
// For the battle screen: getHeroDecor(), applyHeroDecor(el), heroVictoryFx(n).
const PG_SLOTS=[
  {id:'hat',name:'Hatter og kroner',icon:'🎩',desc:'En kul hatt til helten din!'},
  {id:'aura',name:'Auraer',icon:'✨',desc:'Helten din gløder!'},
  {id:'pet',name:'Kjæledyr',icon:'🐾',desc:'En liten venn som følger deg!'},
  {id:'fx',name:'Seierseffekter',icon:'🎉',desc:'Vises når du vinner!'},
];
// Prices vs. earning (fun.js): 2 🪙 per first-try right in a topic not yet mastered (1 when mastered), +5 per new ⭐ and per «Ny rekord!»
// → ~12–20 per round while learning; +25 for a first boss win, +5–15 per new play day
const PG_ITEMS=[
  {id:'cap',slot:'hat',emoji:'🧢',name:'Caps',price:10},
  {id:'sunhat',slot:'hat',emoji:'👒',name:'Solhatt',price:25},
  {id:'tophat',slot:'hat',emoji:'🎩',name:'Flosshatt',price:45},
  {id:'gradcap',slot:'hat',emoji:'🎓',name:'Studenthatt',price:70},
  {id:'crown',slot:'hat',emoji:'👑',name:'Kongekrone',price:100,boss:1},
  {id:'gold',slot:'aura',emoji:'✨',name:'Gullglød',price:20},
  {id:'fire',slot:'aura',emoji:'🔥',name:'Ildaura',price:50},
  {id:'ice',slot:'aura',emoji:'❄️',name:'Isaura',price:60},
  {id:'rainbow',slot:'aura',emoji:'🌈',name:'Regnbueaura',price:120,boss:2},
  {id:'galaxy',slot:'aura',emoji:'🌌',name:'Galakseaura',price:250},
  {id:'bow',slot:'pet',emoji:'🎀',name:'Sløyfe',price:12},
  {id:'chick',slot:'pet',emoji:'🐣',name:'Kyllingvenn',price:35},
  {id:'troll',slot:'pet',emoji:'🧌',name:'Trollvenn',price:60,boss:1},
  {id:'butterfly',slot:'pet',emoji:'🦋',name:'Sommerfugl',price:65},
  {id:'snake',slot:'pet',emoji:'🐍',name:'Ormevenn',price:90,boss:2},
  {id:'crab',slot:'pet',emoji:'🦀',name:'Krabbevenn',price:120,boss:3},
  {id:'unicorn',slot:'pet',emoji:'🦄',name:'Mini-enhjørning',price:300},
  {id:'stars',slot:'fx',emoji:'⭐',name:'Stjerneregn',price:15,rain:['⭐','🌟']},
  {id:'confetti',slot:'fx',emoji:'🎊',name:'Regnbuekonfetti',price:30,colors:['#ff4466','#ff6b35','#ffd93d','#00ff88','#06d6ff','#a855f7']},
  {id:'coinrain',slot:'fx',emoji:'🪙',name:'Myntregn',price:50,rain:['🪙'],colors:['#ffd93d','#f7971e','#fff3b0']},
  {id:'pizza',slot:'fx',emoji:'🍕',name:'Pizzaregn',price:75,rain:['🍕']},
  {id:'diamonds',slot:'fx',emoji:'💎',name:'Diamantregn',price:110,boss:3,rain:['💎'],colors:['#06d6ff','#a855f7','#ffffff']},
  {id:'fireworks',slot:'fx',emoji:'🎆',name:'Fyrverkeri',price:200,rain:['🎆','🎇','✨'],colors:['#ffd93d','#ff4466','#06d6ff','#a855f7','#00ff88']},
];
const pgMQ=window.matchMedia?matchMedia('(prefers-reduced-motion: reduce)'):null;
function pgRM(){return !!(pgMQ&&pgMQ.matches);} // reduced motion: keep the information, drop the movement
function pgSleep(ms){return new Promise(r=>setTimeout(r,ms));}
function pgLoad(k,d){try{const v=JSON.parse(localStorage.getItem(k));return v==null?d:v;}catch(e){return d;}}
function pgEsc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function pgItem(id){return PG_ITEMS.find(i=>i.id===id)||null;}
function pgOwned(){const o=pgLoad('mh_shop_owned',[]);return Array.isArray(o)?o:[];}
function pgEquipped(){const e=pgLoad('mh_shop_equipped',{});return e&&typeof e==='object'&&!Array.isArray(e)?e:{};}
function pgItemOpen(it){return !it.boss||isBossDefeated(it.boss);}
function pgActive(n){return !!document.getElementById('screen-'+n)?.classList.contains('active');}
// Animate fn(e) with e going 0→1 (ease in-out). Finishes at once with reduced motion; a timer backs up rAF.
function pgAnim(ms,fn){return new Promise(res=>{let done=false;const end=()=>{if(done)return;done=true;fn(1);res();};if(pgRM()||!(ms>0))return end();const t0=performance.now();const f=now=>{if(done)return;const t=Math.min(1,(now-t0)/ms);if(t>=1)return end();fn(t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2);requestAnimationFrame(f);};requestAnimationFrame(f);setTimeout(end,ms+700);});}
function pgChime(){[659,784,1046].forEach((f,i)=>setTimeout(()=>tone(f,.14,'triangle',.2),i*110));}
function pgFanfare(){[523,659,784,1046,784,1046,1318].forEach((f,i)=>setTimeout(()=>tone(f,.15,'triangle',.22),i*100));}
function pgToast(icon,title,sub){const t=document.getElementById('achieve-toast');if(!t)return;document.getElementById('at-icon').textContent=icon;document.getElementById('at-title').textContent=title;document.getElementById('at-sub').textContent=sub;t.classList.add('show');clearTimeout(pgToast.t);pgToast.t=setTimeout(()=>t.classList.remove('show'),2200);}

// ---- FEIRINGER: store øyeblikk, korte (≤ 2–3 s), blokkerer aldri og krever ingen ekstra trykk ----
// Riktig svar = lite (fx.js: tall-pop), ny ⭐ = middels (stjernen flyr inn og smeller på plass), bestått/mestret, boss og krone = stort.
// Redusert bevegelse: sluttresultatet vises uten bevegelse (lyden beholdes). Lyd av: tone/fxOsc er stille (mh_muted).
// Midlertidige elementer ligger i #cel-layer (fast, pointer-events:none, over overleggene) og fjerner seg selv. CSS: css/fun.css.
const CEL_FLY=560; // ms en stjerne/krone flyr
function celLayer(){let L=document.getElementById('cel-layer');if((!L||!L.isConnected)&&document.body){L=document.createElement('div');L.id='cel-layer';L.className='cel-layer';L.setAttribute('aria-hidden','true');document.body.appendChild(L);}return L;}
function celPt(el){if(!el||!el.getBoundingClientRect||el.isConnected===false)return null;const r=el.getBoundingClientRect();if(!r||!(+r.width||+r.height))return null;return{x:r.left+r.width/2,y:r.top+r.height/2,w:+r.width,h:+r.height};}
function celEl(cls,txt,x,y,ms){const L=celLayer();if(!L)return null;const e=document.createElement('div');e.className='cel '+cls;if(txt)e.textContent=txt;e.style.left=Math.round(x)+'px';e.style.top=Math.round(y)+'px';L.appendChild(e);setTimeout(()=>e.remove(),ms||1200);return e;}
function celSnd(n,...a){if(typeof window[n]==='function')try{window[n](...a);}catch(e){}} // lyder i fx.js (stille når lyden er av)
// ⭐/👑 flyr i en bue fra a til b (Web Animations), stor på toppen og akkurat stor nok når den lander. Løses når den lander.
function celFly(txt,a,b,o){
  o=o||{};const ms=o.ms||CEL_FLY;
  if(pgRM()||!a||!b)return pgSleep(0);
  const size=Math.max(10,o.size||b.h||28),big=Math.max(1.6,(o.peak||44)/size),e=celEl('cel-fly'+(o.cls?' '+o.cls:''),txt,a.x,a.y,ms+150);
  if(!e)return pgSleep(0);e.style.fontSize=size+'px';
  if(!e.animate){e.remove();return pgSleep(0);}
  const dx=b.x-a.x,dy=b.y-a.y,cx=dx*.5+(o.side||0),cy=Math.min(0,dy)-(o.arc==null?110:o.arc),K=[];
  for(let i=0;i<=10;i++){const t=i/10,u=1-t,x=2*u*t*cx+t*t*dx,y=2*u*t*cy+t*t*dy,s=t<.4?.3+(big-.3)*Math.sin(t/.4*Math.PI/2):big+(1-big)*((t-.4)/.6);
    K.push({transform:`translate(calc(-50% + ${x.toFixed(1)}px),calc(-50% + ${y.toFixed(1)}px)) scale(${s.toFixed(2)}) rotate(${Math.round(t*360)}deg)`,opacity:t<.12?t/.12:1});}
  try{e.animate(K,{duration:ms,easing:'cubic-bezier(.5,0,.75,1)',fill:'forwards'});}catch(err){}
  if(o.trail!==false)[.35,.6,.82].forEach(f=>setTimeout(()=>{const u=1-f;celEl('cel-trail','✨',a.x+2*u*f*cx+f*f*dx,a.y+2*u*f*cy+f*f*dy,600);},ms*f*.8));
  celSnd('fxSndWhoosh');
  return pgSleep(ms);
}
// Landing: smell (klem og sprett), ring, gnister og en «pling» som stiger for hver stjerne (i = 0, 1, 2)
function celSmack(el,i,o){
  o=o||{};
  if(el&&el.classList){el.classList.remove('cel-hold','new','cel-smack');void el.offsetWidth;el.classList.add('cel-smack');setTimeout(()=>el.classList.remove('cel-smack'),800);}
  celSnd(o.snd||'fxSndStar',i);
  if(pgRM())return;
  const p=o.at||celPt(el);if(!p)return;
  const r=celEl('cel-ring','',p.x,p.y,700);if(r)r.style.setProperty('--c',o.col||'#ffd93d');
  for(let k=0;k<(o.n||6);k++){const an=k/(o.n||6)*Math.PI*2+.4,d=(o.d||26)*(.8+Math.random()*.5),s=celEl('cel-spark',k%2?'✨':(o.ch||'⭐'),p.x,p.y,750);if(s){s.style.setProperty('--dx',Math.round(Math.cos(an)*d)+'px');s.style.setProperty('--dy',Math.round(Math.sin(an)*d)+'px');}}
}
// Fyrverkeri-smell: gnister i alle retninger + ring
function celBurst(x,y,big){if(pgRM())return;celSmack(null,0,{at:{x,y},n:big?12:9,d:big?95:70,ch:'🌟',col:'#ffd93d',snd:'fxSndPop'});}
// Solstråler bak et element (kista, pokalen, helten). host må ha position:relative.
function celRays(host,cls,ms){if(!host||!host.appendChild||pgRM())return;host.querySelectorAll('.cel-rays').forEach(r=>r.remove());const r=document.createElement('span');r.className='cel-rays'+(cls?' '+cls:'');r.setAttribute('aria-hidden','true');host.appendChild(r);setTimeout(()=>r.remove(),ms||2900);}
// Gløden rundt en temanode (eget element, så kartets egne skygger ikke overstyrer den)
function celGlow(n,cls){const ic=n&&n.querySelector&&n.querySelector('.map-node-icon');if(!ic||pgRM())return;const g=document.createElement('div');g.className='cel-glow'+(cls?' '+cls:'');ic.appendChild(g);setTimeout(()=>g.remove(),2300);}
// Kort liste med temaer til banneret: navn for 1–2, ellers bare ikonene
function celList(ts){ts=(ts||[]).filter(Boolean);return ts.length<=2?ts.map(t=>`${t.icon} ${t.name}`).join(' · '):ts.map(t=>t.icon).join(' ');}

// ---- Hero decor (what the child bought and wears) ----
function pgDecor(extra){const eq=pgEquipped(),own=pgOwned(),d={};PG_SLOTS.forEach(s=>{let it=pgItem(eq[s.id]);if(!it||it.slot!==s.id||!own.includes(it.id))it=null;if(extra&&extra.slot===s.id)it=extra;d[s.id]=it?{id:it.id,emoji:it.emoji,name:it.name,colors:it.colors||null,rain:it.rain||null}:null;});return d;}
// {hat,aura,pet,fx}: each null or {id,emoji,name,colors,rain}
function getHeroDecor(){return pgDecor(null);}
// Puts hat/aura/pet on any hero element as data attributes (CSS draws them), so later textContent updates keep them
function applyHeroDecor(el,opts){
  if(!el)return;const d=(opts&&opts.decor)||getHeroDecor(),pet=!(opts&&opts.pet===false);
  const set=(k,v)=>{if(v)el.setAttribute(k,v);else el.removeAttribute(k);};
  set('data-pg-hat',d.hat&&d.hat.emoji);set('data-pg-aura',d.aura&&d.aura.id);set('data-pg-pet',pet&&d.pet&&d.pet.emoji);
  if(typeof funDecor==='function')funDecor(el,opts&&opts.tier); // rang: glød/vinger/krone/stjernestøv (fun.js)
}
// The equipped victory effect (confetti colours and/or emoji rain). Returns false if none is equipped.
function heroVictoryFx(n){return pgPlayFx(getHeroDecor().fx,n||80);}
function pgPlayFx(fx,n){if(!fx||pgRM())return false;n=n||80;if(fx.colors)launch(n,fx.colors);if(fx.rain)pgRain(fx.rain,Math.max(8,Math.round(n/4)));return true;}
function pgRain(list,n){const w=document.getElementById('pg-rain');if(!w)return;for(let i=0;i<n;i++){const s=document.createElement('span');s.className='pg-drop';s.textContent=list[i%list.length];s.style.cssText=`left:${(Math.random()*94).toFixed(1)}%;font-size:${(1.2+Math.random()*1.2).toFixed(2)}rem;animation-delay:${(Math.random()*.9).toFixed(2)}s;animation-duration:${(1.8+Math.random()*1.2).toFixed(2)}s`;w.appendChild(s);setTimeout(()=>s.remove(),4500);}}

// ---- Unlocks already celebrated (mh_pg_seen). Ids: g:<grade>, t:<grade>:<topic>, m:<grade>:<topic> (mastered), b:<grade> (boss gate) ----
function pgEvents(){const ev=[];for(let g=1;g<=10;g++){if(!CUR[g]||!isGradeUnlocked(g))continue;if(g>1)ev.push('g:'+g);(CUR[g].topics||[]).forEach((t,i)=>{if(i>0&&isTopicUnlocked(g,i))ev.push(`t:${g}:${t.id}`);if(isTopicMastered(g,t.id))ev.push(`m:${g}:${t.id}`);});if(isBossUnlocked(g)||isBossDefeated(g))ev.push('b:'+g);}return ev;}
function pgSeenList(){const s=pgLoad('mh_pg_seen',null);return Array.isArray(s)?s:null;}
function pgSeen(id){const s=pgSeenList();return !s||s.includes(id);}
function pgMark(id){const s=pgSeenList()||[];if(!s.includes(id)){s.push(id);localStorage.setItem('mh_pg_seen',JSON.stringify(s));}}

// ---- Spilledager 🌙 (prog.days, aldri nullstilt; prog.lastDay): første ferdige runde på en ny dag gir bonus ----
function pgDay(off){const d=new Date();d.setDate(d.getDate()+(off||0));return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
function pgStreakTick(){
  const t=pgDay(0);if(prog.lastDay===t)return null;
  prog.streak=prog.lastDay===pgDay(-1)?(prog.streak||0)+1:1; // gammel «dager på rad» (vises ikke lenger)
  prog.days=(+prog.days||0)+1;prog.lastDay=t;
  const bonus=prog.days>=7?15:prog.days>=3?10:5; // som før, men på spilledager: en pause koster ingenting
  prog.coins+=bonus;saveProg();renderHUD();
  if(typeof funCheckBadges==='function')funCheckBadges(); // vekstmerke for spilledager (fun.js)
  const h=document.querySelector('.hud-streak');if(h&&!pgRM()){h.classList.remove('pg-bump');void h.offsetWidth;h.classList.add('pg-bump');}
  return{n:prog.days,bonus};
}
function pgStreakHTML(st){return st?`<div class="pg-pill pg-streak">🌙 ${st.n>1?`Spilledag ${st.n}!`:'Dag 1! Kom tilbake i morgen!'} <b>+${st.bonus} 🪙</b></div>`:'';}

// ---- Levels: HUD goal, smooth fill, "NIVÅ OPP!" (a short toast that leaves by itself) ----
// Nivåkurven (lvlFor i state.js spør pgLvlSize): et nivå koster l·160 ✨ (før l·80), så nivåene kommer sjeldnere og betyr noe.
// Ingen mister noe: gamle lagringer beholder nivået de har – nivåene til og med dagens koster som før (prog.lv0 = første nye nivå).
function pgLvlOld(xp){let l=1,x=+xp||0;while(x>=l*80){x-=l*80;l++;}return l;}
function pgLvlSize(l){
  if(typeof prog!=='object'||!prog)return l*160;
  if(prog.lv0==null||!isFinite(+prog.lv0)||+prog.lv0<1)prog.lv0=+prog.xp>0?pgLvlOld(prog.xp)+1:1; // første gang: husk hvor den gamle kurven slutter
  return l<+prog.lv0?l*80:l*160;
}
let pgLvlSeen=curLvl(),pgHudXp=null,pgHudT=null,pgEvoHeld=null,pgLvlT=null,pgLvlDone=null;
function pgLvlAt(xp){let l=1,x=xp;while(x>=lvlFor(l)){x-=lvlFor(l);l++;}return{l,x,need:lvlFor(l)};}
function pgHud(){
  const l=curLvl(),x=xpInLvl(),need=lvlFor(l);
  if(l<pgLvlSeen)pgLvlSeen=l; // progress rolled back (boss test mode)
  let gl=document.getElementById('pg-hud-goal');
  if(!gl){const b=document.querySelector('#hud .hud-bar');if(b){gl=document.createElement('div');gl.id='pg-hud-goal';gl.className='pg-hud-goal';b.insertAdjacentElement('afterend',gl);}}
  if(gl)gl.textContent=`Mot nivå ${l+1} ✨`;
  const d=getHeroDecor();
  applyHeroDecor(document.getElementById('hud-char'),{decor:d,pet:false});
  const sk=document.getElementById('hud-sidekick');if(sk){if(d.pet)sk.setAttribute('data-pg-pet',d.pet.emoji);else sk.removeAttribute('data-pg-pet');}
  const fill=document.getElementById('hud-fill');
  if(fill&&pgHudT)fill.style.width='100%'; // level wrap in progress: stay full
  if(fill&&pgHudXp!==null&&prog.xp>pgHudXp&&!pgRM()){
    const bar=fill.parentElement;bar.classList.remove('pg-gain');void bar.offsetWidth;bar.classList.add('pg-gain');
    if(pgLvlAt(pgHudXp).l<l){fill.style.width='100%';clearTimeout(pgHudT);pgHudT=setTimeout(()=>{pgHudT=null;fill.style.transition='none';fill.style.width='0%';void fill.offsetWidth;fill.style.transition='';fill.style.width=Math.round(xpInLvl()/lvlFor(curLvl())*100)+'%';},550);} // fill to the top, then the new level starts at 0
  }
  pgHudXp=prog.xp;
}
// NIVÅ OPP er en kort toast nederst (#pg-lvl, CSS i fun.css): ingen trykk, blokkerer ingenting. «Sterkere» (rang) er fortsatt en egen stor skjerm.
function pgLevelUp(){
  const l=curLvl();if(l<=pgLvlSeen)return Promise.resolve();
  pgLvlSeen=l;
  const o=document.getElementById('pg-lvl');
  if(o){
    document.getElementById('pg-lvl-num').textContent=`Nivå ${l}!`;
    const h=document.getElementById('pg-lvl-hero');h.textContent=getCharEmoji(getCharIdx(),l);applyHeroDecor(h,{pet:false});
    document.getElementById('pg-lvl-sub').textContent=`Neste: nivå ${l+1} ✨`;
    if(o.setAttribute){o.setAttribute('role','status');o.setAttribute('aria-live','polite');}
    o.classList.remove('show');void o.offsetWidth;o.classList.add('show');
    sndLvl();
    clearTimeout(pgLvlT);pgLvlT=setTimeout(pgLvlClose,2700);
  }
  if(pgEvoHeld){pendingEvolution=pgEvoHeld;pgEvoHeld=null;showEvolution();} // boss.js kan holde «sterkere» til NIVÅ OPP: den venter ikke lenger
  return Promise.resolve();
}
function pgLvlClose(){
  clearTimeout(pgLvlT);document.getElementById('pg-lvl')?.classList.remove('show');
  if(pgEvoHeld){pendingEvolution=pgEvoHeld;pgEvoHeld=null;showEvolution();}
  const r=pgLvlDone;pgLvlDone=null;if(r)r();
}

// ---- Chest: XP and coins count up; new topic stars get a BESTÅTT/SUPER/MESTRET stamp; streak; NIVÅ OPP ----
let pgMst={},pgChestT=[],pgChestTok=0; // pgMst: "g:topicId" -> {from,to} stars, to pop in on the topic map
function pgChest(res,xpE,coinsE,pct){ // res = recordRound() result {from,to} (stars)
  const tok=++pgChestTok,live=()=>tok===pgChestTok&&!!document.getElementById('chest-overlay')?.classList.contains('show');
  const g=S.grade,tid=S.topicId,k=g+':'+tid,to=res&&typeof res==='object'?res.to:topicStars(g,tid),from=res&&typeof res==='object'?res.from:to;
  pgMst[k]={from:pgMst[k]?Math.min(pgMst[k].from,from):from,to};
  const st=pgStreakTick();
  const ov=document.getElementById('chest-overlay');if(!ov)return;
  const val=ic=>[...ov.querySelectorAll('.chest-reward')].find(r=>r.querySelector('.chest-reward-icon')?.textContent.trim()===ic)?.querySelector('.chest-reward-val');
  const xpEl=val('✨'),cEl=val('🪙');
  let x=document.getElementById('pg-cx');
  if(!x){x=document.createElement('div');x.id='pg-cx';x.className='pg-cx';const b=ov.querySelector('.chest-btn');if(b)b.insertAdjacentElement('beforebegin',x);else ov.appendChild(x);}
  const xp0=prog.xp-xpE,L0=pgLvlAt(xp0);
  x.innerHTML=`<div class="pg-cbar"><div class="pg-cbar-top"><span id="pg-cx-lv">✨ Nivå ${L0.l}</span><span id="pg-cx-lvr">mot nivå ${L0.l+1}</span></div><div class="pg-track"><div class="pg-fill pg-fill-xp" id="pg-cx-xp" style="width:${L0.x/L0.need*100}%"></div></div></div>
    <div class="cel-row"><div class="pg-stamp" id="pg-cx-stamp"></div><div class="cel-foe" id="cel-foe" aria-hidden="true"></div></div>${pgStreakHTML(st)}`;
  const xpF=document.getElementById('pg-cx-xp'),lv=document.getElementById('pg-cx-lv'),lvr=document.getElementById('pg-cx-lvr'),stamp=document.getElementById('pg-cx-stamp');
  const doStamp=(txt,cls)=>{stamp.textContent=txt;stamp.className='pg-stamp';void stamp.offsetWidth;stamp.className='pg-stamp show '+cls;};
  if(xpEl)xpEl.textContent='+0';if(cEl)cEl.textContent='+0';
  pgChestT.forEach(clearTimeout);pgChestT=[];
  let shownL=L0.l;
  pgChestT.push(setTimeout(()=>{
    if(tok!==pgChestTok)return;
    pgAnim(1100,e=>{if(tok!==pgChestTok)return;const L=pgLvlAt(Math.round(xp0+xpE*e));if(xpEl)xpEl.textContent=`+${Math.round(xpE*e)}`;xpF.style.width=(L.x/L.need*100)+'%';lv.textContent=`✨ Nivå ${L.l}`;lvr.textContent=`mot nivå ${L.l+1}`;if(L.l>shownL){shownL=L.l;lv.classList.add('pg-hot');}});
    pgAnim(900,e=>{if(tok===pgChestTok&&cEl)cEl.textContent=`+${Math.round(coinsE*e)}`;});
  },pgRM()?0:350));
  // Nye stjerner hopper ut av skatten og smeller på plass én og én (⭐ → ⭐⭐ → ⭐⭐⭐), så kommer stempelet:
  // ⭐⭐ SUPER (middels) · ⭐ BESTÅTT – monsteret gir seg 🏳️ · 🏆 MESTRET – glans, stråler, monsteret blir venn 💛 (stort)
  const landed=to>from?celChestStars(ov,tok):0,at=to>from?(pgRM()?0:Math.max(700,landed+140)):0;
  if(to>from)pgChestT.push(setTimeout(()=>{
    if(tok!==pgChestTok)return;
    if(to>=3){doStamp('🏆 MESTRET!','master cel-gleam');celFoe('friend');if(live()){pgFanfare();celRays(document.getElementById('chest-emoji'),'master');
      if(!pgRM()){launch(170,['#00ff88','#ffd93d','#06d6ff','#ffffff']);heroVictoryFx(120);const p=celPt(stamp);if(p){celBurst(p.x-90,p.y-40,true);pgChestT.push(setTimeout(()=>{if(tok===pgChestTok)celBurst(p.x+90,p.y-55,true);},380));}}}}
    else if(from<1){doStamp('⭐ BESTÅTT!','pass');celFoe('flag');if(live()){pgChime();celRays(document.getElementById('chest-emoji'),'',2400);if(!pgRM())launch(100,['#ffd93d','#ffffff','#ff6b35']);}}
    else{doStamp('⭐⭐ SUPER!','pass');if(live()){pgChime();if(!pgRM())launch(80,['#ffd93d','#ffffff','#ff6b35']);}}
  },at));
  if(pct>=.5)pgChestT.push(setTimeout(()=>{if(live())heroVictoryFx(70);},250));
  if(curLvl()>pgLvlSeen)pgChestT.push(setTimeout(()=>{if(live())pgLevelUp();},(to>from?at:500)+(pgRM()?300:900))); // toast after the big moment
}
// Kista: hver ny stjerne (.mst-star.new fra mstStarsHTML) flyr fra skatten (#chest-emoji) til plassen sin. Gir ms til den siste har landet.
function celChestStars(ov,tok){
  const ns=ov&&ov.querySelectorAll?[...ov.querySelectorAll('.mst-star.new')]:[];if(!ns.length)return 0;
  const gap=pgRM()?320:520,first=pgRM()?250:420,idx=s=>{const p=s.parentElement;return p?[...p.children].indexOf(s):0;};
  if(!pgRM())ns.forEach(s=>s.classList.add('cel-hold')); // plassen står tom til stjernen lander
  ns.forEach((s,k)=>pgChestT.push(setTimeout(()=>{
    if(tok!==pgChestTok)return;
    const a=celPt(document.getElementById('chest-emoji')),b=celPt(s);
    celFly('⭐',a,b,{side:(idx(s)-1)*50,size:b&&b.h*.8,peak:80}).then(()=>{if(tok===pgChestTok)celSmack(s,idx(s));});
  },first+k*gap)));
  return first+(ns.length-1)*gap+(pgRM()?0:CEL_FLY);
}
// Temaets monster ved stempelet: 🏳️ gir seg (bestått) eller blir vennen din 💛 (mestret)
function celFoe(kind){
  const f=document.getElementById('cel-foe');if(!f||!S||typeof funMonster!=='function')return;
  const m=funMonster(S.grade,S.topicId),hero=localStorage.getItem('mh_player')?getCharEmoji(getCharIdx()):getPlayer().emoji;
  f.innerHTML=kind==='friend'?`<span class="cel-foe-hero">${pgEsc(hero)}</span><span class="cel-heart">💛</span><span class="cel-mon">${pgEsc(m.e)}</span>`:`<span class="cel-mon">${pgEsc(m.e)}</span><span class="cel-flag">🏳️</span>`;
  f.title=kind==='friend'?`${m.n} er vennen din!`:`${m.n} gir seg!`;
  if(kind==='friend'){const h=f.querySelector('.cel-foe-hero');if(h)applyHeroDecor(h,{pet:false});}
  f.className='cel-foe show '+kind;
}
function celClear(){const L=document.getElementById('cel-layer');if(L)L.textContent='';}
function pgChestClose(){
  pgChestTok++;pgChestT.forEach(clearTimeout);pgChestT=[];celClear();
  if(curLvl()>pgLvlSeen)pgLevelUp(); // closed before the moment came: show the toast now (it never blocks)
}

// ---- Next goals (stars: mstNext in mastery.js tells what gives the next star) ----
function pgNextIn(g){
  const ts=CUR[g]?.topics||[];
  let i=ts.findIndex((t,j)=>!t.optional&&isTopicUnlocked(g,j)&&!isTopicPassed(g,t.id));
  if(i>=0)return{icon:ts[i].icon,txt:`${ts[i].name}: ${mstNext(g,ts[i].id).txt}`};
  if(BOSSES[g]&&isBossUnlocked(g)&&!isBossDefeated(g))return{icon:BOSSES[g].emoji,txt:`Bossen venter! ${BOSSES[g].name}`};
  i=ts.findIndex((t,j)=>isTopicUnlocked(g,j)&&!isTopicMastered(g,t.id)&&mstNext(g,t.id).now);
  if(i<0)i=ts.findIndex((t,j)=>isTopicUnlocked(g,j)&&!isTopicMastered(g,t.id));
  if(i>=0)return{icon:ts[i].icon,txt:`${ts[i].name}: ${mstNext(g,ts[i].id).txt}`};
  return null;
}
function pgGoalCard(){
  const el=document.getElementById('pg-goal');if(!el)return;
  let f=1;for(let g=1;g<=10;g++)if(CUR[g]&&isGradeUnlocked(g))f=g;
  const nx=pgNextIn(f);el.dataset.g=f;
  el.innerHTML=nx?`<span class="pg-goal-lbl">🎯 Neste mål · ${f}. klasse</span><span class="pg-goal-txt">${pgEsc(nx.icon)} ${pgEsc(nx.txt)}</span>`:'<span class="pg-goal-lbl">👑 Du har klart alt!</span><span class="pg-goal-txt">Talland er reddet!</span>';
}
function pgGoalGo(){const g=+(document.getElementById('pg-goal')?.dataset.g)||1;if(isGradeUnlocked(g))selectGrade(g);}
function pgResults(){
  const card=document.querySelector('#screen-results .victory-card');if(!card||S.boss||!CUR[S.grade])return;
  let b=document.getElementById('pg-next');
  if(!b){b=document.createElement('button');b.id='pg-next';b.className='pg-next-btn';const ring=document.getElementById('mst-res')||document.getElementById('res-ring');if(ring)ring.insertAdjacentElement('afterend',b);else card.prepend(b);}
  const g=S.grade,ts=CUR[g].topics||[],tid=S.topicId,B=BOSSES[g],nx=mstNext(g,tid);
  const Q=S.questions||[],low=Q.length>0&&Q.filter(q=>q.ok).length/Q.length<.5;
  b.style.display=low?'none':''; // under 50 %: «📖 Se hvordan» + «🔁 Prøv igjen» from buildResults instead
  let txt,go;
  if(!isTopicPassed(g,tid)){txt=`🔁 Prøv igjen! ${nx.txt}`;go=retrySession;}
  else{
    const i=ts.findIndex((t,j)=>!t.optional&&isTopicUnlocked(g,j)&&!isTopicPassed(g,t.id));
    if(i>=0){txt=`Neste: ${ts[i].icon} ${ts[i].name} ▶`;go=()=>selectGrade(g);}
    else if(B&&isBossUnlocked(g)&&!isBossDefeated(g)){txt=`Bossen venter! ${B.emoji} ▶`;go=()=>selectGrade(g);}
    else if(!isTopicMastered(g,tid)&&nx.now){txt=`🔁 ${nx.txt}`;go=retrySession;}
    else{const j=ts.findIndex((t,k)=>t.id!==tid&&isTopicUnlocked(g,k)&&!isTopicMastered(g,t.id)&&mstNext(g,t.id).now);
      if(j>=0){txt=`Neste: ${ts[j].icon} ${ts[j].name} ▶`;go=()=>selectGrade(g);}
      else if(g<10&&CUR[g+1]&&isGradeUnlocked(g+1)){txt=`Neste: ${g+1}. klasse ${GRADE_INFO[g].icon} ▶`;go=()=>showScreen('grades');}
      else{txt=isTopicMastered(g,tid)?'🗺️ Til kartet ▶':'🌙 Kom tilbake i morgen!';go=()=>showScreen('grades');}}
  }
  b.textContent=txt;b.onclick=go;
}

// ---- Map decoration (hooks: end of buildGradeMap / buildTopicMap) ----
function pgFixSvg(){['adv-map-svg','topic-map-svg'].forEach(id=>{const s=document.getElementById(id);if(s&&s.getAttribute('preserveAspectRatio')!=='none')s.setAttribute('preserveAspectRatio','none');});} // paths line up with the %-placed nodes at every width
function pgPathLock(p){if(p){p.setAttribute('stroke','rgba(255,255,255,.16)');p.setAttribute('stroke-dasharray','7 5');}}
function pgPrelock(n){if(!n||n.classList.contains('pg-prelock'))return;n.classList.add('locked','pg-prelock');const ic=n.querySelector('.map-node-icon');if(ic&&!ic.querySelector('.pg-lock'))ic.insertAdjacentHTML('beforeend','<div class="map-node-lock pg-lock">🔒</div>');}
function pgPop(n,col){if(!n||pgRM())return;n.classList.remove('pg-pop');void n.offsetWidth;n.classList.add('pg-pop');setTimeout(()=>n.classList.remove('pg-pop'),950);const ic=n.querySelector('.map-node-icon,.boss-gate-icon');if(ic){const r=document.createElement('div');r.className='pg-ring';if(col)r.style.borderColor=col;ic.appendChild(r);setTimeout(()=>r.remove(),1100);}}
function pgUnlockNode(n,col){if(!n)return;n.classList.remove('locked','pg-prelock');const lk=n.querySelector('.pg-lock');if(lk){lk.classList.add('pg-lock-off');setTimeout(()=>lk.remove(),700);}pgPop(n,col);}
function pgScroll(el){if(!el)return;const r=el.getBoundingClientRect();if(r.top<70||r.bottom>innerHeight-20)el.scrollIntoView({block:'center',behavior:pgRM()?'auto':'smooth'});}
function pgPendingGrades(){const p=[];for(let g=2;g<=10;g++)if(CUR[g]&&isGradeUnlocked(g)&&!pgSeen('g:'+g))p.push(g);return p;}
function pgGradeMap(){
  pgFixSvg();
  const box=document.getElementById('adv-map-nodes'),svg=document.getElementById('adv-map-svg'),you=document.getElementById('map-you');if(!box)return;
  const pend=pgPendingGrades();
  pend.forEach(g=>{pgPrelock(box.children[g-1]);pgPathLock(svg?.children[g-2]);});
  if(you){applyHeroDecor(you);const p=pend.length&&GRADE_POS[pend[0]-2];if(p){you.style.left=p[0]+'%';you.style.top=p[1]+'%';}} // hero waits on the old node, then walks
  pgGoalCard();pgShopTip();
  if(pend.length&&pgActive('grades'))setTimeout(pgRun,60);
}
function pgStarSet(n,v,from){const w=n?.querySelector('.mst-node-stars');if(w)w.innerHTML=mstStarsHTML(v,from,!!w.querySelector('.mst-crown'));} // topic node stars (from = pop the new ones)
function pgPointer(g){
  document.querySelectorAll('#topic-map-nodes .pg-next-tag').forEach(e=>e.remove());const gate=document.getElementById('boss-gate');gate?.classList.remove('pg-next');
  const box=document.getElementById('topic-map-nodes'),ts=CUR[g]?.topics||[];if(!box)return;
  const ok=j=>isTopicUnlocked(g,j)&&!box.children[j]?.classList.contains('pg-prelock');
  let i=ts.findIndex((t,j)=>ok(j)&&!isTopicPassed(g,t.id));
  if(i<0&&gate&&BOSSES[g]&&isBossUnlocked(g)&&!isBossDefeated(g)&&!gate.classList.contains('pg-prelock')){gate.classList.add('pg-next');return;}
  if(i<0)i=ts.findIndex((t,j)=>ok(j)&&!isTopicMastered(g,t.id));
  box.children[i]?.insertAdjacentHTML('beforeend','<div class="pg-next-tag">👇</div>');
}
// Nye temaer som er åpnet, men ikke feiret: show = feires (ett samlet banner), quiet = allerede spilt (bare merkes som sett, ingen feiring)
function pgUnlockPlan(g){
  const ts=CUR[g]?.topics||[],p={show:[],quiet:[]};
  ts.forEach((t,i)=>{if(i<1||!isTopicUnlocked(g,i)||pgSeen(`t:${g}:${t.id}`))return;(topicStarted(g,t.id)?p.quiet:p.show).push(i);});
  return p;
}
let pgCrownWait={}; // "g:topicId" -> 1: gullkronen fra trollet flyr inn på temanoden neste gang kartet vises
function pgTopicMap(g){
  pgFixSvg();
  const box=document.getElementById('topic-map-nodes'),svg=document.getElementById('topic-map-svg'),ts=CUR[g]?.topics||[];if(!box)return;
  const plan=pgUnlockPlan(g);plan.quiet.forEach(i=>pgMark(`t:${g}:${ts[i].id}`)); // et tema barnet alt har spilt, er ikke «nytt»
  ts.forEach((t,i)=>{
    const n=box.children[i];if(!n||!isTopicUnlocked(g,i))return;
    if(!isTopicMastered(g,t.id))n.insertAdjacentHTML('beforeend',`<div class="pg-node-goal">${pgEsc(mstGoalShort(g,t.id))}</div>`);
    if(plan.show.includes(i)){pgPrelock(n);pgPathLock(svg?.children[i-1]);}
    const a=pgMst[g+':'+t.id];if(a&&a.to>a.from)pgStarSet(n,a.from); // shows the old stars until the new ones fly in
    if(pgCrownWait[g+':'+t.id]&&n.classList)n.classList.add('cel-crown-wait'); // the crown waits to fly in
  });
  const gate=document.getElementById('boss-gate');
  if(gate&&BOSSES[g]&&isBossUnlocked(g)&&!isBossDefeated(g)&&!pgSeen('b:'+g))gate.classList.add('locked','pg-prelock');
  pgPointer(g);
  if(pgActive('topics'))setTimeout(pgRun,60);
}

// ---- Ceremonies: run when the grade or topic map becomes visible, once nothing covers it ----
let pgBusy=false,pgAgain=false;
function pgBlocked(){return !!document.querySelector('.evo-overlay.show,.chest-overlay.show,.boss-overlay.show,.world-popup.show,.herocard-overlay.show,.badge-overlay.show,#pg-shop.show,#fun-day.show,#story-overlay:not(.hidden),#ending-overlay:not(.hidden)');}
async function pgFree(scr){while(pgBlocked()){if(!pgActive(scr))return false;await pgSleep(300);}return pgActive(scr);}
function pgBanner(icon,title,sub,ms){
  const b=document.getElementById('pg-banner');if(!b)return;
  document.getElementById('pg-banner-icon').textContent=icon;document.getElementById('pg-banner-title').textContent=title;document.getElementById('pg-banner-sub').textContent=sub||'';
  b.classList.remove('show');void b.offsetWidth;b.classList.add('show');
  clearTimeout(pgBanner.t);pgBanner.t=setTimeout(()=>b.classList.remove('show'),ms||2400);
}
async function pgDrawPath(p,col,ms,onE){
  let c=null;
  if(p){c=p.cloneNode(false);c.setAttribute('stroke',col);c.setAttribute('stroke-width','4');c.setAttribute('pathLength','1');c.setAttribute('stroke-dasharray','1 1');c.setAttribute('stroke-dashoffset','1');p.insertAdjacentElement('afterend',c);}
  await pgAnim(ms,e=>{if(c)c.setAttribute('stroke-dashoffset',String(1-e));if(onE)onE(e);});
  if(p){p.setAttribute('stroke',col);p.setAttribute('stroke-dasharray','none');}if(c)c.remove();
}
function pgWalkTo(g){ // the hero walks the curved path from grade g-1 to grade g
  const you=document.getElementById('map-you'),a=GRADE_POS[g-2],b=GRADE_POS[g-1];if(!you||!a||!b)return Promise.resolve();
  const cx=(a[0]+b[0])/2,cy=(a[1]+b[1])/2-5;
  you.classList.add('pg-walk');
  return pgDrawPath(document.getElementById('adv-map-svg')?.children[g-2],'rgba(255,217,61,.65)',1700,e=>{const u=1-e;you.style.left=(u*u*a[0]+2*u*e*cx+e*e*b[0])+'%';you.style.top=(u*u*a[1]+2*u*e*cy+e*e*b[1])+'%';}).then(()=>you.classList.remove('pg-walk'));
}
async function pgGradeShow(){
  for(const g of pgPendingGrades()){
    if(!await pgFree('grades'))return;
    const node=document.getElementById('adv-map-nodes')?.children[g-1],gi=GRADE_INFO[g-1];if(!node||!gi)continue;
    pgMark('g:'+g);
    pgScroll(node);await pgSleep(pgRM()?100:450);
    pgBanner(gi.icon,'Ny verden åpnet!',`${g}. klasse · ${gi.mapName}`,2800);pgChime();
    await pgWalkTo(g);
    pgUnlockNode(node,gi.color);if(!pgRM())launch(80,[gi.color,'#ffd93d','#ffffff']);
    await pgSleep(1300);
  }
  pgGoalCard();
}
async function pgTopicShow(g){
  const ts=CUR[g]?.topics||[],gi=GRADE_INFO[g-1]||{},col=gi.color||'#ffd93d',here=()=>pgActive('topics')&&currentGrade===g;
  const node=i=>document.getElementById('topic-map-nodes')?.children[i];
  // 1) the topic node lights up and its new stars fly in one by one (and the troll's gold crown)
  for(const[i,t]of ts.entries()){
    const k=g+':'+t.id,a=pgMst[k],cr=pgCrownWait[k],n=node(i);if(!n||(!a&&!cr))continue;
    delete pgMst[k];delete pgCrownWait[k];
    const grow=!!a&&a.to>a.from;if(!grow&&!cr)continue;
    if(!here())return;
    pgScroll(n);await pgSleep(pgRM()?0:250);
    if(grow)await celNodeStars(n,a.from,a.to);
    if(cr)await celNodeCrown(n);
  }
  // 2) topics mastered: one banner for all of them, the nodes glow green
  const mast=ts.map((t,i)=>({t,i})).filter(x=>isTopicMastered(g,x.t.id)&&!pgSeen(`m:${g}:${x.t.id}`));
  if(mast.length){
    if(!await pgFree('topics')||!here())return;
    mast.forEach(x=>pgMark(`m:${g}:${x.t.id}`));pgScroll(node(mast[0].i));
    pgBanner('🏆',mast.length>1?'Temaer mestret!':'Tema mestret!',celList(mast.map(x=>x.t)),2400);pgFanfare();
    mast.forEach(x=>{const n=node(x.i);pgPop(n,'var(--green)');celGlow(n,'master');});
    if(!heroVictoryFx(90)&&!pgRM())launch(90,['#00ff88','#ffd93d','#ffffff']);
    await pgSleep(2000);
  }
  // 3) new topics unlocked: topics already played are opened quietly; the rest share one banner (no queue of banners)
  const plan=pgUnlockPlan(g);
  plan.quiet.forEach(i=>{pgMark(`t:${g}:${ts[i].id}`);const n=node(i),p=document.getElementById('topic-map-svg')?.children[i-1];
    if(n&&n.classList.contains('pg-prelock')){n.classList.remove('locked','pg-prelock');n.querySelector('.pg-lock')?.remove();if(p){p.setAttribute('stroke',col);p.setAttribute('stroke-dasharray','none');}}});
  if(plan.show.length){
    if(!await pgFree('topics')||!here())return;
    plan.show.forEach(i=>pgMark(`t:${g}:${ts[i].id}`));pgScroll(node(plan.show[0]));
    const list=plan.show.map(i=>ts[i]);
    pgBanner('✨',list.length>1?'Nye temaer åpnet!':'Nytt tema låst opp!',celList(list),2600);pgChime();
    await Promise.all(plan.show.map(i=>pgDrawPath(document.getElementById('topic-map-svg')?.children[i-1],col,900)));
    plan.show.forEach(i=>pgUnlockNode(node(i),col));if(!pgRM())launch(60,[col,'#ffd93d','#ffffff']);
    await pgSleep(1600);
  }
  if(BOSSES[g]&&(isBossUnlocked(g)||isBossDefeated(g))&&!pgSeen('b:'+g)){ // 4) the boss gate opens
    if(!await pgFree('topics')||!here())return;
    pgMark('b:'+g);
    if(!isBossDefeated(g)){
      const gate=document.getElementById('boss-gate');pgScroll(gate);
      if(gate){gate.classList.remove('locked','pg-prelock');pgPop(gate,'var(--red)');}
      pgBanner(BOSSES[g].emoji,'Bossen venter!',BOSSES[g].name,2600);bossRumble();
      await pgSleep(1800);
    }
  }
  if(here())pgPointer(g);
}
// Temanoden lyser opp, og de nye stjernene flyr inn fra midten av skjermen og smeller på plass én og én
async function celNodeStars(n,from,to){
  const w=n.querySelector('.mst-node-stars');
  if(!w){pgStarSet(n,to,from);return;}
  w.innerHTML=mstStarsHTML(to,null,!!w.querySelector('.mst-crown'));
  const ns=[...w.querySelectorAll('.mst-star')].slice(from,to);
  celGlow(n,to>=3?'master':'');
  if(pgRM()){for(let k=0;k<ns.length;k++){celSnd('fxSndStar',from+k);await pgSleep(280);}return;}
  ns.forEach(s=>s.classList.add('cel-hold'));
  const src={x:(window.innerWidth||375)/2,y:(window.innerHeight||600)*.3};
  for(let k=0;k<ns.length;k++){const s=ns[k],b=celPt(s);celFly('⭐',src,b,{size:b&&b.h,peak:46,arc:60,side:(k-1)*30}).then(()=>celSmack(s,from+k,{d:20,n:5}));await pgSleep(440);}
  await pgSleep(CEL_FLY-440+350);
}
// Gullkronen fra trollet flyr inn og lander på temanoden
async function celNodeCrown(n){
  const c=n.querySelector('.mst-node-crown');
  if(!c||pgRM()){n.classList.remove('cel-crown-wait');if(c)celSnd('fxSndCrown');return;}
  const src={x:(window.innerWidth||375)/2,y:(window.innerHeight||600)*.3};
  await celFly('👑',src,celPt(c),{size:22,peak:70,arc:70,cls:'crown'});
  n.classList.remove('cel-crown-wait');
  celSmack(c,0,{snd:'fxSndCrown',ch:'👑',n:6,d:28});celGlow(n,'gold');
  await pgSleep(700);
}
async function pgRun(){
  if(pgBusy){pgAgain=true;return;}
  pgBusy=true;
  try{do{
    pgAgain=false;
    const scr=pgActive('grades')?'grades':pgActive('topics')?'topics':null;if(!scr)break;
    if(!await pgFree(scr))break;
    if(curLvl()>pgLvlSeen)await pgLevelUp(); // e.g. left a battle right after a mid-battle level-up
    if(scr==='grades')await pgGradeShow();else await pgTopicShow(currentGrade);
  }while(pgAgain);}catch(e){console.warn('progression',e);}
  pgBusy=false;
}
(function(){ // start ceremonies when the grade/topic map screen becomes active (no hook in showScreen needed)
  const was={};
  const mo=new MutationObserver(()=>['grades','topics'].forEach(n=>{const a=pgActive(n);if(a&&!was[n])setTimeout(pgRun,60);was[n]=a;}));
  ['grades','topics'].forEach(n=>{const el=document.getElementById('screen-'+n);if(el){was[n]=el.classList.contains('active');mo.observe(el,{attributes:true,attributeFilter:['class']});}});
})();

// ---- Boss result + hero card (hooks) ----
function pgBossResult(win,g,first){
  const st=pgStreakTick(),o=document.getElementById('boss-result');if(!o)return;
  let x=document.getElementById('pg-bx');
  if(!x){x=document.createElement('div');x.id='pg-bx';x.className='pg-bx';const bt=document.getElementById('br-btns');if(bt)bt.insertAdjacentElement('beforebegin',x);else o.appendChild(x);}
  const its=win&&first?PG_ITEMS.filter(i=>i.boss===g):[],up=curLvl()>pgLvlSeen;
  if(up)pgLvlSeen=curLvl(); // the pill below shows the new level: no NIVÅ OPP on top of the victory
  x.innerHTML=(up?`<div class="pg-pill pg-pill-lvl">⬆️ Nivå ${curLvl()}!</div>`:'')+pgStreakHTML(st)+(its.length?`<div class="pg-pill pg-pill-shop">🛒 Nytt i butikken: ${its.map(i=>i.emoji).join(' ')}</div>`:'');
  if(win)setTimeout(()=>{if(o.classList.contains('show'))heroVictoryFx(120);},600);
  if(typeof funFight==='function')funFight(win,g,x); // fun.js: dagens økt, vekstmerker, ny rang
  celFight(win,g,o);
}
// Boss-/trollseier: stråler bak pokalen, tittelen smeller inn, innholdet popper inn i rekkefølge (ny rang sist, med glød),
// tre fyrverkerismell. Trollet: gullkronen flyr til temaet sitt (og senere inn på temanoden på kartet). Knappen virker hele tiden.
function celFight(win,g,o){
  const em=document.getElementById('br-emoji'),open=()=>o.classList.contains('show');
  o.classList.remove('cel-win');o.querySelectorAll('.cel-in,.cel-rank,.cel-crowned').forEach(e=>{e.classList.remove('cel-in','cel-rank','cel-crowned');e.style.animationDelay='';});
  if(!win)return;
  void o.offsetWidth;o.classList.add('cel-win');
  celRays(em,S&&S.troll?'troll':'',3000);
  const items=[...o.querySelectorAll('#br-skills .boss-chip,#br-rewards .chest-reward,#pg-bx .pg-pill')];
  items.forEach((e,k)=>{e.classList.add('cel-in');e.style.animationDelay=(.5+k*.08).toFixed(2)+'s';});
  const rk=o.querySelector('.fun-rank-pill');
  if(rk){const d=.5+items.length*.08+.15;rk.classList.add('cel-rank');rk.style.animationDelay=`${d.toFixed(2)}s, ${(d+.45).toFixed(2)}s`;} // ny rang til slutt
  if(!pgRM())[[.24,.22,300],[.76,.18,850],[.5,.1,1450]].forEach(([fx,fy,t])=>setTimeout(()=>{if(open())celBurst((window.innerWidth||375)*fx,(window.innerHeight||600)*fy,true);},t));
  if(!S||!S.troll)return;
  const today=mhDay(0),cr=(S.bossTopics||[]).filter(t=>{const e=mstGet(g,t.id);return e&&e.cr===today;});
  cr.forEach((t,k)=>{
    pgCrownWait[g+':'+t.id]=1;
    const chip=[...o.querySelectorAll('#br-skills .boss-chip')].find(c=>c.textContent.includes(t.name));
    setTimeout(()=>{if(!open())return;const b=celPt(chip);
      celFly('👑',celPt(em),b&&{x:b.x-b.w/2+14,y:b.y,h:22},{size:22,peak:90,arc:80,cls:'crown'}).then(()=>{if(!open())return;if(chip)chip.classList.add('cel-crowned');celSmack(null,0,{at:b&&{x:b.x-b.w/2+14,y:b.y},snd:'fxSndCrown',ch:'👑',n:6,d:30});});
    },900+k*600);
  });
}
function pgHeroCard(){applyHeroDecor(document.getElementById('hc-char'));}

// ---- Coin shop ----
let pgSel=null;
function pgShopTip(){
  const el=document.getElementById('pg-shop-tip');if(!el)return;
  const own=pgOwned(),open=PG_ITEMS.filter(i=>!own.includes(i.id)&&pgItemOpen(i)).sort((a,b)=>a.price-b.price),can=open.some(i=>i.price<=prog.coins);
  el.textContent=can?'🎁 Du har råd!':open[0]?`${open[0].price-prog.coins} 🪙 til ${open[0].emoji}`:'';
  el.parentElement.classList.toggle('pg-can',can);
}
function openShop(){pgSel=null;pgShopDraw();const o=document.getElementById('pg-shop');o.classList.add('show');o.scrollTop=0;}
function closeShop(){document.getElementById('pg-shop').classList.remove('show');renderHUD();applyHeroDecor(document.getElementById('map-you'));pgShopTip();}
function pgShopDraw(){
  const own=pgOwned(),eq=pgEquipped(),sel=pgItem(pgSel);
  document.getElementById('pg-shop-coins').textContent=prog.coins;
  const hero=document.getElementById('pg-shop-hero');
  hero.textContent=localStorage.getItem('mh_player')?getCharEmoji(getCharIdx(),curLvl()):getPlayer().emoji;
  applyHeroDecor(hero,{decor:pgDecor(sel)}); // try it on before buying
  const info=document.getElementById('pg-shop-info'),act=document.getElementById('pg-shop-act');
  act.className='pg-shop-act';act.disabled=false;act.style.display='';
  if(!sel){info.innerHTML='<b>Prøv noe! 👆</b><span>Trykk på en ting for å se den på helten din.</span>';act.style.display='none';}
  else{
    const has=own.includes(sel.id),on=has&&eq[sel.slot]===sel.id,B=sel.boss&&BOSSES[sel.boss];
    info.innerHTML=`<b>${sel.emoji} ${pgEsc(sel.name)}</b><span>${!pgItemOpen(sel)&&B?`🔒 Slå ${B.emoji} ${pgEsc(B.name)} først!`:PG_SLOTS.find(s=>s.id===sel.slot).desc}</span>`;
    if(!pgItemOpen(sel))act.style.display='none';
    else if(on){act.textContent='Ta av';act.classList.add('pg-soft');}
    else if(has)act.textContent='Ta på ✨';
    else if(prog.coins>=sel.price){act.textContent=`Kjøp for 🪙 ${sel.price}`;act.classList.add('pg-buy');}
    else{act.textContent=`Samle ${sel.price-prog.coins} 🪙 til!`;act.disabled=true;}
  }
  document.getElementById('pg-shop-list').innerHTML=PG_SLOTS.map(s=>`<div class="pg-shop-sec"><div class="pg-shop-sec-title">${s.icon} ${s.name}</div><div class="pg-shop-grid">${PG_ITEMS.filter(i=>i.slot===s.id).map(i=>{
    const has=own.includes(i.id),on=has&&eq[s.id]===i.id,op=pgItemOpen(i),B=i.boss&&BOSSES[i.boss];
    const tag=on?'✓ På deg':has?'Din!':!op?`🔒 ${B?B.emoji:''}`:`🪙 ${i.price}`;
    const cls=['pg-item',on&&'on',has&&'owned',!op&&'locked',!has&&op&&prog.coins<i.price&&'dear',pgSel===i.id&&'sel'].filter(Boolean).join(' ');
    return `<button class="${cls}" onclick="pgShopPick('${i.id}')"><span class="pg-item-emoji"${s.id==='aura'?` data-pg-aura="${i.id}"`:''}>${i.emoji}</span><span class="pg-item-name">${pgEsc(i.name)}</span><span class="pg-item-tag">${tag}</span></button>`;}).join('')}</div></div>`).join('');
}
function pgShopPick(id){const it=pgItem(id);if(!it)return;pgSel=id;pgShopDraw();tone(880,.05,'sine',.12);if(it.slot==='fx'&&pgItemOpen(it))pgPlayFx(pgDecor(it).fx,60);}
function pgShopAct(){
  const it=pgItem(pgSel);if(!it||!pgItemOpen(it))return;
  const own=pgOwned(),eq=pgEquipped();
  if(!own.includes(it.id)){
    if(prog.coins<it.price)return;
    prog.coins-=it.price;saveProg();own.push(it.id);localStorage.setItem('mh_shop_owned',JSON.stringify(own));
    eq[it.slot]=it.id;
    tone(988,.08,'square',.1);setTimeout(()=>tone(1319,.2,'square',.1),80);
    if(it.slot==='fx')pgPlayFx(pgDecor(it).fx,100);else if(!pgRM())launch(70,['#ffd93d','#ff6b35','#00ff88','#06d6ff']);
    const h=document.getElementById('pg-shop-hero');if(h&&!pgRM()){h.classList.remove('pg-pop-hero');void h.offsetWidth;h.classList.add('pg-pop-hero');}
    pgToast(it.emoji,'Kjøpt! 🎉',`${it.name} er din!`);
  }else eq[it.slot]=eq[it.slot]===it.id?null:it.id;
  localStorage.setItem('mh_shop_equipped',JSON.stringify(eq));
  renderHUD();pgShopDraw();
}
