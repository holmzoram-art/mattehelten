// Mattehelten – Nye temaer for 1.–2. klasse (MAT01-06), minioppgaver og bilde-typer (window.VIS.clock, window.VIS.coins …)
// Alle js-filer deler globalt navnerom (vanlige <script>-tagger i fast rekkefølge, se index.html).
// Lastes etter curriculum.js, vis.js og learn.js. Setter inn temaene i CUR[1]/CUR[2] i pedagogisk rekkefølge.
// Globale navn herfra: mhMini, mhMiniFb, window.EXTRA_SUBS, window.VIS.{clock,coins,place,pairs,compare,scale}, t12* (hjelpere), T12_* (tabeller).

// ============================================================
// HJELPERE
// ============================================================
function t12R(a,b){return Math.floor(Math.random()*(b-a+1))+a;}
function t12P(a){return a[Math.floor(Math.random()*a.length)];}
function t12Sh(a){for(let i=a.length-1;i>0;i--){const j=t12R(0,i);[a[i],a[j]]=[a[j],a[i]];}return a;}
function t12Cap(s){return s.charAt(0).toUpperCase()+s.slice(1);}
function t12Cnt(a,st,n){return Array.from({length:n},(_,i)=>a+st*(i+1)).join(', ');}
function t12Err(g,id,sub){try{return typeof errRate==='function'?Math.min(1,+errRate(g,id,sub)||0):0;}catch(e){return 0;}}
// Stjerner i temaet (A1: topicStars), ellers gamle mestringsregler
function t12Stars(g,id){
  try{if(typeof topicStars==='function')return +topicStars(g,id)||0;}catch(e){}
  try{if(typeof isTopicMastered==='function'&&isTopicMastered(g,id))return 3;if(typeof isTopicPassed==='function'&&isTopicPassed(g,id))return 1;}catch(e){}
  return 0;
}
// Nivå 0–2 for neste oppgave: stjerner i temaet + trapp i runden (lett først, litt vanskeligere mot slutten)
function t12Lvl(g,id){
  const st=t12Stars(g,id);let L=st>=2?2:st>=1?1:0;
  const s=typeof S!=='undefined'?S:null;
  if(s&&!s.boss&&s.topicId===id&&typeof s.idx==='number'){if(s.idx<2)L--;else if(s.idx>=6)L++;}
  return Math.max(0,Math.min(2,L));
}
// Velg deloppgave: tab = {sub:[vekt nivå 0, 1, 2]}; svake deloppgaver får litt mer vekt
function t12Pick(g,id,tab,L){
  const ks=Object.keys(tab).filter(k=>tab[k][L]>0),ws=ks.map(k=>tab[k][L]*(1+t12Err(g,id,k)*1.5));
  let r=Math.random()*ws.reduce((a,b)=>a+b,0);
  for(let i=0;i<ks.length;i++){r-=ws[i];if(r<0)return ks[i];}
  return ks[ks.length-1];
}
// Svaralternativ: fasit + de første gyldige distraktorene, stokket
function t12Choices(ans,cands,n){
  const out=[ans],seen=new Set([String(ans)]);
  for(const c of cands){if(out.length>=n)break;if(c==null||seen.has(String(c)))continue;if(typeof c==='number'&&(!isFinite(c)||c<0))continue;seen.add(String(c));out.push(c);}
  return t12Sh(out);
}
// Gjeldende oppgave (fb får bare q-teksten; strukturert info ligger i S.current)
function t12Q(q,qd){if(qd&&typeof qd==='object')return qd;const c=typeof S!=='undefined'&&S&&S.current;return c&&c.q===q?c:null;}
// 1.–2. klasse: ingen oppvarmingsfrase (tilbakemeldingen skal være kort, som kidFb i curriculum.js)
function t12Warm(g,c){if(typeof S!=='undefined'&&S&&S.grade>=1&&S.grade<=2)return '';const n=+g;return typeof c==='number'&&g!==''&&isFinite(n)&&Math.abs(n-c)<=1?'Nesten! 🤏':t12P(['Godt forsøk! 💪','Godt prøvd!','Du er på god vei!']);}
// Setter sammen tilbakemelding uten doble mellomrom når en del er tom
function t12J(...p){return p.filter(Boolean).join(' ');}
function t12Plain(g,c){return `Svaret er <strong>${typeof nf==='function'?nf(c):c}</strong>.`;}
function t12Say(e){return String(e).replace(/ \+ /g,' pluss ').replace(/ - /g,' minus ').replace(/ · /g,' ganger ').replace(/ : /g,' delt på ');}
function t12Story(o,q,say){o.eq=o.q;o.q=q;o.say=say;return o;}
function t12Tier(n){return n===1?'1 tier':`${n} tiere`;}
function t12Ener(n){return n===1?'1 ener':`${n} enere`;}
function t12Time(n){return n===1?'1 time':`${n} timer`;}
function t12Kr(n){return n===1?'1 krone':`${n} kroner`;}

// Emoji med navn (til opplesing): [emoji, entall, flertall]
const T12_THINGS=[['🍎','eple','epler'],['🍓','jordbær','jordbær'],['⭐','stjerne','stjerner'],['🐟','fisk','fisker'],['🍪','kake','kaker'],['🎈','ballong','ballonger'],['🐞','marihøne','marihøner'],['🍌','banan','bananer'],['🧁','muffins','muffins'],['🌸','blomst','blomster']];
const T12_FOOD=[['🍎','eple','epler'],['🍓','jordbær','jordbær'],['🍪','kake','kaker'],['🍌','banan','bananer'],['🧁','muffins','muffins']];
const T12_ANIMALS=[['🐻','bjørnen'],['🐰','kaninen'],['🐸','frosken'],['🐱','katten'],['🐶','hunden'],['🦊','reven'],['🐷','grisen'],['🐵','apen']];
const T12_SHOP=[['🍭','slikkepinnen'],['🧃','saften'],['🍦','isen'],['🍎','eplet'],['🎈','ballongen'],['🖍️','fargestiften'],['📒','boka'],['🧸','bamsen'],['⚽','ballen'],['🍪','kaka']];
const T12_TAGS=['🔴','🔵','🟢'];

// ============================================================
// BILDER (window.VIS): klokke, mynter, tiere/enere, par, sammenligning, vekt
// ============================================================
window.VIS=window.VIS||{};
function t12Num(x){return Math.round(x*10)/10;}
// Analog urskive: kort rød timeviser, lang blå minuttviser. hl='h'|'m': viseren hintet peker på, blinker (rolig glød ved redusert bevegelse)
function t12ClockSvg(h,m,px,hl){
  m=+m||0;h=+h||12;const ha=((h%12)*30+m*.5)%360,ma=(m*6)%360;
  const calm=typeof visCalm==='function'&&visCalm(),glow=(len,w,a)=>`<line x1="100" y1="100" x2="100" y2="${len}" stroke="#ffd93d" stroke-width="${w}" stroke-linecap="round" opacity=".55" transform="rotate(${t12Num(a)} 100 100)">${calm?'':'<animate attributeName="opacity" values=".7;.1;.7" dur="1.1s" repeatCount="indefinite"/>'}</line>`;
  let s=`<svg class="t12-clock" viewBox="0 0 200 200" width="${px}" height="${px}" role="img" aria-label="Klokke" data-h="${h}" data-m="${m}">`;
  s+='<circle cx="100" cy="100" r="95" fill="#fffaf0" stroke="#6c4ee3" stroke-width="8"/>';
  for(let i=0;i<60;i++){const a=i*Math.PI/30,big=i%5===0,r1=big?80:85,r2=89;s+=`<line x1="${t12Num(100+r1*Math.sin(a))}" y1="${t12Num(100-r1*Math.cos(a))}" x2="${t12Num(100+r2*Math.sin(a))}" y2="${t12Num(100-r2*Math.cos(a))}" stroke="${big?'#3a3166':'#c9c2e6'}" stroke-width="${big?3.5:1.5}" stroke-linecap="round"/>`;}
  for(let i=1;i<=12;i++){const a=i*Math.PI/6;s+=`<text x="${t12Num(100+68*Math.sin(a))}" y="${t12Num(100-68*Math.cos(a))}" class="t12-cl-n">${i}</text>`;}
  if(hl==='h')s+=glow(56,24,ha);else if(hl==='m')s+=glow(39,19,ma);
  s+=`<line class="t12-hand-h" x1="100" y1="100" x2="100" y2="62" stroke="#e23b54" stroke-width="12" stroke-linecap="round" transform="rotate(${t12Num(ha)} 100 100)"/>`;
  s+=`<line class="t12-hand-m" x1="100" y1="100" x2="100" y2="45" stroke="#2b6cff" stroke-width="7" stroke-linecap="round" transform="rotate(${t12Num(ma)} 100 100)"/>`;
  return s+'<circle cx="100" cy="100" r="8" fill="#1d1840"/></svg>';
}
// {h,m} = én klokke; {list:[{h,m,tag}]} = flere små klokker med merke under
window.VIS.clock=v=>{
  if(v&&Array.isArray(v.list))return `<div class="t12-clocks">${v.list.map(c=>`<div class="t12-clk-item">${t12ClockSvg(c.h,c.m,104,c.hl)}${c.tag?`<div class="t12-clk-tag">${c.tag}</div>`:''}</div>`).join('')}</div>`;
  return `<div class="t12-clock-wrap">${t12ClockSvg(v.h,v.m,v.size||170,v.hl)}</div>`;
};
// Norske mynter: 1 og 5 kr er sølvfarget med hull, 10 og 20 kr gullfarget (5 kr er større enn 10 kr, som ekte)
function t12CoinSvg(kr){
  const D={1:52,5:62,10:58,20:66}[kr]||56,gold=kr>=10,O=gold?'#d4a017':'#aab2bd',I=gold?'#f5cd4e':'#e4e8ee',T=gold?'#6b4500':'#2d3440';
  const disc=(r,hole)=>hole?`M ${-r} 0 a ${r} ${r} 0 1 0 ${2*r} 0 a ${r} ${r} 0 1 0 ${-2*r} 0 Z M -9 0 a 9 9 0 1 0 18 0 a 9 9 0 1 0 -18 0 Z`:`M ${-r} 0 a ${r} ${r} 0 1 0 ${2*r} 0 a ${r} ${r} 0 1 0 ${-2*r} 0 Z`;
  let s=`<svg class="t12-coin" viewBox="-50 -50 100 100" width="${D}" height="${D}" role="img" aria-label="${kr} krone${kr===1?'':'r'}" data-kr="${kr}">`;
  s+=`<path d="${disc(49,!gold)}" fill="${O}" fill-rule="evenodd"/><path d="${disc(42,!gold)}" fill="${I}" fill-rule="evenodd" stroke="${O}" stroke-width="2"/>`;
  if(gold)s+=`<text x="0" y="-2" class="t12-coin-n" fill="${T}" font-size="${kr===20?44:48}">${kr}</text><text x="0" y="29" class="t12-coin-k" fill="${T}">kr</text>`;
  else s+=`<circle r="9" fill="none" stroke="${O}" stroke-width="2"/><text x="0" y="-24" class="t12-coin-n" fill="${T}" font-size="36">${kr}</text><text x="0" y="27" class="t12-coin-k" fill="${T}">kr</text>`;
  return s+'</svg>';
}
window.VIS.coins=v=>{const c=(v&&v.c)||[];return `<div class="t12-coins">${c.map(t12CoinSvg).join('')}</div>`;};
// Plassverditabell: tierstaver (10 klosser) og løse enere. dig:true viser sifrene under
window.VIS.place=v=>{
  const t=v.t|0,o=v.o|0;
  const bars=Array.from({length:t},(_,i)=>`<span class="t12-bar" style="--d:${i*70}ms">${'<i></i>'.repeat(10)}</span>`).join('');
  const ones=Array.from({length:o},(_,i)=>`<i class="t12-one" style="--d:${(t+i)*45}ms"></i>`).join('');
  const dig=d=>v.dig?`<div class="t12-pv-dig">${d}</div>`:'';
  return `<div class="t12-pv" role="img" aria-label="${t12Tier(t)} og ${t12Ener(o)}"><div class="t12-pv-col"><div class="t12-pv-h">Tiere</div><div class="t12-pv-b t12-tens">${bars}</div>${dig(t)}</div><div class="t12-pv-col"><div class="t12-pv-h">Enere</div><div class="t12-pv-b t12-ones">${ones}</div>${dig(o)}</div></div>`;
};
// Partall/oddetall: ting satt to og to (par). gap:true viser den tomme plassen
window.VIS.pairs=v=>{
  const n=v.n|0,cols=Math.ceil(n/2),it=v.e?`<span class="t12-pit">${v.e}</span>`:'<i class="t12-pdot"></i>';let h='';
  for(let i=0;i<cols;i++){const two=2*i+1<n;h+=`<span class="t12-pair${two?'':' t12-solo'}">${it}${two?it:v.gap?'<b class="t12-pgap"></b>':''}</span>`;}
  return `<div class="t12-pairs" role="img" aria-label="${n}">${h}</div>${v.num?`<div class="t12-cap">${n}</div>`:''}`;
};
// To rader med ting, én og én under hverandre (lett å se hvem som har flest)
// Mer enn 10 i en rad: mindre ting, 10 per linje (radene står fortsatt én og én under hverandre, også på 375 px)
window.VIS.compare=v=>{const R=v.rows||[],big=Math.max(0,...R.map(r=>r.n|0))>10,box=big?' style="flex-wrap:wrap;width:200px"':'',it=big?' style="width:20px;font-size:1.02rem"':'';
  return `<div class="t12-cmp">${R.map(r=>`<div class="t12-cmp-row"><span class="t12-cmp-who">${r.who}</span><span class="t12-cmp-items"${box}>${`<span class="t12-it"${it}>${r.e}</span>`.repeat(r.n|0)}</span></div>`).join('')}</div>`;};
// Vekt i balanse: venstre = høyre
window.VIS.scale=v=>{
  const tx=s=>String(s).replace(/\?/g,'<tspan class="t12-q">?</tspan>');
  return `<svg class="t12-scale" viewBox="0 0 320 150" role="img" aria-label="Vekt: ${v.l} er lik ${v.r}"><polygon points="146,146 174,146 160,52" fill="#7c5cf0"/><rect x="34" y="47" width="252" height="7" rx="3.5" fill="#c9b8ff"/><circle cx="160" cy="50" r="7" fill="#ffd93d"/><line x1="74" y1="54" x2="74" y2="76" stroke="#c9b8ff" stroke-width="3"/><line x1="246" y1="54" x2="246" y2="76" stroke="#c9b8ff" stroke-width="3"/><rect x="10" y="76" width="128" height="50" rx="14" class="t12-pan"/><rect x="182" y="76" width="128" height="50" rx="14" class="t12-pan"/><text x="74" y="102" class="t12-sc-t">${tx(v.l)}</text><text x="246" y="102" class="t12-sc-t">${tx(v.r)}</text><text x="160" y="22" class="t12-sc-eq">=</text></svg>`;
};
// Lær: tierrammer der noen prikker er tatt bort (gjenbruker .tf-stilene fra index.html)
function t12Frames(n,gone){
  let h='<div class="tf-wrap">';
  for(let f=0;f<Math.ceil(n/10);f++){h+='<div class="tf">';for(let i=f*10;i<f*10+10;i++){const k=i<n?(i>=n-gone?' t12-gone':''):null;h+=`<div class="tf-cell">${k!==null?`<div class="dot${k}" style="background:#7c3aed;animation-delay:${i*40}ms"></div>`:''}</div>`;}h+='</div>';}
  return h+'</div>';
}

