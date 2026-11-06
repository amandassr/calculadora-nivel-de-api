# Calculadora de Nível de API

Ferramenta para o time de Prevenção calcular o nível de permissionamento de credenciadoras e dizer se a venda online está liberada.

Tem quatro partes, todas em `dist/index.html` (arquivo único, abre direto no navegador):

1. **Venda online via API**: pontuação de risco (0, 20, 40, 100) que vira nível 2 a 10, com as permissões do nível, as funcionalidades (venda online, banking, consultas, cadastro, boletos) e os próximos passos.
2. **Venda online via Link (CNP)**: nível 2 a 10 para novos parceiros (risco KYC x porte) e parceiros ativos (KYC, saúde financeira, movimentação, porte, abertura do CNPJ, exceção MEI).
3. **Pesquisar atividade**: busca por CNAE ou MCC e mostra o que a planilha permite (banking, venda online API, 3DS, Clearsale, limites, Link). Também preenche o risco do setor na calculadora.
4. **Regras**: as regras dos dois procedimentos descritas em texto e tabelas, mais as interpretações adotadas onde os documentos têm lacuna.

## Estrutura

```
src/engine.js        regras (funções puras, sem dependências, roda no navegador e no Node)
src/data.json        255 MCCs e 1.359 CNAEs extraídos da planilha
src/template.html    interface
scripts/build.js     junta tudo em dist/index.html (e dist/artefato.html)
scripts/extrair_planilha.py   regenera src/data.json a partir da planilha .xlsx
tests/engine.test.js testes das regras (node:test)
REGRAS.md            regras e interpretações em texto
```

## Uso

```
npm test        # roda os testes
npm run build   # gera dist/index.html
```

Sem dependências. Requer Node 18 ou superior. Para atualizar as atividades, rode `python3 scripts/extrair_planilha.py caminho/da/planilha.xlsx` (precisa do `openpyxl`) e depois `npm run build`.

## Fontes

- Permissionamento API - Credenciadoras (v2.0, atualizado em 23/02/2026)
- Permissionamento Venda CNP - Credenciadoras (atualizado em 14/10/2026)
- Definições para avaliação de Venda Online Link e API - Prevenção (v1.0)

Ferramenta de apoio à decisão. Não substitui a análise do time de Prevenção nem o fluxo de homologação.

## Pendências conhecidas

- Sistema de afiliados está descrito em `REGRAS.md`, mas ainda não tem calculadora.
- Confirmar com a Prevenção as interpretações listadas em `REGRAS.md` (faixas 60 e 80, valores de 3DS nos níveis 4 e 7, abertura entre 6 meses e 1 ano).
- Os quadros e botões marcados como "[inserir aqui o nome do quadro]" nos PDFs continuam sem nome.
