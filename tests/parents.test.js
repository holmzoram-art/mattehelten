// Mattehelten – tester for foreldresiden (E): aggregering fra mh_stats, feiltyper, regnemåter, anbefaling,
// innstillinger, hold-inne-inngangen og at siden tåler tom, gammel og ødelagt lagring. Kjøres av tests/run.js.
module.exports=function({R,ok,CUR,ls}){
  const day=o=>R(`mhDay(${-o})`),J=v=>JSON.stringify(v),reset=()=>ls.clear();
  const rr=(g,id,c,n,d)=>R(`recordRound(${g},'${id}',${c},${n},'${d}')`);
  const html=()=>R('parHTML()');
  const BAD=/undefined|NaN|Infinity|\[object|null %/;

  // ---- 1) Datoer og formatering ----
  reset();
  const d14=R('parDays(14)');
  ok(d14.length===14&&d14[13]===day(0)&&d14[0]===day(13),'par: parDays(14) går fra 13 dager siden til i dag');
  ok(new Set(d14).size===14,'par: parDays gir ulike dager');
  const w0=R('parWeekDays(0)'),w1=R('parWeekDays(1)'),dow=k=>R(`parDate('${k}').getDay()`);
  ok(w0.length>=1&&w0.length<=7&&dow(w0[0])===1&&w0[w0.length-1]===day(0),`par: denne uka = mandag til i dag (${w0[0]}…)`);
  ok(w1.length===7&&dow(w1[0])===1&&dow(w1[6])===0&&R(`parAgo('${w1[6]}')`)===w0.length,'par: forrige uke = hele uka mandag–søndag rett før denne');
  ok(R(`parWhen('${day(0)}')`)==='i dag'&&R(`parWhen('${day(1)}')`)==='i går'&&R(`parWhen('${day(3)}')`)==='3 dager siden','par: parWhen i dag / i går / dager siden');
  ok(/^\d{1,2}\. \S+$/.test(R(`parWhen('${day(10)}')`)),`par: parWhen eldre enn en uke gir dato (${R(`parWhen('${day(10)}')`)})`);
  ok(R("parWhen('')")==='–'&&R("parWhen('tull')")==='–'&&R('parWhen(undefined)')==='–','par: parWhen tåler tom og ugyldig dato');
  ok(R('parMin(0)')==='0'&&R('parMin(20000)')==='<1'&&R('parMin(90000)')==='2'&&R('parMin(-5)')==='0','par: parMin runder til hele minutter');
  ok(R('parPct(0,0)')===null&&R('parPct(24,18)')===75,'par: parPct');
  ok(R("parEsc('8 + 5 = 13 <b>')")==='8 + 5 = 13 &lt;b&gt;','par: parEsc escaper HTML og holder regnestykker samlet');

  // ---- 2) Aggregering fra mh_stats over flere dager ----
  reset();
  const S0={};
  S0[day(0)]={ms:300000,n:16,ok:12,t:{'1:add10':[8,7],'1:sub10':[8,5]},m:{starttall:2,pluss:1}};
  S0[day(1)]={ms:240000,n:8,ok:6,t:{'1:sub10':[8,6]},m:{pluss:2}};
  S0[day(6)]={ms:120000,n:8,ok:4,t:{'1:add10':[8,4]},m:{en:3}};
  S0[day(7)]={ms:600000,n:24,ok:20,t:{'1:add10':[16,14],'1:ten1':[8,6]},m:{en:1,ti:2}};
  S0[day(13)]={ms:60000,n:8,ok:8,t:{'1:ten1':[8,8]},m:{}};
  S0[day(20)]={ms:60000,n:8,ok:2,t:{'1:add10':[8,2]},m:{starttall:5}};
  ls.set('mh_stats',J(S0));
  R('var __st=parStats()');
  const a7=R('parAgg(__st,parDays(7))'),a14=R('parAgg(__st,parDays(14))'),aAll=R('parAgg(__st,Object.keys(__st))');
  ok(a7.n===32&&a7.ok===22&&a7.ms===660000&&a7.days===3,`par: 7 dager summeres (n ${a7.n}, ok ${a7.ok}, ms ${a7.ms}, dager ${a7.days})`);
  ok(J(a7.t['1:add10'])==='[16,11]'&&J(a7.t['1:sub10'])==='[16,11]'&&!a7.t['1:ten1'],'par: 7 dager per tema');
  ok(a14.n===64&&a14.ok===50&&a14.days===5,`par: 14 dager summeres (n ${a14.n}, dager ${a14.days})`);
  ok(J(a14.t['1:ten1'])==='[16,14]','par: 14 dager per tema');
  ok(aAll.n===72&&aAll.ok===52&&J(aAll.t['1:add10'])==='[40,27]','par: totalt per tema');
  ok(a14.m.pluss===3&&a14.m.en===4&&a14.m.starttall===2&&a14.m.ti===2&&!aAll.m.ukjent,'par: feiltyper summeres over dager');
  ok(aAll.m.starttall===7,'par: feiltyper totalt');

  // ---- 3) Topp feiltyper ----
  let top=R('parTopMisc({m:{en:4,pluss:3,starttall:3,ti:1,ukjent:9}},3,1)');
  ok(J(top.map(x=>x.k))==='["en","pluss","starttall"]',`par: topp feiltyper sortert på antall, så konkrete først (${top.map(x=>x.k)})`);
  ok(!top.some(x=>x.k==='ukjent'),'par: ukjent feiltype uten navn vises ikke');
  ok(top.every(x=>x.name&&x.what&&x.tip),'par: hver feiltype har navn, forklaring og tips');
  top=R('parTopMisc({m:{en:1,ti:1}},3,2)');ok(top.length===0,'par: min = 2 utelater enkeltfeil');
  top=R('parTopMisc({m:{veksling:2,snudd:2}},1,1)');ok(top.length===1&&top[0].k==='veksling','par: lim og fast rekkefølge ved likt antall');
  const MN=R('Object.keys(window.MISC_NAMES)');
  ok(MN.length>0&&MN.every(k=>R(`!!(PAR_MISC['${k}']&&PAR_MISC['${k}'][0]&&PAR_MISC['${k}'][1])`)),'par: alle feiltyper i MISC_NAMES har forklaring og tips hjemme');
  ok(MN.every(k=>R(`PAR_MISC_ORDER.includes('${k}')`)),'par: alle feiltyper har plass i rekkefølgen');

  // ---- 4) Tips for alle temaer og regnemåter i 1.–2. klasse ----
  const strats=new Set();
  for(const g of [1,2])for(const t of CUR[g].topics){
    ok(R(`typeof PAR_TOPIC['${t.id}']==='string'&&PAR_TOPIC['${t.id}'].length>20`),`par: tema ${t.id} har tips hjemme`);
    for(let i=0;i<300;i++){const q=t.gen(g,t.id);if(q&&q.strat)strats.add(q.strat);}
  }
  ok(strats.size>10,`par: fant regnemåter i generatorene (${strats.size})`);
  for(const s of strats)ok(R(`!!(PAR_FAM['${s}']&&PAR_FAM['${s}'][0]&&PAR_FAM['${s}'][1])`),`par: regnemåten ${s} har navn og tips`);
  const tipTxt=R('[].concat(Object.values(PAR_MISC).flat(),Object.values(PAR_FAM).flat(),Object.values(PAR_TOPIC)).join(" ")');
  ok(!/\b(pa|fa|gar|sma|forste|Naesten)\b|undefined/.test(tipTxt),'par: tipsene har norske tegn og ingen skrivefeil vi kjenner');
  ok(R('Object.values(PAR_FAM).every(x=>x[1].length<=150)')&&R('Object.values(PAR_MISC).every(x=>x[1].length<=200)'),'par: tipsene er korte');

  // ---- 5) Regnemåter som ikke sitter (mh_fam) ----
  reset();
  ls.set('mh_fam',J({'1:add20':{'over-tier':'10010010',dobbel:'11111111','naer-dobbel':'010'},'1:sub10':{'tenk-pluss':'1101'},'2:add100':{veksling:'00110'},'x':5,'1:eq1':'tull'}));
  let fams=R('parFams()');
  ok(J(fams.map(f=>f.strat))==='["over-tier","veksling"]',`par: svake regnemåter (≥ 4 forsøk, ≥ 40 % feil), svakest først (${fams.map(f=>f.strat)})`);
  ok(fams[0].ok===3&&fams[0].n===8&&fams[0].g===1&&fams[0].tid==='add20'&&/tieren/.test(fams[0].name)&&fams[1].g===2,'par: regnemåte har tall, tema og navn');
  ls.set('mh_fam','"tekst"');ok(R('parFams()').length===0,'par: ødelagt mh_fam tåles');

  // ---- 6) Neste stjerne (tekst for voksne) ----
  reset();
  ok(/6 av 8.*⭐\./.test(R("parNextStar(1,'add10',0).txt")),'par: 0 stjerner → 6 av 8 gir ⭐');
  rr(1,'add10',7,8,day(2));rr(1,'add10',7,8,day(1)); // ⭐⭐⭐ = 21 av 24 i de tre siste rundene, på minst to dager
  let nx=R("parNextStar(1,'add10',topicStars(1,'add10'))");ok(nx.gap===0&&/Én runde til med 7 av 8/.test(nx.txt),`par: ⭐⭐ med to gode runder en annen dag → én runde til (${nx.txt})`);
  reset();rr(1,'add10',8,8,day(0));nx=R("parNextStar(1,'add10',topicStars(1,'add10'))");ok(nx.gap>1&&/21 av 24/.test(nx.txt),`par: ⭐⭐ med bare én runde → tre runder trengs (${nx.txt})`);
  reset();rr(1,'add10',7,8,day(0));rr(1,'add10',7,8,day(0));
  nx=R("parNextStar(1,'add10',topicStars(1,'add10'))");ok(nx.gap===.5&&/i morgen/.test(nx.txt),`par: ⭐⭐ med god runde bare i dag → i morgen (${nx.txt})`);
  reset();rr(1,'add10',6,8,day(2));
  nx=R("parNextStar(1,'add10',1)");ok(nx.gap===1&&/7 av 8.*⭐⭐\./.test(nx.txt),`par: ⭐ → 7 av 8 gir ⭐⭐ (${nx.txt})`);
  reset();rr(1,'add10',7,8,day(1));rr(1,'add10',7,8,day(1));rr(1,'add10',8,8,day(0));
  nx=R("parNextStar(1,'add10',3)");ok(nx.gap===99&&/Mestret/.test(nx.txt),'par: mestret');

  // ---- 7) Anbefaling ----
  const rec=()=>R('parModel().rec');
  // a) Tom lagring → start med første tema i startnivået
  reset();
  let r=rec();ok(r.kind==='empty'&&r.r&&r.r.id===CUR[1].topics[0].id,`par: tom lagring anbefaler første tema (${r.kind} ${r.r&&r.r.id})`);
  ls.set('mh_settings',J({startGrade:2}));r=rec();
  ok(r.kind==='empty'&&r.r&&r.r.g===2&&r.r.id===CUR[2].topics[0].id,`par: startnivå 2 anbefaler første tema i 2. klasse (${r.r&&r.r.id})`);
  // b) Lavest treff vinner over nærmest neste stjerne
  reset();
  const T=CUR[1].topics.map(t=>t.id); // add10, sub10, ten1, …
  rr(1,T[0],7,8,day(3));rr(1,T[0],7,8,day(3));rr(1,T[0],8,8,day(1)); // ⭐⭐⭐
  rr(1,T[1],6,8,day(2));                       // ⭐
  rr(1,T[2],6,8,day(2));rr(1,T[2],7,8,day(1)); // ⭐⭐, god runde i går → nær ⭐⭐⭐
  const st={};st[day(1)]={ms:400000,n:32,ok:20,t:{[`1:${T[1]}`]:[16,6],[`1:${T[2]}`]:[16,14]},m:{pluss:3,en:2}};
  st[day(2)]={ms:300000,n:16,ok:12,t:{[`1:${T[1]}`]:[8,6],[`1:${T[2]}`]:[8,6]},m:{}};
  ls.set('mh_stats',J(st));
  r=rec();ok(r.kind==='low'&&r.r.id===T[1]&&r.acc.n===24&&r.acc.ok===12,`par: lavest treff (50 %) anbefales først (${r.kind} ${r.r&&r.r.id})`);
  ok(r.more.some(m=>m.id===T[2]),'par: «også nær neste stjerne» viser temaet som er nærmest');
  let h=html();
  ok(h.includes('50 % riktig på første forsøk siste 7 dager (12 av 24)'),'par: begrunnelsen viser riktige tall');
  ok(h.includes(`parStart(1,'${T[1]}')`),'par: knapp for å spille anbefalt tema');
  // c) Ingen svake → nærmest neste stjerne (⭐⭐ med god runde en annen dag)
  st[day(1)].t[`1:${T[1]}`]=[16,14];st[day(2)].t[`1:${T[1]}`]=[8,7];ls.set('mh_stats',J(st));
  r=rec();ok(r.kind==='near'&&r.r.id===T[2]&&r.r.nx.gap===0,`par: nærmest neste stjerne (${r.kind} ${r.r&&r.r.id})`);
  // d) Alle påbegynte mestret → nytt tema
  reset();rr(1,T[0],7,8,day(2));rr(1,T[0],7,8,day(1));rr(1,T[0],7,8,day(1));
  r=rec();ok(r.kind==='new'&&r.r.id===T[1],`par: nytt tema når alt påbegynt er mestret (${r.kind} ${r.r&&r.r.id})`);
  ok(html().includes('Nytt tema'),'par: tekst for nytt tema');
  // e) Alt åpent er mestret → repetisjon, og bossen er klar
  reset();
  for(const t of CUR[1].topics){rr(1,t.id,7,8,day(3));rr(1,t.id,7,8,day(3));rr(1,t.id,8,8,day(1));}
  r=rec();ok(r.kind==='done'&&!r.r,`par: alt mestret (${r.kind})`);
  h=html();ok(h.includes('Alt som er åpnet, er mestret')&&h.includes('Bossen i 1. klasse er klar'),'par: tekst når alt er mestret, og hint om bossen');
  ok(h.includes('venter! Alle temaer har ⭐'),'par: klassetrinnet viser at bossen venter');
  // f) Valgfritt tema anbefales ikke som nytt
  reset();ls.set('mh_boss_1','1');
  for(const t of CUR[2].topics.filter(t=>!t.optional)){rr(2,t.id,7,8,day(3));rr(2,t.id,7,8,day(3));rr(2,t.id,8,8,day(1));}
  for(const t of CUR[1].topics){rr(1,t.id,7,8,day(3));rr(1,t.id,7,8,day(3));rr(1,t.id,8,8,day(1));}
  r=rec();ok(r.kind==='done',`par: valgfritt tema (mul25) anbefales ikke som nytt (${r.kind} ${r.r&&r.r.id})`);
  ok(html().includes('slått'),'par: slått boss vises');

  // ---- 8) Oversikt per tema ----
  reset();
  ls.set('mh_player',J({emoji:'🐉',name:'Ola'}));
  rr(1,T[0],6,8,day(9));rr(1,T[0],7,8,day(2));
  const s2={};s2[day(2)]={ms:200000,n:8,ok:7,t:{[`1:${T[0]}`]:[8,7]},m:{}};s2[day(9)]={ms:200000,n:8,ok:6,t:{[`1:${T[0]}`]:[8,6]},m:{}};
  s2[day(0)]={ms:100000,n:4,ok:3,t:{[`1:${T[0]}`]:[4,3]},m:{}}; // boss/troll-oppgaver i dag, ingen runde
  ls.set('mh_stats',J(s2));
  let M=R('parModel()');const row=M.grades[0].rows[0];
  ok(row.n7===12&&row.ok7===10&&row.n===20&&row.ok===16&&row.rounds===2&&row.stars===2,`par: rad med treff 7 d, totalt, runder og stjerner (${J([row.n7,row.ok7,row.n,row.ok,row.rounds,row.stars])})`);
  ok(row.last===day(0),'par: sist spilt tar med oppgaver fra mh_stats som er nyere enn siste runde');
  ok(M.grades[0].rows[1].open&&!M.grades[0].rows[2].open,'par: neste tema åpent, resten låst');
  ok(M.grades.map(x=>x.g).join()==='1,2'&&!M.grades[1].open,'par: 1. og 2. klasse vises, 2. klasse er låst');
  h=html();
  ok(h.includes('83 %')&&h.includes('10/12')&&h.includes('80 %')&&h.includes('16/20'),'par: prosent og brøk i tabellen');
  ok((h.match(/class="par-trow par-dim"/g)||[]).length===CUR[1].topics.length-2,'par: temaer som ikke er åpnet, vises dempet');
  ok(h.includes('Åpent, ikke spilt ennå'),'par: åpent tema uten spilling');
  ok(h.includes('Temaer:')&&h.includes('eller velg 2. klasse under Innstillinger'),'par: låst klassetrinn vises kort med forklaring');
  ok(h.includes('for Ola'),'par: barnets navn i toppen');
  ok(!BAD.test(h),'par: ingen undefined/NaN i siden');
  for(let i=0;i<10;i++)rr(1,T[0],7,8,day(1));ok(html().includes('>10+<'),'par: 10+ runder');
  ok(!/Slett|Nullstill|removeItem|localStorage\.clear/.test(html()),'par: ingen knapp som sletter fremgang');
  ok(h.includes('Slik virker stjernene')&&h.includes('to ulike dager')&&h.includes('👑'),'par: forklaring av stjernene');

  // ---- 9) Tid og mengde ----
  reset();ls.set('mh_stats',J(S0));
  M=R('parModel()');const wk=M.wk;
  const inWeek=k=>R('parWeekDays(0)').includes(k),expN=Object.keys(S0).filter(inWeek).reduce((a,k)=>a+S0[k].n,0);
  ok(wk.n===expN,`par: oppgaver denne uka (${wk.n} = ${expN})`);
  const ch=R("parChartHTML(parStats(),'min')"),chn=R("parChartHTML(parStats(),'n')");
  ok((ch.match(/class="par-col/g)||[]).length===14,'par: søylegrafen har 14 dager');
  ok(ch.includes('par-today')&&ch.includes('>5<'),'par: i dag er markert, og 5 minutter står over søylen');
  ok(chn.includes('>16<')&&chn.includes('Oppgaver per dag'),'par: grafen kan vise antall oppgaver');
  ok(R("parChartHTML({},'min')").includes('Ingen spilling'),'par: tom graf har tekst');
  h=html();ok(h.includes('Denne uka')&&h.includes('Forrige uke'),'par: ukesummer');
  ok(h.includes('Telte med starttallet')&&h.includes('Tips hjemme'),'par: typiske feil med tips');

  // ---- 10) Innstillinger lagres ----
  reset();ls.set('mh_settings',J({tts:'auto',session:4,startGrade:1,annet:'x'}));
  ok(R("parSet('session',6)")&&R("getSetting('session')")===6,'par: øktlengde lagres');
  R("parSet('session',1)");ok(R("getSetting('session')")===2,'par: øktlengde minst 2');
  R("parSet('session',12)");ok(R("getSetting('session')")===8,'par: øktlengde maks 8');
  ok(!R("parSet('session','abc')")&&R("getSetting('session')")===8,'par: ugyldig øktlengde avvises');
  ok(R("parSet('tts','off')")&&R("getSetting('tts')")==='off','par: opplesing av lagres');
  ok(!R("parSet('tts','høyt')")&&R("getSetting('tts')")==='off','par: ugyldig opplesing avvises');
  ok(R("parSet('tts','on')")&&R("getSetting('tts')")==='on','par: opplesing på lagres');
  ok(R("parSet('startGrade','2')")&&R("getSetting('startGrade')")===2&&R('isGradeUnlocked(2)'),'par: startnivå 2 lagres og åpner 2. klasse');
  ok(R("parSet('startGrade',1)")&&R("getSetting('startGrade')")===1,'par: startnivå 1 lagres');
  ok(!R("parSet('mh_learn',1)")&&!R("parSet('xp',99)"),'par: andre nøkler kan ikke settes');
  ok(JSON.parse(ls.get('mh_settings')).annet==='x','par: andre innstillinger beholdes');
  ls.set('mh_settings',J({session:'mange'}));ok(R('parSession()')===4,'par: ødelagt øktlengde gir 4');
  ls.set('mh_settings',J({session:40}));ok(R('parSession()')===8,'par: for stor øktlengde vises som 8');
  ls.set('mh_settings',J({session:5,tts:'off',startGrade:2}));h=html();
  ok(h.includes('<b>5</b> runder')&&/id="par-tts-off" aria-pressed="true"/.test(h)&&/id="par-startGrade-2" aria-pressed="true"/.test(h),'par: siden viser lagrede innstillinger');
  ok(h.includes('Opplesing'),'par: opplesing vises når ttsOn finnes');
  R('var __tts=ttsOn;ttsOn=undefined');ok(!html().includes('Opplesing'),'par: opplesing skjules når ttsOn ikke finnes');R('ttsOn=__tts');
  ok(h.includes('Fant ingen norsk stemme'),'par: forklaring når nettleseren mangler norsk stemme');

  // ---- 11) Hold inne i 2 sekunder ----
  reset();R("PAR.t0=0;PAR.from='grades'");const o0=R('PAR.opened');
  ok(R('parHoldStart(1000)')&&!R('parHoldStart(1200)'),'par: hold starter én gang');
  ok(!R('parHoldTick(2500)')&&R('PAR.opened')===o0,'par: 1,5 s åpner ikke');
  ok(R('parHoldEnd(2600)')===true&&R('PAR.t0')===0&&R('PAR.opened')===o0,'par: slipper for tidlig → nullstilles, åpner ikke');
  ok(!R('parHoldTick(9000)'),'par: tikk etter slipp gjør ingenting');
  R('parHoldStart(5000)');ok(R('parHoldTick(7000)')&&R('PAR.opened')===o0+1&&R('PAR.t0')===0,'par: 2 s åpner foreldresiden');
  ok(R('parHoldEnd(7100)')===false,'par: slipp etter åpning gjør ingenting');
  ok(R("parentsOpen('parent')")&&R('PAR.from')==='parent'&&html().includes('Tilbake til rapporten'),'par: fra rapporten → «Tilbake til rapporten»');
  let thr=null;try{R('parentsBack()');}catch(e){thr=e;}ok(!thr,'par: tilbake krasjer ikke');
  R("parentsOpen('grades')");ok(html().includes('Tilbake til spillet'),'par: fra kartet → «Tilbake til spillet»');
  ok(R("parStart(1,'finnesikke')")===false,'par: ukjent tema startes ikke');

  // ---- 12) Tom, gammel og ødelagt lagring ----
  const tryHTML=lbl=>{let x='',e=null;try{x=html();}catch(err){e=err;}ok(!e&&x.length>1000&&!BAD.test(x),`par: siden tåler ${lbl}${e?': '+e.message:''}`);return x;};
  reset();h=tryHTML('tom lagring');ok(h.includes('Ingen runder ennå')&&h.includes('Ingen oppgaver de siste 14 dagene'),'par: tom lagring gir vennlig tekst');
  reset();ls.set(`mh_mst_1_${T[0]}`,'100');ls.set(`mh_mst_1_${T[1]}`,'70');ls.set(`mh_mst_1_${T[2]}`,'30');ls.set(`hs_1_${T[0]}`,J([{score:9,ko:true,date:'1.10.2025'}]));
  h=tryHTML('gammel lagring (mh_mst_)');M=R('parModel()');
  ok(M.grades[0].rows[0].stars===3&&M.grades[0].rows[1].stars===1&&M.grades[0].rows[2].started,'par: gamle stjerner vises');
  ok(M.rec.kind==='near'&&M.rec.r.id===T[2],`par: anbefaling med gammel lagring: påbegynt tema uten ⭐ (${M.rec.kind} ${M.rec.r&&M.rec.r.id})`);
  reset();ls.set('mh_stats','{ødelagt');ls.set('mh_learn','[1,2]');ls.set('mh_fam','null');ls.set('mh_settings','{x');ls.set('mh_player','"tekst"');tryHTML('ødelagt JSON');
  reset();ls.set('mh_stats',J([1,2,3]));tryHTML('mh_stats som liste');
  reset();ls.set('mh_stats',J({[day(0)]:{ms:'x',n:5,ok:9,t:{'1:add10':[5,'7'],'1:sub10':'nei','9:ukjent':[3,1]},m:{en:2,ukjent:4,pluss:-3,starttall:'2'}},tull:{n:3},[day(1)]:null,[day(2)]:[1,2]}));
  R('var __st=parStats()');const sa=R('parAgg(__st,parDays(7))');
  ok(sa.n===5&&sa.ok===5&&sa.ms===0&&J(sa.t['1:add10'])==='[5,5]'&&!sa.t['1:sub10']&&sa.m.en===2&&sa.m.starttall===2&&!sa.m.pluss,'par: ødelagte tall i mh_stats renses (riktige ≤ antall, negative bort)');
  ok(Object.keys(R('parStats()')).length===1,'par: ugyldige dager hoppes over');
  tryHTML('rare tall i mh_stats');
  reset();ls.set('mh_player',J({emoji:'🐉',name:'<img src=x onerror=alert(1)>'}));h=tryHTML('navn med HTML');
  ok(!h.includes('<img')&&h.includes('&lt;img'),'par: navnet escapes');

  // ---- 13) Siden bare leser (unntatt innstillinger) ----
  reset();
  for(const t of CUR[1].topics.slice(0,3))rr(1,t.id,6,8,day(1));
  ls.set('mh_stats',J(S0));ls.set('mh_fam',J({'1:add10':{dobbel:'0101'}}));ls.set('mh_settings',J({session:4}));
  const snap=new Map(ls);
  const changed=()=>[...new Set([...snap.keys(),...ls.keys()])].filter(k=>snap.get(k)!==ls.get(k));
  html();R("parentsOpen('grades')");R('parMetric("n")');R('parMetric("min")');
  ok(!changed().length,`par: å åpne og lese siden endrer ikke lagringen (${changed()})`);
  R('parentsBack()'); // kartet bygges på nytt: bare kartets egne merker (trollet, viste åpninger) kan skrives
  ok(changed().every(k=>k==='mh_review'||k==='mh_pg_seen')&&[...snap.keys()].every(k=>ls.has(k)),`par: tilbake til kartet sletter ingenting (${changed()})`);
  reset();
};
