"use strict";
function gameThrow(){
 const TOTAL=10, BASE={x:800,y:258}, REL={x:585,y:540};
 const st={round:0,score:0,streak:0,maxStreak:0,perfects:0,sum:0,phase:"idle",raf:0,t0:0,
  rx:BASE.x,ry:BASE.y,bx:BASE.x,by:BASE.y};
 $("#hud-left").innerHTML=hudRound(1,TOTAL)
  +hudPanel("THROW RESULT",`<div class="pbig" id="th-res" style="font-size:30px">READY</div>
    <div class="psub"><span id="th-grade" style="color:var(--gold);font-weight:800">&nbsp;</span></div>`)
  +hudGoal("<b>PERFECT 송구 3회</b>에 도전!");
 $("#hud-right").innerHTML=hudScore()
  +hudCombo("STREAK")
  +hudPanel("THROW SPEED",`<div class="pbig"><span id="th-spd">-</span><small>km/h</small></div>`);
 $("#hud-best").textContent=(S.best.throw||0).toLocaleString();
 setGoal(null,0,3);
 /* target board */
 const board=$("#board");board.style.left=BASE.x+"px";board.style.top=BASE.y+"px";
 $("#board").innerHTML=`<svg width="220" height="220" viewBox="0 0 220 220" id="th-board">
  <rect x="6" y="6" width="208" height="208" rx="14" fill="rgba(6,17,38,.82)" stroke="rgba(120,190,255,.8)" stroke-width="2.5"/>
  <circle cx="110" cy="110" r="86" fill="none" stroke="rgba(100,170,255,.5)" stroke-width="2"/>
  <circle cx="110" cy="110" r="62" fill="rgba(46,120,255,.14)" stroke="rgba(140,200,255,.7)" stroke-width="2"/>
  <circle cx="110" cy="110" r="38" fill="rgba(78,168,255,.2)" stroke="#9FD4FF" stroke-width="2.5"/>
  <circle cx="110" cy="110" r="16" fill="rgba(255,110,80,.75)" stroke="#FFD2C0" stroke-width="3"/>
  <text x="110" y="115" text-anchor="middle" font-size="13" font-weight="800" fill="#fff" font-style="italic">100</text>
  <text x="110" y="66" text-anchor="middle" font-size="10.5" font-weight="700" fill="#BFDCFF" font-style="italic">75</text>
  <text x="110" y="42" text-anchor="middle" font-size="10.5" font-weight="700" fill="#8FB4E8" font-style="italic">50</text>
  <text x="110" y="18" text-anchor="middle" font-size="10.5" font-weight="700" fill="#6E90C4" font-style="italic">25</text></svg>`;
 /* reticle */
 const ret=$("#reticle");
 ret.innerHTML=`<svg width="76" height="76" viewBox="0 0 76 76">
  <circle cx="38" cy="38" r="25" fill="none" stroke="rgba(0,0,0,.55)" stroke-width="5.5"/>
  <circle id="th-ring" cx="38" cy="38" r="25" fill="none" stroke="rgba(255,255,255,.95)" stroke-width="2.5"/>
  <circle id="th-dot" cx="38" cy="38" r="3.5" fill="#fff" stroke="rgba(0,0,0,.5)" stroke-width="1"/>
  <line x1="38" y1="5" x2="38" y2="15" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="38" y1="61" x2="38" y2="71" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="5" y1="38" x2="15" y2="38" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="61" y1="38" x2="71" y2="38" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/></svg>`;
 $("#control").innerHTML=`<button class="bigbtn" id="th-btn">던지기!</button>`;
 $("#th-btn").onclick=e=>{e.stopPropagation();act()};
 const thrower=mkSpr(timg(S.team,"fielder"),225,535,700);
 /* 공 받아주는 동료 (매번 다른 구단 친구) — 표적 보드를 들고 움직인다 */
 const MK=TKEYS.filter(k=>k!==S.team)[Math.floor(Math.random()*9)];
 const mate=mkSpr(timg(MK,"fielder"),150,BASE.x,470);sprFlip(mate,-1);
 tipOnce("throw",0);
 coachTip("조준원이 <b>금색으로 변하는 순간</b>이 정중앙! 화살표로 보정, <b>스페이스</b>로 송구",4600);
 setKeys([["← ↑ ↓ →","조준 보정"],["SPACE","송구"]]);
 function retLoop(){st.raf=requestAnimationFrame(retLoop);
  const t=(performance.now()-st.t0)/1000, sp=1+st.round*.08;
  st.bx=BASE.x+Math.sin(t*.62*sp)*108+Math.sin(t*1.31*sp)*14;
  st.by=BASE.y+Math.cos(t*.47*sp)*44+Math.cos(t*1.13*sp)*8;
  board.style.left=st.bx+"px";board.style.top=st.by+"px";
  /* 동료는 땅 위에서 보드를 따라 달린다 */
  const mx=parseFloat(mate.dataset.x)||st.bx;
  const nx=mx+(st.bx-mx)*.08;
  sprRun(mate,Math.abs(st.bx-mx)>4);sprFlip(mate,st.bx<mx-2?-1:1);
  sprPos(mate,nx,470,150);
  /* 화살표로 조준 미세 보정 */
  const kv=keyVec();
  st.ox=Math.max(-46,Math.min(46,(st.ox||0)+kv.x*3.4));
  st.oy=Math.max(-40,Math.min(40,(st.oy||0)+kv.y*3.4));
  st.rx=st.bx+Math.sin(t*2.5*sp)*46+Math.sin(t*4.1*sp)*10+st.ox;
  st.ry=st.by+Math.cos(t*1.9*sp)*38+Math.cos(t*4.7*sp)*8+st.oy;
  ret.style.left=st.rx+"px";ret.style.top=st.ry+"px";
  /* 락온 피드백: 과녁 중앙에 가까우면 초록 → 정중앙이면 금색 */
  const dd=Math.hypot(st.rx-st.bx,st.ry-st.by), lk=dd<=17?2:dd<=40?1:0;
  if(lk!==st._lk){st._lk=lk;
   const rg=$("#th-ring"),dot=$("#th-dot");
   const col=lk===2?"#FFD866":lk===1?"#A8FF8C":"rgba(255,255,255,.95)";
   if(rg)rg.setAttribute("stroke",col);
   if(dot)dot.setAttribute("fill",lk?col:"#fff");
   ret.style.filter=lk===2?"drop-shadow(0 0 12px rgba(255,216,102,.95))":lk===1?"drop-shadow(0 0 10px rgba(140,255,150,.8))":""}}
 async function next(){st.round++;
  if(st.round>TOTAL)return finish();
  $("#hud-round").innerHTML=`${st.round}<small>/ ${TOTAL}</small>`;
  sprImg(thrower,timg(S.team,"fielder"));
  st.ox=0;st.oy=0;
  ret.style.display="";st.t0=performance.now();
  cancelAnimationFrame(st.raf);st.phase="aim";retLoop()}
 async function act(){if(st.phase!=="aim")return;st.phase="throw";
  cancelAnimationFrame(st.raf);ret.style.display="none";
  const tx=st.rx,ty=st.ry;
  sprImg(thrower,timg(S.team,"throw"));sfx.throwS();
  await sleep(120);
  ballLaunch({x0:REL.x,y0:REL.y,x1:tx,y1:ty,peak:90,dur:460,r0:11,r1:7,onLand:b=>{
   const d=Math.hypot(tx-st.bx,ty-st.by);
   const pts=d<=17?100:d<=40?75:d<=64?50:d<=88?25:0;
   const g=pts===100?"PERFECT!":pts>=75?"GREAT!":pts>=50?"GOOD":pts>0?"OK":"MISS";
   $("#th-board").classList.remove("flash");void $("#th-board").offsetWidth;$("#th-board").classList.add("flash");
   if(pts>0){sfx.pop();zoomPunch(1.04);
    sprImg(mate,timg(MK,pts===100?"cheer":"catch"));
    setTimeout(()=>sprImg(mate,timg(MK,"fielder")),720);
    popFB(pts===100?"perfect":pts>=75?"good":"nice","+"+pts,tx,ty-52);
    if(pts===100){st.perfects++;crowdSwell(1.2);popFB("perfect","PERFECT!",tx,ty-100);
     setGoal(null,Math.min(3,st.perfects),3);if(st.perfects===1)tipOnce("throw",1)}
    st.streak=pts>=75?st.streak+1:0}
   else{sfx.miss();shake();st.streak=0;popFB("miss","빗나감!",tx,ty-52);
    coachTip("표적의 <b>움직임을 미리 읽고</b> 중앙에 올 때 던져 보세요!")}
   st.maxStreak=Math.max(st.maxStreak,st.streak);
   st.score+=pts;st.sum+=pts;
   setPop("#hud-score",st.score.toLocaleString());
   setPop("#hud-combo","x "+st.streak);
   $("#hud-combotag").textContent=st.streak>=5?"AMAZING!":st.streak>=3?"NICE!":"";
   $("#th-res").textContent=pts>0?"+"+pts:"MISS";
   $("#th-grade").textContent=g;
   setPop("#th-spd",pts>0?String(44+Math.round(pts/100*12)+Math.floor(Math.random()*4)):"-");
   sfx.land()}});
  await sleep(1150);sprImg(thrower,timg(S.team,"fielder"));
  if(st.phase!=="dead")next()}
 next();
 return {onTap(){},onAction:()=>act(),
  stop(){st.phase="dead";cancelAnimationFrame(st.raf)}};
 function finish(){st.phase="end";crowdSwell(1.3);
  sprImg(thrower,timg(S.team,st.perfects>=3?"victory":"cheer"));
  const isNew=saveBest("throw",st.score);
  const coins=Math.max(10,Math.round(st.score/25));addCoins(coins);
  setTimeout(()=>showResult({score:st.score,best:S.best.throw,isNew,coins,
   stars:st.score>=780?3:st.score>=600?2:st.score>=400?1:0,
   rows:[["PERFECT",st.perfects+"회"],["최고 연속","x "+st.maxStreak],["평균 정확도",Math.round(st.sum/TOTAL)+"%"]],
   onRetry:()=>openGame("throw",gameThrow)}),900)}}