// ============================================================
// TEMA: MINUS TIL 20 (sub20)
// ============================================================
function t12GenSub20(g,id){
  const L=t12Lvl(g,id),t=t12Pick(g,id,{s20t:[3,1,1],s20n:[3,2,1],s20o:[4,6,7],s20d:[1,2,2]},L);
  let a,b,strat,hint;
  if(t==='s20t'){const k=t12R(0,L?2:1);a=k===2?20:t12R(11,19);b=k===0?a%10:k===1?10:t12R(2,9);strat='hel-tier';hint=k===0?'Ta bort enerne':k===1?'Ta bort tieren':'Tenk tiervenner';}
  else if(t==='s20n'){a=t12R(12,19);b=t12R(1,Math.min(a%10-1,L?9:3));strat='enere';hint='Se på enerne';}
  else if(t==='s20o'){const lim=[13,15,18][L],P=[];for(let x=11;x<=lim;x++)for(let y=x%10+1;y<=9;y++)if(2*y!==x&&(L>0||y<=6))P.push([x,y]);[a,b]=t12P(P);strat='under-tier';hint=b>=8?`Tenk pluss: ${b} + ? = ${a}`:'Ta ned til 10 først';}
  else{b=t12R(6,9);a=2*b;strat='dobbel';hint='Tenk dobbelt';}
  const o={q:`${a} - ${b} = ?`,ans:a-b,type:'Minus',sub:t,hint,ops:{a,b,op:'-'},strat};
  if(Math.random()<.35){const [E,,nn]=t12P(T12_FOOD),v=t12R(0,2);
    // Bilde til historien, så den kan forstås uten å lese: tingene med de som forsvinner strøket over, eller to rader å sammenligne
    if(v===0){t12Story(o,`Du har ${a} ${E}. Du spiser ${b}. Hvor mange er igjen?`,`Du har ${a} ${nn}. Du spiser ${b}. Hvor mange er igjen?`);o.vis={kind:'dots',g:[a],cross:b,emoji:E};return o;}
    if(v===1){t12Story(o,`Du har ${a} 🎈. ${b} flyr bort. Hvor mange er igjen?`,`Du har ${a} ballonger. ${b} flyr bort. Hvor mange er igjen?`);o.vis={kind:'dots',g:[a],cross:b,emoji:'🎈'};return o;}
    t12Story(o,`Du har ${a} ${E}. Vennen din har ${b}. Hvor mange flere har du?`,`Du har ${a} ${nn}. Vennen din har ${b}. Hvor mange flere har du?`);
    o.vis={kind:'compare',rows:[{who:'🙋',n:a,e:E},{who:'🧒',n:b,e:E}]};return o;}
  return o;
}
// Kort som fbSub: «13 - 5 = 8.» + én konkret regel (≤ 12 ord)
function t12FbSub20(q,g,c,qd){
  const d=t12Q(q,qd),e=d&&d.ops;if(!e)return t12Plain(g,c);
  const a=e.a,b=e.b,o=a%10,res=`${a} - ${b} = <strong>${c}</strong>.`;
  if(+g===a+b)return `Oi, du la sammen! ${res} Minus er å ta bort.`;
  let tip;
  if(b===10)tip='Ta bort tieren.';
  else if(a===20)tip=`${b} fra én tier: 10 - ${b} = ${10-b}.`;
  else if(b<=o)tip='Ta bort enerne.';
  else if(2*b===a)tip=`Dobbelt: ${b} + ${b} = ${a}.`;
  else if(b>=8)tip=`Tenk pluss: ${b} + ${c} = ${a}.`;
  else tip=`Ned til 10 først: ${a} - ${o} - ${b-o}.`;
  return `${res} 💡 ${tip}`;
}

// ============================================================
// TEMA: STØRST OG MINST (cmp1)
// ============================================================
function t12Distinct(n,lo,hi){const s=new Set();while(s.size<n)s.add(t12R(lo,hi));return [...s];}
function t12GenCmp1(g,id){
  const L=t12Lvl(g,id),t=t12Pick(g,id,{c1m:[4,1,0],c1n:[3,2,1],c1t:[0,3,4],c1s:[1,2,2],c1j:[0,2,2],c1d:[2,2,3]},L),T='Størst og minst';
  if(t==='c1m'){
    const [A,B]=t12Sh(T12_ANIMALS.slice()),[E,,nn]=t12P(T12_THINGS),mx=L?10:8;let n1=t12R(2,mx),n2=Math.random()<.15?n1:t12R(2,mx);
    const ans=n1>n2?A[0]:n2>n1?B[0]:'Like mange',why={};
    [A[0],B[0],'Like mange'].forEach(c=>{if(c!==ans)why[c]=c==='Like mange'?'Pek på én og én. Blir noen til overs?':ans==='Like mange'?'Pek på én og én. Får alle en makker?':'Pek på én og én. Hvem har noen igjen?';});
    return {q:'Hvem har flest?',ans,choices:[A[0],B[0],'Like mange'],type:T,sub:t,hint:'Pek på én og én',strat:'sammenlign',
      vis:{kind:'compare',rows:[{who:A[0],n:n1,e:E},{who:B[0],n:n2,e:E}]},say:`Hvem har flest ${nn}, ${A[1]} eller ${B[1]}? Eller har de like mange?`,why,x:{n1,n2,A:A[0],B:B[0]}};
  }
  if(t==='c1d'){
    const a=t12R([3,6,10][L],[10,15,20][L]),b=t12R(Math.max(1,a-(L?9:4)),a-1),[A,B]=t12Sh(T12_ANIMALS.slice()),[E,,nn]=t12P(T12_THINGS);
    const o={q:`${a} - ${b} = ?`,ans:a-b,type:T,sub:t,hint:'Tell de som blir til overs',ops:{a,b,op:'-'},strat:'sammenlign'};
    t12Story(o,`${A[0]} har ${a} ${E}. ${B[0]} har ${b} ${E}. Hvor mange flere har ${A[0]}?`,`${t12Cap(A[1])} har ${a} ${nn}. ${t12Cap(B[1])} har ${b}. Hvor mange flere har ${A[1]}?`);
    o.vis={kind:'compare',rows:[{who:A[0],n:a,e:E},{who:B[0],n:b,e:E}]};
    return o;
  }
  if(t==='c1j'){
    let [a,b]=t12Distinct(2,1,L>1?20:12);const big=Math.random()<.5,truth=Math.random()<.5;
    if((big?a>b:a<b)!==truth)[a,b]=[b,a];
    const q=`Er ${a} ${big?'større':'mindre'} enn ${b}?`;
    return {q,ans:truth?'Ja':'Nei',choices:['Ja','Nei'],type:T,sub:t,hint:'Hvilket tall kommer sist når du teller?',say:q,strat:'sammenlign',vis:{kind:'cue',w:big?'større':'mindre'},x:{a,b,big}};
  }
  // c1n, c1t, c1s: velg tallet som er størst/minst
  const min=t==='c1s'||(t==='c1t'&&Math.random()<.25);let ns;
  if(t==='c1n')ns=t12Distinct(L?3:2,1,10);
  else if(t==='c1s')ns=L===0?t12Distinct(2,1,10):L===1?t12Distinct(3,1,20):null;
  if(!ns){ // tall over 10, ofte med «felle»: 9 mot 13 (9 > 3, men 13 har en tier)
    if(Math.random()<.5){const d=t12R(6,9),x=t12R(0,d-1);ns=[d,10+x];if(L>1){let z;do{z=t12R(10,20);}while(ns.includes(z));ns.push(z);}}
    else ns=t12Distinct(L>1?3:2,10,20);
  }
  const ans=min?Math.min(...ns):Math.max(...ns),q=`Hvilket tall er ${min?'minst':'størst'}?`,ch=t12Sh(ns.slice());
  // Hint for hvert feil valg (why), feiltype «plass» når barnet bare så på enerne (9 mot 13), og en tallinje med tallene
  const why={},whyM={},whyV={},hi=Math.max(...ns),line=d=>hi<=10?{kind:'line',from:0,to:10,start:d,hl:ns}:{kind:'line',from:0,to:20,start:d,hl:ns};
  ns.forEach(d=>{if(d===ans)return;const k=String(d);whyV[k]=line(d);
    if(!min&&d<10&&ans>=10){why[k]=`${d} har ingen tier. Tall med tier er større.`;whyM[k]='plass';}
    else if(min&&d>=10&&ans<10){why[k]=`${d} har en tier. Tall uten tier er mindre.`;whyM[k]='plass';}
    else if(d>=10&&ans>=10){if(Math.floor(d/10)===Math.floor(ans/10))why[k]='Tierne er like. Se på enerne!';else{why[k]=`${d} har ${min?'flere':'færre'} tiere. Se på tierne!`;whyM[k]='plass';}}
    else why[k]=min?`Tell ned fra ${d}. Kommer det et mindre?`:`Tell videre fra ${d}. Kommer det et større?`;});
  return {q,ans,choices:ch,type:T,sub:t,hint:ns.some(n=>n>=10)&&ns.some(n=>n<10)?'Se på tierne først':min?'Hvilket kommer først når du teller?':'Hvilket kommer sist når du teller?',
    say:`${q} ${ch.slice(0,-1).join(', ')} eller ${ch[ch.length-1]}?`,strat:'sammenlign',vis:{kind:'cue',w:min?'minst':'størst'},why,whyM,whyV,x:{ns,min}};
}
function t12FbCmp1(q,g,c,qd){
  const d=t12Q(q,qd);if(!d)return t12Plain(g,c);const x=d.x||{};
  if(d.sub==='c1m'){if(c==='Like mange')return `<strong>Like mange</strong>: begge har ${x.n1}. 💡 Alle har en makker.`;const big=Math.max(x.n1,x.n2),sm=Math.min(x.n1,x.n2);return `<strong>${c}</strong> har flest: ${big} mot ${sm}. 💡 Pek på én og én.`;}
  if(d.sub==='c1d'){const e=d.ops,res=`${e.a} - ${e.b} = <strong>${c}</strong>.`;return +g===e.a+e.b?`Oi, du la sammen! ${res} 💡 Pek på én og én.`:`${res} 💡 Pek på én og én. ${c} blir til overs.`;}
  if(d.sub==='c1j'){const a=x.a,b=x.b,rel=a>b?'større':'mindre';return `<strong>${c}</strong>. ${a} er ${rel} enn ${b}. 💡 ${Math.max(a,b)} kommer sist når du teller.`;}
  const ns=x.ns||[],tip=ns.some(n=>n>=10)&&ns.some(n=>n<10)?`${x.min?'Det uten tier er minst.':'Tall med en tier er større.'}`:x.min?'Det kommer først når du teller.':'Det kommer sist når du teller.';
  return `<strong>${c}</strong> er ${x.min?'minst':'størst'}. 💡 ${tip}`;
}

// ============================================================
// TEMA: ER DET LIKT? (eq1) – likhetstegnet som «like mye som»
// ============================================================
function t12GenEq1(g,id){
  // Færre Ja/Nei (gjettbare): «8 = 5 + ?» og «4 + 3 = 5 + ?» er hovedsaken; e1b er tall-oppgave fra nivå 1
  const L=t12Lvl(g,id),t=t12Pick(g,id,{e1s:[2,1,1],e1v:[2,2,1],e1l:[3,2,2],e1b:[2,4,4],e1k:[0,1,1],e1m:[0,0,2]},L),M=[10,12,20][L],T='Er det likt?';
  const tf=(q,say,l,lv,r,rv)=>({q,ans:lv===rv?'Ja':'Nei',choices:['Ja','Nei'],type:T,sub:t,hint:'Regn ut begge sider',say,strat:'likhet',x:{l,lv,r,rv}});
  const wrong=v=>{const d=t12P([1,1,-1,-1,2]);return v+d>=0?v+d:v-d;};
  if(t==='e1s'){
    const minus=L>0&&Math.random()<.4,s=t12R(minus?1:2,minus?M-1:M);let a,b,v;
    if(minus){a=t12R(s+1,Math.min(M,s+9));b=a-s;v=s;}else{a=t12R(1,s-1);b=s-a;v=s;}
    const sh=Math.random()<.5?v:wrong(v),op=minus?'-':'+',l=`${a} ${op} ${b}`;
    return tf(`${l} = ${sh}. Stemmer det?`,`Stemmer det? ${t12Say(l)} er ${sh}.`,l,v,String(sh),sh);
  }
  if(t==='e1v'){const s=t12R(3,M),a=t12R(1,s-1),b=s-a,sh=Math.random()<.65?s:wrong(s),r=`${a} + ${b}`;
    return Object.assign(tf(`${sh} = ${r}. Stemmer det?`,`Stemmer det? ${sh} er lik ${a} pluss ${b}.`,String(sh),sh,r,s),{hint:'Svaret kan stå først'},sh===s?{whyM:{Nei:'likhet'}}:{});}
  if(t==='e1k'){const a=t12R(1,9);let b;do{b=t12R(1,9);}while(b===a);const ok=Math.random()<.5,b2=ok?b:b+t12P([1,-1].filter(d=>b+d>0)),l=`${a} + ${b}`,r=`${ok?b:b2} + ${a}`;
    return Object.assign(tf(`${l} = ${r}. Stemmer det?`,`Stemmer det? ${t12Say(l)} er lik ${t12Say(r)}.`,l,a+b,r,(ok?b:b2)+a),{hint:'Er det de samme tallene?'});}
  // «8 = 5 + ?»: q er selve regnestykket (eq = q, så rekkefølgen beholdes også i resultatlisten), med vekt
  if(t==='e1l'){const s=t12R(3,M),a=t12R(1,s-1),first=Math.random()<.7,r=first?`${a} + ?`:`? + ${a}`;
    const o={q:`${s} = ${r}`,ans:s-a,type:T,sub:t,hint:`Tell fra ${a} til ${s}`,ops:first?{a,b:s-a,op:'+',unk:'b'}:{a:s-a,b:a,op:'+',unk:'a'},strat:'likhet'};
    o.eq=o.q;o.say=first?`${s} er lik ${a} pluss hva?`:`${s} er lik hva pluss ${a}?`;o.vis={kind:'scale',l:String(s),r};o.x={s,a};return o;}
  // e1b / e1m: like mye på begge sider, med vekt
  let a,b,lv,l,c;
  if(t==='e1m'){a=t12R(8,20);b=t12R(1,Math.min(9,a-3));lv=a-b;l=`${a} - ${b}`;}
  else if(L===2&&Math.random()<.35){a=t12R(6,9);b=t12R(11-a,9);if(Math.random()<.5)[a,b]=[b,a];lv=a+b;l=`${a} + ${b}`;c=10;} // 8 + 5 = 10 + ?
  else{lv=t12R(4,M);a=t12R(1,lv-1);b=lv-a;l=`${a} + ${b}`;}
  if(c==null){do{c=t12R(1,lv-1);}while(t==='e1b'&&(c===a||c===b)&&lv>3);}
  const ans=lv-c,r=`${c} + ?`,base={q:`${l} = ${r}`,ans,type:T,sub:t,hint:'Begge sider skal bli like mye',say:`${t12Say(l)} er lik ${c} pluss hva?`,vis:{kind:'scale',l,r},strat:'likhet',x:{l,lv,c}};
  if(t==='e1b'&&L>=1)return Object.assign(base,{ops:{a:c,b:ans,op:'+',unk:'b'}}); // tall-oppgave (ikke gjettbar)
  // Valg: venstre side (7) og alt lagt sammen (12) er de typiske feilene med likhetstegnet
  const why={},whyM={};why[lv]=`${lv} er venstre side. ${c} + hva blir ${lv}?`;why[lv+c]=`Ikke legg sammen alt. Regn ut ${l} først.`;whyM[lv]=whyM[lv+c]='likhet';
  return Object.assign(base,{choices:t12Choices(ans,[lv,lv+c],3),why,whyM});
}
function t12FbEq1(q,g,c,qd){
  const d=t12Q(q,qd);if(!d)return t12Plain(g,c);const x=d.x||{};
  if(d.sub==='e1l')return t12J(t12Warm(g,c),`${x.s} = ${x.a} + <strong>${c}</strong>. 💡 ${c<=3?`Tell fra ${x.a}: ${t12Cnt(x.a,1,c)}.`:`Tenk: ${x.s} - ${x.a} = ${c}.`}`);
  if(d.sub==='e1b'||d.sub==='e1m')return `${String(g)===String(x.lv)?'= betyr «like mye». ':''}${x.l} = ${x.lv}. Og ${x.c} + <strong>${c}</strong> = ${x.lv}. 💡 Likt!`;
  const num=s=>/^\d+$/.test(s);
  if(c==='Ja')return `<strong>Ja</strong>, det stemmer. Begge sider er ${x.lv}.${d.sub==='e1v'?' 💡 Svaret kan stå først.':''}`;
  const side=(e,v)=>num(e)?null:`${e} er ${v}`,p=[side(x.l,x.lv),side(x.r,x.rv)].filter(Boolean),n=num(x.l)?x.l:num(x.r)?x.r:null;
  return `<strong>Nei</strong>. ${n!=null?`${p[0]}, ikke ${n}.`:`${p[0]}, men ${p[1]}.`}`;
}

