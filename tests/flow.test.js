// Tester for flyten for de minste (B2): «Gå til kamp» etter boss (eget trinn først), «Neste ▶» rett i temaet,
// Lær med ekte oppgave og bilde ved «prøv igjen», ← i kamp med spørsmål, beskjed når norsk stemme mangler.
module.exports=function({R,ok,CUR,ls,els,ctx}){
  const snap=new Map(ls);
  const restore=()=>{ls.clear();for(const [k,v] of snap)ls.set(k,v);};
  const today=R('mhDay(0)'),yest=R('mhDay(-1)');
  const set=(g,id,s,r)=>{const o=JSON.parse(ls.get('mh_learn')||'{}');o[g+':'+id]={r:r||[[yest,s>=2?7:6,8]],s};ls.set('mh_learn',JSON.stringify(o));};
  const core=g=>CUR[g].topics.filter(t=>!t.optional);
  const fresh=(sg)=>{ls.clear();if(sg)ls.set('mh_settings',JSON.stringify({startGrade:sg}));};
  const noTroll=()=>ls.set('mh_review',JSON.stringify({day:today,won:true}));
  const NF=()=>R('nextFight()');

  // ---- «Gå til kamp» ----
  fresh(1);ok(NF().g===1&&NF().topic.id===CUR[1].topics[0].id,'ny 1.-klassing: første tema i 1. klasse');
  fresh(2);ok(NF().g===2&&NF().topic.id===CUR[2].topics[0].id,'ny 2.-klassing: første tema i 2. klasse');
  // Mio: 2. klasse, bossen slått med bare ⭐/⭐⭐ → fortsatt 2. klasse (ikke gangetabellen i 3. klasse)
  fresh(2);core(2).forEach((t,i)=>set(2,t.id,i%2?2:1));ls.set('mh_boss_2','1');noTroll();
  ok(R('isGradeUnlocked(3)')===true,'3. klasse er åpnet etter bossen');
  let n=NF();ok(n.g===2&&n.topic&&!n.up,`etter boss-seier: anbefal 2. klasse først (fikk ${n.g}:${n.topic&&n.topic.id})`);
  ok(R('fightGrade()')===2,'fightGrade = eget trinn');
  // Alle temaene i eget trinn har ⭐⭐⭐ → neste trinn med positiv tekst
  const optOk=g=>CUR[g].topics.filter(t=>t.optional).forEach(t=>set(g,t.id,1)); // valgfrie temaer med ⭐
  fresh(2);core(2).forEach(t=>set(2,t.id,3));optOk(2);ls.set('mh_boss_2','1');noTroll();
  n=NF();ok(n.g===3&&n.up&&n.topic&&n.topic.id===CUR[3].topics[0].id,`alt mestret: videre til 3. klasse (fikk ${n.g}:${n.topic&&n.topic.id})`);
  R('goFightLabel()');ok(/klar for 3\. klasse-matte/.test(els['go-fight-sub'].textContent),`tekst: ${els['go-fight-sub'].textContent}`);
  // Valgfritt tema (mul25) uten ⭐ foreslås før neste trinn, men holder ikke barnet igjen når det har ⭐
  const opt=CUR[2].topics.find(t=>t.optional); // (bølge 3: flere valgfrie temaer per trinn – alle må ha ⭐)
  if(opt){fresh(2);core(2).forEach(t=>set(2,t.id,3));ls.set('mh_boss_2','1');noTroll();
    n=NF();ok(n.g===2&&n.topic&&n.topic.id===opt.id,`valgfritt tema uten ⭐ prøves først (fikk ${n.g}:${n.topic&&n.topic.id})`);
    optOk(2);n=NF();ok(n.g===3,`valgfritt tema med ⭐ stopper ikke (fikk ${n.g})`);}
  // Ida: 1. klasse, bossen slått, alle temaer ⭐ → 1. klasse mot ⭐⭐⭐ (2. klasse er bonus på kartet)
  fresh(1);core(1).forEach(t=>set(1,t.id,1));ls.set('mh_boss_1','1');noTroll();
  n=NF();ok(n.g===1&&n.topic,`1.-klassing etter boss: 1. klasse (fikk ${n.g})`);
  // Bossen før ⭐⭐⭐-jakten
  fresh(1);core(1).forEach(t=>set(1,t.id,1));noTroll();
  n=NF();ok(n.boss&&n.g===1,'alle temaer ⭐: bossen');
  // Trollet: etter temaer som kan gi stjerne i dag, før temaer som må vente til i morgen
  fresh(1);core(1).forEach(t=>set(1,t.id,2,[[today,7,8],[today,7,8]]));optOk(1);ls.set('mh_boss_1','1');
  ls.set('mh_review',JSON.stringify({day:today,g:1,ids:[core(1)[0].id],won:false,mastered:false}));
  ok(R(`mstNext(1,'${core(1)[0].id}').now`)===false,'testoppsett: ⭐⭐⭐ må vente til i morgen');
  n=NF();ok(!!n.troll&&n.g===1,`trollet når ingen tema kan gi stjerne i dag (fikk ${JSON.stringify(n&&{g:n.g,t:n.topic&&n.topic.id,b:!!n.boss})})`);
  ok(R('fightGrade()')===1,'fightGrade hopper over trollet');
  R("globalThis.__ti=null;globalThis.__oti=openTrollIntro;openTrollIntro=function(f){globalThis.__ti=f;}");
  try{R('goFight()');ok(R('__ti')==='grades','goFight åpner trollet');}finally{R('openTrollIntro=__oti');}
  noTroll();n=NF();ok(n.g===1&&n.topic&&!n.up,`uten troll: bli i eget trinn selv om stjernen må vente (fikk ${n.g})`);
  // Påbegynte temaer i trinnet under (2.-klassing som har spilt litt 1. klasse)
  fresh(2);core(2).forEach(t=>set(2,t.id,2,[[today,7,8],[today,7,8]]));optOk(2);ls.set('mh_boss_2','1');noTroll();set(1,'add10',1);
  n=NF();ok(n.g===1&&n.topic.id==='add10',`påbegynt tema i 1. klasse før ventende temaer (fikk ${n.g}:${n.topic&&n.topic.id})`);
  // Gammel lagring uten klassevalg: høyeste trinn barnet har spilt i
  fresh(0);set(1,'add10',3);set(2,'place2',1);ls.set('mh_boss_1','1');noTroll();
  ok(R('fightOwnGrade()')===2,'uten klassevalg: eget trinn = høyeste påbegynte');

  // ---- «Neste ▶» på resultatsiden: rett i temaet / bossen ----
  const doc=R('document'),qs0=doc.querySelector;
  R("globalThis.__st=null;globalThis.__bi=null;globalThis.__ost=startTopic;globalThis.__obi=openBossIntro;startTopic=function(g,id){globalThis.__st=[g,id];return 'x';};openBossIntro=function(g){globalThis.__bi=g;}");
  doc.querySelector=sel=>/victory-card/.test(sel)?doc.getElementById('__card'):null;
  try{
    const Q=c=>JSON.stringify(Array.from({length:8},(_,i)=>({ok:i<c})));
    fresh(1);set(1,CUR[1].topics[0].id,1);
    R(`S={grade:1,topicId:'${CUR[1].topics[0].id}',topic:CUR[1].topics[0],questions:${Q(7)},idx:8,score:7};pgResults()`);
    els['pg-next'].onclick();
    ok(R('__st')&&R('__st')[0]===1&&R('__st')[1]===CUR[1].topics[1].id,`Neste ▶ starter neste tema direkte (fikk ${JSON.stringify(R('__st'))})`);
    fresh(1);core(1).forEach(t=>set(1,t.id,1));
    R(`S={grade:1,topicId:'${CUR[1].topics[0].id}',topic:CUR[1].topics[0],questions:${Q(7)},idx:8,score:7};pgResults()`);
    ok(/Bossen/.test(els['pg-next'].textContent),'Bossen venter-knapp');
    els['pg-next'].onclick();ok(R('__bi')===1,'Bossen venter ▶ åpner bossen direkte');
    // «Neste: 3. klasse» bare når eget trinn er mestret
    fresh(2);core(2).forEach(t=>set(2,t.id,2,[[today,7,8],[today,7,8]]));ls.set('mh_boss_2','1');noTroll();
    const t0=core(2)[0];R(`S={grade:2,topicId:'${t0.id}',topic:CUR[2].topics.find(t=>t.id==='${t0.id}'),questions:${Q(7)},idx:8,score:7};pgResults()`);
    ok(!/3\. klasse/.test(els['pg-next'].textContent),`ikke «Neste: 3. klasse» før 2. klasse er mestret: ${els['pg-next'].textContent}`);
  }finally{doc.querySelector=qs0;R('startTopic=__ost;openBossIntro=__obi');}

  // ---- Lær: ekte oppgave til slutt, ingen passiv «din tur», bilde ved «prøv igjen» ----
  const LG=R('LEARN_GUIDES');
  R("globalThis.__osg=startGame;startGame=function(){}");
  try{
    for(const g of [1,2])for(const t of CUR[g].topics){
      if(!LG[t.id])continue;
      fresh(g);R(`showLearn(${g},'${t.id}')`);
      const st=R('learnState.steps'),last=st[st.length-1];
      ok(!st.some(s=>/din tur/i.test(s.title)&&!s.practice),`${t.id}: passivt «din tur»-steg uten oppgave`);
      ok(st.filter(s=>s.practice).length===1&&!!last.practice,`${t.id}: én oppgave, til slutt`);
      ok(st.length<=6,`${t.id}: ${st.length} steg i Lær`);
      if(!last.practice)continue;
      const qd=last.practice.qd,key=String(qd.ansTxt??qd.ans);
      const wrong=Array.isArray(qd.choices)&&qd.choices.length?String(qd.choices.find(c=>String(c)!==key)):String(Number(qd.ans)+1);
      const h=R('learnHint')(last,last.practice,wrong);
      ok(h.t.length>0,`${t.id}: hint-tekst ved prøv igjen`);
      if(last.ask)ok(h.h.length>0,`${t.id}: bilde ved prøv igjen`);
      ok(!new RegExp(`(^|[^\\d])${key.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}([^\\d]|$)`).test(h.t)||/[a-zæøå]/i.test(key),`${t.id}: hintet viser svaret: ${h.t}`);
      ok(h.t.split(/\s+/).length<=12,`${t.id}: hintet er kort: ${h.t}`);
      if(last.ask&&last.ask.why)for(const [w,txt] of Object.entries(last.ask.why))ok(R('learnHint')(last,last.practice,w).t===txt,`${t.id}: why-hint for ${w}`);
    }
    // Et passivt «Nå er det din tur!» uten ask (f.eks. nye temaer) byttes ut med en ekte oppgave
    const id=CUR[1].topics.find(t=>!t.optional&&LG[t.id]).id,old=LG[id];
    LG[id]=[{icon:'🔢',title:'Se her',text:'Slik gjør du.',visual:'x'},{icon:'🎯',title:'Nå er det din tur!',text:'Svarer selv.',visual:'y'}];
    try{fresh(1);R(`showLearn(1,'${id}')`);const st=R('learnState.steps');
      ok(st.length===2&&!!st[1].practice&&st[1].title==='Din tur!',`passivt steg byttet ut (${st.length} steg, ${st[1]&&st[1].title})`);}
    finally{LG[id]=old;}
  }finally{R('startGame=__osg');}

  // ---- ← i kamp: spør bare når minst én oppgave er besvart ----
  R("S={grade:1,topicId:'add10',questions:[],idx:0,answered:false}");ok(R('battleBackAsk()')===false,'ingen svar: ← går rett ut');
  R("S.questions=[{ok:true}];S.idx=1");ok(R('battleBackAsk()')===true,'ett svar: ← spør først');
  R("S.chestDone=true");ok(R('battleBackAsk()')===false,'ferdig runde: ingen spørsmål');
  R("S={grade:1,boss:true,bossOver:false,questions:[{ok:true}],idx:1}");ok(R('battleBackAsk()')===true,'boss: spør');
  R("S.bossOver=true");ok(R('battleBackAsk()')===false,'boss over: ingen spørsmål');
  R("globalThis.__arm=0;globalThis.__dis=0;globalThis.__oa=loopArmAuto;globalThis.__od=loopDisarm;loopArmAuto=function(){__arm++;};loopDisarm=function(){__dis++;}");
  try{R("S={grade:1,topicId:'add10',questions:[{ok:true}],idx:1,answered:true,_autoT:7};battleBackOpen();battleBackStay()");
    ok(R('__dis')===1&&R('__arm')===1,'autoneste stoppes mens spørsmålet vises, og fortsetter etter «Fortsett»');}
  finally{R('loopArmAuto=__oa;loopDisarm=__od');}

  // ---- Ingen norsk stemme: beskjed til voksne én gang ----
  R('TTS.voice=null');fresh(1);
  ok(R('ttsNoteNeeded()')===true,'uten norsk stemme: beskjed trengs');
  R('ttsNoteClose()');ok(ls.get('mh_tts_note')==='1'&&R('ttsNoteNeeded()')===false,'lukket: vises ikke igjen');
  ls.delete('mh_tts_note');ctx.speechSynthesis={speak(){},cancel(){},getVoices:()=>[]};R("TTS.voice={lang:'nb-NO',name:'x'}");
  try{ok(R('ttsNoteNeeded()')===false,'med norsk stemme: ingen beskjed');}finally{R('TTS.voice=null');delete ctx.speechSynthesis;}

  restore();
};
