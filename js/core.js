// Mattehelten – Stjernehimmel, kladdeark, historie, sidekicks, verdenshistorier, helter + evolusjon, verdener
// Alle js-filer deler globalt navnerom (vanlige <script>-tagger i fast rekkefølge, se index.html).

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
