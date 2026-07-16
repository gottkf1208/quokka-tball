"use strict";
const TEAMS={
 lg:{n:"쌍둥이즈",c:"#C4003D"}, doosan:{n:"곰돌즈",c:"#EA1E31"}, kia:{n:"호랑즈",c:"#EA0029"},
 samsung:{n:"사자즈",c:"#0763FF"}, lotte:{n:"갈매기즈",c:"#D00F31"}, ssg:{n:"랜더스즈",c:"#FFB81C"},
 nc:{n:"공룡즈",c:"#4E8FDF"}, kt:{n:"마법사즈",c:"#EB1C24"}, kiwoom:{n:"히어로즈",c:"#B07485"},
 hanwha:{n:"독수리즈",c:"#FF6600"}};
const TKEYS=Object.keys(TEAMS);
const A="assets/";
const timg=(k,pose)=>A+"teams/"+k+"_"+pose+".png";

const GAMES={
 bat:{ko:"타격 연습",en:"TEE-BALL PRACTICE",bg:"bg/final_sunset.jpg",pose:"swing",
   desc:"수비가 없는 빈 곳을<br>노려서 안타를 만들어요",callout:"정면은 수비 정면!<br><b>빈 곳</b>을 노리세요"},
 field:{ko:"수비 연습",en:"FIELDING PRACTICE",bg:"bg/bg_nb7.jpg",pose:"catch",
   desc:"낙하지점으로 달려가<br>공을 잡아 보세요",callout:"낙하지점으로<br>이동해 공을 잡으세요!"},
 throw:{ko:"송구 연습",en:"THROWING ACCURACY",bg:"bg/final_night.jpg",pose:"throw",
   desc:"움직이는 표적을 향해<br>정확하게 송구!",callout:"동료의 표적에 맞춰<br>정확하게 던지세요!"},
 power:{ko:"파워 챌린지",en:"BATTING POWER CHALLENGE",bg:"bg/final_night.jpg",pose:"victory",
   desc:"미션을 클리어하며<br>최고 비거리에 도전!",callout:"정확한 타이밍으로<br>멀리 쳐 보세요!"},
 match:{ko:"실전 경기",en:"REAL MATCH · 2 INNINGS",bg:"bg/scene_day.jpg",pose:"special",
   desc:"진짜 티볼 규칙으로<br>2이닝 승부를 펼쳐요!",callout:"타이밍에 맞춰 치고<br>규칙 카드를 모으세요!"}};

/* ===== 규칙 도감 (사용자 제작 카드 아트) ===== */
const DEX=[
 {id:1,f:"card06.jpg",t:"T볼이 뭐예요?",hint:"실전 경기를 시작해 보세요"},
 {id:2,f:"card08.jpg",t:"경기장과 준비물",hint:"실전 경기를 시작해 보세요"},
 {id:3,f:"card01.jpg",t:"타격 규칙",hint:"실전 경기에서 첫 안타를 쳐 보세요"},
 {id:4,f:"card03.jpg",t:"루 달리기",hint:"실전 경기에서 첫 득점을 올려 보세요"},
 {id:5,f:"card07.jpg",t:"아웃 규칙",hint:"실전 경기에서 아웃을 경험해 보세요"},
 {id:6,f:"card04.jpg",t:"페어볼 · 파울볼",hint:"실전 경기에서 파울볼을 쳐 보세요"},
 {id:7,f:"card02.jpg",t:"수비와 송구",hint:"실전 경기 수비에서 아웃을 잡아 보세요"},
 {id:8,f:"card05.jpg",t:"점수와 경기 흐름",hint:"실전 경기에서 공수교대를 해 보세요"},
 {id:9,f:"card09.jpg",t:"안전과 예절",hint:"실전 경기를 끝까지 마쳐 보세요"}];
const dimg=f=>A+"dex/"+f;

const TIPS={
 bat:["티볼은 투수가 없어요. <b>티 위에 멈춘 공</b>을 치니까 누구나 안타를 노릴 수 있죠!",
      "<b>공을 끝까지 보고</b> 허리를 돌려 스윙하면 정확하게 맞아요",
      "너무 서두르면 헛스윙! 티볼은 <b>기다렸다가 정확히</b> 치는 게 최고예요"],
 field:["플라이볼을 <b>노바운드로 잡으면</b> 타자는 바로 아웃!",
      "공보다 <b>먼저 낙하지점에 도착</b>하는 게 수비의 핵심이에요",
      "잡은 공을 <b>1루로 빠르게 송구</b>하면 더블 플레이도 가능해요"],
 throw:["송구는 <b>상대의 가슴</b>을 향해 던져야 받기 쉬워요",
      "<b>팔꿈치를 어깨 높이</b>까지 올리면 공이 똑바로 날아가요"],
 power:["멀리 치려면 힘보다 <b>타이밍</b>! 스위트스팟에 맞으면 훨씬 멀리 날아가요",
      "펜스를 넘기면 <b>홈런</b>! 티볼에서도 가장 신나는 순간이죠"],
 match:["티볼은 <b>삼진이 없어요</b>. 좋은 공이 올 때까지 침착하게 노려 보세요",
      "파울이 되면 <b>다시 티에 올리고</b> 한 번 더! 아웃이 아니에요",
      "친 다음에는 <b>반시계 방향</b>으로! 1루 → 2루 → 3루 → 홈이에요",
      "수비는 공을 잡아 <b>주자보다 먼저 베이스에</b> 보내면 아웃이에요"]};
