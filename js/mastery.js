// Mattehelten – Mestring (stjerner per tema), krone, opplåsing av klassetrinn og temaer
// Alle js-filer deler globalt navnerom (vanlige <script>-tagger i fast rekkefølge, se index.html).

// ============================================================
// MASTERY v2 – stjerner per tema (lagret i mh_learn)
// ============================================================
// mh_learn = { '<g>:<id>': { r:[[dag,riktige,antall],…] (siste 10 runder, bare NYE oppgaver), s:stjerner (0–3, synker aldri),
//                            eff:1 = 💪 «Øvd godt», cr:dag for gullkrone (0 = ingen), rv:dag for siste repetisjon (trollet),
//                            pu:dag trollet fant noe glemt («✨ Puss opp») } }
// ⭐   bestått: én runde ≥ 6/8 på første forsøk
// 💪  øvd godt: 3 runder på rad med snitt ≥ 40 % (eff=1). Neste tema åpnes (ingen står fast), men det er ikke ⭐ (teller ikke for bossen)
// ⭐⭐  én runde ≥ 7/8
// ⭐⭐⭐ mestret: de 3 siste rundene har til sammen ≥ 21/24 og er spilt på minst 2 ulike dager
// 👑  gullkrone: vunnet «Trollet er tilbake!» med alle temaets trolloppgaver riktige (review.js)
// Stjerner som er gitt, tas aldri bort (s lagres). Gamle lagringer (mh_mst_<g>_<id>, poeng): ≥100 → ⭐⭐⭐, ≥70 → ⭐, >0 → påbegynt.
const MST_PASS=.75,MST_GOOD=.875,MST_EFFORT=.4,MST_MINQ=4,MST_TOP=21/24;
function mstAll(){const o=mhLoad('mh_learn',{});return o&&typeof o==='object'&&!Array.isArray(o)?o:{};}
function mstGet(g,id){const e=mstAll()[g+':'+id];return e&&typeof e==='object'?e:null;}
function mstPut(g,id,e){const o=mstAll();o[g+':'+id]=e;mhSave('mh_learn',o);}
function mstRounds(e){return e&&Array.isArray(e.r)?e.r.filter(r=>Array.isArray(r)&&r[2]>0):[];}
function mstLegacy(g,id){return parseInt(localStorage.getItem(`mh_mst_${g}_${id}`)||'0')||0;}
function mstOk(r,lim){return r[2]>=MST_MINQ&&r[1]/r[2]>=lim-1e-9;}
// Stjerner ut fra rundene alene (uten lagret maks og gamle poeng)
// Summen av de 3 siste rundene: [riktige, antall, ulike dager] (null hvis færre enn 3)
function mstLast3(R){const l3=R.slice(-3);if(l3.length<3)return null;return[l3.reduce((a,r)=>a+r[1],0),l3.reduce((a,r)=>a+r[2],0),new Set(l3.map(r=>r[0])).size];}
// ⭐⭐⭐: de 3 siste rundene ≥ 21/24 til sammen, alle med minst MST_MINQ oppgaver, på minst 2 ulike dager
function mstTop(R){const s=mstLast3(R);return !!s&&R.slice(-3).every(r=>r[2]>=MST_MINQ)&&s[0]/s[1]>=MST_TOP-1e-9&&s[2]>=2;}
// 💪 innsats: 3 siste runder med snitt ≥ 40 %
function mstEffort(R){const s=mstLast3(R);return !!s&&s[0]/s[1]>=MST_EFFORT-1e-9;}
function mstCalc(R){
  let s=0;
  if(R.some(r=>mstOk(r,MST_PASS)))s=1;
  if(R.some(r=>mstOk(r,MST_GOOD)))s=2;
  if(mstTop(R))s=3;
  return s;
}
function topicStars(g,id){
  const e=mstGet(g,id),L=mstLegacy(g,id);
  return Math.min(3,Math.max(e?+e.s||0:0,mstCalc(mstRounds(e)),L>=100?3:L>=70?1:0));
}
// 💪 «Øvd godt»: innsats uten ⭐ ennå
function topicEffort(g,id){const e=mstGet(g,id);return !!(e&&e.eff)&&topicStars(g,id)<1;}
function mstEffOf(g,id){return topicEffort(g,id)?1:0;}
// Neste tema kan åpnes: ⭐ eller 💪
function mstPassOrEff(g,id){return isTopicPassed(g,id)||topicEffort(g,id);}
function hasCrown(g,id){const e=mstGet(g,id);return !!(e&&e.cr);}
function mstSetCrown(g,id,day){const e=mstGet(g,id)||{r:[],s:0};if(e.cr)return false;e.cr=day||mhDay(0);e.s=topicStars(g,id);mstPut(g,id,e);return true;}
// Trollet: husket (rv = i dag, «Puss opp» fjernes) eller glemt (pu = i dag, rv settes ikke, så temaet kommer først neste dag)
function mstMarkReview(g,id,day){const e=mstGet(g,id)||{r:[],s:topicStars(g,id)};e.rv=day||mhDay(0);delete e.pu;mstPut(g,id,e);}
function mstMarkForgot(g,id,day){const e=mstGet(g,id)||{r:[],s:topicStars(g,id)};e.pu=day||mhDay(0);mstPut(g,id,e);}
// Antall dager siden dag d ('' eller ugyldig = Infinity)
function mstAgo(d,today){if(!d||!/^\d{4}-\d{2}-\d{2}$/.test(d))return Infinity;const p=s=>{const a=String(s).split('-').map(Number);return Date.UTC(a[0],a[1]-1,a[2]);};return Math.round((p(today||mhDay(0))-p(d))/864e5);}
// Påbegynt: barnet har spilt temaet (ny eller gammel lagring)
function topicStarted(g,id){return mstRounds(mstGet(g,id)).length>0||mstLegacy(g,id)>0||(typeof getBest==='function'&&getBest(g,id)!==null);}
// Siste dag temaet ble øvd (runde eller trollet); '' = ukjent (gammel lagring)
function mstLastDay(g,id){const e=mstGet(g,id),R=mstRounds(e);let d=R.length?R[R.length-1][0]:'';if(e&&e.rv&&e.rv>d)d=e.rv;return d;}
// En ferdig runde: c riktige på første forsøk av n (bare nye oppgaver). Gir {from,to,c,n,eff}. Stjerner tas aldri bort.
// eff = true når runden ga 💪 «Øvd godt» for første gang (temaet har ingen ⭐ ennå).
function recordRound(g,id,c,n,day){
  const from=topicStars(g,id),e=mstGet(g,id)||{r:[],s:0};
  c=Math.max(0,Math.min(+c||0,+n||0));n=+n||0;
  if(n>0){e.r=mstRounds(e);e.r.push([day||mhDay(0),c,n]);if(e.r.length>10)e.r=e.r.slice(-10);}
  const to=Math.max(from,mstCalc(mstRounds(e)));e.s=to;
  let eff=false;if(to<1&&!e.eff&&mstEffort(mstRounds(e))){e.eff=1;eff=true;}
  mstPut(g,id,e);
  return{from,to,c,n,eff};
}

