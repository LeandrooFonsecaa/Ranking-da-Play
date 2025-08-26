// Estado
const players = [];
const matches = []; // {round, team1:[a,b], team2:[c,d], s1, s2}

const $ = (q) => document.querySelector(q);

function updatePlayersUI(){
  const list = $("#playersList");
  list.innerHTML = players.map(p=>`<span>${p}</span>`).join("");
  // selects
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
      matches.splice(0, matches.length);
      msg("Partidas limpas.");
      render();
    }
  }
  if(e.target.id === "undoLastBtn"){
    if(!matches.length){ msg("Não há partidas para desfazer."); return; }
    const last = matches[matches.length-1];
    if(confirm(`Remover a última partida?\nR${last.round}: ${last.team1.join(' & ')} ${last.s1} x ${last.s2} ${last.team2.join(' & ')}`)){
      matches.pop();
      msg("Última partida removida.");
      render();
    }
  }
  if(e.target.id === "resetAllBtn"){
    if(confirm("Começar do zero? (Apaga jogadores e partidas)")){
      players.splice(0, players.length);
      matches.splice(0, matches.length);
      localStorage.removeItem("playbt_state");
      msg("Tudo zerado. Adicione novos jogadores.");
      updatePlayersUI();
      render();
    }
  }
});

// Validação com 'vai a 2': 6–0..5, 7–5 sempre; 7–6 só com tiebreak
function validScore(a,b,allowTB){
  const six = (a===6 && b>=0 && b<=5) || (b===6 && a>=0 && a<=5);
  const sevenFive = (a===7 && b===5) || (b===7 && a===5);
  const sevenSix = allowTB && ((a===7 && b===6) || (a===6 && b===7));
  return six || sevenFive || sevenSix;
}

$("#addMatchBtn").addEventListener("click", ()=>{
  const t1 = [$("#a1").value, $("#a2").value];
  const t2 = [$("#b1").value, $("#b2").value];
  const s1 = parseInt($("#scoreA").value);
  const s2 = parseInt($("#scoreB").value);
  const r  = parseInt($("#roundNo").value) || 1;
  const allowTB = $("#allowTB").checked;

  if(t1.includes("") || t2.includes("")){ msg("Selecione 2 jogadores em cada dupla."); return; }
  const setU = new Set([...t1,...t2]);
  if(setU.size !== 4){ msg("Jogador repetido na mesma partida."); return; }
  if(Number.isNaN(s1) || Number.isNaN(s2)){ msg("Informe os games das duas duplas."); return; }
  if(!validScore(s1,s2,allowTB)){
    msg("Placar inválido. Use 6–0 a 6–5, 7–5 (vai a 2) ou 7–6 (com tiebreak).");
    return;
  }

  matches.push({round:r, team1:t1, team2:t2, s1, s2});
  msg("");
  render();
});

function renderMatches(){
  const box = $("#matches");
  if(!matches.length){ box.innerHTML = '<div class="muted">Nenhuma partida registrado.</div>'; return; }
  box.innerHTML = matches.map(m=>`
    <div class="match">
      <strong>R${m.round}</strong> • ${m.team1.join(" & ")} <b>${m.s1} x ${m.s2}</b> ${m.team2.join(" & ")}
    </div>
  `).join("");
}

function computeTotals(){
  const totals = {}; players.forEach(p=>totals[p]=0);
  matches.forEach(m=>{
    m.team1.forEach(p=> totals[p] += m.s1);
    m.team2.forEach(p=> totals[p] += m.s2);
  });
  return Object.entries(totals).sort((a,b)=> b[1]-a[1]);
}

function renderTable(){
  const data = computeTotals();
  const rows = data.map(([name,pts],i)=>`
    <tr><td>${i+1}º</td><td>${name}</td><td style="text-align:right">${pts}</td></tr>
  `).join("");
  $("#table").innerHTML = `
    <table>
      <thead><tr><th>Pos</th><th>Jogador</th><th style="text-align:right">Games</th></tr></thead>
      <tbody>${rows || '<tr><td colspan="3">Sem dados ainda</td></tr>'}</tbody>
    </table>`;
}

$("#genZap").addEventListener("click", ()=>{
  // 1) Listar cada partida
  const lines = [];
  lines.push("🎾 Resultados das partidas — RANKING DA PLAY BT");
  if(!matches.length){
    lines.push("• Nenhuma partida registrada ainda.");
  } else {
    matches.forEach(m=>{
      lines.push(`• R${m.round}: ${m.team1.join(' & ')} ${m.s1} x ${m.s2} ${m.team2.join(' & ')}`);
    });
  }

  // 2) Ranking final
  lines.push("");
  lines.push("🏆 Ranking (soma de games)");
  const data = computeTotals();
  if(!data.length){
    lines.push("— Sem jogadores cadastrados —");
  } else {
    data.forEach(([name,pts],i)=>{
      const medal = i===0?'🥇':i===1?'🥈':i===2?'🥉':`${i+1}º`;
      lines.push(`${medal} ${name} — ${pts} games`);
    });
  }
  lines.push("");
  lines.push("🏖️ Bora marcar o próximo?");

  $("#zap").value = lines.join("\n");
});

// Copy to clipboard
$("#copyZap").addEventListener("click", async ()=>{
  const txt = $("#zap").value.trim();
  if(!txt){ msg("Gere a mensagem primeiro."); return; }
  try{
    await navigator.clipboard.writeText(txt);
    toast("Mensagem copiada ✔");
  }catch(e){
    // fallback
    const ta = $("#zap");
    ta.select(); ta.setSelectionRange(0, 99999);
    const ok = document.execCommand("copy");
    toast(ok ? "Mensagem copiada ✔" : "Não foi possível copiar");
  }
});

function render(){ renderMatches(); renderTable(); }

// Restaurar/Persistir localmente
(function(){
  try{
    const saved = JSON.parse(localStorage.getItem("playbt_state")||"{}");
    if(saved.players){ players.push(...saved.players); }
    if(saved.matches){ matches.push(...saved.matches); }
  }catch(_){}
  updatePlayersUI();
  render();
})();

setInterval(()=>{
  localStorage.setItem("playbt_state", JSON.stringify({players, matches}));
}, 1000);
