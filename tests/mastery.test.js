// Mattehelten – tester for mestring v2 (stjerner), opplåsing, boss og «Trollet er tilbake!» (A1)
// Kjøres av tests/run.js. Datoer simuleres med recordRound(g,id,c,n,dag).
module.exports=function({R,ok,CUR,ls,els}){
  const day=o=>R(`mhDay(${o})`),D0=day(0),D1=day(-1),D2=day(-2),D3=day(-3),D4=day(-4);
  const reset=()=>ls.clear();
  const stars=(g,id)=>R(`topicStars(${g},'${id}')`);
  const rr=(g,id,c,n,d)=>R(`recordRound(${g},'${id}',${c},${n},'${d||D0}')`);
  const T1=CUR[1].topics,T2=CUR[2].topics,A=T1[0].id;

  // ---- 1) Stjerneregler ----
  reset();
  ok(stars(1,A)===0&&!R(`isTopicPassed(1,'${A}')`),'mst: nytt tema har 0 stjerner');
  let r=rr(1,A,5,8);ok(r.from===0&&r.to===0,'mst: 5/8 gir ingen stjerne');
  r=rr(1,A,6,8);ok(r.from===0&&r.to===1,'mst: 6/8 gir ⭐');
  ok(R(`isTopicPassed(1,'${A}')`)&&!R(`isTopicMastered(1,'${A}')`),'mst: ⭐ = bestått, ikke mestret');
  r=rr(1,A,7,8);ok(r.to===2,'mst: 7/8 gir ⭐⭐');
  r=rr(1,A,8,8);ok(r.to===2,'mst: to runder ≥ 7/8 samme dag gir ikke ⭐⭐⭐');
  let nx=R(`mstNext(1,'${A}')`);ok(nx.now===false&&/i morgen/.test(nx.txt),`mst: tipset sier «i morgen»: ${nx.txt}`);
  // ⭐⭐⭐ (F1): de 3 siste rundene ≥ 21/24 til sammen, på minst 2 ulike dager
  reset();rr(1,A,7,8,D1);r=rr(1,A,7,8,D0);ok(r.to===2,'mst: to runder 7/8 på to dager er ikke nok for ⭐⭐⭐');
  r=rr(1,A,7,8,D0);ok(r.to===3&&R(`isTopicMastered(1,'${A}')`),'mst: 3 runder med 21/24 på to dager gir ⭐⭐⭐');
  reset();rr(1,A,7,8,D0);rr(1,A,7,8,D0);r=rr(1,A,8,8,D0);ok(r.to===2,'mst: 22/24 samme dag gir ikke ⭐⭐⭐');
  reset();rr(1,A,8,8,D2);rr(1,A,8,8,D1);r=rr(1,A,4,8,D0);ok(r.to===2,'mst: 20/24 gir ikke ⭐⭐⭐');
  reset();rr(1,A,8,8,D2);rr(1,A,8,8,D1);r=rr(1,A,5,8,D0);ok(r.to===3,'mst: 8 + 8 + 5 = 21/24 gir ⭐⭐⭐');
  reset();rr(1,A,7,8,D3);rr(1,A,3,8,D2);r=rr(1,A,8,8,D1);ok(r.to===2,'mst: en dårlig runde blant de 3 siste stopper ⭐⭐⭐');
  reset();rr(1,A,7,8,D4);rr(1,A,2,8,D3);rr(1,A,2,8,D2);r=rr(1,A,8,8,D1);ok(r.to===2,'mst: god runde utenfor de 3 siste teller ikke for ⭐⭐⭐');
  nx=R(`mstNext(1,'${A}')`);ok(nx.now===true&&/Tre runder/.test(nx.txt),`mst: tipset sier tre runder når én runde ikke er nok: ${nx.txt}`);
  reset();rr(1,A,8,8,D2);rr(1,A,7,8,D1);nx=R(`mstNext(1,'${A}')`);ok(nx.now===true&&/Få 6 riktige nå/.test(nx.txt),`mst: tipset sier «nå» med antallet som trengs: ${nx.txt}`);
  r=rr(1,A,0,8);ok(r.to===2,'mst: stjerner tas aldri bort');
  reset();rr(1,A,7,8,D1);rr(1,A,7,8,D1);rr(1,A,7,8,D0);[0,1,0,2].forEach(c=>rr(1,A,c,8));ok(stars(1,A)===3,'mst: mestret forblir mestret etter dårlige runder');
  // Innsats (F1): 3 runder med snitt ≥ 40 % gir 💪 «Øvd godt», ikke ⭐: neste tema åpnes, men bossen teller den ikke
  reset();rr(1,A,3,8);rr(1,A,3,8);ok(stars(1,A)===0&&!R(`topicEffort(1,'${A}')`),'mst: to svake runder gir ikke 💪 ennå');
  r=rr(1,A,4,8);ok(r.to===0&&r.eff===true&&R(`topicEffort(1,'${A}')`)&&!R(`isTopicPassed(1,'${A}')`),'mst: innsatsregel – 3 runder med snitt ≥ 40 % gir 💪, ikke ⭐');
  ok(R('isTopicUnlocked(1,1)'),'mst: 💪 åpner neste tema');
  ok(/💪/.test(R(`mstNext(1,'${A}')`).txt)&&/💪/.test(R(`mstGoalShort(1,'${A}')`))&&/mst-eff/.test(R('mstStarsHTML(0,null,false,1)')),'mst: 💪 vises i tips, på kartet og som stjerne');
  r=rr(1,A,4,8);ok(r.eff===false,'mst: 💪 meldes bare første gang');
  r=rr(1,A,6,8);ok(r.to===1&&!R(`topicEffort(1,'${A}')`),'mst: ⭐ etter 💪 – da er det en ekte stjerne');
  reset();rr(1,A,2,8);rr(1,A,3,8);r=rr(1,A,3,8);ok(r.to===0&&!r.eff,'mst: snitt 33 % gir ikke 💪');
  // Gamle lagringer: en ⭐ som allerede er gitt (f.eks. fra den gamle innsatsregelen), og ⭐⭐⭐ fra den gamle regelen, blir stående
  reset();ls.set('mh_learn',JSON.stringify({[`1:${A}`]:{r:[[D2,3,8],[D1,3,8],[D0,4,8]],s:1},[`1:${T1[1].id}`]:{r:[[D1,7,8],[D0,7,8]],s:3}}));
  ok(stars(1,A)===1&&R(`isTopicPassed(1,'${A}')`)&&!R(`topicEffort(1,'${A}')`),'mig: gammel innsats-⭐ beholdes');
  ok(stars(1,T1[1].id)===3,'mig: gammel ⭐⭐⭐ beholdes');rr(1,T1[1].id,0,8);ok(stars(1,T1[1].id)===3,'mig: gammel ⭐⭐⭐ tas ikke bort av en ny runde');
  reset();r=rr(1,A,7,7);ok(r.to===2,'mst: K.O.-runde 7/7 teller som ≥ 7/8');
  reset();r=rr(1,A,2,2);ok(r.to===0,'mst: en bitteliten runde (2 oppgaver) gir ingen stjerne');
  ok(R(`hasCrown(1,'${A}')`)===false,'mst: ingen krone uten trollet');
  // Bakoverkompatibelt getMastery
  reset();ok(R(`getMastery(1,'${A}')`)===0,'mst: getMastery 0 for nytt tema');
  rr(1,A,2,8);let m=R(`getMastery(1,'${A}')`);ok(m>0&&m<70,`mst: getMastery påbegynt (${m})`);
  rr(1,A,6,8);ok(R(`getMastery(1,'${A}')`)>=70,'mst: getMastery ≥ 70 ved ⭐');
  ok(R('mstStarsTxt(2)')==='⭐⭐☆','mst: mstStarsTxt');
  ok(/mst-star on/.test(R('mstStarsHTML(1,0)'))&&/ new/.test(R('mstStarsHTML(1,0)')),'mst: mstStarsHTML markerer ny stjerne');
  ok(R(`mstGoalShort(1,'${T1[1].id}')`)==='Ny!'&&R(`mstGoalShort(1,'${A}')`)==='2 stjerner til!','mst: kort tekst på kartet');

  // ---- 2) Gamle lagringer ----
  reset();
  ls.set(`mh_mst_1_${T1[0].id}`,'100');ls.set(`mh_mst_1_${T1[1].id}`,'70');ls.set(`mh_mst_1_${T1[3].id}`,'30');ls.set(`mh_mst_1_${T1[4].id}`,'0');
  ok(stars(1,T1[0].id)===3,'mig: gammel ≥ 100 gir ⭐⭐⭐');
  ok(stars(1,T1[1].id)===1,'mig: gammel ≥ 70 gir ⭐');
  ok(stars(1,T1[3].id)===0&&R(`topicStarted(1,'${T1[3].id}')`),'mig: gammel > 0 = påbegynt');
  ok(R('isTopicUnlocked(1,3)'),'mig: påbegynt tema holdes åpent selv om forrige ikke er bestått');
  ok(!R(`topicStarted(1,'${T1[4].id}')`),'mig: gammel 0 er ikke påbegynt');
  rr(1,T1[0].id,1,8);ok(stars(1,T1[0].id)===3&&ls.get(`mh_mst_1_${T1[0].id}`)==='100','mig: ny dårlig runde tar ikke bort gamle stjerner, gammel nøkkel er urørt');
  ls.set('mh_learn','{oops');let thr=null;try{stars(1,T1[0].id);}catch(e){thr=e;}ok(!thr&&stars(1,T1[0].id)===3,'mig: ødelagt mh_learn krasjer ikke');
  ls.set('mh_learn','[1,2]');ok(stars(1,T1[1].id)===1,'mig: mh_learn som liste tåles');
  reset();ls.set(`hs_1_${T1[2].id}`,JSON.stringify([{score:0,ko:false,date:'1.1.2026'}]));ok(R(`topicStarted(1,'${T1[2].id}')`),'mig: rekord i hs_ teller som påbegynt');
  R(`S.grade=1;S.topicId='${T1[2].id}'`);R('renderHS()');ok(/0\/10/.test(els['hs-rows'].innerHTML),'mig: gamle rekorder vises som x/10');

  // ---- 3) Opplåsing av temaer ----
  reset();
  ok(R('isTopicUnlocked(1,0)')&&!R('isTopicUnlocked(1,1)'),'unl: bare første tema er åpent');
  rr(1,T1[0].id,6,8);ok(R('isTopicUnlocked(1,1)')&&!R('isTopicUnlocked(1,2)'),'unl: neste tema åpnes med ⭐');
  reset();T2[1].optional=true;rr(2,T2[0].id,6,8);
  ok(R('isTopicUnlocked(2,1)')&&R('isTopicUnlocked(2,2)'),'unl: valgfritt tema stenger ikke veien');
  delete T2[1].optional;

  // ---- 4) Klassetrinn og boss ----
  reset();
  ok(!R('isGradeUnlocked(2)'),'grade: 2. klasse er låst i starten');
  T1.forEach(t=>{rr(1,t.id,8,8,D1);rr(1,t.id,8,8,D1);rr(1,t.id,8,8,D0);});
  ok(T1.every(t=>R(`isTopicMastered(1,'${t.id}')`)),'grade: alle temaer i 1. klasse mestret');
  ok(!R('isGradeUnlocked(2)'),'grade: omveien «alle mestret» åpner ikke 2. klasse – bossen må slås');
  ok(R('isBossUnlocked(1)'),'boss: åpnes når alle temaer har ⭐');
  ls.set('mh_boss_1','1');ok(R('isGradeUnlocked(2)'),'grade: seier over bossen åpner 2. klasse');
  reset();R("setSetting('startGrade',2)");ok(R('isGradeUnlocked(2)')&&!R('isGradeUnlocked(3)'),'grade: startGrade=2 åpner 2. klasse');
  reset();rr(2,T2[0].id,1,8);ok(R('isGradeUnlocked(2)'),'grade: fremgang i trinnet holder det åpent');
  reset();ls.set('mh_pg_seen',JSON.stringify(['g:2']));ok(R('isGradeUnlocked(2)'),'grade: et trinn som alt er vist åpent, forblir åpent');
  reset();T1.slice(0,-1).forEach(t=>rr(1,t.id,6,8));
  ok(!R('isBossUnlocked(1)'),'boss: låst når et tema mangler ⭐');
  T1[T1.length-1].optional=true;ok(R('isBossUnlocked(1)'),'boss: valgfritt tema teller ikke');
  delete T1[T1.length-1].optional;
  {const eff1=()=>ls.set('mh_learn',JSON.stringify(Object.assign(JSON.parse(ls.get('mh_learn')||'{}'),{[`1:${T1[1].id}`]:{r:[[D2,3,8],[D1,3,8],[D0,4,8]],s:0,eff:1}})));
   reset();T1.forEach((t,i)=>{if(i!==1)rr(1,t.id,6,8);});eff1();
   ok(!R('isBossUnlocked(1)'),'boss: 💪 teller ikke som ⭐ for bossen');
   reset();rr(1,T1[0].id,6,8);eff1();ok(R('isTopicUnlocked(1,2)')&&!R('isTopicUnlocked(1,3)'),'unl: 💪 åpner neste tema');
   ok(R('nextFight(1)').topic.id===T1[1].id,'unl: «Gå til kamp» øver videre på 💪-temaet (det er ikke ⭐)');}
  ok(R('bossVerdict({a:{ok:2,n:2},b:{ok:1,n:2}},9,9)')===true,'boss: 9 riktige og alle temaer med minst én riktig = seier');
  ok(R('bossVerdict({a:{ok:0,n:2},b:{ok:3,n:3}},10,9)')===false,'boss: et tema med bare feil = ikke seier');
  ok(R('bossVerdict({a:{ok:2,n:2}},8,9)')===false,'boss: under 75 % = ikke seier');

  // Kamp-simulering: svar riktig/feil (tåler A2s «prøv igjen» der S.answered er false etter første feil)
  const answer=right=>{
    for(let k=0;k<3;k++){
      const S=R('S'),qd=S.current;
      if(R('isChoiceQ(S.current)')){const key=R('choiceKey(S.current)'),w=qd.choices.map(String).find(c=>c!==key);R('submitChoice')(right?key:w,null);}
      else{els['ans-input'].value=String(right?(qd.ansTxt!=null?qd.ansTxt:qd.ans):qd.ans+1);R('submitAnswer()');}
      if(R('S.answered'))return;
    }
  };
  const fight=(rightFn,max=40)=>{for(let i=0;i<max&&!R('S.bossOver');i++){answer(rightFn(R('S.current')));R('handleNext()');}};

  reset();T1.forEach(t=>rr(1,t.id,6,8));
  R('startBoss(1)');ok(R('S.boss')&&R('S.bossQ')===12,'boss: ca. 12 oppgaver');
  {const P=[R('S.current.bossTid')].concat(R('S.bossPlan').map(i=>R('S.bossTopics')[i].id)),core=R('BOSS_CORE[1]'); // første oppgave er alt tatt fra planen
   ok(P.length===12&&core.every(id=>P.filter(x=>x===id).length===2)&&core.every(id=>P.slice(0,6).includes(id)&&P.slice(6).includes(id)),`boss: kjernetemaene 2 ganger, én i hver halvdel (${P})`);
   ok(new Set(P).size===8&&P.filter(x=>!core.includes(x)).length===4,'boss: de 4 andre plassene fordeles på de andre temaene');}
  fight(()=>true);
  let S=R('S');
  ok(S.bossOver&&S.enemyDefeated&&ls.get('mh_boss_1')==='1','boss: seier ved nok riktige lagres');
  ok(S.questions.length>=9&&S.questions.length<=12,`boss: seier etter ${S.questions.length} oppgaver`);
  ok(new Set(S.bossLog.filter(Boolean).map(x=>x.tid)).size>=6&&R('BOSS_CORE[1]').every(id=>S.bossStats[id]&&S.bossStats[id].n>=1),'boss: blander temaene, alle kjernetemaene er med');
  ok(S.bossLog.length===S.questions.length,'boss: hver oppgave logges én gang');
  ok(R('isGradeUnlocked(2)'),'boss: seier åpner neste trinn');

  // Et kjernetema med 0 av 2 = tap, selv om alt annet er riktig
  const K='sub20';
  reset();T1.forEach(t=>rr(1,t.id,6,8));
  R('startBoss(1)');fight(q=>q.bossTid!==K);
  S=R('S');
  ok(S.bossOver&&!S.enemyDefeated&&!ls.get('mh_boss_1'),'boss: tap når et kjernetema bare har feil (0 av 2)');
  ok(S.questions.length===12,'boss: bossen stikker av etter 12 oppgaver');
  ok(S.bossStats[K]&&S.bossStats[K].n===2&&S.bossStats[K].ok===0,`boss: kjernetemaet fikk 2 oppgaver (${JSON.stringify(S.bossStats[K])})`);
  {const ix=S.bossLog.map((x,i)=>x&&x.tid===K?i:-1).filter(i=>i>=0);ok(ix.length===2&&ix[1]-ix[0]>=2&&ix[1]-ix[0]<=3,`boss: et kjernetema med feil kommer igjen ca. 3 oppgaver senere (${ix})`);}
  ok(!S.questions.some(q=>q.revenge),'boss: ingen revansj');
  ok(R('bossWeakest()').id===K,'boss: svakeste tema velges');
  ok(els['br-btns'].innerHTML.includes(`bossPractice('${K}')`)&&/Øv på/.test(els['br-btns'].innerHTML),'boss: tap viser «Øv på <tema>»');
  ok(/Øv på/.test(els['br-sub'].innerHTML),'boss: tap forteller hva som skal øves');
  ok(!/XP/.test(els['br-rewards'].innerHTML),'boss: ingen XP-ord');

  reset();T1.forEach(t=>rr(1,t.id,6,8));
  R('startBoss(1)');fight(()=>false);
  S=R('S');ok(S.bossOver&&!S.enemyDefeated&&!ls.get('mh_boss_1')&&S.questions.length===12,'boss: alt feil = tap, ingen lagring');
  R('bossCleanup()');
  // Et tema som ikke er kjerne (1 oppgave) og er feil, stopper ikke seieren; ett kjernetema som får 1 av 2, er nok
  reset();T1.forEach(t=>rr(1,t.id,6,8));
  R('startBoss(1)');{let seenK=false;fight(q=>{if(q.bossTid===A)return false;if(q.bossTid==='eq1'&&!seenK){seenK=true;return false;}return true;});}
  S=R('S');ok(S.enemyDefeated&&S.bossStats.eq1&&S.bossStats.eq1.ok>=1,`boss: seier med et svakt tema utenom kjernen og 1 av 2 i et kjernetema (${JSON.stringify(S.bossStats[A])})`);
  R('bossCleanup()');
  // 2. klasse: replikkene lover ikke ganging (mul25 er valgfritt og ikke med i bossen)
  ok(!/gang/i.test(R('BOSSES[2].skills')+R('BOSSES[2].taunt')+R('BOSSES[2].ko'))&&!R('mstCore(2)').some(t=>t.id==='mul25'),'boss: 2.-klassebossen nevner ikke ganging');

  // ---- 5) «Trollet er tilbake!» ----
  const B=T1[1].id,C=T1[2].id,D5=day(-5),D7=day(-7),D9=day(-9);
  const master=(id,d)=>{rr(1,id,8,8,d[0]);rr(1,id,8,8,d[1]);rr(1,id,8,8,d[2]);}; // ⭐⭐⭐: tre runder på flere dager
  reset();ok(R('trollToday()')===null,'troll: ingen troll for ny spiller');
  reset();rr(1,A,6,8,D3);rr(1,A,7,8,D2);ok(R('trollToday()')===null,'troll: uten ⭐⭐⭐ kommer ikke trollet (ingen krone å vinne)');
  reset();master(A,[D2,D1,D0]);ok(R('trollToday()')===null,'troll: tema øvd i dag repeteres ikke i dag');
  reset();master(A,[D3,D2,D1]);ok(R('trollToday()')===null,'troll: tema øvd i går er ikke modent (minst 2 dager)');
  reset();master(A,[D5,D4,D3]);master(B,[D4,D3,D2]);rr(1,C,6,8,D9);
  let p=R('trollToday()');
  ok(p&&p.g===1&&p.ids[0]===A&&p.ids.includes(B)&&!p.ids.includes(C)&&p.mastered,`troll: velger modne mestrede temaer, eldst først: ${JSON.stringify(p)}`);
  ok(JSON.stringify(R('trollToday()'))===JSON.stringify(p),'troll: samme valg hele dagen');
  R('startTroll()');ok(R('S.troll')&&R('S.boss')&&R('S.bossQ')===6,'troll: 6 oppgaver');
  fight(()=>true);S=R('S');
  ok(S.bossOver&&S.enemyDefeated&&S.questions.length===6,`troll: seier etter alle 6 oppgavene (${S.questions.length})`);
  ok(!S.questions.some(q=>q.revenge||q.mini),'troll: ingen revansj eller minioppgave');
  ok(R(`hasCrown(1,'${A}')`)&&R(`hasCrown(1,'${B}')`),'troll: seier med alt riktig gir 👑 på temaene');
  ok(!ls.get('mh_boss_1'),'troll: lagrer ikke boss-seier');
  ok(R('trollToday()')===null,'troll: ferdig for i dag etter seier');
  ok(R(`mstLastDay(1,'${A}')`)===D0,'troll: repetisjonen teller som øvd i dag');
  rr(1,A,0,8);ok(R(`hasCrown(1,'${A}')`)&&stars(1,A)===3,'troll: kronen tas aldri bort');
  ok(R(`mstNext(1,'${A}')`).txt.includes('👑'),'troll: tipset viser kronen');
  R('bossCleanup()');
  // Etter krone: tidligst om 7 dager
  ls.delete('mh_review');{const L=JSON.parse(ls.get('mh_learn'));[A,B].forEach(id=>{L[`1:${id}`].rv=D3;L[`1:${id}`].cr=D3;L[`1:${id}`].r=L[`1:${id}`].r.map(x=>[D5,x[1],x[2]]);});ls.set('mh_learn',JSON.stringify(L));}
  ok(R('trollToday()')===null,'troll: tema med 👑 kommer ikke igjen før det har gått 7 dager');
  {const L=JSON.parse(ls.get('mh_learn'));L[`1:${A}`].rv=D7;L[`1:${A}`].cr=D7;L[`1:${A}`].r=L[`1:${A}`].r.map(x=>[D9,x[1],x[2]]);ls.set('mh_learn',JSON.stringify(L));}
  p=R('trollToday()');ok(p&&p.ids.length===1&&p.ids[0]===A&&!p.mastered,`troll: 7 dager etter 👑 er temaet modent igjen (ingen ny krone å vinne): ${JSON.stringify(p)}`);
  R('startTroll()');fight(()=>true);ok(R('S.enemyDefeated')&&/husker fortsatt/.test(els['br-sub'].innerHTML),'troll: seier uten ny krone sier at barnet husker');
  R('bossCleanup()');

  // Tap: temaer med feil får ikke ny repetisjonsdag, men «✨ Puss opp» og kommer først neste dag
  reset();master(A,[D5,D4,D3]);master(B,[D5,D4,D2]);
  R('startTroll()');fight(q=>q.bossTid!==A);S=R('S');
  ok(S.bossOver&&!S.enemyDefeated&&S.questions.length===6,'troll: tap etter 6 oppgaver');
  ok(!R(`hasCrown(1,'${A}')`)&&!R(`hasCrown(1,'${B}')`),'troll: tap gir ingen krone');
  ok(R(`mstGet(1,'${A}')`).pu===D0&&R(`mstGet(1,'${A}')`).rv!==D0&&R(`mstLastDay(1,'${A}')`)===D3,'troll: glemt tema får «Puss opp», ikke ny repetisjonsdag');
  ok(R(`mstGet(1,'${B}')`).rv===D0&&!R(`mstGet(1,'${B}')`).pu,'troll: husket tema får ny repetisjonsdag');
  ok(R('trollToday()')!==null,'troll: etter tap kan barnet prøve igjen');
  ok(/bossRetry/.test(els['br-btns'].innerHTML),'troll: tap viser «Prøv igjen»');
  R('bossCleanup()');
  ls.delete('mh_review');{const L=JSON.parse(ls.get('mh_learn'));L[`1:${A}`].pu=D1;ls.set('mh_learn',JSON.stringify(L));}
  master(C,[D9,D9,D7]);
  p=R('trollToday()');ok(p&&p.ids[0]===A&&p.pu&&p.pu.includes(A)&&!p.ids.includes(B),`troll: neste dag kommer det glemte temaet først med «Puss opp» (husket tema venter 2 dager): ${JSON.stringify(p)}`);
  R('trollDecorate("grades")');ok(/Puss opp/.test(els['troll-offer-g']?els['troll-offer-g'].innerHTML:''),'troll: tilbudet viser «✨ Puss opp»');
  // Krone krever 2 av 2 på temaets trolloppgaver
  R('startTroll()');{let missC=false;fight(q=>{if(q.bossTid===C&&!missC){missC=true;return false;}return true;});}S=R('S');
  ok(S.enemyDefeated&&R(`hasCrown(1,'${A}')`)&&!R(`hasCrown(1,'${C}')`)&&R(`mstGet(1,'${C}')`).pu===D0,`troll: seier med 5 av 6 gir 👑 bare der alt var riktig (${JSON.stringify(S.bossStats)})`);
  ok(/alle riktige gir 👑/.test(els['br-sub'].innerHTML),'troll: forteller hvorfor kronen mangler');
  ok(!R(`mstGet(1,'${A}')`).pu,'troll: «Puss opp» fjernes når temaet huskes');
  R('bossCleanup()');

  // ---- 6) Vanlig runde: kiste, resultat og rekorder ----
  const round=rightFn=>{R(`startGame(1,'${A}')`);for(let i=0;i<30&&!R(`!!mstGet(1,'${A}')`);i++){answer(rightFn());R('handleNext()');}};
  reset();round(()=>true);
  const e=R(`mstGet(1,'${A}')`);
  ok(e&&e.r.length===1&&e.r[0][1]===e.r[0][2]&&e.r[0][0]===D0,`round: runden lagres i mh_learn: ${JSON.stringify(e)}`);
  ok(stars(1,A)===2,'round: feilfri runde gir ⭐⭐');
  ok(/mst-star on/.test(els['chest-sub'].innerHTML)&&!/mestring|%/.test(els['chest-sub'].innerHTML+els['chest-rewards'].innerHTML),'round: kista viser stjerner, ikke prosent');
  ok(!/XP/.test(els['chest-rewards'].innerHTML),'round: kista har ikke XP-ord');
  R('closeChest()');
  ok(/mst-star on/.test(els['res-stars'].innerHTML),'round: resultatsiden viser temaets stjerner');
  const hs=JSON.parse(ls.get(`hs_1_${A}`)||'[]');ok(hs.length===1&&hs[0].c===hs[0].n&&hs[0].score===10,'round: rekord med c/n');
  ok(/ av /.test(els['hs-rows'].innerHTML),'round: rekord vises som «x av n»');
  thr=null;try{R('showParentReport()');}catch(x){thr=x;}
  ok(!thr&&/⭐⭐☆/.test(els['pr-stars'].textContent)&&/Neste mål/.test(els['pr-rec'].textContent+els['pr-rec'].innerHTML),`round: foreldrerapporten viser temaets stjerner og neste mål: ${thr&&thr.message}`);
  reset();round(()=>false);R('closeChest()');
  ok(stars(1,A)===0,'round: alt feil gir ingen stjerne');
  ok(els['mst-res'].innerHTML.includes(`showLearn(1,'${A}')`)&&els['mst-res'].innerHTML.includes('retrySession()'),'round: under 50 % vises «Se hvordan» og «Prøv igjen»');

  // ---- 7) fmtSub bruker EXTRA_SUBS først ----
  R('window.__mstX=window.EXTRA_SUBS;window.EXTRA_SUBS=Object.assign({},window.__mstX||{},{zz_mst:"Testnavn"})');
  ok(R("fmtSub('zz_mst')")==='Testnavn','fmtSub: EXTRA_SUBS brukes');
  ok(R("fmtSub('a20o')")==='Over tieren (f.eks. 8 + 5)','fmtSub: vanlige navn virker fortsatt');
  R('if(window.__mstX===undefined)delete window.EXTRA_SUBS;else window.EXTRA_SUBS=window.__mstX;delete window.__mstX');

  // ---- 8) Kartene bygges uten feil med gamle og nye lagringer ----
  reset();ls.set(`mh_mst_1_${A}`,'120');rr(1,B,7,8,D1);rr(1,B,7,8,D1);rr(1,B,7,8,D0);R(`mstSetCrown(1,'${B}')`);
  thr=null;try{R('buildGradeMap();buildTopicMap(1);buildTopicMap(2);pgGoalCard();')}catch(x){thr=x;}
  ok(!thr,`maps: kartene bygges uten feil: ${thr&&thr.message}`);
  ok(R('getGradeStars(1)')!=='○○○'&&R('getWorldStars([1,2])')!=='○○○','maps: stjerner for trinn og verden');
  ok(R('mstGradeCount(1)').s===6&&R('mstGradeCount(1)').cr===1,'maps: telling av stjerner og kroner');
  reset();R('S={grade:null,topicId:null,topic:null,questions:[],idx:0,score:0,streak:0,combo:0,current:null,answered:false,enemyHp:100,playerHp:100,enemyDefeated:false}');
};
