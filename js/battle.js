// Mattehelten – Spilltilstand, oppgaveløkka (loadQuestion/submitAnswer), kiste, resultater, foreldrerapport
// Alle js-filer deler globalt navnerom (vanlige <script>-tagger i fast rekkefølge, se index.html).

// ============================================================
// GAME STATE
// ============================================================
// S.questions[i] = {q,given,correct,ok,sub,givenTxt,correctTxt,eq, first,fixed,misc,revenge,tid, strat,mini,last,lastTxt,k,z,w}
//   ok = riktig på første forsøk; given/givenTxt/first = første svar; fixed = feil først, riktig på andre; last/lastTxt = andre svar.
//   S.score = antall riktige på første forsøk. Hjelpefunksjonene for løkka ligger i learning.js (loop*).
let S={grade:null,topicId:null,topic:null,questions:[],idx:0,score:0,streak:0,combo:0,current:null,answered:false,enemyHp:100,playerHp:100,enemyDefeated:false};
const TQ=8;

function startGame(g,topicId){
  const gd=CUR[g],topic=gd.topics.find(t=>t.id===topicId);
  if(S&&S._autoT)clearTimeout(S._autoT);
  S={grade:g,topicId,topic,questions:[],idx:0,score:0,streak:0,combo:0,current:null,answered:false,enemyHp:100,playerHp:100,enemyDefeated:false};
  const p=getPlayer();
  document.getElementById('player-avatar').textContent=p.emoji;
  document.getElementById('player-name').textContent=p.name;
  const mo=typeof funMonster==='function'?funMonster(g,topicId):{e:ENEMIES[g]||'👾',n:'Tallmonsteret'},ea=document.getElementById('enemy-avatar'); // eget monster per tema (fun.js)
  ea.textContent=mo.e;if(mo.a)ea.setAttribute('data-fun-idle',mo.a);else ea.removeAttribute('data-fun-idle');
  document.getElementById('enemy-name').textContent=mo.n;
  document.getElementById('player-hp').style.width='100%';
  document.getElementById('enemy-hp').style.width='100%';
  const qc=document.getElementById('q-card');
  qc.style.setProperty('--qc1',gd.c1);
  qc.style.setProperty('--qc2',gd.c2);
  buildNumpad(g);
  setSpeech('Klar til kamp? ⚔️',true);
  loadQuestion();
  renderHUD();
  showScreen('game');
  if(loopFocusOK()&&!isChoiceQ(S.current))document.getElementById('ans-input').focus({preventScroll:true}); // fokus først når skjermen vises
  fxStart(false); // BATTLE FX: entrance + reset
}
function retrySession(){startGame(S.grade,S.topicId);}

// 1.–2. klasse: ingen ±, en ⚔️-tast i tastaturet, og ikke OS-tastatur (inputmode=none)
function buildNumpad(g){
  const pad=document.getElementById('numpad');pad.innerHTML='';
  const showDot=g>=5,showFrac=!!(CUR[g]&&CUR[g].topics.some(t=>t.frac)),small=g<=2;
  const keys=showDot?[7,8,9,'del',4,5,6,'neg',1,2,3,0,'.',showFrac?'/':null]:[7,8,9,'del',4,5,6,small?'ok':'neg',1,2,3,0];
  pad.classList.toggle('np-small',small);
  const inp=document.getElementById('ans-input');
  if(small)inp.setAttribute('inputmode','none');
  keys.forEach(v=>{
    if(v===null){pad.appendChild(document.createElement('div'));return;}
    const btn=document.createElement('button');btn.type='button';
    if(v==='del'){btn.textContent='⌫';btn.className='n-del';btn.setAttribute('aria-label','Slett');btn.onclick=()=>{if(!S.answered)document.getElementById('ans-input').value=document.getElementById('ans-input').value.slice(0,-1);};}
    else if(v==='neg'){btn.textContent='±';btn.className='n-neg';btn.onclick=()=>{if(!S.answered){const i=document.getElementById('ans-input');i.value=i.value.startsWith('-')?i.value.slice(1):'-'+i.value;}};}
    else if(v==='ok'){btn.textContent='⚔️';btn.className='n-ok';btn.setAttribute('aria-label','Svar');btn.onclick=()=>{if(!S.answered)submitAnswer();};}
    else if(v==='.'){btn.textContent=',';btn.className='n-dot';btn.onclick=()=>{if(!S.answered){const i=document.getElementById('ans-input');if(!/[.,]/.test(i.value))i.value+=',';}};}
    else if(v==='/'){btn.textContent='/';btn.className='n-dot';btn.onclick=()=>{if(!S.answered){const i=document.getElementById('ans-input');if(!i.value.includes('/'))i.value+='/';}};}
    else{btn.textContent=v;btn.onclick=()=>{if(!S.answered){const i=document.getElementById('ans-input');if(i.value.length<6)i.value+=v;}};}
    pad.appendChild(btn);
  });
}

