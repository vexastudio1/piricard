import { getPublishedBusinessBySlug } from "@/lib/businesses";
import { getCanonicalProfileUrl, getSiteUrl } from "@/lib/site";
import { createVCard, getVCardFilename } from "@/lib/vcard";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const business = getPublishedBusinessBySlug(slug);
  if (!business) return Response.json({ error: "Perfil não encontrado." }, { status: 404 });

  const filename = getVCardFilename(business);
  const logoUrl = business.assets.logo ? new URL(business.assets.logo, `${getSiteUrl()}/`).toString() : undefined;
  const vCard = createVCard(business, {
    profileUrl: getCanonicalProfileUrl(business.slug),
    logoUrl,
  });
  return new Response(`\uFEFF${vCard}`, {
    headers: {
      "Content-Type": "text/vcard;charset=utf-8",
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "public, max-age=300, s-maxage=300",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
