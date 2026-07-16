"use strict";
/* ================================================================
   쿼카 리그 — 규칙 도감 9장 = 미션 9개 + 결승전(2이닝 실전 경기)
   "먼저 해보고, 결과로 배운다"
================================================================ */
const LGC={HOME:{x:640,y:619},FIRST:{x:902,y:432},SECOND:{x:640,y:284},THIRD:{x:378,y:432}};
const lgDep=y=>Math.max(.42,Math.min(1,.42+.58*(y-230)/400));
const MISSIONS=[
 {id:1,t:"티볼 첫 타석",sub:"투수 없이, 티 위의 공을 친다",bg:"bg/final_sunset.jpg",en:"MISSION 01 · WHAT IS T-BALL"},
 {id:2,t:"준비물 챙기기",sub:"경기장과 장비를 알아본다",bg:"bg/final_night.jpg",en:"MISSION 02 · FIELD & GEAR"},
 {id:3,t:"모두의 타순",sub:"모든 선수가 순서대로 친다",bg:"bg/final_night.jpg",en:"MISSION 03 · BATTING RULES"},
 {id:4,t:"반시계 한 바퀴",sub:"1루 → 2루 → 3루 → 홈!",bg:"bg/bg_nb7.jpg",en:"MISSION 04 · BASE RUNNING"},
 {id:5,t:"아웃을 잡아라",sub:"플라이 · 포스아웃을 배운다",bg:"bg/bg_nb7.jpg",en:"MISSION 05 · OUT RULES"},
 {id:6,t:"페어? 파울!",sub:"파울이면 다시 티에 올린다",bg:"bg/final_sunset.jpg",en:"MISSION 06 · FAIR & FOUL"},
 {id:7,t:"잡고 던져라",sub:"수비의 완성은 송구",bg:"bg/bg_nb7.jpg",en:"MISSION 07 · FIELD & THROW"},
 {id:8,t:"점수 내고 지켜라",sub:"한 이닝의 흐름을 배운다",bg:"bg/bg_nb7.jpg",en:"MISSION 08 · SCORE & INNINGS"},
 {id:9,t:"안전이 먼저",sub:"배트를 내려놓고, 인사까지",bg:"bg/final_night.jpg",en:"MISSION 09 · SAFETY & MANNERS"}];
function lgProg(){return store.get("league")||{}}
const gdepM=y=>Math.max(.3,Math.min(1,.3+.7*(y-380)/330));
function missionOpp(id){const o=TKEYS.filter(k=>k!==S.team&&k!==finalOpp());return o[(id-1)%o.length]}
/* 지상뷰 상대 수비진 (미션 공용) */
function groundCrew(opp){const arr=[];
 const pool=TKEYS.filter(k=>k!==S.team);
 [[240,505],[450,432],[608,404],[830,432],[1040,505]].forEach(([x,y],i)=>{
  const k=opp||pool[(i*3+1)%pool.length]; /* opp 없으면 여러 구단 혼성 */
  const s=mkSpr(timg(k,"fielder"),165*gdepM(y),x,y);
  sprFlip(s,x>640?-1:1);s.dataset.hx=x;s.dataset.hy=y;s.dataset.team=k;arr.push(s)});
 return arr}
/* 항공뷰 홈플레이트 티 */
function poseCatch(f){sprImg(f,timg(S.team,"catch"));
 setTimeout(()=>{try{sprImg(f,timg(S.team,"fielder"))}catch(e){}},800)}
function aerTee(){ballStatic(LGC.HOME.x+2,LGC.HOME.y-14,6.5,true)}
function aerTeeEmpty(){teeEmpty(LGC.HOME.x+2,LGC.HOME.y-14,6.5)}
let FINAL_OPP=null,FINAL_BGS=["bg/final_sunset.jpg","bg/final_night.jpg"],FINAL_DIFF="normal";
const DIFFS={
 easy:{label:"쉬움",inn:2,run:"auto",def:"auto",bar:1350,hrP:.25,hitG:.8,hitN:.6,two:.15,plays:5,coins:100,
  d:"2이닝 · 타격에만 집중 — 주루·수비는 자동"},
 normal:{label:"보통",inn:3,run:"lead",def:"auto",bar:1100,hrP:.18,hitG:.6,hitN:.4,two:.3,plays:6,coins:150,
  d:"3이닝 · 주루 판단은 직접, 수비는 자동"},
 hard:{label:"어려움",inn:4,run:"all",def:"manual",bar:880,hrP:.12,hitG:.45,hitN:.25,two:.5,plays:7,coins:220,
  d:"4이닝 · 모든 주자 조작 + 수비 직접 조작"}};
function finalOpp(){return (FINAL_OPP&&FINAL_OPP!==S.team)?FINAL_OPP:(S.team==="lg"?"doosan":"lg")}

/* ================= LEAGUE SCREEN ================= */
function openLeague(){crowdOff();ballClear();
 $("#lggrid").classList.remove("cols4");
 const p=lgProg(),done=MISSIONS.filter(m=>p[m.id]).length;
 $("#lg-sub").textContent=`미션을 클리어하면 규칙 도감 카드가 열려요 — ${done} / 9 클리어`;
 const opps=TKEYS.filter(k=>k!==S.team&&k!==finalOpp());
 $("#lggrid").innerHTML=MISSIONS.map((m,i)=>{const o=opps[i%opps.length],c=p[m.id];
  return `<div class="lgcard${c?" clear":""}" data-m="${m.id}">
   <div class="lgno">MISSION ${String(m.id).padStart(2,"0")}</div>
   <div class="lgt">${m.t}</div>
   <div class="lgvs"><img src="${timg(o,"idle")}" alt=""><span>vs ${TEAMS[o].n}<br>${m.sub}</span></div>
   <div class="lgst">${c?"CLEAR · 카드 획득":"도전하기"}</div></div>`}).join("")
 +`<div class="lgcard final" data-m="f">
   <div class="lgno">FINAL MATCH</div>
   <div class="lgt">결승전 — 실전 경기</div>
   <div class="lgvs"><img src="${timg(finalOpp(),"special")}" alt="">
    <span>vs ${TEAMS[finalOpp()].n}<br>진짜 티볼 규칙으로 승부! 이기면 우승 상장</span></div>
   <div class="lgst">${S.wins?S.wins+"회 우승":"카드 "+dexCount()+" / 9 · 언제든 도전 가능"}</div></div>`;
 $("#lggrid").querySelectorAll(".lgcard").forEach(el=>el.onclick=()=>{sfx.ui();
  el.dataset.m==="f"?pickOpponent():runMission(+el.dataset.m)});
 $("#lg-back").onclick=()=>{sfx.ui();openHub()};
 show("league")}

/* 결승 상대 선택 */
function pickOpponent(){
 $("#lggrid").classList.remove("cols4");
 $("#lg-sub").textContent="결승 상대를 골라 주세요 — 어느 구단과 붙을까요?";
 $("#lggrid").innerHTML=TKEYS.filter(k=>k!==S.team).map(k=>
  `<div class="lgcard" data-o="${k}">
    <div class="lgno">FINAL OPPONENT</div>
    <div class="lgt" style="color:${TEAMS[k].c}">${TEAMS[k].n}</div>
    <div class="lgvs"><img src="${timg(k,"special")}" alt=""><span>vs ${TEAMS[k].n}<br>실전 승부</span></div>
    <div class="lgst">이 팀과 결승전!</div></div>`).join("")
 +`<div class="lgcard" data-o="__back">
    <div class="lgno">BACK</div><div class="lgt">리그로 돌아가기</div>
    <div class="lgvs"><span>미션 목록으로</span></div><div class="lgst">돌아가기</div></div>`;
 $("#lggrid").querySelectorAll(".lgcard").forEach(el=>el.onclick=()=>{sfx.ui();
  el.dataset.o==="__back"?openLeague():pickDiff(el.dataset.o)})}

/* 난이도 선택 */
function pickDiff(opp){
 $("#lg-sub").textContent=`vs ${TEAMS[opp].n} — 난이도를 골라 주세요`;
 $("#lggrid").classList.add("cols4");
 $("#lggrid").innerHTML=Object.keys(DIFFS).map(k=>{const D=DIFFS[k];
  return `<div class="lgcard diff-${k}" data-d="${k}">
   <div class="lgno">DIFFICULTY</div>
   <div class="lgt">${D.label}</div>
   <div class="lgvs"><span>${D.d}<br>승리 코인 +${D.coins}</span></div>
   <div class="lgst">이 난이도로 시작</div></div>`}).join("")
 +`<div class="lgcard" data-d="__back">
   <div class="lgno">BACK</div><div class="lgt">상대 다시 고르기</div>
   <div class="lgvs"><span>구단 선택으로</span></div><div class="lgst">돌아가기</div></div>`;
 $("#lggrid").querySelectorAll(".lgcard").forEach(el=>el.onclick=()=>{sfx.ui();
  el.dataset.d==="__back"?pickOpponent():runFinal(opp,el.dataset.d)})}

function runMission(id){const m=MISSIONS[id-1];
 GAMES.match.bg=m.bg;GAMES.match.ko="미션 "+String(id).padStart(2,"0")+" · "+m.t;
 GAMES.match.en=m.en;GAMES.match.callout=null;
 openGame("match",()=>MBUILD[id]())}

/* ================= SHARED HELPERS ================= */
function mtBanner(k,s,ms=1500){const b=$("#mt-banner");
 b.innerHTML=`<div class="bk">${k}</div>${s?`<div class="bs">${s}</div>`:""}`;
 b.classList.add("on");crowdSwell(1);
 return new Promise(r=>setTimeout(()=>{b.classList.remove("on");r()},window.__FAST?120:ms))}
function mtBar(label,speed){
 $("#control").innerHTML=`<div class="tcol"><div class="tbar"><div class="zone"></div><div class="cur" id="mt-cur"></div></div>
  <div class="tlabels"><span class="early">EARLY</span><span class="late">LATE</span></div></div>
  <button class="bigbtn" id="mt-swing">${label}</button>`;
 const o={pos:0,raf:0,t0:0};
 function loop(){o.raf=requestAnimationFrame(loop);
  const t=(performance.now()-o.t0)/speed,p=1-Math.abs(1-(t%2));
  o.pos=p;const c=$("#mt-cur");if(c)c.style.left=(p*394)+"px"}
 o.start=()=>{o.t0=performance.now();cancelAnimationFrame(o.raf);loop()};
 o.halt=()=>cancelAnimationFrame(o.raf);
 o.read=()=>{const diff=o.pos-.5,ad=Math.abs(diff);
  return{diff,ad,g:ad<=.05?"P":ad<=.12?"G":ad<=.2?"N":"M"}};
 return o}
function mtMove(el,x1,y1,dur,scaleW,depf){depf=depf||lgDep;return new Promise(res=>{
 const x0=parseFloat(el.dataset.x),y0=parseFloat(el.dataset.y),t0=performance.now();
 const D=window.__FAST?60:dur;
 sprRun(el,true);sprFlip(el,x1<x0?-1:1);
 (function step(){const k=Math.min(1,(performance.now()-t0)/D);
  const x=x0+(x1-x0)*k,y=y0+(y1-y0)*k;
  sprPos(el,x,y,scaleW?scaleW*depf(y):undefined);
  if(k<1)requestAnimationFrame(step);else{sprRun(el,false);res()}})()})}
