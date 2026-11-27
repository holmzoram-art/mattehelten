// Mattehelten – Boss-kamper
// Alle js-filer deler globalt navnerom (vanlige <script>-tagger i fast rekkefølge, se index.html).

// ============================================================
// BOSS FIGHTS
// ============================================================
// A boss waits at the end of every grade's topic map. It reuses #screen-game and
// the normal battle loop (loadQuestion/submitAnswer): S.boss=true and S.topic is a
// synthetic topic that mixes all of the grade's topics. Hooks in existing code:
// isGradeUnlocked, buildGradeMap, buildTopicMap, submitAnswer, handleNext.
// Parent test shortcut: ?boss=<grade> (e.g. ?boss=1) opens that boss directly;
// every localStorage change made during the test is rolled back afterwards.
// Rules: about 12 questions from all required (non-optional) topics. Win = K.O. = at least 75 % right on
// the first try AND no topic where all its boss questions were wrong. A missed topic comes back ~3 questions
// later. Otherwise the boss flees after BOSS_MAXQ questions and the child gets «Øv på <tema>».
// The same fight engine runs «Trollet er tilbake!» (review.js: S.troll, 6 questions, 5 right wins).
const BOSS_MAXQ=12,BOSS_WIN=.75;
const BOSSES={
  1:{name:'Pluss-trollet',emoji:'🧌',hp:12,badge:'Trolltemmer',skills:'pluss og minus',
     taunt:'Hå hå! Jeg har blandet sammen alle plusstykkene i Talland. Du klarer aldri å telle riktig!',
     hit:['Au! Du kan jo telle!','Hæ?! Riktig igjen?!','Trollknærne mine skjelver!','Uff, det kilte i nesa!'],
     miss:['Hå hå, bom! Prøv igjen!','Hehe, den var lur, hva?','Nesten! Tell en gang til!'],
     ko:'Uff da, du vant! Nå skal jeg plusse riktig!'},
  2:{name:'Gange-ormen',emoji:'🐍',hp:12,badge:'Ormetemmer',skills:'pluss, minus og ganging',
     taunt:'Sssss! Jeg har kveilet meg rundt alle tallene i Tallskogen. Ingen sssslipper forbi meg!',
     hit:['Ssssau! Det kilte!','Sss... du er flink!','Halen min knyter seg!','Sssstopp, ikke så fort!'],
     miss:['Sssss! Bom! Prøv igjen!','Hisss, den var vrien, hva?','Ssssnart har du den!'],
     ko:'Sssså flink du er! Jeg slipper tallene fri!'},
  3:{name:'Gangekrabben',emoji:'🦀',hp:13,badge:'Krabbeknekker',skills:'gangetabellen og deling',
     taunt:'Knip knip! Jeg har knepet i stykker gangetabellen. Ingen kommer inn i Gangeborgen!',
     hit:['Au, klypa mi!','Knip... knasj!','Krabbe-krise!','Jeg går sidelengs av skrekk!'],
     miss:['Knip knip, bom!','Hehe, prøv igjen!','Klypa mi tok den!'],
     ko:'Knip... du vant! Porten er åpen!'},
  4:{name:'Dele-dragen',emoji:'🐲',hp:13,badge:'Delemester',skills:'gangetabellen, deling og brøk',
     taunt:'Grrr! Alle tallene er MINE! Jeg deler aldri med noen!',
     hit:['Au, halen min!','Hmpf! Du deler bra!','Det kommer røyk ut av nesa mi!','Nei, ikke skatten min!'],
     miss:['Ha! Bom! Mine tall!','Hehe! Prøv igjen!','Den skatten beholder jeg!'],
     ko:'Ok, ok! Jeg skal lære å dele!'},
  5:{name:'Komma-heksen',emoji:'🧙‍♀️',hp:14,badge:'Kommamester',skills:'desimaltall, prosent og avrunding',
     taunt:'Hokus pokus! Jeg har flyttet alle kommaene. Nå er ingen tall riktige! Hi hi hi!',
     hit:['Au, kosten min!','Trylleformelen virket ikke!','Hi hi... au!','Hatten min falt av!'],
     miss:['Hi hi hi, bom!','Hokus pokus, prøv igjen!','Oi, kommaet hoppet!'],
     ko:'Neeei! Alle kommaene flyr tilbake!'},
  6:{name:'Minus-spøkelset',emoji:'👻',hp:14,badge:'Spøkelsesjeger',skills:'brøk, areal og negative tall',
     taunt:'Bøøø! Jeg gjør alle tall mindre og mindre... helt ned under null!',
     hit:['Bø... au!','Jeg blir helt gjennomsiktig!','Uææ, du er modig!','Lakenet mitt revnet!'],
     miss:['Bøøø! Bom!','Spøk og spill! Prøv igjen!','Bø! Nesten!'],
     ko:'Bøh... du vant. Nå flyr jeg hjem!'},
  7:{name:'Kaptein X',emoji:'🦹',hp:14,badge:'X-finner',skills:'algebra, forholdstall og gjennomsnitt',
     taunt:'Stopp! Dette er Nullius\' festning. Bare jeg vet hva X er, og jeg sier det aldri!',
     hit:['Hva?! Du fant X!','Kappa mi floker seg!','Umulig!','Au, masken min!'],
     miss:['Ha! X er hemmelig!','Feil X! Prøv igjen!','Hehe, nesten!'],
     ko:'Neiii! Du knakk koden! Festningen er åpen!'},
  8:{name:'Kaos-blekkspruten',emoji:'🐙',hp:15,badge:'Kaos-rydder',skills:'likninger, potenser og prosent',
     taunt:'Åtte armer, åtte ganger kaos! Jeg roter til alle likningene i byen!',
     hit:['Au, arm nummer tre!','Blekk overalt!','Armene mine knyter seg!','Blubb! Du er rask!'],
     miss:['Blubb blubb, bom!','Kaos! Prøv igjen!','Hehe, sprut!'],
     ko:'Blubb... du ryddet opp i kaoset!'},
  9:{name:'Pytha-Rex',emoji:'🦖',hp:15,badge:'Dinotemmer',skills:'Pytagoras, statistikk og algebra',
     taunt:'RAAAWR! Jeg vokter Pythagoras-tårnet. Trekantene mine er altfor vanskelige for deg!',
     hit:['RAAAU! Au!','De små armene mine!','Rawr... du er god!','Tårnet rister!'],
     miss:['RAWR! Bom!','Hehe, prøv igjen!','Trekanten vant den!'],
     ko:'Rawr... du er sjefen nå!'},
  10:{name:'NULLIUS',emoji:'👹',hp:15,badge:'Nullius-knuser',skills:'funksjoner, trigonometri og sannsynlighet',koEmoji:'0️⃣',
     taunt:'Så du kom helt til toppen, lille helt? Jeg skal gjøre ALLE tall om til NULL!',
     hit:['Grr! Det kjente jeg!','Umulig! Hvordan?!','Matematikken din er for sterk!','Neeei!'],
     miss:['Ha ha! Null poeng!','Mørket vinner! ...eller?','Prøv igjen, hvis du tør!'],
     ko:'Neeei! Jeg krymper... Nå er jeg bare en liten null!',
     flee:'Jeg må hvile litt... Vi ses igjen! 💨',
     phases:[
       {at:66,emoji:'🌪️',name:'Storm-Nullius',flash:'FASE 2!',say:'GRRR! Nå blåser jeg opp en tallstorm!'},
       {at:33,emoji:'🌋',name:'Vulkan-Nullius',flash:'FASE 3!',say:'Jeg koker over! Men jeg gir meg ikke!'},
     ]},
};

