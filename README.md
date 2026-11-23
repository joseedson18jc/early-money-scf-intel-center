# Early Money · Intel Center semanal especialista de SCF

> **Aviso:** Uso funcional comprovado porém esta versão é somente por ora, ilustrativa e pertence a J.E.M.Costa.

**Live GitHub Pages:** https://joseedson18jc.github.io/early-money-scf-intel-center/

An interactive, bilingual (**PT-BR / EN**), dual-currency (**BRL / USD**, BCB PTAX 19/11/2026 = `R$ 5,8889`), Light/Dark-mode Supply Chain Finance (**Early Money / Risco Sacado**) executive Intel Center and 17-slide presentation deck — architected as clean GitHub modules that compile with zero external npm dependencies into a single portable HTML file (`index.html` / `dist/risco-sacado-cockpit.html`).

## Key Capabilities

- **4-Step Guided Decision Workflow (+ Full Cockpit Toggle)**
  1. **Step 1 — Diagnose & Onboarding:** Auto-generated Monday Action Plan (persistent checkboxes), 8 KPI tiles, Weekly Briefing & Risk Alerts, Wallet Share, Document-AI Onboarding Funnel, **5-Stage Levers by Stage Board**, Propensity Score, and Friction Reduction — **all 14 core cards are clickable** and open a live mathematical audit proof (`#proofModal`).
  2. **Step 2 — Forecast & Approved Limits:** Dynamic balance projection (`Downside / Base / Upside`, `4 / 8 / 13 weeks`), editable **Approved Limit** line with live Headroom/Watch/Breach checks, hover tooltips, and 1-week rolling out-of-sample backtest.
  3. **Step 3 — Anchor Pipeline (3Q26 / Nov 2026):** Live editable sizing hypotheses (`Addressable %`, `Coverage %`, `Adoption %`, `Utilization %`, `Tenor`, `Spread`) and presets across 5 corporate anchors (**JBS**, **Marfrig/MBRF**, **Votorantim**, **Embraer**, **Natura**) with updated 3Q26 public revenues and custom ID-free vector emblems.
  4. **Step 4 — Market, Competition & Product Reference:** 4 interactive intelligence modules — **4.1** Competitor Matrix (IAS 7 / CVM FIDCs), **4.2** Comparative Pricing (`CDI + x` simulator + RM lost-deal feedback), **4.3** Real Share (B3 · CERC · Núclea synced to Step 3), **4.4** External Signals & Routed Alerts — plus **Citi Public Product Reference** (5 neighbouring products & 4 practices) and **Open Finance** consent demo.
- **Live Reactive Insights & Guided On-Screen Tips**
  - **Live Insights Strip** recalculates instantly as you edit any week, limit, scenario, anchor hypothesis, spread, or CSV file.
  - **Contextual Guidance Tips** (toggleable `💡 Dicas`) + **5-Stop Interactive Walkthrough Tour** (`? Guia`).
- **Dual-Mode `AI Analysis ON` Engine**
  - **Floating Live Assistant (`✦ Ask AI / Pergunte`)**: Works **100% offline** via a deterministic calculation engine (limit breach week, KPI trend extrapolation, utilization/spend what-if simulations, funnel bottleneck, anchor lookup, product comparisons) + **Copy/Download AI-Ready JSON Context**.
  - **Universal OpenAI & Anthropic API Integration (`⚙` Settings + `✦ AI Analysis ON`)**: Auto-detects **any OpenAI key** (`sk-`, `sk-proj-`, `sk-svcacct-`, `sk-admin-`, or OpenAI-compatible gateways) **or Anthropic key** (`sk-ant-`), persisted only in browser `localStorage`. Supports Structured Outputs, automatic `HTTP 400` parameter fallbacks, live `HTTP 404` `/v1/models` account discovery, visual **Before → After Parameter Diff**, live **Update Cockpit & 17-Slide Presentation**, and 1-click **Undo**.
- **In-Browser CSV Data Loader & Printable 1-Page Executive Briefing**
  - Locale-safe CSV parser (`;` or `,`, mixed decimal separators), configurable in-scope spend & supplier base, and print-ready Monday briefing (`@media print`).

## Repository Structure

```text
├── index.html                        # Built bundle (ready for GitHub Pages or direct double-click)
├── dist/risco-sacado-cockpit.html    # Portable standalone HTML release
├── scripts/build.mjs                 # Zero-dependency Node bundler
├── tests/verify.mjs                  # Static & logic verification suite
├── COMPARISON.md                     # Detailed feature comparison (Master vs. v11)
└── src/
    ├── template.html                 # Semantic HTML shell
    ├── styles/
    │   ├── 01-tokens.css             # Theme tokens & base styles
    │   ├── 02-layout.css             # Header, hero art, journey bar, live insights & guided tips
    │   ├── 03-steps.css              # Steps 1–4, 5-stage levers board, product reference
    │   ├── 04-modals-ai.css          # Modals, AI Analysis ON, Open Finance, Floating Chat & Tour
    │   ├── 05-deck.css               # 17-slide interactive presentation
    │   └── 06-themes-print.css       # Dark mode, responsive breakpoints & print layout
    ├── data/
    │   ├── 01-brand-svgs.js          # ID-free custom anchor & infrastructure vector logos
    │   ├── 02-i18n.js                # Complete PT-BR / EN dictionary & BRL/USD PTAX formatters
    │   ├── 03-program-data.js        # Pilot series, KPIs, funnel, 5-stage levers & alerts
    │   └── 04-anchors-market.js      # 3Q26 anchor financials, 17 verified URLs, market & products
    └── modules/
        ├── 01-state-nav.js           # Step navigation, scroll progress, clock & theme/ccy/lang
        ├── 02-step1-diagnose.js      # KPIs, briefing, rings, funnel, levers, propensity & 14 proofs
        ├── 03-step2-forecast.js      # Forecast chart, approved limit check, hover tooltips & backtest
        ├── 04-step3-pipeline.js      # Editable anchor sizing table, presets & reactive cascade
        ├── 05-step4-market.js        # Market modules 4.1–4.4, Product Reference & Open Finance demo
        ├── 06-actions-csv-brief.js   # Action Plan, CSV Data Loader & Printable Briefing
        ├── 07-live-insights-tips.js  # Live Insights Strip, Contextual Tips & 5-Stop Guided Tour
        ├── 08-ai-engine.js           # AI Analysis ON (Anthropic API + Parameter Diff + Floating Chat)
        └── 09-presentation-deck.js   # 17-slide interactive presentation deck & boot sequence
```

## Quick Start

```bash
# 1. Build index.html and dist/risco-sacado-cockpit.html from src/
npm run build

# 2. Run automated syntax, I18N, CSV, and compliance checks
npm run verify

# 3. Open locally (double-click index.html or serve via any static server)
open index.html
```

## Guardrails & Attribution

- Concept and authorship by **José Edson Matos da Costa**.
- All operational program figures, market share splits, and competitor matrix numbers are **illustrative** and do not represent confidential bank or client data (aligned with **LC 105/2001** and **LGPD**).
- No official Citi logo or third-party bank Wikimedia trademarks are used anywhere in the codebase.