function baseMark(x,y,on){const m=document.createElement("div");m.className="landmark";
 m.style.left=x+"px";m.style.top=y+"px";
 const R=34*lgDep(y)+12;
 m.innerHTML=`<svg width="${R*2+18}" height="${R*1.3+18}" viewBox="0 0 ${R*2+18} ${R*1.3+18}">
  <ellipse class="${on?"lm-ring":""}" cx="${R+9}" cy="${R*.65+9}" rx="${R}" ry="${R*.55}"
   fill="rgba(78,168,255,.14)" stroke="${on?"#7FC4FF":"rgba(120,180,255,.35)"}" stroke-width="2.6" style="transform-origin:center"/></svg>`;
 $("#sprites").appendChild(m);return m}
function mFinish(id,o){
 const p=lgProg();p[id]=1;store.set("league",p);
 unlockDex(id);addCoins(o.coins);
 const isNew=saveBest("m"+id,o.score);
 setTimeout(()=>showResult({title:"MISSION "+String(id).padStart(2,"0")+" CLEAR",
  score:o.score,best:S.best["m"+id]||o.score,isNew,coins:o.coins,
  stars:o.stars,rows:o.rows||[],
  midBtn:id<9?"다음 미션":"리그로",
  onMid:()=>id<9?runMission(id+1):openLeague(),
  onRetry:()=>runMission(id)}),900)}

/* ================= M1 티볼 첫 타석 ================= */
const MBUILD={};
MBUILD[1]=function(){
 const st={hit:0,miss:0,dead:false},TEE={x:634,y:566};
 $("#hud-left").innerHTML=hudRound(1,3)+hudGoal("티 위의 공을 <b>3번</b> 쳐 보세요");
 $("#hud-right").innerHTML=hudScore();
 $("#hud-best").textContent=(S.best.m1||0).toLocaleString();setGoal(null,0,3);
 setCallout("티볼은 투수가 없어요!<br>멈춘 공을 노려서 치세요");
 const batter=mkBatter(528,706);
 const coach=mkSpr("assets/quokka/q_idle.png",130,150,700);sprFlip(coach,1);
 const crewM1=groundCrew(missionOpp(1));
 const bar=mtBar("스윙!",1500);
 coachTip("안녕하세요, <b>쿼카 코치</b>예요! 티볼은 <b>티 위에 멈춘 공</b>을 치는 경기랍니다",4200);
 setKeys([["SPACE","스윙"]]);
 function ready(){ballStatic(TEE.x,TEE.y,13,true);bar.start();st.phase="aim"}
 async function act(){if(st.phase!=="aim"||st.dead)return;st.phase="swing";bar.halt();
  const r=bar.read();
  sprImg(batter,timg(S.team,"swing"));sprSwing(batter);sfx.swing();
  setTimeout(()=>{if(!st.dead)sprImg(batter,timg(S.team,"idle"))},620);
  if(r.g==="M"){st.miss++;sfx.miss();shake();
   popFB("miss","헛스윙!",TEE.x,TEE.y-90);
   coachTip("괜찮아요! 티볼은 <b>삼진 아웃이 없어요</b>. 다시 티에 올리고 침착하게!");
   await sleep(900);if(!st.dead)ready();return}
  await sleep(70);sfx.crack();zoomPunch(1.05);teeEmpty(TEE.x,TEE.y,13);
  const lx=420+Math.random()*440,ly=210+Math.random()*120;
  st.hit++;const pts=r.g==="P"?150:r.g==="G"?120:100;st.score=(st.score||0)+pts;
  ballLaunch({x0:TEE.x,y0:TEE.y,x1:lx,y1:ly,peak:250,dur:850,r0:13,r1:6,onLand:b=>{
   popFB(r.g==="P"?"perfect":"good",r.g==="P"?"PERFECT!":"안타!",b.x,b.y-40);
   setPop("#hud-score",(st.score||0).toLocaleString())}});
  $("#hud-round").innerHTML=`${Math.min(3,st.hit+1)}<small>/ 3</small>`;
  setGoal(null,st.hit,3);
  if(st.hit===1)coachTip("잘했어요! 이게 바로 티볼의 <b>타격</b>이에요. 누구나 안타를 칠 수 있죠");
  await sleep(1300);if(st.dead)return;
  if(st.hit>=3){sprImg(batter,timg(S.team,"victory"));
   mFinish(1,{score:st.score||300,coins:40,stars:st.miss===0?3:st.miss<=2?2:1,
    rows:[["안타",st.hit+" / 3"],["헛스윙",st.miss+"회"],["배운 규칙","T볼이 뭐예요?"]]})}
  else ready()}
 $("#mt-swing").onclick=e=>{e.stopPropagation();act()};
 ready();
 return{onTap(){},onAction:()=>act(),stop(){st.dead=true;bar.halt()}}};

/* ================= M2 준비물 챙기기 ================= */
MBUILD[2]=function(){
 const QZ=[
  {q:"머리를 지켜 주는 준비물은?",a:"helmet",w:["glove","ball"]},
  {q:"공을 치는 도구는?",a:"bat",w:["tee","base"]},
  {q:"공을 잡을 때 손에 끼는 것은?",a:"glove",w:["bat","helmet"]},
  {q:"공을 올려놓는 받침은?",a:"tee",w:["ball","glove"]},
  {q:"주자가 밟고 달리는 것은?",a:"base",w:["tee","bat"]},
  {q:"경기에 사용하는 공은?",a:"ball",w:["base","helmet"]}];
 const NM={helmet:"헬멧",bat:"배트",glove:"글러브",tee:"배팅 티",base:"베이스",ball:"티볼 공"};
 const st={i:0,first:0,tried:false,dead:false};
 $("#hud-left").innerHTML=hudRound(1,QZ.length)+hudGoal("준비물 <b>6개</b>를 모두 챙겨 보세요");
 $("#hud-right").innerHTML=hudScore();
 $("#hud-best").textContent=(S.best.m2||0).toLocaleString();setGoal(null,0,QZ.length);
 const coach=mkSpr("assets/quokka/q_guard.png",170,340,700);
 const mate=mkSpr(timg(S.team,"idle"),210,900,706);sprFlip(mate,-1);
 coachTip("경기 전엔 <b>준비물 점검</b>! 쿼카 코치가 물어볼게요",3600);
 function ask(){if(st.dead)return;const z=QZ[st.i];st.tried=false;
  $("#hud-round").innerHTML=`${st.i+1}<small>/ ${QZ.length}</small>`;
  setCallout(z.q);
  const opts=[z.a,...z.w].sort(()=>Math.random()-.5);
  $("#control").innerHTML=opts.map(o=>
   `<button class="iconbtn" data-k="${o}"><img src="assets/icons/${o}.png" alt=""><span>${NM[o]}</span></button>`).join("");
  $("#control").querySelectorAll(".iconbtn").forEach(b=>b.onclick=e=>{e.stopPropagation();pick(b.dataset.k,b)})}
 async function pick(k,btn){if(st.dead||st.i>=QZ.length)return;const z=QZ[st.i];
  if(k===z.a){sfx.pop();zoomPunch(1.03);
   if(!st.tried)st.first++;
   st.score=(st.score||0)+(st.tried?30:50);
   popFB("good",NM[z.a]+" OK!",640,380);
   setPop("#hud-score",(st.score||0).toLocaleString());
   st.i++;setGoal(null,st.i,QZ.length);
   if(st.i>=QZ.length){sprImg(mate,timg(S.team,"cheer"));
    coachTip("준비 완료! <b>안전 장비</b>가 있어야 경기를 시작할 수 있어요");
    await sleep(900);if(st.dead)return;
    return mFinish(2,{score:st.score,coins:40,stars:st.first===QZ.length?3:st.first>=4?2:1,
     rows:[["한 번에 정답",st.first+" / "+QZ.length],["배운 규칙","경기장과 준비물"]]})}
   await sleep(650);ask()}
  else{st.tried=true;sfx.miss();shake();
   coachTip("음… 다시 볼까요? <b>"+z.q+"</b>")}}
 ask();
 return{onTap(){},onAction(){},stop(){st.dead=true}}};

/* ================= M3 모두의 타순 ================= */
MBUILD[3]=function(){
 const st={cur:0,total:4,miss:0,dead:false},TEE={x:634,y:566};
 $("#hud-left").innerHTML=hudPanel("BATTING ORDER",[1,2,3,4].map(i=>
   `<div class="trow" id="bo${i}"><span class="dot" style="background:${TEAMS[S.team].c}"></span>
    <span class="nm">${i}번 타자</span><b id="bo${i}v">-</b></div>`).join(""))
  +hudGoal("<b>모든 선수</b>가 순서대로 한 번씩!");
 $("#hud-right").innerHTML=hudScore();
 $("#hud-best").textContent=(S.best.m3||0).toLocaleString();setGoal(null,0,4);
 setCallout("티볼은 <b>모두가 타순대로</b><br>공평하게 타석에 서요");
 let batter=mkBatter(528,706);
 const crewM3=groundCrew(missionOpp(3));
 const bar=mtBar("스윙!",1350);
 coachTip("티볼의 약속: <b>정해진 타순</b>대로, <b>모두가</b> 타석에 서요!",3800);
 setKeys([["SPACE","스윙"]]);
 function hl(){for(let i=1;i<=4;i++)$("#bo"+i).style.outline=i===st.cur+1?"1px solid rgba(245,197,66,.6)":"none"}
 function ready(){hl();ballStatic(TEE.x,TEE.y,13,true);bar.start();st.phase="aim"}
 async function act(){if(st.phase!=="aim"||st.dead)return;st.phase="swing";bar.halt();
  const r=bar.read();
  sprImg(batter,timg(S.team,"swing"));sprSwing(batter);sfx.swing();
  if(r.g==="M"){st.miss++;sfx.miss();shake();
   popFB("miss","헛스윙!",TEE.x,TEE.y-90);
   coachTip("괜찮아요, <b>같은 타자가 다시</b> 치면 돼요. 삼진은 없으니까요!");
   await sleep(850);if(!st.dead){sprImg(batter,timg(S.team,"idle"));ready()}return}
  await sleep(70);sfx.crack();zoomPunch(1.05);teeEmpty(TEE.x,TEE.y,13);
  const pts=r.g==="P"?150:r.g==="G"?120:100;st.score=(st.score||0)+pts;
  $("#bo"+(st.cur+1)+"v").textContent=r.g==="P"?"안타!":"안타";
  ballLaunch({x0:TEE.x,y0:TEE.y,x1:430+Math.random()*420,y1:220+Math.random()*110,peak:240,dur:820,r0:13,r1:6,
   onLand:b=>{popFB(r.g==="P"?"perfect":"good","안타!",b.x,b.y-40);
    setPop("#hud-score",(st.score||0).toLocaleString())}});
  await sleep(500);if(st.dead)return;
  await mtMove(batter,1120,700,700);
  batter.remove();
  st.cur++;setGoal(null,st.cur,4);
  if(st.cur>=st.total){
   const v=mkSpr(timg(S.team,"cheer"),235,640,706);
   return mFinish(3,{score:st.score,coins:45,stars:st.miss===0?3:st.miss<=2?2:1,
    rows:[["타석에 선 선수","4 / 4"],["헛스윙",st.miss+"회"],["배운 규칙","타격 규칙 · 타순"]]})}
  batter=mkSpr(timg(S.team,"idle"),235,-60,706);
  await mtMove(batter,528,706,600);
  if(!st.dead)ready()}
 $("#mt-swing").onclick=e=>{e.stopPropagation();act()};
 ready();
 return{onTap(){},onAction:()=>act(),stop(){st.dead=true;bar.halt()}}};

