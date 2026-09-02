import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Bike, ChevronRight, Facebook, Instagram, Leaf, MapPin, Navigation, Phone, Star } from "lucide-react";
import { ContactDownloadButton } from "@/components/ContactDownloadButton";
import { PiriCardBrandMark } from "@/components/PiriCardBrandMark";
import { BoiNaBrasaStickyBar } from "@/components/BoiNaBrasaStickyBar";
import { TripAdvisorMark } from "@/components/icons/TripAdvisorMark";
import { BusinessHoursSchedule, OpeningStatus, TodayHours } from "@/components/OpeningStatus";
import type { Business } from "@/lib/businesses";
import { getMapsHref, getPhoneHref, getSafeExternalUrl, getWhatsAppHref } from "@/lib/links";
import { getPiriCardPdfFilename, getPiriCardPdfPath } from "@/lib/site";
import styles from "./BoiNaBrasaProfile.module.css";

const directionsUrl = "https://www.google.com/maps/dir/?api=1&destination=39.0916177,-9.2583152&destination_place_id=ChIJ7z4J8GDQ8Q0RzV0PksFzKaI";

const essentialInformation = [
  { label: "Telefone e reservas", value: "+351 261 063 480", note: "reservas por telefone · grupos bem-vindos", href: "tel:+351261063480" },
  { label: "Morada", value: "Rua 1.º de Dezembro 5", note: "2560-300 Torres Vedras · centro da cidade" },
  { label: "Preço médio", value: "10–15 € por pessoa", note: "indicado no Google por 47 pessoas" },
  { label: "Cozinha", value: "Grelhados luso-brasileiros", note: "petiscos, sandes e pizzas" },
] as const;

const mains = [
  { name: "Picanha", description: "Arroz, batata frita, feijão e farofa", price: "14,50 €" },
  { name: "Maminha", description: "Batata frita, arroz e feijão", price: "12,90 €" },
  { name: "Bitoque de vaca", description: "Carne de vaca grelhada, arroz, batata frita e ovo estrelado", price: "12,90 €" },
  { name: "Febras grelhadas", description: "Arroz e batata frita", price: "10,90 €" },
] as const;

const snacks = [
  ["Prego no pão", "5,90 €"],
  ["Bifana no pão", "4,90 €"],
  ["Coxinhas · 4", "9,90 €"],
  ["Kibes · 4", "9,90 €"],
  ["Pães de queijo · 6", "4,80 €"],
  ["Torta de pão · fatia", "3,90 €"],
] as const;

const pizzas = [
  { name: "Tropical", description: "Molho de tomate, queijo, ananás e presunto", price: "11,50 €" },
  { name: "Chourição", description: "Base fina com chourição", price: "11,50 €" },
  { name: "Pepperoni", description: "Molho de tomate, queijo e pepperoni", price: "11,50 €" },
] as const;

const praise = [
  "Carne macia e no ponto",
  "Batata frita caseira",
  "Sobremesas caseiras",
  "Relação preço/refeição",
  "Atendimento próximo",
  "Espaço limpo e tranquilo",
] as const;

const ratingDistribution = [
  { stars: 5, count: 77 },
  { stars: 4, count: 13 },
  { stars: 3, count: 1 },
  { stars: 2, count: 1 },
  { stars: 1, count: 3 },
] as const;

function ExternalLink({ href, children, className, ariaLabel }: { href: string; children: React.ReactNode; className?: string; ariaLabel?: string }) {
  return <a className={className} href={href} target="_blank" rel="noopener noreferrer" aria-label={ariaLabel}>{children}</a>;
}

