// Tester for hint, hjelp og tilbakemelding i 1.–2. klasse (bølge 3, F2):
// hint røper aldri svaret, why-hint for alle distraktorer, korte tilbakemeldinger, feiltyper, bilder til historier og hint.
module.exports=function({R,ok,CUR,ls}){
  const detectMisc=R('detectMisc'),loopHint=R('loopHint'),loopReveal=R('loopReveal'),renderVis=R('renderVis'),MN=R('window.MISC_NAMES');
  const plain=h=>String(h).replace(/<[^>]*>/g,' ').replace(/\p{Extended_Pictographic}️?/gu,'').replace(/\s+/g,' ').trim();
  const wc=s=>plain(s).split(' ').filter(w=>/[\p{L}\d]/u.test(w)).length;          // som fbwords.js: ord og tall
  const lw=s=>plain(s).split(' ').filter(w=>/\p{L}/u.test(w)).length;               // bare ord
  const BAD=/undefined|NaN|Infinity|\[object|\bnull\b/;
  const isCh=q=>Array.isArray(q.choices)&&q.choices.length>0,key=q=>String(q.ansTxt??q.ans);
  const num=n=>new RegExp(`(?<![0-9])${n}(?![0-9])`);
  const setLvl=(g,id,s,idx)=>{ls.clear();if(s)ls.set('mh_learn',JSON.stringify({[g+':'+id]:{r:[],s}}));R(`S={grade:${g},topicId:'${id}',topic:CUR[${g}].topics.find(t=>t.id==='${id}'),questions:[],idx:${idx},score:0,streak:0,combo:0,current:null,answered:false}`);};
  // Typiske feilsvar for en tall-oppgave
  function wrongs(qd){const a=qd.ans,o=qd.ops||{},x=qd.x||{},w=[a+1,a-1,a+2,a-2,a+10,a-10];
    if(a>=12&&a<100)w.push(+String(a).split('').reverse().join(''));
    if(o.op==='-'&&!o.unk)w.push(o.a+o.b);
    if(o.op==='+'&&o.unk)w.push((o.unk==='a'?o.b:o.a)+o.a+o.b);
    if(o.op==='+'&&!o.unk)w.push(Math.abs(o.a-o.b));
    if(x.lv!=null){w.push(x.lv,x.lv+x.c);}
    if(a>=20&&a%10===0)w.push(a/10);
    return [...new Set(w)].filter(v=>v>=0&&v!==a&&Number.isInteger(v));}

  // ---- 1) Alle temaer i 1.–2. klasse: hint og tilbakemelding ----
  const stat={leakEq:0,leakMiss:0,longHint:0,noPic:0,noWhy:0,whyLeak:0,whyLong:0,whyBad:0,fbLong:0,n:0,ch:0};const ex={};
  const note=(k,s)=>{(ex[k]=ex[k]||[]);if(ex[k].length<3)ex[k].push(s);};
  for(const g of [1,2])for(const t of CUR[g].topics)for(const s of [0,1,2])for(const idx of [0,4,7])for(let i=0;i<60;i++){
    setLvl(g,t.id,s,idx);const qd=t.gen(g,t.id);R('S').current=qd;const qtxt=`${qd.q} ${qd.eq||''}`;
    if(isCh(qd)){stat.ch++;const k=key(qd);
      for(const d of qd.choices.map(String).filter(c=>c!==k)){
        // tilbakemeldingen når svaret vises (alle valgoppgaver)
        R('S').current=Object.assign({},qd,{givenTxt:d});const fb=t.fb(qd.q,d,qd.ans);if(wc(fb)>12){stat.fbLong++;note('fb',`${t.id}: ${plain(fb)}`);}
        if(qd.choices.length<3)continue; // to valg: fasit vises med en gang, ingen nytt forsøk
        const w=qd.why&&qd.why[d];
        if(!w){stat.noWhy++;note('why',`${t.id}/${qd.sub}: ${qd.q} → ${d}`);continue;}
        const h=loopHint(qd,d,detectMisc(qd,d));
        if(h.t!==w||BAD.test(w))stat.whyBad++;
        if(lw(w)>10){stat.whyLong++;note('whyLong',w);}
        const kr=new RegExp('(?<![\\p{L}\\d])'+k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(?![\\p{L}\\d])','iu'),leak=kr.test(w)&&!kr.test(qtxt);
        if(leak){stat.whyLeak++;note('whyLeak',`${qd.q} (${k}) → ${w}`);}
        const m=qd.whyM&&qd.whyM[d];if(m)ok(!!MN[m],`fix: whyM ${m} finnes ikke i MISC_NAMES`);
        if(m)ok(detectMisc(qd,d)===m,`fix: detectMisc bruker whyM (${qd.sub})`);
        if(h.v)ok(renderVis(h.v).length>40,`fix: why-bilde tegnes ikke (${qd.sub} ${JSON.stringify(h.v)})`);
        if(qd.hint)ok(w.replace(/[.!]$/,'')!==qd.hint.replace(/[.!]$/,''),`fix: why-hint er bare oppgavens hint (${qd.sub})`);
      }
      continue;}
    for(const v of wrongs(qd)){stat.n++;
      const m=detectMisc(qd,v),h=loopHint(qd,v,m),e=qd.eq||qd.q,miss=/\?/.test(e.replace(/= \?$/,''));
      ok(typeof h.t==='string'&&h.t.length>3&&!BAD.test(h.t),`fix: dårlig hint ${t.id}: ${e} (${v}) → ${h.t}`);
      if(new RegExp(`= ${qd.ans}(?![0-9])`).test(h.t)){stat.leakEq++;note('leakEq',`${e} (${v}) → ${h.t}`);}
      if(miss&&num(qd.ans).test(h.t)&&!num(qd.ans).test(qtxt)){stat.leakMiss++;note('leakMiss',`${e} (${v}) → ${h.t}`);}
      if(lw(h.t)>10){stat.longHint++;note('long',h.t);}
      if(!h.v||renderVis(h.v).length<=40){stat.noPic++;note('noPic',`${t.id}: ${e} (${v}) → ${h.t}`);}
      R('S').current=Object.assign({},qd,{givenTxt:String(v)});const fb=t.fb(qd.q,v,qd.ans);
      ok(fb.includes(`<strong>${qd.ans}</strong>`),`fix: fb viser ikke svaret ${t.id}: ${fb}`);
      if(wc(fb)>12){stat.fbLong++;note('fb',`${t.id}: ${plain(fb)}`);}
    }
  }
  ok(stat.n>5000&&stat.ch>1000,`fix: for få oppgaver testet (${stat.n} tall, ${stat.ch} valg)`);
  ok(stat.leakEq===0,`fix: hint inneholder «= svar» ${stat.leakEq} ganger: ${(ex.leakEq||[]).join(' | ')}`);
  ok(stat.leakMiss===0,`fix: hint røper svaret når et ledd mangler ${stat.leakMiss} ganger: ${(ex.leakMiss||[]).join(' | ')}`);
  ok(stat.longHint===0,`fix: hint over 10 ord ${stat.longHint}: ${(ex.long||[]).join(' | ')}`);
  ok(stat.noPic===0,`fix: hint uten bilde ${stat.noPic}: ${(ex.noPic||[]).join(' | ')}`);
  ok(stat.noWhy===0,`fix: distraktor uten why-hint ${stat.noWhy}: ${(ex.why||[]).join(' | ')}`);
  ok(stat.whyBad===0,'fix: loopHint bruker ikke why-hintet');
  ok(stat.whyLeak===0,`fix: why-hint røper svaret ${stat.whyLeak}: ${(ex.whyLeak||[]).join(' | ')}`);
  ok(stat.whyLong===0,`fix: why-hint over 10 ord: ${(ex.whyLong||[]).join(' | ')}`);
  ok(stat.fbLong===0,`fix: tilbakemelding over 12 ord ${stat.fbLong}: ${(ex.fb||[]).join(' | ')}`);

  // Minioppgaver: kort tilbakemelding
  {const mhMini=R('mhMini');let long=0,n=0;for(const [g,id] of [[1,'add10'],[1,'sub20'],[2,'add100'],[2,'dbl2']]){const t=CUR[g].topics.find(x=>x.id===id);
    for(let i=0;i<200;i++){setLvl(g,id,1,3);const q=t.gen(g,id);if(isCh(q))continue;const m=mhMini(q,g,id);if(!m)continue;n++;const w=m.choices.map(String).find(c=>c!==String(m.ans));R('S').current=Object.assign({},m,{givenTxt:w});if(wc(t.fb(m.q,w,m.ans))>12)long++;}}
   ok(n>100&&long===0,`fix: minioppgave-tilbakemelding over 12 ord (${long} av ${n})`);}

  // ---- 2) Feiltyper (detectMisc) ----
  const M=[[{ans:13,ops:{a:8,b:5,op:'+'}},12,'en'],[{ans:11,ops:{a:8,b:3,op:'+'}},10,'starttall'],[{ans:52,ops:{a:47,b:5,op:'+'}},51,'en'],
    [{ans:1,ops:{a:9,b:8,op:'-'}},2,'en'],[{ans:6,ops:{a:9,b:3,op:'-'}},7,'starttall'],[{ans:8,ops:{a:13,b:5,op:'-'}},12,'veksling'],
    [{ans:3,ops:{a:4,b:3,op:'+',unk:'b'}},11,'pluss'],[{ans:60,ops:{a:60,b:5,op:'+',unk:'a'}},6,'plass'],[{ans:70,ops:{a:30,b:40,op:'+'}},7,'plass'],
    [{ans:2,strat:'likhet',ops:{a:5,b:2,op:'+',unk:'b'},x:{l:'4 + 3',lv:7,c:5}},7,'likhet'],[{ans:2,strat:'likhet',ops:{a:5,b:2,op:'+',unk:'b'},x:{l:'4 + 3',lv:7,c:5}},12,'likhet'],
    [{ans:'Halv 4',choices:['Halv 3','Halv 4','Klokka 3'],whyM:{'Halv 3':'halvtime'}},'Halv 3','halvtime'],[{ans:'Ja',choices:['Ja','Nei']},'Nei',null]];
  for(const [qd,gv,want] of M)ok(detectMisc(qd,gv)===want,`fix: detectMisc ${JSON.stringify(qd.ops||qd.choices)} ${gv} → ${want} (fikk ${detectMisc(qd,gv)})`);
  ok(Object.keys(MN).every(k=>R(`!!(PAR_MISC['${k}']&&PAR_MISC['${k}'][1])`)),'fix: nye feiltyper har tips på foreldresiden');

  // ---- 3) Målrettede hint ----
  R('S').grade=1;
  let h=loopHint({q:'8 + 3 = ?',ans:11,ops:{a:8,b:3,op:'+'},strat:'over-tier'},10,'starttall');
  ok(/Fyll tieren/.test(h.t)&&h.v&&h.v.kind==='tenframe','fix: tierovergang i 1. kl.: tierrammen er hovedhintet også ved starttall');
  h=loopHint({q:'13 - 5 = ?',ans:8,ops:{a:13,b:5,op:'-'},strat:'under-tier'},9,null);
  ok(h.v&&h.v.kind==='tenframe'&&h.v.cross===5&&!num(8).test(h.t),`fix: minus forbi tieren i 1. kl. med tierramme: ${h.t}`);
  h=loopHint({q:'13 - 5 = ?',ans:8,ops:{a:13,b:5,op:'-'}},12,'veksling');
  ok(/Du tok 3 fra 5/.test(h.t)&&/13 - 3 - 2/.test(h.t),`fix: veksling 1. kl.: ${h.t}`);
  h=loopHint({q:'42 - 17 = ?',ans:25,ops:{a:42,b:17,op:'-'}},35,'veksling');
  ok(/Du kan ikke ta 7 fra 2 enere/.test(h.t)&&/Veksle en tier: 12 - 7/.test(h.t)&&h.v.kind==='blocks',`fix: veksling 2. kl.: ${h.t}`);
  for(const [a,b] of [[74,10],[17,10],[76,20],[12,10]]){h=loopHint({q:`${a} - ${b} = ?`,ans:a-b,ops:{a,b,op:'-'}},a-b+1,null);
    ok(!num(a-b).test(h.t)&&/tier/.test(h.t)&&h.v.kind==='blocks'&&h.v.cross===b,`fix: hel tier i minus uten svar: ${a} - ${b} → ${h.t}`);}
  h=loopHint({q:'Hva er 10 mer enn 59?',eq:'59 + 10 = ?',ans:69,ops:{a:59,b:10,op:'+'}},70,null);
  ok(!num(69).test(h.t)&&/tier/.test(h.t),`fix: 10 mer uten svar: ${h.t}`);
  h=loopHint({q:'Klokka er 9. Hva er klokka om 2 timer?',eq:'9 + 2 = ?',ans:11,ops:{a:9,b:2,op:'+'},strat:'klokke-tid',x:{h:9,k:2}},9,null);
  ok(/Start på 9/.test(h.t)&&h.v&&h.v.kind==='clock'&&!num(11).test(h.t),`fix: klokkehistorie: hint med klokke (${h.t})`);
  ok(loopReveal({ops:{a:9,b:2,op:'+'},strat:'klokke-tid',x:{h:9,k:2}}).list.length===2,'fix: klokkehistorie: klokka før og etter når svaret vises');
  h=loopHint({q:'Halvparten av 8 = ?',ans:4,ops:{a:8,op:'half'}},5,null);
  ok(h.v.kind==='dots'&&h.v.g.length===4&&h.v.g.every(x=>x===2)&&h.v.mono,'fix: halvering: alle prikkene i par, barnet deler selv');
  ok(loopReveal({ops:{a:8,op:'half'}}).g.join()==='4,4','fix: halvering: to grupper først når svaret vises');
  h=loopHint({q:'4 + 4 = ?',ans:8,ops:{a:4,b:4,op:'+'},strat:'dobbel'},9,null);
  ok(/fire fingre på hver hånd/.test(h.t),`fix: dobler med fingre: ${h.t}`);
  h=loopHint({q:'0, ?, 10, 15',ans:5,ops:{op:'seq',a:0,b:5,i:1}},6,null);
  ok(!num(5).test(h.t),`fix: tallrekke der hoppet er lik svaret: ${h.t}`);
  h=loopHint({q:'Du har 9 🍎. Vennen din har 4. Hvor mange flere har du?',eq:'9 - 4 = ?',ans:5,ops:{a:9,b:4,op:'-'}},13,'pluss');
  ok(!/Minus betyr/.test(h.t)&&/ta bort/.test(h.t),`fix: «la sammen» i en historie uten minustegn: ${h.t}`);

  // ---- 4) Generatorene ----
  const T=(g,id)=>CUR[g].topics.find(t=>t.id===id);
  const many=(g,id,s,idx,n,f)=>{const out=[];for(let i=0;i<n;i++){setLvl(g,id,s,idx);out.push(T(g,id).gen(g,id));}return f?out.filter(f):out;};
  // eq = q på «8 = 5 + ?» og «65 = 60 + ?», så resultatlisten ikke snur likheten
  {const e=many(1,'eq1',0,3,400,q=>q.sub==='e1l'),p=many(2,'place2',2,3,600,q=>q.sub==='p2d');
   ok(e.length>20&&e.every(q=>q.eq===q.q&&/^\d+ = /.test(q.q)&&q.ops.unk),'fix: e1l: eq = q og unk');
   ok(p.length>20&&p.every(q=>q.eq===q.q&&/^\d+ = /.test(q.q)&&q.ops.unk&&(q.ops.unk==='a'?q.ops.a:q.ops.b)===q.ans),'fix: p2d: eq = q og unk');
   const m=many(2,'money2',2,3,600,q=>q.sub==='m2m');ok(m.length>20&&m.every(q=>q.ops.unk==='b'&&q.ops.b===q.ans),'fix: m2m: unk');}
  // eq1: e1b er tall-oppgave fra nivå 1; færre Ja/Nei
  {const b0=many(1,'eq1',0,3,500,q=>q.sub==='e1b'),b1=many(1,'eq1',1,3,500,q=>q.sub==='e1b');
   ok(b0.length&&b0.every(isCh)&&b0.every(q=>Object.keys(q.why).length===2),'fix: e1b på nivå 0: tre valg med why');
   ok(b1.length&&b1.every(q=>!isCh(q)&&q.ops.unk==='b'&&q.ops.a+q.ops.b===q.x.lv),'fix: e1b fra nivå 1: tall-oppgave');
   const two=(g,id,s)=>{const qs=many(g,id,s,3,800);return qs.filter(q=>isCh(q)&&q.choices.length<=2).length/qs.length;};
   ok(two(1,'eq1',0)<.5&&two(1,'eq1',1)<.45&&two(1,'eq1',2)<.35,`fix: eq1 andel tovalg ${[0,1,2].map(s=>two(1,'eq1',s).toFixed(2))}`);
   ok(many(2,'even2',1,3,600,q=>q.sub==='o2s').length===0&&many(2,'even2',2,3,600,q=>q.sub==='o2s').length>0,'fix: o2s bare på nivå 2');
   ok(two(2,'even2',1)<.45,`fix: even2 andel tovalg ${two(2,'even2',1).toFixed(2)}`);}
  // Trapp i Pluss og Minus til 10: de 2 første rundene ved 0⭐ bare små tall
  {const a=many(1,'add10',0,3,300),s=many(1,'sub10',0,3,300);
   ok(a.every(q=>q.ops.a+q.ops.b<=6),'fix: add10 de første rundene: sum ≤ 6');
   ok(s.every(q=>q.ops.a<=6&&q.ops.b<=3),'fix: sub10 de første rundene: a ≤ 6 og b ≤ 3');
   const big=(id,f)=>{let n=0;for(let i=0;i<300;i++){ls.clear();ls.set('mh_learn',JSON.stringify({[`1:${id}`]:{r:[['2026-11-01',5,8],['2026-11-01',4,8]],s:0}}));R(`S={grade:1,topicId:'${id}',questions:[],idx:3}`);if(f(T(1,id).gen(1,id)))n++;}return n;};
   ok(big('add10',q=>q.ops.a+q.ops.b>6)>50&&big('sub10',q=>q.ops.a>6||q.ops.b>3)>50,'fix: add10/sub10 etter 2 runder: vanlige tall');}
  // Bilde til historier og tekstoppgaver i 1. klasse; størst og minst med ikon
  {let miss=0,n=0;const bad=[];
   for(const t of CUR[1].topics)for(const s of [0,2])for(const q of many(1,t.id,s,3,300)){
     const story=!!q.eq&&q.eq!==q.q&&!/^[^\d]+ [+-] [^\d]+ = \?$/u.test(q.q)&&!/\d+, /.test(q.q); // emoji-regnestykket er selv et bilde; tallrekker er tall
     if(story||/^Hvilket tall er|^Er \d+ (større|mindre)/.test(q.q)){n++;if(!q.vis||!renderVis(q.vis)){miss++;if(bad.length<3)bad.push(q.q);}}}
   ok(n>300&&miss===0,`fix: historier i 1. kl. uten bilde ${miss} av ${n}: ${bad.join(' | ')}`);
   const c=many(1,'cmp1',2,3,400,q=>/^Hvilket tall er/.test(q.q));
   ok(c.length>20&&c.every(q=>q.vis.kind==='cue'&&q.vis.w===(/minst/.test(q.q)?'minst':'størst')),'fix: størst/minst med ikon');
   ok(/🐘/.test(renderVis({kind:'cue',w:'størst'}))&&/🐭/.test(renderVis({kind:'cue',w:'minst'}))&&/MINST/.test(renderVis({kind:'cue',w:'minst'})),'fix: VIS.cue tegner elefant og mus');}
  // Klokka: halv-feilen peker på den korte viseren, og viseren blinker i hintbildet
  {const k=many(1,'clock1',2,3,600,q=>q.sub==='k1t');let okk=k.length>10;
   for(const q of k){const d=q.choices.find(c=>/^Halv/.test(c)&&c!==q.ans);if(!d){okk=false;continue;}const hh=loopHint(q,d,detectMisc(q,d));
     if(!/Kort viser/.test(hh.t)||hh.v.hl!=='h'||detectMisc(q,d)!=='halvtime')okk=false;}
   ok(okk,'fix: k1t: «halv 3» for 3.30 peker på den korte viseren');
   ok(/<animate /.test(renderVis({kind:'clock',h:3,m:30,hl:'h'}))&&!/<animate /.test(renderVis({kind:'clock',h:3,m:30})),'fix: klokke med blinkende viser');}

  // ---- 5) Foreldresiden: «en» først ved ≥ 4 og ≥ 30 % av feilene ----
  ok(R('parTopMisc({m:{en:3},n:20,ok:10},3,1)').length===0,'fix: «en» skjules under 4');
  ok(R('parTopMisc({m:{en:5},n:40,ok:20},3,1)').length===0,'fix: «en» skjules under 30 % av feilene');
  ok(R('parTopMisc({m:{en:6,pluss:2},n:40,ok:20},3,1)')[0].k==='en','fix: «en» vises ved ≥ 4 og ≥ 30 %');
  ok(/6 pluss hva blir 9/.test(R("PAR_FAM['tenk-pluss'][1]")),'fix: «6 pluss hva blir 9?»');
  ls.clear();R('S').grade=null;R('S').current=null;
};
