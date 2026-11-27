// Mattehelten – Læringsløkka: prøv igjen med hint, revansj, feiltyper (misc), oppgavefordeling, statistikk (mh_stats)
// Alle js-filer deler globalt navnerom (vanlige <script>-tagger i fast rekkefølge, se index.html).
//
// Runde-tilstand ligger i S.lp (lages ved første oppgave i runden):
//   {rev:[{at,qd,tid,bt}], revN, miniAt, miniDone}  – revansj-kø og plass for minioppgave (mhMini fra topics12.js)
// Oppgaveobjektet får private felt mens det spilles: _n (antall feil så langt), _e (raden i S.questions), _t0 (vist kl.), _w (svak familie).
const LOOP_AUTO_MS=1200,LOOP_REV_MAX=2;
// Feiltyper (detectMisc) med navn for foreldresiden
window.MISC_NAMES={snudd:'Snudde sifre (71 for 17)',starttall:'Telte med starttallet',pluss:'La sammen i stedet for å trekke fra',minus:'Trakk fra i stedet for å legge sammen',dobbel:'Doblet i stedet for å halvere',halv:'Halverte i stedet for å doble',veksling:'Glemte å veksle (42 − 17 = 35)',ti:'Bommet med 10',en:'Bommet med 1',
  likhet:'Leste = som «svaret kommer» (4 + 3 = 5 + 7)',plass:'Blandet tiere og enere',halvtime:'Halv time feil vei (halv 3 for 3.30)',visere:'Blandet viserne på klokka',mynt:'Talte mynter, ikke kroner'};
// Valgoppgaver (fra generatorene): qd.why={'<valg>':'<kort hint for akkurat den feilen>'} brukes i hintet ved første feil,
// qd.whyM={'<valg>':'<feiltype i MISC_NAMES>'} i statistikken (mh_stats), qd.whyV={'<valg>':{kind:…}} er et bilde til hintet. Alle er valgfrie.

// ---- Runde: maks antall oppgaver, tilstand, fakta-nøkkel ----
// Antall oppgaver i runden: S.maxQ hvis satt (f.eks. repetisjonskamp med 6), boss: BOSS_MAXQ, ellers TQ
function loopMaxQ(){return S&&typeof S.maxQ==='number'?S.maxQ:S&&S.boss?(typeof BOSS_MAXQ==='number'?BOSS_MAXQ:12):TQ;}
function loopSt(){if(!S.lp){const mx=loopMaxQ();S.lp={rev:[],revN:0,miniAt:S.grade>=1&&S.grade<=2&&!S.boss?rand(2,Math.max(2,mx-2)):-1,miniDone:false};}return S.lp;}
// Samme regnefakta = samme nøkkel (3 + 5 og 5 + 3; 7 − 3, 3 + ? = 7 og 7 − ? = 4)
function loopKey(qd){const o=qd&&qd.ops,N=n=>typeof n==='number'&&isFinite(n);
  if(o&&N(o.a)&&N(o.b)){
    if(o.op==='+')return o.unk?`+?${o.unk==='a'?o.b:o.a}|${o.a+o.b}`:`+${Math.min(o.a,o.b)}|${Math.max(o.a,o.b)}`;
    if(o.op==='-')return o.unk?`+?${o.a-o.b}|${o.a}`:`+?${o.b}|${o.a}`;
    return `${o.op}${o.a}|${o.b}`;}
  if(o&&N(o.a)&&(o.op==='dbl'||o.op==='half'))return o.op+o.a;
  return String(qd&&(qd.key||qd.eq||qd.q));} // qd.key: bildeoppgaver med lik tekst (topics12.js)
// «0-oppgave»: + 0, − 0 eller n − n
function isZeroQ(qd){const o=qd&&qd.ops;return !!(qd&&(qd.strat==='null'||o&&(o.op==='+'||o.op==='-')&&(o.a===0||o.b===0||o.op==='-'&&!o.unk&&o.a===o.b)));}
function loopWeak(qd,tid){return !!(qd&&qd.strat&&typeof famWeak==='function'&&famWeak(S.grade,tid,qd.strat));}
function loopTopic(g,tid){const f=x=>x&&x.topics&&x.topics.find(t=>t.id===tid);return f(CUR[g])||Object.values(CUR).map(f).find(Boolean)||null;}
function loopClean(qd){const c=Object.assign({},qd);['_n','_e','_t0','_w','givenTxt','revenge','mini'].forEach(k=>delete c[k]);return c;}