// Boss badges are appended to the end of BADGES (rendered by openBadges automatically)
[
  ...Object.keys(BOSSES).map(g=>({id:'boss'+g,icon:BOSSES[g].emoji,name:BOSSES[g].badge,desc:`Beseir ${BOSSES[g].name}`,secret:+g>2})),
  {id:'talland',icon:'👑',name:'Tallands helt',desc:'Redd hele kongeriket Talland!',secret:true},
].forEach(b=>{if(!BADGES.some(x=>x.id===b.id)){BADGES.push(b);ACHIEVEMENTS[b.id]={icon:b.icon,title:b.name,sub:b.desc};}});

function isBossDefeated(g){return !!localStorage.getItem('mh_boss_'+g);}
function isBossUnlocked(g){const t=mstCore(g);return t.length>0&&t.every(x=>isTopicPassed(g,x.id));} // optional topics (mul25) don't count
function bossHero(){return localStorage.getItem('mh_player')?getCharEmoji(getCharIdx(),curLvl()):getPlayer().emoji;}
function bossEsc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function bossShuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function bossFanfare(){[523,659,784,1046,0,784,1046,1318].forEach((f,i)=>{if(f)setTimeout(()=>tone(f,.16,'triangle',.22),i*110);});}
function bossRumble(){tone(110,.35,'sawtooth',.12);setTimeout(()=>tone(82,.45,'sawtooth',.12),220);}
function bossToast(icon,title,sub){
  const t=document.getElementById('achieve-toast');
  document.getElementById('at-icon').textContent=icon;
  document.getElementById('at-title').textContent=title;
  document.getElementById('at-sub').textContent=sub;
  t.classList.add('show');clearTimeout(t._bt);t._bt=setTimeout(()=>t.classList.remove('show'),2500);
}

