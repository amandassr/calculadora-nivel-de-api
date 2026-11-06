# Regras de permissionamento

Resumo dos procedimentos "Permissionamento API - Credenciadoras" e "Permissionamento Venda CNP - Credenciadoras". A fonte oficial continua sendo os documentos.

## Regra master

A análise e a liberação são da **credenciadora**, não do EC. Qualquer regra aplicada à credenciadora vale para todos os ECs abaixo dela. Parceiros novos passam pela análise junto do KYC. Parceiros ativos são analisados sob demanda: o gerente de contas encaminha ao time de Prevenção, que registra no quadro Permissionamento API.

## Funcionalidades da API

| Funcionalidade | Regra |
|---|---|
| Consultas | Liberada automaticamente com a permissão de API. Base: KYC (CNPJ e sócios). |
| Cadastro | Listar e cadastrar ECs, ativar plataformas. Risco: empresas de fachada. Decisão pelo KYC. |
| Banking | Saldo, extrato, PIX, TED, pagamento de boleto. Capacidade financeira e segmento. Atividade inapta para banking é negada sempre. Na planilha: liberado se pontuação < 100. Exige homologação técnica. |
| Boletos | Risco de emissão em massa para fraude. Decisão pelo KYC. |
| Venda online | Pontuação abaixo define o nível. |

## Venda online via API: pontuação

Risco baixo = 0, médio = 20, alto = 40, inaceitável = 100. A soma define o nível.

| Indicador | Baixo | Médio | Alto | Inaceitável | Quem |
|---|---|---|---|---|---|
| CNPJ regular | Regular | - | - | Suspenso, inapto ou baixado (nega e aciona o Jurídico) | Todos |
| Tempo de operação | > 3 anos | 1 a 3 anos | até 1 ano | - | Todos |
| Reputação (risco KYC) | Baixo | Médio | Alto | Inaceitável | Todos |
| Movimentação transacional (3 meses) | Dentro do padrão | Parcial | Fora do padrão | - | Ativos |
| Disputas e chargeback (6 meses / comissão) | até 10% | 11% a 50% | > 50% | - | Ativos |
| Capacidade financeira (faturamento do último mês) | ≥ R$ 500 mil | ≥ R$ 300 mil | < R$ 300 mil | - | Todos |
| Risco do setor | Apta / sem definição | - | - | Inapta | Todos |

Valores menores de faturamento podem ser aceitos com aporte financeiro ou comissão no portal que complete (caso a caso). Para tempo de operação, vale o maior entre tempo de mercado e de parceria, somando CNPJs vinculados.

| Pontos | Nível |
|---|---|
| 0 | 2 Risco muito baixo |
| 20 a 29 | 3 Risco baixo |
| 30 a 59 | 4 Risco médio |
| 60 a 79 | 8 Risco alto |
| 80 a 99 | 9 Risco muito alto |
| 100 ou mais | 10 Inaceitável |

Nível 1 (personalizado) é por negociação. Níveis 5, 6 e 7 (D+30) estão pendentes na planilha.

| Nível | 3DS | Valor mín. 3DS | 3DS obrigatório | Antifraude | Repescagem | Antifraude próprio/Paytime | Antecipação |
|---|---|---|---|---|---|---|---|
| 2 | Sim | R$ 3.000 | R$ 50.000 | Sim | Sim | Opcional | D+1 |
| 3 | Sim | R$ 3.000 | R$ 50.000 | Sim | Sim | Paytime | D+1 |
| 4 | Sim | R$ 500 | R$ 500 | Sim | Não | Paytime | D+1 |
| 5 | Sim | R$ 3.000 | R$ 50.000 | Sim | Sim | Opcional | D+30 |
| 6 | Sim | R$ 3.000 | R$ 50.000 | Sim | Sim | Paytime | D+30 |
| 7 | Sim | R$ 500 | R$ 500 | Sim | Não | Paytime | D+30 |
| 8 | Sim | R$ 200 | R$ 200 | Sim | Não | Paytime | Não |
| 9 | Sim, 100% | R$ 0 | R$ 0 | Não | Não | - | Não |
| 10 | Não | - | - | Não | Não | Não | Não |

## Venda online via Link (CNP)

A permissão é da credenciadora e não libera os ECs em massa: cada EC é analisado pela atividade, inclusive o EC da própria credenciadora. Reanálise de link negado após 60 dias de operação. Reanálise da classificação de novos parceiros após 90 dias da primeira transação.

Porte (capital social): MEI (limite R$ 81 mil/ano), pequeno até R$ 360 mil, médio até R$ 4,8 milhões, grande acima.

