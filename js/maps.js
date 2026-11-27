// Mattehelten – Klassekart og temakart
// Alle js-filer deler globalt navnerom (vanlige <script>-tagger i fast rekkefølge, se index.html).

// ============================================================
// GRADE MAP (10 individual grade maps)
// ============================================================
const GRADE_INFO=[
  {num:1, icon:'🌱', mapName:'Tallenes Verden',    color:'#43e97b', glow:'rgba(67,233,123,.5)',  story:'Pluss-trollet gjemmer seg blant de enkle tallene! Mestre addisjon og subtraksjon for å drive det vekk og åpne veien til neste klasse.'},
  {num:2, icon:'🌿', mapName:'Tallskogen',         color:'#38f9d7', glow:'rgba(56,249,215,.5)',  story:'Store tall opp til 100 lurer overalt i Tallskogen. Gange-ormen vokter veien videre — beseir den med addisjon, subtraksjon og ganging!'},
  {num:3, icon:'✖️', mapName:'Gangeborgen',        color:'#4facfe', glow:'rgba(79,172,254,.5)',  story:'Gangeborgens porter er stengt med hemmelige koder — gangetabellen 1–5! Knekk kodene og åpne veien videre.'},
  {num:4, icon:'➗', mapName:'Del-dalen',          color:'#0ea5e9', glow:'rgba(14,165,233,.5)',  story:'Del-dalen er full av hindringer. Bare den som mestrer hele gangetabellen og divisjon kan komme gjennom!'},
  {num:5, icon:'💯', mapName:'Prosentfjellet',     color:'#f7971e', glow:'rgba(247,151,30,.5)',  story:'Prosentfjellet er bratt og glatt. Desimaltall og prosent er nøkkelen til å klatre til toppen.'},
  {num:6, icon:'📐', mapName:'Geometriland',       color:'#a78bfa', glow:'rgba(167,139,250,.5)', story:'Geometriland er en labyrint av former og størrelser. Finn veien med brøk, areal og negative tall!'},
  {num:7, icon:'🔡', mapName:'Algebrariket',       color:'#a855f7', glow:'rgba(168,85,247,.5)',  story:'Algebrariket er Nullius\' sterkeste festning! Likninger, algebra og statistikk er eneste vei inn.'},
  {num:8, icon:'⚡', mapName:'Likningsbyen',       color:'#ec4899', glow:'rgba(236,72,153,.5)',  story:'Likningsbyen er kaotisk og full av potenser og prosent. Rydd opp i kaoset for å komme videre!'},
  {num:9, icon:'🔭', mapName:'Pythagoras-tårnet',  color:'#06d6ff', glow:'rgba(6,214,255,.5)',   story:'Pythagoras-tårnet reiser seg mot himmelen. Trigonometri og statistikk er nødvendig for å klatre opp!'},
  {num:10,icon:'🌌', mapName:'Matematikktoppen',   color:'#ffd93d', glow:'rgba(255,217,61,.5)',  story:'Det endelige oppgjøret! NULLIUS venter på toppen av Matematikktoppen. Bruk alt du vet — funksjoner, trigonometri — og beseir ham for alltid!'},
];

const GRADE_POS=[
  [12,87],[28,75],[18,62],[35,51],[52,58],
  [65,45],[52,32],[68,21],[80,33],[88,14],
];

