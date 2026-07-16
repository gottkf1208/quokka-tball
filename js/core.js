"use strict";
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const W=1280,H=720;
const store={
 get(k){try{return JSON.parse(localStorage.getItem("qtb_"+k))}catch(e){return (store._m||{})[k]??null}},
 set(k,v){try{localStorage.setItem("qtb_"+k,JSON.stringify(v))}catch(e){(store._m=store._m||{})[k]=v}}};
const S={team:store.get("team")||null,best:store.get("best")||{},muted:!!store.get("muted"),tips:store.get("tips")||{},
 coins:store.get("coins")||0,dex:store.get("dex")||{},wins:store.get("wins")||0,cert:store.get("cert")||null,
 name:store.get("name")||""};
function resetAll(){["team","best","muted","tips","coins","dex","wins","cert","league","name","tut"]
 .forEach(k=>{try{localStorage.removeItem("qtb_"+k)}catch(e){}});
 try{location.reload()}catch(e){}}
function saveBest(g,score){const old=S.best[g]||0;if(score>old){S.best[g]=score;store.set("best",S.best);return true}return false}

/* ================= COINS ================= */
function addCoins(n){if(!n)return;S.coins+=n;store.set("coins",S.coins);
 const el=$("#coinval");if(el)setPop("#coinval",S.coins.toLocaleString())}

/* ================= RULE DEX ================= */
function dexCount(){return Object.keys(S.dex).length}
let _dexQ=[],_dexShowing=false;
function unlockDex(id){if(S.dex[id])return false;S.dex[id]=1;store.set("dex",S.dex);
 const card=DEX.find(c=>c.id===id);if(card){_dexQ.push(card);_dexPump()}return true}
function _dexPump(){if(_dexShowing||!_dexQ.length)return;_dexShowing=true;
 const card=_dexQ.shift();
 let b=$("#dexbanner");
 if(!b){b=document.createElement("div");b.id="dexbanner";$("#stage").appendChild(b)}
 b.innerHTML=`<img src="${dimg(card.f)}" alt="">
  <div class="dxb-txt"><div class="dxb-k">규칙 도감 카드 획득</div>
  <div class="dxb-t">${String(card.id).padStart(2,"0")} · ${card.t}</div></div>`;
 sfx.fanfare();b.classList.add("on");
 setTimeout(()=>{b.classList.remove("on");
  setTimeout(()=>{_dexShowing=false;_dexPump()},450)},window.__FAST?300:2600)}

/* ================= AUDIO: 실제 사운드트랙 ================= */
const AUD={};
function loadSnd(key,src,vol){try{if(typeof Audio==="undefined")return;
 const a=new Audio(encodeURI(src));a.preload="auto";a.volume=vol;AUD[key]=a}catch(e){}}
function playSnd(key){const a=AUD[key];if(!a||S.muted)return;
 try{const c=a.cloneNode();c.volume=a.volume;const p=c.play();p&&p.catch&&p.catch(()=>{})}catch(e){}}
/* BGM: 장면별 트랙 로테이션 (고음질 192kbps 트랙만 사용) */
let BGM=null,BGM_CUR="menu",BGM_ARMED=false;
const BGM_TRACKS={
 menu:{f:"bgm/Sunrise_in_the_Living_Room.mp3",v:.15},
 game:{f:"bgm/Home_Plate_Hero.mp3",v:.12},
 final:{f:"bgm/Home_Plate_Hero.mp3",v:.17}};
const BGM_SCREEN={}; /* 저음질 3분곡은 은퇴 — 전 메뉴 Sunrise */
function bgmPlay(name){BGM_CUR=name;if(!BGM_ARMED||S.muted)return;_bgmSwap()}
function _bgmSwap(){const t=BGM_TRACKS[BGM_CUR];if(!t)return;
 try{if(typeof Audio==="undefined")return;
  if(BGM&&BGM._f===t.f){BGM._v=t.v;if(!S.muted)BGM.volume=t.v;return}
  const old=BGM;BGM=null;
  if(old){let v=old.volume;
   const iv=setInterval(()=>{v-=.03;
    if(v<=0){try{old.pause()}catch(e){};clearInterval(iv)}
    else{try{old.volume=v}catch(e){clearInterval(iv)}}},70)}
  const a=new Audio(encodeURI(t.f));a.loop=true;a._f=t.f;a._v=t.v;a.volume=0;
  const p=a.play();p&&p.catch&&p.catch(()=>{});
  BGM=a;
  let v=0;const iv2=setInterval(()=>{if(BGM!==a){clearInterval(iv2);return}
   v+=.02;if(v>=t.v){try{a.volume=t.v}catch(e){}clearInterval(iv2)}
   else{try{a.volume=v}catch(e){clearInterval(iv2)}}},70)}catch(e){}}
