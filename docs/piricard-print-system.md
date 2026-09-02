# PiriCard - cartões físicos e folha A4 final

## Referências finais e arquitetura

Design atual: **final-nfc-reference-v3**. Antes de editar, foi executado Graphify
em modo AST local: `graphify extract . --code-only --no-cluster --max-workers 1`,
seguido da consulta do fluxo `PiriCardPrintTemplate -> generateCards -> export`.
Foram encontrados 382 nós e 904 ligações. O grafo fica em `graphify-out/`,
ignorado pelo Git; não se enviou código para serviços externos.

As novas referências foram abertas e inspecionadas diretamente:

- Frente: `docs/reference/A004FE55-1C94-41BF-8A90-667A8DADD010.jpeg`.
- Verso: `docs/reference/61F6B73B-5B5C-4245-A0F6-DF3E582D4B45.jpeg`.

Substituem a composição anterior de slogans/QR sem instruções. Não são
incorporadas no cartão, nem lidas pelo gerador. Sombras, perspetiva e fundos
de apresentação das fotografias não fazem parte da arte impressa.

| Responsabilidade | Fonte única |
| --- | --- |
| Negócios publicados, slugs, logos e cores | `lib/businesses.ts` |
| URLs canónicas | `lib/site.ts`, `productionProfileUrl()` |
| QR oficiais H e manifesto | `scripts/generate-piricard-qrs.ts`, `public/piricard-qrs/` |
| Símbolo real | `public/brand/piricard-symbol.svg` |
| Fontes locais | `assets/fonts/Manrope-Regular.ttf`, `Manrope-Bold.ttf` |
| Frente/verso reutilizáveis | `lib/print/PiriCardPrintTemplate.ts` |
| Medidas, rotação, posições e marcas | `lib/print/geometry.ts` |
| PDF vetorial e validação | `lib/print/export.ts` |
| Seleção, exports e manifesto | `scripts/generate-piricard-cards.ts` |

Não se alteraram perfis, contactos, URLs, dados dos negócios ou programação NFC.
As cores vêm de `business.theme.accent`, sem uma segunda tabela de identidades.
Os logos são os assets reais aprovados, mesmo quando as fotografias de referência
os representam de forma diferente; não se redesenham nem se deformam marcas.

## Design

Frente: placa branca de 25 mm, logo em área máxima de 23 mm, nome centrado a
9 pt, smartphone com três ondas NFC, “Encosta o teu telemóvel” / “para abrir
a ficha” e pequeno conjunto símbolo oficial + PiriCard no rodapé. Não há
slogans, URLs ou símbolos duplicados. Os quatro nomes atuais usam 9 pt.
Nomes futuros podem ocupar duas linhas; a exportação falha se não couberem.

Verso: QR oficial de **34 mm**, placa branca de 36 mm, linhas de acento e
grafismos laterais das referências, com estas instruções:

```text
Lê o QR
ou encosta o teu
telemóvel com NFC
```

Não há marca adicional abaixo do QR. O símbolo dentro do QR permanece o do
SVG oficial, com quiet zone de quatro módulos e correção de erros H.

## Medidas e A4 compacto

| Elemento | Dimensão exata |
| --- | --- |
| Corte individual no design | **53,98 x 85,60 mm**, retrato |
| Corte de cada peça rodada na folha | **85,60 x 53,98 mm** |
| Raio de corte / área segura | **3,18 mm / 5 mm** |
| Sangria dos masters individuais | **3 mm** por lado |
| MediaBox/BleedBox dos masters | **59,98 x 91,60 mm** |
| TrimBox individual | de (3; 3) a (56,98; 88,60) mm |
| QR com quiet zone | **34 x 34 mm**, x = 9,99; y = 13,50 mm no retrato |
| A4 | **210 x 297 mm**, retrato |
| Sangria na folha / intervalo entre cortes | **0,5 mm / 4 mm** |

`piricard-print-a4-final.pdf` contém uma página e oito peças na geração atual:

| Fila | Esquerda | Direita | y de corte |
| --- | --- | --- | --- |
| 1 | Auto Formigal frente | Auto Formigal verso | 10,00 mm |
| 2 | Beauty Connection 360 frente | Beauty Connection 360 verso | 67,98 mm |
| 3 | Boi na Brasa frente | Boi na Brasa verso | 125,96 mm |
| 4 | OFT Racing Shop frente | OFT Racing Shop verso | 183,94 mm |

As colunas começam em x = 10,00 e 99,60 mm. O conjunto dos cortes mede
**175,20 x 227,92 mm** e não é centrado verticalmente. A rotação é de 90 graus
no sentido horário, aplicada ao cartão inteiro, sem escala. Para manter 4 mm
entre cortes, a folha recorta apenas a sangria exterior dos masters para
0,5 mm. O clipping arredondado da sangria usa raio 3,68 mm; o acabamento
final permanece com raio 3,18 mm.

