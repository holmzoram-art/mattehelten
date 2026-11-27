// Mattehelten – Opplesing på norsk (speechSynthesis): speak(), speakQ(), ttsOn()
// Alle js-filer deler globalt navnerom (vanlige <script>-tagger i fast rekkefølge, se index.html).
//
// speak(text,{force,grade})  leser teksten høyt og avbryter forrige tale. Uten force bare når ttsOn(grade).
// speakQ(qd,{force})          leser en oppgave: qd.say hvis den finnes, ellers ttsQText(qd).
// ttsOn(g)                    automatisk opplesing? Innstilling tts: 'auto' (= på i 1.–2. klasse) | 'on' | 'off'.
// ttsReady()                  finnes det en norsk stemme? Uten norsk stemme skjules alle 🔊 (CSS: html.tts-ok).
// ttsText(s) / ttsQText(qd)   vist tekst → taletekst: «8 + 5 = ?» → «Hva er 8 pluss 5?», emoji blir ord eller fjernes.
// ttsStop()                   stopper tale (brukes av showScreen).
const TTS={voice:null,tok:0,act:false,u:null};
function ttsSynth(){try{return typeof speechSynthesis!=='undefined'&&speechSynthesis&&typeof speechSynthesis.speak==='function'?speechSynthesis:null;}catch(e){return null;}}
// Beste norske stemme: nb > no > nn; naturlige/lokale stemmer foran andre
function ttsPickVoice(list){
  let best=null,bs=0;
  (list||[]).forEach(v=>{if(!v)return;const l=String(v.lang||'').toLowerCase().replace('_','-'),n=String(v.name||'').toLowerCase();
    let s=/^nb(-|$)/.test(l)?30:/^no(-|$)/.test(l)?25:/^nn(-|$)/.test(l)?15:(!l||/^no|^nb/.test(l))&&/norsk|norwegian|bokm[aå]l/.test(n)?10:0;
    if(!s)return;if(/natural|neural|premium|enhanced/.test(n))s+=3;if(v.localService)s+=1;if(v.default)s+=1;
    if(s>bs){bs=s;best=v;}});
  return best;
}
function ttsMark(){try{const r=document.documentElement;if(r&&r.classList)r.classList.toggle('tts-ok',!!TTS.voice);}catch(e){}}
function ttsLoad(){const sy=ttsSynth();let v=null;if(sy)try{v=ttsPickVoice(sy.getVoices());}catch(e){}TTS.voice=v;ttsMark();return !!v;}
function ttsReady(){return !!(TTS.voice&&ttsSynth());}
// Hvilket klassetrinn gjelder nå (for 'auto')
function ttsGrade(g){if(g)return +g;try{if(typeof S!=='undefined'&&S&&S.grade)return +S.grade;}catch(e){}const s=typeof getSetting==='function'?+getSetting('startGrade'):1;return s||1;}
function ttsOn(g){if(!ttsReady())return false;const m=typeof getSetting==='function'?getSetting('tts'):'auto';if(m==='off')return false;if(m==='on')return true;return ttsGrade(g)<=2;}
// Nettlesere tillater tale først etter at brukeren har trykket på siden
function ttsActivated(){try{const u=typeof navigator!=='undefined'&&navigator.userActivation;if(u&&u.hasBeenActive)return true;}catch(e){}return TTS.act;}
function ttsStop(){TTS.tok++;const sy=ttsSynth();if(sy)try{sy.cancel();}catch(e){}}