function loadQuestion(){
  loopDisarm();
  const qd=loopNext(); // learning.js: revansj, minioppgave, ingen gjentakelse, maks én 0-oppgave, tak på svake
  S.current=qd;S.answered=false;qd._t0=Date.now();
  const cat=document.getElementById('q-cat');
  cat.textContent=qd.revenge?'🔁 Revansj!':(qd.type||'');
  cat.classList.toggle('loop-rev',!!qd.revenge);
  const qt=document.getElementById('q-txt');
  qt.textContent=qd.q;qt.style.animation='none';void qt.offsetWidth;qt.style.animation='';
  qt.classList.toggle('q-long',/[a-zæøå]{4}/i.test(qd.q)&&qd.q.length>20);
  document.getElementById('q-hint').textContent=qd.hint||'';
  loopHelpHide();
  const inp=document.getElementById('ans-input');
  inp.value='';inp.className='ans-input';inp.disabled=false;if(loopFocusOK())inp.focus();
  document.getElementById('sub-btn').disabled=false;
  const fb=document.getElementById('fb-box');fb.className='fb-box';fb.innerHTML='';
  document.getElementById('next-btn').style.display='none';
  // Svarformat: valgknapper (qd.choices) i stedet for tall-tastatur; bilde i oppgaven (qd.vis, se vis.js)
  const vis=document.getElementById('q-vis'),vh=renderVis(qd.vis);
  if(vis){vis.innerHTML=vh;vis.style.display=vh?'':'none';}
  const ch=document.getElementById('q-choices'),hasCh=isChoiceQ(qd);
  if(ch){ch.innerHTML='';ch.style.display=hasCh?'':'none';
    if(hasCh)qd.choices.forEach(c=>{const b=document.createElement('button');b.type='button';b.className='q-choice';b.textContent=String(c);b.onclick=()=>submitChoice(c,b);ch.appendChild(b);});}
  const ar=document.querySelector('#screen-game .ans-row');if(ar)ar.style.display=hasCh?'none':'';
  document.getElementById('numpad').style.display=hasCh?'none':'grid';
  updateBattleProg();
  if(qd.revenge)setSpeech('Revansj! Nå klarer du den! 💪');
  if(typeof speakQ==='function')try{speakQ(qd);}catch(e){} // opplesing (speech.js)
}
// Valgoppgave: qd.choices er en liste med svaralternativ (tekst/tall); riktig er String(qd.ansTxt??qd.ans)
function isChoiceQ(qd){return !!(qd&&Array.isArray(qd.choices)&&qd.choices.length);}
function choiceKey(qd){return String(qd.ansTxt!=null?qd.ansTxt:qd.ans);}
function submitChoice(v,btn){if(S.answered)return;S.choiceBtn=btn||null;document.getElementById('ans-input').value=String(v);submitAnswer();}

function updateBattleProg(){
  const mx=loopMaxQ();
  document.getElementById('prog-fill').style.width=(S.idx/mx*100)+'%';
  document.getElementById('prog-label').textContent=`Spørsmål ${Math.min(S.idx+(S.answered?0:1),mx)} av ${mx}`;
  document.getElementById('score-label').textContent=`${S.score} ${S.score===1?'riktig':'riktige'}`;
  const cb=document.getElementById('combo-badge');
  document.getElementById('combo-num').textContent=S.combo;
  cb.classList.toggle('hot',S.combo>=3);
}
function loopProg(){if(S.boss&&typeof bossProg==='function')bossProg();else updateBattleProg();}

document.getElementById('ans-input').addEventListener('keydown',e=>{
  if(e.key==='Enter'){if(S.answered)handleNext();else submitAnswer();}
});
document.getElementById('ans-input').addEventListener('input',e=>{const v=e.target.value.replace(/[^0-9,.\/ -]/g,'');if(v!==e.target.value)e.target.value=v;});

