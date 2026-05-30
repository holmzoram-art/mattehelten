// ============================================================
// STARS BACKGROUND
// ============================================================
(function(){
  const wrap=document.getElementById('stars');
  for(let i=0;i<120;i++){
    const s=document.createElement('div');
    s.className='star';
    const sz=Math.random()*2+1;
    s.style.cssText=`width:${sz}px;height:${sz}px;left:${Math.random()*100}%;top:${Math.random()*100}%;--d:${2+Math.random()*4}s;animation-delay:${Math.random()*4}s;`;
    wrap.appendChild(s);
  }
})();

// ============================================================
// SCRATCH PAD
// ============================================================
let scratchTool='pen',scratchSize=2,scratchColor='#ffffff',drawing=false,lastX=0,lastY=0;
const cvs=document.getElementById('scratch-canvas');
const ctx2=cvs.getContext('2d');

function resizeCanvas(){
  const w=cvs.parentElement.clientWidth||290;
  const img=ctx2.getImageData(0,0,cvs.width,cvs.height);
  cvs.width=w; cvs.height=Math.max(360,window.innerHeight*.52);
  ctx2.putImageData(img,0,0);
}
function getPos(e){
  const r=cvs.getBoundingClientRect(),src=e.touches?e.touches[0]:e;
  return{x:(src.clientX-r.left)*(cvs.width/r.width),y:(src.clientY-r.top)*(cvs.height/r.height)};
}
function startDraw(e){e.preventDefault();drawing=true;const p=getPos(e);lastX=p.x;lastY=p.y;}
function doDraw(e){
  if(!drawing)return;e.preventDefault();
  const p=getPos(e);
  ctx2.beginPath();ctx2.lineCap='round';ctx2.lineJoin='round';
  if(scratchTool==='erase'){ctx2.globalCompositeOperation='destination-out';ctx2.lineWidth=scratchSize*4;}
  else{ctx2.globalCompositeOperation='source-over';ctx2.strokeStyle=scratchColor;ctx2.lineWidth=scratchSize;}
  ctx2.moveTo(lastX,lastY);ctx2.lineTo(p.x,p.y);ctx2.stroke();
  lastX=p.x;lastY=p.y;
}
function endDraw(){drawing=false;ctx2.globalCompositeOperation='source-over';}
cvs.addEventListener('mousedown',startDraw);cvs.addEventListener('mousemove',doDraw);
cvs.addEventListener('mouseup',endDraw);cvs.addEventListener('mouseleave',endDraw);
cvs.addEventListener('touchstart',startDraw,{passive:false});cvs.addEventListener('touchmove',doDraw,{passive:false});
cvs.addEventListener('touchend',endDraw);

function setTool(t){
  scratchTool=t;
  document.getElementById('tool-pen').classList.toggle('active',t==='pen');
  document.getElementById('tool-erase').classList.toggle('active',t==='erase');
  cvs.className='scratch-canvas'+(t==='erase'?' erase':'');
}
function setSize(s,id){
  scratchSize=s;
  ['sz-s','sz-m','sz-l'].forEach(i=>document.getElementById(i).classList.remove('active'));
  document.getElementById(id).classList.add('active');
}
function setColor(c,id){
  scratchColor=c;scratchTool='pen';setTool('pen');
  ['col-w','col-c','col-g','col-r','col-gold'].forEach(i=>document.getElementById(i).classList.remove('active'));
  document.getElementById(id).classList.add('active');
}
function clearScratch(){
  if(scratchMode==='draw')ctx2.clearRect(0,0,cvs.width,cvs.height);
  else document.getElementById('scratch-text').value='';
}
let scratchMode='draw';
function switchTab(mode){
  scratchMode=mode;
  document.getElementById('tab-draw').classList.toggle('active',mode==='draw');
  document.getElementById('tab-write').classList.toggle('active',mode==='write');
  document.getElementById('scratch-draw').style.display=mode==='draw'?'block':'none';
  document.getElementById('scratch-write').classList.toggle('active',mode==='write');
  if(mode==='draw')resizeCanvas();
}
let scratchVisible=false;
function toggleScratch(){
  const col=document.getElementById('scratch-col');
  scratchVisible=!scratchVisible;
  col.classList.toggle('mobile-hidden',!scratchVisible);
  document.getElementById('scratch-toggle').textContent=scratchVisible?'✖️':'✏️';
  if(scratchVisible)setTimeout(()=>resizeCanvas(),50);
}
window.addEventListener('resize',resizeCanvas);
setTimeout(()=>resizeCanvas(),200);

// ============================================================
// CHARACTERS
// ============================================================
const CHARS=[
  {emoji:'🧙',name:'Trollmannen'},{emoji:'🦸',name:'Superhelten'},
  {emoji:'🥷',name:'Ninjaen'},{emoji:'🧚',name:'Alven'},
  {emoji:'🤖',name:'Roboten'},{emoji:'🦊',name:'Reven'},
  {emoji:'🐉',name:'Dragen'},{emoji:'⚡',name:'Lynet'},
  {emoji:'🦄',name:'Enhørningen'},{emoji:'🚀',name:'Raketten'},
];
let selectedChar=0;

function buildCharGrid(){
  const g=document.getElementById('char-grid');
  CHARS.forEach((c,i)=>{
    const d=document.createElement('div');
    d.className='char-card'+(i===0?' selected':'');
    d.innerHTML=`<span class="char-emoji">${c.emoji}</span><div class="char-name">${c.name}</div>`;
    d.onclick=()=>{selectedChar=i;document.querySelectorAll('.char-card').forEach(x=>x.classList.remove('selected'));d.classList.add('selected');};
    g.appendChild(d);
  });
}

function saveCharacter(){
  const name=document.getElementById('cs-name').value.trim()||CHARS[selectedChar].name;
  const player={emoji:CHARS[selectedChar].emoji,name};
  localStorage.setItem('mh_player',JSON.stringify(player));
  applyPlayer(player);
  showScreen('grades');
}

function applyPlayer(p){
  document.getElementById('hud-char').textContent=p.emoji;
  document.getElementById('hud-name').textContent=p.name;
  document.getElementById('player-avatar').textContent=p.emoji;
  document.getElementById('player-name').textContent=p.name;
}

// ============================================================
// WORLDS
// ============================================================
const WORLDS=[
  {grades:[1,2],name:'Tallenes Dal',icon:'🌿',desc:'Addisjon, subtraksjon og enkel ganging',
   color:'#43e97b',glow:'rgba(67,233,123,.3)',bg:'rgba(67,233,123,.1)',bg2:'rgba(67,233,123,.2)'},
  {grades:[3,4],name:'Gangeskogen',icon:'🌲',desc:'Gangetabellen, deling og brøker',
   color:'#4facfe',glow:'rgba(79,172,254,.3)',bg:'rgba(79,172,254,.1)',bg2:'rgba(79,172,254,.2)'},
  {grades:[5,6],name:'Desimalfjellene',icon:'🏔️',desc:'Desimaltall, prosent og geometri',
   color:'#f7971e',glow:'rgba(247,151,30,.3)',bg:'rgba(247,151,30,.1)',bg2:'rgba(247,151,30,.2)'},
  {grades:[7,8],name:'Algebraborgen',icon:'🏰',desc:'Algebra, likninger og statistikk',
   color:'#a855f7',glow:'rgba(168,85,247,.3)',bg:'rgba(168,85,247,.1)',bg2:'rgba(168,85,247,.2)'},
  {grades:[9,10],name:'Kosmos-riket',icon:'🌌',desc:'Pytagoras, trigonometri og funksjoner',
   color:'#06d6ff',glow:'rgba(6,214,255,.3)',bg:'rgba(6,214,255,.1)',bg2:'rgba(6,214,255,.2)'},
];

const ENEMIES={
  1:'🐛',2:'🐞',3:'🦎',4:'🐊',5:'🦕',6:'🐉',7:'👹',8:'🧟',9:'👾',10:'🛸'
};

function buildWorldList(){
  const list=document.getElementById('world-list');
  list.innerHTML='';
  WORLDS.forEach(w=>{
    const stars=getWorldStars(w.grades);
    const div=document.createElement('div');
    div.className='world-card';
    div.style.cssText=`--wcolor:${w.color};--wglow:${w.glow};--wbg:${w.bg};--wbg2:${w.bg2}`;
    div.innerHTML=`
      <div class="world-icon">${w.icon}</div>
      <div class="world-info">
        <div class="world-name">${w.name}</div>
        <div class="world-grades">${w.grades.map(g=>g+'. klasse').join(' & ')}</div>
        <div class="world-topics">${w.desc}</div>
      </div>
      <div class="world-stars">${stars}</div>
    `;
    div.onclick=()=>selectWorld(w);
    list.appendChild(div);
  });
}

function getWorldStars(grades){
  let total=0,max=0;
  grades.forEach(g=>{
    const topics=CUR[g]?.topics||[];
    topics.forEach(t=>{
      const best=getBest(g,t.id);
      max+=3;
      if(best!==null)total+=Math.ceil(best/10*3);
    });
  });
  if(max===0)return '○○○';
  const pct=total/max;
  if(pct>=.9)return '⭐⭐⭐';
  if(pct>=.5)return '⭐⭐○';
  if(pct>0)return '⭐○○';
  return '○○○';
}

