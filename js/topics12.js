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
function t12Warm(g,c){const n=+g;return typeof c==='number'&&g!==''&&isFinite(n)&&Math.abs(n-c)<=1?'Nesten! 🤏':t12P(['Godt forsøk! 💪','Godt prøvd!','Du er på god vei!']);}
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
// Analog urskive: kort rød timeviser, lang blå minuttviser
function t12ClockSvg(h,m,px){
  m=+m||0;h=+h||12;const ha=((h%12)*30+m*.5)%360,ma=(m*6)%360;
  let s=`<svg class="t12-clock" viewBox="0 0 200 200" width="${px}" height="${px}" role="img" aria-label="Klokke" data-h="${h}" data-m="${m}">`;
  s+='<circle cx="100" cy="100" r="95" fill="#fffaf0" stroke="#6c4ee3" stroke-width="8"/>';
  for(let i=0;i<60;i++){const a=i*Math.PI/30,big=i%5===0,r1=big?80:85,r2=89;s+=`<line x1="${t12Num(100+r1*Math.sin(a))}" y1="${t12Num(100-r1*Math.cos(a))}" x2="${t12Num(100+r2*Math.sin(a))}" y2="${t12Num(100-r2*Math.cos(a))}" stroke="${big?'#3a3166':'#c9c2e6'}" stroke-width="${big?3.5:1.5}" stroke-linecap="round"/>`;}
  for(let i=1;i<=12;i++){const a=i*Math.PI/6;s+=`<text x="${t12Num(100+68*Math.sin(a))}" y="${t12Num(100-68*Math.cos(a))}" class="t12-cl-n">${i}</text>`;}
  s+=`<line class="t12-hand-h" x1="100" y1="100" x2="100" y2="62" stroke="#e23b54" stroke-width="12" stroke-linecap="round" transform="rotate(${t12Num(ha)} 100 100)"/>`;
  s+=`<line class="t12-hand-m" x1="100" y1="100" x2="100" y2="45" stroke="#2b6cff" stroke-width="7" stroke-linecap="round" transform="rotate(${t12Num(ma)} 100 100)"/>`;
  return s+'<circle cx="100" cy="100" r="8" fill="#1d1840"/></svg>';
}
// {h,m} = én klokke; {list:[{h,m,tag}]} = flere små klokker med merke under
window.VIS.clock=v=>{
  if(v&&Array.isArray(v.list))return `<div class="t12-clocks">${v.list.map(c=>`<div class="t12-clk-item">${t12ClockSvg(c.h,c.m,104)}${c.tag?`<div class="t12-clk-tag">${c.tag}</div>`:''}</div>`).join('')}</div>`;
  return `<div class="t12-clock-wrap">${t12ClockSvg(v.h,v.m,v.size||170)}</div>`;
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
window.VIS.compare=v=>`<div class="t12-cmp">${(v.rows||[]).map(r=>`<div class="t12-cmp-row"><span class="t12-cmp-who">${r.who}</span><span class="t12-cmp-items">${`<span class="t12-it">${r.e}</span>`.repeat(r.n|0)}</span></div>`).join('')}</div>`;
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
    if(v===0)return t12Story(o,`Du har ${a} ${E}. Du spiser ${b}. Hvor mange er igjen?`,`Du har ${a} ${nn}. Du spiser ${b}. Hvor mange er igjen?`);
    if(v===1)return t12Story(o,`Du har ${a} 🎈. ${b} flyr bort. Hvor mange er igjen?`,`Du har ${a} ballonger. ${b} flyr bort. Hvor mange er igjen?`);
    return t12Story(o,`Du har ${a} ${E}. Vennen din har ${b}. Hvor mange flere har du?`,`Du har ${a} ${nn}. Vennen din har ${b}. Hvor mange flere har du?`);}
  return o;
}
function t12FbSub20(q,g,c,qd){
  const d=t12Q(q,qd),e=d&&d.ops;if(!e)return t12Plain(g,c);
  const a=e.a,b=e.b,o=a%10;let tip;
  if(b===10)tip=`Ta bort 1 tier: ${a} - 10 = ${c}.`;
  else if(a===20)tip=`10 - ${b} = ${10-b}. Så 10 + ${10-b} = ${c}.`;
  else if(b===o)tip='Ta bort enerne. Da er det 10 igjen.';
  else if(b<o)tip=`Enerne: ${o} - ${b} = ${o-b}. Så 10 + ${o-b} = ${c}.`;
  else if(2*b===a)tip=`Dobbelt: ${b} + ${b} = ${a}.`;
  else if(b>=8)tip=`Tenk pluss: ${b} + ${c} = ${a}.`;
  else tip=`${a} - ${o} = 10. Så 10 - ${b-o} = ${c}.`;
  const head=+g===a+b?'Oi, du la sammen! Minus er å ta bort.':t12Warm(g,c);
  return `${head} ${a} - ${b} = <strong>${c}</strong>. 💡 ${tip}`;
}

