// Mattehelten – Lær-guider og navigasjon
// Alle js-filer deler globalt navnerom (vanlige <script>-tagger i fast rekkefølge, se index.html).

// ============================================================
// LEARN GUIDES
// ============================================================
function dots(n,color,delay=0){return Array.from({length:n},(_,i)=>`<div class="dot" style="background:${color};animation-delay:${delay+i*40}ms"></div>`).join('');}
function dotGroup(n,color,delay=0){return `<div class="dot-group">${dots(n,color,delay)}</div>`;}
function numLine(from,to,jump,start){
  const total=to-from,w=280;
  let html=`<div class="nline-wrap"><div class="nline" style="min-width:${w+20}px"><div class="nline-track"></div>`;
  for(let i=from;i<=to;i++){const x=10+(i-from)/total*w;html+=`<div class="nline-tick" style="left:${x}px"></div><div class="nline-num" style="left:${x}px">${i}</div>`;}
  html+=`<div class="nline-dot" style="left:${10+(start-from)/total*w}px"></div>`;
  if(jump){const x1=10+(start-from)/total*w,x2=10+(start+jump-from)/total*w;html+=`<div class="nline-arrow" style="left:${Math.min(x1,x2)}px;--w:${Math.abs(x2-x1)}px"></div><div class="nline-dot" style="left:${x2}px;background:var(--green)"></div>`;}
  return html+'</div></div>';
}
function fracBar(num,den,color='#7c3aed'){
  return `<div class="frac-bar">${Array.from({length:den},(_,i)=>`<div class="frac-seg ${i<num?'filled':'empty'}" style="background:${color}"></div>`).join('')}</div><div style="text-align:center;margin-top:6px;font-family:'Fredoka One',cursive;font-size:.9rem;color:var(--white)">${num}/${den} er farget</div>`;
}
function mulGridLabel(rows,cols,color='#00ff88'){
  let h=`<div class="mul-grid" style="grid-template-columns:repeat(${cols},26px)">`;
  for(let r=0;r<rows;r++)for(let c=0;c<cols;c++)h+=`<div class="mul-cell" style="background:${color}22;border:1px solid ${color}44;animation-delay:${(r*cols+c)*30}ms">●</div>`;
  return h+`</div><div style="text-align:center;margin-top:8px;font-family:'Fredoka One',cursive;font-size:.9rem;color:var(--muted)">${rows} · ${cols} = ${rows*cols}</div>`;
}
function workedEx(steps){
  return `<div class="worked">${steps.map(([txt,ann,hl],i)=>`<div class="step ${hl?'hl':''}" style="animation-delay:${i*200}ms"><span>${txt}</span>${ann?`<span class="ann">${ann}</span>`:''}</div>`).join('')}</div>`;
}
function eqBox(txt){return `<div class="eq-box">${txt}</div>`;}
// Tierramme: a prikker i farge 1, b i farge 2 (flere rammer hvis over 10)
function tenFrame(a,b=0,c1='#7c3aed',c2='#00ff88'){
  let h='<div class="tf-wrap">';
  for(let f=0;f<Math.max(1,Math.ceil((a+b)/10));f++){h+='<div class="tf">';for(let i=f*10;i<f*10+10;i++){const c=i<a?c1:i<a+b?c2:'';h+=`<div class="tf-cell">${c?`<div class="dot" style="background:${c};animation-delay:${i*50}ms"></div>`:''}</div>`;}h+='</div>';}
  return h+'</div>';
}
// Tallrekke med hopp-merker mellom boksene; hl = indeks som utheves
function seqHops(ts,lbl,hl=-1){return `<div class="seq-row">${ts.map((t,i)=>`${i?`<span class="seq-hop">${lbl}</span>`:''}<span class="seq-box${i===hl?' hl':''}" style="animation-delay:${i*150}ms">${t}</span>`).join('')}</div>`;}
function pills(arr,c='#00ff88'){return `<div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center">${arr.map((t,i)=>`<div style="background:${c}1a;border:1px solid ${c}55;border-radius:8px;padding:5px 10px;font-family:'Fredoka One',cursive;font-size:.95rem;color:var(--white);animation:dotPop .3s ease ${i*80}ms backwards">${t}</div>`).join('')}</div>`;}
function capLine(t){return `<div style="text-align:center;margin-top:8px;font-family:'Fredoka One',cursive;font-size:1.05rem;color:var(--white)">${t}</div>`;}
function rectFig(w,h){const u=24,lb=t=>`<div style="font-family:'Fredoka One',cursive;color:var(--gold)">${t}</div>`;return `<div style="display:inline-flex;flex-direction:column;align-items:center;gap:4px">${lb(w)}<div style="display:flex;align-items:center;gap:6px">${lb(h)}<div style="width:${w*u}px;height:${h*u}px;border:3px solid var(--cyan);border-radius:4px;box-shadow:var(--glow-c)"></div>${lb(h)}</div>${lb(w)}</div>`;}
function grn(t){return `<span style="color:var(--green)">${t}</span>`;}
// Emoji-rad: n stk e; gone = de siste som er tatt bort (bleke)
function emoRow(n,e,gone=0){return `<span class="emo-row">${e.repeat(n-gone)}${gone?`<span class="emo-gone">${e.repeat(gone)}</span>`:''}</span>`;}