// Bakoverkompatibelt tall på den gamle skalaen (0 = ikke spilt, 70 = ⭐, 100 = ⭐⭐⭐)
function getMastery(g,topicId){const s=topicStars(g,topicId),L=mstLegacy(g,topicId);return Math.max(L,[topicStarted(g,topicId)?35:0,70,85,100][s]);}
function addMastery(){} // gammel poengsum – ikke i bruk lenger (stjernene ligger i mh_learn)
function isTopicPassed(g,topicId){return topicStars(g,topicId)>=1;}
function isTopicMastered(g,topicId){return topicStars(g,topicId)>=3;}
function masteryLabel(pct){
  if(pct>=100)return{txt:'⭐⭐⭐',col:'var(--green)'};
  if(pct>=70)return{txt:'⭐',col:'var(--gold)'};
  if(pct>0)return{txt:'☆☆☆',col:'var(--orange)'};
  return{txt:'Ny',col:'var(--muted)'};
}

// ---- Visning: stjerner og «hva gir neste stjerne» ----
function mstStarsTxt(s){s=Math.max(0,Math.min(3,s|0));return '⭐'.repeat(s)+'☆'.repeat(3-s);}
// HTML-stjerner; nye (fra «from») får en liten pop-animasjon. eff: 1 = 💪 «Øvd godt» i stedet for første (grå) stjerne, 2 = ny 💪
// (💪 får ikke klassen «new»: den er ingen stjerne, og feiringen i kista lar bare ⭐ fly inn til .mst-star.new)
function mstStarsHTML(s,from,crown,eff){
  const ef=s<1&&eff?eff:0;
  let h='<span class="mst-stars" aria-label="'+(ef?'Øvd godt, 0':s)+' av 3 stjerner">';
  for(let i=0;i<3;i++){if(!i&&ef){h+=`<span class="mst-star mst-eff on${ef>1?' mst-eff-pop':''}" title="Øvd godt">💪</span>`;continue;}
    const nw=from!=null&&i<s&&i>=from;h+=`<span class="mst-star${i<s?' on':''}${nw?' new':''}"${nw?` style="--d:${i-from}"`:''}>⭐</span>`;}
  return h+(crown?'<span class="mst-crown">👑</span>':'')+'</span>';
}
function mstQ(){return typeof TQ==='number'&&TQ>0?TQ:8;}
function mstNeed(lim){return Math.ceil(mstQ()*lim-1e-9);}
// Hva som mangler til ⭐⭐⭐ med én runde til nå: {need (riktige i neste runde, null = går ikke med én runde), days (nok ulike dager hvis den spilles i dag)}
function mstTopNeed(R,today){
  const Q=mstQ(),l2=R.slice(-2);if(l2.length<2)return{need:null,days:false};
  const n=l2.reduce((a,r)=>a+r[2],0)+Q,need=Math.max(0,Math.ceil(MST_TOP*n-1e-9)-l2.reduce((a,r)=>a+r[1],0));
  return{need:need<=Q?need:null,days:new Set(l2.map(r=>r[0]).concat([today])).size>=2};
}
// Neste stjerne: {txt, say (for opplesing), now (false = må vente til en annen dag)}
function mstNext(g,id){
  const s=topicStars(g,id),R=mstRounds(mstGet(g,id)),today=mhDay(0),n1=mstNeed(MST_PASS),n2=mstNeed(MST_GOOD);
  if(s<1&&topicEffort(g,id))return{txt:`💪 Øvd godt! Få ${n1} riktige for ⭐!`,say:`Du har øvd godt! Få ${n1} riktige for en stjerne!`,now:true};
  if(s<1)return{txt:`Få ${n1} riktige for ⭐!`,say:`Få ${n1} riktige for en stjerne!`,now:true};
  if(s<2)return{txt:`Få ${n2} riktige for ⭐⭐!`,say:`Få ${n2} riktige for to stjerner!`,now:true};
  if(s<3){
    const t=mstTopNeed(R,today);
    if(t.need!=null&&t.days)return{txt:`Få ${Math.max(1,t.need)} riktige nå for ⭐⭐⭐!`,say:`Få ${Math.max(1,t.need)} riktige nå for tre stjerner!`,now:true};
    if(t.need!=null)return{txt:'Spill igjen i morgen for ⭐⭐⭐!',say:'Spill igjen i morgen for tre stjerner!',now:false};
    return{txt:`Tre runder med ${n2} riktige gir ⭐⭐⭐!`,say:`Tre runder med ${n2} riktige, på to dager, gir tre stjerner!`,now:true};
  }
  if(!hasCrown(g,id))return{txt:'Mestret! Trollet kommer for 👑',say:'Mestret! Slå trollet en annen dag for gullkrone!',now:false};
  return{txt:'Mestret med 👑!',say:'Mestret med gullkrone!',now:false};
}
// Kort tekst under temaet på kartet
function mstGoalShort(g,id){
  const s=topicStars(g,id);
  if(s>=3)return hasCrown(g,id)?'👑 Gull!':'Mestret!';
  if(s===0)return topicEffort(g,id)?'💪 Øvd godt!':topicStarted(g,id)?'Få ⭐!':'Ny!';
  return s===2?'1 stjerne til!':'2 stjerner til!';
}
function mstGradeCount(g){const ts=CUR[g]?.topics||[];let s=0,c=0;ts.forEach(t=>{s+=topicStars(g,t.id);if(hasCrown(g,t.id))c++;});return{s,max:ts.length*3,cr:c};}