function bgmStart(){BGM_ARMED=true;if(!S.muted)_bgmSwap()}
function bgmDuck(v,ms=2600){if(!BGM)return;
 try{const tv=BGM._v||.15;BGM.volume=Math.min(BGM.volume,.045);
  setTimeout(()=>{try{if(BGM&&!S.muted)BGM.volume=tv}catch(e){}},ms)}catch(e){}}
function bgmMute(m){try{if(BGM)BGM.muted=m;else if(!m&&BGM_ARMED)_bgmSwap()}catch(e){}}
function sndInit(){
 loadSnd("swing","bgm/배트휘두르는 소리.wav",.38);
 loadSnd("drop","bgm/배트떨어지는소리.wav",.42);
 loadSnd("throw","bgm/송구소리.wav",.38);
 loadSnd("land","bgm/야구공 떨어지는 소리.wav",.32)}

/* ================= AUDIO ================= */
let AC=null;
function ac(){if(!AC){try{AC=new (window.AudioContext||window.webkitAudioContext)()}catch(e){}}return AC}
function tone(f,dur=.15,type="sine",g=.16,slide=0,at=0){const a=ac();if(!a||S.muted)return;
 const o=a.createOscillator(),gn=a.createGain(),t=a.currentTime+at;
 o.type=type;o.frequency.setValueAtTime(f,t);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(30,f+slide),t+dur);
 gn.gain.setValueAtTime(g,t);gn.gain.exponentialRampToValueAtTime(.001,t+dur);
 o.connect(gn).connect(a.destination);o.start(t);o.stop(t+dur+.02)}
function noiseBuf(a){if(!a._nb){const b=a.createBuffer(1,a.sampleRate,a.sampleRate),d=b.getChannelData(0);
 for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;a._nb=b}return a._nb}
function noise(dur=.2,fc=1800,g=.2,q=.8,at=0){const a=ac();if(!a||S.muted)return;
 const s=a.createBufferSource();s.buffer=noiseBuf(a);
 const f=a.createBiquadFilter();f.type="bandpass";f.frequency.value=fc;f.Q.value=q;
 const gn=a.createGain(),t=a.currentTime+at;
 gn.gain.setValueAtTime(g,t);gn.gain.exponentialRampToValueAtTime(.001,t+dur);
 s.connect(f).connect(gn).connect(a.destination);s.start(t);s.stop(t+dur+.02)}
const sfx={
 ui(){tone(660,.07,"triangle",.1);tone(990,.09,"triangle",.08,-200,.05)},
 tick(){tone(1200,.03,"square",.04)},
 swing(){if(AUD.swing)playSnd("swing");else{noise(.16,900,.22,.6);noise(.1,2400,.1,.7,.03)}},
 crack(){noise(.06,3400,.5,.4);noise(.18,1200,.3,.7,.01);tone(170,.16,"sine",.3,-90)},
 pop(){tone(520,.08,"triangle",.2);tone(780,.1,"triangle",.16,120,.06);noise(.06,3000,.12,1,.01)},
 throwS(){if(AUD.throw)playSnd("throw");else noise(.22,1500,.18,.5)},
 miss(){tone(140,.22,"sawtooth",.14,-60);noise(.14,500,.1,.8)},
 land(){if(AUD.land)playSnd("land");else{noise(.1,700,.18,.9);tone(110,.12,"sine",.2,-40)}},
 drop(){if(AUD.drop)playSnd("drop");else noise(.12,600,.2,.8)},
 fanfare(){[523,659,784,1047].forEach((f,i)=>tone(f,.32,"triangle",.16,0,i*.11));noise(.5,2600,.05,.4,.3)},
 star(i){tone(700+i*180,.22,"triangle",.18,80)}};
let _crowd=null;
function crowdOn(){if(BGM&&!BGM.muted)return; /* 음악 재생 중엔 노이즈 앰비언스 생략 */
 const a=ac();if(!a||S.muted||_crowd)return;
 try{const s=a.createBufferSource();s.buffer=noiseBuf(a);s.loop=true;
 const f=a.createBiquadFilter();f.type="bandpass";f.frequency.value=480;f.Q.value=.5;
 const g=a.createGain();g.gain.value=.02;
 s.connect(f).connect(g).connect(a.destination);s.start();_crowd={s,g}}catch(e){}}
