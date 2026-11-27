// Mattehelten – Foreldresiden: oversikt per tema, tid per dag, typiske feil, tips og innstillinger
// Alle js-filer deler globalt navnerom (vanlige <script>-tagger i fast rekkefølge, se index.html).
//
// Inngang: «👪 Hold inne for voksne» øverst på klassekartet (hold inne i 2 s, parHold*), eller «Se hele oversikten»
// i rundens rapport (showParentReport → parentsLink). Skjermen #screen-parents lages fra JS (parentsScreen).
// Leser: mh_stats (learning.js), mh_learn via topicStars/hasCrown/mstLastDay (mastery.js), mh_fam (curriculum.js), mh_player.
// Skriver bare innstillinger med setSetting('session'|'tts'|'startGrade'). Ingen knapp sletter fremgang.
const PAR_HOLD_MS=2000,PAR_SESSION_MIN=2,PAR_SESSION_MAX=8,PAR_LOW=.65;
const PAR={from:'grades',t0:0,tm:0,tipT:0,savedT:0,metric:'min',opened:0};
const PAR_WD=['søndag','mandag','tirsdag','onsdag','torsdag','fredag','lørdag'],PAR_MON=['jan.','feb.','mars','april','mai','juni','juli','aug.','sep.','okt.','nov.','des.'];

// ---- Feiltyper (window.MISC_NAMES): hva betyr det, og tips hjemme ----
const PAR_MISC={
  starttall:['Barnet teller med tallet det starter på: 8 + 3 blir «8, 9, 10». Svaret blir én for lite (eller én for mye ved minus).','Tell hopp, ikke tall. Pek på 8 på en linjal og hopp tre ganger: 9, 10, 11. Eller si «8 i hodet» og tell videre på tre fingre.'],
  pluss:['Barnet legger sammen når det skal trekke fra, for eksempel 9 − 4 = 13. Ofte leses tegnet for fort.','Pek på tegnet og si regnestykket høyt før dere regner: «9 minus 4». Gjør det med ting: legg fram 9 kjeks og spis 4. Hvor mange er igjen?'],
  minus:['Barnet trekker fra når det skal legge sammen, for eksempel 7 + 3 = 4.','Les regnestykket høyt sammen: «7 pluss 3». Legg to hauger med ting sammen til én haug og tell.'],
  veksling:['Barnet tar det minste sifferet fra det største: 42 − 17 blir 35, fordi 7 − 2 er lettere enn 12 − 7.','Bruk mynter: 42 = 4 tikroner og 2 kroner. Du kan ikke ta 7 kroner fra 2, så veksle én tikrone til ti kroner først. Eller tell opp fra 17: 3 til 20, så 22 til 42 – til sammen 25.'],
  snudd:['Barnet skriver sifrene i feil rekkefølge, for eksempel 71 for 17. Det er vanlig, fordi vi sier «sytten» med sjueren først.','Legg tallet med tikroner og kronestykker: 17 = 1 tikrone og 7 kroner. Si «én tier og sju enere», og skriv tieren først.'],
  dobbel:['Barnet dobler i stedet for å halvere: halvparten av 8 blir 16.','Del rettferdig: 8 druer på to tallerkener, én til deg og én til meg. Snakk om at halvparten alltid blir mindre.'],
  halv:['Barnet halverer i stedet for å doble: dobbelt av 6 blir 3.','«Dobbelt» betyr like mange én gang til. Vis med to hender: 6 fingre og 6 fingre til.'],
  ti:['Svaret bommer med nøyaktig 10. Tierne blir feil, ofte når svaret går over en ny tier.','Gjør et overslag før svaret: «38 + 5 – blir det over 40?» Spør: «Hvor mange tiere blir det?» før barnet skriver.'],
  en:['Svaret bommer med nøyaktig 1. Ofte glipper tellingen, eller det skjer ved tierovergang.','Bruk tierramme eller fingrene: 8 + 5 = 8 + 2 + 3. Fyll opp tieren først, så resten. La barnet sjekke ved å telle én gang til.'],
  // Fra valgoppgavene (qd.whyM) og «4 + 3 = 5 + ?»
  likhet:['Barnet leser = som «svaret kommer»: i 4 + 3 = 5 + ? svarer det 7, eller legger sammen alle tallene.','Les = som «er like mye som». Legg 4 + 3 knapper på én tallerken og 5 på den andre. Hvor mange må til, så det blir likt?'],
  plass:['Barnet blander tiere og enere: teller en tierstav som 1, skriver 6 for 60, eller tror 9 er større enn 13.','Bunt 10 sugerør med strikk. En bunt er 10. Legg tallet med bunter og løse sugerør, og tell buntene først.'],
  halvtime:['Barnet sier halv 3 når klokka er 3.30. På norsk er 3.30 «halv fire»: halvveis til fire.','Se på den korte viseren sammen. Er den forbi 3, på vei mot 4? Da er det halv 4. Si: «halv fire er en halv time før fire».'],
  visere:['Barnet blander den korte og den lange viseren, eller hel og halv time.','Den korte viseren viser timen, den lange minuttene. Rett opp er hel time, rett ned er halv. Snakk om klokka i hverdagen.'],
  mynt:['Barnet teller hvor mange mynter det er, ikke hvor mye de er verdt.','Lek butikk med ekte mynter. Les tallet på hver mynt høyt, og tell videre fra den største: 20, 30, 35.'],
};
const PAR_MISC_ORDER=['pluss','minus','starttall','veksling','snudd','likhet','plass','halvtime','visere','mynt','dobbel','halv','ti','en']; // ved likt antall: de mest konkrete først