/* ================= M4 반시계 한 바퀴 ================= */
MBUILD[4]=function(){
 const ORDER=[LGC.FIRST,LGC.SECOND,LGC.THIRD,LGC.HOME];
 const LABEL=["1루","2루","3루","홈"];
 const st={round:0,step:0,wrong:0,dead:false,busy:false};
 $("#hud-left").innerHTML=hudRound(1,2)+hudGoal("<b>반시계 방향</b>으로 베이스를 밟아요");
 $("#hud-right").innerHTML=hudScore();
 $("#hud-best").textContent=(S.best.m4||0).toLocaleString();setGoal(null,0,2);
 setCallout("안타! 다음 베이스를<br><b>순서대로 터치</b>하세요");
 [LGC.FIRST,LGC.SECOND,LGC.THIRD,LGC.HOME].forEach(p=>baseMark(p.x,p.y,false));
 let runner=mkSpr(timg(S.team,"run"),96*lgDep(LGC.HOME.y),LGC.HOME.x,LGC.HOME.y);
 let hint=null;
 coachTip("티볼 주루는 <b>반시계 방향</b>! 1루부터 차례대로 밟아요",3800);
 function hintNext(){hint&&hint.remove();const p=ORDER[st.step];hint=baseMark(p.x,p.y,true)}
 async function start(){st.round++;st.step=0;
  $("#hud-round").innerHTML=`${st.round}<small>/ 2</small>`;
  sprPos(runner,LGC.HOME.x,LGC.HOME.y,96*lgDep(LGC.HOME.y));
  await mtBanner("안타!","이제 어느 베이스로 달릴까요?");
  hintNext();st.busy=false}
 async function tap(pt){if(st.dead||st.busy)return;
  let bi=-1,bd=1e9;
  ORDER.forEach((p,i)=>{const d=Math.hypot(pt.x-p.x,pt.y-p.y);if(d<bd){bd=d;bi=i}});
  if(bd>85)return;
  if(bi!==st.step){st.wrong++;sfx.miss();shake();
   coachTip(`거긴 아직이에요! <b>반시계 방향</b> — 다음은 <b>${LABEL[st.step]}</b>!`);return}
  st.busy=true;sfx.pop();
  const p=ORDER[st.step];
  await mtMove(runner,p.x,p.y,st.step===3?900:700,96);
  popFB("good",LABEL[st.step]+"!",p.x,p.y-70);
  st.score=(st.score||0)+100;setPop("#hud-score",(st.score||0).toLocaleString());
  st.step++;
  if(st.step>=4){crowdSwell(1.2);sfx.fanfare();
   popFB("perfect","득점!",LGC.HOME.x,LGC.HOME.y-90);
   setGoal(null,st.round,2);
   if(st.round>=2){sprImg(runner,timg(S.team,"victory"));
    return mFinish(4,{score:st.score,coins:45,stars:st.wrong===0?3:st.wrong<=2?2:1,
     rows:[["홈인",st.round+"회"],["헷갈린 횟수",st.wrong+"회"],["배운 규칙","루 달리기 · 반시계"]]})}
   await sleep(700);if(!st.dead)start();return}
  hintNext();st.busy=false}
 start();
 return{onTap:pt=>tap(pt),onAction(){},stop(){st.dead=true}}};

/* ================= M5 아웃을 잡아라 ================= */
MBUILD[5]=function(){
 const st={play:0,outs:0,fail:0,dead:false,fx:640,fy:340,tx:640,ty:340,raf:0,last:0,phase:"idle"};
 const PLAYS=["F","G","F"];
 $("#hud-left").innerHTML=hudPanel("OUT COUNT",`<div class="outrow"><span class="olabel">OUTS</span>
   <span class="odot" id="mo1"></span><span class="odot" id="mo2"></span><span class="odot" id="mo3"></span></div>`)
  +hudGoal("<b>아웃 3개</b>를 잡아 보세요");
 $("#hud-right").innerHTML=hudScore();
 $("#hud-best").textContent=(S.best.m5||0).toLocaleString();setGoal(null,0,3);
 setCallout("필드를 터치해<br><b>공을 잡으러</b> 가세요!");
 const fielder=mkSpr(timg(S.team,"fielder"),96*lgDep(st.fy),st.fx,st.fy);
 const fb=mkSpr(timg(S.team,"fielder"),96*lgDep(LGC.FIRST.y),LGC.FIRST.x+26,LGC.FIRST.y);sprFlip(fb,-1);
 const OPPM=missionOpp(5);
 const ob=mkSpr(timg(OPPM,"idle"),96*lgDep(LGC.HOME.y),LGC.HOME.x-46,LGC.HOME.y);
 const m52=mkSpr(timg(S.team,"fielder"),96*lgDep(LGC.SECOND.y),LGC.SECOND.x+32,LGC.SECOND.y);
 const m53=mkSpr(timg(S.team,"fielder"),96*lgDep(LGC.THIRD.y),LGC.THIRD.x-30,LGC.THIRD.y);sprFlip(m53,-1);
 coachTip("아웃은 세 가지! <b>플라이 · 포스 · 태그</b>. 먼저 몸으로 익혀 봐요",3800);
 setKeys([["← ↑ ↓ →","이동"]]);
 function loop(ts){st.raf=requestAnimationFrame(loop);
  const dt=Math.min(.05,(ts-(st.last||ts))/1000);st.last=ts;
  const kv=keyVec();if(kv.x||kv.y){st.tx=Math.max(280,Math.min(1000,st.fx+kv.x*70));st.ty=Math.max(245,Math.min(560,st.fy+kv.y*70))}
  const dx=st.tx-st.fx,dy=st.ty-st.fy,d=Math.hypot(dx,dy);
  if(d>4){const k=Math.min(1,380*dt/d);st.fx+=dx*k;st.fy+=dy*k;
   sprRun(fielder,true);sprFlip(fielder,dx<0?-1:1);
   sprPos(fielder,st.fx,st.fy,96*lgDep(st.fy))}
  else if(fielder.classList.contains("runb")){sprRun(fielder,false)}}
 st.raf=requestAnimationFrame(loop);
 async function next(){if(st.dead)return;
  if(st.outs>=3)return win();
  const type=PLAYS[st.play%3];st.play++;st.phase="play";
  aerTee();
  await mtBanner(type==="F"?"플라이 볼!":"땅볼!",type==="F"?"떨어지기 전에 잡으면 아웃":"잡아서 1루로 보내면 포스 아웃",1200);
  sprImg(ob,timg(OPPM,"swing"));sprSwing(ob);
  setTimeout(()=>{try{sprImg(ob,timg(OPPM,"idle"))}catch(e){}},520);
  aerTeeEmpty();
  sfx.crack();
  const lx=380+Math.random()*520,ly=type==="F"?260+Math.random()*150:390+Math.random()*80;
  const mk=baseMark(lx,ly,true);
  ballLaunch({x0:LGC.HOME.x,y0:LGC.HOME.y,x1:lx,y1:ly,peak:type==="F"?310:26,dur:type==="F"?2200:1500,r0:10,r1:8*lgDep(ly),
   onLand:async b=>{mk.remove();if(st.dead)return;
    const tol=50*lgDep(ly)+22+(window.__FAST?900:0),d=Math.hypot(st.fx-lx,st.fy-ly);
    if(d<=tol){sfx.pop();zoomPunch(1.04);
     sprRun(fielder,false);poseCatch(fielder);
     if(type==="F"){st.outs++;popFB("catch","플라이 아웃!",lx,ly-70)}
     else{popFB("good","캐치!",lx,ly-60);
      await sleep(300);if(st.dead)return;
      sprImg(fielder,timg(S.team,"throw"));sfx.throwS();
      await new Promise(r=>ballLaunch({x0:st.fx,y0:st.fy-50,x1:LGC.FIRST.x,y1:LGC.FIRST.y,peak:100,dur:550,r0:8,r1:8,
       onLand:()=>{sfx.pop();sprImg(fb,timg(S.team,"catch"));
        popFB("catch","포스 아웃!",LGC.FIRST.x,LGC.FIRST.y-70);r()}}));
      st.outs++;poseCatch(fielder)}
     st.score=(st.score||0)+120;setPop("#hud-score",(st.score||0).toLocaleString());
     for(let i=1;i<=3;i++)$("#mo"+i).classList.toggle("on",st.outs>=i);
     setGoal(null,st.outs,3)}
    else{st.fail++;sfx.miss();shake();
     popFB("miss","세이프…",lx,ly-56);
     coachTip(type==="F"?"플라이는 <b>낙하지점에 먼저</b> 가 있어야 잡아요!":"땅볼은 <b>공이 오는 길목</b>을 막아서요!")}
    await sleep(800);if(!st.dead)next()}})}
 function win(){st.phase="end";
  sprImg(fielder,timg(S.team,"victory"));
  mFinish(5,{score:st.score,coins:45,stars:st.fail===0?3:st.fail<=2?2:1,
   rows:[["잡은 아웃","3 (플라이·포스)"],["놓친 공",st.fail+"회"],["배운 규칙","아웃 규칙"]]})}
 next();
 return{onTap(pt){if(st.dead)return;st.tx=Math.max(280,Math.min(1000,pt.x));st.ty=Math.max(245,Math.min(560,pt.y))},
  onAction(){},stop(){st.dead=true;cancelAnimationFrame(st.raf)}}};

/* ================= M6 페어? 파울! ================= */
MBUILD[6]=function(){
 const st={fair:0,foul:0,miss:0,dead:false},TEE={x:634,y:566};
 $("#hud-left").innerHTML=hudPanel("BALL LOG",`
   <div class="trow"><span class="dot" style="background:#3ADE8E"></span><span class="nm">페어볼</span><b id="m6f">0</b></div>
   <div class="trow"><span class="dot" style="background:#FF5A5A"></span><span class="nm">파울볼</span><b id="m6u">0</b></div>`)
  +hudGoal("<b>페어볼 3개</b>를 만들어 보세요");
 $("#hud-right").innerHTML=hudScore();
 $("#hud-best").textContent=(S.best.m6||0).toLocaleString();setGoal(null,0,3);
 setCallout("타이밍이 어긋나면 <b>파울</b>!<br>파울은 아웃이 아니에요");
 const batter=mkBatter(528,706);
 const crewM6=groundCrew(missionOpp(6));
 const bar=mtBar("스윙!",1250);
 coachTip("<b>파울 라인 안</b>은 페어, 밖은 파울! 파울이면 <b>다시 티에 올려요</b>",4000);
 setKeys([["SPACE","스윙"]]);
 function ready(){ballStatic(TEE.x,TEE.y,13,true);bar.start();st.phase="aim"}
 async function act(){if(st.phase!=="aim"||st.dead)return;st.phase="swing";bar.halt();
  const r=bar.read();
  sprImg(batter,timg(S.team,"swing"));sprSwing(batter);sfx.swing();
  setTimeout(()=>{if(!st.dead)sprImg(batter,timg(S.team,"idle"))},620);
  if(r.g==="M"){st.miss++;sfx.miss();
   popFB("miss","헛스윙!",TEE.x,TEE.y-90);
   coachTip("헛스윙도 괜찮아요. <b>삼진 없이</b> 다시 도전!");
   await sleep(850);if(!st.dead)ready();return}
  await sleep(70);sfx.crack();zoomPunch(1.05);teeEmpty(TEE.x,TEE.y,13);
  const foul=r.ad>.13; // 타이밍이 많이 어긋나면 파울
  if(foul){st.foul++;$("#m6u").textContent=st.foul;
   const side=r.diff<0?-1:1;
   ballLaunch({x0:TEE.x,y0:TEE.y,x1:640+side*470,y1:430+Math.random()*60,peak:150,dur:700,r0:13,r1:7,
    onLand:async b=>{popFB("miss","파울!",b.x,b.y-46);sfx.land();
     await mtBanner("파울볼!","아웃이 아니에요 — 다시 티에 올리고 한 번 더",1600);
     coachTip("파울은 <b>몇 번이 되어도 괜찮아요</b>. 다시 침착하게!");
     if(!st.dead)ready()}});
   return}
  st.fair++;$("#m6f").textContent=st.fair;
  const pts=r.g==="P"?150:120;st.score=(st.score||0)+pts;
  ballLaunch({x0:TEE.x,y0:TEE.y,x1:500+Math.random()*280,y1:220+Math.random()*110,peak:240,dur:820,r0:13,r1:6,
   onLand:async b=>{popFB("good","페어! 안타!",b.x,b.y-42);
    setPop("#hud-score",(st.score||0).toLocaleString());
    setGoal(null,st.fair,3);
    await sleep(700);if(st.dead)return;
    if(st.fair>=3){sprImg(batter,timg(S.team,"victory"));
     mFinish(6,{score:st.score,coins:45,stars:st.foul<=1?3:st.foul<=3?2:1,
      rows:[["페어볼","3개"],["파울볼",st.foul+"개 (아웃 아님!)"],["배운 규칙","페어볼 · 파울볼"]]})}
    else ready()}})}
 $("#mt-swing").onclick=e=>{e.stopPropagation();act()};
 ready();
 return{onTap(){},onAction:()=>act(),stop(){st.dead=true;bar.halt()}}};