// ---- Test mode (?boss=<g>): snapshot localStorage, roll back when the test ends ----
let bossTestSnap=null;
function bossSnapshot(){const o={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);o[k]=localStorage.getItem(k);}return o;}
function bossRestore(){
  const snap=bossTestSnap;if(!snap)return;
  bossTestSnap=null;
  const now=[];for(let i=0;i<localStorage.length;i++)now.push(localStorage.key(i));
  now.forEach(k=>{if(!Object.prototype.hasOwnProperty.call(snap,k))localStorage.removeItem(k);});
  Object.keys(snap).forEach(k=>{if(localStorage.getItem(k)!==snap[k])localStorage.setItem(k,snap[k]);});
  prog=JSON.parse(localStorage.getItem('mh_prog3')||'{"xp":0,"coins":0,"streak":0,"lastDay":""}');
  unlockedAchievements=JSON.parse(localStorage.getItem('mh_ach')||'{}');
  pendingEvolution=null;
  renderHUD();
  if(localStorage.getItem('mh_player'))updatePlayerEmoji();
}

// ---- Boss node at the end of the topic map (hook: end of buildTopicMap) ----
function bossAddTopicNode(g){
  const b=BOSSES[g],wrap=document.getElementById('topic-map-wrap');
  let gate=document.getElementById('boss-gate');
  if(!b||!wrap){if(gate)gate.remove();return;}
  if(!gate){gate=document.createElement('div');gate.id='boss-gate';}
  wrap.insertAdjacentElement('afterend',gate);
  const topics=mstCore(g),passed=topics.filter(t=>isTopicPassed(g,t.id)).length;
  const beaten=isBossDefeated(g),open=beaten||isBossUnlocked(g);
  gate.className='boss-gate'+(open?'':' locked')+(beaten?' beaten':'')+(g===10?' final':'');
  const status=beaten?'👑 Beseiret! Vil du kjempe igjen?':open?'⚔️ Klar for kamp! Trykk her!':`🔒 Få ⭐ på alle temaene først (${passed}/${topics.length})`;
  gate.innerHTML=`<div class="boss-gate-line"></div>
    <div class="boss-gate-node">
      <div class="boss-gate-icon">${b.emoji}${beaten?'<div class="boss-crown">👑</div>':''}${open?'':'<div class="map-node-lock">🔒</div>'}</div>
      <div class="boss-gate-info"><div class="boss-gate-tag">${g===10?'⚠️ SISTE BOSS':'👑 BOSS'}</div><div class="boss-gate-name">${b.name}</div><div class="boss-gate-status">${status}</div></div>
    </div>`;
  gate.onclick=()=>{
    if(isBossDefeated(g)||isBossUnlocked(g))openBossIntro(g);
    else bossToast('🔒','Låst!','Få ⭐ på alle temaene først!');
  };
}

// ---- Crowns + "replay ending" button on the grade map (hook: buildGradeMap) ----
function bossDecorateGradeMap(){
  const nodes=document.getElementById('adv-map-nodes');
  if(nodes)GRADE_INFO.forEach((gi,i)=>{
    const ic=nodes.children[i]?.querySelector('.map-node-icon');
    if(ic&&isBossDefeated(gi.num)&&!ic.querySelector('.boss-crown'))ic.insertAdjacentHTML('beforeend','<div class="boss-crown" title="Boss beseiret!">👑</div>');
  });
  const wrap=document.getElementById('adv-map-wrap');
  let btn=document.getElementById('ending-replay-btn');
  if(isBossDefeated(10)&&wrap){
    if(!btn){btn=document.createElement('button');btn.id='ending-replay-btn';btn.className='boss-replay-btn';btn.textContent='🎬 Se slutten igjen';btn.onclick=()=>showEnding(false);}
    wrap.insertAdjacentElement('afterend',btn);
  }else if(btn)btn.remove();
}