const LEARN_GUIDES={
  add10:[
    {icon:'➕',title:'Slå sammen!',text:'Frosken har 3 epler. Uglen har 2. Hvor mange har de til sammen? 🍎',
     visual:`<div class="dot-groups">${emoRow(3,'🍎')} <span class="dot-op">+</span> ${emoRow(2,'🍎')} <span class="dot-eq">=</span> ${emoRow(5,'🍎')}</div>`+capLine(`3 + 2 = ${grn('5')}`)},
    {icon:'🐸',title:'Hopp på tallinja',text:'Start på det første tallet. Hopp fremover like mange ganger som det andre tallet.',
     visual:numLine(0,10,3,4)+capLine(`4 + 3: Start på 4, hopp 3 → ${grn('7')}`)},
    {icon:'🎯',title:'Din tur!',text:'Start på 6 og tell 4 fremover.',ask:{q:'6 + 4 = ?',ans:10},pre:numLine(0,10,0,6),
     visual:workedEx([['6 + 4 = ?','',false],['Start på 6','',false],['7, 8, 9, 10','(tell 4 fremover)',true],['6 + 4 = 10 ✓','',false]])}
  ],
  sub10:[
    {icon:'➖',title:'Trollet tar!',text:'Du har 5 kjeks. Trollet tar 2. Hvor mange er igjen? 🍪',
     visual:`<div class="dot-groups">${emoRow(5,'🍪',2)} <span class="dot-eq">=</span> ${emoRow(3,'🍪')}</div>`+capLine(`5 - 2 = ${grn('3')}`)},
    {icon:'🐸',title:'Hopp bakover',text:'Start på det store tallet. Hopp bakover på tallinja.',
     visual:numLine(0,10,-3,7)+capLine(`7 - 3 = ${grn('4')}`)},
    {icon:'🎯',title:'Din tur!',text:'Start på 8 og tell 5 bakover.',ask:{q:'8 - 5 = ?',ans:3},pre:numLine(0,10,0,8),
     visual:workedEx([['8 - 5 = ?','',false],['Start på 8','',false],['7, 6, 5, 4, 3','(tell 5 bakover)',true],['8 - 5 = 3 ✓','',false]])}
  ],
  ten1:[
    {icon:'🤝',title:'Tallene som holder hender',text:'Tallet 7 vil bli 10. Det trenger en venn: 3! To tall som blir 10 sammen, er tiervenner.',
     visual:tenFrame(7,3)+capLine(`7 + 3 = ${grn('10')}`)},
    {icon:'🔍',title:'Tell de tomme rutene',text:'Det er plass til 10. De tomme rutene viser hvor mange som mangler.',
     visual:tenFrame(6)+capLine(`6 + ? = 10 → 4 tomme ruter → ${grn('4')}`)},
    {icon:'🖐️',title:'Bruk fingrene',text:'Vis 10 fingre. Bøy ned 6. Hvor mange står igjen? Det er tiervennen!',
     visual:`<div style="font-size:2.4rem">🖐️🖐️</div>`+capLine(`10 - 6 = ${grn('4')}`)},
    {icon:'📋',title:'Alle tiervennene',text:'Lær dem utenat. Da blir du lynrask! ⚡',
     visual:pills(['1 + 9','2 + 8','3 + 7','4 + 6','5 + 5'],'#ffd93d')},
    {icon:'🎯',title:'Din tur!',text:'Hvor mange mangler fra 8 til 10?',ask:{q:'8 + ? = 10',ans:2},pre:tenFrame(8),
     visual:workedEx([['8 + ? = 10','',false],['9, 10','(2 hopp)',true],['8 + 2 = 10 ✓','',false]])}
  ],
  seq1:[
    {icon:'🐸',title:'Frosken hopper',text:'Frosken hopper like langt hver gang. Hvor lander den nå?',
     visual:seqHops([2,4,6,8,'?'],'+2',4)+capLine(`Hoppet er 2. Etter 8 kommer ${grn('10')}`)},
    {icon:'🦘',title:'Små og store hopp',text:'Noen hopper 1. Noen hopper 5. Noen hopper hele 10!',
     visual:seqHops([5,6,7,8],'+1')+'<div style="height:8px"></div>'+seqHops([5,10,15,20],'+5')+'<div style="height:8px"></div>'+seqHops([10,20,30,40],'+10')},
    {icon:'🚀',title:'Nedtelling!',text:'Raketten teller ned. Da blir tallene mindre.',
     visual:seqHops([9,8,7,'?'],'−1',3)+capLine(`Etter 7 kommer ${grn('6')}. 🚀`)},
    {icon:'🎯',title:'Din tur!',text:'Finn hoppet først. Hopp så videre.',ask:{q:'10, 20, ?, 40',ans:30},
     visual:workedEx([['10, 20, ?, 40','',false],['Hoppet er 10','(10 → 20)',true],['20 + 10 = 30','',true],['Svaret er 30 ✓','',false]])}
  ],
  add20:[
    {icon:'🔟',title:'Fyll opp tieren',text:'Blir det mer enn 10? Fyll opp til 10 først. Legg så til resten.',
     visual:tenFrame(8,5)+capLine(`8 + 2 = 10, og 3 til = ${grn('13')}`)},
    {icon:'✂️',title:'Del opp tallene',text:'Del opp i tiere og enere. Legg sammen enerne først.',
     visual:workedEx([['13 + 5 = ?','',false],['13 = 10 + 3','(del opp 13)',true],['3 + 5 = 8','(enerne)',true],['10 + 8 = 18 ✓','',false]])},
    {icon:'🎯',title:'Din tur!',text:'Bruk tiervennen til 9. Fyll opp til 10 først.',ask:{q:'9 + 6 = ?',ans:15},pre:tenFrame(9,6),
     visual:workedEx([['9 + 6 = ?','',false],['9 + 1 = 10','(fyll opp tieren)',true],['Det er 5 igjen av 6','',false],['10 + 5 = 15 ✓','',false]])}
  ],
  add100:[
    {icon:'✂️',title:'Tiere og enere',text:'Del opp begge tallene. Tiere for seg, enere for seg.',
     visual:workedEx([['34 + 25 = ?','',false],['30 + 20 = 50','(tierne)',true],['4 + 5 = 9','(enerne)',true],['50 + 9 = 59 ✓','',false]])},
    {icon:'🎯',title:'Over tieren',text:'Blir enerne mer enn 10? Da får du en ny tier!',
     visual:workedEx([['47 + 6 = ?','',false],['7 + 6 = 13','(enerne)',true],['40 + 13 = 53 ✓','',false]])},
    {icon:'🎯',title:'Din tur!',text:'Ta tierne for seg og enerne for seg.',ask:{q:'23 + 14 = ?',ans:37},
     visual:workedEx([['23 + 14 = ?','',false],['20 + 10 = 30','(tierne)',true],['3 + 4 = 7','(enerne)',true],['30 + 7 = 37 ✓','',false]])}
  ],
  sub100:[
    {icon:'🐸',title:'Ta tierne først',text:'Hopp ned tierne først. Hopp så ned enerne.',
     visual:workedEx([['52 - 17 = ?','',false],['52 - 10 = 42','(tierne)',true],['42 - 7 = 35','(enerne)',true],['52 - 17 = 35 ✓','',false]])},
    {icon:'🔄',title:'Hopp via tieren',text:'Gå ned til nærmeste tier først. Ta så resten.',
     visual:workedEx([['42 - 7 = ?','',false],['42 - 2 = 40','(ned til tieren)',true],['40 - 5 = 35','(resten)',true],['= 35 ✓','',false]])},
    {icon:'🎯',title:'Din tur!',text:'Ta tierne først. Ta så enerne.',ask:{q:'47 - 12 = ?',ans:35},
     visual:workedEx([['47 - 12 = ?','',false],['47 - 10 = 37','(tierne)',true],['37 - 2 = 35','(enerne)',true],['47 - 12 = 35 ✓','',false]])}
  ],
  miss2:[
    {icon:'🕵️',title:'Bli tall-detektiv!',text:'Spørsmålstegnet gjemmer et tall. Kan du finne det?',
     visual:`<div class="dot-groups">${dotGroup(5,'#7c3aed')} <span class="dot-op">+</span> <span style="font-family:'Fredoka One',cursive;font-size:1.6rem;color:var(--gold)">?</span> <span class="dot-eq">=</span> ${dotGroup(8,'#00ff88',200)}</div>`+capLine('5 + ? = 8')},
    {icon:'🐸',title:'Tell opp',text:'Start på tallet du har. Hopp opp til svaret og tell hoppene.',
     visual:numLine(0,10,3,5)+capLine(`Fra 5 til 8 er det 3 hopp. 5 + ${grn('3')} = 8`)},
    {icon:'🔄',title:'Regn baklengs',text:'Du kan også bruke minus for å finne tallet.',
     visual:workedEx([['? + 4 = 9','',false],['9 - 4 = 5','(regn baklengs)',true],['5 + 4 = 9 ✓','(sjekk)',false]])},
    {icon:'🍦',title:'Din tur!',text:'Du har 46 kr. En is koster 50 kr. Hvor mye mangler du?',ask:{q:'46 + ? = 50',ans:4},pre:numLine(45,50,0,46),
     visual:workedEx([['46 + ? = 50','',false],['47, 48, 49, 50','(4 hopp)',true],['46 + 4 = 50 ✓','',false]])}
  ],
  dbl2:[
    {icon:'👯',title:'Tvillingtall',text:'Dobbelt betyr to like mange. Dobbelt av 4 er 4 + 4.',
     visual:`<div class="dot-groups">${dotGroup(4,'#f093fb')} <span class="dot-op">+</span> ${dotGroup(4,'#f093fb',160)} <span class="dot-eq">=</span> ${dotGroup(8,'#00ff88',320)}</div>`+capLine(`Dobbelt av 4 = ${grn('8')}`)},
    {icon:'🍪',title:'Del likt med en venn',text:'Halvparten betyr å dele i to like store deler.',
     visual:`<div class="dot-groups">${dotGroup(8,'#06d6ff')} <span class="dot-eq">→</span> ${dotGroup(4,'#00ff88',200)} <span class="dot-op">|</span> ${dotGroup(4,'#00ff88',360)}</div>`+capLine(`Halvparten av 8 = ${grn('4')}`)},
    {icon:'🔁',title:'De henger sammen',text:'Dobbelt av 6 er 12. Da er halvparten av 12 lik 6!',
     visual:pills(['6 → dobbelt → 12','12 → halvparten → 6'],'#f093fb')},
    {icon:'🎯',title:'Din tur!',text:'Ta tierne og enerne hver for seg.',ask:{q:'Dobbelt av 23 = ?',ans:46},
     visual:workedEx([['Dobbelt av 23','',false],['20 + 20 = 40','(tierne)',true],['3 + 3 = 6','(enerne)',true],['40 + 6 = 46 ✓','',false]])}
  ],
  mul25:[
    {icon:'✖️',title:'Like grupper',text:'Ganging er like grupper. 3 · 4 betyr 3 grupper med 4.',
     visual:`<div style="display:flex;flex-direction:column;align-items:center;gap:6px">${[0,1,2].map(i=>`<div style="display:flex;gap:4px">${dots(4,['#7c3aed','#a855f7','#06d6ff'][i],i*100)}</div>`).join('')}</div>`+capLine(`3 · 4 = 4 + 4 + 4 = ${grn('12')}`)},
    {icon:'⭐',title:'2-, 5- og 10-gangen',text:'5-gangen slutter alltid på 0 eller 5. 10-gangen: bare legg til en 0!',
     visual:`<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px">${[2,5,10].map(t=>`<div><div style="font-family:'Fredoka One',cursive;font-size:.85rem;color:var(--gold);margin-bottom:4px">${t}-gangen</div>${[1,2,3,4].map(n=>`<div style="font-size:.8rem;font-weight:800;color:var(--white)">${n} · ${t} = ${n*t}</div>`).join('')}</div>`).join('')}</div>`},
    {icon:'🖐️',title:'Din tur!',text:'4 hender med 5 fingre. Hvor mange fingre?',ask:{q:'4 · 5 = ?',ans:20},pre:'<div style="font-size:2rem">🖐️🖐️🖐️🖐️</div>',
     visual:workedEx([['4 · 5 = ?','',false],['= 5 + 5 + 5 + 5','(fire 5-ere)',true],['= 10 + 10','',true],['= 20 ✓','',false]])}
  ],
  mul15:[
    {icon:'📋',title:'Gangetabellen 1–5',text:'Gangetabellen er et fast mønster. La oss lære den!',
     visual:mulGridLabel(3,4,'#00ff88')},
    {icon:'🔢',title:'3-gangen',text:'Tell opp i tresteg: 3, 6, 9, 12, 15 …',
     visual:`<div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center">${[1,2,3,4,5].map(n=>`<div style="background:rgba(0,255,136,.1);border:1px solid rgba(0,255,136,.3);border-radius:8px;padding:5px 10px;font-family:'Fredoka One',cursive;font-size:.9rem">${n} · 3 = ${n*3}</div>`).join('')}</div>`},
    {icon:'🎯',title:'Prøv 4 · 4',text:'',
     visual:workedEx([['4 · 4 = ?','',false],['4 + 4 + 4 + 4','(fire 4-ere)',true],['= 16 ✓','',false]])}
  ],
  div25:[
    {icon:'➗',title:'Deling er omvendt ganging',text:'12 : 3 = ? Tenk: ? · 3 = 12',
     visual:workedEx([['20 : 5 = ?','',false],['Tenk: ? · 5 = 20','(snu om!)',true],['4 · 5 = 20 ✓','',false],['20 : 5 = 4 ✓','',false]])}
  ],
  add100r:[
    {icon:'🔟',title:'Tell tiere',text:'Tenk på hver tier som en pakke. 30 + 40 er 3 tiere + 4 tiere.',
     visual:workedEx([['30 + 40 = ?','',false],['3 + 4 = 7','(tell tierne)',true],['7 tiere = 70 ✓','',false]])},
    {icon:'💯',title:'Hundrere',text:'Det samme gjelder hundrere. 200 + 500 er 2 + 5 = 7 hundrere.',
     visual:pills(['200 + 500 = 700','300 + 300 = 600','100 + 800 = 900'],'#06d6ff')},
    {icon:'🎯',title:'Prøv: 150 + 250',text:'Del opp i hundrere og tiere.',
     visual:workedEx([['150 + 250 = ?','',false],['100 + 200 = 300','(hundrere)',true],['50 + 50 = 100','(tiere)',true],['300 + 100 = 400 ✓','',false]])}
  ],
  mul110:[
    {icon:'📋',title:'Gangetabellen 1–10',text:'De vanskeligste: 6 · 7, 6 · 8, 7 · 8, 6 · 9, 7 · 9, 8 · 9',
     visual:`<div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center">${[[6,7],[6,8],[7,8],[6,9],[7,9],[8,9]].map(([a,b])=>`<div style="background:rgba(168,85,247,.15);border:1px solid rgba(168,85,247,.3);border-radius:8px;padding:6px 12px;font-family:'Fredoka One',cursive;font-size:.9rem">${a} · ${b} = ${a*b}</div>`).join('')}</div>`},
    {icon:'🧠',title:'Triks: del opp',text:'8 · 7 = 8 · 5 + 8 · 2 = 40 + 16 = 56',
     visual:workedEx([['8 · 7 = ?','',false],['= 8 · 5 + 8 · 2','(del opp 7)',true],['= 40 + 16','',false],['= 56 ✓','',false]])}
  ],
  div110:[
    {icon:'➗',title:'Deling med gangetabellen',text:'Kan du gangetabellen? Da kan du dele også!',
     visual:workedEx([['56 : 7 = ?','',false],['Tenk: ? · 7 = 56','',true],['8 · 7 = 56','',true],['= 8 ✓','',false]])}
  ],
  frac4:[
    {icon:'🍕',title:'Hva er en brøk?',text:'En brøk viser deler av en hel. 1/4 er én av fire like deler.',
     visual:`<div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap">${[[1,2,'#7c3aed'],[1,4,'#a855f7'],[1,3,'#06d6ff']].map(([n,d,c])=>`<div style="text-align:center"><div style="margin-bottom:6px">${fracBar(n,d,c)}</div></div>`).join('')}</div>`},
    {icon:'📐',title:'Finn brøkdelen av et tall',text:'1/2 = del på 2. 1/4 = del på 4. 1/3 = del på 3.',
     visual:workedEx([['1/4 av 20 = ?','',false],['Del 20 på 4','(nevneren er 4)',true],['20 : 4 = 5','',false],['= 5 ✓','',false]])}
  ],
  dec5:[
    {icon:'📏',title:'Desimaltall',text:'Kommaet skiller hele fra deler. Sett komma rett under komma!',
     visual:`<div style="font-family:'Fredoka One',cursive;font-size:1.1rem;text-align:right;background:rgba(255,255,255,.05);border-radius:10px;padding:12px 20px;border:1px solid rgba(255,255,255,.1)"><div>3<span style="color:var(--red)">,</span>4</div><div>+ 2<span style="color:var(--red)">,</span>1</div><div style="border-top:1px solid rgba(255,255,255,.2);margin-top:4px">5<span style="color:var(--red)">,</span>5 ✓</div></div>`},
    {icon:'🎯',title:'Prøv 4,6 + 2,3',text:'',
     visual:workedEx([['4,6 + 2,3 = ?','',false],['Enere: 4 + 2 = 6','',false],['Tideler: 6 + 3 = 9','',false],['= 6,9 ✓','',false]])}
  ],
  pct5:[
    {icon:'💯',title:'Hva er prosent?',text:'Prosent betyr hundredeler. 50 % er halvparten. 10 % er en tidel.',
     visual:`<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">${[[50,'Halvparten','#7c3aed'],[25,'En firedel','#a855f7'],[10,'En tidel','#06d6ff']].map(([p,n,c])=>`<div style="text-align:center"><div class="frac-bar" style="max-width:80px">${Array.from({length:10},(_,i)=>`<div class="frac-seg ${i<p/10?'filled':'empty'}" style="background:${c}"></div>`).join('')}</div><div style="font-family:'Fredoka One',cursive;font-size:.82rem;margin-top:4px">${p} % = ${n}</div></div>`).join('')}</div>`},
    {icon:'🎯',title:'Prøv 10 % av 350',text:'',
     visual:workedEx([['10 % av 350','',false],['10 % = del på 10','',true],['350 : 10 = 35 ✓','',false]])}
  ],
  round5:[
    {icon:'🎯',title:'Avrunding',text:'Se på neste siffer: 5 eller mer = rund opp. Under 5 = rund ned.',
     visual:workedEx([['Rund av 3,7','',false],['Tidelen er 7','',false],['7 ≥ 5 → rund OPP','',true],['= 4 ✓','',false]])}
  ],
  frac6:[
    {icon:'🥧',title:'Lik nevner',text:'Har brøkene lik nevner? Da regner du bare med tellerne.',
     visual:`<div style="display:flex;flex-direction:column;gap:6px">${fracBar(1,4,'#a855f7')}${fracBar(2,4,'#06d6ff')}</div>`+capLine(`1/4 + 2/4 = ${grn('3/4')}`)},
    {icon:'🔁',title:'Ulik nevner',text:'Gjør nevnerne like først. 1/2 er det samme som 2/4.',
     visual:`<div style="display:flex;flex-direction:column;gap:6px">${fracBar(1,2,'#7c3aed')}${fracBar(2,4,'#7c3aed')}</div>`},
    {icon:'🎯',title:'Prøv 1/2 + 1/4',text:'Fellesnevneren er 4.',
     visual:workedEx([['1/2 + 1/4 = ?','',false],['1/2 = 2/4','(fellesnevner 4)',true],['2/4 + 1/4 = 3/4 ✓','',false]])},
    {icon:'⌨️',title:'Slik svarer du',text:'Trykk / for å skrive en brøk, for eksempel 3/4. Du kan også svare 0,75. Lik brøk, som 6/8, er også riktig.',
     visual:eqBox('3/4 = 6/8 = 0,75')}
  ],
  geo6:[
    {icon:'🟦',title:'Omkrets',text:'Omkrets er veien rundt figuren. Legg sammen alle sidene.',
     visual:rectFig(5,3)+capLine(`5 + 3 + 5 + 3 = ${grn('16')}`)},
    {icon:'🧱',title:'Areal',text:'Areal er hvor mange ruter som får plass inni. Gang lengde med bredde.',
     visual:mulGridLabel(3,5,'#06d6ff')},
    {icon:'🎯',title:'Prøv: kvadrat med side 6',text:'Et kvadrat har fire like lange sider.',
     visual:workedEx([['Omkrets: 6 + 6 + 6 + 6','',false],['= 4 · 6 = 24','',true],['Areal: 6 · 6 = 36','',true]])}
  ],
  neg6:[
    {icon:'🌡️',title:'Tall under null',text:'Negative tall er mindre enn 0. Tenk på et termometer om vinteren: −5 grader.',
     visual:numLine(-5,5,0,-3)+capLine('−3 ligger 3 steg til venstre for 0')},
    {icon:'➡️',title:'Pluss: gå til høyre',text:'Når du legger til, går du til høyre på tallinja.',
     visual:numLine(-5,5,4,-3)+capLine(`−3 + 4 = ${grn('1')}`)},
    {icon:'⬅️',title:'Minus: gå til venstre',text:'Når du trekker fra, går du til venstre.',
     visual:numLine(-5,5,-6,2)+capLine(`2 − 6 = ${grn('−4')}`)},
    {icon:'⌨️',title:'Slik skriver du minus',text:'Trykk ± for å sette minus foran tallet.',
     visual:eqBox('−4')}
  ],
  alg7:[
    {icon:'🔍',title:'Algebra: finn x',text:'x er et ukjent tall. Vi løser gåten om hva x er.',
     visual:eqBox('x + 5 = 12 → x = ?')},
    {icon:'⚖️',title:'Vektprinsippet',text:'Gjør det samme på begge sider av likhetstegnet!',
     visual:workedEx([['x + 5 = 12','',false],['Trekk fra 5 på begge sider','',true],['x = 12 - 5 = 7 ✓','',false]])}
  ],
  ratio7:[
    {icon:'🧃',title:'Hva er forhold?',text:'Saft blandes ofte 1 : 4. Det betyr 1 del saft og 4 deler vann.',
     visual:`<div class="dot-groups">${dotGroup(1,'#ff6b35')} <span class="dot-op">:</span> ${dotGroup(4,'#06d6ff',100)}</div>`+capLine('1 del saft : 4 deler vann')},
    {icon:'✖️',title:'Gang begge med det samme',text:'Forholdet er det samme når du ganger begge tallene med samme tall.',
     visual:workedEx([['1 : 4 = 2 : 8','(· 2)',true],['1 : 4 = 3 : 12','(· 3)',true]])},
    {icon:'🎯',title:'Prøv 3 : 5 = 9 : ?',text:'',
     visual:workedEx([['3 · 3 = 9','(finn gangetallet)',true],['5 · 3 = 15','(gang med det samme)',true],['3 : 5 = 9 : 15 ✓','',false]])}
  ],
  stat7:[
    {icon:'📊',title:'Hva er gjennomsnitt?',text:'Gjennomsnitt er hvor mye hver får hvis vi deler likt.',
     visual:`<div class="dot-groups">${dotGroup(2,'#ffd93d')}${dotGroup(6,'#ffd93d',80)}${dotGroup(4,'#ffd93d',160)}</div><div style="font-size:1.3rem;margin:6px 0">⬇️</div><div class="dot-groups">${dotGroup(4,'#00ff88',300)}${dotGroup(4,'#00ff88',380)}${dotGroup(4,'#00ff88',460)}</div>`+capLine('2, 6 og 4 → 4, 4 og 4')},
    {icon:'🧮',title:'Slik regner du',text:'Legg sammen alle tallene. Del på hvor mange tall det er.',
     visual:workedEx([['2 + 6 + 4 = 12','(summen)',true],['Det er 3 tall','',false],['12 : 3 = 4 ✓','',false]])}
  ],
  eq8:[
    {icon:'⚖️',title:'Lineære likninger',text:'Flytt tallet uten x til høyre side. Del så på tallet foran x.',
     visual:workedEx([['2x + 3 = 11','',false],['2x = 11 - 3 = 8','(trekk fra 3)',true],['x = 8 : 2 = 4 ✓','(del på 2)',true]])}
  ],
  pow8:[
    {icon:'🚀',title:'Potenser',text:'3² = 3 · 3 = 9. Eksponenten sier hvor mange ganger vi ganger tallet med seg selv.',
     visual:`<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">${[[2,2],[2,3],[3,2],[4,2]].map(([b,e])=>`<div style="background:rgba(255,217,61,.1);border:1px solid rgba(255,217,61,.3);border-radius:8px;padding:6px 12px;font-family:'Fredoka One',cursive">${b}${sup(e)} = ${Math.pow(b,e)}</div>`).join('')}</div>`}
  ],
  pct8:[
    {icon:'🏷️',title:'Prosent av et tall',text:'10 % er en tidel. Finn 10 % først, og bygg videre.',
     visual:workedEx([['20 % av 300','',false],['10 % = 300 : 10 = 30','',true],['20 % = 2 · 30 = 60 ✓','',false]])},
    {icon:'📈',title:'Øke med prosent',text:'Øker et tall med 20 %, får du 120 % av tallet. Gang med 1,2.',
     visual:workedEx([['500 økes med 20 %','',false],['500 · 1,2 = 600 ✓','',true]])},
    {icon:'📉',title:'Minke med prosent',text:'Reduseres et tall med 25 %, er 75 % igjen. Gang med 0,75.',
     visual:workedEx([['400 reduseres med 25 %','',false],['400 · 0,75 = 300 ✓','',true]])}
  ],
  pyth9:[
    {icon:'📐',title:'Pytagoras',text:'I en rettvinklet trekant er a² + b² = c². c er den lengste siden.',
     visual:`<div style="text-align:center"><div style="font-family:'Fredoka One',cursive;font-size:1.3rem;color:var(--cyan)">a² + b² = c²</div><div style="font-size:3rem;margin:10px 0">📐</div></div>`},
    {icon:'🎯',title:'a = 3, b = 4 → c = ?',text:'',
     visual:workedEx([['c² = 3² + 4²','',false],['= 9 + 16 = 25','',true],['c = √25 = 5 ✓','',false]])}
  ],
  stat9:[
    {icon:'📏',title:'Median',text:'Sorter tallene. Medianen er tallet i midten. Er det to i midten, tar du gjennomsnittet av dem.',
     visual:workedEx([['7, 2, 9, 4, 5','',false],['2, 4, 5, 7, 9','(sortert)',true],['Median = 5 ✓','',false]])},
    {icon:'🔁',title:'Typetall',text:'Typetallet er tallet som kommer flest ganger.',
     visual:workedEx([['3, 5, 3, 8, 3, 5','',false],['3 kommer 3 ganger','',true],['Typetall = 3 ✓','',false]])},
    {icon:'↔️',title:'Variasjonsbredde',text:'Ta det største tallet minus det minste.',
     visual:workedEx([['4, 12, 7, 2','',false],['12 − 2 = 10','(størst − minst)',true],['Variasjonsbredde = 10 ✓','',false]])}
  ],
  alg9:[
    {icon:'🧩',title:'To likninger',text:'Legg likningene sammen. Da forsvinner y!',
     visual:workedEx([['x + y = 10','',false],['x − y = 4','',false],['2x = 14','(legg sammen)',true],['x = 7 ✓','',false]])},
    {icon:'🔲',title:'Kvadratrot',text:'x² = 49 betyr: hvilket tall ganger seg selv blir 49? Her bruker vi det positive svaret.',
     visual:workedEx([['x² = 49','',false],['7 · 7 = 49','',true],['x = 7 ✓','',false]])},
    {icon:'📦',title:'Parenteser',text:'Del på tallet foran parentesen først.',
     visual:workedEx([['3(x + 2) = 21','',false],['x + 2 = 7','(del på 3)',true],['x = 5 ✓','',false]])}
  ],
  func10:[
    {icon:'⚙️',title:'Funksjoner',text:'f(x) er en maskin: putt inn x, og få ut et tall.',
     visual:`<div style="font-family:'Fredoka One',cursive;text-align:center"><div style="font-size:1.1rem;margin-bottom:10px">f(x) = 2x + 3</div><div style="display:flex;gap:6px;justify-content:center;flex-wrap:wrap">${[1,2,3,4].map(x=>`<div style="background:rgba(255,217,61,.1);border:1px solid rgba(255,217,61,.3);border-radius:8px;padding:5px 10px;font-size:.88rem">f(${x}) = ${2*x+3}</div>`).join('')}</div></div>`},
    {icon:'🎯',title:'Prøv f(x) = 3x − 2, f(4) = ?',text:'',
     visual:workedEx([['f(4) = 3 · 4 − 2','',false],['= 12 − 2','',false],['= 10 ✓','',false]])}
  ],
  trig10:[
    {icon:'🔺',title:'Sinus, cosinus og tangens',text:'I en rettvinklet trekant med vinkel v:',
     visual:eqBox('sin v = motstående / hypotenus')+eqBox('cos v = hosliggende / hypotenus')+eqBox('tan v = motstående / hosliggende')},
    {icon:'📋',title:'Verdier å huske',text:'Disse vinklene kommer ofte. Lær tabellen!',
     visual:`<div style="display:grid;grid-template-columns:repeat(4,auto);gap:4px 14px;justify-content:center;font-family:'Fredoka One',cursive;font-size:.95rem">${['','sin','cos','tan','0°','0','1','0','30°','0,5','0,87','0,58','45°','0,71','0,71','1','60°','0,87','0,5','1,73','90°','1','0','–'].map((t,i)=>`<div style="color:${i<4||i%4===0?'var(--gold)':'var(--white)'}">${t}</div>`).join('')}</div>`},
    {icon:'⌨️',title:'Slik svarer du',text:'Svar med to desimaler, for eksempel 0,87. Du kan også skrive 1/2.',
     visual:eqBox('sin(60°) ≈ 0,87')}
  ],
  prob10:[
    {icon:'🎲',title:'Hva er sannsynlighet?',text:'Sannsynlighet er gunstige utfall delt på mulige utfall.',
     visual:eqBox('P = gunstige / mulige')},
    {icon:'🎯',title:'Terning: P(tall ≤ 2)',text:'1 og 2 er gunstige. Det er 6 mulige.',
     visual:`<div class="seq-row">${[1,2,3,4,5,6].map(n=>`<span class="seq-box${n<=2?' hl':''}">${n}</span>`).join('')}</div>`+capLine(`P = 2/6 = ${grn('1/3')}`)},
    {icon:'🔴',title:'Kuler i en pose',text:'Det er 10 kuler. 3 av dem er røde.',
     visual:`<div class="dot-groups">${dotGroup(3,'#ff4466')}${dotGroup(7,'#8878cc',120)}</div>`+capLine(`P(rød) = ${grn('3/10')} = 0,3`)},
    {icon:'⌨️',title:'Slik svarer du',text:'Trykk / for å skrive en brøk, for eksempel 1/3. Desimaltall går også.',
     visual:eqBox('2/6 = 1/3 ≈ 0,33')}
  ],
};

