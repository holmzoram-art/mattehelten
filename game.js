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
// STORY
// ============================================================
let storyPanel=0;
function storyNext(){
  storyPanel++;
  const panels=document.querySelectorAll('.story-panel');
  if(storyPanel>=panels.length){skipStory();return;}
  panels.forEach((p,i)=>p.classList.toggle('active',i===storyPanel));
}
function skipStory(){
  document.getElementById('story-overlay').classList.add('hidden');
  localStorage.setItem('mh_story_seen','1');
}
function showStory(){
  storyPanel=0;
  document.querySelectorAll('.story-panel').forEach((p,i)=>p.classList.toggle('active',i===0));
  document.getElementById('story-overlay').classList.remove('hidden');
}

// ============================================================
// SIDEKICKS
// ============================================================
const SIDEKICKS=[
  {emoji:'🐱',name:'Kattungen'},
  {emoji:'🐶',name:'Valpen'},
  {emoji:'🐸',name:'Frosken'},
  {emoji:'🦉',name:'Uglen'},
  {emoji:'🐲',name:'Drage-babyen'},
  {emoji:'🐹',name:'Hamsteret'},
];
let selectedSidekick=0;

function buildSidekickGrid(){
  const g=document.getElementById('sidekick-grid');
  SIDEKICKS.forEach((s,i)=>{
    const d=document.createElement('div');
    d.className='sk-card'+(i===0?' selected':'');
    d.innerHTML=`<span class="sk-emoji">${s.emoji}</span><div class="sk-name">${s.name}</div>`;
    d.onclick=()=>{selectedSidekick=i;document.querySelectorAll('.sk-card').forEach(x=>x.classList.remove('selected'));d.classList.add('selected');};
    g.appendChild(d);
  });
}

function getSidekickEmoji(){
  const idx=parseInt(localStorage.getItem('mh_sidekick')||'0');
  return SIDEKICKS[idx]?.emoji||'🐱';
}

function sidekickReact(type){
  const el=document.getElementById('hud-sidekick');
  if(!el)return;
  el.className='hud-sidekick';
  void el.offsetWidth;
  el.className=`hud-sidekick react-${type}`;
  setTimeout(()=>{el.className='hud-sidekick';},800);
}

function updateSidekick(){
  const el=document.getElementById('hud-sidekick');
  if(el)el.textContent=getSidekickEmoji();
}

// ============================================================
// WORLD STORIES
// ============================================================
const WORLD_STORIES=[
  {color:'#43e97b',glow:'rgba(67,233,123,.6)',
   story:'Nullius\' minste håndlanger — Pluss-trollet — gjemmer seg i den grønne dalen. Det har blandet sammen alle tall under 100! Beseir det ved å mestre addisjon og subtraksjon!'},
  {color:'#4facfe',glow:'rgba(79,172,254,.6)',
   story:'Dypt inne i Gangeskogen lurer Gange-demonen. Den har lært alle trærne å snakke i gåter. Ingen tør å gå inn... ingen unntatt deg. Mestre gangetabellen og frigjør skogen!'},
  {color:'#f7971e',glow:'rgba(247,151,30,.6)',
   story:'Høyt oppe i fjellene bor Komma-heksen. Hun har gjort alle tall uleselige ved å flytte kommaene! Beseir henne med desimaltall og prosent.'},
  {color:'#a855f7',glow:'rgba(168,85,247,.6)',
   story:'I den mørke Algebraborgen sitter Likning-trollet og holder kongerikets hemmelige formler fanget bak jernporter. Knekk algebraen og åpne portene!'},
  {color:'#06d6ff',glow:'rgba(6,214,255,.6)',
   story:'Her oppe i Kosmos-riket venter selve NULLIUS — den store skurken! Det er det endelige oppgjøret. Bruk all din kunnskap og redd kongeriket Talland for alltid!'},
];

let pendingWorldSelect=null;
function openWorldPopup(world,worldIdx){
  if(!isWorldUnlocked(worldIdx))return;
  pendingWorldSelect=world;
  const ws=WORLD_STORIES[worldIdx]||{};
  document.getElementById('wp-icon').textContent=world.icon;
  document.getElementById('wp-icon').style.setProperty('--wpc',ws.color||'var(--purple)');
  document.getElementById('wp-name').textContent=world.name;
  document.getElementById('wp-story').textContent=ws.story||'';
  document.getElementById('wp-go').onclick=()=>{closeWorldPopup();selectGrade(world.grades[0]);};
  document.getElementById('world-popup').classList.add('show');
}
function closeWorldPopup(){document.getElementById('world-popup').classList.remove('show');}

// ============================================================
// CHARACTERS + EVOLUTION
// ============================================================
const CHARS=[
  {emoji:'🧙',name:'Trollmannen'},{emoji:'🦸',name:'Superhelten'},
  {emoji:'🥷',name:'Ninjaen'},{emoji:'🧚',name:'Alven'},
  {emoji:'🤖',name:'Roboten'},{emoji:'🦊',name:'Reven'},
  {emoji:'🐉',name:'Dragen'},{emoji:'⚡',name:'Lynet'},
  {emoji:'🦄',name:'Enhørningen'},{emoji:'🚀',name:'Raketten'},
];

// 5 evolusjonsstadier per karakter (nivå 1→3→5→8→12)
const EVOLUTIONS = [
  ['🧙','🧙‍♂️','🔮','🌟','🌌'],   // Trollmannen
  ['🦸','🦸‍♂️','💪','⚡','🏆'],   // Superhelten
  ['🥷','🗡️','⚔️','🌑','💀'],    // Ninjaen
  ['🧚','🧚‍♀️','🦋','🌈','✨'],   // Alven
  ['🤖','⚙️','🔧','💎','🛸'],    // Roboten
  ['🦊','🐺','🦁','🔱','🐉'],    // Reven
  ['🐉','🔥','💥','🌋','🌠'],    // Dragen
  ['⚡','🌩️','🌪️','💫','☄️'],   // Lynet
  ['🦄','🌈','✨','🌟','💎'],    // Enhørningen
  ['🚀','🛸','🌙','⭐','🌌'],    // Raketten
];

const RANKS = [
  {name:'Lærling 🌱', lvl:1,  color:'#8878cc', desc:'Du har akkurat begynt eventyret ditt!'},
  {name:'Kriger ⚔️',  lvl:3,  color:'#06d6ff', desc:'Du har vist styrke i kampen mot tallene!'},
  {name:'Mester 🔥',  lvl:5,  color:'#ff6b35', desc:'Tallene frykter deg nå!'},
  {name:'Legende ⭐', lvl:8,  color:'#ffd93d', desc:'Du er blant de beste matteheltene!'},
  {name:'Mattegud 🌌',lvl:12, color:'#a855f7', desc:'Du har nådd toppen av matteuniverset!'},
];

function getEvoTier(level) {
  if(level >= 12) return 4;
  if(level >= 8)  return 3;
  if(level >= 5)  return 2;
  if(level >= 3)  return 1;
  return 0;
}

function getRank(level) {
  let rank = RANKS[0];
  RANKS.forEach(r => { if(level >= r.lvl) rank = r; });
  return rank;
}

function getCharEmoji(charIdx, level) {
  const tier = getEvoTier(level);
  return EVOLUTIONS[charIdx]?.[tier] || CHARS[charIdx].emoji;
}

function getCharIdx() {
  return parseInt(localStorage.getItem('mh_char_idx') || '0');
}

let pendingEvolution = null;

function checkEvolution(oldLevel, newLevel) {
  const oldTier = getEvoTier(oldLevel);
  const newTier = getEvoTier(newLevel);
  if(newTier > oldTier) {
    const charIdx = getCharIdx();
    pendingEvolution = {
      oldEmoji: EVOLUTIONS[charIdx][oldTier],
      newEmoji: EVOLUTIONS[charIdx][newTier],
      rank: getRank(newLevel),
    };
  }
}

function showEvolution() {
  if(!pendingEvolution) return;
  const {oldEmoji, newEmoji, rank} = pendingEvolution;
  document.getElementById('evo-old').textContent = oldEmoji;
  document.getElementById('evo-new').textContent = newEmoji;
  document.getElementById('evo-rank-badge').textContent = rank.name;
  document.getElementById('evo-rank-badge').style.background = `linear-gradient(135deg,${rank.color},${rank.color}99)`;
  document.getElementById('evo-desc').textContent = rank.desc;
  // reset animation
  const en = document.getElementById('evo-new');
  en.style.animation = 'none'; void en.offsetWidth; en.style.animation = '';
  document.getElementById('evo-overlay').classList.add('show');
  launch(120, ['#ffd93d','#a855f7','#06d6ff','#ff6b35','#00ff88']);
  sndLvl();
  pendingEvolution = null;
}

function closeEvolution() {
  document.getElementById('evo-overlay').classList.remove('show');
  updatePlayerEmoji();
}

function updatePlayerEmoji() {
  const charIdx = getCharIdx();
  const level = curLvl();
  const emoji = getCharEmoji(charIdx, level);
  const rank = getRank(level);
  // Update everywhere
  document.getElementById('hud-char').textContent = emoji;
  document.getElementById('player-avatar').textContent = emoji;
  const p = getPlayer();
  p.emoji = emoji;
  // HUD level label with rank badge
  document.getElementById('hud-lvl').innerHTML =
    `⭐ Nivå ${level} · <span id="hud-name">${p.name}</span> <span class="rank-badge" style="background:${rank.color}22;color:${rank.color};border:1px solid ${rank.color}44">${rank.name}</span>`;
}
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
  const nameInput=document.getElementById('cs-name');
  const name=nameInput.value.trim();
  if(!name){
    nameInput.style.borderColor='var(--red)';
    nameInput.style.boxShadow='0 0 16px rgba(255,68,102,.5)';
    nameInput.placeholder='⚠️ Du må skrive navnet ditt!';
    nameInput.focus();
    nameInput.addEventListener('input',()=>{
      nameInput.style.borderColor='';
      nameInput.style.boxShadow='';
      nameInput.placeholder='Skriv navnet ditt...';
    },{once:true});
    return;
  }
  const player={emoji:CHARS[selectedChar].emoji,name};
  localStorage.setItem('mh_player',JSON.stringify(player));
  localStorage.setItem('mh_char_idx', String(selectedChar));
  localStorage.setItem('mh_sidekick', String(selectedSidekick));
  applyPlayer(player);
  updatePlayerEmoji();
  updateSidekick();
  unlockAchievement('sidekick');
  buildAdventureMap();
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

// ============================================================
// MASTERY SYSTEM
// ============================================================
function getMastery(g,topicId){return parseInt(localStorage.getItem(`mh_mst_${g}_${topicId}`)||'0');}
function addMastery(g,topicId,score){
  const cur=getMastery(g,topicId);
  localStorage.setItem(`mh_mst_${g}_${topicId}`,Math.min(200,cur+score*10));
}
function isTopicPassed(g,topicId){return getMastery(g,topicId)>=70;}
function isTopicMastered(g,topicId){return getMastery(g,topicId)>=100;}

function masteryLabel(pct){
  if(pct>=100)return{txt:'🏆 Mestret!',col:'var(--green)'};
  if(pct>=70)return{txt:`⭐ ${pct}%`,col:'var(--gold)'};
  if(pct>0)return{txt:`${pct}%`,col:'var(--orange)'};
  return{txt:'Ny',col:'var(--muted)'};
}

function isGradeUnlocked(gradeNum){
  if(gradeNum===1)return true;
  if(isBossDefeated(gradeNum-1))return true;
  // Keep grades already reached in older saves open (new topics were added to earlier grades)
  if((CUR[gradeNum]?.topics||[]).some(t=>getMastery(gradeNum,t.id)>0))return true;
  const prev=CUR[gradeNum-1]?.topics||[];
  return prev.length>0&&prev.every(t=>isTopicMastered(gradeNum-1,t.id));
}

function isTopicUnlocked(gradeNum,topicIdx){
  if(topicIdx===0)return true;
  // A topic the child has already played stays open, even if a new topic was inserted before it
  const self=CUR[gradeNum]?.topics[topicIdx];if(self&&getMastery(gradeNum,self.id)>0)return true;
  const prev=CUR[gradeNum]?.topics[topicIdx-1];
  return prev?isTopicPassed(gradeNum,prev.id):false;
}

function getGradeStars(gradeNum){
  const topics=CUR[gradeNum]?.topics||[];
  if(!topics.length)return '○○○';
  let total=0,max=topics.length*3;
  topics.forEach(t=>{const b=getBest(gradeNum,t.id);if(b!==null)total+=Math.ceil(b/10*3);});
  if(!total)return '○○○';
  const pct=total/max;
  if(pct>=.9)return '⭐⭐⭐';if(pct>=.5)return '⭐⭐○';return '⭐○○';
}

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
    const stars=getGradeStars(gi.num);
    const node=document.createElement('div');
    node.className='map-node'+(unlocked?'':' locked');
    node.style.cssText=`left:${lx}%;top:${ly}%;--nc:${gi.color};--ng:${gi.glow}`;
    const topics=CUR[gi.num]?.topics||[];
    const masteredCount=topics.filter(t=>isTopicMastered(gi.num,t.id)).length;
    const progressTxt=unlocked?(masteredCount===topics.length?'🏆 Fullført!':masteredCount>0?`${masteredCount}/${topics.length} mestret`:'Start her!'):'🔒 Låst';
    node.innerHTML=`
      <div class="map-node-icon">${gi.icon}${!unlocked?'<div class="map-node-lock">🔒</div>':''}</div>
      <div class="map-node-name">${gi.num}. kl · ${gi.mapName}</div>
      <div class="map-node-stars" style="color:${masteredCount===topics.length&&unlocked?'var(--green)':'inherit'}">${progressTxt}</div>`;
    if(unlocked)node.onclick=()=>openGradePopup(gi);
    nodes.appendChild(node);
  });
  bossDecorateGradeMap();

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
function getWorldStars(grades){let total=0,max=0;grades.forEach(g=>(CUR[g]?.topics||[]).forEach(t=>{max+=3;const b=getBest(g,t.id);if(b!==null)total+=Math.ceil(b/10*3);}));if(!total)return '○○○';const pct=total/max;if(pct>=.9)return '⭐⭐⭐';if(pct>=.5)return '⭐⭐○';return '⭐○○';}

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

function getTopicPositions(n){
  if(n<=2)return[[22,50],[78,50]];
  if(n===3)return[[15,55],[50,30],[85,55]];
  if(n===4)return[[10,58],[37,32],[63,58],[90,32]];
  return[[8,55],[27,30],[50,58],[73,30],[92,55]];
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
    const best=getBest(gradeNum,t.id);
    const hasWeak=checkWeak(gradeNum,t.id);
    const mastery=getMastery(gradeNum,t.id);
    const masteryPct=Math.min(100,mastery);
    const mastered=isTopicMastered(gradeNum,t.id);
    const passed=isTopicPassed(gradeNum,t.id);
    const ml=masteryLabel(masteryPct);
    const fillCol=mastered?'var(--green)':passed?'var(--gold)':'var(--orange)';
    const node=document.createElement('div');
    node.className='map-node'+(unlocked?mastered?' mastered':'':' locked');
    node.style.cssText=`left:${lx}%;top:${ly}%;--nc:${mastered?'var(--green)':gi.color};--ng:${mastered?'rgba(0,255,136,.5)':gi.glow}`;
    node.innerHTML=`
      <div class="map-node-icon" style="font-size:1.5rem;width:54px;height:54px">
        ${t.icon}${!unlocked?'<div class="map-node-lock">🔒</div>':''}
        ${hasWeak&&unlocked&&!mastered?'<div class="map-node-lock" style="background:rgba(255,217,61,.9);font-size:.7rem">🎯</div>':''}
      </div>
      <div class="map-node-name">${t.name}</div>
      ${unlocked?`<div class="topic-mst-wrap"><div class="topic-mst-track"><div class="topic-mst-fill" style="width:${masteryPct}%;background:${fillCol}"></div></div><div class="topic-mst-lbl" style="color:${ml.col}">${ml.txt}</div></div>`:'<div class="map-node-stars">🔒</div>'}`;
    if(unlocked){
      node.onclick=()=>startGame(gradeNum,t.id);
    } else {
      node.onclick=()=>{
        const toast=document.getElementById('achieve-toast');
        document.getElementById('at-icon').textContent='🔒';
        document.getElementById('at-title').textContent='Låst!';
        document.getElementById('at-sub').textContent='Fullfør forrige tema først!';
        toast.classList.add('show');
        setTimeout(()=>toast.classList.remove('show'),2500);
      };
    }
    nodes.appendChild(node);

    // Also keep "📖 Lær"-link below map if guide exists
    const hasGuide=!!(LEARN_GUIDES[t.id]&&LEARN_GUIDES[t.id].length);
    if(hasGuide&&list){
      const lnk=document.createElement('button');
      lnk.className='topic-btn';lnk.style.marginBottom='6px';
      lnk.innerHTML=`<div class="tb-icon" style="background:${t.bg||'rgba(124,58,237,.3)'}">${t.icon}</div><div><div class="tb-name">${t.name}</div><div class="tb-desc">${t.desc}</div></div><button class="topic-learn-btn" onclick="event.stopPropagation();showLearn(${gradeNum},'${t.id}')">📖 Lær</button>`;
      lnk.onclick=()=>startGame(gradeNum,t.id);
      list.appendChild(lnk);
    }
  });
  bossAddTopicNode(gradeNum);
  pgTopicMap(gradeNum); // PROGRESSION: unlock ceremony, growing bars, node goals
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
function nf(n){return String(n).replace('.',',');}
function sup(n){return String(n).split('').map(d=>'⁰¹²³⁴⁵⁶⁷⁸⁹'[d]).join('');}
function frTxt(n,d){const k=gcd(Math.abs(n),Math.abs(d))||1;n/=k;d/=k;if(d<0){n=-n;d=-d;}return d===1?String(n):`${n}/${d}`;}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=rand(0,i);[a[i],a[j]]=[a[j],a[i]];}return a;}
// Tolker svar: "3/4", "6/8", "0,75", "0.75", "-2", "1 1/2". Ugyldig -> null
function parseAns(raw){const s=String(raw).trim().replace(/,/g,'.');let m=s.match(/^(-?)(\d+)\s+(\d+)\/(\d+)$/);if(m)return +m[4]?(m[1]?-1:1)*(+m[2]+m[3]/m[4]):null;if(m=s.match(/^(-?\d+(?:\.\d+)?)\/(-?\d+(?:\.\d+)?)$/))return +m[2]?m[1]/m[2]:null;return /^-?(\d+\.?\d*|\.\d+)$/.test(s)?+s:null;}
// Morsomme varianter for 1.-2. klasse: emoji-telling og mini-historier. eq = det rene regnestykket (brukes av fb*)
const FUN=['🍎','🍓','⭐','🐟','🍪','🎈','🐞','🍌','🧁','🌸'];
function toFun(o,q){o.eq=o.q;o.q=q;return o;}

