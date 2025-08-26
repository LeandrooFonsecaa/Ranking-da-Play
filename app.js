const players=[],matches=[];
const $=q=>document.querySelector(q);
function updatePlayersUI(){const l=$("#playersList");l.innerHTML=players.map(p=>`<span>${p}</span>`).join("");["#a1","#a2","#b1","#b2"].forEach(id=>{const s=$(id);s.innerHTML='<option value="">Selecionar</option>'+players.map(p=>`<option value="${p}">${p}</option>`).join("");});}
$("#addPlayerBtn").onclick=()=>{const n=$("#playerName").value.trim();if(!n)return;if(players.includes(n)){msg("Nome repetido.");return;}players.push(n);$("#playerName").value="";msg("");updatePlayersUI();};
function msg(t){$("#msg").textContent=t;}
document.addEventListener("click",e=>{if(e.target.id==="clearMatchesBtn"){matches.length=0;msg("Partidas limpas.");render();}
if(e.target.id==="resetAllBtn"){players.length=0;matches.length=0;localStorage.removeItem("playbt_state");msg("Tudo zerado.");updatePlayersUI();render();}});
function render(){renderMatches();renderTable();}
function renderMatches(){const b=$("#matches");if(!matches.length){b.innerHTML='<div class="muted">Nenhuma partida.</div>';return;}b.innerHTML=matches.map(m=>`<div>${m.team1.join(" & ")} ${m.s1}x${m.s2} ${m.team2.join(" & ")}</div>`).join("");}
function computeTotals(){const t={};players.forEach(p=>t[p]=0);matches.forEach(m=>{m.team1.forEach(p=>t[p]+=m.s1);m.team2.forEach(p=>t[p]+=m.s2);});return Object.entries(t).sort((a,b)=>b[1]-a[1]);}
function renderTable(){const d=computeTotals();$("#table").innerHTML='<table>'+d.map(([n,p],i)=>`<tr><td>${i+1}º</td><td>${n}</td><td>${p}</td></tr>`).join("")+"</table>";}
$("#addMatchBtn").onclick=()=>{const t1=[$("#a1").value,$("#a2").value],t2=[$("#b1").value,$("#b2").value];const s1=parseInt($("#scoreA").value)||0,s2=parseInt($("#scoreB").value)||0;matches.push({team1:t1,team2:t2,s1,s2});render();};
$("#genZap").onclick=()=>{const d=computeTotals();let l=["🚨 Ranking oficial — RANKING DA PLAY BT 🚨"];d.forEach(([n,p],i)=>{l.push(`${i+1}º ${n} — ${p} games`);});$("#zap").value=l.join("\n");};
(function(){try{const s=JSON.parse(localStorage.getItem("playbt_state")||"{}");if(s.players)players.push(...s.players);if(s.matches)matches.push(...s.matches);}catch(e){}updatePlayersUI();render();})();setInterval(()=>{localStorage.setItem("playbt_state",JSON.stringify({players,matches}));},1000);
