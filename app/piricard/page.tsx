import type { Metadata } from "next";
import { PiriCardCommercialPage } from "@/components/PiriCardCommercialPage";

export const metadata: Metadata = {
  title: "PiriCard para Negócios | NFC, Perfil Digital e QR Code",
  description: "Cartão NFC personalizado com perfil digital e QR Code para o teu negócio.",
};

export default function PiriCardPage() {
  return <PiriCardCommercialPage />;
}