function selectWorld(world){
  const topicList=document.getElementById('topic-list');
  document.getElementById('topic-screen-title').textContent=`${world.icon} ${world.name}`;
  topicList.innerHTML='';
  world.grades.forEach(g=>{
    const gd=CUR[g];
    const gradeHdr=document.createElement('div');
    gradeHdr.style.cssText='font-family:Fredoka One,cursive;font-size:.8rem;color:var(--muted);text-transform:uppercase;letter-spacing:1px;margin:10px 0 6px;padding-left:4px;';
    gradeHdr.textContent=`${g}. KLASSE`;
    topicList.appendChild(gradeHdr);
    gd.topics.forEach(t=>{
      const best=getBest(g,t.id);
      const hasWeak=checkWeak(g,t.id);
      const hasGuide=!!(LEARN_GUIDES[t.id]&&LEARN_GUIDES[t.id].length);
      const btn=document.createElement('button');
      btn.className='topic-btn';
      btn.innerHTML=`
        <div class="tb-icon" style="background:${t.bg||'rgba(124,58,237,.3)'}">${t.icon}</div>
        <div>
          <div class="tb-name">${t.name}${hasWeak?'<span class="adapt-tag">🎯</span>':''}</div>
          <div class="tb-desc">${t.desc}</div>
          ${best!==null?`<div style="font-size:.7rem;color:var(--gold);font-weight:800;margin-top:2px">Rekord: ${best}/10</div>`:''}
        </div>
        ${hasGuide?`<button class="topic-learn-btn" onclick="event.stopPropagation();showLearn(${g},'${t.id}')">📖 Lær</button>`:''}
      `;
      btn.onclick=()=>startGame(g,t.id);
      topicList.appendChild(btn);
    });
  });
  showScreen('topics');
}

// ============================================================
// ADAPTIVE TRACKING
// ============================================================
function adaptKey(g,tid,sub){return `adapt_${g}_${tid}_${sub}`;}
function recordAttempt(g,tid,sub,ok){
  const k=adaptKey(g,tid,sub),d=JSON.parse(localStorage.getItem(k)||'{"a":0,"e":0}');
  d.a++;if(!ok)d.e++;localStorage.setItem(k,JSON.stringify(d));
}
function errRate(g,tid,sub){
  const d=JSON.parse(localStorage.getItem(adaptKey(g,tid,sub))||'{"a":0,"e":0}');
  return d.a<3?0:d.e/d.a;
}
function getBest(g,id){const s=JSON.parse(localStorage.getItem(`hs_${g}_${id}`)||'[]');return s.length?s[0].score:null;}
function checkWeak(g,id){
  for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.startsWith(`adapt_${g}_${id}_`)){const v=JSON.parse(localStorage.getItem(k));if(v.a>=3&&v.e/v.a>.3)return true;}}return false;
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

