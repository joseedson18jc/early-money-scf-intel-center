  // ========== AUTO-GENERATED MONDAY ACTION PLAN (DECISIONS 1–3) ==========
  const OWN = {spec:["SCF specialist","Especialista SCF"], rm:["Relationship manager","Gerente de relacionamento"], risk:["Credit & risk","Crédito e risco"], ops:["Onboarding ops","Operações de cadastro"], lead:["Commercial leadership","Liderança comercial"]};
  const DUE = {1:["by Wednesday","até quarta"], 2:["by Friday","até sexta"], 3:["monitor","acompanhar"], m:["monthly committee","comitê mensal"]};
  let ACTS = [];
  function plan(w) {
    const i = w - 1, A = [];
    const add = (id, pri, dec, own, title, why, due) => A.push({id, pri, dec, own, title, why, due:due || DUE[pri]});
    // Decision 2: approved limit & error
    if (FS.kBase >= 0) add("limit", 1, 2, ["risk","spec"], T(`Request a limit increase of ${money(FS.need)}`,`Pedir aumento de limite de ${money(FS.need)}`), FS.kBase === 0 ? T(`Current balance is already above the ${money(FS.lim)} limit; top of range reaches ${money(FS.peakHigh)}.`,`Saldo atual já ultrapassa o limite de ${money(FS.lim)}; topo da faixa chega a ${money(FS.peakHigh)}.`) : T(`Base case crosses ${money(FS.lim)} in W${w + FS.kBase}; top of range reaches ${money(FS.peakHigh)}.`,`Cenário cruza ${money(FS.lim)} na S${w + FS.kBase}; topo da faixa chega a ${money(FS.peakHigh)}.`));
    else if (FS.kHigh >= 0) add("limit", 2, 2, ["risk","spec"], T(`Pre-approve ${money(FS.need)} of extra limit`,`Pré-aprovar ${money(FS.need)} de limite adicional`), T(`Base case fits, but top of range crosses ${money(FS.lim)} in W${w + FS.kHigh}.`,`Cenário cabe, mas topo da faixa cruza ${money(FS.lim)} na S${w + FS.kHigh}.`));
    else add("limit", 3, 2, ["spec"], T("Balance fits approved limit · no action","Saldo cabe no limite aprovado · sem ação"), T(`Peak of range ${money(FS.peakHigh)} = ${nf(100 * FS.peakHigh / FS.lim, 0)}% of the ${money(FS.lim)} limit.`,`Pico da faixa ${money(FS.peakHigh)} = ${nf(100 * FS.peakHigh / FS.lim, 0)}% do limite de ${money(FS.lim)}.`));
    if (D.err[i] > 8) add("err", 1, 2, ["spec"], T("Recalibrate the balance forecast","Recalibrar a projeção de saldo"), T(`Forecast error ${nf(D.err[i], 1)}% exceeds the 8.0% governance ceiling.`,`Erro de projeção de ${nf(D.err[i], 1)}% acima do teto de governança de 8,0%.`));
    if (!SRCINFO && w >= 10) add("season", 2, 2, ["risk","rm"], T("Pre-approve supplier limits for harvest peak","Pré-aprovar limites para o pico da safra"), T(`Seasonality alert: peak expected in ~${Math.max(1, 15 - w)} weeks; utilization jumps before forecast catches up.`,`Alerta de sazonalidade: pico previsto em ~${Math.max(1, 15 - w)} semanas; utilização sobe antes do modelo captar.`));
    // Decision 1: risk gate, campaign, funnel
    if (D.flags[i] >= 3) add("gate", 1, 1, ["risk"], T(`Hold campaign and clear ${D.flags[i]} open risk flags`,`Segurar campanha e resolver ${D.flags[i]} alertas de risco`), T("Growth gate: ≥3 open flags. Review duplicate invoices, expired KYC and concentration before expanding.","Trava de crescimento: ≥ 3 alertas abertos. Revisar duplicatas, KYC vencido e concentração antes de ampliar."));
    else { const exp = Math.round(30 * (DEC[0] + DEC[1] + DEC[2]) / 300); add("scale", 2, 1, ["rm"], T("Scale campaign to next 30 suppliers by propensity score","Escalar campanha para próximos 30 fornecedores pelo score"), T(`Risk flags are low (${D.flags[i]}). Deciles D1–D3 activate at ${DEC[0]}/${DEC[1]}/${DEC[2]}%: expect ~${exp} new active suppliers.`,`Alertas baixos (${D.flags[i]}). Decis D1–D3 ativam ${DEC[0]}/${DEC[1]}/${DEC[2]}%: expectativa de ~${exp} novos ativos.`)); }
    const fv = mode === "after" ? F.after : F.before; let worst = 1, wr = 1;
    for (let s = 1; s < fv.length; s++) { const r = fv[s] / fv[s - 1]; if (r < wr) { wr = r; worst = s; } }
    add("funnel", (!SRCINFO && w < 5 && worst === 3) ? 1 : 2, 1, ["ops","rm"], T(`Attack the "${L(STEPS[worst - 1])} → ${L(STEPS[worst])}" step`,`Atacar etapa "${L(STEPS[worst - 1])} → ${L(STEPS[worst])}"`), T(`Weakest conversion in funnel: ${nf(wr * 100, 0)}% (${fv[worst - 1] - fv[worst]} suppliers lost).`,`Pior conversão do funil: ${nf(wr * 100, 0)}% (${fv[worst - 1] - fv[worst]} fornecedores perdidos).`));
    if (D.days[i] > 10) add("days", 2, 1, ["ops"], T(`Cut days to 1st discount from ${D.days[i]} to ≤10 days`,`Reduzir prazo até 1º desconto de ${D.days[i]} para ≤ 10 dias`), T("Suppliers waiting >10 days show materially higher abandonment before first discount.","Fornecedores que aguardam > 10 dias têm abandono bem maior antes da 1ª antecipação."));
    // Decision 3: pipeline #1 + market pricing
    const t = totals(), top = t.flows.indexOf(Math.max(...t.flows)), b = balOf(t.flows[top]);
    add("grow", 2, 3, ["lead","spec"], T(`Take ${ANCHORS[top].name} to credit committee`,`Levar ${ANCHORS[top].name} ao comitê de crédito`), T(`#1 in pipeline: ${bn(t.flows[top])} annual flow, ${money(b)} balance, ${moneyD(revOf(b))}/yr spread.`, `Nº 1 do pipeline: fluxo anual de ${bn(t.flows[top])}, saldo de ${money(b)}, spread de ${moneyD(revOf(b))}/ano.`) + (MKT_STATE.bestWS ? T(` Largest open headroom: ${MKT_STATE.bestWS.name} (${bn(MKT_STATE.bestWS.ws, 1)}).`,` Maior espaço livre: ${MKT_STATE.bestWS.name} (${bn(MKT_STATE.bestWS.ws, 1)}).`) : ""), DUE.m);
    if (MKT_STATE.above.length) add("price", 2, 3, ["lead","spec"], T(`Review CDI+${nf(mktSpread, 2)}% pricing for ${MKT_STATE.above.join(", ")}`,`Rever preço CDI+${nf(mktSpread, 2)}% para ${MKT_STATE.above.join(", ")}`), T("Proposed spread sits above market band for this rating tier — adjust spread or compete on Document AI onboarding.","Spread proposto está acima da faixa de mercado para esse rating — ajustar taxa ou diferenciar no cadastro via IA."), DUE.m);

    A.sort((a, b2) => a.pri - b2.pri || a.dec - b2.dec);
    ACTS = A.slice(0, 6);
    const openCnt = ACTS.filter(a => a.pri < 3).length;
    $("act-n").textContent = T(`Week ${w} · ${openCnt} priority action${openCnt === 1 ? "" : "s"} · auto-generated`,`Semana ${w} · ${openCnt} aç${openCnt === 1 ? "ão prioritária" : "ões prioritárias"} · gerado automaticamente`);
    const key = a => `scf-done-${w}-${a.id}`;
    const isDone = a => { try { return localStorage.getItem(key(a)) === "1"; } catch (e) { return false; } };
    $("act-list").innerHTML = ACTS.map((a, j) => `<li class="act p${a.pri}${isDone(a) ? " done" : ""}"><span class="pr">${j + 1}</span><div><b>${a.title}</b><p>${a.why}</p><div class="meta"><span>${T("Decision","Decisão")} ${a.dec}</span><span>${a.own.map(o => L(OWN[o])).join(" + ")}</span><span>${L(a.due)}</span></div></div><label><input type="checkbox" data-a="${j}" ${isDone(a) ? "checked" : ""}> ${T("done","feito")}</label></li>`).join("");
    $("act-list").querySelectorAll("input").forEach(cb => cb.onchange = () => {
      const a = ACTS[+cb.dataset.a]; try { localStorage.setItem(key(a), cb.checked ? "1" : "0"); } catch (e) {}
      cb.closest("li").classList.toggle("done", cb.checked);
    });
  }

  // ========== CSV DATA LAYER (FIXED SMART DECIMAL PARSER + ZERO XSS) ==========
  const COLS = [
    ["semana","week","Week number","Número da semana"],
    ["gasto_pct","spend","Spend under program, % of in-scope spend","Gasto sob o programa, % das compras no escopo"],
    ["ativos","active","Active suppliers","Fornecedores ativos"],
    ["utilizacao_pct","util","Utilization, %","Utilização, %"],
    ["dias_1o_desconto","days","Days to first discount","Dias até o 1º desconto"],
    ["erro_proj_pct","err","One-week forecast error, %","Erro da projeção de 1 semana, %"],
    ["share_wallet_pct","sow","Anchor share of wallet, %","Share of wallet da âncora, %"],
    ["alertas","flags","Open risk flags","Alertas de risco abertos"],
    ["share_recebiveis_pct","supShare","Supplier share of receivables, %","Share de recebíveis do fornecedor, %"]
  ];
  let SRCINFO = null;
  function parseLocaleNumber(raw, sep) {
    let s = raw.trim().replace(/^["']|["']$/g, "");
    if (!s) return NaN;
    if (sep === ";") {
      // Only strip dots when clearly a thousands separator (e.g. 1.234 or 1.234,56), never corrupting 9.8 -> 98!
      if (s.includes(",")) s = s.replace(/\./g, "").replace(",", ".");
      else if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, "");
    } else if (/^\d{1,3}(,\d{3})+(\.\d+)?$/.test(s)) {
      s = s.replace(/,/g, "");
    }
    return parseFloat(s);
  }
  function parseCSV(text) {
    const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (lines.length < 3) throw T("The file needs a header and at least 2 weeks.","O arquivo precisa de cabeçalho e pelo menos 2 semanas.");
    const sep = lines[0].includes(";") ? ";" : ",";
    const splitRow = ln => ln.split(sep).map(s => s.trim().replace(/^"|"$/g, ""));
    const head = splitRow(lines[0]).map(s => s.toLowerCase());
    const idx = COLS.slice(1).map(([pt, en]) => { const j = head.findIndex(x => x === pt || x === en.toLowerCase()); if (j < 0) throw T(`Missing column: ${pt}`,`Coluna ausente: ${pt}`); return j; });
    const out = {}; COLS.slice(1).forEach(([, k]) => out[k] = []);
    lines.slice(1).forEach((ln, r) => {
      const cells = splitRow(ln);
      COLS.slice(1).forEach(([pt, k], c) => {
        const raw = cells[idx[c]] || "";
        const v = parseLocaleNumber(raw, sep);
        if (!isFinite(v) || v < 0) throw T(`Row ${r + 2}, column ${pt}: "${raw}" is not valid.`,`Linha ${r + 2}, coluna ${pt}: "${raw}" não é um número válido.`);
        if (/_pct$/.test(pt) && v > 100) throw T(`Row ${r + 2}, column ${pt}: must be 0–100.`,`Linha ${r + 2}, coluna ${pt}: percentual deve ficar entre 0 e 100.`);
        out[k].push(v);
      });
    });
    if (out.spend.length > 52) throw T("Up to 52 weeks per file.","No máximo 52 semanas por arquivo.");
    if (out.spend.some((s, i) => s <= 0 || out.util[i] <= 0)) throw T("Spend and utilization must be > 0 in every week.","Gasto e utilização precisam ser > 0 em todas as semanas.");
    return out;
  }
  function applyData(obj, info, spendBn = 6.0, baseSup = 300) {
    COLS.slice(1).forEach(([, k]) => { D[k] = obj[k].slice(); });
    W = D.spend.length; SPEND = spendBn * 1000; BASE_SUP = baseSup;
    recomputeBook();
    $("slider").max = W; $("tk-end").textContent = WL() + W;
    $("cfg-spend").value = (SPEND / 1000).toFixed(1); $("cfg-base").value = BASE_SUP;
    SRCINFO = info; srcChip(); updateCcyTexts(); buildKpis(); render(W);
  }
  function srcChip() {
    const c = $("src-chip"); c.classList.toggle("live", !!SRCINFO);
    $("src-txt").textContent = SRCINFO
      ? T(`Source: ${SRCINFO.name} · ${W} weeks · loaded ${SRCINFO.at}`,`Fonte: ${SRCINFO.name} · ${W} semanas · carregado em ${SRCINFO.at}`)
      : T("Source: demo data · click to load your CSV","Fonte: dados de demonstração · clique p/ carregar CSV");
  }
  function toCSV() {
    const rows = [COLS.map(c => c[0]).join(";")];
    for (let i = 0; i < W; i++) rows.push([i + 1, ...COLS.slice(1).map(([, k]) => String(D[k][i]).replace(".", ","))].join(";"));
    return rows.join("\n");
  }
  const dmsg = (t, ok) => { const m = $("data-msg"); m.textContent = t; m.className = ok ? "ok" : "err"; };
  $("d-tpl").onclick = () => {
    const url = URL.createObjectURL(new Blob(["\uFEFF" + toCSV()], {type:"text/csv;charset=utf-8"}));
    const a = document.createElement("a"); a.href = url; a.download = "scf_cockpit_semanal.csv"; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  $("d-file").onchange = e => {
    const file = e.target.files[0]; if (!file) return;
    const rd = new FileReader();
    rd.onload = () => {
      try {
        const obj = parseCSV(rd.result);
        const sp = Math.max(0.1, parseFloat($("cfg-spend").value) || 6.0);
        const bs = Math.max(10, parseInt($("cfg-base").value, 10) || 300);
        const info = {name:file.name, at:new Date().toLocaleString(loc(), {dateStyle:"short", timeStyle:"short"})};
        applyData(obj, info, sp, bs);
        try { localStorage.setItem("scf-data", JSON.stringify({obj, info, sp, bs})); } catch (er) {}
        dmsg(T(`Loaded ${obj.spend.length} weeks from ${file.name}.`,`${obj.spend.length} semanas carregadas de ${file.name}.`), true);
      } catch (err) { dmsg(String(err), false); }
      e.target.value = "";
    };
    rd.readAsText(file);
  };
  $("d-reset").onclick = () => { applyData(DEMO, null, 6.0, 300); try { localStorage.removeItem("scf-data"); } catch (e) {} dmsg(T("Restored demo data.","Dados de demonstração restaurados."), true); };
  function fillFields() { $("d-fields").innerHTML = COLS.map(c => `<tr><td><code>${c[0]}</code></td><td>${L([c[2], c[3]])}</td></tr>`).join(""); }

  // ========== PRINTABLE / COPYABLE MONDAY BRIEFING ==========
  function briefHTML() {
    const w = week, i = w - 1;
    const kp = KPIS.map(m => {
      const div = m.k === "rev" ? fx() : 1;
      const cur = m.series[i] / div, prev = i ? m.series[i - 1] / div : cur, diff = cur - prev;
      return `<tr><td>${L(m.lbl)}</td><td><b>${(m.k === "rev" ? sym() : "") + nf(cur, m.d)} ${unitOf(m)}</b></td><td>${i ? ((diff >= 0 ? "+" : "−") + nf(Math.abs(diff), m.d)) : "–"}</td></tr>`;
    }).join("");
    const al = ALERTS.filter(a => a[0] <= w).sort((a, b) => b[0] - a[0]).slice(0, 3).map(a => `<li>${WL()}${a[0]} · ${L(a[2])}</li>`).join("");
    return `<div><b>${L(I18N.h1)}</b> · ${T("Week","Semana")} ${w} · ${ccy} · ${SRCINFO ? esc(SRCINFO.name) : T("demo data","dados de demonstração")}</div>
      <h4>${T("Action plan","Plano de ação")}</h4><ol>${ACTS.map(a => `<li><b>${esc(a.title)}</b> — ${esc(a.why)} <i>(${T("Decision","Decisão")} ${a.dec} · ${a.own.map(o => L(OWN[o])).join(" + ")} · ${L(a.due)})</i></li>`).join("")}</ol>
      <h4>${T("Balance & limit outlook","Projeção de saldo e limite")}</h4><p style="color:inherit">${esc($("outlook").textContent)}<br>${esc($("limit-status").textContent)}</p>
      <h4>${T("KPIs","Indicadores")}</h4><table>${kp}</table>
      <h4>${T("Recent alerts","Alertas recentes")}</h4><ul>${al}</ul>`;
  }
  const briefText = () => {
    const d = document.createElement("div"); d.innerHTML = briefHTML();
    d.querySelectorAll("h4").forEach(x => x.textContent = "\n" + x.textContent.toUpperCase());
    d.querySelectorAll("li").forEach(x => x.textContent = "• " + x.textContent);
    d.querySelectorAll("tr").forEach(x => x.textContent = [...x.children].map(c => c.textContent).join("  "));
    return d.textContent.replace(/\n{3,}/g, "\n\n").trim();
  };
  const fillPrint = () => { $("brief-print").innerHTML = `<h1>${T("Weekly briefing","Briefing semanal")} · ${ccy}</h1><div class="brief-prev">${briefHTML()}</div>`; };
  window.addEventListener("beforeprint", fillPrint);
  $("b-print").onclick = () => { fillPrint(); window.print(); };
  $("b-copy").onclick = async () => {
    const t = briefText();
    try { await navigator.clipboard.writeText(t); $("b-msg").textContent = T("Copied to clipboard.","Copiado."); }
    catch (e) { const ta = document.createElement("textarea"); ta.value = t; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); $("b-msg").textContent = T("Copied.","Copiado."); } catch (_) {} ta.remove(); }
  };