// ============================================================
// TEMA: KLOKKA – HEL OG HALV (clock1)
// ============================================================
function t12H(h){return ((h-1)%12+12)%12+1;}
function t12ClockTxt(h,m){h=t12H(h);return m===30?`Halv ${t12H(h+1)}`:`Klokka ${h}`;}
function t12Digi(h,m){return `${t12H(h)}:${String(m).padStart(2,'0')}`;}
function t12GenClock1(g,id){
  const L=t12Lvl(g,id),t=t12Pick(g,id,{k1h:[5,2,1],k1t:[0,4,4],k1v:[2,2,2],k1d:[0,0,1],k1r:[1,2,2]},L),T='Klokka';
  const base={type:T,sub:t};
  // why: hint for hvert feil valg, whyM: feiltype, whyV: klokka med viseren hintet peker på (blinker)
  const W=(o,c,txt,mis,v)=>{const k=String(c);if(k===String(o.ans)||o.why[k])return;o.why[k]=txt;if(mis)o.whyM[k]=mis;if(v)o.whyV[k]=v;};
  if(t==='k1h'){const h=t12R(1,12),ans=t12ClockTxt(h,0),cl=hl=>({kind:'clock',h,m:0,size:130,hl});
    const o={...base,q:'Hva er klokka?',ans,choices:t12Choices(ans,[h===12?6:12,12-h||12,h+1,h-1].map(x=>t12ClockTxt(x,0)),3),hint:'Se på den korte viseren',say:'Se på klokka. Hva er klokka?',vis:{kind:'clock',h,m:0},strat:'hel-time',x:{h,m:0},why:{},whyM:{},whyV:{}};
    o.choices.forEach(c=>{if(c==='Klokka 12'&&h!==12)W(o,c,'Den lange viseren står på 12. Se på den korte!','visere',cl('h'));
      else if(h===12)W(o,c,'Begge viserne peker rett opp. Hvilket tall er det?',null,cl('h'));
      else W(o,c,'Følg den korte viseren helt ut til tallet.',null,cl('h'));});
    return o;}
  if(t==='k1t'){const h=t12R(1,12),ans=t12ClockTxt(h,30),cl=hl=>({kind:'clock',h,m:30,size:130,hl});
    const o={...base,q:'Hva er klokka?',ans,choices:t12Choices(ans,[t12ClockTxt(h-1,30),t12ClockTxt(h,0),t12ClockTxt(h+1,0)],3),hint:'Kort viser er halvveis til neste time',say:'Se på klokka. Hva er klokka?',vis:{kind:'clock',h,m:30},strat:'halv-time',x:{h,m:30},why:{},whyM:{},whyV:{}};
    W(o,t12ClockTxt(h-1,30),`Kort viser er forbi ${t12H(h)}. Halv: halvveis til neste time.`,'halvtime',cl('h')); // «halv 3» for 3.30
    W(o,t12ClockTxt(h,0),'Lang viser på 6: da er det halv.','visere',cl('m'));
    W(o,t12ClockTxt(h+1,0),'Lang viser på 6: da er det halv.','visere',cl('m'));
    return o;}
  if(t==='k1v'){
    const h=t12R(1,12),m=L&&Math.random()<.6?30:0,lbl=t12ClockTxt(h,m);
    // halv: også den typiske feilen (halv 4 = 4.30); hel: også byttede visere (12 og h*5)
    const ds=m?[[h+1,30],[h+1,0],[h,0]]:L?[[h+1,0],[h,30],h===12?[h-1,0]:[12,h*5]]:[[h+1,0],[h-1,0],[12-h===h||h===12?h+3:12-h,0]],pos=t12R(0,2),others=t12Sh(ds.slice()).slice(0,2),list=[];
    for(let i=0,k=0;i<3;i++){const [hh,mm]=i===pos?[h,m]:others[k++];list.push({h:t12H(hh),m:mm,tag:T12_TAGS[i]});}
    const q=`Hvilken klokke viser ${lbl.toLowerCase()}?`,o={...base,q,ans:T12_TAGS[pos],choices:T12_TAGS.slice(),hint:'Se på begge viserne',say:q,vis:{kind:'clock',list},strat:m?'halv-time':'hel-time',x:{h,m,lbl},why:{},whyM:{},whyV:{}};
    list.forEach((c,i)=>{if(i===pos)return;const sw=m===0&&c.h===12&&c.m!==0,v=hl=>({kind:'clock',h:c.h,m:c.m,size:130,hl});
      if(m===30&&c.m===30)W(o,c.tag,`Halv ${t12H(h+1)} kommer før klokka ${t12H(h+1)}.`,'halvtime',v('h'));
      else if(m===30)W(o,c.tag,'Lang viser på 12 er hel time. Halv: på 6.','visere',v('m'));
      else if(sw)W(o,c.tag,'Her er viserne byttet om. Kort viser timen.','visere',v('h'));
      else if(c.m===30)W(o,c.tag,'Lang viser på 6 er halv. Hel time: på 12.','visere',v('m'));
      else W(o,c.tag,`Kort viser skal peke på ${t12H(h)}.`,null,v('h'));});
    return o;
  }
  if(t==='k1d'){const h=t12R(1,12),m=Math.random()<.5?30:0,ans=t12Digi(h,m),sw=`${m?6:12}:${String(h*5%60).padStart(2,'0')}`,ds=m?[t12Digi(h+1,30),t12Digi(h,0),sw]:[t12Digi(h,30),t12Digi(h+1,0),sw],cl=hl=>({kind:'clock',h,m,size:130,hl});
    const o={...base,q:'Hva står på en digital klokke?',ans,choices:t12Choices(ans,ds,3),hint:'Timen først, så minuttene',say:'Se på klokka. Hva står på en digital klokke nå?',vis:{kind:'clock',h,m},strat:'digital',x:{h,m},why:{},whyM:{},whyV:{}};
    if(m){W(o,ds[0],`Kort viser har ikke nådd ${t12H(h+1)} ennå.`,'halvtime',cl('h'));W(o,ds[1],'Lang viser på 6 betyr 30 minutter.','visere',cl('m'));}
    else{W(o,ds[0],'Lang viser på 12 betyr 00 minutter.','visere',cl('m'));W(o,ds[1],'Følg den korte viseren helt ut til tallet.',null,cl('h'));}
    W(o,sw,'Kort viser viser timen. Lang viser minuttene.','visere',cl('h'));
    return o;}
  // k1r: timer etter (tall-tastatur). Bilde av klokka i alle historiene.
  const k=t12R(1,[1,2,3][L]),h=t12R(1,12-k),v=L===2?t12R(0,2):t12R(0,1);
  const o={q:`${h} + ${k} = ?`,ans:h+k,...base,hint:'Tell timene fremover',ops:{a:h,b:k,op:'+'},strat:'klokke-tid',x:{h,k}};
  if(v===0){t12Story(o,`Klokka er ${h}. Hva er klokka om ${t12Time(k)}?`,`Klokka er ${h}. Hva er klokka om ${t12Time(k)}?`);o.vis={kind:'clock',h,m:0};return o;}
  if(v===1){t12Story(o,`Filmen starter klokka ${h}. Den varer i ${t12Time(k)}. Når er den ferdig?`,`Filmen starter klokka ${h}. Den varer i ${t12Time(k)}. Når er den ferdig?`);o.vis={kind:'clock',h,m:0};return o;}
  const p={q:`${h+k} - ${h} = ?`,ans:k,...base,hint:`Tell fra ${h} til ${h+k}`,ops:{a:h+k,b:h,op:'-'},strat:'klokke-tid',x:{h,k,from:true}};
  t12Story(p,`Fra klokka ${h} til klokka ${h+k}. Hvor mange timer er det?`,`Fra klokka ${h} til klokka ${h+k}. Hvor mange timer er det?`);
  p.vis={kind:'clock',list:[{h,m:0,tag:'▶️'},{h:h+k,m:0,tag:'🏁'}]};return p;
}
function t12FbClock1(q,g,c,qd){
  const d=t12Q(q,qd);if(!d)return t12Plain(g,c);const x=d.x||{};
  const how=(h,m)=>m===30?`💡 Lang viser på 6. Kort viser halvveis til ${t12H(h+1)}.`:`💡 Lang viser på 12. Kort viser på ${t12H(h)}.`;
  if(d.sub==='k1h'||d.sub==='k1t')return `<strong>${c}</strong>! ${how(x.h,x.m)}`;
  if(d.sub==='k1v')return `<strong>${c}</strong> viser ${x.lbl.toLowerCase()}. ${how(x.h,x.m)}`;
  if(d.sub==='k1d')return `<strong>${c}</strong>. 💡 ${x.m?`Halv ${t12H(x.h+1)} er 30 minutter over ${t12H(x.h)}.`:`Hel time: 00 minutter.`}`;
  if(x.from)return t12J(t12Warm(g,c),`Det er <strong>${c}</strong> ${c===1?'time':'timer'}. 💡 Tell fra ${x.h}: ${t12Cnt(x.h,1,c)}.`);
  return t12J(t12Warm(g,c),`Klokka blir <strong>${c}</strong>. 💡 Fra klokka ${x.h}, tell ${x.k}: ${t12Cnt(x.h,1,x.k)}.`);
}

// ============================================================
// TEMA: TIERE OG ENERE (place2)
// ============================================================
function t12GenPlace2(g,id){
  const L=t12Lvl(g,id),t=t12Pick(g,id,{p2b:[4,2,1],p2e:[3,2,1],p2m:[2,3,3],p2d:[0,3,3],p2t:[1,2,2],p2v:[0,1,2],p2x:[0,1,2]},L),T='Tiere og enere',base={type:T,sub:t,strat:'tier-ener'};
  const tt=t12R(1,L?9:5);let oo=t12R(L?0:1,9);const n=10*tt+oo;
  // why/whyM for hvert feil valg: snudde sifre, «en stav er 1», tellefeil på stavene eller klossene
  const WY=(o,list)=>{o.why={};o.whyM={};list.forEach(([v,txt,mis])=>{const k=String(v);if(v==null||k===String(o.ans)||o.why[k])return;o.why[k]=txt;if(mis)o.whyM[k]=mis;});return o;};
  if(t==='p2b'){const o={...base,q:'Hvilket tall er dette?',ans:n,choices:t12Choices(n,[oo&&oo!==tt?10*oo+tt:null,tt+oo,n+10<100?n+10:null,n-10>0?n-10:null,n+1,n-1],3),hint:'En stav er 10',say:'Se på tierne og enerne. Hvilket tall er det?',vis:{kind:'place',t:tt,o:oo},x:{t:tt,o:oo}};
    return WY(o,[[oo&&oo!==tt?10*oo+tt:null,'Stavene er tiere. Tierne skrives først.','snudd'],[tt+oo,'En stav er en hel tier, ikke 1.','plass'],[n+10,'Tell stavene en gang til.','ti'],[n-10,'Tell stavene en gang til.','ti'],[n+1,'Tell de små klossene en gang til.','en'],[n-1,'Tell de små klossene en gang til.','en']]);}
  if(t==='p2x'){const t2=t12R(1,6),o2=t12R(10,15),m=10*t2+o2;
    const o={...base,q:'Hvilket tall er dette?',ans:m,choices:t12Choices(m,[m-10,t2+o2,m+10],3),hint:'10 enere blir 1 tier',say:`Det er ${t12Tier(t2)} og ${o2} enere. Hvilket tall er det?`,vis:{kind:'place',t:t2,o:o2},x:{t:t2,o:o2}};
    return WY(o,[[m-10,'10 små klosser blir en tier til. Tell igjen!','plass'],[t2+o2,'En stav er en hel tier, ikke 1.','plass'],[m+10,'Tell stavene en gang til.','ti']]);}
  if(t==='p2e'){if(!oo)oo=t12R(1,9);const m=10*tt+oo,sw=L>0&&Math.random()<.3,o={...base,q:sw?`${oo} + ${10*tt} = ?`:`${10*tt} + ${oo} = ?`,ans:m,hint:'Tiere først, så enere',ops:sw?{a:oo,b:10*tt,op:'+'}:{a:10*tt,b:oo,op:'+'},x:{t:tt,o:oo}};
    o.say=sw?`Hva er ${oo} pluss ${10*tt}?`:`Hva er ${10*tt} pluss ${oo}?`;if(L<2)o.vis={kind:'place',t:tt,o:oo};return o;}
  if(t==='p2m'){
    const k=t12P(L?['+10','-10','+1','-1']:['+10','-10']);let m,q,eq,ans,op,b=k.length>2?10:1;
    if(k==='+10'){m=t12R(11,89);ans=m+10;}else if(k==='-10'){m=t12R(21,99);ans=m-10;}else if(k==='+1'){m=10*t12R(1,8)+9;ans=m+1;}else{m=10*t12R(2,9);ans=m-1;}
    op=k[0];q=`Hva er ${b} ${op==='+'?'mer':'mindre'} enn ${m}?`;eq=`${m} ${op} ${b} = ?`;
    const o={...base,q,eq,ans,hint:b===10?(op==='+'?'Én tier til':'Én tier mindre'):(op==='+'?'Én ener til':'Én ener mindre'),say:q,ops:{a:m,b,op},x:{m,k}};
    if(L===0)o.vis={kind:'place',t:Math.floor(m/10),o:m%10};return o;}
  // «65 = 60 + ?»: q er selve regnestykket (eq = q, så rekkefølgen beholdes i resultatlisten); unk = leddet som mangler
  if(t==='p2d'){if(!oo)oo=t12R(1,9);const m=10*tt+oo,first=Math.random()<.55,q=first?`${m} = ${10*tt} + ?`:`${m} = ? + ${oo}`;
    return {...base,q,eq:q,ans:first?oo:10*tt,hint:'Del i tiere og enere',
      say:first?`${m} er lik ${10*tt} pluss hva?`:`${m} er lik hva pluss ${oo}?`,ops:{a:10*tt,b:oo,op:'+',unk:first?'b':'a'},x:{t:tt,o:oo,m}};}
  // p2t / p2v: sifrenes plass
  let t3=t12R(2,9),o3;do{o3=t12R(1,9);}while(o3===t3);const m=10*t3+o3;
  if(t==='p2t'){const tens=Math.random()<.6,q=`Hvor mange ${tens?'tiere':'enere'} er det i ${m}?`;
    const o={...base,q,ans:tens?t3:o3,choices:t12Choices(tens?t3:o3,tens?[o3,10*t3]:[t3],tens?3:2),hint:tens?'Tierne står først':'Enerne står sist',say:q,x:{t:t3,o:o3,m,tens}};
    return WY(o,tens?[[o3,'Tierne står først i tallet.','plass'],[10*t3,`Hvor mange tiere er ${10*t3}?`,'plass']]:[[t3,'Enerne står sist i tallet.','plass']]);}
  const tens=Math.random()<.5,dd=tens?t3:o3,q=`Hva betyr ${dd}-tallet i ${m}?`,A=t12Tier(dd),B=t12Ener(dd);
  return {...base,q,ans:tens?A:B,choices:[A,B],hint:'Første siffer er tiere',say:q,whyM:{[tens?B:A]:'plass'},x:{t:t3,o:o3,m,tens}};
}
function t12FbPlace2(q,g,c,qd){
  const d=t12Q(q,qd);if(!d)return t12Plain(g,c);const x=d.x||{},gs=String(g);
  if(d.sub==='p2b'||d.sub==='p2x'){const rv=x.o<10?String(10*x.o+x.t):'';
    const tip=d.sub==='p2x'?'10 enere blir 1 tier til.':gs===rv?'Tierne skrives først.':+g===x.t+x.o?'En stav er 10, ikke 1.':`${t12Tier(x.t)} og ${t12Ener(x.o)}.`;
    return `Det er <strong>${c}</strong>. 💡 ${tip}`;}
  if(d.sub==='p2e')return t12J(t12Warm(g,c),`${d.ops.a} + ${d.ops.b} = <strong>${c}</strong>. 💡 ${gs===String(10*x.o+x.t)?'Tierne skrives først! ':''}${t12Tier(x.t)} og ${t12Ener(x.o)}.`);
  if(d.sub==='p2m'){const tn=Math.floor(x.m/10),tip=x.k==='+10'?`Én tier til: ${tn} blir ${tn+1}.`:x.k==='-10'?`Én tier mindre: ${tn} blir ${tn-1}.`:x.k==='+1'?'10 enere blir en ny tier.':`Tell ned én: ${x.m}, ${c}.`;
    return t12J(t12Warm(g,c),`${x.k.length>2?'10':'1'} ${x.k[0]==='+'?'mer':'mindre'} enn ${x.m} er <strong>${c}</strong>. 💡 ${tip}`);}
  if(d.sub==='p2d')return t12J(t12Warm(g,c),`${x.m} = ${c===x.o?`${10*x.t} + <strong>${c}</strong>`:`<strong>${c}</strong> + ${x.o}`}. 💡 ${t12Tier(x.t)} og ${t12Ener(x.o)}.`);
  if(d.sub==='p2t')return `Det er <strong>${c}</strong> ${x.tens?(c===1?'tier':'tiere'):(c===1?'ener':'enere')}. 💡 ${x.m} er ${t12Tier(x.t)} og ${t12Ener(x.o)}.`;
  return `<strong>${c}</strong>. 💡 I ${x.m} er ${x.t}-tallet tiere og ${x.o}-tallet enere.`;
}