function buildGradeMap(){
  const svg=document.getElementById('adv-map-svg');
  const nodes=document.getElementById('adv-map-nodes');
  if(!svg||!nodes)return;
  svg.innerHTML='';nodes.innerHTML='';

  // Draw paths
  for(let i=0;i<GRADE_POS.length-1;i++){
    const [x1,y1]=GRADE_POS[i],[x2,y2]=GRADE_POS[i+1];
    const unlocked=isGradeUnlocked(i+1)&&isGradeUnlocked(i+2);
    const cx=(x1+x2)/2,cy=(y1+y2)/2-5;
    const path=document.createElementNS('http://www.w3.org/2000/svg','path');
    path.setAttribute('d',`M ${x1*6} ${y1*5.2} Q ${cx*6} ${cy*5.2} ${x2*6} ${y2*5.2}`);
    path.setAttribute('stroke',unlocked?'rgba(255,217,61,.65)':'rgba(255,255,255,.15)');
    path.setAttribute('stroke-width','3');
    path.setAttribute('stroke-dasharray',unlocked?'none':'7 5');
    path.setAttribute('fill','none');
    path.setAttribute('stroke-linecap','round');
    svg.appendChild(path);
  }

  // Terrain decorations
  const deco=document.getElementById('adv-map-deco');
  if(deco)deco.innerHTML=[
    {t:'🌿',s:'83%',l:'4%'},{t:'🌲',s:'72%',l:'22%'},{t:'🌳',s:'88%',l:'40%'},
    {t:'⛰️',s:'56%',l:'8%'},{t:'🏔️',s:'49%',l:'60%'},{t:'🏰',s:'36%',l:'76%'},
    {t:'☁️',s:'29%',l:'44%'},{t:'☁️',s:'19%',l:'63%'},{t:'✨',s:'11%',l:'82%'},
    {t:'🌌',s:'4%',l:'54%'},{t:'⭐',s:'7%',l:'91%'},{t:'💫',s:'2%',l:'70%'},
  ].map(d=>`<div style="position:absolute;top:${d.s};left:${d.l};font-size:1.1rem;opacity:.38;pointer-events:none;user-select:none">${d.t}</div>`).join('');

  // Grade nodes
  GRADE_INFO.forEach((gi,i)=>{
    const [lx,ly]=GRADE_POS[i];
    const unlocked=isGradeUnlocked(gi.num);
    const node=document.createElement('div');
    node.className='map-node'+(unlocked?'':' locked');
    node.style.cssText=`left:${lx}%;top:${ly}%;--nc:${gi.color};--ng:${gi.glow}`;
    // Stjerner i trinnet (⭐ samlet av mulige) og gullkroner – ingen prosent
    const gc=mstGradeCount(gi.num),all=gc.max>0&&gc.s>=gc.max;
    const progressTxt=unlocked?(gc.s>0?`<span class="mst-gcount">⭐ ${gc.s}/${gc.max}</span>${gc.cr?`<span class="mst-gcount">👑 ${gc.cr}</span>`:''}`:'Start her!'):'🔒 Låst';
    node.innerHTML=`
      <div class="map-node-icon">${gi.icon}${!unlocked?'<div class="map-node-lock">🔒</div>':''}</div>
      <div class="map-node-name">${gi.num}. kl · ${gi.mapName}</div>
      <div class="map-node-stars mst-gstars" style="color:${all&&unlocked?'var(--green)':'inherit'}">${progressTxt}</div>`;
    if(unlocked)node.onclick=()=>openGradePopup(gi);
    nodes.appendChild(node);
  });
  bossDecorateGradeMap();
  if(typeof trollDecorate==='function')trollDecorate('grades'); // «Trollet er tilbake!» (review.js)
  if(typeof parentsEntry==='function')parentsEntry(); // «👪 Hold inne for voksne» (parents.js)

  // You-marker
  const you=document.getElementById('map-you');
  if(you){
    let last=0;
    GRADE_INFO.forEach((_,i)=>{if(isGradeUnlocked(i+1))last=i;});
    const[yx,yy]=GRADE_POS[last];
    you.style.left=yx+'%';you.style.top=yy+'%';
    you.textContent=getCharEmoji(getCharIdx(),curLvl());
  }
  pgGradeMap(); // PROGRESSION: unlock ceremony, next goal, shop items
}

// Keep old name as alias so all existing call-sites work
function buildAdventureMap(){buildGradeMap();}
// Old 5-world helpers (hero card), built on the grade system: a world opens with its first grade; stars combine all its grades' topics
function isWorldUnlocked(i){const w=WORLDS[i];return !!w&&isGradeUnlocked(w.grades[0]);}
function getWorldStars(grades){let total=0,max=0;grades.forEach(g=>{const c=mstGradeCount(g);total+=c.s;max+=c.max;});if(!total||!max)return '○○○';const pct=total/max;if(pct>=.9)return '⭐⭐⭐';if(pct>=.5)return '⭐⭐○';return '⭐○○';}

