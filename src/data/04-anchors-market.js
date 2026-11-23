  // ========== ANCHOR PIPELINE (STEP 3 — UPDATED TO 3T26 / NOV 2026) ==========
  const SRC = {
    linea:["https://www.bloomberglinea.com.br/2025/07/08/empresas-brasileiras-estao-mais-globais-e-isso-demanda-mais-servicos-diz-citi/","Bloomberg Línea, 08/07/2025"],
    citiProd:["https://corporateportal.brazil.citibank.com/produtos-servicos/credito-financiamento/antecipacao-fornecedor-risco-sacado/","Citi Brasil · Risco Sacado"],
    citiPdf:["https://www.citigroup.com/rcs/citigpa/storage/public/icpublic/taking-a-holistic-view-of-supplier-payments.pdf","Citi · Holistic View of Supplier Payments"],
    jbs:["https://ir.jbsglobal.com/","JBS IR · 3T26 (09/nov/2026)"],
    mbrf:["https://ri.mbrf.com/","MBRF RI · 3T26 (12/nov/2026)"],
    vot:["https://www.votorantim.com.br/","Votorantim / V. Cimentos · 3T26 (nov/2026)"],
    emb:["https://embraer.com/media-center/pt/?mediatype=NEWS&detail=33864","Embraer · 3T26 (10/nov/2026)"],
    embEst:["https://www.estadao.com.br/einvestidor/cenarios-e-mercado/embraer-tem-queda-no-lucro-mas-receita-recorde-de-r-121-bilhoes-e-projecoes-surpreendem-no-3t26/","Estadão E-Investidor · Embraer 3T26"],
    nat:["https://ri.natura.com.br/","Natura RI · 3T26 (nov/2026)"],
    merger:["https://www.infomoney.com.br/mercados/novas-acoes-da-mbrf-fusao-entre-marfrig-e-brf-estreiam-na-b3-relembre-fusao/amp/","InfoMoney · fusão MBRF"],
    copom:["https://www.bcb.gov.br/content/copom/atascopom/Copom282-not20261104282.pdf","BCB · Ata Copom 282 (nov/2026)"],
    selic:["https://atlaspublico.com.br/bcb/noticias/copom-mantem-selic-em-13-75pct-ao-ano-por-unanimidade-e-ve-99107","Copom mantém Selic em 13,75%"],
    b3:["https://content.b3.com.br/wp-content/uploads/2025/12/B3-Ebook_Duplicatas_VF.pdf","B3 · e-book Duplicatas"],
    dup:["https://catracalivre.com.br/economize/duplicata-escritural-avanca-no-brasil-veja-o-que-muda-para-as-empresas-e-como-se-preparar/","Cronograma duplicata escritural"],
    dupAuth:["https://www.dgabc.com.br/noticia/4332379/cronograma-do-bc-para-duplicatas-escriturais-preve-implementacao-escalonada-ate-junho-de-2028","DGABC · B3, CERC e Núclea"],
    fidc:["https://neofeed.com.br/negocios/depois-da-crise-da-americanas-o-risco-sacado-tem-um-novo-dono-os-fidcs/","NeoFeed · risco sacado em FIDCs"],
    ref:["https://www.bcb.gov.br/content/publicacoes/ref/202304/RELESTAB202304-refPub.pdf","BCB · REF mai/2023"],
  };
  const src = k => `<a href="${SRC[k][0]}" target="_blank" rel="noopener">${SRC[k][1]}</a>`;
  const SELIC = 13.75;

  const ANCHORS = [
    {id:"jbs", name:"JBS", color:"#C8102E", src:"jbs", q3:116.8, rev:467.2,
      q3Note:["3Q26: R$116.8bn (US$22.7bn, +0.6% YoY USD · −5.1% BRL); leverage 3.54× (USD)","3T26: R$ 116,8 bi (US$ 22,7 bi, +0,6% a/a USD · −5,1% BRL); alavancagem 3,54× (USD)"],
      revNote:["3Q26 R$116.8bn (US$22.7bn) → R$467.2bn annualized","3T26 R$ 116,8 bi (US$ 22,7 bi) → R$ 467,2 bi anualizado"],
      addr:2.0, sector:["Protein & food","Proteína e alimentos"],
      look:["Packaging, ingredients, maintenance and industrial services in Brazil.","Embalagens, ingredientes, manutenção e serviços industriais no Brasil."],
      check:["Which group buying entities would join, eligible payables and accepted categories. Monitor 3Q26 leverage (3.54× USD).","Quais compradoras do grupo participariam, contas a pagar elegível e categorias aceitas. Monitorar alavancagem do 3T26 (3,54× USD)."]},
    {id:"mbrf", name:"Marfrig (MBRF)", color:"#006B3F", src:"mbrf", q3:41.424, rev:165.7,
      q3Note:["3Q26: R$41.424bn (−0.8% YoY, +1.7% QoQ); net income R$210m (+123.5%); leverage 3.45×","3T26: R$ 41,424 bi (−0,8% a/a, +1,7% t/t); lucro R$ 210 mi (+123,5%); alavancagem 3,45×"],
      revNote:["3Q26 R$41.424bn → R$165.7bn annualized (post-merger)","3T26 R$ 41,424 bi → R$ 165,7 bi anualizado (pós-fusão)"],
      addr:3.5, sector:["Multi-protein food","Alimentos multiproteína"],
      look:["Recurring suppliers of industrial inputs, packaging and services across combined MBRF entities.","Fornecedores recorrentes de insumos industriais, embalagens e serviços na base combinada MBRF."],
      check:["Post-merger Marfrig + BRF perimeter (net debt R$45.7bn, 3.45× in 3Q26): unify payables and avoid double counting.","Perímetro pós-fusão Marfrig + BRF (dívida líq. R$ 45,7 bi, 3,45× no 3T26): unificar contas a pagar e evitar contagem dupla."]},
    {id:"vot", name:"Votorantim", color:"#0033A0", src:"vot", q3:16.3, rev:65.2,
      q3Note:["3Q26: R$16.3bn holding economic (+3% YoY; net cash R$8.4bn) · V. Cimentos R$8.5bn (Brazil R$4.2bn, 1.71×)","3T26: R$ 16,3 bi econômica holding (+3% a/a; caixa líq. R$ 8,4 bi) · V. Cimentos R$ 8,5 bi (Brasil R$ 4,2 bi, 1,71×)"],
      revNote:["3Q26 R$16.3bn holding economic (V. Cimentos R$8.5bn) → R$65.2bn annualized","3T26 R$ 16,3 bi econômica holding (V. Cimentos R$ 8,5 bi) → R$ 65,2 bi anualizado"],
      addr:9.0, sector:["Industrial holding","Holding industrial"],
      look:["Map opportunity by operating company (V. Cimentos, metals, energy), not as one group-level anchor.","Mapear oportunidade por empresa operacional (V. Cimentos, metais, energia), não como âncora única."],
      check:["Which CNPJ buys, which entity holds the Citi relationship and limit, and which units can join.","Qual CNPJ compra, qual entidade tem relacionamento e limite com o Citi e quais unidades podem aderir."]},
    {id:"emb", name:"Embraer", color:"#056DAE", src:"emb", q3:12.067, rev:43.7,
      q3Note:["3Q26 record: R$12.067bn (US$2.347bn, +17% YoY USD, 10 Nov 2026); 2026 guidance raised to US$8.4–8.6bn","Recorde 3T26: R$ 12,067 bi (US$ 2,347 bi, +17% a/a USD, 10/nov/2026); guidance 2026 elevado p/ US$ 8,4–8,6 bi"],
      revNote:["3Q26 record R$12.067bn (US$2.347bn) · 2026 guidance US$8.4–8.6bn (≈ R$43.7bn)","Recorde 3T26 R$ 12,067 bi (US$ 2,347 bi) · guidance 2026 US$ 8,4–8,6 bi (≈ R$ 43,7 bi)"],
      addr:8.0, sector:["Aerospace","Aeroespacial"],
      look:["Industrial suppliers, components, engineering and services — domestic receivables separated from exports.","Fornecedores industriais, componentes, engenharia e serviços — separando recebíveis domésticos dos internacionais."],
      check:["Which invoices are already approved and free of acceptance conditions; Q4 delivery ramp drives seasonal peak.","Quais títulos já estão aprovados e livres de condições de aceite; pico de entregas no 4T eleva sazonalidade."]},
    {id:"nat", name:"Natura", color:"#F47920", src:"nat", q3:5.038, rev:20.2,
      q3Note:["3Q26: R$5.038bn (−3.0% YoY; Brazil R$2.920bn, −9%); net income R$49m; leverage 1.83× w/ FIDC inflow","3T26: R$ 5,038 bi (−3,0% a/a; Brasil R$ 2,920 bi, −9%); lucro R$ 49 mi; alavancagem 1,83× com entrada de FIDC"],
      revNote:["3Q26 R$5.038bn (Brazil R$2.920bn) → R$20.2bn annualized","3T26 R$ 5,038 bi (Brasil R$ 2,920 bi) → R$ 20,2 bi anualizado"],
      addr:12.0, sector:["Beauty & personal care","Beleza e cuidados pessoais"],
      look:["Packaging, ingredients, contract manufacturing and recurring B2B services.","Embalagens, ingredientes, fabricação terceirizada e serviços B2B recorrentes."],
      check:["Eligible B2B purchase volume (not consultants or retail); watch Brazil supply availability & active FIDC usage.","Volume de compras B2B elegível (sem confundir com consultoras ou varejo); acompanhar abastecimento Brasil e uso de FIDC."]},
  ];
  const ACOL = ANCHORS.map(a => a.color);
  const DEF = {cov:50, adh:40, util:60, tenor:TENOR, spread:1.2};
  const G = {tenor:DEF.tenor, spread:DEF.spread};
  const P = ANCHORS.map(a => ({addr:a.addr, cov:DEF.cov, adh:DEF.adh, util:DEF.util}));
  const eligOf = i => ANCHORS[i].rev * P[i].addr / 100;
  const flowOf = (i, o = {}) => { const p = {...P[i], ...o}; return ANCHORS[i].rev * p.addr/100 * p.cov/100 * p.adh/100 * p.util/100; };
  const balOf  = (f, tenor = G.tenor) => f * 1000 * tenor / 365;
  const revOf  = b => b * G.spread / 100;
  const totals = () => {
    const flows = ANCHORS.map((_, i) => flowOf(i));
    const flow = flows.reduce((s, f) => s + f, 0);
    return {flows, flow, elig:ANCHORS.reduce((s, _, i) => s + eligOf(i), 0), bal:balOf(flow), rev:revOf(balOf(flow))};
  };

  // ========== STEP 4: MARKET & COMPETITION (ALL 4 INTERACTIVE MODULES) ==========
  const FUNDERS = [
    {k:"itau", name:"Itaú BBA",        abbr:"IB",  col:"#EC7000", type:"bank"},
    {k:"brad", name:"Bradesco BBI",    abbr:"BR",  col:"#CC092F", type:"bank"},
    {k:"sant", name:"Santander",       abbr:"ST",  col:"#DC0000", type:"bank"},
    {k:"btg",  name:"BTG Pactual",     abbr:"BTG", col:"#001E62", type:"bank"},
    {k:"bb",   name:"Banco do Brasil", abbr:"BB",  col:"#003882", type:"bank"},
    {k:"fidc", name:"FIDCs (CVM)",     abbr:"FD",  col:"#0E8A5F", type:"fidc"},
    {k:"citi", name:"Citi",            abbr:"CT",  col:"#056DAE", type:"citi"}
  ];
  const COMP_DATA = [
    {id:"jbs", itau:420, brad:310, sant:260, btg:180, bb:290, fidc:240, citi:110, gap:360,
      iasTerms:["90–120d financed vs. 45–60d standard payables (IAS 7 Note · illustrative).","90–120d no risco sacado vs. 45–60d padrão (Nota IAS 7 · ilustrativo)."],
      cvmNote:["3 multi-originator FIDCs active in CVM filings; senior quotas priced around CDI + 1.45%.","3 FIDCs multicedentes ativos na CVM; cotas sênior perto de CDI + 1,45%."],
      play:["Target Brazil packaging & MRO entities where FIDC pricing is wider than bank balance sheet.","Atacar compradoras Brasil de embalagens e MRO onde o FIDC está mais caro que balanço bancário."]},
    {id:"mbrf", itau:280, brad:220, sant:190, btg:140, bb:210, fidc:195, citi:65, gap:250,
      iasTerms:["85–110d financed vs. 45–55d standard; post-merger Marfrig + BRF perimeter under unification.","85–110d no programa vs. 45–55d padrão; perímetro Marfrig + BRF em unificação."],
      cvmNote:["Legacy BRF & Marfrig FIDC pools overlap on packaging suppliers — consolidation window.","FIDCs legados de BRF e Marfrig se sobrepõem em embalagens — janela de consolidação."],
      play:["Propose unified post-merger onboarding with Document AI to win consolidated CNPJs.","Propor onboarding unificado pós-fusão com IA de documentos para capturar CNPJs consolidados."]},
    {id:"vot", itau:240, brad:195, sant:150, btg:110, bb:130, fidc:120, citi:85, gap:280,
      iasTerms:["75–105d across cement, metals & energy operating companies (decentralized notes).","75–105d nas operacionais de cimento, metais e energia (notas descentralizadas)."],
      cvmNote:["Selective FIDC usage in mid-tier subsidiaries; flagship V. Cimentos relies on core banks.","Uso seletivo de FIDCs em subsidiárias médias; V. Cimentos opera com bancos principais."],
      play:["Map buying CNPJs unit by unit and pitch expansion to 2 under-served operating companies.","Mapear CNPJs compradores por unidade e propor expansão em 2 operacionais subatendidas."]},
    {id:"emb", itau:145, brad:95, sant:110, btg:60, bb:120, fidc:55, citi:70, gap:165,
      iasTerms:["60–90d domestic industrial payables; export flows separated. Record 3Q26 R$12.067bn.","60–90d em compras industriais domésticas; exportação separada. Recorde 3T26 R$ 12,067 bi."],
      cvmNote:["Low FIDC reliance — preference for Tier-1 relationship banks with global trade capabilities.","Baixa dependência de FIDC — preferência por bancos Tier-1 com atuação global em trade."],
      play:["Differentiate with fast invoice-approval integration ahead of Q4 seasonal delivery peak.","Diferenciar com integração rápida de aceite antes do pico sazonal de entregas no 4T."]},
    {id:"nat", itau:125, brad:110, sant:90, btg:85, bb:50, fidc:140, citi:40, gap:145,
      iasTerms:["75–105d on B2B packaging, fragrances & contract manufacturing suppliers.","75–105d para fornecedores B2B de embalagens, fragrâncias e manufatura terceirizada."],
      cvmNote:["Active FIDC usage helped cut 3Q26 leverage to 1.83×; fast onboarding attracts mid-sized suppliers.","Uso ativo de FIDC ajudou a reduzir alavancagem 3T26 p/ 1,83×; cadastro ágil atrai médios."],
      play:["Win back FIDC-funded B2B suppliers via competitive CDI spread + frictionless Document AI.","Reconquistar fornecedores B2B financiados em FIDC combinando spread competitivo + IA de docs."]}
  ];
  const PRICE_TIERS = [
    {code:"AAA", anchors:["vot","emb"], min:0.75, med:1.05, max:1.35, fidc:1.30},
    {code:"AA+", anchors:["jbs"],       min:0.95, med:1.25, max:1.60, fidc:1.45},
    {code:"AA",  anchors:["mbrf"],      min:1.15, med:1.50, max:1.95, fidc:1.75},
    {code:"AA-", anchors:["nat"],       min:1.35, med:1.75, max:2.25, fidc:2.05}
  ];
  const RM_LOSS = [
    {lbl:["Spread / rate vs. peers & FIDCs","Spread / taxa vs. pares e FIDCs"], pct:42, col:() => C.navy},
    {lbl:["Onboarding & KYC friction","Atrito no cadastro e KYC"],            pct:26, col:() => C.red},
    {lbl:["Credit limit or tenor cap","Limite de crédito ou teto de prazo"],  pct:19, col:() => C.blue},
    {lbl:["ERP / registry integration lead time","Prazo de integração ERP / registradora"], pct:13, col:() => C.amber}
  ];
  const SHARE_DATA = [
    {id:"jbs",  citi:12, peers:44, fidc:14, free:30, reg:"b3",     regPct:78},
    {id:"mbrf", citi:8,  peers:42, fidc:17, free:33, reg:"cerc",   regPct:71},
    {id:"vot",  citi:14, peers:39, fidc:11, free:36, reg:"b3",     regPct:66},
    {id:"emb",  citi:16, peers:40, fidc:8,  free:36, reg:"nuclea", regPct:82},
    {id:"nat",  citi:10, peers:35, fidc:22, free:33, reg:"cerc",   regPct:69}
  ];
  const EXT_HEALTH = [
    {id:"jbs",  rating:"brAA+", outlook:["Stable","Estável"],   outCls:"pos", reg:"b3",     dupPct:78, stress:["Moderate","Moderado"],stCls:"neu", net:["Balanced","Equilibrado"],netCls:"neu"},
    {id:"mbrf", rating:"brAA",  outlook:["Positive","Positiva"],outCls:"pos", reg:"cerc",   dupPct:71, stress:["Moderate","Moderado"],stCls:"neu", net:["Tailwind","A favor"],   netCls:"pos"},
    {id:"vot",  rating:"brAAA", outlook:["Stable","Estável"],   outCls:"pos", reg:"b3",     dupPct:66, stress:["Low","Baixo"],        stCls:"pos", net:["Strong","Forte"],       netCls:"pos"},
    {id:"emb",  rating:"brAAA", outlook:["Positive","Positiva"],outCls:"pos", reg:"nuclea", dupPct:82, stress:["Low","Baixo"],        stCls:"pos", net:["Strong","Forte"],       netCls:"pos"},
    {id:"nat",  rating:"brAA−", outlook:["Watch","Observação"], outCls:"warn",reg:"cerc",   dupPct:69, stress:["Elevated","Atenção"], stCls:"warn",net:["Selective","Cautela"],  netCls:"warn"}
  ];
  const EXT_SIGNALS = [
    {id:"emb", route:"step3", sev:() => C.green, sources:["nuclea","bcb"],
      title:["Record 3Q26 revenue (R$12.067bn) + 2026 guidance raised to US$8.4–8.6bn","Receita recorde no 3T26 (R$ 12,067 bi) + guidance 2026 elevado p/ US$ 8,4–8,6 bi"],
      body:["Free cash flow guidance lifted to ≥US$700m alongside 82% Núclea electronic-duplicata readiness — strong credit case for limit expansion.","Projeção de FCL elevada para ≥ US$ 700 mi com 82% de prontidão na Núclea — cenário forte de crédito para ampliar limite."]},
    {id:"nat", route:"step1", sev:() => C.amber, sources:["cerc","cvm"],
      title:["3Q26 Brazil sales −9% (R$2.920bn) despite leverage falling to 1.83× w/ FIDC","Vendas Brasil −9% no 3T26 (R$ 2,920 bi), embora alavancagem tenha caído p/ 1,83× com FIDC"],
      body:["Returned to net profit (R$49m), but product-availability bottlenecks in Brazil warrant monitoring supplier cadence before scaling wave 2.","Reverteu prejuízo (lucro R$ 49 mi), mas gargalos de abastecimento no Brasil pedem atenção à cadência dos fornecedores antes da onda 2."]},
    {id:"mbrf", route:"step3", sev:() => C.blue, sources:["cerc","cvm"],
      title:["3Q26 net income +123.5% (R$210m) on R$41.424bn revenue; leverage at 3.45×","Lucro +123,5% no 3T26 (R$ 210 mi) com receita de R$ 41,424 bi; alavancagem em 3,45×"],
      body:["Post-merger Marfrig + BRF payables unification opens bankable headroom vs. legacy FIDCs; calibrate credit request against R$45.7bn net debt.","Unificação pós-fusão Marfrig + BRF abre espaço frente a FIDCs legados; calibrar pedido de crédito considerando dívida líquida de R$ 45,7 bi."]},
    {id:"jbs", route:"step3", sev:() => C.amber, sources:["b3","cvm"],
      title:["3Q26 revenue R$116.8bn (US$22.7bn) with 3.51× leverage; Beef NA back to positive EBITDA","Receita 3T26 R$ 116,8 bi (US$ 22,7 bi) com alavancagem 3,51×; Beef NA voltou ao EBITDA positivo"],
      body:["Cattle-cost pressure compressed EBITDA margin to 5.2%; B3 registrar trail (78%) strengthens collateral verification for credit requests.","Pressão do gado comprimiu margem EBITDA para 5,2%; trilha na B3 (78%) reforça lastro verificável no pedido de crédito."]},
    {id:"vot", route:"step1", sev:() => C.green, sources:["b3","bcb"],
      title:["3Q26 holding net cash R$8.4bn; V. Cimentos R$8.5bn revenue & 1.71× leverage","Caixa líquido holding R$ 8,4 bi no 3T26; V. Cimentos R$ 8,5 bi de receita e 1,71×"],
      body:["Strong balance sheet across operating companies; stage supplier campaigns by CNPJ/unit where ERP integration with B3 is complete.","Balanço sólido nas operacionais; fatiar campanhas por CNPJ/unidade onde a integração ERP com a B3 já está concluída."]},
    {id:"jbs", route:"step1", sev:() => C.red, sources:["b3","cerc"],
      title:["Cross-registrar double-pledge check active across B3 & CERC","Checagem anti-duplicidade ativa entre B3 e CERC"],
      body:["Real-time interoperability flags invoices already discounted in FIDC pools — feeds directly into Step 1 duplicate-invoice alerts.","Interoperabilidade em tempo real sinaliza duplicatas já cedidas a FIDCs — alimenta diretamente os alertas da Etapa 1."]}
  ];


  // ========== CITI PUBLIC PRODUCT REFERENCE & OPEN FINANCE METADATA ==========
  const CITI_PROD_BASE = "https://corporateportal.brazil.citibank.com/produtos-servicos/credito-financiamento/";
  const PROD = [
    {id:"rs", url:CITI_PROD_BASE+"antecipacao-fornecedor-risco-sacado/", re:/risco sacado(?! esg)|antecipacao a fornecedor|reverse factoring|supplier finance|supply chain finance|\bscf\b/,
      n:["Supplier early payment (Risco Sacado)","Antecipação a Fornecedor de Risco Sacado"], tag:["This cockpit's product","Produto deste painel"], hot:1,
      who:["Contracted by the buyer (the drawee, Citi's client)","Contratado pelo comprador (sacado, cliente do Citi)"],
      d:["Citi pays suppliers (assignors) early on receivables owed by Citi's client (the drawee), through a credit assignment without recourse. Offered in local and foreign currency, subject to prior credit analysis of the client.","O Citi antecipa aos fornecedores (cedentes) os recebíveis devidos pelo cliente do Citi (sacado), por meio de cessão de crédito sem regresso. Disponível em moeda local e estrangeira, sujeito à análise prévia de crédito do cliente."]},
    {id:"esg", url:CITI_PROD_BASE+"risco-sacado-esg/", re:/\besg\b/,
      n:["Risco Sacado ESG","Risco Sacado ESG"], tag:["Variant of the programme","Variação do programa"], hot:1,
      who:["Clients and suppliers with ESG credentials and targets","Clientes e fornecedores com qualificações e metas ESG"],
      d:["A supply chain financing solution that supports clients and suppliers holding environmental, social and governance (ESG) qualifications and targets.","Solução de financiamento à cadeia produtiva que apoia clientes e fornecedores que possuem qualificações e metas ambientais, sociais e de governança (ESG)."]},
    {id:"dd", url:CITI_PROD_BASE+"descontos-titulos-duplicatas/", re:/desconto de titulos|descontos? de duplicatas|desconto de duplicata|discounting|discount of receivables/,
      n:["Discount of trade bills (Desconto de Títulos e Duplicatas)","Descontos de Títulos e Duplicatas"], tag:["Neighbouring product","Produto vizinho"],
      who:["Contracted by the selling company, on its own receivables","Contratado pela empresa vendedora, sobre os próprios recebíveis"],
      d:["An advance on receivables from the company's own sales or services. It covers bills already in collection with Citi or sent by electronic file after quotation. Subject to credit analysis and line availability.","Adiantamento dos recebíveis das vendas ou serviços da própria empresa. Vale para títulos já em cobrança no Citi ou enviados por arquivo eletrônico após cotação. Sujeito a análise de crédito e disponibilidade de linha."]},
    {id:"cc", url:CITI_PROD_BASE+"cessao-credito/", re:/cessao de credito|credit assignment|assignment of receivables/,
      n:["Credit assignment (Cessão de Crédito)","Cessão de Crédito"], tag:["Neighbouring product","Produto vizinho"],
      who:["Contracted by the selling company (assignor)","Contratado pela empresa vendedora (cedente)"],
      d:["Sale of receivables from term sales to the company's partners. It can be done with recourse, without recourse or with partial recourse, as agreed with Citi.","Venda dos recebíveis de vendas a prazo feitas aos parceiros da empresa. Pode ser feita com regresso, sem regresso ou com regresso parcial, conforme acordado com o Citi."]},
    {id:"fi", url:CITI_PROD_BASE+"fianca/", re:/fianca|guarantee/,
      n:["Bank guarantee (Fiança)","Fiança"], tag:["Neighbouring product","Produto vizinho"],
      who:["Contracted by the company whose obligation is guaranteed","Contratado pela empresa que tem a obrigação garantida"],
      d:["Guarantee letters issued by Citi to cover obligations such as financial obligations, tenders, lawsuits, tax disputes, temporary admission of goods and performance.","Cartas de fiança emitidas pelo Citi para garantir obrigações como as financeiras, licitações, processos judiciais, contestações tributárias, admissão temporária de bens e performance."]}
  ];
  const PRAC = [
    [["Citi reviews the buyer's accounts payable file and segments suppliers by spend, geography, terms and payment instrument.","O Citi analisa o arquivo de contas a pagar do comprador e segmenta os fornecedores por gasto, geografia, prazo e meio de pagamento."],["In the cockpit: the campaign invites suppliers by propensity score, wave by wave.","No painel: a campanha convida fornecedores por score de propensão, onda a onda."]],
    [["Suppliers already in SCF programmes of other Citi clients are flagged as likely candidates.","Fornecedores que já participam de programas de SCF de outros clientes do Citi são sinalizados como candidatos prováveis."],["In the cockpit: a candidate lever for the invitation and registration stages.","No painel: alavanca candidata para as etapas de convite e cadastro."]],
    [["The supplier sells receivables at a cost comparable to the buyer's, and chooses when to sell.","O fornecedor vende os recebíveis a um custo comparável ao do comprador, e escolhe quando vender."],["In the cockpit: this is why utilization is tracked separately from active suppliers.","No painel: é por isso que a utilização é acompanhada separada dos fornecedores ativos."]],
    [["The buyer can extend payment terms (better DPO) while the supplier is paid earlier (better DSO); setting up the programme costs the buyer nothing.","O comprador pode alongar prazos (melhora o DPO) enquanto o fornecedor recebe antes (melhora o DSO); implantar o programa não tem custo para o comprador."],["In the cockpit: the core argument behind the 3Q26 anchor pipeline.","No painel: o argumento central por trás do pipeline de âncoras 3T26."]]
  ];
  const OF_ITEMS = [
    [["Supplier share of receivables","Share de recebíveis do fornecedor"],["Credit operations and discounted receivables the supplier holds at other institutions.","Operações de crédito e direitos creditórios descontados que o fornecedor tem em outras instituições."],["Today: estimate","Hoje: estimativa"]],
    [["Who funds each supplier","Quem financia cada fornecedor"],["Consented data replaces illustrative competitor matrix figures, supplier by supplier.","Dados consentidos substituem os números ilustrativos da matriz de concorrentes, fornecedor a fornecedor."],["Today: illustrative","Hoje: ilustrativo"]],
    [["Registration and KYC","Cadastro e KYC"],["Registration and account data shared by the supplier's bank, reducing manual uploads at onboarding.","Dados cadastrais e de conta compartilhados pelo banco do fornecedor, reduzindo envios manuais no cadastro."],["Today: manual upload","Hoje: envio manual"]]
  ];
  const OF_STEPS = [
    ["The supplier receives the consent request together with the programme invitation.","O fornecedor recebe o pedido de consentimento junto com o convite do programa."],
    ["The supplier authorises sharing directly inside their own bank's app.","Ele autoriza o compartilhamento diretamente no aplicativo do próprio banco."],
    ["Verified data arrives via Open Finance API, strictly within the authorised scope and period.","Os dados verificados chegam via API do Open Finance, estritamente no escopo e prazo autorizados."]
  ];
