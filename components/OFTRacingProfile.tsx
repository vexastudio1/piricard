import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Facebook,
  Instagram,
  MapPin,
  Navigation,
  Phone,
  Star,
} from "lucide-react";
import type { ReactNode } from "react";
import { BusinessHoursSchedule, OpeningStatus, TodayHours } from "@/components/OpeningStatus";
import { ContactDownloadButton } from "@/components/ContactDownloadButton";
import { PiriCardBrandMark } from "@/components/PiriCardBrandMark";
import type { Business } from "@/lib/businesses";
import { getMapsHref, getPhoneHref, getSafeExternalUrl } from "@/lib/links";
import { getVCardFilename } from "@/lib/vcard";
import styles from "./OFTRacingProfile.module.css";

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  const local = digits.startsWith("351") ? digits.slice(3) : digits;
  const formatted = local.length === 9 ? local.replace(/(\d{3})(\d{3})(\d{3})/, "$1 $2 $3") : value;
  return digits.startsWith("351") ? `+351 ${formatted}` : formatted;
}

function ExternalLink({ href, children, className, ariaLabel }: { href: string; children: ReactNode; className?: string; ariaLabel?: string }) {
  return <a className={className} href={href} target="_blank" rel="noopener noreferrer" aria-label={ariaLabel}>{children}</a>;
}

