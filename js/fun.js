// Mattehelten – Gøy hver dag: helten vokser (rang fra boss-seire), monster per tema, mynter for læring,
// vekstmerker, spilledager 🌙 og «Dagens økt».
// Alle js-filer deler globalt navnerom (vanlige <script>-tagger i fast rekkefølge, se index.html).
//
// Lagring: mh_rank = høyeste rang (0–4) barnet har fått/sett. Synker aldri; gamle lagringer starter fra XP-nivået.
//          mh_fun  = {rev, fix (totalt, for vekstmerker), day, r (runder i dag), sh (siste økt-grense vist),
//                     st (nye stjerner i dag), fx (rettet selv i dag), up:{'g:id':[fra,til]} (temaer med nye stjerner i dag)}
//          prog.days (i mh_prog3) = spilledager 🌙, aldri nullstilt (startverdi: gamle prog.streak).
// Kroker: core.js (getEvoTier/getRank/getCharEmoji/checkEvolution/showEvolution), battle.js (startGame, submitAnswer, showChest),
//         progression.js (applyHeroDecor, pgStreakTick, pgBossResult, pgBlocked), maps.js (buildTopicMap), boss.js (seier), state.js (HUD, merker).

// ============================================================
// RANG: Lærling → Kriger (1 boss) → Mester (2) → Legende (4) → Mattegud (alle bosser)
// ============================================================
const FUN_RANK_AT=[0,1,2,4]; // boss-seire per rang; Mattegud = alle bossene
function funRM(){try{return !!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);}catch(e){return false;}}
function funEsc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function funBossWins(){let n=0;if(typeof BOSSES==='object')Object.keys(BOSSES).forEach(g=>{if(isBossDefeated(+g))n++;});return n;}
function funBossTier(n){
  n=n==null?funBossWins():n;const all=typeof BOSSES==='object'?Object.keys(BOSSES).length:10;
  if(n>=all)return 4;let t=0;FUN_RANK_AT.forEach((b,i)=>{if(n>=b)t=i;});return t;
}
// Rangen gamle lagringer hadde fra XP-nivå (nivå 3/5/8/12)
function funLegacyTier(l){return l>=12?4:l>=8?3:l>=5?2:l>=3?1:0;}
function funStoredTier(){const v=parseInt(localStorage.getItem('mh_rank')||'0',10);return v>0?Math.min(4,v):0;}
function funTier(){return Math.max(funStoredTier(),funBossTier());}
// Første gang (ingen mh_rank): ta med rangen fra XP-nivået, så ingen mister noe
function funRankInit(){
  if(localStorage.getItem('mh_rank')!=null)return false;
  localStorage.setItem('mh_rank',String(Math.max(funLegacyTier(curLvl()),funBossTier())));return true;
}
// Steg rangen? Lagrer ny høyeste rang og gir {from,to}, ellers null
function funRankUp(){
  const s=funStoredTier(),b=funBossTier();
  if(b<=s)return null;
  localStorage.setItem('mh_rank',String(b));return{from:s,to:b};
}
// Pynt rundt helten (glød, vinger, krone, stjernestøv) – CSS i css/fun.css via data-fun-tier
function funDecor(el,tier){
  if(!el||!el.setAttribute)return;const t=tier==null?funTier():+tier||0;
  if(t>0)el.setAttribute('data-fun-tier',String(t));else el.removeAttribute('data-fun-tier');
}
// «Sterkere»-skjermen (kalles fra showEvolution): tekst, opplesing og litt konfetti
function funEvoShow(p){
  const r=p.rank||RANKS[p.to]||RANKS[0],w=document.querySelector('#evo-overlay .evo-word');
  if(w)w.textContent='✨ STERKERE! ✨';
  document.getElementById('evo-rank-text').textContent='Samme helt – nå med '+r.gift+'!';
  if(typeof speak==='function')try{speak(`Helten din ble sterkere! Du er nå ${r.name}. ${r.desc}`);}catch(e){}
  if(!funRM()&&typeof launch==='function')launch(120,['#ffd93d','#a855f7','#06d6ff','#ff6b35','#00ff88']);
}

