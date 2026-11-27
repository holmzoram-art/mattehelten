// Mattehelten – synker figurbilder inn i img/fig/ og bygger js/figdata.js (registeret som js/figures.js leser).
// Bruk (fra repo-roten):
//   node tools/figsync.js                      bygg js/figdata.js på nytt fra img/fig/manifest.json og filene i img/fig/
//   node tools/figsync.js --boss <mappe>       hent <mappe>/boss.json + <id>-<anim>.webp (bosser, produsent C)
//   node tools/figsync.js --heroes <mappe>     hent <mappe>/parts/*.json + <mappe>/out/*.webp (helter, produsent A)
//   node tools/figsync.js --flat <mappe>       hent <mappe>/out/manifest.json + filene (monstre, venner, pets, historie; produsent B)
// Ny figur for hånd: kopier filene til img/fig/ som <id>-<anim>.webp (stillbilde: <id>-idle.webp), legg figuren inn i
// img/fig/manifest.json (se «about» der) og kjør skriptet. Versjonen (?v=) er en hash av filinnholdet, så filene kan caches for alltid.
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const ROOT=path.join(__dirname,'..'),DIR=path.join(ROOT,'img','fig'),MAN=path.join(DIR,'manifest.json'),OUT=path.join(ROOT,'js','figdata.js');
// Vekttak (byte) per fil – de samme takene sjekkes i tests/figures.test.js
const CAP={hero:60000,boss:130000,still:35000,poster:15000,atlas:70000};
const ABOUT='figs.<id>: {kind:"boss"|"hero"|"mon"|"still", size:<px per ramme>, anims:{<navn>:{n:<rammer>,ms:<varighet>,loop?:true}}, '+
  'poster?:true (fil <id>-poster.webp), head?:{x,y} (hodet, andel av rammen), top?:{x,y} (toppen av hodet), key?/rank? (helt), tid? (temaets monster)}. '+
  'Fil per animasjon: <id>-<navn>.webp (vannrett stripe med n kvadratiske rammer; n=1 er stillbilde). '+
  'atlas.<s|p|h>: {file, cell:<px>, items:{<nøkkel>:[x,y]}} – s = venner (SIDEKICKS-indeks), p = pets (PG_ITEMS-id), h = helteplakater (heltens key). '+
  'files fylles av tools/figsync.js: {v:<hash>, bytes}.';
const args=process.argv.slice(2),arg=k=>{const i=args.indexOf(k);return i>=0?args[i+1]:null;};
fs.mkdirSync(DIR,{recursive:true});
const man=fs.existsSync(MAN)?JSON.parse(fs.readFileSync(MAN,'utf8')):{};
man.about=ABOUT;man.figs=man.figs||{};man.atlas=man.atlas||{};
const log=[];
const copy=(src,name)=>{if(!fs.existsSync(src)){log.push('MANGLER '+src);return false;}fs.copyFileSync(src,path.join(DIR,name));return true;};
const rd=f=>JSON.parse(fs.readFileSync(f,'utf8'));
// Over vekttaket: hent ikke (en eldre godkjent versjon i img/fig/ blir stående); produsenten må lage en lettere fil
const over=(files,cap,id)=>{const big=files.filter(f=>fs.existsSync(f)&&fs.statSync(f).size>cap);if(big.length)log.push(`OVER VEKTTAK, ikke hentet: ${id} (${big.map(f=>path.basename(f)+' '+fs.statSync(f).size+' B').join(', ')} > ${cap})`);return big.length>0;};
const pick=(o,ks)=>{const r={};ks.forEach(k=>{if(o&&o[k]!=null)r[k]=o[k];});return r;};

// ---- Bosser (produsent C): boss.json {figs:{troll:{kind:'boss',size,anims:{idle:{n,ms}}}}} + <id>-<anim>.webp
const boss=arg('--boss');
if(boss){const b=rd(path.join(boss,'boss.json'));
  for(const[id,f]of Object.entries(b.figs||{})){if(over(Object.keys(f.anims||{}).map(a=>path.join(boss,`${id}-${a}.webp`)),CAP.boss,id))continue;let ok=true;for(const a of Object.keys(f.anims||{}))ok=copy(path.join(boss,`${id}-${a}.webp`),`${id}-${a}.webp`)&&ok;
    if(ok){man.figs[id]=Object.assign({kind:'boss'},f);log.push('boss '+id);}}}