// ============================================================
// LEARN NAVIGATION
// ============================================================
// Lær vises automatisk første gang et tema åpnes (startTopic). Siste steg er en ekte oppgave barnet svarer på:
// guidens siste steg med ask:{q,ans} (pre = bilde før svaret, visual = løsningen etterpå), ellers en oppgave
// fra topic.gen (bare valgknapper eller hele tall ≥ 0, siden tastaturet i Lær bare har sifre).
// localStorage mh_learn_seen: ['<g>:<id>', …] = temaer der Lær er vist.
let learnState={grade:null,topicId:null,steps:[],idx:0,auto:false};

function learnSeenList(){const v=typeof mhLoad==='function'?mhLoad('mh_learn_seen',[]):[];return Array.isArray(v)?v:[];}
function isLearnSeen(g,id){return learnSeenList().includes(g+':'+id);}
function markLearnSeen(g,id){const l=learnSeenList(),k=g+':'+id;if(!l.includes(k)){l.push(k);if(typeof mhSave==='function')mhSave('mh_learn_seen',l);}}
// Har barnet spilt temaet før? (stjerner, gammel mestring eller rekord)
function topicPlayed(g,id){
  try{if(typeof topicStars==='function'&&topicStars(g,id)>0)return true;}catch(e){}
  try{if(typeof getMastery==='function'&&getMastery(g,id)>0)return true;}catch(e){}
  try{if(typeof getBest==='function'&&getBest(g,id)!==null)return true;}catch(e){}
  return false;
}
// Start et tema: Lær første gang (hvis temaet har en guide), ellers rett i kamp
function startTopic(g,id){
  const st=LEARN_GUIDES[id];
  if(st&&st.length&&!isLearnSeen(g,id)&&!topicPlayed(g,id)){showLearn(g,id,{auto:true});return 'learn';}
  startGame(g,id);return 'game';
}