// ---- Tekst → tale ----
// Emoji som teller noe: [entall, flertall, bestemt flertall]
const TTS_WORDS={'🍎':['eple','epler','eplene'],'🍓':['jordbær','jordbær','jordbærene'],'⭐':['stjerne','stjerner','stjernene'],'🐟':['fisk','fisker','fiskene'],'🍪':['kjeks','kjeks','kjeksene'],'🎈':['ballong','ballonger','ballongene'],'🐞':['marihøne','marihøner','marihønene'],'🍌':['banan','bananer','bananene'],'🧁':['muffins','muffins','muffinsene'],'🌸':['blomst','blomster','blomstene'],'🐦':['fugl','fugler','fuglene'],'🐑':['sau','sauer','sauene'],'🧦':['sokk','sokker','sokkene'],'🖐️':['hånd','hender','hendene'],'🖐':['hånd','hender','hendene'],'🖍️':['fargestift','fargestifter','fargestiftene'],'🖍':['fargestift','fargestifter','fargestiftene'],'🐝':['bie','bier','biene'],'🪙':['mynt','mynter','myntene'],'🦆':['and','ender','endene'],'🐸':['frosk','frosker','froskene'],'🍬':['drops','drops','dropsene'],'🥕':['gulrot','gulrøtter','gulrøttene'],'🐱':['katt','katter','kattene'],'🍊':['appelsin','appelsiner','appelsinene']};
const TTS_EMO=/[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}\u{1F3FB}-\u{1F3FF}\uFE0F\u200D\u20E3]/gu;
function ttsHasEmoji(s){TTS_EMO.lastIndex=0;const r=TTS_EMO.test(String(s));TTS_EMO.lastIndex=0;return r;}
function ttsLow(s){return /^[A-ZÆØÅ][a-zæøå]/.test(s)?s[0].toLowerCase()+s.slice(1):s;}
function ttsText(s){
  s=String(s==null?'':s);
  // HTML bort
  s=s.replace(/<br\s*\/?>/gi,'. ').replace(/<\/(div|p|li)>/gi,'. ').replace(/<[^>]*>/g,' ').replace(/&nbsp;/g,' ').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&amp;/g,' og ');
  // «3 🍎» → «3 epler»
  s=s.replace(/(\d+)\s*(\p{Extended_Pictographic}\uFE0F?)/gu,(m,n,e)=>{const w=TTS_WORDS[e]||TTS_WORDS[e.replace('\uFE0F','')];return w?`${n} ${+n===1?w[0]:w[1]}`:n;});
  s=s.replace(/\b(mange|flere)\s*(\p{Extended_Pictographic}\uFE0F?)/gu,(m,w,e)=>{const x=TTS_WORDS[e]||TTS_WORDS[e.replace('\uFE0F','')];return x?`${w} ${x[1]}`:w;});
  s=s.replace(TTS_EMO,' ').replace(/[✓✗✔✘→⇒➜]/g,', ').replace(/\s?—\s?/g,', ');
  s=s.replace(/\s+/g,' ').trim().replace(/^[,.:;!]+\s*/,'');
  // Tallrekke: «2, 4, 6, ?» / «10, ?, 30, 40» (også etter «Frosken hopper:»)
  s=s.replace(/((?:\d+|\?)(?:, (?:\d+|\?)){2,})\s*$/,seq=>{const t=seq.split(', ');if(!t.includes('?'))return seq;
    if(t.indexOf('?')===t.length-1)return t.slice(0,-1).join(', ')+'. Hva kommer så?';
    return t.map(x=>x==='?'?'hva':x).join(', ')+'. Hvilket tall mangler?';});
  // Tall som mangler: «? + 4 = 9», «8 + ? = 10», «9 - ? = 5»
  s=s.replace(/(^|[.!:]\s+)\? ([+\-−]) (\d+) = (\d+)(?=$|[.!])/g,(m,p,o,b,c)=>`${p}Hvilket tall ${o==='+'?'pluss':'minus'} ${b} blir ${c}?`);
  s=s.replace(/(^|[.!:]\s+)(\d+) ([+\-−]) \? = (\d+)(?=$|[.!])/g,(m,p,a,o,c)=>`${p}${a} ${o==='+'?'pluss':'minus'} hvilket tall blir ${c}?`);
  // «X = ?» → «Hva er X?»
  s=s.replace(/(^|[.!:]\s+)([^.!?=]+?)\s*=\s*\?/g,(m,p,x)=>`${p}Hva er ${ttsLow(x.trim())}?`);
  // Gjenstående «?» som står for et tall
  s=s.replace(/(^|[\s(,])\?(?=[\s,)]|$)/g,'$1hva').replace(/ hva$/,' hva?');
  // Regnetegn (bare med mellomrom rundt, så «kl. 12:30» blir stående)
  s=s.replace(/ \+ /g,' pluss ').replace(/ [-−–] /g,' minus ').replace(/ [·×*] /g,' ganger ').replace(/ [:÷] /g,' delt på ').replace(/ = /g,' er like mye som ').replace(/ < /g,' er mindre enn ').replace(/ > /g,' er større enn ');
  s=s.replace(/(^|[\s(])[-−](\d)/g,'$1minus $2').replace(/(\d)\s?%/g,'$1 prosent').replace(/½/g,' en halv').replace(/(\d)\s?kr\b/g,'$1 kroner').replace(/\bkl\. /g,'klokka ');
  return s.replace(/\s+/g,' ').replace(/\s+([.,!?])/g,'$1').replace(/([.!?])\1+/g,'$1').replace(/[\s,;:]+$/,'').trim();
}
// Taletekst for en oppgave (qd fra topic.gen)
function ttsQText(qd){
  if(!qd)return '';
  if(qd.say)return ttsText(qd.say);
  const q=String(qd.q||'');let t;
  if(!/[a-zæøå]/i.test(q)&&ttsHasEmoji(q)){ // telleoppgave med bilder: «🍎🍎🍎 + 🍎🍎 = ?»
    const e=(q.match(/\p{Extended_Pictographic}\uFE0F?/u)||[''])[0],w=TTS_WORDS[e]||TTS_WORDS[e.replace('\uFE0F','')];
    t=`Tell ${w?w[2]:'bildene'}. `+(/ [-−] /.test(q)?'Hvor mange er igjen?':/ \+ /.test(q)?'Hvor mange er det til sammen?':'Hvor mange er det?');
  }else t=ttsText(q);
  // Valg med ord (ikke Ja/Nei) leses opp: barnet kan ikke lese knappene
  const cs=Array.isArray(qd.choices)?qd.choices.map(String):[];
  if(cs.length>=2&&cs.length<=4&&cs.some(c=>/[a-zæøå]{2}/i.test(c))&&!cs.every(c=>/^(ja|nei)$/i.test(c))&&!cs.every(c=>q.toLowerCase().includes(c.toLowerCase()))){const w=cs.map((c,i)=>{const x=ttsText(c).replace(/[.?!]$/,'');return i?ttsLow(x):x;});t+=' '+w.slice(0,-1).join(', ')+' eller '+w[w.length-1]+'?';}
  return t.trim();
}

