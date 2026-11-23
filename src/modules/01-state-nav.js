  // ========== ORGANIZED LEFT SIDEBAR & 15-MODULE NAVIGATION ==========
  const MOD_ORDER = [
    { id: "overview", step: 0, groupKey: "sb.g0", titleKey: "mod.overview.n" },
    { id: "actions",  step: 1, groupKey: "sb.g1", titleKey: "mod.actions.n" },
    { id: "kpis",     step: 1, groupKey: "sb.g1", titleKey: "mod.kpis.n" },
    { id: "briefing", step: 1, groupKey: "sb.g1", titleKey: "mod.briefing.n" },
    { id: "adoption", step: 1, groupKey: "sb.g1", titleKey: "mod.adoption.n" },
    { id: "friction", step: 1, groupKey: "sb.g1", titleKey: "mod.friction.n" },
    { id: "forecast", step: 2, groupKey: "sb.g2", titleKey: "mod.forecast.n" },
    { id: "backtest", step: 2, groupKey: "sb.g2", titleKey: "mod.backtest.n" },
    { id: "pipeline", step: 3, groupKey: "sb.g3", titleKey: "mod.pipeline.n" },
    { id: "anchors",  step: 3, groupKey: "sb.g3", titleKey: "mod.anchors.n" },
    { id: "comp",     step: 4, groupKey: "sb.g4", titleKey: "mod.comp.n" },
    { id: "pricing",  step: 4, groupKey: "sb.g4", titleKey: "mod.pricing.n" },
    { id: "share",    step: 4, groupKey: "sb.g4", titleKey: "mod.share.n" },
    { id: "signals",  step: 4, groupKey: "sb.g4", titleKey: "mod.signals.n" },
    { id: "products", step: 4, groupKey: "sb.g4", titleKey: "mod.products.n" }
  ];
  const STEP_DEFAULT_MOD = { 0: "overview", 1: "actions", 2: "forecast", 3: "pipeline", 4: "comp" };

  let activeMod = "overview", activeStep = 0, viewMode = "step";
  try {
    const savedCollapsed = localStorage.getItem("scf-sidebar");
    if (savedCollapsed === "collapsed" && window.innerWidth > 1024) document.body.classList.add("sidebar-collapsed");
  } catch (e) {}

  function closeMobileSidebar() {
    document.body.classList.remove("sidebar-open");
    if ($("sidebarBackdrop")) $("sidebarBackdrop").hidden = true;
    if ($("menuToggle") && window.innerWidth <= 1024) $("menuToggle").setAttribute("aria-expanded", "false");
  }
  function openMobileSidebar() {
    document.body.classList.add("sidebar-open");
    if ($("sidebarBackdrop")) $("sidebarBackdrop").hidden = false;
    if ($("menuToggle")) $("menuToggle").setAttribute("aria-expanded", "true");
  }
  if ($("menuToggle")) {
    $("menuToggle").onclick = () => {
      if (window.innerWidth <= 1024) {
        if (document.body.classList.contains("sidebar-open")) closeMobileSidebar();
        else openMobileSidebar();
      } else {
        const collapsed = document.body.classList.toggle("sidebar-collapsed");
        $("menuToggle").setAttribute("aria-expanded", String(!collapsed));
        try { localStorage.setItem("scf-sidebar", collapsed ? "collapsed" : "open"); } catch (e) {}
      }
    };
  }
  if ($("sbCloseMob")) $("sbCloseMob").onclick = closeMobileSidebar;
  if ($("sidebarBackdrop")) $("sidebarBackdrop").onclick = closeMobileSidebar;

  function updateSidebarBadges() {
    if ($("sb-b-actions") && Array.isArray(ACTS)) {
      const openCount = ACTS.length;
      $("sb-b-actions").textContent = String(openCount);
    }
    if ($("sb-b-flags") && D && D.flags) {
      const i = Math.max(0, Math.min(D.flags.length - 1, (typeof week === "number" ? week : W) - 1));
      const fl = D.flags[i] || 0;
      $("sb-b-flags").hidden = fl === 0;
      $("sb-b-flags").textContent = fl ? `${fl}` : "";
    }
    if ($("sb-b-lim")) {
      const cls = (typeof FS.kBase === "number" && FS.kBase >= 0) ? "bad" : (typeof FS.kHigh === "number" && FS.kHigh >= 0) ? "warn" : "";
      $("sb-b-lim").className = "sb-dot" + (cls ? " " + cls : "");
    }
    if ($("sb-b-flow") && typeof totals === "function") {
      const t = totals();
      $("sb-b-flow").textContent = bn(t.flow, 1);
    }
  }

  function updateStepView(scrollToTarget = false) {
    const idx = Math.max(0, MOD_ORDER.findIndex(m => m.id === activeMod));
    const cur = MOD_ORDER[idx];
    activeStep = cur.step;

    // Sidebar active highlight
    document.querySelectorAll("[data-mod-btn]").forEach(b => {
      if (b.dataset.modBtn === activeMod) b.setAttribute("aria-current", "page");
      else b.removeAttribute("aria-current");
    });

    // Overview step cards pressed state
    document.querySelectorAll(".step-card").forEach(b => {
      b.setAttribute("aria-pressed", viewMode === "all" ? "false" : String(+b.dataset.step === activeStep));
    });

    if ($("modeStep")) $("modeStep").setAttribute("aria-pressed", String(viewMode === "step"));
    if ($("modeAll")) $("modeAll").setAttribute("aria-pressed", String(viewMode === "all"));

    // Show/hide Step containers & individual separated modules cleanly
    if (viewMode === "all") {
      document.querySelectorAll("[data-step-panel]").forEach(p => { p.hidden = false; });
      document.querySelectorAll("[data-mod]").forEach(m => { m.hidden = false; });
      if ($("modPager")) $("modPager").hidden = true;
      if ($("stepContext")) {
        $("stepContext").innerHTML = `<strong>${T("Full Intel Center view", "Visão completa do Intel Center")}</strong> · <span>${T("All 15 modules displayed sequentially.", "Todos os 15 módulos exibidos em sequência.")}</span>`;
      }
    } else {
      document.querySelectorAll("[data-step-panel]").forEach(p => {
        p.hidden = +p.dataset.stepPanel !== cur.step;
      });
      document.querySelectorAll("[data-mod]").forEach(m => {
        m.hidden = m.dataset.mod !== activeMod;
      });
      if ($("modPager")) {
        $("modPager").hidden = false;
        const prev = idx > 0 ? MOD_ORDER[idx - 1] : null;
        const next = idx < MOD_ORDER.length - 1 ? MOD_ORDER[idx + 1] : null;
        $("modPrevBtn").disabled = !prev;
        $("modPrevLbl").textContent = prev ? L(I18N[prev.titleKey]) : T("Start", "Início");
        $("modNextBtn").disabled = false;
        $("modNextLbl").textContent = next ? L(I18N[next.titleKey]) : T("Present (17 slides)", "Apresentar (17 slides)");
      }
      if ($("stepContext")) {
        $("stepContext").innerHTML = `<span class="role-chip">${L(I18N[cur.groupKey])}</span> <strong>${L(I18N[cur.titleKey])}</strong> <span style="color:var(--muted);font-size:12px">(${idx + 1}/${MOD_ORDER.length})</span>`;
      }
    }

    if (scrollToTarget) {
      if (viewMode === "all") {
        const elTarget = $("mod-" + activeMod);
        if (elTarget) elTarget.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
    updateSidebarBadges();
  }

  function goMod(modId, scroll = true) {
    if (!MOD_ORDER.some(m => m.id === modId)) modId = "overview";
    activeMod = modId;
    closeMobileSidebar();
    updateStepView(scroll);
  }

  function goStep(step, scroll = true) {
    const targetMod = STEP_DEFAULT_MOD[step] || "overview";
    goMod(targetMod, scroll);
  }

  document.querySelectorAll("[data-mod-btn]").forEach(b => {
    b.addEventListener("click", () => goMod(b.dataset.modBtn, true));
  });
  document.querySelectorAll("[data-step]").forEach(b => {
    b.addEventListener("click", () => goStep(+b.dataset.step, true));
  });
  if ($("brandHome")) {
    $("brandHome").addEventListener("click", e => { e.preventDefault(); goMod("overview", true); });
  }
  if ($("modPrevBtn")) {
    $("modPrevBtn").onclick = () => {
      const idx = MOD_ORDER.findIndex(m => m.id === activeMod);
      if (idx > 0) goMod(MOD_ORDER[idx - 1].id, true);
    };
  }
  if ($("modNextBtn")) {
    $("modNextBtn").onclick = () => {
      const idx = MOD_ORDER.findIndex(m => m.id === activeMod);
      if (idx < MOD_ORDER.length - 1) goMod(MOD_ORDER[idx + 1].id, true);
      else if (typeof openDeck === "function") openDeck(0);
    };
  }
  $("modeStep").onclick = () => { viewMode = "step"; closeMobileSidebar(); updateStepView(false); };
  $("modeAll").onclick  = () => { viewMode = "all";  closeMobileSidebar(); updateStepView(false); };

  // Scroll progress bar
  addEventListener("scroll", () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    $("scrollProg").style.width = (max > 0 ? Math.min(100, 100 * scrollY / max) : 0) + "%";
  }, { passive: true });

  // Shared accessible modal manager (focus trap + scroll lock + Escape)
  let modalFocus = null;
  const SIMPLE_MODALS = ["m-data","m-brief","m-settings","m-ai","m-of"];
  function syncBodyLock() {
    const anyOpen = !deck.hidden || !proofModal.hidden || SIMPLE_MODALS.some(id => !$(id).hidden);
    document.body.style.overflow = anyOpen ? "hidden" : "";
  }
  function trapFocus(container, e) {
    if (e.key !== "Tab") return;
    const focusables = [...container.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')]
      .filter(el => el.offsetParent !== null);
    if (!focusables.length) return;
    const first = focusables[0], last = focusables[focusables.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === container)) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  function openSimpleModal(id) {
    closeMobileSidebar();
    setPlaying(false); modalFocus = document.activeElement;
    const m = $(id); m.hidden = false; syncBodyLock(); m.focus();
  }
  function closeSimpleModal(m) {
    m.hidden = true; syncBodyLock();
    if (modalFocus) modalFocus.focus();
  }
  for (const id of SIMPLE_MODALS) {
    const m = $(id);
    m.addEventListener("click", e => { if (e.target === m || e.target.hasAttribute("data-close")) closeSimpleModal(m); });
  }
  $("openData").onclick = () => { fillFields(); $("data-msg").textContent = ""; openSimpleModal("m-data"); };
  $("src-chip").onclick = $("openData").onclick;
  $("openBrief").onclick = () => { $("brief-body").innerHTML = briefHTML(); $("b-msg").textContent = ""; openSimpleModal("m-brief"); };
