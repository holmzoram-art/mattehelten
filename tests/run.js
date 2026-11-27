// Mattehelten – regresjonstest uten nettleser: laster alle <script src="js/..."> fra index.html i rekkefølge
// med en stubbet DOM, kjører alle generatorer, tilbakemeldinger, guider, svartolker og submitAnswer.
// Bruk: node tests/run.js   (fra repo-roten; exit 1 ved feil)
const fs=require("fs"),vm=require("vm"),path=require("path");
const ROOT=process.argv[2]||path.join(__dirname,"..");
const HTML=fs.readFileSync(path.join(ROOT,"index.html"),"utf8");
const FILES=[...HTML.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m=>m[1]);

// ---- DOM-stub: proxy som tåler alt; getElementById gir faste elementer per id
function mk(){const store={classList:{add(){},remove(){},toggle(){},contains(){return false;}},style:{setProperty(){}}};const fn=function(){};
  return new Proxy(fn,{get(t,k){if(k===Symbol.toPrimitive)return()=>0;if(k==='then')return undefined;if(k in store)return store[k];if(k==='value'||k==='textContent'||k==='innerHTML')return '';return mk();},
    set(t,k,v){store[k]=v;return true;},apply(){return mk();}});}
const els={};
const document={getElementById:id=>els[id]||(els[id]=mk()),querySelector:()=>null,querySelectorAll:()=>[],createElement:()=>mk(),createElementNS:()=>mk()};
const ls=new Map();
const localStorage={getItem:k=>ls.has(k)?ls.get(k):null,setItem:(k,v)=>ls.set(k,String(v)),removeItem:k=>ls.delete(k),key:i=>[...ls.keys()][i]??null,get length(){return ls.size;},clear:()=>ls.clear()};
const ctx=vm.createContext({MutationObserver:function(){return{observe(){},disconnect(){}}},matchMedia:()=>({matches:false,addEventListener(){}}),requestAnimationFrame:()=>0,document,localStorage,window:{addEventListener(){},innerHeight:800,scrollTo(){}},setTimeout:()=>0,clearTimeout(){},alert(){},console,Math,JSON,Date,Array,Object,String,Number,Symbol,Map,Set,RegExp,Error,isNaN,isFinite,parseInt,parseFloat});
for(const f of FILES)vm.runInContext(fs.readFileSync(path.join(ROOT,f),'utf8'),ctx,{filename:f});
const R=s=>vm.runInContext(s,ctx);
const CUR=R('CUR'),parseAns=R('parseAns'),LG=R('LEARN_GUIDES'),fmtSub=R('fmtSub'),nf=R('nf');

let fails=0,checks=0;const failMsgs={};
function ok(cond,msg){checks++;if(!cond){fails++;failMsgs[msg]=(failMsgs[msg]||0)+1;}}

