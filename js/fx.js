// Mattehelten – Kampeffekter
// Alle js-filer deler globalt navnerom (vanlige <script>-tagger i fast rekkefølge, se index.html).

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

// ---- First wrong answer (hook in loopRetry): no attack, no HP loss – a friendly "think" puff + soft two-note sound ----
function fxTry(){const g=fx.gen;Promise.resolve().then(()=>{if(g!==fx.gen)return;try{const pa=fxE('player-avatar'),p=fxPt(pa);fxCombo(0);
  if(p&&p.w)fxSpawn('fx-word','Tenk! 💡',fxClampX(p.x,60),p.y-p.h*.45,1000,0);
  fxOsc(392,440,.13,'triangle',.06);fxOsc(523,587,.16,'triangle',.05,.12);}catch(e){}});}

// ---- Init: mute icon, question-card pop-in (observes #q-card, no change to loadQuestion), numpad press ----
(function(){
  fxMuteSync();
  const mb=fxE('fx-mute');if(mb)mb.addEventListener('mousedown',e=>e.preventDefault()); // keep focus in the answer field
  const qc=fxE('q-card'),cf=fxE('combo-flash');
  if(qc&&window.MutationObserver){let flip=false;new MutationObserver(ms=>{if(!ms.some(m=>!(cf&&cf.contains(m.target))))return;flip=!flip;qc.classList.remove(flip?'fx-qb':'fx-qa');qc.classList.add(flip?'fx-qa':'fx-qb');}).observe(qc,{childList:true,characterData:true,subtree:true});}
  const pad=fxE('numpad');
  if(pad)pad.addEventListener(window.PointerEvent?'pointerdown':'touchstart',e=>{const b=e.target&&e.target.closest?e.target.closest('button'):null;if(!b||!pad.contains(b)||S.answered)return;const was=b.classList.contains('fx-pa');b.classList.remove('fx-pa','fx-pb');b.classList.add(was?'fx-pb':'fx-pa');fxSndTick(b.classList.contains('n-del'));},{passive:true});
})();