// ---- «Gå til kamp»: neste anbefalte tema (eller bossen) i høyeste åpne klassetrinn ----
function fightGrade(){
  let f=1;for(let g=1;g<=10;g++)if(CUR[g]&&typeof isGradeUnlocked==='function'&&isGradeUnlocked(g))f=g;
  const sg=typeof getSetting==='function'?+getSetting('startGrade'):1;
  return sg>f&&CUR[sg]?sg:f;
}
function nextFight(g){
  g=g||fightGrade();const ts=(CUR[g]&&CUR[g].topics)||[];
  const open=i=>typeof isTopicUnlocked==='function'?isTopicUnlocked(g,i):i===0;
  const passed=t=>typeof isTopicPassed==='function'&&isTopicPassed(g,t.id);
  const mastered=t=>typeof isTopicMastered==='function'&&isTopicMastered(g,t.id);
  const find=f=>ts.findIndex((t,i)=>open(i)&&f(t));
  let i=find(t=>!t.optional&&!passed(t)); // første tema uten ⭐
  if(i<0&&typeof BOSSES!=='undefined'&&BOSSES[g]&&typeof isBossUnlocked==='function'&&isBossUnlocked(g)&&!isBossDefeated(g))return{g,boss:BOSSES[g]};
  if(i<0)i=find(t=>!passed(t)); // valgfrie temaer
  if(i<0)i=find(t=>!mastered(t)); // mot ⭐⭐⭐
  if(i<0&&ts.length)i=new Date().getDate()%ts.length; // alt mestret: et tema per dag
  return i>=0&&ts[i]?{g,topic:ts[i]}:null;
}
function goFight(){
  const n=nextFight();if(!n){showScreen('grades');return;}
  try{currentGrade=n.g;}catch(e){}
  if(n.boss&&typeof openBossIntro==='function'){openBossIntro(n.g);return;}
  startTopic(n.g,n.topic.id);
}
function goFightLabel(){
  const el=document.getElementById('go-fight-sub');if(!el)return;
  let n=null;try{n=nextFight();}catch(e){}
  el.textContent=n?(n.boss?`${n.boss.emoji} ${n.boss.name}`:`${n.topic.icon} ${n.topic.name}`):'';
}