function crowdOff(){if(_crowd){try{_crowd.s.stop()}catch(e){}_crowd=null}}
function crowdSwell(k=1){const a=ac();if(!a||!_crowd||S.muted)return;
 try{const g=_crowd.g.gain;g.cancelScheduledValues(a.currentTime);g.setValueAtTime(.02,a.currentTime);
 g.linearRampToValueAtTime(.085*k,a.currentTime+.1);g.linearRampToValueAtTime(.02,a.currentTime+1.2)}catch(e){}}

/* ================= KEYBOARD ================= */
const KEYS={};
addEventListener("keydown",e=>{KEYS[e.code]=1});
addEventListener("keyup",e=>{delete KEYS[e.code]});
addEventListener("blur",()=>{for(const k in KEYS)delete KEYS[k]});
function keyVec(){let x=0,y=0;
 if(KEYS.ArrowLeft||KEYS.KeyA)x-=1;if(KEYS.ArrowRight||KEYS.KeyD)x+=1;
 if(KEYS.ArrowUp||KEYS.KeyW)y-=1;if(KEYS.ArrowDown||KEYS.KeyS)y+=1;
 return{x,y}}

/* ================= STAGE / SCREENS ================= */
function fit(){const s=Math.min(innerWidth/W,innerHeight/H);
 $("#stage").style.transform=`translate(-50%,-50%) scale(${s})`}
function show(id){$$(".screen").forEach(s=>{s.classList.remove("on");s.style.display="none"});
 const el=$("#scr-"+id);el.style.display="block";
 if(id!=="game"&&typeof bgmPlay==="function")bgmPlay(BGM_SCREEN[id]||"menu");
 requestAnimationFrame(()=>requestAnimationFrame(()=>el.classList.add("on")))}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

/* ================= SPRITES ================= */
function mkSpr(img,w,x,y){const d=document.createElement("div");d.className="spr bob";
 d.innerHTML=`<div class="gshadow"></div><div class="body"></div>`;
 d.querySelector(".body").style.backgroundImage=`url('${img}')`;
 d.dataset.w=w;$("#sprites").appendChild(d);sprPos(d,x,y);return d}
function sprPos(el,x,y,w){w=w||parseFloat(el.dataset.w);
 el.style.width=w+"px";el.style.height=w+"px";
 el.style.left=(x-w/2)+"px";el.style.top=(y-w)+"px";
 el.dataset.x=x;el.dataset.y=y}
function sprImg(el,img){el.querySelector(".body").style.backgroundImage=`url('${img}')`}
function sprFlip(el,dir){el.querySelector(".body").style.transform=dir<0?"scaleX(-1)":""}
function sprRun(el,on){el.classList.toggle("runb",on);el.classList.toggle("bob",!on)}
function mkBatter(x=528,y=706,w=235){const b=mkSpr(timg(S.team,"idle"),w,x,y);
 b.classList.add("waggle");return b}
function sprSwing(el){if(!el)return;el.classList.remove("swinging");void el.offsetWidth;
 el.classList.add("swinging");setTimeout(()=>{try{el.classList.remove("swinging")}catch(e){}},480)}

/* ================= BALL ENGINE (canvas) ================= */
const BE={balls:[],statics:[],raf:0,cv:null,ctx:null};
function beInit(){BE.cv=$("#fxcv");if(!BE.cv)return;BE.cv.width=W;BE.cv.height=H;
 try{BE.ctx=BE.cv.getContext("2d")}catch(e){BE.ctx=null}}
function beLoop(){BE.raf=requestAnimationFrame(beLoop);const now=performance.now();
 for(let i=BE.balls.length-1;i>=0;i--){const b=BE.balls[i];let k=(now-b.t0)/b.dur;
  if(k>=1){k=1}
  const x=b.x0+(b.x1-b.x0)*k, gy=b.y0+(b.y1-b.y0)*k;
  const arc=b.peak*4*k*(1-k);
  b.x=x;b.y=gy-arc;b.gy=gy;b.r=b.r0+(b.r1-b.r0)*k;
  b.trail.push({x:b.x,y:b.y,r:b.r});if(b.trail.length>14)b.trail.shift();
  if(k>=1){BE.balls.splice(i,1);b.onLand&&b.onLand(b)}}
 beDraw()}