// ---- Regnemåter (qd.strat, mh_fam): navn og tips hjemme ----
const PAR_FAM={
  'tell-videre':['Telle videre (3 + 6)','Start på det største tallet og tell videre: «6 … 7, 8, 9». Det minste tallet holder dere på fingrene.'],
  'pluss1':['Pluss 1 og 2','+1 er tallet etter. Spør i farta: «Hva kommer etter 7? Og to etter?»'],
  'dobbel':['Dobler (4 + 4)','Dobler sitter fort med kroppen: to hender (5 + 5), terninger med like øyne, eggekartong (6 + 6). Da blir også 8 − 4 lett.'],
  'naer-dobbel':['Nesten dobler (7 + 8)','Bruk en dobbel som ligger nær: 7 + 8 = 7 + 7 + 1.'],
  'tiervenn':['Tiervenner (3 + 7 = 10)','Vis noen fingre og spør hvor mange som er nede: 3 oppe, 7 nede. I bilen: «Jeg sier 6, du sier tiervennen.»'],
  'null':['Pluss og minus 0','Legg 5 ting på bordet og legg til ingen. Hvor mange nå? Tallet blir det samme.'],
  'tenk-pluss':['Minus som pluss (9 − 6)','Tenk pluss: 9 − 6 blir «6 pluss hva blir 9?». Tell opp fra 6 på fingrene.'],
  'minus1':['Minus 1 og 2','−1 er tallet før. Tell baklengs sammen, som nedtelling til en rakett.'],
  'tell-opp':['Telle opp (9 − 7)','Når tallene ligger nær hverandre, tell opp fra det minste: 7 … 8, 9. Det er 2.'],
  'over-tier':['Over tieren (8 + 5)','Fyll tieren først: 8 + 5 = 8 + 2 + 3. Bruk en eggekartong med 10 plasser eller fingrene.'],
  'under-tier':['Minus forbi tieren (13 − 5)','Gå ned til 10 først: 13 − 5 = 13 − 3 − 2. Eller tenk pluss: 5 + ? = 13.'],
  'hel-tier':['Hele tiere (10 + 8, 30 + 20)','Tell tiere som tikroner: 3 tikroner og 2 tikroner er 5 tikroner, altså 50.'],
  'enere':['Bare enerne endres (13 + 4)','Tieren står stille: 13 + 4 gir 3 + 4 = 7, altså 17. Vis med én tikrone og kronestykker.'],
  'tosifret':['Tosifrede tall (34 + 25)','Tiere for seg og enere for seg: 30 + 20 = 50 og 4 + 5 = 9. Til sammen 59.'],
  'veksling':['Veksling (38 + 14, 53 − 27)','Bruk tikroner og kronestykker. Ti kroner blir én tikrone, og når enerne ikke rekker, veksler dere én tikrone til ti kroner.'],
  'hop1':['Telle 1 og 1','Tell høyt sammen når dere går trapper, og fortsett forbi 20 og 30.'],
  'hop-1':['Telle baklengs','Tell ned fra 20 til 0, som en rakett. Start på et nytt tall hver gang.'],
  'hop2':['Telle med 2','Tell par: sokker, sko og hender. 2, 4, 6, 8 … Prøv også fra 1: 1, 3, 5.'],
  'hop5':['Telle med 5','Tell hender eller femkroner: 5, 10, 15, 20.'],
  'hop10':['Telle med 10','Tell tikroner: 10, 20, 30. Prøv å starte på 3: 3, 13, 23.'],
  'sammenlign':['Størst og minst','Legg to hauger ved siden av hverandre: hvem har flest? Med store tall ser dere på tierne først.'],
  'likhet':['Likhetstegnet (4 + 3 = 5 + 2)','= betyr «like mye som». Legg 4 + 3 knapper på én tallerken og 5 + 2 på en annen. Er det likt?'],
  'hel-time':['Hel time','Snakk om klokka i hverdagen: «Nå er klokka sju. Den lange viseren peker rett opp.»'],
  'halv-time':['Halv time','Halv betyr at den lange viseren peker rett ned. Halv sju er 6.30, en halv time før sju.'],
  'digital':['Digital klokke','Sammenlign klokka på komfyren med en vanlig klokke: 7.30 er halv åtte.'],
  'klokke-tid':['Timer senere','Spør: «Klokka er 3 nå. Hva er den om to timer?» Tell timene på urskiva.'],
  'tier-ener':['Tiere og enere','Bunt 10 sugerør med strikk. 34 = 3 bunter og 4 løse. Tikroner og kronestykker virker også.'],
  'mangler-pluss':['Hva mangler? (7 + ? = 9)','Gjem noen ting under en kopp: «Det var 9. Nå ser du 7. Hvor mange er under koppen?»'],
  'mangler-minus':['Hva mangler? (18 − ? = 10)','Tell opp fra svaret: fra 10 til 18 er 8. En linjal er en fin tallinje.'],
  'partall':['Partall og oddetall','Del sokker eller bestikk i par. Får alle en makker, er det partall. Blir én igjen, er det oddetall.'],
  'penger':['Penger','Lek butikk med ekte mynter (1, 5, 10 og 20 kr). La barnet betale og regne ut hva det får igjen.'],
  'halv':['Halvparten','Del rettferdig på to tallerkener: 8 druer, én til deg og én til meg.'],
  'halv-stor':['Halvparten av store tall','Del tiere og enere hver for seg: halvparten av 48 er 20 + 4 = 24.'],
  'dobbel-stor':['Dobbelt av store tall','Tiere og enere hver for seg: dobbelt av 25 er 40 + 10 = 50.'],
  'x2':['2-gangen','Ganging er like grupper. 2-gangen er dobler: 4 · 2 = 4 + 4.'],
  'x5':['5-gangen','Tell hender: 3 · 5 er tre hender med fem fingre, altså 15.'],
  'x10':['10-gangen','4 · 10 er 4 tiere, altså 40. Bruk tikroner.'],
};
// ---- Tips per tema (når ingen regnemåte peker seg ut) ----
const PAR_TOPIC={
  add10:'Bruk fingrene eller 10 ting, for eksempel knapper. «Du har 4, jeg gir deg 3. Hvor mange nå?» Start på det største tallet og tell videre.',
  sub10:'Legg fram 8 ting og gjem 3 under en kopp. Hvor mange er igjen? Si regnestykket høyt: «8 minus 3».',
  ten1:'Tiervenner med fingrene: vis 3 fingre, hvor mange er nede? I bilen: «Jeg sier 6, du sier tiervennen.»',
  cmp1:'Legg to hauger med ting ved siden av hverandre. Hvem har flest? Med store tall ser dere på tierne først.',
  seq1:'Tell høyt i hopp mens dere går trappa: 2, 4, 6 … eller 5, 10, 15. Tell også baklengs fra 20.',
  eq1:'Likhetstegnet betyr «like mye som». Legg 4 + 3 knapper på én tallerken og 5 + 2 på en annen. Er det likt?',
  add20:'Fyll tieren først: 8 + 5 = 8 + 2 + 3. En eggekartong med 10 plasser er en perfekt tierramme.',
  sub20:'Gå ned til 10 først: 13 − 5 = 13 − 3 − 2. Eller tenk pluss: 5 + ? = 13.',
  clock1:'Snakk om klokka i hverdagen: «Nå er klokka sju. Den lange viseren peker rett opp.» Halv betyr at den peker rett ned.',
  place2:'Bunt 10 sugerør med strikk. 34 = 3 bunter og 4 løse. Tikroner og kronestykker virker også.',
  add100:'Tiere for seg og enere for seg: 34 + 25 = 30 + 20 og 4 + 5. Bruk tikroner og kronestykker.',
  sub100:'Bruk mynter: 53 − 27. Ta bort 2 tikroner og så 7 kroner. Veksle en tikrone når kronene ikke rekker.',
  miss2:'Gjem noen ting under en kopp: «Det var 9. Nå ser du 7. Hvor mange er under koppen?» Tell opp fra 7 til 9.',
  even2:'Del sokker eller bestikk i par. Får alle en makker, er det partall. Blir én igjen, er det oddetall.',
  money2:'Lek butikk med ekte mynter (1, 5, 10 og 20 kr). La barnet betale og regne ut hva det får igjen.',
  dbl2:'Del rettferdig ved måltidet: 8 druer på to tallerkener. Dobbelt av 25: 20 + 20 og 5 + 5.',
  mul25:'Ganging er like grupper: 4 · 5 er fire hender med fem fingre. Tell i 2-er, 5-er og 10-er.',
};

