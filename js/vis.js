// Mattehelten – Bilder i oppgaver og hint (tierramme, prikker, tallinje, klokke …)
// Alle js-filer deler globalt navnerom (vanlige <script>-tagger i fast rekkefølge, se index.html).
//
// Oppgaver kan ha qd.vis = {kind:'<navn>', ...}. renderVis(v) gir HTML-streng ('' hvis ukjent).
// Nye typer registreres fra hvilken som helst fil:  VIS.minType = v => '<div>…</div>';
// (Bruk alltid window.VIS – aldri const/let/var VIS – så filene ikke kolliderer.)
window.VIS=window.VIS||{};
function renderVis(v){
  if(!v||!v.kind)return '';
  const f=window.VIS[v.kind];
  if(typeof f!=='function')return '';
  try{return f(v)||'';}catch(e){console.warn('renderVis',v.kind,e);return '';}
}
function visEsc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function visN(n,max){n=Math.round(+n||0);return Math.max(0,Math.min(max||100,n));}
// Redusert bevegelse (prefers-reduced-motion): ingen blinking i bildene
function visCalm(){try{return !!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);}catch(e){return false;}}

// Tierramme: {a, b, cross, split}. a prikker i farge 1, så b i farge 2; de siste «cross» prikkene er strøket over.
// split: a i første ramme, b i andre (dobling). Antall rammer = så mange som trengs (maks 2).
window.VIS.tenframe=v=>{
  const a=visN(v.a,20),b=visN(v.b,20-a),x=Math.min(a+b,visN(v.cross,20)),tot=a+b,F=v.split?2:Math.max(1,Math.min(2,Math.ceil(tot/10)));
  let h='<div class="lv lv-tf">',d=0;
  for(let f=0;f<F;f++){
    h+='<div class="lv-frame">';
    for(let i=0;i<10;i++){
      let k=0,ord=0;
      if(v.split){k=f===0?(i<a?1:0):(i<b?2:0);ord=f===0?i:a+i;}
      else{const j=f*10+i;k=j<a?1:j<tot?2:0;ord=j;}
      h+=`<i class="lv-c${k?' lv-'+k:''}${k&&ord>=tot-x?' lv-x':''}"${k?` style="--d:${d++}"`:''}></i>`;
    }
    h+='</div>';
  }
  return h+'</div>';
};

// Prikker i grupper: {g:[n1,n2,…], cross, emoji, op, mono}. Hver gruppe står i rader på fem.
// cross = så mange av de siste i siste gruppe er strøket over. op = tegn mellom gruppene (f.eks. '+'). mono = samme farge i alle grupper (par til halvering).
window.VIS.dots=v=>{
  const G=(Array.isArray(v.g)?v.g:[v.n]).slice(0,12).map(n=>visN(n,50)),x=visN(v.cross,50),E=v.emoji?visEsc(v.emoji):'';
  let h=`<div class="lv lv-dots${G.length>4?' lv-many':''}">`,d=0;
  G.forEach((n,gi)=>{
    if(gi&&v.op)h+=`<span class="lv-op">${visEsc(v.op)}</span>`;
    h+=`<span class="lv-grp${E?' lv-emo':''}">`;
    for(let i=0;i<n;i++)h+=`<i class="lv-d lv-${v.mono?1:gi%2+1}${gi===G.length-1&&i>=n-x?' lv-x':''}" style="--d:${d++}">${E}</i>`;
    h+='</span>';
  });
  return h+'</div>';
};

