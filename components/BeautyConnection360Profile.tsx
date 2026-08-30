import Image from "next/image";
import Link from "next/link";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { ArrowUpRight, Calendar, Facebook, Instagram, MapPin, Navigation } from "lucide-react";
import { ContactDownloadButton } from "@/components/ContactDownloadButton";
import { PiriCardBrandMark } from "@/components/PiriCardBrandMark";
import { BusinessPhotoGallery } from "@/components/BusinessPhotoGallery";
import { BeautyTreatmentGroups, type TreatmentGroup } from "@/components/BeautyTreatmentGroups";
import { BeautyStickyBar } from "@/components/BeautyStickyBar";
import type { Business, BusinessGalleryImage } from "@/lib/businesses";
import { getEmailHref, getMapsHref, getPhoneHref, getSafeExternalUrl, getWhatsAppHref } from "@/lib/links";
import { getVCardFilename } from "@/lib/vcard";
import styles from "./BeautyConnection360Profile.module.css";

// Self-hosted via next/font, scoped to this component only — matches the
// Google Fonts pair used in the Claude Design reference (Cormorant Garamond
// for display/headings, Manrope for body copy) without affecting any other
// PiriCard profile.
const bcDisplay = Cormorant_Garamond({ subsets: ["latin"], weight: ["500", "600", "700"], style: ["normal", "italic"], variable: "--bc-nf-display", display: "swap" });
const bcBody = Manrope({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--bc-nf-body", display: "swap" });

// Grouped per the design handoff's own recommended structure (uploads/
// beauticonnection360/BEAUTY-CONNECTION-360-HANDOFF-PIRICARD-WEBSITE.md,
// section 15.5) — confirmed service/treatment names from the live website,
// just organized so ~25 items don't carry equal visual weight.
const treatmentGroups: TreatmentGroup[] = [
  { id: "rosto", title: "Rosto", description: "Cuidados faciais personalizados", items: ["Limpeza de Pele Básica", "Limpeza de Pele Profunda", "Rejuvenescimento / Anti-idade", "Tratamento de Acne", "Dermapen", "Beauty Gold Facial"] },
  { id: "corpo", title: "Corpo", description: "Tratamentos corporais direcionados", items: ["Tonificação", "Flacidez", "Hidratação Profunda", "Lama do Mar Morto", "Tratamento de Pés com Reflexologia"] },
  { id: "rituals", title: "Beauty & Rituals", description: "Mãos, pés e rituais de beleza", items: ["SPA das Mãos", "Manicure (Normal • Gel • Gelinho)", "SPA dos Pés", "Pedicure (Normal • Gel • Gelinho)", "Sobrancelhas", "Buço", "Lifting de Pestanas", "Head SPA"] },
  { id: "bemestar", title: "Bem-estar Integrado", description: "Terapias, fitness e nutrição", items: ["Reiki", "Reflexologia", "Aromaterapia", "Mentorias", "Planos de Fitness Personalizados", "Planos Alimentares Personalizados"] },
];

// Prefilled WhatsApp opening message — used only once a verified WhatsApp
// number exists (see the contact note below); the message text itself is
// static UI copy, not business data.
const whatsappMessage = "Olá! Vi a Beauty Connection 360 no PiriCard e gostaria de mais informações.";

// Same helper (and +351-prefixed display format) already used by
// BusinessProfile/OFTRacingProfile — kept as a local copy rather than a
// shared import since each profile owns its own display formatting.
function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  const local = digits.startsWith("351") ? digits.slice(3) : digits;
  const formatted = local.length === 9 ? local.replace(/(\d{3})(\d{3})(\d{3})/, "$1 $2 $3") : value;
  return digits.startsWith("351") ? `+351 ${formatted}` : formatted;
}

// Five real interior/product photos now supplied (public/clients/
// beauty-connection-360/00.webp…3.webp) — replaces the facade photo (already
// shown in the hero above) and the placeholder slots. 00 is the wall-mounted
// reception sign, used as the large lead image; 0-3 fill the 2-column grid
// below it in the exact order supplied.
const galleryImages: BusinessGalleryImage[] = [
  { src: "/clients/beauty-connection-360/00.webp", alt: "Placa de receção com o logótipo Beauty Connection 360", aspectRatio: "wide" },
  { src: "/clients/beauty-connection-360/0.webp", alt: "Balcão de receção e vitrine de produtos da Beauty Connection 360", aspectRatio: "square" },
  { src: "/clients/beauty-connection-360/1.webp", alt: "Expositor de perfumes e cosmética da Beauty Connection 360", aspectRatio: "square" },
  { src: "/clients/beauty-connection-360/2.webp", alt: "Sala de tratamentos da Beauty Connection 360", aspectRatio: "square" },
  { src: "/clients/beauty-connection-360/3.webp", alt: "Equipamento de spa de pés da Beauty Connection 360", aspectRatio: "square" },
];

export function BeautyConnection360Profile({ business }: { business: Business }) {
  const websiteHref = getSafeExternalUrl(business.contact.website);
  const instagramHref = getSafeExternalUrl(business.socialLinks?.find((link) => link.platform === "instagram")?.url);
  const facebookHref = getSafeExternalUrl(business.socialLinks?.find((link) => link.platform === "facebook")?.url);
  const phoneHref = getPhoneHref(business.contact.phone);
  const phoneDisplay = business.contact.phone ? formatPhone(business.contact.phone) : undefined;
  const emailHref = getEmailHref(business.contact.email);
  const whatsappBaseHref = getWhatsAppHref(business.contact.whatsapp);
  const whatsappHref = whatsappBaseHref ? `${whatsappBaseHref}?text=${encodeURIComponent(whatsappMessage)}` : undefined;
  const mapsHref = getMapsHref(business.location?.mapsUrl, business.location?.address);
  // Same no-API-key embed technique already used by OFTRacingProfile — a
  // Maps *search* keyed to the confirmed address, not a fabricated place ID.
  const mapEmbedHref = business.location?.address
    ? `https://maps.google.com/maps?q=${encodeURIComponent(business.location.address)}&z=16&output=embed`
    : undefined;
  // "Marcar consulta" has no confirmed booking link — Instagram is the closest
  // safe, single-sourced channel for a first contact.
  const bookHref = instagramHref;
  const contactFilename = getVCardFilename(business);
  const city = business.location?.city;
  const streetAddress = business.location?.streetAddress;

  return (
    <main className={`profile-layout ${styles.page} ${bcDisplay.variable} ${bcBody.variable}`}>
      <article className={`profile-layout-shell ${styles.shell}`}>
        <nav className={styles.platformBar} aria-label="Navegação PiriCard">
          <Link className={styles.platformBrand} href="/" aria-label="PiriCard — ir para o diretório">
            <PiriCardBrandMark wordmark={<strong>Piri<span>Card</span></strong>} />
          </Link>
          <Link className={styles.directoryLink} href="/">
            Diretório <ArrowUpRight aria-hidden="true" size={14} />
          </Link>
        </nav>

        <header>
          {/* .heroImage is now just a positioning wrapper (overflow: visible)
              — the actual photo/fade/pill live in .heroImageFrame, which
              carries the aspect-ratio + overflow: hidden clip. The avatar is
              a direct child of the wrapper, absolutely positioned against
              its bottom edge with transform: translateY(50%) — anchored to
              the hero's own bottom edge instead of pulled up from the
              content below, so it's mathematically impossible for it to
              drift with unrelated spacing changes in .identity. */}
          <div className={styles.heroImage}>
            <div className={styles.heroImageFrame}>
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
              {city ? <span className={styles.locationPill}><MapPin aria-hidden="true" size={12} />{city}</span> : null}
            </div>
            {business.assets.logo ? (
              <div className={styles.logo}>
                <Image src={business.assets.logo} alt={`Logótipo de ${business.name}`} width={480} height={480} sizes="88px" />
              </div>
            ) : null}
          </div>

          <div className={styles.identity}>
            <div className={styles.identityTopline}>
              <span className={styles.categoryBadge}>{business.category}</span>
            </div>
            <h1>{business.name}</h1>
            {business.positioning ? <p className={styles.tagline}>{business.positioning}</p> : null}
            {streetAddress ? (
              <p className={styles.address}>
                {streetAddress}
                {city ? <span>2560-288 {city}</span> : null}
              </p>
            ) : city ? <p className={styles.address}>{city}</p> : null}
          </div>
        </header>

        <nav className={styles.quickActions} aria-label="Ações principais">
          {bookHref ? (
            <a className={styles.actionGold} href={bookHref} target="_blank" rel="noopener noreferrer" aria-label={`Marcar consulta com ${business.name} via Instagram`}>
              <span className={styles.actionIcon}><Calendar aria-hidden="true" /></span>
              <span><strong>Marcar consulta</strong><small>Via Instagram</small></span>
            </a>
          ) : null}
          {instagramHref ? (
            <a href={instagramHref} target="_blank" rel="noopener noreferrer" aria-label={`${business.name} no Instagram`}>
              <span className={styles.actionIcon}><Instagram aria-hidden="true" /></span>
              <span><strong>Instagram</strong><small>@beauty_connection360</small></span>
            </a>
          ) : null}
          {mapsHref ? (
            <a href={mapsHref} target="_blank" rel="noopener noreferrer" aria-label={`Obter direções para ${business.name}`}>
              <span className={styles.actionIcon}><Navigation aria-hidden="true" /></span>
              <span><strong>Como chegar</strong><small>Google Maps</small></span>
            </a>
          ) : null}
          <ContactDownloadButton
            businessName={business.name}
            endpoint={`/api/contact/${business.slug}`}
            filename={contactFilename}
            className={styles.saveContact}
            label="Guardar contacto"
          />
        </nav>

        <section className={styles.essentials} aria-labelledby="bc-essentials-heading">
          <p className={styles.kicker} id="bc-essentials-heading">Informação essencial</p>
          <dl className={styles.essentialGrid}>
            <div>
              <dt>Categoria</dt>
              <dd>{business.category}</dd>
            </div>
            {streetAddress ? (
              <div>
                <dt>Morada</dt>
                <dd>
                  {mapsHref ? <a href={mapsHref} target="_blank" rel="noopener noreferrer">{streetAddress}</a> : streetAddress}
                  {city ? <small>2560-288 {city}</small> : null}
                </dd>
              </div>
            ) : null}
            {phoneHref && phoneDisplay ? (
              <div>
                <dt>Telefone</dt>
                <dd><a href={phoneHref}>{phoneDisplay}</a></dd>
              </div>
            ) : null}
            {emailHref ? (
              <div>
                <dt>Email</dt>
                <dd><a href={emailHref}>{business.contact.email}</a></dd>
              </div>
            ) : null}
            {/* Instagram intentionally omitted here — it already has its own
                dedicated Redes Sociais section below, so listing it twice
                was redundant. */}
            {websiteHref ? (
              <div>
                <dt>Website</dt>
                <dd><a href={websiteHref} target="_blank" rel="noopener noreferrer">beautyconnection360.com</a></dd>
              </div>
            ) : null}
          </dl>
        </section>

        {(instagramHref || facebookHref) ? (
          <section className={styles.social} aria-labelledby="bc-social-heading">
            <p className={styles.kicker} id="bc-social-heading">Redes sociais</p>
            <div className={styles.socialGrid}>
              {instagramHref ? (
                <a className={styles.socialInstagram} href={instagramHref} target="_blank" rel="noopener noreferrer" aria-label={`${business.name} no Instagram`}>
                  <span className={styles.socialIcon}><Instagram aria-hidden="true" /></span>
                  <span><strong>Instagram</strong><small>@beauty_connection360</small></span>
                  <ArrowUpRight aria-hidden="true" size={16} className={styles.socialArrow} />
                </a>
              ) : null}
              {facebookHref ? (
                <a className={styles.socialFacebook} href={facebookHref} target="_blank" rel="noopener noreferrer" aria-label={`${business.name} no Facebook`}>
                  <span className={styles.socialIcon}><Facebook aria-hidden="true" /></span>
                  <span><strong>Facebook</strong><small>Beautyconnection360</small></span>
                  <ArrowUpRight aria-hidden="true" size={16} className={styles.socialArrow} />
                </a>
              ) : null}
            </div>
          </section>
        ) : null}

        <section className={styles.aboutDark} aria-labelledby="bc-about-heading">
          <p className={styles.kicker} id="bc-about-heading">Sobre</p>
          <h2 className={styles.aboutQuote}>“A verdadeira beleza nasce da conexão entre corpo, mente e energia.”</h2>
          <p className={styles.aboutCopy}>Não seguimos protocolos padronizados. Cada pessoa é única — por isso cada plano parte do corpo, da pele e do momento de vida de quem o procura, unindo estética, tecnologia avançada e bem-estar numa só experiência de transformação.</p>
          <div className={styles.pillars}>
            <span>Personalização</span>
            <span>Inovação</span>
            <span>Bem-Estar</span>
          </div>

          <div className={styles.diagnosisCard}>
            <p className={styles.kicker}>A sua experiência começa aqui</p>
            <h3 id="bc-diagnosis-heading">Diagnóstico &amp; Conexão Inicial</h3>
            <p>Uma avaliação profunda de corpo, rosto, energia e estilo de vida — o ponto de partida para um Plano de Transformação Personalizado.</p>
            {bookHref ? <a href={bookHref} target="_blank" rel="noopener noreferrer">Pedir avaliação personalizada</a> : null}
          </div>
        </section>

        <section className={styles.treatments} aria-labelledby="bc-treatments-heading">
          <p className={styles.kicker} id="bc-treatments-heading">Tratamentos &amp; Serviços</p>
          <BeautyTreatmentGroups groups={treatmentGroups} className={styles.treatmentGroups} itemClassName={styles.treatmentGroup} />
        </section>

        <section className={styles.gallery} aria-labelledby="bc-gallery-heading">
          <p className={styles.kicker} id="bc-gallery-heading">O nosso espaço</p>
          <BusinessPhotoGallery businessName={business.name} images={galleryImages} />
        </section>

        <section className={styles.location} aria-labelledby="bc-location-heading">
          <p className={styles.kicker} id="bc-location-heading">Localização</p>
          <h2 className={styles.locationHeading}>Visite o nosso espaço</h2>
          {streetAddress ? (
            <div className={styles.locationAddress}>
              <strong>{streetAddress}</strong>
              {city ? <span>2560-288 {city}</span> : null}
            </div>
          ) : null}
          <div className={styles.mapCard}>
            {mapEmbedHref ? (
              <iframe
                title={`Mapa da ${business.name} em ${city ?? "Portugal"}`}
                src={mapEmbedHref}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : null}
            {mapsHref ? (
              <a className={styles.directionsButton} href={mapsHref} target="_blank" rel="noopener noreferrer" aria-label={`Obter direções para ${business.name}`}>
                <span>Como chegar</span><Navigation aria-hidden="true" size={17} />
              </a>
            ) : null}
          </div>
        </section>

        <section className={styles.closing}>
          <h3>“Não é apenas um serviço. É uma experiência de transformação.”</h3>
          <p>Elevando a sua beleza com exclusividade.</p>
          {bookHref ? <a href={bookHref} target="_blank" rel="noopener noreferrer">Marcar consulta</a> : null}
        </section>

        <footer className={`profile-layout-footer ${styles.footer}`}>
          <div><strong>{business.name}</strong><p>{business.category}</p></div>
          <PiriCardBrandMark wordmark={<span>Perfil criado com Piri<span>Card</span></span>} />
        </footer>
      </article>

      <BeautyStickyBar
        className={styles.stickyBar}
        whatsappClassName={styles.stickyWhatsapp}
        phoneClassName={styles.stickyGold}
        mapsClassName={styles.stickyCall}
        phoneHref={phoneHref}
        mapsHref={mapsHref}
        whatsappHref={whatsappHref}
      />
    </main>
  );
}