// ============================================================
// DATA (rene funksjoner – testes i tests/parents.test.js)
// ============================================================
function parEsc(s){return String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])).replace(/(\S) ([+\-−=·]) (?=\S)/g,'$1\u00a0$2\u00a0');} // regnestykker brytes ikke midt i
function parNum(v){v=+v;return isFinite(v)&&v>0?v:0;}
// mh_stats lest trygt: bare gyldige dager, tall ≥ 0, riktige ≤ antall
function parStats(){
  const d=mhLoad('mh_stats',{}),o={};
  if(!d||typeof d!=='object'||Array.isArray(d))return o;
  Object.keys(d).forEach(k=>{const x=d[k];if(!/^\d{4}-\d{2}-\d{2}$/.test(k)||!x||typeof x!=='object'||Array.isArray(x))return;
    const t={},m={},n=Math.round(parNum(x.n));
    if(x.t&&typeof x.t==='object')Object.keys(x.t).forEach(tk=>{const a=x.t[tk];if(!Array.isArray(a))return;const tn=Math.round(parNum(a[0]));if(tn)t[tk]=[tn,Math.min(tn,Math.round(parNum(a[1])))];});
    if(x.m&&typeof x.m==='object')Object.keys(x.m).forEach(mk=>{const c=Math.round(parNum(x.m[mk]));if(c)m[mk]=c;});
    o[k]={ms:parNum(x.ms),n,ok:Math.min(n,Math.round(parNum(x.ok))),t,m};});
  return o;
}
// De siste n dagene (eldst først), i dag med
function parDays(n){const a=[];for(let i=n-1;i>=0;i--)a.push(mhDay(-i));return a;}
// Uke: back=0 → mandag denne uka til i dag, back=1 → hele forrige uke
function parWeekDays(back){const wd=(new Date().getDay()+6)%7,s=wd+7*(back||0),e=back?s-6:0,a=[];for(let i=s;i>=e;i--)a.push(mhDay(-i));return a;}
// Summer over dager: {ms,n,ok,days,t:{'g:id':[n,ok]},m:{feiltype:antall}}
function parAgg(st,days){
  const r={ms:0,n:0,ok:0,days:0,t:{},m:{}};
  (days||[]).forEach(d=>{const x=st&&st[d];if(!x)return;r.ms+=x.ms;r.n+=x.n;r.ok+=x.ok;if(x.n)r.days++;
    Object.keys(x.t).forEach(k=>{const a=r.t[k]||(r.t[k]=[0,0]);a[0]+=x.t[k][0];a[1]+=x.t[k][1];});
    Object.keys(x.m).forEach(k=>{r.m[k]=(r.m[k]||0)+x.m[k];});});
  return r;
}
function parPct(n,ok){return n>0?Math.round(ok/n*100):null;}
function parMin(ms){const m=(+ms||0)/60000;return m<=0?'0':m<1?'<1':String(Math.round(m));}
function parDate(k){const p=String(k).split('-').map(Number);return new Date(p[0],(p[1]||1)-1,p[2]||1);}
function parAgo(k){if(!k||!/^\d{4}-\d{2}-\d{2}$/.test(k))return null;return Math.round((parDate(mhDay(0))-parDate(k))/864e5);}
function parWhen(k){const n=parAgo(k);if(n===null)return '–';if(n===0)return 'i dag';if(n===1)return 'i går';if(n>1&&n<7)return `${n} dager siden`;const d=parDate(k);return `${d.getDate()}. ${PAR_MON[d.getMonth()]}`;}
// De vanligste feiltypene (navn fra window.MISC_NAMES), min = minste antall for å telle med
function parTopMisc(agg,lim,min){
  const N=(typeof window!=='undefined'&&window.MISC_NAMES)||{},m=(agg&&agg.m)||{},ix=k=>{const i=PAR_MISC_ORDER.indexOf(k);return i<0?99:i;};
  const err=agg&&agg.n>agg.ok?agg.n-agg.ok:0; // «en» (bom med 1) er ofte bare en tellefeil: vis først ved ≥ 4 og ≥ 30 % av feilene
  return Object.keys(m).filter(k=>N[k]&&m[k]>=(min||1)&&(k!=='en'||m[k]>=4&&(!err||m[k]>=.3*err))).sort((a,b)=>m[b]-m[a]||ix(a)-ix(b)).slice(0,lim||3).map(k=>({k,c:m[k],name:N[k],what:PAR_MISC[k]?PAR_MISC[k][0]:'',tip:PAR_MISC[k]?PAR_MISC[k][1]:''}));
}
// Regnemåter som ikke sitter ennå (mh_fam: siste 8 forsøk per regnemåte): minst 4 forsøk og minst 40 % feil
function parFams(){
  const d=mhLoad('mh_fam',{}),out=[];if(!d||typeof d!=='object'||Array.isArray(d))return out;
  Object.keys(d).forEach(k=>{const mm=/^(\d+):(.+)$/.exec(k),o=d[k];if(!mm||!o||typeof o!=='object')return;
    Object.keys(o).forEach(s=>{const h=typeof o[s]==='string'?o[s].replace(/[^01]/g,''):'';if(h.length<4)return;
      const ok=h.split('').filter(c=>c==='1').length,n=h.length;if((n-ok)/n<.4)return;
      out.push({g:+mm[1],tid:mm[2],strat:s,n,ok,name:PAR_FAM[s]?PAR_FAM[s][0]:s,tip:PAR_FAM[s]?PAR_FAM[s][1]:''});});});
  return out.sort((a,b)=>a.ok/a.n-b.ok/b.n||b.n-a.n);
}
// Hva gir neste stjerne – tekst for voksne. gap = hvor langt unna (0 = én god runde)
function parNextStar(g,id,s){
  const Q=typeof TQ==='number'&&TQ>0?TQ:8,P=typeof MST_PASS==='number'?MST_PASS:.75,G=typeof MST_GOOD==='number'?MST_GOOD:.875,n1=Math.ceil(Q*P-1e-9),n2=Math.ceil(Q*G-1e-9);
  const R=typeof mstRounds==='function'&&typeof mstGet==='function'?mstRounds(mstGet(g,id)):[],l3=R.slice(-3),today=mhDay(0);
  const best=l3.reduce((m,r)=>Math.max(m,r[1]/r[2]*Q),0);
  if(s>=3)return{gap:99,txt:typeof hasCrown==='function'&&hasCrown(g,id)?'Mestret og husket senere 👑.':'Mestret. Trollet kan gi 👑 senere.'};
  if(s<1)return{gap:Math.max(0,n1-best),txt:`${n1} av ${Q} riktige i én runde gir ⭐.`};
  if(s<2)return{gap:Math.max(0,n2-best),txt:`${n2} av ${Q} riktige i én runde gir ⭐⭐.`};
  const good=l3.filter(r=>r[2]>=4&&r[1]/r[2]>=G-1e-9);
  if(good.some(r=>r[0]!==today))return{gap:0,txt:`Én runde til med ${n2} av ${Q} riktige gir ⭐⭐⭐.`};
  if(good.length)return{gap:.5,txt:`Spill temaet igjen i morgen: ${n2} av ${Q} riktige da gir ⭐⭐⭐.`};
  return{gap:Math.max(0,n2-best)+1,txt:`${n2} av ${Q} riktige på to ulike dager gir ⭐⭐⭐.`};
}
function parGradeOpen(g){return typeof isGradeUnlocked==='function'?!!isGradeUnlocked(g):g<=1;}
// Klassetrinn som vises: 1 og 2 alltid, høyere når de er åpne eller har fremgang
function parGrades(){
  return Object.keys(typeof CUR==='object'&&CUR||{}).map(Number).filter(g=>g>0&&CUR[g]&&Array.isArray(CUR[g].topics)&&CUR[g].topics.length).sort((a,b)=>a-b)
    .filter(g=>g<=2||parGradeOpen(g)||CUR[g].topics.some(t=>typeof topicStarted==='function'&&topicStarted(g,t.id)));
}
// Én rad per tema
function parRow(g,t,i,gOpen,st,a7,a14,aAll,daysDesc){
  const k=g+':'+t.id,z=[0,0],x7=a7.t[k]||z,x14=a14.t[k]||z,xa=aAll.t[k]||z;
  const open=gOpen&&(typeof isTopicUnlocked==='function'?!!isTopicUnlocked(g,i):i===0);
  const stars=typeof topicStars==='function'?topicStars(g,t.id):0,crown=typeof hasCrown==='function'&&hasCrown(g,t.id);
  const rounds=typeof mstRounds==='function'&&typeof mstGet==='function'?mstRounds(mstGet(g,t.id)).length:0;
  let last=typeof mstLastDay==='function'?mstLastDay(g,t.id)||'':'';
  const sd=daysDesc.find(d=>st[d]&&st[d].t[k]);if(sd&&sd>last)last=sd; // oppgaver i boss og trollet teller også
  const started=(typeof topicStarted==='function'&&topicStarted(g,t.id))||xa[0]>0;
  const r={g,id:t.id,i,name:t.name,icon:t.icon||'',optional:!!t.optional,open,started,stars,crown,n7:x7[0],ok7:x7[1],n14:x14[0],ok14:x14[1],n:xa[0],ok:xa[1],rounds,last};
  r.nx=parNextStar(g,t.id,stars);
  return r;
}
function parBoss(g){
  const core=typeof mstCore==='function'?mstCore(g):(CUR[g].topics||[]).filter(t=>!t.optional);
  const left=core.filter(t=>!(typeof topicStars==='function'&&topicStars(g,t.id)>=1)).length;
  const B=typeof BOSSES==='object'&&BOSSES&&BOSSES[g];
  return{has:!!B,won:typeof isBossDefeated==='function'&&!!isBossDefeated(g),left,name:B?B.name:'Bossen',emoji:B?B.emoji:'⚔️'};
}
// Treff som teller for anbefalingen: siste 7 dager hvis nok oppgaver, ellers siste 14
function parAcc(r){return r.n7>=6?{n:r.n7,ok:r.ok7,w:'siste 7 dager'}:r.n14>=6?{n:r.n14,ok:r.ok14,w:'siste 14 dager'}:null;}
// Anbefaling: 1) lavest treff (under 65 %) i tema som ikke er mestret, 2) nærmest neste stjerne, 3) nytt tema, 4) alt mestret
function parRecommend(rows){
  const c=(rows||[]).filter(r=>r.open),sg=+(typeof getSetting==='function'?getSetting('startGrade'):1)||1;
  if(!c.length)return{kind:'empty',r:null,more:[]};
  if(!c.some(r=>r.started||r.n))return{kind:'empty',r:c.find(r=>r.g===sg&&!r.optional)||c.find(r=>!r.optional)||c[0],more:[]};
  const pct=r=>{const a=parAcc(r);return a?a.ok/a.n:1;},recent=(a,b)=>b.last>a.last?1:b.last<a.last?-1:0;
  const low=c.filter(r=>r.stars<3&&parAcc(r)&&pct(r)<PAR_LOW).sort((a,b)=>pct(a)-pct(b)||recent(a,b));
  const near=c.filter(r=>r.started&&r.stars<3).sort((a,b)=>a.nx.gap-b.nx.gap||b.stars-a.stars||recent(a,b));
  const gAct=Math.max(sg,...c.filter(r=>r.started).map(r=>r.g)),nw=c.filter(r=>!r.started&&!r.optional).sort((a,b)=>(b.g===gAct)-(a.g===gAct)||a.g-b.g||a.i-b.i);
  let kind,r;
  if(low.length){kind='low';r=low[0];}else if(near.length){kind='near';r=near[0];}else if(nw.length){kind='new';r=nw[0];}else return{kind:'done',r:null,more:[]};
  return{kind,r,acc:parAcc(r),more:near.filter(x=>x!==r).slice(0,2)};
}
// Alt siden trenger, samlet
function parModel(){
  const st=parStats(),all=Object.keys(st).sort(),desc=all.slice().reverse(),a7=parAgg(st,parDays(7)),a14=parAgg(st,parDays(14)),aAll=parAgg(st,all);
  const grades=parGrades().map(g=>{const open=parGradeOpen(g);return{g,open,rows:CUR[g].topics.map((t,i)=>parRow(g,t,i,open,st,a7,a14,aAll,desc)),boss:parBoss(g),
    cnt:typeof mstGradeCount==='function'?mstGradeCount(g):{s:0,max:CUR[g].topics.length*3,cr:0}};});
  const rows=[].concat(...grades.map(x=>x.rows)),rec=parRecommend(rows),seen=new Set(rows.map(r=>r.g+':'+r.id)),lastOf={};rows.forEach(r=>lastOf[r.g+':'+r.id]=r);
  // Regnemåter: bare temaer som finnes og er øvd de siste 21 dagene
  const fams=parFams().filter(f=>seen.has(f.g+':'+f.tid)&&(()=>{const a=parAgo(lastOf[f.g+':'+f.tid].last);return a===null||a<=21;})());
  return{st,a7,a14,aAll,wk:parAgg(st,parWeekDays(0)),pw:parAgg(st,parWeekDays(1)),grades,rows,rec,fams,misc:parTopMisc(a14,3,2),miscAny:parTopMisc(a14,1,1).length>0};
}
function parName(){const p=mhLoad('mh_player',null),n=p&&typeof p.name==='string'?p.name.trim():'';return n&&n!=='Helt'?n:'';}
function parSession(){const v=parseInt(typeof getSetting==='function'?getSetting('session'):4,10);return Math.min(PAR_SESSION_MAX,Math.max(PAR_SESSION_MIN,isFinite(v)?v:4));}
// Minutter per runde: barnets eget tempo (aktiv tid) når det finnes nok data, ellers ca. 4
function parRoundMin(aAll){const Q=typeof TQ==='number'&&TQ>0?TQ:8;if(!aAll||aAll.n<16)return 4;return Math.max(2,Math.round(aAll.ms/aAll.n*Q/60000+.5));}