const CUR={
  1:{c1:'#43e97b',c2:'#38f9d7',badge:'rgba(67,233,123,.15)',tc:'#00ff88',icon:'🔢',label:'Tall 1-20, + og -',
    topics:[
      {id:'add10',icon:'➕',bg:'rgba(67,233,123,.2)',name:'Addisjon til 10',desc:'Legg sammen tall opp til 10',
        gen(g,id){const pairs=[];for(let a=0;a<=9;a++)for(let b=0;b<=10-a;b++){const s=`${a}+${b}`,w=1+Math.round(errRate(g,id,s)*5);for(let i=0;i<w;i++)pairs.push({a,b,s});}const t=pick(pairs);return{q:`${t.a} + ${t.b} = ?`,ans:t.a+t.b,type:'Addisjon',sub:t.s};},fb:fbAdd},
      {id:'sub10',icon:'➖',bg:'rgba(255,68,102,.2)',name:'Subtraksjon til 10',desc:'Trekk fra tall opp til 10',
        gen(g,id){const pairs=[];for(let a=0;a<=10;a++)for(let b=0;b<=a;b++){const s=`${a}-${b}`,w=1+Math.round(errRate(g,id,s)*5);for(let i=0;i<w;i++)pairs.push({a,b,s});}const t=pick(pairs);return{q:`${t.a} - ${t.b} = ?`,ans:t.a-t.b,type:'Subtraksjon',sub:t.s};},fb:fbSub},
      {id:'add20',icon:'🔢',bg:'rgba(6,214,255,.2)',name:'Addisjon til 20',desc:'Legg sammen tall opp til 20',
        gen(g,id){const a=rand(1,15),b=rand(1,20-a);return{q:`${a} + ${b} = ?`,ans:a+b,type:'Addisjon',sub:`g${Math.floor(a/5)}`};},fb:fbAdd},
    ]},
  2:{c1:'#4facfe',c2:'#00f2fe',badge:'rgba(79,172,254,.15)',tc:'#06d6ff',icon:'🧮',label:'Tall 1-100, + - x',
    topics:[
      {id:'add100',icon:'➕',bg:'rgba(79,172,254,.2)',name:'Addisjon til 100',desc:'Legg sammen tall opp til 100',
        gen(g,id){const a=rand(1,90),b=rand(1,100-a);return{q:`${a} + ${b} = ?`,ans:a+b,type:'Addisjon',sub:`t${Math.floor(a/20)}`};},fb:fbAdd},
      {id:'sub100',icon:'➖',bg:'rgba(255,68,102,.2)',name:'Subtraksjon til 100',desc:'Trekk fra tall opp til 100',
        gen(g,id){const a=rand(10,100),b=rand(1,a);return{q:`${a} - ${b} = ?`,ans:a-b,type:'Subtraksjon',sub:`t${Math.floor(a/20)}`};},fb:fbSub},
      {id:'mul25',icon:'x',bg:'rgba(255,217,61,.2)',name:'Ganging med 2, 5 og 10',desc:'Enkel multiplikasjon',
        gen(g,id){const b=weightedPick([2,5,10],t=>errRate(g,id,`x${t}`)),a=rand(1,10);return{q:`${a} x ${b} = ?`,ans:a*b,type:'Ganging',hint:`${b}-gangen`,sub:`x${b}`};},fb:fbMul},
    ]},
  3:{c1:'#43e97b',c2:'#38f9d7',badge:'rgba(67,233,123,.15)',tc:'#00ff88',icon:'x',label:'Gangetabell 1-5, deling',
    topics:[
      {id:'mul15',icon:'x',bg:'rgba(67,233,123,.2)',name:'Gangetabellen 1-5',desc:'1-, 2-, 3-, 4- og 5-gangen',
        gen(g,id){const b=weightedPick([1,2,3,4,5],t=>errRate(g,id,`x${t}`)),a=rand(1,10);return{q:`${a} x ${b} = ?`,ans:a*b,type:'Ganging',hint:`${b}-gangen`,sub:`x${b}`};},fb:fbMul},
      {id:'div25',icon:'/',bg:'rgba(255,217,61,.2)',name:'Deling med 2, 5, 10',desc:'Enkel divisjon',
        gen(g,id){const b=weightedPick([2,5,10],t=>errRate(g,id,`d${t}`)),a=b*rand(1,10);return{q:`${a} / ${b} = ?`,ans:a/b,type:'Divisjon',hint:`Del med ${b}`,sub:`d${b}`};},fb:fbDiv},
      {id:'add100r',icon:'🔟',bg:'rgba(6,214,255,.2)',name:'Runde tall',desc:'Legg sammen tiere og hundrere',
        gen(g,id){const t=pick([10,20,50,100]);const a=t*rand(1,9),b=t*rand(1,9);return{q:`${a} + ${b} = ?`,ans:a+b,type:'Addisjon',hint:'Runde tall',sub:`r${t}`};},fb:fbAdd},
    ]},
  4:{c1:'#fa709a',c2:'#fee140',badge:'rgba(250,112,154,.15)',tc:'#fa709a',icon:'pie',label:'Gangetabell 1-10, brok',
    topics:[
      {id:'mul110',icon:'x',bg:'rgba(250,112,154,.2)',name:'Gangetabellen 1-10',desc:'Hele gangetabellen',
        gen(g,id){const b=weightedPick([1,2,3,4,5,6,7,8,9,10],t=>errRate(g,id,`x${t}`)),a=rand(1,10);return{q:`${a} x ${b} = ?`,ans:a*b,type:'Ganging',hint:`${b}-gangen`,sub:`x${b}`};},fb:fbMul},
      {id:'div110',icon:'/',bg:'rgba(255,217,61,.2)',name:'Divisjon 1-10',desc:'Del med alle tall fra 1-10',
        gen(g,id){const b=weightedPick([2,3,4,5,6,7,8,9,10],t=>errRate(g,id,`d${t}`)),a=b*rand(1,10);return{q:`${a} / ${b} = ?`,ans:a/b,type:'Divisjon',sub:`d${b}`};},fb:fbDiv},
      {id:'frac4',icon:'1/2',bg:'rgba(168,85,247,.2)',name:'Enkle brok',desc:'1/2, 1/3 og 1/4 av et tall',
        gen(g,id){const fs=[{s:'1/2',d:2},{s:'1/4',d:4},{s:'1/3',d:3}];const f=weightedPick(fs,t=>errRate(g,id,t.s)),whole=f.d*rand(1,8);return{q:`${f.s} av ${whole} = ?`,ans:whole/f.d,type:'Brok',hint:'Del pa nevneren',sub:f.s};},fb:fbFrac},
    ]},
  5:{c1:'#f7971e',c2:'#ffd200',badge:'rgba(247,151,30,.15)',tc:'#ffd93d',icon:'%',label:'Desimaltall, prosent',
    topics:[
      {id:'dec5',icon:'.',bg:'rgba(247,151,30,.2)',name:'Desimaltall',desc:'Addisjon og subtraksjon med desimaler',
        gen(g,id){const op=pick(['+','-']);const a=r2(rand(10,99)/10),b=r2(rand(1,Math.floor(a*10)-1)/10);const ans=op==='+'?r2(a+b):r2(a-b);return{q:`${a} ${op} ${b} = ?`,ans,type:'Desimaltall',hint:'Komma under komma',sub:op==='+'?'dec+':'dec-'};},fb:fbDec},
      {id:'pct5',icon:'%',bg:'rgba(255,217,61,.2)',name:'Enkel prosent',desc:'10%, 25%, 50% av et tall',
        gen(g,id){const pcts=[10,20,25,50];const p=weightedPick(pcts,t=>errRate(g,id,`p${t}`));const base=rand(1,20)*10;return{q:`${p}% av ${base} = ?`,ans:r2(base*p/100),type:'Prosent',hint:`Del pa ${100/p}`,sub:`p${p}`};},fb:fbPct},
      {id:'round5',icon:'~',bg:'rgba(6,214,255,.2)',name:'Avrunding',desc:'Rund av til naermeste tier eller heltall',
        gen(g,id){const t=pick(['heltall','tier']);if(t==='heltall'){const a=r2(rand(10,99)/10);return{q:`Rund av ${a} til heltall`,ans:Math.round(a),type:'Avrunding',hint:'.5 og over = rund opp',sub:'rnd1'};}else{const a=rand(11,99);return{q:`Rund av ${a} til tier`,ans:Math.round(a/10)*10,type:'Avrunding',hint:'Se pa enerne',sub:'rnd10'};}},fb:fbRound},
    ]},
  6:{c1:'#4776e6',c2:'#8e54e9',badge:'rgba(71,118,230,.15)',tc:'#a855f7',icon:'geo',label:'Brok, geometri, negative tall',
    topics:[
      {id:'frac6',icon:'1/2',bg:'rgba(168,85,247,.2)',name:'Brokregning',desc:'Legg til og trekk fra broker',
        gen(g,id){const ops=[{a:[1,2],b:[1,2]},{a:[1,3],b:[1,3]},{a:[1,4],b:[1,4]},{a:[1,2],b:[1,4]},{a:[2,3],b:[1,3]}];const o=pick(ops);const op=pick(['+','-']);let num,den;if(o.a[1]===o.b[1]){den=o.a[1];num=op==='+'?o.a[0]+o.b[0]:o.a[0]-o.b[0];}else{den=o.a[1]*o.b[1];const na=o.a[0]*o.b[1],nb=o.b[0]*o.a[1];num=op==='+'?na+nb:na-nb;}const ans=r2(num/den);return{q:`${o.a[0]}/${o.a[1]} ${op} ${o.b[0]}/${o.b[1]} = ?`,ans,type:'Brok',hint:'Finn fellesnevner',sub:`fr${op}`};},fb:fbFrOp},
      {id:'geo6',icon:'sq',bg:'rgba(67,233,123,.2)',name:'Areal og omkrets',desc:'Rektangler og kvadrater',
        gen(g,id){const shape=pick(['rekt','kvadrat']);const t=pick(['areal','omkrets']);if(shape==='kvadrat'){const s=rand(2,12);const ans=t==='areal'?s*s:4*s;return{q:t==='areal'?`Areal av kvadrat side ${s}`:`Omkrets av kvadrat side ${s}`,ans,type:'Geometri',hint:t==='areal'?'side x side':'4 x side',sub:`geo_${t}`};}else{const w=rand(2,12),h=rand(2,12);const ans=t==='areal'?w*h:2*(w+h);return{q:t==='areal'?`Areal av rektangel ${w}x${h}`:`Omkrets ${w}x${h}`,ans,type:'Geometri',hint:t==='areal'?'l x b':'2 x (l + b)',sub:`geo_${t}`};}},fb:fbGeo},
      {id:'neg6',icon:'-',bg:'rgba(255,68,102,.2)',name:'Negative tall',desc:'Regn med negative tall',
        gen(g,id){const a=rand(-9,9),b=rand(1,9),op=pick(['+','-']);const ans=op==='+'?a+b:a-b;return{q:`${a} ${op} ${b} = ?`,ans,type:'Negative tall',sub:op==='+'?'neg+':'neg-'};},fb:fbNeg},
    ]},
  7:{c1:'#11998e',c2:'#38ef7d',badge:'rgba(17,153,142,.15)',tc:'#00ff88',icon:'x=',label:'Algebra, forholdstall, statistikk',
    topics:[
      {id:'alg7',icon:'x=',bg:'rgba(168,85,247,.2)',name:'Enkel algebra',desc:'Finn den ukjente (x)',
        gen(g,id){const t=pick(['xa','xb','xc']);if(t==='xa'){const x=rand(1,15),b=rand(1,10);return{q:`x + ${b} = ${x+b}, x = ?`,ans:x,type:'Algebra',hint:`Trekk fra ${b}`,sub:'alg+'};}else if(t==='xb'){const x=rand(2,15),b=rand(1,x-1);return{q:`x - ${b} = ${x-b}, x = ?`,ans:x,type:'Algebra',hint:`Legg til ${b}`,sub:'alg-'};}else{const b=pick([2,3,4,5]),x=rand(1,12);return{q:`${b} x x = ${b*x}, x = ?`,ans:x,type:'Algebra',hint:`Del pa ${b}`,sub:'algx'};}},fb:fbAlg},
      {id:'ratio7',icon:'=',bg:'rgba(79,172,254,.2)',name:'Forholdstall',desc:'Finn den manglende verdien',
        gen(g,id){const a=rand(1,6),b=rand(1,6),k=rand(2,5);const t=pick(['c','d']);if(t==='c'){return{q:`${a} : ${b} = ${a*k} : ?`,ans:b*k,type:'Forholdstall',sub:'rat1'};}else{return{q:`${a} : ${b} = ? : ${b*k}`,ans:a*k,type:'Forholdstall',sub:'rat2'};}},fb:fbRatio},
      {id:'stat7',icon:'avg',bg:'rgba(255,217,61,.2)',name:'Gjennomsnitt',desc:'Finn gjennomsnittet av en tallrekke',
        gen(g,id){const n=rand(3,5);const vals=Array.from({length:n},()=>rand(1,20));const ans=r2(vals.reduce((a,b)=>a+b,0)/n);return{q:`Snitt av: ${vals.join(', ')} = ?`,ans,type:'Statistikk',hint:`Summer og del pa ${n}`,sub:'avg'};},fb:fbStat},
    ]},
  8:{c1:'#eb3349',c2:'#f45c43',badge:'rgba(235,51,73,.15)',tc:'#ff4466',icon:'2x',label:'Likninger, potenser, prosent',
    topics:[
      {id:'eq8',icon:'=',bg:'rgba(235,51,73,.2)',name:'Lineaere likninger',desc:'Los likninger med en ukjent',
        gen(g,id){const t=pick(['ax','axb']);if(t==='ax'){const a=rand(2,9),x=rand(1,12);return{q:`${a}x = ${a*x}, x = ?`,ans:x,type:'Likning',hint:`Del pa ${a}`,sub:'eq1'};}else{const a=rand(2,6),x=rand(1,10),b=rand(1,15);return{q:`${a}x + ${b} = ${a*x+b}, x = ?`,ans:x,type:'Likning',hint:`Trekk fra ${b}, del pa ${a}`,sub:'eq2'};}},fb:fbEq},
      {id:'pow8',icon:'n2',bg:'rgba(255,217,61,.2)',name:'Potenser',desc:'Kvadrater, kuber og potenser',
        gen(g,id){const t=pick(['sq','cub','pot']);if(t==='sq'){const b=rand(2,12);return{q:`${b}^2 = ?`,ans:b*b,type:'Potens',hint:`${b} x ${b}`,sub:'sq'};}else if(t==='cub'){const b=rand(2,6);return{q:`${b}^3 = ?`,ans:b*b*b,type:'Potens',hint:`${b} x ${b} x ${b}`,sub:'cub'};}else{const b=rand(2,5),e=rand(2,4);return{q:`${b}^${e} = ?`,ans:Math.pow(b,e),type:'Potens',sub:'pot'};}},fb:fbPow},
      {id:'pct8',icon:'%',bg:'rgba(168,85,247,.2)',name:'Prosentregning',desc:'Prosentvis endring',
        gen(g,id){const t=pick(['of','inc','dec']);if(t==='of'){const p=pick([5,10,15,20,25,50]),base=rand(1,20)*20;return{q:`${p}% av ${base} = ?`,ans:r2(base*p/100),type:'Prosent',sub:`pct${p}`};}else if(t==='inc'){const p=pick([5,10,20,25]),base=rand(1,10)*100;return{q:`${base} okes med ${p}%. Nytt tall?`,ans:r2(base*(1+p/100)),type:'Prosent',hint:`${base} x ${1+p/100}`,sub:'pctinc'};}else{const p=pick([5,10,20,25]),base=rand(1,10)*100;return{q:`${base} reduseres med ${p}%. Nytt tall?`,ans:r2(base*(1-p/100)),type:'Prosent',hint:`${base} x ${1-p/100}`,sub:'pctdec'};}},fb:fbPct},
    ]},
  9:{c1:'#0f3460',c2:'#0b8793',badge:'rgba(11,135,147,.15)',tc:'#06d6ff',icon:'pyth',label:'Pythagoras, statistikk, algebra',
    topics:[
      {id:'pyth9',icon:'tri',bg:'rgba(6,214,255,.2)',name:'Pytagoras',desc:'Finn den manglende siden',
        gen(g,id){const t=[[3,4,5],[5,12,13],[6,8,10],[8,15,17],[9,12,15]];const[a,b,c]=pick(t);const k=rand(1,3);const s=pick(['c','a','b']);if(s==='c')return{q:`a=${a*k}, b=${b*k}, c=?`,ans:c*k,type:'Pytagoras',hint:'c^2 = a^2 + b^2',sub:'pyth_c'};if(s==='a')return{q:`b=${b*k}, c=${c*k}, a=?`,ans:a*k,type:'Pytagoras',hint:'a^2 = c^2 - b^2',sub:'pyth_a'};return{q:`a=${a*k}, c=${c*k}, b=?`,ans:b*k,type:'Pytagoras',hint:'b^2 = c^2 - a^2',sub:'pyth_b'};},fb:fbPyth},
      {id:'stat9',icon:'med',bg:'rgba(67,233,123,.2)',name:'Statistikk',desc:'Median, typetall og variasjonsbredde',
        gen(g,id){const t=pick(['median','mode','range']);const vals=Array.from({length:rand(4,7)},()=>rand(1,15));if(t==='median'){const s=[...vals].sort((a,b)=>a-b);const mid=Math.floor(s.length/2);const ans=s.length%2===0?r2((s[mid-1]+s[mid])/2):s[mid];return{q:`Median av: ${vals.join(', ')} = ?`,ans,type:'Statistikk',hint:'Sorter, finn midterste',sub:'median'};}else if(t==='mode'){const freq={};vals.forEach(v=>freq[v]=(freq[v]||0)+1);const maxF=Math.max(...Object.values(freq));const modes=Object.keys(freq).filter(k=>freq[k]===maxF).map(Number);return{q:`Typetall i: ${vals.join(', ')} = ?`,ans:modes[0],type:'Statistikk',sub:'mode'};}else{const mn=Math.min(...vals),mx=Math.max(...vals);return{q:`Variasjonsbredde av: ${vals.join(', ')} = ?`,ans:mx-mn,type:'Statistikk',hint:'Storst - minst',sub:'range'};}},fb:fbStat},
      {id:'alg9',icon:'x2',bg:'rgba(168,85,247,.2)',name:'Avansert algebra',desc:'Sammensatte likninger',
        gen(g,id){const t=pick(['sys','quad','expand']);if(t==='sys'){const x=rand(1,8),y=rand(1,8);return{q:`x+y=${x+y}, x-y=${x-y}, x=?`,ans:x,type:'Algebra',hint:'Legg likningene sammen',sub:'sys'};}else if(t==='quad'){const x=rand(1,8);return{q:`x^2 = ${x*x}, x=?`,ans:x,type:'Algebra',hint:'Ta kvadratroten',sub:'quad'};}else{const a=rand(2,6),b=rand(1,5),c=rand(1,5);return{q:`${a}(x+${b})=${a*c+a*b}, x=?`,ans:c,type:'Algebra',hint:'Distribuer, los for x',sub:'expand'};}},fb:fbAlg},
    ]},
  10:{c1:'#f7b733',c2:'#fc4a1a',badge:'rgba(247,183,51,.15)',tc:'#ffd93d',icon:'fx',label:'Funksjoner, trigonometri',
    topics:[
      {id:'func10',icon:'fx',bg:'rgba(255,217,61,.2)',name:'Funksjoner',desc:'Beregn funksjonsverdier',
        gen(g,id){const t=pick(['lin','quad','eval']);if(t==='lin'){const a=rand(1,5),b=rand(0,10),x=rand(1,8);return{q:`f(x)=${a}x+${b}, f(${x})=?`,ans:a*x+b,type:'Funksjon',hint:`Sett inn x=${x}`,sub:'func_lin'};}else if(t==='quad'){const a=rand(1,3),x=rand(1,5);return{q:`f(x)=${a}x^2, f(${x})=?`,ans:a*x*x,type:'Funksjon',sub:'func_quad'};}else{const a=rand(1,4),b=rand(1,6),x=rand(1,6);return{q:`g(x)=${a}x-${b}, g(${x})=?`,ans:a*x-b,type:'Funksjon',sub:'func_lin2'};}},fb:fbFunc},
      {id:'trig10',icon:'sin',bg:'rgba(6,214,255,.2)',name:'Trigonometri',desc:'sin, cos og tan for vanlige vinkler',
        gen(g,id){const known={0:{sin:0,cos:1,tan:0},30:{sin:0.5,cos:0.87,tan:0.58},45:{sin:0.71,cos:0.71,tan:1},60:{sin:0.87,cos:0.5,tan:1.73}};const deg=pick([0,30,45,60]);const fn=pick(['sin','cos','tan']);const ans=known[deg][fn];return{q:`${fn}(${deg}grader) = ?`,ans,type:'Trigonometri',hint:'Husk enhetssirkelen',sub:`trig_${fn}`};},fb:fbTrig},
      {id:'prob10',icon:'dice',bg:'rgba(168,85,247,.2)',name:'Sannsynlighet',desc:'Beregn enkel sannsynlighet',
        gen(g,id){const t=pick(['dice','bag','coin']);if(t==='dice'){const f=rand(1,5);return{q:`Terning: P(tall <= ${f}) = ?`,ans:r2(f/6),type:'Sannsynlighet',hint:`${f} av 6 utfall`,sub:'prob_dice'};}else if(t==='coin'){const n=rand(1,2);return{q:`Mynt x${n}: P(alle kron${n>1?'er':''}) = ?`,ans:r2(1/Math.pow(2,n)),type:'Sannsynlighet',sub:'prob_coin'};}else{const tot=rand(4,10),fav=rand(1,tot-1);return{q:`${tot} kuler, ${fav} rode. P(rod) = ?`,ans:r2(fav/tot),type:'Sannsynlighet',sub:'prob_bag'};}},fb:fbProb},
    ]},
};