// ---- Intro overlay ----
let bossPendingGrade=null;
function openBossIntro(g){
  const b=BOSSES[g];if(!b)return;
  bossPendingGrade=g;
  document.getElementById('bi-tag').textContent=g===10?'⚠️ DET STORE OPPGJØRET ⚠️':'⚠️ BOSS-KAMP ⚠️';
  document.getElementById('bi-emoji').textContent=b.emoji;
  document.getElementById('bi-name').textContent=b.name;
  document.getElementById('bi-grade').textContent=`${g}. klasse · ${GRADE_INFO[g-1]?.mapName||''}`;
  document.getElementById('bi-taunt').textContent=b.taunt;
  const topics=mstCore(g);
  document.getElementById('bi-skills').innerHTML=`<div class="boss-skills-lbl">${b.name} tester ${b.skills}!</div>
    <div class="boss-chips">${topics.map(t=>`<span class="boss-chip">${bossEsc(t.icon)} ${bossEsc(t.name)}</span>`).join('')}</div>`;
  document.getElementById('bi-test').classList.toggle('show',!!bossTestSnap);
  const o=document.getElementById('boss-intro');
  o.classList.toggle('final',g===10);o.classList.remove('troll');
  const rl=document.querySelector('#boss-intro .boss-rule');if(rl)rl.textContent='Svar riktig for å treffe bossen! 💥';
  o.classList.add('show');
  bossRumble();
  bossSay(b.taunt);
}
function bossSay(t){if(typeof speak==='function')try{speak(t);}catch(e){}} // read aloud (speech.js), follows the setting
function closeBossIntro(){
  document.getElementById('boss-intro').classList.remove('show');
  bossRestore(); // ends a ?boss= test session (no-op otherwise)
}
function bossFight(){
  document.getElementById('boss-intro').classList.remove('show');
  if(bossPendingGrade==='troll'){if(typeof startTroll==='function')startTroll();return;}
  startBoss(bossPendingGrade);
}

// ---- The fight ----
function startBoss(g){
  const gd=CUR[g],b=BOSSES[g],topics=mstCore(g);
  if(!gd||!b||!topics.length)return;
  bossBegin(g,topics,b,{q:BOSS_MAXQ,tag:'👑 '});
}
// Shared fight engine (boss and «Trollet er tilbake!»). b = {name,emoji,hit,miss,ko,flee?,phases?}; o = {q,need?,tag,troll?}
function bossBegin(g,topics,b,o){
  const gd=CUR[g];let bag=[];const seen=new Set();
  const base={id:o.troll?'troll':'boss'+g,name:b.name,icon:b.emoji,
    gen(gg){ // mix the topics evenly; a topic whose first question was wrong comes back once, about 3 questions later
      const i=S.questions.length;let t=null;
      if(!S.troll)t=topics.find(x=>{const st=S.bossStats[x.id];return st&&st.n===1&&st.ok===0&&i-(S.bossAt[x.id]??-9)>=3;})||null;
      if(!t){if(!bag.length)bag=bossShuffle(topics.map((_,k)=>k));t=topics[bag.pop()];}
      S.bossTopic=t;S.topicId=t.id;S.bossAt[t.id]=i; // so recordAttempt/fb use the real topic
      let qd=t.gen(gg,t.id),n=0;
      while(qd&&(seen.has(qd.q)||(S.current&&qd.q===S.current.q))&&n++<5)qd=t.gen(gg,t.id);
      if(qd){seen.add(qd.q);qd.bossTid=t.id;}
      return qd;
    },
    fb(...a){return (S.bossTopic||topics[0]).fb(...a);},
  };
  // Any other topic property loadQuestion/submitAnswer may read comes from the current real topic
  const topic=new Proxy(base,{get(ob,k){return k in ob?ob[k]:(S.bossTopic||topics[0])[k];}});
  const need=o.need||Math.ceil(o.q*BOSS_WIN-1e-9);
  S={grade:g,topicId:topics[0].id,topic,questions:[],idx:0,score:0,streak:0,combo:0,current:null,answered:false,enemyHp:100,playerHp:100,enemyDefeated:false,
     boss:true,troll:!!o.troll,bossB:b,bossQ:o.q,bossNeed:need,bossTag:o.tag||'👑 ',bossTopics:topics,
     bossPts:need*10,bossMax:need*10,bossPhase:0,bossEmoji:b.emoji,bossFled:false,bossOver:false,bossTopic:null,bossStats:{},bossAt:{},bossLog:[]};
  document.getElementById('player-avatar').textContent=bossHero();
  document.getElementById('player-name').textContent=getPlayer().name;
  const av=document.getElementById('enemy-avatar');
  av.textContent=b.emoji;av.classList.remove('boss-flee','boss-morph');
  document.getElementById('enemy-name').textContent=S.bossTag+b.name;
  document.getElementById('player-hp').style.width='100%';
  document.getElementById('enemy-hp').style.width='100%';
  const qc=document.getElementById('q-card');
  qc.style.setProperty('--qc1',gd.c1);qc.style.setProperty('--qc2',gd.c2);
  const sg=document.getElementById('screen-game');
  sg.classList.add('boss-mode');sg.classList.toggle('boss-final',g===10&&!o.troll);sg.classList.toggle('troll-mode',!!o.troll);
  buildNumpad(g);
  renderHUD();
  showScreen('game');
  loadQuestion();
  bossProg();
  setSpeech(`${b.emoji} Kom an, da! ⚔️`);
  fxStart(true); // BATTLE FX: boss entrance + reset
}