// ============================================================
// TEMA: PARTALL OG ODDETALL (even2)
// ============================================================
function t12Par(n){return n%2?'Oddetall':'Partall';}
function t12GenEven2(g,id){
  // Færre tovalgsoppgaver (gjettbare): o2f har tre valg, o2r er tall-oppgave, o2s bare på nivå 2
  const L=t12Lvl(g,id),t=t12Pick(g,id,{o2b:[5,2,1],o2n:[1,1,0],o2f:[2,3,3],o2s:[0,0,4],o2r:[3,3,3],o2d:[1,1,1]},L),T='Partall og oddetall',base={type:T,sub:t,strat:'partall'},PO=['Partall','Oddetall'];
  if(t==='o2b'){const n=t12R(2,L?12:10);return {...base,q:'Partall eller oddetall?',ans:t12Par(n),choices:PO.slice(),hint:'Får alle sokkene en makker?',say:'Er det et partall eller et oddetall? Se om alle sokkene får en makker.',vis:{kind:'pairs',n,e:'🧦'},x:{n}};}
  if(t==='o2n'){const n=t12R(1,L?20:10),q=`Er ${n} et partall eller et oddetall?`;return {...base,q,ans:t12Par(n),choices:PO.slice(),hint:'Kan du dele likt i to?',say:q,x:{n}};}
  if(t==='o2f'){const ev=Math.random()<.5,mx=L>1?99:20,pk=want=>{let n;do{n=t12R(1,mx);}while(n%2!==(want?0:1));return n;};
    const ans=pk(ev),s=new Set([ans]);while(s.size<3)s.add(pk(!ev));const w=ev?'partall':'oddetall',q=`Hvilket tall er et ${w}?`,ch=t12Sh([...s]);
    // why: sjekk tallet barnet valgte (siste siffer, eller sokker i par for små tall)
    const why={},whyV={};ch.forEach(d=>{if(d===ans)return;why[d]=d<10?`Kan ${d} deles likt i to?`:`${d} slutter på ${d%10}. Er ${d%10} et ${w}?`;if(d<=20)whyV[d]={kind:'pairs',n:d,gap:true};});
    return {...base,q,ans,choices:ch,hint:'Se på enerne',say:`${q} ${ch[0]}, ${ch[1]} eller ${ch[2]}?`,why,whyV,x:{w}};}
  if(t==='o2s'){const ev=Math.random()<.5,truth=Math.random()<.5;let n;do{n=t12R(21,99);}while((n%2===0)!==(ev===truth));const w=ev?'partall':'oddetall',q=`Er ${n} et ${w}?`;
    return {...base,q,ans:truth?'Ja':'Nei',choices:['Ja','Nei'],hint:'Se på enerne',say:q,x:{n,w}};}
  if(t==='o2r'){const odd=Math.random()<.5,mx=[12,30,60][L];let s0=t12R(odd?1:2,mx);if(s0%2!==(odd?1:0))s0++;
    const ts=[0,1,2,3].map(i=>s0+2*i),mi=L?t12P([1,2,3,3]):3,ans=ts[mi];ts[mi]='?';const seq=ts.join(', '),w=odd?'oddetall':'partall';
    const o={...base,q:seq,ans,hint:'Hopp 2 hver gang',x:{w,prev:mi?ans-2:ans+2,mi},
      hv:{kind:'line',from:Math.max(0,s0-2),to:s0+8,step:2,start:s0,hops:[2,2,2],hopLab:['+2','+2','+2'],hide:[ans]}}; // bilde til hintet: hopp på tallinja
    return t12Story(o,`🐸 Frosken hopper på ${w}: ${seq}`,`Frosken hopper på ${w}. Hvilket tall mangler? ${seq.replace('?','hva')}?`);}
  const n=2*t12R(2,L?10:6),[E,,nn]=t12P(T12_FOOD),o={...base,q:`${n} : 2 = ?`,ans:n/2,hint:'Gi én og én',ops:{a:n,b:2,op:':'},x:{n}};
  return t12Story(o,`Del ${n} ${E} likt på 2 barn. Hvor mange får hvert barn?`,`Del ${n} ${nn} likt på 2 barn. Hvor mange får hvert barn?`);
}
function t12FbEven2(q,g,c,qd){
  const d=t12Q(q,qd);if(!d)return t12Plain(g,c);const x=d.x||{};
  const split=n=>n%2?`${n} = ${(n-1)/2} + ${(n+1)/2}. Det blir ikke likt.`:`${n} = ${n/2} + ${n/2}. Likt!`;
  if(d.sub==='o2b')return `<strong>${c}</strong>. 💡 ${x.n%2?'Én sokk blir alene.':'Alle sokkene har en makker.'}`;
  if(d.sub==='o2n')return `<strong>${c}</strong>. 💡 ${split(x.n)}`;
  if(d.sub==='o2f')return c<10?`<strong>${c}</strong> er et ${x.w}. 💡 ${split(c)}`:`<strong>${c}</strong> slutter på ${c%10}. 💡 Da er det et ${x.w}.`;
  if(d.sub==='o2s')return `<strong>${c}</strong>. ${x.n} slutter på ${x.n%10}, så ${x.n} er et ${t12Par(x.n).toLowerCase()}.`;
  if(d.sub==='o2r')return t12J(t12Warm(g,c),`Svaret er <strong>${c}</strong>. 💡 ${x.mi?`${x.prev} + 2 = ${c}.`:`${c} + 2 = ${x.prev}.`}`);
  return t12J(t12Warm(g,c),`Hvert barn får <strong>${c}</strong>. 💡 ${c} + ${c} = ${x.n}.`);
}

// ============================================================
// TEMA: PENGER (money2) – norske mynter 1, 5, 10 og 20 kr
// ============================================================
function t12Sum(c){return c.reduce((a,b)=>a+b,0);}
function t12CoinMix(max,den,maxN,minS){
  for(let n=0;n<80;n++){const c=[];t12Sh(den.slice()).slice(0,t12R(2,Math.min(3,den.length))).forEach(v=>{const k=t12R(1,v===20?3:v===10?2:3);for(let i=0;i<k;i++)c.push(v);});
    const s=t12Sum(c);if(s<=max&&s>=(minS||2)&&c.length>=2&&c.length<=maxN)return c.sort((a,b)=>b-a);}
  return [10,5,1];
}
function t12CoinSet(L){
  if(L===0){if(Math.random()<.5){const v=t12P([1,5,10,20]),k=t12R(2,v===20?3:v===10?4:5);return Array(k).fill(v);}return t12CoinMix(20,[10,5,1],4);}
  return L===1?t12CoinMix(50,[20,10,5,1],5,10):t12CoinMix(99,[20,10,5,1],7,25);
}
function t12GenMoney2(g,id){
  const L=t12Lvl(g,id),t=t12Pick(g,id,{m2c:[5,3,2],m2n:[2,2,2],m2i:[2,3,3],m2s:[2,2,2],m2m:[0,1,2],m2f:[0,2,2]},L),T='Penger',base={type:T,sub:t,strat:'penger'};
  const [E,N]=t12P(T12_SHOP);
  if(t==='m2c'){const c=t12CoinSet(L),s=t12Sum(c),ans=`${s} kr`,mn=Math.min(...c);
    const o={...base,q:'Hvor mange kroner?',ans,choices:t12Choices(ans,[c.length!==s?`${c.length} kr`:null,`${s-mn} kr`,`${s+10} kr`,`${s+5} kr`].filter(x=>x!=='0 kr'),3),hint:'Tell de store myntene først',say:'Hvor mange kroner er det til sammen?',vis:{kind:'coins',c},x:{c,s},why:{},whyM:{}};
    // why: talte mynter (ikke verdi), glemte en mynt, eller talte feil
    [[`${c.length} kr`,'Se på tallet på hver mynt.','mynt'],[`${s-mn} kr`,'Har du med alle myntene? Pek på hver.'],[`${s+10} kr`,'Start med den største mynten. Tell videre.'],[`${s+5} kr`,'Start med den største mynten. Tell videre.']]
      .forEach(([k,txt,mis])=>{if(k===ans||o.why[k]||!o.choices.includes(k))return;o.why[k]=txt;if(mis)o.whyM[k]=mis;});
    return o;}
  if(t==='m2n'){const c=t12CoinSet(L),s=t12Sum(c),truth=Math.random()<.5,p=truth?t12R(Math.max(2,s-5),s):t12R(s+1,s+5);
    return {...base,q:`${E} koster ${p} kr. Har du nok?`,ans:truth?'Ja':'Nei',choices:['Ja','Nei'],hint:'Tell pengene dine først',say:`${t12Cap(N)} koster ${t12Kr(p)}. Har du nok penger?`,vis:{kind:'coins',c},x:{s,p}};}
  if(t==='m2f'){
    const den=[20,10,5,1],mk=()=>t12CoinMix(L>1?50:30,den,3),ok=mk(),A=t12Sum(ok),seen=new Set([ok.join(' + ')]),ds=[];
    for(let n=0;n<40&&ds.length<2;n++){const w=ok.slice(),i=t12R(0,w.length-1);w[i]=t12P(den.filter(v=>v!==w[i]));w.sort((a,b)=>b-a);const s=w.join(' + ');if(t12Sum(w)!==A&&!seen.has(s)){seen.add(s);ds.push(s);}}
    for(const w of [[...ok,1],ok.slice(1),[...ok,5]]){if(ds.length>=2)break;w.sort((a,b)=>b-a);const s=w.join(' + ');if(w.length>=1&&t12Sum(w)!==A&&!seen.has(s)){seen.add(s);ds.push(s);}}
    const ans=ok.join(' + '),why={},whyV={};
    ds.slice(0,2).forEach(s=>{const cs=s.split(' + ').map(Number);why[s]=`${s} blir ${t12Sum(cs)} kr. Vi trenger ${A}.`;whyV[s]={kind:'coins',c:cs};});
    return {...base,q:`Hvilke mynter blir ${A} kr?`,ans,choices:t12Sh([ans,...ds.slice(0,2)]),hint:'Legg sammen myntene',say:`Hvilke mynter blir ${t12Kr(A)} til sammen?`,why,whyV,x:{A}};}
  if(t==='m2i'){const pc=[[10],[20],t12P([[20,10],[20,20,10]])][L],pay=t12Sum(pc),p=t12R(L?Math.max(3,pay-19):2,pay-1);
    const o={...base,q:`${pay} - ${p} = ?`,ans:pay-p,hint:`Tell fra ${p} opp til ${pay}`,ops:{a:pay,b:p,op:'-'},x:{pay,p}};
    t12Story(o,`Du betaler ${pay} kr. ${E} koster ${p} kr. Hvor mye får du igjen?`,`Du betaler ${t12Kr(pay)}. ${t12Cap(N)} koster ${t12Kr(p)}. Hvor mye får du igjen?`);o.vis={kind:'coins',c:pc};return o;}
  if(t==='m2s'){const mx=[20,50,99][L],p1=t12R(2,mx-2),p2=t12R(2,Math.max(2,Math.min(mx-p1,L?40:10)));let [E2,N2]=t12P(T12_SHOP);while(E2===E)[E2,N2]=t12P(T12_SHOP);
    const o={...base,q:`${p1} + ${p2} = ?`,ans:p1+p2,hint:'Legg sammen prisene',ops:{a:p1,b:p2,op:'+'},x:{p1,p2}};
    return t12Story(o,`${E} koster ${p1} kr. ${E2} koster ${p2} kr. Hvor mye til sammen?`,`${t12Cap(N)} koster ${t12Kr(p1)}. ${t12Cap(N2)} koster ${t12Kr(p2)}. Hvor mye koster de til sammen?`);}
  const p=t12R(L>1?20:8,L>1?99:50),h=t12R(Math.max(2,p-(L>1?40:15)),p-1),o={...base,q:`${h} + ? = ${p}`,ans:p-h,hint:`Tell fra ${h} opp til ${p}`,ops:{a:h,b:p-h,op:'+',unk:'b'},x:{h,p}};
  return t12Story(o,`Du har ${h} kr. ${E} koster ${p} kr. Hvor mye mangler du?`,`Du har ${t12Kr(h)}. ${t12Cap(N)} koster ${t12Kr(p)}. Hvor mye mangler du?`);
}
function t12FbMoney2(q,g,c,qd){
  const d=t12Q(q,qd);if(!d)return t12Plain(g,c);const x=d.x||{};
  if(d.sub==='m2c'){let r=0;const run=x.c.map(v=>r+=v);return String(g)===`${x.c.length} kr`?`Det er <strong>${c}</strong>. 💡 Se på tallet på hver mynt!`:`Det er <strong>${c}</strong>. 💡 Tell: ${run.join(', ')}.`;}
  if(d.sub==='m2n')return c==='Ja'?`<strong>Ja</strong>! Du har ${x.s} kr. Det holder til ${x.p} kr.`:`<strong>Nei</strong>. Du har ${x.s} kr, men trenger ${x.p} kr.`;
  if(d.sub==='m2f')return `<strong>${c}</strong> blir ${x.A} kr.`;
  if(d.sub==='m2i')return t12J(t12Warm(g,c),`Du får <strong>${c}</strong> kr igjen. 💡 Fra ${x.p} til ${x.pay} er ${c}.`);
  if(d.sub==='m2s')return t12J(t12Warm(g,c),`${x.p1} + ${x.p2} = <strong>${c}</strong> kr. 💡 ${x.p1>=10&&x.p2>=10?'Tiere først, så enere.':`Tell videre fra ${Math.max(x.p1,x.p2)}.`}`);
  return t12J(t12Warm(g,c),`Du mangler <strong>${c}</strong> kr. 💡 ${x.h} + ${c} = ${x.p}.`);
}