// ---- Neste oppgave: revansj som er klar, ellers ny oppgave etter reglene for runden ----
// Regler: ingen gjentakelse av samme fakta, maks én 0-oppgave, maks ca. 40 % fra svake familier, første oppgave ikke svak.
function loopNext(){
  const st=loopSt(),g=S.grade,mx=loopMaxQ();
  const ri=st.rev.findIndex(r=>r.at<=S.idx);
  if(ri>=0){const r=st.rev.splice(ri,1)[0];S.topicId=r.tid;if(S.boss&&r.bt)S.bossTopic=r.bt;return Object.assign(loopClean(r.qd),{revenge:true});}
  const seen=new Set(S.questions.map(e=>e.k||loopKey(e))),zero=S.questions.some(e=>!e.revenge&&e.z),weak=S.questions.filter(e=>!e.revenge&&e.w).length,cap=Math.max(1,Math.round(mx*.4));
  let best=null,bp=9,tid=null,real=null;
  for(let i=0;i<120&&bp>0;i++){ // beste kandidat (120: små temaer som tiervenner har få ulike fakta): ingen gjentakelse; straff for 0-oppgave nr. 2 og for svak over taket
    let c;try{c=i&&real?real.gen(g,real.id):S.topic.gen(g,S.topicId);}catch(e){c=null;}
    if(!i){tid=S.topicId;real=S.topic&&S.topic.id!==tid?loopTopic(g,tid):null;} // sammensatt tema (boss): prøv igjen i samme tema
    if(!c||seen.has(loopKey(c)))continue;
    const wk=loopWeak(c,tid),p=(zero&&isZeroQ(c)?4:0)+(wk&&(weak>=cap||S.idx===0)?2:0);
    if(p<bp){bp=p;best=c;c._w=wk;}
  }
  let qd=best||S.topic.gen(g,S.topicId);
  if(tid)S.topicId=tid;
  // Minioppgave (C: mhMini) – maks én per runde i 1.–2. klasse
  if(st.miniAt>=0&&!st.miniDone&&S.idx>=st.miniAt&&typeof mhMini==='function'){let m=null;try{m=mhMini(qd,g,S.topicId);}catch(e){m=null;}
    if(m&&m.q!=null){st.miniDone=true;m.mini=true;qd=m;}else st.miniAt=S.idx+1;}
  return qd;
}
// Bommet oppgave kommer igjen 2–3 oppgaver senere (maks 2 per runde, innenfor rundens lengde)
function loopQueueRevenge(qd){
  const st=loopSt(),mx=loopMaxQ();
  if(!qd||qd.revenge||qd.mini||st.revN>=LOOP_REV_MAX)return false;
  let at=Math.min(S.idx+rand(1,2),mx-1);
  if(at<S.idx+1)return false;
  const taken=n=>st.rev.some(r=>r.at===n);
  if(taken(at))at=at+1<=mx-1&&!taken(at+1)?at+1:at-1;
  if(at<S.idx+1||taken(at))return false;
  st.rev.push({at,qd:loopClean(qd),tid:S.topicId,bt:S.boss?S.bossTopic||null:null});st.revN++;
  return true;
}
function loopCanRetry(qd){return !(isChoiceQ(qd)&&qd.choices.length<=2);}

