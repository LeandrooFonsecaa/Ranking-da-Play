// State
const players = [];
const matches = []; // {round, team1:[a,b], team2:[c,d], s1, s2}

const $ = (q) => document.querySelector(q);
const $$ = (q) => document.querySelectorAll(q);

function updatePlayersUI(){
  const list = $("#playersList");
  list.innerHTML = players.map(p=>`<span>${p}</span>`).join("");
  // update selects
  ["#a1","#a2","#b1","#b2"].forEach(id=>{
    const sel = $(id);
    sel.innerHTML = `<option value="">Selecionar</option>` +
      players.map(p=>`<option value="${p}">${p}</option>`).join("");
  });
}

$("#addPlayerBtn").addEventListener("click", ()=>{
  const name = $("#playerName").value.trim();
  if(!name) return;
  if(players.includes(name)) { $("#msg").textContent = "Nome repetido."; return; }
  players.push(name);
  $("#playerName").value = "";
  $("#msg").textContent = "";
  updatePlayersUI();
});

function validScore(a,b,allowTB){
  const okAB = (a===6 && b>=0 && b<=5) || (b===6 && a>=0 && a<=5);
  const tb = allowTB && ((a===7 && b===6) || (a===6 && b===7));
  return okAB || tb;
}

$("#addMatchBtn").addEventListener("click", ()=>{
  const t1 = [$("#a1").value, $("#a2").value];
  const t2 = [$("#b1").value, $("#b2").value];
  const s1 = parseInt($("#scoreA").value);
  const s2 = parseInt($("#scoreB").value);
  const r  = parseInt($("#roundNo").value) || 1;
  const allowTB = $("#allowTB").checked;

  // validations
  if(t1.includes("") || t2.includes("")){ $("#msg").textContent="Selecione 2 jogadores em cada dupla."; return; }
  const setU = new Set([...t1,...t2]);
  if(setU.size !== 4){ $("#msg").textContent="Jogador repetido na mesma partida."; return; }
  if(!validScore(s1,s2,allowTB)){ $("#msg").textContent="Placar inválido. Use 6–0 a 6–5 (ou 7–6 com tiebreak)."; return; }

  matches.push({round:r, team1:t1, team2:t2, s1, s2});
  $("#msg").textContent = "";
  renderMatches();
  renderTable();
});

function renderMatches(){
  const box = $("#matches");
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
  // ranking array
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
  const data = computeTotals();
  const lines = [];
  lines.push("🚨 Ranking oficial — SUPER 8 Beach Tênis 🚨");
  data.forEach(([name,pts],i)=>{
    const medal = i===0?'🥇':i===1?'🥈':i===2?'🥉':`${i+1}º`;
    lines.push(`${medal} ${name} — ${pts} games`);
  });
  lines.push("");
  lines.push("🏖️ Bora marcar o próximo?");
  $("#zap").value = lines.join("\n");
});

// Restore from localStorage
(function(){
  try{
    const saved = JSON.parse(localStorage.getItem("super8_state")||"{}");
    if(saved.players){ players.push(...saved.players); }
    if(saved.matches){ matches.push(...saved.matches); }
  }catch(_){}
  updatePlayersUI();
  renderMatches();
  renderTable();
})();

// Persist
setInterval(()=>{
  localStorage.setItem("super8_state", JSON.stringify({players, matches}));
}, 1000);
