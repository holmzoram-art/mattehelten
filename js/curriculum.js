// Mattehelten – Adaptiv sporing, læreplan (CUR-generatorer) og tilbakemeldinger (fb*)
// Alle js-filer deler globalt navnerom (vanlige <script>-tagger i fast rekkefølge, se index.html).

// ============================================================
// ADAPTIVE TRACKING
// ============================================================
function adaptKey(g,tid,sub){return `adapt_${g}_${tid}_${sub}`;}
// adapt_<g>_<tid>_<sub> = {a:forsøk, e:feil, r:'10110110'} – r er de siste 8 forsøkene (1 = riktig), lagt til additivt
function recordAttempt(g,tid,sub,ok){
  const k=adaptKey(g,tid,sub),d=mhLoad(k,null)||{a:0,e:0};
  d.a=(d.a|0)+1;if(!ok)d.e=(d.e|0)+1;d.r=(String(d.r||'')+(ok?1:0)).slice(-8);mhSave(k,d);
}
// Feilrate med kort hukommelse: de siste 8 forsøkene (minst 3). Gamle lagringer uten r: hele historikken som før.
function errRate(g,tid,sub){
  const d=mhLoad(adaptKey(g,tid,sub),null);if(!d)return 0;
  if(typeof d.r==='string'&&d.r.length>=3)return d.r.split('').filter(c=>c==='0').length/d.r.length;
  return (d.a|0)<3?0:(d.e|0)/d.a;
}
// Strategifamilier (qd.strat) i 1.–2. klasse: mh_fam = {'<g>:<tid>':{'<strat>':'10110110'}} – siste 8 forsøk per familie
function famRecord(g,tid,strat,ok){if(!strat)return;const d=mhLoad('mh_fam',{}),k=g+':'+tid,o=d[k]&&typeof d[k]==='object'?d[k]:(d[k]={});o[strat]=(String(o[strat]||'')+(ok?1:0)).slice(-8);mhSave('mh_fam',d);}
function famHist(g,tid,strat,all){const o=(all||mhLoad('mh_fam',{}))[g+':'+tid];return o&&typeof o[strat]==='string'?o[strat]:'';}
function famErr(g,tid,strat,all){const s=famHist(g,tid,strat,all);return s.length<2?0:s.split('').filter(c=>c==='0').length/s.length;}
function famWeak(g,tid,strat){const s=famHist(g,tid,strat);return s.length>=2&&famErr(g,tid,strat)>=.4;}
// Velger familie: grunnvekt × (1 + 2 · feilrate siste 8). W = {strat: vekt}
function famPick(g,tid,W){const all=mhLoad('mh_fam',{}),ks=Object.keys(W),ws=ks.map(k=>W[k]*(1+2*famErr(g,tid,k,all)));let r=Math.random()*ws.reduce((a,b)=>a+b,0);for(let i=0;i<ks.length;i++)if((r-=ws[i])<0)return ks[i];return ks[ks.length-1];}
// Vektet trekning med desimalvekter
function wPick(items,wFn){const ws=items.map(it=>Math.max(0,wFn(it))),T=ws.reduce((a,b)=>a+b,0);let r=Math.random()*T;for(let i=0;i<items.length;i++)if((r-=ws[i])<0)return items[i];return items[items.length-1];}
function getBest(g,id){const s=mhLoad(`hs_${g}_${id}`,[]);return Array.isArray(s)&&s[0]&&typeof s[0]==='object'?s[0].score:null;}
function checkWeak(g,id){
  for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.startsWith(`adapt_${g}_${id}_`)){const v=mhLoad(k,null);if(v&&v.a>=3&&v.e/v.a>.3)return true;}}return false;
}
function weightedPick(items,wFn){
  const pool=[];
  items.forEach(it=>{const w=Math.max(1,Math.round(1+wFn(it)*5));for(let i=0;i<w;i++)pool.push(it);});
  return pool[Math.floor(Math.random()*pool.length)];
}

// ============================================================
// CURRICULUM
// ============================================================
function rand(a,b){return Math.floor(Math.random()*(b-a+1))+a;}
function pick(a){return a[Math.floor(Math.random()*a.length)];}
function r2(n){return Math.round(n*100)/100;}
function gcd(a,b){return b===0?a:gcd(b,a%b);}
function nf(n){return String(n).replace('.',',');}
function sup(n){return String(n).split('').map(d=>'⁰¹²³⁴⁵⁶⁷⁸⁹'[d]).join('');}
function frTxt(n,d){const k=gcd(Math.abs(n),Math.abs(d))||1;n/=k;d/=k;if(d<0){n=-n;d=-d;}return d===1?String(n):`${n}/${d}`;}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=rand(0,i);[a[i],a[j]]=[a[j],a[i]];}return a;}
// Tolker svar: "3/4", "6/8", "0,75", "0.75", "-2", "1 1/2". Ugyldig -> null
function parseAns(raw){const s=String(raw).trim().replace(/,/g,'.');let m=s.match(/^(-?)(\d+)\s+(\d+)\/(\d+)$/);if(m)return +m[4]?(m[1]?-1:1)*(+m[2]+m[3]/m[4]):null;if(m=s.match(/^(-?\d+(?:\.\d+)?)\/(-?\d+(?:\.\d+)?)$/))return +m[2]?m[1]/m[2]:null;return /^-?(\d+\.?\d*|\.\d+)$/.test(s)?+s:null;}
// Morsomme varianter for 1.-2. klasse: emoji-telling og mini-historier. eq = det rene regnestykket (brukes av fb*)
const FUN=['🍎','🍓','⭐','🐟','🍪','🎈','🐞','🍌','🧁','🌸'];
function toFun(o,q){o.eq=o.q;o.q=q;if(/\p{Extended_Pictographic}/u.test(q))o.say=funSay(q);return o;}
// Opplesing (qd.say) av oppgaver med emoji: «3 🍎» → «3 epler», «🍎🍎 + 🍎 = ?» → «Tell eplene. …»
const FUN_N={'🍎':['eple','epler','eplene'],'🍓':['jordbær','jordbær','jordbærene'],'⭐':['stjerne','stjerner','stjernene'],'🐟':['fisk','fisker','fiskene'],'🍪':['kake','kaker','kakene'],'🎈':['ballong','ballonger','ballongene'],'🐞':['marihøne','marihøner','marihønene'],'🍌':['banan','bananer','bananene'],'🧁':['muffins','muffins','muffinsene'],'🌸':['blomst','blomster','blomstene'],'🐦':['fugl','fugler','fuglene'],'🐑':['sau','sauer','sauene'],'🧦':['sokk','sokker','sokkene'],'🖐️':['hånd','hender','hendene'],'🖍️':['fargestift','fargestifter','fargestiftene']};
function funSay(q){let s=String(q);const E=Object.keys(FUN_N).find(e=>s.startsWith(e));
  if(E&&/^[^\d]+ [+-] [^\d]+ = \?$/u.test(s))return `Tell ${FUN_N[E][2]}. Hvor mange er det ${/ - /.test(s)?'igjen':'til sammen'}?`;
  for(const [e,[sg,pl]] of Object.entries(FUN_N)){const p=s.split(e);if(p.length<2)continue;let out=p[0];for(let i=1;i<p.length;i++){const m=out.match(/(\d+)\s*$/);out+=(m&&m[1]==='1'?sg:pl)+p[i];}s=out;}
  return s.replace(/\p{Extended_Pictographic}️?/gu,'').replace(/\s+/g,' ').replace(/ ([.,?!:])/g,'$1').trim();}
