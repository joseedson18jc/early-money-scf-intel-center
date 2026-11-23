  // ========== PERSISTENT OPENAI & ANTHROPIC SETTINGS + AI ANALYSIS ON ENGINE ==========
  const AI_KEY_STORAGE = "scf-ai-cfg";
  const ENDPOINT_ANTHROPIC = "https://api.anthropic.com/v1/messages";
  const ENDPOINT_OPENAI    = "https://api.openai.com/v1/chat/completions";
  const DEFAULT_AI_CFG = { provider:"auto", apiKey:"", model:"auto", customModel:"", endpoint:"", autoApply:false };
  let aiCfg = { ...DEFAULT_AI_CFG };
  try {
    const raw = JSON.parse(localStorage.getItem(AI_KEY_STORAGE) || "null");
    if (raw && typeof raw === "object") {
      aiCfg = { ...DEFAULT_AI_CFG, ...raw };
      // Smoothly migrate old saved default endpoint so switching keys auto-routes cleanly
      if (!raw.provider) aiCfg.provider = "auto";
      if (aiCfg.endpoint === ENDPOINT_ANTHROPIC && aiCfg.provider === "auto") aiCfg.endpoint = "";
    }
    if (!aiCfg.apiKey) { const legacy = localStorage.getItem("scf-ai-key"); if (legacy) aiCfg.apiKey = legacy.trim(); }
  } catch (e) {}
  let aiMode = "cross", aiAbort = null, lastAiResult = null, aiUndoSnap = null, aiDeckNote = "";
  const AI_BRAND = "AI Analysis ON";
  const saveAiCfg = () => { try { localStorage.setItem(AI_KEY_STORAGE, JSON.stringify(aiCfg)); } catch (e) {} };
  const setStatusEl = (id, msg, cls = "info") => { const e = $(id); e.textContent = msg; e.className = "ai-status " + cls; };
  const cleanApiKey = raw => String(raw || "").replace(/["'`]/g, "").trim().replace(/^Bearer\s+/i, "").replace(/\s+/g, "");

  function resolveAiProvider(cfg = aiCfg) {
    const pref = cfg.provider || "auto";
    if (pref === "openai" || pref === "anthropic") return pref;
    const key = cleanApiKey(cfg.apiKey);
    const ep = String(cfg.endpoint || "").trim().toLowerCase();
    const selModel = (cfg.model === "custom" ? cfg.customModel : cfg.model) || "";
    if (/^sk-ant-/i.test(key)) return "anthropic";
    if (/^sk-/i.test(key)) return "openai"; // covers sk-, sk-proj-, sk-svcacct-, sk-admin-, sk-org-, sk-or-v1-, etc.
    if (/openai\.com|\/chat\/completions\b|\/v1\/responses\b|openrouter|groq|together|azure/i.test(ep)) return "openai";
    if (/anthropic\.com|\/v1\/messages\b/i.test(ep)) return "anthropic";
    if (/^(gpt-|o[134]-|chatgpt-)/i.test(selModel)) return "openai";
    if (/^claude-/i.test(selModel)) return "anthropic";
    return key ? "openai" : "anthropic";
  }

  function providerLabel(p = resolveAiProvider()) {
    return p === "openai" ? "OpenAI" : "Anthropic";
  }

  function resolveAiEndpoint(cfg = aiCfg) {
    const prov = resolveAiProvider(cfg);
    let ep = String(cfg.endpoint || "").trim();
    if (!ep) return prov === "openai" ? ENDPOINT_OPENAI : ENDPOINT_ANTHROPIC;
    // If user switched key provider while leaving the OTHER official default URL in the field, auto-route
    if (prov === "openai" && ep === ENDPOINT_ANTHROPIC) return ENDPOINT_OPENAI;
    if (prov === "anthropic" && ep === ENDPOINT_OPENAI) return ENDPOINT_ANTHROPIC;
    // Normalize bare base URLs (e.g. https://api.openai.com/v1 -> .../v1/chat/completions)
    ep = ep.replace(/\/+$/, "");
    if (prov === "openai" && /\/v1$/i.test(ep)) return ep + "/chat/completions";
    if (prov === "anthropic" && /\/v1$/i.test(ep)) return ep + "/messages";
    return ep;
  }

  function activeAiModel(cfg = aiCfg) {
    const prov = resolveAiProvider(cfg);
    const raw = cfg.model === "custom" ? (cfg.customModel || "").trim() : (cfg.model || "auto");
    if (raw && raw !== "auto") {
      // Avoid sending a Claude model ID to OpenAI or a GPT model ID to Anthropic if user kept model dropdown unchanged
      if (prov === "openai" && /^claude-/i.test(raw) && cfg.model !== "custom") return "gpt-4.1";
      if (prov === "anthropic" && /^(gpt-|o[134]-|chatgpt-)/i.test(raw) && cfg.model !== "custom") return "claude-opus-5-5";
      return raw;
    }
    return prov === "openai" ? "gpt-4.1" : "claude-opus-5-5";
  }

  function syncAiStatusUi() {
    const key = cleanApiKey(aiCfg.apiKey);
    const hasKey = Boolean(key);
    const prov = resolveAiProvider();
    $("aiDot").classList.toggle("ready", hasKey);
    $("openSettings").classList.toggle("has-key", hasKey);
    $("aiModelTag").textContent = AI_BRAND;
    $("aiKeyState").textContent = hasKey
      ? T(`${providerLabel(prov)} key saved in browser ✓`, `Chave ${providerLabel(prov)} salva no navegador ✓`)
      : T("No API key saved — configure OpenAI or Anthropic in Settings", "Sem chave salva — configure OpenAI ou Anthropic em Configurações");
    $("aiKeyState").style.color = hasKey ? "var(--green)" : "var(--amber)";
    $("aiUndoBtn").hidden = !aiUndoSnap;
    $("ai-prompt").placeholder = T(
      "e.g., Rebalance Embraer & Natura coverage after 3Q26 leverage, stress-test approved limit, and suggest optimal CDI+x spread...",
      "ex.: Rebalancear cobertura de Embraer e Natura após o 3T26, estressar limite aprovado e sugerir spread CDI+x ideal..."
    );
    $("ai-key-toggle").textContent = $("ai-key").type === "password" ? T("Show","Mostrar") : T("Hide","Ocultar");
    renderAiBriefingBanner();
    if (typeof aiRefresh === "function") aiRefresh();
    if (lastAiResult && !$("m-ai").hidden) renderAiResults();
  }

  function loadSettingsForm() {
    if ($("ai-provider")) $("ai-provider").value = aiCfg.provider || "auto";
    $("ai-key").value = aiCfg.apiKey || "";
    const opts = [...$("ai-model").options].map(o => o.value);
    $("ai-model").value = opts.includes(aiCfg.model) ? aiCfg.model : "custom";
    $("ai-model-custom").value = aiCfg.customModel || (opts.includes(aiCfg.model) && aiCfg.model !== "custom" ? "" : aiCfg.model);
    $("ai-model-custom").disabled = $("ai-model").value !== "custom";
    $("ai-endpoint").value = aiCfg.endpoint || "";
    $("ai-autoapply").checked = !!aiCfg.autoApply;
    setStatusEl("set-status", "");
  }
  $("ai-key-toggle").onclick = () => {
    const inp = $("ai-key");
    inp.type = inp.type === "password" ? "text" : "password";
    $("ai-key-toggle").textContent = inp.type === "password" ? T("Show","Mostrar") : T("Hide","Ocultar");
  };
  function persistSettingsFromForm() {
    const cleanedKey = cleanApiKey($("ai-key").value);
    $("ai-key").value = cleanedKey;
    aiCfg = {
      provider: $("ai-provider") ? $("ai-provider").value : "auto",
      apiKey: cleanedKey,
      model: $("ai-model").value,
      customModel: $("ai-model-custom").value.trim(),
      endpoint: $("ai-endpoint").value.trim(),
      autoApply: $("ai-autoapply").checked
    };
    saveAiCfg();
    syncAiStatusUi();
  }
  if ($("ai-provider")) $("ai-provider").onchange = persistSettingsFromForm;
  $("ai-model").onchange = () => { $("ai-model-custom").disabled = $("ai-model").value !== "custom"; persistSettingsFromForm(); };
  ["ai-key","ai-model-custom","ai-endpoint"].forEach(id => $(id).addEventListener("change", persistSettingsFromForm));
  $("ai-autoapply").onchange = persistSettingsFromForm;
  $("ai-save").onclick = () => {
    persistSettingsFromForm();
    const prov = resolveAiProvider();
    if (!aiCfg.apiKey) {
      setStatusEl("set-status", T("Settings saved (no API key yet — offline engine active).", "Configurações salvas (sem chave ainda — motor offline ativo)."), "info");
    } else {
      setStatusEl("set-status", T(`Settings saved · ${AI_BRAND} (${providerLabel(prov)} ready).`, `Configurações salvas · ${AI_BRAND} (${providerLabel(prov)} pronto).`), "ok");
    }
  };
  $("ai-clear").onclick = () => {
    aiCfg.apiKey = ""; $("ai-key").value = ""; saveAiCfg(); syncAiStatusUi();
    setStatusEl("set-status", T("API key removed from this browser.","Chave removida deste navegador."), "info");
  };
  $("ai-open-copilot").onclick = () => { persistSettingsFromForm(); closeSimpleModal($("m-settings")); openSimpleModal("m-ai"); syncAiStatusUi(); };
  $("openSettings").onclick = () => { loadSettingsForm(); openSimpleModal("m-settings"); };
  $("openAI").onclick = () => { syncAiStatusUi(); openSimpleModal("m-ai"); };
  $("aiGoSettings").onclick = () => { closeSimpleModal($("m-ai")); loadSettingsForm(); openSimpleModal("m-settings"); };
  $("aiModes").addEventListener("click", e => {
    const b = e.target.closest("[data-aimode]"); if (!b) return;
    aiMode = b.dataset.aimode;
    $("aiModes").querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", String(x === b)));
  });

  function pickBestDiscoveredModel(prov, models) {
    if (!models.length) return null;
    if (prov === "anthropic") {
      return (models.find(m => /opus/i.test(m.id)) || models.find(m => /sonnet/i.test(m.id)) || models[0]).id;
    }
    const chatIds = models.map(m => m.id).filter(id =>
      /^(gpt-|o[134]-|chatgpt-)/i.test(id) &&
      !/embed|whisper|tts|dall-e|audio|realtime|transcribe|moderation|image|search|instruct|babbage|davinci/i.test(id)
    );
    const rank = [/^gpt-5\.4$/i, /^gpt-5\.2$/i, /^gpt-5\.1$/i, /^gpt-5$/i, /^gpt-4\.1$/i, /^gpt-4o$/i, /^gpt-5-mini$/i, /^gpt-4\.1-mini$/i, /^gpt-4o-mini$/i, /^o4-mini$/i, /^o3-mini$/i];
    for (const rx of rank) {
      const hit = chatIds.find(id => rx.test(id));
      if (hit) return hit;
    }
    return chatIds[0] || models[0].id;
  }

  async function discoverAccountModels(cfg = aiCfg) {
    const key = cleanApiKey(cfg.apiKey);
    if (!key) return [];
    const prov = resolveAiProvider(cfg);
    const ep = resolveAiEndpoint(cfg);
    const modelsUrl = prov === "openai"
      ? ep.replace(/\/(chat\/completions|responses)\/?$/i, "/models")
      : ep.replace(/\/v1\/messages\/?$/i, "/v1/models");
    const headers = prov === "openai"
      ? { "authorization": `Bearer ${key}` }
      : { "x-api-key": key, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" };
    const res = await fetch(modelsUrl, { method: "GET", headers });
    if (!res.ok) return [];
    const d = await res.json().catch(() => ({}));
    const list = Array.isArray(d.data) ? d.data.map(m => ({ id: m.id, name: m.display_name || m.id })) : [];
    if (list.length && $("ai-model")) {
      const sel = $("ai-model"), customOpt = sel.querySelector('option[value="custom"]');
      const existing = new Set([...sel.options].map(o => o.value));
      list.slice(0, 40).forEach(m => {
        if (!existing.has(m.id) && !/claude-opus-5-5/i.test(m.id)) {
          const opt = document.createElement("option");
          opt.value = m.id; opt.textContent = `${providerLabel(prov)} · ${m.id}`;
          sel.insertBefore(opt, customOpt);
          existing.add(m.id);
        }
      });
    }
    return list;
  }

  const AI_PARAM_ENUM = [
    "spendBn","baseSup","limitBRL","scenario","horizon","tenor","spread","mktSpread",
    "jbs.addr","jbs.cov","jbs.adh","jbs.util",
    "mbrf.addr","mbrf.cov","mbrf.adh","mbrf.util",
    "vot.addr","vot.cov","vot.adh","vot.util",
    "emb.addr","emb.cov","emb.adh","emb.util",
    "nat.addr","nat.cov","nat.adh","nat.util"
  ];
  const AI_RESPONSE_SCHEMA = {
    type: "object",
    additionalProperties: false,
    required: ["executive_summary","predictions_feedback","deck_note","key_insights","recommended_actions","parameter_updates"],
    properties: {
      executive_summary: { type: "string" },
      predictions_feedback: { type: "string" },
      deck_note: { type: "string" },
      key_insights: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["step","impact","title","detail"],
          properties: {
            step: { type: "string" },
            impact: { type: "string" },
            title: { type: "string" },
            detail: { type: "string" }
          }
        }
      },
      recommended_actions: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["action","owner","rationale"],
          properties: {
            action: { type: "string" },
            owner: { type: "string" },
            rationale: { type: "string" }
          }
        }
      },
      parameter_updates: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["param","value","reason"],
          properties: {
            param: { type: "string", enum: AI_PARAM_ENUM },
            value: { type: "string" },
            reason: { type: "string" }
          }
        }
      }
    }
  };

  async function callAnthropic({ system, userPrompt, messages = null, maxTokens = 16384, outputConfig = null, modelOverride = null, signal }) {
    const key = cleanApiKey(aiCfg.apiKey);
    const endpoint = resolveAiEndpoint({ ...aiCfg, provider: "anthropic" });
    const modelId = modelOverride || activeAiModel({ ...aiCfg, provider: "anthropic" });
    const send = async (cfg) => {
      const payload = {
        model: modelId,
        max_tokens: maxTokens,
        system,
        messages: messages || [{ role: "user", content: userPrompt }]
      };
      if (cfg) payload.output_config = cfg;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": key,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true"
        },
        body: JSON.stringify(payload),
        signal
      });
      const data = await res.json().catch(() => ({}));
      return { res, data };
    };
    let { res, data } = await send(outputConfig);
    if (!res.ok && res.status === 400 && outputConfig) {
      ({ res, data } = await send(null));
    }
    if (!res.ok) {
      const errMsg = data?.error?.message || `HTTP ${res.status}`;
      const err = new Error(errMsg);
      err.status = res.status;
      throw err;
    }
    const text = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("\n").trim();
    return { text, model: data.model || modelId, provider: "anthropic", stopReason: data.stop_reason || "", usage: data.usage || null };
  }

  function extractOpenAIText(data) {
    // Supports Chat Completions API AND Responses API payloads
    if (typeof data?.output_text === "string" && data.output_text.trim()) return data.output_text.trim();
    if (Array.isArray(data?.output)) {
      const chunks = [];
      for (const item of data.output) {
        if (Array.isArray(item?.content)) {
          for (const c of item.content) { if (typeof c?.text === "string") chunks.push(c.text); }
        }
      }
      if (chunks.length) return chunks.join("\n").trim();
    }
    const msg = data?.choices?.[0]?.message;
    if (typeof msg?.content === "string") return msg.content.trim();
    if (Array.isArray(msg?.content)) {
      return msg.content.filter(p => p?.type === "text" || typeof p?.text === "string").map(p => p.text || "").join("\n").trim();
    }
    return "";
  }

  async function callOpenAI({ system, userPrompt, messages = null, maxTokens = 8192, jsonSchema = null, modelOverride = null, signal }) {
    const key = cleanApiKey(aiCfg.apiKey);
    const endpoint = resolveAiEndpoint({ ...aiCfg, provider: "openai" });
    const modelId = modelOverride || activeAiModel({ ...aiCfg, provider: "openai" });
    const isResponsesApi = /\/responses\/?$/i.test(endpoint);

    const send = async (mode, useMaxTokensKey) => {
      let payload;
      if (isResponsesApi) {
        payload = {
          model: modelId,
          instructions: system,
          input: messages ? messages.map(m => ({ role: m.role, content: m.content })) : userPrompt,
          max_output_tokens: maxTokens
        };
        if (mode === "schema" && jsonSchema) {
          payload.text = { format: { type: "json_schema", name: "scf_cockpit_analysis", strict: true, schema: jsonSchema } };
        }
      } else {
        const chatMsgs = [{ role: "system", content: system }, ...(messages || [{ role: "user", content: userPrompt }])];
        payload = { model: modelId, messages: chatMsgs };
        if (useMaxTokensKey === "max_tokens") payload.max_tokens = Math.min(maxTokens, 4096);
        else payload.max_completion_tokens = maxTokens;
        if (mode === "schema" && jsonSchema) {
          payload.response_format = { type: "json_schema", json_schema: { name: "scf_cockpit_analysis", strict: true, schema: jsonSchema } };
        } else if (mode === "json_object") {
          payload.response_format = { type: "json_object" };
        }
      }
      let res;
      try {
        res = await fetch(endpoint, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "authorization": `Bearer ${key}`
          },
          body: JSON.stringify(payload),
          signal
        });
      } catch (netErr) {
        if (netErr && netErr.name === "AbortError") throw netErr;
        throw new Error(T(
          "Network/CORS error (Failed to fetch). Note: OpenAI omits CORS headers on invalid/expired API keys (HTTP 401) — verify your key, billing credits, or proxy URL.",
          "Erro de rede/CORS (Failed to fetch). Obs.: a OpenAI omite headers CORS quando a chave é inválida/expirada (HTTP 401) — verifique sua chave, créditos da conta ou URL de proxy."
        ));
      }
      const data = await res.json().catch(() => ({}));
      return { res, data };
    };

    const firstMode = jsonSchema ? "schema" : "plain";
    let tokenKey = "max_completion_tokens";
    let { res, data } = await send(firstMode, tokenKey);

    // Fallback 1: older models / OpenAI-compatible gateways that reject max_completion_tokens
    if (!res.ok && res.status === 400 && /max_completion_tokens|unsupported parameter/i.test(data?.error?.message || "")) {
      tokenKey = "max_tokens";
      ({ res, data } = await send(firstMode, tokenKey));
    }
    // Fallback 2: model/proxy rejects json_schema -> retry with json_object
    if (!res.ok && res.status === 400 && firstMode === "schema") {
      ({ res, data } = await send("json_object", tokenKey));
    }
    // Fallback 3: model/proxy rejects response_format entirely -> retry plain JSON prompt
    if (!res.ok && res.status === 400 && firstMode === "schema") {
      ({ res, data } = await send("plain", tokenKey));
    }

    if (!res.ok) {
      const errMsg = data?.error?.message || `HTTP ${res.status}`;
      const err = new Error(errMsg);
      err.status = res.status;
      err.code = data?.error?.code || "";
      throw err;
    }
    const text = extractOpenAIText(data);
    return { text, model: data.model || modelId, provider: "openai", stopReason: data?.choices?.[0]?.finish_reason || data?.status || "", usage: data.usage || null };
  }

  async function callAiProvider({ system, userPrompt, messages = null, maxTokens = 16384, structured = false, effort = "medium", signal }) {
    const key = cleanApiKey(aiCfg.apiKey);
    if (!key) {
      throw new Error(T("Please add your OpenAI or Anthropic API key in Settings first.", "Adicione sua chave OpenAI ou Anthropic em Configurações primeiro."));
    }
    const prov = resolveAiProvider();
    const invoke = async (modelOverride = null) => {
      if (prov === "openai") {
        return callOpenAI({
          system, userPrompt, messages,
          maxTokens: Math.min(maxTokens, 16384),
          jsonSchema: structured ? AI_RESPONSE_SCHEMA : null,
          modelOverride, signal
        });
      }
      return callAnthropic({
        system, userPrompt, messages, maxTokens,
        outputConfig: structured
          ? { effort, format: { type: "json_schema", schema: AI_RESPONSE_SCHEMA } }
          : (effort ? { effort } : null),
        modelOverride, signal
      });
    };
    try {
      return await invoke(null);
    } catch (err) {
      const isModelErr = err.status === 404 || err.code === "model_not_found" || /model.*not found|does not exist|does not have access to model/i.test(err.message || "");
      if (isModelErr) {
        const models = await discoverAccountModels().catch(() => []);
        const best = pickBestDiscoveredModel(prov, models);
        if (best && best !== activeAiModel()) {
          return await invoke(best);
        }
      }
      throw err;
    }
  }

  $("ai-test").onclick = async () => {
    persistSettingsFromForm();
    const prov = resolveAiProvider();
    setStatusEl("set-status", T(`Testing connection (${providerLabel(prov)} · ${AI_BRAND})...`, `Testando conexão (${providerLabel(prov)} · ${AI_BRAND})...`), "info");
    const t0 = performance.now();
    try {
      const r = await callAiProvider({ system: "Respond with OK only.", userPrompt: "Ping", maxTokens: 512, structured: false, effort: "low" });
      const ms = Math.round(performance.now() - t0);
      setStatusEl("set-status", T(`Connected ✓ · ${providerLabel(r.provider)} key verified · ${AI_BRAND} · ${ms} ms`, `Conectado ✓ · Chave ${providerLabel(r.provider)} validada · ${AI_BRAND} · ${ms} ms`), "ok");
    } catch (err) {
      setStatusEl("set-status", T(`Connection failed (${providerLabel(prov)}): ${err.message}`, `Falha na conexão (${providerLabel(prov)}): ${err.message}`), "err");
    }
  };

  function buildDashboardSnapshot() {
    const i = week - 1, bt = backtest(week), t = totals();
    const btModel = bt.length ? +(bt.reduce((s, r) => s + r.model, 0) / bt.length).toFixed(2) : null;
    const btFlat  = bt.length ? +(bt.reduce((s, r) => s + r.flat, 0) / bt.length).toFixed(2) : null;
    return {
      meta: { week, totalWeeks: W, language: lang, displayCurrency: ccy, fxPTAX_BRL_USD: FX_RATE, selicPct: SELIC },
      step1_program: {
        inScopeSpendBnBRL: +(SPEND / 1000).toFixed(2), supplierBase: BASE_SUP,
        currentWeekKPIs: { spendPct: D.spend[i], activeSuppliers: D.active[i], utilizationPct: D.util[i], daysToFirstDiscount: D.days[i], balanceMiBRL: D.bal[i], annualizedSpreadRevMiBRL: rev[i], forecastErrorPct: D.err[i], shareOfWalletPct: D.sow[i], openRiskFlags: D.flags[i] },
        funnelBeforeVsDocAI: { before: F.before, after: F.after, docDropoffPP: -26.0 },
        propensityTop3DecilesSharePct: 62.2,
        recentAlerts: ALERTS.filter(a => a[0] <= week).map(a => ({ week: a[0], text: a[2][0] }))
      },
      step2_forecast_and_limit: {
        approvedLimitMiBRL: Math.round(limitBRL), scenario: curScenario, horizonWeeks: curHorizon,
        projectedEndMiBRL: Math.round(FS.end), projectedPeakHighMiBRL: Math.round(FS.peakHigh),
        headroomMiBRL: Math.round(FS.lim - FS.peakHigh), backtestAvgModelAPE: btModel, backtestAvgNaiveAPE: btFlat
      },
      step3_anchor_pipeline_3Q26: {
        globalTenorDays: G.tenor, globalSpreadPct: G.spread,
        totals: { eligibleBnBRL: +t.elig.toFixed(2), annualFlowBnBRL: +t.flow.toFixed(2), avgBalanceMiBRL: Math.round(t.bal), annualSpreadRevMiBRL: +t.rev.toFixed(2) },
        anchors: ANCHORS.map((a, idx) => ({
          id: a.id, name: a.name, q3_2026_bnBRL: a.q3, annualizedBaseBnBRL: a.rev, q3Note: a.q3Note[0],
          params: { ...P[idx] },
          sized: { eligBnBRL: +eligOf(idx).toFixed(2), flowBnBRL: +flowOf(idx).toFixed(2), balMiBRL: Math.round(balOf(flowOf(idx))) }
        }))
      },
      step4_market_and_signals: {
        citiSimulatedSpreadPct: mktSpread,
        competitorGapsMiBRL: COMP_DATA.map(c => ({ id: c.id, citi: c.citi, fidc: c.fidc, openGap: c.gap, peersTotal: c.itau + c.brad + c.sant + c.btg + c.bb })),
        pricingTiers: PRICE_TIERS,
        rmLossReasonsPct: RM_LOSS.map(r => ({ reason: r.lbl[0], pct: r.pct })),
        registrarRealShare: SHARE_DATA,
        externalCreditHealth: EXT_HEALTH.map(h => ({ id: h.id, rating: h.rating, outlook: h.outlook[0], dupReadinessPct: h.dupPct, stress: h.stress[0], netSignal: h.net[0] }))
      }
    };
  }

  function extractJsonPayload(raw, stopReason = "") {
    const cleaned = (raw || "").trim();
    if (!cleaned) {
      throw new Error(stopReason === "max_tokens"
        ? T("Thinking used the full token budget before returning text. Please retry.","O raciocínio consumiu todo o limite de tokens antes de responder. Tente novamente.")
        : T("Model returned an empty text block.","O modelo retornou uma resposta vazia."));
    }
    try { return JSON.parse(cleaned); } catch (_) {}
    const fenced = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenced) { try { return JSON.parse(fenced[1].trim()); } catch (_) {} }
    const start = cleaned.indexOf("{"), end = cleaned.lastIndexOf("}");
    if (start >= 0 && end > start) {
      const slice = cleaned.slice(start, end + 1);
      try { return JSON.parse(slice); } catch (_) {}
      try { return JSON.parse(slice.replace(/,\s*([}\]])/g, "$1")); } catch (_) {}
    }
    // Graceful fallback: never discard a readable text answer from a custom model/proxy
    return {
      executive_summary: cleaned,
      predictions_feedback: "",
      key_insights: [],
      recommended_actions: [],
      parameter_updates: []
    };
  }

  function normalizeParamUpdates(updates) {
    if (!updates) return {};
    if (!Array.isArray(updates)) return updates;
    const out = { anchors: {} };
    updates.forEach(item => {
      if (!item || !item.param) return;
      const p = String(item.param).trim(), val = item.value, reason = item.reason || "";
      if (p.includes(".")) {
        const [aid, field] = p.split(".");
        if (!out.anchors[aid]) out.anchors[aid] = {};
        out.anchors[aid][field] = { value: val, reason };
      } else {
        out[p] = { value: val, reason };
      }
    });
    return out;
  }

  function collectParamDiffs(rawUpdates) {
    const updates = normalizeParamUpdates(rawUpdates);
    if (!updates || typeof updates !== "object") return [];
    const diffs = [];
    const add = (key, step, label, cur, next, fmt, reason, applyFn) => {
      if (next === undefined || next === null || Number.isNaN(next)) return;
      if (String(cur) === String(next) || (typeof cur === "number" && typeof next === "number" && Math.abs(cur - next) < 1e-6)) return;
      diffs.push({ key, step, label, curDisp: fmt(cur), nextDisp: fmt(next), reason: reason || "", applyFn });
    };
    const num = (v, lo, hi) => {
      const raw = typeof v === "object" && v !== null ? v.value : v;
      const cleaned = typeof raw === "string" ? raw.replace(/[^\d.,-]/g, "").replace(",", ".") : raw;
      const n = Number(cleaned);
      return isFinite(n) ? Math.min(hi, Math.max(lo, n)) : null;
    };
    const rsn = v => (typeof v === "object" && v !== null && v.reason) ? String(v.reason) : "";

    if (updates.spendBn !== undefined) {
      const nv = num(updates.spendBn, 0.5, 500);
      if (nv !== null) add("spendBn", "S1", T("In-scope spend","Compras no escopo"), +(SPEND / 1000).toFixed(2), +nv.toFixed(2), v => bn(v, 1), rsn(updates.spendBn), () => { SPEND = nv * 1000; $("cfg-spend").value = nv.toFixed(1); });
    }
    if (updates.baseSup !== undefined) {
      const nv = num(updates.baseSup, 20, 50000);
      if (nv !== null) add("baseSup", "S1", T("Supplier base","Base de fornecedores"), BASE_SUP, Math.round(nv), v => nf(v), rsn(updates.baseSup), () => { BASE_SUP = Math.round(nv); $("cfg-base").value = BASE_SUP; });
    }
    if (updates.limitBRL !== undefined) {
      const nv = num(updates.limitBRL, 50, 50000);
      if (nv !== null) add("limitBRL", "S2", T("Approved credit limit","Limite aprovado"), Math.round(limitBRL), Math.round(nv), v => money(v), rsn(updates.limitBRL), () => { limitBRL = Math.round(nv); });
    }
    if (updates.scenario !== undefined) {
      const rawSc = typeof updates.scenario === "object" && updates.scenario !== null ? updates.scenario.value : updates.scenario;
      if (["Downside","Base","Upside"].includes(rawSc)) {
        add("scenario", "S2", T("Forecast scenario","Cenário de projeção"), curScenario, rawSc, v => scName(v), rsn(updates.scenario), () => {
          curScenario = rawSc;
          $("scenarioGroup").querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.sc === curScenario)));
        });
      }
    }
    if (updates.horizon !== undefined) {
      const nv = num(updates.horizon, 4, 13);
      if ([4,8,13].includes(nv)) {
        add("horizon", "S2", T("Forecast horizon","Horizonte de projeção"), curHorizon, nv, v => v + T(" wk"," sem"), rsn(updates.horizon), () => {
          curHorizon = nv;
          $("horizonGroup").querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", String(+b.dataset.hz === curHorizon)));
        });
      }
    }
    if (updates.tenor !== undefined) {
      const nv = num(updates.tenor, 15, 360);
      if (nv !== null) add("tenor", "S3", T("Avg. days discounted","Prazo médio (dias)"), G.tenor, Math.round(nv), v => v + "d", rsn(updates.tenor), () => { G.tenor = Math.round(nv); });
    }
    if (updates.spread !== undefined) {
      const nv = num(updates.spread, 0.4, 5.0);
      if (nv !== null) add("spread", "S3", T("Pipeline annual spread","Spread anual pipeline"), G.spread, +nv.toFixed(2), v => nf(v, 2) + "%", rsn(updates.spread), () => { G.spread = +nv.toFixed(2); });
    }
    if (updates.mktSpread !== undefined) {
      const nv = num(updates.mktSpread, 0.6, 2.6);
      if (nv !== null) add("mktSpread", "S4.2", T("Market CDI+x spread","Spread mercado CDI+x"), mktSpread, +nv.toFixed(2), v => "CDI + " + nf(v, 2) + "%", rsn(updates.mktSpread), () => { mktSpread = +nv.toFixed(2); });
    }
    if (updates.anchors && typeof updates.anchors === "object") {
      const fieldLbl = { addr:T("Addressable %","Endereçável %"), cov:T("Coverage %","Cobertura %"), adh:T("Adoption %","Adesão %"), util:T("Utilization %","Utilização %") };
      ANCHORS.forEach((a, idx) => {
        const au = updates.anchors[a.id];
        if (!au || typeof au !== "object") return;
        for (const k of ["addr","cov","adh","util"]) {
          if (au[k] === undefined) continue;
          const nv = num(au[k], k === "addr" ? 0.5 : 5, 100);
          if (nv === null) continue;
          const rounded = k === "addr" ? +nv.toFixed(1) : Math.round(nv);
          add(`anchor.${a.id}.${k}`, "S3", `${a.name} · ${fieldLbl[k]}`, P[idx][k], rounded, v => nf(v, k === "addr" ? 1 : 0) + "%", rsn(au[k]) || au.reason || "", () => { P[idx][k] = rounded; });
        }
      });
    }
    return diffs;
  }

  function captureUndoSnapshot() {
    return {
      SPEND, BASE_SUP, limitBRL, curScenario, curHorizon, mktSpread, scen, aiDeckNote,
      G: { ...G }, P: P.map(p => ({ ...p }))
    };
  }
  function applyDiffList(diffs, syncDeckNote = true) {
    if (!diffs.length && !syncDeckNote) return;
    aiUndoSnap = captureUndoSnapshot();
    diffs.forEach(d => d.applyFn());
    if (diffs.length) document.querySelectorAll("[data-preset]").forEach(b => b.classList.remove("active"));
    // Sync 17-slide executive presentation state (Slide 1, 4, 5, 7, 8, 9, 10, 17)
    scen = curScenario;
    if (syncDeckNote && lastAiResult) {
      aiDeckNote = (lastAiResult.deck_note || lastAiResult.executive_summary || "").trim();
    }
    recomputeBook();
    updateCcyTexts();
    syncPipelineInputs();
    // Preserve explicit mktSpread if proposed separately from G.spread
    const ms = diffs.find(d => d.key === "mktSpread");
    if (ms) { ms.applyFn(); renderMarket(); }
    buildKpis();
    render(week);
    if (!deck.hidden) renderSlide();
    if (!proofModal.hidden && activeProofKey) renderProof(activeProofKey);
    if (!$("m-brief").hidden) $("brief-body").innerHTML = briefHTML();
    syncAiStatusUi();
  }
  $("aiUndoBtn").onclick = () => {
    if (!aiUndoSnap) return;
    const s = aiUndoSnap; aiUndoSnap = null;
    SPEND = s.SPEND; BASE_SUP = s.BASE_SUP; limitBRL = s.limitBRL;
    curScenario = s.curScenario; curHorizon = s.curHorizon; mktSpread = s.mktSpread;
    scen = s.scen; aiDeckNote = s.aiDeckNote || "";
    Object.assign(G, s.G);
    s.P.forEach((p, idx) => Object.assign(P[idx], p));
    $("cfg-spend").value = (SPEND / 1000).toFixed(1); $("cfg-base").value = BASE_SUP;
    $("scenarioGroup").querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.sc === curScenario)));
    $("horizonGroup").querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", String(+b.dataset.hz === curHorizon)));
    recomputeBook(); updateCcyTexts(); syncPipelineInputs();
    mktSpread = s.mktSpread; renderMarket(); buildKpis(); render(week);
    if (!deck.hidden) renderSlide();
    syncAiStatusUi();
    setStatusEl("aiRunStatus", T("Previous cockpit & presentation parameters restored.","Parâmetros anteriores do cockpit e da apresentação restaurados."), "info");
  };

  function renderAiBriefingBanner() {
    const box = $("aiLiveBriefing");
    if (!lastAiResult || !lastAiResult.executive_summary) { box.hidden = true; return; }
    box.hidden = false;
    box.innerHTML = `<div class="ai-live-head">
      <span class="ai-live-pill">✦ ${AI_BRAND} · ${T("Cross-Data Briefing","Briefing Cruzado")}</span>
      <button type="button" class="sig-route-btn" id="openAiFromBrief">${T("Inspect insights & parameters ↗","Abrir insights e parâmetros ↗")}</button>
    </div><div>${esc(lastAiResult.executive_summary)}</div>`;
    $("openAiFromBrief").onclick = () => { syncAiStatusUi(); openSimpleModal("m-ai"); };
  }

  function renderAiResults() {
    const box = $("aiResults");
    if (!lastAiResult) { box.innerHTML = ""; return; }
    const r = lastAiResult;
    const diffs = collectParamDiffs(r.parameter_updates);
    let html = "";
    if (r.executive_summary) {
      html += `<div class="ai-sec"><h4><span>${T("Executive Summary","Resumo Executivo")}</span><span class="ai-tag">${AI_BRAND}</span></h4><p>${esc(r.executive_summary)}</p></div>`;
    }
    if (r.predictions_feedback) {
      html += `<div class="ai-sec"><h4><span>${T("Predictions, Forecast & Limit Feedback","Feedback sobre Predições, Projeção e Limite")}</span><span class="ai-tag med">${T("Step 2 + 3Q26","Etapa 2 + 3T26")}</span></h4><p>${esc(r.predictions_feedback)}</p></div>`;
    }
    if (Array.isArray(r.key_insights) && r.key_insights.length) {
      html += `<div class="ai-sec"><h4><span>${T("Cross-Data Key Insights","Principais Insights Cruzados")}</span><span class="ai-tag pos">${r.key_insights.length}</span></h4>
        <div class="ai-insight-grid">${r.key_insights.map(ins => {
          const imp = String(ins.impact || "medium").toLowerCase();
          const cls = imp.includes("high") || imp.includes("alt") ? "high" : imp.includes("pos") || imp.includes("opp") ? "pos" : "med";
          return `<div class="ai-insight-card"><div class="ai-meta-tags"><span class="ai-tag">${esc(ins.step || "Cross-step")}</span><span class="ai-tag ${cls}">${esc(ins.impact || "Key")}</span></div><strong>${esc(ins.title || "")}</strong><p>${esc(ins.detail || "")}</p></div>`;
        }).join("")}</div></div>`;
    }
    if (Array.isArray(r.recommended_actions) && r.recommended_actions.length) {
      html += `<div class="ai-sec"><h4><span>${T("Recommended Actions & RM Feedback","Ações Recomendadas e Feedback Comercial")}</span></h4>
        <ol style="padding-left:18px;font-size:12.5px;line-height:1.5;color:var(--ink)">${r.recommended_actions.map(a => {
          if (typeof a === "string") return `<li style="margin:4px 0">${esc(a)}</li>`;
          return `<li style="margin:4px 0"><b>${esc(a.action || a.title || "")}</b>${a.owner ? ` <i>(${esc(a.owner)})</i>` : ""}${a.rationale ? ` — ${esc(a.rationale)}` : ""}</li>`;
        }).join("")}</ol></div>`;
    }
    if (diffs.length) {
      html += `<div class="ai-sec"><h4><span>${T("Proposed Parameter Updates (Cockpit + 17-Slide Presentation)","Atualizações de Parâmetros Propostas (Cockpit + Apresentação 17 slides)")}</span><span class="ai-tag pos">${diffs.length} ${T("changes","ajustes")}</span></h4>
        <div class="proof-table-wrap"><table class="ai-diff-table"><thead><tr><th style="width:28px">✓</th><th>${T("Step","Etapa")}</th><th>${T("Parameter","Parâmetro")}</th><th>${T("Current → Proposed","Atual → Proposto")}</th><th>${T("Rationale","Justificativa")}</th></tr></thead><tbody>
        ${diffs.map((d, idx) => `<tr><td><input type="checkbox" class="ai-diff-chk" data-idx="${idx}" checked aria-label="${esc(d.label)}"></td><td><span class="ai-tag">${esc(d.step)}</span></td><td><b>${esc(d.label)}</b></td><td><span class="val-old">${esc(d.curDisp)}</span>→ <span class="val-new">${esc(d.nextDisp)}</span></td><td style="color:var(--muted)">${esc(d.reason)}</td></tr>`).join("")}
        </tbody></table></div>
        <div class="mbtns" style="margin-top:10px">
          <button type="button" class="mbtn pri" id="aiApplySelected">${T("Update cockpit & presentation (17 slides)","Atualizar cockpit e apresentação (17 slides)")}</button>
          <button type="button" class="mbtn" id="aiOpenDeckBtn">${T("Open Presentation (17) →","Abrir Apresentação (17) →")}</button>
        </div></div>`;
    } else if (r.parameter_updates) {
      html += `<div class="ai-sec"><h4>${T("Cockpit & Presentation Sync","Sincronização Cockpit & Apresentação")}</h4><p>${T("All numeric parameters match the current state. You can still sync the executive takeaway into the 17-slide presentation.","Todos os parâmetros numéricos já estão sincronizados. Você ainda pode atualizar a nota executiva na apresentação (17 slides).")}</p>
        <div class="mbtns" style="margin-top:8px">
          <button type="button" class="mbtn pri" id="aiSyncDeckOnly">${T("Update presentation (17 slides)","Atualizar apresentação (17 slides)")}</button>
          <button type="button" class="mbtn" id="aiOpenDeckBtn">${T("Open Presentation (17) →","Abrir Apresentação (17) →")}</button>
        </div></div>`;
    }
    box.innerHTML = html;
    const applyBtn = $("aiApplySelected");
    if (applyBtn) {
      applyBtn.onclick = () => {
        const picked = [...box.querySelectorAll(".ai-diff-chk:checked")].map(c => diffs[+c.dataset.idx]).filter(Boolean);
        applyDiffList(picked, true);
        setStatusEl("aiRunStatus", T(`Updated ${picked.length} parameter(s) across Cockpit & Presentation (17 slides) ✓`,`${picked.length} parâmetro(s) atualizado(s) no Cockpit e na Apresentação (17 slides) ✓`), "ok");
        renderAiResults();
      };
    }
    const syncOnly = $("aiSyncDeckOnly");
    if (syncOnly) {
      syncOnly.onclick = () => {
        applyDiffList([], true);
        setStatusEl("aiRunStatus", T("Presentation (17 slides) synced with AI Analysis ON ✓","Apresentação (17 slides) atualizada com AI Analysis ON ✓"), "ok");
        renderAiResults();
      };
    }
    const openDeckBtn = $("aiOpenDeckBtn");
    if (openDeckBtn) {
      openDeckBtn.onclick = () => { closeSimpleModal($("m-ai")); openDeck(0); };
    }
  }

  $("aiAbortBtn").onclick = () => { if (aiAbort) { aiAbort.abort(); aiAbort = null; } };
  $("aiRunBtn").onclick = async () => {
    if (!cleanApiKey(aiCfg.apiKey)) {
      setStatusEl("aiRunStatus", T("Configure your OpenAI or Anthropic API key in Settings first.", "Configure sua chave OpenAI ou Anthropic em Configurações primeiro."), "err");
      return;
    }
    const snap = buildDashboardSnapshot();
    const modeDirectives = {
      cross: "Cross-correlate Step 1 program KPIs/onboarding funnel, Step 2 balance forecast/limit, Step 3 3Q26 anchor financials, and Step 4 competitor IAS 7 gaps, CDI+x pricing, registrar real share, and external credit signals. Surface non-obvious cross-step insights and propose calibrated parameter updates across the cockpit and presentation.",
      predict: "Focus deeply on improving balance predictions, diagnosing backtest error vs naive baseline, checking seasonality/approved limit breach risk, and recommending optimal scenario, horizon, limitBRL, and tenor/spread parameters.",
      optimize: "Actively optimize every editable parameter across Steps 1–4 and the 17-slide presentation (spendBn, baseSup, limitBRL, scenario, horizon, tenor, spread, mktSpread, and per-anchor addr/cov/adh/util for jbs, mbrf, vot, emb, nat) grounded in 3Q26 leverage, IAS 7 gaps, FIDC competition, and registrar readiness.",
      exec: "Deliver sharp Monday executive feedback for Corporate Banking / SCF leadership: highlight what is working, blind spots, commercial RM priorities, presentation narrative update, and targeted parameter adjustments."
    };
    const systemPrompt = `You are a senior Corporate Banking Supply Chain Finance (Risco Sacado Brasil) quantitative strategist & credit risk advisor.
Analyze the live cockpit JSON snapshot across Steps 1-4 and return ONLY a single valid JSON object matching the required schema:
- executive_summary: 2-4 sentence executive synthesis in ${lang === "pt" ? "Brazilian Portuguese (PT-BR)" : "English"}.
- predictions_feedback: Specific feedback on balance forecast, backtest APE, seasonality & approved limit headroom in ${lang === "pt" ? "Brazilian Portuguese (PT-BR)" : "English"}.
- deck_note: Concise 1-2 sentence executive takeaway to update Slides 1 & 17 of the attached 17-slide presentation in ${lang === "pt" ? "Brazilian Portuguese (PT-BR)" : "English"}.
- key_insights: 4 to 6 sharp cross-data objects { step, impact ("High"|"Opportunity"|"Risk"), title, detail } referencing concrete numbers across Steps 1-4.
- recommended_actions: 3 to 5 prioritized objects { action, owner, rationale }.
- parameter_updates: array of objects { param, value, reason } ONLY for parameters that genuinely merit changing based on cross-data evidence.
  Allowed param names & value formats (keep all monetary values in BRL millions/billions as in snapshot, value as string):
  - "spendBn" (0.5-500, R$ bn), "baseSup" (20-50000), "limitBRL" (50-50000, R$ m)
  - "scenario" ("Downside"|"Base"|"Upside"), "horizon" ("4"|"8"|"13")
  - "tenor" (15-360 days), "spread" (0.4-5.0, %), "mktSpread" (0.6-2.6, CDI+x %)
  - Per-anchor params for jbs, mbrf, vot, emb, nat: "<id>.addr" (0.5-100), "<id>.cov" (5-100), "<id>.adh" (5-100), "<id>.util" (5-100).
Write ALL prose fields strictly in ${lang === "pt" ? "Brazilian Portuguese (PT-BR)" : "English"}.`;

    const extra = $("ai-prompt").value.trim();
    const userPrompt = `MODE: ${aiMode.toUpperCase()} — ${modeDirectives[aiMode]}\n${extra ? `SPECIALIST INSTRUCTION: ${extra}\n` : ""}LIVE COCKPIT SNAPSHOT:\n${JSON.stringify(snap)}`;

    aiAbort = new AbortController();
    $("aiRunBtn").disabled = true; $("aiAbortBtn").hidden = false;
    setStatusEl("aiRunStatus", T(`Running ${AI_BRAND} across Steps 1–4 & Presentation...`,`Executando ${AI_BRAND} nas Etapas 1–4 e Apresentação...`), "info");
    try {
      const resp = await callAiProvider({
        system: systemPrompt,
        userPrompt,
        maxTokens: 16384,
        structured: true,
        effort: "medium",
        signal: aiAbort.signal
      });
      const parsed = extractJsonPayload(resp.text, resp.stopReason);
      parsed._model = AI_BRAND;
      lastAiResult = parsed;
      const diffs = collectParamDiffs(parsed.parameter_updates);
      if (aiCfg.autoApply) {
        applyDiffList(diffs, true);
        setStatusEl("aiRunStatus", T(`Done ✓ (${AI_BRAND}) · Auto-updated ${diffs.length} parameter(s) + Presentation (17).`,`Concluído ✓ (${AI_BRAND}) · ${diffs.length} ajuste(s) + Apresentação (17) atualizados automaticamente.`), "ok");
      } else {
        setStatusEl("aiRunStatus", T(`Done ✓ (${AI_BRAND}) · ${diffs.length} parameter update(s) ready for Cockpit + Presentation.`,`Concluído ✓ (${AI_BRAND}) · ${diffs.length} ajuste(s) pronto(s) para Cockpit + Apresentação.`), "ok");
      }
      renderAiBriefingBanner();
      renderAiResults();
    } catch (err) {
      if (err.name === "AbortError") setStatusEl("aiRunStatus", T("Analysis cancelled.","Análise cancelada."), "info");
      else setStatusEl("aiRunStatus", T(`Error: ${err.message}`,`Erro: ${err.message}`), "err");
    } finally {
      aiAbort = null; $("aiRunBtn").disabled = false; $("aiAbortBtn").hidden = true;
    }
  };

  // ========== FLOATING LIVE ASSISTANT DRAWER (OFFLINE ENGINE + SHARED AI ANALYSIS ON KEY + JSON EXPORT) ==========
  const AIK = {
    spend:    {re:/gasto|spend|escopo|scope/, cap:[0,100], d:0, u:["%","%"]},
    active:   {re:/ativo|active|fornecedor|supplier/, cap:[0,50000], d:0, u:["",""]},
    util:     {re:/utiliza/, cap:[0,100], d:0, u:["%","%"]},
    days:     {re:/dia|day|tempo|time|primeiro desconto|first discount/, cap:[0,90], d:1, u:[" d"," d"]},
    err:      {re:/erro|error|acuracia|precis|accuracy/, cap:[0,100], d:1, u:["%","%"]},
    sow:      {re:/share of wallet|wallet|participa/, cap:[0,100], d:0, u:["%","%"]},
    rev:      {re:/receita|revenue|rentab|profit/, cap:[0,1e9], d:1, money:1},
    flags:    {re:/alerta|flag|risco|risk/, cap:[0,99], d:0, u:["",""]}
  };
  const kpiDef = k => KPIS.find(m => m.k === k);
  const kpiVal = (k, v) => AIK[k].money ? moneyD(v, 1) : nf(v, AIK[k].d) + L(AIK[k].u);
  const WK_LBL = n => WL() + n;
  const lc1 = t => t ? (t.charAt(0).toLowerCase() + t.slice(1)) : "";

  function kpiTrend(k, ahead) {
    const s = kpiDef(k).series, w = week, n = Math.min(4, w - 1), last = s[w - 1];
    const slope = n ? (last - s[w - 1 - n]) / n : 0, cap = AIK[k].cap;
    return {last, slope, n, proj: Math.min(cap[1], Math.max(cap[0], last + slope * ahead))};
  }
  function fcAt(target, sc) {
    const h = Math.max(1, Math.min(40, target - week)), v = projection(week, h, sc);
    const band = v.map((x, k) => x * D.err[week - 1] / 100 * Math.sqrt(k) / 2.2), lim = limitBRL;
    return {
      h, end: v[h], low: v[h] - band[h], high: v[h] + band[h], lim,
      kBase: v.findIndex(x => x > lim),
      kHigh: v.findIndex((x, k) => x + band[k] > lim),
      peakHigh: Math.max(...v.map((x, k) => x + band[k]))
    };
  }
  const scenIn = q => /otimista|upside|optimis/.test(q) ? "Upside" : /pessimista|downside|pessimis/.test(q) ? "Downside" : curScenario;
  function weekIn(q) {
    let m = q.match(/(?:\bem|\bin|daqui a|next|proximas?)\s+(\d{1,2})\s+(?:semanas?|weeks?)/);
    if (m) return week + (+m[1]);
    m = q.match(/(?:\bs|\bw|semana |week )(\d{1,2})\b/);
    if (m) return +m[1];
    return null;
  }
  const methodTag = s => `<small>${s}</small>`;
  const fabNote = () => `<small>${T("Market competitor split is illustrative prototype data.","A divisão de concorrentes é dado ilustrativo do protótipo.")}</small>`;

  function ansLimitLine(f) {
    if (f.kBase === 0) return T(`The balance is already above the ${money(f.lim)} limit.`, `O saldo já está acima do limite de ${money(f.lim)}.`);
    if (f.kBase > 0) return T(`The balance crosses the ${money(f.lim)} limit in <b>${WK_LBL(week + f.kBase)}</b>; request +${money(Math.ceil(f.peakHigh - f.lim))} before then.`, `O saldo passa do limite de ${money(f.lim)} na <b>${WK_LBL(week + f.kBase)}</b>; pedir +${money(Math.ceil(f.peakHigh - f.lim))} antes disso.`);
    if (f.kHigh > 0) return T(`The base case stays under ${money(f.lim)}, but the upper band crosses it in <b>${WK_LBL(week + f.kHigh)}</b>; pre-approve +${money(Math.ceil(f.peakHigh - f.lim))}.`, `O cenário fica abaixo de ${money(f.lim)}, mas o topo da faixa cruza na <b>${WK_LBL(week + f.kHigh)}</b>; pré-aprovar +${money(Math.ceil(f.peakHigh - f.lim))}.`);
    return T(`It stays under the ${money(f.lim)} limit through ${WK_LBL(week + f.h)} (upper band at ${nf(100 * f.peakHigh / f.lim, 0)}% of limit).`, `Permanece abaixo do limite de ${money(f.lim)} até a ${WK_LBL(week + f.h)} (topo da faixa em ${nf(100 * f.peakHigh / f.lim, 0)}% do limite).`);
  }
  function ansForecast(q) {
    const sc = scenIn(q), tgt = weekIn(q) || week + 8;
    if (tgt <= week) {
      const b = D.bal[Math.max(0, tgt - 1)];
      return T(`In ${WK_LBL(tgt)} the actual balance was <b>${money(b)}</b>.`, `Na ${WK_LBL(tgt)} o saldo realizado foi de <b>${money(b)}</b>.`);
    }
    const f = fcAt(tgt, sc);
    return T(
      `${scName(sc)} case: balance closes ${WK_LBL(week + f.h)} at <b>${money(f.end)}</b> (range ${money(f.low)}–${money(f.high)}). Today (${WK_LBL(week)}) it is ${money(D.bal[week - 1])}, or +${nf((f.end / D.bal[week - 1] - 1) * 100, 1)}%.`,
      `Cenário ${scName(sc).toLowerCase()}: saldo fecha a ${WK_LBL(week + f.h)} em <b>${money(f.end)}</b> (faixa ${money(f.low)}–${money(f.high)}). Hoje (${WK_LBL(week)}) está em ${money(D.bal[week - 1])}, alta de ${nf((f.end / D.bal[week - 1] - 1) * 100, 1)}%.`
    ) + " " + ansLimitLine(f) + methodTag(T(
      `Method: geometric mean of last ${Math.min(4, week - 1) || 1} weekly growth rates (${nf(growthAt(week) * 100, 2)}%), decaying 7%/wk.`,
      `Método: média geométrica das últimas ${Math.min(4, week - 1) || 1} semanas (${nf(growthAt(week) * 100, 2)}%/sem), com decaimento de 7%/sem.`
    ));
  }
  function ansLimit(q) {
    const sc = scenIn(q), f = fcAt(Math.max(weekIn(q) || 0, week + 26), sc);
    return T(`${scName(sc)} case (26-week lookahead): `, `Cenário ${scName(sc).toLowerCase()} (26 semanas à frente): `)
      + ansLimitLine(f) + " "
      + T(`Current balance: ${money(D.bal[week - 1])} (${nf(100 * D.bal[week - 1] / f.lim, 0)}% of limit).`, `Saldo hoje: ${money(D.bal[week - 1])} (${nf(100 * D.bal[week - 1] / f.lim, 0)}% do limite).`);
  }
  function ansKpi(k, q) {
    const m = kpiDef(k), tgt = weekIn(q), ahead = tgt && tgt > week ? tgt - week : 4, tr = kpiTrend(k, ahead), s = m.series;
    if (tgt && tgt <= week) return T(`${L(m.lbl)} in ${WK_LBL(tgt)}: <b>${kpiVal(k, s[Math.max(0, tgt - 1)])}</b>.`, `${L(m.lbl)} na ${WK_LBL(tgt)}: <b>${kpiVal(k, s[Math.max(0, tgt - 1)])}</b>.`);
    const d = tr.slope, dtxt = AIK[k].money ? moneyD(Math.abs(d), 2) : nf(Math.abs(d), 1);
    let out = T(`${L(m.lbl)}: <b>${kpiVal(k, tr.last)}</b> in ${WK_LBL(week)}. `, `${L(m.lbl)}: <b>${kpiVal(k, tr.last)}</b> na ${WK_LBL(week)}. `);
    out += !tr.n ? "" : d === 0 ? T("Flat over the last weeks. ", "Estável nas últimas semanas. ")
      : T(`${d > 0 ? "Rising" : "Falling"} ~${dtxt}/week. `, `${d > 0 ? "Subindo" : "Caindo"} ~${dtxt}/semana. `);
    out += T(`At this pace it reaches <b>${kpiVal(k, tr.proj)}</b> in ${WK_LBL(week + ahead)}.`, `Nesse ritmo chega a <b>${kpiVal(k, tr.proj)}</b> na ${WK_LBL(week + ahead)}.`);
    if (k === "active") {
      const left = BASE_SUP - tr.last;
      if (d > 0 && left > 0) out += T(` Reaching all ${BASE_SUP} suppliers takes ~${Math.ceil(left / d)} more weeks.`, ` Chegar aos ${BASE_SUP} fornecedores levaria ~${Math.ceil(left / d)} semanas.`);
    }
    if (k === "err") out += T(` Governance ceiling is 8.0%: currently ${tr.last <= 8 ? "inside" : "above"} tolerance.`, ` Teto de governança é 8,0%: hoje ${tr.last <= 8 ? "dentro" : "acima"} da meta.`);
    return out + methodTag(T(`Method: linear trend over last ${tr.n || 1} weeks.`, `Método: tendência linear das últimas ${tr.n || 1} semanas.`));
  }
  function ansWhatIf(q) {
    const m = q.match(/(\d+(?:[.,]\d+)?)\s*(?:pp|p\.p\.|pontos|points|%)?/), dv = m ? parseFloat(m[1].replace(",", ".")) : 5;
    const sign = /cair|caia|cai\b|reduz|diminu|fall|drop|decreas|lower|menos/.test(q) ? -1 : 1;
    const k = /gasto|spend/.test(q) ? "spend" : "util";
    const sp = D.spend[week - 1] + (k === "spend" ? sign * dv : 0);
    const ut = D.util[week - 1] + (k === "util" ? sign * dv : 0);
    const nb = SPEND * sp / 100 * ut / 100 * TENOR / 365, ob = D.bal[week - 1], lim = limitBRL, nm = L(kpiDef(k).lbl).toLowerCase();
    return T(
      `If ${nm} moved ${sign > 0 ? "up" : "down"} ${nf(dv, 1)} pp (to ${nf(k === "spend" ? sp : ut, 1)}%), balance would shift from ${money(ob)} to <b>${money(nb)}</b> (${nb >= ob ? "+" : "−"}${money(Math.abs(nb - ob))}), and spread revenue from ${moneyD(ob * 0.012)} to <b>${moneyD(nb * 0.012)}</b> (${nf(100 * nb / lim, 0)}% of ${money(lim)} limit${nb > lim ? ", above limit" : ""}).`,
      `Se ${k === "spend" ? "o " : "a "}${nm} ${sign > 0 ? "subisse" : "caísse"} ${nf(dv, 1)} pp (para ${nf(k === "spend" ? sp : ut, 1)}%), o saldo iria de ${money(ob)} para <b>${money(nb)}</b> (${nb >= ob ? "+" : "−"}${money(Math.abs(nb - ob))}), e a receita de spread de ${moneyD(ob * 0.012)} para <b>${moneyD(nb * 0.012)}</b> (${nf(100 * nb / lim, 0)}% do limite de ${money(lim)}${nb > lim ? ", acima do limite" : ""}).`
    ) + methodTag(T("Identity: balance = spend × %program × %util × 75d ÷ 365; spread = 1.2%.", "Identidade: saldo = compras × %prog × %util × 75d ÷ 365; spread = 1,2%."));
  }
  function ansFunnel() {
    const v = F[mode] || F.after, w = worstStep(v), g = LEV[w - 1], cv = Math.round(100 * v[w] / v[w - 1]);
    return T(
      `Weakest stage: <b>${L(STEPS[w - 1])} → ${L(STEPS[w])}</b> (${cv}% conversion, ${v[w - 1] - v[w]} lost). Likely cause: ${lc1(L(g.cause))} Levers: ${g.lv.map(x => lc1(L(x))).join("; ")}. Total first discounts: ${v[5]}/300 (${nf(100 * v[5] / 300, 0)}%).`,
      `Etapa mais fraca: <b>${L(STEPS[w - 1])} → ${L(STEPS[w])}</b> (${cv}% de conversão, ${v[w - 1] - v[w]} perdidos). Causa provável: ${lc1(L(g.cause))} Alavancas: ${g.lv.map(x => lc1(L(x))).join("; ")}. Total de primeiros descontos: ${v[5]}/300 (${nf(100 * v[5] / 300, 0)}%).`
    ) + (week >= 5 ? " " + T(`Document AI (live W5) lifted first discounts from ${F.before[5]} to ${F.after[5]}.`, `IA de documentos (desde S5) elevou primeiros descontos de ${F.before[5]} para ${F.after[5]}.`) : "");
  }
  function ansAnchor(i) {
    const a = ANCHORS[i], fl = flowOf(i), b = balOf(fl);
    const cd = COMP_DATA.find(x => x.id === a.id);
    const eh = EXT_HEALTH.find(x => x.id === a.id);
    const sig = EXT_SIGNALS.find(x => x.id === a.id);
    const bankFlows = FUNDERS.map(f => ({name: f.name, v: cd ? (cd[f.k] || 0) : 0})).sort((x, y) => y.v - x.v);
    const topF = bankFlows[0];
    return T(
      `<b>${a.name}</b> (${L(a.sector)}, 3Q26 annualized ${bn(a.rev, 1)}, rating ${eh ? eh.rating : "—"}): potential flow <b>${bn(fl)}/yr</b>, implied balance <b>${money(b)}</b>, spread revenue <b>${moneyD(revOf(b))}</b>. Largest funder in prototype matrix: ${topF.name} (${money(topF.v)}); white space: ${cd ? money(cd.gap) : "—"}. ${sig ? L(sig.title) : ""}`,
      `<b>${a.name}</b> (${L(a.sector)}, 3T26 anualizado ${bn(a.rev, 1)}, rating ${eh ? eh.rating : "—"}): fluxo potencial de <b>${bn(fl)}/ano</b>, saldo implícito de <b>${money(b)}</b> e receita de spread de <b>${moneyD(revOf(b))}</b>. Maior financiador na matriz ilustrativa: ${topF.name} (${money(topF.v)}); espaço livre: ${cd ? money(cd.gap) : "—"}. ${sig ? L(sig.title) : ""}`
    ) + fabNote();
  }
  function ansPipeline() {
    const t = totals(), ord = t.flows.map((f, i) => [f, i]).sort((a, b) => b[0] - a[0]);
    return T(
      `3Q26 pipeline ranked by annual flow: ${ord.map(([f, i], k) => `${k + 1}. ${ANCHORS[i].name} (${bn(f)})`).join(", ")}. Total: <b>${bn(t.flow)}</b> flow, <b>${money(t.bal)}</b> balance, <b>${moneyD(t.rev)}</b>/yr spread revenue. Priority #1: <b>${ANCHORS[ord[0][1]].name}</b>.`,
      `Pipeline 3T26 por fluxo anual: ${ord.map(([f, i], k) => `${k + 1}. ${ANCHORS[i].name} (${bn(f)})`).join(", ")}. Total: <b>${bn(t.flow)}</b> de fluxo, <b>${money(t.bal)}</b> de saldo e <b>${moneyD(t.rev)}</b>/ano de receita. Prioridade #1: <b>${ANCHORS[ord[0][1]].name}</b>.`
    ) + methodTag(T("Method: 3Q26 public revenue × %addressable × coverage × adoption × utilization.", "Método: receita pública 3T26 × %endereçável × cobertura × adesão × utilização."));
  }
  function ansMarket() {
    const sums = FUNDERS.map(f => ({name: f.name, tot: COMP_DATA.reduce((s, r) => s + (r[f.k] || 0), 0)})).sort((a, b) => b.tot - a.tot);
    const totalGap = COMP_DATA.reduce((s, r) => s + (r.gap || 0), 0);
    const best = MKT_STATE.bestWS;
    return T(
      `Prototype funding leaderboard across the 5 anchors: <b>${sums[0].name}</b> leads (${money(sums[0].tot)}), followed by ${sums[1].name} (${money(sums[1].tot)}) and ${sums[2].name} (${money(sums[2].tot)}). Unfunded white space totals <b>${money(totalGap)}</b>${best ? ` (largest opportunity: <b>${best.name}</b>)` : ""}. Current pricing benchmark: CDI + ${nf(mktSpread, 2)}%.`,
      `Ranking ilustrativo de financiadores nas 5 âncoras: <b>${sums[0].name}</b> lidera (${money(sums[0].tot)}), seguido por ${sums[1].name} (${money(sums[1].tot)}) e ${sums[2].name} (${money(sums[2].tot)}). Espaço não financiado soma <b>${money(totalGap)}</b>${best ? ` (maior oportunidade: <b>${best.name}</b>)` : ""}. Benchmark atual de preço: CDI + ${nf(mktSpread, 2)}%.`
    ) + fabNote();
  }
  function ansActions() {
    const a = ACTS.slice(0, 3);
    return T("This week's top actions: ", "Principais ações desta semana: ")
      + a.map((x, k) => `${k + 1}. <b>${esc(x.title)}</b> (${x.own.map(o => L(OWN[o])).join(" + ")})`).join("; ") + "."
      + T(` Total open items: ${ACTS.length}.`, ` Total de ações no plano: ${ACTS.length}.`);
  }
  function ansProducts(q) {
    const hit = PROD.filter(p => p.re.test(q));
    const one = p => `<b>${L(p.n)}</b>: ${L(p.d)} ${L(p.who)}.`;
    const src = `<small>${T("Source: Citi Brasil public product pages (summary).", "Fonte: páginas públicas de produto do Citi Brasil (resumo).")}</small>`;
    if (/\bdso\b|\bdpo\b|cartao virtual|\bvca\b|contas a pagar|accounts payable/.test(q)) {
      return PRAC.map(x => L(x[0])).join(" ") + `<small>${T("Source: Citi Commercial Bank article, March 2021 (global).", "Fonte: artigo Citi Commercial Bank, março de 2021 (global).")}</small>`;
    }
    if (/diferenca|difference|\bvs\b|versus|compar/.test(q) || hit.length > 1) {
      const set = hit.length > 1 ? hit : PROD.filter(p => ["rs","dd","cc"].includes(p.id));
      return T("The distinction lies in who contracts the facility and which receivables are assigned. ", "A diferença está em quem contrata o produto e em quais recebíveis ele cobre. ") + set.map(one).join("<br>") + src;
    }
    if (hit.length === 1) return one(hit[0]) + src;
    return T("Citi Brasil public pages list: ", "As páginas públicas do Citi Brasil listam: ") + PROD.map(p => `<b>${L(p.n)}</b> (${L(p.tag).toLowerCase()})`).join("; ") + "." + src;
  }
  function ansSummary() {
    const f = fcAt(week + 8, curScenario), ta = kpiTrend("active", 4), v = F[mode] || F.after, w = worstStep(v);
    return T(
      `<b>Week ${week} live reading.</b> Balance ${money(D.bal[week - 1])}, ${D.active[week - 1]} active suppliers, utilization ${D.util[week - 1]}%, forecast error ${nf(D.err[week - 1], 1)}%, ${D.flags[week - 1]} open risk flag${D.flags[week - 1] === 1 ? "" : "s"}.`,
      `<b>Leitura ao vivo da semana ${week}.</b> Saldo de ${money(D.bal[week - 1])}, ${D.active[week - 1]} fornecedores ativos, utilização de ${D.util[week - 1]}%, erro de projeção de ${nf(D.err[week - 1], 1)}%, ${D.flags[week - 1]} ${D.flags[week - 1] === 1 ? "alerta" : "alertas"} de risco em aberto.`
    ) + "<br><br>" + T("<b>Predictions.</b> ", "<b>Previsões.</b> ")
      + T(`Balance ${money(f.end)} in ${WK_LBL(week + 8)} (${money(f.low)}–${money(f.high)}). `, `Saldo de ${money(f.end)} na ${WK_LBL(week + 8)} (${money(f.low)}–${money(f.high)}). `)
      + ansLimitLine(fcAt(week + 26, curScenario))
      + T(` Active suppliers: ~${nf(ta.proj, 0)} in ${WK_LBL(week + 4)}.`, ` Fornecedores ativos: ~${nf(ta.proj, 0)} na ${WK_LBL(week + 4)}.`)
      + "<br><br>" + T(
        `<b>Where to act.</b> Weakest funnel stage: ${L(STEPS[w - 1])} → ${L(STEPS[w])}. Priority #1: ${ACTS[0] ? esc(ACTS[0].title) : "—"}.`,
        `<b>Onde agir.</b> Gargalo atual do funil: ${L(STEPS[w - 1])} → ${L(STEPS[w])}. Ação #1: ${ACTS[0] ? esc(ACTS[0].title) : "—"}.`
      );
  }

  function askLocal(raw) {
    const q = norm(raw);
    const anc = ANCHORS.findIndex(a => q.includes(norm(a.name).split(" ")[0]) || q.includes(a.id));
    const kHit = Object.keys(AIK).find(k => AIK[k].re.test(q));
    if (/\be se\b|what if|\bse a\b|\bse o\b|\bif the\b|\bcaso\b/.test(q) && /utiliza|gasto|spend/.test(q)) return ansWhatIf(q);
    if (/funil|funnel|gargalo|bottleneck|friccao|friction|alavanca|lever|desist|drop.?out|cadastro|onboarding|kyc/.test(q)) return ansFunnel();
    if (/fianca|guarantee|cessao de credito|credit assignment|\besg\b|desconto de titulos|descontos? de duplicatas?|regresso|recourse|\bdso\b|\bdpo\b|cartao virtual|\bvca\b|cedente|o que e (o )?risco sacado|what is (scf|supply chain finance|reverse factoring|risco sacado)|produtos? do citi|citi products?|diferenca entre|difference between/.test(q)) return ansProducts(q);
    if (anc >= 0) return ansAnchor(anc);
    if (/concorr|compet|mercado|market|itau|bradesco|santander|banco do brasil|btg|fidc|fintech|lidera|financiador|funder/.test(q)) return ansMarket();
    if (/pipeline|ancora|anchor|prioriz|crescer|grow|comite/.test(q)) return ansPipeline();
    if (/limite|limit|estour|breach|\bcabe\b|\bfits?\b|pre.?aprov/.test(q)) return ansLimit(q);
    if (/saldo|balance|carteira|\bbook\b/.test(q)) return ansForecast(q);
    if (/o que fazer|o que devo|should i do|what to do|acoes|\bacao\b|action|prioridade|next step|proximo passo|plano/.test(q)) return ansActions();
    if (kHit) return ansKpi(kHit, q);
    if (/previs|projec|forecast|predict|vai fechar|will close/.test(q)) return ansForecast(q);
    if (/resumo|summary|como esta|how is|visao geral|overview|status|leitura|semana|week/.test(q)) return ansSummary();
    return null;
  }

  function aiSuggest() {
    const v = F[mode] || F.after, w = worstStep(v), t = totals();
    const top = ANCHORS[t.flows.indexOf(Math.max(...t.flows))].name;
    return [
      T("When does the balance cross the limit?", "Quando o saldo passa do limite?"),
      T(`Balance forecast for ${WK_LBL(week + 8)}?`, `Qual o saldo previsto para a ${WK_LBL(week + 8)}?`),
      T("What if utilization rises 5 pp?", "E se a utilização subir 5 pp?"),
      T(`How to improve "${L(STEPS[w])}"?`, `Como reduzir a perda em "${L(STEPS[w])}"?`),
      T("Which 3Q26 anchor should we prioritize?", "Qual âncora 3T26 priorizar?"),
      T(`Tell me about ${top}`, `Fale sobre a ${top}`),
      T("Who leads among competitors?", "Quem lidera entre os concorrentes?"),
      T("Risco sacado vs. trade bill discounting?", "Diferença entre risco sacado e desconto de duplicatas?")
    ];
  }

  function aiContext() {
    const snap = buildDashboardSnapshot();
    return {
      ...snap,
      fx_bcb_ptax_nov19_2026: FX_RATE,
      open_finance_simulated: ofOn,
      funnel_levers: LEV.map((g, k) => ({
        stage: STEPS[k][0] + " -> " + STEPS[k + 1][0],
        likely_cause: g.cause[0],
        levers: g.lv.map(x => x[0]),
        owner: g.own[0]
      })),
      citi_public_product_reference: PROD.map(p => ({ name: p.n[1], tag: p.tag[0], summary: p.d[0], url: p.url }))
    };
  }

  let aiChatHist = [], aiChatBusy = false;
  async function askLiveChat(q) {
    const sys = "You are the live analyst assistant embedded in the Early Money · Risco Sacado Brasil weekly SCF Intel Center. "
      + "Answer strictly from the JSON context below in the language of the question (PT or EN), concise plain prose with bold key numbers, no markdown tables. "
      + "Display currency is " + ccy + " (BCB PTAX " + FX_RATE + "). Clearly distinguish illustrative prototype data from 3Q26 public anchor figures.\n\nCONTEXT:\n"
      + JSON.stringify(aiContext());
    aiChatHist.push({ role: "user", content: q });
    try {
      const resp = await callAiProvider({
        system: sys,
        messages: aiChatHist.slice(-10),
        maxTokens: 1800,
        structured: false,
        effort: null
      });
      const text = (resp.text || "").trim();
      aiChatHist.push({ role: "assistant", content: text });
      return esc(text).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/\n/g, "<br>");
    } catch (err) {
      aiChatHist.pop();
      throw err;
    }
  }

  function aiAdd(who, html, tag) {
    const d = document.createElement("div");
    d.className = "aim " + who;
    d.innerHTML = (tag ? `<span class="aitag">${tag}</span>` : "") + html;
    $("aiMsgs").appendChild(d);
    $("aiMsgs").scrollTop = $("aiMsgs").scrollHeight;
    return d;
  }
  const aiNoAns = () => T(
    "I could not match that directly. Try asking about the balance forecast, approved limit, any KPI trend, utilization what-if, funnel levers, 3Q26 anchors, competitors, or Citi products.",
    "Não encontrei isso diretamente. Pergunte sobre projeção de saldo, limite aprovado, tendência de qualquer KPI, simulação de utilização, alavancas do funil, âncoras 3T26, concorrentes ou produtos Citi."
  );

  async function aiAsk(raw) {
    const q = String(raw || "").trim();
    if (!q || aiChatBusy) return;
    aiAdd("me", esc(q));
    $("aiQ").value = "";
    const LOCAL = T("Cockpit engine (offline)", "Motor do cockpit (offline)");
    if (!cleanApiKey(aiCfg.apiKey)) {
      aiAdd("bot", askLocal(q) || aiNoAns(), LOCAL);
      return;
    }
    aiChatBusy = true;
    const wait = aiAdd("bot", `<i>${T("Analyzing live cockpit data…", "Analisando dados ao vivo…")}</i>`, AI_BRAND);
    try {
      wait.innerHTML = `<span class="aitag">${AI_BRAND}</span>` + await askLiveChat(q);
    } catch (err) {
      wait.innerHTML = `<span class="aitag">${LOCAL}</span><small>${T("Fallback to local engine", "Fallback para o motor local")} (${esc(err.message)}).</small><br>` + (askLocal(q) || aiNoAns());
    }
    aiChatBusy = false;
    $("aiMsgs").scrollTop = $("aiMsgs").scrollHeight;
  }

  function aiRefresh() {
    if (!$("aiPanel")) return;
    const hasKey = !!cleanApiKey(aiCfg.apiKey);
    $("aiFabTxt").textContent = T("Ask the Cockpit", "Pergunte ao Cockpit");
    $("aiTitle").textContent = T("Live Cockpit Assistant", "Assistente do Cockpit");
    $("aiQ").placeholder = T("Ask about limits, 3Q26 anchors, what-if…", "Pergunte sobre limites, âncoras 3T26, simulações…");
    $("aiSend").textContent = T("Send", "Enviar");
    $("aiMode").textContent = hasKey ? AI_BRAND : T("Offline engine ready", "Motor offline pronto");
    $("aiMode").className = "aimode" + (hasKey ? " on" : "");
    $("aiChips").innerHTML = aiSuggest().map(s => `<button type="button">${esc(s)}</button>`).join("");
    $("aiChips").querySelectorAll("button").forEach(b => { b.onclick = () => aiAsk(b.textContent); });
    $("aiSetBtn").title = T("AI connection & JSON export", "Conexão de IA e exportação JSON");
    $("aiSetTxt").innerHTML = hasKey
      ? T(`<b>AI Analysis ON active (${providerLabel()}).</b> Your persistent API key from Settings powers both this chat and the Parameter Optimizer (with automatic offline fallback).`, `<b>AI Analysis ON ativo (${providerLabel()}).</b> Sua chave persistente das Configurações alimenta este chat e o Otimizador de Parâmetros (com fallback offline automático).`)
      : T("<b>Works 100% offline.</b> By default the assistant calculates instant answers locally without sending data externally. Save any OpenAI or Anthropic key in Settings to activate <b>AI Analysis ON</b>.", "<b>Funciona 100% offline.</b> Por padrão o assistente calcula respostas instantâneas localmente sem enviar dados para fora. Salve qualquer chave OpenAI ou Anthropic em Configurações para ativar o <b>AI Analysis ON</b>.");
    $("aiDrawerOpenSet").textContent = hasKey ? T("⚙ Manage API key", "⚙ Gerenciar chave") : T("⚙ Add OpenAI / Anthropic key", "⚙ Inserir chave OpenAI / Anthropic");
    $("aiDrawerOpenOpt").textContent = T("✦ Parameter Optimizer", "✦ Otimizar Parâmetros");
    $("aiCtxLbl").textContent = T("AI-ready snapshot: export the entire live cockpit state as a single JSON document.", "Snapshot pronto para IA: exporte todo o estado ao vivo do cockpit em um único JSON.");
    $("aiCopy").textContent = T("Copy JSON", "Copiar JSON");
    $("aiDown").textContent = T("Download JSON", "Baixar JSON");
  }

  function aiOpen() {
    $("aiPanel").hidden = false;
    $("aiFab").hidden = true;
    aiRefresh();
    if (!$("aiMsgs").children.length) aiAdd("bot", ansSummary(), T("Live summary", "Resumo ao vivo"));
    setTimeout(() => $("aiQ").focus(), 40);
  }

  if ($("aiFab")) $("aiFab").onclick = aiOpen;
  if ($("aiClose")) $("aiClose").onclick = () => { $("aiPanel").hidden = true; $("aiFab").hidden = false; $("aiFab").focus(); };
  if ($("aiForm")) $("aiForm").onsubmit = e => { e.preventDefault(); aiAsk($("aiQ").value); };
  if ($("aiSetBtn")) $("aiSetBtn").onclick = () => { $("aiSet").hidden = !$("aiSet").hidden; };
  if ($("aiDrawerOpenSet")) $("aiDrawerOpenSet").onclick = () => { $("aiSet").hidden = true; loadSettingsForm(); openSimpleModal("m-settings"); };
  if ($("aiDrawerOpenOpt")) $("aiDrawerOpenOpt").onclick = () => { $("aiSet").hidden = true; syncAiStatusUi(); openSimpleModal("m-ai"); };
  if ($("aiCopy")) $("aiCopy").onclick = async () => {
    const t = JSON.stringify(aiContext(), null, 2);
    try { await navigator.clipboard.writeText(t); $("aiCtxMsg").textContent = T("Copied.", "Copiado."); }
    catch (e) { $("aiCtxMsg").textContent = T("Use Download JSON.", "Use Baixar JSON."); }
  };
  if ($("aiDown")) $("aiDown").onclick = () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(aiContext(), null, 2)], { type: "application/json" }));
    a.download = "scf_cockpit_ai_context.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 500);
  };

