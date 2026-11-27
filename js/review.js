// Mattehelten – «Trollet er tilbake!»: daglig repetisjonskamp på mestrede temaer (gullkrone)
// Alle js-filer deler globalt navnerom (vanlige <script>-tagger i fast rekkefølge, se index.html).
//
// Spredt repetisjon: trollet dukker opp på klassekartet og temakartet bare når et tema med ⭐⭐⭐ er «modent»:
//   ✨ «Puss opp» (trollet fant noe glemt en tidligere dag) kommer først, ellers minst TROLL_GAP dager siden temaet ble øvd,
//   og etter 👑 tidligst om TROLL_GAP_CROWN dager. Uten ⭐⭐⭐ kommer ikke trollet (det er ingen krone å vinne).
// 6 oppgaver fra opptil 3 temaer i samme trinn (2 hver), ingen revansj. Seier = ≥ 5 av 6 på første forsøk; 👑 krever i tillegg
// at alle temaets trolloppgaver er riktige (2 av 2). Et tema med feil får ikke ny repetisjonsdag (rv), men pu («Puss opp»),
// så det kommer først neste dag. Tar aldri noe bort: taper barnet, kan det prøve igjen samme dag.
// Kampen bruker boss-motoren (boss.js: bossBegin med S.troll). Lagring: mh_review = {day,g,ids,won,mastered,pu}
// (dagens valg; mastered = en krone kan vinnes); rv, pu og kronen (cr) per tema ligger i mh_learn (mastery.js).
const TROLL_Q=6,TROLL_NEED=5,TROLL_GAP=2,TROLL_GAP_CROWN=7;
const TROLL_BACK={name:'Glemme-trollet',emoji:'🧌',
  taunt:'Hå hå! Jeg er tilbake! Husker du fortsatt dette?',
  hit:['Au! Du husket det!','Hæ?! Ikke glemt?!','Uff, du er god!','Trollnesa mi klør!'],
  miss:['Hå hå! Glemte du?','Hehe, prøv igjen!','Nesten! Tenk deg om!'],
  ko:'Uff da! Du husker alt!',flee:'Hå hå, jeg kommer tilbake! 💨'};
if(typeof BADGES!=='undefined'&&!BADGES.some(b=>b.id==='troll_crown')){
  BADGES.push({id:'troll_crown',icon:'👑',name:'Gullkrone!',desc:'Vinn over trollet som kom tilbake',secret:false});
  ACHIEVEMENTS.troll_crown={icon:'👑',title:'Gullkrone!',sub:'Vinn over trollet som kom tilbake'};
}