As marcas têm 0,10 mm de espessura e ficam de 0,75 a 1,65 mm para fora das
arestas de corte, também fora da sangria. Não entram nos cartões e não se
sobrepõem. O guia separado `piricard-cr80-cut-guide.svg` não deve ser impresso
por cima das artes; é uma referência do corte arredondado.

Abaixo de y = **239,77 mm**, a página inteira está branca, verificada pixel
a pixel: sobram **57,23 mm** de altura em toda a largura. Esta medição adota
0,20 mm de margem adicional após o fim das marcas, em y = 239,57 mm.
Não há títulos, legendas ou fundos a ocupar a área reutilizável.

**Staples: A4 retrato, só de um lado, 100% / TAMANHO REAL.** Desativar ajustar
à página, encolher páginas grandes, expansão sem margens, livreto e múltiplas
páginas por folha. O PDF declara `ViewerPreferences /PrintScaling /None`,
mas confirmar a configuração no driver. Esta folha não é um PDF duplex.

## Comandos e ficheiros

```sh
npm run generate:cards
npm run generate:cards -- --business=oft-racing
npm run generate:cards -- --business=oft-racing --copies=10
```

O comando normal lê todos os negócios publicados. Cabem quatro pares por
página; mais negócios/cópias continuam noutra página sem reduzir peças.
`--copies` aceita 1 a 100. `--business` cria um job isolado em
`public/piricard-print/jobs/<slug>/`, sem substituir a coleção principal.

Os QR oficiais existentes são reutilizados. Se faltarem, executar
`npm run generate:qrs`; para os conferir, `npm run verify:qrs`. O gerador de
cartões nunca os modifica silenciosamente. Poppler deve estar no PATH, ou
definido por `PIRICARD_PDFINFO` e `PIRICARD_PDFTOPPM`. Não foram adicionadas
dependências nesta revisão; PDFKit, SVG-to-PDFKit, fontkit, sharp e jsQR são
reutilizados. O gerador não precisa de APIs externas ou fontes online.

```text
public/piricard-print/piricard-print-a4-final.pdf
public/piricard-print/piricard-print-a4-final.svg
public/piricard-print/piricard-print-a4-final-preview.png
public/piricard-print/piricard-print.json
public/piricard-print/<slug>/<slug>-front.svg / .pdf / .png
public/piricard-print/<slug>/<slug>-back.svg / .pdf / .png
public/piricard-print/<slug>/<slug>-preview.png
```

O preview A4 é renderizado do PDF final a 300 dpi. Os previews individuais
mostram a área de corte; SVG/PDF individuais incluem 3 mm de sangria. Em jobs
multipágina, SVG/preview A4 recebem o sufixo da página.

O lote é validado em `.cache/piricard-print/<execução>/` antes de copiar para
`public/`. O manifesto regista versão, dimensões, posições, URLs, assets,
resultados e hashes. Exports anteriores, listados no manifesto anterior e
inalterados, que deixaram de fazer parte do lote são preservados em
`<execução>/superseded/` e retirados da pasta pública. Ficheiros alheios ou
editados manualmente não são apagados.

O antigo `--proof=autoformigal,beauty-connection-360,boi-na-brasa` continua como
job alternativo em `public/piricard-print/proof/`. Além do compacto de três
pares, mantém os PDFs separados/duplex com o template atual. Não é necessário
para a nova folha de oito peças. Jobs/provas de execuções anteriores não são
a folha final atual: conferir `designVersion` ou regenerar antes de imprimir.

## Qualidade e validação

QR, símbolo, tipografia, NFC, linhas e fundos são vetores no PDF. A tipografia
Manrope é convertida em contornos. Os logos aprovados JPEG/WebP/PNG continuam
raster em resolução original, com mínimo efetivo de 300 dpi e valor registado
no manifesto. Não há falsa vetorização. Logos SVG futuros são suportados.

Saída **RGB**, sem conversão CMYK, perfil ICC de saída ou certificação PDF/X.
A gráfica deve usar o perfil/RIP adequado ao vinil e fazer uma prova de cor.

A geração verifica URLs/hashes oficiais, versos SVG a 150/300 dpi, PDFs a
300 dpi e cada QR imposto após a rotação, incluindo a grelha de módulos nas
coordenadas físicas de 34 mm e quiet zone. Confere MediaBox/BleedBox/TrimBox,
número de páginas, concordância visual SVG/PDF, arestas físicas dos cartões,
sangria da folha, área branca, bounds reais dos glifos, área segura,
ausência de sobreposição e hashes dos exports copiados.

```sh
npm run typecheck
npm test
npm run lint
```

Os renders para inspeção ficam em `<execução>/qa/`. O tamanho aparente no ecrã
não é uma régua. Antes de produzir em quantidade, imprimir uma prova a 100%,
medir cortes/QR, verificar cantos e vinil e testar QR/NFC em telemóveis reais.
Os testes digitais não validam a precisão da impressora, reflexos, opacidade,
aderência ou chips NFC físicos.
