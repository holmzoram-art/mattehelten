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
  document.getElementById('enemy-avatar').textContent=ENEMIES[g]||'👾';
  document.getElementById('enemy-name').textContent=({1:'Tall-larven',2:'Minus-billen',3:'Gange-øglen',4:'Dele-krokodillen',5:'Komma-dinoen',6:'Brøk-dragen',7:'Algebra-trollet',8:'Likningszombien',9:'Pytha-romvesenet',10:'Funksjons-ufoen'})[g]||'Tallmonsteret';
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
    // XP & coins
    const xpG=second?6:10+(S.combo>=3?8:0)+(S.combo>=5?5:0);
    const oldL=curLvl();
    prog.xp+=xpG;prog.coins+=1;saveProg();renderHUD();
    const newL=curLvl();
    if(newL>oldL){checkEvolution(oldL,newL);sndLvl();launch(100);unlockAchievement('lvlup');if(newL>=5)unlockAchievement('lvl5');if(newL>=8)unlockAchievement('lvl8');if(newL>=12)unlockAchievement('lvl12');} // evolution waits for the chest (NIVÅ OPP first)
    updatePlayerEmoji();
    if(prog.coins>=50)unlockAchievement('coins50');
    if(prog.coins>=100)unlockAchievement('coins100');
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
// Round score: % of questions actually answered (a K.O. ends early), on the 0-10 scale used by mastery/high scores; 10 only if no mistakes
function roundScore(){const n=S.questions.length||TQ,perfect=S.score>=n,s10=perfect?10:Math.min(9,Math.round(S.score/n*10));return{n,s10,pct:s10/10,perfect};}
function showChest(){
  const {s10,pct,perfect}=roundScore();
  const xpEarned=s10*10+(pct>=1?50:pct>=.8?20:0);
  const coinsEarned=s10+(pct>=1?5:0);
  const stars=Math.ceil(pct*3);

  // Add mastery before calculating display
  const masteryBefore=getMastery(S.grade,S.topicId);
  addMastery(S.grade,S.topicId,s10);
  const masteryAfter=Math.min(100,getMastery(S.grade,S.topicId));
  const masteryGained=Math.min(100,masteryAfter)-Math.min(100,masteryBefore);
  const nowPassed=isTopicPassed(S.grade,S.topicId);
  const nowMastered=isTopicMastered(S.grade,S.topicId);

  let emoji,title,sub;
  if(perfect){emoji='💎';title='PERFEKT SEIER!';sub='Du er en legende!';}
  else if(pct>=.8){emoji='🏆';title='Stor seier!';sub='Nesten perfekt!';}
  else if(pct>=.5){emoji='⚔️';title='Bra kamp!';sub='Øv mer og kom sterkere tilbake!';}
  else{emoji='🛡️';title='Tap — men du lærte!';sub='Prøv igjen, du blir sterkere!';}
  if(S.enemyDefeated)sub='💥 K.O.! '+sub;

  // Mastery status message
  let mstMsg='';
  if(nowMastered&&masteryBefore<100)mstMsg='<div style="color:var(--green);font-family:\'Fredoka One\',cursive;font-size:.95rem;margin-top:4px">🏆 Emne mestret! Neste låses opp!</div>';
  else if(nowPassed&&masteryBefore<70)mstMsg='<div style="color:var(--gold);font-family:\'Fredoka One\',cursive;font-size:.9rem;margin-top:4px">⭐ Passert! Neste emne låst opp!</div>';
  else if(!nowMastered)mstMsg=`<div style="color:var(--muted);font-size:.8rem;font-weight:700;margin-top:4px">Mestring: ${masteryAfter}% — trenger ${nowPassed?100:70}% for ${nowPassed?'å mestre':'å låse opp neste'}</div>`;

  document.getElementById('chest-emoji').textContent=emoji;
  document.getElementById('chest-title').textContent=title;
  document.getElementById('chest-sub').innerHTML=sub+mstMsg;
  document.getElementById('chest-rewards').innerHTML=`
    <div class="chest-reward"><span class="chest-reward-icon">⭐</span><div class="chest-reward-val">${'⭐'.repeat(stars)+'☆'.repeat(3-stars)}</div></div>
    <div class="chest-reward"><span class="chest-reward-icon">✨</span><div class="chest-reward-val">+${xpEarned} XP</div></div>
    <div class="chest-reward"><span class="chest-reward-icon">🎯</span><div class="chest-reward-val">+${masteryGained}% mestring</div></div>
    <div class="chest-reward"><span class="chest-reward-icon">🪙</span><div class="chest-reward-val">+${coinsEarned}</div></div>
  `;
  const oldL=curLvl();
  prog.xp+=xpEarned;prog.coins+=coinsEarned;saveProg();renderHUD();
  const newL=curLvl();
  if(newL>oldL){checkEvolution(oldL,newL);unlockAchievement('lvlup');if(newL>=5)unlockAchievement('lvl5');if(newL>=8)unlockAchievement('lvl8');if(newL>=12)unlockAchievement('lvl12');}
  if(prog.coins>=50)unlockAchievement('coins50');if(prog.coins>=100)unlockAchievement('coins100');
  document.getElementById('chest-overlay').classList.add('show');
  launch(pct>=.8?120:60);
  if(perfect)unlockAchievement('perfect');
  sidekickReact(pct>=.8?'celebrate':'happy');
  pgChest(masteryBefore,xpEarned,coinsEarned,pct); // PROGRESSION: count-ups, streak, NIVÅ OPP
}