const CUR={
  1:{c1:'#43e97b',c2:'#38f9d7',badge:'rgba(67,233,123,.15)',tc:'#00ff88',icon:'🔢',label:'Tall 1–20, + og −',
    topics:[
      {id:'add10',icon:'➕',bg:'rgba(67,233,123,.2)',name:'Addisjon til 10',desc:'Legg sammen tall opp til 10',
        gen(g,id){const pairs=[];for(let a=0;a<=9;a++)for(let b=0;b<=10-a;b++){const s=`${a}+${b}`,w=1+Math.round(errRate(g,id,s)*5);for(let i=0;i<w;i++)pairs.push({a,b,s});}const t=pick(pairs),E=pick(FUN),o={q:`${t.a} + ${t.b} = ?`,ans:t.a+t.b,type:'Addisjon',sub:t.s},r=Math.random();if(t.a&&t.b){if(r<.3&&t.a<=5&&t.b<=5)return toFun(o,`${E.repeat(t.a)} + ${E.repeat(t.b)} = ?`);if(r<.5)return toFun(o,pick([`Du har ${t.a} ${E}. Du får ${t.b} til. Hvor mange nå?`,`${t.a} ${E} og ${t.b} ${E}. Hvor mange til sammen?`]));}return o;},fb:fbAdd},
      {id:'sub10',icon:'➖',bg:'rgba(255,68,102,.2)',name:'Subtraksjon til 10',desc:'Trekk fra tall opp til 10',
        gen(g,id){const pairs=[];for(let a=0;a<=10;a++)for(let b=0;b<=a;b++){const s=`${a}-${b}`,w=1+Math.round(errRate(g,id,s)*5);for(let i=0;i<w;i++)pairs.push({a,b,s});}const t=pick(pairs),E=pick(FUN),o={q:`${t.a} - ${t.b} = ?`,ans:t.a-t.b,type:'Subtraksjon',sub:t.s},r=Math.random();if(t.b&&t.a>t.b){if(r<.25&&t.a<=6)return toFun(o,`${E.repeat(t.a)} - ${E.repeat(t.b)} = ?`);if(r<.5)return toFun(o,pick([`Du har ${t.a} ${E}. Trollet tar ${t.b}. Hvor mange er igjen?`,`${t.a} 🐦 sitter i et tre. ${t.b} flyr bort. Hvor mange er igjen?`,`Pluss-trollet spiste ${t.b} av dine ${t.a} 🍪. Hvor mange er igjen?`]));}return o;},fb:fbSub},
      {id:'ten1',icon:'🤝',bg:'rgba(255,217,61,.2)',name:'Tiervenner',desc:'To tall som blir 10 sammen',
        gen(g,id){const a=weightedPick([1,2,3,4,5,6,7,8,9],t=>errRate(g,id,`v${t}`)),o={q:Math.random()<.6?`${a} + ? = 10`:`? + ${a} = 10`,ans:10-a,type:'Tiervenner',hint:'Hvor mange mangler til 10?',sub:`v${a}`};return Math.random()<.35?toFun(o,pick([`Du har ${a} 🎈. Hvor mange mangler til 10?`,`${a} av 10 🐞 sover. Hvor mange er våkne?`,`Det er 10 🍪 i boksen. Du spiste ${a}. Hvor mange er igjen?`])):o;},fb:fbTen},
      {id:'seq1',icon:'🐸',bg:'rgba(0,255,136,.2)',name:'Tallrekker',desc:'Tell videre med hopp på 1, 2, 5 og 10',
        gen(g,id){const k=weightedPick(['hop1','hop-1','hop2','hop5','hop10'],t=>errRate(g,id,t)),st={'hop1':1,'hop-1':-1,'hop2':2,'hop5':5,'hop10':10}[k];const s0=k==='hop1'?rand(0,16):k==='hop-1'?rand(4,20):k==='hop2'?rand(0,12):k==='hop5'?5*rand(0,6):10*rand(0,6);const ts=[0,1,2,3].map(i=>s0+i*st),mi=pick([3,3,3,1,2]),ans=ts[mi];ts[mi]='?';const o={q:ts.join(', '),ans,type:'Tallrekke',hint:mi===3?'Hvilket tall kommer nå?':'Hvilket tall mangler?',sub:k};return Math.random()<.4?toFun(o,k==='hop-1'?`🚀 Nedtelling: ${o.q}`:`🐸 Frosken hopper: ${o.q}`):o;},fb:fbSeq},
      {id:'add20',icon:'🔢',bg:'rgba(6,214,255,.2)',name:'Addisjon til 20',desc:'Legg sammen tall opp til 20',
        gen(g,id){const t=weightedPick(['a20t','a20n','a20o','a20o'],s=>errRate(g,id,s));let a,b;if(t==='a20t'){a=10;b=rand(1,10);}else if(t==='a20n'){a=rand(11,18);b=rand(1,19-a);}else{a=rand(2,9);b=rand(11-a,9);}if(Math.random()<.4)[a,b]=[b,a];const E=pick(FUN),o={q:`${a} + ${b} = ?`,ans:a+b,type:'Addisjon',hint:t==='a20o'?'Fyll opp til 10 først':'',sub:t};return Math.random()<.3?toFun(o,pick([`Du har ${a} ${E}. Du finner ${b} til. Hvor mange nå?`,`${a} ${E} i kurven. Du legger i ${b} til. Hvor mange nå?`])):o;},fb:fbAdd},
    ]},
  2:{c1:'#4facfe',c2:'#00f2fe',badge:'rgba(79,172,254,.15)',tc:'#06d6ff',icon:'🧮',label:'Tall 1–100, +, − og ·',
    topics:[
      {id:'add100',icon:'➕',bg:'rgba(79,172,254,.2)',name:'Addisjon til 100',desc:'Legg sammen tall opp til 100',
        gen(g,id){const t=weightedPick(['a100t','a100e','a100c','a100n','a100x'],s=>errRate(g,id,s));let a,b;if(t==='a100t'){a=10*rand(1,8);b=10*rand(1,10-a/10);}else if(t==='a100e'){a=10*rand(1,9)+rand(0,8);b=rand(1,9-a%10);}else if(t==='a100c'){a=10*rand(1,8)+rand(1,9);b=rand(10-a%10,9);}else if(t==='a100n'){const ta=rand(1,8),oa=rand(1,8);a=10*ta+oa;b=10*rand(1,9-ta)+rand(1,9-oa);}else{const ta=rand(1,7),oa=rand(2,9);a=10*ta+oa;b=10*rand(1,8-ta)+rand(10-oa,9);}const o={q:`${a} + ${b} = ?`,ans:a+b,type:'Addisjon',sub:t};return Math.random()<.25?toFun(o,pick([`Du har ${a} kr. Du får ${b} kr til. Hvor mange kroner nå?`,`${a} 🐑 og ${b} 🐑 på jordet. Hvor mange sauer?`])):o;},fb:fbAdd},
      {id:'sub100',icon:'➖',bg:'rgba(255,68,102,.2)',name:'Subtraksjon til 100',desc:'Trekk fra tall opp til 100',
        gen(g,id){const t=weightedPick(['s100t','s100e','s100b','s100n','s100x'],s=>errRate(g,id,s));let a,b;if(t==='s100t'){a=10*rand(2,10);b=10*rand(1,a/10-1);}else if(t==='s100e'){a=10*rand(1,9)+rand(1,9);b=rand(1,a%10);}else if(t==='s100b'){a=10*rand(2,9)+rand(0,8);b=rand(a%10+1,9);}else if(t==='s100n'){const ta=rand(2,9),oa=rand(1,9);a=10*ta+oa;b=10*rand(1,ta-1)+rand(0,oa);}else{const ta=rand(2,9),oa=rand(0,8);a=10*ta+oa;b=10*rand(1,ta-1)+rand(oa+1,9);}const o={q:`${a} - ${b} = ?`,ans:a-b,type:'Subtraksjon',sub:t};return Math.random()<.25?toFun(o,pick([`Det er ${a} 🐟 i dammen. Trollet fanger ${b}. Hvor mange er igjen?`,`Du har ${a} kr. Du kjøper is for ${b} kr. Hvor mange kroner er igjen?`])):o;},fb:fbSub},
      {id:'miss2',icon:'🕵️',bg:'rgba(6,214,255,.2)',name:'Hva mangler?',desc:'Finn tallet som gjemmer seg',
        gen(g,id){const t=weightedPick(['mis+a','mis+b','mis-','mis10','mis100'],s=>errRate(g,id,s)),f=Math.random()<.3,r=(q,ans,st)=>{const o={q,ans,type:'Hva mangler?',hint:'Hvilket tall gjemmer seg?',sub:t};return f?toFun(o,st):o;};if(t==='mis+a'){const x=rand(1,10),b=rand(1,10);return r(`? + ${b} = ${x+b}`,x,`Du har ${b} 🍓. Du vil ha ${x+b}. Hvor mange mangler?`);}if(t==='mis+b'){const a=rand(1,10),x=rand(1,10);return r(`${a} + ? = ${a+x}`,x,`Du har ${a} 🍓. Du vil ha ${a+x}. Hvor mange mangler?`);}if(t==='mis-'){const a=rand(6,20),x=rand(1,Math.min(10,a-1));return r(`${a} - ? = ${a-x}`,x,`Du hadde ${a} 🎈. Nå har du ${a-x}. Hvor mange fløy bort?`);}if(t==='mis10'){const a=10*rand(1,8),x=10*rand(1,9-a/10);return r(Math.random()<.5?`${a} + ? = ${a+x}`:`? + ${a} = ${a+x}`,x,`Du har ${a} kr. Et spill koster ${a+x} kr. Hvor mange kroner mangler du?`);}const a=10*rand(1,9)+rand(1,9),s=a-a%10+10;return r(`${a} + ? = ${s}`,10-a%10,`Du har ${a} kr. En is koster ${s} kr. Hvor mange kroner mangler du?`);},fb:fbMiss},
      {id:'dbl2',icon:'👯',bg:'rgba(240,147,251,.2)',name:'Dobling og halvering',desc:'Dobbelt av og halvparten av et tall',
        gen(g,id){const t=weightedPick(['dob','halv','dob2','halv2'],s=>errRate(g,id,s)),n=t==='dob'||t==='halv'?rand(1,10):Math.random()<.25?pick([15,25,35,45]):10*rand(1,4)+rand(0,4),f=Math.random()<.35;if(t.startsWith('dob')){const o={q:`Dobbelt av ${n} = ?`,ans:2*n,type:'Dobling',hint:'To like mange',sub:t};return f?toFun(o,pick([`To troll har ${n} 🍎 hver. Hvor mange 🍎 til sammen?`,`Du har ${n} 🧦. Du får like mange til. Hvor mange nå?`])):o;}const o={q:`Halvparten av ${2*n} = ?`,ans:n,type:'Halvering',hint:'Del i to like deler',sub:t};return f?toFun(o,`Del ${2*n} 🍪 likt med en venn. Hvor mange får hver?`):o;},fb:fbDbl},
      {id:'mul25',icon:'✖️',bg:'rgba(255,217,61,.2)',name:'Ganging med 2, 5 og 10',desc:'Enkel multiplikasjon',
        gen(g,id){const b=weightedPick([2,5,10],t=>errRate(g,id,`x${t}`)),a=rand(1,10),o={q:`${a} · ${b} = ?`,ans:a*b,type:'Ganging',hint:`${b}-gangen`,sub:`x${b}`};return a>=2&&Math.random()<.35?toFun(o,b===2?`${a} 🐦 har 2 bein hver. Hvor mange bein?`:b===5?`Du ser ${a} 🖐️ med 5 fingre. Hvor mange fingre?`:`${a} esker med 10 🖍️. Hvor mange fargestifter?`):o;},fb:fbMul},
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
function warm(g,c){return Math.abs(g-c)<=1?'Nesten! 🤏':pick(['Godt forsøk! 💪','Godt prøvd!','Du er på god vei!']);}
function cnt(a,st,n){return Array.from({length:n},(_,i)=>a+st*(i+1)).join(', ');}
function fbAdd(q,g,c){q=eqOf(q);const p=q.replace(' = ?','').split(' + ');if(p.length!==2)return dflt(g,c);const[x,y]=[+p[0],+p[1]];if(isNaN(x)||isNaN(y))return dflt(g,c);const a=Math.max(x,y),b=Math.min(x,y),o=a%10;let tip;if(b===0)tip='Pluss 0 gjør ingenting. Tallet blir det samme!';else if(o===0&&b%10===0){const u=a%100===0&&b%100===0?100:10;tip=`Tenk i ${u===100?'hundrere':'tiere'}: ${a/u} + ${b/u} = ${c/u}. Da er ${a} + ${b} = ${c}.`;}else if(b<=5&&o+b<=10)tip=`Start på ${a} og tell ${b} fremover: ${cnt(a,1,b)}.`;else if(a<10){const f=10-a;tip=`Fyll opp tieren først: ${a} + ${f} = 10. Så ${b-f} til: 10 + ${b-f} = ${c}.`;}else if(b<10)tip=o===0?`${a/10} ${a===10?'tier':'tiere'} og ${b} enere blir ${c}.`:`Enere først: ${o} + ${b} = ${o+b}. Så ${a-o} + ${o+b} = ${c}.`;else{const T=a-o+b-b%10,O=o+b%10;tip=`Tiere: ${a-o} + ${b-b%10} = ${T}. Enere: ${o} + ${b%10} = ${O}. ${T} + ${O} = ${c}.`;}return`${warm(g,c)} ${x} + ${y} = <strong>${c}</strong>. 💡 ${tip}`;}
function fbSub(q,g,c){q=eqOf(q);const p=q.replace(' = ?','').split(' - ');if(p.length!==2)return dflt(g,c);const[a,b]=[+p[0],+p[1]];if(isNaN(a)||isNaN(b))return dflt(g,c);const o=a%10;let tip;if(b===0)tip='Tar du bort 0, blir tallet det samme.';else if(b===a)tip='Tar du bort alt, er det 0 igjen.';else if(o===0&&b%10===0){const u=a%100===0&&b%100===0?100:10;tip=`Tenk i ${u===100?'hundrere':'tiere'}: ${a/u} - ${b/u} = ${c/u}. Da er ${a} - ${b} = ${c}.`;}else if(b<=5&&(a<=20||o>=b))tip=`Start på ${a} og tell ${b} bakover: ${cnt(a,-1,b)}.`;else if(a<=10)tip=`Tenk pluss: ${b} + ${c} = ${a}. Da er ${a} - ${b} = ${c}.`;else if(b<10)tip=o>=b?`Enere: ${o} - ${b} = ${o-b}. Så ${a-o} + ${o-b} = ${c}.`:o===0?`Bruk tiervenner: 10 - ${b} = ${10-b}. Da er ${a} - ${b} = ${a-10} + ${10-b} = ${c}.`:`Ta først ned til tieren: ${a} - ${o} = ${a-o}. Så ${b-o} til: ${a-o} - ${b-o} = ${c}.`;else if(b%10===0)tip=`Ta bort ${b/10} tiere: ${a} - ${b} = ${c}.`;else{const t=b-b%10,m=a-t;tip=`Ta tierne først: ${a} - ${t} = ${m}. Så enerne: ${m} - ${b%10} = ${c}.`;}return`${g===a+b&&b>0?'Oi, der la du sammen! Minus betyr å ta bort.':warm(g,c)} ${a} - ${b} = <strong>${c}</strong>. 💡 ${tip}`;}
function fbMul(q,g,c){q=eqOf(q);const p=q.replace(' = ?','').split(' · ');if(p.length!==2)return dflt(g,c);const[a,b]=[+p[0],+p[1]];if(isNaN(a)||isNaN(b))return dflt(g,c);const tip=a===1||b===1?'Ganger du med 1, blir tallet det samme.':a>=2&&a<=5?`${a} grupper med ${b}: ${Array(a).fill(b).join(' + ')} = ${c}.`:`Tell ${a} hopp på ${b}: ${cnt(0,b,a)}.`;return`${g===a+b&&a*b!==a+b?'Oi, der la du sammen! Ganging er mange like grupper.':warm(g,c)} ${a} · ${b} = <strong>${c}</strong>. 💡 ${tip}`;}
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
function fbTen(q,g,c){const a=10-c;return`${warm(g,c)} ${a} + <strong>${c}</strong> = 10. 💡 ${c<=5?`Tell fra ${a} opp til 10: ${cnt(a,1,c)}. Det er ${c} hopp! 🐸`:`Vis 10 fingre og bøy ned ${a}. Da står ${c} fingre igjen! 🖐️🖐️`}`;}
function fbSeq(q,g,c){q=eqOf(q);const ts=q.split(', ');let st=null;for(let i=0;i+1<ts.length;i++)if(ts[i]!=='?'&&ts[i+1]!=='?'){st=ts[i+1]-ts[i];break;}if(st===null||isNaN(st))return dflt(g,c);return`${warm(g,c)} 💡 Se på hoppet: tallene blir ${Math.abs(st)} ${st>0?'større':'mindre'} hver gang. ${ts.map(t=>t==='?'?`<strong>${c}</strong>`:t).join(', ')}.`;}
function fbDbl(q,g,c){q=eqOf(q);let m=q.match(/Dobbelt av (\d+)/);if(m){const n=+m[1],o=n%10;return`${warm(g,c)} Dobbelt av ${n} er ${n} + ${n} = <strong>${c}</strong>. 💡 ${n>10&&o?`Ta tierne og enerne hver for seg: ${n-o} + ${n-o} = ${2*(n-o)} og ${o} + ${o} = ${2*o}. ${2*(n-o)} + ${2*o} = ${c}.`:'Dobbelt betyr to like mange.'}`;}m=q.match(/Halvparten av (\d+)/);if(m)return`${warm(g,c)} Halvparten av ${m[1]} er <strong>${c}</strong>. 💡 Del i to like store deler: ${c} og ${c}. Sjekk: ${c} + ${c} = ${m[1]}.`;return dflt(g,c);}
function fbMiss(q,g,c){q=eqOf(q);const full=q.replace('?',`<strong>${c}</strong>`);let m,tip='';if((m=q.match(/^(\d+) \+ \? = (\d+)$/))||(m=q.match(/^\? \+ (\d+) = (\d+)$/))){const k=+m[1],s=+m[2];tip=k%10===0&&s%10===0&&c>=10?`Tell tiere fra ${k}: ${cnt(k,10,c/10)}. Det er ${c/10} tiere = ${c}.`:c<=5?`Tell fra ${k} opp til ${s}: ${cnt(k,1,c)}. Det er ${c} hopp!`:s%10===0&&k%10?`Tenk tiervenner: ${k%10} + ${c} = 10.`:`Tenk minus: ${s} - ${k} = ${c}.`;}else if(m=q.match(/^(\d+) - \? = (\d+)$/))tip=c<=5?`Tell ned fra ${m[1]} til ${m[2]}: ${cnt(+m[1],-1,c)}. Det er ${c} hopp!`:`Tenk: ${m[1]} - ${m[2]} = ${c}.`;return`${warm(g,c)} Tallet som gjemmer seg er <strong>${c}</strong>: ${full}. 💡 ${tip}`;}
function dflt(g,c){return`Du svarte ${say(g)}. Riktig er <strong>${nf(c)}</strong>. Prøv igjen! 💪`;}

const CORRECT=[
  {t:'💥 RIKTIG!',m:'Du traff blink!'},
  {t:'⚡ PERFEKT!',m:'Du er ustoppelig!'},
  {t:'🔥 BINGO!',m:'Det hadde du full kontroll på!'},
  {t:'✅ Riktig!',m:'Så flink du er!'},
  {t:'🚀 SUPERT!',m:'Hjernen din er i topp form!'},
  {t:'🏆 BINGO!',m:'Du er en ekte mattehelt!'},
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
  document.getElementById('hud-lvl').innerHTML=`⭐ Nivå ${l} · <span id="hud-name">${getPlayer().name}</span>`;
  document.getElementById('hud-fill').style.width=pct+'%';
  document.getElementById('hud-coins').textContent=prog.coins;
  document.getElementById('hud-streak').textContent=prog.streak;
  document.getElementById('hud-char').textContent=getPlayer().emoji;
  if(localStorage.getItem('mh_player'))updatePlayerEmoji(); // keep evolved emoji + rank badge
  pgHud(); // PROGRESSION: XP goal, smooth fill, shop items on the hero
}
function getPlayer(){return JSON.parse(localStorage.getItem('mh_player')||'{"emoji":"🦸","name":"Helt"}');}

// ============================================================
// BADGES / ACHIEVEMENTS
// ============================================================
const BADGES=[
  {id:'first_correct', icon:'⚡', name:'Første treff!',   desc:'Svar riktig for første gang', secret:false},
  {id:'streak5',       icon:'🔥', name:'På strak arm!',   desc:'5 riktige på rad',            secret:false},
  {id:'streak10',      icon:'🌋', name:'Ustoppelig!',     desc:'10 riktige på rad i en boss-kamp', secret:true},
  {id:'perfect',       icon:'💎', name:'Perfekt runde!',  desc:'Ingen feil i en hel kamp',    secret:false},
  {id:'ko',            icon:'💀', name:'K.O. Mester!',    desc:'Beseir fienden med combo',    secret:false},
  {id:'lvlup',         icon:'⭐', name:'Nivå opp!',       desc:'Nå et nytt nivå',             secret:false},
  {id:'lvl5',          icon:'🔥', name:'Mester!',         desc:'Nå nivå 5',                   secret:false},
  {id:'lvl8',          icon:'🌟', name:'Legende!',        desc:'Nå nivå 8',                   secret:true},
  {id:'lvl12',         icon:'🌌', name:'Mattegud!',       desc:'Det høyeste nivå — du klarte det!', secret:true},
  {id:'coins100',      icon:'🪙', name:'Pengesekken!',    desc:'Samle 100 mynter',            secret:false},
  {id:'coins50',       icon:'💰', name:'Rik helt!',       desc:'Samle 50 mynter',             secret:false},
  {id:'world1',        icon:'🌿', name:'Dalens hersker',  desc:'Fullfør Tallenes Dal',        secret:false},
  {id:'world2',        icon:'🌲', name:'Skogens mester',  desc:'Fullfør Gangeskogen',         secret:false},
  {id:'world3',        icon:'🏔️', name:'Fjellkongen',    desc:'Fullfør Desimalfjellene',     secret:false},
  {id:'world4',        icon:'🏰', name:'Borgherren',      desc:'Fullfør Algebraborgen',       secret:false},
  {id:'world5',        icon:'🌌', name:'Kosmoshersker',   desc:'Fullfør Kosmos-riket',        secret:true},
  {id:'combo5',        icon:'💫', name:'Combo x5!',       desc:'5 combo i én kamp',           secret:false},
  {id:'sidekick',      icon:'🐾', name:'Bestevenn!',      desc:'Velg din sidekick',           secret:false},
];
const ACHIEVEMENTS=Object.fromEntries(BADGES.map(b=>
  [b.id,{icon:b.icon,title:b.name,sub:b.desc}]
));
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
  sidekickReact('celebrate');
}

function openHeroCard(){
  const p=getPlayer();
  const level=curLvl();
  const rank=getRank(level);
  const emoji=getCharEmoji(getCharIdx(),level);
  const card=document.getElementById('herocard');
  // Rank-based colors
  card.style.setProperty('--hc-border',rank.color);
  card.style.setProperty('--hc-glow',rank.color+'55');
  document.getElementById('hc-topbar').style.background=`linear-gradient(90deg,${rank.color},${rank.color}66)`;
  document.getElementById('hc-char').textContent=emoji;
  document.getElementById('hc-name').textContent=p.name;
  document.getElementById('hc-rank-badge').textContent=rank.name;
  document.getElementById('hc-rank-badge').style.background=`linear-gradient(135deg,${rank.color},${rank.color}aa)`;
  document.getElementById('hc-rank-badge').style.color=rank.lvl>=8?'#fff':'var(--dark)';
  document.getElementById('hc-lvl-txt').textContent=`Nivå ${level}`;
  const xpPct=Math.round(xpInLvl()/lvlFor(level)*100);
  document.getElementById('hc-xp-txt').textContent=`${xpInLvl()} / ${lvlFor(level)} XP`;
  document.getElementById('hc-xp-fill').style.width=xpPct+'%';
  document.getElementById('hc-coins-hc').textContent=prog.coins;
  document.getElementById('hc-badges').textContent=BADGES.filter(b=>unlockedAchievements[b.id]).length;
  document.getElementById('hc-date').textContent=new Date().toLocaleDateString('no-NO');
  // Unique player ID from name
  const uid='#'+String(p.name.split('').reduce((a,c)=>a+c.charCodeAt(0),1337)%9000+1000);
  document.getElementById('hc-id').textContent='ID '+uid;
  // World nodes
  const wr=document.getElementById('hc-world-row');
  wr.innerHTML='';
  let worldsDone=0;
  WORLDS.forEach((w,i)=>{
    const unlocked=isWorldUnlocked(i);
    const stars=getWorldStars(w.grades);
    const allStar=stars==='⭐⭐⭐';
    if(unlocked)worldsDone++;
    const d=document.createElement('div');
    d.className='hc-wnode'+(unlocked?' done':'  locked');
    if(unlocked){d.style.borderColor=w.color;d.style.boxShadow=`0 0 12px ${w.glow}`;}
    d.innerHTML=`${w.icon}<div class="hc-wstars">${unlocked?stars:'🔒'}</div>`;
    wr.appendChild(d);
  });
  document.getElementById('hc-worlds-done').textContent=`${worldsDone}/5`;
  document.getElementById('hc-share-btn').textContent='📸 Vis frem på skolen!';
  document.getElementById('herocard-overlay').classList.add('show');
  launch(25,['#ffd93d','#a855f7','#06d6ff']);
  pgHeroCard(); // PROGRESSION: shop items on the hero
}

function closeHeroCard(){
  document.getElementById('herocard-overlay').classList.remove('show');
}

function shareHeroCard(){
  const btn=document.getElementById('hc-share-btn');
  btn.textContent='📱 Ta skjermbilde nå!';
  launch(80,['#ffd93d','#ff6b35','#00ff88','#a855f7']);
  setTimeout(()=>{btn.textContent='📸 Vis frem på skolen!';},2500);
}

function openBadges(){
  const grid=document.getElementById('badge-grid');
  const unlocked=BADGES.filter(b=>unlockedAchievements[b.id]).length;
  document.getElementById('badge-count').textContent=`${unlocked} / ${BADGES.length}`;
  grid.innerHTML='';
  BADGES.forEach(b=>{
    const got=!!unlockedAchievements[b.id];
    const div=document.createElement('div');
    div.className='badge-card'+(got?' unlocked':'')+(b.secret&&!got?' secret':'');
    div.innerHTML=`<span class="badge-icon">${b.secret&&!got?'❓':b.icon}</span><div class="badge-name">${b.secret&&!got?'???':b.name}</div><div class="badge-desc">${b.secret&&!got?'Hemmelig merke':b.desc}</div>`;
    grid.appendChild(div);
  });
  document.getElementById('badge-overlay').classList.add('show');
}
function closeBadges(){document.getElementById('badge-overlay').classList.remove('show');}

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
function tone(f,d,t='sine',v=.25){if(fxMuted())return;try{const c=ga(),o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);o.type=t;o.frequency.value=f;g.gain.setValueAtTime(v,c.currentTime);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+d);o.start();o.stop(c.currentTime+d);}catch(e){}}
function sndOk(){tone(523,.08);setTimeout(()=>tone(659,.08),70);setTimeout(()=>tone(784,.15),140);}
function sndCombo(){tone(880,.08);setTimeout(()=>tone(1046,.15),70);}
function sndBad(){tone(392,.12,'triangle',.12);setTimeout(()=>tone(330,.18,'triangle',.12),120);}
function sndLvl(){[523,587,659,698,784,880,1046].forEach((f,i)=>setTimeout(()=>tone(f,.1,'sine',.2),i*60));}