// Byggeklosser for 1.–2. klasse: ops = tallene i oppgaven (hint, feiltyper, minioppgaver), strat = strategifamilie
function g12Add(a,b,strat,sub){return{q:`${a} + ${b} = ?`,ans:a+b,type:'Pluss',sub,strat,ops:{a,b,op:'+'}};}
function g12Sub(a,b,strat,sub){return{q:`${a} - ${b} = ?`,ans:a-b,type:'Minus',sub,strat,ops:{a,b,op:'-'}};}
// Faktalister per familie (lages én gang)
const G12_A10={null:[],p1:[],p2:[],dobbel:[],tiervenn:[],'tell-videre':[]};
for(let a=0;a<=10;a++)for(let b=0;a+b<=10;b++){if(!a&&!b)continue;const m=Math.min(a,b);G12_A10[!m?'null':a===b?'dobbel':a+b===10?'tiervenn':m===1?'p1':m===2?'p2':'tell-videre'].push([a,b]);}
const G12_S10={null:[],minus1:[],dobbel:[],tiervenn:[],'tell-opp':[],'tenk-pluss':[]};
for(let a=1;a<=10;a++)for(let b=0;b<=a;b++)G12_S10[!b||a===b?'null':b<=2?'minus1':a===10?'tiervenn':a===2*b?'dobbel':a-b<=2?'tell-opp':'tenk-pluss'].push([a,b]);
const G12_A20={'hel-tier':[],enere:[],'over-tier':[],dobbel:[],'naer-dobbel':[]};
for(let n=1;n<=10;n++)G12_A20['hel-tier'].push([10,n]);
for(let a=11;a<=18;a++)for(let b=1;a+b<=19;b++)G12_A20.enere.push([a,b]);
for(let a=2;a<=9;a++)for(let b=a;b<=9;b++)if(a+b>10)G12_A20[a===b?'dobbel':b-a===1?'naer-dobbel':'over-tier'].push([a,b]);
// Enerpar for tosifret: over tieren (o+x ≥ 10) og under tieren ved minus (x > o)
const G12_PO=[],G12_PU=[];for(let o=0;o<=9;o++)for(let x=1;x<=9;x++){if(o&&o+x>=10)G12_PO.push([o,x]);if(x>o)G12_PU.push([o,x]);}
// Trapp i Pluss/Minus til 10: de 2 første rundene ved 0⭐ bare små tall (sum ≤ 6, minus: a ≤ 6 og b ≤ 3). Ikke i boss.
function g12Easy(g,id){try{if(typeof S!=='undefined'&&S&&S.boss)return false;if(typeof topicStars==='function'&&topicStars(g,id)>0)return false;
  return typeof mstRounds==='function'&&typeof mstGet==='function'?mstRounds(mstGet(g,id)).length<2:false;}catch(e){return false;}}
// Velger familie og fakta; ok = filter for lette fakta (familier uten lette fakta tas ut)
function g12Pick(g,id,W,lists,ok){if(ok){const W2={};Object.keys(W).forEach(k=>{if(lists(k).some(ok))W2[k]=W[k];});if(Object.keys(W2).length){const f=famPick(g,id,W2),L=lists(f).filter(ok);return [f,pick(L)];}}
  const f=famPick(g,id,W);return [f,pick(lists(f))];}
// Bilde til historier i 1. klasse (kan forstås uten å lese): to grupper som legges sammen, eller ting som strykes over
function g12Vis(o,E,minus){const x=o.ops;if(x&&x.op==='+'&&!x.unk&&x.a+x.b<=20)o.vis={kind:'dots',g:[x.a,x.b],emoji:E,op:'+'};else if(x&&x.op==='-'&&!x.unk&&x.a<=20)o.vis={kind:'dots',g:[x.a],cross:x.b,emoji:E};return o;}