// Er et mestret tema modent for repetisjon i dag? ✨ Puss opp fra en tidligere dag, ellers avstand siden sist (lengre etter 👑)
function trollRipe(g,id,today){
  const e=mstGet(g,id)||{};if(e.pu&&e.pu<today)return true;
  const ago=mstAgo(mstLastDay(g,id),today);
  return ago>=TROLL_GAP&&(!e.cr||mstAgo(e.rv||e.cr,today)>=TROLL_GAP_CROWN);
}
// Temaer som kan repeteres i dag: bare ⭐⭐⭐. «Puss opp» først, så eldst øvd, så uten krone, så lavest trinn
function trollPool(today){
  const all=[];
  Object.keys(CUR).forEach(k=>{const g=+k;if(!isGradeUnlocked(g))return;(CUR[g].topics||[]).forEach(t=>{
    if(topicStars(g,t.id)<3||!trollRipe(g,t.id,today))return;const e=mstGet(g,t.id)||{};
    all.push({g,id:t.id,s:3,last:mstLastDay(g,t.id),cr:hasCrown(g,t.id)?1:0,pu:e.pu&&e.pu<today?1:0});});});
  return all.sort((a,b)=>(b.pu-a.pu)||(a.last<b.last?-1:a.last>b.last?1:0)||(a.cr-b.cr)||(a.g-b.g));
}
function trollPick(today){
  const p=trollPool(today);if(!p.length)return null;
  const g=p[0].g,sel=p.filter(x=>x.g===g).slice(0,3);
  return{day:today,g,ids:sel.map(x=>x.id),won:false,mastered:sel.some(x=>!x.cr),pu:sel.filter(x=>x.pu).map(x=>x.id)};
}
// 👑 for et tema: alle temaets trolloppgaver riktige på første forsøk (2 av 2)
function trollCrownOk(st){return !!(st&&st.n>0&&st.ok===st.n);}
function trollState(){const r=mhLoad('mh_review',null);return r&&typeof r==='object'&&!Array.isArray(r)?r:null;}
// Dagens tilbud {day,g,ids,won,mastered} eller null (vunnet i dag, eller ingenting å repetere). Fast for hele dagen.
function trollToday(){
  const today=mhDay(0);let r=trollState();
  if(r&&r.day===today){
    if(r.won)return null;
    const ts=CUR[r.g]?.topics||[];
    if(Array.isArray(r.ids)&&r.ids.length&&r.ids.every(id=>ts.some(t=>t.id===id)&&topicStars(r.g,id)>=3))return r; // dagens valg står (også etter tap)
  }
  r=trollPick(today);
  if(r)mhSave('mh_review',r);
  return r;
}
function trollTopics(r){const ts=CUR[r&&r.g]?.topics||[];return (r&&r.ids||[]).map(id=>ts.find(t=>t.id===id)).filter(Boolean);}
function trollEsc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

// ---- Tilbudet på kartene (hook: slutten av buildGradeMap / buildTopicMap) ----
let trollFrom='grades';
function trollDecorate(where,g){
  const id=where==='topics'?'troll-offer-t':'troll-offer-g';
  let el=document.getElementById(id);
  const r=trollToday();
  if(!r){if(el&&el.remove)el.remove();return;}
  if(!el){el=document.createElement('button');el.id=id;el.type='button';}
  el.className='troll-offer';
  const ts=trollTopics(r);
  const pu=Array.isArray(r.pu)&&r.pu.length?ts.filter(t=>r.pu.includes(t.id)):[];
  el.innerHTML=`<span class="troll-offer-icon">🧌</span><span class="troll-offer-txt"><b>Trollet er tilbake!</b><span>${pu.length?`✨ Puss opp ${pu.map(t=>trollEsc(t.icon)).join(' ')}! `:''}Husker du ${ts.map(t=>trollEsc(t.icon)).join(' ')}?${r.mastered?' Vinn 👑':''}</span></span><span class="troll-offer-go">⚔️</span>`;
  el.onclick=()=>openTrollIntro(where==='topics'?(g||currentGrade):'grades');
  if(where==='topics'){
    const wrap=document.getElementById('topic-map-wrap');if(wrap&&wrap.insertAdjacentElement)wrap.insertAdjacentElement('beforebegin',el);
    if(+g===+r.g){const box=document.getElementById('topic-map-nodes');(CUR[r.g]?.topics||[]).forEach((t,i)=>{if(!r.ids.includes(t.id))return;const ic=box&&box.children&&box.children[i]&&box.children[i].querySelector('.map-node-icon');if(ic&&!ic.querySelector('.troll-node'))ic.insertAdjacentHTML('beforeend','<div class="troll-node">🧌</div>');});}
  }else{
    const bar=document.querySelector('#screen-grades .pg-map-bar'),wrap=document.getElementById('adv-map-wrap');
    if(bar&&bar.insertAdjacentElement)bar.insertAdjacentElement('afterend',el);else if(wrap&&wrap.insertAdjacentElement)wrap.insertAdjacentElement('beforebegin',el);
    const nodes=document.getElementById('adv-map-nodes'),n=nodes&&nodes.children&&nodes.children[r.g-1],ic=n&&n.querySelector('.map-node-icon');
    if(ic&&!ic.querySelector('.troll-node'))ic.insertAdjacentHTML('beforeend','<div class="troll-node">🧌</div>');
  }
}

