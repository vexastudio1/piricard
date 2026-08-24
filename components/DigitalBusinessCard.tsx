"use client";

import Image from "next/image";
import { Globe2, Mail, MapPin, Phone } from "lucide-react";
import { ContactDownloadButton } from "@/components/ContactDownloadButton";

interface DigitalBusinessCardProps {
  businessName: string;
  category: string;
  phone?: string;
  email?: string;
  address?: string;
  website: string;
  logo?: string;
  contactEndpoint: string;
  contactFilename: string;
}

function CardFace({ businessName, category, phone, email, address, website, logo, contactEndpoint, contactFilename }: DigitalBusinessCardProps) {
  return (
    <div className="digital-business-card">
      <div className="digital-card-header">
        {logo ? (
          <div className="digital-card-logo">
            <Image src={logo} alt={`Logótipo oficial de ${businessName}`} width={1024} height={1024} />
          </div>
        ) : null}
        <div className="digital-card-copy">
          <p className="digital-card-category">{category}</p>
          <h3>{businessName}</h3>
        </div>
      </div>
      <dl className="digital-card-details">
        {phone ? <div><dt><Phone aria-hidden="true" size={16} /><span className="sr-only">Telefone</span></dt><dd>{phone}</dd></div> : null}
        {email ? <div><dt><Mail aria-hidden="true" size={16} /><span className="sr-only">Email</span></dt><dd>{email}</dd></div> : null}
        <div><dt><Globe2 aria-hidden="true" size={16} /><span className="sr-only">Website</span></dt><dd>{website}</dd></div>
        {address ? <div><dt><MapPin aria-hidden="true" size={16} /><span className="sr-only">Morada</span></dt><dd>{address}</dd></div> : null}
      </dl>
      <div className="digital-card-footer">
        <p className="digital-card-signature">Piri<span>Card</span></p>
        <ContactDownloadButton businessName={businessName} endpoint={contactEndpoint} filename={contactFilename} className="digital-card-save" label="Guardar contacto" />
      </div>
    </div>
  );
}

export function DigitalBusinessCard(props: DigitalBusinessCardProps) {
  return <CardFace {...props} />;
}