// ============================================================
// MINIOPPGAVER I KAMP: «Stemmer det?» og «Hvilken er størst?» (A2 kaller mhMini for 1.–2. klasse)
// ============================================================
const T12_NOMINI=new Set(['clock1','money2','even2','cmp1','eq1']);
function t12Calc(op,a,b){return op==='+'?a+b:op==='-'?a-b:op==='·'?a*b:op===':'?(b?a/b:NaN):op==='dbl'?2*a:op==='half'?a/2:NaN;}
// Typisk feil: ±1 (tellefeil), ±10, ±2, snudde sifre, la sammen i stedet for minus, doblet i stedet for halvert
function t12Wrong(v,a,b,op){
  const c=[[v+1,4],[v-1,4],[v+2,1],[v-2,1]];
  if(v>=10)c.push([v+10,2],[v-10,2]);
  if(v>=12&&v<100&&v%10!==Math.floor(v/10)&&v%10)c.push([10*(v%10)+Math.floor(v/10),2]);
  if(op==='-'&&b>0)c.push([a+b,1]);
  if(op==='half')c.push([2*a,1]);
  const ok=c.filter(([w])=>w>=0&&w<=100&&w!==v&&Number.isInteger(w));if(!ok.length)return null;
  let r=Math.random()*ok.reduce((s,x)=>s+x[1],0);for(const [w,k] of ok){r-=k;if(r<0)return w;}return ok[0][0];
}
function mhMini(qd,g,topicId){
  try{
    if(!qd||qd.mini||(Array.isArray(qd.choices)&&qd.choices.length)||T12_NOMINI.has(topicId))return null;
    let o=qd.ops;
    if(!o){const m=String(qd.eq||qd.q||'').match(/^(\d+) ([+\-·:]) (\d+) = \?$/);if(m)o={a:+m[1],b:+m[3],op:m[2]};}
    if(!o)return null;
    const op={'*':'·','x':'·','/':':'}[o.op]||o.op,a=+o.a,b=+o.b,unary=op==='dbl'||op==='half';
    if(!Number.isInteger(a)||(!unary&&!Number.isInteger(b)))return null;
    const v=t12Calc(op,a,b);if(!Number.isInteger(v)||v<0||v>100)return null;
    const mk=(x,y)=>op==='dbl'?`Dobbelt av ${x}`:op==='half'?`Halvparten av ${x}`:`${x} ${op} ${y}`,E=mk(a,b),is=unary?'er':'=',base={ops:o,strat:qd.strat,mini:true};
    if(Math.random()<.6){
      let truth=Math.random()<.5,sh=truth?v:t12Wrong(v,a,b,op);if(sh==null){truth=true;sh=v;}
      const q=`${E} ${is} ${sh}. Stemmer det?`;
      const r={...base,q,ans:truth?'Ja':'Nei',choices:['Ja','Nei'],type:'Stemmer det?',sub:'mini-tf',hint:'Regn ut selv først',say:`Stemmer det? ${t12Say(E)} er ${sh}.`,mini:{kind:'tf',e:E,is,v,sh,truth}};r.mx=r.mini;return r;
    }
    let other=null,ov=null;
    if(!unary&&Math.random()<.5)for(let n=0;n<12&&other==null;n++){const dd=t12P([-2,-1,1,2]),fx=Math.random()<.5,x=fx?a+dd:a,y=fx?b:b+dd;if(x<0||y<0)continue;const w=t12Calc(op,x,y);if(!Number.isInteger(w)||w<0||w===v)continue;other=mk(x,y);ov=w;}
    if(other==null){const dd=t12P([-3,-2,-1,1,2,3]);ov=v+dd>=0?v+dd:v-dd;other=String(ov);}
    const ch=t12Sh([E,other]),A={e:E,v},B={e:other,v:ov},big=v>ov?A:B;
    const r={...base,q:'Hvilken er størst?',ans:big.e,choices:ch,type:'Hvilken er størst?',sub:'mini-cmp',hint:'Regn ut begge',say:`Hvilken er størst? ${t12Say(ch[0])}, eller ${t12Say(ch[1])}?`,mini:{kind:'cmp',a:A,b:B}};r.mx=r.mini;return r;
  }catch(e){return null;}
}
// Tilbakemelding for minioppgaver (brukes av fb-innpakningen under; A2 kan også kalle den direkte)
function mhMiniFb(qd,given){
  const m=qd&&(qd.mini&&typeof qd.mini==='object'?qd.mini:qd.mx);if(!m||typeof m!=='object')return ''; // loopNext setter qd.mini=true; dataene ligger også i qd.mx
  if(m.kind==='tf')return m.truth?`<strong>Ja</strong>, det stemmer: ${m.e} ${m.is} ${m.v}.`:`<strong>Nei</strong>. ${m.e} ${m.is} ${m.v}, ikke ${m.sh}.`;
  const big=m.a.v>m.b.v?m.a:m.b,sm=big===m.a?m.b:m.a,val=x=>x.e===String(x.v)?x.e:`${x.e} ${/av/.test(x.e)?'er':'='} ${x.v}`;
  return `${val(big)} og ${val(sm)}. 💡 <strong>${big.e}</strong> er størst.`; // ≤ 12 ord
}

// ============================================================
// TEMAENE, REKKEFØLGE, NAVN PÅ DELOPPGAVER, LÆR
// ============================================================
// qd.key: samme oppgave = samme nøkkel (flere bildeoppgaver har lik tekst, f.eks. «Hva er klokka?»), til «ingen gjentakelse i runden»
function t12Keyed(f){return function(g,id){const qd=f(g,id);if(qd&&!qd.key)qd.key=`${qd.sub}|${qd.eq||qd.q}|${qd.vis?JSON.stringify(qd.vis):''}|${(qd.choices||[]).map(String).sort().join(',')}`;return qd;};}
const T12_TOPICS={
  1:[{id:'cmp1',icon:'🐊',bg:'rgba(0,255,136,.2)',name:'Størst og minst',desc:'Hvilket tall er størst?',gen:t12Keyed(t12GenCmp1),fb:t12FbCmp1},
     {id:'eq1',icon:'⚖️',bg:'rgba(168,85,247,.2)',name:'Er det likt?',desc:'Like mye på hver side av =',gen:t12Keyed(t12GenEq1),fb:t12FbEq1},
     {id:'sub20',icon:'➖',bg:'rgba(255,68,102,.2)',name:'Minus til 20',desc:'Ta bort, også forbi tieren',gen:t12Keyed(t12GenSub20),fb:t12FbSub20},
     {id:'clock1',icon:'🕒',bg:'rgba(6,214,255,.2)',name:'Klokka',desc:'Hel og halv time',gen:t12Keyed(t12GenClock1),fb:t12FbClock1}],
  2:[{id:'place2',icon:'🧱',bg:'rgba(6,214,255,.2)',name:'Tiere og enere',desc:'Tall opp til 100',gen:t12Keyed(t12GenPlace2),fb:t12FbPlace2},
     {id:'even2',icon:'🧦',bg:'rgba(240,147,251,.2)',name:'Partall og oddetall',desc:'Får alle en makker?',gen:t12Keyed(t12GenEven2),fb:t12FbEven2},
     {id:'money2',icon:'🪙',bg:'rgba(255,217,61,.2)',name:'Penger',desc:'Mynter, priser og penger igjen',gen:t12Keyed(t12GenMoney2),fb:t12FbMoney2}],
};
const T12_ORDER={1:['add10','sub10','ten1','cmp1','seq1','eq1','add20','sub20','clock1'],2:['place2','add100','sub100','miss2','even2','money2','dbl2','mul25']};
// Bølge 3 (C2): Mønster (valgfritt), Tallinja (teller for bossen) og Tell til 100 (valgfritt). Generatorene står nederst i fila.
T12_TOPICS[1].push({id:'pat1',icon:'🧩',bg:'rgba(255,159,67,.2)',name:'Mønster',desc:'Hva kommer nå?',optional:true,gen:t12Keyed(t12GenPat1),fb:t12FbPat1});
T12_TOPICS[2].push({id:'line2',icon:'📏',bg:'rgba(6,214,255,.2)',name:'Tallinja',desc:'Hvor peker pilen?',gen:t12Keyed(t12GenLine2),fb:t12FbLine2},
  {id:'count2',icon:'💯',bg:'rgba(0,255,136,.2)',name:'Tell til 100',desc:'Tell forbi tierne, fram og tilbake',optional:true,gen:t12Keyed(t12GenCount2),fb:t12FbCount2});
T12_ORDER[1].splice(T12_ORDER[1].indexOf('cmp1')+1,0,'pat1');T12_ORDER[2].splice(T12_ORDER[2].indexOf('place2')+1,0,'line2','count2');
window.EXTRA_SUBS=Object.assign(window.EXTRA_SUBS||{},{
  s20t:'Minus via hel tier (17 − 7)',s20n:'Minus uten tierovergang (17 − 4)',s20o:'Minus med tierovergang (13 − 5)',s20d:'Minus med dobling (14 − 7)',
  c1m:'Hvem har flest?',c1n:'Størst av tall til 10',c1t:'Størst av tall til 20',c1s:'Minst av tallene',c1j:'Større enn og mindre enn',c1d:'Hvor mange flere?',
  e1s:'Stemmer det?',e1v:'Svaret står først (7 = 4 + 3)',e1l:'Finn tallet: 7 = 4 + ?',e1b:'Like mye på begge sider',e1k:'Bytte plass (4 + 3 = 3 + 4)',e1m:'Minus og pluss på hver side',
  k1h:'Hel time',k1t:'Halv time',k1v:'Finn riktig klokke',k1d:'Digital klokke',k1r:'Timer senere',
  p2b:'Tiere og enere til tall',p2e:'Tiere + enere (40 + 7)',p2m:'10 mer og 10 mindre',p2d:'Dele opp tall (47 = 40 + 7)',p2t:'Hvor mange tiere?',p2v:'Hva betyr sifferet?',p2x:'Veksle 10 enere til 1 tier',
  o2b:'Partall og oddetall med bilde',o2n:'Partall eller oddetall (til 20)',o2s:'Partall og oddetall til 100',o2f:'Finn partallet eller oddetallet',o2r:'Hopp på partall og oddetall',o2d:'Del likt på to',
  m2c:'Telle mynter',m2n:'Har du nok penger?',m2i:'Penger igjen',m2s:'Legge sammen priser',m2m:'Hvor mye mangler?',m2f:'Hvilke mynter?',
  'mini-tf':'Stemmer det?','mini-cmp':'Hvilken er størst?',
});
(function(){
  if(typeof CUR!=='object')return;
  [1,2].forEach(g=>{
    const gd=CUR[g];if(!gd||!Array.isArray(gd.topics))return;
    T12_TOPICS[g].forEach(t=>{if(!gd.topics.some(x=>x.id===t.id))gd.topics.push(t);});
    const ord=T12_ORDER[g],ix=t=>{const i=ord.indexOf(t.id);return i<0?ord.length:i;};
    const sorted=gd.topics.slice().sort((a,b)=>ix(a)-ix(b));gd.topics.splice(0,gd.topics.length,...sorted);
    // Minioppgaver: tilbakemeldingen til et tema sjekker først om oppgaven er en minioppgave
    gd.topics.forEach(t=>{if(typeof t.fb!=='function'||t.fb._t12)return;const f0=t.fb,w=function(q,gv,c){const cur=t12Q(q,arguments[3]);return cur&&cur.mini?mhMiniFb(cur,gv):f0.apply(this,arguments);};w._t12=true;try{Object.defineProperty(w,'name',{value:f0.name});}catch(e){}t.fb=w;});
  });
  const m=CUR[2]&&CUR[2].topics.find(t=>t.id==='mul25');if(m)m.optional=true; // ganging er ikke mål etter 2. trinn
  // Navn på nye deloppgaver også før A1 sin fmtSub sjekker EXTRA_SUBS selv (ufarlig etterpå)
  if(typeof fmtSub==='function'&&!fmtSub._t12){const f0=fmtSub;fmtSub=function(s){const x=window.EXTRA_SUBS&&window.EXTRA_SUBS[s];return x||f0(s);};fmtSub._t12=true;}
})();

