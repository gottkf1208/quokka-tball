"use strict";
function gameBat(){
 const TOTAL=10, TEE={x:640,y:566};
 const GAPL={x:430,y:298}, GAPR={x:850,y:298}; /* 수비 사이 빈 곳 */
 const st={round:0,score:0,combo:0,maxCombo:0,cnt:{P:0,G:0,N:0,M:0},caught:0,
  phase:"idle",pos:0,raf:0,t0:0,speed:1,aim:-1};
 /* HUD */
 $("#hud-left").innerHTML=hudRound(1,TOTAL)
  +hudPanel("SWING LOG",["P|빈 곳 안타|#F5C542","G|안타|#3ADE8E","N|정면 타구|#4EA8FF","M|헛스윙|#FF5A5A"].map(s=>{
    const [k,nm,c]=s.split("|");
    return `<div class="trow"><span class="dot" style="background:${c}"></span><span class="nm">${nm}</span><b id="bat-c${k}">0</b></div>`}).join(""))
  +hudGoal("누적 <b>700점</b>을 달성해 보세요");
 $("#hud-right").innerHTML=hudScore()+hudCombo("")+hudRing("ACCURACY");
 $("#hud-best").textContent=(S.best.bat||0).toLocaleString();
 setGoal(null,0,700);
 /* 빈 곳 표시 (좌우 갭) */
 $("#rings").style.left="640px";$("#rings").style.top="298px";
 $("#rings").innerHTML=`<svg width="900" height="200" viewBox="0 0 900 200" id="ringsvg" style="overflow:visible">
  ${[[240,"zoneL"],[660,"zoneR"]].map(([cx,id])=>`<g id="${id}" style="transition:opacity .2s">
   <ellipse cx="${cx}" cy="100" rx="96" ry="46" fill="rgba(58,222,142,.13)"
    stroke="rgba(120,255,190,.75)" stroke-width="2.5" stroke-dasharray="7 6"/>
   <ellipse cx="${cx}" cy="100" rx="44" ry="22" fill="rgba(58,222,142,.2)" stroke="#8FF7C4" stroke-width="2"/>
   <text x="${cx}" y="106" text-anchor="middle" font-size="15" font-weight="800" fill="#C9FFE3" font-style="italic">빈 곳!</text></g>`).join("")}</svg>`;
 function paintAim(){const L=$("#zoneL"),R=$("#zoneR");
  if(L)L.style.opacity=st.aim<0?"1":".3";if(R)R.style.opacity=st.aim>0?"1":".3"}
 paintAim();
 /* control */
 $("#control").innerHTML=`<div class="tcol"><div class="tbar"><div class="zone"></div><div class="cur" id="bat-cur"></div></div>
  <div class="tlabels"><span class="early">EARLY</span><span class="late">LATE</span></div></div>
  <button class="bigbtn" id="bat-swing">스윙!</button>`;
 $("#bat-swing").onclick=e=>{e.stopPropagation();act()};
 /* sprites: 내 타자 + 여러 구단 수비진 */
 const batter=mkBatter(528,706);
 const crew=groundCrew(null);
 tipOnce("bat",0);
 coachTip("<b>← → 키</b>로 노릴 빈 곳을 고르고, 타이밍에 맞춰 스윙! 정면은 수비 정면이에요",4600);
 setKeys([["← →","빈 곳 선택"],["SPACE","스윙"]]);
 function nearCrew(x,y){let best=null,bd=1e9;
  crew.forEach(s=>{const d=Math.hypot(parseFloat(s.dataset.x)-x,parseFloat(s.dataset.y)-y);
   if(d<bd){bd=d;best=s}});return{s:best,d:bd}}
 function barStart(){st.phase="aim";st.t0=performance.now();
  st.speed=1/(1300-Math.min(420,(st.round-1)*55));
  cancelAnimationFrame(st.raf);barLoop()}
 function barLoop(){st.raf=requestAnimationFrame(barLoop);
  const kv=keyVec();
  if(kv.x&&kv.x!==st.aim){st.aim=kv.x;sfx.tick();paintAim()}
  const t=(performance.now()-st.t0)*st.speed, p=1-Math.abs(1-(t%2));
  st.pos=p;const cur=$("#bat-cur");if(cur)cur.style.left=(p*394)+"px"}
 async function next(){st.round++;
  if(st.round>TOTAL)return finish();
  setPop("#hud-round","");$("#hud-round").innerHTML=`${st.round}<small>/ ${TOTAL}</small>`;
  ballStatic(TEE.x,TEE.y,13,true);
  await sleep(420);barStart()}
 async function act(){if(st.phase!=="aim")return;st.phase="swing";
  cancelAnimationFrame(st.raf);
  const diff=st.pos-.5, ad=Math.abs(diff);
  sprImg(batter,timg(S.team,"swing"));sprSwing(batter);sfx.swing();
  let grade=ad<=.045?"P":ad<=.115?"G":ad<=.20?"N":"M";
  st.cnt[grade]++;$("#bat-c"+grade).textContent=st.cnt[grade];
  setTimeout(()=>sprImg(batter,timg(S.team,"idle")),620);
  if(grade==="M"){
   sfx.miss();shake();st.combo=0;setPop("#hud-combo","x 0");$("#hud-combotag").textContent="";
   popFB("miss","헛스윙!",TEE.x,TEE.y-90);
   coachTip(diff<0?"너무 빨랐어요! 공을 조금 더 <b>기다렸다가</b> 스윙해 보세요":"조금 늦었어요! 커서가 <b>가운데 오는 순간</b>을 노려 보세요");
   await sleep(950);return next()}
  /* 타구 방향: 정확할수록 빈 곳으로 */
  await sleep(70);sfx.crack();zoomPunch(1.055);crowdSwell(grade==="P"?1.2:0.8);
  teeEmpty(TEE.x,TEE.y,13);
  const gap=st.aim<0?GAPL:GAPR;
  let lx,ly;
  if(grade==="P"){lx=gap.x+(Math.random()*36-18);ly=gap.y+(Math.random()*24-12)}
  else if(grade==="G"){lx=gap.x+(Math.random()*130-65);ly=gap.y+(Math.random()*60-30)}
  else{lx=640+(Math.random()*160-80);ly=330+Math.random()*100} /* 정면 */
  ballLaunch({x0:TEE.x,y0:TEE.y,x1:lx,y1:ly,peak:230+Math.random()*70,dur:880,r0:13,r1:6.5,
   onLand:async b=>{
    const nc=nearCrew(lx,ly);
    const caught=grade==="N"&&nc.d<150&&Math.random()<.6;
    if(caught){/* 정면 타구 — 잡힘 */
     st.caught++;st.combo=0;
     if(nc.s){const hx=nc.s.dataset.hx,hy=nc.s.dataset.hy,tk=nc.s.dataset.team;
      mtMove(nc.s,lx,Math.max(340,ly+10),420,165,gdepM).then(()=>{
       sprImg(nc.s,timg(tk,"catch"));
       setTimeout(()=>{try{sprImg(nc.s,timg(tk,"fielder"));
        mtMove(nc.s,parseFloat(hx),parseFloat(hy),600,165,gdepM)}catch(e){}},800)})}
     sfx.miss();popFB("miss","정면 타구! 잡혔다",lx,ly-46);
     setPop("#hud-combo","x 0");$("#hud-combotag").textContent="";
     coachTip("수비 정면이었어요! <b>빈 곳을 보고</b> 스윙 타이밍을 조절해 봐요");
     await sleep(1100);return next()}
    const inGap=Math.hypot(lx-gap.x,ly-gap.y)<100;
    const pts=(grade==="P"?100:grade==="G"?(inGap?85:70):50)+st.combo*5;
    st.score+=pts;st.combo++;st.maxCombo=Math.max(st.maxCombo,st.combo);
    $("#ringsvg").classList.remove("flash");void $("#ringsvg").offsetWidth;$("#ringsvg").classList.add("flash");
    popFB(grade==="P"?"perfect":grade==="G"?"good":"nice",
     grade==="P"?"빈 곳 안타!":grade==="G"?(inGap?"노린 곳으로! 안타!":"안타!"):"내야 안타!",b.x,b.y-46);
    setTimeout(()=>popFB("score","+"+pts,b.x,b.y+8),140);
    sfx.pop();if(grade==="P"){sfx.star(2);tipOnce("bat",1)}
    setPop("#hud-score",st.score.toLocaleString());
    setPop("#hud-combo","x "+st.combo);
    $("#hud-combotag").textContent=st.combo>=6?"AMAZING!":st.combo>=3?"NICE!":"";
    const acc=st.score/(st.round*100)*100;
    setRing(Math.min(100,acc),acc>=90?"PERFECT!":acc>=70?"GOOD!":"");
    setGoal(null,Math.min(700,st.score),700);
    await sleep(560);if(st.phase!=="dead")next()}})}
 function finish(){st.phase="end";crowdSwell(1.3);
  sprImg(batter,timg(S.team,st.score>=700?"victory":"cheer"));
  const isNew=saveBest("bat",st.score);
  const coins=Math.max(10,Math.round(st.score/25));addCoins(coins);
  setTimeout(()=>showResult({score:st.score,best:S.best.bat,isNew,coins,
   stars:st.score>=880?3:st.score>=700?2:st.score>=480?1:0,
   rows:[["빈 곳 안타",st.cnt.P+"회"],["잡힌 타구",st.caught+"회"],["최대 콤보","x "+st.maxCombo]],
   onRetry:()=>openGame("bat",gameBat)}),900)}
 next();
 return {onTap(){},onAction:()=>act(),
  stop(){cancelAnimationFrame(st.raf);st.phase="dead"}}}