// ============================================================
// MONSTER PER TEMA (emoji, kort navn, idle-animasjon a = hop|sway|pulse|float|tilt|chomp)
// ============================================================
const FUN_MONSTERS={
  add10:{e:'🐛',n:'Pluss-larven',a:'hop'},    sub10:{e:'🐭',n:'Minus-musa',a:'sway'},
  ten1:{e:'🦔',n:'Ti-pinnsvinet',a:'pulse'},  cmp1:{e:'🐘',n:'Stor-elefanten',a:'chomp'},
  seq1:{e:'🐌',n:'Telle-sneglen',a:'float'},  eq1:{e:'🦩',n:'Vippe-flamingo',a:'tilt'},
  add20:{e:'🐻',n:'Pluss-bjørnen',a:'hop'},   sub20:{e:'🦝',n:'Minus-tyven',a:'sway'},
  clock1:{e:'🐓',n:'Klokke-hanen',a:'tilt'},
  place2:{e:'🐜',n:'Tier-mauren',a:'hop'},    add100:{e:'🦒',n:'Pluss-sjiraffen',a:'sway'},
  sub100:{e:'🦈',n:'Minus-haien',a:'float'},  miss2:{e:'🐒',n:'Gjemme-apen',a:'hop'},
  even2:{e:'🦓',n:'Par-sebraen',a:'tilt'},    money2:{e:'🐷',n:'Sparegrisen',a:'pulse'},
  dbl2:{e:'🦜',n:'Dobbel-papegøye',a:'tilt'}, mul25:{e:'🐞',n:'Prikke-billen',a:'pulse'},
};
const FUN_GRADE_FOES={1:'Tall-larven',2:'Minus-billen',3:'Gange-øglen',4:'Dele-krokodillen',5:'Komma-dinoen',6:'Brøk-dragen',7:'Algebra-trollet',8:'Likningszombien',9:'Pytha-romvesenet',10:'Funksjons-ufoen'};
// Monsteret i temaet (reserve: dagens monster per klassetrinn)
function funMonster(g,tid){return FUN_MONSTERS[tid]||{e:(typeof ENEMIES==='object'&&ENEMIES[g])||'👾',n:FUN_GRADE_FOES[g]||'Tallmonsteret',a:null};}
// Lite merke på temanoden (hook i buildTopicMap). Låst tema: monsteret venter i skyggen.
function funNodeMonster(node,g,tid,open){
  const m=FUN_MONSTERS[tid],ic=m&&node&&node.querySelector?node.querySelector('.map-node-icon'):null;
  if(!ic||!ic.insertAdjacentHTML)return;
  ic.insertAdjacentHTML('beforeend',`<div class="fun-node-mon${open?'':' fun-shadow'}" data-fun-idle="${m.a}" title="${funEsc(m.n)}" aria-hidden="true">${m.e}</div>`);
}

// ============================================================
// MYNTER FOR LÆRING + «NY REKORD!»
// ============================================================
// Riktig på første forsøk: 2 🪙 i tema som ikke er mestret, 1 🪙 i mestret tema. Ny ⭐ og ny rekord gir +5 i kista.
// Bare to valg (Ja/Nei, også ⚡ Lynoppgave) gir 1 🪙 (lett å gjette); en svak regnemåte (e.w) gir +1 🪙. Revansj (søskenoppgave) gir vanlige mynter.
const FUN_STAR_COINS=5,FUN_REC_COINS=5;
function funAnswerCoins(g,tid){return typeof isTopicMastered==='function'&&isTopicMastered(g,tid)?1:2;}
// Hook i submitAnswer ved riktig svar: teller vekst (rettet selv, revansj) og gir myntene for svaret
function funOnRight(e,second){
  const st=funState();
  if(second){st.fix=(st.fix||0)+1;st.fx=(st.fx||0)+1;}
  if(e&&e.revenge)st.rev=(st.rev||0)+1;
  if(second||(e&&e.revenge)){funSave(st);funCheckBadges(true);}
  if(second)return 0;
  const c=funAnswerCoins(S.grade,S.topicId);
  return (e&&e.c2?1:c)+(e&&e.w&&!e.c2?1:0);
}
function funBest(g,tid){try{return typeof getBest==='function'?getBest(g,tid):null;}catch(e){return null;}}
// Kista (hook i showChest etter recordRound). Myntene for svarene er gitt underveis (S.funCoins).
// Gir {bonus (legges til nå), total (vises i kista), rec (ny rekord), small (enkel kiste i 1.–2. klasse)}
function funChest(res,s10){
  const g=S.grade,tid=S.topicId,nw=res?Math.max(0,(res.to||0)-(res.from||0)):0,best=funBest(g,tid);
  const rec=best!=null&&s10>best,bonus=nw*FUN_STAR_COINS+(rec?FUN_REC_COINS:0),small=g<=2;
  funRoundDone(res);
  const ov=document.getElementById('chest-overlay');if(ov&&ov.classList)ov.classList.toggle('fun-simple',small);
  return{bonus,total:(S.funCoins||0)+bonus,rec,small};
}
function funChestTiles(fc,c,n,xp){
  const tile=(i,v,k)=>`<div class="chest-reward${k?' '+k:''}"><span class="chest-reward-icon">${i}</span><div class="chest-reward-val">${v}</div></div>`;
  return (fc.small?'':tile('✅',`${c} av ${n}`)+tile('✨',`+${xp}`))+tile('🪙',`+${fc.total}`)+(fc.rec?tile('🏅','Ny rekord!','fun-rec'):'');
}

