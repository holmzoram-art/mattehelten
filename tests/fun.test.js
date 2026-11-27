// Mattehelten – tester for «Gøy hver dag» (D): rang fra boss-seire, ingen tap av rang, helten forblir helten,
// mynter per svar, kiste og «Ny rekord!», vekstmerker, spilledager, «Dagens økt» og monster per tema.
module.exports=function({R,ok,CUR,ls,els}){
  const day=o=>R(`mhDay(${o})`),D0=day(0),D1=day(-1),D3=day(-3);
  const reset=()=>{ls.clear();R('prog={xp:0,coins:0,streak:0,lastDay:""};unlockedAchievements={};pendingEvolution=null');};
  const xpFor=L=>40*L*(L-1); // første XP på nivå L (lvlFor(l)=l*80)
  const boss=(...gs)=>gs.forEach(g=>ls.set('mh_boss_'+g,'1'));
  const answer=right=>{ // svar på S.current (valg eller tall); prøver på nytt hvis oppgaven ikke er ferdig
    for(let k=0;k<3;k++){
      const qd=R('S.current');
      if(R('isChoiceQ(S.current)')){const key=R('choiceKey(S.current)'),w=qd.choices.map(String).find(c=>c!==key);R('submitChoice')(right?key:w,null);}
      else{els['ans-input'].value=String(right?(qd.ansTxt!=null?qd.ansTxt:qd.ans):qd.ans+1);R('submitAnswer()');}
      if(R('S.answered'))return;
    }
  };
  const round=(g,id,rightFn)=>{R(`startGame(${g},'${id}')`);for(let i=0;i<30&&!R(`S.questions.length>=loopMaxQ()&&S.answered`);i++){answer(rightFn(i));if(!(R('S.questions.length>=loopMaxQ()')))R('handleNext()');}R('handleNext()');};
  const fight=(g,rightFn)=>{R(`startBoss(${g})`);for(let i=0;i<40&&!R('S.bossOver');i++){answer(rightFn(i));R('handleNext()');}};

  // ---- 1) Rang fra boss-seire: Lærling → Kriger (1) → Mester (2) → Legende (4) → Mattegud (alle) ----
  reset();
  ok([0,1,2,3,4,9,10].map(n=>R(`funBossTier(${n})`)).join()==='0,1,2,2,3,3,4','rank: trinn fra antall boss-seire (0,1,2,4,alle)');
  ok(R('funTier()')===0&&/^Lærling/.test(R('getRank().name')),'rank: ny spiller er Lærling');
  boss(1);ok(R('funTier()')===1&&/^Kriger/.test(R('getRank(99).name')),'rank: 1 boss gir Kriger (nivå teller ikke)');
  boss(2);ok(R('funTier()')===2&&/^Mester/.test(R('getRank().name')),'rank: 2 bosser gir Mester');
  boss(3);ok(R('funTier()')===2,'rank: 3 bosser er fortsatt Mester');
  boss(4);ok(R('funTier()')===3&&/^Legende/.test(R('getRank().name')),'rank: 4 bosser gir Legende');
  boss(5,6,7,8,9);ok(R('funTier()')===3,'rank: 9 bosser er fortsatt Legende');
  boss(10);ok(R('funTier()')===4&&/^Mattegud/.test(R('getRank().name')),'rank: alle bosser gir Mattegud');
  ok(R('RANKS').every(r=>r.name&&r.gift&&r.desc&&r.color),'rank: alle ranger har navn, gave og tekst');
  // XP alene gir ikke rang lenger
  reset();R(`prog.xp=${xpFor(12)}`);ls.set('mh_rank','0');ok(R('curLvl()')===12&&R('funTier()')===0,'rank: nivå 12 uten boss gir ikke ny rang');

  // ---- 2) Ingen tap av rang + migrering fra XP-nivå ----
  reset();R(`prog.xp=${xpFor(8)}`);ok(R('funRankInit()')===true&&ls.get('mh_rank')==='3','mig: gammel lagring på nivå 8 beholder Legende');
  ok(R('funRankInit()')===false&&ls.get('mh_rank')==='3','mig: migrering skjer bare én gang');
  boss(1);ok(R('funTier()')===3&&R('funRankUp()')===null&&ls.get('mh_rank')==='3','mig: boss-seier senker ikke en høyere rang');
  R('checkEvolution()');ok(R('pendingEvolution')===null,'mig: ingen «sterkere»-skjerm når rangen ikke stiger');
  reset();R(`prog.xp=${xpFor(12)}`);R('funRankInit()');ok(ls.get('mh_rank')==='4'&&R('funTier()')===4,'mig: nivå 12 beholder Mattegud');
  reset();R(`prog.xp=${xpFor(2)}`);R('funRankInit()');ok(ls.get('mh_rank')==='0','mig: lavt nivå starter som Lærling');
  reset();boss(1,2);R('funRankInit()');ok(ls.get('mh_rank')==='2','mig: boss-seire teller ved migrering');
  ls.set('mh_rank','oops');ok(R('funTier()')===2,'mig: ødelagt mh_rank krasjer ikke');

  // ---- 3) Helten forblir helten + «sterkere»-skjermen ----
  reset();
  ok(R('CHARS').every((c,i)=>R(`getCharEmoji(${i},1)`)===c.emoji&&R(`getCharEmoji(${i},50)`)===c.emoji),'hero: samme emoji på alle nivåer');
  ls.set('mh_rank','4');ok(R('CHARS').every((c,i)=>R(`getCharEmoji(${i},12)`)===c.emoji),'hero: samme emoji som Mattegud');
  ok(R("typeof EVOLUTIONS")==='undefined','hero: ingen evolusjon til nye emojier');
  reset();ls.set('mh_player',JSON.stringify({emoji:'🐉',name:'Mio'}));ok(R('getCharIdx()')===6,'hero: gammel lagring uten mh_char_idx finner helten fra emojien');
  reset();ls.set('mh_rank','0');boss(1);R('checkEvolution(1,9)');
  let pe=R('pendingEvolution');ok(pe&&pe.from===0&&pe.to===1&&/^Kriger/.test(pe.rank.name)&&ls.get('mh_rank')==='1','evo: første boss gir Kriger-skjerm og lagrer rangen');
  R('pendingEvolution=null');R('checkEvolution()');ok(R('pendingEvolution')===null,'evo: samme rang vises ikke to ganger');
  R('pendingEvolution={from:0,to:1,rank:RANKS[1]}');R('showEvolution()');
  ok(els['evo-old'].textContent===els['evo-new'].textContent&&els['evo-new'].textContent===R('CHARS[getCharIdx()].emoji'),'evo: samme helt før og etter');
  ok(/glød/.test(els['evo-rank-text'].textContent)&&R('pendingEvolution')===null,'evo: forteller hva helten fikk');
  const fake=R('globalThis.__el={a:{},setAttribute(k,v){this.a[k]=String(v)},removeAttribute(k){delete this.a[k]}}');
  R('funDecor(__el,3)');ok(fake.a['data-fun-tier']==='3','decor: data-fun-tier settes');
  R('funDecor(__el,0)');ok(!('data-fun-tier' in fake.a),'decor: Lærling har ingen pynt');
  ls.set('mh_rank','2');R('applyHeroDecor(__el)');ok(fake.a['data-fun-tier']==='2','decor: applyHeroDecor gir rangpynt');
  R('applyHeroDecor(__el,{tier:4})');ok(fake.a['data-fun-tier']==='4','decor: applyHeroDecor med eget trinn (sterkere-skjermen)');
  // Boss-seier i spillet gir rang og «sterkere»-skjerm
  reset();ls.set('mh_rank','0');CUR[1].topics.forEach(t=>R(`recordRound(1,'${t.id}',6,8)`));
  fight(1,()=>true);
  ok(R('isBossDefeated(1)')&&ls.get('mh_rank')==='1'&&R('pendingEvolution')&&R('pendingEvolution').to===1,'boss: seier gir Kriger og venter med «sterkere»-skjermen');
  const bx=R("globalThis.__bx={h:'',insertAdjacentHTML(p,h){this.h=h+this.h;}}");R('funFight(true,1,__bx)');
  ok(/Ny rang/.test(bx.h)&&/Kriger/.test(bx.h),'boss: ny rang vises i resultatet');
  R('bossCleanup()');R('pendingEvolution=null');

  // ---- 4) Mynter per svar: 2 i tema som ikke er mestret, 1 i mestret, 0 på andre forsøk ----
  const q=()=>({q:'3 + 4 = ?',ans:7,sub:'3+4',type:'Pluss',ops:{a:3,b:4,op:'+'}});
  const sub=(raw,g,id)=>{R(`S={grade:${g},topicId:'${id}',topic:CUR[${g}].topics.find(t=>t.id==='${id}'),questions:[],idx:0,score:0,streak:0,combo:0,current:null,answered:false,enemyHp:100,playerHp:100,enemyDefeated:false}`);R('S').current=q();els['ans-input'].value=raw;R('submitAnswer()');};
  reset();let c0=R('prog.coins');sub('7',1,'add10');ok(R('prog.coins')-c0===2&&R('S.funCoins')===2,'coins: 2 🪙 for riktig i tema som ikke er mestret');
  c0=R('prog.coins');sub('9',1,'add10');ok(R('prog.coins')===c0&&!R('S.answered'),'coins: feil svar gir ingen mynter (nytt forsøk)');
  els['ans-input'].value='7';R('submitAnswer()');ok(R('prog.coins')===c0&&R('S.questions[0].fixed')===true,'coins: riktig på andre forsøk gir 0 🪙');
  ok(R("mhLoad('mh_fun',{}).fix")===1&&R("mhLoad('mh_fun',{}).fx")===1,'coins: «rettet selv» telles');
  R(`recordRound(1,'add10',7,8,'${D1}')`);R(`recordRound(1,'add10',8,8,'${D0}')`);ok(R("isTopicMastered(1,'add10')"),'coins: add10 er mestret');
  c0=R('prog.coins');sub('7',1,'add10');ok(R('prog.coins')-c0===1,'coins: 1 🪙 i mestret tema');
  ok(R("funAnswerCoins(1,'sub10')")===2&&R("funAnswerCoins(1,'add10')")===1,'coins: funAnswerCoins');
  ok(!R('unlockedAchievements.coins50')&&!R('unlockedAchievements.coins100'),'coins: ingen myntmerker');
  R('prog.coins=500');R("unlockAchievement('coins50')");ok(!R('unlockedAchievements.coins50'),'badge: myntmerker deles ikke ut lenger');

  // ---- 5) Kista: mynter for læring, ny stjerne og «Ny rekord!», enkel kiste i 1.–2. klasse ----
  reset();c0=R('prog.coins');round(1,'sub10',()=>true);
  let Q=R('S.questions'),ok1=Q.filter(x=>x.ok).length,res=R("mstGet(1,'sub10')");
  ok(res&&R("topicStars(1,'sub10')")===2,'chest: feilfri første runde gir ⭐⭐');
  const day1=R('prog.days'),bonusDay=5;
  ok(R('prog.coins')-c0===ok1*2+2*5+bonusDay,`chest: mynter = 2 per riktig + 5 per ny ⭐ + dagbonus (${R('prog.coins')-c0})`);
  ok(new RegExp(`\\+${ok1*2+10}<`).test(els['chest-rewards'].innerHTML),'chest: kista viser alle myntene fra runden');
  ok(!/✨|✅/.test(els['chest-rewards'].innerHTML)&&!/rekord/.test(els['chest-rewards'].innerHTML),'chest: 1.–2. klasse: bare mynter (ingen XP/tall), ingen rekord første gang');
  R('closeChest()');
  // Ny rekord: slår beste runde i temaet
  reset();ls.set('hs_1_sub10',JSON.stringify([{score:6,date:'1.1.2026'}]));c0=R('prog.coins');round(1,'sub10',()=>true);
  ok(/Ny rekord/.test(els['chest-rewards'].innerHTML),'chest: «Ny rekord!» når runden slår beste');
  ok(R('prog.coins')-c0===16+10+5+5,`chest: rekord gir +5 🪙 (${R('prog.coins')-c0})`);
  R('closeChest()');
  reset();ls.set('hs_1_sub10',JSON.stringify([{score:10,date:'1.1.2026'}]));round(1,'sub10',()=>true);ok(!/rekord/.test(els['chest-rewards'].innerHTML),'chest: ingen rekord når beste ikke slås');
  R('closeChest()');
  // Mestret tema gir halvparten
  reset();R(`recordRound(1,'sub10',7,8,'${D1}')`);R(`recordRound(1,'sub10',8,8,'${D3}')`);R(`recordRound(1,'sub10',8,8,'${D1}')`);ok(R("isTopicMastered(1,'sub10')"),'chest: sub10 mestret');
  R(`prog.lastDay='${D0}'`);c0=R('prog.coins');round(1,'sub10',()=>true);ok(R('prog.coins')-c0===8,`chest: feilfri runde i mestret tema gir 8 🪙 (${R('prog.coins')-c0})`);
  R('closeChest()');
  // Større klasser: full kiste
  reset();round(3,CUR[3].topics[0].id,()=>true);ok(/✅/.test(els['chest-rewards'].innerHTML)&&/✨/.test(els['chest-rewards'].innerHTML),'chest: 3. klasse viser fortsatt tall');
  R('closeChest()');

  // ---- 6) Vekstmerker ----
  reset();ok(R('funCheckBadges()').length===0,'badge: ingen merker for ny spiller');
  R("mhSave('mh_fun',{fix:9,rev:10})");let got=R('funCheckBadges(true)');ok(got.includes('g_rev10')&&!got.includes('g_fix10'),'badge: 10 revansjer gir merke, 9 rettet gir ikke');
  R("mhSave('mh_fun',{fix:10,rev:10})");ok(R('funCheckBadges(true)').join()==='g_fix10'&&R('unlockedAchievements.g_fix10'),'badge: rettet selv 10 ganger');
  reset();R(`recordRound(1,'add10',7,8,'${D1}')`);R(`recordRound(1,'add10',8,8,'${D0}')`);got=R('funCheckBadges()');ok(got.includes('g_star3')&&!got.includes('g_master3'),'badge: første ⭐⭐⭐');
  CUR[1].topics.slice(0,5).forEach(t=>R(`recordRound(1,'${t.id}',6,8)`));ok(R('funCheckBadges()').includes('g_pass5'),'badge: 5 temaer bestått');
  boss(2);ok(R('funCheckBadges()').includes('g_boss1'),'badge: første boss (alle klassetrinn)');
  R('prog.days=5');ok(R('funCheckBadges()').includes('g_days5'),'badge: 5 spilledager');
  ok(R('funCheckBadges()').length===0,'badge: samme merke gis ikke to ganger');
  ok(['g_fix10','g_rev10','g_pass5','g_stars15','g_star3','g_master3','g_boss1','g_days5'].every(id=>R('ACHIEVEMENTS')[id]),'badge: alle vekstmerker finnes i BADGES');
  ls.set('mh_ach',JSON.stringify({coins50:1}));R("unlockedAchievements=JSON.parse(localStorage.getItem('mh_ach'))");R('openBadges()');
  ok(/1 \/ /.test(els['badge-count'].textContent)&&+els['badge-count'].textContent.split('/ ')[1]===R('BADGES.length')-1,'badge: gammelt myntmerke vises for dem som har det, det andre skjules');

  // ---- 7) Spilledager 🌙: telles, nullstilles aldri, bonus per ny dag ----
  reset();let st=R('pgStreakTick()');ok(st.n===1&&st.bonus===5&&R('prog.days')===1,'days: første dag');
  ok(R('pgStreakTick()')===null&&R('prog.days')===1,'days: samme dag teller én gang');
  R(`prog.lastDay='${D3}'`);st=R('pgStreakTick()');ok(st.n===2&&R('prog.days')===2,'days: pause på flere dager nullstiller ikke');
  R(`prog.days=6;prog.lastDay='${D3}'`);st=R('pgStreakTick()');ok(st.n===7&&st.bonus===15,'days: bonus som før (15 fra dag 7)');
  ok(/🌙/.test(R('pgStreakHTML({n:3,bonus:10})'))&&!/på rad|🔥/.test(R('pgStreakHTML({n:3,bonus:10})')),'days: 🌙 spilledag, ikke «på rad»');
  R('renderHUD()');ok(String(els['hud-streak'].textContent)==='7','days: HUD viser spilledager');
  // Gamle lagringer: prog.streak er startverdi
  reset();R(`prog={xp:0,coins:5,streak:6,lastDay:'${D3}'}`);ok(R('funDaysInit()')===true&&R('prog.days')===6,'days: gammel streak blir startverdi');
  ok(R('funDaysInit()')===false&&R('prog.days')===6,'days: migrering bare én gang');
  reset();R(`prog={xp:0,coins:5,streak:1,lastDay:'${D0}'}`);ls.set('mh_stats',JSON.stringify({[D3]:{n:8,ok:6},[day(-5)]:{n:4,ok:2},[D0]:{n:3,ok:3}}));R('funDaysInit()');ok(R('prog.days')===3,'days: dager i mh_stats teller når de er flere');
  reset();R(`prog={xp:0,coins:5,streak:2,lastDay:'${D1}'}`);ls.set('mh_prog3',JSON.stringify(R('prog')));R('funDaysInit()');ok(JSON.parse(ls.get('mh_prog3')).days===2&&JSON.parse(ls.get('mh_prog3')).streak===2,'days: lagres additivt (streak beholdes)');

  // ---- 8) Dagens økt: etter getSetting('session') runder, én gang per grense (4, 8, …) ----
  reset();
  const done=n=>{for(let i=0;i<n;i++)R('funRoundDone(null)');};
  done(3);ok(R('funSessionDue()')===0,'økt: ikke etter 3 runder');
  done(1);ok(R('funSessionDue()')===4,'økt: grense etter 4 runder');
  ok(R('funShowDay()')===true&&R('funSessionDue()')===0&&R("mhLoad('mh_fun',{}).sh")===4,'økt: vises én gang ved 4');
  ok(R('funShowDay()')===false,'økt: vises ikke to ganger ved samme grense');
  done(3);ok(R('funSessionDue()')===0,'økt: ikke ved 7');
  done(1);ok(R('funSessionDue()')===8,'økt: neste grense ved 8');
  reset();R("setSetting('session',2)");done(2);ok(R('funSessionDue()')===2,'økt: følger innstillingen (2 runder)');
  R("setSetting('session','tull')");ok(R('funSessionLen()')===4,'økt: ugyldig innstilling gir 4');
  reset();R(`mhSave('mh_fun',{day:'${D1}',r:9,sh:8,st:3,fx:2,up:{'1:add10':[0,2]},fix:5,rev:1})`);
  ok(R('funState().r')===0&&R('funState().fix')===5&&R('funSessionDue()')===0,'økt: ny dag starter på 0 runder (totalene beholdes)');
  // Ekte runder teller, og sammendraget bruker mh_learn/mh_stats
  reset();round(1,'add10',()=>true);R('closeChest()');round(1,'sub10',i=>i!==2);R('closeChest()');
  const fs=R('funState()');ok(fs.r===2&&fs.st>=3&&fs.up['1:add10']&&fs.up['1:sub10'],`økt: runder og nye stjerner telles (${JSON.stringify(fs)})`);
  const td=R('funToday()');ok(td.stars===fs.st&&td.up.length===2&&td.ok>=15&&td.played.length===2,`økt: sammendraget (${JSON.stringify({s:td.stars,u:td.up.length,ok:td.ok,p:td.played.length})})`);
  R("setSetting('session',2)");ok(R('funShowDay()')===true&&/nye stjerner/.test(els['fun-day'].innerHTML)&&/Ferdig for i dag/.test(els['fun-day'].innerHTML)&&/Én runde til/.test(els['fun-day'].innerHTML),'økt: sammendrag med to knapper');
  ok(!/undefined|NaN|null/.test(els['fun-day'].innerHTML),'økt: ingen rare ord i sammendraget');
  R('funDayDone()');R('funDayEnd()');R('funDayMore()');ok(true,'økt: knappene krasjer ikke');
  // Boss og troll teller også som runder
  reset();R('funFight(true,1,null)');ok(R('funState().r')===1,'økt: bosskamp teller som runde');

  // ---- 9) Monster per tema ----
  const M=R('FUN_MONSTERS');
  [1,2].forEach(g=>CUR[g].topics.forEach(t=>{const m=R(`funMonster(${g},'${t.id}')`);ok(m&&m.e&&m.n&&m.a&&M[t.id],`mon: ${t.id} har eget monster`);ok(m.e!==t.icon,`mon: ${t.id} monster er ikke temaikonet`);}));
  const es=[1,2].flatMap(g=>CUR[g].topics.map(t=>M[t.id].e));ok(new Set(es).size===es.length,'mon: ulike monstre i 1.–2. klasse');
  ok(Object.values(M).every(m=>m.n.length<=16&&!/XP|undefined/.test(m.n)),'mon: korte navn');
  const f5=R(`funMonster(5,'${CUR[5].topics[0].id}')`);ok(f5.e===R('ENEMIES[5]')&&f5.n==='Komma-dinoen','mon: reserve per klassetrinn');
  R("startGame(1,'sub10')");ok(els['enemy-avatar'].textContent==='🐭'&&els['enemy-name'].textContent==='Minus-musa','mon: kampen viser temaets monster');
  // Merke på temanoden
  const node=R("globalThis.__n={h:'',querySelector(){return {insertAdjacentHTML:(p,h)=>{__n.h+=h;}};}}");
  R("funNodeMonster(__n,1,'add10',true)");ok(/fun-node-mon/.test(node.h)&&/🐛/.test(node.h)&&!/fun-shadow/.test(node.h),'mon: merke på åpen temanode');
  R("__n.h='';funNodeMonster(__n,1,'clock1',false)");ok(/fun-shadow/.test(R('__n.h')),'mon: låst tema viser monsteret i skyggen');
  ok(!(()=>{try{R('buildTopicMap(1);buildTopicMap(2);buildTopicMap(5)');return false;}catch(e){return true;}})(),'mon: buildTopicMap krasjer ikke');

  // ---- 10) Ikke ordet «XP» for barnet ----
  reset();R(`prog.xp=${xpFor(3)+5}`);R('pgLvlSeen=1');R('pgLevelUp()');ok(!/XP/.test(els['pg-lvl-sub'].textContent)&&/nivå 4/.test(els['pg-lvl-sub'].textContent),`xp: NIVÅ OPP uten XP (${els['pg-lvl-sub'].textContent})`);
  R('pgHud()');ok(!/XP/.test(els['pg-hud-goal'].textContent),'xp: HUD-målet uten XP');
  R('pgLvlClose()');
  reset();
};