/* ================= M7 잡고 던져라 ================= */
MBUILD[7]=function(){
 const st={relay:0,fail:0,dead:false,fx:600,fy:360,tx:600,ty:360,raf:0,last:0,phase:"idle",rx:0,rt:0,rraf:0};
 $("#hud-left").innerHTML=hudRound(1,3)+hudGoal("<b>잡고 → 1루 송구</b> 3번 성공!");
 $("#hud-right").innerHTML=hudScore();
 $("#hud-best").textContent=(S.best.m7||0).toLocaleString();setGoal(null,0,3);
 setCallout("땅볼을 잡으면<br><b>타이밍 맞춰 송구!</b>");
 const fielder=mkSpr(timg(S.team,"fielder"),96*lgDep(st.fy),st.fx,st.fy);
 const fb=mkSpr(timg(S.team,"fielder"),96*lgDep(LGC.FIRST.y),LGC.FIRST.x+26,LGC.FIRST.y);sprFlip(fb,-1);
 const fb2=mkSpr(timg(S.team,"fielder"),96*lgDep(LGC.SECOND.y),LGC.SECOND.x+30,LGC.SECOND.y);
 const fb3=mkSpr(timg(S.team,"fielder"),96*lgDep(LGC.THIRD.y),LGC.THIRD.x-28,LGC.THIRD.y);sprFlip(fb3,-1);
 const OPPM=missionOpp(7);
 const ob=mkSpr(timg(OPPM,"idle"),96*lgDep(LGC.HOME.y),LGC.HOME.x-46,LGC.HOME.y);
 const TGTS=[{p:LGC.FIRST,s:fb,n:"1루"},{p:LGC.SECOND,s:fb2,n:"2루"},{p:LGC.THIRD,s:fb3,n:"3루"}];
 let tgt=TGTS[0];
 coachTip("수비의 완성은 <b>송구</b>! 받을 동료의 가슴을 향해 정확히 던져요",3600);
 function loop(ts){st.raf=requestAnimationFrame(loop);
  const dt=Math.min(.05,(ts-(st.last||ts))/1000);st.last=ts;
  const kv=keyVec();if(kv.x||kv.y){st.tx=Math.max(280,Math.min(1000,st.fx+kv.x*70));st.ty=Math.max(245,Math.min(560,st.fy+kv.y*70))}
  const dx=st.tx-st.fx,dy=st.ty-st.fy,d=Math.hypot(dx,dy);
  if(d>4){const k=Math.min(1,380*dt/d);st.fx+=dx*k;st.fy+=dy*k;
   sprRun(fielder,true);sprFlip(fielder,dx<0?-1:1);
   sprPos(fielder,st.fx,st.fy,96*lgDep(st.fy))}
  else if(fielder.classList.contains("runb"))sprRun(fielder,false)}
 st.raf=requestAnimationFrame(loop);
 async function next(){if(st.dead)return;
  if(st.relay>=3)return win();
  st.phase="field";tgt=TGTS[st.relay%3];
  $("#hud-round").innerHTML=`${st.relay+1}<small>/ 3</small>`;
  aerTee();
  await mtBanner("땅볼!",`잡아서 ${tgt.n}로 송구!`,1100);
  sprImg(ob,timg(OPPM,"swing"));sprSwing(ob);
  setTimeout(()=>{try{sprImg(ob,timg(OPPM,"idle"))}catch(e){}},520);
  aerTeeEmpty();
  sfx.crack();
  const lx=380+Math.random()*450,ly=380+Math.random()*90;
  const mk=baseMark(lx,ly,true);
  ballLaunch({x0:LGC.HOME.x,y0:LGC.HOME.y,x1:lx,y1:ly,peak:24,dur:1450,r0:10,r1:9*lgDep(ly),
   onLand:b=>{mk.remove();if(st.dead)return;
    const tol=50*lgDep(ly)+22+(window.__FAST?900:0),d=Math.hypot(st.fx-lx,st.fy-ly);
    if(d<=tol){sfx.pop();sprRun(fielder,false);poseCatch(fielder);
     popFB("good","캐치!",lx,ly-56);throwPhase()}
    else{st.fail++;sfx.miss();shake();popFB("miss","놓쳤다!",lx,ly-56);
     coachTip("공이 오는 <b>길목을 먼저</b> 막아서요!");
     setTimeout(()=>!st.dead&&next(),800)}}})}
 function throwPhase(){st.phase="throw";st.rt=performance.now();
  const ring=baseMark(tgt.p.x,tgt.p.y,true);st._ring=ring;
  $("#control").innerHTML=`<button class="bigbtn" id="mt-throw">송구!</button>`;
  $("#mt-throw").onclick=e=>{e.stopPropagation();doThrow()};
  (function rl(){if(st.phase!=="throw")return;st.rraf=requestAnimationFrame(rl);
   const t=(performance.now()-st.rt)/1000;
   st.rx=tgt.p.x+Math.sin(t*3.4)*95;
   $("#reticle").style.left=st.rx+"px";$("#reticle").style.top=(tgt.p.y-30)+"px";
   /* 락온 피드백: 성공 범위에 들어오면 금색으로 */
   const lk=Math.abs(st.rx-tgt.p.x)<=34;
   if(lk!==st._lk){st._lk=lk;
    const rg=$("#m7-ring"),dot=$("#m7-dot");
    if(rg)rg.setAttribute("stroke",lk?"#FFD866":"rgba(255,255,255,.95)");
    if(dot)dot.setAttribute("fill",lk?"#FFD866":"#fff");
    $("#reticle").style.filter=lk?"drop-shadow(0 0 12px rgba(255,216,102,.95))":""}})();
  $("#reticle").innerHTML=`<svg width="58" height="58" viewBox="0 0 58 58">
   <circle cx="29" cy="29" r="19" fill="none" stroke="rgba(0,0,0,.55)" stroke-width="5"/>
   <circle id="m7-ring" cx="29" cy="29" r="19" fill="none" stroke="rgba(255,255,255,.95)" stroke-width="2.5"/>
   <circle id="m7-dot" cx="29" cy="29" r="3" fill="#fff"/></svg>`;
  setCallout(`조준원이 ${tgt.n} 동료 위에서<br><b>금색으로 변할 때</b> 송구!`)}
 async function doThrow(){if(st.phase!=="throw"||st.dead)return;st.phase="ball";
  cancelAnimationFrame(st.rraf);$("#reticle").innerHTML="";st._ring&&st._ring.remove();
  const off=Math.abs(st.rx-tgt.p.x);
  sprImg(fielder,timg(S.team,"throw"));sfx.throwS();
  ballLaunch({x0:st.fx,y0:st.fy-50,x1:st.rx,y1:tgt.p.y,peak:100,dur:550,r0:8,r1:8,
   onLand:async()=>{if(st.dead)return;
    if(off<=34||window.__FAST){sfx.pop();zoomPunch(1.04);sprImg(tgt.s,timg(S.team,"catch"));
     setTimeout(()=>{try{sprImg(tgt.s,timg(S.team,"fielder"))}catch(e){}},800);
     st.relay++;st.score=(st.score||0)+150;
     popFB("catch",tgt.n+" 포스 아웃!",tgt.p.x,tgt.p.y-70);
     setPop("#hud-score",(st.score||0).toLocaleString());setGoal(null,st.relay,3)}
    else{st.fail++;sfx.miss();shake();
     popFB("miss","악송구…",st.rx,tgt.p.y-50);
     coachTip(`<b>${tgt.n} 동료 가슴 방향</b>으로! 조준원이 정중앙일 때 던져요`)}
    poseCatch(fielder);
    setCallout("땅볼을 잡으면<br><b>타이밍 맞춰 송구!</b>");
    await sleep(750);if(!st.dead)next()}})}
 function win(){sprImg(fielder,timg(S.team,"victory"));
  mFinish(7,{score:st.score,coins:50,stars:st.fail===0?3:st.fail<=2?2:1,
   rows:[["송구 아웃","3회"],["실수",st.fail+"회"],["배운 규칙","수비와 송구"]]})}
 next();
 return{onTap(pt){if(st.phase==="field"){st.tx=Math.max(280,Math.min(1000,pt.x));st.ty=Math.max(245,Math.min(560,pt.y))}},
  onAction(){if(st.phase==="throw")doThrow()},
  stop(){st.dead=true;cancelAnimationFrame(st.raf);cancelAnimationFrame(st.rraf)}}};

