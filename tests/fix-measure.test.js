// Mattehelten – tester for rettebølge F1 (måling): runden = 8 nye oppgaver, revansj/mini er ekstra og teller ikke,
// revansj = søskenoppgave, ⭐⭐⭐ = 21/24 på to dager, 💪 «Øvd godt», høyst 2 tovalg, svake regnemåter, boss med kjernetemaer,
// trollet som spredt repetisjon, mynter, mh_stats uten ekstra, foreldresidens tekst og gamle lagringer.
module.exports=function({R,ok,CUR,ls,els,ctx}){
  const day=o=>R(`mhDay(${o})`),D0=day(0),D1=day(-1),D2=day(-2),D3=day(-3),D4=day(-4),D5=day(-5);
  const reset=()=>{ls.clear();R('prog={xp:0,coins:0,streak:0,lastDay:""};unlockedAchievements={};pendingEvolution=null');};
  const rr=(g,id,c,n,d)=>R(`recordRound(${g},'${id}',${c},${n},'${d||D0}')`);
  const S=()=>R('S');
  const isCh=q=>Array.isArray(q.choices)&&q.choices.length>0;
  const right=q=>isCh(q)?String(q.ansTxt??q.ans):q.ans;
  const wrong=q=>isCh(q)?String(q.choices.find(c=>String(c)!==String(q.ansTxt??q.ans))):q.ans+1;
  const ans=v=>{const q=S().current;if(isCh(q))R('submitChoice')(v,null);else{els['ans-input'].value=String(v);R('submitAnswer()');}};
  // Spiller ett svar (to forsøk ved feil) og går videre. rightFn(qd) → true/false
  const step=rightFn=>{const q=S().current,r=rightFn(q),w1=wrong(q);ans(r?right(q):w1);
    if(!S().answered){const w2=isCh(q)?(q.choices.map(String).find(c=>c!==String(q.ansTxt??q.ans)&&c!==w1)||w1):q.ans+2;ans(r?right(q):w2);}
    if(!S().answered)ans(right(S().current));};
  const play=(g,id,rightFn,onEach)=>{R(`startGame(${g},'${id}')`);for(let i=0;i<20;i++){step(rightFn);if(onEach)onEach();if(R('loopRoundOver()'))break;R('handleNext()');}return S().questions;};
  const newQ=qs=>qs.filter(x=>!x.revenge&&!x.mini);

  // ---- 1) Runden: 8 nye som teller, ekstra i tillegg (høyst 2), revansj går foran mini ----
  reset();
  {let len=true,cap=true,prio=true,score=true,label=true;
   for(let r=0;r<60;r++){
     const labels=[];const qs=play(1,'add20',q=>Math.random()<.6,()=>labels.push([R('S.current.revenge'),R('S.current.mini'),els['prog-label'].textContent]));
     const nq=newQ(qs),x=qs.length-nq.length,rv=qs.filter(q=>q.revenge).length,mi=qs.filter(q=>q.mini).length;
     if(nq.length!==8)len=false;if(x>2)cap=false;
     if(mi&&rv&&qs.findIndex(q=>q.mini)>qs.findIndex(q=>q.revenge))prio=false; // mini bare når ingen revansj er brukt før den
     if(S().score!==nq.filter(q=>q.ok).length||R('roundScore().c')!==nq.filter(q=>q.ok).length||R('roundScore().n')!==8)score=false;
     labels.forEach(([rv1,mi1,l])=>{if(rv1&&l!=='🔁 Revansj!'||mi1&&l!=='⚡ Lynoppgave'||!rv1&&!mi1&&!/^Spørsmål [1-8] av 8$/.test(l))label=false;});}
   ok(len,'round: always 8 new questions');ok(cap,'round: at most 2 extra questions');ok(prio,'round: the mini question only comes when no revenge is used yet (revenge first)');
   ok(score,'round: S.score and roundScore count only the 8 new questions');ok(label,'round: progress counts new questions; extras show «🔁 Revansj!» / «⚡ Lynoppgave»');}
  // Telleren flytter seg ikke for en ekstra
  reset();R("startGame(1,'add10')");step(()=>true);R('handleNext()');
  R("S.current=Object.assign(loopSibling(S.questions[0])||{q:'1 + 1 = ?',ans:2,sub:'1+1',strat:'dobbel',ops:{a:1,b:1,op:'+'}},{revenge:true});S.answered=false;updateBattleProg()");
  ok(els['prog-label'].textContent==='🔁 Revansj!'&&els['prog-fill'].style.width==='12.5%','progress: a revenge does not move the counter');
  step(()=>true);ok(S().score===1&&els['score-label'].textContent==='1 riktig','progress: a right revenge is not counted in «riktige»');
  // Ekstra teller ikke i tilpasning (recordAttempt/famRecord), men logges som x i mh_stats
  {const fam0=JSON.stringify(R("mhLoad('mh_fam',{})")),ad0=JSON.stringify([...ls.keys()].filter(k=>/^adapt_/.test(k)).map(k=>ls.get(k)));
   R("S.current=Object.assign(loopSibling(S.questions[0])||{q:'2 + 2 = ?',ans:4,sub:'2+2',strat:'dobbel',ops:{a:2,b:2,op:'+'}},{mini:true});S.answered=false");step(()=>false);
   ok(JSON.stringify(R("mhLoad('mh_fam',{})"))===fam0&&JSON.stringify([...ls.keys()].filter(k=>/^adapt_/.test(k)).map(k=>ls.get(k)))===ad0,'extra: no recordAttempt/famRecord for extra questions');
   const st=JSON.parse(ls.get('mh_stats'))[D0];ok(st.n===1&&st.ok===1&&st.x&&st.x[0]===2&&st.x[1]===1&&!Object.keys(st.m).length,`stats: extras go to x, not n/ok/m (${JSON.stringify(st)})`);
   ok(R('parAgg(parStats(),[mhDay(0)])').n===1,'stats: parents count only new questions');}
  // K.O. avslutter runden; ellers kommer en ventende revansj etter de 8 nye
  reset();{let end=0;for(let r=0;r<40;r++){const qs=play(1,'add20',q=>!(!q.revenge&&!q.mini&&R('loopNewDone()')===7));
      const last=qs[qs.length-1];if(last.revenge&&newQ(qs).length===8)end++;}
   ok(end>30,`round: a revenge for a miss on the last question comes after it (${end}/40)`);}

  // ---- 2) Revansj = søskenoppgave ----
  reset();
  {let same=true,diff=true,n=0;
   for(const [g,id] of [[1,'add20'],[1,'sub20'],[2,'sub100'],[1,'eq1'],[2,'even2'],[2,'place2'],[1,'clock1'],[2,'money2'],[1,'ten1'],[3,CUR[3].topics[0].id]]){
     const t=CUR[g].topics.find(x=>x.id===id);
     for(let i=0;i<40;i++){R(`startGame(${g},'${id}')`);const q=S().current,sib=R('loopSibling(S.current)');if(!sib)continue;n++;
       if(q.strat?sib.strat!==q.strat:sib.sub!==q.sub)same=false;if(R('loopKey')(sib)===R('loopKey')(q))diff=false;}}
   ok(n>300,`sibling: found for most questions (${n})`);ok(same,'sibling: same strategy (strat, else sub)');ok(diff,'sibling: other numbers (other loopKey)');}
  // Ja/Nei i «Er det likt?»: søsken er en annen påstand
  reset();R("startGame(1,'eq1')");
  {let tf=0,okTF=true;for(let i=0;i<200;i++){const q=R("CUR[1].topics.find(t=>t.id==='eq1').gen(1,'eq1')");if(q.sub!=='e1s')continue;R('S').current=q;R('S').questions=[];R('S').lp=null;
     const sib=R('loopSibling(S.current)');if(!sib)continue;tf++;if(sib.q===q.q||R('loopKey')(sib)===R('loopKey')(q)||sib.sub!=='e1s')okTF=false;}
   ok(tf>30&&okTF,`sibling: a «Stemmer det?» gets another statement, not the same (${tf})`);}
  // Finnes ingen søsken → ingen revansj (og ingen «kommer igjen»-melding)
  reset();R("startGame(1,'add10')");R("S.current={q:'7 · 8 = ?',ans:56,sub:'zz',strat:'zz-ingen',type:'x'};S.answered=false");step(()=>false);
  ok(!R('S.lp').rev.length&&!/Snart får du/.test(els['fb-box'].innerHTML),'revenge: dropped when no sibling exists');
  // Revansj i boss og troll: aldri
  reset();CUR[1].topics.forEach(t=>rr(1,t.id,6,8));R('startBoss(1)');for(let i=0;i<12&&!R('S.bossOver');i++){step(()=>false);R('handleNext()');}
  ok(!S().questions.some(q=>q.revenge||q.mini),'boss: no revenge or mini');R('bossCleanup()');

  // ---- 3) Høyst 2 tovalgsoppgaver per runde (nye) ----
  reset();
  for(const [g,id] of [[1,'eq1'],[2,'even2'],[1,'cmp1']]){let over=0;for(let r=0;r<40;r++){const qs=play(g,id,()=>Math.random()<.7);if(newQ(qs).filter(q=>q.c2).length>2)over++;}
    ok(over===0,`${id}: at most 2 two-choice questions per round (${over} rounds over)`);}

  // ---- 4) Svake regnemåter: tak 60 %, lett oppgave etter 2 feil på rad ----
  reset();
  {let easyOK=true,n2=0;const cross=q=>q.ops&&q.ops.op==='+'&&Math.max(q.ops.a,q.ops.b)<10&&q.ops.a+q.ops.b>10;
   for(let r=0;r<40;r++){R("startGame(1,'add20')");for(let i=0;i<20;i++){const Q=S().questions,q=S().current;
       if(Q.length>=2&&!Q[Q.length-1].ok&&!Q[Q.length-2].ok&&!q.revenge&&!q.mini){n2++;if(q._w)easyOK=false;}
       step(qq=>!cross(qq));if(R('loopRoundOver()'))break;R('handleNext()');}}
   ok(n2>10&&easyOK,`weak: after 2 wrong in a row the next new question is not from a weak family (${n2})`);}
  ok(R('famPick.toString()').includes('1+3*famErr'),'weak: famPick weights weak families with 1 + 3·err');

  // ---- 5) Stjerner: ⭐⭐⭐ = 21/24 på 2 dager, 💪, aldri tatt bort ----
  reset();const A='add20';
  rr(1,A,8,8,D2);rr(1,A,8,8,D2);ok(R(`topicStars(1,'${A}')`)===2,'star3: two perfect rounds are not enough');
  rr(1,A,5,8,D1);ok(R(`topicStars(1,'${A}')`)===3,'star3: 21/24 on two days');
  reset();rr(1,A,7,8,D1);rr(1,A,7,8,D1);rr(1,A,6,8,D0);ok(R(`topicStars(1,'${A}')`)===2,'star3: 20/24 is not enough');
  reset();rr(1,A,3,8,D2);rr(1,A,3,8,D1);let res=rr(1,A,4,8,D0);
  ok(res.to===0&&res.eff&&R(`topicEffort(1,'${A}')`)&&!R(`isTopicPassed(1,'${A}')`),'effort: 💪 is not a ⭐');
  R("startGame(1,'add20')");for(let i=0;i<20&&!R('S.chestDone');i++){step(()=>false);R('handleNext()');}
  ok(/mst-eff/.test(els['chest-sub'].innerHTML),'effort: the chest shows 💪');
  // Lær igjen én gang for et 💪-tema
  {ls.set('mh_learn_seen',JSON.stringify(['1:add20']));const a=R(`startTopic(1,'${A}')`);const b=R(`startTopic(1,'${A}')`);ok(a==='learn'&&b==='game','effort: startTopic shows Lær again once for a 💪 topic');}
  // Gamle lagringer tåles: mh_learn uten eff/pu, mh_stats uten x, gammel mh_review
  reset();ls.set('mh_learn',JSON.stringify({'1:add20':{r:[[D3,7,8],[D2,7,8]],s:3},'1:sub20':{r:[[D3,3,8],[D2,3,8],[D1,4,8]],s:1}}));
  ls.set('mh_stats',JSON.stringify({[D1]:{ms:1000,n:10,ok:8,t:{'1:add20':[10,8]},m:{}}}));ls.set('mh_review',JSON.stringify({day:D0,g:1,ids:['sub20'],won:false,mastered:false}));
  ok(R("topicStars(1,'add20')")===3&&R("topicStars(1,'sub20')")===1,'old save: stars that were given stay (old ⭐⭐⭐ and old effort ⭐)');
  {let thr=null;try{R('buildGradeMap();buildTopicMap(1);parHTML()');}catch(e){thr=e;}ok(!thr,`old save: maps and parents page build (${thr&&thr.message})`);}
  ok(!(R('trollToday()')||{ids:[]}).ids.includes('sub20'),'old save: an old troll offer with a ⭐ topic is replaced');

  // ---- 6) Boss: kjernetemaer 2 hver, 9/12, ingen kjernetema 0/2 ----
  const bossRun=(g,pOf)=>{R(`startBoss(${g})`);for(let i=0;i<14&&!R('S.bossOver');i++){const q=S().current,t=q.bossTid;step(()=>Math.random()<pOf(t));R('handleNext()');}const s=S();R('bossCleanup()');return s;};
  reset();CUR[1].topics.forEach(t=>rr(1,t.id,6,8));
  {let w=0;for(let i=0;i<60;i++){if(bossRun(1,t=>t==='sub20'?0:.95).enemyDefeated)w++;}ok(w===0,`boss: a core topic the child cannot (p=0) gives no win (${w}/60)`);}
  {let w=0;for(let i=0;i<60;i++){if(bossRun(1,t=>.97).enemyDefeated)w++;}ok(w>=50,`boss: a strong child wins (${w}/60)`);}
  reset();CUR[2].topics.forEach(t=>rr(2,t.id,6,8));ls.set('mh_boss_1','1');
  {const s=bossRun(2,()=>1);ok(s.enemyDefeated&&R('BOSS_CORE[2]').every(id=>s.bossStats[id]&&s.bossStats[id].n>=1),'boss 2: all core topics asked before the win');}
  ok(R("bossVerdict({add20:{ok:1,n:2},sub20:{ok:2,n:2},eq1:{ok:1,n:1},ten1:{ok:2,n:2},add10:{ok:0,n:1}},9,9,['add20','sub20','eq1','ten1'])")===true,'boss: a non-core topic at 0 of 1 does not block');
  ok(R("bossVerdict({add20:{ok:0,n:2},sub20:{ok:2,n:2},eq1:{ok:1,n:1},ten1:{ok:2,n:2}},10,9,['add20','sub20','eq1','ten1'])")===false,'boss: a core topic at 0 of 2 blocks');
  ok(R("bossVerdict({sub20:{ok:2,n:2},eq1:{ok:1,n:1},ten1:{ok:2,n:2}},10,9,['add20','sub20','eq1','ten1'])")===false,'boss: a core topic not asked yet blocks');

  // ---- 7) Trollet: bare modne ⭐⭐⭐, K.O. først til slutt, 👑 krever 2/2 ----
  reset();['add20','sub20','eq1'].forEach(id=>{rr(1,id,8,8,D5);rr(1,id,8,8,D4);rr(1,id,8,8,D3);});
  {let p=R('trollToday()');ok(p&&p.ids.length===3&&p.mastered,'troll: three ripe mastered topics');
   R('startTroll()');for(let i=0;i<5;i++){step(()=>true);ok(!S().enemyDefeated,`troll: no K.O. before the last question (${i+1})`);R('handleNext()');}
   step(()=>false);ok(S().enemyDefeated&&S().questions.length===6,'troll: 5 of 6 wins at the end, even if the last one is wrong');
   R('handleNext()');const miss=S().questions[5].tid;
   ok(R(`hasCrown(1,'${miss}')`)===false&&['add20','sub20','eq1'].filter(id=>id!==miss).every(id=>R(`hasCrown(1,'${id}')`)),'troll: 👑 only where all the topic\'s troll questions were right');
   ok(R(`mstGet(1,'${miss}')`).pu===D0,'troll: the topic with a miss gets «Puss opp»');R('bossCleanup()');}
  // Spredt: et tema øvd i går er ikke modent; et glemt tema fra i går er det
  reset();['add20','sub20'].forEach(id=>{rr(1,id,8,8,D3);rr(1,id,8,8,D2);rr(1,id,8,8,D1);});ok(R('trollToday()')===null,'troll: needs 2 days since last practice');
  {const L=JSON.parse(ls.get('mh_learn'));L['1:sub20'].pu=D1;ls.set('mh_learn',JSON.stringify(L));}ok(R('trollToday()').ids.join()==='sub20','troll: «Puss opp» comes the next day');

  // ---- 8) Mynter og foreldreside ----
  reset();R("S={grade:1,topicId:'add10',topic:CUR[1].topics.find(t=>t.id==='add10'),questions:[],idx:0,score:0,streak:0,combo:0,current:null,answered:false,enemyHp:100,playerHp:100,enemyDefeated:false}");
  ok(R('funOnRight({c2:true},false)')===1&&R('funOnRight({c2:false},false)')===2&&R('funOnRight({w:true},false)')===3&&R('funOnRight({w:true},true)')===0,'coins: 1 for two-choice, +1 for a weak family, 0 on second try');
  {const h=R('parStarsInfoHTML()');ok(/Da begynner det å sitte\. Trollet sjekker om det huskes\./.test(h)&&!/Da sitter det/.test(h)&&/💪/.test(h)&&/21 av 24/.test(h),'parents: star explanation follows the new rules');}
  reset();
};
