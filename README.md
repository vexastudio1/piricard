# PiriCard

PiriCard é o diretório de negócios da PiriLight Studio. A raiz `/` apresenta apenas negócios publicados, com pesquisa por nome, categoria e localidade. Cada negócio mantém um perfil permanente em `/[slug]`, preparado para QR e NFC, mas com identidade visual própria e estrutura de mini-site.

## Desenvolvimento

Requer Node.js 20.9+ e npm 10+.

```bash
npm install
copy .env.example .env.local
npm run dev
```

A aplicação fica em `http://localhost:3000`; o perfil publicado atual é `/autoformigal`.

## Verificação

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Arquitetura

- `app/page.tsx`: diretório público;
- `components/BusinessDirectory.tsx`: pesquisa e estados de resultados;
- `app/[slug]/page.tsx`: perfil dinâmico e metadados;
- `components/BusinessProfile.tsx`: mini-site do cliente;
- `components/ProfileActions.tsx`: vCard, partilha, cópia e QR;
- `components/OpeningStatus.tsx`: estado de abertura em `Europe/Lisbon`;
- `app/api/contact/[slug]/route.ts`: geração do vCard;
- `lib/businesses.ts`: fonte de dados única e tipada;
- `lib/site.ts`, `lib/links.ts` e `lib/vcard.ts`: URL canónica, ligações seguras e contacto.

Dados do diretório, perfil, metadados, vCard, tema e recursos partem sempre do mesmo registo `Business`. Campos opcionais só geram interface quando contêm dados válidos.

## Publicar ou ocultar um negócio

Cada registo tem três controlos distintos:

- `published`: inclui o negócio no diretório e permite abrir o perfil e descarregar o vCard;
- `featured`: ordena negócios publicados em destaque antes dos restantes;
- `indexable`: controla as diretivas de indexação nos metadados.

Um negócio em preparação deve começar com `published: false` e `indexable: false`. Perfis não publicados não são expostos pela rota nem pela API.

## Adicionar um cliente

1. Criar um `slug` permanente, minúsculo e composto por letras, números e hífen.
2. Adicionar um único registo a `lib/businesses.ts`, respeitando `Business`.
3. Preencher `directoryDescription`, contactos, localização e tema apenas com dados confirmados.
4. Guardar recursos em `public/clients/[slug]/logo`, `cover` e `digital-card`.
5. Configurar os caminhos em `assets` e, quando existir, `digitalCard`.
6. Validar diretório, perfil, metadados, vCard, QR e estados sem dados.
7. Alterar `published` apenas depois da aprovação.

Não se copia uma página por cliente. O `layoutVariant` e o `theme` controlam a apresentação, mantendo a estrutura reutilizável.

## Dados e recursos da Auto Formigal

Os contactos, morada, horários, redes sociais, texto e recursos atuais foram recolhidos do website público oficial da Auto Formigal. O logótipo e a fotografia de capa estão guardados localmente em:

```text
public/clients/autoformigal/logo/autoformigal.png
public/clients/autoformigal/cover/exterior-2026.png
```

Continuam assinalados como `TODO`, sem botões artificiais:

- número de WhatsApp confirmado;
- ligação direta para avaliações Google;
- cartão digital final em PNG ou PDF.

## URL canónica e QR permanente

O QR é gerado localmente no browser e contém apenas a URL canónica. Em desenvolvimento:

```text
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Em produção:

```text
NEXT_PUBLIC_SITE_URL=https://card.pirilight.pt
```

Sem configuração, usa-se sempre `https://card.pirilight.pt`; nunca uma URL temporária de preview. A aplicação não altera domínios, DNS, contas, analytics, pagamentos ou serviços externos.

## Exportar QR oficiais para impressão

```bash
npm run generate:qrs
npm run verify:qrs
```

Os masters SVG com o símbolo oficial PiriCard, previews PNG e manifesto são
guardados em `public/piricard-qrs/`. O gerador lê os negócios publicados e valida
cada QR por descodificação antes de o exportar. O domínio de impressão é sempre
`https://card.pirilight.pt`, independentemente das variáveis de desenvolvimento.
Consultar [instruções e cuidados de impressão](public/piricard-qrs/README.md).

## Cartões físicos CR80

```bash
npm run generate:qrs
npm run generate:cards
npm run generate:cards -- --business=oft-racing --copies=10
npm run generate:cards -- --proof=autoformigal,beauty-connection-360,boi-na-brasa
```

O ficheiro principal é `public/piricard-print/piricard-print-a4-final.pdf`:
**oito peças, quatro filas de frente | verso, numa única página A4**. Imprimir
**só de um lado, a 100% / tamanho real**, sem ajustar ou encolher. O design
vertical de 53,98 x 85,60 mm é rodado inteiro na folha; cada corte mede
85,60 x 53,98 mm. Há 4 mm entre cortes, 0,5 mm de sangria na folha e uma faixa
branca reutilizável de mais de 57 mm no fundo. O preview A4 vem do PDF final.

A frente segue as novas referências NFC (telemóvel + ondas, instrução e marca
pequena); o verso tem QR oficial de 34 mm e instruções. Os masters individuais
SVG/PDF mantêm 3 mm de sangria. `--business` produz um job isolado; `--proof`
mantém a prova alternativa de três negócios, não sendo necessário para a folha
final de oito peças. Poppler é obrigatório para validar medidas e cada QR no
PDF, incluindo a rotação. [Especificações e instruções de produção](docs/piricard-print-system.md).

## Privacidade

Não existem cookies, analytics, autenticação, chaves de API nem recolha de dados. As ações usam ligações nativas (`tel:`, `mailto:`), serviços públicos escolhidos pelo utilizador e geração local de QR/vCard.