**Novos parceiros** (KYC x porte): baixo = grande 2, médio 3, pequeno 4, MEI 6. Médio = 5, 6, 7, MEI 7. Alto = 8, 9, 10, MEI 8. KYC inaceitável não habilita.

**Parceiros ativos**

- Nível 10: CNPJ irregular/inapto/baixado; novo KYC inaceitável; KYC alto + financeiramente comprometido; inconsistência entre atividade e movimentação (enviar à Gestão de Casos); chargebacks do semestre acima da comissão do semestre; histórico reputacional negativo.
- Nível 9: MEI (qualquer KYC); KYC baixo/médio + financeiramente comprometido (disputas de 50% a 100% da comissão em 6 meses). Exceção MEI (cadastro > 6 meses, TPV ≥ R$ 1 milhão em 6 meses, disputas < 50%): nível 7.
- Demais (saudável e movimentação compatível): KYC baixo: grande 2; médio 2 (aberto > 1 ano) ou 3; pequeno 3 (> 1 ano) ou 4. KYC médio: grande 4; médio 5; pequeno 6. KYC alto: grande ou médio 7; pequeno 8.
- Níveis 5, 6 e 7 são D+30 e não existem no sistema: alocar no 9.

| Nível | Venda online | 3DS | Valor mín. 3DS | Mín. 3DS obrigatório | Repescagem AF | Antecipação |
|---|---|---|---|---|---|---|
| 2 | Sim | Sim | R$ 0 | R$ 150 | Sim | D+1 |
| 3 | Sim | Sim | R$ 0 | R$ 50 | Sim | D+1 |
| 4 | Sim | Sim | R$ 0 | R$ 0 | Não | D+1 |
| 5 | Sim | Sim | R$ 0 | R$ 150 | Sim | D+30 |
| 6 | Sim | Sim | R$ 0 | R$ 50 | Sim | D+30 |
| 7 | Sim | Sim | R$ 0 | R$ 0 | Não | D+30 |
| 8 | Sim | Sim | R$ 0 | R$ 100 | Sim | Não |
| 9 | Sim | Sim | R$ 0 | R$ 0 | Não | Não |
| 10 | Não | Não | Não | Não | Não | Não |

KYC com mais de 6 meses deve ser refeito. Com mais de 3 meses, refazer a pesquisa em sites e redes sociais.

## Sistema de afiliados (ainda sem calculadora)

Liberação só no plano D+1, sem 3DS, para credenciadoras que vendem somente maquininhas. Já tem venda online: libera. Saldo negativo elevado, ou acima de 80% da comissão (Zoop + PagSeguro): "Não". Red flags de PLD pesam. Novas ou sem TPV/comissão relevantes: liberadas e monitoradas. Negados: reanálise após 90 dias; pode receber D+30.

## Fluxo após a decisão

1. Novo parceiro: registrar no KYC. Ativo: Analista de Prevenção III cria o elemento no quadro.
2. Marcar "Aguardando homologação" (coluna AVALIAÇÃO TEC). Tecnologia homologa e muda para "Homologação OK".
3. Prevenção configura: cadastro da Credenciadora > Aba Permissões > "Integração (API)" > Permissões dos Estabelecimentos da Credenciadora.
4. Mudar para "Permissionamento OK" (coluna PERMISSIONAMENTO PREV).

## Interpretações adotadas (confirmar com a Prevenção)

1. **60 e 80 pontos**: as faixas do documento ("30 até 59", ">60 a 79", ">80 a 99") deixam esses valores sem nível. Como a pontuação só tem múltiplos de 20, o limite inferior é inclusivo.
2. **Níveis 5, 6, 7 da API**: pendentes na planilha, sem faixa. Não são atribuídos.
3. **Pesos**: o PDF mostra exemplos com 30 e 50. As tabelas de definição e a planilha usam 0, 20, 40, 100. Foram usados estes.
4. **3DS nos níveis 4 e 7 da API**: PDF diz R$ 0 / R$ 0, planilha diz R$ 500 / R$ 500. Foi usada a planilha (sequência 3.000, 500, 200, 0).
5. **Coluna da planilha para risco do setor**: o PDF cita a coluna D (banking) também para venda online. Venda online usa a coluna E, banking usa a D.
6. **Link, abertura entre 6 meses e 1 ano**: sem faixa na tabela. Tratada como "0 a 6 meses".
7. **Link, disputas = 50% da comissão**: tratado como comprometido.
8. **CNAE com MCC fora das tabelas** (26 casos): resultado "sem definição", salvo se outro MCC do CNAE for inapto.
