import { Document, Page, View, Text, Image, Link, StyleSheet } from "@react-pdf/renderer";
import type { Business } from "@/lib/businesses";
import type { PdfBrandTokens } from "@/lib/pdf/brandTokens";
import { buildHoursGrid } from "@/lib/pdf/hours";

// ============================================================================
// THE MASTER SKELETON.
//
// This file is the ONE reusable PiriCard offline-sheet template — structure,
// section order, grid and proportions come from docs/reference/
// PiriCard_Ficha_Esqueleto_Base_sem_QR.pdf and must not change per business.
// Everything that IS allowed to vary per business (colors, fonts, logo,
// content) arrives entirely through the `tokens` and `business` props — see
// lib/pdf/brandTokens.ts. Do not hardcode a business name, color or font
// anywhere in this file.
// ============================================================================

export interface PiriCardSheetProps {
  business: Business;
  tokens: PdfBrandTokens;
  profileUrl: string;
  /** Resolved local filesystem path (already PNG/JPG — react-pdf cannot decode WebP) or undefined if no logo. */
  logoSrc?: string;
  /** DD/MM/AAAA — generation date, shown in the footer. */
  generatedOn: string;
}

function formatPhoneDisplay(value: string): string {
  const digits = value.replace(/\D/g, "");
  const local = digits.startsWith("351") ? digits.slice(3) : digits;
  const formatted = local.length === 9 ? local.replace(/(\d{3})(\d{3})(\d{3})/, "$1 $2 $3") : value;
  return digits.startsWith("351") ? `+351 ${formatted}` : formatted;
}