// Prøv igjen: 1. feil → kort hint med bilde, nytt forsøk, ingen HP-tap. 2. feil (eller feil på Ja/Nei) → fasit + kort forklaring.
// Bare første forsøk teller (ok, S.score, mestring, tilpasning). En bommet oppgave kommer igjen som «Revansj!».
function submitAnswer(){
  if(S.answered||!S.current)return;
  const inp=document.getElementById('ans-input'),fb=document.getElementById('fb-box'),raw=inp.value.trim();
  if(raw==='')return;
  const qd=S.current,isCh=isChoiceQ(qd),given=isCh?raw:parseAns(raw),correct=qd.ans;
  if(given===null){inp.classList.add('wrong');setTimeout(()=>inp.classList.remove('wrong'),500);return;}
  const ex=qd.ansTxt!=null&&!isCh?parseAns(qd.ansTxt):correct;
  const ok=isCh?raw===choiceKey(qd):raw.includes('/')?Math.abs(given-ex)<1e-9:Math.abs(given-correct)<0.01;qd.givenTxt=raw;
  const second=!!qd._n;let e=qd._e;
  if(!second){ // første forsøk: teller for mestring, tilpasning og feiltyper
    const misc=ok?null:detectMisc(qd,given);
    e={q:qd.q,given,correct,ok,sub:qd.sub||'?',givenTxt:raw,correctTxt:qd.ansTxt||nf(correct),eq:qd.eq,first:raw,fixed:false,misc,revenge:!!qd.revenge,tid:S.topicId,strat:qd.strat||null,mini:!!qd.mini,k:loopKey(qd),z:isZeroQ(qd),w:!!qd._w};
    S.questions.push(e);qd._e=e;
    recordAttempt(S.grade,S.topicId,qd.sub||'_',ok);
    if(qd.strat&&typeof famRecord==='function')famRecord(S.grade,S.topicId,qd.strat,ok);
  }else{e.last=given;e.lastTxt=raw;}
  if(!ok&&!second&&loopCanRetry(qd))return loopRetry(qd,given,e.misc);

  // Oppgaven er ferdig
  S.answered=true;S.idx++;
  inp.disabled=true;document.getElementById('sub-btn').disabled=true;
  if(isCh){const ch=document.getElementById('q-choices');if(ch)[...ch.children].forEach(b=>{b.disabled=true;if(b.textContent===choiceKey(qd))b.classList.add('right');});if(!ok&&S.choiceBtn)S.choiceBtn.classList.add('wrong');}
  statsLog(S.grade,S.topicId,e.ok,e.misc,Date.now()-(qd._t0||Date.now()));
  const mx=loopMaxQ(),again=!e.ok&&loopQueueRevenge(qd);
  loopHelpHide();

  if(ok){
    if(second){e.fixed=true;S.combo=1;}else{S.score++;S.streak++;S.combo++;}
    inp.className='ans-input correct';
    fb.className='fb-box correct';
    const ph=qd.revenge?{t:'🧠 Du lærte det!',m:'Revansj vunnet! 💪'}:second?{t:'🌟 Du fant det selv!',m:pick(['Godt jobba!','Sånn ja!','Du ga ikke opp!'])}:pick(CORRECT);
    fb.innerHTML=`<div class="fb-title">${ph.t}</div>${ph.m}`;
    sndOk();
    // Fienden tar skade. Vanlig kamp: K.O. kommer først på siste oppgave (riktig og minst 6 av 8 riktige), så runden alltid er 8 oppgaver.
    if(S.boss){if(!second)S.enemyHp=bossHit();}
    else{const last=S.idx>=mx;let hp=S.enemyHp-((second?6:8+Math.min(S.combo,8))+(qd.revenge?4:0));
      if(last){if(hp<=0||S.score>=Math.ceil(mx*.75))hp=0;}else hp=Math.max(5,hp);
      S.enemyHp=Math.max(0,hp);}
    document.getElementById('enemy-hp').style.width=S.enemyHp+'%';
    if(!S.boss||!second){document.getElementById('enemy-avatar').classList.add('hit');setTimeout(()=>document.getElementById('enemy-avatar').classList.remove('hit'),500);}
    launch(S.combo>=3?80:40);
    fxCorrect(); // BATTLE FX: attack, damage pop, K.O. (keep before the K.O. block)
    if(S.enemyHp<=0){
      S.enemyDefeated=true;
      document.getElementById('enemy-avatar').textContent='💀';
      setSpeech('K.O.! Du knuste monsteret! 💥');
      if(!heroVictoryFx(150))launch(150,['#ffd93d','#ff6b35','#00ff88','#06d6ff']);
      sidekickReact('celebrate');
      unlockAchievement('ko');
    }
    // Combo flash
    if(S.combo>=3){
      sndCombo();
      const cf=document.getElementById('combo-flash');
      cf.innerHTML=`<div class="combo-txt">${S.combo}x COMBO!</div>`;
      setTimeout(()=>cf.innerHTML='',900);
    }
    // Speeches
    if(!S.enemyDefeated){const speeches=second?['Du fant det! 🌟','Sånn ja! 💪','Godt jobba! ⚔️']:S.combo>=5?['LEGENDE! 🏆','COMBO x'+S.combo+'! 🔥','USTOPPELIG! ⚡']:['Riktig! 💥','Godt treff! ⚔️','Matematikk-mester! 🌟'];setSpeech(pick(speeches));}
    document.getElementById('player-avatar').classList.add('happy');
    setTimeout(()=>document.getElementById('player-avatar').classList.remove('happy'),600);
    // XP & coins: mynter bare for riktig på første forsøk (fun.js: 2 i tema som ikke er mestret, 1 i mestret)
    const xpG=second?6:10+(S.combo>=3?8:0)+(S.combo>=5?5:0),cG=typeof funOnRight==='function'?funOnRight(e,second):second?0:1;
    const oldL=curLvl();
    prog.xp+=xpG;prog.coins+=cG;S.funCoins=(S.funCoins||0)+cG;saveProg();renderHUD();
    const newL=curLvl();
    if(newL>oldL){checkEvolution(oldL,newL);sndLvl();launch(100);unlockAchievement('lvlup');if(newL>=5)unlockAchievement('lvl5');if(newL>=8)unlockAchievement('lvl8');if(newL>=12)unlockAchievement('lvl12');} // evolution waits for the chest (NIVÅ OPP first)
    updatePlayerEmoji();
    if(S.streak===1&&!unlockedAchievements.first_correct)unlockAchievement('first_correct');
    if(S.streak===5)unlockAchievement('streak5');
    if(S.combo>=5)unlockAchievement('combo5');
    if(S.combo>=10)unlockAchievement('streak10');
    sidekickReact(S.combo>=5?'combo':'happy');
  }else{
    S.streak=0;S.combo=0;
    inp.className='ans-input wrong';
    fb.className='fb-box wrong loop-reveal';
    const rv=renderVis(loopReveal(qd)),body=S.topic.fb(qd.q,given,correct);
    fb.innerHTML=`<div class="fb-title">Se her! 👀</div>${loopNb(body)}${rv?`<div class="loop-vis">${rv}</div>`:''}${again?'<div class="loop-again">🔁 Du får den igjen snart!</div>':''}`;
    sndBad();
    // Player takes damage (bare når svaret vises)
    S.playerHp=Math.max(10,S.playerHp-8);
    document.getElementById('player-hp').style.width=S.playerHp+'%';
    document.getElementById('player-avatar').classList.add('sad');
    setTimeout(()=>document.getElementById('player-avatar').classList.remove('sad'),500);
    fxWrong(); // BATTLE FX: enemy attacks, hero blocks with a shield
    setSpeech(pick(['Ikke gi opp! 💪','Neste gang! 🛡️','Du klarer det!']));
    sidekickReact(S.playerHp<=30?'scared':'sad');
    if(typeof speak==='function')try{speak(loopPlain(body));}catch(err){}
  }
  document.getElementById('numpad').style.display='none';
  updateBattleProg();
  const nb=document.getElementById('next-btn');
  nb.textContent=(S.idx>=mx||S.enemyDefeated)?'Se resultat 🏁':'Neste →';
  nb.style.display='block';
  if(S.boss){bossAfterAnswer();if(ok&&second&&!S.enemyDefeated&&!S.bossFled)setSpeech(`${S.bossEmoji||''} Hmpf! Du fant det til slutt!`.trim());}
  const end=S.boss?(S.enemyDefeated||S.bossFled||S.bossOver):(S.idx>=mx||S.enemyDefeated);
  if(ok&&!end)loopArmAuto();
}
// Første feil: hint med bilde i oppgavekortet, samme oppgave igjen (ingen HP-tap, ingen fasit)
function loopRetry(qd,given,misc){
  qd._n=1;S.streak=0;S.combo=0;
  const inp=document.getElementById('ans-input'),h=loopHint(qd,given,misc),el=loopHelpEl();
  inp.value='';inp.className='ans-input retry';
  if(isChoiceQ(qd)&&S.choiceBtn){S.choiceBtn.classList.add('wrong');S.choiceBtn.disabled=true;}
  if(el){const vh=renderVis(h.v);el.innerHTML=`<div class="loop-help-t">💡 ${loopNb(h.t)}</div>${vh?`<div class="loop-vis">${vh}</div>`:''}`;el.className='loop-help show';}
  const fb=document.getElementById('fb-box');fb.className='fb-box';fb.innerHTML='';
  const B=S.boss&&typeof BOSSES==='object'&&BOSSES[S.grade];
  setSpeech(B&&B.miss?`${S.bossEmoji||B.emoji} ${pick(B.miss)}`:pick(['Prøv igjen! 💪','Du klarer det! 💡','Én gang til! 💪']));
  if(typeof fxTry==='function')fxTry();else tone(440,.12,'triangle',.08);
  if(typeof speak==='function')try{speak(h.t);}catch(e){}
  loopProg();
  document.getElementById('q-hint').textContent='';
  loopShow();
  if(loopFocusOK())inp.focus({preventScroll:true});
}