// ============================================================
// FEEDBACK
// ============================================================
function fbAdd(q,g,c){const p=q.replace(' = ?','').split(/ \+ /);if(p.length!==2)return dflt(g,c);const[a,b]=[+p[0],+p[1]];if(Math.abs(g-c)===1)return`Naesten! ${a} + ${b} = <strong>${c}</strong>. Tell en gang til!`;return`Du svarte ${g}. ${a} + ${b} = <strong>${c}</strong>. Start pa ${a} og tell ${b} fremover.`;}
function fbSub(q,g,c){const p=q.replace(' = ?','').split(' - ');if(p.length!==2)return dflt(g,c);const[a,b]=[+p[0],+p[1]];if(g===a+b)return`Du la til i stedet for a trekke fra! ${a} - ${b} = <strong>${c}</strong>.`;return`Du svarte ${g}. ${a} - ${b} = <strong>${c}</strong>. Tell ned ${b} steg fra ${a}.`;}
function fbMul(q,g,c){const p=q.replace(' = ?','').split(' x ');if(p.length!==2)return dflt(g,c);const[a,b]=[+p[0],+p[1]];if(g===a+b)return`Du la til i stedet for a gange! ${a} x ${b} = <strong>${c}</strong>.`;return`Du svarte ${g}. ${a} x ${b} = <strong>${c}</strong>. ${b}-gangen: ${Array.from({length:10},(_,i)=>(i+1)*b).join(', ')}.`;}
function fbDiv(q,g,c){const p=q.replace(' = ?','').split(' / ');if(p.length!==2)return dflt(g,c);const[a,b]=[+p[0],+p[1]];return`Du svarte ${g}. Tenk: ${b} x <strong>${c}</strong> = ${a}.`;}
function fbFrac(q,g,c){const m=q.match(/av (\d+)/);if(!m)return dflt(g,c);const w=+m[1],d=Math.round(w/c);return`Du svarte ${g}. Del ${w} pa ${d}: ${w} / ${d} = <strong>${c}</strong>. Tenk pizza! 🍕`;}
function fbDec(q,g,c){return`Du svarte ${g}. Sett kommaene rett under hverandre. Svaret er <strong>${c}</strong>.`;}
function fbPct(q,g,c){return`Du svarte ${g}. Riktig er <strong>${c}</strong>. Husk: 10%=del pa 10, 50%=del pa 2, 25%=del pa 4.`;}
function fbRound(q,g,c){return`Du svarte ${g}. Riktig er <strong>${c}</strong>. 5 eller mer = rund opp. Under 5 = rund ned.`;}
function fbFrOp(q,g,c){return`Du svarte ${g}. Riktig er <strong>${c}</strong>. Finn fellesnevner, regn tellerne, forkort svaret.`;}
function fbGeo(q,g,c){return q.includes('Areal')?`Du svarte ${g}. Areal = l x b = <strong>${c}</strong>.`:`Du svarte ${g}. Omkrets = summen av alle sider = <strong>${c}</strong>.`;}
function fbNeg(q,g,c){return`Du svarte ${g}. Riktig er <strong>${c}</strong>. Pa tallinja: + gir hoyre, - gir venstre.`;}
function fbAlg(q,g,c){return`Du svarte ${g}. Riktig er <strong>${c}</strong>. Husk: gjor det samme pa begge sider av =!`;}
function fbRatio(q,g,c){return`Du svarte ${g}. Riktig er <strong>${c}</strong>. Multipliser begge ledd med samme faktor.`;}
function fbStat(q,g,c){if(q.includes('Snitt'))return`Du svarte ${g}. Riktig er <strong>${c}</strong>. Summer alle og del pa antallet.`;if(q.includes('Median'))return`Du svarte ${g}. Riktig er <strong>${c}</strong>. Sorter tallene og finn midtpunktet.`;return`Du svarte ${g}. Riktig er <strong>${c}</strong>.`;}
function fbEq(q,g,c){return`Du svarte ${g}. Riktig er <strong>${c}</strong>. Flytt tall (uten x) til hoyre, del pa x-koeffisienten.`;}
function fbPow(q,g,c){return`Du svarte ${g}. Riktig er <strong>${c}</strong>. Gang basen med seg selv eksponenten antall ganger.`;}
function fbPyth(q,g,c){return`Du svarte ${g}. Riktig er <strong>${c}</strong>. a^2 + b^2 = c^2. Bruk kladdebok!`;}
function fbFunc(q,g,c){return`Du svarte ${g}. Riktig er <strong>${c}</strong>. Sett inn x-verdien i funksjonsuttrykket steg for steg.`;}
function fbTrig(q,g,c){return`Du svarte ${g}. Riktig er <strong>${c}</strong>. Husk: sin(30)=0.5, cos(60)=0.5, sin(45)=cos(45)=0.71.`;}
function fbProb(q,g,c){return`Du svarte ${g}. Riktig er <strong>${c}</strong>. Sannsynlighet = gunstige / alle mulige utfall.`;}
function dflt(g,c){return`Du svarte ${g}. Riktig er <strong>${c}</strong>. Prøv igjen! 💪`;}

const CORRECT=[
  {t:'💥 RIKTIG!',m:'Du traff blink!'},
  {t:'⚡ PERFEKT!',m:'Du er ustoppelig!'},
  {t:'🔥 BINGO!',m:'Det hadde du full kontroll pa!'},
  {t:'✅ Riktig!',m:'Flink deg!'},
  {t:'🚀 SUPERT!',m:'Hjernen din er i topp form!'},
  {t:'🏆 BINGO!',m:'Mattehelt-materiell!'},
];