/* ================= M8 점수 내고 지켜라 ================= */
MBUILD[8]=function(){
 const st={half:"atk",bat:0,runs:0,opp:0,outs:0,bases:[0,0,0],miss:0,dead:false,
  fx:640,fy:340,tx:640,ty:340,raf:0,last:0,play:0};
 const opp=missionOpp(8);let ob8=null;
 const crewM8=[[LGC.FIRST.x+30,LGC.FIRST.y],[LGC.SECOND.x+34,LGC.SECOND.y],[LGC.THIRD.x-32,LGC.THIRD.y],[455,296],[825,296]].map(([x,y])=>{
  const s=mkSpr(timg(opp,"fielder"),96*lgDep(y),x,y);sprFlip(s,x>640?-1:1);return s});
 $("#hud-left").innerHTML=hudPanel("SCOREBOARD",
   `<div class="sbrow atk" id="m8my"><span class="dot" style="background:${TEAMS[S.team].c}"></span>
    <span class="nm">${TEAMS[S.team].n}</span><b id="m8myr">0</b></div>
   <div class="sbrow" id="m8op"><span class="dot" style="background:${TEAMS[opp].c}"></span>
    <span class="nm">${TEAMS[opp].n}</span><b id="m8opr">0</b></div>
   <div class="outrow"><span class="olabel">OUT</span>
    <span class="odot" id="m8o1"></span><span class="odot" id="m8o2"></span><span class="odot" id="m8o3"></span></div>`)
  +hudGoal("공격에서 점수 내고, 수비에서 지키기!");
 $("#hud-right").innerHTML=hudScore();
 $("#hud-best").textContent=(S.best.m8||0).toLocaleString();
 setCallout("한 이닝 승부!<br><b>공격 → 수비</b> 순서예요");
 let batter=mkSpr(timg(S.team,"idle"),96*lgDep(LGC.HOME.y),LGC.HOME.x-46,LGC.HOME.y);
 let fielder=null,fb=null;
 const bar=mtBar("스윙!",1250);
 coachTip("경기는 <b>공격과 수비가 번갈아</b>! 점수판을 보며 흐름을 익혀요",3800);
 setKeys([["SPACE","스윙"]]);
 /* 항공뷰 주자 비주얼 (결승전과 동일한 베이스 경유 주루) */
 const GP=[[LGC.FIRST.x-28,LGC.FIRST.y+6],[LGC.SECOND.x-28,LGC.SECOND.y+6],[LGC.THIRD.x-28,LGC.THIRD.y+6]];
 const mRun=[null,null,null];
 function mPath(s,from,to){let p=Promise.resolve();sprImg(s,timg(S.team,"run"));
  for(let b2=from+1;b2<=to;b2++){const pt=b2===3?[LGC.HOME.x,LGC.HOME.y]:GP[b2];
   p=p.then(()=>mtMove(s,pt[0],pt[1],520,96,lgDep))}
  return p.then(()=>{if(to<3){try{sprImg(s,timg(S.team,"idle"))}catch(e){}}else{try{s.remove()}catch(e){}}})}
 function mAdv(n){
  for(let i=2;i>=0;i--){if(!mRun[i])continue;const s=mRun[i];mRun[i]=null;
   const d=i+n;
   if(d>=3)mPath(s,i,3);
   else{mRun[d]=s;mPath(s,i,d)}}
  const nb=mkSpr(timg(S.team,"run"),96*lgDep(LGC.HOME.y),LGC.HOME.x+40,LGC.HOME.y);
  sfx.drop();
  if(n>=3)mPath(nb,-1,3);
  else{mRun[n-1]=nb;mPath(nb,-1,n-1)}}
 function outsHud(){for(let i=1;i<=3;i++)$("#m8o"+i).classList.toggle("on",st.outs>=i)}
 function advance(n){let r=0;
  for(let k=0;k<n;k++){if(st.bases[2])r++;st.bases[2]=st.bases[1];st.bases[1]=st.bases[0];st.bases[0]=0;
   if(k===n-1)st.bases[n-1]=1}
  // simpler: shift once per base
  return r}
 function push(hitBases){let r=0;
  for(let k=0;k<hitBases;k++){if(st.bases[2])r++;st.bases[2]=st.bases[1];st.bases[1]=st.bases[0];st.bases[0]=0}
  st.bases[hitBases-1]=1;return r}
 function ready(){aerTee();bar.start();st.phase="aim"}
 async function act(){if(st.half!=="atk"||st.phase!=="aim"||st.dead)return;st.phase="swing";bar.halt();
  const r=bar.read();
  sprImg(batter,timg(S.team,"swing"));sprSwing(batter);sfx.swing();
  setTimeout(()=>{if(!st.dead)sprImg(batter,timg(S.team,"idle"))},620);
  if(r.g==="M"){st.miss++;sfx.miss();popFB("miss","헛스윙!",LGC.HOME.x,LGC.HOME.y-80);
   await sleep(800);if(!st.dead)ready();return}
  await sleep(70);sfx.crack();zoomPunch(1.05);aerTeeEmpty();
  st.bat++;
  let hitB=0,outTxt="";
  if(r.g==="P")hitB=Math.random()<.5?2:1;
  else if(r.g==="G")hitB=1;
  else hitB=Math.random()<.5?1:0;
  const lx=430+Math.random()*420,ly=hitB?250+Math.random()*100:385+Math.random()*75;
  ballLaunch({x0:LGC.HOME.x,y0:LGC.HOME.y-6,x1:lx,y1:ly,peak:hitB?230:26,dur:800,r0:6.5,r1:5,
   onLand:async b=>{if(st.dead)return;
    if(hitB){mAdv(hitB);
     const got=push(hitB);
     popFB("good",hitB===2?"2루타!":"안타!",b.x,b.y-42);
     if(got){st.runs+=got;setPop("#m8myr",st.runs);crowdSwell(1.2);
      popFB("perfect","득점!",640,320)}
     st.score=(st.score||0)+100*hitB+got*150}
    else{st.outs++;outsHud();sfx.miss();
     popFB("miss","땅볼 아웃!",b.x,b.y-42);
     coachTip("아웃도 경기의 일부! <b>3아웃이면 공수교대</b>예요")}
    setPop("#hud-score",(st.score||0).toLocaleString());
    await sleep(850);if(st.dead)return;
    if(st.outs>=3||st.bat>=5)switchSides();else ready()}})}
 async function switchSides(){st.half="def";st.outs=0;outsHud();
  $("#m8my").classList.remove("atk");$("#m8op").classList.add("atk");
  await mtBanner("공수교대!",`이제 ${TEAMS[opp].n}의 공격 — 수비로 막아요!`,1800);
  $("#gbg").src=A+"bg/bg_nb7.jpg";
  $("#sprites").innerHTML="";ballClear();$("#control").innerHTML="";
  mRun[0]=mRun[1]=mRun[2]=null;
  setKeys([["← ↑ ↓ →","이동"]]);
  st.fx=640;st.fy=340;st.tx=640;st.ty=340;
  fielder=mkSpr(timg(S.team,"fielder"),96*lgDep(st.fy),st.fx,st.fy);
  fb=mkSpr(timg(S.team,"fielder"),96*lgDep(LGC.FIRST.y),LGC.FIRST.x+26,LGC.FIRST.y);sprFlip(fb,-1);
  const mf2=mkSpr(timg(S.team,"fielder"),96*lgDep(LGC.SECOND.y),LGC.SECOND.x+32,LGC.SECOND.y);
  const mf3=mkSpr(timg(S.team,"fielder"),96*lgDep(LGC.THIRD.y),LGC.THIRD.x-30,LGC.THIRD.y);sprFlip(mf3,-1);
  ob8=mkSpr(timg(opp,"idle"),96*lgDep(LGC.HOME.y),LGC.HOME.x-46,LGC.HOME.y);
  setCallout("공을 잡으면 아웃!<br>놓치면 실점이에요");
  function loop(ts){st.raf=requestAnimationFrame(loop);
   const dt=Math.min(.05,(ts-(st.last||ts))/1000);st.last=ts;
   const kv=keyVec();if(kv.x||kv.y){st.tx=Math.max(280,Math.min(1000,st.fx+kv.x*70));st.ty=Math.max(245,Math.min(560,st.fy+kv.y*70))}
   const dx=st.tx-st.fx,dy=st.ty-st.fy,d=Math.hypot(dx,dy);
   if(d>4){const k=Math.min(1,380*dt/d);st.fx+=dx*k;st.fy+=dy*k;
    sprRun(fielder,true);sprFlip(fielder,dx<0?-1:1);
    sprPos(fielder,st.fx,st.fy,96*lgDep(st.fy))}
   else if(fielder.classList.contains("runb"))sprRun(fielder,false)}
  st.raf=requestAnimationFrame(loop);
  defPlay()}
 async function defPlay(){if(st.dead)return;
  if(st.outs>=3||st.play>=5)return finish();
  st.play++;
  const type=Math.random()<.55?"F":"G";
  aerTee();
  await mtBanner(type==="F"?"플라이 볼!":"땅볼!","",900);
  if(ob8){sprImg(ob8,timg(opp,"swing"));sprSwing(ob8);
   setTimeout(()=>{try{ob8&&sprImg(ob8,timg(opp,"idle"))}catch(e){}},520)}
  aerTeeEmpty();
  sfx.crack();
  const lx=380+Math.random()*520,ly=type==="F"?260+Math.random()*150:390+Math.random()*80;
  const mk=baseMark(lx,ly,true);
  ballLaunch({x0:LGC.HOME.x,y0:LGC.HOME.y,x1:lx,y1:ly,peak:type==="F"?300:26,dur:type==="F"?2100:1450,r0:10,r1:8*lgDep(ly),
   onLand:async b=>{mk.remove();if(st.dead)return;
    const tol=50*lgDep(ly)+22+(window.__FAST?900:0),d=Math.hypot(st.fx-lx,st.fy-ly);
    if(d<=tol){st.outs++;outsHud();sfx.pop();
     sprRun(fielder,false);poseCatch(fielder);
     popFB("catch","아웃!",lx,ly-64);
     st.score=(st.score||0)+120;setPop("#hud-score",(st.score||0).toLocaleString())}
    else{st.opp++;setPop("#m8opr",st.opp);sfx.miss();shake();
     popFB("miss","실점…",lx,ly-56)}
    await sleep(750);if(!st.dead)defPlay()}})}
 function finish(){
  const win=st.runs>st.opp;
  if(!win){setTimeout(()=>showResult({title:"INNING RESULT",score:st.score||0,
   best:S.best.m8||0,isNew:false,coins:15,
   stars:0,rows:[["최종",st.runs+" : "+st.opp],["결과","아쉽게 패배… 한 번 더!"]],
   onRetry:()=>runMission(8)}),900);addCoins(15);return}
  mFinish(8,{score:st.score,coins:55,stars:st.opp===0?3:2,
   rows:[["최종",st.runs+" : "+st.opp],["결과","승리!"],["배운 규칙","점수와 경기 흐름"]]})}
 $("#mt-swing").onclick=e=>{e.stopPropagation();act()};
 ready();
 return{onTap(pt){if(st.half==="atk")return;
   st.tx=Math.max(280,Math.min(1000,pt.x));st.ty=Math.max(245,Math.min(560,pt.y))},
  onAction(){if(st.half==="atk")act()},
  stop(){st.dead=true;bar.halt();cancelAnimationFrame(st.raf)}}};