// ---- Intro (gjenbruker boss-intro) og kamp ----
function openTrollIntro(from){
  const r=trollToday();if(!r)return;
  const ts=trollTopics(r),b=TROLL_BACK;if(!ts.length)return;
  trollFrom=from==null?'grades':from;
  bossPendingGrade='troll';
  document.getElementById('bi-tag').textContent='🧌 TROLLET ER TILBAKE! 🧌';
  document.getElementById('bi-emoji').textContent=b.emoji;if(typeof figBossIntro==='function')figBossIntro('troll'); // 3D-figur (figures.js)
  document.getElementById('bi-name').textContent=b.name;
  document.getElementById('bi-grade').textContent=`${TROLL_Q} oppgaver · ${TROLL_NEED} riktige vinner${r.mastered?' 👑':''}`;
  document.getElementById('bi-taunt').textContent=b.taunt;
  const pu=Array.isArray(r.pu)?r.pu:[];
  document.getElementById('bi-skills').innerHTML=`<div class="boss-skills-lbl">Husker du dette?</div><div class="boss-chips">${ts.map(t=>`<span class="boss-chip">${pu.includes(t.id)?'✨ ':''}${trollEsc(t.icon)} ${trollEsc(t.name)}</span>`).join('')}</div>`;
  document.getElementById('bi-test').classList.toggle('show',!!bossTestSnap);
  const o=document.getElementById('boss-intro');
  o.classList.remove('final');o.classList.add('troll','show');
  const rl=document.querySelector('#boss-intro .boss-rule');if(rl)rl.textContent='Svar riktig for å treffe trollet! 💥';
  bossRumble();
  bossSay(b.taunt);
}
function startTroll(){
  const r=trollToday();if(!r)return;
  const ts=trollTopics(r);if(!ts.length)return;
  bossBegin(r.g,ts,TROLL_BACK,{q:TROLL_Q,need:TROLL_NEED,tag:'🧌 ',troll:true});
}