const CUR={
  1:{c1:'#43e97b',c2:'#38f9d7',badge:'rgba(67,233,123,.15)',tc:'#00ff88',icon:'🔢',label:'Tall 1–20, + og −',
    topics:[
      {id:'add10',icon:'➕',bg:'rgba(67,233,123,.2)',name:'Pluss til 10',desc:'Legg sammen tall opp til 10',
        gen(g,id){const p1=Math.random()<.4,[f,[a,b]]=g12Pick(g,id,{null:.4,pluss1:2.2,dobbel:1.5,tiervenn:1.8,'tell-videre':2.1},k=>k==='pluss1'?G12_A10[p1?'p1':'p2']:G12_A10[k],g12Easy(g,id)&&(([x,y])=>x+y<=6)),E=pick(FUN),o=g12Add(a,b,f,`${a}+${b}`),r=Math.random();if(a&&b){if(r<.3&&a<=5&&b<=5)return toFun(o,`${E.repeat(a)} + ${E.repeat(b)} = ?`);if(r<.5)return g12Vis(toFun(o,pick([`Du har ${a} ${E}. Du får ${b} til. Hvor mange nå?`,`${a} ${E} og ${b} ${E}. Hvor mange til sammen?`])),E);}return o;},fb:fbAdd},
      {id:'sub10',icon:'➖',bg:'rgba(255,68,102,.2)',name:'Minus til 10',desc:'Ta bort tall opp til 10',
        gen(g,id){const[f,[a,b]]=g12Pick(g,id,{null:.4,minus1:1.8,dobbel:1,tiervenn:1.5,'tell-opp':1.3,'tenk-pluss':2},k=>G12_S10[k],g12Easy(g,id)&&(([x,y])=>x<=6&&y<=3)),E=pick(FUN),o=g12Sub(a,b,f,`${a}-${b}`),r=Math.random();if(b&&a>b){if(r<.25)return Object.assign(toFun(o,`${a} ${E}. Trollet tar ${b}. Hvor mange er igjen?`),{vis:{kind:'dots',g:[a],cross:b,emoji:E}});if(r<.5){const k=rand(0,2);return g12Vis(toFun(o,[`Du har ${a} ${E}. Trollet tar ${b}. Hvor mange er igjen?`,`${a} 🐦 sitter i et tre. ${b} flyr bort. Hvor mange er igjen?`,`Pluss-trollet spiste ${b} av dine ${a} 🍪. Hvor mange er igjen?`][k]),[E,'🐦','🍪'][k]);}}return o;},fb:fbSub},
      {id:'ten1',icon:'🤝',bg:'rgba(255,217,61,.2)',name:'Tiervenner',desc:'To tall som blir 10 sammen',
        gen(g,id){const a=wPick([1,2,3,4,5,6,7,8,9],t=>(t===1||t===9?.5:t===5?.8:1)*(1+2*errRate(g,id,`v${t}`))),c=10-a,o=Math.random()<.6?{q:`${a} + ? = 10`,ans:c,ops:{a,b:c,op:'+',unk:'b'}}:{q:`? + ${a} = 10`,ans:c,ops:{a:c,b:a,op:'+',unk:'a'}};Object.assign(o,{type:'Tiervenner',hint:'Hvor mange mangler til 10?',sub:`v${a}`,strat:'tiervenn'});if(Math.random()<.35){const k=rand(0,2);o.ops=k?{a:10,b:a,op:'-'}:{a,b:c,op:'+',unk:'b'};toFun(o,[`Du har ${a} 🎈. Hvor mange mangler til 10?`,`${a} av 10 🐞 sover. Hvor mange er våkne?`,`Det er 10 🍪 i boksen. Du spiste ${a}. Hvor mange er igjen?`][k]);o.vis=k?{kind:'dots',g:[10],cross:a,emoji:k===1?'🐞':'🍪'}:{kind:'tenframe',a};return o;}return o;},fb:fbTen},
      {id:'seq1',icon:'🐸',bg:'rgba(0,255,136,.2)',name:'Tallrekker',desc:'Tell videre med hopp på 1, 2, 5 og 10',
        gen(g,id){const k=famPick(g,id,{hop1:1.2,'hop-1':1.8,hop2:1.8,hop5:1.6,hop10:1.6}),st={'hop1':1,'hop-1':-1,'hop2':2,'hop5':5,'hop10':10}[k];const s0=k==='hop1'?rand(0,16):k==='hop-1'?rand(4,20):k==='hop2'?rand(0,12):k==='hop5'?5*rand(0,6):10*rand(0,6);const ts=[0,1,2,3].map(i=>s0+i*st),mi=pick([3,3,3,1,2]),ans=ts[mi];ts[mi]='?';const o={q:ts.join(', '),ans,type:'Tallrekke',hint:mi===3?'Hvilket tall kommer nå?':'Hvilket tall mangler?',sub:k,strat:k,ops:{op:'seq',a:s0,b:st,i:mi}};if(Math.random()<.4){const lb=k==='hop-1'?'Nedtelling':'Frosken hopper';toFun(o,`${k==='hop-1'?'🚀':'🐸'} ${lb}: ${o.q}`);o.say=`${lb}: ${o.eq.replace(/, \?$/,'').replace('?','hvilket tall')}. ${o.hint}`;}return o;},fb:fbSeq},
      {id:'add20',icon:'🔢',bg:'rgba(6,214,255,.2)',name:'Pluss til 20',desc:'Legg sammen tall opp til 20',
        gen(g,id){const f=famPick(g,id,{'hel-tier':1.2,enere:2.2,'over-tier':2.6,dobbel:.9,'naer-dobbel':1.1});let[a,b]=pick(G12_A20[f]);if(Math.random()<.5)[a,b]=[b,a];const E=pick(FUN),o=g12Add(a,b,f,f==='hel-tier'?'a20t':f==='enere'?'a20n':'a20o');o.hint=o.sub==='a20o'?'Fyll opp til 10 først':'';return Math.random()<.3?g12Vis(toFun(o,pick([`Du har ${a} ${E}. Du finner ${b} til. Hvor mange nå?`,`${a} ${E} i kurven. Du legger i ${b} til. Hvor mange nå?`])),E):o;},fb:fbAdd},
    ]},
  2:{c1:'#4facfe',c2:'#00f2fe',badge:'rgba(79,172,254,.15)',tc:'#06d6ff',icon:'🧮',label:'Tall 1–100, +, − og ·',
    topics:[
      {id:'add100',icon:'➕',bg:'rgba(79,172,254,.2)',name:'Pluss til 100',desc:'Legg sammen tall opp til 100',
        gen(g,id){const f=famPick(g,id,{'hel-tier':1.2,enere:1.5,'over-tier':2,tosifret:1.6,veksling:1.7});let a,b,t;if(f==='hel-tier'){a=10*rand(1,8);b=10*rand(1,10-a/10);t='a100t';}else if(f==='enere'){a=10*rand(1,9)+rand(0,8);b=rand(1,9-a%10);t='a100e';}else if(f==='over-tier'){const[o,x]=pick(G12_PO);a=10*rand(1,8)+o;b=x;t='a100c';}else if(f==='tosifret'){const ta=rand(1,8),oa=rand(1,8);a=10*ta+oa;b=10*rand(1,9-ta)+rand(1,9-oa);t='a100n';}else{const ta=rand(1,7),[oa,ob]=pick(G12_PO);a=10*ta+oa;b=10*rand(1,8-ta)+ob;t='a100x';}if(Math.random()<.3)[a,b]=[b,a];const o=g12Add(a,b,f,t);return Math.random()<.25?toFun(o,pick([`Du har ${a} kr. Du får ${b} kr til. Hvor mange kroner nå?`,`${a} 🐑 og ${b} 🐑 på jordet. Hvor mange sauer?`])):o;},fb:fbAdd},
      {id:'sub100',icon:'➖',bg:'rgba(255,68,102,.2)',name:'Minus til 100',desc:'Ta bort tall opp til 100',
        gen(g,id){const f=famPick(g,id,{'hel-tier':1.2,enere:1.4,'under-tier':2,tosifret:1.4,veksling:2});let a,b,t;if(f==='hel-tier'){a=10*rand(2,10);b=10*rand(1,a/10-1);t='s100t';}else if(f==='enere'){a=10*rand(1,9)+rand(1,9);b=rand(1,a%10);t='s100e';}else if(f==='under-tier'){const[o,x]=pick(G12_PU);a=10*rand(2,9)+o;b=x;t='s100b';}else if(f==='tosifret'){const ta=rand(2,9),oa=rand(1,9);a=10*ta+oa;b=10*rand(1,ta-1)+rand(0,oa);t='s100n';}else{const ta=rand(2,9),[oa,ob]=pick(G12_PU);a=10*ta+oa;b=10*rand(1,ta-1)+ob;t='s100x';}const o=g12Sub(a,b,f,t);return Math.random()<.25?toFun(o,pick([`Det er ${a} 🐟 i dammen. Trollet fanger ${b}. Hvor mange er igjen?`,`Du har ${a} kr. Du kjøper is for ${b} kr. Hvor mange kroner er igjen?`])):o;},fb:fbSub},
      {id:'miss2',icon:'🕵️',bg:'rgba(6,214,255,.2)',name:'Hva mangler?',desc:'Finn tallet som gjemmer seg',
        gen(g,id){const f=famPick(g,id,{'mangler-pluss':2.6,'mangler-minus':1.6,'hel-tier':1.8,tiervenn:2}),t=f==='mangler-pluss'?(Math.random()<.4?'mis+a':'mis+b'):f==='mangler-minus'?'mis-':f==='hel-tier'?'mis10':'mis100',fu=Math.random()<.3,r=(q,ans,st,ops)=>{const o={q,ans,type:'Hva mangler?',hint:'Hvilket tall gjemmer seg?',sub:t,strat:f,ops};return fu?toFun(o,st):o;};if(t==='mis+a'){const x=rand(1,10),b=rand(1,10);return r(`? + ${b} = ${x+b}`,x,`Du har ${b} 🍓. Du vil ha ${x+b}. Hvor mange mangler?`,{a:x,b,op:'+',unk:'a'});}if(t==='mis+b'){const a=rand(1,10),x=rand(1,10);return r(`${a} + ? = ${a+x}`,x,`Du har ${a} 🍓. Du vil ha ${a+x}. Hvor mange mangler?`,{a,b:x,op:'+',unk:'b'});}if(t==='mis-'){const a=rand(6,20),x=rand(1,Math.min(10,a-1));return r(`${a} - ? = ${a-x}`,x,`Du hadde ${a} 🎈. Nå har du ${a-x}. Hvor mange fløy bort?`,{a,b:x,op:'-',unk:'b'});}if(t==='mis10'){const a=10*rand(1,8),x=10*rand(1,9-a/10),L=Math.random()<.5;return r(L?`${a} + ? = ${a+x}`:`? + ${a} = ${a+x}`,x,`Du har ${a} kr. Et spill koster ${a+x} kr. Hvor mange kroner mangler du?`,L?{a,b:x,op:'+',unk:'b'}:{a:x,b:a,op:'+',unk:'a'});}const a=10*rand(1,9)+rand(1,9),s=a-a%10+10;return r(`${a} + ? = ${s}`,10-a%10,`Du har ${a} kr. En is koster ${s} kr. Hvor mange kroner mangler du?`,{a,b:10-a%10,op:'+',unk:'b'});},fb:fbMiss},
      {id:'dbl2',icon:'👯',bg:'rgba(240,147,251,.2)',name:'Dobbelt og halvparten',desc:'Dobbelt av og halvparten av et tall',
        gen(g,id){const f=famPick(g,id,{dobbel:2,halv:2,'dobbel-stor':2,'halv-stor':2}),t={dobbel:'dob',halv:'halv','dobbel-stor':'dob2','halv-stor':'halv2'}[f],n=t==='dob'||t==='halv'?rand(1,10):Math.random()<.25?pick([15,25,35,45]):10*rand(1,4)+rand(0,4),fu=Math.random()<.35;if(t.startsWith('dob')){const o={q:`Dobbelt av ${n} = ?`,ans:2*n,type:'Dobbelt',hint:'To like mange',sub:t,strat:f,ops:{a:n,op:'dbl'}};return fu?toFun(o,pick([`To troll har ${n} 🍎 hver. Hvor mange 🍎 til sammen?`,`Du har ${n} 🧦. Du får like mange til. Hvor mange nå?`])):o;}const o={q:`Halvparten av ${2*n} = ?`,ans:n,type:'Halvparten',hint:'Del i to like deler',sub:t,strat:f,ops:{a:2*n,op:'half'}};return fu?toFun(o,`Del ${2*n} 🍪 likt med en venn. Hvor mange får hver?`):o;},fb:fbDbl},
      {id:'mul25',icon:'✖️',bg:'rgba(255,217,61,.2)',name:'Ganging med 2, 5 og 10',desc:'Enkel ganging',
        gen(g,id){const k=famPick(g,id,{x2:2.8,x5:2.8,x10:2.4}),b=+k.slice(1),a=rand(1,10),o={q:`${a} · ${b} = ?`,ans:a*b,type:'Ganging',hint:`${b}-gangen`,sub:k,strat:k,ops:{a,b,op:'·'}};return a>=2&&Math.random()<.35?toFun(o,b===2?`${a} 🐦 har 2 bein hver. Hvor mange bein?`:b===5?`Du ser ${a} 🖐️ med 5 fingre. Hvor mange fingre?`:`${a} esker med 10 🖍️. Hvor mange fargestifter?`):o;},fb:fbMul},
    ]},
  3:{c1:'#43e97b',c2:'#38f9d7',badge:'rgba(67,233,123,.15)',tc:'#00ff88',icon:'✖️',label:'Gangetabell 1–5, deling',
    topics:[
      {id:'mul15',icon:'✖️',bg:'rgba(67,233,123,.2)',name:'Gangetabellen 1-5',desc:'1-, 2-, 3-, 4- og 5-gangen',
        gen(g,id){const b=weightedPick([1,2,3,4,5],t=>errRate(g,id,`x${t}`)),a=rand(1,10);return{q:`${a} · ${b} = ?`,ans:a*b,type:'Ganging',hint:`${b}-gangen`,sub:`x${b}`};},fb:fbMul},
      {id:'div25',icon:'➗',bg:'rgba(255,217,61,.2)',name:'Deling med 2, 5, 10',desc:'Enkel divisjon',
        gen(g,id){const b=weightedPick([2,5,10],t=>errRate(g,id,`d${t}`)),a=b*rand(1,10);return{q:`${a} : ${b} = ?`,ans:a/b,type:'Divisjon',hint:`Del med ${b}`,sub:`d${b}`};},fb:fbDiv},
      {id:'add100r',icon:'🔟',bg:'rgba(6,214,255,.2)',name:'Runde tall',desc:'Legg sammen tiere og hundrere',
        gen(g,id){const t=weightedPick([10,20,50,100],s=>errRate(g,id,`r${s}`));const a=t*rand(1,9),b=t*rand(1,9);return{q:`${a} + ${b} = ?`,ans:a+b,type:'Addisjon',hint:'Runde tall',sub:`r${t}`};},fb:fbAdd},
    ]},
  4:{c1:'#fa709a',c2:'#fee140',badge:'rgba(250,112,154,.15)',tc:'#fa709a',icon:'➗',label:'Gangetabell 1–10, brøk',
    topics:[
      {id:'mul110',icon:'✖️',bg:'rgba(250,112,154,.2)',name:'Gangetabellen 1-10',desc:'Hele gangetabellen',
        gen(g,id){const b=weightedPick([1,2,3,4,5,6,7,8,9,10],t=>errRate(g,id,`x${t}`)),a=rand(1,10);return{q:`${a} · ${b} = ?`,ans:a*b,type:'Ganging',hint:`${b}-gangen`,sub:`x${b}`};},fb:fbMul},
      {id:'div110',icon:'➗',bg:'rgba(255,217,61,.2)',name:'Divisjon 1-10',desc:'Del med alle tall fra 1-10',
        gen(g,id){const b=weightedPick([2,3,4,5,6,7,8,9,10],t=>errRate(g,id,`d${t}`)),a=b*rand(1,10);return{q:`${a} : ${b} = ?`,ans:a/b,type:'Divisjon',sub:`d${b}`};},fb:fbDiv},
      {id:'frac4',icon:'🍕',bg:'rgba(168,85,247,.2)',name:'Enkle brøker',desc:'1/2, 1/3 og 1/4 av et tall',
        gen(g,id){const fs=[{s:'1/2',d:2},{s:'1/4',d:4},{s:'1/3',d:3}];const f=weightedPick(fs,t=>errRate(g,id,t.s)),whole=f.d*rand(1,8);return{q:`${f.s} av ${whole} = ?`,ans:whole/f.d,type:'Brøk',hint:'Del på nevneren',sub:f.s};},fb:fbFrac},
    ]},
  5:{c1:'#f7971e',c2:'#ffd200',badge:'rgba(247,151,30,.15)',tc:'#ffd93d',icon:'💯',label:'Desimaltall, prosent',
    topics:[
      {id:'dec5',icon:'📏',bg:'rgba(247,151,30,.2)',name:'Desimaltall',desc:'Addisjon og subtraksjon med desimaler',
        gen(g,id){const op=weightedPick(['+','-'],t=>errRate(g,id,`dec${t}`));const a=r2(rand(10,99)/10),b=r2(rand(1,Math.floor(a*10)-1)/10);const ans=op==='+'?r2(a+b):r2(a-b);return{q:`${nf(a)} ${op} ${nf(b)} = ?`,ans,type:'Desimaltall',hint:'Komma under komma',sub:op==='+'?'dec+':'dec-'};},fb:fbDec},
      {id:'pct5',icon:'💯',bg:'rgba(255,217,61,.2)',name:'Enkel prosent',desc:'10 %, 20 %, 25 % og 50 % av et tall',
        gen(g,id){const pcts=[10,20,25,50];const p=weightedPick(pcts,t=>errRate(g,id,`p${t}`));const base=p===25?rand(1,10)*20:rand(1,20)*10;return{q:`${p} % av ${base} = ?`,ans:r2(base*p/100),type:'Prosent',hint:`Del på ${100/p}`,sub:`p${p}`};},fb:fbPct},
      {id:'round5',icon:'🎯',bg:'rgba(6,214,255,.2)',name:'Avrunding',desc:'Rund av til nærmeste tier eller heltall',
        gen(g,id){const t=weightedPick(['heltall','tier'],s=>errRate(g,id,s==='heltall'?'rnd1':'rnd10'));if(t==='heltall'){let n;do{n=rand(10,99);}while(n%10===0);const a=n/10;return{q:`Rund av ${nf(a)} til heltall`,ans:Math.round(a),type:'Avrunding',hint:'5 eller mer: rund opp',sub:'rnd1'};}else{let a;do{a=rand(11,99);}while(a%10===0);return{q:`Rund av ${a} til nærmeste tier`,ans:Math.round(a/10)*10,type:'Avrunding',hint:'Se på enerne',sub:'rnd10'};}},fb:fbRound},
    ]},
  6:{c1:'#4776e6',c2:'#8e54e9',badge:'rgba(71,118,230,.15)',tc:'#a855f7',icon:'📐',label:'Brøk, geometri, negative tall',
    topics:[
      {id:'frac6',icon:'🥧',bg:'rgba(168,85,247,.2)',name:'Brøkregning',desc:'Legg til og trekk fra brøker',frac:true,
        gen(g,id){const op=weightedPick(['+','-'],t=>errRate(g,id,`fr${t}`)),same=Math.random()<.4;let d1,d2;if(same)d1=d2=pick([3,4,5,6,8,10]);else{[d1,d2]=pick([[2,4],[2,6],[2,8],[3,6],[4,8],[2,10],[5,10],[3,9],[4,12],[3,12],[6,12]]);if(Math.random()<.5)[d1,d2]=[d2,d1];}const L=d1*d2/gcd(d1,d2);let n1,n2,num;do{n1=rand(1,d1-1);n2=rand(1,d2-1);num=op==='+'?n1*L/d1+n2*L/d2:n1*L/d1-n2*L/d2;}while(num<=0||num>L||(!same&&(gcd(n1,d1)>1||gcd(n2,d2)>1)));return{q:`${n1}/${d1} ${op} ${n2}/${d2} = ?`,ans:r2(num/L),ansTxt:frTxt(num,L),type:'Brøk',hint:same?'Lik nevner: regn med tellerne':'Finn fellesnevner',sub:`fr${op}`};},fb:fbFrOp},
      {id:'geo6',icon:'🟦',bg:'rgba(67,233,123,.2)',name:'Areal og omkrets',desc:'Rektangler og kvadrater',
        gen(g,id){const shape=pick(['rekt','kvadrat']);const t=weightedPick(['areal','omkrets'],s=>errRate(g,id,`geo_${s}`)),T=t==='areal'?'Areal':'Omkrets';if(shape==='kvadrat'){const s=rand(2,12);const ans=t==='areal'?s*s:4*s;return{q:`Kvadrat med side ${s}. ${T} = ?`,ans,type:'Geometri',hint:t==='areal'?'side · side':'4 · side',sub:`geo_${t}`};}else{const w=rand(3,12),h=rand(2,w-1);const ans=t==='areal'?w*h:2*(w+h);return{q:`Rektangel ${w} × ${h}. ${T} = ?`,ans,type:'Geometri',hint:t==='areal'?'lengde · bredde':'Legg sammen alle sidene',sub:`geo_${t}`};}},fb:fbGeo},
      {id:'neg6',icon:'🌡️',bg:'rgba(255,68,102,.2)',name:'Negative tall',desc:'Regn med negative tall',
        gen(g,id){const op=weightedPick(['+','-'],t=>errRate(g,id,`neg${t}`));const a=op==='+'?rand(-9,-1):rand(-9,8),b=op==='+'?rand(1,9):rand(a<0?1:a+1,9);const ans=op==='+'?a+b:a-b;return{q:`${a} ${op} ${b} = ?`,ans,type:'Negative tall',hint:'Bruk ± for minus',sub:op==='+'?'neg+':'neg-'};},fb:fbNeg},
    ]},
  7:{c1:'#11998e',c2:'#38ef7d',badge:'rgba(17,153,142,.15)',tc:'#00ff88',icon:'🔡',label:'Algebra, forholdstall, statistikk',
    topics:[
      {id:'alg7',icon:'🔍',bg:'rgba(168,85,247,.2)',name:'Enkel algebra',desc:'Finn den ukjente (x)',
        gen(g,id){const t=weightedPick(['xa','xb','xc'],s=>errRate(g,id,{xa:'alg+',xb:'alg-',xc:'algx'}[s]));if(t==='xa'){const x=rand(1,15),b=rand(1,10);return{q:`x + ${b} = ${x+b}, x = ?`,ans:x,type:'Algebra',hint:`Trekk fra ${b}`,sub:'alg+'};}else if(t==='xb'){const x=rand(2,15),b=rand(1,x-1);return{q:`x - ${b} = ${x-b}, x = ?`,ans:x,type:'Algebra',hint:`Legg til ${b}`,sub:'alg-'};}else{const b=pick([2,3,4,5]),x=rand(1,12);return{q:`${b} · x = ${b*x}, x = ?`,ans:x,type:'Algebra',hint:`Del på ${b}`,sub:'algx'};}},fb:fbAlg},
      {id:'ratio7',icon:'🧃',bg:'rgba(79,172,254,.2)',name:'Forholdstall',desc:'Finn den manglende verdien',
        gen(g,id){const a=rand(1,6),b=rand(1,6),k=rand(2,5);const t=weightedPick(['c','d'],s=>errRate(g,id,s==='c'?'rat1':'rat2'));if(t==='c'){return{q:`${a} : ${b} = ${a*k} : ?`,ans:b*k,type:'Forholdstall',hint:'Gang begge med det samme',sub:'rat1'};}else{return{q:`${a} : ${b} = ? : ${b*k}`,ans:a*k,type:'Forholdstall',hint:'Gang begge med det samme',sub:'rat2'};}},fb:fbRatio},
      {id:'stat7',icon:'📊',bg:'rgba(255,217,61,.2)',name:'Gjennomsnitt',desc:'Finn gjennomsnittet av en tallrekke',
        gen(g,id){const n=rand(3,5);const vals=Array.from({length:n},()=>rand(2,19));const r=vals.reduce((a,b)=>a+b,0)%n;if(r)vals[n-1]+=vals[n-1]-r>=1?-r:n-r;const ans=vals.reduce((a,b)=>a+b,0)/n;return{q:`Gjennomsnitt av ${vals.join(', ')} = ?`,ans,type:'Statistikk',hint:`Legg sammen og del på ${n}`,sub:'avg'};},fb:fbStat},
    ]},
  8:{c1:'#eb3349',c2:'#f45c43',badge:'rgba(235,51,73,.15)',tc:'#ff4466',icon:'⚡',label:'Likninger, potenser, prosent',
    topics:[
      {id:'eq8',icon:'⚖️',bg:'rgba(235,51,73,.2)',name:'Lineære likninger',desc:'Løs likninger med én ukjent',
        gen(g,id){const t=weightedPick(['ax','axb'],s=>errRate(g,id,s==='ax'?'eq1':'eq2'));if(t==='ax'){const a=rand(2,9),x=rand(1,12);return{q:`${a}x = ${a*x}, x = ?`,ans:x,type:'Likning',hint:`Del på ${a}`,sub:'eq1'};}else{const a=rand(2,6),x=rand(1,10),b=rand(1,15);return{q:`${a}x + ${b} = ${a*x+b}, x = ?`,ans:x,type:'Likning',hint:`Trekk fra ${b}, del på ${a}`,sub:'eq2'};}},fb:fbEq},
      {id:'pow8',icon:'🚀',bg:'rgba(255,217,61,.2)',name:'Potenser',desc:'Kvadrater, kuber og potenser',
        gen(g,id){const t=weightedPick(['sq','cub','pot'],s=>errRate(g,id,s));if(t==='sq'){const b=rand(2,12);return{q:`${b}² = ?`,ans:b*b,type:'Potens',hint:`${b} · ${b}`,sub:'sq'};}else if(t==='cub'){const b=rand(2,6);return{q:`${b}³ = ?`,ans:b*b*b,type:'Potens',hint:`${b} · ${b} · ${b}`,sub:'cub'};}else{const b=rand(2,5),e=rand(2,4);return{q:`${b}${sup(e)} = ?`,ans:Math.pow(b,e),type:'Potens',hint:Array(e).fill(b).join(' · '),sub:'pot'};}},fb:fbPow},
      {id:'pct8',icon:'🏷️',bg:'rgba(168,85,247,.2)',name:'Prosentregning',desc:'Prosentvis endring',
        gen(g,id){const t=pick(['of','inc','dec']);if(t==='of'){const p=pick([5,10,15,20,25,50]),base=rand(1,20)*20;return{q:`${p} % av ${base} = ?`,ans:r2(base*p/100),type:'Prosent',sub:`pct${p}`};}else if(t==='inc'){const p=pick([5,10,20,25]),base=rand(1,10)*100;return{q:`${base} økes med ${p} %. Nytt tall?`,ans:r2(base*(1+p/100)),type:'Prosent',hint:`${base} · ${nf(r2(1+p/100))}`,sub:'pctinc'};}else{const p=pick([5,10,20,25]),base=rand(1,10)*100;return{q:`${base} reduseres med ${p} %. Nytt tall?`,ans:r2(base*(1-p/100)),type:'Prosent',hint:`${base} · ${nf(r2(1-p/100))}`,sub:'pctdec'};}},fb:fbPct},
    ]},
  9:{c1:'#0f3460',c2:'#0b8793',badge:'rgba(11,135,147,.15)',tc:'#06d6ff',icon:'🔭',label:'Pytagoras, statistikk, algebra',
    topics:[
      {id:'pyth9',icon:'📐',bg:'rgba(6,214,255,.2)',name:'Pytagoras',desc:'Finn den manglende siden',
        gen(g,id){const t=[[3,4,5],[5,12,13],[6,8,10],[8,15,17],[9,12,15]];const[a,b,c]=pick(t);const k=rand(1,3);const s=weightedPick(['c','a','b'],x=>errRate(g,id,`pyth_${x}`));if(s==='c')return{q:`a=${a*k}, b=${b*k}, c=?`,ans:c*k,type:'Pytagoras',hint:'c² = a² + b²',sub:'pyth_c'};if(s==='a')return{q:`b=${b*k}, c=${c*k}, a=?`,ans:a*k,type:'Pytagoras',hint:'a² = c² − b²',sub:'pyth_a'};return{q:`a=${a*k}, c=${c*k}, b=?`,ans:b*k,type:'Pytagoras',hint:'b² = c² − a²',sub:'pyth_b'};},fb:fbPyth},
      {id:'stat9',icon:'📈',bg:'rgba(67,233,123,.2)',name:'Statistikk',desc:'Median, typetall og variasjonsbredde',
        gen(g,id){const t=weightedPick(['median','mode','range'],s=>errRate(g,id,s));if(t==='mode'){const m=rand(1,15),k=rand(2,3),n=rand(5,7),pool=shuffle(Array.from({length:15},(_,i)=>i+1).filter(v=>v!==m));const vals=shuffle([...Array(k).fill(m),...pool.slice(0,n-k)]);return{q:`Typetall i ${vals.join(', ')} = ?`,ans:m,type:'Statistikk',hint:'Hvilket tall kommer flest ganger?',sub:'mode'};}const vals=Array.from({length:rand(4,7)},()=>rand(1,15));if(t==='median'){const s=[...vals].sort((a,b)=>a-b);const mid=Math.floor(s.length/2);const ans=s.length%2===0?r2((s[mid-1]+s[mid])/2):s[mid];return{q:`Median av ${vals.join(', ')} = ?`,ans,type:'Statistikk',hint:'Sorter, finn midterste',sub:'median'};}const mn=Math.min(...vals),mx=Math.max(...vals);return{q:`Variasjonsbredde av ${vals.join(', ')} = ?`,ans:mx-mn,type:'Statistikk',hint:'Størst − minst',sub:'range'};},fb:fbStat},
      {id:'alg9',icon:'🧩',bg:'rgba(168,85,247,.2)',name:'Avansert algebra',desc:'Sammensatte likninger',
        gen(g,id){const t=weightedPick(['sys','quad','expand'],s=>errRate(g,id,s));if(t==='sys'){const x=rand(1,8),y=rand(1,8);return{q:`x + y = ${x+y}, x - y = ${x-y}, x = ?`,ans:x,type:'Algebra',hint:'Legg likningene sammen',sub:'sys'};}else if(t==='quad'){const x=rand(1,12);return{q:`x² = ${x*x}, x > 0, x = ?`,ans:x,type:'Algebra',hint:'Ta kvadratroten',sub:'quad'};}else{const a=rand(2,6),b=rand(1,5),c=rand(1,5);return{q:`${a}(x + ${b}) = ${a*c+a*b}, x = ?`,ans:c,type:'Algebra',hint:`Del på ${a} først`,sub:'expand'};}},fb:fbAlg},
    ]},
  10:{c1:'#f7b733',c2:'#fc4a1a',badge:'rgba(247,183,51,.15)',tc:'#ffd93d',icon:'🌌',label:'Funksjoner, trigonometri',
    topics:[
      {id:'func10',icon:'⚙️',bg:'rgba(255,217,61,.2)',name:'Funksjoner',desc:'Beregn funksjonsverdier',
        gen(g,id){const t=weightedPick(['lin','quad','eval'],s=>errRate(g,id,{lin:'func_lin',quad:'func_quad',eval:'func_lin2'}[s])),k=a=>a===1?'':a;if(t==='lin'){const a=rand(1,5),b=rand(1,10),x=rand(1,8);return{q:`f(x) = ${k(a)}x + ${b}, f(${x}) = ?`,ans:a*x+b,type:'Funksjon',hint:`Sett inn x = ${x}`,sub:'func_lin'};}else if(t==='quad'){const a=rand(1,3),x=rand(1,5);return{q:`f(x) = ${k(a)}x², f(${x}) = ?`,ans:a*x*x,type:'Funksjon',hint:`Sett inn x = ${x}`,sub:'func_quad'};}else{const a=rand(1,4),b=rand(1,6),x=rand(1,6);return{q:`g(x) = ${k(a)}x - ${b}, g(${x}) = ?`,ans:a*x-b,type:'Funksjon',hint:`Sett inn x = ${x}`,sub:'func_lin2'};}},fb:fbFunc},
      {id:'trig10',icon:'🔺',bg:'rgba(6,214,255,.2)',name:'Trigonometri',desc:'sin, cos og tan for vanlige vinkler',
        gen(g,id){const known={0:{sin:0,cos:1,tan:0},30:{sin:0.5,cos:0.87,tan:0.58},45:{sin:0.71,cos:0.71,tan:1},60:{sin:0.87,cos:0.5,tan:1.73},90:{sin:1,cos:0}};const fn=weightedPick(['sin','cos','tan'],s=>errRate(g,id,`trig_${s}`));const deg=pick(fn==='tan'?[0,30,45,60]:[0,30,45,60,90]);const ans=known[deg][fn];return{q:`${fn}(${deg}°) = ?`,ans,type:'Trigonometri',hint:'Svar med to desimaler',sub:`trig_${fn}`};},fb:fbTrig},
      {id:'prob10',icon:'🎲',bg:'rgba(168,85,247,.2)',name:'Sannsynlighet',desc:'Beregn enkel sannsynlighet',frac:true,
        gen(g,id){const t=weightedPick(['dice','bag','coin'],s=>errRate(g,id,`prob_${s}`));if(t==='dice'){const f=rand(1,5);return{q:`Terning: P(tall ≤ ${f}) = ?`,ans:r2(f/6),ansTxt:frTxt(f,6),type:'Sannsynlighet',hint:'Svar med brøk, f.eks. 1/2',sub:'prob_dice'};}else if(t==='coin'){const n=rand(1,3),N=Math.pow(2,n);return{q:n===1?'Kast 1 mynt: P(kron) = ?':`Kast ${n} mynter: P(${n} kron) = ?`,ans:r2(1/N),ansTxt:`1/${N}`,type:'Sannsynlighet',hint:`Det er ${N} mulige utfall`,sub:'prob_coin'};}else{const tot=rand(4,12),fav=rand(1,tot-1);return{q:`${tot} kuler, ${fav} røde. P(rød) = ?`,ans:r2(fav/tot),ansTxt:frTxt(fav,tot),type:'Sannsynlighet',hint:'Svar med brøk, f.eks. 1/2',sub:'prob_bag'};}},fb:fbProb},
    ]},
};