// ---- Lær ----
function showLearn(grade,topicId,opts){
  const topic=CUR[grade]&&CUR[grade].topics.find(t=>t.id===topicId),base=LEARN_GUIDES[topicId];
  if(!topic)return;
  if(!base||!base.length){startGame(grade,topicId);return;} // ingen guide: rett i kamp
  const steps=base.slice(),last=steps[steps.length-1],pr=learnPractice(grade,topicId,topic,last);
  if(pr){if(last.ask)steps[steps.length-1]=Object.assign({},last,{practice:pr});else steps.push({icon:'🎯',title:'Din tur!',text:pr.qd.hint||'',practice:pr});}
  learnState={grade,topicId,steps,idx:0,auto:!!(opts&&opts.auto)};
  markLearnSeen(grade,topicId);
  try{currentGrade=grade;}catch(e){}
  document.getElementById('learn-topic-name').textContent=topic.name;
  buildLearnDots();
  renderLearnStep();
  showScreen('learn');
}
// Oppgaven i siste steg
function learnPractice(g,id,topic,last){
  let qd=null;
  if(last&&last.ask)qd=Object.assign({},last.ask);
  else{
    try{qd=topic.gen(g,id);}catch(e){qd=null;}
    const ch=qd&&Array.isArray(qd.choices)&&qd.choices.length;
    if(qd&&!ch&&!(Number.isInteger(qd.ans)&&qd.ans>=0&&qd.ans<10000&&(qd.ansTxt==null||/^\d+$/.test(String(qd.ansTxt)))))qd=null;
  }
  if(!qd||qd.q==null||qd.ans==null)return null;
  return {qd,tries:0,done:false,res:null,val:''};
}
function learnPr(){const st=learnState.steps[learnState.idx];return st&&st.practice||null;}
function learnKeyTxt(qd){return String(qd.ansTxt!=null?qd.ansTxt:(typeof nf==='function'?nf(qd.ans):qd.ans));}
function learnEsc(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}

