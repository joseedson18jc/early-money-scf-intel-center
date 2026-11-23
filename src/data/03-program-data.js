  // ========== PILOT DATA + CONFIGURABLE PARAMETERS ==========
  let W = 12, SPEND = 6000, BASE_SUP = 300;
  const TENOR = 75;
  const D = {
    spend:   [52,53,54,55,56,57,57,58,59,59,60,60],
    active:  [40,44,51,60,72,85,97,110,121,133,142,150],
    util:    [58,59,60,61,62,64,65,66,67,68,69,70],
    days:    [21,21,20,19,16,14,13,12,11,10,9,9],
    err:     [9.8,9.1,8.4,7.9,7.0,6.1,5.5,4.9,4.2,3.8,3.4,3.1],
    sow:     [34,35,36,37,39,40,42,43,45,46,47,48],
    flags:   [5,4,6,3,3,2,2,3,1,2,1,1],
    supShare:[28,28,29,30,31,32,33,34,35,35,36,37],
  };
  let rev = [];
  const DEMO = JSON.parse(JSON.stringify(D));
  function recomputeBook() {
    const tenor = (typeof G !== "undefined" ? G.tenor : TENOR);
    const spPct = (typeof G !== "undefined" ? G.spread : 1.2) / 100;
    D.bal = D.spend.map((s, i) => +(SPEND * s / 100 * D.util[i] / 100 * tenor / 365).toFixed(1));
    rev = D.bal.map(b => +(b * spPct).toFixed(1));
    KPIS.forEach(m => { m.series = m.k === "rev" ? rev : D[m.k]; });
  }

  const KPIS = [
    {k:"spend",  lbl:["Spend under program","Gasto sob o programa"], q:["Are we capturing the anchor's flows?","Estamos capturando os fluxos da âncora?"], d:0, u:["%","%"], good:1},
    {k:"active", lbl:["Active suppliers","Fornecedores ativos"],     q:["Is adoption growing?","A adesão está crescendo?"], d:0, u:() => `/ ${BASE_SUP}`, good:1, hl:true},
    {k:"util",   lbl:["Utilization","Utilização"],                   q:["Do suppliers actually use it?","Os fornecedores usam de fato?"], d:0, u:["%","%"], good:1},
    {k:"days",   lbl:["Days to first discount","Dias até o 1º desconto"], q:["Is onboarding fast enough?","O cadastro é rápido o suficiente?"], d:0, u:["days","dias"], good:-1},
    {k:"rev",    lbl:["Spread revenue","Receita de spread"],         q:["Is the book growing profitably?","A carteira cresce com rentabilidade?"], d:1, u:["m / yr","mi / ano"], good:1},
    {k:"err",    lbl:["Forecast error","Erro de projeção"],          q:["Are we predictable?","Somos previsíveis?"], d:1, u:["%","%"], good:-1},
    {k:"sow",    lbl:["Share of wallet","Share of wallet"],          q:["Are we winning share?","Estamos ganhando participação?"], d:0, u:["%","%"], good:1},
    {k:"flags",  lbl:["Risk flags","Alertas de risco"],              q:["Is growth safe?","O crescimento é seguro?"], d:0, u:["open","em aberto"], good:-1},
  ];
  const unitOf = m => typeof m.u === "function" ? m.u() : L(m.u);

  // Cancellable animation tweener (eliminates race conditions!)
  const ease = t => 1 - Math.pow(1 - t, 3);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const rafMap = new Map();
  function tween(key, from, to, ms, cb) {
    if (rafMap.has(key)) cancelAnimationFrame(rafMap.get(key));
    if (reduce || Math.abs(to - from) < 0.001) { cb(to); return; }
    const t0 = performance.now();
    const tick = now => {
      const p = Math.min(1, (now - t0) / ms);
      cb(from + (to - from) * ease(p));
      if (p < 1) rafMap.set(key, requestAnimationFrame(tick));
      else rafMap.delete(key);
    };
    rafMap.set(key, requestAnimationFrame(tick));
  }
  const NS = "http://www.w3.org/2000/svg";
  const el = (tag, attrs = {}, parent) => { const e = document.createElementNS(NS, tag); for (const a in attrs) e.setAttribute(a, attrs[a]); if (parent) parent.appendChild(e); return e; };


  const ALERTS = [
    [3, () => C.red,   ["<b>Duplicate invoice</b> submitted twice by a supplier: blocked for review","<b>Duplicata repetida</b> enviada duas vezes por um fornecedor: bloqueada para análise"]],
    [1, () => C.red,   ["<b>Concentration:</b> top 10 suppliers hold 46% of the balance","<b>Concentração:</b> os 10 maiores fornecedores detêm 46% do saldo"]],
    [5, () => C.amber, ["<b>KYC gap:</b> 4 suppliers with expired documents","<b>Pendência de KYC:</b> 4 fornecedores com documentos vencidos"]],
    [8, () => C.amber, ["<b>Utilization drop</b> at one supplier (−30% vs 4-week average)","<b>Queda de utilização</b> em um fornecedor (−30% vs média de 4 semanas)"]],
    [10,() => C.green, ["<b>Seasonality ahead:</b> harvest peak expected in 5 weeks; pre-approve limits","<b>Sazonalidade à frente:</b> pico da safra previsto em 5 semanas; pré-aprovar limites"]],
  ];

  const SECT = [[["Agribusiness","Agronegócio"],31,52],[["Retail","Varejo"],22,38],[["Automotive","Automotivo"],27,41],[["Pharma","Farmacêutico"],18,30],[["Construction","Construção"],12,21]];

  const STEPS = [["Invited","Convidados"],["Opened e-mail","Abriram o e-mail"],["Started KYC","Iniciaram o KYC"],["Uploaded documents","Enviaram documentos"],["Approved","Aprovados"],["First discount","Primeiro desconto"]];
  const F = {before:[300,210,150,85,62,40], after:[300,210,150,124,102,66]};

  const LEV = [
    {cause:["Generic invitation, sent by the bank to the wrong contact.","Convite genérico, enviado pelo banco ao contato errado."],
     own:["Relationship manager + anchor procurement","Gerente de relacionamento + compras da âncora"],
     lv:[["Invitation signed by the anchor's procurement team","Convite assinado pela área de compras da âncora"],["Message with the supplier's own gain in reais","Mensagem com o ganho em reais daquele fornecedor"],["WhatsApp and phone for small suppliers, sent to the finance contact","WhatsApp e telefone para os pequenos, no contato do financeiro"]]},
    {cause:["The supplier sees no clear advantage, or fears paperwork and a new bank account.","O fornecedor não vê vantagem clara, ou teme burocracia e abertura de conta."],
     own:["SCF specialist + relationship manager","Especialista SCF + gerente de relacionamento"],
     lv:[["Rate and net-amount simulator inside the invitation","Simulador de taxa e valor líquido já no convite"],["No new account: payment into the supplier's current bank","Sem abrir conta: crédito no banco que o fornecedor já usa"],["Plain explanation of accounting effects (no recourse)","Efeito contábil explicado de forma simples (sem coobrigação)"]]},
    {cause:["Too many documents, typed and uploaded by hand.","Documentos demais, digitados e enviados à mão."],
     own:["Onboarding operations","Operações de cadastro"],
     lv:[["Document AI: automatic reading and checking","IA de documentos: leitura e conferência automáticas","ai"],["Reuse the registration data the anchor already holds","Reaproveitar o cadastro que a âncora já tem do fornecedor"],["Risk-based KYC and e-signature","KYC proporcional ao risco e assinatura eletrônica"]]},
    {cause:["Credit and compliance queue; pending items go back and forth.","Fila de crédito e compliance; pendências em idas e vindas."],
     own:["Credit and risk + compliance","Crédito e risco + compliance"],
     lv:[["Agreed response time, with a tracked queue","Prazo de resposta combinado, com fila acompanhada"],["Batch pre-approval of low-risk suppliers","Pré-aprovação em lote dos fornecedores de baixo risco"],["Single point of contact for pending items","Ponto único de contato para pendências"]]},
    {cause:["The anchor is slow to confirm invoices, and the supplier must request each advance.","A âncora demora a confirmar duplicatas, e o fornecedor precisa pedir cada antecipação."],
     own:["Relationship manager + anchor accounts payable","Gerente de relacionamento + contas a pagar da âncora"],
     lv:[["Target time for the anchor to confirm invoices","Meta de prazo para a âncora confirmar duplicatas"],["Automatic early payment by rule","Antecipação automática por regra"],["Hands-on support for the first transaction","Acompanhamento da primeira operação"]]}
  ];

  const DEC = [38,29,22,16,12,9,7,5,3,2];