function handleNext(){if(!S.answered)return;loopDisarm();if(S.boss)return bossNext();if(S.idx>=loopMaxQ()||S.enemyDefeated)showChest();else loadQuestion();}

// ============================================================
// CHEST + RESULTS
// ============================================================
// Runde: c = riktige på første forsøk (S.questions[i].ok), n = antall oppgaver (en K.O. kan avslutte tidlig).
// s10 = 0–10-skala for rekorder (hs_*), 10 bare uten feil. Stjernene per tema ligger i mastery.js (recordRound).
function roundScore(){const Q=S.questions||[],n=Q.length||TQ,c=Q.filter(q=>q.ok).length,perfect=Q.length>0&&c>=n,s10=perfect?10:Math.min(9,Math.round(c/n*10));return{n,c,s10,pct:c/n,perfect};}
function mstSay(t){if(typeof speak==='function')try{speak(t);}catch(e){}} // opplesing (speech.js), følger innstillingen
// Kort, barnevennlig overskrift for en runde (ingen prosent)
function mstRoundHead(pct,perfect){
  if(perfect)return{emoji:'💎',title:'PERFEKT!',sub:'Alle riktige!'};
  if(pct>=MST_GOOD-1e-9)return{emoji:'🏆',title:'Kjempebra!',sub:'Nesten alle riktige!'};
  if(pct>=MST_PASS-1e-9)return{emoji:'⭐',title:'Bra jobba!',sub:'Du kan mye nå!'};
  if(pct>=.5)return{emoji:'⚔️',title:'God kamp!',sub:'Øv litt til, så går det!'};
  return{emoji:'💪',title:'God trening!',sub:'Se hvordan, og prøv igjen!'};
}
function showChest(){
  const {n,c,s10,pct,perfect}=roundScore(),g=S.grade,tid=S.topicId;
  const res=recordRound(g,tid,c,n); // mestring v2 (mh_learn): {from,to}
  const newStars=Math.max(0,res.to-res.from);
  const xpEarned=s10*10+(pct>=1?50:pct>=.8?20:0);
  // Mynter for læring (fun.js): svarene ga mynter underveis; ny ⭐ og «Ny rekord!» gir ekstra. 1.–2. klasse: enkel kiste.
  const fc=typeof funChest==='function'?funChest(res,s10):{bonus:s10+newStars*3,total:s10+newStars*3,rec:false,small:false},coinsEarned=fc.total;
  const nx=mstNext(g,tid),h=mstRoundHead(pct,perfect);
  if(S.enemyDefeated)h.sub='💥 K.O.! '+h.sub;

  document.getElementById('chest-emoji').textContent=h.emoji;
  document.getElementById('chest-title').textContent=h.title;
  document.getElementById('chest-sub').innerHTML=`${h.sub}<div class="mst-chest-stars">${mstStarsHTML(res.to,res.from,hasCrown(g,tid))}</div><div class="mst-tip">${nx.txt}</div>`;
  document.getElementById('chest-rewards').innerHTML=typeof funChestTiles==='function'?funChestTiles(fc,c,n,xpEarned):`<div class="chest-reward"><span class="chest-reward-icon">🪙</span><div class="chest-reward-val">+${coinsEarned}</div></div>`;
  const oldL=curLvl();
  prog.xp+=xpEarned;prog.coins+=fc.bonus;saveProg();renderHUD();
  const newL=curLvl();
  if(newL>oldL){checkEvolution(oldL,newL);unlockAchievement('lvlup');if(newL>=5)unlockAchievement('lvl5');if(newL>=8)unlockAchievement('lvl8');if(newL>=12)unlockAchievement('lvl12');}
  document.getElementById('chest-overlay').classList.add('show');
  launch(pct>=.8?120:60);
  if(perfect)unlockAchievement('perfect');
  sidekickReact(pct>=.8?'celebrate':'happy');
  pgChest(res,xpEarned,coinsEarned,pct); // PROGRESSION: count-ups, star stamps, streak, NIVÅ OPP
  mstSay(`${h.title} ${newStars?(res.to>=3?'Mestret!':'Ny stjerne!'):''} ${fc.rec?'Ny rekord!':''} ${nx.say}`);
}

