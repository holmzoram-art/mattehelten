// Mattehelten – Oppstart (lastes sist)
// Alle js-filer deler globalt navnerom (vanlige <script>-tagger i fast rekkefølge, se index.html).

// ============================================================
// INIT
// ============================================================
// Flyttet hit fra progression.js: trenger funksjoner fra senere filer (boss.js)
if(!pgSeenList())localStorage.setItem('mh_pg_seen',JSON.stringify(pgEvents())); // first run (also old saves): what is open now counts as celebrated
if(prog.streak&&prog.lastDay!==pgDay(0)&&prog.lastDay!==pgDay(-1)){prog.streak=0;saveProg();} // a missed day resets quietly

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
} else if(!gradeChosen()){
  showGradeAsk(); // ny spiller som lukket siden før klassevalget
}
renderHUD();

// Flyttet hit fra boss.js: må kjøre etter oppstart
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