// ============================================================
// VEKSTMERKER (BADGES i state.js): læring, ikke mynter
// ============================================================
function funStarCount(){
  let pass=0,mast=0,stars=0;
  Object.keys(CUR).forEach(k=>(CUR[k].topics||[]).forEach(t=>{const s=topicStars(+k,t.id);stars+=s;if(s>=1)pass++;if(s>=3)mast++;}));
  return{pass,mast,stars};
}
// Deler ut merker barnet har fortjent (quick = bare tellerne for rettet/revansj)
function funCheckBadges(quick){
  const st=funState(),w={g_fix10:(st.fix||0)>=10,g_rev10:(st.rev||0)>=10};
  if(!quick){const c=funStarCount();Object.assign(w,{g_star3:c.mast>=1,g_master3:c.mast>=3,g_pass5:c.pass>=5,g_stars15:c.stars>=15,g_boss1:funBossWins()>=1,g_days5:funDays()>=5});}
  const got=Object.keys(w).filter(id=>w[id]&&!unlockedAchievements[id]&&ACHIEVEMENTS[id]);
  funGrant(got);return got;
}
// Lagrer alle med en gang; viser opptil 3 meldinger etter hverandre (vent hvis en melding alt vises)
function funGrant(ids){
  if(!ids||!ids.length)return;
  ids.forEach(id=>{unlockedAchievements[id]=Date.now();});
  localStorage.setItem('mh_ach',JSON.stringify(unlockedAchievements));
  const t=document.getElementById('achieve-toast'),busy=!!(t&&t.classList&&t.classList.contains('show'));
  ids.slice(0,3).forEach((id,i)=>{const k=i+(busy?1:0);if(k)setTimeout(()=>funToast(id),k*3700);else funToast(id);});
}
function funToast(id){
  const a=ACHIEVEMENTS[id],t=document.getElementById('achieve-toast');if(!a||!t)return;
  document.getElementById('at-icon').textContent=a.icon;document.getElementById('at-title').textContent=a.title;document.getElementById('at-sub').textContent=a.sub;
  t.classList.add('show');clearTimeout(funToast.t);funToast.t=setTimeout(()=>t.classList.remove('show'),3500);
  if(typeof sidekickReact==='function')sidekickReact('celebrate');
}

// ============================================================
// SPILLEDAGER 🌙 (prog.days teller alle dager barnet har spilt, nullstilles aldri; tikkes i pgStreakTick)
// ============================================================
function funDays(){return Math.max(0,+prog.days||0);}
// Gamle lagringer: start på gamle prog.streak, eller antall dager i mh_stats hvis det er flere
function funDaysInit(){
  if(prog.days!=null&&isFinite(+prog.days))return false;
  const today=mhDay(0),st=mhLoad('mh_stats',{});let n=prog.lastDay===today?1:0;
  if(st&&typeof st==='object'&&!Array.isArray(st))Object.keys(st).forEach(d=>{if(d<today&&st[d]&&st[d].n>0)n++;});
  prog.days=Math.max(+prog.streak||0,n);
  if(localStorage.getItem('mh_prog3'))saveProg();
  return true;
}