/* ================= M9 안전이 먼저 ================= */
MBUILD[9]=function(){
 const st={ok:0,slip:0,dead:false},TEE={x:634,y:566};
 $("#hud-left").innerHTML=hudRound(1,3)+hudGoal("치고 나서 <b>배트를 내려놓기</b> 3번!");
 $("#hud-right").innerHTML=hudScore();
 $("#hud-best").textContent=(S.best.m9||0).toLocaleString();setGoal(null,0,3);
 setCallout("배트를 던지면 위험해요!<br>치고 → <b>내려놓고</b> → 달려요");
 const batter=mkBatter(528,706);
 const coach=mkSpr("assets/quokka/q_guard.png",140,160,700);
 const crewM9=groundCrew(missionOpp(9));
 const bar=mtBar("스윙!",1400);
 let dropT=0;
 coachTip("마지막 미션! 티볼의 약속 — <b>안전과 예절</b>을 몸에 익혀요",3600);
 function rearm(){if(!$("#mt-swing")){const nb=mtBar("스윙!",1400);
  bar.start=nb.start;bar.halt=nb.halt;bar.read=nb.read;
  $("#mt-swing").onclick=e=>{e.stopPropagation();act()}}}
 function ready(){rearm();ballStatic(TEE.x,TEE.y,13,true);bar.start();st.phase="aim"}
 async function act(){if(st.dead)return;
  if(st.phase==="aim"){st.phase="swing";bar.halt();
   const r=bar.read();
   sprImg(batter,timg(S.team,"swing"));sprSwing(batter);sfx.swing();
   if(r.g==="M"){sfx.miss();popFB("miss","헛스윙!",TEE.x,TEE.y-90);
    await sleep(800);if(!st.dead){sprImg(batter,timg(S.team,"idle"));ready()}return}
   await sleep(70);sfx.crack();zoomPunch(1.05);teeEmpty(TEE.x,TEE.y,13);
   ballLaunch({x0:TEE.x,y0:TEE.y,x1:460+Math.random()*360,y1:230+Math.random()*100,peak:230,dur:800,r0:13,r1:6});
   st.phase="drop";dropT=performance.now();
   $("#control").innerHTML=`<button class="bigbtn gold" id="mt-drop">배트 내려놓기!</button>`;
   $("#mt-drop").onclick=e=>{e.stopPropagation();drop()};
   setCallout("<b>지금!</b> 배트를 내려놓고 출발!");
   setTimeout(()=>{if(st.phase==="drop"&&!st.dead)late()},window.__FAST?3000:1700);
   return}
  if(st.phase==="drop")drop()}
 async function drop(){if(st.phase!=="drop"||st.dead)return;st.phase="run";
  sfx.drop();sfx.pop();st.ok++;st.score=(st.score||0)+150;
  popFB("good","안전한 출발!",560,520);
  setPop("#hud-score",(st.score||0).toLocaleString());
  sprImg(batter,timg(S.team,"run"));
  $("#hud-round").innerHTML=`${Math.min(3,st.ok+1)}<small>/ 3</small>`;setGoal(null,st.ok,3);
  await sleep(700);if(st.dead)return;
  sprImg(batter,timg(S.team,"idle"));
  if(st.ok>=3)return manners();
  setCallout("좋아요! 한 번 더!");ready()}
 async function late(){st.phase="late";st.slip++;
  sfx.miss();shake();
  popFB("miss","배트 조심!",TEE.x,TEE.y-80);
  coachTip("<b>배트를 든 채 달리면 위험!</b> 꼭 내려놓고 출발해요");
  await sleep(950);if(st.dead)return;
  sprImg(batter,timg(S.team,"idle"));setCallout("다시! 치고 → <b>내려놓고</b> → 달려요");ready()}
 function manners(){setCallout(null);
  $("#control").innerHTML=`<button class="bigbtn" id="mt-bow">상대 팀과 인사하기</button>`;
  $("#mt-bow").onclick=async e=>{e.stopPropagation();if(st.dead)return;
   sfx.fanfare();crowdSwell(1.3);
   sprImg(batter,timg(S.team,"cheer"));
   const oppK=finalOpp();
   const o1=mkSpr(timg(oppK,"cheer"),200,860,700);sprFlip(o1,-1);
   sprImg(coach,"assets/quokka/q_victory.png");
   await mtBanner("경기 끝! 서로 인사해요","이기고 지는 것보다 큰 것 — 함께한 경기",1900);
   mFinish(9,{score:st.score,coins:60,stars:st.slip===0?3:st.slip<=1?2:1,
    rows:[["안전한 출발","3회"],["아차차",st.slip+"회"],["배운 규칙","안전과 예절"]]})}}
 $("#mt-swing").onclick=e=>{e.stopPropagation();act()};
 ready();
 return{onTap(){},onAction:()=>act(),stop(){st.dead=true;bar.halt()}}};

/* ================= FINAL 결승전 (2이닝 실전) ================= */
function runFinal(opp,diff){
 if(opp)FINAL_OPP=opp;
 if(diff)FINAL_DIFF=diff;
 FINAL_BGS=["bg/final_sunset.jpg","bg/final_night.jpg"].sort(()=>Math.random()-.5);
 GAMES.match.bg="bg/bg_nb7.jpg"; /* 플레이는 항공뷰에서 — 실사 배경은 이닝 인트로로만 */
 GAMES.match.ko="결승전 · vs "+TEAMS[finalOpp()].n+" · "+DIFFS[FINAL_DIFF].label;
 GAMES.match.en="FINAL MATCH · "+DIFFS[FINAL_DIFF].inn+" INNINGS";GAMES.match.callout=null;
 openGame("match",gameFinal);
 bgmPlay("final")}