// ---- Tally: per topic first-try results. S.questions[i].ok = right on the first try (A2); tid = topic ----
function bossTidOf(q){return (q&&q.tid&&S.bossTopics.some(t=>t.id===q.tid)?q.tid:null)||(S.current&&S.current.bossTid)||(S.bossTopic&&S.bossTopic.id)||null;}
// Logs the last answered question once (idempotent per index); waits while a second try is open (S.answered false)
function bossLogLast(force){ // force: a right answer always ends the question
  const i=S.questions.length-1,q=S.questions[i];if(i<0||!q||(!S.answered&&!force)||S.bossLog[i]!==undefined)return;
  const tid=bossTidOf(q);S.bossLog[i]={tid,ok:!!q.ok};
  if(tid){const st=S.bossStats[tid]||(S.bossStats[tid]={ok:0,n:0});st.n++;if(q.ok)st.ok++;}
}
// K.O. when enough first-try hits and no asked topic has only wrong answers
function bossVerdict(stats,c,need){return c>=need&&!Object.values(stats).some(st=>st.n>0&&st.ok===0);}
function bossFirstOk(){return S.bossLog.filter(x=>x&&x.ok).length;}

// Damage hook (submitAnswer): returns the boss' new HP in percent. HP follows the number of first-try hits
// (need hits = K.O.); it stays at a sliver while a topic still has only wrong answers.
function bossHit(){
  bossLogLast(true);
  const c=bossFirstOk();
  let pts=Math.max(0,S.bossMax-10*c);
  if(pts<=0&&!bossVerdict(S.bossStats,c,S.bossNeed))pts=5;
  S.bossPts=pts;
  return pts<=0?0:Math.max(1,Math.round(pts/S.bossMax*100));
}

function bossProg(){
  const Q=S.bossQ||BOSS_MAXQ,n=Math.min(S.idx+(S.answered?0:1),Q);
  document.getElementById('prog-label').textContent=S.troll?`🧌 Trollet · ${n} av ${Q}`:`👑 Boss · ${n} av ${Q}`;
  document.getElementById('prog-fill').style.width=Math.min(100,S.idx/Q*100)+'%';
}

