// Tester for «For de minste»: taletekst, stemmevalg, opplesing (stubbet speechSynthesis), startTopic, Gå til kamp, Lær-oppgaven
module.exports=function({R,ok,CUR,ls,els,ctx,solve}){
  const snap=new Map(ls);
  const restore=()=>{ls.clear();for(const [k,v] of snap)ls.set(k,v);};
  const T=s=>R('ttsText')(s),Q=qd=>R('ttsQText')(qd);
  const EMO=/\p{Extended_Pictographic}/u;

  // ---- Taletekst ----
  const cases=[
    ['8 + 5 = ?','Hva er 8 pluss 5?'],
    ['9 - 4 = ?','Hva er 9 minus 4?'],
    ['9 − 4 = ?','Hva er 9 minus 4?'],
    ['3 · 4 = ?','Hva er 3 ganger 4?'],
    ['12 : 3 = ?','Hva er 12 delt på 3?'],
    ['? + 4 = 9','Hvilket tall pluss 4 blir 9?'],
    ['5 + ? = 8','5 pluss hvilket tall blir 8?'],
    ['9 - ? = 5','9 minus hvilket tall blir 5?'],
    ['Dobbelt av 6 = ?','Hva er dobbelt av 6?'],
    ['Halvparten av 12 = ?','Hva er halvparten av 12?'],
    ['2, 4, 6, ?','2, 4, 6. Hva kommer så?'],
    ['10, ?, 30, 40','10, hva, 30, 40. Hvilket tall mangler?'],
    ['🐸 Frosken hopper: 2, 4, 6, ?','Frosken hopper: 2, 4, 6. Hva kommer så?'],
    ['🚀 Nedtelling: 5, 4, 3, ?','Nedtelling: 5, 4, 3. Hva kommer så?'],
    ['Du har 3 🍎. Du får 2 til. Hvor mange nå?','Du har 3 epler. Du får 2 til. Hvor mange nå?'],
    ['1 🍎 og 6 🍎. Hvor mange til sammen?','1 eple og 6 epler. Hvor mange til sammen?'],
    ['Du ser 9 🖐️ med 5 fingre. Hvor mange fingre?','Du ser 9 hender med 5 fingre. Hvor mange fingre?'],
    ['Du har 45 kr. Du kjøper is for 8 kr. Hvor mange kroner er igjen?','Du har 45 kroner. Du kjøper is for 8 kroner. Hvor mange kroner er igjen?'],
    ['7 + 5 = 12. Stemmer det?','7 pluss 5 er like mye som 12. Stemmer det?'],
    ['4 + 3 = 5 + ?','4 pluss 3 er like mye som 5 pluss hva?'],
    ['Hva er klokka? kl. 12:30','Hva er klokka? klokka 12:30'],
    ['<b>Riktig!</b> 8 + 2 = <strong>10</strong> ✓','Riktig! 8 pluss 2 er like mye som 10'],
    ['2 − 6 = −4','2 minus 6 er like mye som minus 4'],
  ];
  for(const [inp,exp] of cases){const got=T(inp);ok(got===exp,`ttsText('${inp}') = '${got}', expected '${exp}'`);}
  ok(Q({q:'🍎🍎🍎 + 🍎🍎 = ?',eq:'3 + 2 = ?',ans:5})==='Tell eplene. Hvor mange er det til sammen?',`emoji-telling pluss: ${Q({q:'🍎🍎🍎 + 🍎🍎 = ?',ans:5})}`);
  ok(Q({q:'🍪🍪🍪🍪 - 🍪 = ?',ans:3})==='Tell kjeksene. Hvor mange er igjen?',`emoji-telling minus: ${Q({q:'🍪🍪🍪🍪 - 🍪 = ?',ans:3})}`);
  ok(Q({q:'🍎🍎 + 🍎 = ?',say:'Tell eplene. Hvor mange er det til sammen?',ans:3})==='Tell eplene. Hvor mange er det til sammen?','qd.say brukes');
  ok(Q({q:'Er 7 et partall?',ans:'Oddetall',choices:['Partall','Oddetall']})==='Er 7 et partall? Partall eller oddetall?',`valg med ord leses: ${Q({q:'Er 7 et partall?',ans:'Oddetall',choices:['Partall','Oddetall']})}`);
  ok(Q({q:'7 + 5 = 12. Stemmer det?',ans:'Ja',choices:['Ja','Nei']})==='7 pluss 5 er like mye som 12. Stemmer det?','Ja/Nei leses ikke');
  ok(Q({q:'Er 7 et partall eller oddetall?',ans:'Oddetall',choices:['Partall','Oddetall']})==='Er 7 et partall eller oddetall?','valg som står i spørsmålet leses ikke to ganger');
  ok(Q(null)==='','ttsQText(null)');
  // Alle oppgaver i 1.–2. klasse gir ren taletekst: ingen emoji, ingen regnetegn, ingen løse «?»
  for(const g of [1,2])for(const t of CUR[g].topics)for(let i=0;i<300;i++){
    const qd=t.gen(g,t.id),s=Q(qd);
    ok(s.length>0,`${t.id} tom taletekst: ${qd.q}`);
    ok(!EMO.test(s),`${t.id} emoji i tale: ${s}`);
    ok(!/ [+=·:×÷] | - /.test(s),`${t.id} regnetegn i tale: ${qd.q} -> ${s}`);
    ok(!/(^|\s)\?/.test(s),`${t.id} løst ? i tale: ${qd.q} -> ${s}`);
    ok(!/undefined|NaN|null/.test(s),`${t.id} rar tale: ${s}`);
  }
  // Lær-tekstene i 1.–2. klasse kan leses uten emoji
  for(const g of [1,2])for(const t of CUR[g].topics)for(const st of (R('LEARN_GUIDES')[t.id]||[])){const s=T(st.title+'. '+st.text);ok(s.length>0&&!EMO.test(s),`guide ${t.id} tale: ${s}`);}

  // ---- Stemmevalg ----
  const pv=R('ttsPickVoice');
  ok(pv([{lang:'en-US',name:'A'},{lang:'nn-NO',name:'N'},{lang:'nb-NO',name:'B'}]).name==='B','nb-NO foran nn-NO');
  ok(pv([{lang:'en-US',name:'A'},{lang:'no-NO',name:'C'}]).name==='C','no-NO godtas');
  ok(pv([{lang:'nb_NO',name:'D'}]).name==='D','nb_NO (Android) godtas');
  ok(pv([{lang:'nn-NO',name:'E'}]).name==='E','nn-NO godtas');
  ok(pv([{lang:'',name:'Norsk stemme'}]).name==='Norsk stemme','navn «Norsk» uten språkkode');
  ok(pv([{lang:'en-GB',name:'Daniel'},{lang:'sv-SE',name:'Alva'},{lang:'da-DK',name:'Sara'}])===null,'ingen norsk stemme -> null');
  ok(pv([])===null&&pv(null)===null,'tom liste -> null');
  ok(pv([{lang:'nb-NO',name:'Microsoft Jon',localService:true},{lang:'nb-NO',name:'Microsoft Pernille Online (Natural)',localService:false}]).name.includes('Pernille'),'naturlig stemme foretrekkes');

  // ---- Opplesing med stubbet speechSynthesis ----
  const spoken=[],log=[];let voices=[];
  const synth={speaking:false,pending:false,paused:false,getVoices:()=>voices,cancel(){log.push('cancel');},speak(u){spoken.push(u);},resume(){},addEventListener(){}};
  const oldST=ctx.setTimeout;
  ctx.speechSynthesis=synth;ctx.SpeechSynthesisUtterance=function(t){this.text=t;};ctx.setTimeout=(f)=>{f();return 0;};
  try{
    R("TTS.voice=null;TTS.act=true");ls.delete('mh_settings');
    ok(R('ttsLoad()')===false&&R('ttsReady()')===false,'ingen stemmer -> ikke klar');
    ok(R("speak('Hei',{force:true})")===''&&spoken.length===0,'uten norsk stemme sies ingenting');
    ok(R('ttsOn(1)')===false,'ttsOn false uten stemme');
    voices=[{lang:'en-US',name:'Eng'},{lang:'nb-NO',name:'Nora'}];
    ok(R('ttsLoad()')===true&&R('TTS.voice.name')==='Nora','stemme lastes når voiceschanged kommer');
    ok(R('ttsOn(1)')===true&&R('ttsOn(2)')===true&&R('ttsOn(3)')===false,'auto: på i 1.–2. klasse, av ellers');
    R("setSetting('tts','on')");ok(R('ttsOn(5)')===true,"tts 'on' gjelder alle trinn");
    R("setSetting('tts','off')");ok(R('ttsOn(1)')===false,"tts 'off' slår av");
    ok(R("speak('8 + 5 = ?',{grade:1})")===''&&spoken.length===0,"'off': ingen automatisk tale");
    ok(R("speak('8 + 5 = ?',{force:true})")==='Hva er 8 pluss 5?'&&spoken.length===1,"force (🔊) leser selv om 'off'");
    R("setSetting('tts','auto')");
    ok(spoken[0].text==='Hva er 8 pluss 5?'&&spoken[0].voice.name==='Nora'&&/^nb/.test(spoken[0].lang),'ytring har tekst, norsk stemme og språk');
    spoken.length=0;log.length=0;
    R("S.grade=1");
    ok(R("speakQ({q:'6 + 3 = ?',ans:9})")==='Hva er 6 pluss 3?'&&spoken.length===1,'speakQ leser oppgaven i 1. klasse');
    R("S.grade=4");
    ok(R("speakQ({q:'6 · 3 = ?',ans:18})")===''&&spoken.length===1,'speakQ leser ikke automatisk i 4. klasse');
    ok(R("speakQ({q:'6 · 3 = ?',ans:18},{force:true})")==='Hva er 6 ganger 3?','speakQ med force');
    R("S.grade=1");
    synth.speaking=true;log.length=0;
    R("speak('Første',{grade:1})");ok(log.includes('cancel'),'ny tale avbryter forrige');
    synth.speaking=false;
    R("TTS.act=false");
    ok(R("speak('Hei',{grade:1})")==='','ingen automatisk tale før første trykk');
    ok(R("speak('Hei',{force:true})")==='Hei','🔊 virker alltid');
    R("TTS.act=true");
    const n0=R('TTS.tok');R('ttsStop()');ok(R('TTS.tok')===n0+1,'ttsStop avbryter ventende tale');
  }finally{
    ctx.setTimeout=oldST;delete ctx.speechSynthesis;delete ctx.SpeechSynthesisUtterance;R("TTS.voice=null;S.grade=null");
  }

  // ---- startTopic: Lær første gang, ellers kamp ----
  const oldSG=R('startGame');
  R("globalThis.__sg=null;startGame=function(g,id){globalThis.__sg=[g,id];}");
  try{
    ls.clear();
    ok(R("startTopic(1,'add10')")==='learn','nytt tema -> Lær');
    ok(R('learnState.topicId')==='add10'&&R('__sg')===null,'Lær vist, ikke kamp');
    ok(JSON.parse(ls.get('mh_learn_seen')).includes('1:add10'),'mh_learn_seen lagret');
    ok(R("startTopic(1,'add10')")==='game'&&R('__sg')[1]==='add10','andre gang -> kamp');
    ls.set('mh_mst_1_sub10','70');
    ok(R("startTopic(1,'sub10')")==='game','tema med gammel fremgang -> rett i kamp');
    ls.clear();ls.set('hs_2_add100',JSON.stringify([{score:6}]));
    ok(R("startTopic(2,'add100')")==='game','tema med rekord -> rett i kamp');

    // ---- Lær: siste steg er en ekte oppgave ----
    ls.clear();R("showLearn(1,'add10')");
    let st=R('learnState.steps');let last=st[st.length-1];
    ok(last.practice&&last.practice.qd.q==='6 + 4 = ?'&&last.practice.qd.ans===10,'add10: siste steg er oppgaven 6 + 4');
    ok(st.length===R("LEARN_GUIDES.add10.length"),'ask-steget erstatter «din tur»-eksempelet');
    R('learnState.idx=learnState.steps.length-1');
    ok(R("learnCheck('')")===null,'tomt svar ignoreres');
    ok(R("learnCheck('9')")==='retry','første feil -> prøv igjen');
    ok(R("learnCheck('10')")==='ok'&&R('learnPr().done')===true,'riktig svar -> ferdig');
    ok(R("learnCheck('10')")===null,'ferdig oppgave tar ikke flere svar');
    R("showLearn(1,'sub10')");R('learnState.idx=learnState.steps.length-1');
    ok(R("learnCheck('4')")==='retry'&&R("learnCheck('5')")==='reveal','to feil -> fasit');
    // Alle temaer i 1.–2. klasse (også nye) får en oppgave til slutt
    for(const g of [1,2])for(const t of CUR[g].topics){
      if(!R('LEARN_GUIDES')[t.id])continue;
      R(`showLearn(${g},'${t.id}')`);const s2=R('learnState.steps'),pr=s2[s2.length-1].practice;
      ok(!!pr,`${t.id}: Lær slutter med en oppgave`);
      if(!pr)continue;
      const qd=pr.qd,key=String(qd.ansTxt??qd.ans);
      if(Array.isArray(qd.choices)&&qd.choices.length)ok(qd.choices.map(String).includes(key),`${t.id}: valg mangler fasit`);
      else ok(Number.isInteger(qd.ans)&&qd.ans>=0,`${t.id}: Lær-svar kan skrives med sifre: ${qd.ans}`);
      R('learnState.idx=learnState.steps.length-1');
      ok(R(`learnCheck(${JSON.stringify(key)})`)==='ok',`${t.id}: fasit godtas i Lær (${qd.q} = ${key})`);
    }
    // Lær-oppgaver fra ask stemmer (uavhengig løser) og står som eksempel i løsningen
    for(const [id,steps] of Object.entries(R('LEARN_GUIDES')))for(const s3 of steps)if(s3.ask){
      const v=solve(s3.ask.q);ok(v!==undefined&&Math.abs(v-s3.ask.ans)<1e-9,`guide ${id}: ask ${s3.ask.q} = ${s3.ask.ans} (løser: ${v})`);
      ok(!s3.visual||String(s3.visual).includes(String(s3.ask.ans)),`guide ${id}: løsningen viser ${s3.ask.ans}`);
    }
  }finally{ctx.startGame=oldSG;}
  ok(R('startGame')===oldSG,'startGame gjenopprettet');
  restore();
};