// ============================================================
// DAGENS ØKT: etter getSetting('session') runder samme dag (4, 8, …) – sammendrag + «Ferdig for i dag 🌙» / «Én runde til»
// ============================================================
function funState(){
  let s=mhLoad('mh_fun',null);if(!s||typeof s!=='object'||Array.isArray(s))s={};
  const d=mhDay(0);if(s.day!==d)Object.assign(s,{day:d,r:0,sh:0,st:0,fx:0,up:{}});
  if(!s.up||typeof s.up!=='object'||Array.isArray(s.up))s.up={};
  return s;
}
function funSave(s){mhSave('mh_fun',s);}
function funSessionLen(){const v=parseInt(typeof getSetting==='function'?getSetting('session'):4,10);return v>=1&&v<=20?v:4;}
// En ferdig runde (kista) eller kamp (boss/troll): tell den, husk nye stjerner, og se etter økt-grensen
function funRoundDone(res){
  const s=funState();s.r=(s.r||0)+1;
  if(res&&res.to>res.from&&S&&S.topicId){const k=S.grade+':'+S.topicId,u=s.up[k];s.st=(s.st||0)+(res.to-res.from);s.up[k]=[u?u[0]:res.from,res.to];}
  funSave(s);funCheckBadges();funSessionWatch();
  return s;
}
// Boss- og trollkamp (hook i pgBossResult): teller som runde; viser ny rang i resultatet
function funFight(win,g,box){
  funRoundDone(null);
  if(win&&typeof pendingEvolution!=='undefined'&&pendingEvolution&&box&&box.insertAdjacentHTML){const r=pendingEvolution.rank||{};box.insertAdjacentHTML('afterbegin',`<div class="pg-pill fun-rank-pill">⬆️ Ny rang: <b>${funEsc(r.name||'')}</b></div>`);}
}
// Grensen som skal vises nå (4, 8, …), eller 0
function funSessionDue(){const n=funSessionLen(),s=funState(),b=Math.floor((s.r||0)/n)*n;return b>=n&&b>(s.sh||0)?b:0;}
function funScr(n){const e=document.getElementById('screen-'+n);return !!(e&&e.classList&&e.classList.contains('active'));}
// Rolig øyeblikk: resultat- eller kartskjermen, ingen andre vinduer, ingen seremoni på kartet
function funCalm(){
  if(!(funScr('results')||funScr('grades')||funScr('topics')))return false;
  if(typeof pgBlocked==='function'&&pgBlocked())return false;
  if(typeof pgBusy!=='undefined'&&pgBusy)return false;
  return !document.querySelector('.fun-day.show,.boss-overlay.show,.pg-banner.show');
}
let funWaitT=0;
// Venter på et rolig øyeblikk etter runden. Starter en ny runde først (nytt S), venter vi til den er ferdig.
function funSessionWatch(){
  clearTimeout(funWaitT);funWaitT=0;if(!funSessionDue())return;
  const s0=S;let k=0;
  const tick=()=>{funWaitT=0;if(S!==s0||!funSessionDue())return;if(funCalm()){funShowDay();return;}if(++k<1500)funWaitT=setTimeout(tick,400);};
  funWaitT=setTimeout(tick,600);
}
// Hva barnet ble bedre på i dag (mh_fun + mh_learn + mh_stats)
function funToday(){
  const s=funState(),today=mhDay(0),st=(mhLoad('mh_stats',{})||{})[today]||{},T=(g,id)=>(CUR[g]?.topics||[]).find(t=>t.id===id);
  const up=Object.keys(s.up).map(k=>{const[g,id]=k.split(':'),t=T(+g,id);return t?{g:+g,t,to:s.up[k][1]}:null;}).filter(Boolean);
  const played=Object.keys(st.t||{}).map(k=>{const[g,id]=k.split(':');return T(+g,id);}).filter(Boolean);
  let crowns=0;const L=mhLoad('mh_learn',{});if(L&&typeof L==='object')Object.keys(L).forEach(k=>{if(L[k]&&L[k].cr===today)crowns++;});
  return{stars:s.st||0,fixed:s.fx||0,up,played,crowns,ok:+st.ok||0,rounds:s.r||0};
}
function funDayEl(){
  let o=document.getElementById('fun-day');
  if(!o){o=document.createElement('div');o.id='fun-day';o.className='fun-day';o.setAttribute('role','dialog');o.setAttribute('aria-modal','true');o.setAttribute('aria-labelledby','fun-day-title');if(document.body)document.body.appendChild(o);}
  return o;
}
function funShowDay(){
  const b=funSessionDue();if(!b)return false;
  const s=funState();s.sh=b;funSave(s);
  const d=funToday(),p=typeof getPlayer==='function'?getPlayer():{name:'Helt'},hero=typeof getCharEmoji==='function'&&localStorage.getItem('mh_player')?getCharEmoji(getCharIdx()):p.emoji;
  const row=(i,t)=>`<div class="fun-day-row"><span class="fun-day-ic">${i}</span><span>${t}</span></div>`;
  const chip=x=>`<span class="fun-day-chip">${funEsc(x.t.icon)} ${funEsc(x.t.name)}${x.to!=null&&typeof mstStarsHTML==='function'?' '+mstStarsHTML(x.to):''}</span>`;
  let h='';
  if(d.stars)h+=row('⭐',`<b>${d.stars} ${d.stars===1?'ny stjerne':'nye stjerner'}!</b>`);
  if(d.up.length)h+=`<div class="fun-day-chips">${d.up.slice(0,4).map(chip).join('')}</div>`;
  else if(d.played.length)h+=row('🗺️','Du øvde på:')+`<div class="fun-day-chips">${d.played.slice(0,4).map(t=>chip({t})).join('')}</div>`;
  if(d.crowns)h+=row('👑',`<b>${d.crowns===1?'Gullkrone!':d.crowns+' gullkroner!'}</b>`);
  if(d.fixed)h+=row('💪',`Du rettet selv <b>${d.fixed}</b> ${d.fixed===1?'gang':'ganger'}!`);
  if(d.ok)h+=row('✅',`<b>${d.ok}</b> riktige i dag`);
  const o=funDayEl();
  o.innerHTML=`<div class="fun-day-card">
    <div class="fun-day-lbl">🌙 Dagens økt</div>
    <div class="fun-day-hero" id="fun-day-hero">${funEsc(hero)}</div>
    <div class="fun-day-title" id="fun-day-title">Bra jobba i dag, ${funEsc(p.name)}!</div>
    <div class="fun-day-list">${h||row('🌟','Du øvde godt i dag!')}</div>
    <button type="button" class="fun-day-done" onclick="funDayDone()">Ferdig for i dag 🌙</button>
    <button type="button" class="fun-day-more" onclick="funDayMore()">Én runde til ⚔️</button>
  </div>
  <div class="fun-night" onclick="funDayEnd()" aria-live="polite">
    <div class="fun-night-sky" aria-hidden="true"><i>✦</i><i>✧</i><i>✦</i><i>✧</i><i>✦</i><i>✧</i></div>
    <div class="fun-night-moon" aria-hidden="true">🌙</div>
    <div class="fun-night-hero" id="fun-night-hero">${funEsc(hero)}<span class="fun-zz" aria-hidden="true">💤</span></div>
    <div class="fun-night-txt">Helten din hviler nå.<br>Vi ses i morgen! 🌙</div>
  </div>`;
  ['fun-day-hero','fun-night-hero'].forEach(id=>{const e=document.getElementById(id);if(typeof applyHeroDecor==='function')applyHeroDecor(e,{pet:false});else funDecor(e);});
  o.classList.remove('night');o.classList.add('show');
  if(typeof ttsStop==='function')try{ttsStop();}catch(e){}
  if(typeof speak==='function')try{speak(`Bra jobba i dag!${d.stars?` Du fikk ${d.stars===1?'en ny stjerne':d.stars+' nye stjerner'}.`:''}${d.fixed?' Du rettet selv.':''} Vil du ta en pause?`);}catch(e){}
  if(typeof tone==='function'){tone(659,.12,'triangle',.12);setTimeout(()=>tone(880,.18,'triangle',.12),110);}
  const bt=o.querySelector&&o.querySelector('.fun-day-done');if(bt&&bt.focus)try{bt.focus({preventScroll:true});}catch(e){}
  return true;
}
let funNightT=0;
// «Ferdig for i dag»: rolig god-natt-scene, så tilbake til kartet
function funDayDone(){
  const o=funDayEl();o.classList.add('night');
  if(typeof speak==='function')try{speak('Helten din hviler nå. Vi ses i morgen!');}catch(e){}
  if(typeof tone==='function')[784,659,523,392].forEach((f,i)=>setTimeout(()=>tone(f,.4,'sine',.07),i*320));
  clearTimeout(funNightT);funNightT=setTimeout(funDayEnd,funRM()?2200:3400);
}
function funDayEnd(){
  clearTimeout(funNightT);funNightT=0;
  const o=funDayEl();if(!o.classList.contains('show'))return;
  o.classList.remove('show','night');
  if(!funScr('grades')){if(typeof buildGradeMap==='function')buildGradeMap();showScreen('grades');}
}
function funDayMore(){
  const o=funDayEl();o.classList.remove('show','night');
  if(typeof goFight==='function')goFight();else showScreen('grades');
}

// ============================================================
// OPPSTART (etter boss.js, før init.js): migrering av rang og spilledager, 🌙 i HUD
// ============================================================
funRankInit();
funDaysInit();
(function(){
  const h=document.querySelector('.hud-streak');if(!h)return;
  const n=h.firstChild;if(n&&n.nodeType===3)n.textContent='🌙';
  h.title='Spilledager';
})();