function closeChest(){
  document.getElementById('chest-overlay').classList.remove('show');
  buildResults();
  showScreen('results');
  pgChestClose(); // PROGRESSION: NIVÅ OPP comes before evolution
  if(pendingEvolution)showEvolution(); // level-up from chest XP
}

function buildResults(){
  const {n,pct,perfect}=roundScore();
  let mascot,title,sub;
  if(perfect){mascot='💎';title=`PERFEKT! ${S.score} av ${n}!`;sub='Du er en ekte mattehelt!';}
  else if(pct>=.8){mascot='🏆';title='Kjempebra!';sub='Nesten perfekt!';}
  else if(pct>=.6){mascot='⚔️';title='Bra kamp!';sub='Øv litt mer, du klarer det!';}
  else if(pct>=.4){mascot='🛡️';title='Ikke gi opp!';sub='Prøv igjen — du lærer!';}
  else{mascot='📚';title='Øv og prøv igjen!';sub='Slik lærer vi — hold ut!';}
  if(S.enemyDefeated)sub='💥 K.O.! '+sub;
  const stars=Math.ceil(pct*3);
  document.getElementById('res-mascot').textContent=mascot;
  document.getElementById('res-title').textContent=title;
  document.getElementById('res-sub').textContent=sub;
  document.getElementById('res-stars').textContent='⭐'.repeat(stars)+'☆'.repeat(3-stars);
  document.getElementById('res-num').textContent=S.score;
  const den=document.querySelector('#res-ring .score-den');if(den)den.textContent=`av ${n}`;
  document.getElementById('res-ring').style.background=`conic-gradient(#00ff88 ${Math.round(S.score/n*360)}deg,rgba(255,255,255,.1) 0)`;
  // Adapt section
  const errs={};S.questions.forEach(q=>{if(!q.ok)errs[q.sub]=(errs[q.sub]||0)+1;});
  const subs=Object.entries(errs).sort((a,b)=>b[1]-a[1]);
  const as=document.getElementById('adapt-sec');
  if(!subs.length){as.innerHTML='<div style="font-family:Fredoka One,cursive;font-size:.9rem;color:var(--green)">Ingen svake punkter denne runden!</div>';}
  else{let h='<div class="adapt-title">Dette øver vi ekstra på neste gang:</div>';subs.slice(0,3).forEach(([sub,n])=>{const p=Math.round(n/S.questions.filter(q=>q.sub===sub).length*100);h+=`<div class="adapt-row"><span style="min-width:80px;font-size:.75rem">${fmtSub(sub)}</span><div class="adapt-bar-wrap"><div class="adapt-bar" style="width:${p}%;background:${p>60?'var(--red)':p>30?'var(--gold)':'var(--green)'}"></div></div><span style="min-width:34px;text-align:right;font-size:.73rem">${n} feil</span></div>`;});as.innerHTML=h;}
  // Rows
  const rows=document.getElementById('res-rows');rows.innerHTML='';
  S.questions.forEach(q=>{const d=document.createElement('div');d.className='rb-row '+(q.ok?'ok':'bad');d.innerHTML=`<span class="rb-q">${(q.eq||q.q).replace(/, x = \?$/,'').replace(/ = \?$/,'')}</span><span class="rb-a ${q.ok?'ok':'bad'}">${q.ok?`= ${q.correctTxt??q.correct} ✓`:`${q.givenTxt??q.given} ✗ (${q.correctTxt??q.correct})`}</span>`;rows.appendChild(d);});
  saveHS();renderHS();
  // World badges (worldN = both grades of WORLDS[N-1] fully mastered) + rebuild maps now that hs is saved
  WORLDS.forEach((w,i)=>{if(w.grades.every(g=>{const ts=CUR[g]?.topics||[];return ts.length>0&&ts.every(t=>isTopicMastered(g,t.id));}))unlockAchievement('world'+(i+1));});
  buildGradeMap();
  buildTopicMap(S.grade);
  pgResults(); // PROGRESSION: "Neste:" goal
}