// ---- Feiltyper ----
function detectMisc(qd,given){
  if(qd&&Array.isArray(qd.choices)&&qd.choices.length)return (qd.whyM&&qd.whyM[String(given)])||null; // valgoppgave: distraktorens feiltype
  const c=qd&&qd.ans,o=qd&&qd.ops,x=qd&&qd.x;
  if(typeof c!=='number'||typeof given!=='number'||!isFinite(given)||Math.abs(given-c)<.01)return null;
  if(c>=10&&given>=10&&Number.isInteger(c)&&Number.isInteger(given)&&String(given)===String(c).split('').reverse().join(''))return 'snudd';
  if(qd.strat==='likhet'&&x&&x.lv!=null&&x.c!=null&&(given===x.lv||given===x.lv+x.c))return 'likhet'; // 4 + 3 = 5 + ?: svarte 7 eller 12
  if(c>=20&&c%10===0&&given===c/10&&(!o||o.op==='+'||o.op==='-'||o.op==='seq'))return 'plass'; // skrev antall tiere (6 for 60)
  if(o&&typeof o.a==='number'){const a=o.a,b=o.b;
    // «Telte med starttallet» bare med små tall (ellers er det en tellefeil, og strategihintet hjelper mer)
    if(o.op==='-'&&!o.unk){if(given===a+b)return 'pluss';
      if(a>=10&&a%10<b%10&&given!==a&&given===10*(Math.floor(a/10)-Math.floor(b/10))+(b%10-a%10))return 'veksling';
      if(b>=2&&b<=4&&a<=20&&a-b>2&&given===c+1)return 'starttall';}
    else if(o.op==='-'&&o.unk){if(given===a+(a-b))return 'pluss';if(given===c+1&&c>=2&&c<=5)return 'starttall';}
    else if(o.op==='+'&&!o.unk){if(given===Math.abs(a-b))return 'minus';if(Math.min(a,b)>=2&&Math.min(a,b)<=4&&a+b<=20&&given===c-1)return 'starttall';}
    else if(o.op==='+'&&o.unk){if(given===(o.unk==='a'?b:a)+a+b)return 'pluss';if(given===c+1&&c>=2&&c<=5)return 'starttall';}
    else if(o.op==='half'&&given===2*a)return 'dobbel';
    else if(o.op==='dbl'&&given===a/2)return 'halv';
    else if(o.op==='·'&&given===a+b&&a*b!==a+b)return 'pluss';}
  const d=Math.abs(given-c);
  return d===10?'ti':d===1?'en':null;
}

// ---- Hint og bilde ut fra tallene i oppgaven (qd.ops). t = kort tekst (< 10 ord), v = bilde til hintet, r = bilde når svaret vises ----
function loopUnit(n){return Array(Math.max(0,Math.min(12,Math.abs(n)))).fill(n<0?-1:1);}
const LOOP_NUM=['null','én','to','tre','fire','fem'];
function loopTier(n){return n===1?'1 tier':`${n} tiere`;}
function loopEner(n){return n===1?'1 ener':`${n} enere`;}
// Dobler til 10 med fingrene: «4 + 4: fire fingre på hver hånd.»
function loopFing(a){return `${a} + ${a}: ${LOOP_NUM[a]} ${a===1?'finger':'fingre'} på hver hånd.`;}
// Går oppgaven over/under tieren i 1. klasse (tall til 20)? Da er tierrammen hovedhintet, som i Lær.
function loopCross(qd){const o=qd&&qd.ops;if(!o||o.unk||typeof o.a!=='number'||typeof o.b!=='number')return false;
  if(o.op==='+')return Math.max(o.a,o.b)<10&&o.a+o.b>10;
  return o.op==='-'&&o.a>10&&o.a<20&&o.b<10&&o.a%10<o.b;}