// Called at the end of submitAnswer while S.boss: boss speech, phases, flee check, labels
function bossAfterAnswer(){
  const b=S.bossB||BOSSES[S.grade];if(!b)return;
  bossLogLast();
  const last=S.questions[S.questions.length-1],ok=!!(last&&last.ok);
  const av=document.getElementById('enemy-avatar'),nm=document.getElementById('enemy-name');
  if(!S.answered){setSpeech(`${S.bossEmoji} ${pick(b.miss)}`);bossProg();return;} // a second try is open (A2): wait for the final answer
  if(ok){S.playerHp=Math.min(100,S.playerHp+5);document.getElementById('player-hp').style.width=S.playerHp+'%';} // long fight: hits heal a little
  let line;
  if(S.enemyDefeated){
    S.bossEmoji=b.koEmoji||'😵';
    av.textContent=S.bossEmoji;nm.textContent=S.bossTag+b.name;
    line=b.ko;
    launch(200,['#ffd93d','#ff6b35','#00ff88','#06d6ff','#a855f7']);
    bossFanfare();
  }else if(ok){
    line=pick(b.hit);
    const ph=b.phases||[];
    while(S.bossPhase<ph.length&&S.enemyHp<=ph[S.bossPhase].at){
      const P=ph[S.bossPhase++];
      S.bossEmoji=P.emoji;av.textContent=P.emoji;nm.textContent=S.bossTag+P.name;line=P.say;
      av.classList.remove('boss-morph');void av.offsetWidth;av.classList.add('boss-morph');
      setTimeout(()=>av.classList.remove('boss-morph'),850);
      const fi=document.querySelector('#screen-game .fighters');
      if(fi){fi.classList.remove('boss-shake');void fi.offsetWidth;fi.classList.add('boss-shake');setTimeout(()=>fi.classList.remove('boss-shake'),600);}
      const cf=document.getElementById('combo-flash');
      cf.innerHTML=`<div class="combo-txt">${P.emoji} ${P.flash}</div>`;
      setTimeout(()=>cf.innerHTML='',900);
      bossRumble();
    }
  }else line=pick(b.miss);
  if(!S.enemyDefeated&&S.idx>=(S.bossQ||BOSS_MAXQ)){
    S.bossFled=true;
    line=b.flee||'Oi, nå stikker jeg! 💨';
    av.classList.add('boss-flee');
  }
  setSpeech(`${S.bossEmoji} ${line}`);
  bossProg();
  document.getElementById('next-btn').textContent=S.enemyDefeated?'🏆 Se seieren!':S.bossFled?'Videre →':'Neste →';
}

// handleNext hook
function bossNext(){
  if(S.bossOver)return;
  if(S.enemyDefeated||S.bossFled){showBossResult(S.enemyDefeated);return;}
  loadQuestion();
  bossProg();
}

function bossCleanup(){
  document.getElementById('screen-game').classList.remove('boss-mode','boss-final','troll-mode');
  document.getElementById('enemy-avatar').classList.remove('boss-flee','boss-morph');
}

// The topic to practise after a lost fight: only-wrong topics first, then the lowest share right, then fewest stars
function bossWeakest(){
  const ts=S.bossTopics||mstCore(S.grade);
  const asked=ts.filter(t=>S.bossStats[t.id]&&S.bossStats[t.id].n>0);
  const r=t=>{const st=S.bossStats[t.id];return st.ok/st.n;};
  if(asked.length)return asked.slice().sort((a,b)=>r(a)-r(b)||S.bossStats[b.id].n-S.bossStats[a.id].n||topicStars(S.grade,a.id)-topicStars(S.grade,b.id))[0];
  return ts.find(t=>!isTopicMastered(S.grade,t.id))||ts[0]||null;
}

