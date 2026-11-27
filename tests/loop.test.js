// Tester for oppgaveløkka (A2): prøv igjen, first/fixed, revansj, autoneste, ingen gjentakelse, maks én 0-oppgave,
// tak på svake familier, feiltyper (detectMisc), hint/bilder, korte tilbakemeldinger, ops/strat/say og mh_stats.
module.exports=function({R,ok,CUR,ls,els,ctx}){
  const el=id=>R(`document.getElementById(${JSON.stringify(id)})`);
  const ans=v=>{el('ans-input').value=String(v);R('submitAnswer()');};
  const S=()=>R('S');
  const setQ=qd=>{R('S').current=qd;R('S').answered=false;};
  const IDS={1:['add10','sub10','ten1','seq1','add20'],2:['add100','sub100','miss2','dbl2','mul25']};
  const PIC=/\p{Extended_Pictographic}/u;
  const words=t=>String(t).replace(/<[^>]*>/g,' ').split(/\s+/).filter(w=>/[a-zæøåA-ZÆØÅ]/.test(w)).length;
  const BAD=/undefined|NaN|Infinity|\[object|null/;
  const loopKey=R('loopKey'),isZeroQ=R('isZeroQ'),detectMisc=R('detectMisc'),loopHint=R('loopHint'),loopReveal=R('loopReveal'),renderVis=R('renderVis');
  // Spiller en hel runde. answer(qd,forsøk) gir svaret (forsøk 0 eller 1)
  function round(g,id,answer){
    R(`startGame(${g},'${id}')`);
    for(let i=0;i<8;i++){
      const q=S().current;ans(answer(q,0));
      if(!S().answered)ans(answer(q,1));
      ok(S().answered,`round ${id}: question not resolved after two tries`);
      if(i<7)R('handleNext()');
    }
    return S().questions;
  }
  const right=q=>Array.isArray(q.choices)&&q.choices.length?String(q.ansTxt??q.ans):q.ans;
  const wrongOf=q=>Array.isArray(q.choices)&&q.choices.length?String(q.choices.find(c=>String(c)!==String(q.ansTxt??q.ans))):q.ans+1;

  ok(R('TQ')===8,'TQ is 8');
  ok(CUR[1].topics.find(t=>t.id==='add10').name==='Pluss til 10'&&CUR[1].topics.find(t=>t.id==='sub10').name==='Minus til 10'&&CUR[2].topics.find(t=>t.id==='add100').name==='Pluss til 100','child friendly topic names');

  // ---- Prøv igjen: 1. feil → hint, ingen HP-tap; riktig på andre → fixed ----
  ls.clear();R("startGame(1,'add20')");
  setQ({q:'8 + 5 = ?',ans:13,type:'Pluss',sub:'a20o',strat:'over-tier',ops:{a:8,b:5,op:'+'}});
  ans(12);
  let s=S(),e=s.questions[0];
  ok(!s.answered&&s.idx===0,'first wrong: question stays open');
  ok(s.questions.length===1&&e.ok===false&&e.first==='12'&&e.given===12,'first wrong: entry with ok=false and first answer');
  ok(e.misc==='starttall','8 + 5 = 12 is starttall');
  ok(s.playerHp===100,'first wrong: no HP loss');
  ok(/💡/.test(el('loop-help').innerHTML)&&/lv-line/.test(el('loop-help').innerHTML),'first wrong: hint with picture (number line)');
  ok(!/<strong>13<\/strong>/.test(el('loop-help').innerHTML)&&!/13/.test(el('fb-box').innerHTML),'first wrong: answer not shown');
  ans(13);s=S();e=s.questions[0];
  ok(s.answered&&s.idx===1&&s.questions.length===1,'second try resolves the question');
  ok(e.fixed===true&&e.ok===false&&e.last===13&&s.score===0,'right on second try: fixed=true, ok=false, not counted in score');
  ok(s.enemyHp<100&&s.playerHp===100,'fixed answer still hits the enemy');
  ok(/Du fant det selv/.test(el('fb-box').innerHTML),'fixed answer praised');
  // to feil → fasit + kort forklaring + bilde, HP-tap, revansj i kø
  R('handleNext()');
  setQ({q:'9 - 3 = ?',ans:6,type:'Minus',sub:'9-3',strat:'tenk-pluss',ops:{a:9,b:3,op:'-'}});
  ans(7);ok(!S().answered,'9 - 3: first wrong keeps question open');
  ans(5);s=S();e=s.questions[1];
  ok(s.answered&&s.idx===2&&e.ok===false&&e.fixed===false,'two wrongs: resolved, not fixed');
  ok(s.playerHp===92,'two wrongs: HP loss only once');
  const fbh=el('fb-box').innerHTML;
  ok(/<strong>6<\/strong>/.test(fbh)&&/loop-vis/.test(fbh)&&/Se her/.test(fbh),'two wrongs: answer, picture and title shown');
  ok(words(fbh.replace(/<div class="loop-(vis|again)">[\s\S]*$/,''))<=12,'two wrongs: feedback is short');
  ok(s.lp&&s.lp.rev.length===2&&s.lp.rev.every(r=>r.at>=s.idx),'missed questions queued for revenge (also fixed ones)');
  // valg: 2 valg → fasit med en gang; 3 valg → nytt forsøk
  R("startGame(1,'add10')");
  setQ({q:'7 + 5 = 12. Stemmer det?',ans:'Ja',choices:['Ja','Nei'],sub:'tf'});R("submitChoice('Nei',null)");
  ok(S().answered&&S().questions[0].ok===false,'2 choices: wrong answer resolves at once');
  R('handleNext()');
  setQ({q:'Hvilken er størst?',ans:'9',choices:['3','9','5'],sub:'cmp'});R("submitChoice('3',null)");
  ok(!S().answered,'3 choices: first wrong gives a new try');
  R("submitChoice('9',null)");ok(S().answered&&S().questions[1].fixed===true,'3 choices: right on second try is fixed');
  // 3. klasse og oppover: hint fra qd.hint
  R("startGame(4,'mul110')");setQ({q:'7 · 8 = ?',ans:56,type:'Ganging',hint:'8-gangen',sub:'x8'});ans(54);
  ok(!S().answered&&/8-gangen/.test(el('loop-help').innerHTML),'grade 4: retry with qd.hint');

  // ---- Revansj: kommer 2–3 oppgaver senere, maks 2 per runde, runden er alltid 8 ----
  ls.clear();
  let revPosOK=true,revMax=0,len8=true;
  for(let r=0;r<40;r++){
    let missAt=-1;
    const qs=round(1,'add10',(q,t)=>{const i=S().idx;if(missAt<0&&i===1){missAt=i;}return i===1&&!q.revenge?wrongOf(q):right(q);});
    len8=len8&&qs.length===8;
    const rv=qs.map((x,i)=>x.revenge?i:-1).filter(i=>i>=0);
    revMax=Math.max(revMax,rv.length);
    if(!(rv.length===1&&(rv[0]===3||rv[0]===4)&&qs[rv[0]].k===qs[1].k))revPosOK=false;
  }
  ok(len8,'round is always 8 questions');
  ok(revPosOK,'missed question 2 comes back as revenge at question 4 or 5');
  ok(revMax<=1,'revenge only for missed questions');
  let revAll=0,revRounds=0;
  for(let r=0;r<30;r++){const qs=round(1,'sub10',(q,t)=>wrongOf(q));const n=qs.filter(x=>x.revenge).length;revAll=Math.max(revAll,n);if(n===2)revRounds++;ok(qs.length===8,'all wrong: still 8 questions');}
  ok(revAll===2&&revRounds>20,'max 2 revenges per round');
  ok(R('S').enemyDefeated===false,'no K.O. when everything is wrong');

  // ---- K.O. først på siste oppgave ----
  ls.clear();
  {let early=false;R("startGame(1,'add10')");for(let i=0;i<8;i++){ans(right(S().current));if(i<7&&S().enemyDefeated)early=true;if(i<7)R('handleNext()');}
   ok(!early&&S().enemyDefeated&&S().idx===8,'perfect round: K.O. on the last question, not before');}

  // ---- Autoneste etter riktig svar, ikke etter feil eller siste ----
  {const orig=ctx.setTimeout,cbs=[];ctx.setTimeout=(f,ms)=>{cbs.push({f,ms});return cbs.length;};
   el('screen-game').classList={add(){},remove(){},toggle(){},contains(){return true;}};
   try{
     R("startGame(1,'add10')");cbs.length=0;ans(right(S().current));
     const a=cbs.filter(c=>c.ms===1200);ok(a.length===1&&S()._autoT,'autonext armed after a right answer');
     if(a[0])a[0].f();ok(S().idx===1&&!S().answered,'autonext loads the next question');
     cbs.length=0;ans(wrongOf(S().current));ans(wrongOf(S().current));ok(!cbs.some(c=>c.ms===1200),'no autonext after two wrongs');
     R('handleNext()');cbs.length=0;ans(right(S().current));const b=cbs.filter(c=>c.ms===1200);R('handleNext()');const i2=S().idx;if(b[0])b[0].f();
     ok(S().idx===i2&&!S().answered,'tap skips the wait (timer does nothing afterwards)');
     for(let i=S().idx;i<8;i++){cbs.length=0;ans(right(S().current));if(i<7)R('handleNext()');}
     ok(!cbs.some(c=>c.ms===1200)&&S().idx===8,'no autonext after the last question');
   }finally{ctx.setTimeout=orig;el('screen-game').classList={add(){},remove(){},toggle(){},contains(){return false;}};}}

  // ---- Fordeling i runden: ingen gjentakelse, maks én 0-oppgave, første oppgave ikke svak ----
  for(const g of [1,2])for(const id of IDS[g]){
    ls.clear();let dup=0,zero=0;
    for(let r=0;r<25;r++){
      const qs=round(g,id,(q,t)=>Math.random()<.8?right(q):wrongOf(q));
      const ks=qs.filter(x=>!x.revenge).map(x=>x.k);if(new Set(ks).size<ks.length)dup++;
      if(qs.filter(x=>!x.revenge&&x.z).length>1)zero++;
    }
    ok(dup===0,`${id}: no repeated fact in a round`);
    ok(zero===0,`${id}: at most one 0-question per round`);
  }
  // Tak på svake familier: barnet bommer alltid på tierovergang i add20
  ls.clear();
  {let over=0,first=0,sumW=0;const cross=q=>q.ops&&q.ops.op==='+'&&Math.max(q.ops.a,q.ops.b)<10&&q.ops.a+q.ops.b>10;
   for(let r=0;r<40;r++){const qs=round(1,'add20',(q,t)=>cross(q)?q.ans+1:q.ans);const w=qs.filter(x=>!x.revenge&&x.w).length;sumW+=w;if(w>3)over++;if(qs[0].w)first++;}
   ok(over===0,'add20: at most 3 of 8 from weak families');
   ok(first===0,'first question of a round is never from a weak family');
   ok(sumW/40>=2.2,`add20: weak families still practised (${(sumW/40).toFixed(1)} per round)`);}
  // Kort hukommelse: feilrate over de siste 8
  ls.clear();
  for(let i=0;i<10;i++)R(`recordAttempt(1,'add20','a20o',${i>=5})`);
  ok(Math.abs(R("errRate(1,'add20','a20o')")-3/8)<1e-9,'errRate uses last 8 attempts');
  ls.set('adapt_1_add20_a20n',JSON.stringify({a:10,e:5}));
  ok(Math.abs(R("errRate(1,'add20','a20n')")-.5)<1e-9,'errRate keeps working for old saves without r');
  for(let i=0;i<8;i++)R(`famRecord(1,'add20','over-tier',false)`);
  ok(R("famWeak(1,'add20','over-tier')")===true,'famWeak after misses');
  for(let i=0;i<6;i++)R(`famRecord(1,'add20','over-tier',true)`);
  ok(R("famWeak(1,'add20','over-tier')")===false,'famWeak forgets after 6 right (short memory)');

  // ---- Feiltyper ----
  const M=[[{ans:25,ops:{a:42,b:17,op:'-'}},35,'veksling'],[{ans:13,ops:{a:8,b:5,op:'+'}},31,'snudd'],[{ans:17,ops:{a:9,b:8,op:'+'}},71,'snudd'],
    [{ans:5,ops:{a:8,b:3,op:'-'}},11,'pluss'],[{ans:8,ops:{a:5,b:3,op:'+'}},7,'starttall'],[{ans:6,ops:{a:9,b:3,op:'-'}},7,'starttall'],
    [{ans:13,ops:{a:8,b:5,op:'+'}},3,'minus'],[{ans:6,ops:{a:12,op:'half'}},24,'dobbel'],[{ans:12,ops:{a:7,b:5,op:'+'}},22,'ti'],
    [{ans:5,ops:{a:4,b:5,op:'+',unk:'b'}},13,'pluss'],[{ans:15,ops:{a:3,b:5,op:'·'}},8,'pluss'],[{ans:8,ops:{a:13,b:5,op:'-'}},12,'veksling'],
    [{ans:7,ops:{a:15,b:8,op:'-'}},23,'pluss'],[{ans:30,ops:{a:50,b:20,op:'-'}},31,'en'],[{ans:9,ops:{a:4,b:5,op:'+'}},9,null],[{ans:'Ja'},'Nei',null]];
  for(const [qd,gv,want] of M)ok(detectMisc(qd,gv)===want,`detectMisc ${JSON.stringify(qd.ops)} ${gv} -> ${want} (got ${detectMisc(qd,gv)})`);
  // feiltypen gir målrettet hint
  R("startGame(2,'sub100')");setQ({q:'42 - 17 = ?',ans:25,type:'Minus',sub:'s100x',strat:'veksling',ops:{a:42,b:17,op:'-'}});ans(35);
  ok(/Veksle en tier/.test(el('loop-help').innerHTML)&&/lv-blocks/.test(el('loop-help').innerHTML),'veksling: targeted hint with blocks');

  // ---- Alle oppgaver i 1.–2. klasse: strat, ops som stemmer, say uten emoji, hint og bilder ----
  const opsAns=o=>o.op==='+'?(o.unk==='a'?o.a:o.unk==='b'?o.b:o.a+o.b):o.op==='-'?(o.unk==='b'?o.b:o.a-o.b):o.op==='seq'?o.a+o.i*o.b:o.op==='dbl'?2*o.a:o.op==='half'?o.a/2:o.op==='·'?o.a*o.b:NaN;
  for(const g of [1,2])for(const id of IDS[g]){
    const t=CUR[g].topics.find(x=>x.id===id);ls.clear();
    for(let i=0;i<400;i++){
      const qd=t.gen(g,id);
      ok(typeof qd.strat==='string'&&qd.strat.length>0,`${id}: strat missing`);
      ok(qd.ops&&opsAns(qd.ops)===qd.ans,`${id}: ops do not match answer (${qd.q})`);
      if(PIC.test(qd.q))ok(typeof qd.say==='string'&&qd.say.length>5&&!PIC.test(qd.say)&&!BAD.test(qd.say),`${id}: say missing or has emoji (${qd.q} -> ${qd.say})`);
      if(qd.vis)ok(renderVis(qd.vis).length>0,`${id}: question picture not rendered`);
      const wrongs=[qd.ans+1,Math.max(0,qd.ans-1),qd.ans+10,+String(qd.ans).split('').reverse().join('')];
      if(qd.ops&&qd.ops.op==='-')wrongs.push(qd.ops.a+qd.ops.b);
      for(const w of wrongs){if(w===qd.ans)continue;
        const m=detectMisc(qd,w),h=loopHint(qd,w,m);
        ok(typeof h.t==='string'&&h.t.length>3&&!BAD.test(h.t),`${id}: bad hint text (${qd.q}, ${w}): ${h.t}`);
        ok(words(h.t)<=9,`${id}: hint too long: ${h.t}`);
        ok(!new RegExp(`(^|[^\\d])${qd.ans}([^\\d]|$)`).test(h.t)||qd.ans<=2||/\+ \?|\?/.test(h.t)||qd.ops.op==='seq'||qd.ops.unk||/tiere|Tiere|enerne/.test(h.t)||qd.ops.op==='-'||qd.ops.op==='half',`${id}: hint gives the answer: ${qd.q} -> ${h.t}`);
        ok(h.v&&renderVis(h.v).length>20&&!BAD.test(renderVis(h.v)),`${id}: hint has no picture (${qd.q}, ${w})`);
      }
      const rv=loopReveal(qd);ok(rv&&renderVis(rv).length>20,`${id}: reveal has no picture`);
      // kort tilbakemelding når svaret vises (1.–2. klasse)
      R('S').grade=g;R('S').current=Object.assign({},qd,{givenTxt:String(qd.ans+1)});
      const fb=t.fb(qd.q,qd.ans+1,qd.ans);
      ok(fb.includes(`<strong>${qd.ans}</strong>`),`${id}: kid fb does not show answer`);
      ok(words(fb)<=10,`${id}: kid fb too long: ${fb}`);
      ok(!/Du svarte|undefined|NaN/.test(fb),`${id}: kid fb bad: ${fb}`);
    }
  }
  R('S').grade=null;R('S').current=null;
  // say for emoji
  ok(R("funSay('Du har 1 🍎. Du får 3 til. Hvor mange nå?')")==='Du har 1 eple. Du får 3 til. Hvor mange nå?','funSay singular');
  ok(R("funSay('🍪🍪 + 🍪🍪🍪 = ?')")==='Tell kakene. Hvor mange er det til sammen?','funSay emoji sum');
  ok(R("funSay('Du ser 4 🖐️ med 5 fingre. Hvor mange fingre?')")==='Du ser 4 hender med 5 fingre. Hvor mange fingre?','funSay with variation selector');

  // ---- Bilder ----
  const V=[{kind:'tenframe',a:8,b:5},{kind:'tenframe',a:10,cross:3},{kind:'tenframe',a:7,b:7,split:true},{kind:'dots',g:[3,4],op:'+'},{kind:'dots',g:[6],cross:2,emoji:'🍪'},
    {kind:'line',from:0,to:10,start:4,hops:[1,1,1],endLab:'?'},{kind:'line',from:20,to:45,start:42,hops:[-10,-2,-5],hopLab:['-10','-2','-5'],endLab:'?'},{kind:'blocks',a:42,cross:17},{kind:'blocks',a:34,b:25}];
  for(const v of V){const h=renderVis(v);ok(h.length>40&&!BAD.test(h),`VIS.${v.kind} renders`);}
  ok((renderVis({kind:'tenframe',a:8,b:5}).match(/lv-c lv-/g)||[]).length===13,'tenframe has 13 dots');
  ok((renderVis({kind:'tenframe',a:10,cross:3}).match(/lv-x/g)||[]).length===3,'tenframe crosses 3');
  ok(/>\?</.test(renderVis({kind:'line',from:0,to:10,start:4,hops:[1,1,1],endLab:'?'}))&&!/>7</.test(renderVis({kind:'line',from:0,to:10,start:4,hops:[1,1,1],endLab:'?'})),'line hides the landing number');
  {const h=renderVis({kind:'blocks',a:42,cross:17});ok((h.match(/class="lv-ten /g)||[]).length===3&&(h.match(/class="lv-one /g)||[]).length===12&&(h.match(/lv-x/g)||[]).length===8,'blocks exchange one ten for 42 - 17');}

  // ---- Statistikk (mh_stats) ----
  ls.clear();
  ls.set('mh_stats',JSON.stringify({'2000-01-01':{ms:1,n:1,ok:1,t:{},m:{}}}));
  R("startGame(1,'add10')");
  setQ({q:'5 + 3 = ?',ans:8,type:'Pluss',sub:'5+3',strat:'tell-videre',ops:{a:5,b:3,op:'+'},_t0:Date.now()-90000});ans(7);ans(8);R('handleNext()');
  setQ({q:'4 + 2 = ?',ans:6,type:'Pluss',sub:'4+2',strat:'pluss1',ops:{a:4,b:2,op:'+'},_t0:Date.now()-3000});ans(6);
  {const st=JSON.parse(ls.get('mh_stats')),d=st[R('mhDay()')];
   ok(!st['2000-01-01'],'mh_stats keeps only the last 60 days');
   ok(d&&d.n===2&&d.ok===1,'mh_stats counts questions and first-try right');
   ok(d&&d.t['1:add10']&&d.t['1:add10'][0]===2&&d.t['1:add10'][1]===1,'mh_stats per topic');
   ok(d&&d.m.starttall===1,'mh_stats logs misconception');
   ok(d&&d.ms>=60000&&d.ms<=65000,'mh_stats active time capped at 60 s per question');}

  // ---- Boss: samme løkke, bossAfterAnswer bare når oppgaven er ferdig, revansj i riktig tema ----
  if(typeof R('typeof startBoss')==='string'&&R('typeof startBoss')==='function'){
    ls.clear();R('startBoss(1)');
    // fast tall-oppgave fra «Pluss til 10» (bossen kan ellers starte med en Ja/Nei-oppgave)
    R("S.bossTopic=CUR[1].topics.find(t=>t.id==='add10');S.topicId='add10';S.current=S.bossTopic.gen(1,'add10');S.current.choices=null");
    const pts0=S().bossPts,q0=S().current,tid0=S().topicId;
    ans(wrongOf(q0));
    ok(!S().answered&&Object.keys(S().bossStats).length===0,'boss: first wrong does not count as a boss answer yet');
    ans(right(q0));
    ok(S().answered&&S().bossStats[tid0]&&S().bossStats[tid0].n===1&&S().bossStats[tid0].ok===0,'boss: fixed answer counts as not first-try');
    ok(S().bossPts===pts0,'boss: no damage on second try');
    let found=false;
    for(let i=0;i<4&&!found;i++){R('handleNext()');const q=S().current;if(q.revenge){found=true;ok(S().topicId===tid0&&S().bossTopic&&S().bossTopic.id===tid0,'boss: revenge restores the topic');}ans(right(q));}
    ok(found,'boss: revenge comes back');
    ok(S().bossPts<pts0,'boss: first-try right hits the boss');
    R('bossCleanup()');
  }

  // ---- Minioppgave (mhMini fra C): maks én per runde, ikke i boss ----
  {const had=Object.prototype.hasOwnProperty.call(ctx,'mhMini'),orig=ctx.mhMini;
   ctx.mhMini=(qd,g,id)=>qd&&qd.ops&&qd.ops.op==='+'?{q:`Stemmer det? ${qd.ops.a} + ${qd.ops.b} = ${qd.ans}`,ans:'Ja',choices:['Ja','Nei'],sub:'tf',type:'Stemmer det?'}:null;
   try{ls.clear();let one=true;for(let r=0;r<20;r++){const qs=round(1,'add10',q=>right(q));if(qs.filter(x=>x.mini).length!==1)one=false;}
     ok(one,'exactly one mini question per round in grade 1');
     ls.clear();R("startGame(3,'mul15')");let none=true;for(let i=0;i<8;i++){if(S().current.mini)none=false;ans(right(S().current));if(i<7)R('handleNext()');}
     ok(none,'no mini question in grade 3');}
   finally{if(had)ctx.mhMini=orig;else delete ctx.mhMini;}}
  ls.clear();
};