// ---- Tale ----
function speak(text,o){
  o=o||{};const sy=ttsSynth();if(!sy||!TTS.voice)return '';
  if(!o.force&&(!ttsOn(o.grade)||!ttsActivated()))return '';
  const t=o.raw?String(text||'').trim():ttsText(text);if(!t)return '';
  const my=++TTS.tok,go=()=>{if(my!==TTS.tok)return;try{if(sy.paused&&sy.resume)sy.resume();const u=new SpeechSynthesisUtterance(t);u.voice=TTS.voice;u.lang=TTS.voice.lang||'nb-NO';u.rate=o.rate||.9;u.pitch=1.05;TTS.u=u;sy.speak(u);}catch(e){}};
  let busy=false;try{busy=!!(sy.speaking||sy.pending);if(busy)sy.cancel();}catch(e){}
  if(busy)setTimeout(go,60);else go(); // kort pause etter cancel(): Chrome dropper ellers av og til den nye talen
  return t;
}
function speakQ(qd,o){if(!qd)return '';return speak(ttsQText(qd),Object.assign({},o,{raw:true}));}

// ---- 🔊-knapper (vises bare med norsk stemme) ----
function ttsButton(fn,label){const b=document.createElement('button');b.type='button';b.className='tts-btn';b.textContent='🔊';b.setAttribute('aria-label',label||'Les opp');b.title=label||'Les opp';b.onclick=e=>{if(e&&e.stopPropagation)e.stopPropagation();fn();};return b;}
function ttsReadQ(){try{if(typeof S!=='undefined'&&S&&S.current)speakQ(S.current,{force:true});}catch(e){}}
(function(){
  try{
    const qc=document.getElementById('q-card');
    if(qc&&!document.getElementById('q-tts')){const b=ttsButton(ttsReadQ,'Les oppgaven');b.id='q-tts';b.classList.add('tts-q');qc.appendChild(b);}
    const qt=document.getElementById('q-txt');if(qt&&qt.addEventListener)qt.addEventListener('click',()=>{if(ttsReady())ttsReadQ();}); // trykk på oppgaven = les den
  }catch(e){}
  // Første trykk «låser opp» talen (Safari krever at første tale starter i et trykk)
  const unlock=()=>{if(TTS.act)return;TTS.act=true;const sy=ttsSynth();if(sy)try{const u=new SpeechSynthesisUtterance(' ');u.volume=0;sy.speak(u);}catch(e){}};
  if(typeof document.addEventListener==='function')['pointerdown','touchend','click','keydown'].forEach(ev=>document.addEventListener(ev,unlock,{capture:true,passive:true}));
  if(typeof document.addEventListener==='function')document.addEventListener('visibilitychange',()=>{if(document.hidden)ttsStop();});
  // Stemmene kommer ofte asynkront (voiceschanged), og Safari sender ikke alltid hendelsen
  const sy=ttsSynth();ttsMark();if(!sy||ttsLoad())return;
  try{if(sy.addEventListener)sy.addEventListener('voiceschanged',ttsLoad);else sy.onvoiceschanged=ttsLoad;}catch(e){}
  [250,1000,2500,5000].forEach(ms=>setTimeout(()=>{if(!TTS.voice)ttsLoad();},ms));
})();