function gameFinal(){
 const OPP=finalOpp(),DF=DIFFS[FINAL_DIFF];
 const st={inn:1,half:"atk",my:0,op:0,outs:0,bat:0,bases:[0,0,0],missRow:0,
  hits:0,hrs:0,dead:false,phase:"idle",fx:640,fy:340,tx:640,ty:340,raf:0,last:0,play:0};
 $("#hud-left").innerHTML=hudPanel("SCOREBOARD",
   `<div class="sbrow atk" id="ft-my"><span class="dot" style="background:${TEAMS[S.team].c}"></span>
     <span class="nm">${TEAMS[S.team].n}</span><b id="ft-myr">0</b></div>
    <div class="sbrow" id="ft-op"><span class="dot" style="background:${TEAMS[OPP].c}"></span>
     <span class="nm">${TEAMS[OPP].n}</span><b id="ft-opr">0</b></div>
    <div class="outrow"><span class="olabel">OUT</span>
     <span class="odot" id="ft-o1"></span><span class="odot" id="ft-o2"></span><span class="odot" id="ft-o3"></span></div>`)
  +hudPanel("INNING",`<div class="pbig"><span id="ft-inn">1</span><small>/ ${DF.inn} · <span id="ft-half">공격</span></small></div>`)
  +hudPanel("BASES",`<div class="dia"><svg width="120" height="86" viewBox="0 0 120 86">
    <rect class="base" id="ft-b2" x="52" y="4" width="16" height="16" transform="rotate(45 60 12)"/>
    <rect class="base" id="ft-b3" x="14" y="36" width="16" height="16" transform="rotate(45 22 44)"/>
    <rect class="base" id="ft-b1" x="90" y="36" width="16" height="16" transform="rotate(45 98 44)"/>
    <rect x="52" y="66" width="16" height="16" transform="rotate(45 60 74)" fill="#EAF3FF" stroke="#9FC8FF" stroke-width="1.2"/>
   </svg></div>`);
 $("#hud-right").innerHTML=hudScore()+hudPanel("MATCH LOG",`<div class="goaltxt" id="ft-log">경기 시작!</div>`);
 $("#hud-best").textContent=(S.best.final||0).toLocaleString();
 let batter=mkSpr(timg(S.team,"idle"),96*lgDep(LGC.HOME.y),LGC.HOME.x-46,LGC.HOME.y);
 let fielder=null,fb=null,oppBat=null,oppField=[],myField=[];
 const rSpr=[null,null,null];
 const bar=mtBar("스윙!",DF.bar);
 const log=t=>{$("#ft-log").innerHTML=t};
 /* --- 상대 수비진 (항공뷰 공격 화면 — 베이스가 보이는 배경에서 플레이) --- */
 function groundFielders(){
  oppField.forEach(s=>s.remove());oppField=[];
  [[LGC.FIRST.x+30,LGC.FIRST.y],[LGC.SECOND.x+34,LGC.SECOND.y],[LGC.THIRD.x-32,LGC.THIRD.y],[455,296],[825,296]].forEach(([x,y])=>{
   const s=mkSpr(timg(OPP,"fielder"),96*lgDep(y),x,y);sprFlip(s,x>640?-1:1);
   s.dataset.hx=x;s.dataset.hy=y;oppField.push(s)})}
 function nearestField(x){let best=null,bd=1e9;
  oppField.forEach(s=>{const d=Math.abs(parseFloat(s.dataset.x)-x);if(d<bd){bd=d;best=s}});return best}
 async function chase(x,y,catchIt){const f=nearestField(x);if(!f)return;
  await mtMove(f,x,Math.max(250,Math.min(500,y+14)),430,96,lgDep);
  sprImg(f,timg(OPP,catchIt?"catch":"throw"));
  if(!catchIt){/* 주워서 내야로 리턴 송구 */
   sfx.throwS();
   ballLaunch({x0:parseFloat(f.dataset.x),y0:parseFloat(f.dataset.y)-40,x1:LGC.SECOND.x,y1:LGC.SECOND.y,peak:70,dur:520,r0:6,r1:6})}
  setTimeout(()=>{try{sprImg(f,timg(OPP,"fielder"));
   mtMove(f,parseFloat(f.dataset.hx),parseFloat(f.dataset.hy),620,96,lgDep)}catch(e){}},900)}
 /* --- 내 주자 (항공뷰): 베이스 경유 주루 --- */
 const GPOS=[[LGC.FIRST.x-28,LGC.FIRST.y+6],[LGC.SECOND.x-28,LGC.SECOND.y+6],[LGC.THIRD.x-28,LGC.THIRD.y+6]];
 const gRun=[null,null,null];
 /* 베이스를 순서대로 밟으며 달린다: from(-1=홈)에서 to(3=홈)까지 */
 function gPath(s,from,to){let p=Promise.resolve();sprImg(s,timg(S.team,"run"));
  for(let b2=from+1;b2<=to;b2++){const pt=b2===3?[LGC.HOME.x,LGC.HOME.y]:GPOS[b2];
   p=p.then(()=>mtMove(s,pt[0],pt[1],520,96,lgDep))}
  return p.then(()=>{if(to<3){try{sprImg(s,timg(S.team,"idle"))}catch(e){}}})}
 /* 안타: 전원 한 루씩 진루 (3루 주자는 홈인) */
 function gAdvanceOne(){
  if(gRun[2]){const s=gRun[2];gPath(s,2,3).then(()=>s.remove())}
  if(gRun[1])gPath(gRun[1],1,2);
  if(gRun[0])gPath(gRun[0],0,1);
  gRun[2]=gRun[1];gRun[1]=gRun[0];gRun[0]=null;
  if(batter){const nb2=batter;batter=null;gRun[0]=nb2;sfx.drop();gPath(nb2,-1,0)}}
 /* 홈런: 전원 홈까지 전 베이스 터치 */
 function gClearAll(){
  for(let i=2;i>=0;i--){if(gRun[i]){const s=gRun[i];gRun[i]=null;
   gPath(s,i,3).then(()=>s.remove())}}
  if(batter){const hb=batter;batter=null;sfx.drop();gPath(hb,-1,3).then(()=>hb.remove())}}
 async function newBatter(){
  if(batter){const old=batter;batter=null;sprImg(old,timg(S.team,"run"));
   mtMove(old,-70,LGC.HOME.y,520,96,lgDep).then(()=>old.remove())}
  batter=mkSpr(timg(S.team,"idle"),96*lgDep(LGC.HOME.y),-60,LGC.HOME.y);
  await mtMove(batter,LGC.HOME.x-46,LGC.HOME.y,520,96,lgDep)}
 /* 주루 판단 — 난이도별: lead(선두 주자만 조작) / all(모든 주자 조작) */
 function askRun(b,p){return new Promise(res=>{
  const destN=b===2?"홈":(b+2)+"루";
  $("#control").innerHTML=`<button class="ghostbtn" id="mt-stay" style="font-size:16px;padding:14px 28px">${b+1}루 스톱</button>
   <button class="bigbtn gold" id="mt-go" style="margin-top:0">${destN}까지 달린다!</button>`;
  setCallout(`주루 판단 — <b>${b+1}루 주자</b><br>${destN}에 도전할까요?`);
  let done=false;
  const fin=()=>{if(done)return true;done=true;$("#control").innerHTML="";return false};
  const to=setTimeout(()=>{if(!fin()){log(`${b+1}루 주자 스톱 (자동)`);res(null)}},window.__FAST?400:3400);
  $("#mt-stay").onclick=e=>{e.stopPropagation();if(fin())return;clearTimeout(to);sfx.ui();
   log(`침착한 선택 — ${b+1}루 스톱`);res(null)};
  $("#mt-go").onclick=async e=>{e.stopPropagation();if(fin())return;clearTimeout(to);
   const ok=Math.random()<p, s=gRun[b];
   st.bases[b]=0;gRun[b]=null;
   const dx=b===2?LGC.HOME.x:GPOS[b+1][0], dy=b===2?LGC.HOME.y:GPOS[b+1][1];
   if(s){sprImg(s,timg(S.team,"run"));await mtMove(s,dx,dy,620,96,lgDep)}
   if(st.dead)return res(false);
   if(ok){sfx.pop();crowdSwell(1.2);
    if(b===2){st.my++;setPop("#ft-myr",st.my);
     popFB("perfect","홈인! 득점!",LGC.HOME.x,LGC.HOME.y-60);if(s)s.remove();
     st.score=(st.score||0)+120;log("과감한 주루로 득점!")}
    else{st.bases[b+1]=1;
     if(s){gRun[b+1]=s;sprImg(s,timg(S.team,"idle"))}
     popFB("good","세이프! "+(b+2)+"루!",dx,dy-70);
     st.score=(st.score||0)+80;log("과감한 주루! "+(b+2)+"루 진출")}
    setPop("#hud-score",(st.score||0).toLocaleString())}
   else{sfx.miss();shake();st.outs++;outsHud();
    if(s){popFB("miss","태그 아웃!",dx,dy-70);s.remove()}
    log("태그 아웃… 무리한 주루였어요")}
   basesHud();res(ok)}})}
 async function runnerPhase(g){
  const p0=g==="P"?.8:g==="G"?.58:.4;
  const order=[];
  for(let b=2;b>=0;b--)if(st.bases[b]){order.push(b);if(DF.run!=="all")break}
  for(const b of order){
   if(st.dead||st.outs>=3)break;
   if(!st.bases[b]||!gRun[b])continue;
   if(b<2&&st.bases[b+1])continue; /* 앞 루가 막혀 있으면 진루 불가 */
   await askRun(b,b===2?p0-.12:p0)}
  $("#control").innerHTML=""}
 /* --- 상대 주자 (항공뷰 수비 화면): 베이스 경유 주루 --- */
 function rPath(s,from,to){const POS=[LGC.FIRST,LGC.SECOND,LGC.THIRD];
  let p=Promise.resolve();
  for(let b2=from+1;b2<=to;b2++){const pt=b2===3?[LGC.HOME.x,LGC.HOME.y]:[POS[b2].x-28,POS[b2].y+4];
   p=p.then(()=>mtMove(s,pt[0],pt[1],520,96))}
  return p}
 function rAdvance(n){
  for(let i=2;i>=0;i--){if(!rSpr[i])continue;const s=rSpr[i];rSpr[i]=null;
   const dest=i+n;
   if(dest>=3)rPath(s,i,3).then(()=>s.remove());
   else{rSpr[dest]=s;rPath(s,i,dest)}}
  const nb=mkSpr(timg(OPP,"run"),96*lgDep(LGC.HOME.y),LGC.HOME.x+40,LGC.HOME.y);
  if(n>=3)rPath(nb,-1,3).then(()=>nb.remove());
  else{rSpr[n-1]=nb;rPath(nb,-1,n-1)}}
 groundFielders();
 function basesHud(){["ft-b1","ft-b2","ft-b3"].forEach((id,i)=>$("#"+id).classList.toggle("on",!!st.bases[i]))}
 function outsHud(){for(let i=1;i<=3;i++)$("#ft-o"+i).classList.toggle("on",st.outs>=i)}
 /* 이닝 시작 — 실사 구장 배경을 살짝 비춰주고 항공뷰로 페이드 전환 */
 function innIntro(){const host=$("#gbg").parentElement;
  const ov=document.createElement("div");ov.className="inn-ov";
  ov.style.backgroundImage=`url(${A+FINAL_BGS[(st.inn-1)%FINAL_BGS.length]})`;
  host.appendChild(ov);
  requestAnimationFrame(()=>ov.classList.add("on"));
  setTimeout(()=>{ov.classList.remove("on");setTimeout(()=>ov.remove(),700)},window.__FAST?120:1500)}
 innIntro();
 mtBanner("PLAY BALL!",`결승전 — ${TEAMS[S.team].n} vs ${TEAMS[OPP].n}`,1800)
  .then(()=>coachTip(DF.run==="auto"?"쉬움 — <b>타격에만 집중!</b> 주루와 수비는 자동이에요"
   :DF.def==="auto"?"보통 — 안타 후 <b>주루 판단은 직접!</b> 수비는 자동"
   :"어려움 — <b>모든 주자 조작 + 수비 직접!</b> 진짜 실전이에요",4600));
 function push(n){let r=0;
  for(let k=0;k<n;k++){if(st.bases[2])r++;st.bases[2]=st.bases[1];st.bases[1]=st.bases[0];st.bases[0]=0}
  if(n<=3)st.bases[n-1]=1;else{/*HR*/}
  return r}
 function hr(){let r=1;st.bases.forEach(b=>{if(b)r++});st.bases=[0,0,0];return r}
 function rearmBar(){if(!$("#mt-swing")){const nb=mtBar("스윙!",DF.bar);
  bar.start=nb.start;bar.halt=nb.halt;bar.read=nb.read;
  $("#mt-swing").onclick=e=>{e.stopPropagation();act()}}}
 function ready(){if(st.dead)return;rearmBar();
  setCallout("타이밍 맞춰 스윙!<br>파울이면 다시 치면 돼요");
  aerTee();bar.start();st.phase="aim"}
 async function act(){if(st.half!=="atk"||st.phase!=="aim"||st.dead)return;st.phase="swing";bar.halt();
  const r=bar.read();
  sprImg(batter,timg(S.team,"swing"));sprSwing(batter);sfx.swing();
  setTimeout(()=>{if(!st.dead&&batter)sprImg(batter,timg(S.team,"idle"))},600);
  /* 헛스윙 — 삼진 없음, 단 3연속이면 약한 땅볼 아웃 */
  if(r.g==="M"){st.missRow++;
   if(st.missRow>=3){st.missRow=0;sfx.miss();
    popFB("miss","약한 땅볼… 아웃",LGC.HOME.x,LGC.HOME.y-80);
    log("3연속 헛스윙 → 약한 땅볼 아웃");
    return outAndNext()}
   sfx.miss();popFB("miss","헛스윙!",LGC.HOME.x,LGC.HOME.y-80);
   log("헛스윙 — 티볼엔 삼진이 없어요");
   await sleep(750);return ready()}
  /* 파울 — 다시 티에 */
  if(r.ad>.155&&r.ad<=.2){sfx.crack();aerTeeEmpty();
   const side=r.diff<0?-1:1;
   ballLaunch({x0:LGC.HOME.x,y0:LGC.HOME.y,x1:640+side*430,y1:560,peak:110,dur:640,r0:6.5,r1:6,
    onLand:async b=>{popFB("miss","파울!",b.x,b.y-42);
     log("파울볼 — 다시 티에 올리고 재타격");
     await sleep(700);if(!st.dead)ready()}});
   return}
  st.missRow=0;
  await sleep(70);sfx.crack();zoomPunch(1.055);aerTeeEmpty();
  st.bat++;
  let kind; // hr / hit / flyout / groundout
  if(r.g==="P")kind=Math.random()<DF.hrP?"hr":"hit";
  else if(r.g==="G")kind=Math.random()<DF.hitG?"hit":"fly";
  else kind=Math.random()<DF.hitN?"hit":"go";
  const far=kind==="hr"?{x:420+Math.random()*440,y:135+Math.random()*55}:
   kind==="fly"?{x:420+Math.random()*440,y:255+Math.random()*95}:
   kind==="go"?{x:450+Math.random()*380,y:385+Math.random()*75}:
   {x:400+Math.random()*480,y:265+Math.random()*115};
  ballLaunch({x0:LGC.HOME.x,y0:LGC.HOME.y-6,x1:far.x,y1:far.y,peak:kind==="hr"?300:kind==="go"?26:230,dur:kind==="hr"?1050:820,r0:6.5,r1:5,
   onLand:async b=>{if(st.dead)return;
    if(kind==="hr"){
     st.hits++;st.hrs++;crowdSwell(1.4);sfx.fanfare();
     popFB("perfect","홈런!!",b.x,b.y-50);
     const got=hr();st.my+=got;setPop("#ft-myr",st.my);
     log(`홈런! ${got}점 획득 — 모두 홈으로!`);
     gClearAll();
     basesHud();
     st.score=(st.score||0)+300;setPop("#hud-score",(st.score||0).toLocaleString());
     await sleep(1000);if(st.dead)return;
     await newBatter();return afterPlay()}
    if(kind==="hit"){
     st.hits++;chase(b.x,b.y,false);
     popFB("good","안타!",b.x,b.y-44);
     gAdvanceOne();
     const got=push(1);
     if(got){st.my+=got;setPop("#ft-myr",st.my);crowdSwell(1.2);popFB("perfect","득점!",640,320)}
     basesHud();
     st.score=(st.score||0)+100;setPop("#hud-score",(st.score||0).toLocaleString());
     log("안타! 타자 주자 1루로");
     await sleep(700);if(st.dead)return;
     if(DF.run!=="auto"&&st.outs<3)await runnerPhase(r.g);
     if(st.dead)return;
     await newBatter();return afterPlay()}
    /* 아웃 타구 */
    sfx.miss();chase(b.x,b.y,true);
    popFB("miss",kind==="fly"?"플라이 아웃":"땅볼 아웃",b.x,b.y-44);
    log(kind==="fly"?"플라이 아웃 — 노바운드 캐치":"땅볼 포스 아웃");
    basesHud();return outAndNext()}})}
 function afterPlay(){if(st.dead)return;
  if(st.outs>=3||st.bat>=7)switchSides();else ready()}
 async function outAndNext(){st.outs++;outsHud();
  await sleep(800);if(st.dead)return;
  if(st.outs>=3||st.bat>=7)return switchSides();
  await newBatter();ready()}
 async function switchSides(){
  st.outs=0;outsHud();st.bases=[0,0,0];basesHud();st.bat=0;st.play=0;st.missRow=0;
  if(st.half==="atk"){st.half="def";
   $("#ft-my").classList.remove("atk");$("#ft-op").classList.add("atk");
   $("#ft-half").textContent="수비";
   await mtBanner("공수교대!",`${st.inn}회 말 — ${TEAMS[OPP].n}의 공격을 막아요`,1800);
   toDefense()}
  else{
   st.inn++;
   if(st.inn>DF.inn)return finish();
   st.half="atk";
   $("#ft-op").classList.remove("atk");$("#ft-my").classList.add("atk");
   $("#ft-half").textContent="공격";$("#ft-inn").textContent=st.inn;
   innIntro();
   await mtBanner(st.inn+"회 초!",`${TEAMS[S.team].n}의 공격`,1500);
   toAttack()}}
 function toDefense(){
  $("#gbg").src=A+"bg/bg_nb7.jpg";
  $("#sprites").innerHTML="";ballClear();$("#control").innerHTML="";
  oppField=[];myField=[];rSpr[0]=rSpr[1]=rSpr[2]=null;
  gRun[0]=gRun[1]=gRun[2]=null;batter=null;
  st.fx=640;st.fy=630;st.tx=640;st.ty=340;st.last=0; /* 아래에서 달려 들어오는 등장 */
  fielder=mkSpr(timg(S.team,"fielder"),96*lgDep(st.fy),st.fx,st.fy);
  fb=mkSpr(timg(S.team,"fielder"),96*lgDep(LGC.FIRST.y),LGC.FIRST.x+26,LGC.FIRST.y);sprFlip(fb,-1);
  myField=[mkSpr(timg(S.team,"fielder"),96*lgDep(LGC.SECOND.y),LGC.SECOND.x+32,LGC.SECOND.y),
   mkSpr(timg(S.team,"fielder"),96*lgDep(LGC.THIRD.y),LGC.THIRD.x-30,LGC.THIRD.y)];
  sprFlip(myField[1],-1);
  oppBat=mkSpr(timg(OPP,"idle"),96*lgDep(LGC.HOME.y),LGC.HOME.x-46,LGC.HOME.y);
  setCallout(DF.def==="auto"?"수비는 자동 진행!<br>우리 팀을 응원해요":"잡으면 아웃!<br>놓치면 상대가 출루해요");
  cancelAnimationFrame(st.raf);
  function loop(ts){st.raf=requestAnimationFrame(loop);
   const dt=Math.min(.05,(ts-(st.last||ts))/1000);st.last=ts;
   if(DF.def!=="auto"){const kv=keyVec();if(kv.x||kv.y){st.tx=Math.max(280,Math.min(1000,st.fx+kv.x*70));st.ty=Math.max(245,Math.min(560,st.fy+kv.y*70))}}
   const dx=st.tx-st.fx,dy=st.ty-st.fy,d=Math.hypot(dx,dy);
   if(d>4){const k=Math.min(1,380*dt/d);st.fx+=dx*k;st.fy+=dy*k;
    sprRun(fielder,true);sprFlip(fielder,dx<0?-1:1);
    sprPos(fielder,st.fx,st.fy,96*lgDep(st.fy))}
   else if(fielder.classList.contains("runb"))sprRun(fielder,false)}
  st.raf=requestAnimationFrame(loop);
  defPlay()}
 /* 어려움 수비: M7식 수동 송구 — 조준원이 금색일 때! */
 function defThrow(tg){return new Promise(res=>{
  st.phase="dthrow";const rt=performance.now();
  const ring=baseMark(tg[0].x,tg[0].y,true);
  $("#control").innerHTML=`<button class="bigbtn" id="ft-throw">송구!</button>`;
  setCallout(`조준원이 ${tg[2]} 동료 위에서<br><b>금색으로 변할 때</b> 송구!`);
  $("#reticle").innerHTML=`<svg width="58" height="58" viewBox="0 0 58 58">
   <circle cx="29" cy="29" r="19" fill="none" stroke="rgba(0,0,0,.55)" stroke-width="5"/>
   <circle id="df-ring" cx="29" cy="29" r="19" fill="none" stroke="rgba(255,255,255,.95)" stroke-width="2.5"/>
   <circle id="df-dot" cx="29" cy="29" r="3" fill="#fff"/></svg>`;
  let raf2=0,rx=tg[0].x;
  (function rl(){if(st.phase!=="dthrow")return;raf2=requestAnimationFrame(rl);
   const t=(performance.now()-rt)/1000;
   rx=tg[0].x+Math.sin(t*3.4)*95;
   const r=$("#reticle");r.style.left=rx+"px";r.style.top=(tg[0].y-30)+"px";
   const lk=Math.abs(rx-tg[0].x)<=34;
   if(lk!==st._dlk){st._dlk=lk;
    const rg=$("#df-ring"),dot=$("#df-dot");
    if(rg)rg.setAttribute("stroke",lk?"#FFD866":"rgba(255,255,255,.95)");
    if(dot)dot.setAttribute("fill",lk?"#FFD866":"#fff");
    r.style.filter=lk?"drop-shadow(0 0 12px rgba(255,216,102,.95))":""}})();
  const fire=async()=>{if(st.phase!=="dthrow")return;st.phase="dball";
   cancelAnimationFrame(raf2);
   const r=$("#reticle");r.innerHTML="";r.style.filter="";
   ring.remove();$("#control").innerHTML="";st._fire=null;
   const ok=Math.abs(rx-tg[0].x)<=34||!!window.__FAST;
   sprImg(fielder,timg(S.team,"throw"));sfx.throwS();
   await new Promise(r2=>ballLaunch({x0:st.fx,y0:st.fy-50,x1:ok?tg[0].x:rx,y1:tg[0].y,peak:95,dur:520,r0:8,r1:8,
    onLand:()=>{if(ok){try{sprImg(tg[1],timg(S.team,"catch"));
     setTimeout(()=>{try{sprImg(tg[1],timg(S.team,"fielder"))}catch(e){}},800)}catch(e){}}r2()}}));
   setCallout("잡으면 아웃!<br>놓치면 상대가 출루해요");
   res(ok)};
  st._fire=fire;
  $("#ft-throw").onclick=e=>{e.stopPropagation();fire()};
  if(window.__FAST)setTimeout(fire,200)})}
 async function defPlay(){if(st.dead)return;
  if(st.outs>=3||st.play>=DF.plays)return switchSides();
  st.play++;
  const type=Math.random()<.5?"F":"G";
  aerTee();
  await mtBanner(type==="F"?"플라이 볼!":"땅볼!","",800);
  if(oppBat){sprImg(oppBat,timg(OPP,"swing"));sprSwing(oppBat);
   setTimeout(()=>{try{oppBat&&sprImg(oppBat,timg(OPP,"idle"))}catch(e){}},520)}
  aerTeeEmpty();
  sfx.crack();
  const lx=380+Math.random()*520,ly=type==="F"?260+Math.random()*150:390+Math.random()*80;
  if(DF.def==="auto"){const okC=Math.random()<.62; /* 자동 수비: AI가 낙구 지점으로 */
   st.tx=Math.max(280,Math.min(1000,okC?lx:lx+(Math.random()<.5?-170:170)));
   st.ty=Math.max(245,Math.min(560,okC?ly:ly+70))}
  const mk=baseMark(lx,ly,true);
  ballLaunch({x0:LGC.HOME.x,y0:LGC.HOME.y,x1:lx,y1:ly,peak:type==="F"?300:26,dur:type==="F"?2050:1400,r0:10,r1:8*lgDep(ly),
   onLand:async b=>{mk.remove();if(st.dead)return;
    const tol=50*lgDep(ly)+22+(window.__FAST?900:0),d=Math.hypot(st.fx-lx,st.fy-ly);
    if(d<=tol){sfx.pop();sprRun(fielder,false);poseCatch(fielder);
     if(type==="G"&&DF.def==="manual"){ /* 어려움: 직접 조준해서 송구! */
      await sleep(250);if(st.dead)return;
      const tg=[[LGC.FIRST,fb,"1루"],[LGC.SECOND,myField[0],"2루"],[LGC.THIRD,myField[1],"3루"]][Math.floor(Math.random()*3)];
      const ok=await defThrow(tg);
      if(st.dead)return;
      if(!ok){ /* 악송구 — 타자 출루, 주자 한 루씩 진루 */
       sfx.miss();shake();
       let got=0;if(st.bases[2])got++;
       st.bases[2]=st.bases[1];st.bases[1]=st.bases[0];st.bases[0]=1;
       if(got){st.op+=got;setPop("#ft-opr",st.op)}
       rAdvance(1);
       popFB("miss","악송구! 출루 허용…",tg[0].x,tg[0].y-56);
       log("악송구… 조준원이 금색일 때 던져요!");
       basesHud();
       await sleep(700);if(!st.dead)defPlay();return}
      popFB("catch",tg[2]+" 송구 아웃!",tg[0].x,tg[0].y-70);poseCatch(fielder)}
     else if(type==="G"){await sleep(250);if(st.dead)return;
      const tg=[[LGC.FIRST,fb,"1루"],[LGC.SECOND,myField[0],"2루"],[LGC.THIRD,myField[1],"3루"]][Math.floor(Math.random()*3)];
      sprImg(fielder,timg(S.team,"throw"));sfx.throwS();
      await new Promise(r=>ballLaunch({x0:st.fx,y0:st.fy-50,x1:tg[0].x,y1:tg[0].y,peak:95,dur:520,r0:8,r1:8,
       onLand:()=>{try{sprImg(tg[1],timg(S.team,"catch"));
        setTimeout(()=>{try{sprImg(tg[1],timg(S.team,"fielder"))}catch(e){}},800)}catch(e){}r()}}));
      popFB("catch",tg[2]+" 포스 아웃!",tg[0].x,tg[0].y-70);poseCatch(fielder)}
     else popFB("catch","플라이 아웃!",lx,ly-64);
     st.outs++;outsHud();
     st.score=(st.score||0)+120;setPop("#hud-score",(st.score||0).toLocaleString());
     log("아웃! 좋은 수비예요")}
    else{sfx.miss();shake();
     const two=Math.random()<DF.two;
     const got=(()=>{let r=0;
      for(let k=0;k<(two?2:1);k++){if(st.bases[2])r++;st.bases[2]=st.bases[1];st.bases[1]=st.bases[0];st.bases[0]=0}
      st.bases[two?1:0]=1;return r})();
     if(got){st.op+=got;setPop("#ft-opr",st.op)}
     rAdvance(two?2:1);
     popFB("miss",two?"2루타 허용…":"안타 허용…",lx,ly-56);
     log(got?`${TEAMS[OPP].n} 득점…`:"출루 허용 — 다음 공을 잡자!")}
    basesHud();
    await sleep(700);if(!st.dead)defPlay()}})}
 function toAttack(){
  $("#gbg").src=A+"bg/bg_nb7.jpg";
  $("#sprites").innerHTML="";ballClear();cancelAnimationFrame(st.raf);
  oppBat=null;rSpr[0]=rSpr[1]=rSpr[2]=null;oppField=[];myField=[];
  gRun[0]=gRun[1]=gRun[2]=null;
  batter=mkSpr(timg(S.team,"idle"),96*lgDep(LGC.HOME.y),LGC.HOME.x-46,LGC.HOME.y);
  groundFielders();
  setCallout("타이밍 맞춰 스윙!<br>파울이면 다시 치면 돼요");
  $("#control").innerHTML="";
  const nb=mtBar("스윙!",DF.bar);
  bar.start=nb.start;bar.halt=nb.halt;bar.read=nb.read;
  $("#mt-swing").onclick=e=>{e.stopPropagation();act()};
  ready()}
 function finish(){st.dead=false;st.phase="end";cancelAnimationFrame(st.raf);
  const win=st.my>st.op,draw=st.my===st.op;
  crowdSwell(1.4);
  const coins=win?DF.coins:draw?60:40;addCoins(coins);
  if(win){S.wins++;store.set("wins",S.wins);
   const d=new Date();
   S.cert={team:S.team,opp:OPP,score:st.my,oppScore:st.op,name:S.name||"",
    date:`${d.getFullYear()}년 ${d.getMonth()+1}월 ${d.getDate()}일`};
   store.set("cert",S.cert)}
  const isNew=saveBest("final",st.score||0);
  $("#sprites").innerHTML="";
  const m=mkSpr(timg(S.team,win?"victory":"cheer"),240,540,706);
  const o=mkSpr(timg(OPP,win?"cheer":"victory"),220,780,700);sprFlip(o,-1);
  mtBanner(win?"우승!!":draw?"무승부!":"패배…",
   `${TEAMS[S.team].n} ${st.my} : ${st.op} ${TEAMS[OPP].n}`,2200).then(()=>{
   showResult({title:win?"CHAMPION!":"FINAL RESULT",
    score:st.score||0,best:S.best.final||0,isNew,coins,
    stars:win?(st.op===0?3:st.my-st.op>=3?3:2):draw?1:0,
    rows:[["최종 스코어",st.my+" : "+st.op],["안타 / 홈런",st.hits+" / "+st.hrs],
     ["결과",win?"우승! 상장 발급":draw?"무승부 — 한 번 더!":"다음엔 이길 수 있어요"]],
    midBtn:win?"상장 보기":"리그로",
    onMid:()=>win?openCert():openLeague(),
    onRetry:()=>runFinal()})})}
 $("#mt-swing").onclick=e=>{e.stopPropagation();act()};
 setTimeout(()=>!st.dead&&ready(),window.__FAST?150:1900);
 return{onTap(pt){if(st.half==="atk"||DF.def==="auto"||st.phase==="dthrow")return;
   st.tx=Math.max(280,Math.min(1000,pt.x));st.ty=Math.max(245,Math.min(560,pt.y))},
  onAction(){if(st.half==="atk")act();else if(st.phase==="dthrow"&&st._fire)st._fire()},
  stop(){st.dead=true;bar.halt&&bar.halt();cancelAnimationFrame(st.raf)}}}