function beDraw(){const c=BE.ctx;if(!c)return;c.clearRect(0,0,W,H);
 const drawBall=(x,y,r)=>{const g=c.createRadialGradient(x-r*.35,y-r*.4,r*.15,x,y,r);
  g.addColorStop(0,"#FFFFFF");g.addColorStop(.7,"#F2F3F6");g.addColorStop(1,"#C9D0DB");
  c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,7);c.fill();
  c.strokeStyle="rgba(140,150,168,.65)";c.lineWidth=Math.max(.8,r*.06);
  c.beginPath();c.arc(x,y,r-.4,0,7);c.stroke();
  /* 야구공 실밥: 좌우로 볼록한 두 곡선 */
  c.save();c.beginPath();c.arc(x,y,r*.96,0,7);c.clip();
  c.strokeStyle="#C43C3C";c.lineWidth=Math.max(1.1,r*.14);c.lineCap="round";
  c.beginPath();c.arc(x-r*1.75,y,r*1.55,-.62,.62);c.stroke();
  c.beginPath();c.arc(x+r*1.75,y,r*1.55,Math.PI-.62,Math.PI+.62);c.stroke();
  c.restore()};
 for(const s of BE.statics){
  if(s.empty){ /* 공 없는 티 (공이 날아간 뒤에도 티는 남는다) */
   const h=s.r*4.6,w=s.r*.62;
   c.fillStyle="rgba(0,0,0,.28)";c.beginPath();c.ellipse(s.x,s.y+h+s.r*1.2,s.r*2.1,s.r*.55,0,0,7);c.fill();
   const g=c.createLinearGradient(s.x-w,0,s.x+w,0);
   g.addColorStop(0,"#15181F");g.addColorStop(.5,"#3A3F4C");g.addColorStop(1,"#15181F");
   c.fillStyle=g;
   c.beginPath();c.moveTo(s.x-w*.8,s.y+s.r*.8);c.lineTo(s.x+w*.8,s.y+s.r*.8);
   c.lineTo(s.x+w*1.5,s.y+h);c.lineTo(s.x-w*1.5,s.y+h);c.closePath();c.fill();
   c.fillStyle="#23262E";c.beginPath();c.ellipse(s.x,s.y+h,s.r*1.9,s.r*.5,0,0,7);c.fill();
   c.fillStyle="#2B2F3A";c.beginPath();c.ellipse(s.x,s.y+s.r*.8,w*.9,w*.4,0,0,7);c.fill();
   continue}
  if(s.tee){ /* 빈 구장용 배팅 티 기둥 */
   const h=s.r*4.6,w=s.r*.62;
   c.fillStyle="rgba(0,0,0,.28)";c.beginPath();c.ellipse(s.x,s.y+h+s.r*1.2,s.r*2.1,s.r*.55,0,0,7);c.fill();
   const g=c.createLinearGradient(s.x-w,0,s.x+w,0);
   g.addColorStop(0,"#15181F");g.addColorStop(.5,"#3A3F4C");g.addColorStop(1,"#15181F");
   c.fillStyle=g;
   c.beginPath();c.moveTo(s.x-w*.8,s.y+s.r*.8);c.lineTo(s.x+w*.8,s.y+s.r*.8);
   c.lineTo(s.x+w*1.5,s.y+h);c.lineTo(s.x-w*1.5,s.y+h);c.closePath();c.fill();
   c.fillStyle="#23262E";c.beginPath();c.ellipse(s.x,s.y+h,s.r*1.9,s.r*.5,0,0,7);c.fill();
   c.fillStyle="#2B2F3A";c.beginPath();c.ellipse(s.x,s.y+s.r*.8,w*.9,w*.4,0,0,7);c.fill()}
  else{c.fillStyle="rgba(0,0,0,.25)";c.beginPath();c.ellipse(s.x,s.y+s.r*1.5,s.r*1.1,s.r*.38,0,0,7);c.fill()}
  drawBall(s.x,s.y,s.r)}
 for(const b of BE.balls){
  c.fillStyle="rgba(0,0,0,.22)";c.beginPath();c.ellipse(b.x,b.gy,b.r*1.15,b.r*.4,0,0,7);c.fill();
  for(let i=0;i<b.trail.length;i++){const t=b.trail[i],a=(i+1)/b.trail.length;
   c.fillStyle=`rgba(120,200,255,${(a*a*.4).toFixed(3)})`;
   c.beginPath();c.arc(t.x,t.y,t.r*(0.4+.55*a),0,7);c.fill()}
  drawBall(b.x,b.y,b.r)}}
