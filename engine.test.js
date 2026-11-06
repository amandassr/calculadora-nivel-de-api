const test = require('node:test');
const assert = require('node:assert');
const E = require('../src/engine.js');
const data = require('../src/data.json');

const novo = (o) => E.calcApi({ tipo: 'novo', cnpjRegular: true, tempo: '>3a', reputacao: 'baixo', capacidade: 'boa', setor: 'apta', ...o });
const ativo = (o) => E.calcApi({ tipo: 'ativo', cnpjRegular: true, tempo: '>3a', reputacao: 'baixo', mov: 'padrao', disputas: 'ate10', capacidade: 'boa', setor: 'apta', ...o });

test('API: tudo baixo risco = 0 pontos, nível 2', () => {
  const r = ativo({}); assert.equal(r.total, 0); assert.equal(r.nivel, 2); assert.equal(r.liberado, true);
});
test('API: exemplo da planilha (novo: 0-6m, rep baixa, cap boa, setor apto) = 40, nível 4', () => {
  const r = novo({ tempo: '0-6m' }); assert.equal(r.total, 40); assert.equal(r.nivel, 4);
});
test('API: exemplo da planilha (ativo) = 80, nível 9', () => {
  const r = ativo({ tempo: '1-3a', mov: 'fora', capacidade: 'media' }); assert.equal(r.total, 80); assert.equal(r.nivel, 9);
});
test('API: faixas 20, 40, 60, 80, 100', () => {
  assert.equal(E.nivelPorPontos(20), 3); assert.equal(E.nivelPorPontos(40), 4);
  assert.equal(E.nivelPorPontos(60), 8); assert.equal(E.nivelPorPontos(80), 9); assert.equal(E.nivelPorPontos(100), 10);
});
test('API: soma 100 ou mais nega', () => {
  const r = ativo({ tempo: '0-6m', mov: 'fora', disputas: '>50' }); assert.equal(r.total, 120); assert.equal(r.nivel, 10); assert.equal(r.liberado, false);
});
test('API: CNPJ irregular nega mesmo com indicadores bons', () => {
  const r = ativo({ cnpjRegular: false }); assert.equal(r.nivel, 10); assert.equal(r.liberado, false); assert.equal(r.funcionalidades.banking.liberado, false);
});
test('API: atividade inapta nega independentemente do resto', () => {
  const r = ativo({ setor: 'inapta' }); assert.equal(r.nivel, 10);
});
test('API: sem definição de setor não pontua', () => {
  assert.equal(ativo({ setor: 'sem' }).total, 0);
});
test('API: novo parceiro não pontua movimentação nem disputas', () => {
  const r = novo({}); assert.equal(r.criterios.length, 4);
});
test('API: banking só com soma < 100 (planilha C30)', () => {
  assert.equal(ativo({ tempo: '1-3a' }).funcionalidades.banking.liberado, true);
  assert.equal(ativo({ setor: 'apta', setorBanking: 'inapta' }).funcionalidades.banking.liberado, false);
});
test('API: faltando campo devolve erro', () => {
  const r = E.calcApi({ tipo: 'novo' }); assert.equal(r.ok, false); assert.ok(r.erros.length >= 4);
});