function loopPlan(qd){
  const o=qd&&qd.ops,N=n=>typeof n==='number'&&isFinite(n);if(!o)return null;
  const a=o.a,b=o.b,tf=(x,y,z)=>({kind:'tenframe',a:x,b:y||0,cross:z||0}),bl=(x,y,z)=>({kind:'blocks',a:x,b:y||0,cross:z||0});
  if(o.op==='+'&&!o.unk&&N(a)&&N(b)){
    const c=a+b,big=Math.max(a,b),sm=Math.min(a,b),ob=big%10;
    if(!sm)return{t:'Pluss 0: tallet blir det samme!',v:big<=20?tf(big):bl(big)};
    if(c<=10){if(a===b)return{t:loopFing(a),v:{kind:'tenframe',a,b,split:true}};
      return{t:c===10?'Tiervenner! Fyll tierrammen.':`Start på ${big}. Tell ${sm} til!`,v:tf(big,sm)};}
    if(big<10){
      if(a===b)return{t:`${a} + ${a}: tenk 5 + 5 først.`,v:{kind:'tenframe',a,b,split:true}};
      if(big-sm===1)return{t:`${sm} + ${sm} = ${2*sm}. Så én til!`,v:tf(big,sm)};
      const f=10-big;return{t:`Fyll tieren: ${big} + ${f} = 10. Så ${sm-f} til.`,v:tf(big,sm)};}
    if(c<=20)return{t:big===10?(sm===10?'To fulle tiere!':`En full tier og ${sm} til.`):`Pluss enerne: ${ob} + ${sm}.`,v:bl(big,sm)};
    if(!ob&&!(sm%10))return{t:`Tell tiere: ${big/10} + ${sm/10} tiere.`,v:bl(big,sm)};
    if(!(sm%10))return{t:`Legg til ${loopTier(sm/10)}. Enerne blir de samme.`,v:bl(big,sm)}; // 47 + 10
    if(sm<10){if(!ob)return{t:`${big} er ${loopTier(big/10)}. Legg til ${loopEner(sm)}.`,v:bl(big,sm)}; // 40 + 7
      if(ob+sm<10)return{t:`Pluss enerne: ${ob} + ${sm}.`,v:bl(big,sm)};
      if(ob+sm===10)return{t:`Enerne: ${ob} + ${sm} = 10. En ny tier!`,v:bl(big,sm)};
      const f=10-ob,t0=big-ob,L={kind:'line',from:t0,to:t0+20,start:big,hops:[f,sm-f],hopLab:['+'+f,'+'+(sm-f)],endLab:'?'};
      return{t:`${big} + ${f} = ${t0+10}. Så ${sm-f} til.`,v:L,r:Object.assign({},L,{endLab:''})};}
    return{t:`Tiere: ${big-ob} + ${sm-sm%10}. Enere: ${ob} + ${sm%10}.`,v:bl(big,sm)};
  }
  if(o.op==='+'&&o.unk&&N(a)&&N(b)){
    const k=o.unk==='a'?b:a,s=a+b,c=s-k;
    if(s===10&&k<=10)return{t:'Fyll tierrammen! Hvor mange tomme?',v:tf(k),r:tf(k,c)};
    if(qd.strat==='tier-ener'&&s>=10){ // 65 = 60 + ? og 65 = ? + 5: del tallet i tiere og enere
      if(!(k%10)&&c<10)return{t:`${s} er ${k} og noen enere. Hvor mange?`,v:bl(s)};
      if(k<10&&!(c%10))return{t:`Tell tierne i ${s}. Hvor mye er de?`,v:bl(s)};}
    if(!(k%10)&&!(s%10)&&c>=10){const L={kind:'line',from:Math.max(0,k-10),to:Math.min(100,s+10),step:10,start:k,hops:Array(c/10).fill(10),top:'?'};
      return{t:`Tell tiere fra ${k} til ${s}.`,v:L,r:Object.assign({},L,{top:'+'+c})};}
    const L=c<=12?{kind:'line',from:Math.max(0,k-1),to:s+1,start:k,hops:loopUnit(c),top:'?'}:{kind:'line',from:k,to:s,start:k,hops:[c],hopLab:['?']};
    return{t:`Tell opp fra ${k} til ${s}.`,v:L,r:Object.assign({},L,{top:'+'+c,hopLab:L.hopLab?['+'+c]:null})};
  }
  if(o.op==='-'&&!o.unk&&N(a)&&N(b)){
    const c=a-b,oa=a%10,ob=b%10,cross=v=>a<=20?tf(a,0,v):bl(a,0,v),rest=n=>n===c?'Så ta bort resten.':`Så ta bort ${n}.`; // «resten» når tallet er lik svaret (13 - 8)
    if(!b)return{t:'Du tar bort 0. Hva er igjen?',v:cross(0)};
    if(a===b)return{t:'Alle tas bort. Hva er igjen?',v:cross(b)};
    if(a<=10){
      if(b<=2){const L={kind:'line',from:Math.max(0,c-1),to:a+1,start:a,hops:loopUnit(-b),endLab:'?'};return{t:`Start på ${a}. Tell ${b} tilbake!`,v:L,r:Object.assign({},L,{endLab:''})};}
      if(a===10)return{t:`Hvem er tiervenn med ${b}?`,v:cross(b)};
      if(c<=2){const L={kind:'line',from:Math.max(0,b-1),to:a+1,start:b,hops:loopUnit(c),top:'?'};return{t:`Tell opp fra ${b} til ${a}.`,v:L,r:Object.assign({},L,{top:'+'+c})};}
      return{t:`Tenk pluss: ${b} + ? = ${a}.`,v:cross(b)};}
    if(!oa&&!ob)return{t:`Tell tiere: ${a/10} - ${b/10} tiere.`,v:bl(a,0,b)};
    if(!ob)return{t:a<20?'Ta bort tieren. Enerne blir igjen.':`Ta bort ${loopTier(b/10)}. Enerne blir de samme.`,v:bl(a,0,b)}; // 47 - 10: uten svaret
    if(b<10){
      if(oa>=b)return{t:`Ta bort enerne: ${oa} - ${b}.`,v:cross(b)};
      if(!oa)return{t:`Tenk tiervenner: 10 - ${b}.`,v:cross(b)};
      if(a<=20)return{t:`${a} - ${oa} = ${a-oa}. ${rest(b-oa)}`,v:cross(b)}; // 1. klasse: ned til 10 i tierrammen, som i Lær
      const L={kind:'line',from:a-oa-10,to:a+1,start:a,hops:[-oa,-(b-oa)],hopLab:['-'+oa,'-'+(b-oa)],endLab:'?'};
      return{t:`${a} - ${oa} = ${a-oa}. ${rest(b-oa)}`,v:L,r:Object.assign({},L,{endLab:''})};}
    const bt=b-ob;
    if(oa>=ob)return{t:bt===c?'Ta bort tierne først, så enerne.':`Tiere først: ${a} - ${bt} = ${a-bt}.`,v:bl(a,0,b)};
    const hs=oa?[-bt,-oa,-(ob-oa)]:[-bt,-ob],L={kind:'line',from:c-2,to:a+2,start:a,hops:hs,hopLab:hs.map(h=>String(h)),endLab:'?'};
    return{t:`${a} - ${bt} = ${a-bt}. ${rest(ob)}`,v:L,r:Object.assign({},L,{endLab:''})};
  }
  if(o.op==='-'&&o.unk&&N(a)&&N(b)){const c=a-b,L=b<=12?{kind:'line',from:Math.max(0,c-1),to:a+1,start:c,hops:loopUnit(b),top:'?'}:{kind:'line',from:c,to:a,start:c,hops:[b],hopLab:['?']};
    return{t:`Tell opp fra ${c} til ${a}.`,v:L,r:Object.assign({},L,{top:'+'+b,hopLab:L.hopLab?['+'+b]:null})};}
  if(o.op==='seq'&&N(a)&&N(b)&&b){
    const ts=[0,1,2,3].map(i=>a+i*b),ans=ts[o.i|0],s=Math.abs(b),lo=Math.min(...ts),hi=Math.max(...ts);
    const L={kind:'line',from:Math.max(0,lo-s),to:hi+s,step:s,start:ts[0],hops:[b,b,b],hopLab:Array(3).fill((b>0?'+':'-')+s),hide:[ans]};
    const t=ans===s?(s===1?(b>0?'Tell videre én og én!':'Tell bakover én og én!'):b>0?'Hopp like langt hver gang!':'Hopp like langt bakover!') // hoppet er lik svaret: ikke si tallet
      :b===1?'Tell 1 videre!':b===-1?'Tell 1 bakover!':b>0?`Hopp ${s} hver gang!`:`Hopp ${s} bakover hver gang!`;
    return{t,v:L,r:Object.assign({},L,{hide:[],hl:[ans]})};
  }
  if(o.op==='dbl'&&N(a)){if(a<=5)return{t:loopFing(a),v:{kind:'tenframe',a,b:a,split:true}};
    if(a<10)return{t:`${a} + ${a}: tenk 5 + 5 først.`,v:{kind:'tenframe',a,b:a,split:true}};
    if(a===10)return{t:'10 + 10: to hele tiere.',v:bl(10,10)};
    const u=a%10,t=a-u;return{t:u?`Tiere: ${t} + ${t}. Enere: ${u} + ${u}.`:`Tell tiere: ${t/10} + ${t/10} tiere.`,v:bl(a,a)};}
  // Halvering: alle prikkene i par, så barnet deler selv (to ferdige grupper vises først når svaret vises)
  if(o.op==='half'&&N(a)){if(a<=20)return{t:`Del ${a} likt: én til deg, én til meg.`,v:{kind:'dots',g:Array(Math.max(1,Math.floor(a/2))).fill(2),mono:true},r:{kind:'dots',g:[a/2,a/2]}};
    const T=a-a%10;return{t:(T/10)%2?`${a} = ${T-10} + ${a-T+10}. Del begge i to.`:'Del tierne og enerne i to.',v:bl(a)};}
  if(o.op===':'&&N(a)&&b===2&&a<=20)return{t:`Del ${a} likt: én til hver om gangen.`,v:{kind:'dots',g:Array(Math.max(1,Math.floor(a/2))).fill(2),mono:true},r:{kind:'dots',g:[a/2,a/2]}};
  if(o.op==='·'&&N(a)&&N(b)){
    const t=a===1?'Én gruppe: tallet blir det samme.':b===10?`${a} tiere. Tell 10 om gangen.`:b===5?`Tell 5 om gangen, ${a} ganger.`:b===2?`Dobbelt av ${a}: ${a} + ${a}.`:`${a} grupper med ${b}.`;
    return{t,v:b===10?bl(a*10):a*b<=60?{kind:'dots',g:Array(Math.min(12,a)).fill(b)}:null};}
  return null;
}
function loopMiscTip(misc,qd,given){const o=(qd&&qd.ops)||{},x=(qd&&qd.x)||{},story=!!(qd&&qd.eq&&qd.eq!==qd.q);
  switch(misc){
    case 'snudd':return 'Sjekk sifrene! Tiere først, så enere.';
    case 'pluss':return o.op==='·'?'Ganging er like grupper, ikke pluss.':o.unk?'Ikke legg sammen. Hvor mange mangler?':story?'Du la sammen. Her skal du ta bort.':'Minus betyr å ta bort!';
    case 'minus':return 'Pluss betyr å legge til!';
    case 'veksling':{const a=o.a,oa=a%10,ob=o.b%10,c=a-o.b,tv=ob===c?'Tenk tiervenner!':`Tenk tiervenner: 10 - ${ob}.`; // ikke nevn et tall som er lik svaret
      if(a<=20)return oa?`Du tok ${oa} fra ${ob}. Ta ned til 10 først: ${a} - ${oa}${ob-oa===c?'':` - ${ob-oa}`}.`:tv; // 1. klasse: via tieren
      return oa?`Du kan ikke ta ${ob} fra ${loopEner(oa)}. Veksle en tier: ${oa+10} - ${ob}.`:`Ingen enere å ta fra. ${tv}`;}
    case 'dobbel':return 'Halvparten blir mindre, ikke større!';
    case 'halv':return 'Dobbelt blir større!';
    case 'starttall':return o.unk?'Tell hoppene, ikke tallene!':o.op==='-'?`Start på ${o.a}. Tell ${o.b} hopp tilbake.`:`Start på ${Math.max(o.a,o.b)}. Tell ${Math.min(o.a,o.b)} hopp.`;
    case 'ti':return 'Nesten! Sjekk tierne.';
    case 'plass':return 'Du skrev antall tiere. Hvor mye er de?';
    case 'likhet':return x.lv==null?null:+given===x.lv?`${x.lv} er venstre side. ${x.c} + hva blir ${x.lv}?`:`Ikke legg sammen alt. Regn ut ${x.l} først.`;}
  return null;}
