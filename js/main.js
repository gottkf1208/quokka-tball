"use strict";
/* ================= BOOT ================= */
function bindGlobal(){
 addEventListener("resize",fit);fit();
 beInit();beLoop();
 /* stage tap routing (game screen) */
 $("#scr-game").addEventListener("pointerdown",e=>{
  if(e.target.closest("button,#corner,#overlay"))return;
  if(CUR&&CUR.onTap)CUR.onTap(stageXY(e))});
 addEventListener("keydown",e=>{
  const game=$("#scr-game").classList.contains("on");
  if(e.code==="Space"||e.code==="Enter"){if(game){e.preventDefault();CUR&&CUR.onAction&&CUR.onAction()}}
  else if(e.code==="KeyM"&&!e.repeat&&document.activeElement.tagName!=="INPUT")toggleMute();
  else if(game&&["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(e.code))e.preventDefault()});
 /* corner buttons */
 $("#btn-home").onclick=()=>{sfx.ui();CUR&&CUR.stop&&CUR.stop();CUR=null;openHub()};
 $("#btn-sound").onclick=toggleMute;
 $("#g-sound").onclick=toggleMute;
 paintSound();
 sndInit();
 /* 첫 클릭(제스처)에 오프닝 음악 시동 — 타이틀에서 바로 울리도록 */
 addEventListener("pointerdown",()=>bgmStart(),{once:true});
 bindTitle()}
function toggleMute(){S.muted=!S.muted;store.set("muted",S.muted);
 bgmMute(S.muted);
 if(S.muted)crowdOff();else if($("#scr-game").classList.contains("on"))crowdOn();
 paintSound()}
function paintSound(){const svg=S.muted
 ?`<svg viewBox="0 0 24 24"><path d="M11 5L6 9H2v6h4l5 4z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>`
 :`<svg viewBox="0 0 24 24"><path d="M11 5L6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M19 5a9 9 0 0 1 0 14"/></svg>`;
 const a=$("#btn-sound");if(a)a.innerHTML=svg;
 const b=$("#g-sound");if(b)b.innerHTML=svg}
function preload(){
 const list=["bg/bg_gametitle.jpg","bg/scene_day.jpg","bg/scene_night.jpg","bg/scene_sunset.jpg","bg/bg_nb7.jpg",
  "bg/final_sunset.jpg","bg/final_night.jpg",
  "quokka/q_guard.png","quokka/q_idle.png","quokka/q_victory.png",
  "icons/coin.png","icons/clipboard.png","icons/trophy.png","icons/laurel.png",
  "icons/helmet.png","icons/bat.png","icons/glove.png","icons/tee.png","icons/base.png","icons/ball.png"];
 TKEYS.forEach(k=>list.push("teams/"+k+"_idle.png"));
 ["idle","swing","run","catch","throw","cheer","victory","fielder","special"].forEach(p=>{
  if(S.team)list.push("teams/"+S.team+"_"+p+".png")});
 DEX.forEach(c=>list.push("dex/"+c.f));
 list.forEach(src=>{const i=new Image();i.src=A+src})}
document.addEventListener("DOMContentLoaded",()=>{bindGlobal();preload();openTitle()});
