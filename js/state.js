// Mattehelten – XP, merker, partikler, lyd, hjelpere
// Alle js-filer deler globalt navnerom (vanlige <script>-tagger i fast rekkefølge, se index.html).

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
  {id:'ko',            icon:'💀', name:'K.O. Mester!',    desc:'Slå ut monsteret med combo',    secret:false},
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
  {id:'sidekick',      icon:'🐾', name:'Bestevenn!',      desc:'Velg en venn',           secret:false},
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
  document.getElementById('hc-xp-txt').textContent=''; // ikke XP-tall for barnet, streken viser det
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
  const prev=document.querySelector('.screen.active');
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  const el=document.getElementById('screen-'+n);el.classList.add('active');
  el.scrollTop=0;window.scrollTo(0,0);
  // Lukk skjermtastaturet fra forrige skjerm, så første trykk på den nye skjermen treffer
  const a=document.activeElement;if(a&&a!==document.body&&a.blur&&el.contains&&!el.contains(a))a.blur();
  // Ny skjerm: stopp opplesing (kampen leser selv neste oppgave)
  if(prev!==el&&n!=='game'&&typeof ttsStop==='function')ttsStop();
  if(n==='grades'&&typeof goFightLabel==='function')goFightLabel();
  fxScreen(n,el); // BATTLE FX: screen transition
}
function setSpeech(txt,show=true){
  const s=document.getElementById('speech');
  s.textContent=txt;
  s.classList.toggle('show',show);
  if(show){clearTimeout(s._t);s._t=setTimeout(()=>s.classList.remove('show'),2500);}
}
