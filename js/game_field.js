"use strict";
function gameField(){
 const TOTAL=10, HOME={x:640,y:612}, FIRST={x:902,y:432};
 const TYPES=["F","G","F","G","F","F","G","F","G","F"];
 const dep=y=>Math.max(.42,Math.min(1,.42+.58*(y-230)/400));
 const st={round:0,score:0,catches:0,streak:0,bestStreak:0,phase:"idle",raf:0,
  fx:640,fy:330,tx:640,ty:330,last:0,land:null};
 /* HUD */
 $("#hud-left").innerHTML=hudRound(1,TOTAL)
  +hudPanel("CATCH",`<div class="pbig"><span id="fld-c">0</span><small>/ ${TOTAL}</small></div>
   <div class="outrow"><span class="olabel">STREAK</span>
   <span class="odot" id="fs1"></span><span class="odot" id="fs2"></span><span class="odot" id="fs3"></span></div>`)
  +hudGoal("<b>3회 연속</b> 캐치에 성공해 보세요");
 $("#hud-right").innerHTML=hudScore()+hudCombo("STREAK")+hudRing("SUCCESS RATE");
 $("#hud-best").textContent=(S.best.field||0).toLocaleString();
 setGoal(null,0,3);
 const ctrlChip=`<div style="font-size:14px;font-weight:700;color:var(--sky);
  background:rgba(8,20,44,.75);border:1px solid var(--line);border-radius:30px;padding:10px 26px">
  필드를 터치하면 <b style="color:#fff">그 자리로 달려갑니다</b></div>`;
 $("#control").innerHTML=ctrlChip;
 setKeys([["← ↑ ↓ →","이동"],["SPACE","송구"]]);
 const fielder=mkSpr(timg(S.team,"fielder"),96*dep(st.fy),st.fx,st.fy);
 /* 1루수 동료 — 송구를 받아준다 */
 const fb1=mkSpr(timg(S.team,"fielder"),90*dep(FIRST.y),FIRST.x+26,FIRST.y);sprFlip(fb1,-1);
 const fm2=mkSpr(timg(S.team,"fielder"),90*dep(284),672,284);
 const fm3=mkSpr(timg(S.team,"fielder"),90*dep(432),348,432);sprFlip(fm3,-1);
 tipOnce("field",1);
 /* movement loop */
 function moveLoop(ts){st.raf=requestAnimationFrame(moveLoop);
  const dt=Math.min(.05,(ts-(st.last||ts))/1000);st.last=ts;
  const kv=keyVec();if(kv.x||kv.y){st.tx=Math.max(280,Math.min(1000,st.fx+kv.x*70));st.ty=Math.max(245,Math.min(520,st.fy+kv.y*70))}
  const dx=st.tx-st.fx,dy=st.ty-st.fy,d=Math.hypot(dx,dy);
  if(d>4){const sp=360*dt,k=Math.min(1,sp/d);
   st.fx+=dx*k;st.fy+=dy*k;
   sprRun(fielder,true);sprFlip(fielder,dx<0?-1:1);
   sprPos(fielder,st.fx,st.fy,96*dep(st.fy))}
  else if(fielder.classList.contains("runb")){sprRun(fielder,false);sprFlip(fielder,1)}}
 st.raf=requestAnimationFrame(moveLoop);
 function marker(x,y,dur){const m=document.createElement("div");m.className="landmark";
  m.style.left=x+"px";m.style.top=y+"px";
  const R=44*dep(y)+16;
  m.innerHTML=`<svg width="${R*2+22}" height="${R*1.4+22}" viewBox="0 0 ${R*2+22} ${R*1.4+22}">
   <ellipse class="lm-ring" cx="${R+11}" cy="${R*.7+11}" rx="${R}" ry="${R*.6}" fill="rgba(78,168,255,.16)"
    stroke="#7FC4FF" stroke-width="3" style="transform-origin:center"/>
   <ellipse cx="${R+11}" cy="${R*.7+11}" rx="${R*.42}" ry="${R*.25}" fill="rgba(160,220,255,.4)"/></svg>`;
  $("#sprites").appendChild(m);
  return m}
 /* M7식 수동 송구: 조준원이 1루수 위에서 금색일 때 송구! */
 function throwPhase(){return new Promise(res=>{if(st.phase==="dead")return res();
  st.phase="throwing";const rt=performance.now();
  $("#control").innerHTML=`<button class="bigbtn" id="fld-throw">송구!</button>`;
  setCallout("조준원이 1루수 위에서<br><b>금색으로 변할 때</b> 송구!");
  const ret=$("#reticle");
  ret.innerHTML=`<svg width="58" height="58" viewBox="0 0 58 58">
   <circle cx="29" cy="29" r="19" fill="none" stroke="rgba(0,0,0,.55)" stroke-width="5"/>
   <circle id="fl-ring" cx="29" cy="29" r="19" fill="none" stroke="rgba(255,255,255,.95)" stroke-width="2.5"/>
   <circle id="fl-dot" cx="29" cy="29" r="3" fill="#fff"/></svg>`;
  let raf2=0,rx=FIRST.x;
  (function rl(){if(st.phase!=="throwing")return;raf2=requestAnimationFrame(rl);
   const t=(performance.now()-rt)/1000;
   rx=FIRST.x+Math.sin(t*3.2)*90;
   ret.style.left=rx+"px";ret.style.top=(FIRST.y-30)+"px";
   const lk=Math.abs(rx-FIRST.x)<=32;
   if(lk!==st._lk){st._lk=lk;
    const rg=$("#fl-ring"),dot=$("#fl-dot");
    if(rg)rg.setAttribute("stroke",lk?"#FFD866":"rgba(255,255,255,.95)");
    if(dot)dot.setAttribute("fill",lk?"#FFD866":"#fff");
    ret.style.filter=lk?"drop-shadow(0 0 12px rgba(255,216,102,.95))":""}})();
  const doT=()=>{if(st.phase!=="throwing")return;st.phase="thrown";
   cancelAnimationFrame(raf2);ret.innerHTML="";ret.style.filter="";
   $("#control").innerHTML="";st._doT=null;
   const off=Math.abs(rx-FIRST.x), ok=off<=32||window.__FAST;
   sprImg(fielder,timg(S.team,"throw"));sfx.throwS();
   ballLaunch({x0:st.fx,y0:st.fy-60*dep(st.fy),x1:ok?FIRST.x:rx,y1:FIRST.y,peak:110,dur:600,r0:8*dep(st.fy),r1:8,
    onLand:()=>{if(st.phase==="dead")return res();
     if(ok){sfx.pop();sprImg(fb1,timg(S.team,"catch"));
      const bonus=off<=12?50:30;st.score+=bonus;
      setPop("#hud-score",st.score.toLocaleString());
      popFB(off<=12?"perfect":"score",(off<=12?"퍼펙트 송구! +":"송구 OK +")+bonus,FIRST.x,FIRST.y-40);
      setTimeout(()=>{try{sprImg(fb1,timg(S.team,"fielder"))}catch(e){}},750)}
     else{sfx.miss();popFB("miss","악송구!",rx,FIRST.y-40);
      coachTip("조준원이 <b>금색인 순간</b>에 던지면 정확해요!")}
     res()}})};
  st._doT=doT;
  $("#fld-throw").onclick=e=>{e.stopPropagation();doT()};
  if(window.__FAST)setTimeout(doT,200)})}
 async function next(){st.round++;
  if(st.round>TOTAL)return finish();
  $("#control").innerHTML=ctrlChip;
  setCallout(null);
  $("#hud-round").innerHTML=`${st.round}<small>/ ${TOTAL}</small>`;
  await sleep(650);if(st.phase==="dead")return;
  const type=TYPES[(st.round-1)%TYPES.length];
  st.phase="play";
  sfx.crack();crowdSwell(.7);
  let lx,ly,dur;
  if(type==="F"){lx=340+Math.random()*600;ly=258+Math.random()*170;dur=2250+Math.random()*350;
   setCallout("낙하지점으로<br>이동해 공을 잡으세요!");
   st.land=marker(lx,ly,dur);
   ballLaunch({x0:HOME.x,y0:HOME.y,x1:lx,y1:ly,peak:320,dur,r0:10,r1:8*dep(ly),onLand:b=>resolve(type,b,lx,ly)})}
  else{lx=380+Math.random()*520;ly=396+Math.random()*84;dur=1500;
   setCallout("굴러오는 공 앞으로<br>미리 이동하세요!");
   st.land=marker(lx,ly,dur);
   ballLaunch({x0:HOME.x,y0:HOME.y,x1:lx,y1:ly,peak:26,dur,r0:10,r1:9*dep(ly),onLand:b=>resolve(type,b,lx,ly)})}}
 async function resolve(type,b,lx,ly){if(st.phase==="dead")return;
  st.phase="resolve";st.land&&st.land.remove();st.land=null;
  const tol=50*dep(ly)+20, d=Math.hypot(st.fx-lx,st.fy-ly);
  if(d<=tol){/* CATCH */
   st.catches++;st.streak++;st.bestStreak=Math.max(st.bestStreak,st.streak);
   sfx.pop();zoomPunch(1.045);crowdSwell(1.1);
   sprRun(fielder,false);sprImg(fielder,timg(S.team,"catch"));
   popFB("catch","CATCH!",lx,ly-70);
   const pts=(type==="F"?100:80)+Math.min(3,st.streak)*10;
   st.score+=pts;setTimeout(()=>popFB("score","+"+pts,lx,ly-14),150);
   $("#fld-c").textContent=st.catches;
   for(let i=1;i<=3;i++)$("#fs"+i).classList.toggle("on",st.streak>=i);
   setPop("#hud-score",st.score.toLocaleString());
   setPop("#hud-combo","x "+st.streak);
   $("#hud-combotag").textContent=st.streak>=5?"AMAZING!":st.streak>=3?"GREAT!":"";
   setGoal(null,Math.min(3,st.bestStreak),3);
   if(st.streak===3)tipOnce("field",0);
   /* 잡았다! 이제 M7처럼 직접 송구 */
   await sleep(380);if(st.phase==="dead")return;
   await throwPhase();
   if(st.phase==="dead")return;
   sprImg(fielder,timg(S.team,"fielder"))}
  else{/* MISS */
   st.streak=0;sfx.miss();shake();
   popFB("miss","놓쳤다!",lx,ly-56);
   for(let i=1;i<=3;i++)$("#fs"+i).classList.remove("on");
   setPop("#hud-combo","x 0");$("#hud-combotag").textContent="";
   coachTip("공이 뜨자마자 <b>낙하지점을 예측</b>하고 먼저 출발해 보세요!");
   /* ball bounces away */
   ballLaunch({x0:lx,y0:ly,x1:lx+(lx>640?90:-90),y1:ly-26,peak:46,dur:420,r0:8*dep(ly),r1:6,
    onLand:()=>{sfx.land()}});
   await sleep(600)}
  setRing(st.catches/st.round*100,st.catches===st.round?"PERFECT!":"");
  await sleep(500);if(st.phase!=="dead")next()}
 function finish(){st.phase="end";
  sprImg(fielder,timg(S.team,st.catches>=8?"victory":"cheer"));crowdSwell(1.3);
  const isNew=saveBest("field",st.score);
  const coins=Math.max(10,Math.round(st.score/25));addCoins(coins);
  setTimeout(()=>showResult({score:st.score,best:S.best.field,isNew,coins,
   stars:st.catches>=9?3:st.catches>=7?2:st.catches>=5?1:0,
   rows:[["캐치 성공",st.catches+" / "+TOTAL],["최고 연속","x "+st.bestStreak],["성공률",Math.round(st.catches/TOTAL*100)+"%"]],
   onRetry:()=>openGame("field",gameField)}),900)}
 next();
 return {onTap(pt){if(st.phase==="dead"||st.phase==="throwing")return;
   st.tx=Math.max(280,Math.min(1000,pt.x));st.ty=Math.max(245,Math.min(520,pt.y))},
  onAction(){if(st.phase==="throwing"&&st._doT)st._doT()},
  stop(){st.phase="dead";cancelAnimationFrame(st.raf)}}}