// ---- Helter (produsent A): parts/h-<key>-r<rang>.json {key,rank,size,anims:{idle:{file,n,ms,loop}},poster:{file},head,top} + out/<file>
const heroes=arg('--heroes');
if(heroes&&fs.existsSync(path.join(heroes,'parts'))){
  for(const pf of fs.readdirSync(path.join(heroes,'parts')).filter(f=>/^h-[a-z]+-r\d\.json$/.test(f))){
    const p=rd(path.join(heroes,'parts',pf)),id=pf.replace(/\.json$/,''),anims={};let ok=true;
    if(over(Object.values(p.anims||{}).filter(x=>x&&x.file).map(x=>path.join(heroes,'out',x.file)),CAP.hero,id))continue;
    for(const[a,x]of Object.entries(p.anims||{})){if(!x||!x.file)continue;if(copy(path.join(heroes,'out',x.file),`${id}-${a}.webp`))anims[a]=pick(x,['n','ms','loop']);else ok=false;}
    if(!anims.idle||!ok){log.push('helt venter (mangler filer) '+id);continue;}
    const f={kind:'hero',key:p.key||id.split('-')[1],rank:+(p.rank||0),size:p.size||192,anims};
    if(p.poster&&p.poster.file&&copy(path.join(heroes,'out',p.poster.file),`${id}-poster.webp`))f.poster=true;
    if(p.head)f.head=p.head;if(p.top)f.top=p.top;
    man.figs[id]=f;log.push('helt '+id);}
  const ha=path.join(heroes,'out','h-atlas.json'); // valgfritt plakat-atlas fra A: {file,cell,items:{key:[x,y]}}
  if(fs.existsSync(ha)){const a=rd(ha);if(copy(path.join(heroes,'out',a.file),'h-atlas.webp')){man.atlas.h={file:'h-atlas.webp',cell:a.cell||128,items:a.items||{}};log.push('helteplakater (atlas)');}}
}

// ---- 2D (produsent B): out/manifest.json {monsters:{tid:{id,idle,au}}, sidekicks:{atlas,items:[{idx,x,y}]}, pets:{atlas,items:[{pid,x,y}]}, story:{id:{file}}}
const flat=arg('--flat');
if(flat&&fs.existsSync(path.join(flat,'out','manifest.json'))){
  const o=path.join(flat,'out'),m=rd(path.join(o,'manifest.json'));
  for(const[tid,x]of Object.entries(m.monsters||{})){const id=x.id||('m-'+tid),anims={};if(over([x.idle,x.au].filter(Boolean).map(f=>path.join(o,f)),CAP.still,id))continue;
    if(x.idle&&copy(path.join(o,x.idle),`${id}-idle.webp`))anims.idle={n:1};
    if(x.au&&copy(path.join(o,x.au),`${id}-au.webp`))anims.au={n:1};
    if(anims.idle){man.figs[id]={kind:'mon',tid,size:x.size||256,anims};log.push('monster '+id);}}
  for(const[id,x]of Object.entries(m.story||{}))if(x.file&&copy(path.join(o,x.file),`${id}-idle.webp`)){man.figs[id]={kind:'still',size:x.size||256,anims:{idle:{n:1}}};log.push('historie '+id);}
  for(const[k,g,f]of[['s','sidekicks','idx'],['p','pets','pid']]){const G=m[g];if(!G||!G.atlas||!G.atlas.file)continue;
    const name=k+'-atlas.webp';if(!copy(path.join(o,G.atlas.file),name))continue;
    const items={};(G.items||[]).forEach(it=>{if(it[f]!=null)items[String(it[f])]=[it.x||0,it.y||0];});
    man.atlas[k]={file:name,cell:G.cell||128,w:G.atlas.w,h:G.atlas.h,items};log.push(`${g} (atlas, ${Object.keys(items).length})`);}
}

// ---- Bygg: sjekk at filene finnes, regn ut versjon og vekt, skriv manifest og js/figdata.js
const files={},warn=[];
const add=(name,cap)=>{const p=path.join(DIR,name);if(!fs.existsSync(p))return false;const b=fs.readFileSync(p);
  files[name]={v:crypto.createHash('sha1').update(b).digest('hex').slice(0,8),bytes:b.length};if(cap&&b.length>cap)warn.push(`${name} ${b.length} B > tak ${cap}`);return true;};
for(const[id,f]of Object.entries(man.figs)){
  const cap=f.kind==='hero'?CAP.hero:f.kind==='boss'?CAP.boss:CAP.still;
  for(const a of Object.keys(f.anims||{}))if(!add(`${id}-${a}.webp`,cap)){warn.push(`mangler ${id}-${a}.webp (fjernet)`);delete f.anims[a];}
  if(f.poster&&!add(`${id}-poster.webp`,CAP.poster)){warn.push(`mangler ${id}-poster.webp`);delete f.poster;}
  if(!f.anims||!f.anims.idle){warn.push(`${id} har ingen idle (fjernet)`);delete man.figs[id];}
}
for(const[k,a]of Object.entries(man.atlas))if(!add(a.file,CAP.atlas)){warn.push('mangler '+a.file);delete man.atlas[k];}
man.files=files;
fs.writeFileSync(MAN,JSON.stringify(man,null,1)+'\n');
const data={figs:man.figs,atlas:man.atlas,files:Object.fromEntries(Object.entries(files).map(([k,x])=>[k,x.v]))};
fs.writeFileSync(OUT,'// GENERERT av tools/figsync.js fra img/fig/manifest.json – ikke rediger for hånd (kjør node tools/figsync.js).\n'+
  '// Registeret for figurene (js/figures.js): figs, atlas og files (filnavn -> versjon).\nconst FIG_DATA='+JSON.stringify(data)+';\n');
const tot=Object.values(files).reduce((t,x)=>t+x.bytes,0);
console.log(log.join('\n')||'(ingen kilder)');if(warn.length)console.log('ADVARSEL:\n  '+warn.join('\n  '));
console.log(`${Object.keys(man.figs).length} figurer, ${Object.keys(man.atlas).length} atlas, ${Object.keys(files).length} filer, ${Math.round(tot/1024)} KB -> img/fig/manifest.json + js/figdata.js`);
