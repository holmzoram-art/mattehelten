// Mattehelten – tester for feiringene (D2, bølge 3b): nivåkurven (sjeldnere nivåer, ingen mister nivå), NIVÅ OPP som toast,
// banner-logikken for nye temaer (spilte temaer feires ikke, flere slås sammen), «Dagens økt» med alle temaer, monsteret i kista
// og gullkronen som skal fly inn på temanoden.
module.exports=function({R,ok,CUR,ls,els}){
  const day=o=>R(`mhDay(${o})`),D0=day(0),D1=day(-1);
  const reset=()=>{ls.clear();R('prog={xp:0,coins:0,streak:0,lastDay:""};unlockedAchievements={};pendingEvolution=null;pgEvoHeld=null;pgMst={};pgCrownWait={}');};
  const oldXp=L=>40*L*(L-1); // første XP på nivå L med den gamle kurven (l·80)
  const newXp=L=>80*L*(L-1); // … og med den nye (l·160)
  const fresh=()=>{reset();R('curLvl()');}; // ny spiller: lv0 settes før det finnes XP (som ved oppstart)

  // ---- 1) Nivåkurven: sjeldnere nivåer for nye spillere, ingen mister nivå ----
  reset();
  ok(R('curLvl()')===1&&R('prog.lv0')===1,'xp: ny spiller starter på den nye kurven');
  ok(R('lvlFor(1)')===160&&R('lvlFor(4)')===640,'xp: et nivå koster l·160');
  R(`prog.xp=${newXp(2)}`);ok(R('curLvl()')===2,'xp: nivå 2 etter 160');
  R(`prog.xp=${newXp(5)-1}`);ok(R('curLvl()')===4,'xp: like før nivå 5');
  R(`prog.xp=${newXp(5)}`);ok(R('curLvl()')===5&&R('xpInLvl()')===0,'xp: nivå 5 ved 1600');
  // Ida: 12 runder à ca. 190 ✨ ga nivå 8 med den gamle kurven – nå færre nivåer
  fresh();R(`prog.xp=${12*190}`);ok(R('curLvl()')<=6&&R(`pgLvlOld(${12*190})`)===8,`xp: 12 runder gir nivå ${R('curLvl()')} (før 8)`);
  // Gamle lagringer beholder nivået og fremgangen i nivået
  reset();R(`prog.xp=${oldXp(8)}`);ok(R('curLvl()')===8&&R('xpInLvl()')===0&&R('prog.lv0')===9,'xp: gammel lagring på nivå 8 forblir nivå 8');
  ok(R('lvlFor(8)')===640&&R('lvlFor(9)')===1440,'xp: nivået du står på koster som før, de neste etter ny kurve');
  reset();R(`prog.xp=${oldXp(8)+300}`);ok(R('curLvl()')===8&&R('xpInLvl()')===300,'xp: fremgangen i nivået er den samme som før');
  R(`prog.xp+=${640-300}`);ok(R('curLvl()')===9,'xp: neste nivå kommer som før');
  R('prog.xp+=1439');ok(R('curLvl()')===9,'xp: nivå 10 koster mer enn før');
  R('prog.xp+=1');ok(R('curLvl()')===10,'xp: nivå 10 etter 1440 til');
  // lv0 lagres i mh_prog3 og tåles ødelagt
  reset();R(`prog.xp=${oldXp(5)+10}`);R('curLvl()');R('saveProg()');ok(JSON.parse(ls.get('mh_prog3')).lv0===6,'xp: lv0 lagres additivt');
  R('prog=mhProg()');R(`prog.xp+=${5*80}`);ok(R('curLvl()')===6,'xp: lv0 overlever ny innlasting');
  R("prog.lv0='tull'");R(`prog.xp=${oldXp(5)}`);ok(R('curLvl()')===5,'xp: ødelagt lv0 regnes ut på nytt uten tap');
  reset();R(`prog.xp=${oldXp(3)+5}`);ok(R('pgLvlAt(prog.xp).l')===R('curLvl()'),'xp: kista og HUD bruker samme kurve');

  // ---- 2) NIVÅ OPP er en toast: kommer av seg selv, venter ikke på trykk, holder ikke «sterkere» tilbake ----
  fresh();R(`prog.xp=${newXp(3)+5}`);R('pgLvlSeen=1');
  const pr=R('pgLevelUp()');ok(pr&&typeof pr.then==='function'&&R('pgLvlSeen')===3,'lvl: pgLevelUp viser nivået og gir et ferdig løfte');
  ok(/Nivå 3/.test(els['pg-lvl-num'].textContent)&&!/XP/.test(els['pg-lvl-num'].textContent+els['pg-lvl-sub'].textContent),'lvl: toasten viser nivået uten «XP»');
  ok(R('pgLevelUp()')&&R('pgLvlSeen')===3,'lvl: samme nivå vises ikke to ganger');
  R('pgLvlSeen=1;pgEvoHeld={from:0,to:1,rank:RANKS[1]};pendingEvolution=null');R('pgLevelUp()');
  ok(R('pgEvoHeld')===null&&R('pendingEvolution')===null&&/Kriger/.test(els['evo-rank-badge'].textContent),'lvl: «sterkere» kommer med en gang (venter ikke på NIVÅ OPP)');
  R('pgLvlClose()');
  ok(!/pg-lvl/.test(R('pgBlocked.toString()')),'lvl: toasten stopper ikke seremoniene på kartet');
  // Boss-seier: nivået står i resultatet, ingen NIVÅ OPP oppå seieren
  fresh();R(`prog.xp=${newXp(4)}`);R('pgLvlSeen=2');R('pgBossResult(false,1,false)');ok(R('pgLvlSeen')===4,'lvl: bossresultatet viser nivået selv');

  // ---- 3) «Nytt tema låst opp!»: spilte temaer feires ikke, flere nye deler ett banner ----
  const T=CUR[1].topics,id=i=>T[i].id;
  reset();ls.set('mh_pg_seen','[]');
  ok(JSON.stringify(R('pgUnlockPlan(1)'))==='{"show":[],"quiet":[]}','unlock: ingenting å feire for ny spiller');
  R(`recordRound(1,'${id(0)}',6,8)`);ok(JSON.stringify(R('pgUnlockPlan(1)'))==='{"show":[1],"quiet":[]}','unlock: neste tema feires når det åpnes');
  R(`recordRound(1,'${id(1)}',3,8)`);ok(JSON.stringify(R('pgUnlockPlan(1)'))==='{"show":[],"quiet":[1]}','unlock: et tema barnet alt har spilt, er ikke «nytt» (bug 2)');
  R(`recordRound(1,'${id(1)}',6,8)`);R(`recordRound(1,'${id(2)}',6,8)`);
  let pl=R('pgUnlockPlan(1)');ok(pl.show.join()==='3'&&pl.quiet.join()==='1,2','unlock: bare uspilte temaer i banneret');
  R('pgTopicMap(1)');const seen=JSON.parse(ls.get('mh_pg_seen'));
  ok(seen.includes(`t:1:${id(1)}`)&&seen.includes(`t:1:${id(2)}`)&&!seen.includes(`t:1:${id(3)}`),'unlock: kartet merker spilte temaer som sett uten feiring');
  ok(R('pgUnlockPlan(1)').quiet.length===0,'unlock: ingen kø av gamle bannere etterpå');
  // Flere nye på en gang (f.eks. fra en gammel lagring): ett banner
  reset();ls.set('mh_pg_seen','[]');T.slice(0,4).forEach((t,i)=>{if(!t.optional)R(`recordRound(1,'${t.id}',6,8,'${D1}')`);});ls.set('mh_learn',JSON.stringify(Object.fromEntries(T.slice(0,4).map(t=>['1:'+t.id,{r:[],s:1}]))));
  pl=R('pgUnlockPlan(1)');ok(pl.show.length>=3&&pl.quiet.length===0,`unlock: flere nye temaer samlet (${pl.show})`);
  const c1=R('celList')([T[1]]),c2=R('celList')([T[1],T[2]]),c3=R('celList')([T[1],T[2],T[3]]);
  ok(c1===`${T[1].icon} ${T[1].name}`&&c2.includes(' · ')&&c2.includes(T[2].name),'unlock: bannerteksten har navn for ett eller to temaer');
  ok(!c3.includes(T[1].name)&&c3.includes(T[3].icon),'unlock: tre eller flere vises som ikoner (kort)');

  // ---- 4) Dagens økt: alle temaene (nyeste først) eller «+N til» ----
  reset();
  const up={};T.slice(0,8).forEach((t,i)=>up['1:'+t.id]=[0,1]);
  R(`mhSave('mh_fun',${JSON.stringify({day:D0,r:8,sh:4,st:8,fx:0,up})})`);
  ok(R('funShowDay()')===true,'økt: andre økt vises');
  let h=els['fun-day'].innerHTML;
  ok(/\+3 til/.test(h)&&h.indexOf(T[7].name)>=0&&h.indexOf(T[7].name)<h.indexOf(T[6].name),'økt: nyeste tema først og «+3 til» (ikke bare de 4 første)');
  ok(!h.includes(`>${T[0].icon} ${T[0].name}`),'økt: det eldste temaet er med i «+N til»');
  reset();const up3={};T.slice(0,5).forEach(t=>up3['1:'+t.id]=[0,2]);
  R(`mhSave('mh_fun',${JSON.stringify({day:D0,r:4,sh:0,st:10,fx:0,up:up3})})`);R('funShowDay()');h=els['fun-day'].innerHTML;
  ok(T.slice(0,5).every(t=>h.includes(t.name))&&!/ til</.test(h),'økt: fem temaer vises alle');
  // En runde som gir ny stjerne i et tidligere tema flytter det først
  reset();R(`mhSave('mh_fun',${JSON.stringify({day:D0,r:1,sh:0,st:1,fx:0,up:{['1:'+id(0)]:[0,1],['1:'+id(1)]:[0,1]}})})`);
  R(`S={grade:1,topicId:'${id(0)}',questions:[]}`);R('funRoundDone({from:1,to:2})');
  const ks=Object.keys(R('funState()').up);ok(ks[ks.length-1]==='1:'+id(0)&&R('funState()').up['1:'+id(0)].join()==='0,2','økt: sist forbedret tema kommer først, fra-stjernene beholdes');

  // ---- 5) Kista: monsteret gir seg (bestått) eller blir venn (mestret) ----
  reset();ls.set('mh_player',JSON.stringify({emoji:'🐉',name:'Mio'}));ls.set('mh_char_idx','6');
  R(`S={grade:1,topicId:'add10',questions:[]}`);
  R("celFoe('flag')");ok(/🐛/.test(els['cel-foe'].innerHTML)&&/🏳️/.test(els['cel-foe'].innerHTML)&&/gir seg/.test(els['cel-foe'].title),'kiste: bestått – monsteret gir seg');
  R("celFoe('friend')");ok(/🐛/.test(els['cel-foe'].innerHTML)&&/💛/.test(els['cel-foe'].innerHTML)&&/🐉/.test(els['cel-foe'].innerHTML)&&/vennen din/.test(els['cel-foe'].title),'kiste: mestret – helten og monsteret blir venner');
  ok(/cel-row/.test(R('pgChest.toString()'))&&/celChestStars/.test(R('pgChest.toString()')),'kiste: stjernene flyr inn før stempelet');

  // ---- 6) Gullkronen fra trollet skal fly inn på temaet (bare de temaene som fikk krone nå) ----
  reset();R(`recordRound(1,'add10',8,8,'${D1}')`);R(`recordRound(1,'add10',8,8,'${D0}')`);R(`mstSetCrown(1,'add10','${D0}')`);
  R(`S={grade:1,troll:true,boss:true,bossTopics:CUR[1].topics.slice(0,2),questions:[]}`);
  R('globalThis.__o={classList:{add(){},remove(){},contains(){return true}},querySelectorAll(){return []},querySelector(){return null}}');
  R('celFight(true,1,__o)');ok(JSON.stringify(R('pgCrownWait'))==='{"1:add10":1}','krone: kronen venter på å fly inn på riktig tema');
  R('pgCrownWait={}');R('celFight(false,1,__o)');ok(JSON.stringify(R('pgCrownWait'))==='{}','krone: ingen krone ved tap');
  R('S.troll=false');R('celFight(true,1,__o)');ok(JSON.stringify(R('pgCrownWait'))==='{}','krone: bossen gir ingen krone');
  reset();R('S={grade:1,topicId:"add10",questions:[]}');
};
