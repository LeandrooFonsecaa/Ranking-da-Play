// v6.3-fix — adicionar jogadores corrigido + modo 6 games fixos permite empate (A+B=6)
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

function randomFrase(){ return frasesZueiras[Math.floor(Math.random()*frasesZueiras.length)]; }
function msg(t){ const el = $("#msg"); if(el) el.textContent = t; }
function toast(t){ const el=$("#toast"); if(!el) return; el.textContent=t; el.classList.add("show"); setTimeout(()=>el.classList.remove("show"), 1400); }

function updateRuleHint(){
  const short  = $("#shortSet").checked;
  const tb     = $("#allowTB").checked;
  const allow65= $("#allow65").checked;
  const fixed6 = $("#fixed6").checked;

  let hint = "";
  if(short){
    hint = `Regras (set curto): vitória com 4–0 a 4–3. ${tb ? "Com tiebreak: 5–4 permitido." : "Ative o tiebreak para permitir 5–4."}`;
  } else if(fixed6){
    hint = "Regras (6 games fixos): qualquer placar em que A+B=6 é válido (empate 3–3 incluso).";
  } else {
    hint = `Regras (Super 8): ${allow65 ? "vitória com 6–0 a 6–5" : "vitória com 6–0 a 6–4 (6–5 NÃO vale)"}; 5–5 vai a 2 ⇒ 7–5. ${tb ? "Com tiebreak: 7–6 também é válido." : "Ative o tiebreak para permitir 7–6."}`;
  }
  $("#ruleHint").textContent = hint;
}

function updatePlayersUI(){
  const list = $("#playersList");
  if(list){
    list.innerHTML = players.map(p=>`<span>${p}</span>`).join("");
  }
  ["#a1","#a2","#b1","#b2"].forEach(id=>{
    const sel = $(id);
    if(sel){
      sel.innerHTML = `<option value="">Selecionar</option>` + players.map(p=>`<option value="${p}">${p}</option>`).join("");
    }
  });
}

function renderMatches(){
  const box = $("#matches");
  if(!box) return;
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
  const tableDiv = $("#table");
  if(!tableDiv) return;
  tableDiv.innerHTML = `
    <table><thead><tr><th>Pos</th><th>Jogador</th><th style="text-align:right">Games</th></tr></thead>
    <tbody>${data.map(([n,p],i)=>`<tr><td>${i+1}º</td><td>${n}</td><td style="text-align:right">${p}</td></tr>`).join("")}</tbody></table>`;
}

function render(){ renderMatches(); renderTable(); updateRuleHint(); saveState(); }

// ====== Eventos ======
document.addEventListener("change", (e)=>{
  if(["shortSet","allowTB","allow65","fixed6"].includes(e.target.id)){ updateRuleHint(); }
});

document.addEventListener("click", (e)=>{
  const id = e.target.id;

  if(id === "addPlayerBtn"){
    const nameInput = $("#playerName");
    const name = (nameInput?.value || "").trim();
    if(!name){ msg("Digite um nome."); return; }
    if(players.includes(name)){ msg("Nome repetido."); return; }
    players.push(name);
    nameInput.value = "";
    msg("");
    updatePlayersUI();
    renderTable();
    return;
  }

  if(id === "clearMatchesBtn"){
    if(!matches.length){ msg("Não há partidas para limpar."); return; }
    if(confirm("Limpar TODAS as partidas?")){
      matches.splice(0, matches.length); render();
    }
    return;
  }

  if(id === "undoLastBtn"){
    if(!matches.length){ msg("Não há partidas para desfazer."); return; }
    matches.pop(); render();
    return;
  }

  if(id === "resetAllBtn"){
    if(confirm("Começar do zero?")){
      players.splice(0, players.length);
      matches.splice(0, matches.length);
      localStorage.removeItem("playbt_state");
      updatePlayersUI(); render();
    }
    return;
  }

  if(id === "addMatchBtn"){
    addMatch();
    return;
  }

  if(id === "genZap"){
    generateWhats();
    return;
  }

  if(id === "copyZap"){
    copyWhats();
    return;
  }
});