// ---- Resultat (kalles fra showBossResult når S.troll) ----
function trollResult(win){
  const g=S.grade,b=TROLL_BACK,today=mhDay(0),ts=S.bossTopics||[],c=bossFirstOk(),n=S.bossLog.filter(Boolean).length||S.questions.length;
  const full=t=>trollCrownOk(S.bossStats[t.id]),forgot=ts.filter(t=>S.bossStats[t.id]&&!full(t));
  // Husket (alle riktige) → ny repetisjonsdag; glemt (minst én feil) → «✨ Puss opp», kommer først neste dag
  ts.forEach(t=>{if(full(t))mstMarkReview(g,t.id,today);else if(S.bossStats[t.id])mstMarkForgot(g,t.id,today);});
  const crowns=[];
  if(win){
    ts.forEach(t=>{if(full(t)&&isTopicMastered(g,t.id)&&mstSetCrown(g,t.id,today))crowns.push(t);});
    const st=trollState()||{};st.day=today;st.won=true;if(!st.g){st.g=g;st.ids=ts.map(t=>t.id);}mhSave('mh_review',st);
  }
  const allCr=ts.length&&ts.every(t=>hasCrown(g,t.id));
  const xp=win?40:10,coins=win?8:2,oldL=curLvl();
  prog.xp+=xp;prog.coins+=coins;saveProg();renderHUD();
  const newL=curLvl();
  if(newL>oldL){checkEvolution(oldL,newL);unlockAchievement('lvlup');if(newL>=5)unlockAchievement('lvl5');if(newL>=8)unlockAchievement('lvl8');if(newL>=12)unlockAchievement('lvl12');}
  updatePlayerEmoji();
  if(prog.coins>=50)unlockAchievement('coins50');if(prog.coins>=100)unlockAchievement('coins100');
  if(crowns.length)unlockAchievement('troll_crown');

  const o=document.getElementById('boss-result');
  o.classList.toggle('win',win);
  const em=document.getElementById('br-emoji');
  em.className='boss-emoji '+(win?'boss-ko':'boss-run');
  em.textContent=win?(crowns.length?'👑':'🏆'):b.emoji+'💨';
  if(typeof figClear==='function'){figClear(em);if(win&&typeof figHero==='function')figHero(em,'win',{once:true});else if(!win&&typeof figBoss==='function')figBoss(em,g,'taunt',{once:true});}
  document.getElementById('br-title').textContent=win?'Du husket det! 🎉':'Nesten! 💪';
  const names=crowns.map(t=>`${trollEsc(t.icon)} ${trollEsc(t.name)}`).join(', '),fg=forgot.map(t=>trollEsc(t.icon)).join(' ');
  document.getElementById('br-sub').innerHTML=win?
    `${b.emoji} «${b.ko}»${crowns.length?`<div class="boss-unlock">👑 Gullkrone: ${names}!</div>`:allCr&&!forgot.length?'<div class="boss-unlock">👑 Du husker fortsatt alt!</div>':''}${forgot.length?`<div class="boss-practice">✨ ${fg}: ${forgot.some(t=>!hasCrown(g,t.id))?'alle riktige gir 👑. ':''}Trollet kommer igjen i morgen!</div>`:'<div class="boss-practice">Trollet kommer tilbake en annen dag.</div>'}`:
    `${b.name} slapp unna! 💨<br>Prøv igjen – du klarer det!`;
  const chips=ts.filter(t=>S.bossStats[t.id]).map(t=>{const s=S.bossStats[t.id];return `<span class="boss-chip${s.ok>0?' good':''}">${hasCrown(g,t.id)?'👑':s.ok===s.n?'⭐':s.ok>0?'✓':'💪'} ${trollEsc(t.icon)} ${trollEsc(t.name)} · ${s.ok} av ${s.n}</span>`;}).join('');
  document.getElementById('br-skills').innerHTML=chips?`<div class="boss-skills-lbl">🧠 Dette husket du:</div><div class="boss-chips">${chips}</div>`:'';
  document.getElementById('br-rewards').innerHTML=[['✅',`${c} av ${n}`],['✨',`+${xp}`],['🪙',`+${coins}`]].map(([i,v])=>`<div class="chest-reward"><span class="chest-reward-icon">${i}</span><div class="chest-reward-val">${v}</div></div>`).join('');
  document.getElementById('br-btns').innerHTML=win?'<button class="boss-go gold" onclick="trollExit()">🗺️ Til kartet</button>':
    '<button class="wp-cancel" onclick="trollExit()">🗺️ Kart</button><button class="boss-go" onclick="bossRetry()">🔁 Prøv igjen</button>';
  document.getElementById('br-test').classList.toggle('show',!!bossTestSnap);
  o.classList.add('show');
  if(win){if(!heroVictoryFx(160))launch(160,['#ffd93d','#ff6b35','#00ff88','#06d6ff','#a855f7']);bossFanfare();sidekickReact('celebrate');}
  else{tone(523,.12);setTimeout(()=>tone(659,.18),120);sidekickReact('happy');}
  pgBossResult(win,g,false); // PROGRESSION: streak, NIVÅ OPP
  bossSay(win?(crowns.length?'Du husket det! Du fikk gullkrone!':'Du husket det!'):'Nesten! Prøv igjen!');
}
function trollExit(){
  document.getElementById('boss-result').classList.remove('show');
  bossCleanup();
  bossRestore(); // ends a ?boss= test session (no-op otherwise)
  if(!localStorage.getItem('mh_player')){showScreen('chars');return;}
  buildGradeMap();
  if(typeof trollFrom==='number'&&CUR[trollFrom]&&isGradeUnlocked(trollFrom))selectGrade(trollFrom);else showScreen('grades');
  if(pendingEvolution)showEvolution();
}