function fmtSub(s){const N={a20t:'10 + et tall',a20n:'Til 20 uten å gå over tieren',a20o:'Over tieren (f.eks. 8 + 5)',a100t:'Hele tiere +',a100e:'Tosifret + ensifret',a100c:'Tosifret + ensifret over tieren',a100n:'Tosifret + tosifret',a100x:'Tosifret + tosifret over tieren',s100t:'Hele tiere −',s100e:'Tosifret − ensifret',s100b:'Tosifret − ensifret under tieren',s100n:'Tosifret − tosifret',s100x:'Tosifret − tosifret under tieren','hop1':'Telle 1 fremover','hop-1':'Telle 1 bakover',hop2:'Telle med 2',hop5:'Telle med 5',hop10:'Telle med 10',dob:'Dobling',dob2:'Dobling av store tall',halv:'Halvering',halv2:'Halvering av store tall','mis+a':'Finn tallet: ? + 4 = 9','mis+b':'Finn tallet: 5 + ? = 9','mis-':'Finn tallet: 9 − ? = 5',mis10:'Hele tiere som mangler',mis100:'Opp til neste tier','dec+':'Desimaltall +','dec-':'Desimaltall −',rnd1:'Avrunding til heltall',rnd10:'Avrunding til tiere','fr+':'Brøk +','fr-':'Brøk −',geo_areal:'Areal',geo_omkrets:'Omkrets','neg+':'Negative tall +','neg-':'Negative tall −','alg+':'Algebra +','alg-':'Algebra −',algx:'Algebra ·',rat1:'Forholdstall',rat2:'Forholdstall',avg:'Gjennomsnitt',eq1:'Likning ax = b',eq2:'Likning ax + b = c',sq:'Kvadrattall',cub:'Kubikktall',pot:'Potenser',pctinc:'Prosentvis økning',pctdec:'Prosentvis nedgang',pyth_a:'Pytagoras: finn a',pyth_b:'Pytagoras: finn b',pyth_c:'Pytagoras: finn c',median:'Median',mode:'Typetall',range:'Variasjonsbredde',sys:'Likningssett',quad:'Kvadratrot',expand:'Parenteser',func_lin:'Lineær funksjon',func_lin2:'Lineær funksjon',func_quad:'Andregradsfunksjon',prob_dice:'Sannsynlighet: terning',prob_coin:'Sannsynlighet: mynt',prob_bag:'Sannsynlighet: kuler'};if(N[s])return N[s];let m;if(m=s.match(/^(\d+)([+-])(\d+)$/))return`${m[1]} ${m[2]} ${m[3]}`;if(m=s.match(/^x(\d+)$/))return`${m[1]}-gangen`;if(m=s.match(/^d(\d+)$/))return`Del med ${m[1]}`;if(m=s.match(/^v(\d)$/))return`Tiervenner ${m[1]} + ${10-m[1]}`;if(/^1\/\d+$/.test(s))return`Brøk ${s}`;if(m=s.match(/^p(?:ct)?(\d+)$/))return`${m[1]} % av et tall`;if(m=s.match(/^r(\d+)$/))return`Runde tall (${m[1]})`;if(m=s.match(/^trig_(\w+)$/))return`Trigonometri: ${m[1]}`;return s;}
function saveHS(){const k=`hs_${S.grade}_${S.topicId}`;const p=JSON.parse(localStorage.getItem(k)||'[]');p.push({score:roundScore().s10,ko:S.enemyDefeated,date:new Date().toLocaleDateString('no-NO')});p.sort((a,b)=>b.score-a.score);localStorage.setItem(k,JSON.stringify(p.slice(0,5)));}
function renderHS(){const k=`hs_${S.grade}_${S.topicId}`;const s=JSON.parse(localStorage.getItem(k)||'[]');const medals=['🥇','🥈','🥉','4️⃣','5️⃣'];document.getElementById('hs-rows').innerHTML=s.length?s.map((s,i)=>`<div class="hs-row"><span>${medals[i]} ${s.date}</span><span class="hs-score">${s.ko?'💥 ':''}${s.score}/10</span></div>`).join(''):'Ingen rekorder ennå!';}

