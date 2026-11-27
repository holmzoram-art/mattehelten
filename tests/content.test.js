// Tester for nye temaer i 1.–2. klasse (js/topics12.js) og temakartet (getTopicPositions).
// Fasitløseren under er uavhengig av generatorene: den leser bare det barnet ser – oppgaveteksten,
// det tegnede bildet (HTML/SVG fra renderVis) og svarknappene – og regner ut svaret selv.
module.exports=function({R,ok,CUR,ls,els,ctx,submit,submitCh,solve}){
  const NEW={1:['cmp1','eq1','sub20','clock1'],2:['place2','even2','money2']};
  const ORDER={1:['add10','sub10','ten1','cmp1','pat1','seq1','eq1','add20','sub20','clock1'],2:['place2','line2','count2','add100','sub100','miss2','even2','money2','dbl2','mul25']}; // bølge 3: pat1, line2, count2 (tests/content2.test.js)
  const renderVis=R('renderVis'),fmtSub=R('fmtSub'),EXTRA=R('window.EXTRA_SUBS')||{},LG=R('LEARN_GUIDES');
  const EMO=/\p{Extended_Pictographic}/u;
  const BAD=/\b(pa|Naesten|Storst|storst|storre|sma|lan|gar|fa|forste|Niva|Sporsmal|hoyre|naer|monster)\b|undefined|NaN|Infinity|\[object|\bnull\b/;
  const topic=(g,id)=>CUR[g].topics.find(t=>t.id===id);

  // ---- rekkefølge, valgfritt tema, navn ----
  for(const g of [1,2])ok(JSON.stringify(CUR[g].topics.map(t=>t.id))===JSON.stringify(ORDER[g]),`content: grade ${g} order ${CUR[g].topics.map(t=>t.id)}`);
  ok(topic(2,'mul25')&&topic(2,'mul25').optional===true,'content: mul25 should be optional');
  ok(CUR[1].topics.concat(CUR[2].topics).filter(t=>t.optional).map(t=>t.id).sort().join()==='count2,mul25,pat1','content: only mul25, pat1 and count2 are optional');
  for(const g of [1,2])for(const id of NEW[g]){const t=topic(g,id);ok(t&&t.name.length<=20&&t.desc&&t.icon,`content: ${id} name/desc/icon`);ok(!BAD.test(t.name+' '+t.desc),`content: ${id} bad name text`);}

  // ---- uavhengig fasitløser ----
  const E=s=>{s=String(s).trim();let m;
    if(m=s.match(/^(\d+)$/))return +m[1];
    if(m=s.match(/^(\d+) ([+\-·:]) (\d+)$/)){const a=+m[1],b=+m[3];return m[2]==='+'?a+b:m[2]==='-'?a-b:m[2]==='·'?a*b:a/b;}
    if(m=s.match(/^Dobbelt av (\d+)$/))return 2*m[1];
    if(m=s.match(/^Halvparten av (\d+)$/))return m[1]/2;
    return NaN;};
  const lbl=(h,m)=>m===0?`Klokka ${h}`:m===30?`Halv ${h%12+1}`:null;
  // Klokke: les vinkelen på viserne i SVG-en og regn ut tiden
  function clocks(html){return html.split('<svg class="t12-clock"').slice(1).map(s=>{
    const ah=+(s.match(/class="t12-hand-h"[^>]*rotate\(([\d.]+) /)||[])[1],am=+(s.match(/class="t12-hand-m"[^>]*rotate\(([\d.]+) /)||[])[1];
    const m=Math.round(am/6)%60,h=Math.floor((ah+1e-6)/30)%12||12;
    ok(Math.abs(((h%12)*30+m*.5)-ah)<0.2,`content: clock hour hand not consistent: ${ah} / ${am}`);
    const nums=[...s.matchAll(/class="t12-cl-n">(\d+)</g)].map(x=>+x[1]);ok(nums.join()===[1,2,3,4,5,6,7,8,9,10,11,12].join(),'content: clock face numbers');
    return {h,m,tag:(s.match(/t12-clk-tag">([^<]+)</)||[])[1]};});}
  // Mynter: les tallet som står på hver mynt
  function coins(html){const cs=html.split('<svg class="t12-coin"').slice(1).map(s=>{const n=+(s.match(/class="t12-coin-n"[^>]*>(\d+)</)||[])[1],kr=+(s.match(/data-kr="(\d+)"/)||[])[1];ok(n===kr,`content: coin label ${n} vs ${kr}`);ok([1,5,10,20].includes(n),`content: not a Norwegian coin: ${n}`);ok(/<circle r="9"/.test(s.split('</svg>')[0])===(n<10),`content: coin ${n} hole wrong`);return n;});return cs;}
  function place(html){const bars=html.split('class="t12-bar"').slice(1);bars.forEach(b=>ok((b.split('</span>')[0].match(/<i><\/i>/g)||[]).length===10,'content: tier-stav har ikke 10 klosser'));return {t:bars.length,o:(html.match(/class="t12-one"/g)||[]).length};}
  function pairs(html){return (html.match(/class="t12-pit"|class="t12-pdot"/g)||[]).length;}
  function cmpRows(html){return html.split('class="t12-cmp-row"').slice(1).map(r=>({who:(r.match(/t12-cmp-who">([^<]+)</)||[])[1],n:(r.match(/class="t12-it"/g)||[]).length}));}
  function scaleTxt(html){return [...html.matchAll(/class="t12-sc-t">(.*?)<\/text>/g)].map(x=>x[1].replace(/<[^>]+>/g,''));}
  const seq4=s=>{const t=s.split(', ');if(t.length!==4)return NaN;const k=t.map(Number),i=t.indexOf('?');let st=null;for(let j=0;j<3;j++)if(t[j]!=='?'&&t[j+1]!=='?'){st=k[j+1]-k[j];break;}const s0=i===0?k[1]-st:k[0],f=[0,1,2,3].map(j=>s0+j*st);for(let j=0;j<4;j++)if(j!==i&&f[j]!==k[j])return NaN;return {v:f[i],f,st};};

  function solveNew(id,qd,html){
    const q=qd.q,ch=(qd.choices||[]).map(String);let m;
    if(id==='sub20'){const e=(qd.eq||q).match(/^(\d+) - (\d+) = \?$/);if(!e)return;const a=+e[1],b=+e[2];
      if(qd.eq){const nums=(q.match(/\d+/g)||[]).map(Number);ok(nums[0]===a&&nums[1]===b,`content: sub20 story numbers ${q}`);ok(/spiser|flyr bort|flere/.test(q),`content: sub20 story kind ${q}`);}
      ok(a>=11&&a<=20&&b>=1&&b<=10,`content: sub20 range ${a}-${b}`);
      const cross=b>a%10&&b!==10;ok((qd.sub==='s20o'||qd.sub==='s20d')===(cross&&a<20),`content: sub20 sub/crossing mismatch ${a}-${b} ${qd.sub}`);
      if(qd.sub==='s20d')ok(a===2*b,`content: s20d not double ${a}-${b}`);return a-b;}
    if(id==='cmp1'){
      if(q==='Hvem har flest?'){const r=cmpRows(html);ok(r.length===2&&ch.includes(r[0].who)&&ch.includes(r[1].who)&&ch.includes('Like mange'),`content: cmp rows/choices ${JSON.stringify(r)} ${ch}`);return r[0].n>r[1].n?r[0].who:r[1].n>r[0].n?r[1].who:'Like mange';}
      if(m=q.match(/^Hvilket tall er (størst|minst)\?$/)){const ns=ch.map(Number);ok(ns.every(n=>n>=1&&n<=20),`content: cmp numbers ${ns}`);return String(m[1]==='størst'?Math.max(...ns):Math.min(...ns));}
      if(m=q.match(/^Er (\d+) (større|mindre) enn (\d+)\?$/)){const a=+m[1],b=+m[3];ok(a!==b,'content: c1j equal');return (m[2]==='større'?a>b:a<b)?'Ja':'Nei';}
      if(m=q.match(/^(\S+) har (\d+) (\S+)\. (\S+) har (\d+) (\S+)\. Hvor mange flere har (\S+)\?$/)){ok(m[7]===m[1]&&m[3]===m[6]&&m[1]!==m[4],`content: c1d story ${q}`);const a=+m[2],b=+m[5];ok(a>b,`content: c1d not more ${q}`);
        if(qd.vis){const r=cmpRows(html);ok(r[0].n===a&&r[1].n===b&&r[0].who===m[1],`content: c1d picture ${q}`);}return a-b;}
      return;}
    if(id==='eq1'){
      if(m=q.match(/^(.+) = (.+)\. Stemmer det\?$/)){const l=E(m[1]),r=E(m[2]);ok(isFinite(l)&&isFinite(r),`content: eq1 parse ${q}`);return l===r?'Ja':'Nei';}
      if(m=q.match(/^(.+) = (\d+) \+ \?$/)){const l=E(m[1]);if(qd.vis){const st=scaleTxt(html);ok(st[0]===m[1]&&st[1]===`${m[2]} + ?`,`content: eq1 scale text ${st} vs ${q}`);}return l-m[2];}
      if(m=q.match(/^(\d+) = \? \+ (\d+)$/))return m[1]-m[2];
      return;}
    if(id==='clock1'){
      if(q==='Hva er klokka?'){const c=clocks(html);ok(c.length===1,'content: one clock');return lbl(c[0].h,c[0].m);}
      if(m=q.match(/^Hvilken klokke viser (klokka \d+|halv \d+)\?$/)){const c=clocks(html),hit=c.filter(x=>(lbl(x.h,x.m)||'').toLowerCase()===m[1]);ok(c.length===3&&hit.length===1,`content: k1v must have exactly one match ${JSON.stringify(c)} ${q}`);ok(c.map(x=>x.tag).join()===ch.join(),'content: k1v tags = choices');return hit[0]&&hit[0].tag;}
      if(q==='Hva står på en digital klokke?'){const c=clocks(html)[0];return `${c.h}:${String(c.m).padStart(2,'0')}`;}
      if(m=q.match(/^Klokka er (\d+)\. Hva er klokka om (\d+) (time|timer)\?$/)){ok((m[2]==='1')===(m[3]==='time'),`content: time/timer ${q}`);const c=clocks(html)[0];ok(c&&c.h===+m[1]&&c.m===0,`content: k1r clock picture ${q}`);return (+m[1]+ +m[2]-1)%12+1;}
      if(m=q.match(/^Filmen starter klokka (\d+)\. Den varer i (\d+) (time|timer)\. Når er den ferdig\?$/)){ok((m[2]==='1')===(m[3]==='time'),`content: time/timer ${q}`);return (+m[1]+ +m[2]-1)%12+1;}
      if(m=q.match(/^Fra klokka (\d+) til klokka (\d+)\. Hvor mange timer er det\?$/))return m[2]-m[1];
      return;}
    if(id==='place2'){
      const pic=qd.vis?place(html):null,pv=pic&&10*pic.t+pic.o;
      if(q==='Hvilket tall er dette?')return pv;
      if(m=q.match(/^(\d+) \+ (\d+) = \?$/)){const a=+m[1],b=+m[2];ok((a%10===0&&b<10)||(b%10===0&&a<10),`content: p2e not tens+ones ${q}`);if(pic)ok(pv===a+b,`content: p2e picture ${q}`);return a+b;}
      if(m=q.match(/^Hva er (10|1) (mer|mindre) enn (\d+)\?$/)){if(pic)ok(pv===+m[3],`content: p2m picture ${q}`);return m[2]==='mer'?+m[3]+ +m[1]:m[3]-m[1];}
      if(m=q.match(/^(\d+) = (\d+) \+ \?$/)){ok(m[2]%10===0,`content: p2d ${q}`);return m[1]-m[2];}
      if(m=q.match(/^(\d+) = \? \+ (\d+)$/)){ok(+m[2]<10,`content: p2d ${q}`);return m[1]-m[2];}
      if(m=q.match(/^Hvor mange (tiere|enere) er det i (\d+)\?$/)){const n=+m[2];return String(m[1]==='tiere'?Math.floor(n/10):n%10);}
      if(m=q.match(/^Hva betyr (\d)-tallet i (\d+)\?$/)){const d=+m[1],n=m[2];ok(n.split('').filter(x=>x===m[1]).length===1,`content: p2v digit twice ${q}`);const tens=n[0]===m[1];return tens?(d===1?'1 tier':`${d} tiere`):(d===1?'1 ener':`${d} enere`);}
      return;}
    if(id==='even2'){
      const par=n=>n%2?'Oddetall':'Partall';
      if(q==='Partall eller oddetall?')return par(pairs(html));
      if(m=q.match(/^Er (\d+) et partall eller et oddetall\?$/))return par(+m[1]);
      if(m=q.match(/^Hvilket tall er et (partall|oddetall)\?$/)){const w=m[1]==='partall'?0:1,hit=ch.filter(c=>+c%2===w);ok(hit.length===1,`content: o2f exactly one ${q} ${ch}`);return hit[0];}
      if(m=q.match(/^Er (\d+) et (partall|oddetall)\?$/))return ((+m[1]%2===0)===(m[2]==='partall'))?'Ja':'Nei';
      if(m=q.match(/^🐸 Frosken hopper på (partall|oddetall): (.+)$/)){const s=seq4(m[2]);ok(s&&s.st===2&&s.f.every(x=>x%2===(m[1]==='partall'?0:1)),`content: o2r sequence ${q}`);return s.v;}
      if(m=q.match(/^Del (\d+) \S+ likt på 2 barn\. Hvor mange får hvert barn\?$/)){ok(m[1]%2===0,`content: o2d odd ${q}`);return m[1]/2;}
      return;}
    if(id==='money2'){
      const cs=qd.vis?coins(html):null,sum=cs&&cs.reduce((a,b)=>a+b,0);
      if(cs)ok(cs.every((c,i)=>!i||cs[i-1]>=c),`content: coins not sorted big to small ${cs}`);
      if(q==='Hvor mange kroner?')return `${sum} kr`;
      if(m=q.match(/^\S+ koster (\d+) kr\. Har du nok\?$/))return sum>=+m[1]?'Ja':'Nei';
      if(m=q.match(/^Hvilke mynter blir (\d+) kr\?$/)){const v=ch.map(c=>c.split(' + ').map(Number));ok(v.every(x=>x.every(n=>[1,5,10,20].includes(n))),`content: m2f coins ${ch}`);const hit=ch.filter((c,i)=>v[i].reduce((a,b)=>a+b,0)===+m[1]);ok(hit.length===1,`content: m2f exactly one ${q} ${ch}`);return hit[0];}
      if(m=q.match(/^Du betaler (\d+) kr\. \S+ koster (\d+) kr\. Hvor mye får du igjen\?$/)){ok(sum===+m[1],`content: m2i coins ${cs} vs ${m[1]}`);ok(+m[2]<+m[1],`content: m2i price`);return m[1]-m[2];}
      if(m=q.match(/^(\S+) koster (\d+) kr\. (\S+) koster (\d+) kr\. Hvor mye til sammen\?$/)){ok(m[1]!==m[3],`content: m2s same item ${q}`);return +m[2]+ +m[4];}
      if(m=q.match(/^Du har (\d+) kr\. \S+ koster (\d+) kr\. Hvor mye mangler du\?$/)){ok(+m[1]<+m[2],`content: m2m ${q}`);return m[2]-m[1];}
      return;}
  }

  // ---- generer mange oppgaver på alle nivåer og sjekk alt ----
  const words=h=>String(h).replace(/<[^>]+>/g,' ').split(/\s+/).filter(w=>/\p{L}/u.test(w)).length;
  const textOk=(s,where)=>{ok(!BAD.test(s),`content: bad text (${where}): ${s}`);ok(!/ {2}| [,.!]|\p{L} \?|\b1 (tiere|enere|timer|kroner)\b/u.test(s),`content: spacing/grammar (${where}): ${s}`);};
  const stat={};
  const mst={0:0,1:70,2:100};
  function setLvl(g,id,lv,idx){if(mst[lv])ls.set(`mh_mst_${g}_${id}`,String(mst[lv]));else ls.delete(`mh_mst_${g}_${id}`);const S=R('S');S.topicId=id;S.idx=idx;S.boss=false;}
  for(const g of [1,2])for(const id of NEW[g]){
    const t=topic(g,id);if(!t){ok(false,`content: missing topic ${id}`);continue;}
    stat[id]={};
    for(const lv of [0,1,2])for(const idx of [0,3,7])for(let i=0;i<300;i++){
      setLvl(g,id,lv,idx);
      const qd=t.gen(g,id),html=qd.vis?renderVis(qd.vis):'',key=String(qd.ansTxt??qd.ans),isCh=Array.isArray(qd.choices)&&qd.choices.length>0;
      const st=stat[id][`${lv}:${idx}`]=stat[id][`${lv}:${idx}`]||{n:0,subs:{},qs:[]};st.n++;st.subs[qd.sub]=(st.subs[qd.sub]||0)+1;if(st.qs.length<400)st.qs.push(qd);
      let exp;try{exp=solveNew(id,qd,html);}catch(e){ok(false,`content: solver threw ${e.message} on ${qd.q}`);}
      ok(exp!==undefined&&exp!==null,`content: ${id} solver cannot read: ${qd.q}`);
      if(exp!=null)ok(String(exp)===key,`content: ${id} wrong answer: ${qd.q} -> ${key} (solver: ${exp})`);
      ok(typeof qd.sub==='string'&&EXTRA[qd.sub]&&fmtSub(qd.sub)===EXTRA[qd.sub],`content: ${id} sub name missing ${qd.sub}`);
      ok(typeof qd.type==='string'&&qd.type&&typeof qd.strat==='string'&&qd.strat,`content: ${id} type/strat missing`);
      ok(typeof qd.key==='string'&&qd.key.includes(qd.sub),`content: ${id} key missing`);
      ok(typeof qd.hint==='string'&&qd.hint&&qd.hint.split(' ').length<10,`content: ${id} hint missing/long: ${qd.hint}`);
      textOk(qd.q,'q');textOk(qd.hint||'','hint');ok(qd.q.length<=80,`content: q too long ${qd.q}`);
      if(qd.vis)ok(html.length>0,`content: ${id} vis not rendered ${qd.vis.kind}`);
      if(EMO.test(qd.q)||qd.vis)ok(typeof qd.say==='string'&&qd.say.length>0,`content: ${id} needs say: ${qd.q}`);
      if(qd.say){ok(!EMO.test(qd.say),`content: emoji in say: ${qd.say}`);ok(/[?.!]$/.test(qd.say)&&!/ [+=·] | - /.test(qd.say),`content: say form: ${qd.say}`);textOk(qd.say,'say');}
      if(isCh){const cs=qd.choices.map(String);ok(cs.includes(key),`content: ${id} choices miss answer ${qd.q} ${cs}`);ok(new Set(cs).size===cs.length,`content: ${id} duplicate choices ${cs}`);ok(cs.length>=2&&cs.length<=4,`content: ${id} choice count ${cs}`);cs.forEach(c=>textOk(c,'choice'));
        for(const w of cs.filter(c=>c!==key)){R('S').current=Object.assign({},qd,{givenTxt:w});let h='';try{h=t.fb(qd.q,w,qd.ans);}catch(e){h='THROW '+e.message;}
          ok(h.includes(key)&&h.includes('<strong>'),`content: ${id} fb misses answer ${key}: ${h}`);ok(!/THROW|Du svarte/.test(h),`content: ${id} fb ${h}`);ok(words(h)<=18,`content: ${id} fb too long (${words(h)} words): ${h}`);textOk(h.replace(/<[^>]+>/g,''),'fb');}
      }else{
        ok(Number.isInteger(qd.ans)&&qd.ans>=0&&qd.ans<=(g===1?20:100),`content: ${id} numeric answer range ${qd.q} = ${qd.ans}`);
        const s=solve(qd.eq||qd.q);ok(s===qd.ans,`content: ${id} eq does not match answer ${qd.eq||qd.q}`);
        ok(qd.ops&&typeof qd.ops==='object'||/, /.test(qd.eq||qd.q),`content: ${id} numeric without ops ${qd.q}`);
        if(qd.ops){const o=qd.ops,v=o.op==='+'?o.a+o.b:o.op==='-'?o.a-o.b:o.op===':'?o.a/o.b:NaN;ok(v===qd.ans||((o.op==='+')&&(qd.ans===o.a||qd.ans===o.b)),`content: ${id} ops do not fit ${JSON.stringify(o)} ${qd.q}`);}
        for(const w of [qd.ans+1,qd.ans+3,Math.max(0,qd.ans-1)]){if(w===qd.ans)continue;R('S').current=Object.assign({},qd,{givenTxt:String(w)});let h='';try{h=t.fb(qd.q,w,qd.ans);}catch(e){h='THROW '+e.message;}
          ok(h.includes(`<strong>${qd.ans}</strong>`),`content: ${id} fb misses answer: ${h}`);ok(!/THROW|Du svarte/.test(h),`content: ${id} fb ${h}`);ok(words(h)<=18,`content: ${id} fb too long (${words(h)}): ${h}`);textOk(h.replace(/<[^>]+>/g,''),'fb');}
      }
    }
    ls.delete(`mh_mst_${g}_${id}`);
  }

  // ---- progresjon: lett først, vanskeligere når barnet får stjerner, og litt vanskeligere mot slutten av runden ----
  const share=(id,k,f)=>{const st=stat[id][k];return st.qs.filter(f).length/st.qs.length;};
  const p=(id,f,msg,lo,hi)=>{const a=share(id,lo,f),b=share(id,hi,f);ok(a<b,`content: progression ${id} ${msg}: ${lo}=${a.toFixed(2)} >= ${hi}=${b.toFixed(2)}`);};
  p('sub20',q=>q.sub==='s20o'||q.sub==='s20d','crossing','0:0','2:3');
  p('cmp1',q=>(q.choices||[]).some(c=>+c>10)||/(1\d|20) /.test(q.q),'numbers over 10','0:0','2:3');
  p('eq1',q=>q.sub==='e1b'||q.sub==='e1m','balance','0:3','2:3');
  ok(share('clock1','0:0',q=>q.vis&&q.vis.m===30||q.vis&&q.vis.list&&q.vis.list.some(c=>c.m===30))===0,'content: clock1 no halves at start');
  p('clock1',q=>q.sub==='k1t','halves within round','0:0','0:7');
  p('clock1',q=>q.sub==='k1t','halves with stars','0:3','2:3');
  p('place2',q=>['p2d','p2v','p2x'].includes(q.sub),'harder place value','0:3','2:3');
  p('even2',q=>/\d\d/.test(q.q)&&+(q.q.match(/\d+/)||[0])[0]>20,'numbers over 20','0:3','2:3');
  const avg=(id,k)=>{const qs=stat[id][k].qs.filter(q=>q.sub==='m2c');return qs.reduce((a,q)=>a+q.vis.c.reduce((x,y)=>x+y,0),0)/Math.max(1,qs.length);};
  ok(avg('money2','0:3')<avg('money2','2:3'),`content: progression money2 amounts ${avg('money2','0:3')} vs ${avg('money2','2:3')}`);
  // variasjon: hvert tema bruker mange deloppgaver og mange ulike oppgaver
  for(const id of [...NEW[1],...NEW[2]]){const subs=new Set(),qs=new Set();Object.values(stat[id]).forEach(s=>{Object.keys(s.subs).forEach(k=>subs.add(k));s.qs.forEach(q=>qs.add(q.q+'|'+JSON.stringify(q.vis||'')+'|'+q.ans));});
    ok(subs.size>=(id==='sub20'?4:5),`content: ${id} only ${subs.size} sub types`);ok(qs.size>=150,`content: ${id} only ${qs.size} different questions`);}
  // Ja/Nei-oppgaver: omtrent halvparten Ja
  for(const id of ['cmp1','eq1','even2','money2']){let ja=0,n=0;Object.values(stat[id]).forEach(s=>s.qs.forEach(q=>{if(q.choices&&q.choices[0]==='Ja'){n++;if(q.ans==='Ja')ja++;}}));ok(n>50&&ja/n>.38&&ja/n<.72,`content: ${id} Ja share ${ja}/${n}`);}

  // ---- bildene: klokka og myntene ----
  for(let h=1;h<=12;h++)for(const m of [0,30]){const c=clocks(renderVis({kind:'clock',h,m}))[0];ok(c.h===h&&c.m===m,`content: clock ${h}:${m} drawn as ${c.h}:${c.m}`);}
  const cs=coins(renderVis({kind:'coins',c:[20,20,10,5,1,1]}));ok(cs.reduce((a,b)=>a+b,0)===57,`content: coins sum ${cs}`);
  ok(/width="66"/.test(renderVis({kind:'coins',c:[20]}))&&/width="52"/.test(renderVis({kind:'coins',c:[1]})),'content: coin sizes');
  const pv=place(renderVis({kind:'place',t:4,o:7}));ok(pv.t===4&&pv.o===7,'content: place 47');
  ok(pairs(renderVis({kind:'pairs',n:7}))===7,'content: pairs 7');

  // ---- guider ----
  for(const id of [...NEW[1],...NEW[2]]){const st=LG[id];ok(Array.isArray(st)&&st.length>=3,`content: ${id} guide steps`);if(!st)continue;
    ok(/din tur/i.test(st[st.length-1].title),`content: ${id} guide last step`);st.forEach(s=>{ok(s.visual&&s.visual.length>20,`content: ${id} guide visual`);ok(words(s.text)<=26,`content: ${id} guide text long: ${s.text}`);textOk(s.text,'guide');});}

  // ---- minioppgaver (mhMini) ----
  const mhMini=R('mhMini');
  const base=[];
  for(const [g,id] of [[1,'add10'],[1,'sub10'],[1,'add20'],[1,'sub20'],[2,'add100'],[2,'sub100'],[2,'place2'],[2,'mul25']]){const t=topic(g,id);for(let i=0;i<150;i++){const qd=t.gen(g,id);if(!qd.choices)base.push([g,id,qd]);}}
  base.push([2,'dbl2',{q:'Dobbelt av 6 = ?',ans:12,ops:{a:6,op:'dbl'},sub:'dob'}],[2,'dbl2',{q:'Halvparten av 14 = ?',ans:7,ops:{a:14,op:'half'},sub:'halv'}],[2,'mul25',{q:'4 · 5 = ?',ans:20,ops:{a:4,b:5,op:'·'},sub:'x5'}],[2,'x',{q:'20 : 5 = ?',ans:4,ops:{a:20,b:5,op:':'},sub:'d5'}]);
  let tf=0,ja=0,cmpN=0,nul=0;
  for(let rep=0;rep<4;rep++)for(const [g,id,qd] of base){
    const mq=mhMini(qd,g,id);if(!mq){nul++;continue;}
    const cs=mq.choices.map(String),key=String(mq.ans);
    ok(cs.includes(key)&&new Set(cs).size===cs.length&&cs.length===2,`content: mini choices ${mq.q} ${cs}`);
    ok(mq.say&&!EMO.test(mq.say)&&!/ [+=·] | - /.test(mq.say),`content: mini say ${mq.say}`);textOk(mq.q,'mini');
    ok(EXTRA[mq.sub],`content: mini sub name ${mq.sub}`);
    let m;
    if(m=mq.q.match(/^(.+) (=|er) (\d+)\. Stemmer det\?$/)){tf++;const v=E(m[1]),sh=+m[3];ok(isFinite(v),`content: mini parse ${mq.q}`);const truth=v===sh;if(truth)ja++;ok(key===(truth?'Ja':'Nei'),`content: mini Ja/Nei wrong: ${mq.q} -> ${key}`);
      if(!truth){const d=Math.abs(v-sh),rev=v>=10&&String(v).split('').reverse().join('')===String(sh);const mm=m[1].match(/^(\d+) - (\d+)$/),hh=m[1].match(/^Halvparten av (\d+)$/);ok([1,2,10].includes(d)||rev||(mm&&sh===+mm[1]+ +mm[2])||(hh&&sh===2*hh[1]),`content: mini false is not a typical error: ${mq.q}`);}
      ok(v===qd.ans,`content: mini statement not about the task: ${mq.q} vs ${qd.q}`);}
    else if(mq.q==='Hvilken er størst?'){cmpN++;const v=cs.map(E);ok(v.every(isFinite)&&v[0]!==v[1],`content: mini cmp values ${cs}`);ok(key===cs[v[0]>v[1]?0:1],`content: mini cmp answer ${cs} -> ${key}`);ok(cs.some(c=>E(c)===qd.ans),`content: mini cmp not about the task ${cs} vs ${qd.q}`);}
    else ok(false,`content: unknown mini ${mq.q}`);
    // tilbakemelding gjennom temaets fb (innpakket i topics12.js)
    const t=topic(g,id)||topic(1,'add10'),wrong=cs.find(c=>c!==key);R('S').current=Object.assign({},mq,{givenTxt:wrong});const h=t.fb(mq.q,wrong,mq.ans);
    ok(h.includes(`<strong>${key}</strong>`)&&words(h)<=16,`content: mini fb ${h}`);
  }
  ok(tf>200&&cmpN>100,`content: mini mix tf=${tf} cmp=${cmpN}`);ok(ja/tf>.4&&ja/tf<.6,`content: mini Ja share ${ja}/${tf}`);
  ok(nul<base.length,'content: mini returns null too often');
  ok(mhMini({q:'Hva er klokka?',ans:'Klokka 3',choices:['Klokka 3','Klokka 4']},1,'clock1')===null,'content: mini on choice question must be null');
  ok(mhMini({q:'3 + 4 = ?',ans:7,ops:{a:3,b:4,op:'+'}},1,'eq1')===null,'content: mini on eq1 must be null');
  ok(mhMini({q:'Hva er dette?',ans:3},1,'add10')===null,'content: mini without ops must be null');
  ok(mhMini({q:'7 : 2 = ?',ans:3.5,ops:{a:7,b:2,op:':'}},2,'x')===null,'content: mini non-integer must be null');
  ok(mhMini(null,1,'add10')===null,'content: mini null');
  // vanlig tilbakemelding virker fortsatt etter innpakningen
  {const t=topic(1,'add10'),qd={q:'8 + 5 = ?',ans:13,sub:'8+5'};R('S').current=Object.assign({},qd,{givenTxt:'12'});const h=t.fb(qd.q,12,13);ok(h.includes('<strong>13</strong>'),`content: wrapped fbAdd broken: ${h}`);ok(t.fb.name==='fbAdd','content: wrapped fb keeps name');}
  // en minioppgave kan besvares med valgknapp
  {const mq={q:'7 + 5 = 12. Stemmer det?',ans:'Ja',choices:['Ja','Nei'],sub:'mini-tf',mini:{kind:'tf',e:'7 + 5',is:'=',v:12,sh:12,truth:true}};const r=submitCh('Ja',mq);ok(r&&r.ok,'content: submit mini Ja');}

  // ---- svar via spillets egne funksjoner (valgknapp og tall-tastatur) ----
  for(const [g,id] of [[1,'clock1'],[1,'cmp1'],[2,'money2'],[2,'even2']]){const t=topic(g,id);for(let i=0;i<40;i++){setLvl(g,id,2,3);const qd=t.gen(g,id);if(!qd.choices)continue;const r=submitCh(String(qd.ansTxt??qd.ans),qd,g,id);ok(r&&r.ok,`content: submitChoice ${id} ${qd.q}`);break;}}
  for(const [g,id] of [[1,'sub20'],[2,'place2']]){const t=topic(g,id);for(let i=0;i<40;i++){const qd=t.gen(g,id);if(qd.choices)continue;const r=submit(String(qd.ans),qd,g,id);ok(r&&r.ok,`content: submit ${id} ${qd.q}`);const r2=submit(String(qd.ans+1),qd,g,id);ok(r2&&!r2.ok,`content: submit wrong ${id}`);break;}}

  // ---- temakartet: opptil 10 temaer uten overlapp, på mobil (375) og bred skjerm ----
  const win=R('window'),gtp=R('getTopicPositions'),wrap=els['topic-map-wrap']||R("document.getElementById('topic-map-wrap')");
  for(const vw of [320,375,768,1280])for(let n=1;n<=10;n++){
    win.innerWidth=vw;const pos=gtp(n),W=Math.min(Math.max(vw,320)-24,620),H=parseFloat(wrap.style.height);
    ok(pos.length>=n&&isFinite(H)&&H>=200,`content: map ${vw}px n=${n} height ${H}`);
    const px=pos.slice(0,n).map(([x,y])=>[x*W/100,y*H/100]);
    px.forEach(([x,y],i)=>ok(x>=40&&x<=W-40&&y>=50&&y<=H-48,`content: map ${vw}px n=${n} node ${i} outside (${x.toFixed(0)},${y.toFixed(0)}) of ${W}x${H}`));
    for(let i=0;i<n;i++)for(let j=i+1;j<n;j++){const dx=Math.abs(px[i][0]-px[j][0]),dy=Math.abs(px[i][1]-px[j][1]);ok(dx>=86||dy>=108,`content: map ${vw}px n=${n} nodes ${i},${j} overlap dx=${dx.toFixed(0)} dy=${dy.toFixed(0)}`);}
    for(let i=1;i<n;i++){const dx=Math.abs(px[i][0]-px[i-1][0]),dy=Math.abs(px[i][1]-px[i-1][1]);ok(dx<W*.55||dy<20,`content: map ${vw}px n=${n} path jumps between ${i-1} and ${i}`);}
  }
  win.innerWidth=undefined;
};