// Lær-guider (samme format som LEARN_GUIDES i learn.js)
(function(){
  if(typeof LEARN_GUIDES!=='object')return;
  const cap=t=>typeof capLine==='function'?capLine(t):`<div class="t12-cap">${t}</div>`,G=t=>typeof grn==='function'?grn(t):t;
  const W=s=>typeof workedEx==='function'?workedEx(s):s.map(x=>`<div>${x[0]}</div>`).join(''),P=(a,c)=>typeof pills==='function'?pills(a,c):a.join(' · ');
  const row=(...h)=>`<div class="t12-row">${h.join('')}</div>`;
  LEARN_GUIDES.sub20=[
    {icon:'🔟',title:'Ta ned til 10 først',text:'13 - 5: Ta bort 3. Da er du på 10. Ta så bort 2 til.',visual:t12Frames(13,5)+cap(`13 - 3 = 10. 10 - 2 = ${G('8')}`)},
    {icon:'🔄',title:'Tenk pluss',text:'14 - 9: Hvor mye mangler 9 for å bli 14?',visual:(typeof seqHops==='function'?seqHops([9,10,11,12,13,14],'+1',5):'')+cap(`Fra 9 til 14 er det 5 hopp. 14 - 9 = ${G('5')}`)},
    {icon:'👯',title:'Dobbelt hjelper',text:'7 + 7 = 14. Da er 14 - 7 = 7!',visual:P(['12 - 6 = 6','14 - 7 = 7','16 - 8 = 8','18 - 9 = 9'],'#f093fb')},
    {icon:'🎯',title:'Din tur!',text:'Ta ned til 10 først.',pre:t12Frames(15,0),
     ask:{q:'15 - 7 = ?',ans:8,ops:{a:15,b:7,op:'-'},help:{t:'Ta bort 5. Da er du på 10. Så 2 til.',h:t12Frames(15,5)}},
     visual:W([['15 - 7 = ?','',false],['15 - 5 = 10','(ned til 10)',true],['10 - 2 = 8','(2 til)',true],['15 - 7 = 8 ✓','',false]])}];
  LEARN_GUIDES.cmp1=[
    {icon:'🐻',title:'Hvem har flest?',text:'Pek på én og én. Den som har noen igjen, har flest.',visual:window.VIS.compare({rows:[{who:'🐻',n:6,e:'🍎'},{who:'🐰',n:4,e:'🍎'}]})+cap(`🐻 har ${G('2')} flere`)},
    {icon:'🔢',title:'Størst kommer sist',text:'Når vi teller, blir tallene større og større.',visual:(typeof seqHops==='function'?seqHops([5,6,7,8,9],'+1',4):'')+cap(`9 er størst. 5 er minst.`)},
    {icon:'🧱',title:'Se på tierne',text:'13 har en tier. 9 har ingen tier. Da er 13 størst!',visual:row(window.VIS.place({t:1,o:3,dig:true}),window.VIS.place({t:0,o:9,dig:true}))+cap(`${G('13')} er større enn 9`)},
    {icon:'🐊',title:'Din tur!',text:'Krokodillen vil ha det største tallet.',
     ask:{q:'Hvilket tall er størst?',ans:15,choices:[12,9,15],say:'Hvilket tall er størst? 12, 9 eller 15?',
       help:{t:'Tell fra 8. Det største kommer sist.',v:{kind:'line',from:8,to:16,start:8,hl:[9,12,15]}},why:{'9':'9 har ingen tier. Se på tierne!'}},
     visual:W([['12, 9 eller 15?','',false],['9 har ingen tier','',true],['15 har flere enere enn 12','',true],['15 er størst ✓','',false]])}];
  LEARN_GUIDES.eq1=[
    {icon:'⚖️',title:'= betyr «like mye»',text:'Det skal være like mye på hver side. Da står vekta rett.',visual:window.VIS.scale({l:'3 + 2',r:'5'})},
    {icon:'🔁',title:'Svaret kan stå først',text:'7 = 4 + 3 er også riktig. Begge sider er 7.',visual:window.VIS.scale({l:'7',r:'4 + 3'})},
    {icon:'🧮',title:'Regnestykke på begge sider',text:'4 + 3 er 7. 5 + 2 er også 7. Da er de like!',visual:window.VIS.scale({l:'4 + 3',r:'5 + 2'})},
    {icon:'🎯',title:'Din tur!',text:'Hvilket tall mangler?',
     ask:{q:'4 + 3 = 5 + ?',eq:'5 + ? = 7',ans:2,ops:{a:5,b:2,op:'+',unk:'b'},vis:{kind:'scale',l:'4 + 3',r:'5 + ?'},say:'4 pluss 3 er lik 5 pluss hva?',
       help:{t:'4 + 3 er 7. Tell fra 5 til 7.',v:{kind:'line',from:4,to:8,start:5,hops:[1,1],top:'?'}},why:{'7':'7 er venstre side. 5 + hva blir 7?'}},
     visual:W([['4 + 3 = 7','(venstre side)',true],['5 + 2 = 7','(høyre side)',true],['? = 2 ✓','',false]])}];
  LEARN_GUIDES.clock1=[
    {icon:'🕒',title:'To visere',text:'Den korte røde viseren viser timen. Den lange blå viseren viser minuttene.',visual:window.VIS.clock({h:2,m:0})},
    {icon:'🔝',title:'Hel time',text:'Peker den lange viseren rett opp på 12? Da er det hel time.',visual:window.VIS.clock({h:3,m:0})+cap(`Kort viser på 3: ${G('Klokka 3')}`)},
    {icon:'🌗',title:'Halv',text:'Peker den lange viseren ned på 6? Da er det halv. Den korte er på vei til 4. Vi sier halv 4!',visual:window.VIS.clock({h:3,m:30})+cap(G('Halv 4'))},
    {icon:'🎯',title:'Din tur!',text:'Se på begge viserne.',
     ask:{q:'Hva er klokka?',ans:'Halv 8',choices:['Klokka 7','Halv 8','Halv 7'],vis:{kind:'clock',h:7,m:30},say:'Se på klokka. Hva er klokka? Klokka 7, halv 8 eller halv 7?',
       help:{t:'Lang viser ned: halv. Se på den korte!',h:`<div class="lp-blink-h">${window.VIS.clock({h:7,m:30,size:130})}</div>`},
       why:{'Halv 7':'Den korte er forbi 7. Halv betyr halvveis til neste.','Klokka 7':'Den lange peker ned på 6. Da er det halv.'}},
     visual:W([['Lang viser på 6','(halv)',true],['Kort viser på vei til 8','',true],['Halv 8 ✓','',false]])}];
  LEARN_GUIDES.place2=[
    {icon:'🧱',title:'10 enere = 1 tier',text:'Ti små klosser blir en stav. En stav er en tier.',visual:row(window.VIS.place({t:0,o:10}),'<span class="dot-eq">=</span>',window.VIS.place({t:1,o:0}))},
    {icon:'🔢',title:'Tiere og enere',text:'Tell stavene først. Tell så de små klossene.',visual:window.VIS.place({t:3,o:4})+cap(`3 tiere og 4 enere = ${G('34')}`)},
    {icon:'📍',title:'Sifrene har en plass',text:'I 34 står 3 for tiere og 4 for enere.',visual:window.VIS.place({t:3,o:4,dig:true})},
    {icon:'⬆️',title:'10 mer',text:'Legg til en stav. Da blir det 10 mer!',visual:window.VIS.place({t:4,o:4})+cap(`34 + 10 = ${G('44')}`)},
    {icon:'🎯',title:'Din tur!',text:'Tell stavene først. Tell så de små klossene.',
     ask:{q:'Hvilket tall er dette?',ans:52,vis:{kind:'place',t:5,o:2},say:'Se på tierne og enerne. Hvilket tall er det?',
       help:{t:'Stavene er tiere: 10, 20, 30 … Så enerne.',v:{kind:'place',t:5,o:2,dig:true}},why:{'25':'Tierne skrives først!','7':'En stav er 10, ikke 1.'}},
     visual:W([['5 tiere = 50','',true],['2 enere = 2','',true],['50 + 2 = 52 ✓','',false]])}];
  LEARN_GUIDES.even2=[
    {icon:'🧦',title:'Partall',text:'Får alle sokkene en makker? Da er det et partall.',visual:window.VIS.pairs({n:6,e:'🧦',num:true})},
    {icon:'🙋',title:'Oddetall',text:'Blir én sokk alene? Da er det et oddetall.',visual:window.VIS.pairs({n:7,e:'🧦',num:true,gap:true})},
    {icon:'🔍',title:'Se på enerne',text:'Partall slutter på 0, 2, 4, 6 eller 8. Oddetall slutter på 1, 3, 5, 7 eller 9.',visual:P(['0','2','4','6','8'],'#00ff88')+'<div style="height:8px"></div>'+P(['1','3','5','7','9'],'#ff6b35')},
    {icon:'🎯',title:'Din tur!',text:'Se på enerne.',
     ask:{q:'Hvilket tall er et partall?',ans:46,choices:[37,46,51],say:'Hvilket tall er et partall? 37, 46 eller 51?',
       help:{t:'Partall slutter på 0, 2, 4, 6 eller 8.',h:P(['0','2','4','6','8'],'#00ff88')},why:{'37':'37 slutter på 7. Det er et oddetall.','51':'51 slutter på 1. Det er et oddetall.'}},
     visual:W([['46 slutter på 6','',true],['6 er et partall','',true],['46 er et partall ✓','',false]])}];
  LEARN_GUIDES.money2=[
    {icon:'🪙',title:'Norske mynter',text:'Vi har mynter på 1, 5, 10 og 20 kroner. Tallet viser hvor mye mynten er verdt.',visual:window.VIS.coins({c:[1,5,10,20]})},
    {icon:'🔢',title:'Tell de store først',text:'Start med den største mynten. Tell videre.',visual:window.VIS.coins({c:[20,10,5,1]})+cap(`20, 30, 35, ${G('36')} kr`)},
    {icon:'🍦',title:'Hvor mye får du igjen?',text:'Du betaler 20 kr. Isen koster 15 kr. Tell fra 15 opp til 20.',visual:window.VIS.coins({c:[20]})+cap(`16, 17, 18, 19, 20: ${G('5')} kr igjen`)},
    {icon:'🎯',title:'Din tur!',text:'Tell de store myntene først.',
     ask:{q:'Hvor mange kroner?',ans:25,vis:{kind:'coins',c:[10,10,5]},say:'Hvor mange kroner er det til sammen?',
       help:{t:'Tell: 10, 20 … Så 5 til.',v:{kind:'line',from:0,to:30,step:5,start:0,hops:[10,10,5],hopLab:['+10','+10','+5'],endLab:'?'}},why:{'3':'Se på tallet på hver mynt!'}},
     visual:W([['10, 20','(tierne)',true],['20 + 5 = 25','',true],['25 kr ✓','',false]])}];
})();

// Temakartet: bygg på nytt når skjermen blir så smal/bred at antall kolonner endres (se getTopicPositions i maps.js)
(function(){
  if(typeof window==='undefined'||typeof window.addEventListener!=='function')return;
  let tm=0;
  const check=()=>{
    const sc=document.getElementById('screen-topics');if(!sc||!sc.classList.contains('active')||typeof buildTopicMap!=='function'||typeof topicMapCols!=='function'||typeof currentGrade==='undefined')return;
    const n=(CUR[currentGrade]?.topics||[]).length;
    if(typeof getTopicPositions==='function'&&getTopicPositions.cols!==topicMapCols(n))buildTopicMap(currentGrade);
  },later=()=>{clearTimeout(tm);tm=setTimeout(check,200);};
  window.addEventListener('resize',later);
  const w=typeof ResizeObserver==='function'&&document.getElementById('topic-map-wrap');if(w)new ResizeObserver(later).observe(w); // også når bare kartets bredde endres
})();

// ============================================================
// BØLGE 3 (C2): MØNSTER (pat1, 1. kl.), TALLINJA (line2, 2. kl.), TELL TIL 100 (count2, 2. kl.) – LK20 etter 2. trinn
// Globale navn: t12Gen*/t12Fb* (Pat1, Line2, Count2), t12Opts, t12PatGrow, t12PatWords, t12Near, t12Rev, t12NlX, T12_PAT_SETS,
// window.VIS.{pattern,grow,nline,hop,board}. Valgoppgaver har qd.why = {'<valg>':'<kort hint for akkurat den feilen>'}.
// ============================================================
// Fasit + distraktorer med hint. cands = [[verdi, hint], …] i prioritert rekkefølge (null hoppes over)
// cands = [[verdi, hint, feiltype?], …]; feiltypen (navn i MISC_NAMES) havner i whyM til statistikken
function t12Opts(ans,cands,n){
  const ch=t12Choices(ans,cands.map(c=>c[0]),n),why={},whyM={};
  ch.forEach(c=>{if(String(c)===String(ans))return;const f=cands.find(x=>x[0]!=null&&String(x[0])===String(c));if(f){why[String(c)]=f[1];if(f[2])whyM[String(c)]=f[2];}});
  return {choices:ch,why,whyM};
}
// Samme bilde til alle why-hint (whyV)
function t12WhyV(why,v){const o={};Object.keys(why).forEach(k=>o[k]=v);return o;}
function t12Near(lab,n){return lab.reduce((a,b)=>Math.abs(b-n)<Math.abs(a-n)?b:a);}
function t12Rev(n){const t=Math.floor(n/10),o=n%10;return n>=10&&n<100&&o&&t!==o?10*o+t:null;} // snudde sifre (34 → 43)
// Tell fra et merket tall til n: «Fra 40: 41, 42, 43.»
function t12CntFrom(lb,n){const k=Math.abs(n-lb);return `Fra ${lb}: ${t12Cnt(lb,n>lb?1:-1,k)}.`;}

// ---- Bilder ----
// Mønster: {items:[emoji | null = ?], g: lengde på biten (farger annenhver bit, brukes i Lær)}
window.VIS.pattern=v=>`<div class="t12-pat" role="img" aria-label="Mønster">${(v.items||[]).map((e,i)=>e?`<span class="t12-pat-it${v.g&&Math.floor(i/v.g)%2?' alt':''}" style="--d:${i*60}ms">${e}</span>`:'<span class="t12-pat-it t12-pat-q">?</span>').join('')}</div>`;
// Voksende mønster: tårn med n klosser i rader på w, nederst først. {n:[…], w, c:'b'|'o'|'g', q:true = tomt tårn med ?}
window.VIS.grow=v=>{
  const w=Math.max(1,v.w|0),fig=n=>{let h='';for(let r=0;r*w<n;r++)h+=`<span class="t12-gr-row">${'<i></i>'.repeat(Math.min(w,n-r*w))}</span>`;return h;};
  return `<div class="t12-grow t12-g-${v.c||'b'}" role="img" aria-label="Tårn som vokser">${(v.n||[]).map(n=>`<div class="t12-gr-fig"><div class="t12-gr-st">${fig(n|0)}</div><div class="t12-gr-n">${n|0}</div></div>`).join('')}${v.q?'<div class="t12-gr-fig"><div class="t12-gr-st t12-gr-q">?</div><div class="t12-gr-n">?</div></div>':''}</div>`;
};
// Tallinje til å lese av: {from, to, step, lab:[tall som står], mid (lang strek hver mid), arrow:tall, marks:[{n,tag}], empty:true = tom tallinje}
function t12NlX(from,to,n){return t12Num(24+(n-from)/(to-from)*292);}
window.VIS.nline=v=>{
  const from=+v.from||0,to=+v.to||10,st=+v.step||1,Y=v.marks?78:64,H=Y+42,X=n=>t12NlX(from,to,n),lab=(v.lab||[from,to]).map(Number);
  let s=`<svg class="t12-nl" viewBox="0 0 340 ${H}" role="img" aria-label="Tallinje fra ${from} til ${to}"><line class="t12-nl-ax" x1="8" y1="${Y}" x2="328" y2="${Y}"/><path class="t12-nl-end" d="M327 ${Y-7} L338 ${Y} L327 ${Y+7} Z"/>`;
  const tk=v.empty?lab.slice():Array.from({length:Math.round((to-from)/st)+1},(_,i)=>from+i*st);
  tk.forEach(n=>{const big=lab.includes(n)||(v.mid&&(n-from)%v.mid===0),h=big?13:8;s+=`<line class="t12-nl-tk${big?' big':''}" x1="${X(n)}" y1="${Y-h}" x2="${X(n)}" y2="${Y+h}"/>`;});
  lab.forEach(n=>{s+=`<text class="t12-nl-n" x="${X(n)}" y="${Y+30}">${n}</text>`;});
  (v.marks||[]).forEach(m=>{s+=`<g class="t12-nl-mk" transform="translate(${X(m.n)} 0)"><line x1="0" y1="${Y-30}" x2="0" y2="${Y-3}"/><text class="t12-nl-tag" x="0" y="${Y-46}">${m.tag}</text></g>`;});
  if(v.arrow!=null)s+=`<g class="t12-nl-ar" transform="translate(${X(+v.arrow)} 0)"><path d="M-6 ${Y-52} h12 v24 h9 L0 ${Y-8} L-15 ${Y-28} h9 Z"/></g>`;
  return `<div class="t12-nl-wrap">${s}</svg></div>`;
};
// Hopp på tom tallinje i oppgaven: VIS.line (vis.js) i en egen ramme, så den blir stor nok i oppgavekortet
window.VIS.hop=v=>{const f=window.VIS.line;return typeof f==='function'?`<div class="t12-hop">${f(Object.assign({},v,{kind:'line'}))}</div>`:'';};
// Utsnitt av hundrebrettet: {r0 (første tierrad, 0 = 1–10), c0 (første kolonne 1–10), rows, cols, hide: tall som vises som ?, hl:[tall som utheves]}
window.VIS.board=v=>{
  const r0=v.r0|0,c0=v.c0|0||1,R=v.rows||3,C=v.cols||5,hl=v.hl||[];let h='';
  for(let r=0;r<R;r++)for(let c=0;c<C;c++){const n=10*(r0+r)+c0+c;h+=n===v.hide?'<span class="t12-bd-c t12-bd-q">?</span>':`<span class="t12-bd-c${hl.includes(n)?' hl':''}">${n}</span>`;}
  return `<div class="t12-bd" style="--cols:${C}" role="img" aria-label="Hundrebrett">${h}</div>`;
};