// ---- Result overlay: win (big celebration) or flee ("Nesten!" + «Øv på <tema>») ----
function showBossResult(win){
  if(S.bossOver)return;
  if(S.troll&&typeof trollResult==='function'){S.bossOver=true;trollResult(win);return;}
  S.bossOver=true;
  const g=S.grade,b=BOSSES[g];
  const first=win&&!isBossDefeated(g),wasOpen=g<10&&isGradeUnlocked(g+1);
  const xp=win?(first?150:50):20,coins=win?(first?25:10):3;
  if(win)localStorage.setItem('mh_boss_'+g,'1');
  if(win)checkEvolution(); // rangen følger boss-seire (fun.js): «sterkere»-skjermen når barnet går videre
  const oldL=curLvl();
  prog.xp+=xp;prog.coins+=coins;saveProg();renderHUD();
  const newL=curLvl();
  if(newL>oldL){checkEvolution(oldL,newL);unlockAchievement('lvlup');if(newL>=5)unlockAchievement('lvl5');if(newL>=8)unlockAchievement('lvl8');if(newL>=12)unlockAchievement('lvl12');}
  updatePlayerEmoji();
  if(prog.coins>=50)unlockAchievement('coins50');
  if(prog.coins>=100)unlockAchievement('coins100');
  if(win&&S.questions.every(q=>q.ok))unlockAchievement('perfect'); // flawless boss K.O.
  if(win)unlockAchievement('boss'+g);

  const o=document.getElementById('boss-result');
  o.classList.toggle('win',win);
  const em=document.getElementById('br-emoji');
  em.className='boss-emoji '+(win?'boss-ko':'boss-run');
  em.textContent=win?'🏆':b.emoji+'💨';
  document.getElementById('br-title').textContent=win?(g===10?'👑 DU VANT! 👑':'🏆 SEIER! 🏆'):'Nesten! 💪';
  let sub;const weak=win?null:bossWeakest(),c=bossFirstOk(),n=S.bossLog.filter(Boolean).length||S.questions.length;
  if(win){
    sub=`Du beseiret <b>${b.name}</b> med ${b.skills}!<div class="boss-quote">${b.koEmoji||'😵'} «${b.ko}»</div>`;
    if(g<10&&!wasOpen&&isGradeUnlocked(g+1))sub+=`<div class="boss-unlock">🗺️ ${g+1}. klasse er åpnet!</div>`;
    if(g===10)sub+='<div class="boss-unlock">✨ Talland er reddet!</div>';
  }else{
    sub=`${b.name} stakk av! 💨<br>Du klarer det neste gang!`;
    if(S.enemyHp<=35)sub+='<div class="boss-unlock">Bossen hadde bare litt liv igjen! 🔥</div>';
    if(weak)sub+=`<div class="boss-practice">Øv på ${bossEsc(weak.icon)} <b>${bossEsc(weak.name)}</b>, så tar vi ${b.name}!</div>`;
  }
  document.getElementById('br-sub').innerHTML=sub;
  // What the child practised/learned in this fight, per topic of the grade
  const learned=(CUR[g]?.topics||[]).filter(t=>S.bossStats[t.id]).map(t=>{
    const st=S.bossStats[t.id],mark=st.ok===st.n?'⭐':st.ok>0?'✓':'💪';
    return `<span class="boss-chip${st.ok>0?' good':''}">${mark} ${bossEsc(t.icon)} ${bossEsc(t.name)} · ${st.ok} av ${st.n}</span>`;
  }).join('');
  document.getElementById('br-skills').innerHTML=learned?`<div class="boss-skills-lbl">${win?'🧠 Dette kan du nå:':'🧠 Dette øvde du på:'}</div><div class="boss-chips">${learned}</div>`:'';
  const rw=[['✅',`${c} av ${n}`],['✨',`+${xp}`],['🪙',`+${coins}`]];
  if(first)rw.push([b.emoji,'Nytt merke!']);
  document.getElementById('br-rewards').innerHTML=rw.map(([i,v])=>`<div class="chest-reward"><span class="chest-reward-icon">${i}</span><div class="chest-reward-val">${v}</div></div>`).join('');
  document.getElementById('br-btns').innerHTML=
    win&&g===10?'<button class="boss-go gold" onclick="bossToEnding()">✨ Se slutten</button>':
    win?'<button class="boss-go gold" onclick="bossExit(\'grades\')">🗺️ Til kartet</button>':
    `<button class="wp-cancel" onclick="bossExit('topics')">🗺️ Kart</button><button class="wp-cancel" onclick="bossRetry()">🔁 Prøv igjen</button>${weak?`<button class="boss-go gold" onclick="bossPractice('${weak.id}')">⚔️ Øv på ${bossEsc(weak.name)}</button>`:''}`;
  document.getElementById('br-test').classList.toggle('show',!!bossTestSnap);
  o.classList.add('show');
  if(win){if(!heroVictoryFx(220))launch(220,['#ffd93d','#ff6b35','#00ff88','#06d6ff','#a855f7','#f093fb']);bossFanfare();setTimeout(sndLvl,900);sidekickReact('celebrate');}
  else{tone(523,.12);setTimeout(()=>tone(659,.18),120);sidekickReact('happy');}
  pgBossResult(win,g,first); // PROGRESSION: streak, shop unlocks, NIVÅ OPP
  bossSay(win?`Seier! ${b.ko}`:weak?`Nesten! Øv på ${weak.name}, så tar vi ${b.name}!`:'Nesten! Prøv igjen!');
}
// Lost fight → straight to the weakest topic (via Lær the first time, if startTopic exists)
function bossPractice(id){
  const g=S.grade;
  document.getElementById('boss-result').classList.remove('show');
  bossCleanup();
  bossRestore(); // ends a ?boss= test session (no-op otherwise)
  if(!localStorage.getItem('mh_player')){showScreen('chars');return;}
  buildGradeMap();
  if(!CUR[g]?.topics.some(t=>t.id===id))return selectGrade(g);
  (typeof startTopic==='function'?startTopic:startGame)(g,id);
}