function ballLaunch(o){if(window.__FAST)o.dur=Math.min(o.dur,120);const b=Object.assign({t0:performance.now(),trail:[],x:o.x0,y:o.y0,gy:o.y0,r:o.r0},o);
 BE.balls.push(b);return b}
function ballStatic(x,y,r,tee){BE.statics=[{x,y,r,tee:!!tee}]}
function teeEmpty(x,y,r){BE.statics=[{x,y,r,empty:true}]}
function ballClear(){BE.balls.length=0;BE.statics.length=0}

/* ================= FX ================= */
function popFB(kind,txt,x,y){const d=document.createElement("div");
 d.className="fb fb-"+kind;d.textContent=txt;
 d.style.left=x+"px";d.style.top=y+"px";
 $("#scr-game").appendChild(d);setTimeout(()=>d.remove(),980)}
function zoomPunch(s=1.05){const cam=$("#cam");if(!cam)return;
 cam.classList.add("punch");cam.style.transform=`scale(${s})`;
 setTimeout(()=>{cam.classList.remove("punch");cam.style.transform="scale(1)"},60)}
function shake(){const cam=$("#cam");cam.classList.remove("shake");void cam.offsetWidth;cam.classList.add("shake")}
let _tipT=0;
function coachTip(html,ms=3400){const c=$("#tipchip");c.querySelector(".tt").innerHTML=html;
 c.classList.add("on");clearTimeout(_tipT);_tipT=setTimeout(()=>c.classList.remove("on"),ms)}
function tipOnce(game,i){const k=game+i;if(S.tips[k])return;S.tips[k]=1;store.set("tips",S.tips);
 coachTip(TIPS[game][i])}

/* ================= HUD BUILDERS ================= */
function hudPanel(label,body){return `<div class="panel"><div class="plabel">${label}</div>${body}</div>`}
function hudRound(n,total){return hudPanel("ROUND",`<div class="pbig" id="hud-round">${n}<small>/ ${total}</small></div>`)}
function hudTeam(rows){return hudPanel("TEAM",rows.map(r=>
 `<div class="trow"><span class="dot" style="background:${r.c}"></span><span class="nm">${r.n}</span><b id="${r.id}">${r.v}</b></div>`).join(""))}
function hudGoal(text){return hudPanel("NEXT GOAL",
 `<div class="goaltxt" id="hud-goaltxt">${text}</div><div class="gbar"><i id="hud-gbar"></i></div><div class="gnum" id="hud-gnum"></div>`)}
function hudScore(){return hudPanel("SCORE",
 `<div class="pbig" id="hud-score">0</div><div class="psub"><span class="crown"><svg width="13" height="13" viewBox="0 0 24 24" fill="#F5C542" style="vertical-align:-1px"><path d="M3 8l4.5 4L12 5.5 16.5 12 21 8v9H3z"/></svg></span>BEST&nbsp;<span id="hud-best">0</span></div>`)}
function hudCombo(tag){return hudPanel("COMBO",
 `<div class="pbig combo-x" id="hud-combo">x 0</div><div class="combo-tag" id="hud-combotag">${tag||""}</div>`)}
function hudRing(label){return `<div class="panel" style="position:relative"><div class="plabel">${label}</div>
 <div class="ringwrap" style="position:relative">
 <svg width="118" height="118" viewBox="0 0 118 118">
  <circle cx="59" cy="59" r="50" fill="none" stroke="#132648" stroke-width="11"/>
  <circle id="hud-ringc" cx="59" cy="59" r="50" fill="none" stroke="url(#rg)" stroke-width="11"
   stroke-linecap="round" stroke-dasharray="314" stroke-dashoffset="314" style="transition:stroke-dashoffset .5s ease"/>
  <defs><linearGradient id="rg" x1="0" y1="0" x2="1" y2="1">
   <stop offset="0" stop-color="#2E6BFF"/><stop offset=".6" stop-color="#4EC9FF"/><stop offset="1" stop-color="#3ADE8E"/>
  </linearGradient></defs></svg>
 <div class="ringtxt"><span id="hud-ringv">0</span><small>%</small></div></div>
 <div class="ringgrade" id="hud-ringg"></div></div>`}
