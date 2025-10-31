// v6.3 - Modo "6 games fixos" agora aceita empates (A+B=6)
const players = [];
const matches = [];
const $ = (q) => document.querySelector(q);

function updateRuleHint(){
  const short  = $("#shortSet").checked;
  const tb     = $("#allowTB").checked;
  const allow65= $("#allow65").checked;
  const fixed6 = $("#fixed6").checked;
  let hint = "";
  if(short){
    hint = `Regras (set curto): vitória com 4–0 a 4–3. ${tb?"Com tiebreak: 5–4 permitido.":"Ative o tiebreak para permitir 5–4."}`;
  } else if(fixed6){
    hint = "Regras (6 games fixos): qualquer placar em que A+B=6 é válido (empates 3–3 também).";
  } else {
    hint = `Regras (Super 8): ${allow65?"vitória com 6–0 a 6–5":"vitória com 6–0 a 6–4 (6–5 NÃO vale)"}; ${tb?"Com tiebreak: 7–6 permitido.":"Ative o tiebreak para permitir 7–6."}`;
  }
  $("#ruleHint").textContent = hint;
}

function msg(t){ $("#msg").textContent = t; }

function validScore(a,b,allowTB,short,allow65,fixed6){
  if(short){
    const four = (a===4 && b>=0 && b<=3) || (b===4 && a>=0 && a<=3);
    const fiveFour = allowTB && ((a===5 && b===4)||(a===4 && b===5));
    return four || fiveFour;
  }else if(fixed6){
    return (a+b===6);
  }else{
    const sixWin = allow65?((a===6&&b<=5)||(b===6&&a<=5)):((a===6&&b<=4)||(b===6&&a<=4));
    const sevenFive=(a===7&&b===5)||(b===7&&a===5);
    const sevenSix=allowTB&&((a===7&&b===6)||(b===7&&a===6));
    return sixWin||sevenFive||sevenSix;
  }
}
