// Mattehelten – Mestring (stjerner per tema), krone, opplåsing av klassetrinn og temaer
// Alle js-filer deler globalt navnerom (vanlige <script>-tagger i fast rekkefølge, se index.html).

// ============================================================
// MASTERY v2 – stjerner per tema (lagret i mh_learn)
// ============================================================
// mh_learn = { '<g>:<id>': { r:[[dag,riktige,antall],…] (siste 10 runder), s:stjerner (0–3, synker aldri),
//                            cr:dag for gullkrone (0 = ingen), rv:dag for siste repetisjon (trollet) } }
// ⭐   bestått: én runde ≥ 6/8 på første forsøk, eller 3 runder på rad med snitt ≥ 40 % (ingen står fast)
// ⭐⭐  én runde ≥ 7/8
// ⭐⭐⭐ mestret: 2 av de 3 siste rundene ≥ 7/8, på to ulike dager
// 👑  gullkrone: vunnet «Trollet er tilbake!» på temaet (review.js)
// Gamle lagringer (mh_mst_<g>_<id>, poeng): ≥100 → ⭐⭐⭐, ≥70 → ⭐, >0 → påbegynt (temaet holdes åpent).
const MST_PASS=.75,MST_GOOD=.875,MST_EFFORT=.4,MST_MINQ=4;
function mstAll(){const o=mhLoad('mh_learn',{});return o&&typeof o==='object'&&!Array.isArray(o)?o:{};}
function mstGet(g,id){const e=mstAll()[g+':'+id];return e&&typeof e==='object'?e:null;}
function mstPut(g,id,e){const o=mstAll();o[g+':'+id]=e;mhSave('mh_learn',o);}
function mstRounds(e){return e&&Array.isArray(e.r)?e.r.filter(r=>Array.isArray(r)&&r[2]>0):[];}
function mstLegacy(g,id){return parseInt(localStorage.getItem(`mh_mst_${g}_${id}`)||'0')||0;}
function mstOk(r,lim){return r[2]>=MST_MINQ&&r[1]/r[2]>=lim-1e-9;}
// Stjerner ut fra rundene alene (uten lagret maks og gamle poeng)
function mstCalc(R){
  let s=0;
  if(R.some(r=>mstOk(r,MST_PASS)))s=1;
  const l3=R.slice(-3);
  if(l3.length===3&&l3.reduce((a,r)=>a+r[1],0)/l3.reduce((a,r)=>a+r[2],0)>=MST_EFFORT-1e-9)s=Math.max(s,1);
  if(R.some(r=>mstOk(r,MST_GOOD)))s=2;
  const good=l3.filter(r=>mstOk(r,MST_GOOD));
  if(good.length>=2&&new Set(good.map(r=>r[0])).size>=2)s=3;
  return s;
}
function topicStars(g,id){
  const e=mstGet(g,id),L=mstLegacy(g,id);
  return Math.min(3,Math.max(e?+e.s||0:0,mstCalc(mstRounds(e)),L>=100?3:L>=70?1:0));
}
function hasCrown(g,id){const e=mstGet(g,id);return !!(e&&e.cr);}
function mstSetCrown(g,id,day){const e=mstGet(g,id)||{r:[],s:0};if(e.cr)return false;e.cr=day||mhDay(0);e.s=topicStars(g,id);mstPut(g,id,e);return true;}
function mstMarkReview(g,id,day){const e=mstGet(g,id)||{r:[],s:topicStars(g,id)};e.rv=day||mhDay(0);mstPut(g,id,e);}
// Påbegynt: barnet har spilt temaet (ny eller gammel lagring)
function topicStarted(g,id){return mstRounds(mstGet(g,id)).length>0||mstLegacy(g,id)>0||(typeof getBest==='function'&&getBest(g,id)!==null);}
// Siste dag temaet ble øvd (runde eller trollet); '' = ukjent (gammel lagring)
function mstLastDay(g,id){const e=mstGet(g,id),R=mstRounds(e);let d=R.length?R[R.length-1][0]:'';if(e&&e.rv&&e.rv>d)d=e.rv;return d;}
// En ferdig runde: c riktige på første forsøk av n. Gir {from,to,c,n}. Stjerner tas aldri bort.
function recordRound(g,id,c,n,day){
  const from=topicStars(g,id),e=mstGet(g,id)||{r:[],s:0};
  c=Math.max(0,Math.min(+c||0,+n||0));n=+n||0;
  if(n>0){e.r=mstRounds(e);e.r.push([day||mhDay(0),c,n]);if(e.r.length>10)e.r=e.r.slice(-10);}
  const to=Math.max(from,mstCalc(mstRounds(e)));e.s=to;mstPut(g,id,e);
  return{from,to,c,n};
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
// HTML-stjerner; nye (fra «from») får en liten pop-animasjon
function mstStarsHTML(s,from,crown){
  let h='<span class="mst-stars" aria-label="'+s+' av 3 stjerner">';
  for(let i=0;i<3;i++){const nw=from!=null&&i<s&&i>=from;h+=`<span class="mst-star${i<s?' on':''}${nw?' new':''}"${nw?` style="--d:${i-from}"`:''}>⭐</span>`;}
  return h+(crown?'<span class="mst-crown">👑</span>':'')+'</span>';
}
function mstQ(){return typeof TQ==='number'&&TQ>0?TQ:8;}
function mstNeed(lim){return Math.ceil(mstQ()*lim-1e-9);}
// Neste stjerne: {txt, say (for opplesing), now (false = må vente til en annen dag)}
function mstNext(g,id){
  const s=topicStars(g,id),R=mstRounds(mstGet(g,id)),today=mhDay(0),n1=mstNeed(MST_PASS),n2=mstNeed(MST_GOOD);
  if(s<1)return{txt:`Få ${n1} riktige for ⭐!`,say:`Få ${n1} riktige for en stjerne!`,now:true};
  if(s<2)return{txt:`Få ${n2} riktige for ⭐⭐!`,say:`Få ${n2} riktige for to stjerner!`,now:true};
  if(s<3){
    const l2=R.slice(-2).filter(r=>mstOk(r,MST_GOOD));
    if(l2.some(r=>r[0]!==today))return{txt:`Få ${n2} riktige nå for ⭐⭐⭐!`,say:`Få ${n2} riktige nå for tre stjerner!`,now:true};
    if(l2.length)return{txt:'Spill igjen i morgen for ⭐⭐⭐!',say:'Spill igjen i morgen for tre stjerner!',now:false};
    return{txt:`${n2} riktige to dager gir ⭐⭐⭐!`,say:`${n2} riktige på to dager gir tre stjerner!`,now:true};
  }
  if(!hasCrown(g,id))return{txt:'Mestret! Trollet kommer for 👑',say:'Mestret! Slå trollet en annen dag for gullkrone!',now:false};
  return{txt:'Mestret med 👑!',say:'Mestret med gullkrone!',now:false};
}
// Kort tekst under temaet på kartet
function mstGoalShort(g,id){
  const s=topicStars(g,id);
  if(s>=3)return hasCrown(g,id)?'👑 Gull!':'Mestret!';
  if(s===0)return topicStarted(g,id)?'Få ⭐!':'Ny!';
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
// Neste tema åpnes når forrige (ikke-valgfrie) tema har ⭐. Et tema barnet har spilt, holdes åpent.
function isTopicUnlocked(gradeNum,topicIdx){
  if(topicIdx===0)return true;
  const ts=CUR[gradeNum]?.topics||[],self=ts[topicIdx];
  if(!self)return false;
  if(topicStarted(gradeNum,self.id))return true;
  const prev=ts[topicIdx-1];if(prev&&isTopicPassed(gradeNum,prev.id))return true;
  for(let j=topicIdx-1;j>=0;j--)if(!ts[j].optional)return isTopicPassed(gradeNum,ts[j].id); // valgfrie temaer (optional) stenger ikke veien
  return true;
}
function mstCore(g){return (CUR[g]?.topics||[]).filter(t=>!t.optional);} // temaer som teller for boss/neste trinn

function getGradeStars(gradeNum){
  const {s,max}=mstGradeCount(gradeNum);
  if(!max||!s)return '○○○';
  const p=s/max;
  if(p>=.9)return '⭐⭐⭐';if(p>=.5)return '⭐⭐○';return '⭐○○';
}
