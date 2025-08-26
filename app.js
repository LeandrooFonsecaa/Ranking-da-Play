// Estado
const players = [];
const matches = [];
const frasesZueiras = [
  "😂 Quem perde paga a cerveja!",
  "🍌 Hoje teve mais erro que feira livre.",
  "🥵 Sol quente, mas a chapa esquentou foi na quadra.",
  "🎭 Play BT é igual novela: todo dia tem emoção.",
  "🐢 Lento no jogo, rápido pra comer no bar.",
  "🏖️ Quem não ganha no jogo, ganha no pós-jogo.",
  "💸 Bora apostar, quem perde paga o churrasco.",
  "🥶 Quem erra smash toma apelido eterno.",
  "🏓 Raquete é de beach tênis, mas o saque parece de ping pong.",
  "🍻 Um brinde ao campeão e dois pro lanterninha.",
  "🐔 Hoje teve mais frango que granja.",
  "🏃‍♂️ Quem corre muito é atleta, quem corre pouco é craque (ou preguiçoso).",
  "📸 Foto é com medalha, não com desculpa.",
  "⏱️ Bola fora não conta, mas a resenha é eterna.",
  "🤡 Quem perde reclama da rede, do vento e até do sol.",
  "🐊 Hoje teve mais caixote que beira de rio.",
  "🚑 O jogo foi tão puxado que até a panturrilha pediu arrego.",
  "🧉 Quem não trouxe isotônico, vai de tereré mesmo.",
  "🔥 Smash certeiro, mas sem replay ninguém acredita.",
  "🥳 Play BT: onde todo mundo joga, mas só um paga a conta."
];
const $ = (q) => document.querySelector(q);

function randomFrase(){
  return frasesZueiras[Math.floor(Math.random() * frasesZueiras.length)];
}

function updatePlayersUI(){
  const list = $("#playersList");
  list.innerHTML = players.map(p=>`<span>${p}</span>`).join("");
  ["#a1","#a2","#b1","#b2"].forEach(id=>{
    const sel = $(id);
    sel.innerHTML = `<option value="">Selecionar</option>` +
      players.map(p=>`<option value="${p}">${p}</option>`).join("");
  });
}

$("#addPlayerBtn").addEventListener("click", ()=>{
  const name = $("#playerName").value.trim();
  if(!name) return;
  if(players.includes(name)) { msg("Nome repetido."); return; }
  players.push(name);
  $("#playerName").value = "";
  msg("");
  updatePlayersUI();
});

function msg(t){ $("#msg").textContent = t; }
function toast(t){ const el=$("#toast"); if(!el) return; el.textContent=t; el.classList.add("show"); setTimeout(()=>el.classList.remove("show"), 1400); }

document.addEventListener("click", (e)=>{
  if(e.target.id === "clearMatchesBtn"){
    if(!matches.length){ msg("Não há partidas para limpar."); return; }
    if(confirm("Limpar TODAS as partidas?")){
      matches.splice(0, matches.length); render();
    }
  }
  if(e.target.id === "undoLastBtn"){
    if(!matches.length){ msg("Não há partidas para desfazer."); return; }
    matches.pop(); render();
  }
  if(e.target.id === "resetAllBtn"){
    if(confirm("Começar do zero?")){
      players.splice(0, players.length); matches.splice(0, matches.length);
      localStorage.removeItem("playbt_state"); updatePlayersUI(); render();
    }
  }
});

function validScore(a,b,allowTB){
  const six = (a===6 && b>=0 && b<=5) || (b===6 && a>=0 && a<=5);
  const sevenFive = (a===7 && b===5) || (b===7 && a===5);
  const sevenSix = allowTB && ((a===7 && b===6) || (a===6 && b===7));
  return six || sevenFive || sevenSix;
}

$("#addMatchBtn").addEventListener("click", ()=>{
  const t1 = [$("#a1").value, $("#a2").value];
  const t2 = [$("#b1").value, $("#b2").value];
  const s1 = parseInt($("#scoreA").value); const s2 = parseInt($("#scoreB").value);
  const r  = parseInt($("#roundNo").value) || 1;
  const allowTB = $("#allowTB").checked;
  if(t1.includes("")||t2.includes("")){ msg("Selecione jogadores."); return; }
  if(new Set([...t1,...t2]).size!==4){ msg("Jogador repetido."); return; }
  if(Number.isNaN(s1)||Number.isNaN(s2)){ msg("Informe os games."); return; }
  if(!validScore(s1,s2,allowTB)){ msg("Placar inválido."); return; }
  matches.push({round:r, team1:t1, team2:t2, s1, s2}); render();
});

function renderMatches(){
  const box = $("#matches");
  if(!matches.length){ box.innerHTML = '<div class="muted">Nenhuma partida registrada.</div>'; return; }
  box.innerHTML = matches.map(m=>`
    <div class="match"><strong>R${m.round}</strong> • ${m.team1.join(" & ")} <b>${m.s1} x ${m.s2}</b> ${m.team2.join(" & ")}</div>
  `).join("");
}

function computeTotals(){
  const totals = {}; players.forEach(p=>totals[p]=0);
  matches.forEach(m=>{ m.team1.forEach(p=> totals[p]+=m.s1); m.team2.forEach(p=> totals[p]+=m.s2); });
  return Object.entries(totals).sort((a,b)=> b[1]-a[1]);
}

function renderTable(){
  const data = computeTotals();
  $("#table").innerHTML = `
    <table><thead><tr><th>Pos</th><th>Jogador</th><th style="text-align:right">Games</th></tr></thead>
    <tbody>${data.map(([n,p],i)=>`<tr><td>${i+1}º</td><td>${n}</td><td style="text-align:right">${p}</td></tr>`).join("")}</tbody></table>`;
}

$("#genZap").addEventListener("click", ()=>{
  const lines = [];
  lines.push("🎾 Resultados das partidas — RANKING DA PLAY BT");
  lines.push(randomFrase()); // Frase logo abaixo do título
  if(!matches.length){ lines.push("• Nenhuma partida registrada ainda."); }
  else { matches.forEach(m=> lines.push(`• R${m.round}: ${m.team1.join(' & ')} ${m.s1} x ${m.s2} ${m.team2.join(' & ')}`)); }
  lines.push(""); lines.push("🏆 Ranking (soma de games)");
  const data = computeTotals();
  if(!data.length){ lines.push("— Sem jogadores cadastrados —"); }
  else {
    data.forEach(([name,pts],i)=>{
      const medal = i===0?'🥇':i===1?'🥈':i===2?'🥉':'🏅';
      lines.push(`${medal} ${name} — ${pts} games`);
    });
  }
  lines.push(""); lines.push("🏖️ Bora marcar o próximo?"); lines.push(randomFrase());
  $("#zap").value = lines.join("\n");
});

$("#copyZap").addEventListener("click", async ()=>{
  const txt = $("#zap").value.trim(); if(!txt){ msg("Gere a mensagem primeiro."); return; }
  try{ await navigator.clipboard.writeText(txt); toast("Mensagem copiada ✔"); }
  catch(e){ const ta=$("#zap"); ta.select(); ta.setSelectionRange(0,99999); document.execCommand("copy"); toast("Mensagem copiada ✔"); }
});

function render(){ renderMatches(); renderTable(); }
(function(){ try{ const s=JSON.parse(localStorage.getItem("playbt_state")||"{}"); if(s.players)players.push(...s.players); if(s.matches)matches.push(...s.matches);}catch(_){}
  updatePlayersUI(); render(); })();
setInterval(()=> localStorage.setItem("playbt_state", JSON.stringify({players,matches})),1000);