// ============================================================
// XP + PROGRESSION
// ============================================================
let prog=JSON.parse(localStorage.getItem('mh_prog3')||'{"xp":0,"coins":0,"streak":0,"lastDay":""}');
function saveProg(){localStorage.setItem('mh_prog3',JSON.stringify(prog));}
function lvlFor(l){return l*80;}
function curLvl(){let l=1,x=prog.xp;while(x>=lvlFor(l)){x-=lvlFor(l);l++;}return l;}
function xpInLvl(){let l=1,x=prog.xp;while(x>=lvlFor(l)){x-=lvlFor(l);l++;}return x;}
function renderHUD(){
  const l=curLvl(),pct=Math.round(xpInLvl()/lvlFor(l)*100);
  document.getElementById('hud-lvl').innerHTML=`⭐ Niva ${l} · <span id="hud-name">${getPlayer().name}</span>`;
  document.getElementById('hud-fill').style.width=pct+'%';
  document.getElementById('hud-coins').textContent=prog.coins;
  document.getElementById('hud-streak').textContent=prog.streak;
  document.getElementById('hud-char').textContent=getPlayer().emoji;
}
function getPlayer(){return JSON.parse(localStorage.getItem('mh_player')||'{"emoji":"🦸","name":"Helt"}');}

// ============================================================
// ACHIEVEMENTS
// ============================================================
const ACHIEVEMENTS={
  first_correct:{icon:'⚡',title:'Forste treff!',sub:'Du fikk ditt forste riktige svar'},
  streak5:{icon:'🔥',title:'Pa strak arm!',sub:'5 riktige pa rad'},
  streak10:{icon:'🌋',title:'USTOPPELIG!',sub:'10 riktige pa rad'},
  perfect:{icon:'💎',title:'Perfekt runde!',sub:'10 av 10 riktige'},
  lvlup:{icon:'⭐',title:'NIVA OPP!',sub:'Du er blitt sterkere!'},
  coins100:{icon:'🪙',title:'Pengesekken!',sub:'100 mynter samlet'},
};
let unlockedAchievements=JSON.parse(localStorage.getItem('mh_ach')||'{}');
function unlockAchievement(id){
  if(unlockedAchievements[id])return;
  unlockedAchievements[id]=Date.now();
  localStorage.setItem('mh_ach',JSON.stringify(unlockedAchievements));
  const a=ACHIEVEMENTS[id];if(!a)return;
  const t=document.getElementById('achieve-toast');
  document.getElementById('at-icon').textContent=a.icon;
  document.getElementById('at-title').textContent=a.title;
  document.getElementById('at-sub').textContent=a.sub;
  t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),3500);
}

// ============================================================
// PARTICLES
// ============================================================
function launch(n=50,cols=['#ffd93d','#00ff88','#06d6ff','#ff4466','#a855f7','#f093fb']){
  const w=document.getElementById('particles');w.innerHTML='';
  for(let i=0;i<n;i++){const el=document.createElement('div');el.className='particle';el.style.cssText=`left:${Math.random()*100}vw;top:-10px;width:${7+Math.random()*9}px;height:${7+Math.random()*9}px;background:${pick(cols)};border-radius:${Math.random()>.5?'50%':'4px'};animation-delay:${Math.random()*.6}s;animation-duration:${1.3+Math.random()}s;`;w.appendChild(el);}
  setTimeout(()=>w.innerHTML='',3e3);
}

// ============================================================
// SOUND
// ============================================================
let ac;
function ga(){if(!ac)ac=new(window.AudioContext||window.webkitAudioContext)();return ac;}
function tone(f,d,t='sine',v=.25){try{const c=ga(),o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);o.type=t;o.frequency.value=f;g.gain.setValueAtTime(v,c.currentTime);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+d);o.start();o.stop(c.currentTime+d);}catch(e){}}
function sndOk(){tone(523,.08);setTimeout(()=>tone(659,.08),70);setTimeout(()=>tone(784,.15),140);}
function sndCombo(){tone(880,.08);setTimeout(()=>tone(1046,.15),70);}
function sndBad(){tone(280,.12,'sawtooth',.15);setTimeout(()=>tone(180,.15,'sawtooth',.15),120);}
function sndLvl(){[523,587,659,698,784,880,1046].forEach((f,i)=>setTimeout(()=>tone(f,.1,'sine',.2),i*60));}

// ============================================================
// HELPERS
// ============================================================
function showScreen(n){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  const el=document.getElementById('screen-'+n);el.classList.add('active');
  el.scrollTop=0;window.scrollTo(0,0);
}
function setSpeech(txt,show=true){
  const s=document.getElementById('speech');
  s.textContent=txt;
  s.classList.toggle('show',show);
  if(show){clearTimeout(s._t);s._t=setTimeout(()=>s.classList.remove('show'),2500);}
}

// ============================================================
// GAME STATE
// ============================================================
let S={grade:null,topicId:null,topic:null,questions:[],idx:0,score:0,streak:0,combo:0,current:null,answered:false,enemyHp:100,playerHp:100};
const TQ=10;

function startGame(g,topicId){
  const gd=CUR[g],topic=gd.topics.find(t=>t.id===topicId);
  S={grade:g,topicId,topic,questions:[],idx:0,score:0,streak:0,combo:0,current:null,answered:false,enemyHp:100,playerHp:100};
  const p=getPlayer();
  document.getElementById('player-avatar').textContent=p.emoji;
  document.getElementById('player-name').textContent=p.name;
  document.getElementById('enemy-avatar').textContent=ENEMIES[g]||'👾';
  document.getElementById('enemy-name').textContent=pick(['Tallmonsteret','Brøk-trollet','Gange-demonen','Divisjonsormen','Algebra-trollet'])+' Lvl '+g;
  document.getElementById('player-hp').style.width='100%';
  document.getElementById('enemy-hp').style.width='100%';
  const qc=document.getElementById('q-card');
  qc.style.setProperty('--qc1',gd.c1);
  qc.style.setProperty('--qc2',gd.c2);
  buildNumpad(g);
  setSpeech('Klar til kamp? ⚔️',true);
  loadQuestion();
  renderHUD();
  showScreen('game');
}
function retrySession(){startGame(S.grade,S.topicId);}

function buildNumpad(g){
  const pad=document.getElementById('numpad');pad.innerHTML='';
  const showDot=g>=5;
  const keys=showDot?[7,8,9,'del',4,5,6,'neg',1,2,3,0,'.',null]:[7,8,9,'del',4,5,6,'neg',1,2,3,0];
  keys.forEach(v=>{
    if(v===null){pad.appendChild(document.createElement('div'));return;}
    const btn=document.createElement('button');
    if(v==='del'){btn.textContent='⌫';btn.className='n-del';btn.onclick=()=>{if(!S.answered)document.getElementById('ans-input').value=document.getElementById('ans-input').value.slice(0,-1);};}
    else if(v==='neg'){btn.textContent='±';btn.className='n-neg';btn.onclick=()=>{if(!S.answered){const i=document.getElementById('ans-input');i.value=i.value.startsWith('-')?i.value.slice(1):'-'+i.value;}};}
    else if(v==='.'){btn.textContent=',';btn.className='n-dot';btn.onclick=()=>{if(!S.answered){const i=document.getElementById('ans-input');if(!i.value.includes('.'))i.value+='.';}};}
    else{btn.textContent=v;btn.onclick=()=>{if(!S.answered)document.getElementById('ans-input').value+=v;};}
    pad.appendChild(btn);
  });
}

function loadQuestion(){
  const qd=S.topic.gen(S.grade,S.topicId);
  S.current=qd;S.answered=false;
  document.getElementById('q-cat').textContent=qd.type||'';
  const qt=document.getElementById('q-txt');
  qt.textContent=qd.q;qt.style.animation='none';void qt.offsetWidth;qt.style.animation='';
  document.getElementById('q-hint').textContent=qd.hint||'';
  const inp=document.getElementById('ans-input');
  inp.value='';inp.className='ans-input';inp.disabled=false;inp.focus();
  document.getElementById('sub-btn').disabled=false;
  document.getElementById('fb-box').className='fb-box';
  document.getElementById('fb-box').innerHTML='';
  document.getElementById('next-btn').style.display='none';
  document.getElementById('numpad').style.display='grid';
  updateBattleProg();
}

function updateBattleProg(){
  document.getElementById('prog-fill').style.width=(S.idx/TQ*100)+'%';
  document.getElementById('prog-label').textContent=`Sporsmal ${Math.min(S.idx+1,TQ)} av ${TQ}`;
  document.getElementById('score-label').textContent=`${S.score} riktige`;
  const cb=document.getElementById('combo-badge');
  document.getElementById('combo-num').textContent=S.combo;
  cb.classList.toggle('hot',S.combo>=3);
}

document.getElementById('ans-input').addEventListener('keydown',e=>{
  if(e.key==='Enter'){if(S.answered)handleNext();else submitAnswer();}
});