// ============================================================
// HELPERS
// ============================================================
function showScreen(n){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  const el=document.getElementById('screen-'+n);el.classList.add('active');
  el.scrollTop=0;window.scrollTo(0,0);
  fxScreen(n,el); // BATTLE FX: screen transition
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
let S={grade:null,topicId:null,topic:null,questions:[],idx:0,score:0,streak:0,combo:0,current:null,answered:false,enemyHp:100,playerHp:100,enemyDefeated:false};
const TQ=10;

function startGame(g,topicId){
  const gd=CUR[g],topic=gd.topics.find(t=>t.id===topicId);
  S={grade:g,topicId,topic,questions:[],idx:0,score:0,streak:0,combo:0,current:null,answered:false,enemyHp:100,playerHp:100,enemyDefeated:false};
  const p=getPlayer();
  document.getElementById('player-avatar').textContent=p.emoji;
  document.getElementById('player-name').textContent=p.name;
  document.getElementById('enemy-avatar').textContent=ENEMIES[g]||'👾';
  document.getElementById('enemy-name').textContent=({1:'Tall-larven',2:'Minus-billen',3:'Gange-øglen',4:'Dele-krokodillen',5:'Komma-dinoen',6:'Brøk-dragen',7:'Algebra-trollet',8:'Likningszombien',9:'Pytha-romvesenet',10:'Funksjons-ufoen'})[g]||'Tallmonsteret';
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
  fxStart(false); // BATTLE FX: entrance + reset
}
function retrySession(){startGame(S.grade,S.topicId);}

function buildNumpad(g){
  const pad=document.getElementById('numpad');pad.innerHTML='';
  const showDot=g>=5,showFrac=!!(CUR[g]&&CUR[g].topics.some(t=>t.frac));
  const keys=showDot?[7,8,9,'del',4,5,6,'neg',1,2,3,0,'.',showFrac?'/':null]:[7,8,9,'del',4,5,6,'neg',1,2,3,0];
  keys.forEach(v=>{
    if(v===null){pad.appendChild(document.createElement('div'));return;}
    const btn=document.createElement('button');
    if(v==='del'){btn.textContent='⌫';btn.className='n-del';btn.onclick=()=>{if(!S.answered)document.getElementById('ans-input').value=document.getElementById('ans-input').value.slice(0,-1);};}
    else if(v==='neg'){btn.textContent='±';btn.className='n-neg';btn.onclick=()=>{if(!S.answered){const i=document.getElementById('ans-input');i.value=i.value.startsWith('-')?i.value.slice(1):'-'+i.value;}};}
    else if(v==='.'){btn.textContent=',';btn.className='n-dot';btn.onclick=()=>{if(!S.answered){const i=document.getElementById('ans-input');if(!/[.,]/.test(i.value))i.value+=',';}};}
    else if(v==='/'){btn.textContent='/';btn.className='n-dot';btn.onclick=()=>{if(!S.answered){const i=document.getElementById('ans-input');if(!i.value.includes('/'))i.value+='/';}};}
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
  qt.classList.toggle('q-long',/[a-zæøå]{4}/i.test(qd.q)&&qd.q.length>20);
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
  document.getElementById('prog-label').textContent=`Spørsmål ${Math.min(S.idx+(S.answered?0:1),TQ)} av ${TQ}`;
  document.getElementById('score-label').textContent=`${S.score} ${S.score===1?'riktig':'riktige'}`;
  const cb=document.getElementById('combo-badge');
  document.getElementById('combo-num').textContent=S.combo;
  cb.classList.toggle('hot',S.combo>=3);
}

document.getElementById('ans-input').addEventListener('keydown',e=>{
  if(e.key==='Enter'){if(S.answered)handleNext();else submitAnswer();}
});
document.getElementById('ans-input').addEventListener('input',e=>{const v=e.target.value.replace(/[^0-9,.\/ -]/g,'');if(v!==e.target.value)e.target.value=v;});

function submitAnswer(){
  const raw=document.getElementById('ans-input').value.trim();
  if(raw==='')return;
  const given=parseAns(raw),correct=S.current.ans;
  const inp=document.getElementById('ans-input'),fb=document.getElementById('fb-box');
  if(given===null){inp.classList.add('wrong');setTimeout(()=>inp.classList.remove('wrong'),500);return;}
  S.answered=true;S.idx++;
  inp.disabled=true;document.getElementById('sub-btn').disabled=true;
  const ex=S.current.ansTxt!=null?parseAns(S.current.ansTxt):correct,ok=raw.includes('/')?Math.abs(given-ex)<1e-9:Math.abs(given-correct)<0.01;S.current.givenTxt=raw;
  S.questions.push({q:S.current.q,given,correct,ok,sub:S.current.sub||'?',givenTxt:raw,correctTxt:S.current.ansTxt||nf(correct),eq:S.current.eq});
  recordAttempt(S.grade,S.topicId,S.current.sub||'_',ok);

  if(ok){
    S.score++;S.streak++;S.combo++;
    inp.className='ans-input correct';
    fb.className='fb-box correct';
    const ph=pick(CORRECT);
    fb.innerHTML=`<div class="fb-title">${ph.t}</div>${ph.m}`;
    sndOk();
    // Enemy takes damage
    S.enemyHp=S.boss?bossHit():Math.max(0,S.enemyHp-(8+S.combo*2));
    document.getElementById('enemy-hp').style.width=S.enemyHp+'%';
    document.getElementById('enemy-avatar').classList.add('hit');
    setTimeout(()=>document.getElementById('enemy-avatar').classList.remove('hit'),500);
    launch(S.combo>=3?80:40);
    fxCorrect(); // BATTLE FX: attack, damage pop, K.O. (keep before the K.O. block)
    if(S.enemyHp<=0){
      S.enemyDefeated=true;
      document.getElementById('enemy-avatar').textContent='💀';
      setSpeech('K.O.! Du knuste monsteret! 💥');
      if(!heroVictoryFx(150))launch(150,['#ffd93d','#ff6b35','#00ff88','#06d6ff']);
      sidekickReact('celebrate');
      unlockAchievement('ko');
    }
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
    const newL=curLvl();
    if(newL>oldL){checkEvolution(oldL,newL);sndLvl();launch(100);unlockAchievement('lvlup');if(newL>=5)unlockAchievement('lvl5');if(newL>=8)unlockAchievement('lvl8');if(newL>=12)unlockAchievement('lvl12');} // evolution waits for the chest (NIVÅ OPP first)
    updatePlayerEmoji();
    if(prog.coins>=50)unlockAchievement('coins50');
    if(prog.coins>=100)unlockAchievement('coins100');
    if(S.streak===1&&!unlockedAchievements.first_correct)unlockAchievement('first_correct');
    if(S.streak===5)unlockAchievement('streak5');
    if(S.combo>=5)unlockAchievement('combo5');
    if(S.combo>=10)unlockAchievement('streak10');
    sidekickReact(S.combo>=5?'combo':'happy');
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
    fxWrong(); // BATTLE FX: enemy attacks, hero blocks with a shield
    setSpeech(pick(['Ikke gi opp! 💪','Prøv igjen! 🛡️','Du klarer det!']));
    sidekickReact(S.playerHp<=30?'scared':'sad');
  }
  document.getElementById('numpad').style.display='none';
  updateBattleProg();
  const nb=document.getElementById('next-btn');
  nb.textContent=(S.idx>=TQ||S.enemyDefeated)?'Se resultat 🏁':'Neste →';
  nb.style.display='block';
  if(S.boss)bossAfterAnswer();
}

function handleNext(){if(S.boss)return bossNext();if(S.idx>=TQ||S.enemyDefeated)showChest();else loadQuestion();}

// ============================================================
// CHEST + RESULTS
// ============================================================
// Round score: % of questions actually answered (a K.O. ends early), on the 0-10 scale used by mastery/high scores; 10 only if no mistakes
function roundScore(){const n=S.questions.length||TQ,perfect=S.score>=n,s10=perfect?10:Math.min(9,Math.round(S.score/n*10));return{n,s10,pct:s10/10,perfect};}
function showChest(){
  const {s10,pct,perfect}=roundScore();
  const xpEarned=s10*10+(pct>=1?50:pct>=.8?20:0);
  const coinsEarned=s10+(pct>=1?5:0);
  const stars=Math.ceil(pct*3);

  // Add mastery before calculating display
  const masteryBefore=getMastery(S.grade,S.topicId);
  addMastery(S.grade,S.topicId,s10);
  const masteryAfter=Math.min(100,getMastery(S.grade,S.topicId));
  const masteryGained=Math.min(100,masteryAfter)-Math.min(100,masteryBefore);
  const nowPassed=isTopicPassed(S.grade,S.topicId);
  const nowMastered=isTopicMastered(S.grade,S.topicId);

  let emoji,title,sub;
  if(perfect){emoji='💎';title='PERFEKT SEIER!';sub='Du er en legende!';}
  else if(pct>=.8){emoji='🏆';title='Stor seier!';sub='Nesten perfekt!';}
  else if(pct>=.5){emoji='⚔️';title='Bra kamp!';sub='Øv mer og kom sterkere tilbake!';}
  else{emoji='🛡️';title='Tap — men du lærte!';sub='Prøv igjen, du blir sterkere!';}
  if(S.enemyDefeated)sub='💥 K.O.! '+sub;

  // Mastery status message
  let mstMsg='';
  if(nowMastered&&masteryBefore<100)mstMsg='<div style="color:var(--green);font-family:\'Fredoka One\',cursive;font-size:.95rem;margin-top:4px">🏆 Emne mestret! Neste låses opp!</div>';
  else if(nowPassed&&masteryBefore<70)mstMsg='<div style="color:var(--gold);font-family:\'Fredoka One\',cursive;font-size:.9rem;margin-top:4px">⭐ Passert! Neste emne låst opp!</div>';
  else if(!nowMastered)mstMsg=`<div style="color:var(--muted);font-size:.8rem;font-weight:700;margin-top:4px">Mestring: ${masteryAfter}% — trenger ${nowPassed?100:70}% for ${nowPassed?'å mestre':'å låse opp neste'}</div>`;

  document.getElementById('chest-emoji').textContent=emoji;
  document.getElementById('chest-title').textContent=title;
  document.getElementById('chest-sub').innerHTML=sub+mstMsg;
  document.getElementById('chest-rewards').innerHTML=`
    <div class="chest-reward"><span class="chest-reward-icon">⭐</span><div class="chest-reward-val">${'⭐'.repeat(stars)+'☆'.repeat(3-stars)}</div></div>
    <div class="chest-reward"><span class="chest-reward-icon">✨</span><div class="chest-reward-val">+${xpEarned} XP</div></div>
    <div class="chest-reward"><span class="chest-reward-icon">🎯</span><div class="chest-reward-val">+${masteryGained}% mestring</div></div>
    <div class="chest-reward"><span class="chest-reward-icon">🪙</span><div class="chest-reward-val">+${coinsEarned}</div></div>
  `;
  const oldL=curLvl();
  prog.xp+=xpEarned;prog.coins+=coinsEarned;saveProg();renderHUD();
  const newL=curLvl();
  if(newL>oldL){checkEvolution(oldL,newL);unlockAchievement('lvlup');if(newL>=5)unlockAchievement('lvl5');if(newL>=8)unlockAchievement('lvl8');if(newL>=12)unlockAchievement('lvl12');}
  if(prog.coins>=50)unlockAchievement('coins50');if(prog.coins>=100)unlockAchievement('coins100');
  document.getElementById('chest-overlay').classList.add('show');
  launch(pct>=.8?120:60);
  if(perfect)unlockAchievement('perfect');
  sidekickReact(pct>=.8?'celebrate':'happy');
  pgChest(masteryBefore,xpEarned,coinsEarned,pct); // PROGRESSION: count-ups, streak, NIVÅ OPP
}

function closeChest(){
  document.getElementById('chest-overlay').classList.remove('show');
  buildResults();
  showScreen('results');
  pgChestClose(); // PROGRESSION: NIVÅ OPP comes before evolution
  if(pendingEvolution)showEvolution(); // level-up from chest XP
}

function buildResults(){
  const {n,pct,perfect}=roundScore();
  let mascot,title,sub;
  if(perfect){mascot='💎';title=`PERFEKT! ${S.score} av ${n}!`;sub='Du er en ekte mattehelt!';}
  else if(pct>=.8){mascot='🏆';title='Kjempebra!';sub='Nesten perfekt!';}
  else if(pct>=.6){mascot='⚔️';title='Bra kamp!';sub='Øv litt mer, du klarer det!';}
  else if(pct>=.4){mascot='🛡️';title='Ikke gi opp!';sub='Prøv igjen — du lærer!';}
  else{mascot='📚';title='Øv og prøv igjen!';sub='Slik lærer vi — hold ut!';}
  if(S.enemyDefeated)sub='💥 K.O.! '+sub;
  const stars=Math.ceil(pct*3);
  document.getElementById('res-mascot').textContent=mascot;
  document.getElementById('res-title').textContent=title;
  document.getElementById('res-sub').textContent=sub;
  document.getElementById('res-stars').textContent='⭐'.repeat(stars)+'☆'.repeat(3-stars);
  document.getElementById('res-num').textContent=S.score;
  const den=document.querySelector('#res-ring .score-den');if(den)den.textContent=`av ${n}`;
  document.getElementById('res-ring').style.background=`conic-gradient(#00ff88 ${Math.round(S.score/n*360)}deg,rgba(255,255,255,.1) 0)`;
  // Adapt section
  const errs={};S.questions.forEach(q=>{if(!q.ok)errs[q.sub]=(errs[q.sub]||0)+1;});
  const subs=Object.entries(errs).sort((a,b)=>b[1]-a[1]);
  const as=document.getElementById('adapt-sec');
  if(!subs.length){as.innerHTML='<div style="font-family:Fredoka One,cursive;font-size:.9rem;color:var(--green)">Ingen svake punkter denne runden!</div>';}
  else{let h='<div class="adapt-title">Dette øver vi ekstra på neste gang:</div>';subs.slice(0,3).forEach(([sub,n])=>{const p=Math.round(n/S.questions.filter(q=>q.sub===sub).length*100);h+=`<div class="adapt-row"><span style="min-width:80px;font-size:.75rem">${fmtSub(sub)}</span><div class="adapt-bar-wrap"><div class="adapt-bar" style="width:${p}%;background:${p>60?'var(--red)':p>30?'var(--gold)':'var(--green)'}"></div></div><span style="min-width:34px;text-align:right;font-size:.73rem">${n} feil</span></div>`;});as.innerHTML=h;}
  // Rows
  const rows=document.getElementById('res-rows');rows.innerHTML='';
  S.questions.forEach(q=>{const d=document.createElement('div');d.className='rb-row '+(q.ok?'ok':'bad');d.innerHTML=`<span class="rb-q">${(q.eq||q.q).replace(/, x = \?$/,'').replace(/ = \?$/,'')}</span><span class="rb-a ${q.ok?'ok':'bad'}">${q.ok?`= ${q.correctTxt??q.correct} ✓`:`${q.givenTxt??q.given} ✗ (${q.correctTxt??q.correct})`}</span>`;rows.appendChild(d);});
  saveHS();renderHS();
  // World badges (worldN = both grades of WORLDS[N-1] fully mastered) + rebuild maps now that hs is saved
  WORLDS.forEach((w,i)=>{if(w.grades.every(g=>{const ts=CUR[g]?.topics||[];return ts.length>0&&ts.every(t=>isTopicMastered(g,t.id));}))unlockAchievement('world'+(i+1));});
  buildGradeMap();
  buildTopicMap(S.grade);
  pgResults(); // PROGRESSION: "Neste:" goal
}

function fmtSub(s){const N={a20t:'10 + et tall',a20n:'Til 20 uten å gå over tieren',a20o:'Over tieren (f.eks. 8 + 5)',a100t:'Hele tiere +',a100e:'Tosifret + ensifret',a100c:'Tosifret + ensifret over tieren',a100n:'Tosifret + tosifret',a100x:'Tosifret + tosifret over tieren',s100t:'Hele tiere −',s100e:'Tosifret − ensifret',s100b:'Tosifret − ensifret under tieren',s100n:'Tosifret − tosifret',s100x:'Tosifret − tosifret under tieren','hop1':'Telle 1 fremover','hop-1':'Telle 1 bakover',hop2:'Telle med 2',hop5:'Telle med 5',hop10:'Telle med 10',dob:'Dobling',dob2:'Dobling av store tall',halv:'Halvering',halv2:'Halvering av store tall','mis+a':'Finn tallet: ? + 4 = 9','mis+b':'Finn tallet: 5 + ? = 9','mis-':'Finn tallet: 9 − ? = 5',mis10:'Hele tiere som mangler',mis100:'Opp til neste tier','dec+':'Desimaltall +','dec-':'Desimaltall −',rnd1:'Avrunding til heltall',rnd10:'Avrunding til tiere','fr+':'Brøk +','fr-':'Brøk −',geo_areal:'Areal',geo_omkrets:'Omkrets','neg+':'Negative tall +','neg-':'Negative tall −','alg+':'Algebra +','alg-':'Algebra −',algx:'Algebra ·',rat1:'Forholdstall',rat2:'Forholdstall',avg:'Gjennomsnitt',eq1:'Likning ax = b',eq2:'Likning ax + b = c',sq:'Kvadrattall',cub:'Kubikktall',pot:'Potenser',pctinc:'Prosentvis økning',pctdec:'Prosentvis nedgang',pyth_a:'Pytagoras: finn a',pyth_b:'Pytagoras: finn b',pyth_c:'Pytagoras: finn c',median:'Median',mode:'Typetall',range:'Variasjonsbredde',sys:'Likningssett',quad:'Kvadratrot',expand:'Parenteser',func_lin:'Lineær funksjon',func_lin2:'Lineær funksjon',func_quad:'Andregradsfunksjon',prob_dice:'Sannsynlighet: terning',prob_coin:'Sannsynlighet: mynt',prob_bag:'Sannsynlighet: kuler'};if(N[s])return N[s];let m;if(m=s.match(/^(\d+)([+-])(\d+)$/))return`${m[1]} ${m[2]} ${m[3]}`;if(m=s.match(/^x(\d+)$/))return`${m[1]}-gangen`;if(m=s.match(/^d(\d+)$/))return`Del med ${m[1]}`;if(m=s.match(/^v(\d)$/))return`Tiervenner ${m[1]} + ${10-m[1]}`;if(/^1\/\d+$/.test(s))return`Brøk ${s}`;if(m=s.match(/^p(?:ct)?(\d+)$/))return`${m[1]} % av et tall`;if(m=s.match(/^r(\d+)$/))return`Runde tall (${m[1]})`;if(m=s.match(/^trig_(\w+)$/))return`Trigonometri: ${m[1]}`;return s;}
function saveHS(){const k=`hs_${S.grade}_${S.topicId}`;const p=JSON.parse(localStorage.getItem(k)||'[]');p.push({score:roundScore().s10,ko:S.enemyDefeated,date:new Date().toLocaleDateString('no-NO')});p.sort((a,b)=>b.score-a.score);localStorage.setItem(k,JSON.stringify(p.slice(0,5)));}
function renderHS(){const k=`hs_${S.grade}_${S.topicId}`;const s=JSON.parse(localStorage.getItem(k)||'[]');const medals=['🥇','🥈','🥉','4️⃣','5️⃣'];document.getElementById('hs-rows').innerHTML=s.length?s.map((s,i)=>`<div class="hs-row"><span>${medals[i]} ${s.date}</span><span class="hs-score">${s.ko?'💥 ':''}${s.score}/10</span></div>`).join(''):'Ingen rekorder ennå!';}

// ============================================================
// PARENT REPORT
// ============================================================
function showParentReport(){
  const {n,pct,perfect}=roundScore(),stars=Math.ceil(pct*3);
  document.getElementById('pr-date').textContent=new Date().toLocaleDateString('no-NO',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
  document.getElementById('pr-topic-name').textContent=S.topic.name;
  document.getElementById('pr-grade-name').textContent=`${S.grade}. klasse`;
  document.getElementById('pr-correct').textContent=S.score;
  document.getElementById('pr-wrong').textContent=n-S.score;
  document.getElementById('pr-pct').textContent=Math.round(S.score/n*100)+'%';
  document.getElementById('pr-stars').textContent='⭐'.repeat(stars)+'☆'.repeat(3-stars);
  const ok=S.questions.filter(q=>q.ok),bad=S.questions.filter(q=>!q.ok);
  document.getElementById('pr-strengths').innerHTML=(ok.length?`<div class="pr-strength">Riktig på ${ok.length} av ${n} oppgaver i "${S.topic.name}"</div>`:
    '<div class="pr-weakness">Ingen riktige denne runden</div>')+(S.enemyDefeated?`<div class="pr-strength">💥 Vant kampen på K.O. etter ${n} av ${TQ} oppgaver</div>`:'');
  const subE={};bad.forEach(q=>subE[q.sub]=(subE[q.sub]||0)+1);
  document.getElementById('pr-weaknesses').innerHTML=Object.entries(subE).sort((a,b)=>b[1]-a[1]).map(([s,n])=>`<div class="pr-weakness">${fmtSub(s)}: ${n} feil</div>`).join('')||'<div class="pr-strength">Ingen svake punkter!</div>';
  document.getElementById('pr-breakdown').innerHTML=S.questions.map((q,i)=>`<div class="pr-qrow"><span>${i+1}. ${(q.eq||q.q).replace(/, x = \?$/,'').replace(/ = \?$/,'')}</span><span style="color:${q.ok?'var(--green)':'var(--red)'};font-weight:800">${q.ok?`= ${q.correctTxt??q.correct} ✓`:`${q.givenTxt??q.given} ✗ (${q.correctTxt??q.correct})`}</span></div>`).join('');
  const rec=document.getElementById('pr-rec');
  if(perfect)rec.textContent='Perfekt resultat! Gå videre til neste tema eller klassetrinn.';
  else if(pct>=.8)rec.textContent='Veldig bra! Noen runder til for å befeste kunnskapen, deretter videre.';
  else{const tw=bad.length?fmtSub(bad[0].sub):'noen oppgaver';rec.innerHTML=`Spillet gir ekstra trening på <strong>${tw}</strong> automatisk. 10 min om dagen gir stor fremgang!`;}
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
  if(jump){const x1=10+(start-from)/total*w,x2=10+(start+jump-from)/total*w;html+=`<div class="nline-arrow" style="left:${Math.min(x1,x2)}px;--w:${Math.abs(x2-x1)}px"></div><div class="nline-dot" style="left:${x2}px;background:var(--green)"></div>`;}
  return html+'</div></div>';
}
function fracBar(num,den,color='#7c3aed'){
  return `<div class="frac-bar">${Array.from({length:den},(_,i)=>`<div class="frac-seg ${i<num?'filled':'empty'}" style="background:${color}"></div>`).join('')}</div><div style="text-align:center;margin-top:6px;font-family:'Fredoka One',cursive;font-size:.9rem;color:var(--white)">${num}/${den} er farget</div>`;
}
function mulGridLabel(rows,cols,color='#00ff88'){
  let h=`<div class="mul-grid" style="grid-template-columns:repeat(${cols},26px)">`;
  for(let r=0;r<rows;r++)for(let c=0;c<cols;c++)h+=`<div class="mul-cell" style="background:${color}22;border:1px solid ${color}44;animation-delay:${(r*cols+c)*30}ms">●</div>`;
  return h+`</div><div style="text-align:center;margin-top:8px;font-family:'Fredoka One',cursive;font-size:.9rem;color:var(--muted)">${rows} · ${cols} = ${rows*cols}</div>`;
}
function workedEx(steps){
  return `<div class="worked">${steps.map(([txt,ann,hl],i)=>`<div class="step ${hl?'hl':''}" style="animation-delay:${i*200}ms"><span>${txt}</span>${ann?`<span class="ann">${ann}</span>`:''}</div>`).join('')}</div>`;
}
function eqBox(txt){return `<div class="eq-box">${txt}</div>`;}
// Tierramme: a prikker i farge 1, b i farge 2 (flere rammer hvis over 10)
function tenFrame(a,b=0,c1='#7c3aed',c2='#00ff88'){
  let h='<div class="tf-wrap">';
  for(let f=0;f<Math.max(1,Math.ceil((a+b)/10));f++){h+='<div class="tf">';for(let i=f*10;i<f*10+10;i++){const c=i<a?c1:i<a+b?c2:'';h+=`<div class="tf-cell">${c?`<div class="dot" style="background:${c};animation-delay:${i*50}ms"></div>`:''}</div>`;}h+='</div>';}
  return h+'</div>';
}
// Tallrekke med hopp-merker mellom boksene; hl = indeks som utheves
function seqHops(ts,lbl,hl=-1){return `<div class="seq-row">${ts.map((t,i)=>`${i?`<span class="seq-hop">${lbl}</span>`:''}<span class="seq-box${i===hl?' hl':''}" style="animation-delay:${i*150}ms">${t}</span>`).join('')}</div>`;}
function pills(arr,c='#00ff88'){return `<div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center">${arr.map((t,i)=>`<div style="background:${c}1a;border:1px solid ${c}55;border-radius:8px;padding:5px 10px;font-family:'Fredoka One',cursive;font-size:.95rem;color:var(--white);animation:dotPop .3s ease ${i*80}ms backwards">${t}</div>`).join('')}</div>`;}
function capLine(t){return `<div style="text-align:center;margin-top:8px;font-family:'Fredoka One',cursive;font-size:1.05rem;color:var(--white)">${t}</div>`;}
function rectFig(w,h){const u=24,lb=t=>`<div style="font-family:'Fredoka One',cursive;color:var(--gold)">${t}</div>`;return `<div style="display:inline-flex;flex-direction:column;align-items:center;gap:4px">${lb(w)}<div style="display:flex;align-items:center;gap:6px">${lb(h)}<div style="width:${w*u}px;height:${h*u}px;border:3px solid var(--cyan);border-radius:4px;box-shadow:var(--glow-c)"></div>${lb(h)}</div>${lb(w)}</div>`;}
function grn(t){return `<span style="color:var(--green)">${t}</span>`;}

const LEARN_GUIDES={
  add10:[
    {icon:'➕',title:'Slå sammen!',text:'Frosken har 3 epler. Uglen har 2. Hvor mange har de til sammen? 🍎',
     visual:`<div class="dot-groups">${dotGroup(3,'#7c3aed')} <span class="dot-op">+</span> ${dotGroup(2,'#a855f7')} <span class="dot-eq">=</span> ${dotGroup(5,'#00ff88',200)}</div>`+capLine(`3 + 2 = ${grn('5')}`)},
    {icon:'🐸',title:'Hopp på tallinja',text:'Start på det første tallet. Hopp fremover like mange ganger som det andre tallet.',
     visual:numLine(0,10,3,4)+capLine(`4 + 3: Start på 4, hopp 3 → ${grn('7')}`)},
    {icon:'🎯',title:'Nå er det din tur!',text:'Start på 6 og tell 4 fremover.',
     visual:workedEx([['6 + 4 = ?','',false],['Start på 6','',false],['7, 8, 9, 10','(tell 4 fremover)',true],['6 + 4 = 10 ✓','',false]])}
  ],
  sub10:[
    {icon:'➖',title:'Trollet tar!',text:'Du har 5 kaker. Trollet tar 2. Hvor mange er igjen? 🍪',
     visual:`<div class="dot-groups">${dotGroup(5,'#7c3aed')} <span class="dot-op">-</span> <span style="font-size:1.2rem;font-weight:800;color:var(--red)">2</span> <span class="dot-eq">=</span> ${dotGroup(3,'#7c3aed',200)}</div>`+capLine(`5 - 2 = ${grn('3')}`)},
    {icon:'🐸',title:'Hopp bakover',text:'Start på det store tallet. Hopp bakover på tallinja.',
     visual:numLine(0,10,-3,7)+capLine(`7 - 3 = ${grn('4')}`)},
    {icon:'🎯',title:'Nå er det din tur!',text:'Start på 8 og tell 5 bakover.',
     visual:workedEx([['8 - 5 = ?','',false],['Start på 8','',false],['7, 6, 5, 4, 3','(tell 5 bakover)',true],['8 - 5 = 3 ✓','',false]])}
  ],
  ten1:[
    {icon:'🤝',title:'Tallene som holder hender',text:'Tallet 7 vil bli 10. Det trenger en venn: 3! To tall som blir 10 sammen, er tiervenner.',
     visual:tenFrame(7,3)+capLine(`7 + 3 = ${grn('10')}`)},
    {icon:'🔍',title:'Tell de tomme rutene',text:'Det er plass til 10. De tomme rutene viser hvor mange som mangler.',
     visual:tenFrame(6)+capLine(`6 + ? = 10 → 4 tomme ruter → ${grn('4')}`)},
    {icon:'🖐️',title:'Bruk fingrene',text:'Vis 10 fingre. Bøy ned 6. Hvor mange står igjen? Det er tiervennen!',
     visual:`<div style="font-size:2.4rem">🖐️🖐️</div>`+capLine(`10 - 6 = ${grn('4')}`)},
    {icon:'📋',title:'Alle tiervennene',text:'Lær dem utenat. Da blir du lynrask! ⚡',
     visual:pills(['1 + 9','2 + 8','3 + 7','4 + 6','5 + 5'],'#ffd93d')},
    {icon:'🎯',title:'Nå er det din tur!',text:'Hvor mange mangler fra 8 til 10?',
     visual:workedEx([['8 + ? = 10','',false],['9, 10','(2 hopp)',true],['8 + 2 = 10 ✓','',false]])}
  ],
  seq1:[
    {icon:'🐸',title:'Frosken hopper',text:'Frosken hopper like langt hver gang. Hvor lander den nå?',
     visual:seqHops([2,4,6,8,'?'],'+2',4)+capLine(`Hoppet er 2. Etter 8 kommer ${grn('10')}`)},
    {icon:'🦘',title:'Små og store hopp',text:'Noen hopper 1. Noen hopper 5. Noen hopper hele 10!',
     visual:seqHops([5,6,7,8],'+1')+'<div style="height:8px"></div>'+seqHops([5,10,15,20],'+5')+'<div style="height:8px"></div>'+seqHops([10,20,30,40],'+10')},
    {icon:'🚀',title:'Nedtelling!',text:'Raketten teller ned. Da blir tallene mindre.',
     visual:seqHops([9,8,7,'?'],'−1',3)+capLine(`Etter 7 kommer ${grn('6')}. 🚀`)},
    {icon:'🎯',title:'Nå er det din tur!',text:'Finn hoppet først. Hopp så videre.',
     visual:workedEx([['10, 20, ?, 40','',false],['Hoppet er 10','(10 → 20)',true],['20 + 10 = 30','',true],['Svaret er 30 ✓','',false]])}
  ],
  add20:[
    {icon:'🔟',title:'Fyll opp tieren',text:'Blir det mer enn 10? Fyll opp til 10 først. Legg så til resten.',
     visual:tenFrame(8,5)+capLine(`8 + 2 = 10, og 3 til = ${grn('13')}`)},
    {icon:'✂️',title:'Del opp tallene',text:'Del opp i tiere og enere. Legg sammen enerne først.',
     visual:workedEx([['13 + 5 = ?','',false],['13 = 10 + 3','(del opp 13)',true],['3 + 5 = 8','(enerne)',true],['10 + 8 = 18 ✓','',false]])},
    {icon:'🎯',title:'Nå er det din tur!',text:'Bruk tiervennen til 9.',
     visual:workedEx([['9 + 6 = ?','',false],['9 + 1 = 10','(fyll opp tieren)',true],['Det er 5 igjen av 6','',false],['10 + 5 = 15 ✓','',false]])}
  ],
  add100:[
    {icon:'✂️',title:'Tiere og enere',text:'Del opp begge tallene. Tiere for seg, enere for seg.',
     visual:workedEx([['34 + 25 = ?','',false],['30 + 20 = 50','(tierne)',true],['4 + 5 = 9','(enerne)',true],['50 + 9 = 59 ✓','',false]])},
    {icon:'🎯',title:'Over tieren',text:'Blir enerne mer enn 10? Da får du en ny tier!',
     visual:workedEx([['47 + 6 = ?','',false],['7 + 6 = 13','(enerne)',true],['40 + 13 = 53 ✓','',false]])}
  ],
  sub100:[
    {icon:'🐸',title:'Ta tierne først',text:'Hopp ned tierne først. Hopp så ned enerne.',
     visual:workedEx([['52 - 17 = ?','',false],['52 - 10 = 42','(tierne)',true],['42 - 7 = 35','(enerne)',true],['52 - 17 = 35 ✓','',false]])},
    {icon:'🔄',title:'Hopp via tieren',text:'Gå ned til nærmeste tier først. Ta så resten.',
     visual:workedEx([['42 - 7 = ?','',false],['42 - 2 = 40','(ned til tieren)',true],['40 - 5 = 35','(resten)',true],['= 35 ✓','',false]])}
  ],
  miss2:[
    {icon:'🕵️',title:'Bli tall-detektiv!',text:'Spørsmålstegnet gjemmer et tall. Kan du finne det?',
     visual:`<div class="dot-groups">${dotGroup(5,'#7c3aed')} <span class="dot-op">+</span> <span style="font-family:'Fredoka One',cursive;font-size:1.6rem;color:var(--gold)">?</span> <span class="dot-eq">=</span> ${dotGroup(8,'#00ff88',200)}</div>`+capLine('5 + ? = 8')},
    {icon:'🐸',title:'Tell opp',text:'Start på tallet du har. Hopp opp til svaret og tell hoppene.',
     visual:numLine(0,10,3,5)+capLine(`Fra 5 til 8 er det 3 hopp. 5 + ${grn('3')} = 8`)},
    {icon:'🔄',title:'Regn baklengs',text:'Du kan også bruke minus for å finne tallet.',
     visual:workedEx([['? + 4 = 9','',false],['9 - 4 = 5','(regn baklengs)',true],['5 + 4 = 9 ✓','(sjekk)',false]])},
    {icon:'🍦',title:'Nå er det din tur!',text:'Du har 46 kr. En is koster 50 kr. Hvor mye mangler du?',
     visual:workedEx([['46 + ? = 50','',false],['47, 48, 49, 50','(4 hopp)',true],['46 + 4 = 50 ✓','',false]])}
  ],
  dbl2:[
    {icon:'👯',title:'Tvillingtall',text:'Dobbelt betyr to like mange. Dobbelt av 4 er 4 + 4.',
     visual:`<div class="dot-groups">${dotGroup(4,'#f093fb')} <span class="dot-op">+</span> ${dotGroup(4,'#f093fb',160)} <span class="dot-eq">=</span> ${dotGroup(8,'#00ff88',320)}</div>`+capLine(`Dobbelt av 4 = ${grn('8')}`)},
    {icon:'🍪',title:'Del likt med en venn',text:'Halvparten betyr å dele i to like store deler.',
     visual:`<div class="dot-groups">${dotGroup(8,'#06d6ff')} <span class="dot-eq">→</span> ${dotGroup(4,'#00ff88',200)} <span class="dot-op">|</span> ${dotGroup(4,'#00ff88',360)}</div>`+capLine(`Halvparten av 8 = ${grn('4')}`)},
    {icon:'🔁',title:'De henger sammen',text:'Dobbelt av 6 er 12. Da er halvparten av 12 lik 6!',
     visual:pills(['6 → dobbelt → 12','12 → halvparten → 6'],'#f093fb')},
    {icon:'🎯',title:'Nå er det din tur!',text:'Ta tierne og enerne hver for seg.',
     visual:workedEx([['Dobbelt av 23','',false],['20 + 20 = 40','(tierne)',true],['3 + 3 = 6','(enerne)',true],['40 + 6 = 46 ✓','',false]])}
  ],
  mul25:[
    {icon:'✖️',title:'Like grupper',text:'Ganging er like grupper. 3 · 4 betyr 3 grupper med 4.',
     visual:`<div style="display:flex;flex-direction:column;align-items:center;gap:6px">${[0,1,2].map(i=>`<div style="display:flex;gap:4px">${dots(4,['#7c3aed','#a855f7','#06d6ff'][i],i*100)}</div>`).join('')}</div>`+capLine(`3 · 4 = 4 + 4 + 4 = ${grn('12')}`)},
    {icon:'⭐',title:'2-, 5- og 10-gangen',text:'5-gangen slutter alltid på 0 eller 5. 10-gangen: bare legg til en 0!',
     visual:`<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px">${[2,5,10].map(t=>`<div><div style="font-family:'Fredoka One',cursive;font-size:.85rem;color:var(--gold);margin-bottom:4px">${t}-gangen</div>${[1,2,3,4].map(n=>`<div style="font-size:.8rem;font-weight:800;color:var(--white)">${n} · ${t} = ${n*t}</div>`).join('')}</div>`).join('')}</div>`},
    {icon:'🖐️',title:'Nå er det din tur!',text:'4 hender med 5 fingre. Hvor mange fingre?',
     visual:workedEx([['4 · 5 = ?','',false],['= 5 + 5 + 5 + 5','(fire 5-ere)',true],['= 10 + 10','',true],['= 20 ✓','',false]])}
  ],
  mul15:[
    {icon:'📋',title:'Gangetabellen 1–5',text:'Gangetabellen er et fast mønster. La oss lære den!',
     visual:mulGridLabel(3,4,'#00ff88')},
    {icon:'🔢',title:'3-gangen',text:'Tell opp i tresteg: 3, 6, 9, 12, 15 …',
     visual:`<div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center">${[1,2,3,4,5].map(n=>`<div style="background:rgba(0,255,136,.1);border:1px solid rgba(0,255,136,.3);border-radius:8px;padding:5px 10px;font-family:'Fredoka One',cursive;font-size:.9rem">${n} · 3 = ${n*3}</div>`).join('')}</div>`},
    {icon:'🎯',title:'Prøv 4 · 4',text:'',
     visual:workedEx([['4 · 4 = ?','',false],['4 + 4 + 4 + 4','(fire 4-ere)',true],['= 16 ✓','',false]])}
  ],
  div25:[
    {icon:'➗',title:'Deling er omvendt ganging',text:'12 : 3 = ? Tenk: ? · 3 = 12',
     visual:workedEx([['20 : 5 = ?','',false],['Tenk: ? · 5 = 20','(snu om!)',true],['4 · 5 = 20 ✓','',false],['20 : 5 = 4 ✓','',false]])}
  ],
  add100r:[
    {icon:'🔟',title:'Tell tiere',text:'Tenk på hver tier som en pakke. 30 + 40 er 3 tiere + 4 tiere.',
     visual:workedEx([['30 + 40 = ?','',false],['3 + 4 = 7','(tell tierne)',true],['7 tiere = 70 ✓','',false]])},
    {icon:'💯',title:'Hundrere',text:'Det samme gjelder hundrere. 200 + 500 er 2 + 5 = 7 hundrere.',
     visual:pills(['200 + 500 = 700','300 + 300 = 600','100 + 800 = 900'],'#06d6ff')},
    {icon:'🎯',title:'Prøv: 150 + 250',text:'Del opp i hundrere og tiere.',
     visual:workedEx([['150 + 250 = ?','',false],['100 + 200 = 300','(hundrere)',true],['50 + 50 = 100','(tiere)',true],['300 + 100 = 400 ✓','',false]])}
  ],
  mul110:[
    {icon:'📋',title:'Gangetabellen 1–10',text:'De vanskeligste: 6 · 7, 6 · 8, 7 · 8, 6 · 9, 7 · 9, 8 · 9',
     visual:`<div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center">${[[6,7],[6,8],[7,8],[6,9],[7,9],[8,9]].map(([a,b])=>`<div style="background:rgba(168,85,247,.15);border:1px solid rgba(168,85,247,.3);border-radius:8px;padding:6px 12px;font-family:'Fredoka One',cursive;font-size:.9rem">${a} · ${b} = ${a*b}</div>`).join('')}</div>`},
    {icon:'🧠',title:'Triks: del opp',text:'8 · 7 = 8 · 5 + 8 · 2 = 40 + 16 = 56',
     visual:workedEx([['8 · 7 = ?','',false],['= 8 · 5 + 8 · 2','(del opp 7)',true],['= 40 + 16','',false],['= 56 ✓','',false]])}
  ],
  div110:[
    {icon:'➗',title:'Deling med gangetabellen',text:'Kan du gangetabellen? Da kan du dele også!',
     visual:workedEx([['56 : 7 = ?','',false],['Tenk: ? · 7 = 56','',true],['8 · 7 = 56','',true],['= 8 ✓','',false]])}
  ],
  frac4:[
    {icon:'🍕',title:'Hva er en brøk?',text:'En brøk viser deler av en hel. 1/4 er én av fire like deler.',
     visual:`<div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap">${[[1,2,'#7c3aed'],[1,4,'#a855f7'],[1,3,'#06d6ff']].map(([n,d,c])=>`<div style="text-align:center"><div style="margin-bottom:6px">${fracBar(n,d,c)}</div></div>`).join('')}</div>`},
    {icon:'📐',title:'Finn brøkdelen av et tall',text:'1/2 = del på 2. 1/4 = del på 4. 1/3 = del på 3.',
     visual:workedEx([['1/4 av 20 = ?','',false],['Del 20 på 4','(nevneren er 4)',true],['20 : 4 = 5','',false],['= 5 ✓','',false]])}
  ],
  dec5:[
    {icon:'📏',title:'Desimaltall',text:'Kommaet skiller hele fra deler. Sett komma rett under komma!',
     visual:`<div style="font-family:'Fredoka One',cursive;font-size:1.1rem;text-align:right;background:rgba(255,255,255,.05);border-radius:10px;padding:12px 20px;border:1px solid rgba(255,255,255,.1)"><div>3<span style="color:var(--red)">,</span>4</div><div>+ 2<span style="color:var(--red)">,</span>1</div><div style="border-top:1px solid rgba(255,255,255,.2);margin-top:4px">5<span style="color:var(--red)">,</span>5 ✓</div></div>`},
    {icon:'🎯',title:'Prøv 4,6 + 2,3',text:'',
     visual:workedEx([['4,6 + 2,3 = ?','',false],['Enere: 4 + 2 = 6','',false],['Tideler: 6 + 3 = 9','',false],['= 6,9 ✓','',false]])}
  ],
  pct5:[
    {icon:'💯',title:'Hva er prosent?',text:'Prosent betyr hundredeler. 50 % er halvparten. 10 % er en tidel.',
     visual:`<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">${[[50,'Halvparten','#7c3aed'],[25,'En firedel','#a855f7'],[10,'En tidel','#06d6ff']].map(([p,n,c])=>`<div style="text-align:center"><div class="frac-bar" style="max-width:80px">${Array.from({length:10},(_,i)=>`<div class="frac-seg ${i<p/10?'filled':'empty'}" style="background:${c}"></div>`).join('')}</div><div style="font-family:'Fredoka One',cursive;font-size:.82rem;margin-top:4px">${p} % = ${n}</div></div>`).join('')}</div>`},
    {icon:'🎯',title:'Prøv 10 % av 350',text:'',
     visual:workedEx([['10 % av 350','',false],['10 % = del på 10','',true],['350 : 10 = 35 ✓','',false]])}
  ],
  round5:[
    {icon:'🎯',title:'Avrunding',text:'Se på neste siffer: 5 eller mer = rund opp. Under 5 = rund ned.',
     visual:workedEx([['Rund av 3,7','',false],['Tidelen er 7','',false],['7 ≥ 5 → rund OPP','',true],['= 4 ✓','',false]])}
  ],
  frac6:[
    {icon:'🥧',title:'Lik nevner',text:'Har brøkene lik nevner? Da regner du bare med tellerne.',
     visual:`<div style="display:flex;flex-direction:column;gap:6px">${fracBar(1,4,'#a855f7')}${fracBar(2,4,'#06d6ff')}</div>`+capLine(`1/4 + 2/4 = ${grn('3/4')}`)},
    {icon:'🔁',title:'Ulik nevner',text:'Gjør nevnerne like først. 1/2 er det samme som 2/4.',
     visual:`<div style="display:flex;flex-direction:column;gap:6px">${fracBar(1,2,'#7c3aed')}${fracBar(2,4,'#7c3aed')}</div>`},
    {icon:'🎯',title:'Prøv 1/2 + 1/4',text:'Fellesnevneren er 4.',
     visual:workedEx([['1/2 + 1/4 = ?','',false],['1/2 = 2/4','(fellesnevner 4)',true],['2/4 + 1/4 = 3/4 ✓','',false]])},
    {icon:'⌨️',title:'Slik svarer du',text:'Trykk / for å skrive en brøk, for eksempel 3/4. Du kan også svare 0,75. Lik brøk, som 6/8, er også riktig.',
     visual:eqBox('3/4 = 6/8 = 0,75')}
  ],
  geo6:[
    {icon:'🟦',title:'Omkrets',text:'Omkrets er veien rundt figuren. Legg sammen alle sidene.',
     visual:rectFig(5,3)+capLine(`5 + 3 + 5 + 3 = ${grn('16')}`)},
    {icon:'🧱',title:'Areal',text:'Areal er hvor mange ruter som får plass inni. Gang lengde med bredde.',
     visual:mulGridLabel(3,5,'#06d6ff')},
    {icon:'🎯',title:'Prøv: kvadrat med side 6',text:'Et kvadrat har fire like lange sider.',
     visual:workedEx([['Omkrets: 6 + 6 + 6 + 6','',false],['= 4 · 6 = 24','',true],['Areal: 6 · 6 = 36','',true]])}
  ],
  neg6:[
    {icon:'🌡️',title:'Tall under null',text:'Negative tall er mindre enn 0. Tenk på et termometer om vinteren: −5 grader.',
     visual:numLine(-5,5,0,-3)+capLine('−3 ligger 3 steg til venstre for 0')},
    {icon:'➡️',title:'Pluss: gå til høyre',text:'Når du legger til, går du til høyre på tallinja.',
     visual:numLine(-5,5,4,-3)+capLine(`−3 + 4 = ${grn('1')}`)},
    {icon:'⬅️',title:'Minus: gå til venstre',text:'Når du trekker fra, går du til venstre.',
     visual:numLine(-5,5,-6,2)+capLine(`2 − 6 = ${grn('−4')}`)},
    {icon:'⌨️',title:'Slik skriver du minus',text:'Trykk ± for å sette minus foran tallet.',
     visual:eqBox('−4')}
  ],
  alg7:[
    {icon:'🔍',title:'Algebra: finn x',text:'x er et ukjent tall. Vi løser gåten om hva x er.',
     visual:eqBox('x + 5 = 12 → x = ?')},
    {icon:'⚖️',title:'Vektprinsippet',text:'Gjør det samme på begge sider av likhetstegnet!',
     visual:workedEx([['x + 5 = 12','',false],['Trekk fra 5 på begge sider','',true],['x = 12 - 5 = 7 ✓','',false]])}
  ],
  ratio7:[
    {icon:'🧃',title:'Hva er forhold?',text:'Saft blandes ofte 1 : 4. Det betyr 1 del saft og 4 deler vann.',
     visual:`<div class="dot-groups">${dotGroup(1,'#ff6b35')} <span class="dot-op">:</span> ${dotGroup(4,'#06d6ff',100)}</div>`+capLine('1 del saft : 4 deler vann')},
    {icon:'✖️',title:'Gang begge med det samme',text:'Forholdet er det samme når du ganger begge tallene med samme tall.',
     visual:workedEx([['1 : 4 = 2 : 8','(· 2)',true],['1 : 4 = 3 : 12','(· 3)',true]])},
    {icon:'🎯',title:'Prøv 3 : 5 = 9 : ?',text:'',
     visual:workedEx([['3 · 3 = 9','(finn gangetallet)',true],['5 · 3 = 15','(gang med det samme)',true],['3 : 5 = 9 : 15 ✓','',false]])}
  ],
  stat7:[
    {icon:'📊',title:'Hva er gjennomsnitt?',text:'Gjennomsnitt er hvor mye hver får hvis vi deler likt.',
     visual:`<div class="dot-groups">${dotGroup(2,'#ffd93d')}${dotGroup(6,'#ffd93d',80)}${dotGroup(4,'#ffd93d',160)}</div><div style="font-size:1.3rem;margin:6px 0">⬇️</div><div class="dot-groups">${dotGroup(4,'#00ff88',300)}${dotGroup(4,'#00ff88',380)}${dotGroup(4,'#00ff88',460)}</div>`+capLine('2, 6 og 4 → 4, 4 og 4')},
    {icon:'🧮',title:'Slik regner du',text:'Legg sammen alle tallene. Del på hvor mange tall det er.',
     visual:workedEx([['2 + 6 + 4 = 12','(summen)',true],['Det er 3 tall','',false],['12 : 3 = 4 ✓','',false]])}
  ],
  eq8:[
    {icon:'⚖️',title:'Lineære likninger',text:'Flytt tallet uten x til høyre side. Del så på tallet foran x.',
     visual:workedEx([['2x + 3 = 11','',false],['2x = 11 - 3 = 8','(trekk fra 3)',true],['x = 8 : 2 = 4 ✓','(del på 2)',true]])}
  ],
  pow8:[
    {icon:'🚀',title:'Potenser',text:'3² = 3 · 3 = 9. Eksponenten sier hvor mange ganger vi ganger tallet med seg selv.',
     visual:`<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">${[[2,2],[2,3],[3,2],[4,2]].map(([b,e])=>`<div style="background:rgba(255,217,61,.1);border:1px solid rgba(255,217,61,.3);border-radius:8px;padding:6px 12px;font-family:'Fredoka One',cursive">${b}${sup(e)} = ${Math.pow(b,e)}</div>`).join('')}</div>`}
  ],
  pct8:[
    {icon:'🏷️',title:'Prosent av et tall',text:'10 % er en tidel. Finn 10 % først, og bygg videre.',
     visual:workedEx([['20 % av 300','',false],['10 % = 300 : 10 = 30','',true],['20 % = 2 · 30 = 60 ✓','',false]])},
    {icon:'📈',title:'Øke med prosent',text:'Øker et tall med 20 %, får du 120 % av tallet. Gang med 1,2.',
     visual:workedEx([['500 økes med 20 %','',false],['500 · 1,2 = 600 ✓','',true]])},
    {icon:'📉',title:'Minke med prosent',text:'Reduseres et tall med 25 %, er 75 % igjen. Gang med 0,75.',
     visual:workedEx([['400 reduseres med 25 %','',false],['400 · 0,75 = 300 ✓','',true]])}
  ],
  pyth9:[
    {icon:'📐',title:'Pytagoras',text:'I en rettvinklet trekant er a² + b² = c². c er den lengste siden.',
     visual:`<div style="text-align:center"><div style="font-family:'Fredoka One',cursive;font-size:1.3rem;color:var(--cyan)">a² + b² = c²</div><div style="font-size:3rem;margin:10px 0">📐</div></div>`},
    {icon:'🎯',title:'a = 3, b = 4 → c = ?',text:'',
     visual:workedEx([['c² = 3² + 4²','',false],['= 9 + 16 = 25','',true],['c = √25 = 5 ✓','',false]])}
  ],
  stat9:[
    {icon:'📏',title:'Median',text:'Sorter tallene. Medianen er tallet i midten. Er det to i midten, tar du gjennomsnittet av dem.',
     visual:workedEx([['7, 2, 9, 4, 5','',false],['2, 4, 5, 7, 9','(sortert)',true],['Median = 5 ✓','',false]])},
    {icon:'🔁',title:'Typetall',text:'Typetallet er tallet som kommer flest ganger.',
     visual:workedEx([['3, 5, 3, 8, 3, 5','',false],['3 kommer 3 ganger','',true],['Typetall = 3 ✓','',false]])},
    {icon:'↔️',title:'Variasjonsbredde',text:'Ta det største tallet minus det minste.',
     visual:workedEx([['4, 12, 7, 2','',false],['12 − 2 = 10','(størst − minst)',true],['Variasjonsbredde = 10 ✓','',false]])}
  ],
  alg9:[
    {icon:'🧩',title:'To likninger',text:'Legg likningene sammen. Da forsvinner y!',
     visual:workedEx([['x + y = 10','',false],['x − y = 4','',false],['2x = 14','(legg sammen)',true],['x = 7 ✓','',false]])},
    {icon:'🔲',title:'Kvadratrot',text:'x² = 49 betyr: hvilket tall ganger seg selv blir 49? Her bruker vi det positive svaret.',
     visual:workedEx([['x² = 49','',false],['7 · 7 = 49','',true],['x = 7 ✓','',false]])},
    {icon:'📦',title:'Parenteser',text:'Del på tallet foran parentesen først.',
     visual:workedEx([['3(x + 2) = 21','',false],['x + 2 = 7','(del på 3)',true],['x = 5 ✓','',false]])}
  ],
  func10:[
    {icon:'⚙️',title:'Funksjoner',text:'f(x) er en maskin: putt inn x, og få ut et tall.',
     visual:`<div style="font-family:'Fredoka One',cursive;text-align:center"><div style="font-size:1.1rem;margin-bottom:10px">f(x) = 2x + 3</div><div style="display:flex;gap:6px;justify-content:center;flex-wrap:wrap">${[1,2,3,4].map(x=>`<div style="background:rgba(255,217,61,.1);border:1px solid rgba(255,217,61,.3);border-radius:8px;padding:5px 10px;font-size:.88rem">f(${x}) = ${2*x+3}</div>`).join('')}</div></div>`},
    {icon:'🎯',title:'Prøv f(x) = 3x − 2, f(4) = ?',text:'',
     visual:workedEx([['f(4) = 3 · 4 − 2','',false],['= 12 − 2','',false],['= 10 ✓','',false]])}
  ],
  trig10:[
    {icon:'🔺',title:'Sinus, cosinus og tangens',text:'I en rettvinklet trekant med vinkel v:',
     visual:eqBox('sin v = motstående / hypotenus')+eqBox('cos v = hosliggende / hypotenus')+eqBox('tan v = motstående / hosliggende')},
    {icon:'📋',title:'Verdier å huske',text:'Disse vinklene kommer ofte. Lær tabellen!',
     visual:`<div style="display:grid;grid-template-columns:repeat(4,auto);gap:4px 14px;justify-content:center;font-family:'Fredoka One',cursive;font-size:.95rem">${['','sin','cos','tan','0°','0','1','0','30°','0,5','0,87','0,58','45°','0,71','0,71','1','60°','0,87','0,5','1,73','90°','1','0','–'].map((t,i)=>`<div style="color:${i<4||i%4===0?'var(--gold)':'var(--white)'}">${t}</div>`).join('')}</div>`},
    {icon:'⌨️',title:'Slik svarer du',text:'Svar med to desimaler, for eksempel 0,87. Du kan også skrive 1/2.',
     visual:eqBox('sin(60°) ≈ 0,87')}
  ],
  prob10:[
    {icon:'🎲',title:'Hva er sannsynlighet?',text:'Sannsynlighet er gunstige utfall delt på mulige utfall.',
     visual:eqBox('P = gunstige / mulige')},
    {icon:'🎯',title:'Terning: P(tall ≤ 2)',text:'1 og 2 er gunstige. Det er 6 mulige.',
     visual:`<div class="seq-row">${[1,2,3,4,5,6].map(n=>`<span class="seq-box${n<=2?' hl':''}">${n}</span>`).join('')}</div>`+capLine(`P = 2/6 = ${grn('1/3')}`)},
    {icon:'🔴',title:'Kuler i en pose',text:'Det er 10 kuler. 3 av dem er røde.',
     visual:`<div class="dot-groups">${dotGroup(3,'#ff4466')}${dotGroup(7,'#8878cc',120)}</div>`+capLine(`P(rød) = ${grn('3/10')} = 0,3`)},
    {icon:'⌨️',title:'Slik svarer du',text:'Trykk / for å skrive en brøk, for eksempel 1/3. Desimaltall går også.',
     visual:eqBox('2/6 = 1/3 ≈ 0,33')}
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
// PROGRESSION
// ============================================================
// Makes progress visible: unlock ceremonies on the maps, rewards that count up,
// a short "NIVÅ OPP!" moment, small next goals, a coin shop and a daily streak.
// Hooks (one line each): renderHUD, buildGradeMap, buildTopicMap, showChest,
// closeChest, buildResults, openHeroCard, showBossResult.
// localStorage: mh_shop_owned, mh_shop_equipped, mh_pg_seen (unlocks already celebrated).
// For the battle screen: getHeroDecor(), applyHeroDecor(el), heroVictoryFx(n).
const PG_SLOTS=[
  {id:'hat',name:'Hatter og kroner',icon:'🎩',desc:'En kul hatt til helten din!'},
  {id:'aura',name:'Auraer',icon:'✨',desc:'Helten din gløder!'},
  {id:'pet',name:'Kjæledyr',icon:'🐾',desc:'En liten venn som følger deg!'},
  {id:'fx',name:'Seierseffekter',icon:'🎉',desc:'Vises når du vinner!'},
];
// Prices vs. earning: ~10–16 coins per normal round, +25 for a first boss win, +5–15 daily bonus
const PG_ITEMS=[
  {id:'cap',slot:'hat',emoji:'🧢',name:'Caps',price:10},
  {id:'sunhat',slot:'hat',emoji:'👒',name:'Solhatt',price:25},
  {id:'tophat',slot:'hat',emoji:'🎩',name:'Flosshatt',price:45},
  {id:'gradcap',slot:'hat',emoji:'🎓',name:'Studenthatt',price:70},
  {id:'crown',slot:'hat',emoji:'👑',name:'Kongekrone',price:100,boss:1},
  {id:'gold',slot:'aura',emoji:'✨',name:'Gullglød',price:20},
  {id:'fire',slot:'aura',emoji:'🔥',name:'Ildaura',price:50},
  {id:'ice',slot:'aura',emoji:'❄️',name:'Isaura',price:60},
  {id:'rainbow',slot:'aura',emoji:'🌈',name:'Regnbueaura',price:120,boss:2},
  {id:'galaxy',slot:'aura',emoji:'🌌',name:'Galakseaura',price:250},
  {id:'bow',slot:'pet',emoji:'🎀',name:'Sløyfe',price:12},
  {id:'chick',slot:'pet',emoji:'🐣',name:'Kyllingvenn',price:35},
  {id:'troll',slot:'pet',emoji:'🧌',name:'Trollvenn',price:60,boss:1},
  {id:'butterfly',slot:'pet',emoji:'🦋',name:'Sommerfugl',price:65},
  {id:'snake',slot:'pet',emoji:'🐍',name:'Ormevenn',price:90,boss:2},
  {id:'crab',slot:'pet',emoji:'🦀',name:'Krabbevenn',price:120,boss:3},
  {id:'unicorn',slot:'pet',emoji:'🦄',name:'Mini-enhjørning',price:300},
  {id:'stars',slot:'fx',emoji:'⭐',name:'Stjerneregn',price:15,rain:['⭐','🌟']},
  {id:'confetti',slot:'fx',emoji:'🎊',name:'Regnbuekonfetti',price:30,colors:['#ff4466','#ff6b35','#ffd93d','#00ff88','#06d6ff','#a855f7']},
  {id:'coinrain',slot:'fx',emoji:'🪙',name:'Myntregn',price:50,rain:['🪙'],colors:['#ffd93d','#f7971e','#fff3b0']},
  {id:'pizza',slot:'fx',emoji:'🍕',name:'Pizzaregn',price:75,rain:['🍕']},
  {id:'diamonds',slot:'fx',emoji:'💎',name:'Diamantregn',price:110,boss:3,rain:['💎'],colors:['#06d6ff','#a855f7','#ffffff']},
  {id:'fireworks',slot:'fx',emoji:'🎆',name:'Fyrverkeri',price:200,rain:['🎆','🎇','✨'],colors:['#ffd93d','#ff4466','#06d6ff','#a855f7','#00ff88']},
];
const pgMQ=window.matchMedia?matchMedia('(prefers-reduced-motion: reduce)'):null;
function pgRM(){return !!(pgMQ&&pgMQ.matches);} // reduced motion: keep the information, drop the movement
function pgSleep(ms){return new Promise(r=>setTimeout(r,ms));}
function pgLoad(k,d){try{const v=JSON.parse(localStorage.getItem(k));return v==null?d:v;}catch(e){return d;}}
function pgEsc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function pgItem(id){return PG_ITEMS.find(i=>i.id===id)||null;}
function pgOwned(){const o=pgLoad('mh_shop_owned',[]);return Array.isArray(o)?o:[];}
function pgEquipped(){const e=pgLoad('mh_shop_equipped',{});return e&&typeof e==='object'&&!Array.isArray(e)?e:{};}
function pgItemOpen(it){return !it.boss||isBossDefeated(it.boss);}
function pgActive(n){return !!document.getElementById('screen-'+n)?.classList.contains('active');}
// Animate fn(e) with e going 0→1 (ease in-out). Finishes at once with reduced motion; a timer backs up rAF.
function pgAnim(ms,fn){return new Promise(res=>{let done=false;const end=()=>{if(done)return;done=true;fn(1);res();};if(pgRM()||!(ms>0))return end();const t0=performance.now();const f=now=>{if(done)return;const t=Math.min(1,(now-t0)/ms);if(t>=1)return end();fn(t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2);requestAnimationFrame(f);};requestAnimationFrame(f);setTimeout(end,ms+700);});}
function pgChime(){[659,784,1046].forEach((f,i)=>setTimeout(()=>tone(f,.14,'triangle',.2),i*110));}
function pgFanfare(){[523,659,784,1046,784,1046,1318].forEach((f,i)=>setTimeout(()=>tone(f,.15,'triangle',.22),i*100));}
function pgToast(icon,title,sub){const t=document.getElementById('achieve-toast');if(!t)return;document.getElementById('at-icon').textContent=icon;document.getElementById('at-title').textContent=title;document.getElementById('at-sub').textContent=sub;t.classList.add('show');clearTimeout(pgToast.t);pgToast.t=setTimeout(()=>t.classList.remove('show'),2200);}

// ---- Hero decor (what the child bought and wears) ----
function pgDecor(extra){const eq=pgEquipped(),own=pgOwned(),d={};PG_SLOTS.forEach(s=>{let it=pgItem(eq[s.id]);if(!it||it.slot!==s.id||!own.includes(it.id))it=null;if(extra&&extra.slot===s.id)it=extra;d[s.id]=it?{id:it.id,emoji:it.emoji,name:it.name,colors:it.colors||null,rain:it.rain||null}:null;});return d;}
// {hat,aura,pet,fx}: each null or {id,emoji,name,colors,rain}
function getHeroDecor(){return pgDecor(null);}
// Puts hat/aura/pet on any hero element as data attributes (CSS draws them), so later textContent updates keep them
function applyHeroDecor(el,opts){
  if(!el)return;const d=(opts&&opts.decor)||getHeroDecor(),pet=!(opts&&opts.pet===false);
  const set=(k,v)=>{if(v)el.setAttribute(k,v);else el.removeAttribute(k);};
  set('data-pg-hat',d.hat&&d.hat.emoji);set('data-pg-aura',d.aura&&d.aura.id);set('data-pg-pet',pet&&d.pet&&d.pet.emoji);
}
// The equipped victory effect (confetti colours and/or emoji rain). Returns false if none is equipped.
function heroVictoryFx(n){return pgPlayFx(getHeroDecor().fx,n||80);}
function pgPlayFx(fx,n){if(!fx||pgRM())return false;n=n||80;if(fx.colors)launch(n,fx.colors);if(fx.rain)pgRain(fx.rain,Math.max(8,Math.round(n/4)));return true;}
function pgRain(list,n){const w=document.getElementById('pg-rain');if(!w)return;for(let i=0;i<n;i++){const s=document.createElement('span');s.className='pg-drop';s.textContent=list[i%list.length];s.style.cssText=`left:${(Math.random()*94).toFixed(1)}%;font-size:${(1.2+Math.random()*1.2).toFixed(2)}rem;animation-delay:${(Math.random()*.9).toFixed(2)}s;animation-duration:${(1.8+Math.random()*1.2).toFixed(2)}s`;w.appendChild(s);setTimeout(()=>s.remove(),4500);}}

// ---- Unlocks already celebrated (mh_pg_seen). Ids: g:<grade>, t:<grade>:<topic>, m:<grade>:<topic> (mastered), b:<grade> (boss gate) ----
function pgEvents(){const ev=[];for(let g=1;g<=10;g++){if(!CUR[g]||!isGradeUnlocked(g))continue;if(g>1)ev.push('g:'+g);(CUR[g].topics||[]).forEach((t,i)=>{if(i>0&&isTopicUnlocked(g,i))ev.push(`t:${g}:${t.id}`);if(isTopicMastered(g,t.id))ev.push(`m:${g}:${t.id}`);});if(isBossUnlocked(g)||isBossDefeated(g))ev.push('b:'+g);}return ev;}
function pgSeenList(){const s=pgLoad('mh_pg_seen',null);return Array.isArray(s)?s:null;}
function pgSeen(id){const s=pgSeenList();return !s||s.includes(id);}
function pgMark(id){const s=pgSeenList()||[];if(!s.includes(id)){s.push(id);localStorage.setItem('mh_pg_seen',JSON.stringify(s));}}
if(!pgSeenList())localStorage.setItem('mh_pg_seen',JSON.stringify(pgEvents())); // first run (also old saves): what is open now counts as celebrated

// ---- Daily streak (prog.streak / prog.lastDay): one finished round on a new day ----
function pgDay(off){const d=new Date();d.setDate(d.getDate()+(off||0));return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
if(prog.streak&&prog.lastDay!==pgDay(0)&&prog.lastDay!==pgDay(-1)){prog.streak=0;saveProg();} // a missed day resets quietly
function pgStreakTick(){
  const t=pgDay(0);if(prog.lastDay===t)return null;
  prog.streak=prog.lastDay===pgDay(-1)?(prog.streak||0)+1:1;prog.lastDay=t;
  const bonus=prog.streak>=7?15:prog.streak>=3?10:5;
  prog.coins+=bonus;saveProg();renderHUD();
  if(prog.coins>=50)unlockAchievement('coins50');if(prog.coins>=100)unlockAchievement('coins100');
  const h=document.querySelector('.hud-streak');if(h&&!pgRM()){h.classList.remove('pg-bump');void h.offsetWidth;h.classList.add('pg-bump');}
  return{n:prog.streak,bonus};
}
function pgStreakHTML(st){return st?`<div class="pg-pill pg-streak">🔥 ${st.n>1?`${st.n} dager på rad!`:'Dag 1! Kom tilbake i morgen!'} <b>+${st.bonus} 🪙</b></div>`:'';}

// ---- Levels: HUD goal, smooth fill, "NIVÅ OPP!" ----
let pgLvlSeen=curLvl(),pgHudXp=null,pgHudT=null,pgEvoHeld=null,pgLvlT=null,pgLvlDone=null;
function pgLvlAt(xp){let l=1,x=xp;while(x>=lvlFor(l)){x-=lvlFor(l);l++;}return{l,x,need:lvlFor(l)};}
function pgHud(){
  const l=curLvl(),x=xpInLvl(),need=lvlFor(l);
  if(l<pgLvlSeen)pgLvlSeen=l; // progress rolled back (boss test mode)
  let gl=document.getElementById('pg-hud-goal');
  if(!gl){const b=document.querySelector('#hud .hud-bar');if(b){gl=document.createElement('div');gl.id='pg-hud-goal';gl.className='pg-hud-goal';b.insertAdjacentElement('afterend',gl);}}
  if(gl)gl.textContent=`${need-x} XP til nivå ${l+1}`;
  const d=getHeroDecor();
  applyHeroDecor(document.getElementById('hud-char'),{decor:d,pet:false});
  const sk=document.getElementById('hud-sidekick');if(sk){if(d.pet)sk.setAttribute('data-pg-pet',d.pet.emoji);else sk.removeAttribute('data-pg-pet');}
  const fill=document.getElementById('hud-fill');
  if(fill&&pgHudT)fill.style.width='100%'; // level wrap in progress: stay full
  if(fill&&pgHudXp!==null&&prog.xp>pgHudXp&&!pgRM()){
    const bar=fill.parentElement;bar.classList.remove('pg-gain');void bar.offsetWidth;bar.classList.add('pg-gain');
    if(pgLvlAt(pgHudXp).l<l){fill.style.width='100%';clearTimeout(pgHudT);pgHudT=setTimeout(()=>{pgHudT=null;fill.style.transition='none';fill.style.width='0%';void fill.offsetWidth;fill.style.transition='';fill.style.width=Math.round(xpInLvl()/lvlFor(curLvl())*100)+'%';},550);} // fill to the top, then the new level starts at 0
  }
  pgHudXp=prog.xp;
}
function pgLevelUp(){
  const l=curLvl();if(l<=pgLvlSeen)return Promise.resolve();
  pgLvlSeen=l;
  const o=document.getElementById('pg-lvl');if(!o)return Promise.resolve();
  if(pgLvlDone){const r=pgLvlDone;pgLvlDone=null;r();}
  document.getElementById('pg-lvl-num').textContent=`Nivå ${l}`;
  const h=document.getElementById('pg-lvl-hero');h.textContent=getCharEmoji(getCharIdx(),l);applyHeroDecor(h);
  document.getElementById('pg-lvl-sub').textContent=`Neste: ${lvlFor(l)-xpInLvl()} XP til nivå ${l+1}`;
  o.classList.remove('show');void o.offsetWidth;o.classList.add('show');
  sndLvl();if(!pgRM())launch(90,['#ffd93d','#ff6b35','#ffffff','#06d6ff']);
  clearTimeout(pgLvlT);pgLvlT=setTimeout(pgLvlClose,2600);
  return new Promise(r=>{pgLvlDone=r;});
}
function pgLvlClose(){
  clearTimeout(pgLvlT);document.getElementById('pg-lvl')?.classList.remove('show');
  if(pgEvoHeld){pendingEvolution=pgEvoHeld;pgEvoHeld=null;showEvolution();} // evolution comes right after NIVÅ OPP
  const r=pgLvlDone;pgLvlDone=null;if(r)r();
}

// ---- Chest: XP, coins and mastery count up; BESTÅTT/MESTRET stamps; streak; NIVÅ OPP ----
let pgMst={},pgChestT=[],pgChestTok=0; // pgMst: "g:topicId" -> {from,to}, bars to grow on the topic map
function pgChest(mBefore,xpE,coinsE,pct){
  const tok=++pgChestTok,live=()=>tok===pgChestTok&&!!document.getElementById('chest-overlay')?.classList.contains('show');
  const g=S.grade,tid=S.topicId,from=Math.min(100,mBefore),to=Math.min(100,getMastery(g,tid)),k=g+':'+tid;
  pgMst[k]={from:pgMst[k]?Math.min(pgMst[k].from,from):from,to};
  const st=pgStreakTick();
  const ov=document.getElementById('chest-overlay');if(!ov)return;
  const val=ic=>[...ov.querySelectorAll('.chest-reward')].find(r=>r.querySelector('.chest-reward-icon')?.textContent.trim()===ic)?.querySelector('.chest-reward-val');
  const xpEl=val('✨'),mEl=val('🎯'),cEl=val('🪙');
  let x=document.getElementById('pg-cx');
  if(!x){x=document.createElement('div');x.id='pg-cx';x.className='pg-cx';const b=ov.querySelector('.chest-btn');if(b)b.insertAdjacentElement('beforebegin',x);else ov.appendChild(x);}
  const xp0=prog.xp-xpE,L0=pgLvlAt(xp0);
  x.innerHTML=`<div class="pg-cbar"><div class="pg-cbar-top"><span id="pg-cx-lv">⭐ Nivå ${L0.l}</span><span id="pg-cx-lvr">${L0.need-L0.x} XP til nivå ${L0.l+1}</span></div><div class="pg-track"><div class="pg-fill pg-fill-xp" id="pg-cx-xp" style="width:${L0.x/L0.need*100}%"></div></div></div>
    <div class="pg-cbar"><div class="pg-cbar-top"><span>🎯 ${pgEsc(S.topic?.name||'Mestring')}</span><span id="pg-cx-mv">${from}%</span></div><div class="pg-track pg-mtrack"><div class="pg-fill" id="pg-cx-m"></div><span class="pg-mark" style="left:70%">⭐</span><span class="pg-mark" style="left:100%">🏆</span></div></div>
    <div class="pg-stamp" id="pg-cx-stamp"></div>${pgStreakHTML(st)}`;
  const xpF=document.getElementById('pg-cx-xp'),lv=document.getElementById('pg-cx-lv'),lvr=document.getElementById('pg-cx-lvr'),mF=document.getElementById('pg-cx-m'),mv=document.getElementById('pg-cx-mv'),stamp=document.getElementById('pg-cx-stamp');
  const paintM=v=>{mF.style.width=v+'%';mF.style.background=v>=100?'var(--green)':v>=70?'var(--gold)':'var(--orange)';mv.textContent=v+'%';};
  const doStamp=(txt,cls)=>{stamp.textContent=txt;stamp.className='pg-stamp';void stamp.offsetWidth;stamp.className='pg-stamp show '+cls;};
  paintM(from);
  if(xpEl)xpEl.textContent='+0 XP';if(mEl)mEl.textContent='+0% mestring';if(cEl)cEl.textContent='+0';
  pgChestT.forEach(clearTimeout);pgChestT=[];
  let shownL=L0.l,p70=from>=70,p100=from>=100;
  pgChestT.push(setTimeout(()=>{
    if(tok!==pgChestTok)return;
    pgAnim(1100,e=>{if(tok!==pgChestTok)return;const L=pgLvlAt(Math.round(xp0+xpE*e));if(xpEl)xpEl.textContent=`+${Math.round(xpE*e)} XP`;xpF.style.width=(L.x/L.need*100)+'%';lv.textContent=`⭐ Nivå ${L.l}`;lvr.textContent=`${L.need-L.x} XP til nivå ${L.l+1}`;if(L.l>shownL){shownL=L.l;lv.classList.add('pg-hot');}});
    pgAnim(900,e=>{if(tok===pgChestTok&&cEl)cEl.textContent=`+${Math.round(coinsE*e)}`;});
    pgAnim(1100,e=>{if(tok!==pgChestTok)return;const v=Math.round(from+(to-from)*e);if(mEl)mEl.textContent=`+${v-from}% mestring`;paintM(v);
      if(!p70&&v>=70){p70=true;doStamp('⭐ BESTÅTT!','pass');if(live()){pgChime();if(!pgRM())launch(100,['#ffd93d','#ffffff','#ff6b35']);}}
      if(!p100&&v>=100){p100=true;doStamp('🏆 MESTRET!','master');if(live()){pgFanfare();if(!pgRM()){launch(170,['#00ff88','#ffd93d','#06d6ff','#ffffff']);heroVictoryFx(120);}}}
    });
  },pgRM()?0:350));
  if(pct>=.5)pgChestT.push(setTimeout(()=>{if(live())heroVictoryFx(70);},250));
  if(curLvl()>pgLvlSeen)pgChestT.push(setTimeout(()=>{if(live())pgLevelUp();},pgRM()?900:1800));
}
function pgChestClose(){
  pgChestTok++;pgChestT.forEach(clearTimeout);pgChestT=[];
  if(curLvl()>pgLvlSeen)pgLevelUp(); // closed before the moment came: show it now
  if(pendingEvolution&&document.getElementById('pg-lvl')?.classList.contains('show')){pgEvoHeld=pendingEvolution;pendingEvolution=null;} // evolution waits for NIVÅ OPP
}

// ---- Next goals ----
function pgRounds(m,target){return Math.max(1,Math.ceil((target-Math.min(m,target))/70));} // a typical round gives ~70%
function pgRoundsTxt(n,mark){return `${n} ${n>1?'runder':'runde'} til ${mark}`;}
function pgNextIn(g){
  const ts=CUR[g]?.topics||[];
  let i=ts.findIndex((t,j)=>isTopicUnlocked(g,j)&&!isTopicPassed(g,t.id));
  if(i>=0)return{icon:ts[i].icon,txt:`${ts[i].name}: ${pgRoundsTxt(pgRounds(getMastery(g,ts[i].id),70),'⭐')}`};
  if(BOSSES[g]&&isBossUnlocked(g)&&!isBossDefeated(g))return{icon:BOSSES[g].emoji,txt:`Bossen venter! ${BOSSES[g].name}`};
  i=ts.findIndex(t=>!isTopicMastered(g,t.id));
  if(i>=0)return{icon:ts[i].icon,txt:`${ts[i].name}: ${pgRoundsTxt(pgRounds(getMastery(g,ts[i].id),100),'🏆')}`};
  return null;
}
function pgGoalCard(){
  const el=document.getElementById('pg-goal');if(!el)return;
  let f=1;for(let g=1;g<=10;g++)if(CUR[g]&&isGradeUnlocked(g))f=g;
  const nx=pgNextIn(f);el.dataset.g=f;
  el.innerHTML=nx?`<span class="pg-goal-lbl">🎯 Neste mål · ${f}. klasse</span><span class="pg-goal-txt">${pgEsc(nx.icon)} ${pgEsc(nx.txt)}</span>`:'<span class="pg-goal-lbl">👑 Du har klart alt!</span><span class="pg-goal-txt">Talland er reddet!</span>';
}
function pgGoalGo(){const g=+(document.getElementById('pg-goal')?.dataset.g)||1;if(isGradeUnlocked(g))selectGrade(g);}
function pgResults(){
  const card=document.querySelector('#screen-results .victory-card');if(!card||S.boss||!CUR[S.grade])return;
  let b=document.getElementById('pg-next');
  if(!b){b=document.createElement('button');b.id='pg-next';b.className='pg-next-btn';const ring=document.getElementById('res-ring');if(ring)ring.insertAdjacentElement('afterend',b);else card.prepend(b);}
  const g=S.grade,ts=CUR[g].topics||[],tid=S.topicId,m=getMastery(g,tid),B=BOSSES[g];
  let txt,go;
  if(!isTopicPassed(g,tid)){txt=`🎯 ${pgRoundsTxt(pgRounds(m,70),'⭐')} — prøv igjen!`;go=retrySession;}
  else{
    const i=ts.findIndex((t,j)=>isTopicUnlocked(g,j)&&!isTopicPassed(g,t.id));
    if(i>=0){txt=`Neste: ${ts[i].icon} ${ts[i].name} ▶`;go=()=>selectGrade(g);}
    else if(B&&isBossUnlocked(g)&&!isBossDefeated(g)){txt=`Bossen venter! ${B.emoji} ▶`;go=()=>selectGrade(g);}
    else if(!isTopicMastered(g,tid)){txt=`🎯 ${pgRoundsTxt(pgRounds(m,100),'🏆')} — prøv igjen!`;go=retrySession;}
    else{const j=ts.findIndex(t=>!isTopicMastered(g,t.id));
      if(j>=0){txt=`Neste: ${ts[j].icon} ${ts[j].name} 🏆 ▶`;go=()=>selectGrade(g);}
      else if(g<10&&isGradeUnlocked(g+1)){txt=`Neste: ${g+1}. klasse ${GRADE_INFO[g].icon} ▶`;go=()=>showScreen('grades');}
      else{txt='👑 Alt er mestret her!';go=()=>showScreen('grades');}}
  }
  b.textContent=txt;b.onclick=go;
}

// ---- Map decoration (hooks: end of buildGradeMap / buildTopicMap) ----
function pgFixSvg(){['adv-map-svg','topic-map-svg'].forEach(id=>{const s=document.getElementById(id);if(s&&s.getAttribute('preserveAspectRatio')!=='none')s.setAttribute('preserveAspectRatio','none');});} // paths line up with the %-placed nodes at every width
function pgPathLock(p){if(p){p.setAttribute('stroke','rgba(255,255,255,.16)');p.setAttribute('stroke-dasharray','7 5');}}
function pgPrelock(n){if(!n||n.classList.contains('pg-prelock'))return;n.classList.add('locked','pg-prelock');const ic=n.querySelector('.map-node-icon');if(ic&&!ic.querySelector('.pg-lock'))ic.insertAdjacentHTML('beforeend','<div class="map-node-lock pg-lock">🔒</div>');}
function pgPop(n,col){if(!n||pgRM())return;n.classList.remove('pg-pop');void n.offsetWidth;n.classList.add('pg-pop');setTimeout(()=>n.classList.remove('pg-pop'),950);const ic=n.querySelector('.map-node-icon,.boss-gate-icon');if(ic){const r=document.createElement('div');r.className='pg-ring';if(col)r.style.borderColor=col;ic.appendChild(r);setTimeout(()=>r.remove(),1100);}}
function pgUnlockNode(n,col){if(!n)return;n.classList.remove('locked','pg-prelock');const lk=n.querySelector('.pg-lock');if(lk){lk.classList.add('pg-lock-off');setTimeout(()=>lk.remove(),700);}pgPop(n,col);}
function pgScroll(el){if(!el)return;const r=el.getBoundingClientRect();if(r.top<70||r.bottom>innerHeight-20)el.scrollIntoView({block:'center',behavior:pgRM()?'auto':'smooth'});}
function pgPendingGrades(){const p=[];for(let g=2;g<=10;g++)if(CUR[g]&&isGradeUnlocked(g)&&!pgSeen('g:'+g))p.push(g);return p;}
function pgGradeMap(){
  pgFixSvg();
  const box=document.getElementById('adv-map-nodes'),svg=document.getElementById('adv-map-svg'),you=document.getElementById('map-you');if(!box)return;
  const pend=pgPendingGrades();
  pend.forEach(g=>{pgPrelock(box.children[g-1]);pgPathLock(svg?.children[g-2]);});
  if(you){applyHeroDecor(you);const p=pend.length&&GRADE_POS[pend[0]-2];if(p){you.style.left=p[0]+'%';you.style.top=p[1]+'%';}} // hero waits on the old node, then walks
  pgGoalCard();pgShopTip();
  if(pend.length&&pgActive('grades'))setTimeout(pgRun,60);
}
function pgBarSet(n,v){const f=n?.querySelector('.topic-mst-fill'),lb=n?.querySelector('.topic-mst-lbl');if(!f)return;f.style.transition='none';f.style.width=v+'%';f.style.background=v>=100?'var(--green)':v>=70?'var(--gold)':'var(--orange)';if(lb){const ml=masteryLabel(v);lb.textContent=ml.txt;lb.style.color=ml.col;}}
function pgPointer(g){
  document.querySelectorAll('#topic-map-nodes .pg-next-tag').forEach(e=>e.remove());const gate=document.getElementById('boss-gate');gate?.classList.remove('pg-next');
  const box=document.getElementById('topic-map-nodes'),ts=CUR[g]?.topics||[];if(!box)return;
  const ok=j=>isTopicUnlocked(g,j)&&!box.children[j]?.classList.contains('pg-prelock');
  let i=ts.findIndex((t,j)=>ok(j)&&!isTopicPassed(g,t.id));
  if(i<0&&gate&&BOSSES[g]&&isBossUnlocked(g)&&!isBossDefeated(g)&&!gate.classList.contains('pg-prelock')){gate.classList.add('pg-next');return;}
  if(i<0)i=ts.findIndex((t,j)=>ok(j)&&!isTopicMastered(g,t.id));
  box.children[i]?.insertAdjacentHTML('beforeend','<div class="pg-next-tag">👇</div>');
}
function pgTopicMap(g){
  pgFixSvg();
  const box=document.getElementById('topic-map-nodes'),svg=document.getElementById('topic-map-svg'),ts=CUR[g]?.topics||[];if(!box)return;
  ts.forEach((t,i)=>{
    const n=box.children[i];if(!n||!isTopicUnlocked(g,i))return;
    const passed=isTopicPassed(g,t.id);
    if(!isTopicMastered(g,t.id))n.insertAdjacentHTML('beforeend',`<div class="pg-node-goal">${pgRoundsTxt(pgRounds(getMastery(g,t.id),passed?100:70),passed?'🏆':'⭐')}</div>`);
    if(i>0&&!pgSeen(`t:${g}:${t.id}`)){pgPrelock(n);pgPathLock(svg?.children[i-1]);}
    const a=pgMst[g+':'+t.id];if(a&&a.to>a.from)pgBarSet(n,a.from); // shows the old value until the bar grows
  });
  const gate=document.getElementById('boss-gate');
  if(gate&&BOSSES[g]&&isBossUnlocked(g)&&!isBossDefeated(g)&&!pgSeen('b:'+g))gate.classList.add('locked','pg-prelock');
  pgPointer(g);
  if(pgActive('topics'))setTimeout(pgRun,60);
}

// ---- Ceremonies: run when the grade or topic map becomes visible, once nothing covers it ----
let pgBusy=false,pgAgain=false;
function pgBlocked(){return !!document.querySelector('.evo-overlay.show,.chest-overlay.show,.boss-overlay.show,.world-popup.show,.herocard-overlay.show,.badge-overlay.show,#pg-shop.show,#pg-lvl.show,#story-overlay:not(.hidden),#ending-overlay:not(.hidden)');}
async function pgFree(scr){while(pgBlocked()){if(!pgActive(scr))return false;await pgSleep(300);}return pgActive(scr);}
function pgBanner(icon,title,sub,ms){
  const b=document.getElementById('pg-banner');if(!b)return;
  document.getElementById('pg-banner-icon').textContent=icon;document.getElementById('pg-banner-title').textContent=title;document.getElementById('pg-banner-sub').textContent=sub||'';
  b.classList.remove('show');void b.offsetWidth;b.classList.add('show');
  clearTimeout(pgBanner.t);pgBanner.t=setTimeout(()=>b.classList.remove('show'),ms||2400);
}
async function pgDrawPath(p,col,ms,onE){
  let c=null;
  if(p){c=p.cloneNode(false);c.setAttribute('stroke',col);c.setAttribute('stroke-width','4');c.setAttribute('pathLength','1');c.setAttribute('stroke-dasharray','1 1');c.setAttribute('stroke-dashoffset','1');p.insertAdjacentElement('afterend',c);}
  await pgAnim(ms,e=>{if(c)c.setAttribute('stroke-dashoffset',String(1-e));if(onE)onE(e);});
  if(p){p.setAttribute('stroke',col);p.setAttribute('stroke-dasharray','none');}if(c)c.remove();
}
function pgWalkTo(g){ // the hero walks the curved path from grade g-1 to grade g
  const you=document.getElementById('map-you'),a=GRADE_POS[g-2],b=GRADE_POS[g-1];if(!you||!a||!b)return Promise.resolve();
  const cx=(a[0]+b[0])/2,cy=(a[1]+b[1])/2-5;
  you.classList.add('pg-walk');
  return pgDrawPath(document.getElementById('adv-map-svg')?.children[g-2],'rgba(255,217,61,.65)',1700,e=>{const u=1-e;you.style.left=(u*u*a[0]+2*u*e*cx+e*e*b[0])+'%';you.style.top=(u*u*a[1]+2*u*e*cy+e*e*b[1])+'%';}).then(()=>you.classList.remove('pg-walk'));
}
async function pgGradeShow(){
  for(const g of pgPendingGrades()){
    if(!await pgFree('grades'))return;
    const node=document.getElementById('adv-map-nodes')?.children[g-1],gi=GRADE_INFO[g-1];if(!node||!gi)continue;
    pgMark('g:'+g);
    pgScroll(node);await pgSleep(pgRM()?100:450);
    pgBanner(gi.icon,'Ny verden åpnet!',`${g}. klasse · ${gi.mapName}`,2800);pgChime();
    await pgWalkTo(g);
    pgUnlockNode(node,gi.color);if(!pgRM())launch(80,[gi.color,'#ffd93d','#ffffff']);
    await pgSleep(1300);
  }
  pgGoalCard();
}
async function pgTopicShow(g){
  const ts=CUR[g]?.topics||[],gi=GRADE_INFO[g-1]||{},col=gi.color||'#ffd93d',here=()=>pgActive('topics')&&currentGrade===g;
  const node=i=>document.getElementById('topic-map-nodes')?.children[i];
  let grew=false; // 1) mastery bars grow from the old to the new value
  ts.forEach((t,i)=>{const k=g+':'+t.id,a=pgMst[k],n=node(i);if(!a||!n)return;delete pgMst[k];if(a.to<=a.from)return;grew=true;pgBarSet(n,a.from);
    const p=document.createElement('div');p.className='pg-plus';p.textContent=`+${a.to-a.from}%`;n.appendChild(p);setTimeout(()=>p.remove(),1600);
    pgAnim(1000,e=>pgBarSet(n,Math.round(a.from+(a.to-a.from)*e))).then(()=>{const f=n.querySelector('.topic-mst-fill');if(f)f.style.transition='';});});
  if(grew)await pgSleep(pgRM()?500:1300);
  for(const[i,t]of ts.entries()){ // 2) topics mastered
    if(!isTopicMastered(g,t.id)||pgSeen(`m:${g}:${t.id}`))continue;
    if(!await pgFree('topics')||!here())return;
    pgMark(`m:${g}:${t.id}`);const n=node(i);pgScroll(n);
    pgBanner('🏆','Tema mestret!',t.name,2400);pgFanfare();pgPop(n,'var(--green)');
    if(!heroVictoryFx(90)&&!pgRM())launch(90,['#00ff88','#ffd93d','#ffffff']);
    await pgSleep(2000);
  }
  for(let i=1;i<ts.length;i++){ // 3) new topics unlocked
    const t=ts[i];if(!isTopicUnlocked(g,i)||pgSeen(`t:${g}:${t.id}`))continue;
    if(!await pgFree('topics')||!here())return;
    pgMark(`t:${g}:${t.id}`);const n=node(i);pgScroll(n);
    pgBanner('✨','Nytt tema låst opp!',`${t.icon} ${t.name}`,2600);pgChime();
    await pgDrawPath(document.getElementById('topic-map-svg')?.children[i-1],col,900);
    pgUnlockNode(n,col);if(!pgRM())launch(60,[col,'#ffd93d','#ffffff']);
    await pgSleep(1700);
  }
  if(BOSSES[g]&&(isBossUnlocked(g)||isBossDefeated(g))&&!pgSeen('b:'+g)){ // 4) the boss gate opens
    if(!await pgFree('topics')||!here())return;
    pgMark('b:'+g);
    if(!isBossDefeated(g)){
      const gate=document.getElementById('boss-gate');pgScroll(gate);
      if(gate){gate.classList.remove('locked','pg-prelock');pgPop(gate,'var(--red)');}
      pgBanner(BOSSES[g].emoji,'Bossen venter!',BOSSES[g].name,2600);bossRumble();
      await pgSleep(1800);
    }
  }
  if(here())pgPointer(g);
}
async function pgRun(){
  if(pgBusy){pgAgain=true;return;}
  pgBusy=true;
  try{do{
    pgAgain=false;
    const scr=pgActive('grades')?'grades':pgActive('topics')?'topics':null;if(!scr)break;
    if(!await pgFree(scr))break;
    if(curLvl()>pgLvlSeen)await pgLevelUp(); // e.g. left a battle right after a mid-battle level-up
    if(scr==='grades')await pgGradeShow();else await pgTopicShow(currentGrade);
  }while(pgAgain);}catch(e){console.warn('progression',e);}
  pgBusy=false;
}
(function(){ // start ceremonies when the grade/topic map screen becomes active (no hook in showScreen needed)
  const was={};
  const mo=new MutationObserver(()=>['grades','topics'].forEach(n=>{const a=pgActive(n);if(a&&!was[n])setTimeout(pgRun,60);was[n]=a;}));
  ['grades','topics'].forEach(n=>{const el=document.getElementById('screen-'+n);if(el){was[n]=el.classList.contains('active');mo.observe(el,{attributes:true,attributeFilter:['class']});}});
})();

// ---- Boss result + hero card (hooks) ----
function pgBossResult(win,g,first){
  const st=pgStreakTick(),o=document.getElementById('boss-result');if(!o)return;
  let x=document.getElementById('pg-bx');
  if(!x){x=document.createElement('div');x.id='pg-bx';x.className='pg-bx';const bt=document.getElementById('br-btns');if(bt)bt.insertAdjacentElement('beforebegin',x);else o.appendChild(x);}
  const its=win&&first?PG_ITEMS.filter(i=>i.boss===g):[],up=curLvl()>pgLvlSeen;
  x.innerHTML=(up?`<div class="pg-pill pg-pill-lvl">⬆️ Nivå ${curLvl()}!</div>`:'')+pgStreakHTML(st)+(its.length?`<div class="pg-pill pg-pill-shop">🛒 Nytt i butikken: ${its.map(i=>i.emoji).join(' ')}</div>`:'');
  if(win)setTimeout(()=>{if(o.classList.contains('show'))heroVictoryFx(120);},600);
  if(up)setTimeout(()=>{if(o.classList.contains('show'))pgLevelUp();},2400); // if they leave first, the map shows it
}
function pgHeroCard(){applyHeroDecor(document.getElementById('hc-char'));}

// ---- Coin shop ----
let pgSel=null;
function pgShopTip(){
  const el=document.getElementById('pg-shop-tip');if(!el)return;
  const own=pgOwned(),open=PG_ITEMS.filter(i=>!own.includes(i.id)&&pgItemOpen(i)).sort((a,b)=>a.price-b.price),can=open.some(i=>i.price<=prog.coins);
  el.textContent=can?'🎁 Du har råd!':open[0]?`${open[0].price-prog.coins} 🪙 til ${open[0].emoji}`:'';
  el.parentElement.classList.toggle('pg-can',can);
}
function openShop(){pgSel=null;pgShopDraw();const o=document.getElementById('pg-shop');o.classList.add('show');o.scrollTop=0;}
function closeShop(){document.getElementById('pg-shop').classList.remove('show');renderHUD();applyHeroDecor(document.getElementById('map-you'));pgShopTip();}
function pgShopDraw(){
  const own=pgOwned(),eq=pgEquipped(),sel=pgItem(pgSel);
  document.getElementById('pg-shop-coins').textContent=prog.coins;
  const hero=document.getElementById('pg-shop-hero');
  hero.textContent=localStorage.getItem('mh_player')?getCharEmoji(getCharIdx(),curLvl()):getPlayer().emoji;
  applyHeroDecor(hero,{decor:pgDecor(sel)}); // try it on before buying
  const info=document.getElementById('pg-shop-info'),act=document.getElementById('pg-shop-act');
  act.className='pg-shop-act';act.disabled=false;act.style.display='';
  if(!sel){info.innerHTML='<b>Prøv noe! 👆</b><span>Trykk på en ting for å se den på helten din.</span>';act.style.display='none';}
  else{
    const has=own.includes(sel.id),on=has&&eq[sel.slot]===sel.id,B=sel.boss&&BOSSES[sel.boss];
    info.innerHTML=`<b>${sel.emoji} ${pgEsc(sel.name)}</b><span>${!pgItemOpen(sel)&&B?`🔒 Beseir ${B.emoji} ${pgEsc(B.name)} først!`:PG_SLOTS.find(s=>s.id===sel.slot).desc}</span>`;
    if(!pgItemOpen(sel))act.style.display='none';
    else if(on){act.textContent='Ta av';act.classList.add('pg-soft');}
    else if(has)act.textContent='Ta på ✨';
    else if(prog.coins>=sel.price){act.textContent=`Kjøp for 🪙 ${sel.price}`;act.classList.add('pg-buy');}
    else{act.textContent=`Samle ${sel.price-prog.coins} 🪙 til!`;act.disabled=true;}
  }
  document.getElementById('pg-shop-list').innerHTML=PG_SLOTS.map(s=>`<div class="pg-shop-sec"><div class="pg-shop-sec-title">${s.icon} ${s.name}</div><div class="pg-shop-grid">${PG_ITEMS.filter(i=>i.slot===s.id).map(i=>{
    const has=own.includes(i.id),on=has&&eq[s.id]===i.id,op=pgItemOpen(i),B=i.boss&&BOSSES[i.boss];
    const tag=on?'✓ På deg':has?'Din!':!op?`🔒 ${B?B.emoji:''}`:`🪙 ${i.price}`;
    const cls=['pg-item',on&&'on',has&&'owned',!op&&'locked',!has&&op&&prog.coins<i.price&&'dear',pgSel===i.id&&'sel'].filter(Boolean).join(' ');
    return `<button class="${cls}" onclick="pgShopPick('${i.id}')"><span class="pg-item-emoji"${s.id==='aura'?` data-pg-aura="${i.id}"`:''}>${i.emoji}</span><span class="pg-item-name">${pgEsc(i.name)}</span><span class="pg-item-tag">${tag}</span></button>`;}).join('')}</div></div>`).join('');
}
function pgShopPick(id){const it=pgItem(id);if(!it)return;pgSel=id;pgShopDraw();tone(880,.05,'sine',.12);if(it.slot==='fx'&&pgItemOpen(it))pgPlayFx(pgDecor(it).fx,60);}
function pgShopAct(){
  const it=pgItem(pgSel);if(!it||!pgItemOpen(it))return;
  const own=pgOwned(),eq=pgEquipped();
  if(!own.includes(it.id)){
    if(prog.coins<it.price)return;
    prog.coins-=it.price;saveProg();own.push(it.id);localStorage.setItem('mh_shop_owned',JSON.stringify(own));
    eq[it.slot]=it.id;
    tone(988,.08,'square',.1);setTimeout(()=>tone(1319,.2,'square',.1),80);
    if(it.slot==='fx')pgPlayFx(pgDecor(it).fx,100);else if(!pgRM())launch(70,['#ffd93d','#ff6b35','#00ff88','#06d6ff']);
    const h=document.getElementById('pg-shop-hero');if(h&&!pgRM()){h.classList.remove('pg-pop-hero');void h.offsetWidth;h.classList.add('pg-pop-hero');}
    pgToast(it.emoji,'Kjøpt! 🎉',`${it.name} er din!`);
  }else eq[it.slot]=eq[it.slot]===it.id?null:it.id;
  localStorage.setItem('mh_shop_equipped',JSON.stringify(eq));
  renderHUD();pgShopDraw();
}

// ============================================================
// BOSS FIGHTS
// ============================================================
// A boss waits at the end of every grade's topic map. It reuses #screen-game and
// the normal battle loop (loadQuestion/submitAnswer): S.boss=true and S.topic is a
// synthetic topic that mixes all of the grade's topics. Hooks in existing code:
// isGradeUnlocked, buildGradeMap, buildTopicMap, submitAnswer, handleNext.
// Parent test shortcut: ?boss=<grade> (e.g. ?boss=1) opens that boss directly;
// every localStorage change made during the test is rolled back afterwards.
const BOSS_MAXQ=20; // the boss flees (no game over) if not K.O. within this many questions
const BOSSES={
  1:{name:'Pluss-trollet',emoji:'🧌',hp:12,badge:'Trolltemmer',skills:'pluss og minus',
     taunt:'Hå hå! Jeg har blandet sammen alle plusstykkene i Talland. Du klarer aldri å telle riktig!',
     hit:['Au! Du kan jo telle!','Hæ?! Riktig igjen?!','Trollknærne mine skjelver!','Uff, det kilte i nesa!'],
     miss:['Hå hå, bom! Prøv igjen!','Hehe, den var lur, hva?','Nesten! Tell en gang til!'],
     ko:'Uff da, du vant! Nå skal jeg plusse riktig!'},
  2:{name:'Gange-ormen',emoji:'🐍',hp:12,badge:'Ormetemmer',skills:'pluss, minus og ganging',
     taunt:'Sssss! Jeg har kveilet meg rundt alle tallene i Tallskogen. Ingen sssslipper forbi meg!',
     hit:['Ssssau! Det kilte!','Sss... du er flink!','Halen min knyter seg!','Sssstopp, ikke så fort!'],
     miss:['Sssss! Bom! Prøv igjen!','Hisss, den var vrien, hva?','Ssssnart har du den!'],
     ko:'Sssså flink du er! Jeg slipper tallene fri!'},
  3:{name:'Gangekrabben',emoji:'🦀',hp:13,badge:'Krabbeknekker',skills:'gangetabellen og deling',
     taunt:'Knip knip! Jeg har knepet i stykker gangetabellen. Ingen kommer inn i Gangeborgen!',
     hit:['Au, klypa mi!','Knip... knasj!','Krabbe-krise!','Jeg går sidelengs av skrekk!'],
     miss:['Knip knip, bom!','Hehe, prøv igjen!','Klypa mi tok den!'],
     ko:'Knip... du vant! Porten er åpen!'},
  4:{name:'Dele-dragen',emoji:'🐲',hp:13,badge:'Delemester',skills:'gangetabellen, deling og brøk',
     taunt:'Grrr! Alle tallene er MINE! Jeg deler aldri med noen!',
     hit:['Au, halen min!','Hmpf! Du deler bra!','Det kommer røyk ut av nesa mi!','Nei, ikke skatten min!'],
     miss:['Ha! Bom! Mine tall!','Hehe! Prøv igjen!','Den skatten beholder jeg!'],
     ko:'Ok, ok! Jeg skal lære å dele!'},
  5:{name:'Komma-heksen',emoji:'🧙‍♀️',hp:14,badge:'Kommamester',skills:'desimaltall, prosent og avrunding',
     taunt:'Hokus pokus! Jeg har flyttet alle kommaene. Nå er ingen tall riktige! Hi hi hi!',
     hit:['Au, kosten min!','Trylleformelen virket ikke!','Hi hi... au!','Hatten min falt av!'],
     miss:['Hi hi hi, bom!','Hokus pokus, prøv igjen!','Oi, kommaet hoppet!'],
     ko:'Neeei! Alle kommaene flyr tilbake!'},
  6:{name:'Minus-spøkelset',emoji:'👻',hp:14,badge:'Spøkelsesjeger',skills:'brøk, areal og negative tall',
     taunt:'Bøøø! Jeg gjør alle tall mindre og mindre... helt ned under null!',
     hit:['Bø... au!','Jeg blir helt gjennomsiktig!','Uææ, du er modig!','Lakenet mitt revnet!'],
     miss:['Bøøø! Bom!','Spøk og spill! Prøv igjen!','Bø! Nesten!'],
     ko:'Bøh... du vant. Nå flyr jeg hjem!'},
  7:{name:'Kaptein X',emoji:'🦹',hp:14,badge:'X-finner',skills:'algebra, forholdstall og gjennomsnitt',
     taunt:'Stopp! Dette er Nullius\' festning. Bare jeg vet hva X er, og jeg sier det aldri!',
     hit:['Hva?! Du fant X!','Kappa mi floker seg!','Umulig!','Au, masken min!'],
     miss:['Ha! X er hemmelig!','Feil X! Prøv igjen!','Hehe, nesten!'],
     ko:'Neiii! Du knakk koden! Festningen er åpen!'},
  8:{name:'Kaos-blekkspruten',emoji:'🐙',hp:15,badge:'Kaos-rydder',skills:'likninger, potenser og prosent',
     taunt:'Åtte armer, åtte ganger kaos! Jeg roter til alle likningene i byen!',
     hit:['Au, arm nummer tre!','Blekk overalt!','Armene mine knyter seg!','Blubb! Du er rask!'],
     miss:['Blubb blubb, bom!','Kaos! Prøv igjen!','Hehe, sprut!'],
     ko:'Blubb... du ryddet opp i kaoset!'},
  9:{name:'Pytha-Rex',emoji:'🦖',hp:15,badge:'Dinotemmer',skills:'Pytagoras, statistikk og algebra',
     taunt:'RAAAWR! Jeg vokter Pythagoras-tårnet. Trekantene mine er altfor vanskelige for deg!',
     hit:['RAAAU! Au!','De små armene mine!','Rawr... du er god!','Tårnet rister!'],
     miss:['RAWR! Bom!','Hehe, prøv igjen!','Trekanten vant den!'],
     ko:'Rawr... du er sjefen nå!'},
  10:{name:'NULLIUS',emoji:'👹',hp:15,badge:'Nullius-knuser',skills:'funksjoner, trigonometri og sannsynlighet',koEmoji:'0️⃣',
     taunt:'Så du kom helt til toppen, lille helt? Jeg skal gjøre ALLE tall om til NULL!',
     hit:['Grr! Det kjente jeg!','Umulig! Hvordan?!','Matematikken din er for sterk!','Neeei!'],
     miss:['Ha ha! Null poeng!','Mørket vinner! ...eller?','Prøv igjen, hvis du tør!'],
     ko:'Neeei! Jeg krymper... Nå er jeg bare en liten null!',
     flee:'Jeg må hvile litt... Vi ses igjen! 💨',
     phases:[
       {at:66,emoji:'🌪️',name:'Storm-Nullius',flash:'FASE 2!',say:'GRRR! Nå blåser jeg opp en tallstorm!'},
       {at:33,emoji:'🌋',name:'Vulkan-Nullius',flash:'FASE 3!',say:'Jeg koker over! Men jeg gir meg ikke!'},
     ]},
};

// Boss badges are appended to the end of BADGES (rendered by openBadges automatically)
[
  ...Object.keys(BOSSES).map(g=>({id:'boss'+g,icon:BOSSES[g].emoji,name:BOSSES[g].badge,desc:`Beseir ${BOSSES[g].name}`,secret:+g>2})),
  {id:'talland',icon:'👑',name:'Tallands helt',desc:'Redd hele kongeriket Talland!',secret:true},
].forEach(b=>{if(!BADGES.some(x=>x.id===b.id)){BADGES.push(b);ACHIEVEMENTS[b.id]={icon:b.icon,title:b.name,sub:b.desc};}});

function isBossDefeated(g){return !!localStorage.getItem('mh_boss_'+g);}
function isBossUnlocked(g){const t=CUR[g]?.topics||[];return t.length>0&&t.every(x=>isTopicPassed(g,x.id));}
function bossHero(){return localStorage.getItem('mh_player')?getCharEmoji(getCharIdx(),curLvl()):getPlayer().emoji;}
function bossEsc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function bossShuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function bossFanfare(){[523,659,784,1046,0,784,1046,1318].forEach((f,i)=>{if(f)setTimeout(()=>tone(f,.16,'triangle',.22),i*110);});}
function bossRumble(){tone(110,.35,'sawtooth',.12);setTimeout(()=>tone(82,.45,'sawtooth',.12),220);}
function bossToast(icon,title,sub){
  const t=document.getElementById('achieve-toast');
  document.getElementById('at-icon').textContent=icon;
  document.getElementById('at-title').textContent=title;
  document.getElementById('at-sub').textContent=sub;
  t.classList.add('show');clearTimeout(t._bt);t._bt=setTimeout(()=>t.classList.remove('show'),2500);
}

// ---- Test mode (?boss=<g>): snapshot localStorage, roll back when the test ends ----
let bossTestSnap=null;
function bossSnapshot(){const o={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);o[k]=localStorage.getItem(k);}return o;}
function bossRestore(){
  const snap=bossTestSnap;if(!snap)return;
  bossTestSnap=null;
  const now=[];for(let i=0;i<localStorage.length;i++)now.push(localStorage.key(i));
  now.forEach(k=>{if(!Object.prototype.hasOwnProperty.call(snap,k))localStorage.removeItem(k);});
  Object.keys(snap).forEach(k=>{if(localStorage.getItem(k)!==snap[k])localStorage.setItem(k,snap[k]);});
  prog=JSON.parse(localStorage.getItem('mh_prog3')||'{"xp":0,"coins":0,"streak":0,"lastDay":""}');
  unlockedAchievements=JSON.parse(localStorage.getItem('mh_ach')||'{}');
  pendingEvolution=null;
  renderHUD();
  if(localStorage.getItem('mh_player'))updatePlayerEmoji();
}

// ---- Boss node at the end of the topic map (hook: end of buildTopicMap) ----
function bossAddTopicNode(g){
  const b=BOSSES[g],wrap=document.getElementById('topic-map-wrap');
  let gate=document.getElementById('boss-gate');
  if(!b||!wrap){if(gate)gate.remove();return;}
  if(!gate){gate=document.createElement('div');gate.id='boss-gate';}
  wrap.insertAdjacentElement('afterend',gate);
  const topics=CUR[g]?.topics||[],passed=topics.filter(t=>isTopicPassed(g,t.id)).length;
  const beaten=isBossDefeated(g),open=beaten||isBossUnlocked(g);
  gate.className='boss-gate'+(open?'':' locked')+(beaten?' beaten':'')+(g===10?' final':'');
  const status=beaten?'👑 Beseiret! Vil du kjempe igjen?':open?'⚔️ Klar for kamp! Trykk her!':`🔒 Få ⭐ på alle temaene først (${passed}/${topics.length})`;
  gate.innerHTML=`<div class="boss-gate-line"></div>
    <div class="boss-gate-node">
      <div class="boss-gate-icon">${b.emoji}${beaten?'<div class="boss-crown">👑</div>':''}${open?'':'<div class="map-node-lock">🔒</div>'}</div>
      <div class="boss-gate-info"><div class="boss-gate-tag">${g===10?'⚠️ SISTE BOSS':'👑 BOSS'}</div><div class="boss-gate-name">${b.name}</div><div class="boss-gate-status">${status}</div></div>
    </div>`;
  gate.onclick=()=>{
    if(isBossDefeated(g)||isBossUnlocked(g))openBossIntro(g);
    else bossToast('🔒','Låst!','Få ⭐ på alle temaene først!');
  };
}

// ---- Crowns + "replay ending" button on the grade map (hook: buildGradeMap) ----
function bossDecorateGradeMap(){
  const nodes=document.getElementById('adv-map-nodes');
  if(nodes)GRADE_INFO.forEach((gi,i)=>{
    const ic=nodes.children[i]?.querySelector('.map-node-icon');
    if(ic&&isBossDefeated(gi.num)&&!ic.querySelector('.boss-crown'))ic.insertAdjacentHTML('beforeend','<div class="boss-crown" title="Boss beseiret!">👑</div>');
  });
  const wrap=document.getElementById('adv-map-wrap');
  let btn=document.getElementById('ending-replay-btn');
  if(isBossDefeated(10)&&wrap){
    if(!btn){btn=document.createElement('button');btn.id='ending-replay-btn';btn.className='boss-replay-btn';btn.textContent='🎬 Se slutten igjen';btn.onclick=()=>showEnding(false);}
    wrap.insertAdjacentElement('afterend',btn);
  }else if(btn)btn.remove();
}

// ---- Intro overlay ----
let bossPendingGrade=null;
function openBossIntro(g){
  const b=BOSSES[g];if(!b)return;
  bossPendingGrade=g;
  document.getElementById('bi-tag').textContent=g===10?'⚠️ DET STORE OPPGJØRET ⚠️':'⚠️ BOSS-KAMP ⚠️';
  document.getElementById('bi-emoji').textContent=b.emoji;
  document.getElementById('bi-name').textContent=b.name;
  document.getElementById('bi-grade').textContent=`${g}. klasse · ${GRADE_INFO[g-1]?.mapName||''}`;
  document.getElementById('bi-taunt').textContent=b.taunt;
  const topics=CUR[g]?.topics||[];
  document.getElementById('bi-skills').innerHTML=`<div class="boss-skills-lbl">${b.name} tester ${b.skills}!</div>
    <div class="boss-chips">${topics.map(t=>`<span class="boss-chip">${bossEsc(t.icon)} ${bossEsc(t.name)}</span>`).join('')}</div>`;
  document.getElementById('bi-test').classList.toggle('show',!!bossTestSnap);
  const o=document.getElementById('boss-intro');
  o.classList.toggle('final',g===10);
  o.classList.add('show');
  bossRumble();
}
function closeBossIntro(){
  document.getElementById('boss-intro').classList.remove('show');
  bossRestore(); // ends a ?boss= test session (no-op otherwise)
}
function bossFight(){
  document.getElementById('boss-intro').classList.remove('show');
  startBoss(bossPendingGrade);
}

// ---- The fight ----
function startBoss(g){
  const gd=CUR[g],b=BOSSES[g];
  if(!gd||!b||!gd.topics.length)return;
  const topics=gd.topics;let bag=[];
  const base={id:'boss'+g,name:b.name,icon:b.emoji,
    gen(gg){ // mix all topics of the grade, evenly
      if(!bag.length)bag=bossShuffle(topics.map((_,i)=>i));
      const t=topics[bag.pop()];
      S.bossTopic=t;S.topicId=t.id; // so recordAttempt/fb use the real topic
      let qd=t.gen(gg,t.id),n=0;
      while(S.current&&qd&&qd.q===S.current.q&&n++<3)qd=t.gen(gg,t.id);
      return qd;
    },
    fb(...a){return (S.bossTopic||topics[0]).fb(...a);},
  };
  // Any other topic property loadQuestion/submitAnswer may read comes from the current real topic
  const topic=new Proxy(base,{get(o,k){return k in o?o[k]:(S.bossTopic||topics[0])[k];}});
  S={grade:g,topicId:topics[0].id,topic,questions:[],idx:0,score:0,streak:0,combo:0,current:null,answered:false,enemyHp:100,playerHp:100,enemyDefeated:false,
     boss:true,bossPts:b.hp*10,bossMax:b.hp*10,bossPhase:0,bossEmoji:b.emoji,bossFled:false,bossOver:false,bossTopic:null,bossStats:{}};
  document.getElementById('player-avatar').textContent=bossHero();
  document.getElementById('player-name').textContent=getPlayer().name;
  const av=document.getElementById('enemy-avatar');
  av.textContent=b.emoji;av.classList.remove('boss-flee','boss-morph');
  document.getElementById('enemy-name').textContent='👑 '+b.name;
  document.getElementById('player-hp').style.width='100%';
  document.getElementById('enemy-hp').style.width='100%';
  const qc=document.getElementById('q-card');
  qc.style.setProperty('--qc1',gd.c1);qc.style.setProperty('--qc2',gd.c2);
  const sg=document.getElementById('screen-game');
  sg.classList.add('boss-mode');sg.classList.toggle('boss-final',g===10);
  buildNumpad(g);
  renderHUD();
  showScreen('game');
  loadQuestion();
  bossProg();
  setSpeech(`${b.emoji} Kom an, da! ⚔️`);
  fxStart(true); // BATTLE FX: boss entrance + reset
}

// Damage hook (submitAnswer): returns the boss' new HP in percent. 10 points per hit,
// up to 12 with combo, so a K.O. takes about 11–15 correct answers depending on hp.
function bossHit(){
  const f=1+Math.min(Math.max(S.combo-1,0),4)*.05;
  S.bossPts=Math.max(0,S.bossPts-Math.round(10*f));
  return S.bossPts<=0?0:Math.max(1,Math.round(S.bossPts/S.bossMax*100));
}

function bossProg(){
  const n=Math.min(S.idx+(S.answered?0:1),BOSS_MAXQ);
  document.getElementById('prog-label').textContent=`👑 Boss · ${n} av ${BOSS_MAXQ}`;
  document.getElementById('prog-fill').style.width=Math.min(100,S.idx/BOSS_MAXQ*100)+'%';
}

// Called at the end of submitAnswer while S.boss: boss speech, phases, flee check, labels
function bossAfterAnswer(){
  const b=BOSSES[S.grade];if(!b)return;
  const last=S.questions[S.questions.length-1],ok=!!(last&&last.ok);
  const av=document.getElementById('enemy-avatar'),nm=document.getElementById('enemy-name');
  if(S.bossTopic){const st=S.bossStats[S.bossTopic.id]||(S.bossStats[S.bossTopic.id]={ok:0,n:0});st.n++;if(ok)st.ok++;}
  if(ok){S.playerHp=Math.min(100,S.playerHp+5);document.getElementById('player-hp').style.width=S.playerHp+'%';} // long fight: hits heal a little
  let line;
  if(S.enemyDefeated){
    S.bossEmoji=b.koEmoji||'😵';
    av.textContent=S.bossEmoji;nm.textContent='👑 '+b.name;
    line=b.ko;
    launch(200,['#ffd93d','#ff6b35','#00ff88','#06d6ff','#a855f7']);
    bossFanfare();
  }else if(ok){
    line=pick(b.hit);
    const ph=b.phases||[];
    while(S.bossPhase<ph.length&&S.enemyHp<=ph[S.bossPhase].at){
      const P=ph[S.bossPhase++];
      S.bossEmoji=P.emoji;av.textContent=P.emoji;nm.textContent='👑 '+P.name;line=P.say;
      av.classList.remove('boss-morph');void av.offsetWidth;av.classList.add('boss-morph');
      setTimeout(()=>av.classList.remove('boss-morph'),850);
      const fi=document.querySelector('#screen-game .fighters');
      if(fi){fi.classList.remove('boss-shake');void fi.offsetWidth;fi.classList.add('boss-shake');setTimeout(()=>fi.classList.remove('boss-shake'),600);}
      const cf=document.getElementById('combo-flash');
      cf.innerHTML=`<div class="combo-txt">${P.emoji} ${P.flash}</div>`;
      setTimeout(()=>cf.innerHTML='',900);
      bossRumble();
    }
  }else line=pick(b.miss);
  if(!S.enemyDefeated&&S.idx>=BOSS_MAXQ){
    S.bossFled=true;
    line=b.flee||'Oi, nå stikker jeg! 💨';
    av.classList.add('boss-flee');
  }
  setSpeech(`${S.bossEmoji} ${line}`);
  bossProg();
  document.getElementById('next-btn').textContent=S.enemyDefeated?'🏆 Se seieren!':S.bossFled?'Videre →':'Neste →';
}

// handleNext hook
function bossNext(){
  if(S.bossOver)return;
  if(S.enemyDefeated||S.bossFled){showBossResult(S.enemyDefeated);return;}
  loadQuestion();
  bossProg();
}

function bossCleanup(){
  document.getElementById('screen-game').classList.remove('boss-mode','boss-final');
  document.getElementById('enemy-avatar').classList.remove('boss-flee','boss-morph');
}

// ---- Result overlay: win (big celebration) or flee ("Nesten! Prøv igjen") ----
function showBossResult(win){
  if(S.bossOver)return;
  S.bossOver=true;
  const g=S.grade,b=BOSSES[g];
  const first=win&&!isBossDefeated(g),wasOpen=g<10&&isGradeUnlocked(g+1);
  const xp=win?(first?150:50):20,coins=win?(first?25:10):3;
  if(win)localStorage.setItem('mh_boss_'+g,'1');
  const oldL=curLvl();
  prog.xp+=xp;prog.coins+=coins;saveProg();renderHUD();
  const newL=curLvl();
  if(newL>oldL){checkEvolution(oldL,newL);unlockAchievement('lvlup');if(newL>=5)unlockAchievement('lvl5');if(newL>=8)unlockAchievement('lvl8');if(newL>=12)unlockAchievement('lvl12');}
  updatePlayerEmoji();
  if(prog.coins>=50)unlockAchievement('coins50');
  if(prog.coins>=100)unlockAchievement('coins100');
  if(win&&S.questions.every(q=>q.ok))unlockAchievement('perfect'); // flawless boss K.O.
  if(win)unlockAchievement('boss'+g);

  const o=document.getElementById('boss-result');
  o.classList.toggle('win',win);
  const em=document.getElementById('br-emoji');
  em.className='boss-emoji '+(win?'boss-ko':'boss-run');
  em.textContent=win?'🏆':b.emoji+'💨';
  document.getElementById('br-title').textContent=win?(g===10?'👑 DU VANT! 👑':'🏆 SEIER! 🏆'):'Nesten! 💪';
  let sub;
  if(win){
    sub=`Du beseiret <b>${b.name}</b> med ${b.skills}!<div class="boss-quote">${b.koEmoji||'😵'} «${b.ko}»</div>`;
    if(g<10&&!wasOpen&&isGradeUnlocked(g+1))sub+=`<div class="boss-unlock">🗺️ ${g+1}. klasse er åpnet!</div>`;
    if(g===10)sub+='<div class="boss-unlock">✨ Talland er reddet!</div>';
  }else{
    sub=`${b.name} ble redd og stakk av! 💨<br>Prøv igjen — du klarer det!`;
    if(S.enemyHp<=35)sub+='<div class="boss-unlock">Bossen hadde bare litt liv igjen! 🔥</div>';
  }
  document.getElementById('br-sub').innerHTML=sub;
  // What the child practised/learned in this fight, per topic of the grade
  const learned=(CUR[g]?.topics||[]).filter(t=>S.bossStats[t.id]).map(t=>{
    const st=S.bossStats[t.id],mark=st.ok===st.n?'⭐':st.ok>0?'✓':'💪';
    return `<span class="boss-chip${st.ok>0?' good':''}">${mark} ${bossEsc(t.icon)} ${bossEsc(t.name)} · ${st.ok}/${st.n}</span>`;
  }).join('');
  document.getElementById('br-skills').innerHTML=learned?`<div class="boss-skills-lbl">${win?'🧠 Dette kan du nå:':'🧠 Dette øvde du på:'}</div><div class="boss-chips">${learned}</div>`:'';
  const rw=[['✨',`+${xp} XP`],['🪙',`+${coins}`],['✅',`${S.score} riktige`]];
  if(first)rw.push([b.emoji,'Nytt merke!']);
  document.getElementById('br-rewards').innerHTML=rw.map(([i,v])=>`<div class="chest-reward"><span class="chest-reward-icon">${i}</span><div class="chest-reward-val">${v}</div></div>`).join('');
  document.getElementById('br-btns').innerHTML=
    win&&g===10?'<button class="boss-go gold" onclick="bossToEnding()">✨ Se slutten</button>':
    win?'<button class="boss-go gold" onclick="bossExit(\'grades\')">🗺️ Til kartet</button>':
    '<button class="wp-cancel" onclick="bossExit(\'topics\')">🗺️ Kart</button><button class="boss-go" onclick="bossRetry()">🔁 Prøv igjen</button>';
  document.getElementById('br-test').classList.toggle('show',!!bossTestSnap);
  o.classList.add('show');
  if(win){if(!heroVictoryFx(220))launch(220,['#ffd93d','#ff6b35','#00ff88','#06d6ff','#a855f7','#f093fb']);bossFanfare();setTimeout(sndLvl,900);sidekickReact('celebrate');}
  else{tone(523,.12);setTimeout(()=>tone(659,.18),120);sidekickReact('happy');}
  pgBossResult(win,g,first); // PROGRESSION: streak, shop unlocks, NIVÅ OPP
}

function bossRetry(){
  document.getElementById('boss-result').classList.remove('show');
  startBoss(S.grade);
}

function bossExit(to){
  const g=S.grade;
  document.getElementById('boss-result').classList.remove('show');
  bossCleanup();
  bossRestore(); // ends a ?boss= test session (no-op otherwise)
  if(!localStorage.getItem('mh_player')){showScreen('chars');return;}
  buildGradeMap();
  if(to==='topics')selectGrade(g);else showScreen('grades');
  if(pendingEvolution)showEvolution();
}

function bossToEnding(){
  document.getElementById('boss-result').classList.remove('show');
  bossCleanup();
  showEnding(true);
}

// Leaving a boss fight with the ← button
document.querySelector('#screen-game .battle-back')?.addEventListener('click',()=>{
  if(!S.boss||S.bossOver)return;
  S.bossOver=true;
  bossCleanup();
  if(bossTestSnap){bossRestore();if(!localStorage.getItem('mh_player')){showScreen('chars');return;}}
  buildGradeMap();
});

// ---- The ending (after NULLIUS) — story-style panels ----
let bossEndIdx=0,endingFromBoss=false;
function showEnding(fromBoss){
  endingFromBoss=!!fromBoss;
  const name=bossEsc(getPlayer().name),hero=bossHero(),sk=getSidekickEmoji();
  const P=[
    `<div class="end-morph"><span>👹</span><span class="end-arrow">→</span><span class="end-zero">0️⃣</span></div>
     <div class="story-big"><span class="red">NULLIUS</span> er beseiret!</div>
     <div class="story-sub">Med et lite «pling» krympet han til en bitte liten null. «Unnskyld,» pep han. «Jeg ville bare være med og regne!»</div>`,
    `<div class="story-hero">${hero}</div>
     <div class="story-big">Takket være <span class="gold">${name}</span> er tallene tilbake!</div>
     <div class="story-sub">Du har lært pluss, minus, ganging, deling og masse mer. Nå flyr tallene hjem til Talland igjen!</div>`,
    `<div class="end-party">🏰🎆🎉</div>
     <div class="story-big">Hele <span class="gold">Talland</span> jubler!</div>
     <div class="story-sub">Kongen holder stor fest. Pluss-trollet, Gange-ormen og alle de andre er med. Nå er de venner!</div>`,
    `<div class="end-final">${hero}<span>${sk}</span></div>
     <div class="story-big">Takk for at du reddet <span class="gold">Talland</span>!</div>
     <div class="story-sub">Du er en ekte Mattehelt, ${name}! 👑<br>Du har fått merket «Tallands helt».</div>`,
  ];
  document.getElementById('ending-panels').innerHTML=P.map((h,i)=>
    `<div class="end-panel${i===0?' active':''}">${h}
      <div class="story-dots">${P.map((_,j)=>`<div class="story-dot${j===i?' active':''}"></div>`).join('')}</div>
      ${i<P.length-1?'<button class="story-btn" onclick="endingNext()">Neste →</button>':'<button class="story-btn end-btn" onclick="closeEnding()">🗺️ Til kartet</button>'}
    </div>`).join('');
  bossEndIdx=0;
  document.getElementById('ending-overlay').classList.remove('hidden');
  launch(60,['#ffd93d','#06d6ff','#a855f7']);
  sndLvl();
}
function endingNext(){
  const ps=document.querySelectorAll('#ending-panels .end-panel');
  bossEndIdx=Math.min(bossEndIdx+1,ps.length-1);
  ps.forEach((p,i)=>p.classList.toggle('active',i===bossEndIdx));
  if(bossEndIdx===ps.length-1){unlockAchievement('talland');launch(180,['#ffd93d','#ff6b35','#00ff88','#06d6ff','#a855f7','#f093fb']);bossFanfare();}
  else{launch(50);tone(659,.1);setTimeout(()=>tone(784,.14),90);}
}
function closeEnding(){
  document.getElementById('ending-overlay').classList.add('hidden');
  if(endingFromBoss){endingFromBoss=false;unlockAchievement('talland');bossExit('grades');}
}

// ---- Parent test shortcut: ?boss=1 … ?boss=10 (runs after INIT) ----
setTimeout(()=>{
  let g=0;
  try{g=parseInt(new URLSearchParams(location.search).get('boss'),10);}catch(e){}
  if(!BOSSES[g]||!CUR[g])return;
  bossTestSnap=bossSnapshot();
  window.addEventListener('pagehide',()=>bossRestore());
  document.getElementById('story-overlay').classList.add('hidden');
  openBossIntro(g);
},0);

// ============================================================
// BATTLE FX
// ============================================================
// Juice for the battle screen. Purely visual/audio: nothing here blocks input, hides
// the question or delays the feedback box. Temporary elements live in #fx-layer
// (fixed, pointer-events:none) and remove themselves. Hooks in existing code:
// tone (mute gate), showScreen (fxScreen), startGame + startBoss (fxStart),
// submitAnswer (fxCorrect / fxWrong). Mute flag: localStorage mh_muted ('1' = muted).
// Shop decoration: if getHeroDecor() exists it is shown next to #player-avatar.
const fx={gen:0,scr:null,xp:0,coins:0,hp:100,pts:0,phase:0};
const FX_RANK={chars:0,grades:1,topics:2,learn:3,game:3,results:4,parent:5};
const fxMQ=window.matchMedia?window.matchMedia('(prefers-reduced-motion: reduce)'):null;
function fxRM(){return !!(fxMQ&&fxMQ.matches);}
function fxMuted(){try{return localStorage.getItem('mh_muted')==='1';}catch(e){return false;}}
function fxE(id){return document.getElementById(id);}
function fxLayer(){let L=fxE('fx-layer');if(!L){L=document.createElement('div');L.id='fx-layer';L.className='fx-layer';L.setAttribute('aria-hidden','true');document.body.appendChild(L);}return L;}
function fxPt(el){if(!el)return null;const r=el.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2,w:r.width,h:r.height,bottom:r.bottom};}
function fxClampX(x,m){const w=window.innerWidth||375;return Math.max(m,Math.min(w-m,x));}
// Runs fn after ms unless a new battle started / the battle screen was left meanwhile
function fxLater(fn,ms){const g=fx.gen,run=()=>{if(g===fx.gen)try{fn();}catch(e){}};if(ms>0)setTimeout(run,ms);else run();}
// (Re)start a CSS animation class; restarts via a fresh frame instead of forcing layout
function fxCls(el,c,ms){if(!el)return;const k='_fx_'+c,g=fx.gen;clearTimeout(el[k]);const add=()=>{if(g!==fx.gen)return;el.classList.add(c);if(ms)el[k]=setTimeout(()=>el.classList.remove(c),ms);};if(el.classList.contains(c)){el.classList.remove(c);requestAnimationFrame(()=>requestAnimationFrame(add));}else add();}
function fxSpawn(cls,txt,x,y,ms,delay,vars){const L=fxLayer(),e=document.createElement('div');e.className='fx '+cls;if(txt)e.textContent=txt;let s=`left:${Math.round(x)}px;top:${Math.round(y)}px;`;if(delay)s+=`animation-delay:${delay}ms;`;if(vars)for(const k in vars)s+=`${k}:${vars[k]};`;e.style.cssText=s;L.appendChild(e);setTimeout(()=>e.remove(),ms+(delay||0)+80);return e;}
function fxShoot(txt,cls,a,b,delay,dur){return fxSpawn(cls,txt,a.x,a.y,dur,delay,{'--dx':Math.round(b.x-a.x)+'px','--dy':Math.round(b.y-a.y)+'px','animation-duration':dur+'ms'});}
function fxSparks(p,n,chars,dist,delay){for(let i=0;i<n;i++){const a=Math.PI*2*(i/n)+Math.random()*.6,d=dist*(.6+Math.random()*.5);fxSpawn('fx-spark',chars[i%chars.length],p.x,p.y,600,delay||0,{'--dx':Math.round(Math.cos(a)*d)+'px','--dy':Math.round(Math.sin(a)*d)+'px'});}}
function fxFlash(p,col,ms){fxSpawn('fx-flash fx-full','',0,0,ms,0,{'--x':Math.round(p.x)+'px','--y':Math.round(p.y)+'px','--fxc':col,'animation-duration':ms+'ms'});}
function fxShake(big){if(fxRM())return;const gc=document.querySelector('.game-col');if(gc)fxCls(gc,big?'fx-shake-big':'fx-shake',big?650:450);}
function fxClear(){fx.gen++;const L=fxE('fx-layer');if(L)L.textContent='';const gc=document.querySelector('.game-col');if(gc)gc.classList.remove('fx-shake','fx-shake-big');}

// ---- Sounds (WebAudio synth; all silent while muted) ----
let fxNoiseBuf=null;
function fxOsc(f1,f2,d,type,v,at){if(fxMuted())return;try{const c=ga(),t=c.currentTime+(at||0),o=c.createOscillator(),g=c.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f1,t);if(f2&&f2!==f1)o.frequency.exponentialRampToValueAtTime(f2,t+d);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+d+.05);}catch(e){}}
function fxNoise(d,v,f1,f2,type,at){if(fxMuted())return;try{const c=ga(),t=c.currentTime+(at||0);if(!fxNoiseBuf||fxNoiseBuf.sampleRate!==c.sampleRate){const n=c.sampleRate|0;fxNoiseBuf=c.createBuffer(1,n,c.sampleRate);const a=fxNoiseBuf.getChannelData(0);for(let i=0;i<n;i++)a[i]=Math.random()*2-1;}const s=c.createBufferSource(),fl=c.createBiquadFilter(),g=c.createGain();s.buffer=fxNoiseBuf;s.loop=true;fl.type=type||'bandpass';fl.Q.value=.8;fl.frequency.setValueAtTime(f1,t);fl.frequency.exponentialRampToValueAtTime(f2,t+d);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+d*.3);g.gain.exponentialRampToValueAtTime(.0001,t+d);s.connect(fl);fl.connect(g);g.connect(c.destination);s.start(t);s.stop(t+d+.05);}catch(e){}}
function fxSndSwoosh(lv,slow){const d=slow?.5:.2;fxNoise(d,.1,slow?300:700,slow?1800:3400,'bandpass');if(lv>=2)fxOsc(slow?150:260,slow?520:820,d,'triangle',.05);}
function fxSndHit(lv,at,slow){fxOsc(slow?140:190,45,slow?.45:.2,'sine',.34,at);fxNoise(.14,.13,2600,700,'bandpass',at);if(lv>=3||slow){fxNoise(slow?.9:.55,.2,3600,160,'lowpass',at);fxOsc(950,70,.32,'sawtooth',.045,at);}}
function fxSndClink(at){fxOsc(1760,1720,.16,'triangle',.13,at);fxOsc(2637,2600,.24,'sine',.07,(at||0)+.025);fxNoise(.06,.05,7000,5000,'highpass',at);}
function fxSndThrow(){fxNoise(.2,.05,450,1600,'bandpass',.1);}
function fxSndKO(){[392,523,659,784].forEach((f,i)=>setTimeout(()=>tone(f,.12,'triangle',.2),i*85));setTimeout(()=>{tone(1046,.5,'triangle',.2);tone(784,.5,'sine',.1);tone(523,.5,'sine',.08);},360);}
function fxSndRoar(at){fxOsc(175,55,.9,'sawtooth',.1,at);fxOsc(186,58,.9,'sawtooth',.08,(at||0)+.03);fxNoise(.8,.12,1100,140,'lowpass',at);}
function fxSndTick(low){fxOsc(low?380:640,low?340:600,.045,'triangle',.05);}

// ---- Mute toggle (🔊/🔇 in the battle top bar) ----
function fxMuteSync(){const b=fxE('fx-mute');if(!b)return;const m=fxMuted();b.textContent=m?'🔇':'🔊';b.classList.toggle('off',m);b.setAttribute('aria-pressed',m?'true':'false');b.setAttribute('aria-label',m?'Skru på lyd':'Skru av lyd');b.title=m?'Lyd av':'Lyd på';}
function fxToggleMute(){const m=!fxMuted();try{localStorage.setItem('mh_muted',m?'1':'0');}catch(e){}fxMuteSync();if(!m){try{if(ac&&ac.resume)ac.resume();}catch(e){}tone(660,.08,'triangle',.15);setTimeout(()=>tone(880,.1,'triangle',.15),70);}}

// ---- Shop decoration from agent D's shop (optional, only if getHeroDecor exists) ----
function fxDecor(){const pa=fxE('player-avatar');if(!pa)return;if(typeof applyHeroDecor==='function')try{applyHeroDecor(pa);}catch(e){}let d=fxE('fx-decor'),v=null;try{if(typeof getHeroDecor==='function'){v=getHeroDecor();if(v&&typeof v==='object')v=v.emoji||v.icon||null;}}catch(e){v=null;}if(!v||typeof v!=='string'){if(d)d.remove();return;}if(!d){d=document.createElement('span');d.id='fx-decor';d.className='fx-decor';d.setAttribute('aria-hidden','true');}d.textContent=v;if(pa.nextElementSibling!==d)pa.insertAdjacentElement('afterend',d);}

// ---- Combo badge grows/pulses, hero aura at combo 3+ / 5+ ----
function fxCombo(n){const cb=fxE('combo-badge'),pa=fxE('player-avatar');if(cb){cb.style.setProperty('--fxs',(1+Math.min(n,8)*.01).toFixed(3));cb.classList.toggle('fx-fire',n>=5);}if(pa){pa.classList.toggle('fx-pow',n>=3);pa.classList.toggle('fx-pow2',n>=5);}if(n>0&&!fxRM())fxCls(fxE('combo-num'),'fx-bump',450);}
function fxHudPop(kind,txt,delay){const el=kind==='xp'?((fxE('hud-fill')&&fxE('hud-fill').parentElement)||fxE('hud-lvl')):fxE('hud-coins'),p=fxPt(el||fxE('hud'));if(!p||!p.w)return;const vh=window.innerHeight||600;fxSpawn('fx-pop '+kind,txt,fxClampX(p.x,48),Math.max(18,Math.min(vh-18,p.bottom+12)),1100,delay);}

// ---- Screen transitions (hook: end of showScreen). Visual only, input is never blocked ----
function fxScreen(n,el){try{if(!el||n===fx.scr)return;const a=FX_RANK[fx.scr],b=FX_RANK[n],first=fx.scr==null;fx.scr=n;document.querySelectorAll('.screen').forEach(s=>s.classList.remove('fx-in-r','fx-in-l','fx-in-z','fx-in-f'));el.classList.add(n==='game'?'fx-in-z':first||a==null||b==null||a===b?'fx-in-f':b>a?'fx-in-r':'fx-in-l');if(n!=='game')fxClear();}catch(e){}}

// ---- Battle start (hook: end of startGame / startBoss): reset + entrance ----
function fxStart(boss){
  fxClear();
  const pa=fxE('player-avatar'),av=fxE('enemy-avatar');
  if(pa)pa.classList.remove('fx-lunge','fx-slow','fx-block','fx-enter');
  if(av)av.classList.remove('fx-hurt','fx-ko','fx-koboss','fx-low','fx-atk','fx-enter','fx-bossin');
  fx.xp=prog.xp;fx.coins=prog.coins;fx.hp=S.enemyHp;fx.pts=S.bossPts||0;fx.phase=S.bossPhase||0;
  fxCombo(0);fxMuteSync();fxDecor();
  fxCls(pa,'fx-enter',650);
  if(boss){ // bigger entrance: the boss drops in, slams down, roars
    fxCls(av,'fx-bossin',1150);fxSndRoar(.12);
    fxLater(()=>{const p=fxPt(av);if(!p)return;fxShake(true);fxSndHit(2,0);fxFlash(p,'rgba(255,68,102,.45)',420);if(!fxRM()){fxSpawn('fx-poof sm','💨',p.x-44,p.y+p.h*.3,700,0);fxSpawn('fx-poof sm','💨',p.x+44,p.y+p.h*.3,700,0);}},470);
  }else fxCls(av,'fx-enter',700);
}

// ---- Correct answer (hook in submitAnswer). The work is deferred to a microtask so it
// sees the final state of the answer (K.O., XP/coins, boss stage) ----
function fxCorrect(){const av=fxE('enemy-avatar'),pre=av?av.textContent:'',g=fx.gen;Promise.resolve().then(()=>{if(g===fx.gen)try{fxHit(pre);}catch(e){}});}
function fxHit(pre){
  const pa=fxE('player-avatar'),av=fxE('enemy-avatar');if(!pa||!av)return;
  const rm=fxRM(),c=S.combo,lv=c>=5?3:c>=3?2:1,ko=!!S.enemyDefeated,slow=ko&&!!S.boss;
  const dmg=S.boss?fx.pts-(S.bossPts||0):fx.hp-S.enemyHp,dxp=prog.xp-fx.xp,dco=prog.coins-fx.coins,stage=!!S.boss&&(S.bossPhase||0)>fx.phase;
  fx.hp=S.enemyHp;fx.pts=S.bossPts||0;fx.xp=prog.xp;fx.coins=prog.coins;fx.phase=S.bossPhase||0;
  const A=fxPt(pa),B=fxPt(av),T=rm?0:slow?950:lv===3?260:290,dist=Math.abs(B.x-A.x);
  fxCombo(c);
  // 1. hero lunges at the enemy (slow motion on the boss' final hit)
  if(!rm){const d=fxE('fx-decor'),ms=slow?1150:620;pa.style.setProperty('--fxl',Math.round(Math.max(24,Math.min(64,dist*.2)))+'px');[pa,d].forEach(e=>{if(e){e.classList.toggle('fx-slow',slow);fxCls(e,'fx-lunge',ms);}});}
  if(slow)fxSpawn('fx-dim fx-full','',0,0,1500,0,{'--x':Math.round(B.x)+'px','--y':Math.round(B.y)+'px'});
  // 2. enemy holds still until the attack lands, then flinches (white flash + shake)
  av.classList.remove('fx-low');
  if(!stage){av.style.setProperty('--fxd',(T/1000)+'s');fxCls(av,'fx-hurt',T+560);}
  if(ko){const koE=av.textContent;av.textContent=pre;fxLater(()=>{av.textContent=koE;av.classList.remove('fx-hurt');fxCls(av,S.boss?'fx-koboss':'fx-ko');},T);}
  else av.classList.toggle('fx-low',S.enemyHp>0&&S.enemyHp<=30);
  // 3. projectile: ⭐ (combo 1-2), 🔥 fireball (3-4), ⚡ + lightning bolt (5+)
  fxSndSwoosh(lv,slow);
  if(!rm){const a={x:A.x+(B.x>A.x?18:-18),y:A.y-4},sd=slow?150:90,fl=T-sd;
    fxShoot(lv===3?'⚡':lv===2?'🔥':'⭐','fx-shot'+(lv===2?' fire':'')+(slow?' huge':''),a,B,sd,fl);
    if(lv===2||slow)[.35,.65].forEach(f=>fxSpawn('fx-spark trail','✨',a.x+(B.x-a.x)*f,a.y+(B.y-a.y)*f,500,Math.round(sd+fl*f)));
    if(lv===3)fxSpawn('fx-bolt','⚡',B.x,B.y,400,Math.max(0,T-210));}
  fxSndHit(lv,T/1000,slow);
  // 4. impact: 💥, slash, sparks, damage number, XP/coin pops near the HUD, K.O.
  fxLater(()=>{
    fxSpawn('fx-boom'+(slow?' huge':lv===3?' big':''),'💥',B.x,B.y,700,0);
    if(!rm){fxSpawn('fx-slash','',B.x,B.y,340,0,{'--fxc':lv===3?'#06d6ff':lv===2?'#ff6b35':'#ffd93d'});if(lv===3||slow)fxSpawn('fx-slash x','',B.x,B.y,340,40,{'--fxc':'#ffd93d'});fxSparks(B,slow?8:lv===3?6:lv===2?4:3,lv===3?['⚡','✨']:lv===2?['🔥','✨']:['⭐','✨'],slow?110:70);}
    if(lv>=2||slow)fxFlash(B,lv===3||slow?'rgba(255,245,170,.55)':'rgba(255,140,60,.4)',slow?600:380);
    if(dmg>0)fxSpawn('fx-dmg'+(lv===3||slow?' big':''),'-'+dmg,B.x+16,B.y-B.h*.3,950,40);
    if(dxp>0)fxHudPop('xp','+'+dxp+' XP',80);
    if(dco>0)fxHudPop('coin','+'+dco+' 🪙',220);
    if(ko){fxShake(true);fxSpawn('fx-stamp','K.O.!',fxClampX(B.x,95),B.y,1800,90);
      if(S.boss){if(!rm)fxLater(()=>fxSpawn('fx-dizzy','💫',B.x,B.y-B.h*.55,2500,0),1100);}
      else{fxSndKO();if(!rm){fxSpawn('fx-poof','💨',B.x+30,B.y-110,700,900);fxSparks({x:B.x+30,y:B.y-110},5,['✨','⭐'],60,950);}}}
    else if(lv===3)fxShake(false);
  },T);
  // 5. NULLIUS changes form: colour flash, shock rings, roar (the morph itself is the boss code's)
  if(stage)fxStage(B);
}
function fxStage(B){const P=((BOSSES[S.grade]&&BOSSES[S.grade].phases)||[])[(S.bossPhase||1)-1]||{},hot=P.emoji==='🌋';
  fxFlash(B,hot?'rgba(255,107,53,.6)':'rgba(168,85,247,.6)',650);
  fxSpawn('fx-ring big','',B.x,B.y,700,0,{'--fxc':hot?'#ff6b35':'#06d6ff'});fxSpawn('fx-ring big','',B.x,B.y,700,160,{'--fxc':'#ffd93d'});
  if(!fxRM()){fxSparks(B,6,[P.emoji||'✨','✨'],90,120);fxShake(true);}
  fxSndRoar(.08);}

// ---- Wrong answer (hook in submitAnswer): the enemy attacks, the hero blocks with a shield.
// The feedback box is already on screen; this only plays around the fighters ----
function fxWrong(){const g=fx.gen;Promise.resolve().then(()=>{if(g===fx.gen)try{fxBlock();}catch(e){}});}
function fxBlock(){
  const pa=fxE('player-avatar'),av=fxE('enemy-avatar');if(!pa||!av)return;
  const rm=fxRM();fx.hp=S.enemyHp;fx.pts=S.bossPts||0;fx.xp=prog.xp;fx.coins=prog.coins;fx.phase=S.bossPhase||0;
  fxCombo(0);
  const A=fxPt(pa),B=fxPt(av),dir=B.x>=A.x?1:-1,gap=Math.abs(B.x-A.x),sh={x:A.x+dir*Math.max(34,Math.min(58,gap*.28)),y:A.y},T=rm?0:400;
  if(!rm&&!av.classList.contains('boss-flee')){av.style.setProperty('--fxl',Math.round(Math.max(20,Math.min(48,gap*.14)))+'px');fxCls(av,'fx-atk',560);fxSndThrow();fxShoot('🌀','fx-shot foe',{x:B.x-dir*16,y:B.y},sh,150,T-150);}
  fxSpawn('fx-shield','🛡️',sh.x,sh.y,1000,0);
  fxCls(pa,'fx-block',950);
  fxLater(()=>{fxSpawn('fx-ring','',sh.x,sh.y,450,0,{'--fxc':'#06d6ff'});if(!rm)fxSparks(sh,3,['✨'],40,0);fxSpawn('fx-word','Blokkert!',fxClampX((A.x+sh.x)/2,60),A.y-A.h*.45,1000,0);},T);
  fxSndClink(T/1000);
}

// ---- Init: mute icon, question-card pop-in (observes #q-card, no change to loadQuestion), numpad press ----
(function(){
  fxMuteSync();
  const mb=fxE('fx-mute');if(mb)mb.addEventListener('mousedown',e=>e.preventDefault()); // keep focus in the answer field
  const qc=fxE('q-card'),cf=fxE('combo-flash');
  if(qc&&window.MutationObserver){let flip=false;new MutationObserver(ms=>{if(!ms.some(m=>!(cf&&cf.contains(m.target))))return;flip=!flip;qc.classList.remove(flip?'fx-qb':'fx-qa');qc.classList.add(flip?'fx-qa':'fx-qb');}).observe(qc,{childList:true,characterData:true,subtree:true});}
  const pad=fxE('numpad');
  if(pad)pad.addEventListener(window.PointerEvent?'pointerdown':'touchstart',e=>{const b=e.target&&e.target.closest?e.target.closest('button'):null;if(!b||!pad.contains(b)||S.answered)return;const was=b.classList.contains('fx-pa');b.classList.remove('fx-pa','fx-pb');b.classList.add(was?'fx-pb':'fx-pa');fxSndTick(b.classList.contains('n-del'));},{passive:true});
})();

// ============================================================
// INIT
// ============================================================
buildCharGrid();
buildSidekickGrid();
const savedPlayer=localStorage.getItem('mh_player');
if(savedPlayer){
  applyPlayer(JSON.parse(savedPlayer));
  updatePlayerEmoji();
  updateSidekick();
  buildAdventureMap();
  showScreen('grades');
} else if(!localStorage.getItem('mh_story_seen')){
  showStory();
}
renderHUD();