// Hint ved første feil: {t, v}
function loopHint(qd,given,misc){
  const o=(qd&&qd.ops)||{},x=(qd&&qd.x)||{},hint0=()=>qd&&qd.hint?`${qd.hint}!`.replace(/([.!?])!$/,'$1'):'Se godt etter. Prøv igjen!';
  // Valgoppgave: kort hint for akkurat den feilen (qd.why), ellers oppgavens eget hint
  if(qd&&Array.isArray(qd.choices)&&qd.choices.length){const k=String(given),w=qd.why&&qd.why[k];
    return w?{t:w,v:(qd.whyV&&qd.whyV[k])||null}:{t:hint0(),v:null};}
  // Klokkehistorier: tell timene på klokka
  if(qd&&qd.strat==='klokke-tid'&&typeof x.h==='number'&&typeof x.k==='number')
    return{t:x.from?`Start på ${x.h}. Tell timene til ${x.h+x.k}.`:`Start på ${x.h}. Tell ${x.k===1?'1 time':x.k+' timer'} frem.`,v:{kind:'clock',h:x.h,m:0,size:130}};
  // Like mye på begge sider (4 + 3 = 5 + ?): regn ut venstre side først (bilde av venstre side)
  if(qd&&qd.strat==='likhet'&&x.lv!=null&&x.c!=null&&x.l){const m=String(x.l).match(/^(\d+) ([+-]) (\d+)$/);
    const v=m?(m[2]==='+'?{kind:'tenframe',a:+m[1],b:+m[3]}:{kind:'tenframe',a:+m[1],cross:+m[3]}):null;
    return{t:(misc==='likhet'&&loopMiscTip(misc,qd,given))||`Hvor mye er ${x.l}? Så ${x.c} + hva?`,v};}
  const p=loopPlan(qd)||{},cross=loopCross(qd);
  // 1. klasse over/under tieren: tierrammen («fyll tieren») er hovedhintet, også når barnet telte med starttallet
  const mt=misc&&!(cross&&misc==='starttall')&&loopMiscTip(misc,qd,given);
  const t=mt||((misc==='en'||misc==='starttall')&&p.t?'Nesten! '+p.t:p.t)||hint0();
  let v=p.v||(qd&&qd.hv)||null; // qd.hv: bilde til hintet fra generatoren når oppgaven ikke har ops
  if(misc==='pluss'&&o.op==='-'&&!o.unk)v=o.a<=20?{kind:'tenframe',a:o.a,cross:o.b}:{kind:'blocks',a:o.a,cross:o.b};
  if(misc==='veksling')v=o.a<=20?{kind:'tenframe',a:o.a,cross:o.b}:{kind:'blocks',a:o.a,cross:o.b};
  if(misc==='ti'&&!o.unk&&o.a>=10&&(o.op==='+'||o.op==='-'))v=o.op==='+'?{kind:'blocks',a:Math.max(o.a,o.b),b:Math.min(o.a,o.b)}:{kind:'blocks',a:o.a,cross:o.b};
  if(misc==='starttall'&&!cross&&o.op==='+'&&!o.unk){const big=Math.max(o.a,o.b),sm=Math.min(o.a,o.b);v={kind:'line',from:Math.max(0,big-1),to:big+sm+1,start:big,hops:loopUnit(sm),endLab:'?'};}
  if(misc==='starttall'&&!cross&&o.op==='-'&&!o.unk)v={kind:'line',from:Math.max(0,o.a-o.b-1),to:o.a+1,start:o.a,hops:loopUnit(-o.b),endLab:'?'};
  return{t,v};
}
// Bilde når svaret vises (andre feil). Klokkehistorier: klokka før og etter.
function loopReveal(qd){const x=(qd&&qd.x)||{};
  if(qd&&qd.strat==='klokke-tid'&&typeof x.h==='number'&&typeof x.k==='number')return{kind:'clock',list:[{h:x.h,m:0,tag:'▶️'},{h:x.h+x.k,m:0,tag:'🏁'}]};
  const p=loopPlan(qd);if(p)return p.r||p.v||null;
  const hv=qd&&qd.hv;return hv?(hv.kind==='line'&&hv.hide?Object.assign({},hv,{hide:[],hl:hv.hide}):hv):null;}