function stripProtocol(url: string): string {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

export function PiriCardSheet({ business, tokens, profileUrl, logoSrc, generatedOn }: PiriCardSheetProps) {
  const { colors, fonts } = tokens;
  const monoFamily = fonts.mono ?? fonts.body;

  const styles = StyleSheet.create({
    page: { backgroundColor: colors.background, fontFamily: fonts.body, fontSize: 9.5, color: colors.text },

    // ---- Header ------------------------------------------------------------
    header: { backgroundColor: colors.header, paddingTop: 22, paddingBottom: 0, paddingHorizontal: 32 },
    wordmarkRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
    wordmarkDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: colors.accent, marginRight: 6 },
    wordmarkText: { fontFamily: monoFamily, fontSize: 10, fontWeight: 700, color: colors.headerText },
    wordmarkSub: { fontFamily: monoFamily, fontSize: 6.5, letterSpacing: 1, color: colors.headerText, opacity: 0.6, marginLeft: 6, textTransform: "uppercase" },
    identityRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 18 },
    logoBox: { width: 58, height: 58, borderRadius: 10, backgroundColor: "#ffffff", alignItems: "center", justifyContent: "center", marginRight: 16, overflow: "hidden" },
    logoImage: { width: 46, height: 46, objectFit: "contain" },
    identityText: { flex: 1, minWidth: 0 },
    categoryBadge: { fontFamily: monoFamily, fontSize: 7.5, fontWeight: 600, letterSpacing: 0.8, textTransform: "uppercase", color: colors.accent, marginBottom: 4 },
    businessName: { fontFamily: fonts.display, fontWeight: fonts.displayWeight, fontSize: 22, color: colors.headerText, lineHeight: 1.05 },
    identityMeta: { fontSize: 8.5, color: colors.headerText, opacity: 0.72, marginTop: 5 },
    // Solid backgroundColor (not a transparent overlay) — this row is a
    // sibling of `header`, not nested inside it, so a translucent tint would
    // composite against the page's own background instead of the header
    // band behind it. A lighter-brand business (e.g. a near-white page
    // background) would then show cream headerText at low opacity on a
    // near-white row — unreadable. Using colors.header directly guarantees
    // the same contrast the header itself already relies on, for every
    // business regardless of page-background lightness.
    digitalRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: colors.header, marginHorizontal: -32, paddingHorizontal: 32, paddingVertical: 9 },
    digitalPill: { backgroundColor: colors.accent, color: colors.onAccent, fontFamily: monoFamily, fontSize: 7, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
    digitalUrl: { fontFamily: monoFamily, fontSize: 8, color: colors.headerText, opacity: 0.85 },

    // ---- Body ---------------------------------------------------------------
    body: { paddingHorizontal: 32, paddingTop: 20 },
    card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 16, marginBottom: 12 },
    kickerRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
    kickerTick: { width: 14, height: 1.4, backgroundColor: colors.accent, marginRight: 6 },
    kickerText: { fontFamily: monoFamily, fontSize: 8, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: colors.accent },

    fieldGrid: { flexDirection: "row" },
    fieldCol: { flex: 1, minWidth: 0 },
    field: { marginBottom: 10 },
    fieldLabel: { fontFamily: monoFamily, fontSize: 7, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase", color: colors.mutedText, marginBottom: 3 },
    fieldValue: { fontSize: 10, fontWeight: 700, color: colors.text },
    fieldCaption: { fontSize: 7.5, color: colors.mutedText, marginTop: 2 },

    twoUp: { flexDirection: "row" },

    serviceRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 6 },
    serviceDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.accent, marginTop: 3.5, marginRight: 7 },
    serviceText: { fontSize: 9.5, fontWeight: 700, color: colors.text, flex: 1 },
    serviceCaption: { fontSize: 7, color: colors.mutedText, marginTop: 4 },

    hoursRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 4.5, borderBottomWidth: 1, borderBottomColor: colors.border },
    hoursRowLast: { borderBottomWidth: 0 },
    hoursLabel: { fontSize: 9.5, fontWeight: 700, color: colors.text },
    hoursValue: { fontFamily: monoFamily, fontSize: 8.5, color: colors.text },
    hoursValueClosed: { fontFamily: monoFamily, fontSize: 8.5, color: colors.mutedText },

    accessCard: { backgroundColor: colors.tint, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 16 },
    accessTitle: { fontFamily: fonts.display, fontWeight: fonts.displayWeight, fontSize: 13, color: colors.text, marginBottom: 6 },
    accessCopy: { fontSize: 9, color: colors.mutedText, lineHeight: 1.5, marginBottom: 12 },
    accessUrlBox: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingVertical: 10, alignItems: "center" },
    accessUrlText: { fontFamily: monoFamily, fontSize: 9.5, fontWeight: 700, color: colors.accent },

    // ---- Footer --------------------------------------------------------------
    footerNote: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 32, marginTop: 4, marginBottom: 10 },
    footerNoteText: { fontSize: 6.5, color: colors.mutedText },
    footerBar: { backgroundColor: colors.header, paddingHorizontal: 32, paddingVertical: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    footerBrand: { fontFamily: monoFamily, fontSize: 9, fontWeight: 700, color: colors.headerText },
    footerTagline: { fontSize: 7.5, color: colors.headerText, opacity: 0.6, marginLeft: 6 },
    footerDomain: { fontFamily: monoFamily, fontSize: 8, fontWeight: 700, color: colors.accent },
  });

  const city = business.location?.city;
  const positioning = business.positioning;
  const metaLine = [city, positioning].filter(Boolean).join(city && positioning ? "  •  " : "");

  const phoneDisplay = business.contact.phone ? formatPhoneDisplay(business.contact.phone) : undefined;
  const email = business.contact.email;
  const streetAddress = business.location?.streetAddress ?? business.location?.address;
  const cityLine = business.location?.address?.match(/\d{4}-\d{3}\s+.+$/)?.[0] ?? city;
  // Website preferred for the "WEBSITE / WHATSAPP" field; falls back to a
  // displayable WhatsApp number when there's no website — never both, matching
  // the master template's single combined field.
  const websiteOrWhatsapp = business.contact.website
    ? stripProtocol(business.contact.website)
    : business.contact.whatsapp
      ? `WhatsApp ${formatPhoneDisplay(business.contact.whatsapp)}`
      : undefined;

  const services = (business.services ?? []).slice(0, 6);
  const hoursGrid = buildHoursGrid(business.hours);

  const showServices = services.length > 0;
  const showHours = hoursGrid !== null;

  return (
    <Document title={`PiriCard — ${business.name}`} author="PiriCard" subject="Ficha offline PiriCard">
      <Page size="A4" style={styles.page}>
        {/* HEADER ------------------------------------------------------- */}
        <View style={styles.header}>
          <View style={styles.wordmarkRow}>
            <View style={styles.wordmarkDot} />
            <Text style={styles.wordmarkText}>PiriCard</Text>
            <Text style={styles.wordmarkSub}>Ficha Offline</Text>
          </View>

          <View style={styles.identityRow}>
            {logoSrc ? (
              <View style={styles.logoBox}>
                {/* eslint-disable-next-line jsx-a11y/alt-text -- this is
                    @react-pdf/renderer's Image primitive (PDF drawing, not
                    HTML/DOM), which has no `alt` prop to satisfy. */}
                <Image src={logoSrc} style={styles.logoImage} />
              </View>
            ) : null}
            <View style={styles.identityText}>
              <Text style={styles.categoryBadge}>{business.category}</Text>
              <Text style={styles.businessName}>{business.name}</Text>
              {metaLine ? <Text style={styles.identityMeta}>{metaLine}</Text> : null}
            </View>
          </View>
        </View>
        <View style={styles.digitalRow}>
          <Text style={styles.digitalPill}>Ficha Digital</Text>
          <Text style={styles.digitalUrl}>{stripProtocol(profileUrl)}</Text>
        </View>

        {/* BODY ----------------------------------------------------------- */}
        <View style={styles.body}>
          {/* Contacto & Localização */}
          <View style={styles.card}>
            <View style={styles.kickerRow}>
              <View style={styles.kickerTick} />
              <Text style={styles.kickerText}>Contacto & Localização</Text>
            </View>
            <View style={styles.fieldGrid}>
              <View style={styles.fieldCol}>
                {phoneDisplay ? (
                  <View style={styles.field}>
                    <Text style={styles.fieldLabel}>Telefone</Text>
                    <Text style={styles.fieldValue}>{phoneDisplay}</Text>
                    <Text style={styles.fieldCaption}>Contacto principal</Text>
                  </View>
                ) : null}
                {streetAddress ? (
                  <View style={styles.field}>
                    <Text style={styles.fieldLabel}>Morada</Text>
                    <Text style={styles.fieldValue}>{streetAddress}</Text>
                    {cityLine ? <Text style={styles.fieldCaption}>{cityLine}</Text> : null}
                  </View>
                ) : null}
              </View>
              <View style={styles.fieldCol}>
                {email ? (
                  <View style={styles.field}>
                    <Text style={styles.fieldLabel}>Email</Text>
                    <Text style={styles.fieldValue}>{email}</Text>
                  </View>
                ) : null}
                {websiteOrWhatsapp ? (
                  <View style={styles.field}>
                    <Text style={styles.fieldLabel}>{business.contact.website ? "Website" : "WhatsApp"}</Text>
                    <Text style={styles.fieldValue}>{websiteOrWhatsapp}</Text>
                  </View>
                ) : null}
              </View>
            </View>
          </View>

          {/* Serviços principais + Horário */}
          {(showServices || showHours) ? (
            <View style={styles.twoUp}>
              {showServices ? (
                <View style={[styles.card, { flex: 1, marginRight: showHours ? 6 : 0 }]}>
                  <View style={styles.kickerRow}>
                    <View style={styles.kickerTick} />
                    <Text style={styles.kickerText}>Serviços Principais</Text>
                  </View>
                  {services.map((service) => (
                    <View style={styles.serviceRow} key={service}>
                      <View style={styles.serviceDot} />
                      <Text style={styles.serviceText}>{service}</Text>
                    </View>
                  ))}
                </View>
              ) : null}
              {showHours ? (
                <View style={[styles.card, { flex: 1, marginLeft: showServices ? 6 : 0 }]}>
                  <View style={styles.kickerRow}>
                    <View style={styles.kickerTick} />
                    <Text style={styles.kickerText}>Horário</Text>
                  </View>
                  {hoursGrid!.map((row, index) => (
                    <View style={[styles.hoursRow, index === hoursGrid!.length - 1 ? styles.hoursRowLast : {}]} key={row.label}>
                      <Text style={styles.hoursLabel}>{row.label}</Text>
                      <Text style={row.value ? styles.hoursValue : styles.hoursValueClosed}>{row.value ?? "Encerrado"}</Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          ) : null}

          {/* Acesso à ficha digital */}
          <View style={styles.accessCard}>
            <View style={styles.kickerRow}>
              <View style={styles.kickerTick} />
              <Text style={styles.kickerText}>Acesso à Ficha Digital</Text>
            </View>
            <Text style={styles.accessTitle}>Consulta a versão online sempre atualizada</Text>
            <Text style={styles.accessCopy}>
              Esta ficha funciona offline. Para ver alterações futuras em horários, contactos, serviços ou outras informações, acede à ficha digital.
            </Text>
            <Link src={profileUrl} style={styles.accessUrlBox}>
              <Text style={styles.accessUrlText}>{stripProtocol(profileUrl)}</Text>
            </Link>
          </View>
        </View>

        {/* FOOTER ----------------------------------------------------------- */}
        <View style={styles.footerNote}>
          <Text style={styles.footerNoteText}>Ficha gerada automaticamente pelo sistema PiriCard.</Text>
          <Text style={styles.footerNoteText}>Última atualização: {generatedOn}</Text>
        </View>
        <View style={styles.footerBar}>
          <View style={{ flexDirection: "row", alignItems: "baseline" }}>
            <Text style={styles.footerBrand}>PiriCard</Text>
            <Text style={styles.footerTagline}>• Informação essencial do negócio, mesmo offline</Text>
          </View>
          <Text style={styles.footerDomain}>card.pirilight.pt</Text>
        </View>
      </Page>
    </Document>
  );
}