function closeChest(){
  document.getElementById('chest-overlay').classList.remove('show');
  buildResults();
  showScreen('results');
  pgChestClose(); // PROGRESSION: NIVÅ OPP comes before evolution
  if(pendingEvolution)showEvolution(); // level-up from chest XP
}

function buildResults(){
  const {n,c,pct,perfect}=roundScore(),g=S.grade,tid=S.topicId;
  const h=mstRoundHead(pct,perfect),nx=mstNext(g,tid),low=pct<.5;
  if(perfect)h.title=`PERFEKT! ${c} av ${n}!`;
  if(S.enemyDefeated)h.sub='💥 K.O.! '+h.sub;
  document.getElementById('res-mascot').textContent=h.emoji;
  document.getElementById('res-title').textContent=h.title;
  document.getElementById('res-sub').textContent=h.sub;
  document.getElementById('res-stars').innerHTML=mstStarsHTML(topicStars(g,tid),null,hasCrown(g,tid)); // temaets stjerner
  document.getElementById('res-num').textContent=c;
  const den=document.querySelector('#res-ring .score-den');if(den)den.textContent=`av ${n}`;
  document.getElementById('res-ring').style.background=`conic-gradient(#00ff88 ${Math.round(c/n*360)}deg,rgba(255,255,255,.1) 0)`;
  // Hva gir neste stjerne + (under 50 %) «Se hvordan» og «Prøv igjen»
  let box=document.getElementById('mst-res');
  if(!box){box=document.createElement('div');box.id='mst-res';const ring=document.getElementById('res-ring');if(ring&&ring.insertAdjacentElement)ring.insertAdjacentElement('afterend',box);}
  box.className='mst-res';
  const guide=typeof LEARN_GUIDES==='object'&&LEARN_GUIDES[tid]&&LEARN_GUIDES[tid].length;
  box.innerHTML=`<div class="mst-tip">${nx.txt}</div>`+(low?`<div class="mst-res-btns">${guide?`<button class="mst-btn mst-learn" onclick="showLearn(${g},'${tid}')">📖 Se hvordan</button>`:''}<button class="mst-btn mst-retry" onclick="retrySession()">🔁 Prøv igjen</button></div>`:'');
  // Det vi øver mer på
  const errs={};S.questions.forEach(q=>{if(!q.ok)errs[q.sub]=(errs[q.sub]||0)+1;});
  const subs=Object.entries(errs).sort((a,b)=>b[1]-a[1]);
  const as=document.getElementById('adapt-sec');
  if(!subs.length){as.innerHTML='<div style="font-family:Fredoka One,cursive;font-size:.9rem;color:var(--green)">🌟 Ingen feil denne runden!</div>';}
  else{let h2='<div class="adapt-title">🎯 Dette øver vi mer på:</div>';subs.slice(0,3).forEach(([sub,k])=>{const p=Math.round(k/S.questions.filter(q=>q.sub===sub).length*100);h2+=`<div class="adapt-row"><span style="min-width:80px;font-size:.75rem">${fmtSub(sub)}</span><div class="adapt-bar-wrap"><div class="adapt-bar" style="width:${p}%;background:${p>60?'var(--red)':p>30?'var(--gold)':'var(--green)'}"></div></div></div>`;});as.innerHTML=h2;}
  // Rows (fixed = feil først, riktig på andre forsøk)
  const rows=document.getElementById('res-rows');rows.innerHTML='';
  S.questions.forEach(q=>{const fx=!q.ok&&!!q.fixed,k=q.ok?'ok':fx?'fix':'bad',ct=q.correctTxt??q.correct;const d=document.createElement('div');d.className='rb-row '+k;d.innerHTML=`<span class="rb-q">${(q.eq||q.q).replace(/, x = \?$/,'').replace(/ = \?$/,'')}</span><span class="rb-a ${k}">${q.ok?`= ${ct} ✓`:fx?`= ${ct} ✓ <small>(2. forsøk)</small>`:`${q.givenTxt??q.given} ✗ (${ct})`}</span>`;rows.appendChild(d);});
  saveHS();renderHS();
  // World badges (worldN = all required topics of both grades of WORLDS[N-1] mastered) + rebuild maps now that hs is saved
  WORLDS.forEach((w,i)=>{if(w.grades.every(gg=>{const ts=mstCore(gg);return ts.length>0&&ts.every(t=>isTopicMastered(gg,t.id));}))unlockAchievement('world'+(i+1));});
  buildGradeMap();
  buildTopicMap(S.grade);
  pgResults(); // PROGRESSION: "Neste:" goal
}

