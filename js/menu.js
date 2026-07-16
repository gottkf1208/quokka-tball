"use strict";
/* ================= TITLE ================= */
function openTitle(){paintTitle();show("title")}
function bindTitle(){paintTitle()}
function paintTitle(){
 const t=S.team?TEAMS[S.team]:null;
 $("#title-inner").innerHTML=t
  ?`<button class="bigbtn gold" id="title-start">이어하기 — ${S.name?S.name+" · ":""}${t.n}</button>
    <button class="ghostbtn" id="title-new" style="margin-top:12px">새 선수 등록</button>
    <div id="title-hint">치고! 잡고! 던지며 배우는 티볼 트레이닝 센터</div>`
  :`<button class="bigbtn gold" id="title-start">선수 등록하고 시작하기</button>
    <div id="title-hint">치고! 잡고! 던지며 배우는 티볼 트레이닝 센터</div>`;
 $("#title-start").onclick=()=>{sfx.ui();ac()&&ac().resume&&ac().resume();bgmStart();
  if(!store.get("tut"))return openTut();
  S.team?openHub():openSelect()};
 const nb=$("#title-new");
 if(nb)nb.onclick=()=>{sfx.ui();ac()&&ac().resume&&ac().resume();bgmStart();openSelect()}}

/* ================= 쿼카코치 튜토리얼 ================= */
const TUT=[
 {img:"q_idle",t:"안녕! 나는 <b>쿼카 코치</b>야. 여기는 초등 체육 <b>필드형 스포츠 — 티볼</b> 훈련장이지 : )"},
 {img:"q_bat",t:"티볼은 <b>배팅 티 위에 멈춘 공</b>을 치는 경기야. 투수가 없으니 삼진도 없고, 누구나 주인공이 될 수 있어!<br>기본 기능은 딱 4가지 — <b>치기 · 받기 · 던지기 · 달리기</b>."},
 {img:"q_run",t:"공을 쳤으면 <b>반시계 방향</b>으로! 1루 → 2루 → 3루 → 홈을 밟으면 득점이야. 파울이 되면 아웃이 아니라 <b>다시 티에 올리고</b> 한 번 더!"},
 {img:"q_victory",t:"<b>연습 4종</b>으로 기본기를 다지고 <b>리그 미션 9개</b>로 규칙 도감을 모으면 <b>결승전</b>이 열려.<br>마지막 약속 — 스윙 전엔 주변 확인, <b>배트는 내려놓고</b> 달리기! 자, 선수 등록 하러 가자!"}];
function openTut(){let i=0;
 const skip=()=>{sfx.ui();store.set("tut",1);S.team?openHub():openSelect()};
 $("#tut-skip").onclick=skip;
 function step(){const s=TUT[i];
  $("#tut-coach").src="assets/quokka/"+s.img+".png";
  $("#tut-text").innerHTML=s.t;
  const btns=$("#tut-btns");
  if(s.q){btns.innerHTML=s.q.map((o,j)=>`<button class="tutbtn alt" data-ok="${o.ok}">${o.o}</button>`).join("");
   btns.querySelectorAll(".tutbtn").forEach(b=>b.onclick=()=>{
    if(b.dataset.ok==="1"){sfx.pop();
     $("#tut-text").innerHTML=s.right;
     $("#tut-coach").src="assets/quokka/q_victory.png";
     btns.innerHTML=`<button class="tutbtn" id="tut-next">다음</button>`;
     $("#tut-next").onclick=()=>{sfx.ui();i++;i<TUT.length?step():skip()}}
    else{sfx.miss();$("#tut-text").innerHTML=s.wrong}})}
  else{btns.innerHTML=`<button class="tutbtn" id="tut-next">${i===TUT.length-1?"선수 등록 하러 가기":"다음"}</button>`;
   $("#tut-next").onclick=()=>{sfx.ui();i++;i<TUT.length?step():skip()}}}
 step();show("tut")}

/* ================= TEAM SELECT ================= */
function openSelect(){const g=$("#teamgrid");
 const inp=$("#pname");if(inp)inp.value=S.name||"";
 g.innerHTML=TKEYS.map(k=>`<div class="tcard" data-k="${k}">
   <img src="${timg(k,"idle")}" alt=""><div class="tn" style="color:${TEAMS[k].c}">${TEAMS[k].n}</div></div>`).join("");
 g.querySelectorAll(".tcard").forEach(c=>c.onclick=()=>{sfx.pop();
  if(inp){S.name=(inp.value||"").trim().slice(0,10);store.set("name",S.name)}
  S.team=c.dataset.k;store.set("team",S.team);openHub()});
 show("select")}