function buildLearnDots(){
  document.getElementById('learn-dots').innerHTML=learnState.steps.map((_,i)=>`<div class="learn-dot" id="ldot${i}"></div>`).join('');
}

function renderLearnStep(){
  const {steps,idx}=learnState;
  const step=steps[idx];
  const body=document.getElementById('learn-body');
  body.style.opacity='0';
  setTimeout(()=>{
    document.getElementById('learn-step-lbl').textContent=`Steg ${idx+1} av ${steps.length}`;
    document.getElementById('learn-icon').textContent=step.icon;
    document.getElementById('learn-title').textContent=step.title;
    document.getElementById('learn-text').innerHTML=step.text||'';
    const vis=document.getElementById('learn-visual');
    vis.innerHTML=step.practice?learnPracticeHTML(step):(step.visual||'');
    vis.classList.toggle('lp-on',!!step.practice);
    steps.forEach((_,i)=>{
      const d=document.getElementById(`ldot${i}`);
      if(d)d.className='learn-dot'+(i<idx?' done':i===idx?' active':'');
    });
    if(step.practice&&step.practice.done)learnFeedback(step.practice.res,true);
    learnNavSync();
    body.style.transition='opacity .25s';
    body.style.opacity='1';
    learnSay();
  },100);
}
function learnNavSync(){
  const {steps,idx}=learnState,last=idx>=steps.length-1,pr=learnPr();
  const nb=document.getElementById('learn-next');
  nb.textContent=last?'⚔️ Til kamp!':'Neste →';
  nb.className='learn-next'+(last&&(!pr||pr.done)?' finish':'')+(last&&pr&&pr.done?' lp-go':'');
  document.getElementById('learn-prev').style.display=idx>0?'':'none';
}
// Oppgave med valgknapper eller sifre (1–5, 6–0), ⌫ og ✓
function learnPracticeHTML(step){
  const pr=step.practice,qd=pr.qd,ch=Array.isArray(qd.choices)&&qd.choices.length,q=String(qd.q);
  let h=`<div class="lp-q${/[a-zæøå]{4}/i.test(q)&&q.length>20?' lp-long':''}">${learnEsc(q)}</div>`;
  const vh=typeof renderVis==='function'?renderVis(qd.vis):'';if(vh)h+=`<div class="lp-vis">${vh}</div>`;
  if(step.pre)h+=`<div class="lp-pre">${step.pre}</div>`;
  const fb='<div class="lp-fb" id="lp-fb"></div>'; // tilbakemelding rett under svaret, før tastaturet
  if(ch)h+=`<div class="q-choices lp-choices">${qd.choices.map((c,i)=>`<button type="button" class="q-choice" data-i="${i}">${learnEsc(c)}</button>`).join('')}</div>`+fb;
  else h+=`<div class="lp-row"><button type="button" class="lp-key lp-del" data-k="del" aria-label="Slett">⌫</button><div class="lp-ans" id="lp-ans">${learnEsc(pr.val||'?')}</div><button type="button" class="lp-key lp-ok" data-k="ok" aria-label="Svar">✓</button></div>`+fb+
    `<div class="lp-pad">${[1,2,3,4,5,6,7,8,9,0].map(n=>`<button type="button" class="lp-key" data-k="${n}">${n}</button>`).join('')}</div>`;
  return `<div class="lp" id="lp">${h}</div>`;
}
// Sjekker et svar: 'ok' | 'retry' (første feil) | 'reveal' (andre feil, eller feil med bare 2 valg) | null (tomt/ugyldig)
function learnCheck(raw){
  const pr=learnPr();if(!pr||pr.done)return null;
  const qd=pr.qd,ch=Array.isArray(qd.choices)&&qd.choices.length;
  raw=String(raw==null?'':raw).trim();if(raw==='')return null;
  let ok;
  if(ch)ok=raw===learnKeyTxt(qd);
  else{const v=typeof parseAns==='function'?parseAns(raw):+raw;if(v===null||isNaN(v))return null;ok=Math.abs(v-qd.ans)<0.01;}
  pr.tries++;
  const r=ok?'ok':(pr.tries>=2||(ch&&qd.choices.length<=2))?'reveal':'retry';
  if(r!=='retry'){pr.done=true;pr.res=r;}
  return r;
}
function learnAnswer(raw,ci){
  const pr=learnPr();if(!pr||pr.done)return null;
  const r=learnCheck(raw);if(!r)return null;
  if(ci!=null&&r!=='ok'){const b=document.querySelectorAll('#learn-visual .q-choice')[ci];if(b){b.classList.add('wrong');b.disabled=true;}}
  if(r==='retry'){pr.val='';const a=document.getElementById('lp-ans');if(a){a.textContent='?';a.classList.remove('lp-shake');void a.offsetWidth;a.classList.add('lp-shake');}}
  learnFeedback(r);
  return r;
}
function learnFeedback(r,quiet){
  const pr=learnPr(),st=learnState.steps[learnState.idx],fb=document.getElementById('lp-fb');if(!pr||!fb)return;
  const key=learnKeyTxt(pr.qd);let h,say;
  if(r==='ok'){h='<div class="lp-fb-t">🎉 Riktig!</div>';say='Riktig! Bra jobba!';}
  else if(r==='retry'){const hint=st.ask?st.text:(pr.qd.hint||'');h=`<div class="lp-fb-t">🤔 Nesten! Prøv igjen.</div>${hint?`<div class="lp-fb-h">${hint}</div>`:''}`;say='Nesten! Prøv igjen. '+(hint||'');}
  else{h=`<div class="lp-fb-t">Svaret er ${learnEsc(key)}.</div>`;say=`Svaret er ${key}.`;}
  if(pr.done&&st.ask&&st.visual)h+=`<div class="lp-sol">${st.visual}</div>`;
  fb.className='lp-fb '+(r==='ok'?'ok':r==='retry'?'try':'show');fb.innerHTML=h;
  if(pr.done){
    const lp=document.getElementById('lp');if(lp)lp.classList.add('done');
    const a=document.getElementById('lp-ans');if(a){a.textContent=key;a.classList.add('ok');}
    document.querySelectorAll('#learn-visual .q-choice').forEach(b=>{b.disabled=true;if(b.textContent===key)b.classList.add('right');});
  }
  learnNavSync();
  if(quiet)return;
  if(r==='ok'){if(typeof sndOk==='function')sndOk();if(typeof launch==='function')launch(50);}
  else if(typeof sndBad==='function')sndBad();
  if(typeof speak==='function')speak(say,{grade:learnState.grade});
  if(pr.done){const nb=document.getElementById('learn-next');if(nb&&nb.scrollIntoView)try{nb.scrollIntoView({block:'nearest',behavior:'smooth'});}catch(e){}}
}
function learnPadClick(e){
  const t=e&&e.target,b=t&&t.closest?t.closest('button'):null;if(!b||b.disabled)return;
  const pr=learnPr();if(!pr||pr.done)return;
  if(b.dataset.i!=null){const i=+b.dataset.i;learnAnswer(String(pr.qd.choices[i]),i);return;}
  const k=b.dataset.k;if(k==null)return;
  if(k==='ok'){if(pr.val)learnAnswer(pr.val);return;}
  if(k==='del')pr.val=pr.val.slice(0,-1);else if(pr.val.length<4)pr.val+=k;
  const a=document.getElementById('lp-ans');if(a)a.textContent=pr.val||'?';
}
// Tastatur på PC: sifre, ⌫ og Enter
function learnKeydown(e){
  const sc=document.getElementById('screen-learn');if(!sc||!sc.classList.contains('active'))return;
  const pr=learnPr();if(!pr||pr.done||(Array.isArray(pr.qd.choices)&&pr.qd.choices.length))return;
  if(/^[0-9]$/.test(e.key)){if(pr.val.length<4)pr.val+=e.key;}
  else if(e.key==='Backspace')pr.val=pr.val.slice(0,-1);
  else if(e.key==='Enter'){e.preventDefault();if(pr.val)learnAnswer(pr.val);return;}
  else return;
  e.preventDefault();
  const a=document.getElementById('lp-ans');if(a)a.textContent=pr.val||'?';
}
(function(){
  const v=document.getElementById('learn-visual');if(v&&v.addEventListener)v.addEventListener('click',learnPadClick);
  if(typeof document.addEventListener==='function')document.addEventListener('keydown',learnKeydown);
})();