// ============================================================
// VISNING
// ============================================================
function parStarsHTML(s,crown){return typeof mstStarsHTML==='function'?mstStarsHTML(s,null,crown):('⭐'.repeat(s)+'☆'.repeat(3-s)+(crown?' 👑':''));}
function parPctCell(n,ok,lbl){
  const p=parPct(n,ok);if(p===null)return `<span class="par-k">${lbl}</span><span class="par-pct par-none">–</span>`;
  const c=n<4?'few':p>=85?'hi':p>=PAR_LOW*100?'mid':'lo';
  return `<span class="par-k">${lbl}</span><span class="par-pct par-${c}" title="${ok} av ${n} riktige på første forsøk">${p} %</span><small class="par-of">${ok}/${n}</small>`;
}
function parTopicRowHTML(r){
  if(!r.open)return `<li class="par-trow par-dim"><div class="par-tname"><span class="par-tic">${r.icon}</span>${parEsc(r.name)}${r.optional?' <small class="par-opt">valgfritt</small>':''}</div><div class="par-tstars">${parStarsHTML(0,false)}</div><div class="par-meta"><span class="par-locked">🔒 Ikke åpnet ennå</span></div></li>`;
  if(!r.started&&!r.n)return `<li class="par-trow"><div class="par-tname"><span class="par-tic">${r.icon}</span>${parEsc(r.name)}${r.optional?' <small class="par-opt">valgfritt</small>':''} <small class="par-new">ny</small></div><div class="par-tstars">${parStarsHTML(0,false)}</div><div class="par-meta"><span class="par-locked">Åpent, ikke spilt ennå</span></div></li>`;
  const rd=r.rounds?(r.rounds>=10?'10+':String(r.rounds)):'–';
  return `<li class="par-trow"><div class="par-tname"><span class="par-tic">${r.icon}</span>${parEsc(r.name)}${r.optional?' <small class="par-opt">valgfritt</small>':''}</div>`+
    `<div class="par-tstars">${parStarsHTML(r.stars,r.crown)}</div><div class="par-meta">`+
    `<div class="par-cell">${parPctCell(r.n7,r.ok7,'Riktig 7 d')}</div><div class="par-cell">${parPctCell(r.n,r.ok,'Totalt')}</div>`+
    `<div class="par-cell"><span class="par-k">Runder</span><span class="par-v">${rd}</span></div><div class="par-cell"><span class="par-k">Sist spilt</span><span class="par-v">${parWhen(r.last)}</span></div></div></li>`;
}
function parGradeHTML(x){
  const gi=typeof GRADE_INFO!=='undefined'&&GRADE_INFO[x.g-1]||{icon:'📘',mapName:''},b=x.boss;
  let bl='';
  if(!x.open)bl=`🔒 Åpnes når barnet slår bossen i ${x.g-1}. klasse${x.g===2?', eller velg 2. klasse under Innstillinger':''}.`;
  else if(b.has&&b.won)bl=`✅ ${b.emoji} ${parEsc(b.name)} er slått.`;
  else if(b.has&&!b.left)bl=`⚔️ ${b.emoji} ${parEsc(b.name)} venter! Alle temaer har ⭐.${CUR[x.g+1]?` Seier åpner ${x.g+1}. klasse.`:''}`;
  else if(b.has)bl=`${b.emoji} ${parEsc(b.name)} åpnes når alle temaer har ⭐ (${b.left} igjen).`;
  return `<div class="par-grade${x.open?'':' par-gdim'}"><div class="par-ghd"><span class="par-gic">${gi.icon}</span><div class="par-gtt"><b>${x.g}. klasse</b> <span class="par-gname">${parEsc(gi.mapName||'')}</span>`+
    `<div class="par-gsub">⭐ ${x.cnt.s} av ${x.cnt.max}${x.cnt.cr?` · 👑 ${x.cnt.cr}`:''}</div></div></div>`+(bl?`<div class="par-boss">${bl}</div>`:'')+
    (x.open?`<div class="par-thead" aria-hidden="true"><span>Tema</span><span>Stjerner</span><span>Riktig 7 d</span><span>Totalt</span><span>Runder</span><span>Sist spilt</span></div><ul class="par-tlist">${x.rows.map(parTopicRowHTML).join('')}</ul>`
      :`<p class="par-glist"><b>Temaer:</b> ${x.rows.map(r=>`<span>${r.icon}\u00a0${parEsc(r.name)}</span>`).join(' · ')}</p>`)+'</div>';
}
function parGradeLbl(g){return `${g}. klasse`;}
function parRecHTML(M,who){
  const R=M.rec,r=R.r,Who=who.charAt(0).toUpperCase()+who.slice(1);
  let title,why='',next='',tip='',fam=null,btn='';
  if(R.kind==='empty'){title='Ingen runder ennå';why=r?`Start med «${parEsc(r.name)}». Etter et par runder ser du her hva ${parEsc(who)} kan, og hva som er vanskelig.`:'';}
  else if(R.kind==='done'){title='Alt som er åpnet, er mestret 🎉';why='Nå er repetisjon viktigst. «Trollet er tilbake!» dukker opp på kartet én gang om dagen og gir 👑 for temaer som sitter.';}
  else{
    title=parEsc(r.name);const a=R.acc,p=a?parPct(a.n,a.ok):null;
    if(R.kind==='low')why=`${p} % riktig på første forsøk ${a.w} (${a.ok} av ${a.n}). Her trenger ${parEsc(who)} mest støtte nå.`;
    else if(R.kind==='near')why=`Nærmest neste stjerne.${a?` ${p} % riktig på første forsøk ${a.w}.`:''}`;
    else why='Nytt tema som er åpnet, men ikke spilt ennå. Spillet viser en kort forklaring første gang.';
    if(R.kind!=='new')next=r.nx.txt;
    fam=M.fams.find(f=>f.g===r.g&&f.tid===r.id)||null;
  }
  if(r){
    tip=fam?`<b>Regnemåte å øve på:</b> ${parEsc(fam.name)} – ${fam.ok} av siste ${fam.n} riktige.<br><b>Hjemme:</b> ${parEsc(fam.tip)}`:PAR_TOPIC[r.id]?`<b>Hjemme:</b> ${parEsc(PAR_TOPIC[r.id])}`:'';
    btn=`<button type="button" class="par-go" onclick="parStart(${r.g},'${parEsc(r.id)}')">▶ Spill «${parEsc(r.name)}»</button>`;
  }
  const bossG=M.grades.find(x=>x.open&&x.boss.has&&!x.boss.won&&!x.boss.left);
  const boss=bossG?`<p class="par-rec-boss">⚔️ Bossen i ${bossG.g}. klasse er klar. ${CUR[bossG.g+1]?`Når ${parEsc(who)} slår den, åpnes ${bossG.g+1}. klasse.`:''}</p>`:'';
  const more=R.more&&R.more.length?`<div class="par-more"><div class="par-more-t">Også nær neste stjerne:</div><ul>${R.more.map(m=>`<li><span class="par-tic">${m.icon}</span><b>${parEsc(m.name)}</b> – ${parEsc(m.nx.txt)}</li>`).join('')}</ul></div>`:'';
  return `<section class="par-sec par-rec" id="par-sec-rec"><h2>🎯 Øv på nå</h2><div class="par-rec-main">${r?`<div class="par-rec-ic">${r.icon}</div>`:''}<div class="par-rec-body">`+
    `<div class="par-rec-title">${title}${r&&R.kind!=='empty'?` <span class="par-rec-g">${parGradeLbl(r.g)}</span>`:''}</div>${r&&R.kind!=='empty'?`<div class="par-rec-stars">${parStarsHTML(r.stars,r.crown)}</div>`:''}`+
    `<p class="par-rec-why">${why}</p>${next?`<p class="par-rec-next">${next}</p>`:''}</div></div>${tip?`<div class="par-tip">${tip}</div>`:''}${btn}${boss}${more}</section>`;
}
function parErrHTML(M){
  const a=M.a14,miss=a.n-a.ok,rf=M.rec&&M.rec.r;
  let h=`<section class="par-sec" id="par-sec-err"><h2>🔍 Typiske feil <small>siste 14 dager</small></h2>`;
  if(!a.n)h+=`<p class="par-empty">Ingen oppgaver de siste 14 dagene.</p>`;
  else if(!miss)h+=`<p class="par-empty">Ingen feil på første forsøk i ${a.n} oppgaver. Imponerende! 🌟</p>`;
  else{
    h+=`<p class="par-lead">${miss} av ${a.n} oppgaver ble feil på første forsøk. Spillet gir alltid et hint og en ny sjanse.</p>`;
    if(M.misc.length)h+=M.misc.map(x=>`<div class="par-err"><div class="par-err-hd"><b>${parEsc(x.name)}</b><span class="par-cnt">${x.c} ganger</span></div>${x.what?`<p>${parEsc(x.what)}</p>`:''}${x.tip?`<p class="par-err-tip"><b>Tips hjemme:</b> ${parEsc(x.tip)}</p>`:''}</div>`).join('');
    else h+=`<p class="par-empty">${M.miscAny?'Ingen feiltype har gjentatt seg. Enkeltfeil er helt vanlig.':'Feilene følger ikke et tydelig mønster. Det er helt vanlig.'}</p>`;
  }
  const fams=M.fams.filter(f=>!(rf&&f.g===rf.g&&f.tid===rf.id)).slice(0,2),nm=(g,id)=>{const t=CUR[g]&&CUR[g].topics.find(t=>t.id===id);return t?t.name:id;};
  if(fams.length)h+=`<h3>Regnemåter som ikke sitter ennå</h3>`+fams.map(f=>`<div class="par-err par-fam"><div class="par-err-hd"><b>${parEsc(f.name)}</b><span class="par-cnt">${f.ok} av ${f.n} riktige</span></div><p class="par-fam-t">I «${parEsc(nm(f.g,f.tid))}» (${parGradeLbl(f.g)}), de siste forsøkene.</p>${f.tip?`<p class="par-err-tip"><b>Tips hjemme:</b> ${parEsc(f.tip)}</p>`:''}</div>`).join('');
  return h+'</section>';
}
function parChartHTML(st,metric){
  const ds=parDays(14),today=mhDay(0),isN=metric==='n';
  const v=ds.map(d=>{const x=st[d];return x?(isN?x.n:x.ms/60000):0;}),mx=Math.max(isN?8:5,...v),any=v.some(x=>x>0);
  const cols=ds.map((d,i)=>{const x=st[d],dt=parDate(d),wd=dt.getDay(),lab=isN?String(v[i]||''):(x&&x.ms?parMin(x.ms):''),h=v[i]>0?Math.max(3,Math.round(v[i]/mx*100)):0;
    const tt=`${PAR_WD[wd]} ${dt.getDate()}. ${PAR_MON[dt.getMonth()]}: ${x?parMin(x.ms):0} min, ${x?x.n:0} oppgaver`;
    return `<div class="par-col${d===today?' par-today':''}${wd===1&&i?' par-mon':''}" title="${tt}"><div class="par-plot"><span class="par-val">${lab}</span><span class="par-bar" style="height:${h}px"></span></div><span class="par-x">${PAR_WD[wd].charAt(0).toUpperCase()}<br>${dt.getDate()}</span></div>`;}).join('');
  const sr=ds.map(d=>{const x=st[d],dt=parDate(d);return x&&x.n?`${PAR_WD[dt.getDay()]} ${dt.getDate()}.: ${parMin(x.ms)} min, ${x.n} oppgaver`:'';}).filter(Boolean).join('; ');
  return `<div class="par-chart" role="img" aria-label="${isN?'Oppgaver':'Minutter'} per dag de siste 14 dagene. ${sr||'Ingen spilling.'}">${cols}${any?'':'<div class="par-chart-empty">Ingen spilling de siste 14 dagene</div>'}</div>`;
}
function parTimeHTML(M){
  const w=M.wk,p=M.pw,line=(a,l)=>`${l}: <b>${parMin(a.ms)} min</b> · <b>${a.n}</b> oppgaver · <b>${a.days}</b> ${a.days===1?'dag':'dager'}`;
  const avg=M.a14.days?Math.round(M.a14.ms/M.a14.days/60000):0;
  return `<section class="par-sec" id="par-sec-time"><h2>⏱️ Tid og mengde <small>siste 14 dager</small></h2>`+
    `<div class="par-seg par-metric" role="group" aria-label="Vis i grafen"><button type="button" id="par-m-min" aria-pressed="${M.metric!=='n'}" onclick="parMetric('min')">Minutter</button><button type="button" id="par-m-n" aria-pressed="${M.metric==='n'}" onclick="parMetric('n')">Oppgaver</button></div>`+
    `<div id="par-chart-box">${parChartHTML(M.st,M.metric)}</div>`+
    `<p class="par-week">${line(w,'Denne uka')}<br>${line(p,'Forrige uke')}${avg?`<br>Snitt per spilledag: <b>${avg} min</b>`:''}</p>`+
    `<p class="par-note">Tiden er aktiv regnetid (maks ett minutt per oppgave). Menyer og pauser telles ikke.</p></section>`;
}
function parSetHTML(M){
  const ses=parSession(),tts=typeof getSetting==='function'?getSetting('tts'):'auto',sg=+(typeof getSetting==='function'?getSetting('startGrade'):1)===2?2:1;
  const hasTts=typeof ttsOn==='function',ready=typeof ttsReady==='function'&&ttsReady(),rm=parRoundMin(M.aAll);
  const seg=(k,v,l)=>`<button type="button" id="par-${k}-${v}" aria-pressed="${String(k==='tts'?tts===v:sg===v)}" onclick="parSet('${k}','${v}','par-${k}-${v}')">${l}</button>`;
  let h=`<section class="par-sec" id="par-sec-set"><h2>⚙️ Innstillinger</h2>`+
    `<div class="par-set"><div class="par-set-lbl"><b>Øktlengde</b><small>Antall runder før spillet foreslår å avslutte for i dag. Én runde er 8 oppgaver.</small></div>`+
    `<div class="par-step"><button type="button" id="par-ses-dn" aria-label="Færre runder" onclick="parSet('session',${ses-1},'par-ses-dn')"${ses<=PAR_SESSION_MIN?' disabled':''}>−</button>`+
    `<output id="par-ses" aria-live="polite"><b>${ses}</b> runder<small>ca. ${ses*rm} min</small></output>`+
    `<button type="button" id="par-ses-up" aria-label="Flere runder" onclick="parSet('session',${ses+1},'par-ses-up')"${ses>=PAR_SESSION_MAX?' disabled':''}>+</button></div></div>`;
  if(hasTts)h+=`<div class="par-set" id="par-set-tts"><div class="par-set-lbl"><b>Opplesing</b><small>Auto: oppgavene leses høyt i 1. og 2. klasse.</small></div>`+
    `<div class="par-seg" role="group" aria-label="Opplesing">${seg('tts','auto','Auto')}${seg('tts','on','På')}${seg('tts','off','Av')}</div>`+
    (ready?`<button type="button" class="par-try" onclick="parTryVoice()">🔊 Prøv stemmen</button>`:`<p class="par-note">Fant ingen norsk stemme i denne nettleseren, så opplesing virker ikke her. Prøv en annen nettleser eller legg til norsk tale i innstillingene på enheten.</p>`)+`</div>`;
  h+=`<div class="par-set"><div class="par-set-lbl"><b>Startnivå</b><small>Går barnet i 2. klasse, blir 2. klasse åpen på kartet med en gang. Fremgang og åpne klasser tas aldri bort.</small></div>`+
    `<div class="par-seg" role="group" aria-label="Startnivå">${seg('startGrade',1,'1. klasse')}${seg('startGrade',2,'2. klasse')}</div></div>`+'</section>';
  return h;
}
function parStarsInfoHTML(){
  const Q=typeof TQ==='number'&&TQ>0?TQ:8,n1=Math.ceil(Q*(typeof MST_PASS==='number'?MST_PASS:.75)-1e-9),n2=Math.ceil(Q*(typeof MST_GOOD==='number'?MST_GOOD:.875)-1e-9);
  return `<div class="par-legend"><div class="par-legend-t">Slik virker stjernene</div><ul>`+
    `<li><span>⭐</span><div><b>Bestått:</b> ${n1} av ${Q} riktige på første forsøk i én runde (eller jevn innsats over tre runder, så ingen står fast).</div></li>`+
    `<li><span>⭐⭐</span><div>${n2} av ${Q} riktige i én runde.</div></li>`+
    `<li><span>⭐⭐⭐</span><div><b>Mestret:</b> ${n2} av ${Q} i to runder på to ulike dager. Da sitter det.</div></li>`+
    `<li><span>👑</span><div><b>Husket senere:</b> vant «Trollet er tilbake!», en repetisjon av temaer fra før.</div></li></ul>`+
    `<p>Stjerner tas aldri bort. Bare første forsøk teller, men barnet får alltid prøve igjen med et hint. Neste klasse åpnes når barnet slår bossen.</p></div>`;
}
function parHTML(){
  const M=parModel();M.metric=PAR.metric;
  const nm=parName(),who=nm||'barnet',w=M.wk,wp=parPct(w.n,w.ok),now=new Date();
  const tile=(ic,v,l)=>`<div class="par-tile"><div class="par-tile-v">${ic} ${v}</div><div class="par-tile-l">${l}</div></div>`;
  return `<div class="par-card"><div class="par-top"><button type="button" class="par-back" onclick="parentsBack()">← ${PAR.from==='parent'?'Tilbake til rapporten':'Tilbake til spillet'}</button></div>`+
    `<header class="par-hero"><div class="par-hero-ic" aria-hidden="true">👪</div><div><h1>For voksne</h1><p>Slik går det med matten${nm?` for ${parEsc(nm)}`:''} · ${PAR_WD[now.getDay()]} ${now.getDate()}. ${PAR_MON[now.getMonth()]}</p></div></header>`+
    `<nav class="par-nav" aria-label="Hopp til">${[['rec','Øv på nå'],['err','Typiske feil'],['top','Temaer'],['time','Tid'],['set','Innstillinger']].map(([k,l])=>`<button type="button" onclick="parGo('${k}')">${l}</button>`).join('')}</nav>`+
    `<section class="par-sec par-sum" aria-label="Denne uka"><h2>📅 Denne uka <small>fra mandag</small></h2><div class="par-tiles">${tile('⏱️',parMin(w.ms),'minutter')}${tile('✏️',w.n,'oppgaver')}${tile('🎯',wp===null?'–':wp+' %','riktig første gang')}${tile('📆',w.days,w.days===1?'dag spilt':'dager spilt')}</div>`+
    `<p class="par-note">Forrige uke: ${parMin(M.pw.ms)} min og ${M.pw.n} oppgaver.</p></section>`+
    parRecHTML(M,who)+parErrHTML(M)+
    `<section class="par-sec" id="par-sec-top"><h2>📚 Oversikt per tema</h2><p class="par-note">Riktig = riktig på første forsøk. «Totalt» gjelder de siste 60 dagene.</p>${M.grades.map(parGradeHTML).join('')}${parStarsInfoHTML()}</section>`+
    parTimeHTML(M)+parSetHTML(M)+
    `<footer class="par-foot"><p>Alt lagres bare på denne enheten. Ingenting sendes noe sted.</p><button type="button" class="par-back" onclick="parentsBack()">← ${PAR.from==='parent'?'Tilbake til rapporten':'Tilbake til spillet'}</button></footer><div class="par-saved" id="par-saved" role="status" aria-live="polite"></div></div>`;
}

