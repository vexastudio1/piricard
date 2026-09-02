# QR oficiais PiriCard

Os ficheiros `.svg` desta pasta são os masters vetoriais para impressão. Os
`.png` são pré-visualizações. Ambos contêm diretamente a URL pública do perfil,
sem contactos offline, tracking, redirecionadores ou serviços de QR externos.

## Regenerar e verificar

Na raiz do projeto, com as dependências de desenvolvimento instaladas:

```sh
npm run generate:qrs
npm run verify:qrs
```

O gerador `scripts/generate-piricard-qrs.ts` lê `getPublishedBusinesses()` e
`getBusinessSlugs()` de `lib/businesses.ts`, a mesma fonte da rota `app/[slug]`.
Adicionar e publicar um negócio nessa fonte e executar o comando é suficiente.
Não existe uma segunda lista de negócios. Perfis não publicados não são exportados.

O caminho canónico vem de `getCanonicalProfileUrl()` de `lib/site.ts`, mas a origem
de impressão está deliberadamente fixa em `https://card.pirilight.pt`: variáveis
de desenvolvimento, ficheiros `.env` ou previews nunca alteram os QR permanentes.
Se o domínio oficial mudar, rever explicitamente esta política antes de imprimir.
O comando é manual e não altera o build, os perfis, o NFC ou o sistema de contactos.

## Desenho e segurança

- Biblioteca `qrcode`, correção de erros H, módulos quadrados pretos, fundo branco opaco.
- Quiet zone de quatro módulos em cada lado, incluída no SVG e no PNG.
- Símbolo real de `public/brand/piricard-symbol.svg`, incorporado como SVG vetorial:
  mantém todos os paths e transforms; apenas a tinta branca passa a preta.
- Área central de 7 × 7 módulos, no máximo 20% da largura da matriz, com um módulo
  branco de padding em cada lado e símbolo de 5 × 5 módulos, preservando proporções.
  São cerca de 3,6% da área de uma matriz 37 × 37; isto não equivale à percentagem
  de correção de erros, que atua sobre codewords, não sobre área visual.
- O gerador verifica os módulos reservados da biblioteca antes de recortar o centro:
  não cobre finder, timing, alignment, format ou version patterns. Para URLs futuras
  mais longas, procura uma versão com centro livre. Se a descodificação falhar,
  tenta uma área central de 5 × 5 com a mesma regra de padding.
- SVG autocontido, sem imagens raster, fontes, texto visível, filtros ou recursos externos.

## Validação

Cada SVG final é renderizado com `sharp` e descodificado com `jsqr`. Só passa se
o resultado for exatamente a URL esperada, em oito cenários: 4, 8 e 16 px/módulo,
300 px totais, rotações 90/180/270 graus e desfoque ligeiro. O render também é
comparado módulo a módulo fora do centro para verificar a estrutura e a margem.

O lote inteiro é validado em memória antes de escrever os exports. Depois, os
ficheiros são relidos, comparados e descodificados novamente; o PNG é também
descodificado. `--verify` nunca repara ficheiros: falha perante alterações,
ficheiros em falta, manifest desatualizado ou exports SVG/PNG extra. Exports de
negócios retirados devem ser revistos e arquivados manualmente; nada é apagado.

`piricard-qrs.json` regista negócio, slug, URL esperada/descodificada, ficheiros,
parâmetros, cenários de validação e hashes SHA-256. `symbolSha256` identifica o
símbolo normalizado para tinta preta e fins de linha LF utilizado no master.
O manifesto não confirma disponibilidade HTTP do site nem ensaios físicos.

Dependências: `qrcode`, `sharp` e `tsx` já existiam; `jsqr` foi acrescentado apenas
como dependência de desenvolvimento. Depois de exportados, os QR não precisam
destas bibliotecas nem de qualquer fornecedor para serem lidos.

## Impressão

Usar o SVG, preservar o quadrado e toda a margem branca. Não inverter cores,
recortar a margem, colocar sobre fundo transparente/colorido ou reduzir contraste.
Para vinil, garantir o fundo branco opaco também quando aplicado sobre material
escuro ou transparente. Não simplificar paths nem remover módulos pequenos.

Como ponto de partida conservador para cartões e autocolantes, usar pelo menos
25 × 25 mm, incluindo a margem; aumentar para superfícies difíceis, reflexos ou
maior distância. Esta dimensão é orientação de produção, não garantia de leitura.
Para futuros QR mais densos, manter pelo menos 0,5 mm por módulo: dimensão total
de referência = (modules + 8) × 0,5 mm, nunca inferior a 25 mm sem ensaio.

Antes de produzir em quantidade, imprimir uma prova no tamanho, material e
acabamento reais e testar com câmaras iOS e Android à luz interior normal.
Os testes digitais não substituem esta prova nem garantem leitura sob reflexos,
desgaste ou em todos os aparelhos. Manter domínio e slugs públicos estáveis:
o QR estático é permanente, mas o perfil online continua a depender do website.
