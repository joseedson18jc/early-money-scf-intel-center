  function formulaHTML() {
    return [T("Eligible annual purchases","Compras anuais elegíveis"), T("Program coverage","Cobertura do programa"), T("Supplier adoption","Adesão dos fornecedores"), T("Discount utilization","Utilização da antecipação")]
      .map(s => `<span>${s}</span>`).join(" × ") + ` = <span class="res">${T("Potential annual discounting flow","Fluxo anual potencial de antecipação")}</span>`;
  }
  function renderPipeline() {
    $("formula").innerHTML = formulaHTML();
    const inp = (i, k, step, max) => `<input type="number" data-i="${i}" data-k="${k}" value="${P[i][k]}" min="0" max="${max}" step="${step}" aria-label="${ANCHORS[i].name} ${k}">`;
    $("pipe-rows").innerHTML = ANCHORS.map((a, i) => `<tr>
      <td><div class="anchor-cell">${brandBadge(a.id)}<span><b>${a.name}</b><small>${L(a.sector)}</small></span></div></td>
      <td title="${L(a.revNote)}"><b>${bn(a.rev, 1)}</b><small style="display:block;font-size:11px;color:var(--muted)">${T("3Q26","3T26")}: ${bn(a.q3, a.q3 < 15 ? 3 : 1)}</small></td>
      <td>${inp(i, "addr", 0.5, 100)}</td><td id="el-${i}"></td>
      <td>${inp(i, "cov", 5, 100)}</td><td>${inp(i, "adh", 5, 100)}</td><td>${inp(i, "util", 5, 100)}</td>
      <td><div class="flowcell"><span class="rank" id="rk-${i}"></span><div class="track"><div class="fill" id="fb-${i}" style="background:${a.color}"></div></div><b id="fl-${i}"></b></div></td>
      <td id="bl-${i}"></td><td id="rv-${i}"></td></tr>`).join("");

    $("pipe-detail").innerHTML = ANCHORS.map((a, i) => `<div class="card anchor-card">
      <div class="anchor-card-head">${brandBadge(a.id, "sm")}<div><h4>${a.name}</h4><small>${L(a.sector)}</small></div></div>
      <div class="anchor-kpis">
        <div><span>${T("Flow/yr","Fluxo/ano")}</span><b id="ac-fl-${i}">–</b></div>
        <div><span>${T("Balance","Saldo")}</span><b id="ac-bl-${i}">–</b></div>
        <div><span>${T("Spread/yr","Spread/ano")}</span><b id="ac-rv-${i}">–</b></div>
      </div>
      <dl>
        <dt>${T("3Q26 net revenue & 2026 base (public)","Receita líquida 3T26 & base 2026 (pública)")}</dt><dd>${L(a.q3Note)} · ${src(a.src)}${a.id === "emb" ? " · " + src("embEst") : ""}</dd>
        <dt>${T("Where to look","Onde investigar")}</dt><dd>${L(a.look)}</dd>
        <dt>${T("Decisive check","Validação decisiva")}</dt><dd>${L(a.check)}</dd>
      </dl></div>`).join("");
    $("g-tenor").value = G.tenor; $("g-spread").value = G.spread;
    updatePipeline(false);
  }
  function updatePipeline(cascade = true) {
    const t = totals(), max = Math.max(...t.flows, 0.0001);
    const order = t.flows.map((f, i) => [f, i]).sort((a, b) => b[0] - a[0]).map(x => x[1]);
    t.flows.forEach((f, i) => {
      const b = balOf(f), r = revOf(b);
      $("el-" + i).textContent = bn(eligOf(i), 1); $("fl-" + i).textContent = bn(f);
      $("fb-" + i).style.width = (100 * f / max) + "%"; $("rk-" + i).textContent = "#" + (order.indexOf(i) + 1);
      $("bl-" + i).textContent = money(b); $("rv-" + i).textContent = moneyD(r);
      if ($("ac-fl-" + i)) { $("ac-fl-" + i).textContent = bn(f); $("ac-bl-" + i).textContent = money(b); $("ac-rv-" + i).textContent = moneyD(r); }
    });
    $("pt-elig").textContent = bn(t.elig, 1); $("pt-revenue").textContent = bn(ANCHORS.reduce((s, a) => s + a.rev, 0), 0);
    $("pt-flow").textContent = bn(t.flow); $("pt-bal").textContent = money(t.bal); $("pt-rev").textContent = moneyD(t.rev);
    if (cascade) {
      recomputeBook();
      updateKpis(week);
      forecast(week);
      mktSpread = Math.min(2.6, Math.max(0.6, G.spread));
      renderMarket();
      plan(week);
    }
  }
  function syncPipelineInputs() {
    document.querySelectorAll("#pipe-rows input").forEach(inp => { inp.value = P[+inp.dataset.i][inp.dataset.k]; });
    $("g-tenor").value = G.tenor; $("g-spread").value = G.spread;
    updatePipeline(true);
  }
  $("pipe-rows").addEventListener("input", e => {
    const t = e.target; if (!t.dataset.k) return;
    const v = Math.min(100, Math.max(0, parseFloat(t.value)));
    if (!isNaN(v)) { P[+t.dataset.i][t.dataset.k] = v; document.querySelectorAll("[data-preset]").forEach(b => b.classList.remove("active")); updatePipeline(true); }
  });
  $("g-tenor").oninput = e => { const v = parseFloat(e.target.value); if (v > 0 && v <= 360) { G.tenor = v; updatePipeline(true); } };
  $("g-spread").oninput = e => { const v = parseFloat(e.target.value); if (v >= 0 && v <= 10) { G.spread = v; updatePipeline(true); } };
  const PRESETS = { cons:{cov:35,adh:30,util:50,tenor:60,spread:1.0}, base:{cov:50,adh:40,util:60,tenor:75,spread:1.2}, stretch:{cov:65,adh:55,util:70,tenor:90,spread:1.4} };
  document.querySelectorAll("[data-preset]").forEach(btn => {
    btn.onclick = () => {
      const pr = PRESETS[btn.dataset.preset];
      ANCHORS.forEach((a, i) => Object.assign(P[i], {addr:a.addr, cov:pr.cov, adh:pr.adh, util:pr.util}));
      G.tenor = pr.tenor; G.spread = pr.spread;
      document.querySelectorAll("[data-preset]").forEach(b => b.classList.toggle("active", b === btn));
      syncPipelineInputs();
    };
  });
  $("pipeReset").onclick = () => document.querySelector('[data-preset="base"]').click();