export function BoiNaBrasaProfile({ business }: { business: Business }) {
  const phoneHref = getPhoneHref(business.contact.phone) ?? "tel:+351261063480";
  const mapsHref = getMapsHref(business.location?.mapsUrl, business.location?.address) ?? directionsUrl;
  const reviewHref = business.reviewUrl ?? mapsHref;
  const whatsappHref = getWhatsAppHref(business.contact.whatsapp ?? business.contact.phone);
  const tripAdvisorHref = getSafeExternalUrl(business.externalLinks?.tripAdvisor);
  const deliveryUrl = getSafeExternalUrl(business.externalLinks?.delivery);
  const collectionUrl = getSafeExternalUrl(business.externalLinks?.collection);
  const contactFilename = getPiriCardPdfFilename(business.slug);

  return (
    <main className={`profile-layout ${styles.page}`}>
      <article className={`profile-layout-shell ${styles.shell}`}>
        <nav className={styles.platformBar} aria-label="Navegação PiriCard">
          <Link className={styles.platformBrand} href="/" aria-label="PiriCard — ir para o diretório">
            <PiriCardBrandMark wordmark={<strong>Piri<em>Card</em></strong>} />
          </Link>
          <div className={styles.platformActions}>
            <Link href="/">Diretório <ArrowUpRight aria-hidden="true" size={14} /></Link>
            <ContactDownloadButton
              businessName={business.name}
              endpoint={getPiriCardPdfPath(business.slug)}
              filename={contactFilename}
              className={styles.saveContact}
              label="Guardar contacto"
            />
          </div>
        </nav>

        <header>
          <div className={styles.heroImage}>
            {business.assets.cover ? (
              <Image
                src={business.assets.cover}
                alt={business.assets.coverAlt ?? `Fachada de ${business.name}`}
                fill
                priority
                sizes="(max-width: 1023px) 100vw, 1180px"
              />
            ) : null}
            <div className={styles.heroFade} aria-hidden="true" />
            <span className={styles.locationPill}><MapPin aria-hidden="true" size={12} />Torres Vedras · Centro</span>
          </div>

          <div className={styles.identity}>
            <div className={styles.identityTopline}>
              {business.assets.logo ? (
                <div className={styles.logo}>
                  <Image src={business.assets.logo} alt={`Logótipo do ${business.name}`} width={1242} height={1242} sizes="104px" />
                </div>
              ) : null}
              <ExternalLink className={styles.ratingBadge} href={reviewHref}>
                <strong>4,7</strong><span aria-label="5 estrelas">★★★★★</span><small>95</small>
              </ExternalLink>
            </div>
            <h1>{business.name}</h1>
            <p className={styles.subtitle}>Restaurante &amp; Café · Grelhados luso-brasileiros</p>
            <p className={styles.address}>Rua 1.º de Dezembro 5, Torres Vedras</p>
            {business.hours?.length ? (
              <div className={styles.liveStatus}>
                <OpeningStatus hours={business.hours} />
                <TodayHours hours={business.hours} />
              </div>
            ) : null}
          </div>
        </header>

        <nav className={styles.quickActions} aria-label="Ações rápidas">
          <a className={styles.actionDark} href={phoneHref}><strong>Ligar</strong><small>261 063 480</small><Phone aria-hidden="true" /></a>
          <ExternalLink className={styles.actionDirections} href={directionsUrl}><strong>Como chegar</strong><small>Google Maps</small><Navigation aria-hidden="true" /></ExternalLink>
          <ExternalLink className={styles.actionReview} href={reviewHref} ariaLabel={`Deixar uma avaliação da ${business.name} no Google`}>
            <strong>Deixar avaliação</strong><small>Google</small><Star aria-hidden="true" />
          </ExternalLink>
          {tripAdvisorHref ? (
            <ExternalLink className={styles.actionTripAdvisor} href={tripAdvisorHref}><strong>TripAdvisor</strong><small>Ver perfil</small><TripAdvisorMark aria-hidden="true" /></ExternalLink>
          ) : (
            <span className={`${styles.actionTripAdvisor} ${styles.actionUnavailable}`} aria-disabled="true"><strong>TripAdvisor</strong><small>Perfil a confirmar</small><TripAdvisorMark aria-hidden="true" /></span>
          )}
        </nav>

        <section className={styles.essentials} aria-labelledby="essentials-heading">
          <p className={styles.kicker} id="essentials-heading">Informação essencial</p>
          <dl className={styles.essentialGrid}>
            {essentialInformation.map((item) => (
              <div key={item.label}>
                <dt>{item.label}</dt>
                <dd>{"href" in item ? <a href={item.href}>{item.value}</a> : item.value}<small>{item.note}</small></dd>
              </div>
            ))}
          </dl>
          {business.services?.length ? <ul className={styles.serviceTags}>{business.services.map((service) => <li key={service}>{service}</li>)}</ul> : null}
        </section>

        <section className={styles.social} aria-labelledby="social-heading">
          <h2 id="social-heading">Segue-nos nas redes sociais</h2>
          <div className={styles.socialLinks}>
            <ExternalLink className={styles.facebookButton} href="https://facebook.com/p/Restaurante-Boi-na-Brasa-61590189674905/">
              <Facebook aria-hidden="true" />
              <span>Seguir no Facebook</span>
            </ExternalLink>
            <ExternalLink className={styles.instagramButton} href="https://www.instagram.com/restauranteboinabrasa2026?igsi=eTJ3ZHBvMmx3dWRj">
              <Instagram aria-hidden="true" />
              <span>Seguir no Instagram</span>
            </ExternalLink>
          </div>
        </section>

        <section className={styles.about} aria-labelledby="about-heading">
          <h2 id="about-heading">O restaurante</h2>
          <p>O Boi na Brasa é um restaurante e café de ambiente casual, na Rua 1.º de Dezembro, em pleno centro de Torres Vedras. A ementa cruza grelhados como picanha, maminha, bitoque e febras com acompanhamentos de inspiração brasileira, sandes, salgados e pizzas.</p>
          <p>Para comer no local, levar ou pedir online, a proposta é simples: comida reconfortante, esplanada no centro da cidade e serviço próximo, sem formalidades.</p>
        </section>

        <section className={styles.menu} id="ementa" aria-labelledby="menu-heading">
          <div className={styles.sectionIntro}>
            <h2 id="menu-heading">Da brasa e da casa</h2>
            <span>preços observados em 24/08/2026</span>
          </div>
          <h3>Grelhados e pratos completos</h3>
          <ul className={styles.menuList}>
            {mains.map((item) => <li key={item.name}><span><strong>{item.name}</strong><small>{item.description}</small></span><b>{item.price}</b></li>)}
          </ul>
          <div className={styles.menuColumns}>
            <div>
              <h3>Sandes e salgados</h3>
              <ul className={styles.menuList}>{snacks.map(([name, price]) => <li key={name}><strong>{name}</strong><b>{price}</b></li>)}</ul>
            </div>
            <div>
              <h3>Pizzas</h3>
              <ul className={styles.menuList}>{pizzas.map((item) => <li key={item.name}><span><strong>{item.name}</strong><small>{item.description}</small></span><b>{item.price}</b></li>)}</ul>
              <p>Também há sobremesas caseiras, café, cerveja e vinho. A seleção do dia é indicada no restaurante.</p>
            </div>
          </div>
          <div className={styles.menuLinks}>
            {deliveryUrl ? <ExternalLink className={styles.glovoButton} href={deliveryUrl}><span>Pedir online na Glovo</span><Bike aria-hidden="true" /></ExternalLink> : null}
            {collectionUrl ? <ExternalLink className={styles.tooGoodToGoButton} href={collectionUrl}><span>Recolha na Too Good To Go</span><Leaf aria-hidden="true" /></ExternalLink> : null}
          </div>
          <p className={styles.menuDisclaimer}>Os preços de entrega podem diferir dos preços praticados no restaurante.</p>
        </section>

        <section className={styles.reviews} aria-labelledby="reviews-heading">
          <h2 id="reviews-heading">Avaliações</h2>
          <div className={styles.reviewGrid}>
            <div className={styles.reviewScore}>
              <div><strong>4,7</strong><span aria-label="5 estrelas">★★★★★</span><small>95 críticas<br />Google · 24/08/2026</small></div>
              <ul>
                {ratingDistribution.map((row) => <li key={row.stars}><span>{row.stars}</span><i><b style={{ width: `${Math.round((row.count / 95) * 100)}%` }} /></i><span>{row.count}</span></li>)}
              </ul>
            </div>
            <div className={styles.praise}>
              <p className={styles.kicker}>Mais elogiado</p>
              <ul>{praise.map((item) => <li key={item}>{item}</li>)}</ul>
              <div className={styles.secondaryRatings}><span><strong>100 %</strong><small>recomendam na Glovo · 16</small></span><span><strong>4,8</strong><small>Too Good To Go</small></span></div>
              <div className={styles.reviewActions}>
                <ExternalLink className={styles.reviewWriteCta} href={reviewHref} ariaLabel={`Deixar uma avaliação do ${business.name} no Google`}>
                  <Star aria-hidden="true" size={16} /> Deixar uma avaliação no Google
                </ExternalLink>
                <ExternalLink className={styles.reviewLink} href={reviewHref}>Ler as avaliações no Google <ChevronRight aria-hidden="true" size={15} /></ExternalLink>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.visit} aria-label="Horário e localização">
          <div>
            <h2>Horário</h2>
            {business.hours?.length ? <BusinessHoursSchedule hours={business.hours} /> : null}
            <p className={styles.caveat}>Consulte o horário atualizado antes da visita. Horários especiais e feriados podem variar.</p>
          </div>
          <div>
            <h2>Localização</h2>
            <div className={styles.mapCard}>
              <iframe title="Mapa do Boi na Brasa em Torres Vedras" src="https://maps.google.com/maps?q=39.0916177,-9.2583152&z=17&output=embed" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
              <div><p>Rua 1.º de Dezembro 5, 2560-300 Torres Vedras</p><small>Plus Code 3PRR+JM · estacionamento público pago nas proximidades</small><ExternalLink href={directionsUrl}>Como chegar</ExternalLink></div>
            </div>
          </div>
        </section>

        <section className={styles.contacts} aria-labelledby="contacts-heading">
          <h2 id="contacts-heading">Contactos</h2>
          <div>
            <a href={phoneHref}><small>Telefone e reservas</small><strong>+351 261 063 480</strong></a>
            {deliveryUrl ? <ExternalLink href={deliveryUrl}><small>Entrega</small><strong>Glovo</strong></ExternalLink> : null}
            {collectionUrl ? <ExternalLink href={collectionUrl}><small>Recolha</small><strong>Too Good To Go</strong></ExternalLink> : null}
            <ExternalLink href={mapsHref}><small>Ficha e mapa</small><strong>Google Maps</strong></ExternalLink>
          </div>
        </section>

        <footer className={`profile-layout-footer ${styles.footer}`}>
          <div><strong>Boi na Brasa · Restaurante &amp; Café</strong><p>Rua 1.º de Dezembro 5, 2560-300 Torres Vedras · +351 261 063 480</p></div>
          <p>Perfil PiriCard criado por PiriLight Studio</p>
        </footer>
      </article>

      <BoiNaBrasaStickyBar
        className={styles.stickyBar}
        whatsappClassName={styles.stickyWhatsapp}
        qrClassName={styles.stickyQr}
        phoneClassName={styles.stickyPhone}
        businessName={business.name}
        phoneHref={phoneHref}
        whatsappHref={whatsappHref}
        qrCodeSrc={business.assets.qrCode}
      />
    </main>
  );
}
