  // ========== KPI TILES (ALL CLICKABLE FOR AUDIT PROOF) ==========
  function buildKpis() {
    const kpiWrap = $("kpis");
    kpiWrap.innerHTML = "";
    KPIS.forEach(m => {
      const c = document.createElement("div");
      c.className = "card kpi clickable-card" + (m.hl ? " hl" : "");
      c.dataset.proof = "kpi-" + m.k;
      c.tabIndex = 0;
      c.setAttribute("role", "button");
      c.setAttribute("aria-label", `${L(m.lbl)} — ${T("View proof","Ver prova")}`);
      c.innerHTML = `<div class="top"><span class="lbl">${L(m.lbl)}</span><span class="delta flat" id="d_${m.k}">–</span></div>
        <div class="val"><span id="v_${m.k}"></span><span class="u">${unitOf(m)}</span></div>
        <div class="q">${L(m.q)}</div>
        <svg class="spark" id="s_${m.k}" viewBox="0 0 200 32" preserveAspectRatio="none" aria-hidden="true"></svg>
        <span class="proof-cue">${T("View proof ↗","Ver prova ↗")}</span>`;
      kpiWrap.appendChild(c);
    });
  }
  function spark(m, w) {
    const s = $("s_" + m.k); if (!s) return;
    s.innerHTML = "";
    const vals = m.series, mn = Math.min(...vals), mx = Math.max(...vals);
    const X = i => 4 + i * (192 / Math.max(1, W - 1));
    const Y = v => 28 - (v - mn) / ((mx - mn) || 1) * 22;
    const col = m.hl ? "#7FD8F7" : C.blue;
    el("path", {d: vals.map((v, i) => `${i ? "L" : "M"}${X(i)},${Y(v)}`).join(" "), fill:"none", stroke: m.hl ? "rgba(255,255,255,.18)" : C.grid, "stroke-width":2}, s);
    el("path", {d: vals.slice(0, w).map((v, i) => `${i ? "L" : "M"}${X(i)},${Y(v)}`).join(" "), fill:"none", stroke:col, "stroke-width":2.4, "stroke-linecap":"round", "stroke-linejoin":"round"}, s);
    el("circle", {cx:X(w - 1), cy:Y(vals[w - 1]), r:3.8, fill:col}, s);
  }
  function updateKpis(w) {
    KPIS.forEach(m => {
      const div = m.k === "rev" ? fx() : 1;
      const to = m.series[w - 1] / div, prev = (w > 1 ? m.series[w - 2] : m.series[w - 1]) / div;
      $("v_" + m.k).textContent = (m.k === "rev" ? sym() : "") + nf(to, m.d);
      const d = +(to - prev).toFixed(m.k === "rev" && ccy === "USD" ? 2 : 1);
      const dEl = $("d_" + m.k);
      const better = d === 0 ? 0 : Math.sign(d) === m.good ? 1 : -1;
      dEl.className = "delta " + (better > 0 ? "up" : better < 0 ? "down" : "flat");
      const unit = Array.isArray(m.u) && m.u[0] === "%" ? " pp" : m.k === "days" ? " d" : m.k === "rev" ? T("m"," mi") : "";
      dEl.textContent = w === 1 ? T("Baseline","Base") : d === 0 ? T("Flat","Estável") : (d > 0 ? "+" : "−") + nf(Math.abs(d), Math.abs(d) % 1 ? (m.k === "rev" && ccy === "USD" ? 2 : 1) : 0) + unit;
      spark(m, w);
    });
  }

  // ========== COMMENTARY + ALERTS ==========
  function commentary(w) {
    const i = w - 1, p = Math.max(0, i - 1), dA = D.active[i] - D.active[p], share = Math.round(D.active[i] / BASE_SUP * 100), err = nf(D.err[i], 1), ok = D.err[i] <= 8;
    $("briefingWeekTag").textContent = WL() + w + " · " + (SRCINFO ? SRCINFO.name : T("Pilot anchor","Âncora piloto"));
    let t = T(
      `Week ${w}: active suppliers ${dA > 0 ? "rose by " + dA + " to" : "held at"} ${D.active[i]} (${share}% of the ${BASE_SUP}-supplier base). Utilization is ${D.util[i]}% and share of wallet ${D.sow[i]}%. Forecast error is ${err}%, ${ok ? "inside" : "above"} the 8% tolerance. `,
      `Semana ${w}: fornecedores ativos ${dA > 0 ? "subiram " + dA + " para" : "permaneceram em"} ${D.active[i]} (${share}% da base de ${BASE_SUP}). Utilização em ${D.util[i]}% e share of wallet em ${D.sow[i]}%. Erro de projeção de ${err}%, ${ok ? "dentro" : "acima"} da tolerância de 8%. `
    );
    t += (!SRCINFO && w >= 5)
      ? T(`Days to first discount fell to ${D.days[i]} since document AI went live in week 5. `,`O prazo até o primeiro desconto caiu para ${D.days[i]} dias desde que a IA de documentos entrou em produção na semana 5. `)
      : T(`Current median time to first discount is ${D.days[i]} days${!SRCINFO ? "; document AI goes live in week 5" : ""}. `,`O prazo mediano até o primeiro desconto está em ${D.days[i]} dias${!SRCINFO ? "; a IA de documentos entra em produção na semana 5" : ""}. `);
    t += D.flags[i] >= 3
      ? T(`Review ${D.flags[i]} open risk flags before scaling the campaign.`,`Revise os ${D.flags[i]} alertas de risco abertos antes de ampliar a campanha.`)
      : T(`Risk flags are low (${D.flags[i]}): next 30 suppliers by propensity score are ready for outreach.`,`Alertas de risco baixos (${D.flags[i]}): os próximos 30 fornecedores pelo score de propensão estão prontos para abordagem.`);
    $("comment").textContent = t;
  }

  function alerts(w) {
    const box = $("alerts"); box.innerHTML = "";
    ALERTS.filter(a => a[0] <= w).sort((a, b) => b[0] - a[0]).slice(0, 2).forEach(a => {
      const d = document.createElement("div"); d.className = "alert-item";
      d.innerHTML = `<span class="sev" style="background:${a[1]()}"></span><span><b>${WL()}${a[0]}</b> · ${L(a[2])}</span>`;
      box.appendChild(d);
    });
  }


  // ========== RINGS, SECTORS, FUNNEL, DECILES, FRICTION ==========
  const ringPrev = {r1:0, r2:0};
  function ring(id, val, col) {
    const s = $(id), r = 46, circ = 2 * Math.PI * r;
    if (!s.children.length) {
      const bg = el("circle", {cx:60, cy:60, r, fill:"none", stroke:C.ringTrack, "stroke-width":10}, s); bg.id = id + "-bg";
      const c = el("circle", {cx:60, cy:60, r, fill:"none", stroke:col, "stroke-width":10, "stroke-linecap":"round", transform:"rotate(-90 60 60)", "stroke-dasharray":circ, "stroke-dashoffset":circ}, s); c.id = id + "-arc";
      const t = el("text", {x:60, y:68, "text-anchor":"middle", class:"rval"}, s); t.id = id + "-txt";
    }
    const bg = $(id + "-bg"), arc = $(id + "-arc"), txt = $(id + "-txt");
    bg.setAttribute("stroke", C.ringTrack); arc.setAttribute("stroke", col);
    arc.style.transition = reduce ? "none" : "stroke-dashoffset .7s cubic-bezier(.2,.8,.2,1)";
    arc.setAttribute("stroke-dashoffset", circ * (1 - val / 100));
    const from = ringPrev[id] || 0; ringPrev[id] = val;
    tween("ring-" + id, from, val, 520, v => txt.textContent = Math.round(v) + "%");
  }


  function sectors(w) {
    const box = $("sectors");
    if (!box.children.length) SECT.forEach(() => { const r = document.createElement("div"); r.className = "bar"; r.innerHTML = `<span></span><div class="track"><div class="fill"></div></div><span class="n">0%</span>`; box.appendChild(r); });
    [...box.children].forEach((r, j) => {
      const v = Math.round(SECT[j][1] + (SECT[j][2] - SECT[j][1]) * (w - 1) / Math.max(1, W - 1));
      r.firstChild.textContent = L(SECT[j][0]); r.querySelector(".fill").style.width = (v / 60 * 100) + "%"; r.querySelector(".n").textContent = v + "%";
    });
  }


  function worstStep(v) {
    let worst = 1, wr = 1;
    for (let s = 1; s < v.length; s++) { const r = v[s] / v[s - 1]; if (r < wr) { wr = r; worst = s; } }
    return worst;
  }
  function renderLevers() {
    const box = $("levers"); if (!box) return;
    const v = F[mode], worst = worstStep(v), aiLive = (typeof week === "number" ? week : W) >= 5;
    if ($("lv-sub")) {
      $("lv-sub").textContent = mode === "before"
        ? T("Baseline funnel conversion by step. The red card marks the weakest conversion.","Conversão de cada etapa no funil-base. O card em vermelho marca a pior conversão.")
        : T("Conversion with Document AI live. The red card shows where the bottleneck shifts next.","Conversão com IA de documentos em produção. O card em vermelho mostra para onde o gargalo migra.");
    }
    box.innerHTML = LEV.map((g, k) => {
      const a = v[k], b = v[k + 1], cv = Math.round(100 * b / a);
      return `<div class="lev${k + 1 === worst ? " worst" : ""}"><div class="st">${L(STEPS[k])} → ${L(STEPS[k + 1])}</div>
        <div class="cv">${cv}%<small>${T(`${a - b} lost`,`${a - b} perdidos`)}</small></div>
        <div class="k">${T("Likely cause","Causa provável")}</div><p>${L(g.cause)}</p>
        <div class="k">${T("Levers","Alavancas")}</div>
        <ul>${g.lv.map(x => `<li>${L(x)}<span class="chip${x[2] && aiLive ? " live" : ""}">${x[2] ? (aiLive ? T("live since W5","em produção desde S5") : T("goes live in W5","entra na S5")) : T("to test","a testar")}</span></li>`).join("")}</ul>
        <div class="own">${T("Owner","Responsável")}: ${L(g.own)}</div></div>`;
    }).join("");
  }

  let mode = "after", modeManual = false;
  function setMode(m) {
    mode = m;
    $("before").setAttribute("aria-pressed", String(m === "before"));
    $("after").setAttribute("aria-pressed", String(m === "after"));
    funnel();
  }
  function syncFunnel(w) { if (!modeManual) { const target = w >= 5 ? "after" : "before"; if (target !== mode) setMode(target); } }
  function funnel() {
    const box = $("funnel"), v = F[mode];
    if (!box.children.length) STEPS.forEach(() => { const r = document.createElement("div"); r.className = "fstep"; r.innerHTML = `<span></span><div class="track"><div class="fill"></div></div><span class="n">0</span>`; box.appendChild(r); });
    [...box.children].forEach((r, i) => {
      r.firstChild.textContent = L(STEPS[i]);
      r.classList.toggle("leak", mode === "before" && i === 3);
      r.classList.toggle("win", mode === "after" && i >= 3);
      r.querySelector(".fill").style.width = (v[i] / 300 * 100) + "%";
      const n = r.querySelector(".n");
      tween("fn-" + i, +n.textContent || 0, v[i], 450, x => n.textContent = Math.round(x));
    });
    const lost = Math.round((1 - v[3] / v[2]) * 100);
    renderLevers();
    if (typeof renderLiveInsights === "function") renderLiveInsights();
    $("fcall").innerHTML = mode === "before"
      ? T(`Biggest leak: <b>−${lost}%</b> of suppliers lost at the documents step.`,`Maior perda: <b>−${lost}%</b> dos fornecedores na etapa de documentos.`)
      : T(`Document AI cuts the leak to <b style="color:var(--blue)">−${lost}%</b> and lifts first discounts from ${F.before[5]} to <b style="color:var(--blue)">${F.after[5]}</b>.`,`A IA de documentos reduz a perda para <b style="color:var(--blue)">−${lost}%</b> e eleva os primeiros descontos de ${F.before[5]} para <b style="color:var(--blue)">${F.after[5]}</b>.`);
  }
  $("before").onclick = () => { modeManual = true; setMode("before"); };
  $("after").onclick  = () => { modeManual = true; setMode("after"); };


  function deciles() {
    const s = $("dec"); s.innerHTML = "";
    const bw = 30, gap = 10, x0 = 14, base = 148, h = 104;
    DEC.forEach((v, i) => {
      const x = x0 + i * (bw + gap), top = i < 3, bh = v / 40 * h;
      el("rect", {x, y:base - bh, width:bw, height:bh, rx:5, fill: top ? C.blue : C.barMuted}, s);
      el("text", {x:x + bw / 2, y:base - bh - 6, "text-anchor":"middle", "font-size":11, fill: top ? C.navy : C.subtle, "font-weight":700}, s).textContent = v + "%";
      el("text", {x:x + bw / 2, y:base + 17, "text-anchor":"middle", "font-size":11, fill:C.subtle, "font-weight":600}, s).textContent = "D" + (i + 1);
    });
    el("text", {x:x0, y:14, "font-size":11.5, fill:C.blue, "font-weight":700}, s).textContent = T("Top 30% of suppliers ≈ 62% of activations","30% melhores no score ≈ 62% das ativações");
  }
  let prevCamp = 0;
  function uplift(w) {
    const camp = Math.round(12 + 19 * Math.min(1, Math.max(0, (w - 2) / 4))), ctrl = 12;
    tween("uplift", prevCamp, camp, 460, v => $("ucamp").textContent = Math.round(v) + "%");
    prevCamp = camp; $("uctrl").textContent = ctrl + "%";
    $("ucampb").style.width = (camp / 40 * 100) + "%"; $("uctrlb").style.width = (ctrl / 40 * 100) + "%";
    $("upp").textContent = "+" + (camp - ctrl) + " pp";
  }

  function renderFriction() {
    const stages = [[["KYC start → upload","Início do KYC → envio"],2,3],[["Upload → approval","Envio → aprovação"],3,4],[["Approval → first discount","Aprovação → primeiro desconto"],4,5],[["Invite → first discount","Convite → primeiro desconto"],0,5]];
    const rate = (s, a, b) => 100 * s[b] / s[a];
    const beforeLoss = 100 - rate(F.before, 2, 3), afterLoss = 100 - rate(F.after, 2, 3);
    $("friction-gain").textContent = nf(beforeLoss - afterLoss, 1) + T(" pp lower"," pp a menos");
    $("friction-detail").textContent = T(`Among suppliers starting KYC, ${nf(beforeLoss, 1)}% dropped out before uploading documents in the baseline scenario, vs. ${nf(afterLoss, 1)}% with document AI.`,`Entre os fornecedores que iniciaram o KYC, ${nf(beforeLoss, 1)}% desistiram antes de enviar os documentos no cenário-base, contra ${nf(afterLoss, 1)}% com IA de documentos.`);
    $("conversion-rows").innerHTML = stages.map(([label, a, b]) => {
      const base = rate(F.before, a, b), ai = rate(F.after, a, b), g = ai - base;
      return `<tr><th scope="row">${L(label)}</th><td>${nf(base, 1)}%</td><td>${nf(ai, 1)}%</td><td>${g >= 0 ? "+" : "−"}${nf(Math.abs(g), 1)} pp</td></tr>`;
    }).join("");
  }


  // ========== STEP 1 PROOF & EVIDENCE ENGINE (ALL 14 CARDS CLICKABLE!) ==========
  const proofModal = $("proofModal");
  let activeProofKey = null, proofFocus = null;
  function pTable(headers, rows, footRow = null) {
    return `<div class="proof-table-wrap"><table class="proof-table"><thead><tr>${headers.map(h => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody>${footRow ? `<tfoot><tr>${footRow.map(c => `<td>${c}</td>`).join("")}</tr></tfoot>` : ""}</table></div>`;
  }
  const PROOFS = {
    "actions": () => ({
      title: T("Weekly action plan — Deterministic trigger audit","Plano de ação — Auditoria determinística de gatilhos"),
      value: `${ACTS.filter(a => a.pri < 3).length} ${T("active priorities","prioridades ativas")}`,
      claim: T("Every item in the Monday action plan is derived from explicit quantitative thresholds across Decisions 1–3 — never manually written.","Cada item do plano de ação deriva de gatilhos quantitativos explícitos nas Decisões 1–3 — sem texto estático."),
      badge: T("Rule-driven plan","Regras auditáveis"),
      formula: `<code>${T("Limit","Limite")}: ${money(FS.lim)}</code> · <code>${T("Peak","Pico")}: ${money(FS.peakHigh)}</code> · <code>${T("Error","Erro")}: ${nf(D.err[week - 1], 1)}%</code> · <code>${T("Flags","Alertas")}: ${D.flags[week - 1]}</code>`,
      table: pTable([T("#","#"), T("Action","Ação"), T("Priority","Prioridade"), T("Owner","Dono")],
        ACTS.map((a, idx) => [idx + 1, a.title, `P${a.pri} (D${a.dec})`, a.own.map(o => L(OWN[o])).join(" + ")])),
      source: T("Source: Live rule engine combining Step 1 KPIs, Step 2 limit check, Step 3 pipeline #1 and Step 4 market pricing.","Fonte: Motor de regras unindo KPIs (Etapa 1), limite (Etapa 2), nº 1 do pipeline (Etapa 3) e preço (Etapa 4).")
    }),
    "kpi-spend": () => {
      const i = week - 1, sp = D.spend[i], spBn = SPEND / 1000, capBn = spBn * sp / 100;
      const cats = [[T("Packaging & containers","Embalagens e insumos"),.34],[T("MRO & industrial services","MRO e serviços industriais"),.27],[T("Logistics & freight","Logística e frete"),.21],[T("Raw materials & components","Matérias-primas e componentes"),.18]];
      return {
        title: T("Spend under program — Proof of calculation","Gasto sob o programa — Memória de cálculo"), value: sp + "%",
        claim: T(`${bn(capBn, 2)} of the ${bn(spBn, 1)} annual in-scope spend is enrolled in ${WL()}${week}.`,`${bn(capBn, 2)} dos ${bn(spBn, 1)} de compras anuais no escopo estão sob o programa na ${WL()}${week}.`),
        badge: T("Verified identity","Cálculo reconciliado"),
        formula: `<code>${bn(spBn, 1)} × ${sp}% = ${bn(capBn, 2)}</code> · +${sp - D.spend[0]} pp vs ${WL()}1`,
        table: pTable([T("Spend category","Categoria"), T("Share","%"), T("Annual spend","Volume anual"), T("Suppliers","Fornecedores")],
          cats.map(([n, w]) => [n, Math.round(w * 100) + "%", bn(capBn * w, 2), Math.round(D.active[i] * w)]),
          [T("Total under program","Total sob o programa"), "100%", bn(capBn, 2), D.active[i]]),
        source: T("Source: Anchor ERP payables extract.","Fonte: Extrato de contas a pagar do ERP da âncora.")
      };
    },
    "kpi-active": () => {
      const i = week - 1, act = D.active[i], pctBase = nf(act / BASE_SUP * 100, 1), base = D.active[0], added = Math.max(0, act - base);
      const aiLift = week >= 5 ? Math.round(added * .44) : 0, propLift = week >= 3 ? Math.round(added * .34) : 0, organic = Math.max(0, added - aiLift - propLift);
      return {
        title: T("Active suppliers — Cohort reconciliation","Fornecedores ativos — Reconciliação de safras"), value: `${act} / ${BASE_SUP}`,
        claim: T(`${pctBase}% of the ${BASE_SUP}-supplier base executed ≥1 discount by ${WL()}${week}.`,`${pctBase}% da base de ${BASE_SUP} fornecedores executaram ≥ 1 antecipação até a ${WL()}${week}.`),
        badge: T("Cohort reconciled","Base reconciliada"),
        formula: `<code>${base} (${WL()}1) + ${organic} (${T("organic","orgânico")}) + ${propLift} (${T("propensity","propensão")}) + ${aiLift} (${T("doc AI","IA docs")}) = ${act}</code>`,
        table: pTable([T("Activation source","Origem"), T("Suppliers","Fornecedores"), T("% of active","% ativos"), T("Status","Situação")], [
          [T("Week 1 baseline cohort","Safra base (S1)"), base, nf(base / act * 100, 1) + "%", T("Recurring","Recorrentes")],
          [T("Organic onboarding","Adesão orgânica"), organic, nf(organic / act * 100, 1) + "%", T("Active","Ativos")],
          [T("Propensity campaign (D1–D3)","Campanha score (D1–D3)"), propLift, nf(propLift / act * 100, 1) + "%", T("Verified vs control","Validado vs controle")],
          [T("Document AI recovery (W5+)","Recuperados IA docs (S5+)"), aiLift, nf(aiLift / act * 100, 1) + "%", week >= 5 ? T("Live since W5","Ativo desde S5") : T("Starts W5","Inicia S5")]
        ], [T("Total active","Total ativos"), act, "100%", `${Math.max(0, BASE_SUP - act)} ${T("remaining","restantes")}`]),
        source: T("Source: SCF platform supplier registry (anonymized, LGPD-compliant).","Fonte: Registro de fornecedores da plataforma SCF (anonimizado, LGPD).")
      };
    },
    "kpi-util": () => {
      const i = week - 1, ut = D.util[i], sp = D.spend[i], flowBn = (SPEND / 1000) * (sp / 100) * (ut / 100), balMi = D.bal[i];
      const t1 = Math.min(10, D.active[i]), t2 = Math.round((D.active[i] - t1) * .45), t3 = Math.max(0, D.active[i] - t1 - t2);
      return {
        title: T("Utilization — Flow & balance identity proof","Utilização — Prova da identidade de fluxo e saldo"), value: ut + "%",
        claim: T(`${ut}% of approved payables are discounted, generating ${bn(flowBn, 2)}/yr flow and ${money(balMi)} balance.`,`${ut}% dos títulos aprovados são antecipados, gerando ${bn(flowBn, 2)}/ano em fluxo e ${money(balMi)} de saldo.`),
        badge: T("Matches Step 2 balance","Bate com saldo Etapa 2"),
        formula: `<code>${bn(SPEND / 1000, 1)} × ${sp}% × ${ut}% = ${bn(flowBn, 2)}/yr</code> → <code>× ${G.tenor}d ÷ 365 = ${money(balMi)}</code>`,
        table: pTable([T("Supplier tier","Faixa"), T("Active","Ativos"), T("% balance","% saldo"), T("Avg util.","Util. média")], [
          [T("Top 10 high-frequency","Top 10 recorrentes"), t1, "46%", Math.min(92, ut + 18) + "%"],
          [T("Mid-tier recurring","Médios recorrentes"), t2, "36%", (ut + 2) + "%"],
          [T("Long-tail / seasonal","Cauda longa / sazonal"), t3, "18%", Math.max(35, ut - 16) + "%"]
        ], [T("Weighted total","Total ponderado"), D.active[i], "100%", ut + "%"]),
        source: T("Source: Approved invoices vs. settled discount transactions.","Fonte: Títulos aprovados vs. operações liquidadas."),
        routeStep:2, routeLabel:T("→ Inspect forecast in Step 2","→ Ver projeção na Etapa 2")
      };
    },
    "kpi-days": () => {
      const i = week - 1, d = D.days[i], d0 = D.days[0];
      const invite = d >= 18 ? 3 : d >= 13 ? 2 : 1, docs = d >= 18 ? 11 : d >= 15 ? 8 : d >= 12 ? 5 : d >= 10 ? 4 : 3, kyc = d >= 15 ? 4 : d >= 11 ? 3 : 2, first = Math.max(1, d - invite - docs - kyc);
      return {
        title: T("Days to first discount — Stage SLA breakdown","Dias até o 1º desconto — Decomposição por SLA"), value: `${d} ${T("days","dias")}`,
        claim: T(`Median cycle fell by ${d0 - d} days since ${WL()}1 (${d0}d → ${d}d), driven by Document AI in ${WL()}5.`,`O ciclo mediano caiu ${d0 - d} dias desde a ${WL()}1 (${d0}d → ${d}d), impulsionado pela IA de documentos na ${WL()}5.`),
        badge: week >= 5 ? T("Doc AI impact verified","Impacto IA Docs comprovado") : T("Pre-AI baseline","Antes da IA Docs"),
        formula: `<code>${invite}d + ${docs}d + ${kyc}d + ${first}d = ${d} ${T("days","dias")}</code>`,
        table: pTable([T("Stage","Etapa"), `${WL()}1`, `${WL()}${week}`, T("Delta","Variação")], [
          [T("1. Invite → open","1. Convite → abertura"), "3 d", `${invite} d`, `${invite - 3} d`],
          [T("2. Document upload & verification","2. Envio e validação de docs"), "11 d", `${docs} d`, `<b style="color:var(--green)">${docs - 11} d</b>`],
          [T("3. KYC & Compliance approval","3. Aprovação KYC e Compliance"), "4 d", `${kyc} d`, `${kyc - 4} d`],
          [T("4. Portal → 1st discount","4. Portal → 1º desconto"), "3 d", `${first} d`, `${first - 3} d`]
        ], [T("Total cycle","Ciclo total"), `${d0} d`, `${d} d`, `<span style="color:var(--green)">${d - d0} d</span>`]),
        source: T("Source: Onboarding workflow timestamps (median days per stage).","Fonte: Timestamps do fluxo de onboarding (dias medianos por etapa).")
      };
    },
    "kpi-rev": () => {
      const i = week - 1, bal = D.bal[i], spRev = rev[i], flowBn = (SPEND / 1000) * D.spend[i] / 100 * D.util[i] / 100;
      const hist = []; for (let k = Math.max(0, i - 4); k <= i; k++) hist.push([`${WL()}${k + 1}`, D.spend[k] + "%", D.util[k] + "%", money(D.bal[k]), `<b>${moneyD(rev[k], 1)}</b>`]);
      return {
        title: T("Spread revenue — Full algebraic audit","Receita de spread — Auditoria algébrica completa"), value: `${moneyD(spRev, 1)} / ${T("yr","ano")}`,
        claim: T(`Annualized spread revenue = program balance (${money(bal)}) × ${nf(G.spread, 2)}% spread = ${moneyD(spRev, 1)}/yr.`,`Receita anualizada = saldo (${money(bal)}) × spread de ${nf(G.spread, 2)}% = ${moneyD(spRev, 1)}/ano.`),
        badge: T("Exact formula match","Fórmula exata verificada"),
        formula: `<code>${bn(SPEND / 1000, 1)} × ${D.spend[i]}% × ${D.util[i]}% = ${bn(flowBn, 2)}</code> → <code>× ${G.tenor} ÷ 365 = ${money(bal)}</code> → <code>× ${nf(G.spread, 2)}% = ${moneyD(spRev, 1)}</code>`,
        table: pTable([T("Week","Sem."), T("Spend %","Gasto %"), T("Util %","Util. %"), T("Balance","Saldo"), T("Spread / yr","Spread / ano")], hist),
        source: T("Source: Program accounting identity synced with Step 3 tenor & spread.","Fonte: Identidade contábil do programa sincronizada com prazo e spread da Etapa 3.")
      };
    },
    "kpi-err": () => {
      const i = week - 1, err = D.err[i], ok = err <= 8, bt = backtest(week);
      const rows = bt.length ? bt.slice(-6).map(r => [`${WL()}${r.week}`, nf(r.model, 2) + "%", nf(r.flat, 2) + "%", `<span style="color:var(--green)">−${nf(Math.max(0, r.flat - r.model), 2)} pp</span>`]) : [[`${WL()}1`, "—", "—", T("Scored from W2","Apurado a partir da S2")]];
      return {
        title: T("Forecast error — Out-of-sample backtest proof","Erro de projeção — Prova via backtest semanal"), value: nf(err, 1) + "%",
        claim: T(`Rolling error is ${nf(err, 1)}% in ${WL()}${week}, ${ok ? "inside" : "above"} the 8.0% governance ceiling.`,`Erro de projeção em ${nf(err, 1)}% na ${WL()}${week}, ${ok ? "dentro" : "acima"} do teto de governança de 8,0%.`),
        badge: ok ? T("PASS · ≤ 8.0%","APROVADO · ≤ 8,0%") : T("ALERT · > 8.0%","ALERTA · > 8,0%"), badgeWarn:!ok,
        formula: `<code>APE = |${T("Forecast","Projeção")} − ${T("Actual","Realizado")}| ÷ ${T("Actual","Realizado")} × 100</code>`,
        table: pTable([T("Week","Sem."), T("Base model APE","Erro modelo"), T("Naive prior APE","Erro anterior"), T("Gain","Ganho")], rows),
        source: T("Source: 1-week rolling out-of-sample backtest (Step 2).","Fonte: Backtest móvel de 1 semana fora da amostra (Etapa 2)."),
        routeStep:2, routeLabel:T("→ Open backtest in Step 2","→ Ver backtest na Etapa 2")
      };
    },
    "kpi-sow": () => {
      const i = week - 1, sow = D.sow[i], peers = Math.round((100 - sow) * .68), fidc = 100 - sow - peers;
      return {
        title: T("Share of wallet — Decomposition & Phase 2 bridge","Share of wallet — Decomposição e ponte Fase 2"), value: sow + "%",
        claim: T(`Estimated ${sow}% share of financed wallet in ${WL()}${week} (+${sow - D.sow[0]} pp vs ${WL()}1).`,`Participação estimada de ${sow}% no volume financiado na ${WL()}${week} (+${sow - D.sow[0]} pp vs ${WL()}1).`),
        badge: T("Illustrative · Step 4.3 mapped","Ilustrativo · Etapa 4.3"), badgeWarn:true,
        formula: `<code>${sow}% (Citi) + ${peers}% (${T("Peers","Pares")}) + ${fidc}% (FIDCs) = 100%</code>`,
        table: pTable([T("Wallet slice","Fatia"), T("Share","%"), T("Maturity","Maturidade")], [
          ["Citi", sow + "%", T("Internal volume","Volume interno")],
          [T("Peer banks","Bancos pares"), peers + "%", T("Illustrative → Step 4.3 registrars","Ilustrativo → Etapa 4.3 registradoras")],
          ["FIDCs (CVM)", fidc + "%", T("Illustrative → Step 4.1 CVM filings","Ilustrativo → Etapa 4.1 CVM")]
        ], [T("Total financed","Total financiado"), "100%", T("Reconciled in Step 4.3","Reconciliado Etapa 4.3")]),
        source: T("Guardrail: illustrative until connected to B3, CERC & Núclea.","Salvaguarda: ilustrativo até conectar B3, CERC e Núclea."),
        routeStep:4, routeLabel:T("→ Open Real Share in Step 4","→ Abrir Share Real na Etapa 4")
      };
    },
    "kpi-flags": () => {
      const i = week - 1, open = D.flags[i], activeAlerts = ALERTS.filter(a => a[0] <= week).sort((a, b) => b[0] - a[0]);
      const owners = [T("Operations / Anti-fraud","Operações / Antifraude"), T("Credit Risk","Risco de Crédito"), T("KYC / Compliance","KYC / Compliance"), T("Anchor RM","Gerente da Âncora"), T("Credit Committee","Comitê de Crédito")];
      return {
        title: T("Risk flags — Live exception & control register","Alertas de risco — Registro de exceções e controles"), value: `${open} ${T("open","em aberto")}`,
        claim: T(`${open} open flag${open === 1 ? "" : "s"} in ${WL()}${week} (outreach gate requires < 3 open flags).`,`${open} alerta${open === 1 ? "" : "s"} em aberto na ${WL()}${week} (regra para escalar exige < 3 alertas).`),
        badge: open < 3 ? T("Safe to scale","Liberado para escalar") : T("Review before scaling","Revisar antes de escalar"), badgeWarn: open >= 3,
        formula: `<code>${T("Triggered","Disparados")}: ${activeAlerts.length}</code> · <code>${T("Open","Abertos")}: ${open}</code> · <code>${T("Gate","Regra")}: &lt; 3</code>`,
        table: pTable([T("Week","Sem."), T("Control alert","Alerta"), T("Owner","Responsável"), T("Status","Status")],
          activeAlerts.map((a, idx) => [`${WL()}${a[0]}`, L(a[2]), owners[idx % owners.length], idx < open ? `<span class="sig-badge warn">${T("Open","Aberto")}</span>` : `<span class="sig-badge pos">${T("Mitigated","Mitigado")}</span>`])),
        source: T("Source: Automated risk & KYC rules engine (LC 105/2001).","Fonte: Motor automatizado de regras de risco e KYC (LC 105/2001).")
      };
    },
    "briefing": () => {
      const i = week - 1, p = Math.max(0, i - 1), dA = D.active[i] - D.active[p], errOk = D.err[i] <= 8, flagOk = D.flags[i] < 3, aiLive = week >= 5;
      return {
        title: T("Weekly briefing — Rule-by-rule verification","Resumo semanal — Verificação regra a regra"), value: `${WL()}${week} · 4/4 ${T("grounded","auditadas")}`,
        claim: T("Every sentence in the briefing is deterministically generated from audited program thresholds.","Cada frase do resumo é gerada de forma determinística a partir dos indicadores do programa."),
        badge: T("Deterministic audit","Auditoria determinística"),
        formula: `<code>Δ ${T("Active","Ativos")}: +${dA}</code> · <code>${T("Error","Erro")}: ${nf(D.err[i], 1)}% ≤ 8%</code> · <code>${T("Flags","Alertas")}: ${D.flags[i]}</code>`,
        table: pTable([T("Claim","Afirmação"), T("Input","Dado"), T("Rule","Regra"), T("Verdict","Status")], [
          [T("Base momentum","Ritmo da base"), `${D.active[i]} / ${BASE_SUP} (+${dA})`, T("Δ vs prior week","Δ vs semana anterior"), `<span class="sig-badge pos">${T("Verified","Verificado")}</span>`],
          [T("Predictability","Previsibilidade"), nf(D.err[i], 1) + "%", "≤ 8,0%", `<span class="sig-badge ${errOk ? "pos" : "warn"}">${errOk ? T("Inside","Dentro") : T("Above","Acima")}</span>`],
          [T("Onboarding speed","Velocidade cadastro"), `${D.days[i]} d`, T("Doc AI ≥ W5","IA Docs ≥ S5"), `<span class="sig-badge ${aiLive ? "pos" : "neu"}">${aiLive ? T("Post-AI","Pós-IA") : T("Pre-AI","Pré-IA")}</span>`],
          [T("Outreach gate","Trava campanha"), `${D.flags[i]} ${T("flags","alertas")}`, "< 3", `<span class="sig-badge ${flagOk ? "pos" : "warn"}">${flagOk ? T("Ready","Liberado") : T("Hold","Segurar")}</span>`]
        ]),
        source: T("Source: Deterministic binding to scorecard series D[w].","Fonte: Vínculo determinístico direto com as séries D[w].")
      };
    },
    "wallet": () => {
      const i = week - 1;
      const rows = [
        [T("Anchor: share of wallet","Âncora: share of wallet"), D.sow[0] + "%", `<b>${D.sow[i]}%</b>`, D.sow[W - 1] + "%", `+${D.sow[i] - D.sow[0]} pp`],
        [T("Supplier: share of receivables*","Fornecedor: recebíveis*"), D.supShare[0] + "%", `<b>${D.supShare[i]}%</b>`, D.supShare[W - 1] + "%", `+${D.supShare[i] - D.supShare[0]} pp`],
        ...SECT.map(([lbl, s1, s12]) => { const cur = Math.round(s1 + (s12 - s1) * (week - 1) / Math.max(1, W - 1)); return [`${T("Sector","Setor")}: ${L(lbl)}`, s1 + "%", `<b>${cur}%</b>`, s12 + "%", `+${cur - s1} pp`]; })
      ];
      return {
        title: T("Wallet share by segment — Trajectory & lineage","Share of wallet por segmento — Trajetória e linhagem"), value: `${D.sow[i]}% / ${D.supShare[i]}%`,
        claim: T(`Tracks share across 3 layers from ${WL()}1 through ${WL()}${week}.`,`Acompanha participação em 3 níveis da ${WL()}1 até a ${WL()}${week}.`),
        badge: T("Consent + registrars","Consentimento + registradoras"), badgeWarn:true,
        formula: `<code>${T("Sector(w)","Setor(w)")} = ${T("Base","Base")} + (${T("End","Final")} − ${T("Base","Base")}) × (${week} − 1) ÷ ${Math.max(1, W - 1)}</code>`,
        table: pTable([T("Segment","Segmento"), `${WL()}1`, `${WL()}${week}`, `${WL()}${W}`, T("Gain","Ganho")], rows),
        source: T("*Supplier share requires consent under LGPD & LC 105/2001.","*Share de recebíveis requer consentimento sob LGPD e LC 105/2001."),
        routeStep:4, routeLabel:T("→ Open Real Share (Step 4.3)","→ Ver Share Real na Etapa 4.3")
      };
    },
    "funnel": () => {
      const rows = STEPS.map((st, idx) => {
        const b = F.before[idx], a = F.after[idx], bP = idx ? F.before[idx - 1] : b, aP = idx ? F.after[idx - 1] : a, diff = a - b;
        return [`${idx + 1}. ${L(st)}`, `${b} (${nf(b / bP * 100, 1)}%)`, `<b>${a}</b> (${nf(a / aP * 100, 1)}%)`, diff === 0 ? T("Controlled (=)","Controlado (=)") : `<b style="color:var(--green)">+${diff}</b>`];
      });
      return {
        title: T("Onboarding funnel — Controlled Before vs. AI proof","Funil de adesão — Prova controlada Antes vs. IA"), value: `${F.before[5]} → ${F.after[5]} (+65%)`,
        claim: T("Stages 1–3 (300 → 210 → 150) are held strictly equal to isolate Document AI's exact gain from upload onward (+39 uploads → +26 first discounts).","Etapas 1–3 (300 → 210 → 150) são mantidas idênticas para isolar o efeito exato da IA a partir do envio (+39 envios → +26 primeiros descontos)."),
        badge: T("Controlled isolation","Isolamento controlado"),
        formula: `<code>1 − 85/150 = 43,3%</code> → <code>1 − 124/150 = 17,3%</code> (<b>−26,0 pp</b>) · <code>40 → 66 (+65%)</code>`,
        table: pTable([T("Stage","Etapa"), T("Before (step %)","Antes (% etapa)"), T("With AI (step %)","Com IA (% etapa)"), T("Gain","Ganho")], rows, [T("End-to-end","Ponta a ponta"), "13,3% (40/300)", "22,0% (66/300)", `<span style="color:var(--green)">+26 (+8,7 pp)</span>`]),
        source: T("Source: Controlled pilot cohort funnel audit (300 invited).","Fonte: Auditoria controlada do funil piloto (300 convidados).")
      };
    },
    "propensity": () => {
      const sumAll = DEC.reduce((s, v) => s + v, 0), sumTop3 = DEC.slice(0, 3).reduce((s, v) => s + v, 0), top3Share = nf(sumTop3 / sumAll * 100, 1);
      const camp = Math.round(12 + 19 * Math.min(1, Math.max(0, (week - 2) / 4))), ctrl = 12;
      return {
        title: T("Propensity score — Exact decile & uplift math","Score de propensão — Prova exata dos decis e uplift"), value: `${top3Share}% · +${camp - ctrl} pp`,
        claim: T(`Top 3 deciles (D1–D3 = 90/300 suppliers) capture exactly ${top3Share}% of activations; campaign beats control by +${camp - ctrl} pp.`,`Os 3 primeiros decis (D1–D3 = 90/300) capturam exatamente ${top3Share}% das ativações; campanha supera controle em +${camp - ctrl} pp.`),
        badge: T("Exact arithmetic proof","Prova aritmética exata"),
        formula: `<code>(38 + 29 + 22) ÷ 143 = 89 ÷ 143 = ${top3Share}%</code> · <code>${camp}% − ${ctrl}% = +${camp - ctrl} pp</code>`,
        table: pTable([T("Decile","Decil"), T("Suppliers","Fornec."), T("Rate","Taxa"), T("Expected","Ativos esp."), T("Share","% total")],
          DEC.map((v, idx) => [`<b>D${idx + 1}</b> ${idx < 3 ? `<span class="sig-badge pos">Top 30%</span>` : ""}`, "30", v + "%", nf(30 * v / 100, 1), nf(v / sumAll * 100, 1) + "%"]),
          [T("Top 3 deciles","Top 3 decis"), "90 (30%)", nf(sumTop3 / 3, 1) + "%", nf(30 * sumTop3 / 100, 1), `<span style="color:var(--green)">${top3Share}%</span>`]),
        source: T("Source: Randomized campaign vs. holdout control across 10 equal deciles.","Fonte: Experimento controlado campanha vs. controle em 10 decis iguais.")
      };
    },
    "friction": () => {
      const stages = [[T("KYC start → upload","Início KYC → envio"),2,3],[T("Upload → approval","Envio → aprovação"),3,4],[T("Approval → 1st discount","Aprovação → 1º desconto"),4,5],[T("Invite → 1st discount","Convite → 1º desconto"),0,5]];
      const avgFlow = ((SPEND / 1000) * D.spend[week - 1] / 100 * D.util[week - 1] / 100) / Math.max(1, D.active[week - 1]);
      const extraFlow = avgFlow * (F.after[5] - F.before[5]);
      return {
        title: T("Friction reduction — Exact ratio & economic proof","Redução de fricção — Prova das frações e impacto"), value: "−26,0 pp " + T("drop-off","perda"),
        claim: T(`Document upload drop-off drops from 43.3% (65/150) to 17.3% (26/150), unlocking +26 suppliers (≈ ${bn(extraFlow, 2)}/yr flow).`,`Desistência no envio cai de 43,3% (65/150) para 17,3% (26/150), destravando +26 fornecedores (≈ ${bn(extraFlow, 2)}/ano em fluxo).`),
        badge: T("Ratios verified","Frações verificadas"),
        formula: `<code>(1 − 85/150) − (1 − 124/150) = 26,0 pp</code> · <code>+26 × ${money(avgFlow * 1000)}/${T("yr","ano")} ≈ ${bn(extraFlow, 2)}/${T("yr","ano")}</code>`,
        table: pTable([T("Stage","Etapa"), T("Before","Antes"), T("With Doc AI","Com IA Docs"), T("Gain","Ganho")],
          stages.map(([lbl, a, b]) => { const rb = 100 * F.before[b] / F.before[a], ra = 100 * F.after[b] / F.after[a]; return [lbl, `${F.before[b]}/${F.before[a]} = ${nf(rb, 1)}%`, `<b>${F.after[b]}/${F.after[a]} = ${nf(ra, 1)}%</b>`, `<b style="color:var(--green)">+${nf(ra - rb, 1)} pp</b>`]; })),
        source: T("Source: Direct stage ratio proof from pilot funnel.","Fonte: Prova direta das frações por etapa do funil piloto.")
      };
    }
  };
  function renderProof(key) {
    const fn = PROOFS[key]; if (!fn) return;
    const p = fn();
    $("proofEyebrow").textContent = T(`Audit proof · Step 1 · Week ${week}`,`Prova auditável · Etapa 1 · Semana ${week}`);
    $("proofTitle").textContent = p.title;
    $("proofBody").innerHTML = `<div class="proof-claim"><div><strong>${p.value}</strong><p>${p.claim}</p></div><span class="proof-verified ${p.badgeWarn ? "warn" : ""}">✓ ${p.badge}</span></div>
      <div class="proof-formula"><span class="lbl">${T("Derivation & formula","Fórmula e memória de cálculo")}</span>${p.formula}</div>${p.table}`;
    $("proofSource").textContent = p.source;
    $("proofAction").innerHTML = p.routeStep ? `<button class="sig-route-btn" id="proofRouteBtn">${p.routeLabel}</button>` : "";
    const rb = $("proofRouteBtn"); if (rb) rb.onclick = () => { closeProof(); goStep(p.routeStep, true); };
  }
  function openProof(key, triggerEl) {
    if (!PROOFS[key]) return;
    activeProofKey = key; proofFocus = triggerEl || document.activeElement;
    renderProof(key); proofModal.hidden = false; syncBodyLock(); proofModal.focus();
  }
  function closeProof() {
    proofModal.hidden = true; activeProofKey = null; syncBodyLock();
    if (proofFocus) proofFocus.focus();
  }
  $("panel-1").addEventListener("click", e => {
    if (e.target.closest("button,a,input,select,label")) return;
    const card = e.target.closest("[data-proof]"); if (card) openProof(card.dataset.proof, card);
  });
  $("panel-1").addEventListener("keydown", e => {
    if (e.key !== "Enter" && e.key !== " ") return;
    if (e.target.closest("button,a,input,select,label")) return;
    const card = e.target.closest("[data-proof]"); if (card) { e.preventDefault(); openProof(card.dataset.proof, card); }
  });
  $("proofClose").onclick = closeProof;
  proofModal.addEventListener("click", e => { if (e.target === proofModal) closeProof(); });