function validScore(a,b,allowTB,short,allow65,fixed6){
  if(short){
    const four = (a===4 && b>=0 && b<=3) || (b===4 && a>=0 && a<=3);
    const fiveFour = allowTB && ((a===5 && b===4) || (a===4 && b===5));
    return four || fiveFour;
  } else if(fixed6){
    // Aceita QUALQUER placar onde A+B=6 (inclusive 3x3)
    return (a + b === 6);
  } else {
    const sixWin = allow65
      ? ((a===6 && b>=0 && b<=5) || (b===6 && a>=0 && a<=5))
      : ((a===6 && b>=0 && b<=4) || (b===6 && a>=0 && a<=4));
    const sevenFive = (a===7 && b===5) || (b===7 && a===5);
    const sevenSix = allowTB && ((a===7 && b===6) || (a===6 && b===7));
    return sixWin || sevenFive || sevenSix;
  }
}

function addMatch(){
  const t1 = [$("#a1").value, $("#a2").value];
  const t2 = [$("#b1").value, $("#b2").value];
  const s1 = parseInt($("#scoreA").value, 10);
  const s2 = parseInt($("#scoreB").value, 10);
  const r  = parseInt($("#roundNo").value, 10) || 1;

  const allowTB = $("#allowTB").checked;
  const short   = $("#shortSet").checked;
  const allow65 = $("#allow65").checked;
  const fixed6  = $("#fixed6").checked;

  if(t1.includes("") || t2.includes("")){ msg("Selecione os jogadores."); return; }
  if(new Set([...t1,...t2]).size !== 4){ msg("Jogador repetido."); return; }
  if(Number.isNaN(s1) || Number.isNaN(s2)){ msg("Informe os games."); return; }

  if(!validScore(s1, s2, allowTB, short, allow65, fixed6)){
    msg("Placar inválido para as regras atuais.");
    return;
  }

  matches.push({ round:r, team1:t1, team2:t2, s1, s2 });
  msg("");
  render();
}

function generateWhats(){
  const lines = [];
  lines.push("🎾 Resultados das partidas — RANKING DA PLAY BT");
  lines.push("");
  lines.push(randomFrase());
  lines.push("");

  if(!matches.length){ lines.push("• Nenhuma partida registrada ainda."); }
  else { matches.forEach(m=> lines.push(`• R${m.round}: ${m.team1.join(' & ')} ${m.s1} x ${m.s2} ${m.team2.join(' & ')}`)); }

  lines.push("");
  lines.push("🏆 Ranking (soma de games)");
  const data = computeTotals();
  if(!data.length){ lines.push("— Sem jogadores cadastrados —"); }
  else {
    data.forEach(([name,pts],i)=>{
      const medal = i===0?'🥇':i===1?'🥈':i===2?'🥉':'🏅';
      lines.push(`${medal} ${name} — ${pts} games`);
    });
  }
  lines.push("");
  lines.push("🏖️ Bora marcar o próximo?");
  lines.push(randomFrase());

  const ta = $("#zap");
  if(ta) ta.value = lines.join("\n");
}

async function copyWhats(){
  const ta = $("#zap");
  const txt = ta?.value || "";
  if (!txt.trim()) { toast('Nada para copiar.'); return; }
  try { await navigator.clipboard.writeText(txt); toast('Mensagem copiada!'); }
  catch (e) {
    try { ta.focus(); ta.select(); ta.setSelectionRange(0, 999999); const ok = document.execCommand('copy'); toast(ok ? 'Mensagem copiada!' : 'Não consegui copiar 😕'); }
    catch { toast('Não consegui copiar 😕'); }
  }
}

// ====== Persistência ======
function saveState(){
  try{ localStorage.setItem("playbt_state", JSON.stringify({players, matches})); }catch(_){}
}
(function init(){
  try{
    const s = JSON.parse(localStorage.getItem("playbt_state") || "{}");
    if(Array.isArray(s.players)) players.push(...s.players);
    if(Array.isArray(s.matches)) matches.push(...s.matches);
  }catch(_){}
  updatePlayersUI();
  render();
})();