export function OFTRacingProfile({ business }: { business: Business }) {
  const phoneHref = getPhoneHref(business.contact.phone);
  const mapsHref = getMapsHref(business.location?.mapsUrl, business.location?.address);
  const reviewHref = getSafeExternalUrl(business.reviewUrl);
  const instagramHref = getSafeExternalUrl(business.socialLinks?.find((link) => link.platform === "instagram")?.url);
  const facebookHref = getSafeExternalUrl(business.socialLinks?.find((link) => link.platform === "facebook")?.url);
  const contactFilename = getVCardFilename(business);
  const phone = business.contact.phone ? formatPhone(business.contact.phone) : undefined;
  const localPhone = phone?.replace(/^\+351\s/, "");
  const locationName = business.location?.city;
  const address = business.location?.address;
  const mapEmbedHref = address
    ? `https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=16&output=embed`
    : undefined;

  return (
    <main className={styles.page}>
      <article className={styles.shell}>
        <nav className={styles.platformBar} aria-label="Navegação PiriCard">
          <Link className={styles.platformBrand} href="/" aria-label="PiriCard — ir para o diretório">
            <PiriCardBrandMark wordmark={<strong>Piri<span>Card</span></strong>} />
          </Link>
          <Link className={styles.directoryLink} href="/">
            Diretório <ArrowUpRight aria-hidden="true" size={14} />
          </Link>
        </nav>

        <header>
          <div className={styles.heroImage}>
            {business.assets.cover ? (
              <Image
                src={business.assets.cover}
                alt={business.assets.coverAlt ?? `Fachada de ${business.name}`}
                fill
                priority
                sizes="(max-width: 960px) 100vw, 960px"
              />
            ) : null}
            <div className={styles.heroFade} aria-hidden="true" />
            {locationName ? <span className={styles.locationPill}><MapPin aria-hidden="true" size={12} />{locationName}</span> : null}
          </div>

          <div className={styles.identity}>
            <div className={styles.identityTopline}>
              {business.assets.logo ? (
                <div className={styles.logo}>
                  <Image src={business.assets.logo} alt={`Logótipo oficial de ${business.name}`} width={480} height={176} sizes="104px" />
                </div>
              ) : null}
              {business.reviewSnapshot ? (
                reviewHref ? (
                  <ExternalLink className={styles.ratingBadge} href={reviewHref} ariaLabel={`Ver avaliações de ${business.name}`}>
                    <strong>{business.reviewSnapshot.rating.toLocaleString("pt-PT", { minimumFractionDigits: 1 })}</strong>
                    <span aria-label={`${business.reviewSnapshot.rating} em 5 estrelas`}>★★★★★</span>
                    <small>{business.reviewSnapshot.count}</small>
                  </ExternalLink>
                ) : (
                  <div className={styles.ratingBadge} aria-label={`${business.reviewSnapshot.rating} em 5 estrelas, ${business.reviewSnapshot.count} avaliações no ${business.reviewSnapshot.source}`}>
                    <strong>{business.reviewSnapshot.rating.toLocaleString("pt-PT", { minimumFractionDigits: 1 })}</strong>
                    <span aria-hidden="true">★★★★★</span>
                    <small>{business.reviewSnapshot.count}</small>
                  </div>
                )
              ) : null}
            </div>

            <h1>OFT Racing Shop</h1>
            <p className={styles.subtitle}>{business.category}{locationName ? ` · ${locationName}` : ""}</p>
            {address ? <p className={styles.address}>{address}</p> : null}
            {business.hours?.length ? (
              <div className={styles.liveStatus}>
                <OpeningStatus hours={business.hours} />
                <TodayHours hours={business.hours} />
              </div>
            ) : null}
          </div>
        </header>

        <nav className={styles.quickActions} aria-label="Ações principais">
          {phoneHref ? (
            <a className={styles.actionDark} href={phoneHref} aria-label={`Ligar para ${business.name}`}>
              <span className={styles.actionIcon}><Phone aria-hidden="true" /></span>
              <span><strong>Ligar</strong><small>{localPhone}</small></span>
            </a>
          ) : null}
          {mapsHref ? (
            <ExternalLink className={styles.actionAccent} href={mapsHref} ariaLabel={`Obter direções para ${business.name}`}>
              <span className={styles.actionIcon}><Navigation aria-hidden="true" /></span>
              <span><strong>Como chegar</strong><small>Google Maps</small></span>
            </ExternalLink>
          ) : null}
          {instagramHref ? (
            <ExternalLink href={instagramHref} ariaLabel={`${business.name} no Instagram`}>
              <span className={styles.actionIcon}><Instagram aria-hidden="true" /></span>
              <span><strong>Instagram</strong><small>@oftracing153</small></span>
            </ExternalLink>
          ) : null}
          <ContactDownloadButton
            businessName={business.name}
            endpoint={`/api/contact/${business.slug}`}
            filename={contactFilename}
            className={styles.saveContact}
            label="Guardar contacto"
          />
        </nav>

        <section className={styles.essentials} aria-labelledby="oft-essentials-heading">
          <p className={styles.kicker} id="oft-essentials-heading">Informação essencial</p>
          <dl className={styles.essentialGrid}>
            <div>
              <dt>Categoria</dt>
              <dd><strong>{business.category}</strong><small>{locationName}</small></dd>
            </div>
            {phoneHref && phone ? (
              <div>
                <dt>Telefone</dt>
                <dd><a href={phoneHref}>{phone}</a><small>Toque para ligar</small></dd>
              </div>
            ) : null}
            {mapsHref && address ? (
              <div>
                <dt>Morada</dt>
                <dd><ExternalLink href={mapsHref}>{business.location?.streetAddress ?? address}</ExternalLink><small>{locationName}</small></dd>
              </div>
            ) : null}
            {business.hours?.length ? (
              <div>
                <dt>Horário de hoje</dt>
                <dd><TodayHours hours={business.hours} /><small>Hora de Lisboa</small></dd>
              </div>
            ) : null}
          </dl>
        </section>

        {(facebookHref || instagramHref) ? (
          <section className={styles.social} aria-labelledby="oft-social-heading">
            <div>
              <p className={styles.kicker}>Redes sociais</p>
              <h2 id="oft-social-heading">Acompanha a OFT</h2>
            </div>
            <nav className={styles.socialLinks} aria-label="Redes sociais da OFT Racing Shop">
              {instagramHref ? (
                <ExternalLink href={instagramHref} ariaLabel={`${business.name} no Instagram`}>
                  <Instagram aria-hidden="true" /><span><strong>Instagram</strong><small>@oftracing153</small></span><ArrowUpRight aria-hidden="true" />
                </ExternalLink>
              ) : null}
              {facebookHref ? (
                <ExternalLink href={facebookHref} ariaLabel={`${business.name} no Facebook`}>
                  <Facebook aria-hidden="true" /><span><strong>Facebook</strong><small>OFT Racing</small></span><ArrowUpRight aria-hidden="true" />
                </ExternalLink>
              ) : null}
            </nav>
          </section>
        ) : null}

        <section className={styles.about} aria-labelledby="oft-about-heading">
          <p className={styles.kicker}>Sobre a OFT</p>
          <h2 id="oft-about-heading">Loja de motos</h2>
          {business.profileDescription ? <p>{business.profileDescription}</p> : null}
        </section>

        {business.reviewSnapshot ? (
          <section className={styles.reviews} aria-labelledby="oft-reviews-heading">
            <div className={styles.sectionIntro}>
              <p className={styles.kicker}>Reputação</p>
              <h2 id="oft-reviews-heading">Avaliações</h2>
            </div>
            <div className={styles.reviewPanel}>
              <strong className={styles.reviewRating}>{business.reviewSnapshot.rating.toLocaleString("pt-PT", { minimumFractionDigits: 1 })}</strong>
              <div className={styles.reviewSummary}>
                <span className={styles.stars} aria-label={`${business.reviewSnapshot.rating} em 5 estrelas`}>
                  {Array.from({ length: 5 }, (_, index) => <Star key={index} aria-hidden="true" />)}
                </span>
                <b>{business.reviewSnapshot.count} avaliações no {business.reviewSnapshot.source}</b>
                <small>Dados consultados em {business.reviewSnapshot.asOf}.</small>
              </div>
              {reviewHref ? <ExternalLink className={styles.reviewLink} href={reviewHref}>Ver avaliações no Google <ArrowUpRight aria-hidden="true" /></ExternalLink> : null}
            </div>
          </section>
        ) : null}

        <section className={styles.visit} aria-label="Horário e localização">
          {business.hours?.length ? (
            <div className={styles.hours}>
              <div className={styles.sectionIntro}>
                <p className={styles.kicker}>Planeia a visita</p>
                <h2>Horário</h2>
              </div>
              <BusinessHoursSchedule hours={business.hours} />
              <p className={styles.caveat}>Hora de Lisboa. Feriados e horários especiais podem diferir.</p>
            </div>
          ) : null}

          {address ? (
            <div className={styles.location}>
              <div className={styles.sectionIntro}>
                <p className={styles.kicker}>Onde estamos</p>
                <h2>Localização</h2>
              </div>
              <address>
                <strong>{business.location?.streetAddress ?? address}</strong>
                {locationName ? <span>{locationName}</span> : null}
              </address>
              <div className={styles.mapCard}>
                {mapEmbedHref ? (
                  <iframe
                    title={`Mapa da ${business.name} em ${locationName ?? "Portugal"}`}
                    src={mapEmbedHref}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                ) : null}
                {mapsHref ? (
                  <ExternalLink className={styles.directionsButton} href={mapsHref} ariaLabel={`Obter direções para ${business.name}`}>
                    <span>Como chegar</span><Navigation aria-hidden="true" />
                  </ExternalLink>
                ) : null}
              </div>
            </div>
          ) : null}
        </section>

        <section className={styles.contacts} aria-labelledby="oft-contacts-heading">
          <p className={styles.kicker}>Fala connosco</p>
          <h2 id="oft-contacts-heading">Contactos</h2>
          <div>
            {phoneHref && phone ? <a href={phoneHref}><small>Telefone</small><strong>{phone}</strong></a> : null}
            {instagramHref ? <ExternalLink href={instagramHref}><small>Instagram</small><strong>@oftracing153</strong></ExternalLink> : null}
            {facebookHref ? <ExternalLink href={facebookHref}><small>Facebook</small><strong>OFT Racing</strong></ExternalLink> : null}
            {mapsHref && address ? <ExternalLink href={mapsHref}><small>Morada</small><strong>{business.location?.streetAddress ?? address}</strong></ExternalLink> : null}
          </div>
        </section>

        <footer className={styles.footer}>
          <div><strong>OFT Racing Shop</strong><p>{address}{phone ? ` · ${phone}` : ""}</p></div>
          <PiriCardBrandMark wordmark={<span>Perfil criado com Piri<span>Card</span></span>} />
        </footer>
      </article>

      {(phoneHref || mapsHref) ? (
        <nav className={styles.stickyBar} aria-label="Ações persistentes">
          <div>
            {phoneHref ? <a href={phoneHref}><Phone aria-hidden="true" /><span>Ligar</span></a> : null}
            {mapsHref ? <ExternalLink href={mapsHref} ariaLabel={`Obter direções para ${business.name}`}><Navigation aria-hidden="true" /><span>Chegar</span></ExternalLink> : null}
          </div>
        </nav>
      ) : null}
    </main>
  );
}