// ============================================================
// FEEDBACK
// ============================================================
function say(g){const t=typeof S!=='undefined'&&S&&S.current&&S.current.givenTxt;return t?t:nf(g);}
function eqOf(q){const c=typeof S!=='undefined'&&S&&S.current;return c&&c.q===q&&c.eq?c.eq:q;}
// 1.–2. klasse: kort tilbakemelding (< 10 ord) når svaret vises; bildet legges til av oppgaveløkka (loopReveal)
function kidFb(){return typeof S!=='undefined'&&!!S&&S.grade>=1&&S.grade<=2;}
function warm(g,c){return Math.abs(g-c)<=1?'Nesten! 🤏':pick(['Godt forsøk! 💪','Godt prøvd!','Du er på god vei!']);}
function cnt(a,st,n){return Array.from({length:n},(_,i)=>a+st*(i+1)).join(', ');}
function fbAdd(q,g,c){q=eqOf(q);const p=q.replace(' = ?','').split(' + ');if(p.length!==2)return dflt(g,c);const[x,y]=[+p[0],+p[1]];if(isNaN(x)||isNaN(y))return dflt(g,c);const a=Math.max(x,y),b=Math.min(x,y),o=a%10;let tip;if(kidFb()){const k=b===0?'Pluss 0 gir det samme tallet.':!o&&!(b%10)?'Tell tiere!':a<10&&c>10?'Fyll tieren først!':c<=10?(x===y?'To like!':`Tell videre fra ${a}.`):!o&&b<10?`${a/10} ${a===10?'tier':'tiere'} og ${b} enere.`:b<10&&o+b<10?'Pluss enerne.':b<10?'Fyll opp tieren!':'Tiere for seg, enere for seg.';return g===Math.abs(x-y)&&b>0?`Oi, du trakk fra! ${x} + ${y} = <strong>${c}</strong>. Pluss er å legge til.`:`${x} + ${y} = <strong>${c}</strong>. ${k}`;}if(b===0)tip='Pluss 0 gjør ingenting. Tallet blir det samme!';else if(o===0&&b%10===0){const u=a%100===0&&b%100===0?100:10;tip=`Tenk i ${u===100?'hundrere':'tiere'}: ${a/u} + ${b/u} = ${c/u}. Da er ${a} + ${b} = ${c}.`;}else if(b<=5&&o+b<=10)tip=`Start på ${a} og tell ${b} fremover: ${cnt(a,1,b)}.`;else if(a<10){const f=10-a;tip=`Fyll opp tieren først: ${a} + ${f} = 10. Så ${b-f} til: 10 + ${b-f} = ${c}.`;}else if(b<10)tip=o===0?`${a/10} ${a===10?'tier':'tiere'} og ${b} enere blir ${c}.`:`Enere først: ${o} + ${b} = ${o+b}. Så ${a-o} + ${o+b} = ${c}.`;else{const T=a-o+b-b%10,O=o+b%10;tip=`Tiere: ${a-o} + ${b-b%10} = ${T}. Enere: ${o} + ${b%10} = ${O}. ${T} + ${O} = ${c}.`;}return`${warm(g,c)} ${x} + ${y} = <strong>${c}</strong>. 💡 ${tip}`;}
function fbSub(q,g,c){q=eqOf(q);const p=q.replace(' = ?','').split(' - ');if(p.length!==2)return dflt(g,c);const[a,b]=[+p[0],+p[1]];if(isNaN(a)||isNaN(b))return dflt(g,c);const o=a%10;let tip;if(kidFb()){const k=b===0?'Ingenting tas bort.':b===a?'Alt tas bort.':!o&&!(b%10)?'Tell tiere!':b<=2?`Tell ${b} tilbake.`:a<=10?`Tenk: ${b} + ${c} = ${a}.`:b<10&&o>=b?'Ta bort enerne.':b<10?'Gå via tieren.':'Tiere først, så enere.';return`${g===a+b&&b>0?'Oi, du la sammen! ':''}${a} - ${b} = <strong>${c}</strong>. ${k}`;}if(b===0)tip='Tar du bort 0, blir tallet det samme.';else if(b===a)tip='Tar du bort alt, er det 0 igjen.';else if(o===0&&b%10===0){const u=a%100===0&&b%100===0?100:10;tip=`Tenk i ${u===100?'hundrere':'tiere'}: ${a/u} - ${b/u} = ${c/u}. Da er ${a} - ${b} = ${c}.`;}else if(b<=5&&(a<=20||o>=b))tip=`Start på ${a} og tell ${b} bakover: ${cnt(a,-1,b)}.`;else if(a<=10)tip=`Tenk pluss: ${b} + ${c} = ${a}. Da er ${a} - ${b} = ${c}.`;else if(b<10)tip=o>=b?`Enere: ${o} - ${b} = ${o-b}. Så ${a-o} + ${o-b} = ${c}.`:o===0?`Bruk tiervenner: 10 - ${b} = ${10-b}. Da er ${a} - ${b} = ${a-10} + ${10-b} = ${c}.`:`Ta først ned til tieren: ${a} - ${o} = ${a-o}. Så ${b-o} til: ${a-o} - ${b-o} = ${c}.`;else if(b%10===0)tip=`Ta bort ${b/10} tiere: ${a} - ${b} = ${c}.`;else{const t=b-b%10,m=a-t;tip=`Ta tierne først: ${a} - ${t} = ${m}. Så enerne: ${m} - ${b%10} = ${c}.`;}return`${g===a+b&&b>0?'Oi, der la du sammen! Minus betyr å ta bort.':warm(g,c)} ${a} - ${b} = <strong>${c}</strong>. 💡 ${tip}`;}
function fbMul(q,g,c){q=eqOf(q);const p=q.replace(' = ?','').split(' · ');if(p.length!==2)return dflt(g,c);const[a,b]=[+p[0],+p[1]];if(isNaN(a)||isNaN(b))return dflt(g,c);if(kidFb())return`${g===a+b&&a*b!==a+b?'Oi, du la sammen! ':''}${a} · ${b} = <strong>${c}</strong>. ${a===1?'Én gruppe':a+' grupper'} med ${b}.`;const tip=a===1||b===1?'Ganger du med 1, blir tallet det samme.':a>=2&&a<=5?`${a} grupper med ${b}: ${Array(a).fill(b).join(' + ')} = ${c}.`:`Tell ${a} hopp på ${b}: ${cnt(0,b,a)}.`;return`${g===a+b&&a*b!==a+b?'Oi, der la du sammen! Ganging er mange like grupper.':warm(g,c)} ${a} · ${b} = <strong>${c}</strong>. 💡 ${tip}`;}
function fbDiv(q,g,c){const p=q.replace(' = ?','').split(' : ');if(p.length!==2)return dflt(g,c);const[a,b]=[+p[0],+p[1]];return`${warm(g,c)} 💡 Tenk ganging: ${b} · <strong>${c}</strong> = ${a}. Da er ${a} : ${b} = <strong>${c}</strong>.`;}
function fbFrac(q,g,c){const m=q.match(/1\/(\d+) av (\d+)/);if(!m)return dflt(g,c);const d=+m[1],w=+m[2];return`${warm(g,c)} 💡 Del ${w} i ${d} like deler: ${w} : ${d} = <strong>${c}</strong>. Tenk pizza! 🍕`;}
function fbDec(q,g,c){return`Du svarte ${say(g)}. Sett komma rett under komma. Svaret er <strong>${nf(c)}</strong>.`;}
function fbPct(q,g,c){const t=`Du svarte ${say(g)}. Riktig er <strong>${nf(c)}</strong>.`;if(q.includes('økes'))return`${t} Finn prosenten av tallet, og legg den til.`;if(q.includes('reduseres'))return`${t} Finn prosenten av tallet, og trekk den fra.`;return`${t} Husk: 10 % = del på 10, 20 % = del på 5, 25 % = del på 4, 50 % = del på 2.`;}
function fbRound(q,g,c){return`Du svarte ${say(g)}. Riktig er <strong>${c}</strong>. Se på sifferet bak: 5 eller mer = rund opp. Under 5 = rund ned.`;}
function fbFrOp(q,g,c){const m=q.match(/(\d+)\/(\d+) ([+-]) (\d+)\/(\d+)/);if(!m)return dflt(g,c);const[n1,d1,op,n2,d2]=[+m[1],+m[2],m[3],+m[4],+m[5]],L=d1*d2/gcd(d1,d2),a1=n1*L/d1,a2=n2*L/d2,num=op==='+'?a1+a2:a1-a2,ft=frTxt(num,L),simp=ft!==`${num}/${L}`?` = ${ft}`:'';const conv=[[n1,d1,a1],[n2,d2,a2]].filter(x=>x[1]!==L).map(x=>`${x[0]}/${x[1]} = ${x[2]}/${L}`).join(' og ');const how=d1===d2?`Lik nevner: regn bare med tellerne. ${n1} ${op} ${n2} = ${num}, så ${num}/${L}${simp}.`:`Fellesnevner er ${L}: ${conv}. ${a1}/${L} ${op} ${a2}/${L} = ${num}/${L}${simp}.`;return`Du svarte ${say(g)}. Riktig er <strong>${ft}</strong>. ${how}`;}
function fbGeo(q,g,c){const m=q.match(/(\d+) × (\d+)/),s=q.match(/side (\d+)/);let w,h;if(m){w=+m[1];h=+m[2];}else if(s){w=h=+s[1];}else return dflt(g,c);return q.includes('Areal')?`Du svarte ${say(g)}. Areal = lengde · bredde = ${w} · ${h} = <strong>${c}</strong>. Tenk: hvor mange ruter får plass inni?`:`Du svarte ${say(g)}. Omkrets = alle sidene lagt sammen: ${w} + ${h} + ${w} + ${h} = <strong>${c}</strong>.`;}
function fbNeg(q,g,c){const m=q.match(/^(-?\d+) ([+-]) (\d+)/);if(!m)return dflt(g,c);return`Du svarte ${say(g)}. Start på ${m[1]} på tallinja. Gå ${m[3]} steg til ${m[2]==='+'?'høyre':'venstre'}. Da lander du på <strong>${c}</strong>.`;}
function fbAlg(q,g,c){return`Du svarte ${say(g)}. Riktig er <strong>${c}</strong>. Husk: gjør det samme på begge sider av =!`;}
function fbRatio(q,g,c){return`Du svarte ${say(g)}. Riktig er <strong>${c}</strong>. Finn ut hva det ene tallet er ganget med, og gang det andre tallet med det samme.`;}
function fbStat(q,g,c){const t=`Du svarte ${say(g)}. Riktig er <strong>${nf(c)}</strong>.`;if(q.includes('Gjennomsnitt'))return`${t} Legg sammen alle tallene, og del på hvor mange tall det er.`;if(q.includes('Median'))return`${t} Sorter tallene og finn det midterste.`;if(q.includes('Typetall'))return`${t} Typetallet er tallet som kommer flest ganger.`;if(q.includes('Variasjonsbredde'))return`${t} Ta det største tallet minus det minste.`;return t;}
function fbEq(q,g,c){return`Du svarte ${say(g)}. Riktig er <strong>${c}</strong>. Trekk fra tallet uten x på begge sider. Del så på tallet foran x.`;}
function fbPow(q,g,c){return`Du svarte ${say(g)}. Riktig er <strong>${c}</strong>. Gang grunntallet med seg selv så mange ganger eksponenten sier: 2³ = 2 · 2 · 2 = 8.`;}
function fbPyth(q,g,c){return`Du svarte ${say(g)}. Riktig er <strong>${c}</strong>. a² + b² = c². Bruk kladdeboka!`;}
function fbFunc(q,g,c){return`Du svarte ${say(g)}. Riktig er <strong>${c}</strong>. Sett inn x-verdien i uttrykket, og regn ut steg for steg.`;}
function fbTrig(q,g,c){return`Du svarte ${say(g)}. Riktig er <strong>${nf(c)}</strong>. Husk: sin 30° = 0,5, cos 60° = 0,5, sin 45° = cos 45° ≈ 0,71, tan 45° = 1.`;}
function fbProb(q,g,c){let f,n,m;if(m=q.match(/≤ (\d+)/)){f=+m[1];n=6;}else if(m=q.match(/(\d+) kuler, (\d+) røde/)){f=+m[2];n=+m[1];}else if(m=q.match(/Kast (\d+) mynt/)){f=1;n=Math.pow(2,+m[1]);}else return dflt(g,c);const ft=frTxt(f,n);return`Du svarte ${say(g)}. Riktig er <strong>${ft}</strong>. Det er ${f} gunstig${f===1?"":"e"} av ${n} mulige utfall: ${f}/${n}${ft!==`${f}/${n}`?` = ${ft}`:''}.`;}
function fbTen(q,g,c){const a=10-c;if(kidFb())return`${a} + <strong>${c}</strong> = 10. Tiervenner! 🤝`;return`${warm(g,c)} ${a} + <strong>${c}</strong> = 10. 💡 ${c<=5?`Tell fra ${a} opp til 10: ${cnt(a,1,c)}. Det er ${c} hopp! 🐸`:`Vis 10 fingre og bøy ned ${a}. Da står ${c} fingre igjen! 🖐️🖐️`}`;}
function fbSeq(q,g,c){q=eqOf(q);const ts=q.split(', ');let st=null;for(let i=0;i+1<ts.length;i++)if(ts[i]!=='?'&&ts[i+1]!=='?'){st=ts[i+1]-ts[i];break;}if(st===null||isNaN(st))return dflt(g,c);if(kidFb())return`${ts.map(t=>t==='?'?`<strong>${c}</strong>`:t).join(', ')}. ${st>0?'Pluss':'Minus'} ${Math.abs(st)} hver gang.`;return`${warm(g,c)} 💡 Se på hoppet: tallene blir ${Math.abs(st)} ${st>0?'større':'mindre'} hver gang. ${ts.map(t=>t==='?'?`<strong>${c}</strong>`:t).join(', ')}.`;}
function fbDbl(q,g,c){q=eqOf(q);let m=q.match(/Dobbelt av (\d+)/);if(m){const n=+m[1],o=n%10;if(kidFb())return`${n} + ${n} = <strong>${c}</strong>. To like!`;return`${warm(g,c)} Dobbelt av ${n} er ${n} + ${n} = <strong>${c}</strong>. 💡 ${n>10&&o?`Ta tierne og enerne hver for seg: ${n-o} + ${n-o} = ${2*(n-o)} og ${o} + ${o} = ${2*o}. ${2*(n-o)} + ${2*o} = ${c}.`:'Dobbelt betyr to like mange.'}`;}m=q.match(/Halvparten av (\d+)/);if(m)return kidFb()?`Halvparten av ${m[1]} er <strong>${c}</strong>. ${c} + ${c} = ${m[1]}.`:`${warm(g,c)} Halvparten av ${m[1]} er <strong>${c}</strong>. 💡 Del i to like store deler: ${c} og ${c}. Sjekk: ${c} + ${c} = ${m[1]}.`;return dflt(g,c);}
function fbMiss(q,g,c){q=eqOf(q);const full=q.replace('?',`<strong>${c}</strong>`);if(kidFb()){let mm,kt='';if((mm=q.match(/^(\d+) \+ \? = (\d+)$/))||(mm=q.match(/^\? \+ (\d+) = (\d+)$/)))kt=c<=5?`Tell opp fra ${mm[1]}.`:`Tenk: ${mm[2]} - ${mm[1]} = ${c}.`;else if(mm=q.match(/^(\d+) - \? = (\d+)$/))kt=`Tenk: ${mm[1]} - ${mm[2]} = ${c}.`;return`${full}. ${kt}`.trim();}let m,tip='';if((m=q.match(/^(\d+) \+ \? = (\d+)$/))||(m=q.match(/^\? \+ (\d+) = (\d+)$/))){const k=+m[1],s=+m[2];tip=k%10===0&&s%10===0&&c>=10?`Tell tiere fra ${k}: ${cnt(k,10,c/10)}. Det er ${c/10} tiere = ${c}.`:c<=5?`Tell fra ${k} opp til ${s}: ${cnt(k,1,c)}. Det er ${c} hopp!`:s%10===0&&k%10?`Tenk tiervenner: ${k%10} + ${c} = 10.`:`Tenk minus: ${s} - ${k} = ${c}.`;}else if(m=q.match(/^(\d+) - \? = (\d+)$/))tip=c<=5?`Tell ned fra ${m[1]} til ${m[2]}: ${cnt(+m[1],-1,c)}. Det er ${c} hopp!`:`Tenk: ${m[1]} - ${m[2]} = ${c}.`;return`${warm(g,c)} Tallet som gjemmer seg er <strong>${c}</strong>: ${full}. 💡 ${tip}`;}
function dflt(g,c){return`Du svarte ${say(g)}. Riktig er <strong>${nf(c)}</strong>. Prøv igjen! 💪`;}

const CORRECT=[
  {t:'💥 RIKTIG!',m:'Du traff blink!'},
  {t:'⚡ PERFEKT!',m:'Du er ustoppelig!'},
  {t:'🔥 BINGO!',m:'Det hadde du full kontroll på!'},
  {t:'✅ Riktig!',m:'Så flink du er!'},
  {t:'🚀 SUPERT!',m:'Hjernen din er i topp form!'},
  {t:'🏆 BINGO!',m:'Du er en ekte mattehelt!'},
];