// ============================================================
// SKJERM, INNGANG OG HANDLINGER
// ============================================================
function parentsScreen(){
  if(typeof document==='undefined'||!document.getElementById)return null;
  let sc=document.getElementById('screen-parents');if(sc)return sc;
  const col=document.querySelector&&document.querySelector('.game-col');if(!col||!document.createElement)return null;
  sc=document.createElement('div');sc.id='screen-parents';sc.className='screen par-screen';col.appendChild(sc);return sc;
}
function parentsRender(){const sc=parentsScreen(),h=parHTML();if(sc)sc.innerHTML=h;return h;}
function parentsOpen(from){
  const sc=parentsScreen();if(!sc)return false;
  if(!from){const cur=document.querySelector&&document.querySelector('.screen.active');from=cur&&cur.id?String(cur.id).replace(/^screen-/,''):'grades';}
  PAR.from=from==='parent'?'parent':'grades';PAR.opened++;
  parentsRender();
  if(typeof showScreen==='function')showScreen('parents');
  try{const b=sc.querySelector&&sc.querySelector('.par-back');if(b&&b.focus)b.focus({preventScroll:true});}catch(e){} // tastatur: start øverst på siden
  return true;
}
function parentsBack(){
  const to=PAR.from==='parent'?'parent':'grades';
  if(typeof showScreen==='function')showScreen(to);
  try{if(typeof buildGradeMap==='function')buildGradeMap();}catch(e){} // startnivå kan ha åpnet en klasse
}
function parSet(k,v,fid){
  if(typeof setSetting!=='function')return false;
  if(k==='session'){v=parseInt(v,10);if(!isFinite(v))return false;v=Math.min(PAR_SESSION_MAX,Math.max(PAR_SESSION_MIN,v));}
  else if(k==='tts'){if(!['auto','on','off'].includes(v))return false;}
  else if(k==='startGrade'){v=+v===2?2:1;}
  else return false;
  setSetting(k,v);
  if(k==='tts'&&v==='off'&&typeof ttsStop==='function')ttsStop();
  // Tegn siden på nytt (startnivå kan åpne en klasse), men hold knappen på samme sted på skjermen
  const top=id=>{try{const e=id&&document.getElementById(id);return e&&e.getBoundingClientRect?e.getBoundingClientRect().top:null;}catch(e){return null;}},y0=top(fid);
  parentsRender();
  try{const f=fid&&document.getElementById(fid),y1=top(fid);if(y0!=null&&y1!=null&&Math.abs(y1-y0)>1&&window.scrollBy)window.scrollBy(0,y1-y0);if(f&&f.focus&&!f.disabled)f.focus({preventScroll:true});}catch(e){}
  parSaved();return true;
}
function parSaved(){const el=document.getElementById('par-saved');if(!el)return;el.textContent='✓ Lagret';el.className='par-saved show';clearTimeout(PAR.savedT);PAR.savedT=setTimeout(()=>{const e=document.getElementById('par-saved');if(e){e.className='par-saved';e.textContent='';}},2200);}
function parMetric(m){PAR.metric=m==='n'?'n':'min';const box=document.getElementById('par-chart-box');if(box)box.innerHTML=parChartHTML(parStats(),PAR.metric);
  ['min','n'].forEach(x=>{const b=document.getElementById('par-m-'+x);if(b&&b.setAttribute)b.setAttribute('aria-pressed',String(x===PAR.metric));});}