// ============================================================
// TEMA: MØNSTER (pat1) – gjentakende mønstre (AB, ABB, AAB, ABC, AABB) og voksende mønstre
// ============================================================
// Ting i mønstrene: [emoji, ord i opplesing, bestemt form («etter katten», «Katten er ikke med»)]
const T12_PAT_SETS=[
  [['🔴','rød','rød'],['🔵','blå','blå'],['🟢','grønn','grønn'],['🟡','gul','gul']],
  [['🐶','hund','hunden'],['🐱','katt','katten'],['🐰','kanin','kaninen'],['🐸','frosk','frosken']],
  [['🍎','eple','eplet'],['🍌','banan','bananen'],['🍇','drue','druen'],['🍓','jordbær','jordbæret']],
  [['💛','gul','det gule hjertet'],['💙','blå','det blå hjertet'],['💚','grønn','det grønne hjertet'],['💜','lilla','det lilla hjertet']],
];
function t12PatWords(items){return items.map(x=>x[1]).join(', ');}
// Tårn som vokser like mye hver gang (tall-tastatur). [start, økning] per nivå – startene gir tallinje-hint med riktige streker.
function t12PatGrow(L,base){
  const [s0,d]=t12P([[[1,1],[2,1]],[[1,1],[3,1],[2,2]],[[2,2],[3,2],[3,3],[4,3]]][L]),ns=[0,1,2].map(i=>s0+i*d),seq=`${ns.join(', ')}, ?`,[E,c]=t12P([['🟦','b'],['🟧','o'],['🟩','g']]);
  const o={...base,q:seq,ans:s0+3*d,hint:'Hvor mange flere hver gang?',ops:{op:'seq',a:s0,b:d,i:3},vis:{kind:'grow',n:ns,w:d,c,q:true},x:{last:ns[2],d}};
  return t12Story(o,`${E} Tårnene vokser: ${seq}`,`Tårnene vokser: ${ns.join(', ')}. Hvor mange klosser blir det i neste tårn?`);
}
function t12GenPat1(g,id){
  const L=t12Lvl(g,id),t=t12Pick(g,id,{m1a:[4,2,1],m1b:[1,3,3],m1m:[1,2,2],m1t:[0,1,2],m1k:[0,0,2],m1v:[3,2,2]},L),base={type:'Mønster',sub:t,strat:t==='m1v'?'voksende':'gjenta'};
  if(t==='m1v')return t12PatGrow(L,base);
  const set=t12Sh(t12P(T12_PAT_SETS).slice()),kinds={m1a:['AB'],m1b:L>1?['ABB','AAB','ABC','AABB']:['ABB','AAB','ABC'],m1m:L>1?['AB','ABB','AAB','ABC','AABB']:L?['AB','ABB','ABC']:['AB'],m1t:['AB','ABB','AAB','ABC'],m1k:['ABB','AAB','ABC']}[t];
  const kind=t12P(kinds),core=kind.split('').map(c=>set['ABC'.indexOf(c)]),p=core.length,nd=new Set(kind).size,uniq=nd===p,extra=set[nd],E=x=>x[0],at=i=>core[i%p];
  const list=items=>items.map(x=>x?x[1]:'hva').join(', '),x={cw:t12PatWords(core)};
  if(t==='m1k'){ // hvilken bit gjentar seg? To hele runder vises
    const items=Array.from({length:2*p},(_,i)=>at(i)),ans=core.map(E).join(''),A=core[0],B=core[1],C=core[2];
    const {choices,why}=t12Opts(ans,t12Sh([[E(A)+E(B),'Prøv biten bortover. Passer den hele veien?'],[ans+E(A),'Se etter hvor mønsteret starter på nytt.'],
      uniq?[E(A)+E(C)+E(B),'Se på rekkefølgen i mønsteret.']:[kind==='ABB'?E(A)+E(A)+E(C):E(A)+E(C)+E(C),'Tell hvor mange like som står etter hverandre.']]),3);
    return {...base,q:'Hvilken bit gjentar seg?',ans,choices,why,hint:'Hva kommer igjen og igjen?',say:`Se på mønsteret: ${list(items)}. Hvilken bit gjentar seg?`,vis:{kind:'pattern',items:items.map(E)},key:`${t}|${ans}`,x:{...x,aw:x.cw}};
  }
  // hva kommer nå (m1a, m1b), hva mangler (m1m), hvilke to kommer nå (m1t)
  const len=t==='m1a'?(L?t12R(6,8):6):t==='m1t'?7:8,gaps=t==='m1m'?[t12R(2,len-2)]:t==='m1t'?[len-2,len-1]:[len-1];
  const items=Array.from({length:len},(_,i)=>gaps.includes(i)?null:at(i)),ai=gaps.map(at),ans=ai.map(E).join(''),prev=at(gaps[0]-1);
  const wIn=uniq?`Hva kommer etter ${prev[2]} hver gang?`:'Tell hvor mange like som står etter hverandre.',wNew=`${t12Cap(extra[2])} er ikke med i mønsteret.`;
  const cands=t==='m1t'?[[E(ai[1])+E(ai[0]),'Se på rekkefølgen: hva kommer først?'],[E(core[0])+E(core[1]),'Mønsteret fortsetter der det slapp.'],[E(prev)+E(prev),wIn],[E(ai[0])+E(extra),wNew]]
    :[...t12Sh(core.filter(c=>c!==ai[0]).map(c=>[E(c),wIn])),[E(extra),wNew]];
  const {choices,why}=t12Opts(ans,cands,3),q=t==='m1m'?'Hva mangler?':t==='m1t'?'Hvilke to kommer nå?':'Hva kommer nå?',pv={kind:'pattern',items:items.map(c=>c&&E(c))};
  const known=t==='m1m'?items:items.filter(Boolean);
  return {...base,q,ans,choices,why,hint:t==='m1m'?'Se på det som står rundt':'Si mønsteret høyt',say:`Se på mønsteret: ${list(known)}. ${q}`,vis:pv,whyV:t12WhyV(why,{...pv,g:p}),key:`${t}|${items.map(c=>c?E(c):'?').join('')}`,x:{...x,aw:t12PatWords(ai)}};
}
function t12FbPat1(q,g,c,qd){
  const d=t12Q(q,qd);if(!d)return t12Plain(g,c);const x=d.x||{};
  if(d.sub==='m1v')return `${x.last} + ${x.d} = <strong>${c}</strong>. 💡 ${x.d===1?'1 kloss':`${x.d} klosser`} til hver gang.`;
  if(d.sub==='m1k')return `Biten er <strong>${c}</strong>: ${x.cw}. 💡 Den kommer igjen og igjen.`;
  return `Det er <strong>${c}</strong> ${x.aw}. 💡 ${t12Cap(x.cw)} gjentar seg.`;
}

// ============================================================
// TEMA: TALLINJA (line2) – les av tallinja 0–100, finn tallet, tom tallinje og hopp
// ============================================================
function t12GenLine2(g,id){
  const L=t12Lvl(g,id),t=t12Pick(g,id,{n2b:[4,1,0],n2a:[2,3,1],n2c:[0,3,3],n2p:[1,2,3],n2t:[0,1,3],n2h:[2,2,2]},L);
  const base={type:'Tallinja',sub:t,strat:t==='n2t'||t==='n2h'?'tom-tallinje':'tallinje'},Q='Hvilket tall peker pilen på?',SAY='Se på tallinja. Hvilket tall peker pilen på?';
  const W1='Tell strekene én og én fra et tall.',WR='Tallene blir større mot høyre.',WT='Tierne skrives først.',W10='Tell tiere: ti, tjue, tretti …',d1=Math.random()<.5?1:-1;
  // Tall som står skrevet på linja er ingen ekte felle, så de tas ikke med som valg
  const read=(n,cands,vis,hint,tip)=>{const {choices,why,whyM}=t12Opts(n,cands.filter(c=>!vis.lab.includes(c[0])),L>1?4:3),st=vis.step||1,nb=t12Near(vis.lab,n),k=Math.abs(n-nb)/st,dr=n>nb?st:-st;
    const help=Object.assign({kind:'nline'},vis,{arrow:n,lab:vis.lab.concat(Array.from({length:Math.max(0,k-2)},(_,j)=>nb+dr*(j+1)))}); // tall på strekene fram mot pilen, men ikke helt
    return {...base,q:Q,ans:n,choices,why,whyM,whyV:t12WhyV(why,help),hint,say:SAY,vis:Object.assign({kind:'nline'},vis,{arrow:n}),key:`${t}|${vis.from}-${vis.to}|${vis.lab}|${n}`,x:{tip}};};
  if(t==='n2b'){ // 0–20 med en strek for hvert tall
    const lab=L?[0,10,20]:[0,5,10,15,20];let n;do{n=t12R(1,19);}while(lab.includes(n));
    return read(n,[[n+d1,W1,'en'],[n<10?n+10:n-10,n<10?'Se om pilen er før eller etter ti.':'Husk tieren! Pilen er forbi ti.','ti'],[n-d1,W1,'en'],[20-n,WR]],{from:0,to:20,step:1,lab,mid:5},'Tell strekene fra et tall',t12CntFrom(t12Near(lab,n),n));
  }
  if(t==='n2a'){ // 0–100 med en strek for hver tier
    const lab=[[0,20,40,60,80,100],[0,50,100],[0,100]][L];let n;do{n=10*t12R(1,9);}while(lab.includes(n));
    const nb=t12Near(lab,n),k=Math.abs(n-nb)/10;
    return read(n,[[n/10,'Hver strek er ti, ikke én.','plass'],[n+10*d1,W10,'ti'],[100-n,WR],[n-10*d1,W10,'ti'],[n+20*d1,W10],[n-20*d1,W10]],{from:0,to:100,step:10,lab},'Tell tierne fra et tall',k<=3?`Fra ${nb}: ${t12Cnt(nb,n>nb?10:-10,k)}.`:'Hver strek er 10.');
  }
  if(t==='n2c'){ // mellom to tiere: 40–50
    const a0=10*t12R(1,L>1?9:8);let k;do{k=t12R(1,9);}while(L<2&&k===5);const n=a0+k,lab=L>1?[a0,a0+10]:[a0,a0+5,a0+10];
    return read(n,[[k,'Du glemte tierne. Se på tallet til venstre.','plass'],[n+d1,W1,'en'],[a0+10-k,WR],[t12Rev(n),WT,'snudd'],[n-d1,W1,'en']],{from:a0,to:a0+10,step:1,lab,mid:5},'Tell strekene fra et tall',t12CntFrom(t12Near(lab,n),n));
  }
  if(t==='n2t'){ // tom tallinje: omtrent hvor?
    const n=L<2?50:t12P([10,25,50,75,90]),cs=L<2?t12P([[10,90],[20,80]]):{10:[50,90],25:[75,50],50:[25,75],75:[25,50],90:[50,10]}[n],WE='Er pilen nær starten, midt på eller nær slutten?';
    const {choices,why}=t12Opts(n,cs.map(c=>[c,c===100-n?WR:WE]),3),whyV=t12WhyV(why,{kind:'nline',from:0,to:100,lab:n===50?[0,25,75,100]:[0,50,100],empty:true,arrow:n});
    const tip=n===50?'Midt mellom 0 og 100.':n===25?'Midt mellom 0 og 50.':n===75?'Midt mellom 50 og 100.':n<50?'Like etter 0.':'Like før 100.';
    return {...base,q:'Omtrent hvilket tall peker pilen på?',ans:n,choices,why,whyV,hint:'Er den nær starten eller slutten?',say:'Tallinja går fra 0 til 100. Omtrent hvilket tall peker pilen på?',vis:{kind:'nline',from:0,to:100,lab:[0,100],empty:true,arrow:n},key:`n2t|${n}`,x:{tip}};
  }
  if(t==='n2p'){ // hvor er tallet? Tre merker – velg riktig farge
    let n,v,ds,gap=1;
    if(L===0){do{n=t12R(1,9);}while(n===5);v={from:0,to:10,step:1,lab:[0,5,10],mid:5};ds=[[n+d1,'tell'],[n-d1,'tell'],[10-n,'mir']];}
    else if(L===1){const a0=10*t12R(1,8);let k;do{k=t12R(1,9);}while(k===5);n=a0+k;v={from:a0,to:a0+10,step:1,lab:[a0,a0+5,a0+10],mid:5};ds=[[n+d1,'tell'],[a0+10-k,'mir'],[n-d1,'tell']];}
    else{do{n=5*t12R(1,19);}while(n===50);v={from:0,to:100,step:10,lab:[0,50,100]};ds=[[t12Rev(n),'rev'],...t12Sh([[n+10,'ti'],[n-10,'ti'],[n%10?null:n/10,'en'],[100-n,'mir']])];gap=9;}
    const pos=[n],kind={};
    for(const [p,k] of ds){if(pos.length>=3)break;if(p==null||p<v.from||p>v.to||v.lab.includes(p)||pos.some(q=>Math.abs(q-p)<gap))continue;pos.push(p);kind[p]=k;}
    const ps=t12Sh(pos.slice()),marks=ps.map((p,i)=>({n:p,tag:T12_TAGS[i]})),CW=['rød','blå','grønn'],ai=ps.indexOf(n),ans=T12_TAGS[ai],why={},whyM={},whyV={},MM={tell:'en',ti:'ti',rev:'snudd',en:'plass'};
    const W={tell:'Tell strekene en gang til.',mir:'Tallene blir større mot høyre.',rev:'Se på tierne først.',ti:'Se på tierne først.',en:'Hver strek er ti.'};
    marks.forEach(m=>{if(m.n===n)return;why[m.tag]=`Den står på ${m.n}. ${W[kind[m.n]]}`;if(MM[kind[m.n]])whyM[m.tag]=MM[kind[m.n]];
      whyV[m.tag]=Object.assign({kind:'nline',marks},v,{lab:v.lab.concat([m.n]).sort((a,b)=>a-b)});}); // tallet der barnets merke står
    const tip=L<2?t12CntFrom(t12Near(v.lab,n),n):n%10?`${n} er midt mellom ${n-5} og ${n+5}.`:'Hver strek er 10.';
    return {...base,q:`Hvor er ${n}?`,ans,choices:T12_TAGS.slice(),why,whyM,whyV,hint:L<2?'Tell strekene fra et tall':'Se på tierne først',say:`Hvor er ${n} på tallinja? Rød, blå eller grønn?`,vis:Object.assign({kind:'nline',marks},v),key:`n2p|${n}`,x:{n,cw:CW[ai],tip}};
  }
  // n2h: hopp på tom tallinje (tall-tastatur)
  const up=Math.random()<.5,B=[[10],[10,20,1],[20,30,5,2]][L],b=B[t12R(0,B.length-1)];let a;
  if(b%10===0)a=up?t12R(11,99-b):t12R(b+1,99);
  else if(b===1)a=up?10*t12R(1,8)+9:10*t12R(2,9);
  else{do{a=up?t12R(12,98-b):t12R(21,99);}while(up?a%10+b<10:a%10>=b||a%10===0);} // går forbi en tier
  const c=up?a+b:a-b,op=up?'+':'-',bd=up?c-c%10:a-a%10,dir=up?'fram':'tilbake';
  const tip=b%10===0?'Bare tierne endres.':b===1?(up?'En ny tier!':'Tieren blir én mindre.'):c%10===0?'Rett på tieren!':`Først ${up?'':'ned '}til ${bd}, så ${Math.abs(c-bd)} til.`;
  const o={...base,q:`${a} ${op} ${b} = ?`,ans:c,hint:b%10===0?'Bare tierne endres':b===1?`Hva kommer ${up?'etter':'før'}?`:up?'Hopp til neste tier først':'Hopp ned til tieren først',ops:{a,b,op},
    vis:{kind:'hop',from:Math.min(a,c)-8,to:Math.max(a,c)+8,start:a,hops:[up?b:-b],hopLab:[(up?'+':'−')+b],endLab:'?'},x:{a,b,op,tip}};
  return t12Story(o,`🦘 Kenguruen står på ${a}. Den hopper ${b} ${dir}. Hvor lander den?`,`Kenguruen står på ${a}. Den hopper ${b} ${dir}. Hvor lander den?`);
}
function t12FbLine2(q,g,c,qd){
  const d=t12Q(q,qd);if(!d)return t12Plain(g,c);const x=d.x||{};
  if(d.sub==='n2h')return `${x.a} ${x.op} ${x.b} = <strong>${c}</strong>. 💡 ${x.tip}`;
  if(d.sub==='n2t')return `Omtrent <strong>${c}</strong>. 💡 ${x.tip}`;
  if(d.sub==='n2p')return `<strong>${c}</strong> ${x.cw} står på ${x.n}. 💡 ${x.tip}`;
  return `Pilen peker på <strong>${c}</strong>. 💡 ${x.tip}`;
}