function bossRetry(){
  document.getElementById('boss-result').classList.remove('show');
  bossCleanup();
  if(S.troll&&typeof startTroll==='function')startTroll(true);else startBoss(S.grade);
}

function bossExit(to){
  const g=S.grade,evo=pendingEvolution;
  document.getElementById('boss-result').classList.remove('show');
  bossCleanup();
  bossRestore(); // ends a ?boss= test session (no-op otherwise)
  if(!localStorage.getItem('mh_player')){showScreen('chars');return;}
  buildGradeMap();
  if(to==='topics')selectGrade(g);else showScreen('grades');
  if(evo&&!pendingEvolution)pendingEvolution=evo; // testmodus: vis «sterkere»-skjermen likevel (lagringen er rullet tilbake)
  if(pendingEvolution)showEvolution();
}

function bossToEnding(){
  document.getElementById('boss-result').classList.remove('show');
  bossCleanup();
  showEnding(true);
}

// Leaving a boss fight with the ← button
document.querySelector('#screen-game .battle-back')?.addEventListener('click',()=>{
  if(!S.boss||S.bossOver)return;
  S.bossOver=true;
  bossCleanup();
  if(bossTestSnap){bossRestore();if(!localStorage.getItem('mh_player')){showScreen('chars');return;}}
  buildGradeMap();
});

// ---- The ending (after NULLIUS) — story-style panels ----
let bossEndIdx=0,endingFromBoss=false;
function showEnding(fromBoss){
  endingFromBoss=!!fromBoss;
  const name=bossEsc(getPlayer().name),hero=bossHero(),sk=getSidekickEmoji();
  const P=[
    `<div class="end-morph"><span>👹</span><span class="end-arrow">→</span><span class="end-zero">0️⃣</span></div>
     <div class="story-big"><span class="red">NULLIUS</span> er beseiret!</div>
     <div class="story-sub">Med et lite «pling» krympet han til en bitte liten null. «Unnskyld,» pep han. «Jeg ville bare være med og regne!»</div>`,
    `<div class="story-hero">${hero}</div>
     <div class="story-big">Takket være <span class="gold">${name}</span> er tallene tilbake!</div>
     <div class="story-sub">Du har lært pluss, minus, ganging, deling og masse mer. Nå flyr tallene hjem til Talland igjen!</div>`,
    `<div class="end-party">🏰🎆🎉</div>
     <div class="story-big">Hele <span class="gold">Talland</span> jubler!</div>
     <div class="story-sub">Kongen holder stor fest. Pluss-trollet, Gange-ormen og alle de andre er med. Nå er de venner!</div>`,
    `<div class="end-final">${hero}<span>${sk}</span></div>
     <div class="story-big">Takk for at du reddet <span class="gold">Talland</span>!</div>
     <div class="story-sub">Du er en ekte Mattehelt, ${name}! 👑<br>Du har fått merket «Tallands helt».</div>`,
  ];
  document.getElementById('ending-panels').innerHTML=P.map((h,i)=>
    `<div class="end-panel${i===0?' active':''}">${h}
      <div class="story-dots">${P.map((_,j)=>`<div class="story-dot${j===i?' active':''}"></div>`).join('')}</div>
      ${i<P.length-1?'<button class="story-btn" onclick="endingNext()">Neste →</button>':'<button class="story-btn end-btn" onclick="closeEnding()">🗺️ Til kartet</button>'}
    </div>`).join('');
  bossEndIdx=0;
  document.getElementById('ending-overlay').classList.remove('hidden');
  launch(60,['#ffd93d','#06d6ff','#a855f7']);
  sndLvl();
}
function endingNext(){
  const ps=document.querySelectorAll('#ending-panels .end-panel');
  bossEndIdx=Math.min(bossEndIdx+1,ps.length-1);
  ps.forEach((p,i)=>p.classList.toggle('active',i===bossEndIdx));
  if(bossEndIdx===ps.length-1){unlockAchievement('talland');launch(180,['#ffd93d','#ff6b35','#00ff88','#06d6ff','#a855f7','#f093fb']);bossFanfare();}
  else{launch(50);tone(659,.1);setTimeout(()=>tone(784,.14),90);}
}
function closeEnding(){
  document.getElementById('ending-overlay').classList.add('hidden');
  if(endingFromBoss){endingFromBoss=false;unlockAchievement('talland');bossExit('grades');}
}