const link = (o) => E.calcLink({ tipo: 'novo', cnpjAtivo: true, kyc: 'baixo', porte: 'grande', ...o });
test('Link novos: tabela KYC x porte', () => {
  const casos = [['baixo', 'grande', 2], ['baixo', 'medio', 3], ['baixo', 'pequeno', 4], ['alto', 'medio', 9], ['alto', 'pequeno', 10], ['alto', 'grande', 8]];
  for (const [kyc, porte, n] of casos) assert.equal(link({ kyc, porte }).nivelCalculado, n, kyc + porte);
});
test('Link novos: níveis 5, 6, 7 viram 9 no sistema', () => {
  const r = link({ kyc: 'medio', porte: 'medio' }); assert.equal(r.nivelCalculado, 6); assert.equal(r.nivel, 9);
});
test('Link novos: MEI baixo = 6 calculado, 9 aplicado', () => {
  const r = link({ porte: 'mei' }); assert.equal(r.nivelCalculado, 6); assert.equal(r.nivel, 9);
});
test('Link: CNPJ irregular e KYC inaceitável = 10', () => {
  assert.equal(link({ cnpjAtivo: false }).nivel, 10); assert.equal(link({ kyc: 'inaceitavel' }).liberado, false);
});
const la = (o) => E.calcLink({ tipo: 'ativo', cnpjAtivo: true, kyc: 'baixo', porte: 'grande', disputas6m: 100, comissao6m: 1000, movCompativel: true, abertura: 'mais1a', ...o });
test('Link ativos: baixo + saudável + grande = 2', () => assert.equal(la({}).nivel, 2));
test('Link ativos: baixo + médio porte conforme abertura', () => {
  assert.equal(la({ porte: 'medio' }).nivel, 2); assert.equal(la({ porte: 'medio', abertura: 'ate6m' }).nivel, 3);
});
test('Link ativos: baixo + pequeno', () => {
  assert.equal(la({ porte: 'pequeno' }).nivel, 3); assert.equal(la({ porte: 'pequeno', abertura: 'ate6m' }).nivel, 4);
});
test('Link ativos: financeiramente comprometido = 9; CBK > comissão = 10', () => {
  assert.equal(la({ disputas6m: 600 }).nivel, 9); assert.equal(la({ disputas6m: 1500 }).nivel, 10);
});
test('Link ativos: alto + comprometido = 10; alto + saudável + grande = 7 -> 9', () => {
  assert.equal(la({ kyc: 'alto', disputas6m: 600 }).nivel, 10);
  const r = la({ kyc: 'alto' }); assert.equal(r.nivelCalculado, 7); assert.equal(r.nivel, 9);
});
test('Link ativos: movimentação incompatível = 10', () => assert.equal(la({ movCompativel: false }).nivel, 10));
test('Link ativos: MEI exceção calcula 7 (aplicado 9); sem exceção 9', () => {
  assert.equal(la({ porte: 'mei', cadastroMais6m: true, tpv6m: 1000000 }).nivelCalculado, 7);
  assert.equal(la({ porte: 'mei' }).nivelCalculado, 9);
});
test('Link ativos: comissão zero com disputas = comprometido/inaceitável', () => {
  assert.equal(la({ comissao6m: 0, disputas6m: 10 }).nivel, 10);
  assert.equal(la({ comissao6m: 0, disputas6m: 0 }).nivel, 2);
});

test('Pesquisa: por código CNAE, nome e MCC', () => {
  const b = E.criarBusca(data);
  assert.ok(b.buscar('01.11-3-01').cnaes.length >= 1);
  assert.ok(b.buscar('cultivo de arroz').cnaes[0].nome.includes('arroz'));
  assert.equal(b.buscar('veterinarios').mccs[0].codigo, 742);
  assert.ok(b.buscar('01113').cnaes.length >= 1);
});
test('Pesquisa: CNAE com vários MCCs usa o mais restritivo', () => {
  const b = E.criarBusca(data);
  const r = b.buscar('25.39-0-00').cnaes[0]; assert.equal(r.mccs.length, 2);
  assert.ok(['apta', 'inapta', 'sem'].includes(E.setorDeMccs(r.mccs, 'online')));
});
test('Dados: 255 MCCs e 1359 CNAEs', () => {
  assert.equal(Object.keys(data.mcc).length, 255); assert.equal(data.cnae.length, 1359);
});
test('Pesquisa: MCC fora das tabelas resulta em sem definição; um MCC inapto prevalece', () => {
  assert.equal(E.setorDeMccs([{ api: { on: true } }, { api: null }], 'online'), 'sem');
  assert.equal(E.setorDeMccs([{ api: { on: false } }, { api: null }], 'online'), 'inapta');
  assert.equal(E.setorDeMccs([{ api: { on: true } }], 'online'), 'apta');
});