function setRing(pct,grade){const c=$("#hud-ringc");if(!c)return;
 c.style.strokeDashoffset=(314-314*Math.min(100,pct)/100).toFixed(1);
 $("#hud-ringv").textContent=Math.round(pct);
 if(grade!==undefined)$("#hud-ringg").textContent=grade}
function setPop(sel,txt){const el=$(sel);if(!el)return;el.textContent=txt;
 el.classList.remove("pop-anim");void el.offsetWidth;el.classList.add("pop-anim")}
function setPlate(ko,en){$("#plate").innerHTML=`<div class="ko">${ko}</div><div class="en">${en}</div>`}
function setKeys(list){const el=$("#keyhint");if(!el)return;
 if(!list){el.style.display="none";el.innerHTML="";return}
 el.innerHTML=list.map(([k,t])=>`<span class="kcap">${k}</span><span class="klbl">${t}</span>`).join("");
 el.style.display="flex"}
function setCallout(html){const c=$("#callout");if(html){c.classList.remove("hide");c.innerHTML=html}else c.classList.add("hide")}
function setGoal(txt,cur,max){if(txt)$("#hud-goaltxt").innerHTML=txt;
 $("#hud-gbar").style.width=Math.min(100,cur/max*100)+"%";
 $("#hud-gnum").textContent=`${cur} / ${max}`}

/* ================= RESULT OVERLAY ================= */
const STARSVG=`<svg viewBox="0 0 24 24" fill="#F5C542" stroke="#B4720E" stroke-width=".8">
 <path d="M12 2l2.9 6.2 6.6.8-4.9 4.6 1.3 6.6L12 16.9 6.1 20.2l1.3-6.6L2.5 9l6.6-.8z"/></svg>`;
function showResult(o){const ov=$("#overlay");
 ov.innerHTML=`<div class="rescard">
  <div class="res-title">${o.title||"PRACTICE COMPLETE"}</div>
  <div class="res-stars">${STARSVG}${STARSVG}${STARSVG}</div>
  <div class="res-score">${o.score.toLocaleString()}</div>
  <div class="res-newbest">${o.isNew?"★ NEW BEST RECORD ★":"BEST "+(o.best||0).toLocaleString()}</div>
  ${o.coins?`<div class="res-coins"><img src="assets/icons/coin.png" alt="">+${o.coins} 코인 획득</div>`:""}
  <div class="res-rows">${(o.rows||[]).map(r=>`<div class="rr"><span>${r[0]}</span><b>${r[1]}</b></div>`).join("")}</div>
  <div class="res-btns"><button class="ghostbtn" id="res-menu">메뉴로</button>
  ${o.midBtn?`<button class="ghostbtn" id="res-mid">${o.midBtn}</button>`:""}
  <button class="bigbtn" id="res-retry">다시 하기</button></div></div>`;
 ov.classList.add("on");sfx.fanfare();bgmDuck();
 const stars=ov.querySelectorAll(".res-stars svg");
 for(let i=0;i<o.stars;i++)setTimeout(()=>{stars[i].classList.add("lit");sfx.star(i)},450+i*380);
 $("#res-retry").onclick=()=>{sfx.ui();ov.classList.remove("on");o.onRetry&&o.onRetry()};
 if(o.midBtn)$("#res-mid").onclick=()=>{sfx.ui();ov.classList.remove("on");o.onMid&&o.onMid()};
 $("#res-menu").onclick=()=>{sfx.ui();ov.classList.remove("on");crowdOff();openHub()}}

/* ================= GAME SCREEN SHELL ================= */
let CUR=null; // current game controller {onTap(x,y),onAction(),stop()}
function openGame(key,builder){const g=GAMES[key];
 $("#gbg").src=A+g.bg;
 $("#sprites").innerHTML="";$("#rings").innerHTML="";$("#board").innerHTML="";$("#reticle").innerHTML="";
 $("#control").innerHTML="";$("#overlay").classList.remove("on");setKeys(null);
 ballClear();setPlate(g.ko,g.en);setCallout(g.callout);
 show("game");bgmPlay("game");crowdOn();
 CUR&&CUR.stop&&CUR.stop();CUR=builder();}
function stageXY(ev){const r=$("#stage").getBoundingClientRect();
 const rw=r.width||W, rh=r.height||H;
 return {x:(ev.clientX-r.left)/rw*W, y:(ev.clientY-r.top)/rh*H}}