function submitAnswer(){
  const raw=document.getElementById('ans-input').value.trim();
  if(raw==='')return;
  const given=parseFloat(raw.replace(',','.')),correct=S.current.ans;
  const inp=document.getElementById('ans-input'),fb=document.getElementById('fb-box');
  S.answered=true;S.idx++;
  inp.disabled=true;document.getElementById('sub-btn').disabled=true;
  const ok=Math.abs(given-correct)<0.01;
  S.questions.push({q:S.current.q,given,correct,ok,sub:S.current.sub||'?'});
  recordAttempt(S.grade,S.topicId,S.current.sub||'_',ok);

  if(ok){
    S.score++;S.streak++;S.combo++;
    inp.className='ans-input correct';
    fb.className='fb-box correct';
    const ph=pick(CORRECT);
    fb.innerHTML=`<div class="fb-title">${ph.t}</div>${ph.m}`;
    sndOk();
    // Enemy takes damage
    S.enemyHp=Math.max(0,S.enemyHp-(8+S.combo*2));
    document.getElementById('enemy-hp').style.width=S.enemyHp+'%';
    document.getElementById('enemy-avatar').classList.add('hit');
    setTimeout(()=>document.getElementById('enemy-avatar').classList.remove('hit'),500);
    launch(S.combo>=3?80:40);
    // Combo flash
    if(S.combo>=3){
      sndCombo();
      const cf=document.getElementById('combo-flash');
      cf.innerHTML=`<div class="combo-txt">${S.combo}x COMBO!</div>`;
      setTimeout(()=>cf.innerHTML='',900);
    }
    // Speeches
    const speeches=S.combo>=5?['LEGENDE! 🏆','COMBO x'+S.combo+'! 🔥','USTOPPELIG! ⚡']:['Riktig! 💥','Godt treff! ⚔️','Matematikk-mester! 🌟'];
    setSpeech(pick(speeches));
    document.getElementById('player-avatar').classList.add('happy');
    setTimeout(()=>document.getElementById('player-avatar').classList.remove('happy'),600);
    // XP & coins
    const xpG=10+(S.combo>=3?8:0)+(S.combo>=5?5:0);
    const oldL=curLvl();
    prog.xp+=xpG;prog.coins+=1;saveProg();renderHUD();
    if(curLvl()>oldL){sndLvl();launch(100);unlockAchievement('lvlup');}
    if(prog.coins>=100)unlockAchievement('coins100');
    if(S.streak===1&&!unlockedAchievements.first_correct)unlockAchievement('first_correct');
    if(S.streak===5)unlockAchievement('streak5');
    if(S.combo===10)unlockAchievement('streak10');
  }else{
    S.streak=0;S.combo=0;
    inp.className='ans-input wrong';
    fb.className='fb-box wrong';
    fb.innerHTML=`<div class="fb-title">Ikke helt riktig 🛡️</div>${S.topic.fb(S.current.q,given,correct)}`;
    sndBad();
    // Player takes damage
    S.playerHp=Math.max(10,S.playerHp-8);
    document.getElementById('player-hp').style.width=S.playerHp+'%';
    document.getElementById('player-avatar').classList.add('sad');
    setTimeout(()=>document.getElementById('player-avatar').classList.remove('sad'),500);
    setSpeech(pick(['Ikke gi opp! 💪','Prøv igjen! 🛡️','Du klarer det!']));
  }
  document.getElementById('numpad').style.display='none';
  updateBattleProg();
  const nb=document.getElementById('next-btn');
  nb.textContent=S.idx>=TQ?'Se resultat 🏁':'Neste →';
  nb.style.display='block';
}

function handleNext(){if(S.idx>=TQ)showChest();else loadQuestion();}

// ============================================================
// CHEST + RESULTS
// ============================================================
function showChest(){
  const pct=S.score/TQ;
  const xpEarned=S.score*10+(pct>=1?50:pct>=.8?20:0);
  const coinsEarned=S.score+(pct>=1?5:0);
  const stars=Math.ceil(pct*3);
  let emoji,title,sub;
  if(pct===1){emoji='💎';title='PERFEKT SEIER!';sub='Du er en legende!';}
  else if(pct>=.8){emoji='🏆';title='Stor seier!';sub='Nesten perfekt!';}
  else if(pct>=.5){emoji='⚔️';title='Bra kamp!';sub='Øv mer og kom sterkere tilbake!';}
  else{emoji='🛡️';title='Tap — men du lærte!';sub='Prøv igjen, du blir sterkere!';}
  document.getElementById('chest-emoji').textContent=emoji;
  document.getElementById('chest-title').textContent=title;
  document.getElementById('chest-sub').textContent=sub;
  document.getElementById('chest-rewards').innerHTML=`
    <div class="chest-reward"><span class="chest-reward-icon">⭐</span><div class="chest-reward-val">${'⭐'.repeat(stars)}</div></div>
    <div class="chest-reward"><span class="chest-reward-icon">✨</span><div class="chest-reward-val">+${xpEarned} XP</div></div>
    <div class="chest-reward"><span class="chest-reward-icon">🪙</span><div class="chest-reward-val">+${coinsEarned}</div></div>
  `;
  prog.xp+=xpEarned;prog.coins+=coinsEarned;saveProg();renderHUD();
  document.getElementById('chest-overlay').classList.add('show');
  launch(pct>=.8?120:60);
  if(pct===1)unlockAchievement('perfect');
}

function closeChest(){
  document.getElementById('chest-overlay').classList.remove('show');
  buildResults();
  showScreen('results');
}

function buildResults(){
  const pct=S.score/TQ;
  let mascot,title,sub;
  if(pct===1){mascot='💎';title='PERFEKT! 10 av 10!';sub='Du er en ekte mattehelt!';}
  else if(pct>=.8){mascot='🏆';title='Kjempebra!';sub='Nesten perfekt!';}
  else if(pct>=.6){mascot='⚔️';title='Bra kamp!';sub='Øv litt mer, du klarer det!';}
  else if(pct>=.4){mascot='🛡️';title='Ikke gi opp!';sub='Prøv igjen — du laerer!';}
  else{mascot='📚';title='Øv og prøv igjen!';sub='Slik laerer vi — hold ut!';}
  const stars=Math.ceil(pct*3);
  document.getElementById('res-mascot').textContent=mascot;
  document.getElementById('res-title').textContent=title;
  document.getElementById('res-sub').textContent=sub;
  document.getElementById('res-stars').textContent='⭐'.repeat(stars)+'☆'.repeat(3-stars);
  document.getElementById('res-num').textContent=S.score;
  document.getElementById('res-ring').style.background=`conic-gradient(#00ff88 ${Math.round(pct*360)}deg,rgba(255,255,255,.1) 0)`;
  // Adapt section
  const errs={};S.questions.forEach(q=>{if(!q.ok)errs[q.sub]=(errs[q.sub]||0)+1;});
  const subs=Object.entries(errs).sort((a,b)=>b[1]-a[1]);
  const as=document.getElementById('adapt-sec');
  if(!subs.length){as.innerHTML='<div style="font-family:Fredoka One,cursive;font-size:.9rem;color:var(--green)">Ingen svake punkter denne runden!</div>';}
  else{let h='<div class="adapt-title">Disse oyves ekstra neste gang:</div>';subs.slice(0,3).forEach(([sub,n])=>{const p=Math.round(n/S.questions.filter(q=>q.sub===sub).length*100);h+=`<div class="adapt-row"><span style="min-width:80px;font-size:.75rem">${fmtSub(sub)}</span><div class="adapt-bar-wrap"><div class="adapt-bar" style="width:${p}%;background:${p>60?'var(--red)':p>30?'var(--gold)':'var(--green)'}"></div></div><span style="min-width:34px;text-align:right;font-size:.73rem">${n} feil</span></div>`;});as.innerHTML=h;}
  // Rows
  const rows=document.getElementById('res-rows');rows.innerHTML='';
  S.questions.forEach(q=>{const d=document.createElement('div');d.className='rb-row '+(q.ok?'ok':'bad');d.innerHTML=`<span class="rb-q">${q.q.replace(' = ?','').replace(' x = ?','')}</span><span class="rb-a ${q.ok?'ok':'bad'}">${q.ok?`= ${q.correct} ✓`:`${q.given} ✗ (${q.correct})`}</span>`;rows.appendChild(d);});
  saveHS();renderHS();
}

function fmtSub(s){if(s.startsWith('x'))return`${s.slice(1)}-gangen`;if(s.startsWith('d'))return`Del med ${s.slice(1)}`;if(s==='1/2'||s==='1/4'||s==='1/3')return`Brok ${s}`;if(s==='alg+')return'Algebra +';if(s==='alg-')return'Algebra -';if(s.startsWith('pct'))return`Prosent ${s.slice(3)}%`;if(s==='eq1')return'Likning ax=b';if(s==='sq')return'Kvadrat n^2';if(s.startsWith('geo'))return'Geometri';if(s==='median')return'Median';if(s==='avg')return'Gjennomsnitt';if(s.startsWith('trig'))return`Trig ${s.split('_')[1]}`;if(s.startsWith('func'))return'Funksjon';if(s.startsWith('prob'))return'Sannsynlighet';return s;}
function saveHS(){const k=`hs_${S.grade}_${S.topicId}`;const p=JSON.parse(localStorage.getItem(k)||'[]');p.push({score:S.score,date:new Date().toLocaleDateString('no-NO')});p.sort((a,b)=>b.score-a.score);localStorage.setItem(k,JSON.stringify(p.slice(0,5)));}
function renderHS(){const k=`hs_${S.grade}_${S.topicId}`;const s=JSON.parse(localStorage.getItem(k)||'[]');const medals=['🥇','🥈','🥉','4️⃣','5️⃣'];document.getElementById('hs-rows').innerHTML=s.length?s.map((s,i)=>`<div class="hs-row"><span>${medals[i]} ${s.date}</span><span class="hs-score">${s.score}/10</span></div>`).join(''):'Ingen rekorder ennå!';}