/* ================= TRAINING HUB ================= */
function openHub(){crowdOff();ballClear();
 const t=TEAMS[S.team]||TEAMS.lg;
 $("#hub-team").innerHTML=`<img src="${timg(S.team,"victory")}" alt="">
  <span class="htn" style="color:${t.c}">${S.name?S.name+" · ":""}${t.n}</span><span class="chg">변경 ›</span>`;
 $("#hub-team").onclick=()=>{sfx.ui();openSelect()};
 $("#hubtop").innerHTML=`
  <div class="pillbtn" id="coinpill"><img src="assets/icons/coin.png" alt="">
   <span id="coinval">${S.coins.toLocaleString()}</span></div>
  <button class="pillbtn" id="dexbtn"><img src="assets/icons/clipboard.png" alt="">
   규칙 도감&nbsp;<span class="cnt">${dexCount()} / ${DEX.length}</span></button>
  ${S.cert?`<button class="pillbtn" id="certbtn"><img src="assets/icons/trophy.png" alt="">우승 상장</button>`:""}
  <button class="pillbtn" id="resetbtn"><svg viewBox="0 0 24 24" style="width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>초기화</button>`;
 $("#dexbtn").onclick=()=>{sfx.ui();openDex()};
 if(S.cert)$("#certbtn").onclick=()=>{sfx.ui();openCert()};
 $("#resetbtn").onclick=()=>{sfx.ui();
  const b=$("#resetbtn");
  if(b.dataset.arm){resetAll()}
  else{b.dataset.arm="1";b.innerHTML="정말 초기화할까요? 한 번 더 클릭";
   b.style.color="var(--red)";b.style.borderColor="var(--red)";
   setTimeout(()=>{if($("#resetbtn")){delete b.dataset.arm;openHub()}},3000)}};
 $("#hubgrid").innerHTML=Object.keys(GAMES).map(k=>{const g=GAMES[k],b=S.best[k];
  const feat=k==="match";
  return `<div class="hcard${feat?" feat":""}" data-k="${k}">
   ${feat?`<span class="htag">LEAGUE</span>`:""}
   <img src="${timg(S.team,g.pose)}" alt="">
   <div class="hn">${g.ko}</div><div class="hd">${g.desc}</div>
   <div class="hb">${feat?(S.wins?S.wins+"회 우승":"&nbsp;"):(b?"BEST "+b.toLocaleString():"&nbsp;")}</div>
   <span class="go">${feat?"리그 입장":"시작하기"}</span></div>`}).join("");
 $("#hubgrid").querySelectorAll(".hcard").forEach(c=>c.onclick=()=>{sfx.ui();startGame(c.dataset.k)});
 show("hub")}
function startGame(k){
 if(k==="bat")openGame("bat",gameBat);
 else if(k==="field")openGame("field",gameField);
 else if(k==="throw")openGame("throw",gameThrow);
 else if(k==="power")openGame("power",gamePower);
 else if(k==="match"){
  if(typeof openLeague==="function")openLeague();
  else{let b=$("#dexbanner");
   if(!b){b=document.createElement("div");b.id="dexbanner";$("#stage").appendChild(b)}
   b.innerHTML=`<div class="dxb-txt"><div class="dxb-k">QUOKKA LEAGUE</div><div class="dxb-t">리그 경기장을 준비하고 있어요! 곧 열립니다</div></div>`;
   b.classList.add("on");clearTimeout(b._t);b._t=setTimeout(()=>b.classList.remove("on"),2400)}}}

/* ================= RULE DEX ================= */
let _dexCur=0;
function openDex(){
 $("#dex-sub").textContent=`모은 카드 ${dexCount()} / ${DEX.length} — 리그 미션을 클리어하면 카드가 열려요`;
 const g=$("#dexgrid");
 g.innerHTML=DEX.map(c=>{const un=!!S.dex[c.id];
  return `<div class="dxcard ${un?"":"lock"}" data-id="${c.id}">
   <img class="thumb" src="${dimg(c.f)}" alt="">
   <div class="dxno">${String(c.id).padStart(2,"0")}</div>
   ${un?"":`<div class="lockov">
     <svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>
     <div class="hint">${c.hint}</div></div>`}
   <div class="dxt">${c.t}</div></div>`}).join("");
 g.querySelectorAll(".dxcard:not(.lock)").forEach(el=>el.onclick=()=>{sfx.ui();dexView(+el.dataset.id)});
 $("#dex-back").onclick=()=>{sfx.ui();$("#dexview").classList.remove("on");openHub()};
 $("#dex-close").onclick=()=>{sfx.ui();$("#dexview").classList.remove("on")};
 $("#dex-prev").onclick=()=>{sfx.tick();dexStep(-1)};
 $("#dex-next").onclick=()=>{sfx.tick();dexStep(1)};
 show("dex")}
function dexView(id){_dexCur=id;
 $("#dexview-img").src=dimg(DEX.find(c=>c.id===id).f);
 $("#dexview").classList.add("on")}
function dexStep(d){const un=DEX.filter(c=>S.dex[c.id]).map(c=>c.id);
 if(!un.length)return;
 let i=un.indexOf(_dexCur);i=(i+d+un.length)%un.length;
 dexView(un[i])}

/* ================= CERTIFICATE (상장) ================= */
function openCert(){const c=S.cert;if(!c)return openHub();
 const t=TEAMS[c.team]||TEAMS.lg;
 $("#certwrap").innerHTML=`<div class="cert">
  <img class="laurel" src="assets/icons/laurel.png" alt="">
  <div class="ct-k">QUOKKA T-BALL LEAGUE</div>
  <div class="ct-title">우승 상장</div>
  <div class="ct-team" style="color:${t.c}">${c.name?c.name+" 선수 · ":""}${t.n}</div>
  <div class="ct-body">위 팀은 쿼카 티볼 리그 결승전에서<br>
   ${TEAMS[c.opp]?TEAMS[c.opp].n:"상대 팀"}을 <b>${c.score} : ${c.oppScore}</b>(으)로 꺾고 우승하였으며<br>
   규칙 도감 9장을 모두 모아 티볼 규칙을 훌륭하게 익혔기에<br>이 상장을 드립니다</div>
  <div class="ct-date">${c.date}</div>
  <div class="ct-sign"><img src="assets/quokka/q_victory.png" alt=""><span class="nm">쿼카 코치</span></div>
  <div class="ct-stamp">공식<br>인증</div>
  <img class="ct-char" src="${timg(c.team,"victory")}" alt="">
 </div>`;
 $("#cert-back").onclick=()=>{sfx.ui();openHub()};
 show("cert")}
