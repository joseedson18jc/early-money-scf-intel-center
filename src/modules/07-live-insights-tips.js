  // ========== LIVE REACTIVE INSIGHTS STRIP, CONTEXTUAL TIPS & 5-STOP INTERACTIVE TOUR ==========

  function renderLiveInsights() {
    const bar = $("liveInsightsBar");
    if (!bar) return;
    const w = typeof week === "number" ? week : W;
    const i = Math.max(0, Math.min(D.spend.length - 1, w - 1));

    // Card 1: Program Health & Weakest Funnel Stage
    const v = F[mode] || F.after;
    const ws = worstStep(v);
    const wsCv = Math.round(100 * v[ws] / v[ws - 1]);
    const flags = D.flags[i];
    const err = D.err[i];
    const p1Cls = (flags > 0 || err > 8) ? "warn" : "ok";
    const p1Title = T("Live · Program & Funnel", "Ao vivo · Programa e Funil");
    const p1Pill = WL() + w;
    const p1Text = T(
      `<b>${D.active[i]} active</b> (${D.util[i]}% util) · bottleneck: <b>${L(STEPS[ws - 1])} → ${L(STEPS[ws])}</b> (${wsCv}%). ${flags ? `${flags} open risk flag${flags > 1 ? "s" : ""}.` : "Zero risk flags."}`,
      `<b>${D.active[i]} ativos</b> (${D.util[i]}% util.) · gargalo: <b>${L(STEPS[ws - 1])} → ${L(STEPS[ws])}</b> (${wsCv}%). ${flags ? `${flags} alerta${flags > 1 ? "s" : ""} de risco.` : "Zero alertas de risco."}`
    );

    // Card 2: Forecast & Approved Limit Headroom
    let p2Cls = "ok", p2Pill = scName(curScenario), p2Text = "";
    const lim = FS.lim || limitBRL;
    if (typeof FS.kBase === "number" && FS.kBase >= 0) {
      p2Cls = "bad";
      p2Text = FS.kBase === 0
        ? T(`<b>Above limit now:</b> balance ${money(D.bal[i])} exceeds ${money(lim)} · request <b>+${money(FS.need)}</b>.`,
            `<b>Acima do limite agora:</b> saldo ${money(D.bal[i])} passa ${money(lim)} · pedir <b>+${money(FS.need)}</b>.`)
        : T(`<b>Limit breach in ${WL()}${w + FS.kBase}:</b> peak ${money(FS.peakHigh)} vs ${money(lim)} · request <b>+${money(FS.need)}</b>.`,
            `<b>Estouro na ${WL()}${w + FS.kBase}:</b> pico ${money(FS.peakHigh)} vs ${money(lim)} · pedir <b>+${money(FS.need)}</b>.`);
    } else if (typeof FS.kHigh === "number" && FS.kHigh >= 0) {
      p2Cls = "warn";
      p2Text = T(`<b>Upper band crosses in ${WL()}${w + FS.kHigh}:</b> pre-approve <b>+${money(FS.need)}</b> above ${money(lim)}.`,
                 `<b>Topo da faixa cruza na ${WL()}${w + FS.kHigh}:</b> pré-aprovar <b>+${money(FS.need)}</b> sobre ${money(lim)}.`);
    } else {
      const pct = lim ? Math.round(100 * (FS.peakHigh || D.bal[i]) / lim) : 0;
      p2Text = T(`<b>Fits approved limit:</b> peak ${money(FS.peakHigh || D.bal[i])} = <b>${pct}%</b> of ${money(lim)} (${curHorizon}w ${scName(curScenario).toLowerCase()}).`,
                 `<b>Cabe no limite aprovado:</b> pico ${money(FS.peakHigh || D.bal[i])} = <b>${pct}%</b> de ${money(lim)} (${curHorizon} sem · ${scName(curScenario).toLowerCase()}).`);
    }

    // Card 3: 3Q26 Anchor Pipeline & Pricing Position
    const t = totals();
    const topIdx = t.flows.indexOf(Math.max(...t.flows));
    const topA = ANCHORS[topIdx];
    const aboveCnt = (MKT_STATE.above || []).length;
    const p3Cls = aboveCnt > 0 ? "warn" : "ok";
    const p3Pill = `CDI + ${nf(mktSpread, 2)}%`;
    const p3Text = T(
      `Pipeline <b>${bn(t.flow)}</b> (#1 <b>${topA.name}</b> ${bn(t.flows[topIdx])}) · ${aboveCnt ? `pricing above band on <b>${aboveCnt}</b> tier${aboveCnt > 1 ? "s" : ""}` : "pricing competitive in all tiers"}${ofOn ? " · Open Finance sim ON" : ""}.`,
      `Pipeline <b>${bn(t.flow)}</b> (#1 <b>${topA.name}</b> ${bn(t.flows[topIdx])}) · ${aboveCnt ? `preço acima da faixa em <b>${aboveCnt}</b> faixa${aboveCnt > 1 ? "s" : ""}` : "preço competitivo em todas as faixas"}${ofOn ? " · Open Finance sim ON" : ""}.`
    );

    const cards = [
      { mod: "kpis", cls: p1Cls, k: p1Title, pill: p1Pill, txt: p1Text },
      { mod: "forecast", cls: p2Cls, k: T("Live · Forecast & Limit", "Ao vivo · Projeção e Limite"), pill: p2Pill, txt: p2Text },
      { mod: "pipeline", cls: p3Cls, k: T("Live · Pipeline & Market", "Ao vivo · Pipeline e Mercado"), pill: p3Pill, txt: p3Text }
    ];
    bar.innerHTML = cards.map(c =>
      `<button type="button" class="li-card ${c.cls}" data-li-mod="${c.mod}">
        <span class="li-dot" aria-hidden="true"></span>
        <div class="li-body">
          <div class="li-k"><span>${c.k}</span><span class="li-pill">${c.pill}</span></div>
          <div class="li-v">${c.txt}</div>
        </div>
      </button>`
    ).join("");
    if (typeof updateSidebarBadges === "function") updateSidebarBadges();
  }

  if ($("liveInsightsBar")) {
    $("liveInsightsBar").addEventListener("click", e => {
      const btn = e.target.closest("[data-li-mod]");
      if (btn) goMod(btn.dataset.liMod, true);
    });
  }

  // ---------- Contextual On-Screen Guided Tips (persisted in localStorage) ----------
  let tipsOn = true;
  try { const st = localStorage.getItem("scf-tips"); if (st === "0") tipsOn = false; } catch (e) {}

  function syncTipsUi() {
    document.querySelectorAll(".tip-banner").forEach(b => { b.hidden = !tipsOn; });
    if ($("toggleTips")) $("toggleTips").setAttribute("aria-pressed", String(tipsOn));
  }

  if ($("toggleTips")) {
    $("toggleTips").onclick = () => {
      tipsOn = !tipsOn;
      try { localStorage.setItem("scf-tips", tipsOn ? "1" : "0"); } catch (e) {}
      syncTipsUi();
    };
  }
  document.querySelectorAll("[data-dismiss-tip]").forEach(btn => {
    btn.onclick = () => {
      const box = btn.closest(".tip-banner");
      if (box) box.hidden = true;
    };
  });

  // ---------- 5-Stop Interactive Walkthrough Tour ----------
  const TOUR_STOPS = [
    {
      sel: "#sbControls",
      mod: "overview",
      title: ["1. Controls, Currency & AI Analysis ON", "1. Controles, Moeda e AI Analysis ON"],
      body: [
        "All controls live cleanly in the <b>Left Menu</b>: launch <b>AI Analysis ON</b> or <b>⚙ Settings</b> (OpenAI / Anthropic), open the <b>17-slide Presentation</b>, toggle <b>Tips</b>, and switch <b>BRL / USD</b> or <b>PT / EN</b>.",
        "Todos os controles ficam organizados no <b>Menu Lateral</b>: abra o <b>AI Analysis ON</b> ou <b>⚙ Configurações</b> (OpenAI / Anthropic), lance a <b>Apresentação (17)</b>, alterne <b>Dicas</b> e troque <b>BRL / USD</b> ou <b>PT / EN</b>."
      ]
    },
    {
      sel: "#sideNav",
      mod: "overview",
      title: ["2. Organized Left Menu (15 Modules)", "2. Menu Lateral Organizado (15 Módulos)"],
      body: [
        "Every module is now cleanly separated in the <b>Left Menu</b> — jump straight to Action Plan, KPIs, Funnel, Forecast, 3Q26 Pipeline, Competitors, Pricing, or Products one by one, or toggle <b>View all</b>.",
        "Cada módulo está separado no <b>Menu Lateral</b> — acesse diretamente Plano de Ação, KPIs, Funil, Projeção, Pipeline 3T26, Concorrentes, Preço ou Produtos um por um, ou alterne para <b>Ver todos</b>."
      ]
    },
    {
      sel: "#panel-2 .fc-controls",
      mod: "forecast",
      title: ["3. Stress-Test Approved Limit & Forecast", "3. Teste o Limite Aprovado e a Projeção"],
      body: [
        "Change the <b>Approved limit</b> number, switch <b>Downside / Base / Upside</b>, or change the horizon (4 / 8 / 13 weeks) to see the exact breach week and required top-up.",
        "Altere o <b>Limite aprovado</b>, troque entre <b>Pessimista / Base / Otimista</b> ou mude o horizonte (4 / 8 / 13 semanas) para ver a semana exata de estouro e o reforço necessário."
      ]
    },
    {
      sel: "#panel-3 .pipe-presets",
      mod: "pipeline",
      title: ["4. Editable 3Q26 Anchor Pipeline & Market", "4. Pipeline Editável 3T26 e Mercado"],
      body: [
        "All 5 anchor rows use <b>3Q26 public figures</b>. Edit any % input or use quick presets to cascade flow, balance, and spread revenue across the entire cockpit and the <b>17-slide deck</b>.",
        "As 5 âncoras usam <b>números públicos do 3T26</b>. Edite qualquer % ou use os cenários rápidos para atualizar fluxo, saldo e receita em todo o cockpit e nos <b>17 slides</b>."
      ]
    },
    {
      sel: "#aiFab",
      mod: "overview",
      title: ["5. Floating Live Assistant & Presentation", "5. Assistente Flutuante e Apresentação"],
      body: [
        "Click <b>Ask the Cockpit</b> at the bottom-right anytime for instant offline Q&amp;A, JSON context export, or live <b>AI Analysis ON</b> chat (OpenAI or Anthropic). Ready to present? Click <b>Present (17)</b> in the top bar.",
        "Clique em <b>Pergunte ao Cockpit</b> no canto inferior direito para Q&amp;A instantâneo offline, exportar JSON ou chat com <b>AI Analysis ON</b> (OpenAI ou Anthropic). Pronto para apresentar? Clique em <b>Apresentar (17)</b> no topo."
      ]
    }
  ];

  let tourIdx = -1, tourTarget = null;

  function clearTourHighlight() {
    if (tourTarget) { tourTarget.classList.remove("tour-highlight"); tourTarget = null; }
  }

  function closeTour() {
    clearTourHighlight();
    if ($("tourBackdrop")) $("tourBackdrop").hidden = true;
    if ($("tourPop")) $("tourPop").hidden = true;
    tourIdx = -1;
  }

  function positionTourPop(el) {
    const pop = $("tourPop");
    if (!pop) return;
    const pw = Math.min(360, window.innerWidth - 24);
    const ph = pop.offsetHeight || 200;
    if (!el) {
      pop.style.left = Math.max(12, Math.round((window.innerWidth - pw) / 2)) + "px";
      pop.style.top = Math.max(70, Math.round((window.innerHeight - ph) / 2)) + "px";
      return;
    }
    const r = el.getBoundingClientRect();
    let left = r.left + r.width / 2 - pw / 2;
    left = Math.max(12, Math.min(window.innerWidth - pw - 12, left));
    let top = r.bottom + 14;
    if (top + ph > window.innerHeight - 12) top = r.top - ph - 14;
    if (top < 12) top = Math.max(12, Math.min(window.innerHeight - ph - 12, window.innerHeight / 2 - ph / 2));
    pop.style.left = Math.round(left) + "px";
    pop.style.top = Math.round(top) + "px";
  }

  function renderTourStep() {
    if (tourIdx < 0 || tourIdx >= TOUR_STOPS.length) { closeTour(); return; }
    clearTourHighlight();
    const stop = TOUR_STOPS[tourIdx];
    if (stop.mod) goMod(stop.mod, false);
    else if (stop.step) goStep(stop.step, false);

    const el = document.querySelector(stop.sel);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("tour-highlight");
      tourTarget = el;
    }

    $("tourBackdrop").hidden = false;
    const pop = $("tourPop");
    pop.hidden = false;
    $("tourStep").textContent = T(`Guided Tour · ${tourIdx + 1} / ${TOUR_STOPS.length}`, `Guia rápido · ${tourIdx + 1} / ${TOUR_STOPS.length}`);
    $("tourTitle").textContent = L(stop.title);
    $("tourBody").innerHTML = L(stop.body);
    $("tourDots").innerHTML = TOUR_STOPS.map((_, idx) => `<i${idx === tourIdx ? ' class="on"' : ""}></i>`).join("");
    $("tourPrev").textContent = T("Back", "Voltar");
    $("tourPrev").disabled = tourIdx === 0;
    $("tourNext").textContent = tourIdx === TOUR_STOPS.length - 1 ? T("Finish", "Concluir") : T("Next →", "Próximo →");

    positionTourPop(el);
    setTimeout(() => positionTourPop(el), 220);
  }

  function startTour() {
    if (typeof closeMobileSidebar === "function") closeMobileSidebar();
    setPlaying(false);
    tourIdx = 0;
    renderTourStep();
  }

  if ($("startTour")) $("startTour").onclick = startTour;
  if ($("tourClose")) $("tourClose").onclick = closeTour;
  if ($("tourBackdrop")) $("tourBackdrop").onclick = closeTour;
  if ($("tourPrev")) $("tourPrev").onclick = () => { if (tourIdx > 0) { tourIdx--; renderTourStep(); } };
  if ($("tourNext")) $("tourNext").onclick = () => { if (tourIdx < TOUR_STOPS.length - 1) { tourIdx++; renderTourStep(); } else closeTour(); };
  window.addEventListener("resize", () => { if (tourIdx >= 0) positionTourPop(tourTarget); });