// ============================================================
// OPPLÅSING
// ============================================================
// Neste klassetrinn: bare ved å slå bossen, eller startGrade, eller fremgang i trinnet (gamle lagringer),
// eller hvis trinnet allerede er vist som åpnet (mh_pg_seen). Omveien «alle temaer mestret» er fjernet.
function isGradeUnlocked(gradeNum){
  if(gradeNum<=1)return true;
  if(typeof isBossDefeated==='function'&&isBossDefeated(gradeNum-1))return true;
  const sg=parseInt(typeof getSetting==='function'?getSetting('startGrade'):1,10)||1;
  if(gradeNum<=sg)return true;
  if((CUR[gradeNum]?.topics||[]).some(t=>topicStarted(gradeNum,t.id)))return true;
  const seen=mhLoad('mh_pg_seen',null);
  return Array.isArray(seen)&&seen.includes('g:'+gradeNum);
}
// Neste tema åpnes når forrige (ikke-valgfrie) tema har ⭐ eller 💪. Et tema barnet har spilt, holdes åpent.
function isTopicUnlocked(gradeNum,topicIdx){
  if(topicIdx===0)return true;
  const ts=CUR[gradeNum]?.topics||[],self=ts[topicIdx];
  if(!self)return false;
  if(topicStarted(gradeNum,self.id))return true;
  const prev=ts[topicIdx-1];if(prev&&mstPassOrEff(gradeNum,prev.id))return true;
  for(let j=topicIdx-1;j>=0;j--)if(!ts[j].optional)return mstPassOrEff(gradeNum,ts[j].id); // valgfrie temaer (optional) stenger ikke veien
  return true;
}
function mstCore(g){return (CUR[g]?.topics||[]).filter(t=>!t.optional);} // temaer som teller for boss/neste trinn

function getGradeStars(gradeNum){
  const {s,max}=mstGradeCount(gradeNum);
  if(!max||!s)return '○○○';
  const p=s/max;
  if(p>=.9)return '⭐⭐⭐';if(p>=.5)return '⭐⭐○';return '⭐○○';
}
