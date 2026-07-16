"use strict";
function gamePower(){
 const TEE={x:640,y:566};
 const MISSIONS=[
  {t:"한 번의 스윙으로 <b>160M</b> 이상 날려 보세요",check:s=>s.last>=160,max:160,cur:s=>Math.min(160,s.mbest)},
  {t:"세 번의 스윙으로 <b>누적 550M</b>을 달성하세요",check:s=>s.msum>=550,max:550,cur:s=>Math.min(550,s.msum)},
  {t:"한 번의 스윙으로 <b>250M</b> 이상! 펜스를 넘겨라!",check:s=>s.last>=250,max:250,cur:s=>Math.min(250,s.mbest)}];
 const st={swing:0,mi:0,mswing:0,msum:0,mbest:0,last:0,total:0,best:0,done:0,
  phase:"idle",raf:0,t0:0,pos:0,power:0};
 $("#hud-left").innerHTML=hudRound(1,9)
  +hudPanel("MISSION",`<div class="goaltxt" style="font-size:14px"><b id="pw-mi">1</b> / 3 진행 중</div>
    <div class="psub" id="pw-mstate" style="color:var(--gold)">도전!</div>`)
  +hudGoal(MISSIONS[0].t);
 $("#hud-right").innerHTML=hudPanel("비거리",`<div class="pbig"><span id="pw-dist">0</span><small>M</small></div>
   <div class="psub"><span class="crown">◆</span>최고&nbsp;<span id="pw-max">0</span> M</div>`)
  +hudScore()
  +hudPanel("POWER METER",`<div class="pmeter" style="width:170px;height:22px;margin-top:2px"><i id="pw-pm2"></i></div>
   <div class="psub"><span id="pw-pct">0</span>%&nbsp;<span id="pw-sweet" style="color:var(--gold);font-weight:800"></span></div>`);
 $("#hud-best").textContent=(S.best.power||0).toLocaleString();
 setGoal(null,0,MISSIONS[0].max);
 const batter=mkBatter(512,714,258);
 const crew=groundCrew(null);
 setKeys([["SPACE","파워 · 스윙"]]);
 tipOnce("power",0);
 function ctrlPower(){$("#control").innerHTML=`
  <div class="pmeter"><i id="pw-fill"></i><span class="pmtxt">파워를 모아라! 탭!</span></div>
  <button class="bigbtn gold" id="pw-btn">지금!</button>`;
  $("#pw-btn").onclick=e=>{e.stopPropagation();act()}}
 function ctrlTiming(){$("#control").innerHTML=`
  <div class="tcol"><div class="tbar"><div class="zone"></div><div class="cur" id="pw-cur"></div></div>
  <div class="tlabels"><span class="early">EARLY</span><span class="late">LATE</span></div></div>
  <button class="bigbtn" id="pw-btn2">스윙!</button>`;
  $("#pw-btn2").onclick=e=>{e.stopPropagation();act()}}
 function loopPower(){st.raf=requestAnimationFrame(loopPower);
  const t=(performance.now()-st.t0)/850, p=1-Math.abs(1-(t%2));
  st.pos=p;const f=$("#pw-fill");if(f)f.style.width=(p*100)+"%"}
 function loopTiming(){st.raf=requestAnimationFrame(loopTiming);
  const t=(performance.now()-st.t0)/800, p=1-Math.abs(1-(t%2));
  st.pos=p;const c=$("#pw-cur");if(c)c.style.left=(p*394)+"px"}
 async function next(){st.swing++;
  if(st.swing>9)return finish();
  if(st.mswing>=3){/* mission over without clear -> next mission */
   if(st.mi<2){advanceMission(false)}else return finish()}
  $("#hud-round").innerHTML=`${st.swing}<small>/ 9</small>`;
  ballStatic(TEE.x,TEE.y,14,true);
  sprImg(batter,timg(S.team,"idle"));
  ctrlPower();st.t0=performance.now();
  cancelAnimationFrame(st.raf);st.phase="pow";loopPower()}
 function advanceMission(cleared){
  st.done+=cleared?1:0;
  $("#pw-mstate").textContent=cleared?"CLEAR!":"아쉽다! 다음 미션";
  if(st.mi<2){st.mi++;st.mswing=0;st.msum=0;st.mbest=0;
   $("#pw-mi").textContent=st.mi+1;
   setGoal(MISSIONS[st.mi].t,0,MISSIONS[st.mi].max)}}
 async function act(){
  if(st.phase==="pow"){st.phase="lock";
   cancelAnimationFrame(st.raf);
   st.power=Math.round(st.pos*100);
   $("#pw-pm2").style.width=st.power+"%";$("#pw-pct").textContent=st.power;
   sfx.tick();sfx.ui();
   await sleep(240);ctrlTiming();st.t0=performance.now();st.phase="time";loopTiming();return}
  if(st.phase!=="time")return;st.phase="fly";
  cancelAnimationFrame(st.raf);
  const diff=st.pos-.5, ad=Math.abs(diff);
  const mult=ad<=.045?1.15:ad<=.115?.92:ad<=.20?.7:.35;
  $("#pw-sweet").textContent=mult>=1?"SWEET SPOT!":"";
  sprImg(batter,timg(S.team,"swing"));sprSwing(batter);sfx.swing();
  st.mswing++;
  if(mult<=.35&&Math.random()<.5){/* full miss */
   sfx.miss();shake();popFB("miss","헛스윙!",TEE.x,TEE.y-90);st.last=0;
   setTimeout(()=>sprImg(batter,timg(S.team,"idle")),620);
   await sleep(1000);return next()}
  await sleep(80);sfx.crack();zoomPunch(mult>=1?1.075:1.05);crowdSwell(mult>=1?1.35:.9);
  teeEmpty(TEE.x,TEE.y,14);
  const dist=Math.round((55+st.power*2.2)*mult);
  st.last=dist;st.msum+=dist;st.mbest=Math.max(st.mbest,dist);
  st.total+=dist;st.best=Math.max(st.best,dist);
  const over=dist>=200;
  const lx=640+(Math.random()-.5)*200+diff*300, ly=over?52:Math.max(120,430-dist*1.5);
  /* rolling counter */
  const t0=performance.now(),dur=1250+dist*1.6;
  (function roll(){const k=Math.min(1,(performance.now()-t0)/dur);
   $("#pw-dist").textContent=Math.round(dist*(k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2));
   if(k<1&&st.phase!=="dead")requestAnimationFrame(roll)})();
  ballLaunch({x0:TEE.x,y0:TEE.y,x1:lx,y1:ly,peak:240+dist*.8,dur,r0:14,r1:4,onLand:b=>{
   if(over){popFB("perfect","OVER THE FENCE!",640,140);sfx.fanfare();tipOnce("power",1)}
   else{sfx.land();popFB(dist>=140?"good":"nice",dist+"M",b.x,b.y-40)}
   setPop("#pw-dist",String(dist));
   setPop("#pw-max",String(st.best));
   setPop("#hud-score",st.total.toLocaleString());
   const m=MISSIONS[st.mi];
   setGoal(null,m.cur(st),m.max);
   if(m.check(st)){sfx.star(2);popFB("perfect","MISSION CLEAR!",640,320);
    setTimeout(()=>advanceMission(true),700)}}});
  setTimeout(()=>sprImg(batter,timg(S.team,"idle")),700);
  await sleep(Math.min(2600,dur+650));
  if(st.phase!=="dead")next()}
 function finish(){st.phase="end";crowdSwell(1.4);
  sprImg(batter,timg(S.team,st.done>=2?"victory":"cheer"));
  const isNew=saveBest("power",st.total);
  const coins=Math.max(10,Math.round(st.total/40));addCoins(coins);
  setTimeout(()=>showResult({title:"CHALLENGE COMPLETE",score:st.total,best:S.best.power,isNew,coins,
   stars:st.done,
   rows:[["클리어한 미션",st.done+" / 3"],["최고 비거리",st.best+" M"],["누적 비거리",st.total+" M"]],
   onRetry:()=>openGame("power",gamePower)}),900)}
 next();
 return {onTap(){},onAction:()=>act(),
  stop(){st.phase="dead";cancelAnimationFrame(st.raf)}}}