function parGo(k){const el=document.getElementById('par-sec-'+k);if(!el||!el.scrollIntoView)return;let rm=false;try{rm=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(e){}el.scrollIntoView({behavior:rm?'auto':'smooth',block:'start'});}
function parTryVoice(){if(typeof speak==='function')speak('Hei! Jeg leser oppgavene høyt. Hva er åtte pluss fem?',{force:true,raw:true});}
function parStart(g,id){
  const t=CUR[g]&&CUR[g].topics.find(x=>x.id===id);if(!t)return false;
  try{currentGrade=g;}catch(e){}
  (typeof startTopic==='function'?startTopic:startGame)(g,id);return true;
}
// Lenke fra rundens rapport (showParentReport i battle.js)
function parentsLink(){
  if(typeof document==='undefined'||!document.querySelector)return;
  const box=document.querySelector('#screen-parent .pr-actions');if(!box||!box.parentNode||document.getElementById('par-link'))return;
  const b=document.createElement('button');b.type='button';b.id='par-link';b.className='par-link';b.textContent='👪 Se hele oversikten';
  b.onclick=()=>parentsOpen('parent');box.parentNode.insertBefore(b,box);
}

// ---- Inngang på klassekartet: hold inne i 2 sekunder (ring fylles), så små barn ikke havner her ved et uhell ----
function parNow(){return Date.now();}
// Ringen fylles med en CSS-overgang på 2 s (virker også når requestAnimationFrame står stille); run=false nullstiller
function parRing(run){const c=document.getElementById('par-ring-fg');if(!c||!c.style)return;
  if(run){c.style.transition='none';c.style.strokeDashoffset='97.4';if(c.getBoundingClientRect)c.getBoundingClientRect();c.style.transition=`stroke-dashoffset ${PAR_HOLD_MS}ms linear`;c.style.strokeDashoffset='0';}
  else{c.style.transition='stroke-dashoffset .2s ease-out';c.style.strokeDashoffset='97.4';}}
function parTip(txt,ms){const el=document.getElementById('par-entry-tip');if(!el)return;clearTimeout(PAR.tipT);if(!txt){el.className='par-entry-tip';return;}el.textContent=txt;el.className='par-entry-tip show';if(ms)PAR.tipT=setTimeout(()=>parTip(''),ms);}
function parHoldStart(now){
  if(PAR.t0)return false;PAR.t0=now||parNow();
  const b=document.getElementById('par-entry');if(b&&b.classList)b.classList.add('holding');
  parTip('Hold inne for voksne …');parRing(true);
  const fire=()=>{if(PAR.t0&&!parHoldTick(parNow()))PAR.tm=setTimeout(fire,50);};
  clearTimeout(PAR.tm);PAR.tm=setTimeout(fire,PAR_HOLD_MS);
  return true;
}
// Holdt lenge nok? Da åpnes siden
function parHoldTick(now){
  if(!PAR.t0)return false;
  if((now||parNow())-PAR.t0<PAR_HOLD_MS)return false;
  parHoldReset();parTip('');parentsOpen('grades');return true;
}
function parHoldReset(){PAR.t0=0;clearTimeout(PAR.tm);parRing(false);const b=document.getElementById('par-entry');if(b&&b.classList)b.classList.remove('holding');}
// Sluppet for tidlig: nullstill og vis hvordan
function parHoldEnd(now){if(!PAR.t0)return false;const short=(now||parNow())-PAR.t0<PAR_HOLD_MS;parHoldReset();if(short)parTip('Hold inne i 2 sekunder',2600);return short;}
function parentsEntry(){
  if(typeof document==='undefined'||!document.querySelector)return null;
  const sc=document.querySelector('#screen-grades');if(!sc||!sc.appendChild)return null;
  let b=sc.querySelector&&sc.querySelector('#par-entry');if(b)return b;
  b=document.createElement('button');b.type='button';b.id='par-entry';b.className='par-entry';
  b.setAttribute('aria-label','For voksne. Hold inne i 2 sekunder.');
  b.innerHTML='<span class="par-ring" aria-hidden="true"><svg viewBox="0 0 36 36"><circle class="par-ring-bg" cx="18" cy="18" r="15.5"/><circle class="par-ring-fg" id="par-ring-fg" cx="18" cy="18" r="15.5"/></svg><span class="par-ring-ic">👪</span></span><span class="par-entry-txt" aria-hidden="true">Hold inne<br>for voksne</span><span class="par-entry-tip" id="par-entry-tip" aria-live="polite"></span>';
  const end=()=>parHoldEnd(),key=e=>e.key==='Enter'||e.key===' ';
  b.addEventListener('pointerdown',e=>{if(e.button>0)return;if(e.cancelable)e.preventDefault();try{b.setPointerCapture(e.pointerId);}catch(x){}parHoldStart();});
  ['pointerup','pointercancel','lostpointercapture','pointerleave','blur'].forEach(ev=>b.addEventListener(ev,end));
  b.addEventListener('keydown',e=>{if(!key(e))return;e.preventDefault();if(!e.repeat)parHoldStart();});
  b.addEventListener('keyup',e=>{if(key(e))end();});
  b.addEventListener('click',e=>e.preventDefault());
  b.addEventListener('contextmenu',e=>e.preventDefault());
  sc.appendChild(b);return b;
}
try{parentsEntry();}catch(e){}
