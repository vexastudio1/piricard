import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BusinessProfile } from "@/components/BusinessProfile";
import { getBusinessSlugs, getPublishedBusinessBySlug } from "@/lib/businesses";
import { getCanonicalProfileUrl } from "@/lib/site";

interface ProfilePageProps { params: Promise<{ slug: string }> }

export const dynamicParams = false;

export function generateStaticParams() {
  return getBusinessSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { slug } = await params;
  const business = getPublishedBusinessBySlug(slug);
  if (!business) return { title: "Perfil não encontrado", robots: { index: false, follow: false } };
  const canonical = getCanonicalProfileUrl(business.slug);
  const description = business.profileDescription || business.directoryDescription;
  return {
    title: business.name,
    description,
    alternates: { canonical },
    robots: { index: business.indexable, follow: business.indexable },
    openGraph: {
      title: business.name,
      description,
      url: canonical,
      type: "profile",
      ...(business.assets.socialImage ? { images: [{ url: business.assets.socialImage }] } : {}),
    },
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { slug } = await params;
  const business = getPublishedBusinessBySlug(slug);
  if (!business) notFound();
  return <BusinessProfile business={business} />;
}
