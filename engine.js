/* Motor de regras: Permissionamento API e Venda CNP (Link) de Credenciadoras.
 * Funções puras, sem dependências. Funciona no navegador (window.Engine) e no Node (require).
 * Fontes: PDF "Permissionamento API - Credenciadoras" (v2.0),
 *         PDF "Permissionamento Venda CNP - Credenciadoras",
 *         planilha "Definições para avaliação de Venda Online Link e API - Prevenção v1.0". */
(function (root) {
  'use strict';

  // ---------- Pontuação de risco (API) ----------
  const PONTOS = { baixo: 0, medio: 20, alto: 40, inaceitavel: 100 };
  const ROTULO_RISCO = { baixo: 'Baixo', medio: 'Médio', alto: 'Alto', inaceitavel: 'Inaceitável' };

  // Faixas de pontuação -> nível. Limite inferior inclusivo (ver INTERPRETACOES).
  const FAIXAS_API = [
    { min: 100, nivel: 10 },
    { min: 80, nivel: 9 },
    { min: 60, nivel: 8 },
    { min: 30, nivel: 4 },
    { min: 20, nivel: 3 },
    { min: 0, nivel: 2 },
  ];

  // Detalhamento dos níveis de permissionamento da venda online via API (planilha, aba "Avaliação API").
  const NIVEIS_API = {
    1: { nome: 'Personalizado', liberado: null, tds: 'Sob negociação', min3ds: 'Sob negociação', obrig3ds: 'Sob negociação', antifraude: 'Sob negociação', repescagem: 'Sob negociação', antProprio: 'Sob negociação', antecipacao: 'Sob negociação' },
    2: { nome: 'Risco muito baixo', liberado: true, tds: 'Sim', min3ds: 'R$ 3.000,00', obrig3ds: 'R$ 50.000,00', antifraude: 'Sim', repescagem: 'Sim', antProprio: 'Opcional', antecipacao: 'D+1' },
    3: { nome: 'Risco baixo', liberado: true, tds: 'Sim', min3ds: 'R$ 3.000,00', obrig3ds: 'R$ 50.000,00', antifraude: 'Sim', repescagem: 'Sim', antProprio: 'Paytime', antecipacao: 'D+1' },
    4: { nome: 'Risco médio', liberado: true, tds: 'Sim', min3ds: 'R$ 500,00', obrig3ds: 'R$ 500,00', antifraude: 'Sim', repescagem: 'Não', antProprio: 'Paytime', antecipacao: 'D+1', divergencia: 'Planilha: R$ 500,00 / R$ 500,00. PDF v2.0: R$ 0,00 / R$ 0,00. Foi usada a planilha.' },
    5: { nome: 'Risco baixo a médio (D+30)', liberado: true, pendente: true, tds: 'Sim', min3ds: 'R$ 3.000,00', obrig3ds: 'R$ 50.000,00', antifraude: 'Sim', repescagem: 'Sim', antProprio: 'Opcional', antecipacao: 'D+30' },
    6: { nome: 'Risco médio (D+30)', liberado: true, pendente: true, tds: 'Sim', min3ds: 'R$ 3.000,00', obrig3ds: 'R$ 50.000,00', antifraude: 'Sim', repescagem: 'Sim', antProprio: 'Paytime', antecipacao: 'D+30' },
    7: { nome: 'Risco médio a alto (D+30)', liberado: true, pendente: true, tds: 'Sim', min3ds: 'R$ 500,00', obrig3ds: 'R$ 500,00', antifraude: 'Sim', repescagem: 'Não', antProprio: 'Paytime', antecipacao: 'D+30', divergencia: 'Planilha: R$ 500,00 / R$ 500,00. PDF v2.0: R$ 0,00 / R$ 0,00. Foi usada a planilha.' },
    8: { nome: 'Risco alto', liberado: true, tds: 'Sim', min3ds: 'R$ 200,00', obrig3ds: 'R$ 200,00', antifraude: 'Sim', repescagem: 'Não', antProprio: 'Paytime', antecipacao: 'Não' },
    9: { nome: 'Risco muito alto', liberado: true, tds: 'Sim, 100%', min3ds: 'R$ 0,00', obrig3ds: 'R$ 0,00', antifraude: 'Não', repescagem: 'Não', antProprio: '-', antecipacao: 'Não' },
    10: { nome: 'Inaceitável', liberado: false, tds: 'Não', min3ds: '-', obrig3ds: '-', antifraude: 'Não', repescagem: 'Não', antProprio: 'Não', antecipacao: 'Não' },
  };

  // ---------- Tabelas do Link (CNP) ----------
  const NIVEIS_LINK = {
    1: { nome: 'Especial (personalizável)', liberado: null, tds: 'Personalizado', obrig3ds: 'Personalizado', repescagem: 'Sim', antecipacao: 'Sim' },
    2: { nome: 'Nível 2', liberado: true, tds: 'Sim', min3ds: 'R$ 0,00', obrig3ds: 'R$ 150,00', repescagem: 'Sim', antecipacao: 'D+1' },
    3: { nome: 'Nível 3', liberado: true, tds: 'Sim', min3ds: 'R$ 0,00', obrig3ds: 'R$ 50,00', repescagem: 'Sim', antecipacao: 'D+1' },
    4: { nome: 'Nível 4', liberado: true, tds: 'Sim', min3ds: 'R$ 0,00', obrig3ds: 'R$ 0,00', repescagem: 'Não', antecipacao: 'D+1' },
    5: { nome: 'Nível 5 (D+30)', liberado: true, tds: 'Sim', min3ds: 'R$ 0,00', obrig3ds: 'R$ 150,00', repescagem: 'Sim', antecipacao: 'D+30', semSistema: true },
    6: { nome: 'Nível 6 (D+30)', liberado: true, tds: 'Sim', min3ds: 'R$ 0,00', obrig3ds: 'R$ 50,00', repescagem: 'Sim', antecipacao: 'D+30', semSistema: true },
    7: { nome: 'Nível 7 (D+30)', liberado: true, tds: 'Sim', min3ds: 'R$ 0,00', obrig3ds: 'R$ 0,00', repescagem: 'Não', antecipacao: 'D+30', semSistema: true },
    8: { nome: 'Nível 8', liberado: true, tds: 'Sim', min3ds: 'R$ 0,00', obrig3ds: 'R$ 100,00', repescagem: 'Sim', antecipacao: 'Não' },
    9: { nome: 'Nível 9', liberado: true, tds: 'Sim', min3ds: 'R$ 0,00', obrig3ds: 'R$ 0,00', repescagem: 'Não', antecipacao: 'Não' },
    10: { nome: 'Inaceitável', liberado: false, tds: 'Não', min3ds: 'Não', obrig3ds: 'Não', repescagem: 'Não', antecipacao: 'Não' },
  };

  // Novos parceiros: risco KYC x porte
  const LINK_NOVOS = {
    baixo: { grande: 2, medio: 3, pequeno: 4, mei: 6 },
    medio: { grande: 5, medio: 6, pequeno: 7, mei: 7 },
    alto: { grande: 8, medio: 9, pequeno: 10, mei: 8 },
  };

  const INTERPRETACOES = [
    'API: as faixas do documento deixam 60 e 80 fora de qualquer nível ("Médio 30 até 59%", "Alto >60 a 79%", "Muito alto >80 a 99%"). Como a pontuação só assume múltiplos de 20, foi adotado limite inferior inclusivo: 60 a 79 = nível 8; 80 a 99 = nível 9.',
    'API: os níveis 5, 6 e 7 (D+30) estão como "Pendente" na planilha e não têm faixa de pontuação. A calculadora não os atribui.',
    'API: o PDF mostra exemplos com pesos 30 e 50. A planilha e as tabelas de definição usam 0, 20, 40 e 100. Foram usados 0, 20, 40 e 100.',
    'API: nos níveis 4 e 7 o PDF traz valor mínimo de 3DS R$ 0,00 e a planilha R$ 500,00. Foi usada a planilha, que mantém a sequência 3.000, 500, 200, 0.',
    'API: o PDF cita a coluna D ("Habilita banking") como referência de risco do setor também para venda online. Na planilha a coluna de venda online API é a E. Venda online usa a E e banking usa a D.',
    'Link: abertura do CNPJ entre 6 meses e 1 ano não está coberta pela tabela (níveis pedem "0 a 6 meses" ou "acima de 1 ano"). Foi tratada como a faixa menos favorável (0 a 6 meses).',
    'Link: disputas exatamente iguais a 50% da comissão foram tratadas como "financeiramente comprometido".',
    'Link: níveis 5, 6 e 7 (D+30) ainda não existem no sistema. O nível calculado é mostrado e o nível a aplicar passa a ser o 9, como orienta o documento.',
  ];

  // ---------- Utilidades ----------
  function norm(s) {
    return String(s == null ? '' : s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
  }
  function razao(disputas, comissao) {
    const d = Number(disputas), c = Number(comissao);
    if (!isFinite(d) || !isFinite(c) || d < 0 || c < 0) return null;
    if (c === 0) return d > 0 ? Infinity : 0;
    return d / c;
  }
  function brl(n) { return 'R$ ' + Number(n).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

  // Classificações derivadas de números (ajudam o analista a preencher)
  function classeDisputasApi(r) { return r <= 0.10 ? 'ate10' : r <= 0.50 ? '11-50' : '>50'; }
  function classeCapacidade(fat) { return fat >= 500000 ? 'boa' : fat >= 300000 ? 'media' : 'baixa'; }
  function porteDeCapital(cap) { return cap <= 360000 ? 'pequeno' : cap <= 4800000 ? 'medio' : 'grande'; }
  function mesesParaTempo(m) { return m <= 6 ? '0-6m' : m <= 12 ? '6m-1a' : m <= 36 ? '1-3a' : '>3a'; }

  // ---------- Calculadora API (venda online) ----------
  const MAP_TEMPO = { '0-6m': 'alto', '6m-1a': 'alto', '1-3a': 'medio', '>3a': 'baixo' };
  const MAP_MOV = { padrao: 'baixo', parcial: 'medio', fora: 'alto' };
  const MAP_DISP = { ate10: 'baixo', '11-50': 'medio', '>50': 'alto' };
  const MAP_CAP = { boa: 'baixo', media: 'medio', baixa: 'alto' };
  const MAP_SETOR = { apta: 'baixo', sem: 'baixo', inapta: 'inaceitavel' };

  function nivelPorPontos(total) {
    for (const f of FAIXAS_API) if (total >= f.min) return f.nivel;
    return 10;
  }

  function calcApi(i) {
    const erros = [];
    const ativo = i.tipo === 'ativo';
    const criterios = [];
    function add(chave, rotulo, valorRotulo, risco) {
      criterios.push({ chave, rotulo, valor: valorRotulo, risco, pontos: PONTOS[risco] });
    }
    const exige = (campo, mapa, nome) => { if (!(i[campo] in mapa)) { erros.push('Informe: ' + nome); return false; } return true; };

    if (typeof i.cnpjRegular !== 'boolean') erros.push('Informe: CNPJ regular');
    if (exige('tempo', MAP_TEMPO, 'Tempo de operação')) add('tempo', 'Tempo de operação', { '0-6m': '0 a 6 meses', '6m-1a': '6 meses a 1 ano', '1-3a': '1 a 3 anos', '>3a': 'Mais de 3 anos' }[i.tempo], MAP_TEMPO[i.tempo]);
    if (i.reputacao in PONTOS) add('reputacao', 'Reputação no mercado (risco KYC)', ROTULO_RISCO[i.reputacao], i.reputacao); else erros.push('Informe: Reputação no mercado');
    if (ativo) {
      if (exige('mov', MAP_MOV, 'Movimentação transacional')) add('mov', 'Movimentação transacional', { padrao: 'Dentro do padrão', parcial: 'Parcial', fora: 'Fora do padrão' }[i.mov], MAP_MOV[i.mov]);
      if (exige('disputas', MAP_DISP, 'Disputas e chargeback')) add('disputas', 'Disputas e chargeback (6 meses)', { ate10: 'Até 10% da comissão', '11-50': 'Entre 11% e 50%', '>50': 'Acima de 50%' }[i.disputas], MAP_DISP[i.disputas]);
    }
    if (exige('capacidade', MAP_CAP, 'Capacidade financeira')) add('capacidade', 'Capacidade financeira', { boa: 'Boa (≥ R$ 500 mil)', media: 'Média (≥ R$ 300 mil)', baixa: 'Baixa (< R$ 300 mil)' }[i.capacidade], MAP_CAP[i.capacidade]);
    if (exige('setor', MAP_SETOR, 'Risco do setor')) add('setor', 'Risco do setor (atividade)', { apta: 'Atividade apta', inapta: 'Atividade inapta', sem: 'Sem definição' }[i.setor], MAP_SETOR[i.setor]);
    if (erros.length) return { ok: false, erros };

    const cnpjIrregular = i.cnpjRegular === false;
    const total = criterios.reduce((s, c) => s + c.pontos, 0) + (cnpjIrregular ? 100 : 0);
    const motivos = [];
    if (cnpjIrregular) motivos.push('CNPJ irregular (suspenso, inapto ou baixado): uso da API não permitido. Acionar o Jurídico para notificação extrajudicial.');
    if (i.setor === 'inapta') motivos.push('Atividade inapta: negada independentemente do restante da análise.');
    if (i.reputacao === 'inaceitavel') motivos.push('KYC com risco inaceitável.');
    const bloqueio = cnpjIrregular || i.setor === 'inapta' || i.reputacao === 'inaceitavel';
    let nivel = bloqueio ? 10 : nivelPorPontos(total);
    if (nivel === 10 && total >= 100 && !motivos.length) motivos.push('Pontuação total igual ou acima de 100.');
    const cfg = NIVEIS_API[nivel];

    // Funcionalidades (planilha, "Modalidade Funcionalidades")
    const bankingAtividade = i.setorBanking || 'sem';
    const banking = !cnpjIrregular && total < 100 && bankingAtividade !== 'inapta';
    const func = {
      vendaOnline: { liberado: nivel !== 10, obs: nivel === 10 ? 'Negada' : 'Conforme o nível' },
      banking: { liberado: banking, obs: banking ? 'Exige homologação técnica (Tecnologia)' : (bankingAtividade === 'inapta' ? 'Atividade inapta para banking' : 'Pontuação ≥ 100 ou CNPJ irregular') },
      consultas: { liberado: !cnpjIrregular && i.reputacao !== 'inaceitavel', obs: 'Liberada junto com a permissão de API, com base no KYC' },
      cadastro: { liberado: null, obs: 'Decisão do analista a partir do KYC (risco de empresas de fachada)' },
      boletos: { liberado: null, obs: 'Decisão do analista a partir do KYC (risco de emissão em massa)' },
    };

    return {
      ok: true, modo: 'api', tipo: i.tipo, criterios, total, nivel, nivelNome: cfg.nome,
      liberado: nivel !== 10, permissoes: cfg, motivos, funcionalidades: func,
      proximosPassos: passosApi(i.tipo, nivel !== 10),
    };
  }

  function passosApi(tipo, liberado) {
    if (!liberado) return ['Registrar a negativa e o motivo no KYC / quadro Permissionamento API.'];
    const passos = [];
    if (tipo === 'novo') {
      passos.push('Registrar o resultado no elemento do KYC (o cadastro do parceiro ainda não existe).');
      passos.push('Após criar o cadastro, o time de Ativação cria o elemento no quadro e marca "Aguardando homologação" na coluna AVALIAÇÃO TEC.');
    } else {
      passos.push('Analista de Prevenção III cria o elemento no quadro e marca "Aguardando homologação" na coluna AVALIAÇÃO TEC.');
    }
    passos.push('Tecnologia homologa e altera o status para "Homologação OK".');
    passos.push('Prevenção configura: cadastro da Credenciadora > Aba Permissões > "Integração (API)" > Permissões dos Estabelecimentos da Credenciadora, marcando as permissões do nível.');
    passos.push('Alterar o status para "Permissionamento OK" na coluna PERMISSIONAMENTO PREV.');
    return passos;
  }

  // ---------- Calculadora Link (CNP) ----------
  function aplicarSistema(n) { return NIVEIS_LINK[n].semSistema ? 9 : n; }

  function calcLink(i) {
    const erros = [];
    if (typeof i.cnpjAtivo !== 'boolean') erros.push('Informe: situação do CNPJ');
    if (!(i.kyc in PONTOS)) erros.push('Informe: risco KYC');
    if (!['mei', 'pequeno', 'medio', 'grande'].includes(i.porte)) erros.push('Informe: porte da empresa');
    const ativo = i.tipo === 'ativo';
    let rz = null;
    if (ativo) {
      rz = razao(i.disputas6m, i.comissao6m);
      if (rz === null) erros.push('Informe: disputas e comissão dos últimos 6 meses');
      if (typeof i.movCompativel !== 'boolean') erros.push('Informe: movimentação compatível com a atividade');
      if (!['ate6m', '6m-1a', 'mais1a'].includes(i.abertura)) erros.push('Informe: tempo de abertura do CNPJ');
    }
    if (erros.length) return { ok: false, erros };

    const motivos = [];
    let nivel = null, calculado = null;
    const barrar = (m) => { motivos.push(m); nivel = 10; };

    if (!i.cnpjAtivo) barrar('CNPJ irregular, inapto ou baixado.');
    if (i.kyc === 'inaceitavel') barrar('KYC com risco inaceitável: não habilita o parceiro.');
    if (ativo) {
      if (rz > 1) barrar('Chargebacks do semestre acima do valor da comissão do semestre.');
      if (!i.movCompativel) barrar('Inconsistência entre atividade e movimentação transacional. Encaminhar ao quadro Gestão de Casos - Credenciadoras.');
      if (i.reputacaoNegativa) barrar('Histórico reputacional negativo com a Paytime (avaliar caso a caso com a Coordenação).');
      if (i.kyc === 'alto' && rz >= 0.5) barrar('KYC alto risco com situação financeira comprometida.');
    }

    let excecaoMei = false;
    if (nivel === null) {
      if (!ativo) {
        calculado = LINK_NOVOS[i.kyc][i.porte];
        if (calculado === 10) motivos.push('Alto risco (KYC) com pequeno porte: inaceitável para venda online.');
      } else {
        const comprometido = rz >= 0.5;
        if (i.porte === 'mei') {
          excecaoMei = i.cadastroMais6m === true && Number(i.tpv6m) >= 1000000 && rz < 0.5;
          calculado = excecaoMei ? 7 : 9;
          motivos.push(excecaoMei ? 'MEI dentro da exceção (cadastro > 6 meses, TPV ≥ R$ 1 milhão em 6 meses, disputas < 50% da comissão): nível 7.' : 'MEI: nível 9.');
        } else if (comprometido) {
          calculado = 9; motivos.push('Baixo/médio risco com situação financeira comprometida (disputas entre 50% e 100% da comissão): nível 9.');
        } else {
          const antigo = i.abertura === 'mais1a';
          if (i.kyc === 'baixo') calculado = i.porte === 'grande' ? 2 : i.porte === 'medio' ? (antigo ? 2 : 3) : (antigo ? 3 : 4);
          else if (i.kyc === 'medio') calculado = { grande: 4, medio: 5, pequeno: 6 }[i.porte];
          else calculado = { grande: 7, medio: 7, pequeno: 8 }[i.porte];
          if (i.abertura === '6m-1a' && i.kyc === 'baixo' && i.porte !== 'grande') motivos.push('Abertura entre 6 meses e 1 ano não consta na tabela: tratada como "0 a 6 meses".');
        }
      }
      nivel = calculado;
    } else calculado = 10;

    const aplicado = aplicarSistema(nivel);
    const cfg = NIVEIS_LINK[aplicado];
    if (aplicado !== nivel) motivos.push('Níveis 5, 6 e 7 (D+30) ainda não existem no sistema: alocar no nível 9.');
    return { ok: true, modo: 'link', tipo: i.tipo, nivelCalculado: nivel, nivel: aplicado, nivelNome: cfg.nome, liberado: aplicado !== 10, permissoes: cfg, razaoDisputas: rz, motivos };
  }

  // ---------- Pesquisador de atividades ----------
  function criarBusca(data) {
    const mcc = data.mcc;
    const cnaes = data.cnae.map(([codigo, nome, mccs]) => ({ codigo, nome, mccs, k: norm(codigo + ' ' + nome), d: codigo.replace(/\D/g, '') }));
    const mccList = Object.keys(mcc).map((c) => ({ codigo: Number(c), ...mcc[c], k: norm(c + ' ' + mcc[c].n) }));
    function resumoMcc(c) {
      const m = mcc[String(c)];
      return m ? { codigo: Number(c), nome: m.n, link: m.l, api: m.a } : { codigo: Number(c), nome: 'MCC fora das tabelas', link: null, api: null };
    }
    function buscar(q, limite) {
      limite = limite || 40;
      const t = norm(q); if (t.length < 2) return { cnaes: [], mccs: [] };
      const toks = t.split(/\s+/).filter(Boolean), digs = t.replace(/\D/g, '');
      const casa = (k, d) => toks.every((x) => k.includes(x)) || (digs.length >= 2 && d && d.startsWith(digs));
      const rc = cnaes.filter((c) => casa(c.k, c.d)).slice(0, limite).map((c) => ({ tipo: 'cnae', codigo: c.codigo, nome: c.nome, mccs: c.mccs.map(resumoMcc) }));
      const rm = mccList.filter((m) => toks.every((x) => m.k.includes(x))).slice(0, limite).map((m) => ({ tipo: 'mcc', ...resumoMcc(m.codigo) }));
      return { cnaes: rc, mccs: rm };
    }
    return { buscar, resumoMcc };
  }

  // Resume vários MCCs de um CNAE: vale o mais restritivo.
  function setorDeMccs(mccs, alvo) {
    const campo = alvo === 'banking' ? 'bank' : 'on';
    const vals = mccs.map((m) => (m.api ? m.api[campo] : null));
    if (vals.some((v) => v === false)) return 'inapta';
    if (!vals.length || vals.some((v) => v !== true)) return 'sem'; // MCC fora das tabelas = sem definição
    return 'apta';
  }

  const Engine = { PONTOS, ROTULO_RISCO, FAIXAS_API, NIVEIS_API, NIVEIS_LINK, LINK_NOVOS, INTERPRETACOES, calcApi, calcLink, criarBusca, setorDeMccs, razao, brl, norm, classeDisputasApi, classeCapacidade, porteDeCapital, mesesParaTempo, nivelPorPontos };
  if (typeof module !== 'undefined' && module.exports) module.exports = Engine; else root.Engine = Engine;
})(typeof window !== 'undefined' ? window : globalThis);