function fmtSub(s){const X=typeof window!=='undefined'&&window.EXTRA_SUBS;if(X&&typeof X==='object'&&X[s])return X[s];const N={a20t:'10 + et tall',a20n:'Til 20 uten å gå over tieren',a20o:'Over tieren (f.eks. 8 + 5)',a100t:'Hele tiere +',a100e:'Tosifret + ensifret',a100c:'Tosifret + ensifret over tieren',a100n:'Tosifret + tosifret',a100x:'Tosifret + tosifret over tieren',s100t:'Hele tiere −',s100e:'Tosifret − ensifret',s100b:'Tosifret − ensifret under tieren',s100n:'Tosifret − tosifret',s100x:'Tosifret − tosifret under tieren','hop1':'Telle 1 fremover','hop-1':'Telle 1 bakover',hop2:'Telle med 2',hop5:'Telle med 5',hop10:'Telle med 10',dob:'Dobling',dob2:'Dobling av store tall',halv:'Halvering',halv2:'Halvering av store tall','mis+a':'Finn tallet: ? + 4 = 9','mis+b':'Finn tallet: 5 + ? = 9','mis-':'Finn tallet: 9 − ? = 5',mis10:'Hele tiere som mangler',mis100:'Opp til neste tier','dec+':'Desimaltall +','dec-':'Desimaltall −',rnd1:'Avrunding til heltall',rnd10:'Avrunding til tiere','fr+':'Brøk +','fr-':'Brøk −',geo_areal:'Areal',geo_omkrets:'Omkrets','neg+':'Negative tall +','neg-':'Negative tall −','alg+':'Algebra +','alg-':'Algebra −',algx:'Algebra ·',rat1:'Forholdstall',rat2:'Forholdstall',avg:'Gjennomsnitt',eq1:'Likning ax = b',eq2:'Likning ax + b = c',sq:'Kvadrattall',cub:'Kubikktall',pot:'Potenser',pctinc:'Prosentvis økning',pctdec:'Prosentvis nedgang',pyth_a:'Pytagoras: finn a',pyth_b:'Pytagoras: finn b',pyth_c:'Pytagoras: finn c',median:'Median',mode:'Typetall',range:'Variasjonsbredde',sys:'Likningssett',quad:'Kvadratrot',expand:'Parenteser',func_lin:'Lineær funksjon',func_lin2:'Lineær funksjon',func_quad:'Andregradsfunksjon',prob_dice:'Sannsynlighet: terning',prob_coin:'Sannsynlighet: mynt',prob_bag:'Sannsynlighet: kuler'};if(N[s])return N[s];let m;if(m=s.match(/^(\d+)([+-])(\d+)$/))return`${m[1]} ${m[2]} ${m[3]}`;if(m=s.match(/^x(\d+)$/))return`${m[1]}-gangen`;if(m=s.match(/^d(\d+)$/))return`Del med ${m[1]}`;if(m=s.match(/^v(\d)$/))return`Tiervenner ${m[1]} + ${10-m[1]}`;if(/^1\/\d+$/.test(s))return`Brøk ${s}`;if(m=s.match(/^p(?:ct)?(\d+)$/))return`${m[1]} % av et tall`;if(m=s.match(/^r(\d+)$/))return`Runde tall (${m[1]})`;if(m=s.match(/^trig_(\w+)$/))return`Trigonometri: ${m[1]}`;return s;}
// Rekorder: score på 0–10-skala (som før, brukes av getBest) + c/n for visning
function saveHS(){const k=`hs_${S.grade}_${S.topicId}`,r=roundScore();let p;try{p=JSON.parse(localStorage.getItem(k)||'[]');}catch(e){p=[];}if(!Array.isArray(p))p=[];p.push({score:r.s10,c:r.c,n:r.n,ko:S.enemyDefeated,date:new Date().toLocaleDateString('no-NO')});p.sort((a,b)=>b.score-a.score||(b.c??0)-(a.c??0));localStorage.setItem(k,JSON.stringify(p.slice(0,5)));}
function renderHS(){const k=`hs_${S.grade}_${S.topicId}`;let s;try{s=JSON.parse(localStorage.getItem(k)||'[]');}catch(e){s=[];}if(!Array.isArray(s))s=[];const medals=['🥇','🥈','🥉','4️⃣','5️⃣'];document.getElementById('hs-rows').innerHTML=s.length?s.map((s,i)=>`<div class="hs-row"><span>${medals[i]} ${s.date}</span><span class="hs-score">${s.ko?'💥 ':''}${s.c!=null&&s.n?`${s.c} av ${s.n}`:`${s.score}/10`}</span></div>`).join(''):'Ingen rekorder ennå!';}