function openGradePopup(gi){
  document.getElementById('wp-icon').textContent=gi.icon;
  document.getElementById('wp-icon').style.setProperty('--wpc',gi.color);
  document.getElementById('wp-name').textContent=`${gi.num}. klasse — ${gi.mapName}`;
  document.getElementById('wp-story').textContent=gi.story;
  document.getElementById('wp-go').onclick=()=>{closeWorldPopup();selectGrade(gi.num);};
  document.getElementById('world-popup').classList.add('show');
}

let currentGrade=1;

function selectGrade(gradeNum){
  currentGrade=gradeNum;
  const gi=GRADE_INFO[gradeNum-1];
  document.getElementById('topic-screen-title').textContent=`${gi.icon} ${gi.mapName}`;
  buildTopicMap(gradeNum);
  showScreen('topics');
}

// Temakart: få temaer i én sikksakk-rad (opptil 5 på bred skjerm, 3 på mobil). Flere: slangesti i rader (venstre→høyre,
// så høyre→venstre), 3 per rad på smal skjerm (2 hvis 4 temaer), ellers 2 rader. Setter også høyden på #topic-map-wrap og strekker SVG-stiene likt med nodene.
function topicMapWidth(){const w=document.getElementById('topic-map-wrap'),cw=w?+w.clientWidth||0:0;return cw>0?cw:Math.min(Math.max(+window.innerWidth||640,320)-24,620);}
function topicMapCols(n,W){const nw=(W||topicMapWidth())<480;if(n<=3||(n<=5&&!nw))return n;return nw?(n===4?2:3):Math.min(5,Math.ceil(n/2));}
function getTopicPositions(n){
  const wrap=document.getElementById('topic-map-wrap'),svg=document.getElementById('topic-map-svg'),W=topicMapWidth();
  const setH=h=>{if(wrap&&wrap.style)wrap.style.height=h+'px';};
  if(svg&&svg.setAttribute)svg.setAttribute('preserveAspectRatio','none');
  const cols=topicMapCols(n,W);getTopicPositions.cols=cols; // brukes når skjermbredden endres (topics12.js)
  if(cols===n){setH(260);
    if(n<=2)return[[22,50],[78,50]];
    if(n===3)return[[15,55],[50,30],[85,55]];
    if(n===4)return[[10,58],[37,32],[63,58],[90,32]];
    return[[8,55],[27,30],[50,58],[73,30],[92,55]];}
  const rows=Math.ceil(n/cols),narrow=W<480,top=30,rowH=narrow?126:142,H=top+rows*rowH+8,mx=narrow?15:9;
  setH(H);
  return Array.from({length:n},(_,i)=>{
    const r=Math.floor(i/cols);let c=i%cols;if(r%2)c=cols-1-c;
    const x=cols===2?[28,72][c]:mx+c*(100-2*mx)/(cols-1),y=top+(r+.5)*rowH+(c%2?-8:8);
    return [Math.round(x*10)/10,Math.round(y/H*1000)/10];
  });
}