// Tallinje med hopp: {from, to, step, start, hops:[+3,-2,…], hopLab:['+3',…], endLab:'?', top:'?', hide:[tall], hl:[tall]}
// Opptil 12 streker: vanlig tallinje. Flere: «tom tallinje» med bare de viktige tallene.
// endLab '?' skjuler tallet der hoppene lander, hide viser '?' for gitte tall, hl uthever tall, top = tekst over hele hoppet.
window.VIS.line=v=>{
  const st=Math.max(1,Math.abs(+v.step||1)),hops=(v.hops||[]).slice(0,12).map(Number),start=+v.start||0,pts=[start];
  hops.forEach(h=>pts.push(pts[pts.length-1]+h));
  const from=Math.min(+v.from||0,...pts),to=Math.max(+v.to||0,...pts,from+st),N=Math.round((to-from)/st),open=N>12;
  const hide=new Set((v.hide||[]).map(Number)),hl=new Set((v.hl||[]).map(Number));
  const W=open?300:Math.max(200,N*32+32),P=16,Y=42,H=66,end=pts[pts.length-1];
  let X=n=>P+(n-from)/(to-from)*(W-2*P);
  if(open){ // tom tallinje: bare de viktige tallene, med minst 40 px mellom (små hopp blir lesbare)
    const M=[...new Set([...pts,...hide,...hl])].sort((a,b)=>a-b),gw=M.slice(1).map((m,i)=>m-M[i]),tot=gw.reduce((a,b)=>a+b,0)||1,min=Math.min(40,(W-2*P-20)/Math.max(1,gw.length));
    let ws=gw.map(g=>Math.max(min,g/tot*(W-2*P-20)));const k=(W-2*P-20)/(ws.reduce((a,b)=>a+b,0)||1);ws=ws.map(w=>Math.max(min,w*k));
    const pos={};let x=P+10;M.forEach((m,i)=>{pos[m]=x;x+=ws[i]||0;});X=n=>pos[n]!=null?pos[n]:P;}
  let s=`<svg class="lv lv-line" viewBox="0 0 ${W} ${H}" style="max-width:${W}px" aria-hidden="true"><line class="lv-ax" x1="${P-8}" y1="${Y}" x2="${W-P+8}" y2="${Y}"/>`;
  const num=n=>{const q=hide.has(n)||(hops.length&&n===end&&v.endLab==='?'),c=q?' lv-q':hl.has(n)||(hops.length&&n===end&&!q&&v.endLab!=null&&v.endLab!=='?')?' lv-hl':'';
    return `<text class="lv-n${c}" x="${X(n).toFixed(1)}" y="${Y+22}">${q?'?':n}</text>`;};
  const marks=new Set(pts);hide.forEach(n=>marks.add(n));hl.forEach(n=>marks.add(n));
  if(open){[...marks].forEach(n=>{s+=`<line class="lv-tk" x1="${X(n).toFixed(1)}" y1="${Y-6}" x2="${X(n).toFixed(1)}" y2="${Y+6}"/>`+num(n);});}
  else{const every=N>8?2:1;for(let i=0;i<=N;i++){const n=from+i*st,xn=X(n).toFixed(1);s+=`<line class="lv-tk" x1="${xn}" y1="${Y-5}" x2="${xn}" y2="${Y+5}"/>`;if(i%every===0||i===N||marks.has(n))s+=num(n);}}
  hops.forEach((h,i)=>{const x0=X(pts[i]),x1=X(pts[i+1]),k=Math.min(20,7+Math.abs(x1-x0)*.25);
    s+=`<path class="lv-hop" pathLength="100" style="--d:${i}" d="M${x0.toFixed(1)} ${Y-4} Q${((x0+x1)/2).toFixed(1)} ${(Y-4-2*k).toFixed(1)} ${x1.toFixed(1)} ${Y-4}"/><circle class="lv-tip" style="--d:${i}" cx="${x1.toFixed(1)}" cy="${Y-4}" r="2.6"/>`;
    const L=v.hopLab&&v.hopLab[i];if(L!=null&&L!=='')s+=`<text class="lv-hl" x="${((x0+x1)/2).toFixed(1)}" y="${(Y-9-k).toFixed(1)}">${visEsc(L)}</text>`;});
  if(v.top!=null&&v.top!==''&&hops.length)s+=`<text class="lv-top" x="${((X(start)+X(end))/2).toFixed(1)}" y="11">${visEsc(v.top)}</text>`;
  s+=`<circle class="lv-st" cx="${X(start).toFixed(1)}" cy="${Y}" r="5"/>`;
  if(hops.length)s+=`<circle class="lv-en" cx="${X(end).toFixed(1)}" cy="${Y}" r="5"/>`;
  return s+'</svg>';
};

// Tiere og enere: {a, b, cross}. Tierstaver og enerruter for a (farge 1) og b (farge 2, med + imellom).
// cross = så mye som tas bort fra a (enere først). Er det for få enere, veksles én tier til ti enere.
window.VIS.blocks=v=>{
  const a=visN(v.a,200),b=visN(v.b,200),x=Math.min(a,visN(v.cross,200)),xt=Math.floor(x/10),xo=x%10,ex=xo>a%10&&a>=10;
  const grp=(n,c,ct,co,ex)=>{let t=Math.floor(n/10),o=n%10,h='<span class="lv-grp lv-blk">';if(ex){t--;o+=10;}
    for(let i=0;i<t;i++)h+=`<i class="lv-ten lv-${c}${i>=t-ct?' lv-x':''}" style="--d:${i}"></i>`;
    if(o){h+='<span class="lv-ones">';for(let i=0;i<o;i++)h+=`<i class="lv-one lv-${c}${ex&&i>=o-10?' lv-ex':''}${i>=o-co?' lv-x':''}" style="--d:${t+i}"></i>`;h+='</span>';}
    return h+'</span>';};
  let h='<div class="lv lv-blocks">'+grp(a,1,xt,xo,ex);
  if(b)h+='<span class="lv-op">+</span>'+grp(b,2,0,0,false);
  return h+'</div>';
};

// Størst/minst (større/mindre) som bilde, så barnet ser forskjellen uten å lese: {w:'størst'|'minst'|'større'|'mindre'}
// Stor elefant og gult ord for størst/større, liten mus og blått ord for minst/mindre.
window.VIS.cue=v=>{
  const w=String(v.w||''),big=/^st/i.test(w);
  return `<div class="lv lv-cue" style="display:flex;align-items:center;justify-content:center;gap:10px;min-height:56px" role="img" aria-label="${visEsc(w)}"><span style="font-size:${big?'3.1rem':'1.45rem'};line-height:1" aria-hidden="true">${big?'🐘':'🐭'}</span><b style="font-size:1.45rem;font-weight:900;letter-spacing:.06em;color:${big?'#ffd93d':'#5ee7ff'}">${visEsc(w.toUpperCase())}</b></div>`;
};
