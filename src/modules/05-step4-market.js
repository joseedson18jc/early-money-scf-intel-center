  let mktSub = "all", compFilter = "all", selCompIdx = 0, ratingFilter = "all", mktSpread = 1.20, sigFilter = "all";
  const MKT_STATE = {above:[], bestWS:null};

  function updateMktSubnav() {
    document.querySelectorAll("#mktSubnav button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.mmod === mktSub)));
    document.querySelectorAll("[data-mkt-panel]").forEach(p => { p.hidden = mktSub !== "all" && p.dataset.mktPanel !== mktSub; });
  }
  $("mktSubnav").addEventListener("click", e => { const b = e.target.closest("[data-mmod]"); if (!b) return; mktSub = b.dataset.mmod; updateMktSubnav(); });

  function renderCompetitors() {
    const visibleFunders = FUNDERS.filter(f => compFilter === "banks" ? (f.type === "bank" || f.type === "citi") : compFilter === "fidc" ? (f.type === "fidc" || f.type === "citi") : true);
    const lvlCls = v => v >= 260 ? "lvl-3" : v >= 140 ? "lvl-2" : "lvl-1";
    const headCols = visibleFunders.map(f => {
      const badge = FUNDER_LOGOS[f.k]
        ? `<span class="funder-logo-chip${f.k === "itau" ? " sq" : ""}">${FUNDER_LOGOS[f.k]}</span>`
        : `<span class="funder-dot" style="background:${f.col}">${f.abbr}</span>`;
      return `<th><div class="funder-hd">${badge}<span>${f.name}</span></div></th>`;
    }).join("");
    const bodyRows = COMP_DATA.map((row, idx) => {
      const a = ANCHORS[idx], total = FUNDERS.reduce((s, f) => s + (row[f.k] || 0), 0);
      const cells = visibleFunders.map(f => {
        const v = row[f.k] || 0;
        if (!v) return `<td><span class="mcell empty" aria-label="${T("None","Sem programa")}">—</span></td>`;
        if (f.k === "citi") return `<td><span class="mcell citi-cell">${money(v)}</span></td>`;
        return `<td><span class="mcell ${lvlCls(v)}">${money(v)}</span></td>`;
      }).join("");
      return `<tr data-cidx="${idx}" class="${idx === selCompIdx ? "selected" : ""}">
        <td><div class="anchor-cell">${brandBadge(a.id, "sm")}<span><b>${a.name}</b><small>${L(a.sector)}</small></span></div></td>
        ${cells}<td><b>${money(total)}</b></td><td><span class="mcell gap-cell">+${money(row.gap)}</span></td></tr>`;
    }).join("");
    const colTotals = visibleFunders.map(f => `<td>${money(COMP_DATA.reduce((s, r) => s + (r[f.k] || 0), 0))}</td>`).join("");
    const grandTotal = COMP_DATA.reduce((s, r) => s + FUNDERS.reduce((x, f) => x + (r[f.k] || 0), 0), 0);
    const totalGap = COMP_DATA.reduce((s, r) => s + r.gap, 0);
    $("compMatrix").innerHTML = `<thead><tr><th>${T("Anchor (click row for IAS 7 note)","Âncora (clique p/ nota IAS 7)")}</th>${headCols}<th>${T("Disclosed (IAS 7)","Divulgado (IAS 7)")}</th><th>${T("Citi headroom","Espaço Citi")}</th></tr></thead><tbody>${bodyRows}</tbody><tfoot><tr><td>${T("5-anchor total","Total 5 âncoras")}</td>${colTotals}<td>${money(grandTotal)}</td><td style="color:var(--green)">+${money(totalGap)}</td></tr></tfoot>`;

    const sel = COMP_DATA[selCompIdx], anc = ANCHORS[selCompIdx], selTot = FUNDERS.reduce((s, f) => s + (sel[f.k] || 0), 0), fidcPct = Math.round(sel.fidc / selTot * 100);
    $("iasDrawer").innerHTML = `
      <div><h4>${brandBadge(anc.id, "xs")}<span>${anc.name} · ${T("IAS 7 / IFRS 7 disclosure snapshot","Nota explicativa IAS 7 / IFRS 7")}</span></h4><p><strong>${money(selTot)}</strong> ${T("estimated total supplier finance balance","de saldo estimado de risco sacado")} (${fidcPct}% ${T("in CVM FIDCs","em FIDCs CVM")}). ${L(sel.iasTerms)}</p></div>
      <div><span class="lbl">${T("CVM FIDC filings","Informes FIDC · CVM")}</span><p>${L(sel.cvmNote)}</p></div>
      <div><span class="lbl">${T("Commercial play","Ação comercial recomendada")}</span><p><strong>+${money(sel.gap)}</strong> ${T("addressable headroom:","de espaço endereçável:")} ${L(sel.play)}</p></div>`;
  }
  $("compMatrix").addEventListener("click", e => { const tr = e.target.closest("tr[data-cidx]"); if (!tr) return; selCompIdx = +tr.dataset.cidx; renderCompetitors(); });
  $("compFilter").addEventListener("click", e => { const b = e.target.closest("[data-cf]"); if (!b) return; compFilter = b.dataset.cf; $("compFilter").querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", String(x === b))); renderCompetitors(); });

  function renderPricing() {
    $("mktSpreadSlider").value = mktSpread;
    $("mktSpreadVal").textContent = "CDI + " + nf(mktSpread, 2) + "%";
    const scaleMin = 0.50, scaleMax = 2.60, pos = v => Math.max(0, Math.min(100, (v - scaleMin) / (scaleMax - scaleMin) * 100));
    const aboveList = [];
    PRICE_TIERS.forEach(t => { if (mktSpread > t.max) t.anchors.forEach(id => aboveList.push(ANCHORS.find(a => a.id === id).name)); });
    MKT_STATE.above = aboveList;

    const tiers = PRICE_TIERS.filter(t => ratingFilter === "all" || t.code === ratingFilter);
    $("ratingBands").innerHTML = tiers.map(t => {
      const anchorsHtml = t.anchors.map(id => { const a = ANCHORS.find(x => x.id === id); return `${brandBadge(id, "xs")}<span>${a.name.split(" ")[0]}</span>`; }).join("");
      let vCls = "mid", vTxt = T("In market band","Na faixa de mercado");
      if (mktSpread <= t.med) { vCls = "win"; vTxt = T("Competitive · beats median","Competitivo · abaixo da mediana"); }
      else if (mktSpread > t.max) { vCls = "high"; vTxt = T("Above market · loss risk","Acima do mercado · risco de perda"); }
      else if (mktSpread > t.fidc) { vCls = "high"; vTxt = T("Wider than FIDC senior","Mais caro que FIDC sênior"); }
      return `<div class="rb-row"><div class="rb-top"><div class="rb-title"><span class="rb-code">br${t.code}</span><span class="rb-anchors">${anchorsHtml}</span></div><span class="verdict ${vCls}">${vTxt}</span></div>
        <div class="rb-track"><div class="rb-range" style="left:${pos(t.min)}%;width:${pos(t.max) - pos(t.min)}%"></div><div class="rb-med" style="left:${pos(t.med)}%" title="${T("Median","Mediana")}: CDI+${nf(t.med,2)}%"></div><div class="rb-fidc" style="left:${pos(t.fidc)}%" title="FIDC: CDI+${nf(t.fidc,2)}%"></div><div class="rb-citi" style="left:${pos(mktSpread)}%" title="Citi: CDI+${nf(mktSpread,2)}%"></div></div>
        <div class="rb-axis"><span>${T("Min","Mín")}: CDI + ${nf(t.min,2)}%</span><span>${T("Median","Mediana")}: <b>${nf(t.med,2)}%</b> · FIDC: <b style="color:var(--amber)">${nf(t.fidc,2)}%</b></span><span>${T("Max","Máx")}: CDI + ${nf(t.max,2)}%</span></div></div>`;
    }).join("");
    $("rmLossBars").innerHTML = RM_LOSS.map(r => `<div class="loss-row"><div class="loss-row-top"><span>${L(r.lbl)}</span><span>${r.pct}%</span></div><div class="track"><div class="fill" style="width:${r.pct}%;background:${r.col()}"></div></div></div>`).join("");
    $("rmLossNote").innerHTML = T(`<b>Insight:</b> 26% of lost deals stem from onboarding friction — fixing documents (Step 1) wins mandates even when spread matches median.`,`<b>Leitura:</b> 26% das perdas vêm de atrito no cadastro — destravar documentos (Etapa 1) ganha mandatos mesmo com spread na mediana.`);
  }
  $("mktSpreadSlider").oninput = e => { mktSpread = parseFloat(e.target.value); renderPricing(); if (typeof renderLiveInsights === "function") renderLiveInsights(); plan(week); };
  $("ratingFilter").addEventListener("click", e => { const b = e.target.closest("[data-rt]"); if (!b) return; ratingFilter = b.dataset.rt; $("ratingFilter").querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", String(x === b))); renderPricing(); });

  function renderShareReal() {
    let totElig = 0, wCiti = 0, wPeers = 0, wFidc = 0, wFree = 0, bestWS = null;
    $("realShareRows").innerHTML = SHARE_DATA.map((s, i) => {
      const a = ANCHORS[i], elg = eligOf(i), freeAmt = elg * s.free / 100;
      totElig += elg; wCiti += elg * s.citi / 100; wPeers += elg * s.peers / 100; wFidc += elg * s.fidc / 100; wFree += freeAmt;
      if (!bestWS || freeAmt > bestWS.ws) bestWS = {name:a.name, ws:freeAmt};
      return `<div class="sh-item"><div class="sh-top"><div class="sh-left">${brandBadge(a.id, "sm")}<div><b>${a.name}</b><small>${T("Eligible payables","Contas a pagar elegíveis")}: ${bn(elg, 1)} / ${T("yr","ano")}</small></div></div><div class="sh-right">${INFRA_SVGS[s.reg]}<span>${s.regPct}% ${T("electronic","escritural")}</span></div></div>
        <div class="sh-stack"><div class="sh-seg" style="width:${s.citi}%;background:var(--bar-citi)">${s.citi}%</div><div class="sh-seg" style="width:${s.peers}%;background:var(--bar-peers)">${s.peers}%</div><div class="sh-seg" style="width:${s.fidc}%;background:var(--bar-fidc)">${s.fidc >= 10 ? s.fidc + "%" : ""}</div><div class="sh-seg free" style="width:${s.free}%">${s.free}%</div></div>
        <div class="sh-sub"><span>Citi: <b>${bn(elg * s.citi / 100, 2)}</b> (${s.citi}%)</span><span>${T("Unfinanced headroom","Espaço não financiado")}: <b style="color:var(--green)">${bn(freeAmt, 2)}</b> (${s.free}%)</span></div></div>`;
    }).join("");
    MKT_STATE.bestWS = bestWS;

    const pCiti = totElig ? wCiti / totElig * 100 : 0, pPeers = totElig ? wPeers / totElig * 100 : 0, pFidc = totElig ? wFidc / totElig * 100 : 0, pFree = totElig ? wFree / totElig * 100 : 0;
    const r = 68, circ = 2 * Math.PI * r;
    const segs = [{pct:pCiti, col:isDark() ? "#0284C7" : "#00205B"}, {pct:pPeers, col:isDark() ? "#2563EB" : "#056DAE"}, {pct:pFidc, col:"#D97706"}, {pct:pFree, col:C.freeSeg}];
    let offset = 0;
    const arcs = segs.map(sg => { const len = circ * sg.pct / 100, c = `<circle cx="90" cy="90" r="${r}" fill="none" stroke="${sg.col}" stroke-width="20" stroke-dasharray="${len.toFixed(2)} ${(circ - len).toFixed(2)}" stroke-dashoffset="${(-offset).toFixed(2)}" transform="rotate(-90 90 90)"/>`; offset += len; return c; }).join("");
    $("realShareRing").innerHTML = arcs + `<text x="90" y="86" text-anchor="middle" font-family="Plus Jakarta Sans,sans-serif" font-size="28" font-weight="800" fill="${C.navy}">${nf(pCiti, 1)}%</text><text x="90" y="106" text-anchor="middle" font-size="11.5" font-weight="600" fill="${C.muted}">${T("Citi measured share","Share medido Citi")}</text><text x="90" y="122" text-anchor="middle" font-size="10.5" fill="${C.subtle}">${bn(totElig, 1)} ${T("eligible","elegíveis")}</text>`;
    $("realShareKpis").innerHTML = `<div><span><i style="background:var(--bar-citi)"></i>Citi</span><b>${bn(wCiti, 2)} (${nf(pCiti, 1)}%)</b></div><div><span><i style="background:var(--bar-peers)"></i>${T("Peer banks","Bancos pares")}</span><b>${bn(wPeers, 2)} (${nf(pPeers, 1)}%)</b></div><div><span><i style="background:var(--bar-fidc)"></i>FIDCs</span><b>${bn(wFidc, 2)} (${nf(pFidc, 1)}%)</b></div><div><span><i style="background:var(--bar-free)"></i>${T("Open headroom","Espaço livre")}</span><b style="color:var(--green)">${bn(wFree, 2)} (${nf(pFree, 1)}%)</b></div>`;
  }

  function renderSignals() {
    $("sigHealthGrid").innerHTML = EXT_HEALTH.map((h, i) => {
      const a = ANCHORS[i];
      return `<div class="sig-card"><div class="sig-card-head">${brandBadge(a.id, "xs")}<div><b>${a.name.split(" ")[0]}</b><small>${h.rating} · ${L(h.outlook)}</small></div></div>
        <div class="sig-kv"><span>Duplicata 2027</span><strong>${h.dupPct}%</strong></div>
        <div class="track" style="height:6px"><div class="fill" style="width:${h.dupPct}%;background:${a.color}"></div></div>
        <div class="sig-kv"><span>${T("Registrar","Registradora")}</span>${INFRA_SVGS[h.reg]}</div>
        <div class="sig-kv"><span>${T("Chain stress","Estresse cadeia")}</span><span class="sig-badge ${h.stCls}">${L(h.stress)}</span></div>
        <div class="sig-kv"><span>${T("Net signal","Sinal líquido")}</span><span class="sig-badge ${h.netCls}">${L(h.net)}</span></div></div>`;
    }).join("");
    const filtered = EXT_SIGNALS.filter(s => sigFilter === "all" || s.route === sigFilter);
    $("sigFeed").innerHTML = filtered.map(s => {
      const a = ANCHORS.find(x => x.id === s.id), stepNum = s.route === "step1" ? 1 : 3;
      return `<div class="sig-event"><div class="sig-event-top"><div class="sig-event-brand">${brandBadge(a.id, "xs")}<span class="sev" style="background:${s.sev()};margin-top:0"></span><b>${a.name}</b></div><span class="sig-badge ${s.route === "step1" ? "warn" : "neu"}">${s.route === "step1" ? T("Feeds Step 1 · Risk","Alimenta Etapa 1 · Risco") : T("Feeds Step 3 · Credit","Alimenta Etapa 3 · Crédito")}</span></div>
        <strong style="font-size:13.5px;color:var(--navy);line-height:1.35">${L(s.title)}</strong><p>${L(s.body)}</p>
        <div class="sig-event-foot"><div class="infra-logos" style="margin-top:0">${s.sources.map(k => INFRA_SVGS[k]).join("")}</div><button class="sig-route-btn" data-route-step="${stepNum}">${s.route === "step1" ? T("→ Open Step 1 (Risk)","→ Abrir Etapa 1 (Risco)") : T("→ Open Step 3 (Credit)","→ Abrir Etapa 3 (Crédito)")}</button></div></div>`;
    }).join("");
  }
  $("sigFilter").addEventListener("click", e => { const b = e.target.closest("[data-sf]"); if (!b) return; sigFilter = b.dataset.sf; $("sigFilter").querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", String(x === b))); renderSignals(); });
  $("sigFeed").addEventListener("click", e => { const b = e.target.closest("[data-route-step]"); if (!b) return; goStep(+b.dataset.routeStep, true); });
  function renderMarket() { updateMktSubnav(); renderCompetitors(); renderPricing(); renderShareReal(); renderSignals(); renderProducts(); renderOF(); if (typeof renderLiveInsights === "function") renderLiveInsights(); }

  // ---------- Citi Public Product Reference (Step 4) ----------
  function renderProducts() {
    const box = $("products"); if (!box) return;
    box.innerHTML = `<div class="subhead" style="margin-top:4px">
        <h3>${T("Product reference · Citi public sources","Referência de produto · fontes públicas do Citi")}</h3>
        <span>${T("Risco Sacado & neighbouring working capital products","Risco sacado e produtos vizinhos de capital de giro")}</span>
      </div>
      <div class="card">
        <div class="lbl">${T("How Citi Brasil describes it","Como o Citi Brasil descreve")}</div>
        <h3>${T("Risco sacado and neighbouring products","O risco sacado e os produtos vizinhos")}</h3>
        <div class="prods">${PROD.map(p => `<div class="prod${p.hot ? " hot" : ""}"><em>${L(p.tag)}</em><b>${L(p.n)}</b><span>${L(p.d)}</span><i>${L(p.who)}</i><a href="${p.url}" target="_blank" rel="noopener">${T("Citi page","Página do Citi")} ↗</a></div>`).join("")}</div>
        <div class="fnote" style="margin-top:10px">${T("Summaries of Citi Brasil's public product pages (checked Nov 2026). Conditions, pricing and eligibility are defined case by case.","Resumos das páginas públicas de produto do Citi Brasil (verificadas em nov/2026). Condições, preço e elegibilidade são definidos caso a caso.")}</div>
      </div>
      <div class="card" style="margin-top:12px">
        <div class="lbl">${T("How Citi describes running an SCF programme","Como o Citi descreve a operação de um programa de SCF")}</div>
        <h3>${T("Four published practices, and where each shows up here","Quatro práticas publicadas, e onde cada uma aparece aqui")}</h3>
        <div class="pracs">${PRAC.map((x, i) => `<div class="prac"><span class="n">${i + 1}</span><div><b>${L(x[0])}</b><span>${L(x[1])}</span></div></div>`).join("")}</div>
        <div class="fnote" style="margin-top:10px">${T("Source: “Taking a Holistic View of Supplier Payments”, Citi Commercial Bank, March 2021 (global reference). Links to this cockpit are the prototype's reading.","Fonte: “Taking a Holistic View of Supplier Payments”, Citi Commercial Bank, março de 2021 (referência global). As ligações com este painel são leitura do protótipo.")}</div>
      </div>`;
  }

  // ---------- Open Finance Simulated Integration Modal ----------
  let ofOn = false;
  try { ofOn = localStorage.getItem("scf-of") === "1"; } catch (e) {}
  function renderOF() {
    if (!$("of-grid")) return;
    $("of-grid").innerHTML = OF_ITEMS.map(x => `<div class="of-item"><b>${L(x[0])}</b><span>${L(x[1])}</span><em>${L(x[2])}</em></div>`).join("");
    $("of-steps").innerHTML = OF_STEPS.map(x => `<li>${L(x)}</li>`).join("");
    $("of-status").className = "of-status" + (ofOn ? " on" : "");
    $("of-status").textContent = ofOn
      ? T("Simulated connection active. The cockpit keeps running on local demo/CSV data.","Conexão simulada ativa. O cockpit continua operando com os dados locais/CSV.")
      : T("Not connected (demo mode).","Não conectado (modo demonstração).");
    $("of-toggle").textContent = ofOn ? T("Disconnect simulation","Desconectar simulação") : T("Simulate connection","Simular conexão");
    if ($("of-dot")) $("of-dot").hidden = !ofOn;
    if ($("openOF")) {
      const lb = T("Open Finance integration","Integração Open Finance") + (ofOn ? T(" (simulated connection active)"," (conexão simulada ativa)") : "");
      $("openOF").setAttribute("aria-label", lb);
      $("openOF").title = lb;
    }
  }
  if ($("of-toggle")) {
    $("of-toggle").onclick = () => {
      ofOn = !ofOn;
      try { localStorage.setItem("scf-of", ofOn ? "1" : "0"); } catch (e) {}
      renderOF();
      if (typeof renderLiveInsights === "function") renderLiveInsights();
    };
  }
  if ($("openOF")) $("openOF").onclick = () => { renderOF(); openSimpleModal("m-of"); };