function buildTopicMap(gradeNum){
  const svg=document.getElementById('topic-map-svg');
  const nodes=document.getElementById('topic-map-nodes');
  const bg=document.getElementById('topic-map-bg');
  const list=document.getElementById('topic-list');
  if(!svg||!nodes)return;
  svg.innerHTML='';nodes.innerHTML='';
  if(list)list.innerHTML='';

  const gd=CUR[gradeNum];
  const gi=GRADE_INFO[gradeNum-1];
  const topics=gd?.topics||[];
  const pos=getTopicPositions(topics.length);

  if(bg)bg.style.background=`linear-gradient(145deg,${gi.color}18 0%,#0d0b1e 55%)`;

  // Paths between topics
  for(let i=0;i<pos.length-1;i++){
    const [x1,y1]=pos[i],[x2,y2]=pos[i+1];
    const unlocked=isTopicUnlocked(gradeNum,i+1);
    const path=document.createElementNS('http://www.w3.org/2000/svg','path');
    path.setAttribute('d',`M ${x1*6} ${y1*2.6} L ${x2*6} ${y2*2.6}`);
    path.setAttribute('stroke',unlocked?gi.color:'rgba(255,255,255,.18)');
    path.setAttribute('stroke-width','4');
    path.setAttribute('stroke-dasharray',unlocked?'none':'8 5');
    path.setAttribute('fill','none');
    path.setAttribute('stroke-linecap','round');
    svg.appendChild(path);
  }

  // Topic nodes
  topics.forEach((t,i)=>{
    const [lx,ly]=pos[i]||[50,50];
    const unlocked=isTopicUnlocked(gradeNum,i);
    const hasWeak=checkWeak(gradeNum,t.id);
    const stars=topicStars(gradeNum,t.id),crown=hasCrown(gradeNum,t.id);
    const mastered=stars>=3;
    const node=document.createElement('div');
    node.className='map-node'+(unlocked?mastered?' mastered':'':' locked')+(crown?' mst-crowned':'');
    node.style.cssText=`left:${lx}%;top:${ly}%;--nc:${mastered?'var(--green)':gi.color};--ng:${mastered?'rgba(0,255,136,.5)':gi.glow}`;
    node.innerHTML=`
      <div class="map-node-icon" style="font-size:1.5rem;width:54px;height:54px">
        ${t.icon}${!unlocked?'<div class="map-node-lock">🔒</div>':''}
        ${hasWeak&&unlocked&&!mastered?'<div class="map-node-lock" style="background:rgba(255,217,61,.9);font-size:.7rem">🎯</div>':''}
        ${crown&&unlocked?'<div class="mst-node-crown">👑</div>':''}
      </div>
      <div class="map-node-name">${t.name}</div>
      ${unlocked?`<div class="topic-mst-wrap mst-node-stars">${mstStarsHTML(stars,null,crown)}</div>`:'<div class="map-node-stars">🔒</div>'}`;
    if(unlocked){
      node.onclick=()=>(typeof startTopic==='function'?startTopic:startGame)(gradeNum,t.id);
    } else {
      node.onclick=()=>{
        const toast=document.getElementById('achieve-toast');
        document.getElementById('at-icon').textContent='🔒';
        document.getElementById('at-title').textContent='Låst!';
        document.getElementById('at-sub').textContent='Få ⭐ på forrige tema først!';
        toast.classList.add('show');
        setTimeout(()=>toast.classList.remove('show'),2500);
      };
    }
    nodes.appendChild(node);
    if(typeof funNodeMonster==='function')funNodeMonster(node,gradeNum,t.id,unlocked); // eget monster per tema (fun.js)

    // Also keep "📖 Lær"-link below map if guide exists
    const hasGuide=!!(LEARN_GUIDES[t.id]&&LEARN_GUIDES[t.id].length);
    if(hasGuide&&list){
      const lnk=document.createElement('button');
      lnk.className='topic-btn';lnk.style.marginBottom='6px';
      const st=isTopicUnlocked(gradeNum,i)?topicStars(gradeNum,t.id):-1;
      lnk.innerHTML=`<div class="tb-icon" style="background:${t.bg||'rgba(124,58,237,.3)'}">${t.icon}</div><div><div class="tb-name">${t.name}${st>=0?` <span class="mst-list-stars">${mstStarsHTML(st,null,hasCrown(gradeNum,t.id))}</span>`:' 🔒'}</div><div class="tb-desc">${t.desc}</div></div><button class="topic-learn-btn" onclick="event.stopPropagation();showLearn(${gradeNum},'${t.id}')">📖 Lær</button>`;
      lnk.onclick=()=>(typeof startTopic==='function'?startTopic:startGame)(gradeNum,t.id);
      list.appendChild(lnk);
    }
  });
  bossAddTopicNode(gradeNum);
  if(typeof trollDecorate==='function')trollDecorate('topics',gradeNum); // «Trollet er tilbake!» (review.js)
  pgTopicMap(gradeNum); // PROGRESSION: unlock ceremony, growing bars, node goals
}
