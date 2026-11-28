// Mattehelten – tester for figurene (js/figures.js, js/figdata.js, img/fig/): registeret er i takt med filene, vekttakene holder,
// første skjerm er lett, emoji er reserven uten bilder, lat lasting med prioritet og høyst 2 samtidige, og foreldreinnstillingen.
const fs=require('fs'),path=require('path'),crypto=require('crypto');
module.exports=function({R,ok,ls,ctx}){
  const ROOT=path.join(__dirname,'..'),DIR=path.join(ROOT,'img','fig');
  // Vekttak (byte), ART-PLAN §5.7: heltestripe ≤ 60 KB, bossstripe ≤ 130 KB, stillbilde ≤ 35 KB, første skjerm ≤ 150 KB figurbilder
  const CAP={hero:60000,boss:130000,still:35000,poster:15000,atlas:70000,first:150000};
  const D=R('FIG_DATA'),man=JSON.parse(fs.readFileSync(path.join(DIR,'manifest.json'),'utf8'));
  const size=f=>fs.statSync(path.join(DIR,f)).size;
  // Bredde og høyde fra WebP-hodet (VP8X, VP8 eller VP8L)
  const dims=f=>{const b=fs.readFileSync(path.join(DIR,f)),t=b.toString('ascii',12,16);
    if(t==='VP8X')return{w:1+b.readUIntLE(24,3),h:1+b.readUIntLE(27,3)};
    if(t==='VP8 ')return{w:b.readUInt16LE(26)&0x3fff,h:b.readUInt16LE(28)&0x3fff};
    if(t==='VP8L'){const v=b.readUInt32LE(21);return{w:(v&0x3fff)+1,h:((v>>14)&0x3fff)+1};}
    return null;};

  // ---- 1) Registeret: js/figdata.js er bygd fra manifest.json, og alle filene finnes med riktig versjon ----
  ok(D&&typeof D==='object'&&D.figs&&D.files,'fig: FIG_DATA finnes (js/figdata.js)');
  ok(JSON.stringify(D.figs)===JSON.stringify(man.figs)&&JSON.stringify(D.atlas)===JSON.stringify(man.atlas),'fig: js/figdata.js er i takt med img/fig/manifest.json (kjør node tools/figsync.js)');
  for(const[f,v]of Object.entries(D.files)){
    ok(fs.existsSync(path.join(DIR,f)),`fig: filen finnes: ${f}`);
    if(fs.existsSync(path.join(DIR,f)))ok(crypto.createHash('sha1').update(fs.readFileSync(path.join(DIR,f))).digest('hex').slice(0,8)===v,`fig: versjonen (?v=) stemmer med innholdet: ${f}`);
  }
  const webps=fs.readdirSync(DIR).filter(f=>f.endsWith('.webp'));
  ok(webps.every(f=>D.files[f]),`fig: ingen filer i img/fig utenfor registeret: ${webps.filter(f=>!D.files[f]).join(', ')}`);
  ok(R('Object.keys(FIG).length')===Object.keys(D.figs).length,'fig: figRegister tok med alle figurene');

  // ---- 2) Hver figur: idle finnes, stripen har n kvadratiske rammer, og vekttakene holder ----
  for(const[id,f]of Object.entries(D.figs)){
    ok(f.anims&&f.anims.idle,`fig: ${id} har idle`);
    const cap=f.kind==='hero'?CAP.hero:f.kind==='boss'?CAP.boss:CAP.still;
    for(const[a,x]of Object.entries(f.anims||{})){const file=`${id}-${a}.webp`;if(!D.files[file]){ok(false,`fig: ${file} mangler i files`);continue;}
      ok(x.n>=1&&(x.n===1||x.ms>0),`fig: ${file} har n og ms`);
      ok(size(file)<=cap,`fig: vekttak ${file} ${size(file)} B > ${cap}`);
      const d=dims(file);ok(d&&d.h===f.size&&d.w===f.size*x.n,`fig: ${file} er ${x.n} rammer à ${f.size} px (er ${d&&d.w}x${d&&d.h})`);}
    if(f.poster){const p=`${id}-poster.webp`;ok(D.files[p]&&size(p)<=CAP.poster,`fig: plakat ${p} finnes og er ≤ ${CAP.poster} B`);}
    if(f.kind==='hero'){ok(R('FIG_HEROES').includes(f.key)&&f.rank>=0&&f.rank<=4&&id===`h-${f.key}-r${f.rank}`,`fig: helten ${id} har key og rang som stemmer med id`);
      ['atk','block','win'].forEach(a=>ok(!f.anims[a]||f.anims[a].n>=2,`fig: ${id} ${a} har minst 2 rammer (steps(n, jump-none))`));}
    if(f.kind==='mon')ok(R('FUN_MONSTERS')[f.tid],`fig: monsteret ${id} hører til et tema (${f.tid})`);
  }
  for(const[k,a]of Object.entries(D.atlas||{})){ok(D.files[a.file]&&size(a.file)<=CAP.atlas,`fig: atlas ${a.file} ≤ ${CAP.atlas} B`);
    const keys=Object.keys(a.items||{}),valid=k==='s'?R('SIDEKICKS').map((_,i)=>String(i)):k==='p'?R('PG_ITEMS').filter(i=>i.slot==='pet').map(i=>i.id):R('FIG_HEROES');
    ok(keys.length>0&&keys.every(x=>valid.includes(x)),`fig: atlas ${k} har gyldige nøkler: ${keys}`);}
  ok(R('FIG_HEROES').length===R('CHARS').length,'fig: én helte-key per helt i CHARS');
  ok(Object.values(R('FIG_BOSS')).every(id=>!id||D.figs[id]),'fig: bossene i FIG_BOSS finnes i registeret');

  // ---- 3) Første skjerm ≤ 150 KB figurbilder (bosser og kampstriper lastes ikke før de trengs) ----
  const poster=(key,r)=>{for(let i=r;i>=0;i--){const f=D.figs[`h-${key}-r${i}`];if(f&&f.poster)return size(`h-${key}-r${i}-poster.webp`);}return 0;};
  const sk=D.atlas&&D.atlas.s?size(D.atlas.s.file):0,pet=D.atlas&&D.atlas.p?size(D.atlas.p.file):0;
  const pick=D.atlas&&D.atlas.h?size(D.atlas.h.file):R('FIG_HEROES').reduce((t,k)=>t+poster(k,0),0);
  ok(pick+sk<=CAP.first,`fig: første skjerm, ny spiller (heltevalg + venner) ${pick+sk} B ≤ ${CAP.first}`);
  const back=Math.max(0,...R('FIG_HEROES').map(k=>Math.max(...[0,1,2,3,4].map(r=>poster(k,r)))));
  ok(back+sk+pet<=CAP.first,`fig: første skjerm, kartet (HUD + kart + venn + pet) ${back+sk+pet} B ≤ ${CAP.first}`);

  // ---- 4) Uten Image (som her): bare emoji, ingen feil ----
  ok(R('figOn()')===false,'fig: uten Image er figurene av');
  ls.clear();R('localStorage.setItem("mh_player",JSON.stringify({emoji:"🐉",name:"Test"}));localStorage.setItem("mh_char_idx","6")');
  ok(R('figHero(document.getElementById("player-avatar"),"atk",{once:true})')===false,'fig: figHero gir false uten bilder (emoji vises)');
  ok(R('figMon(document.getElementById("enemy-avatar"),1,"add10")')===false&&R('figBoss(document.getElementById("enemy-avatar"),1)')===false,'fig: figMon/figBoss gir false uten bilder');
  let threw=null;try{R('updatePlayerEmoji();renderHUD();buildCharGrid&&0;figWarmNext();figSetting();figStory()');}catch(e){threw=e.message;}
  ok(!threw,'fig: krokene tåler at figurene er av: '+threw);

  // ---- 5) Rangen faller tilbake til lavere rang, og til slutt emoji ----
  R('FIG["h-test-r0"]={kind:"hero",key:"test",rank:0,size:192,anims:{idle:{n:12,ms:1600}}};FIG["h-test-r2"]={kind:"hero",key:"test",rank:2,size:192,anims:{idle:{n:12,ms:1600}}}');
  ok(R('figHeroId(1,"test")')==='h-test-r0'&&R('figHeroId(4,"test")')==='h-test-r2'&&R('figHeroId(2,"test")')==='h-test-r2','fig: figHeroId faller tilbake til høyeste rang som finnes');
  ok(R('figHeroId(0,"ingen")')===null,'fig: ukjent helt gir null (emoji)');
  ok(R('figHeroKey(6)')==='dragon'&&R('figHeroKey(7)')==='dino'&&R('figHeroKey(9)')==='astro','fig: CHARS-indeks gir riktig helt (⚡ → Lyn-dinoen, 🚀 → Rakett-astronauten)');
  R('delete FIG["h-test-r0"];delete FIG["h-test-r2"]');

  // ---- 6) Køen: ingenting før start, prioritet først, høyst 2 samtidige, og saveData slår av alt ----
  const made=[];
  ctx.Image=function(){const im={};made.push(im);return im;};
  const body=ctx.document.body;ctx.document.body={};const nav=ctx.navigator;ctx.navigator={connection:{saveData:false,effectiveType:'4g'}};
  try{
    R('FIG_Q=[];FIG_RUN=0;FIG_GO=false;for(const k in FIG_IMG)delete FIG_IMG[k]');
    ok(R('figOn()')===true,'kø: figurene er på med Image og body');
    R('figWarm(["a.webp","b.webp"],2);figWarm(["c.webp"],1);figWarm(["d.webp"],0)');
    ok(made.length===0,'kø: ingenting lastes før figStart (load + requestIdleCallback)');
    R('figWarm(["b.webp"],0)'); // høyere prioritet for en som alt står i kø
    R('figStart()');
    ok(made.length===2,`kø: høyst 2 samtidige nedlastinger (${made.length})`);
    ok(made[0].src==='b.webp'&&made[1].src==='d.webp',`kø: prioritet 0 først, i rekkefølge (${made.map(m=>m.src)})`);
    made[0].onload();ok(made.length===3&&made[2].src==='c.webp','kø: neste (prioritet 1) starter når én er ferdig');
    made[1].onerror();ok(made.length===4&&made[3].src==='a.webp','kø: en feil slipper også neste til');
    ok(R('FIG_IMG["b.webp"]')===true&&R('FIG_IMG["d.webp"]')===false,'kø: husker lastet og feilet');
    R('figWarm(["b.webp","d.webp"],0)');ok(made.length===4,'kø: lastet eller feilet hentes ikke på nytt');
    ctx.navigator={connection:{saveData:true}};ok(R('figOn()')===false&&R('figWarm(["e.webp"],0)')===0,'kø: saveData gir bare emoji, ingenting lastes');
    ctx.navigator={connection:{effectiveType:'2g'}};ok(R('figOn()')===false,'kø: 2G gir bare emoji');
    ctx.navigator={connection:{effectiveType:'4g'}};
    R('setSetting("fig","emoji")');ok(R('figOn()')===false,'kø: innstillingen «emoji» slår av figurene');
    R('setSetting("fig","3d")');ok(R('figOn()')===true,'kø: innstillingen «3D» slår dem på igjen');
  }finally{delete ctx.Image;ctx.document.body=body;ctx.navigator=nav;R("FIG_Q=[];FIG_RUN=0;FIG_GO=false;for(const k in FIG_IMG)delete FIG_IMG[k]");}

  // ---- 7) Foreldreinnstillingen «Figurer: 3D / emoji» ----
  ls.clear();
  ok(R('parSet("fig","emoji")')===true&&R('getSetting("fig")')==='emoji','innst: parSet lagrer fig=emoji');
  ok(R('parSet("fig","3d")')===true&&R('getSetting("fig")')==='3d','innst: parSet lagrer fig=3d');
  ok(R('parSet("fig","rar")')===false&&R('getSetting("fig")')==='3d','innst: ugyldig verdi avvises');
  ok(/Figurer/.test(R('parFigHTML()'))&&/par-fig-emoji/.test(R('parFigHTML()')),'innst: foreldresiden viser «Figurer: 3D / emoji»');
  ls.clear();
};