// ============================================================
// PARENT REPORT
// ============================================================
function showParentReport(){
  const {n,pct,perfect}=roundScore(),stars=Math.ceil(pct*3);
  document.getElementById('pr-date').textContent=new Date().toLocaleDateString('no-NO',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
  document.getElementById('pr-topic-name').textContent=S.topic.name;
  document.getElementById('pr-grade-name').textContent=`${S.grade}. klasse`;
  document.getElementById('pr-correct').textContent=S.score;
  document.getElementById('pr-wrong').textContent=n-S.score;
  document.getElementById('pr-pct').textContent=Math.round(S.score/n*100)+'%';
  document.getElementById('pr-stars').textContent='⭐'.repeat(stars)+'☆'.repeat(3-stars);
  const ok=S.questions.filter(q=>q.ok),bad=S.questions.filter(q=>!q.ok);
  document.getElementById('pr-strengths').innerHTML=(ok.length?`<div class="pr-strength">Riktig på ${ok.length} av ${n} oppgaver i "${S.topic.name}"</div>`:
    '<div class="pr-weakness">Ingen riktige denne runden</div>')+(S.enemyDefeated?`<div class="pr-strength">💥 Vant kampen på K.O. etter ${n} av ${TQ} oppgaver</div>`:'');
  const subE={};bad.forEach(q=>subE[q.sub]=(subE[q.sub]||0)+1);
  document.getElementById('pr-weaknesses').innerHTML=Object.entries(subE).sort((a,b)=>b[1]-a[1]).map(([s,n])=>`<div class="pr-weakness">${fmtSub(s)}: ${n} feil</div>`).join('')||'<div class="pr-strength">Ingen svake punkter!</div>';
  document.getElementById('pr-breakdown').innerHTML=S.questions.map((q,i)=>`<div class="pr-qrow"><span>${i+1}. ${(q.eq||q.q).replace(/, x = \?$/,'').replace(/ = \?$/,'')}</span><span style="color:${q.ok?'var(--green)':'var(--red)'};font-weight:800">${q.ok?`= ${q.correctTxt??q.correct} ✓`:`${q.givenTxt??q.given} ✗ (${q.correctTxt??q.correct})`}</span></div>`).join('');
  const rec=document.getElementById('pr-rec');
  if(perfect)rec.textContent='Perfekt resultat! Gå videre til neste tema eller klassetrinn.';
  else if(pct>=.8)rec.textContent='Veldig bra! Noen runder til for å befeste kunnskapen, deretter videre.';
  else{const tw=bad.length?fmtSub(bad[0].sub):'noen oppgaver';rec.innerHTML=`Spillet gir ekstra trening på <strong>${tw}</strong> automatisk. 10 min om dagen gir stor fremgang!`;}
  showScreen('parent');
}