// ============================================================
// PARENT REPORT
// ============================================================
function showParentReport(){
  const {n,c,pct,perfect}=roundScore(),g=S.grade,tid=S.topicId,st=topicStars(g,tid),nx=mstNext(g,tid);
  document.getElementById('pr-date').textContent=new Date().toLocaleDateString('no-NO',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
  document.getElementById('pr-topic-name').textContent=S.topic.name;
  document.getElementById('pr-grade-name').textContent=`${S.grade}. klasse`;
  document.getElementById('pr-correct').textContent=c;
  document.getElementById('pr-wrong').textContent=n-c;
  document.getElementById('pr-pct').textContent=Math.round(c/n*100)+'%';
  document.getElementById('pr-stars').textContent=mstStarsTxt(st)+(hasCrown(g,tid)?' 👑':'');
  const ok=S.questions.filter(q=>q.ok),bad=S.questions.filter(q=>!q.ok),fixed=bad.filter(q=>q.fixed);
  document.getElementById('pr-strengths').innerHTML=(ok.length?`<div class="pr-strength">Riktig på første forsøk: ${ok.length} av ${n} oppgaver i "${S.topic.name}"</div>`:
    '<div class="pr-weakness">Ingen riktige på første forsøk denne runden</div>')+(fixed.length?`<div class="pr-strength">Rettet selv på andre forsøk: ${fixed.length}</div>`:'')+(S.enemyDefeated?`<div class="pr-strength">💥 Vant kampen på K.O. etter ${n} av ${TQ} oppgaver</div>`:'');
  const subE={};bad.forEach(q=>subE[q.sub]=(subE[q.sub]||0)+1);
  document.getElementById('pr-weaknesses').innerHTML=Object.entries(subE).sort((a,b)=>b[1]-a[1]).map(([s,k])=>`<div class="pr-weakness">${fmtSub(s)}: ${k} feil</div>`).join('')||'<div class="pr-strength">Ingen svake punkter!</div>';
  document.getElementById('pr-breakdown').innerHTML=S.questions.map((q,i)=>`<div class="pr-qrow"><span>${i+1}. ${(q.eq||q.q).replace(/, x = \?$/,'').replace(/ = \?$/,'')}</span><span style="color:${q.ok?'var(--green)':q.fixed?'var(--gold)':'var(--red)'};font-weight:800">${q.ok?`= ${q.correctTxt??q.correct} ✓`:q.fixed?`= ${q.correctTxt??q.correct} ✓ (2. forsøk)`:`${q.givenTxt??q.given} ✗ (${q.correctTxt??q.correct})`}</span></div>`).join('');
  const rec=document.getElementById('pr-rec');
  const goal=` Stjerner i temaet: ${mstStarsTxt(st)}. Neste mål: ${nx.say}`;
  if(perfect)rec.textContent='Perfekt resultat!'+goal;
  else if(pct>=.8)rec.textContent='Veldig bra!'+goal;
  else{const tw=bad.length?fmtSub(bad[0].sub):'noen oppgaver';rec.innerHTML=`Spillet gir ekstra trening på <strong>${tw}</strong> automatisk. 10 min om dagen gir stor fremgang!`+goal;}
  showScreen('parent');
}
