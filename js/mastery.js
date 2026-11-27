// Mattehelten – Mestring og opplåsing av klassetrinn og temaer
// Alle js-filer deler globalt navnerom (vanlige <script>-tagger i fast rekkefølge, se index.html).

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