// ============================================================
// TEMA: TELL TIL 100 (count2) – forlengs og baklengs med 1, 2, 5 og 10 over tierskifter, før/etter, hundrebrettet
// ============================================================
function t12GenCount2(g,id){
  const L=t12Lvl(g,id),t=t12Pick(g,id,{t2f:[5,2,1],t2b:[1,4,3],t2t:[2,3,3],t2s:[0,2,4],t2n:[2,2,2],t2h:[0,2,2]},L),base={type:'Tell til 100',sub:t};
  if(t==='t2n'){ // hva kommer etter 69 / før 60? (valg)
    const after=L===0||Math.random()<.5,n=after?10*t12R(1,L?9:8)+9:10*t12R(2,9);
    const cands=after?[[n-9,'Etter ni enere kommer en ny tier.','ti'],[n+10<=100?n+10:null,'Du gikk en tier fram. Bare ett steg!'],[n-1,'Det kommer før. Etter er ett mer.']]
      :[[n+9,'Tieren blir én mindre når du teller ned.','ti'],[n-10,'Du gikk en hel tier ned. Bare ett steg!'],[n+1,'Det kommer etter. Før er ett mindre.']];
    const ans=after?n+1:n-1,{choices,why,whyM}=t12Opts(ans,L<2?[cands[0],...t12Sh(cands.slice(1))]:cands,L>1?4:3),q=`Hva kommer ${after?'etter':'før'} ${n}?`;
    const whyV=t12WhyV(why,after?{kind:'line',from:n-3,to:n+1,start:n-3,hide:[n+1]}:{kind:'line',from:n-1,to:n+3,start:n+3,hide:[n-1]});
    return {...base,strat:after?'tierskifte':'tierskifte-bak',q,ans,choices,why,whyM,whyV,hint:after?'Tell ett steg fram':'Tell ett steg bakover',say:q,key:`t2n|${q}`,x:{n,after,tip:after?`${n} + 1 = ${ans}: en ny tier!`:`${n} - 1 = ${ans}: tieren blir én mindre.`}};
  }
  if(t==='t2h'){ // hundrebrettet: hvilket tall skjuler seg?
    const r0=t12R(0,7),c0=t12R(1,6),c=L>1?t12R(c0,c0+4):t12R(c0+1,c0+3),v=10*(r0+1)+c,ud=Math.random()<.5?10:-10,lr=Math.random()<.5?1:-1;
    const WU='Ett steg ned er en tier mer.',WL='Bortover er det én mer for hvert steg.';
    const {choices,why,whyM}=t12Opts(v,[[v+ud,WU,'ti'],[v+lr,WL,'en'],[t12Rev(v),'Tierne skrives først.','snudd'],[v-ud,WU,'ti'],[v-lr,WL,'en']],L>1?4:3);
    const whyV=t12WhyV(why,{kind:'board',r0,c0,rows:3,cols:5,hide:v,hl:[v-10].concat(c>c0?[v-1]:[])}); // naboene over og til venstre
    return {...base,strat:'hundrebrett',q:'Hvilket tall skjuler seg?',ans:v,choices,why,whyM,whyV,hint:'Se på tallene rundt',say:'Se på hundrebrettet. Hvilket tall skjuler seg bak spørsmålstegnet?',vis:{kind:'board',r0,c0,rows:3,cols:5,hide:v},key:`t2h|${v}`};
  }
  // tallrekker med fire tall (tall-tastatur)
  let s0,b,mi,strat;
  if(t==='t2f'){const D=10*t12R(2,L?10:9);mi=L===0||D===100?3:t12P(L===1?[3,3,2,1]:[3,2,1,0]);s0=mi?D-mi:D-1;b=1;strat='tierskifte';} // hullet står på tieren (eller rett før den)
  else if(t==='t2b'){const D=10*t12R(L?2:1,9);mi=L===0?3:t12P([3,3,2,1]);s0=D-1+mi;b=-1;strat='tierskifte-bak';}
  else if(t==='t2t'){const up=L===0||Math.random()<(L===1?.5:.35),o=t12R(1,9);b=up?10:-10;s0=up?10*t12R(L?0:1,6)+o:10*t12R(3,9)+o;mi=L===0?3:t12P([3,3,2,1,0]);strat='hop10';}
  else{const five=Math.random()<.5,up=L<2||Math.random()<.5,st=five?5:2,odd=L>1&&Math.random()<.5;b=up?st:-st;
    if(five)s0=up?5*t12R(2,17):5*t12R(5,20); // svaret er minst 10 (så «hopp 5» ikke er svaret)
    else do{s0=up?t12R(10,94):t12R(16,100);}while(s0%2!==(odd?1:0)||Math.floor(s0/10)===Math.floor((s0+3*b)/10));
    mi=L<2?t12P([3,3,2]):t12P([3,2,1,0]);strat=five?'hop5':'hop2';}
  const ts=[0,1,2,3].map(i=>s0+i*b),ans=ts[mi],nb=mi?ts[mi-1]:ts[1],sb=Math.abs(b),sg=(mi?b>0:b<0)?'+':'-';ts[mi]='?';
  const seq=ts.join(', '),say=mi===3?`${ts.slice(0,3).join(', ')}. Hvilket tall kommer så?`:`${ts.map(x=>x==='?'?'hva':x).join(', ')}. Hvilket tall mangler?`;
  const tip=t==='t2f'?(mi?`${ans-1} + 1 = ${ans}: en ny tier!`:`${ans} + 1 = ${ans+1}: en ny tier!`):t==='t2b'?`${ans+1} - 1 = ${ans}: tieren blir én mindre.`:`${nb} ${sg} ${sb} = ${ans}.${sb===10?' Bare tieren endres.':''}`;
  const hint=sb===1?`Tell én og én ${b>0?'fremover':'bakover'}`:`Hopp ${sb} ${b>0?'fremover':'bakover'}`;
  const o={...base,strat,q:seq,ans,hint,ops:{op:'seq',a:s0,b,i:mi},say,x:{tip}};
  if(Math.random()<.35){const [E,lb]=b===-1?['🚀','Nedtelling']:b===1?['🦉','Ugla teller']:['🐸',b>0?'Frosken hopper':'Frosken hopper bakover'];return t12Story(o,`${E} ${lb}: ${seq}`,`${lb}: ${say}`);}
  return o;
}
function t12FbCount2(q,g,c,qd){
  const d=t12Q(q,qd);if(!d)return t12Plain(g,c);const x=d.x||{};
  if(d.sub==='t2n')return `<strong>${c}</strong> kommer ${x.after?'etter':'før'} ${x.n}. 💡 ${x.tip}`;
  if(d.sub==='t2h')return `Det er <strong>${c}</strong>. 💡 Ned er 10 mer. Bortover er 1 mer.`;
  return `Svaret er <strong>${c}</strong>. 💡 ${x.tip||''}`.trim();
}

// ---- Navn på deloppgaver, ingen minioppgaver i de nye temaene, Lær ----
Object.assign(window.EXTRA_SUBS,{
  m1a:'Mønster: hva kommer nå?',m1b:'Mønster med tre ting (ABB, ABC)',m1m:'Hva mangler i mønsteret?',m1t:'De to neste i mønsteret',m1k:'Finn biten som gjentar seg',m1v:'Voksende mønster (1, 2, 3)',
  n2a:'Tallinje med tiere (0–100)',n2b:'Tallinje 0–20',n2c:'Tallinje mellom to tiere (40–50)',n2p:'Finn tallet på tallinja',n2t:'Tom tallinje: omtrent hvor?',n2h:'Hopp på tom tallinje',
  t2f:'Telle forbi en tier (69, 70)',t2b:'Telle bakover forbi en tier (51, 50, 49)',t2t:'Telle med 10 (23, 33, 43)',t2s:'Telle med 2 og 5',t2n:'Tallet før og etter',t2h:'Hundrebrettet',
});
['pat1','line2','count2'].forEach(id=>T12_NOMINI.add(id));
(function(){
  if(typeof LEARN_GUIDES!=='object')return;
  const V=window.VIS,cap=t=>typeof capLine==='function'?capLine(t):`<div class="t12-cap">${t}</div>`,G=t=>typeof grn==='function'?grn(t):t;
  const W=s=>typeof workedEx==='function'?workedEx(s):s.map(x=>`<div>${x[0]}</div>`).join(''),P=(a,c)=>typeof pills==='function'?pills(a,c):a.join(' · ');
  const hops=(ts,l,h)=>typeof seqHops==='function'?seqHops(ts,l,h):P(ts.map(String),'#ffd93d');
  LEARN_GUIDES.pat1=[
    {icon:'🔁',title:'Et mønster gjentar seg',text:'Rød, blå, rød, blå … Den samme biten kommer igjen og igjen.',visual:V.pattern({items:['🔴','🔵','🔴','🔵','🔴','🔵'],g:2})+cap('Biten er 🔴🔵')},
    {icon:'🐶',title:'Finn biten',text:'Hund, katt, katt. Hund, katt, katt. Biten har tre ting.',visual:V.pattern({items:['🐶','🐱','🐱','🐶','🐱','🐱'],g:3})+cap(`Biten er ${G('🐶🐱🐱')}`)},
    {icon:'📣',title:'Si det høyt',text:'Si mønsteret høyt. Da hører du hva som kommer nå.',visual:V.pattern({items:['🍎','🍌','🍇','🍎','🍌','🍇','🍎',null]})+cap(`Eple, banan, drue, eple … ${G('banan!')}`)},
    {icon:'🧱',title:'Mønster som vokser',text:'Tårnene blir én kloss høyere hver gang.',visual:V.grow({n:[1,2,3,4],w:1,c:'b'})+cap(`1, 2, 3, ${G('4')} – én til hver gang`)},
    {icon:'🎯',title:'Din tur!',text:'Tårnene vokser like mye hver gang.',
     ask:{q:'2, 4, 6, ?',ans:8,ops:{op:'seq',a:2,b:2,i:3},vis:{kind:'grow',n:[2,4,6],w:2,c:'b',q:true},say:'Tårnene vokser: 2, 4, 6. Hvor mange klosser blir det i neste tårn?',
       help:{t:'Hvor mange flere klosser kommer hver gang?',v:{kind:'line',from:0,to:8,step:2,start:2,hops:[2,2,2],hopLab:['+2','+2','+2'],hide:[8]}},
       why:{'7':'Tårnene vokser med to hver gang.','9':'Tell klossene i hvert tårn. Hvor mange til?','10':'Bare én rad til hver gang.'}},
     visual:W([['2, 4, 6 …','',false],['2 flere hver gang','',true],['6 + 2 = 8 ✓','',false]])}];
  LEARN_GUIDES.line2=[
    {icon:'📏',title:'Tallinja',text:'Tallene står på rad. De blir større og større mot høyre.',visual:V.nline({from:0,to:10,step:1,lab:[0,1,2,3,4,5,6,7,8,9,10]})},
    {icon:'👆',title:'Tell strekene',text:'Start på et tall du ser. Tell én og én strek bort til pilen.',visual:V.nline({from:40,to:50,step:1,lab:[40,50],mid:5,arrow:43})+cap(`40 … 41, 42, ${G('43')}`)},
    {icon:'🔟',title:'Hver strek kan være 10',text:'Her er det 10 fra strek til strek. Tell tiere.',visual:V.nline({from:0,to:100,step:10,lab:[0,50,100],arrow:30})+cap(`10, 20, ${G('30')}`)},
    {icon:'🦘',title:'Hopp på tallinja',text:'34 + 10: Hopp én tier fram. Da lander du på 44.',visual:(V.line?V.line({from:24,to:54,start:34,hops:[10],hopLab:['+10']}):'')+cap(`34 + 10 = ${G('44')}`)},
    {icon:'🎯',title:'Din tur!',text:'Start på 60. Tell strekene.',
     ask:{q:'Hvilket tall peker pilen på?',eq:'60 + 7 = ?',ans:67,vis:{kind:'nline',from:60,to:70,step:1,lab:[60,70],mid:5,arrow:67},say:'Se på tallinja. Hvilket tall peker pilen på?',
       help:{t:'Start på 60. Tell én og én strek til pilen.',v:{kind:'nline',from:60,to:70,step:1,lab:[60,61,62,63,64,65,70],mid:5,arrow:67}},
       why:{'7':'Husk tierne! Pilen står etter 60.','66':'Tell strekene én og én fra 60.','68':'Tell strekene én og én fra 60.'}},
     visual:W([['Start på 60','',true],['61, 62, 63, 64, 65, 66, 67','',true],['67 ✓','',false]])}];
  LEARN_GUIDES.count2=[
    {icon:'🔢',title:'Forbi tieren',text:'Etter 9 enere kommer en ny tier: 67, 68, 69, 70!',visual:hops([67,68,69,70],'+1',3)},
    {icon:'🚀',title:'Tell bakover',text:'52, 51, 50 … så 49. Tieren blir én mindre.',visual:hops([52,51,50,49],'−1',3)},
    {icon:'🔟',title:'Hopp med 10',text:'Ett steg ned på hundrebrettet er 10 mer. Bare tieren endres.',visual:V.board({r0:1,c0:1,rows:3,cols:5,hl:[13,23,33]})+cap(`13, 23, ${G('33')}`)},
    {icon:'🐸',title:'Hopp med 5 og 2',text:'Med 5: 35, 40, 45, 50. Med 2: 46, 48, 50, 52.',visual:P(['35','40','45','50'],'#ffd93d')+'<div style="height:8px"></div>'+P(['46','48','50','52'],'#00ff88')},
    {icon:'🎯',title:'Din tur!',text:'Etter 9 enere kommer en ny tier.',
     ask:{q:'77, 78, 79, ?',ans:80,ops:{op:'seq',a:77,b:1,i:3},say:'77, 78, 79. Hvilket tall kommer så?',
       help:{t:'Tell videre ett steg. Hva skjer med tieren?',v:{kind:'line',from:76,to:80,start:77,hops:[1,1,1],hopLab:['+1','+1','+1'],hide:[80]}},
       why:{'70':'Etter 79 må tieren bli én mer.','81':'Bare ett steg fram fra 79.','710':'Sju tiere og én til blir åtte tiere.'}},
     visual:W([['77, 78, 79, ?','',false],['Etter 9 kommer en ny tier','',true],['80 ✓','',false]])}];
})();