// Regnestykker brytes ikke midt i («5 + 1» holdes på samme linje)
function loopNb(s){return String(s).replace(/ ([+\-=·]) (?=\S)/g,'\u00a0$1\u00a0');}
function loopPlain(h){return String(h).replace(/<[^>]*>/g,'').replace(/\s+/g,' ').trim();}

// ---- Statistikk: mh_stats = {'YYYY-MM-DD':{ms,n,ok,t:{'<g>:<id>':[n,ok]},m:{'<feiltype>':antall}}}, siste 60 dager ----
function statsLog(g,tid,ok,misc,ms){
  try{
    const d=mhLoad('mh_stats',{}),day=mhDay(),o=d[day]||(d[day]={ms:0,n:0,ok:0,t:{},m:{}});
    o.t=o.t||{};o.m=o.m||{};
    o.ms=(o.ms||0)+Math.max(0,Math.min(60000,Math.round(+ms||0)));o.n=(o.n||0)+1;if(ok)o.ok=(o.ok||0)+1;
    const k=g+':'+tid,t=o.t[k]||(o.t[k]=[0,0]);t[0]++;if(ok)t[1]++;
    if(misc)o.m[misc]=(o.m[misc]||0)+1;
    const old=mhDay(-59);Object.keys(d).forEach(x=>{if(x<old)delete d[x];});
    mhSave('mh_stats',d);
  }catch(e){}
}