// ---- uavhengig fasit-løser ----
const SUP={'⁰':0,'¹':1,'²':2,'³':3,'⁴':4,'⁵':5,'⁶':6,'⁷':7,'⁸':8,'⁹':9};
const num=s=>+String(s).replace(',','.');
function gcd(a,b){return b?gcd(b,a%b):a;}
function solve(q){
  let m;const N='(-?\\d+(?:,\\d+)?)';
  if(m=q.match(new RegExp(`^${N} ([+\\-·:]) ${N} = \\?$`))){const a=num(m[1]),b=num(m[3]);return {'+':a+b,'-':a-b,'·':a*b,':':a/b}[m[2]];}
  if(m=q.match(/^(\d+) \+ \? = (\d+)$/))return m[2]-m[1];
  if(m=q.match(/^\? \+ (\d+) = (\d+)$/))return m[2]-m[1];
  if(m=q.match(/^(\d+) - \? = (\d+)$/))return m[1]-m[2];
  if(/^(\d+|\?)(, (\d+|\?)){3}$/.test(q)){const t=q.split(', ');const i=t.indexOf('?');const k=t.map(Number);let st=null;for(let j=0;j<3;j++)if(t[j]!=='?'&&t[j+1]!=='?'){st=k[j+1]-k[j];break;}
    const s0=i===0?k[1]-st:k[0];const full=[0,1,2,3].map(j=>s0+j*st);for(let j=0;j<4;j++)if(j!==i&&full[j]!==k[j])return NaN;return full[i];}
  if(m=q.match(/^Dobbelt av (\d+) = \?$/))return 2*m[1];
  if(m=q.match(/^Halvparten av (\d+) = \?$/))return m[1]/2;
  if(m=q.match(/^1\/(\d+) av (\d+) = \?$/))return m[2]/m[1];
  if(m=q.match(/^(\d+)\/(\d+) ([+-]) (\d+)\/(\d+) = \?$/)){const a=m[1]/m[2],b=m[4]/m[5];return m[3]==='+'?a+b:a-b;}
  if(m=q.match(/^(\d+) % av (\d+) = \?$/))return m[1]*m[2]/100;
  if(m=q.match(/^(\d+) økes med (\d+) %\. Nytt tall\?$/))return m[1]*(1+m[2]/100);
  if(m=q.match(/^(\d+) reduseres med (\d+) %\. Nytt tall\?$/))return m[1]*(1-m[2]/100);
  if(m=q.match(/^Rund av (\d+(?:,\d+)?) til heltall$/)){const v=num(m[1]);return Math.floor(v+0.5);}
  if(m=q.match(/^Rund av (\d+) til nærmeste tier$/))return Math.floor(m[1]/10+0.5)*10;
  if(m=q.match(/^Kvadrat med side (\d+)\. (Areal|Omkrets) = \?$/))return m[2]==='Areal'?m[1]*m[1]:4*m[1];
  if(m=q.match(/^Rektangel (\d+) × (\d+)\. (Areal|Omkrets) = \?$/))return m[3]==='Areal'?m[1]*m[2]:2*(+m[1]+ +m[2]);
  if(m=q.match(/^x \+ (\d+) = (\d+), x = \?$/))return m[2]-m[1];
  if(m=q.match(/^x - (\d+) = (\d+), x = \?$/))return +m[2]+ +m[1];
  if(m=q.match(/^(\d+) · x = (\d+), x = \?$/))return m[2]/m[1];
  if(m=q.match(/^(\d+) : (\d+) = (\d+) : \?$/))return m[2]*m[3]/m[1];
  if(m=q.match(/^(\d+) : (\d+) = \? : (\d+)$/))return m[1]*m[3]/m[2];
  if(m=q.match(/^Gjennomsnitt av ([\d, ]+) = \?$/)){const v=m[1].split(', ').map(Number);return v.reduce((a,b)=>a+b)/v.length;}
  if(m=q.match(/^(\d+)x = (\d+), x = \?$/))return m[2]/m[1];
  if(m=q.match(/^(\d+)x \+ (\d+) = (\d+), x = \?$/))return (m[3]-m[2])/m[1];
  if(m=q.match(/^(\d+)([⁰¹²³⁴⁵⁶⁷⁸⁹]+) = \?$/))return Math.pow(+m[1],+[...m[2]].map(c=>SUP[c]).join(''));
  if(m=q.match(/^a=(\d+), b=(\d+), c=\?$/))return Math.hypot(m[1],m[2]);
  if(m=q.match(/^b=(\d+), c=(\d+), a=\?$/))return Math.sqrt(m[2]**2-m[1]**2);
  if(m=q.match(/^a=(\d+), c=(\d+), b=\?$/))return Math.sqrt(m[2]**2-m[1]**2);
  if(m=q.match(/^Median av ([\d, ]+) = \?$/)){const v=m[1].split(', ').map(Number).sort((a,b)=>a-b),h=v.length>>1;return v.length%2?v[h]:(v[h-1]+v[h])/2;}
  if(m=q.match(/^Typetall i ([\d, ]+) = \?$/)){const v=m[1].split(', ').map(Number),f={};v.forEach(x=>f[x]=(f[x]||0)+1);const mx=Math.max(...Object.values(f)),modes=Object.keys(f).filter(k=>f[k]===mx);return modes.length===1&&mx>=2?+modes[0]:NaN;}
  if(m=q.match(/^Variasjonsbredde av ([\d, ]+) = \?$/)){const v=m[1].split(', ').map(Number);return Math.max(...v)-Math.min(...v);}
  if(m=q.match(/^x \+ y = (-?\d+), x - y = (-?\d+), x = \?$/))return (+m[1]+ +m[2])/2;
  if(m=q.match(/^x² = (\d+), x > 0, x = \?$/))return Math.sqrt(m[1]);
  if(m=q.match(/^(\d+)\(x \+ (\d+)\) = (\d+), x = \?$/))return m[3]/m[1]-m[2];
  if(m=q.match(/^[fg]\(x\) = (\d*)x(²?) ([+-]) (\d+), [fg]\((\d+)\) = \?$/)){const a=m[1]===''?1:+m[1],x=+m[5];const v=m[2]?a*x*x:a*x;return m[3]==='+'?v+ +m[4]:v-m[4];}
  if(m=q.match(/^f\(x\) = (\d*)x², f\((\d+)\) = \?$/)){const a=m[1]===''?1:+m[1];return a*m[2]*m[2];}
  if(m=q.match(/^(sin|cos|tan)\((\d+)°\) = \?$/)){const r=m[2]*Math.PI/180;return Math[m[1]](r);}
  if(m=q.match(/^Terning: P\(tall ≤ (\d+)\) = \?$/))return m[1]/6;
  if(m=q.match(/^Kast (\d+) mynt(er)?: P\((\d+ )?kron\) = \?$/))return 1/Math.pow(2,+m[1]);
  if(m=q.match(/^(\d+) kuler, (\d+) røde\. P\(rød\) = \?$/))return m[2]/m[1];
  return undefined;
}
const BAD=/\b(pa|Naesten|a trekke|a gange|Brok|Broker|Los|okes|rode|rod|Storst|hoyre|gjor|Lineaere|laere|monster|naermeste|sma|lan|gar|fa|forste|Niva|Sporsmal)\b|undefined|NaN|Infinity|\[object/;
const negOK=new Set(['neg6','func10']);
const FUNRE=/[🍎🍓⭐🐟🍪🎈🐞🍌🧁🌸]/u;

const subsSeen={};
for(const g of Object.keys(CUR)){
  const gd=CUR[g];
  ok(!/^[\x00-\x7f]+$/.test(gd.icon),`grade ${g} icon is ASCII placeholder`);
  ok(gd.topics.length<=12,`grade ${g} has >12 topics`);
  ok(new Set(gd.topics.map(t=>t.id)).size===gd.topics.length,`grade ${g} has duplicate topic ids`);
  for(const t of gd.topics){
    ok(!/^[\x00-\x7f]+$/.test(t.icon),`${t.id} icon ASCII placeholder '${t.icon}'`);
    ok(!BAD.test(t.name+' '+t.desc),`${t.id} name/desc bad Norwegian`);
    ok(LG[t.id]&&LG[t.id].length>0,`${t.id} has no learn guide`);
    let stories=0;
    for(let i=0;i<500;i++){
      const qd=t.gen(+g,t.id);
      // Valgoppgaver (qd.choices): riktig svar finnes blant valgene, ingen like valg, tilbakemelding viser fasit
      if(Array.isArray(qd.choices)&&qd.choices.length){
        const key=String(qd.ansTxt??qd.ans),cs=qd.choices.map(String);
        ok(typeof qd.q==='string'&&qd.q.trim().length>0,`${t.id} empty q`);
        ok(typeof qd.sub==='string'&&qd.sub.length>0,`${t.id} missing sub`);
        ok(cs.includes(key),`${t.id} choices missing answer: ${qd.q} -> ${key} in [${cs}]`);
        ok(new Set(cs).size===cs.length,`${t.id} duplicate choices: ${qd.q} [${cs}]`);
        ok(cs.length>=2&&cs.length<=6,`${t.id} choices count ${cs.length}`);
        ok(!BAD.test(qd.q+' '+(qd.hint||'')+' '+cs.join(' ')),`${t.id} bad text: ${qd.q}`);
        if(qd.vis)ok(R('renderVis')(qd.vis).length>0,`${t.id} vis kind not rendered: ${qd.vis.kind}`);
        subsSeen[qd.sub]=t.id;
        const wrong=cs.find(c=>c!==key);
        if(wrong!=null){R('S').current=Object.assign({},qd,{givenTxt:wrong});let html='';try{html=t.fb(qd.q,wrong,qd.ans);}catch(e){html='THROW '+e.message;}
          ok(typeof html==='string'&&!/THROW/.test(html),`${t.id} fb throws on choice: ${html} | ${qd.q}`);
          ok(!BAD.test(html),`${t.id} fb bad text: ${html}`);
          ok(html.includes(key),`${t.id} fb does not show answer ${key}: ${html}`);}
        continue;
      }
      if(qd.vis)ok(R('renderVis')(qd.vis).length>0,`${t.id} vis kind not rendered: ${qd.vis.kind}`);
      const base=qd.eq||qd.q;
      ok(typeof qd.q==='string'&&qd.q.trim().length>0,`${t.id} empty q`);
      ok(typeof qd.ans==='number'&&isFinite(qd.ans),`${t.id} ans not finite: ${qd.q}`);
      ok(typeof qd.sub==='string'&&qd.sub.length>0,`${t.id} missing sub`);
      ok(!BAD.test(qd.q+' '+(qd.hint||'')+' '+(qd.type||'')),`${t.id} bad text in q/hint: ${qd.q} | ${qd.hint}`);
      if(!negOK.has(t.id))ok(qd.ans>=0,`${t.id} negative answer: ${qd.q} = ${qd.ans}`);
      if(+g===1)ok(qd.ans<=90,`${t.id} grade-1 answer too big: ${qd.ans}`);
      if(+g===1&&t.id!=='seq1')ok(qd.ans<=20,`${t.id} grade-1 answer >20: ${qd.q}`);
      if(+g===2)ok(qd.ans<=100,`${t.id} grade-2 answer >100: ${qd.q}`);
      const s=solve(base);
      ok(s!==undefined,`${t.id} solver cannot parse: ${base}`);
      if(s!==undefined)ok(Math.abs(s-qd.ans)<0.006,`${t.id} wrong answer: ${base} -> ${qd.ans} (expected ${s})`);
      if(qd.ansTxt!=null){const v=parseAns(qd.ansTxt);ok(v!==null&&Math.abs(v-qd.ans)<0.01,`${t.id} ansTxt does not parse back: ${qd.ansTxt} vs ${qd.ans}`);
        if(s!==undefined)ok(Math.abs(v-s)<1e-9,`${t.id} ansTxt not exact: ${qd.ansTxt} vs ${s}`);
        if(qd.ansTxt.includes('/')){const[a,b]=qd.ansTxt.split('/').map(Number);ok(gcd(a,b)===1,`${t.id} ansTxt not simplified: ${qd.ansTxt}`);}}
      if(qd.eq){stories++;
        // historie/emoji: tallene i regnestykket må stå i teksten (eller som emoji-antall)
        const nums=(qd.eq.match(/\d+/g)||[]).map(Number);
        if(FUNRE.test(qd.q)&&/^[^\d]+ [+-] [^\d]+ = \?$/.test(qd.q)){const parts=qd.q.replace(' = ?','').split(/ [+-] /).map(p=>[...p].length);ok(parts[0]===nums[0]&&parts[1]===nums[1],`${t.id} emoji count mismatch: ${qd.q} vs ${qd.eq}`);}
        else{const inQ=(qd.q.match(/\d+/g)||[]).map(Number);ok(nums.every(n=>n===qd.ans||inQ.includes(n)),`${t.id} story missing numbers: ${qd.q} vs ${qd.eq}`);}
        ok(qd.q.length<=80,`${t.id} story too long: ${qd.q}`);
      }
      subsSeen[qd.sub]=t.id;
      // feedback med feil svar (og simulert input-tekst)
      const wrongs=[qd.ans+1,qd.ans+3,Math.max(0,qd.ans-2)+0.5];
      for(const w of wrongs){
        R('S').current=Object.assign({},qd,{givenTxt:nf(w)});
        let html='';try{html=t.fb(qd.q,w,qd.ans);}catch(e){html='THROW '+e.message;}
        ok(typeof html==='string'&&!/THROW/.test(html),`${t.id} fb throws: ${html} | ${qd.q}`);
        ok(!BAD.test(html),`${t.id} fb bad text: ${html}`);
        const want=qd.ansTxt||nf(qd.ans);
        ok(html.includes(`<strong>${want}</strong>`),`${t.id} fb does not show answer ${want}: ${html}`);
        ok(!/Du svarte|fallback/.test(html)||+g>=3||t.id==='x',`${t.id} grade 1-2 fb not warm: ${html}`);
        if(t.fb.name!=='fbStat'&&t.fb.name!=='fbAlg')ok(!/^Du svarte [^.]*\. Riktig er <strong>[^<]*<\/strong>\. Prøv igjen! 💪$/.test(html)||+g>=5,`${t.id} fb fell back to dflt: ${html}`);
      }
    }
    if(+g<=2&&!['x'].includes(t.id))ok(stories>0,`${t.id} produced no story/emoji variants`);
  }
}
// alle sub-ferdigheter har et navn i fmtSub
for(const [s,id] of Object.entries(subsSeen)){const f=fmtSub(s);ok(f!==s&&!BAD.test(f),`fmtSub has no name for '${s}' (${id})`);}

// guider
for(const [id,steps] of Object.entries(LG)){for(const st of steps){
  ok(st.icon&&!/^[\x00-\x7f]+$/.test(st.icon),`guide ${id} ASCII icon '${st.icon}'`);
  ok(typeof st.title==='string'&&st.title.length>0,`guide ${id} empty title`);
  ok(!BAD.test(st.title+' '+st.text+' '+(st.visual||'').replace(/<[^>]*>/g,' ')),`guide ${id} bad text: ${st.title} ${st.text}`);
}}

// parser
const P=[['3/4',0.75],['6/8',0.75],['0,75',0.75],['0.75',0.75],['-2',-2],['1/0',null],['/',null],['',null],['-',null],['  12 ',12],['5,',5],[',5',0.5],['1 1/2',1.5],['-1/2',-0.5],['3/4/5',null],['1,2,3',null],['abc',null],['1 2',null],['0',0],['2/1',2]];
for(const [inp,exp] of P){const v=parseAns(inp);ok(exp===null?v===null:(v!==null&&Math.abs(v-exp)<1e-12),`parseAns('${inp}') = ${v}, expected ${exp}`);}

// submitAnswer-flyt: brøk, lik brøk, desimal, feil brøk innenfor 0,01-toleranse
function submit(raw,cur,g=6,tid='frac6'){
  R(`S={grade:${g},topicId:'${tid}',topic:CUR[${g}].topics.find(t=>t.id==='${tid}'),questions:[],idx:0,score:0,streak:0,combo:0,current:null,answered:false,enemyHp:100,playerHp:100,enemyDefeated:false}`);
  R('S').current=cur;document.getElementById('ans-input').value=raw;R('submitAnswer()');const S=R('S');return S.questions[S.questions.length-1]||null;}
const fq={q:'5/12 + 0/12 = ?',ans:0.42,ansTxt:'5/12',sub:'fr+'};
// Valgoppgave via submitChoice
function submitCh(v,cur,g=1,tid='add10'){R(`S={grade:${g},topicId:'${tid}',topic:CUR[${g}].topics.find(t=>t.id==='${tid}'),questions:[],idx:0,score:0,streak:0,combo:0,current:null,answered:false,enemyHp:100,playerHp:100,enemyDefeated:false}`);R('S').current=cur;R('submitChoice')(v,null);const S=R('S');return S.questions[S.questions.length-1]||null;}
let r;
r=submitCh('Ja',{q:'7 + 5 = 12. Stemmer det?',ans:'Ja',choices:['Ja','Nei'],sub:'tf'});ok(r&&r.ok,`submitChoice Ja should be ok: ${JSON.stringify(r)}`);
r=submitCh('Nei',{q:'7 + 5 = 12. Stemmer det?',ans:'Ja',choices:['Ja','Nei'],sub:'tf'});ok(r&&!r.ok,`submitChoice Nei should be wrong`);
r=submitCh(12,{q:'Hvilket tall er størst?',ans:12,choices:[12,9],sub:'cmp'});ok(r&&r.ok,`submitChoice number should be ok`);
r=submit('5/12',{...fq});ok(r&&r.ok&&r.givenTxt==='5/12'&&r.correctTxt==='5/12',`submit 5/12 should be ok: ${JSON.stringify(r)}`);
r=submit('10/24',{...fq});ok(r&&r.ok,`submit 10/24 (equivalent) should be ok`);
r=submit('0,42',{...fq});ok(r&&r.ok,`submit 0,42 should be ok`);
r=submit('3/7',{...fq});ok(r&&!r.ok,`submit 3/7 must be wrong although 0.4286 is within 0.01: ${JSON.stringify(r)}`);
r=submit('1/0',{...fq});ok(r===null,`submit 1/0 must be ignored`);
r=submit('7',{q:'3 + 4 = ?',ans:7,sub:'3+4'},1,'add10');ok(r&&r.ok&&r.correctTxt==='7',`submit 7 for 3+4 ok`);
r=submit('2,5',{q:'25 % av 10 = ?',ans:2.5,sub:'p25'},5,'pct5');ok(r&&r.ok&&r.correctTxt==='2,5',`submit 2,5 ok with comma correctTxt`);
r=submit('5/2',{q:'25 % av 10 = ?',ans:2.5,sub:'p25'},5,'pct5');ok(r&&r.ok,`submit 5/2 for 2.5 ok`);

// ---- Egne testfiler: tests/*.test.js eksporterer function({R,ok,CUR,ls,els,ctx,submit,submitCh,solve}) ----
// R(kode) kjører kode i spillets globale rom; ls er localStorage-Map (tøm med ls.clear()); els er stubbede elementer per id.
for(const f of fs.readdirSync(__dirname).filter(f=>f.endsWith('.test.js')).sort()){
  const before=fails;
  try{require(path.join(__dirname,f))({R,ok,CUR,ls,els,ctx,submit,submitCh,solve});}
  catch(e){ok(false,`${f} threw: ${e&&e.stack||e}`);}
  console.log(`  ${f}: ${fails-before?fails-before+' failures':'ok'}`);
}

console.log(`\n${checks} checks, ${fails} failures`);
for(const [m,n] of Object.entries(failMsgs).slice(0,40))console.log(`  x${n}  ${m}`);
console.log('\nSample questions:');
for(const g of [1,2])for(const t of CUR[g].topics){const seen=new Set();for(let i=0;i<60&&seen.size<3;i++)seen.add(t.gen(g,t.id).q);console.log(`  ${g} ${t.id}: ${[...seen].join('  |  ')}`);}
process.exit(fails?1:0);