// Les steget høyt (automatisk når opplesing er på; force = 🔊)
function learnSay(force){
  const st=learnState.steps[learnState.idx];if(!st||typeof speak!=='function')return '';
  const head=st.title+(/[.!?]$/.test(st.title)?' ':'. ')+(st.text||'');
  if(st.practice&&!st.practice.done&&typeof ttsText==='function')return speak(ttsText(head)+' '+ttsQText(st.practice.qd),{raw:true,force:!!force,grade:learnState.grade});
  return speak(head,{force:!!force,grade:learnState.grade});
}
// Sperre mot dobbeltklikk: ett steg per 350 ms (ellers hopper barnet over steg eller øveoppgaven)
function learnTap(){const n=Date.now();if(n-(learnState.tapT||0)<350)return false;learnState.tapT=n;return true;}
function learnNext(){
  if(!learnTap())return;
  if(learnState.idx>=learnState.steps.length-1)learnFight();
  else{learnState.idx++;renderLearnStep();}
}
function learnPrev(){if(!learnTap())return;if(learnState.idx>0){learnState.idx--;renderLearnStep();}}
function learnFight(){if(learnState.grade==null)return;markLearnSeen(learnState.grade,learnState.topicId);startGame(learnState.grade,learnState.topicId);}
function learnBack(){
  if(typeof ttsStop==='function')ttsStop();
  if(learnState.grade&&typeof selectGrade==='function')selectGrade(learnState.grade);else showScreen('grades');
}