// ---- Autoneste etter riktig svar (trykk hopper over ventetiden) ----
function loopArmAuto(){
  loopDisarm();const s=S,nb=document.getElementById('next-btn');
  if(nb)nb.classList.add('loop-auto');
  S._autoAt=Date.now();
  S._autoT=setTimeout(()=>{const sg=document.getElementById('screen-game');if(S===s&&s.answered&&s._autoT&&(!sg||!sg.classList||sg.classList.contains('active')))handleNext();},LOOP_AUTO_MS);
}
function loopDisarm(){if(S&&S._autoT){clearTimeout(S._autoT);S._autoT=0;}const nb=document.getElementById('next-btn');if(nb)nb.classList.remove('loop-auto');}
function loopFocusOK(){try{return !(S&&S.grade<=2&&window.matchMedia&&window.matchMedia('(pointer: coarse)').matches);}catch(e){return true;}}
// Hint-boksen i oppgavekortet (lages fra JS første gang)
function loopHelpEl(){let h=document.getElementById('loop-help');if(!h){const qv=document.getElementById('q-vis'),qc=document.getElementById('q-card');if(!qc)return null;h=document.createElement('div');h.id='loop-help';h.className='loop-help';h.setAttribute('aria-live','polite');if(qv)qv.insertAdjacentElement('afterend',h);else qc.appendChild(h);}return h;}
// Sørg for at svarfeltet/tastaturet synes etter at hintet dyttet det ned (og at oppgaven synes etter ny oppgave)
function loopShow(){try{const ch=isChoiceQ(S.current),el=document.getElementById(ch?'q-choices':'numpad'),qc=document.getElementById('q-card');if(!el||!el.getBoundingClientRect)return;const r=el.getBoundingClientRect(),vh=window.innerHeight||0,qt=qc.getBoundingClientRect().top;if(vh&&r.bottom>vh)window.scrollBy({top:Math.min(r.bottom-vh+8,Math.max(0,qt-8)),behavior:'auto'});}catch(e){}}
function loopHelpHide(){const h=document.getElementById('loop-help');if(h){h.className='loop-help';h.innerHTML='';}}
// Trykk hvor som helst i kampen (ikke på knapper) hopper over ventetiden
(function(){const sg=document.getElementById('screen-game');if(sg&&sg.addEventListener)sg.addEventListener('click',e=>{
  if(!S||!S.answered||!S._autoT||Date.now()-(S._autoAt||0)<250)return;
  const t=e.target;if(t&&t.closest&&t.closest('button,input,a'))return;
  handleNext();});})();