// ============================================================
// PARENT REPORT
// ============================================================
function showParentReport(){
  const pct=S.score/TQ,stars=Math.ceil(pct*3);
  document.getElementById('pr-date').textContent=new Date().toLocaleDateString('no-NO',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
  document.getElementById('pr-topic-name').textContent=S.topic.name;
  document.getElementById('pr-grade-name').textContent=`${S.grade}. klasse`;
  document.getElementById('pr-correct').textContent=S.score;
  document.getElementById('pr-wrong').textContent=TQ-S.score;
  document.getElementById('pr-pct').textContent=Math.round(pct*100)+'%';
  document.getElementById('pr-stars').textContent='⭐'.repeat(stars)+'☆'.repeat(3-stars);
  const ok=S.questions.filter(q=>q.ok),bad=S.questions.filter(q=>!q.ok);
  document.getElementById('pr-strengths').innerHTML=ok.length?`<div class="pr-strength">Riktig pa ${ok.length} av ${TQ} oppgaver i "${S.topic.name}"</div>`:
    '<div class="pr-weakness">Ingen riktige denne runden</div>';
  const subE={};bad.forEach(q=>subE[q.sub]=(subE[q.sub]||0)+1);
  document.getElementById('pr-weaknesses').innerHTML=Object.entries(subE).sort((a,b)=>b[1]-a[1]).map(([s,n])=>`<div class="pr-weakness">${fmtSub(s)}: ${n} feil</div>`).join('')||'<div class="pr-strength">Ingen svake punkter!</div>';
  document.getElementById('pr-breakdown').innerHTML=S.questions.map((q,i)=>`<div class="pr-qrow"><span>${i+1}. ${q.q.replace(' = ?','')}</span><span style="color:${q.ok?'var(--green)':'var(--red)'};font-weight:800">${q.ok?`= ${q.correct} ✓`:`${q.given} ✗ (${q.correct})`}</span></div>`).join('');
  const rec=document.getElementById('pr-rec');
  if(pct===1)rec.textContent='Perfekt resultat! Gå videre til neste tema eller klassetrinn.';
  else if(pct>=.8)rec.textContent='Veldig bra! Noen runder til for å befeste kunnskapen, deretter videre.';
  else{const tw=bad.length?fmtSub(bad[0].sub):'noen oppgaver';rec.innerHTML=`Spillet gir ekstra trening pa <strong>${tw}</strong> automatisk. 10 min om dagen gir stor fremgang!`;}
  showScreen('parent');
}

// ============================================================
// LEARN GUIDES
// ============================================================
function dots(n,color,delay=0){return Array.from({length:n},(_,i)=>`<div class="dot" style="background:${color};animation-delay:${delay+i*40}ms"></div>`).join('');}
function dotGroup(n,color,delay=0){return `<div class="dot-group">${dots(n,color,delay)}</div>`;}
function numLine(from,to,jump,start){
  const total=to-from,w=280;
  let html=`<div class="nline-wrap"><div class="nline" style="min-width:${w+20}px"><div class="nline-track"></div>`;
  for(let i=from;i<=to;i++){const x=10+(i-from)/total*w;html+=`<div class="nline-tick" style="left:${x}px"></div><div class="nline-num" style="left:${x}px">${i}</div>`;}
  html+=`<div class="nline-dot" style="left:${10+(start-from)/total*w}px"></div>`;
  if(jump>0){const x1=10+(start-from)/total*w,x2=10+(start+jump-from)/total*w;html+=`<div class="nline-arrow" style="left:${x1}px;--w:${x2-x1}px"></div>`;}
  return html+'</div></div>';
}
function fracBar(num,den,color='#7c3aed'){
  return `<div class="frac-bar">${Array.from({length:den},(_,i)=>`<div class="frac-seg ${i<num?'filled':'empty'}" style="background:${color}"></div>`).join('')}</div><div style="text-align:center;margin-top:6px;font-family:'Fredoka One',cursive;font-size:.9rem;color:var(--white)">${num}/${den} er uthevet</div>`;
}
function mulGridLabel(rows,cols,color='#00ff88'){
  let h=`<div class="mul-grid" style="grid-template-columns:repeat(${cols},26px)">`;
  for(let r=0;r<rows;r++)for(let c=0;c<cols;c++)h+=`<div class="mul-cell" style="background:${color}22;border:1px solid ${color}44;animation-delay:${(r*cols+c)*30}ms">●</div>`;
  return h+`</div><div style="text-align:center;margin-top:8px;font-family:'Fredoka One',cursive;font-size:.9rem;color:var(--muted)">${rows} x ${cols} = ${rows*cols}</div>`;
}
function workedEx(steps){
  return `<div class="worked">${steps.map(([txt,ann,hl],i)=>`<div class="step ${hl?'hl':''}" style="animation-delay:${i*200}ms"><span>${txt}</span>${ann?`<span class="ann">${ann}</span>`:''}</div>`).join('')}</div>`;
}
function eqBox(txt){return `<div class="eq-box">${txt}</div>`;}

const LEARN_GUIDES={
  add10:[
    {icon:'➕',title:'Hva er addisjon?',text:'Addisjon betyr a slå sammen to grupper. Vi bruker plusstegnet +.',
     visual:`<div class="dot-groups">${dotGroup(3,'#7c3aed')} <span class="dot-op">+</span> ${dotGroup(2,'#a855f7')} <span class="dot-eq">=</span> ${dotGroup(5,'#00ff88',200)}</div><div style="margin-top:10px;font-family:'Fredoka One',cursive;font-size:1.1rem">3 + 2 = 5</div>`},
    {icon:'📏',title:'Bruk tallinja',text:'Start pa det forste tallet og hopp fremover like mange steg.',
     visual:numLine(0,10,3,4)+`<div style="text-align:center;margin-top:8px;font-family:'Fredoka One',cursive">4 + 3: Start pa 4, hopp 3 → <span style="color:var(--cyan)">7</span></div>`},
    {icon:'🎯',title:'Steg for steg',text:'',
     visual:workedEx([['6 + 4 = ?','',false],['Begynn pa 6','',false],['7, 8, 9, 10','(tell 4 fremover)',true],['6 + 4 = 10 ✓','',false]])}
  ],
  sub10:[
    {icon:'➖',title:'Hva er subtraksjon?',text:'Subtraksjon betyr a ta bort. Vi bruker minustegnet -.',
     visual:`<div class="dot-groups">${dotGroup(5,'#7c3aed')} <span class="dot-op">-</span> <span style="font-size:1.2rem;font-weight:800;color:var(--red)">2</span> <span class="dot-eq">=</span> ${dotGroup(3,'#7c3aed',200)}</div><div style="margin-top:10px;font-family:'Fredoka One',cursive">5 - 2 = 3</div>`},
    {icon:'📏',title:'Tell bakover pa tallinja',text:'Start pa det store tallet og hopp bakover.',
     visual:numLine(0,10,-3,7)+`<div style="text-align:center;margin-top:8px;font-family:'Fredoka One',cursive">7 - 3 = <span style="color:var(--cyan)">4</span></div>`},
    {icon:'🎯',title:'Steg for steg: 8 - 5',text:'',
     visual:workedEx([['8 - 5 = ?','',false],['Start pa 8','',false],['7, 6, 5, 4, 3','(tell 5 bakover)',true],['8 - 5 = 3 ✓','',false]])}
  ],
  add20:[
    {icon:'🔟',title:'Del opp tallene',text:'Del opp i tiere og enere. Legg sa tiere for seg og enere for seg.',
     visual:workedEx([['13 + 5 = ?','',false],['= (10+3) + 5','(del opp 13)',true],['= 10 + (3+5)','(grupper enere)',true],['= 10 + 8 = 18 ✓','',false]])}
  ],
  add100:[
    {icon:'✂️',title:'Del opp og legg sammen',text:'Del opp begge tallene i tiere og enere.',
     visual:workedEx([['34 + 25 = ?','',false],['= (30+4) + (20+5)','(del opp)',true],['= (30+20) + (4+5)','(grupper)',true],['= 50 + 9 = 59 ✓','',false]])}
  ],
  sub100:[
    {icon:'🔄',title:'Lan fra tieren',text:'Hvis enerne er for sma, lan en tier og gjor den om til 10 enere.',
     visual:workedEx([['52 - 17 = ?','',false],['Ener: 2-7 gar ikke!','',false],['Lan en tier: 12-7=5','(52 → 40+12)',true],['Tier: 40-10=30','',true],['= 35 ✓','',false]])}
  ],
  mul25:[
    {icon:'✖️',title:'Hva er ganging?',text:'Ganging er gjentatt addisjon. 3 x 4 = 4 + 4 + 4 = 12.',
     visual:`<div style="display:flex;flex-direction:column;align-items:center;gap:6px">${[0,1,2].map(i=>`<div style="display:flex;gap:4px">${dots(4,['#7c3aed','#a855f7','#06d6ff'][i],i*100)}</div>`).join('')}</div><div style="margin-top:8px;font-family:'Fredoka One',cursive">3 x 4 = 12</div>`},
    {icon:'⭐',title:'2-gangen, 5-gangen og 10-gangen',text:'5-gangen slutter alltid pa 0 eller 5. 10-gangen: bare legg til en 0!',
     visual:`<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px">${[2,5,10].map(t=>`<div><div style="font-family:'Fredoka One',cursive;font-size:.85rem;color:var(--gold);margin-bottom:4px">${t}-gangen</div>${[1,2,3,4].map(n=>`<div style="font-size:.8rem;font-weight:800;color:var(--white)">${n}x${t}=${n*t}</div>`).join('')}</div>`).join('')}</div>`},
    {icon:'🎯',title:'Prøv 4 x 5',text:'',
     visual:workedEx([['4 x 5 = ?','',false],['= 5+5+5+5','(fire 5-ere)',true],['= 10+10','',true],['= 20 ✓','',false]])}
  ],
  mul15:[
    {icon:'📋',title:'Gangetabellen 1-5',text:'Det er et fast monster. La oss lære!',
     visual:mulGridLabel(3,4,'#00ff88')},
    {icon:'🔢',title:'3-gangen',text:'Tell opp i tresteg: 3, 6, 9, 12, 15...',
     visual:`<div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center">${[1,2,3,4,5].map(n=>`<div style="background:rgba(0,255,136,.1);border:1px solid rgba(0,255,136,.3);border-radius:8px;padding:5px 10px;font-family:'Fredoka One',cursive;font-size:.9rem">${n}x3=${n*3}</div>`).join('')}</div>`},
    {icon:'🎯',title:'Prøv 4 x 4',text:'',
     visual:workedEx([['4 x 4 = ?','',false],['4+4+4+4','(fire 4-ere)',true],['= 16 ✓','',false]])}
  ],
  div25:[
    {icon:'➗',title:'Divisjon = omvendt ganging',text:'12 / 3 = ? Tenk: ? x 3 = 12',
     visual:workedEx([['20 / 5 = ?','',false],['Tenk: ? x 5 = 20','(snu om!)',true],['4 x 5 = 20 ✓','',false],['20 / 5 = 4 ✓','',false]])}
  ],
  mul110:[
    {icon:'📋',title:'Gangetabellen 1-10',text:'De vanskeligste: 6x7, 6x8, 7x8, 6x9, 7x9, 8x9',
     visual:`<div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center">${[[6,7],[6,8],[7,8],[6,9],[7,9],[8,9]].map(([a,b])=>`<div style="background:rgba(168,85,247,.15);border:1px solid rgba(168,85,247,.3);border-radius:8px;padding:6px 12px;font-family:'Fredoka One',cursive;font-size:.9rem">${a}x${b}=${a*b}</div>`).join('')}</div>`},
    {icon:'🧠',title:'Triks: del opp',text:'8 x 7 = 8x5 + 8x2 = 40+16 = 56',
     visual:workedEx([['8 x 7 = ?','',false],['= 8x5 + 8x2','(del opp 7)',true],['= 40 + 16','',false],['= 56 ✓','',false]])}
  ],
  div110:[
    {icon:'➗',title:'Divisjon med gangetabellen',text:'Kjenner du gangetabellen? Da kan du dele alle tall!',
     visual:workedEx([['56 / 7 = ?','',false],['Tenk: ? x 7 = 56','',true],['8 x 7 = 56','',true],['= 8 ✓','',false]])}
  ],
  frac4:[
    {icon:'🍕',title:'Hva er en brok?',text:'En brok viser deler av en helhet. 1/4 = en av fire like deler.',
     visual:`<div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap">${[[1,2,'#7c3aed'],[1,4,'#a855f7'],[1,3,'#06d6ff']].map(([n,d,c])=>`<div style="text-align:center"><div style="margin-bottom:6px">${fracBar(n,d,c)}</div></div>`).join('')}</div>`},
    {icon:'📐',title:'Finn brok av et tall',text:'1/2 = del pa 2. 1/4 = del pa 4. 1/3 = del pa 3.',
     visual:workedEx([['1/4 av 20 = ?','',false],['Del 20 pa 4','(nevner=4)',true],['20 / 4 = 5','',false],['= 5 ✓','',false]])}
  ],
  dec5:[
    {icon:'.',title:'Desimaltall',text:'Komma skiller hele tall fra deler. Sett komma rett under komma!',
     visual:`<div style="font-family:'Fredoka One',cursive;font-size:1.1rem;text-align:right;background:rgba(255,255,255,.05);border-radius:10px;padding:12px 20px;border:1px solid rgba(255,255,255,.1)"><div>3<span style="color:var(--red)">.</span>4</div><div>+ 2<span style="color:var(--red)">.</span>1</div><div style="border-top:1px solid rgba(255,255,255,.2);margin-top:4px">5<span style="color:var(--red)">.</span>5 ✓</div></div>`},
    {icon:'🎯',title:'Prøv 4.6 + 2.3',text:'',
     visual:workedEx([['4.6 + 2.3 = ?','',false],['Enere: 4+2=6','',false],['Tideler: 6+3=9','',false],['= 6.9 ✓','',false]])}
  ],
  pct5:[
    {icon:'%',title:'Hva er prosent?',text:'Prosent = per hundre. 50% = halvparten. 10% = del pa 10.',
     visual:`<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">${[[50,'Halvparten','#7c3aed'],[25,'En kvart','#a855f7'],[10,'En tidel','#06d6ff']].map(([p,n,c])=>`<div style="text-align:center"><div class="frac-bar" style="max-width:80px">${Array.from({length:10},(_,i)=>`<div class="frac-seg ${i<p/10?'filled':'empty'}" style="background:${c}"></div>`).join('')}</div><div style="font-family:'Fredoka One',cursive;font-size:.82rem;margin-top:4px">${p}% = ${n}</div></div>`).join('')}</div>`},
    {icon:'🎯',title:'Prøv 10% av 350',text:'',
     visual:workedEx([['10% av 350','',false],['10% = del pa 10','',true],['350/10 = 35 ✓','',false]])}
  ],
  round5:[
    {icon:'~',title:'Avrunding',text:'Se pa neste siffer: 5 eller over = rund opp. Under 5 = rund ned.',
     visual:workedEx([['Rund av 3.7','',false],['Tidelen er 7','',false],['7 >= 5 → rund OPP','',true],['= 4 ✓','',false]])}
  ],
  alg7:[
    {icon:'x=',title:'Algebra: finn x',text:'x er det ukjente tallet. Vi loser "gaten" om hva x er.',
     visual:eqBox('x + 5 = 12 → x = ?')},
    {icon:'⚖️',title:'Vektprinsippet',text:'Gjor det samme pa begge sider av = tegnet!',
     visual:workedEx([['x + 5 = 12','',false],['Trekk fra 5 pa begge sider','',true],['x = 12 - 5 = 7 ✓','',false]])}
  ],
  eq8:[
    {icon:'=',title:'Lineaere likninger',text:'Flytt tall (uten x) til hoyre. Del pa x-koeffisienten.',
     visual:workedEx([['2x + 3 = 11','',false],['2x = 11 - 3 = 8','(flytt 3)',true],['x = 8 / 2 = 4 ✓','(del pa 2)',true]])}
  ],
  pow8:[
    {icon:'n2',title:'Potenser',text:'3^2 = 3x3 = 9. Eksponenten sier hvor mange ganger vi ganger.',
     visual:`<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">${[[2,2],[2,3],[3,2],[4,2]].map(([b,e])=>`<div style="background:rgba(255,217,61,.1);border:1px solid rgba(255,217,61,.3);border-radius:8px;padding:6px 12px;font-family:'Fredoka One',cursive">${b}^${e} = ${Math.pow(b,e)}</div>`).join('')}</div>`}
  ],
  pyth9:[
    {icon:'tri',title:'Pytagoras',text:'I en rettvinklet trekant: a^2 + b^2 = c^2',
     visual:`<div style="text-align:center"><div style="font-family:'Fredoka One',cursive;font-size:1.3rem;color:var(--cyan)">a^2 + b^2 = c^2</div><div style="font-size:3rem;margin:10px 0">📐</div></div>`},
    {icon:'🎯',title:'a=3, b=4 → c=?',text:'',
     visual:workedEx([['c^2 = 3^2 + 4^2','',false],['= 9 + 16 = 25','',true],['c = √25 = 5 ✓','',false]])}
  ],
  func10:[
    {icon:'fx',title:'Funksjoner',text:'f(x) er en maskin: gi inn x, fa ut et tall.',
     visual:`<div style="font-family:'Fredoka One',cursive;text-align:center"><div style="font-size:1.1rem;margin-bottom:10px">f(x) = 2x + 3</div><div style="display:flex;gap:6px;justify-content:center;flex-wrap:wrap">${[1,2,3,4].map(x=>`<div style="background:rgba(255,217,61,.1);border:1px solid rgba(255,217,61,.3);border-radius:8px;padding:5px 10px;font-size:.88rem">f(${x})=${2*x+3}</div>`).join('')}</div></div>`},
    {icon:'🎯',title:'Prøv f(x)=3x-2, f(4)=?',text:'',
     visual:workedEx([['f(4) = 3x4 - 2','',false],['= 12 - 2','',false],['= 10 ✓','',false]])}
  ],
};

// ============================================================
// LEARN NAVIGATION
// ============================================================
let learnState={grade:null,topicId:null,steps:[],idx:0};

function showLearn(grade,topicId){
  const gd=CUR[grade],topic=gd.topics.find(t=>t.id===topicId);
  const steps=LEARN_GUIDES[topicId];
  if(!steps||!steps.length){alert('Guide for dette temaet kommer snart!');return;}
  learnState={grade,topicId,steps,idx:0};
  document.getElementById('learn-topic-name').textContent=topic.name;
  buildLearnDots();
  renderLearnStep();
  showScreen('learn');
}

function buildLearnDots(){
  document.getElementById('learn-dots').innerHTML=learnState.steps.map((_,i)=>`<div class="learn-dot" id="ldot${i}"></div>`).join('');
}

function renderLearnStep(){
  const {steps,idx}=learnState;
  const step=steps[idx];
  const body=document.getElementById('learn-body');
  body.style.opacity='0';
  setTimeout(()=>{
    document.getElementById('learn-step-lbl').textContent=`Steg ${idx+1} av ${steps.length}`;
    document.getElementById('learn-icon').textContent=step.icon;
    document.getElementById('learn-title').textContent=step.title;
    document.getElementById('learn-text').innerHTML=step.text;
    document.getElementById('learn-visual').innerHTML=step.visual||'';
    steps.forEach((_,i)=>{
      const d=document.getElementById(`ldot${i}`);
      d.className='learn-dot'+(i<idx?' done':i===idx?' active':'');
    });
    const nb=document.getElementById('learn-next');
    nb.textContent=idx>=steps.length-1?'🚀 Prøv nå!':'Neste →';
    nb.className='learn-next'+(idx>=steps.length-1?' finish':'');
    document.getElementById('learn-prev').style.display=idx>0?'block':'none';
    body.style.transition='opacity .25s';
    body.style.opacity='1';
  },100);
}

function learnNext(){
  if(learnState.idx>=learnState.steps.length-1)startGame(learnState.grade,learnState.topicId);
  else{learnState.idx++;renderLearnStep();}
}
function learnPrev(){if(learnState.idx>0){learnState.idx--;renderLearnStep();}}

// ============================================================
// INIT
// ============================================================
buildCharGrid();
buildWorldList();
const savedPlayer=localStorage.getItem('mh_player');
if(savedPlayer){
  applyPlayer(JSON.parse(savedPlayer));
  showScreen('grades');
}
renderHUD();
