// Tester for bølge 3 (C2): Mønster (pat1), Tallinja (line2) og Tell til 100 (count2) i js/topics12.js.
// Fasitløseren under er uavhengig av generatorene: den leser bare det barnet ser – oppgaveteksten,
// tegningen (HTML/SVG fra renderVis) og svarknappene – og finner svaret selv.
module.exports=function({R,ok,CUR,ls,els,submit,submitCh,solve}){
  const NEW=[[1,'pat1'],[2,'line2'],[2,'count2']];
  const ORDER={1:['add10','sub10','ten1','cmp1','pat1','seq1','eq1','add20','sub20','clock1'],2:['place2','line2','count2','add100','sub100','miss2','even2','money2','dbl2','mul25']};
  const renderVis=R('renderVis'),fmtSub=R('fmtSub'),EXTRA=R('window.EXTRA_SUBS')||{},LG=R('LEARN_GUIDES');
  const EMO=/\p{Extended_Pictographic}/u,J=JSON.stringify;
  const BAD=/\b(pa|Naesten|Storst|storst|storre|sma|lan|gar|fa|forste|Niva|Sporsmal|hoyre|naer|monster|monsteret)\b|undefined|NaN|Infinity|\[object|\bnull\b/;
  const topic=(g,id)=>CUR[g].topics.find(t=>t.id===id);
  const plain=h=>String(h).replace(/<[^>]*>/g,' ').replace(/\p{Extended_Pictographic}️?/gu,' ').replace(/\s+/g,' ').trim();
  const words=h=>plain(h).split(' ').filter(w=>/[\p{L}\d]/u.test(w)).length; // som fag/fbwords.js
  const textOk=(s,where)=>{ok(!BAD.test(s),`c2: bad text (${where}): ${s}`);ok(!/ {2}| [,.!]|\p{L} \?|\b1 (tiere|enere|streker|klosser)\b/u.test(s),`c2: spacing/grammar (${where}): ${s}`);};
  const hasNum=(s,n)=>new RegExp(`(^|[^\\d])${n}([^\\d]|$)`).test(s);

  // ---- 1) Rekkefølge, valgfrie temaer, boss, opplåsing ----
  for(const g of [1,2])ok(J(CUR[g].topics.map(t=>t.id))===J(ORDER[g]),`c2: grade ${g} order ${CUR[g].topics.map(t=>t.id)}`);
  ok(topic(1,'pat1').optional===true&&topic(2,'count2').optional===true&&!topic(2,'line2').optional,'c2: Mønster og Tell til 100 er valgfrie, Tallinja teller');
  ok(J(R("mstCore(1).map(t=>t.id)"))===J(ORDER[1].filter(x=>x!=='pat1')),'c2: bossen i 1. kl. bruker ikke Mønster');
  ok(J(R("mstCore(2).map(t=>t.id)"))===J(ORDER[2].filter(x=>x!=='count2'&&x!=='mul25')),'c2: bossen i 2. kl. bruker Tallinja, ikke Tell til 100');
  ls.clear();R("recordRound(1,'cmp1',8,8)");
  ok(R(`isTopicUnlocked(1,${ORDER[1].indexOf('pat1')})`)&&R(`isTopicUnlocked(1,${ORDER[1].indexOf('seq1')})`),'c2: Mønster og Tallrekker åpnes etter Størst og minst (valgfritt tema stenger ikke)');
  ls.clear();R("recordRound(2,'place2',8,8)");
  ok(R('isTopicUnlocked(2,1)')&&!R('isTopicUnlocked(2,2)')&&!R('isTopicUnlocked(2,3)'),'c2: Tallinja åpnes etter Tiere og enere');
  R("recordRound(2,'line2',6,8)");ok(R('isTopicUnlocked(2,2)')&&R('isTopicUnlocked(2,3)'),'c2: Tell til 100 og Pluss til 100 åpnes med ⭐ i Tallinja (Tell til 100 stenger ikke)');
  ls.clear();
  for(const [g,id] of NEW){const t=topic(g,id);
    ok(t.name.length<=20&&t.desc&&!/^[\x00-\x7f]+$/.test(t.icon),`c2: ${id} name/desc/icon`);textOk(t.name+' '+t.desc,'name');
    const m=R(`FUN_MONSTERS['${id}']`);ok(m&&m.e&&m.n&&m.a&&m.e!==t.icon,`c2: ${id} har eget monster`);
    ok(R(`typeof PAR_TOPIC['${id}']==='string'&&PAR_TOPIC['${id}'].length>20`),`c2: ${id} har foreldretips`);
    ok(R(`T12_NOMINI.has('${id}')`)&&R(`mhMini({q:'34 + 10 = ?',ans:44,ops:{a:34,b:10,op:'+'}},${g},'${id}')`)===null,`c2: ingen minioppgave i ${id}`);}
  ok(R('typeof buildTopicMap')==='function'&&!(()=>{try{R('buildTopicMap(1);buildTopicMap(2)');return false;}catch(e){return true;}})(),'c2: temakartet med 10 temaer bygges');
  {const pos=R('(innerWidth=>{window.innerWidth=375;const p=getTopicPositions(10);window.innerWidth=innerWidth;return p;})(window.innerWidth)');ok(pos.length===10&&R('getTopicPositions.cols')===3,'c2: 10 temaer på 375 px gir slangesti med 3 per rad');}

  // ---- 2) Uavhengig fasitløser ----
  // Mønster: ruter i rekkefølge ('?' = tom rute). per = korteste bit som gjentas minst to ganger
  const patItems=h=>[...h.matchAll(/<span class="t12-pat-it[^"]*"[^>]*>([^<]*)<\/span>/g)].map(m=>m[1]);
  const per=a=>{for(let p=1;p<=a.length/2;p++)if(a.every((x,i)=>i<p||x===a[i-p]))return p;return Infinity;};
  const em=s=>Array.from(String(s)).filter(c=>c!=='️');
  function towers(h){return h.split('class="t12-gr-fig"').slice(1).map(f=>{const st=f.split('class="t12-gr-n"')[0];if(/t12-gr-q/.test(st))return null;
    const rows=[...st.matchAll(/<span class="t12-gr-row">((?:<i><\/i>)*)<\/span>/g)].map(r=>r[1].length/7);return rows;});}
  // Tallinje: tall under linja, streker, pil og merker – verdien av en x-posisjon regnes ut fra tallene som står
  function nline(h){
    const lab=[...h.matchAll(/<text class="t12-nl-n" x="([\d.]+)" y="[\d.]+">(\d+)<\/text>/g)].map(m=>({x:+m[1],n:+m[2]}));
    const tk=[...h.matchAll(/<line class="t12-nl-tk( big)?" x1="([\d.]+)"/g)].map(m=>+m[2]);
    const ar=(h.match(/class="t12-nl-ar" transform="translate\(([\d.]+) 0\)"/)||[])[1];
    const mk=[...h.matchAll(/class="t12-nl-mk" transform="translate\(([\d.]+) 0\)">.*?class="t12-nl-tag"[^>]*>([^<]+)<\/text>/g)].map(m=>({x:+m[1],tag:m[2]}));
    const a=lab[0],b=lab[lab.length-1],val=x=>a.n+(x-a.x)*(b.n-a.n)/(b.x-a.x);
    ok(lab.length>=2&&lab.every(l=>Math.abs(val(l.x)-l.n)<.15),`c2: tallene på linja står ikke jevnt ${J(lab)}`);
    return {lab,tk,ar:ar==null?null:+ar,mk,val,unit:(b.x-a.x)/(b.n-a.n)};}
  function board(h){const cs=[...h.matchAll(/<span class="t12-bd-c[^"]*">([^<]+)<\/span>/g)].map(m=>m[1]),C=+(h.match(/--cols:(\d+)/)||[])[1];
    const qi=cs.indexOf('?'),ref=cs.findIndex(c=>c!=='?'),r0=Math.floor(ref/C),c0=ref%C,base=+cs[ref]-10*r0-c0;
    ok(cs.length===15&&C===5&&cs.filter(c=>c==='?').length===1,`c2: hundrebrett ${cs}`);
    ok(cs.every((c,i)=>c==='?'||+c===base+10*Math.floor(i/C)+i%C),`c2: hundrebrettet er ikke 10 bredt ${cs}`);
    return base+10*Math.floor(qi/C)+qi%C;}
  const seq4=s=>{const t=s.split(', ');if(t.length!==4)return null;const k=t.map(Number),i=t.indexOf('?');let st=null;for(let j=0;j<3;j++)if(t[j]!=='?'&&t[j+1]!=='?'){st=k[j+1]-k[j];break;}
    const s0=i===0?k[1]-st:k[0],f=[0,1,2,3].map(j=>s0+j*st);for(let j=0;j<4;j++)if(j!==i&&f[j]!==k[j])return null;return {v:f[i],f,st,i};};

  function solveNew(id,qd,h){
    const q=qd.q,ch=(qd.choices||[]).map(String);let m;
    if(id==='pat1'){
      if(m=q.match(/^(?:\S+ Tårnene vokser: )?(\d+),\s(\d+),\s(\d+),\s\?$/)){const ns=[+m[1],+m[2],+m[3]],tw=towers(h),d=ns[1]-ns[0];
        ok(tw.length===4&&tw[3]===null&&tw.slice(0,3).every((rows,i)=>rows.reduce((a,b)=>a+b,0)===ns[i]),`c2: tårnene stemmer ikke med tallene ${q}`);
        tw.slice(0,3).forEach(rows=>ok(rows.every((k,i)=>i===rows.length-1||k===rows[0])&&rows[rows.length-1]<=rows[0],`c2: tårnrader ${J(rows)}`));
        ok(d>0&&ns[2]-ns[1]===d,`c2: tårnene vokser ikke likt ${q}`);return ns[2]+d;}
      const it=patItems(h),gaps=it.map((x,i)=>x==='?'?i:-1).filter(i=>i>=0);
      ok(it.length>=6&&it.length<=8,`c2: mønsteret har ${it.length} ruter`);ok(new Set(it.filter(x=>x!=='?')).size>=2,'c2: mønster med bare én ting');
      if(q==='Hvilken bit gjentar seg?'){const p=per(it),hit=ch.filter(c=>{const e=em(c);return e.length<=it.length/2&&it.every((x,i)=>x===e[i%e.length]);});
        ok(gaps.length===0&&isFinite(p)&&hit.length===1,`c2: m1k må ha nøyaktig én bit som passer ${it} ${ch}`);return hit[0];}
      ok((q==='Hvilke to kommer nå?')===(gaps.length===2),`c2: antall hull ${q} ${it}`);
      const fits=ch.filter(c=>{const e=em(c),f=it.slice();if(e.length!==gaps.length)return false;gaps.forEach((gi,k)=>f[gi]=e[k]);return isFinite(per(f));});
      ok(fits.length===1,`c2: nøyaktig ett valg skal passe i mønsteret ${it} [${ch}] -> ${fits}`);
      if(q==='Hva mangler?')ok(gaps.length===1&&gaps[0]>0&&gaps[0]<it.length-1,`c2: hullet skal stå inni mønsteret ${it}`);
      else ok(gaps[gaps.length-1]===it.length-1,`c2: hullet skal stå sist ${it}`);
      return fits[0];}
    if(id==='line2'){
      if(m=q.match(/^🦘 Kenguruen står på (\d+)\. Den hopper (\d+) (fram|tilbake)\. Hvor lander den\?$/)){const a=+m[1],b=+m[2],c=m[3]==='fram'?a+b:a-b;
        ok(/class="t12-hop"/.test(h)&&new RegExp(`class="lv-n[^"]*"[^>]*>${a}<`).test(h)&&/>\?</.test(h)&&!new RegExp(`>${c}<`).test(h),`c2: hoppbildet viser start og ?, ikke svaret ${q}`);
        ok([1,2,5,10,20,30].includes(b),`c2: hopp ${b}`);if(b<10)ok(Math.floor(a/10)!==Math.floor(c/10)||c%10===0,`c2: små hopp skal gå forbi en tier ${q}`);return c;}
      const L=nline(h);
      if(q==='Hvilket tall peker pilen på?'){
        ok(L.ar!=null&&L.mk.length===0,'c2: pil mangler');const v=L.val(L.ar),n=Math.round(v);
        ok(Math.abs(v-n)<.05&&L.tk.some(x=>Math.abs(x-L.ar)<.2),`c2: pilen står ikke på en strek ${v}`);
        ok(!L.lab.some(l=>l.n===n),`c2: tallet ved pilen står skrevet ${n}`);
        const sp=L.tk.slice(1).map((x,i)=>x-L.tk[i]);ok(sp.every(d=>Math.abs(d-sp[0])<.25)&&sp[0]>=13,`c2: strekene står ujevnt eller for tett ${sp[0]}`);
        const step=Math.round(sp[0]/L.unit),near=Math.min(...L.lab.map(l=>Math.abs(l.n-n)))/step;ok(near<=5,`c2: mer enn 5 streker fra nærmeste tall (${near})`);
        return n;}
      if(q==='Omtrent hvilket tall peker pilen på?'){const v=L.val(L.ar),ds=ch.map(c=>Math.abs(+c-v)).sort((a,b)=>a-b);
        ok(L.tk.length===2&&L.lab.length===2,'c2: tom tallinje skal bare ha endene');ok(ds[0]<1&&ds[1]>=15,`c2: tom tallinje: valgene ligger for nær ${ch} ${v}`);
        return ch.find(c=>Math.abs(+c-v)<1);}
      if(m=q.match(/^Hvor er (\d+)\?$/)){const n=+m[1],hit=L.mk.filter(x=>Math.abs(L.val(x.x)-n)<.05);
        ok(L.mk.length===3&&J(L.mk.map(x=>x.tag).sort())===J(ch.slice().sort()),`c2: tre merker = tre valg ${J(L.mk)}`);
        const xs=L.mk.map(x=>x.x).sort((a,b)=>a-b);ok(xs.slice(1).every((x,i)=>x-xs[i]>=20),`c2: merkene står for tett ${xs}`);
        ok(hit.length===1&&!L.lab.some(l=>l.n===n),`c2: nøyaktig ett merke på ${n}`);return hit[0]&&hit[0].tag;}
      return;}
    if(id==='count2'){
      if(m=q.match(/^Hva kommer (etter|før) (\d+)\?$/)){const n=+m[2],after=m[1]==='etter';ok(after?n%10===9:n%10===0,`c2: før/etter skal gå over en tier ${q}`);return String(after?n+1:n-1);}
      if(q==='Hvilket tall skjuler seg?')return String(board(h));
      const pm=q.match(/^(?:(🦉 Ugla teller|🚀 Nedtelling|🐸 Frosken hopper bakover|🐸 Frosken hopper): )?((?:\d+|\?)(?:,[  ](?:\d+|\?)){3})$/);
      if(!pm)return;const s=seq4(pm[2].replace(/ /g,' '));if(pm[1])ok(!/ \d|\d,? \d/.test(pm[2])&&/ /.test(pm[2]),`c2: tallrekka i historien kan brytes ${q}`);if(!s)return;
      ok([1,-1,2,-2,5,-5,10,-10].includes(s.st)&&s.f.every(x=>x>=0&&x<=100),`c2: tallrekke ${q}`);
      if(Math.abs(s.st)!==10)ok(Math.floor(Math.min(...s.f)/10)!==Math.floor(Math.max(...s.f)/10),`c2: tallrekka går ikke over en tier ${q}`);
      else ok(s.f[0]%10!==0,`c2: tierhopp skal starte utenfor en hel tier ${q}`);
      if(pm[1])ok({'🦉 Ugla teller':s.st===1,'🚀 Nedtelling':s.st===-1,'🐸 Frosken hopper':s.st>1,'🐸 Frosken hopper bakover':s.st<-1}[pm[1]],`c2: historien passer ikke rekka ${q}`);
      return s.v;}
  }

  // ---- 3) Mange oppgaver på alle nivåer: fasit, valg, why, tekst, tilbakemelding ----
  const lv0=R('t12Stars');R('t12Stars=function(){return globalThis.__c2lv;}');
  const setLvl=(id,lv,idx)=>{R(`globalThis.__c2lv=${[0,1,2][lv]}`);const S=R('S');S.topicId=id;S.idx=idx;S.boss=false;};
  const opsAns=o=>o.op==='+'?o.a+o.b:o.op==='-'?o.a-o.b:o.op==='seq'?o.a+o.i*o.b:NaN;
  const stat={};
  for(const [g,id] of NEW){const t=topic(g,id);stat[id]={};const pos={};
    for(const lv of [0,1,2])for(const idx of [0,3,7])for(let i=0;i<300;i++){
      ls.clear();setLvl(id,lv,idx);
      const qd=t.gen(g,id),h=qd.vis?renderVis(qd.vis):'',key=String(qd.ansTxt??qd.ans),isCh=Array.isArray(qd.choices)&&qd.choices.length>0;
      const st=stat[id][`${lv}:${idx}`]=stat[id][`${lv}:${idx}`]||{n:0,subs:{},qs:[]};st.n++;st.subs[qd.sub]=(st.subs[qd.sub]||0)+1;if(st.qs.length<300)st.qs.push(qd);
      let exp;try{exp=solveNew(id,qd,h);}catch(e){ok(false,`c2: solver threw ${e.message} on ${qd.q}`);}
      ok(exp!==undefined&&exp!==null,`c2: ${id} solver cannot read: ${qd.q}`);
      if(exp!=null)ok(String(exp)===key,`c2: ${id} wrong answer: ${qd.q} -> ${key} (solver: ${exp})`);
      ok(typeof qd.sub==='string'&&EXTRA[qd.sub]&&fmtSub(qd.sub)===EXTRA[qd.sub],`c2: ${id} sub name missing ${qd.sub}`);
      ok(typeof qd.type==='string'&&qd.type&&typeof qd.strat==='string'&&qd.strat&&R(`!!PAR_FAM['${qd.strat}']`),`c2: ${id} type/strat/foreldretips ${qd.strat}`);
      ok(typeof qd.key==='string'&&qd.key.includes(qd.sub),`c2: ${id} key missing`);
      ok(typeof qd.hint==='string'&&qd.hint&&qd.hint.split(' ').length<=6&&!hasNum(qd.hint,key),`c2: ${id} hint missing/long/gives answer: ${qd.hint}`);
      textOk(qd.q,'q');textOk(qd.hint,'hint');ok(qd.q.length<=80,`c2: q too long ${qd.q}`);
      if(qd.vis)ok(h.length>40,`c2: ${id} vis not rendered ${qd.vis.kind}`);
      ok(typeof qd.say==='string'&&qd.say.length>8&&!EMO.test(qd.say)&&/[?.!]$/.test(qd.say)&&!/ [+=·] | - /.test(qd.say),`c2: ${id} say: ${qd.say}`);textOk(qd.say,'say');
      if(isCh){const cs=qd.choices.map(String),why=qd.why||{};if(cs.length===3)pos[cs.indexOf(key)]=(pos[cs.indexOf(key)]||0)+1;
        ok(cs.includes(key)&&new Set(cs).size===cs.length&&cs.length>=3&&cs.length<=4,`c2: ${id} choices ${qd.q} [${cs}] -> ${key}`);
        ok(!(key in why),`c2: ${id} why for the answer`);
        for(const w of cs.filter(c=>c!==key)){
          ok(typeof why[w]==='string'&&why[w].length>5,`c2: ${id} why missing for ${w} (${qd.q})`);
          const wv=qd.whyV&&qd.whyV[w],wm=qd.whyM&&qd.whyM[w];ok(!!wv||qd.sub==='m1k',`c2: ${id} why-bilde mangler for ${w} (${qd.sub})`);
          if(wv){const vh=renderVis(wv);ok(vh.length>40&&(/>\?</.test(vh)||wv.arrow!=null||!!wv.marks)&&!(/^\d+$/.test(key)&&new RegExp(`>${key}<`).test(vh)),`c2: ${id} why-bildet mangler ? eller viser svaret (${qd.sub} ${w})`);
            const pm=qd.q.match(/^Hvor er (\d+)\?$/);if(pm)ok(!wv.lab.includes(+pm[1]),`c2: why-bildet skriver tallet barnet leter etter ${qd.q}`);}
          if(wm)ok(R(`!!window.MISC_NAMES['${wm}']`)&&R('detectMisc')(qd,w)===wm,`c2: ${id} whyM ${wm}`);
          if(why[w]){ok(words(why[w])<=9&&!why[w].includes(key)&&!(/^\d+$/.test(key)&&hasNum(why[w],key)),`c2: ${id} why long or gives answer: ${why[w]} (${key})`);textOk(why[w],'why');}
          R('S').current=Object.assign({},qd,{givenTxt:w});let f='';try{f=t.fb(qd.q,w,qd.ans);}catch(e){f='THROW '+e.message;}
          ok(f.includes(`<strong>${key}</strong>`)&&!/THROW|Du svarte|undefined|NaN/.test(f),`c2: ${id} fb ${f}`);ok(words(f)<=12,`c2: ${id} fb too long (${words(f)}): ${plain(f)}`);textOk(f.replace(/<[^>]*>/g,''),'fb');}
      }else{
        ok(Number.isInteger(qd.ans)&&qd.ans>=0&&qd.ans<=(g===1?20:100),`c2: ${id} numeric answer range ${qd.q} = ${qd.ans}`);
        ok(solve(qd.eq||qd.q)===qd.ans,`c2: ${id} eq does not match answer ${qd.eq||qd.q}`);
        ok(qd.ops&&opsAns(qd.ops)===qd.ans,`c2: ${id} ops ${J(qd.ops)} ${qd.q}`);
        for(const w of [qd.ans+1,qd.ans+10,Math.max(0,qd.ans-1)]){if(w===qd.ans)continue;R('S').current=Object.assign({},qd,{givenTxt:String(w)});let f='';try{f=t.fb(qd.q,w,qd.ans);}catch(e){f='THROW '+e.message;}
          ok(f.includes(`<strong>${qd.ans}</strong>`)&&!/THROW|Du svarte|undefined|NaN/.test(f),`c2: ${id} fb ${f}`);ok(words(f)<=12,`c2: ${id} fb too long (${words(f)}): ${plain(f)}`);textOk(f.replace(/<[^>]*>/g,''),'fb');}
      }
    }
    const tot=Object.values(pos).reduce((a,b)=>a+b,0);ok(Object.keys(pos).length===3&&Object.values(pos).every(k=>k/tot>.22),`c2: ${id} svaret står ofte på samme plass ${J(pos)}`);
  }
  R('S').current=null;

  // ---- 4) Trapp: lett først, vanskeligere med stjerner og mot slutten av runden ----
  const share=(id,k,f)=>{const qs=stat[id][k].qs;return qs.filter(f).length/qs.length;};
  const up=(id,f,msg,lo,hi)=>{const a=share(id,lo,f),b=share(id,hi,f);ok(a<b,`c2: trapp ${id} ${msg}: ${lo}=${a.toFixed(2)} >= ${hi}=${b.toFixed(2)}`);};
  const nonAB=q=>q.vis&&q.vis.kind==='pattern'&&new Set(q.vis.items.filter(Boolean)).size>=2&&per(q.vis.items.map(x=>x||'?'))!==2&&!(q.sub==='m1a');
  up('pat1',q=>['m1b','m1t','m1k'].includes(q.sub)||(q.sub==='m1m'&&nonAB(q)),'mønstre med tre ting','0:0','2:3');
  up('pat1',q=>q.sub==='m1v'&&q.ops.b>1,'tårn som vokser med mer enn 1','0:3','2:3');
  ok(share('pat1','0:0',q=>['m1t','m1k'].includes(q.sub))===0,'c2: pat1 starter uten «to neste» og «finn biten»');
  up('line2',q=>['n2c','n2t'].includes(q.sub),'mellom tiere og tom tallinje','0:0','2:3');
  up('line2',q=>q.vis&&q.vis.kind==='nline'&&(q.vis.lab||[]).length<=2,'færre tall på linja','0:3','2:3');
  ok(share('line2','0:0',q=>q.sub==='n2t')===0,'c2: line2 starter uten tom tallinje');
  up('line2',q=>q.choices&&q.choices.length===4,'fire valg','0:3','2:3');
  up('count2',q=>q.ops&&q.ops.b<0||/før/.test(q.q),'baklengs','0:0','2:3');
  up('count2',q=>q.ops&&[2,5,-2,-5].includes(q.ops.b),'hopp med 2 og 5','0:3','2:3');
  up('count2',q=>q.ops&&q.ops.op==='seq'&&q.ops.i!==3,'hull inni rekka','0:0','2:3');
  ok(share('count2','0:0',q=>q.ops&&q.ops.op==='seq'&&q.ops.i!==3)===0,'c2: count2 starter med hullet sist');
  // variasjon: mange deloppgaver og mange ulike oppgaver
  for(const [,id] of NEW){const subs=new Set(),qs=new Set();Object.values(stat[id]).forEach(s=>{Object.keys(s.subs).forEach(k=>subs.add(k));s.qs.forEach(q=>qs.add(q.q+'|'+J(q.vis||'')+'|'+q.ans));});
    ok(subs.size>=6,`c2: ${id} only ${subs.size} sub types`);ok(qs.size>=150,`c2: ${id} only ${qs.size} different questions`);
    const all=Object.values(stat[id]).flatMap(s=>s.qs);ok(all.every(q=>!q.choices||q.choices.length>2),`c2: ${id} har ingen tovalgsoppgaver`);
    ok(all.some(q=>q.eq&&!q.choices),`c2: ${id} har tall-oppgaver med historie/bilde`);}

  // ---- 5) Bildene ----
  {const L=nline(renderVis({kind:'nline',from:40,to:50,step:1,lab:[40,50],mid:5,arrow:47}));ok(L.tk.length===11&&Math.round(L.val(L.ar))===47,'c2: tallinje 40–50 med pil på 47');}
  {const L=nline(renderVis({kind:'nline',from:0,to:100,lab:[0,100],empty:true,arrow:25}));ok(L.tk.length===2&&Math.abs(L.val(L.ar)-25)<.5,'c2: tom tallinje med pil på 25');}
  {const tw=towers(renderVis({kind:'grow',n:[3,5,7],w:2,q:true}));ok(J(tw)==='[[2,1],[2,2,1],[2,2,2,1],null]','c2: tårn 3, 5, 7 i rader på 2');}
  ok(board(renderVis({kind:'board',r0:5,c0:6,rows:3,cols:5,hide:70}))===70,'c2: hundrebrett med 70 skjult');
  ok(J(patItems(renderVis({kind:'pattern',items:['🔴','🔵',null]})))===J(['🔴','🔵','?']),'c2: mønsterbilde');
  {const h=renderVis({kind:'hop',from:20,to:60,start:34,hops:[10],hopLab:['+10'],endLab:'?'});ok(/t12-hop/.test(h)&&/lv-line/.test(h),'c2: hoppbilde bruker VIS.line');}

  // ---- 6) Lær ----
  for(const [g,id] of NEW){const st=LG[id];ok(Array.isArray(st)&&st.length>=4,`c2: ${id} guide steps`);if(!st)continue;
    ok(/din tur/i.test(st[st.length-1].title),`c2: ${id} guide last step`);
    st.forEach(s=>{ok(s.visual&&s.visual.length>40&&!/undefined|NaN/.test(s.visual),`c2: ${id} guide visual`);ok(words(s.text)<=22,`c2: ${id} guide text long: ${s.text}`);textOk(s.text,'guide');textOk(s.title,'guide');});
    const pr=R(`learnPractice(${g},'${id}',CUR[${g}].topics.find(t=>t.id==='${id}'),null)`);ok(pr&&pr.qd&&pr.qd.q,`c2: ${id} Lær har en ekte øvingsoppgave`);
    // Siste steg er én ekte oppgave (ask) med hint som ikke viser svaret, og why for vanlige feil (B2: tests/flow.test.js)
    const a=st[st.length-1].ask;ok(st.length<=6&&a&&st.filter(s=>s.ask).length===1,`c2: ${id} Lær: én oppgave til slutt, høyst 6 steg`);if(!a)continue;
    const key=String(a.ans),ah=a.vis?renderVis(a.vis):'';ok(String(solveNew(id,a,ah))===key,`c2: ${id} Lær-oppgaven har feil fasit ${a.q}`);
    ok(a.say&&!EMO.test(a.say)&&a.help&&a.help.t&&words(a.help.t)<=12&&!a.help.t.includes(key)&&!hasNum(a.help.t,key),`c2: ${id} Lær-hint viser svaret: ${a.help&&a.help.t}`);
    ok(a.help&&(a.help.h||renderVis(a.help.v).length>40),`c2: ${id} Lær-hint har bilde`);
    const hv=renderVis(a.help.v);ok(!/^\d+$/.test(key)||!new RegExp(`>${key}<`).test(hv),`c2: ${id} Lær-hintbildet viser svaret`);
    if(a.choices)ok(a.choices.map(String).includes(key)&&a.choices.map(String).filter(c=>c!==key).every(c=>a.why&&a.why[c]),`c2: ${id} Lær: why for alle feil valg`);
    Object.entries(a.why||{}).forEach(([w,txt])=>ok(w!==key&&!txt.includes(key)&&words(txt)<=9,`c2: ${id} Lær why ${w}: ${txt}`));}

  // ---- 7) Svar via spillets egne funksjoner ----
  for(const [g,id] of NEW){const t=topic(g,id);let ch=0,num=0;
    for(let i=0;i<200&&(ch<1||num<1);i++){setLvl(id,1,3);const qd=t.gen(g,id);
      if(qd.choices&&!ch){ch++;const k=String(qd.ans);const r=submitCh(k,Object.assign({},qd),g,id);ok(r&&r.ok,`c2: submitChoice ${id} ${qd.q}`);
        const w=qd.choices.map(String).find(c=>c!==k),r2=submitCh(w,Object.assign({},qd),g,id);ok(r2&&!r2.ok&&!R('S').answered,`c2: feil valg gir nytt forsøk ${id}`);}
      else if(!qd.choices&&!num){num++;const r=submit(String(qd.ans),Object.assign({},qd),g,id);ok(r&&r.ok,`c2: submit ${id} ${qd.q}`);}}
    ok(ch&&num,`c2: ${id} har både valg og tall-tastatur`);}
  R('(f=>{t12Stars=f;})')(lv0);ls.clear();R('S').current=null; // tilbake til ekte stjerner
};