// ============================================================
// TEMA: STØRST OG MINST (cmp1)
// ============================================================
function t12Distinct(n,lo,hi){const s=new Set();while(s.size<n)s.add(t12R(lo,hi));return [...s];}
function t12GenCmp1(g,id){
  const L=t12Lvl(g,id),t=t12Pick(g,id,{c1m:[4,1,0],c1n:[3,2,1],c1t:[0,3,4],c1s:[1,2,2],c1j:[0,2,2],c1d:[2,2,3]},L),T='Størst og minst';
  if(t==='c1m'){
    const [A,B]=t12Sh(T12_ANIMALS.slice()),[E,,nn]=t12P(T12_THINGS),mx=L?10:8;let n1=t12R(2,mx),n2=Math.random()<.15?n1:t12R(2,mx);
    const ans=n1>n2?A[0]:n2>n1?B[0]:'Like mange';
    return {q:'Hvem har flest?',ans,choices:[A[0],B[0],'Like mange'],type:T,sub:t,hint:'Pek på én og én',strat:'sammenlign',
      vis:{kind:'compare',rows:[{who:A[0],n:n1,e:E},{who:B[0],n:n2,e:E}]},say:`Hvem har flest ${nn}, ${A[1]} eller ${B[1]}? Eller har de like mange?`,x:{n1,n2,A:A[0],B:B[0]}};
  }
  if(t==='c1d'){
    const a=t12R([3,6,10][L],[10,15,20][L]),b=t12R(Math.max(1,a-(L?9:4)),a-1),[A,B]=t12Sh(T12_ANIMALS.slice()),[E,,nn]=t12P(T12_THINGS);
    const o={q:`${a} - ${b} = ?`,ans:a-b,type:T,sub:t,hint:'Tell de som blir til overs',ops:{a,b,op:'-'},strat:'sammenlign'};
    t12Story(o,`${A[0]} har ${a} ${E}. ${B[0]} har ${b} ${E}. Hvor mange flere har ${A[0]}?`,`${t12Cap(A[1])} har ${a} ${nn}. ${t12Cap(B[1])} har ${b}. Hvor mange flere har ${A[1]}?`);
    if(a<=12)o.vis={kind:'compare',rows:[{who:A[0],n:a,e:E},{who:B[0],n:b,e:E}]};
    return o;
  }
  if(t==='c1j'){
    let [a,b]=t12Distinct(2,1,L>1?20:12);const big=Math.random()<.5,truth=Math.random()<.5;
    if((big?a>b:a<b)!==truth)[a,b]=[b,a];
    const q=`Er ${a} ${big?'større':'mindre'} enn ${b}?`;
    return {q,ans:truth?'Ja':'Nei',choices:['Ja','Nei'],type:T,sub:t,hint:'Hvilket tall kommer sist når du teller?',say:q,strat:'sammenlign',x:{a,b,big}};
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
  return {q,ans,choices:ch,type:T,sub:t,hint:ns.some(n=>n>=10)&&ns.some(n=>n<10)?'Se på tierne først':min?'Hvilket kommer først når du teller?':'Hvilket kommer sist når du teller?',
    say:`${q} ${ch.slice(0,-1).join(', ')} eller ${ch[ch.length-1]}?`,strat:'sammenlign',x:{ns,min}};
}
function t12FbCmp1(q,g,c,qd){
  const d=t12Q(q,qd);if(!d)return t12Plain(g,c);const x=d.x||{};
  if(d.sub==='c1m'){if(c==='Like mange')return `<strong>Like mange</strong>: begge har ${x.n1}. 💡 Alle har en makker.`;const big=Math.max(x.n1,x.n2),sm=Math.min(x.n1,x.n2);return `<strong>${c}</strong> har flest: ${big} mot ${sm}. 💡 Pek på én og én.`;}
  if(d.sub==='c1d'){const e=d.ops;return `${+g===e.a+e.b?'Oi, du la sammen!':t12Warm(g,c)} ${e.a} - ${e.b} = <strong>${c}</strong>. 💡 Pek på én og én. ${c} blir til overs.`;}
  if(d.sub==='c1j'){const a=x.a,b=x.b,rel=a>b?'større':'mindre';return `<strong>${c}</strong>. ${a} er ${rel} enn ${b}. 💡 ${Math.max(a,b)} kommer sist når du teller.`;}
  const ns=x.ns||[],tip=ns.some(n=>n>=10)&&ns.some(n=>n<10)?`${x.min?'Det uten tier er minst.':'Tall med en tier er større.'}`:x.min?'Det kommer først når du teller.':'Det kommer sist når du teller.';
  return `<strong>${c}</strong> er ${x.min?'minst':'størst'}. 💡 ${tip}`;
}

// ============================================================
// TEMA: ER DET LIKT? (eq1) – likhetstegnet som «like mye som»
// ============================================================
function t12GenEq1(g,id){
  const L=t12Lvl(g,id),t=t12Pick(g,id,{e1s:[4,2,2],e1v:[2,2,1],e1l:[3,2,2],e1b:[1,3,3],e1k:[0,2,1],e1m:[0,0,2]},L),M=[10,12,20][L],T='Er det likt?';
  const tf=(q,say,l,lv,r,rv)=>({q,ans:lv===rv?'Ja':'Nei',choices:['Ja','Nei'],type:T,sub:t,hint:'Regn ut begge sider',say,strat:'likhet',x:{l,lv,r,rv}});
  const wrong=v=>{const d=t12P([1,1,-1,-1,2]);return v+d>=0?v+d:v-d;};
  if(t==='e1s'){
    const minus=L>0&&Math.random()<.4,s=t12R(minus?1:2,minus?M-1:M);let a,b,v;
    if(minus){a=t12R(s+1,Math.min(M,s+9));b=a-s;v=s;}else{a=t12R(1,s-1);b=s-a;v=s;}
    const sh=Math.random()<.5?v:wrong(v),op=minus?'-':'+',l=`${a} ${op} ${b}`;
    return tf(`${l} = ${sh}. Stemmer det?`,`Stemmer det? ${t12Say(l)} er ${sh}.`,l,v,String(sh),sh);
  }
  if(t==='e1v'){const s=t12R(3,M),a=t12R(1,s-1),b=s-a,sh=Math.random()<.65?s:wrong(s),r=`${a} + ${b}`;
    return Object.assign(tf(`${sh} = ${r}. Stemmer det?`,`Stemmer det? ${sh} er lik ${a} pluss ${b}.`,String(sh),sh,r,s),{hint:'Svaret kan stå først'});}
  if(t==='e1k'){const a=t12R(1,9);let b;do{b=t12R(1,9);}while(b===a);const ok=Math.random()<.5,b2=ok?b:b+t12P([1,-1].filter(d=>b+d>0)),l=`${a} + ${b}`,r=`${ok?b:b2} + ${a}`;
    return Object.assign(tf(`${l} = ${r}. Stemmer det?`,`Stemmer det? ${t12Say(l)} er lik ${t12Say(r)}.`,l,a+b,r,(ok?b:b2)+a),{hint:'Er det de samme tallene?'});}
  if(t==='e1l'){const s=t12R(3,M),a=t12R(1,s-1),first=Math.random()<.7;
    const o={q:first?`${s} = ${a} + ?`:`${s} = ? + ${a}`,ans:s-a,type:T,sub:t,hint:`Tell fra ${a} til ${s}`,ops:{a,b:s-a,op:'+'},strat:'likhet'};
    o.eq=first?`${a} + ? = ${s}`:`? + ${a} = ${s}`;o.say=first?`${s} er lik ${a} pluss hva?`:`${s} er lik hva pluss ${a}?`;o.x={s,a};return o;}
  // e1b / e1m: like mye på begge sider, med vekt
  let a,b,lv,l,c;
  if(t==='e1m'){a=t12R(8,20);b=t12R(1,Math.min(9,a-3));lv=a-b;l=`${a} - ${b}`;}
  else if(L===2&&Math.random()<.35){a=t12R(6,9);b=t12R(11-a,9);if(Math.random()<.5)[a,b]=[b,a];lv=a+b;l=`${a} + ${b}`;c=10;} // 8 + 5 = 10 + ?
  else{lv=t12R(4,M);a=t12R(1,lv-1);b=lv-a;l=`${a} + ${b}`;}
  if(c==null){do{c=t12R(1,lv-1);}while(t==='e1b'&&(c===a||c===b)&&lv>3);}
  const ans=lv-c,r=`${c} + ?`;
  return {q:`${l} = ${r}`,ans,choices:t12Choices(ans,[lv,lv+c],3),type:T,sub:t,hint:'Begge sider skal bli like mye',say:`${t12Say(l)} er lik ${c} pluss hva?`,
    vis:{kind:'scale',l,r},strat:'likhet',x:{l,lv,c}};
}
function t12FbEq1(q,g,c,qd){
  const d=t12Q(q,qd);if(!d)return t12Plain(g,c);const x=d.x||{};
  if(d.sub==='e1l')return `${t12Warm(g,c)} ${x.s} = ${x.a} + <strong>${c}</strong>. 💡 ${c<=5?`Tell fra ${x.a}: ${t12Cnt(x.a,1,c)}. ${c} hopp!`:`Tenk minus: ${x.s} - ${x.a} = ${c}.`}`;
  if(d.sub==='e1b'||d.sub==='e1m')return `${String(g)===String(x.lv)?'= betyr «like mye». ':''}Svaret er <strong>${c}</strong>. ${x.l} = ${x.lv}, og ${x.c} + ${c} = ${x.lv}. 💡 Begge sider er like mye.`;
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
  if(t==='k1h'){const h=t12R(1,12),ans=t12ClockTxt(h,0);
    return {...base,q:'Hva er klokka?',ans,choices:t12Choices(ans,[h===12?6:12,12-h||12,h+1,h-1].map(x=>t12ClockTxt(x,0)),3),hint:'Se på den korte viseren',say:'Se på klokka. Hva er klokka?',vis:{kind:'clock',h,m:0},strat:'hel-time',x:{h,m:0}};}
  if(t==='k1t'){const h=t12R(1,12),ans=t12ClockTxt(h,30);
    return {...base,q:'Hva er klokka?',ans,choices:t12Choices(ans,[t12ClockTxt(h-1,30),t12ClockTxt(h,0),t12ClockTxt(h+1,0)],3),hint:'Se på den lange viseren',say:'Se på klokka. Hva er klokka?',vis:{kind:'clock',h,m:30},strat:'halv-time',x:{h,m:30}};}
  if(t==='k1v'){
    const h=t12R(1,12),m=L&&Math.random()<.6?30:0,lbl=t12ClockTxt(h,m);
    const ds=m?[[h-1,30],[h+1,0],[h,0]]:L?[[h+1,0],[h,30],h===12?[h-1,0]:[12,h*5]]:[[h+1,0],[h-1,0],[12-h===h||h===12?h+3:12-h,0]],pos=t12R(0,2),others=t12Sh(ds.slice()).slice(0,2),list=[];
    for(let i=0,k=0;i<3;i++){const [hh,mm]=i===pos?[h,m]:others[k++];list.push({h:t12H(hh),m:mm,tag:T12_TAGS[i]});}
    const q=`Hvilken klokke viser ${lbl.toLowerCase()}?`;
    return {...base,q,ans:T12_TAGS[pos],choices:T12_TAGS.slice(),hint:'Se på begge viserne',say:q,vis:{kind:'clock',list},strat:m?'halv-time':'hel-time',x:{h,m,lbl}};
  }
  if(t==='k1d'){const h=t12R(1,12),m=Math.random()<.5?30:0,ans=t12Digi(h,m),ds=m?[t12Digi(h+1,30),t12Digi(h,0),`6:${String(h*5%60).padStart(2,'0')}`]:[t12Digi(h,30),t12Digi(h+1,0),`12:${String(h*5%60).padStart(2,'0')}`];
    return {...base,q:'Hva står på en digital klokke?',ans,choices:t12Choices(ans,ds,3),hint:'Timen først, så minuttene',say:'Se på klokka. Hva står på en digital klokke nå?',vis:{kind:'clock',h,m},strat:'digital',x:{h,m}};}
  // k1r: timer etter (tall-tastatur)
  const k=t12R(1,[1,2,3][L]),h=t12R(1,12-k),v=L===2?t12R(0,2):t12R(0,1);
  const o={q:`${h} + ${k} = ?`,ans:h+k,...base,hint:'Tell timene fremover',ops:{a:h,b:k,op:'+'},strat:'klokke-tid',x:{h,k}};
  if(v===0){t12Story(o,`Klokka er ${h}. Hva er klokka om ${t12Time(k)}?`,`Klokka er ${h}. Hva er klokka om ${t12Time(k)}?`);o.vis={kind:'clock',h,m:0};return o;}
  if(v===1)return t12Story(o,`Filmen starter klokka ${h}. Den varer i ${t12Time(k)}. Når er den ferdig?`,`Filmen starter klokka ${h}. Den varer i ${t12Time(k)}. Når er den ferdig?`);
  const p={q:`${h+k} - ${h} = ?`,ans:k,...base,hint:`Tell fra ${h} til ${h+k}`,ops:{a:h+k,b:h,op:'-'},strat:'klokke-tid',x:{h,k,from:true}};
  return t12Story(p,`Fra klokka ${h} til klokka ${h+k}. Hvor mange timer er det?`,`Fra klokka ${h} til klokka ${h+k}. Hvor mange timer er det?`);
}
function t12FbClock1(q,g,c,qd){
  const d=t12Q(q,qd);if(!d)return t12Plain(g,c);const x=d.x||{};
  const how=(h,m)=>m===30?`💡 Lang viser på 6: halv. Kort viser er på vei til ${t12H(h+1)}.`:`💡 Lang viser på 12: hel time. Kort viser på ${t12H(h)}.`;
  if(d.sub==='k1h'||d.sub==='k1t')return `<strong>${c}</strong>! ${how(x.h,x.m)}`;
  if(d.sub==='k1v')return `<strong>${c}</strong> viser ${x.lbl.toLowerCase()}. ${how(x.h,x.m)}`;
  if(d.sub==='k1d')return `<strong>${c}</strong>. 💡 ${x.m?`Halv ${t12H(x.h+1)} er 30 minutter over ${t12H(x.h)}.`:`Hel time: 00 minutter.`}`;
  if(x.from)return `${t12Warm(g,c)} Det er <strong>${c}</strong> ${c===1?'time':'timer'}. 💡 Tell fra ${x.h}: ${t12Cnt(x.h,1,c)}.`;
  return `${t12Warm(g,c)} Klokka blir <strong>${c}</strong>. 💡 Fra klokka ${x.h}, tell ${x.k}: ${t12Cnt(x.h,1,x.k)}.`;
}

// ============================================================
// TEMA: TIERE OG ENERE (place2)
// ============================================================
function t12GenPlace2(g,id){
  const L=t12Lvl(g,id),t=t12Pick(g,id,{p2b:[4,2,1],p2e:[3,2,1],p2m:[2,3,3],p2d:[0,3,3],p2t:[1,2,2],p2v:[0,1,2],p2x:[0,1,2]},L),T='Tiere og enere',base={type:T,sub:t,strat:'tier-ener'};
  const tt=t12R(1,L?9:5);let oo=t12R(L?0:1,9);const n=10*tt+oo;
  if(t==='p2b'){
    return {...base,q:'Hvilket tall er dette?',ans:n,choices:t12Choices(n,[oo&&oo!==tt?10*oo+tt:null,tt+oo,n+10<100?n+10:null,n-10>0?n-10:null,n+1,n-1],3),hint:'En stav er 10',say:'Se på tierne og enerne. Hvilket tall er det?',vis:{kind:'place',t:tt,o:oo},x:{t:tt,o:oo}};}
  if(t==='p2x'){const t2=t12R(1,6),o2=t12R(10,15),m=10*t2+o2;
    return {...base,q:'Hvilket tall er dette?',ans:m,choices:t12Choices(m,[m-10,t2+o2,m+10],3),hint:'10 enere blir 1 tier',say:`Det er ${t12Tier(t2)} og ${o2} enere. Hvilket tall er det?`,vis:{kind:'place',t:t2,o:o2},x:{t:t2,o:o2}};}
  if(t==='p2e'){if(!oo)oo=t12R(1,9);const m=10*tt+oo,sw=L>0&&Math.random()<.3,o={...base,q:sw?`${oo} + ${10*tt} = ?`:`${10*tt} + ${oo} = ?`,ans:m,hint:'Tiere først, så enere',ops:sw?{a:oo,b:10*tt,op:'+'}:{a:10*tt,b:oo,op:'+'},x:{t:tt,o:oo}};
    o.say=sw?`Hva er ${oo} pluss ${10*tt}?`:`Hva er ${10*tt} pluss ${oo}?`;if(L<2)o.vis={kind:'place',t:tt,o:oo};return o;}
  if(t==='p2m'){
    const k=t12P(L?['+10','-10','+1','-1']:['+10','-10']);let m,q,eq,ans,op,b=k.length>2?10:1;
    if(k==='+10'){m=t12R(11,89);ans=m+10;}else if(k==='-10'){m=t12R(21,99);ans=m-10;}else if(k==='+1'){m=10*t12R(1,8)+9;ans=m+1;}else{m=10*t12R(2,9);ans=m-1;}
    op=k[0];q=`Hva er ${b} ${op==='+'?'mer':'mindre'} enn ${m}?`;eq=`${m} ${op} ${b} = ?`;
    const o={...base,q,eq,ans,hint:b===10?(op==='+'?'Én tier til':'Én tier mindre'):(op==='+'?'Én ener til':'Én ener mindre'),say:q,ops:{a:m,b,op},x:{m,k}};
    if(L===0)o.vis={kind:'place',t:Math.floor(m/10),o:m%10};return o;}
  if(t==='p2d'){if(!oo)oo=t12R(1,9);const m=10*tt+oo,first=Math.random()<.55;
    return {...base,q:first?`${m} = ${10*tt} + ?`:`${m} = ? + ${oo}`,eq:first?`${10*tt} + ? = ${m}`:`? + ${oo} = ${m}`,ans:first?oo:10*tt,hint:'Del i tiere og enere',
      say:first?`${m} er lik ${10*tt} pluss hva?`:`${m} er lik hva pluss ${oo}?`,ops:{a:10*tt,b:oo,op:'+'},x:{t:tt,o:oo,m}};}
  // p2t / p2v: sifrenes plass
  let t3=t12R(2,9),o3;do{o3=t12R(1,9);}while(o3===t3);const m=10*t3+o3;
  if(t==='p2t'){const tens=Math.random()<.6,q=`Hvor mange ${tens?'tiere':'enere'} er det i ${m}?`;
    return {...base,q,ans:tens?t3:o3,choices:t12Choices(tens?t3:o3,tens?[o3,10*t3]:[t3],tens?3:2),hint:tens?'Tierne står først':'Enerne står sist',say:q,x:{t:t3,o:o3,m,tens}};}
  const tens=Math.random()<.5,dd=tens?t3:o3,q=`Hva betyr ${dd}-tallet i ${m}?`,A=t12Tier(dd),B=t12Ener(dd);
  return {...base,q,ans:tens?A:B,choices:[A,B],hint:'Første siffer er tiere',say:q,x:{t:t3,o:o3,m,tens}};
}
function t12FbPlace2(q,g,c,qd){
  const d=t12Q(q,qd);if(!d)return t12Plain(g,c);const x=d.x||{},gs=String(g);
  if(d.sub==='p2b'||d.sub==='p2x'){const rv=x.o<10?String(10*x.o+x.t):'';
    const tip=d.sub==='p2x'?`10 enere blir 1 tier: ${t12Tier(x.t+1)} og ${t12Ener(x.o-10)}.`:gs===rv?'Tierne skrives først.':+g===x.t+x.o?'En stav er 10, ikke 1.':`${t12Tier(x.t)} og ${t12Ener(x.o)}.`;
    return `Det er <strong>${c}</strong>. 💡 ${tip}`;}
  if(d.sub==='p2e')return `${t12Warm(g,c)} ${d.ops.a} + ${d.ops.b} = <strong>${c}</strong>. 💡 ${gs===String(10*x.o+x.t)?'Tierne skrives først! ':''}${t12Tier(x.t)} og ${t12Ener(x.o)}.`;
  if(d.sub==='p2m'){const tn=Math.floor(x.m/10),tip=x.k==='+10'?`Én tier til: ${tn} blir ${tn+1}.`:x.k==='-10'?`Én tier mindre: ${tn} blir ${tn-1}.`:x.k==='+1'?'10 enere blir en ny tier.':`Tell ned én: ${x.m}, ${c}.`;
    return `${t12Warm(g,c)} ${x.k.length>2?'10':'1'} ${x.k[0]==='+'?'mer':'mindre'} enn ${x.m} er <strong>${c}</strong>. 💡 ${tip}`;}
  if(d.sub==='p2d')return `${t12Warm(g,c)} ${x.m} = ${10*x.t} + ${x.o}. Svaret er <strong>${c}</strong>. 💡 ${t12Tier(x.t)} og ${t12Ener(x.o)}.`;
  if(d.sub==='p2t')return `Det er <strong>${c}</strong> ${x.tens?(c===1?'tier':'tiere'):(c===1?'ener':'enere')}. 💡 ${x.m} er ${t12Tier(x.t)} og ${t12Ener(x.o)}.`;
  return `<strong>${c}</strong>. 💡 I ${x.m} er ${x.t}-tallet tiere og ${x.o}-tallet enere.`;
}

// ============================================================
// TEMA: PARTALL OG ODDETALL (even2)
// ============================================================
function t12Par(n){return n%2?'Oddetall':'Partall';}
function t12GenEven2(g,id){
  const L=t12Lvl(g,id),t=t12Pick(g,id,{o2b:[5,2,1],o2n:[2,3,2],o2f:[1,2,2],o2s:[0,2,4],o2r:[2,2,2],o2d:[1,1,1]},L),T='Partall og oddetall',base={type:T,sub:t,strat:'partall'},PO=['Partall','Oddetall'];
  if(t==='o2b'){const n=t12R(2,L?12:10);return {...base,q:'Partall eller oddetall?',ans:t12Par(n),choices:PO.slice(),hint:'Får alle sokkene en makker?',say:'Er det et partall eller et oddetall? Se om alle sokkene får en makker.',vis:{kind:'pairs',n,e:'🧦'},x:{n}};}
  if(t==='o2n'){const n=t12R(1,L?20:10),q=`Er ${n} et partall eller et oddetall?`;return {...base,q,ans:t12Par(n),choices:PO.slice(),hint:'Kan du dele likt i to?',say:q,x:{n}};}
  if(t==='o2f'){const ev=Math.random()<.5,mx=L>1?99:20,pk=want=>{let n;do{n=t12R(1,mx);}while(n%2!==(want?0:1));return n;};
    const ans=pk(ev),s=new Set([ans]);while(s.size<3)s.add(pk(!ev));const w=ev?'partall':'oddetall',q=`Hvilket tall er et ${w}?`,ch=t12Sh([...s]);
    return {...base,q,ans,choices:ch,hint:'Se på enerne',say:`${q} ${ch[0]}, ${ch[1]} eller ${ch[2]}?`,x:{w}};}
  if(t==='o2s'){const ev=Math.random()<.5,truth=Math.random()<.5;let n;do{n=t12R(21,99);}while((n%2===0)!==(ev===truth));const w=ev?'partall':'oddetall',q=`Er ${n} et ${w}?`;
    return {...base,q,ans:truth?'Ja':'Nei',choices:['Ja','Nei'],hint:'Se på enerne',say:q,x:{n,w}};}
  if(t==='o2r'){const odd=Math.random()<.5,mx=[12,30,60][L];let s0=t12R(odd?1:2,mx);if(s0%2!==(odd?1:0))s0++;
    const ts=[0,1,2,3].map(i=>s0+2*i),mi=L?t12P([1,2,3,3]):3,ans=ts[mi];ts[mi]='?';const seq=ts.join(', '),w=odd?'oddetall':'partall';
    const o={...base,q:seq,ans,hint:'Hopp 2 hver gang',x:{w,prev:mi?ans-2:ans+2,mi}};
    return t12Story(o,`🐸 Frosken hopper på ${w}: ${seq}`,`Frosken hopper på ${w}. Hvilket tall mangler? ${seq.replace('?','hva')}?`);}
  const n=2*t12R(2,L?10:6),[E,,nn]=t12P(T12_FOOD),o={...base,q:`${n} : 2 = ?`,ans:n/2,hint:'Gi én og én',ops:{a:n,b:2,op:':'},x:{n}};
  return t12Story(o,`Del ${n} ${E} likt på 2 barn. Hvor mange får hvert barn?`,`Del ${n} ${nn} likt på 2 barn. Hvor mange får hvert barn?`);
}
function t12FbEven2(q,g,c,qd){
  const d=t12Q(q,qd);if(!d)return t12Plain(g,c);const x=d.x||{};
  const split=n=>n%2?`${n} = ${(n-1)/2} + ${(n+1)/2}. Det blir ikke likt.`:`${n} = ${n/2} + ${n/2}. Likt!`;
  if(d.sub==='o2b')return `<strong>${c}</strong>. 💡 ${x.n%2?'Én sokk blir alene.':'Alle sokkene har en makker.'}`;
  if(d.sub==='o2n')return `<strong>${c}</strong>. 💡 ${split(x.n)}`;
  if(d.sub==='o2f')return `<strong>${c}</strong> er et ${x.w}. 💡 ${x.w==='partall'?'Partall slutter på 0, 2, 4, 6 eller 8.':'Oddetall slutter på 1, 3, 5, 7 eller 9.'}`;
  if(d.sub==='o2s')return `<strong>${c}</strong>. ${x.n} slutter på ${x.n%10}, så ${x.n} er et ${t12Par(x.n).toLowerCase()}.`;
  if(d.sub==='o2r')return `${t12Warm(g,c)} Svaret er <strong>${c}</strong>. 💡 ${x.mi?`${x.prev} + 2 = ${c}.`:`${c} + 2 = ${x.prev}.`}`;
  return `${t12Warm(g,c)} Hvert barn får <strong>${c}</strong>. 💡 ${c} + ${c} = ${x.n}.`;
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
    return {...base,q:'Hvor mange kroner?',ans,choices:t12Choices(ans,[c.length!==s?`${c.length} kr`:null,`${s-mn} kr`,`${s+10} kr`,`${s+5} kr`].filter(x=>x!=='0 kr'),3),hint:'Tell de store myntene først',say:'Hvor mange kroner er det til sammen?',vis:{kind:'coins',c},x:{c,s}};}
  if(t==='m2n'){const c=t12CoinSet(L),s=t12Sum(c),truth=Math.random()<.5,p=truth?t12R(Math.max(2,s-5),s):t12R(s+1,s+5);
    return {...base,q:`${E} koster ${p} kr. Har du nok?`,ans:truth?'Ja':'Nei',choices:['Ja','Nei'],hint:'Tell pengene dine først',say:`${t12Cap(N)} koster ${t12Kr(p)}. Har du nok penger?`,vis:{kind:'coins',c},x:{s,p}};}
  if(t==='m2f'){
    const den=[20,10,5,1],mk=()=>t12CoinMix(L>1?50:30,den,3),ok=mk(),A=t12Sum(ok),seen=new Set([ok.join(' + ')]),ds=[];
    for(let n=0;n<40&&ds.length<2;n++){const w=ok.slice(),i=t12R(0,w.length-1);w[i]=t12P(den.filter(v=>v!==w[i]));w.sort((a,b)=>b-a);const s=w.join(' + ');if(t12Sum(w)!==A&&!seen.has(s)){seen.add(s);ds.push(s);}}
    for(const w of [[...ok,1],ok.slice(1),[...ok,5]]){if(ds.length>=2)break;w.sort((a,b)=>b-a);const s=w.join(' + ');if(w.length>=1&&t12Sum(w)!==A&&!seen.has(s)){seen.add(s);ds.push(s);}}
    const ans=ok.join(' + ');
    return {...base,q:`Hvilke mynter blir ${A} kr?`,ans,choices:t12Sh([ans,...ds.slice(0,2)]),hint:'Legg sammen myntene',say:`Hvilke mynter blir ${t12Kr(A)} til sammen?`,x:{A}};}
  if(t==='m2i'){const pc=[[10],[20],t12P([[20,10],[20,20,10]])][L],pay=t12Sum(pc),p=t12R(L?Math.max(3,pay-19):2,pay-1);
    const o={...base,q:`${pay} - ${p} = ?`,ans:pay-p,hint:`Tell fra ${p} opp til ${pay}`,ops:{a:pay,b:p,op:'-'},x:{pay,p}};
    t12Story(o,`Du betaler ${pay} kr. ${E} koster ${p} kr. Hvor mye får du igjen?`,`Du betaler ${t12Kr(pay)}. ${t12Cap(N)} koster ${t12Kr(p)}. Hvor mye får du igjen?`);o.vis={kind:'coins',c:pc};return o;}
  if(t==='m2s'){const mx=[20,50,99][L],p1=t12R(2,mx-2),p2=t12R(2,Math.max(2,Math.min(mx-p1,L?40:10)));let [E2,N2]=t12P(T12_SHOP);while(E2===E)[E2,N2]=t12P(T12_SHOP);
    const o={...base,q:`${p1} + ${p2} = ?`,ans:p1+p2,hint:'Legg sammen prisene',ops:{a:p1,b:p2,op:'+'},x:{p1,p2}};
    return t12Story(o,`${E} koster ${p1} kr. ${E2} koster ${p2} kr. Hvor mye til sammen?`,`${t12Cap(N)} koster ${t12Kr(p1)}. ${t12Cap(N2)} koster ${t12Kr(p2)}. Hvor mye koster de til sammen?`);}
  const p=t12R(L>1?20:8,L>1?99:50),h=t12R(Math.max(2,p-(L>1?40:15)),p-1),o={...base,q:`${h} + ? = ${p}`,ans:p-h,hint:`Tell fra ${h} opp til ${p}`,ops:{a:h,b:p-h,op:'+'},x:{h,p}};
  return t12Story(o,`Du har ${h} kr. ${E} koster ${p} kr. Hvor mye mangler du?`,`Du har ${t12Kr(h)}. ${t12Cap(N)} koster ${t12Kr(p)}. Hvor mye mangler du?`);
}
function t12FbMoney2(q,g,c,qd){
  const d=t12Q(q,qd);if(!d)return t12Plain(g,c);const x=d.x||{};
  if(d.sub==='m2c'){let r=0;const run=x.c.map(v=>r+=v);return `${String(g)===`${x.c.length} kr`?'Se på tallet på myntene! ':''}Det er <strong>${c}</strong>. 💡 Tell: ${run.join(', ')}.`;}
  if(d.sub==='m2n')return c==='Ja'?`<strong>Ja</strong>! Du har ${x.s} kr. Det holder til ${x.p} kr.`:`<strong>Nei</strong>. Du har ${x.s} kr, men trenger ${x.p} kr.`;
  if(d.sub==='m2f')return `<strong>${c}</strong> blir ${x.A} kr.`;
  if(d.sub==='m2i')return `${t12Warm(g,c)} Du får <strong>${c}</strong> kr igjen. 💡 Fra ${x.p} til ${x.pay} er ${c}.`;
  if(d.sub==='m2s')return `${t12Warm(g,c)} ${x.p1} + ${x.p2} = <strong>${c}</strong> kr. 💡 ${x.p1>=10&&x.p2>=10?'Tiere først, så enere.':`Tell videre fra ${Math.max(x.p1,x.p2)}.`}`;
  return `${t12Warm(g,c)} Du mangler <strong>${c}</strong> kr. 💡 ${x.h} + ${c} = ${x.p}.`;
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
      return {...base,q,ans:truth?'Ja':'Nei',choices:['Ja','Nei'],type:'Stemmer det?',sub:'mini-tf',hint:'Regn ut selv først',say:`Stemmer det? ${t12Say(E)} er ${sh}.`,mini:{kind:'tf',e:E,is,v,sh,truth}};
    }
    let other=null,ov=null;
    if(!unary&&Math.random()<.5)for(let n=0;n<12&&other==null;n++){const dd=t12P([-2,-1,1,2]),fx=Math.random()<.5,x=fx?a+dd:a,y=fx?b:b+dd;if(x<0||y<0)continue;const w=t12Calc(op,x,y);if(!Number.isInteger(w)||w<0||w===v)continue;other=mk(x,y);ov=w;}
    if(other==null){const dd=t12P([-3,-2,-1,1,2,3]);ov=v+dd>=0?v+dd:v-dd;other=String(ov);}
    const ch=t12Sh([E,other]),A={e:E,v},B={e:other,v:ov},big=v>ov?A:B;
    return {...base,q:'Hvilken er størst?',ans:big.e,choices:ch,type:'Hvilken er størst?',sub:'mini-cmp',hint:'Regn ut begge',say:`Hvilken er størst? ${t12Say(ch[0])}, eller ${t12Say(ch[1])}?`,mini:{kind:'cmp',a:A,b:B}};
  }catch(e){return null;}
}
// Tilbakemelding for minioppgaver (brukes av fb-innpakningen under; A2 kan også kalle den direkte)
function mhMiniFb(qd,given){
  const m=qd&&qd.mini;if(!m||typeof m!=='object')return '';
  if(m.kind==='tf')return m.truth?`<strong>Ja</strong>, det stemmer: ${m.e} ${m.is} ${m.v}.`:`<strong>Nei</strong>. ${m.e} ${m.is} ${m.v}, ikke ${m.sh}.`;
  const big=m.a.v>m.b.v?m.a:m.b,sm=big===m.a?m.b:m.a,val=x=>x.e===String(x.v)?x.e:`${x.e} ${/av/.test(x.e)?'er':'='} ${x.v}`;
  return `<strong>${big.e}</strong> er størst. ${val(big)}, og ${val(sm)}. 💡 ${big.v} er mer enn ${sm.v}.`;
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
