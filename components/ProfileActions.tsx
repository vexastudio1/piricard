"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Download, QrCode, Share2, X } from "lucide-react";
import { ContactDownloadButton } from "@/components/ContactDownloadButton";
import { getPiriCardPdfPath } from "@/lib/site";

interface ProfileActionsProps {
  businessName: string;
  canonicalUrl: string;
  slug: string;
  contactFilename: string;
  digitalCard?: { path: string; format: "PNG" | "PDF" };
  showContact?: boolean;
}

export function ProfileActions({ businessName, canonicalUrl, slug, contactFilename, digitalCard, showContact = true }: ProfileActionsProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousOverflow = useRef("");
  const [message, setMessage] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState<string>();
  const [qrError, setQrError] = useState(false);

  function legacyCopyLink(): boolean {
    const textarea = document.createElement("textarea");
    textarea.value = canonicalUrl;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand("copy");
    textarea.remove();
    return copied;
  }

  async function copyLink() {
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(canonicalUrl);
      else if (!legacyCopyLink()) throw new Error("Copy unavailable");
      setMessage("Ligação copiada.");
    } catch {
      setMessage(legacyCopyLink() ? "Ligação copiada." : "Não foi possível copiar a ligação.");
    }
  }

  async function shareProfile() {
    if (navigator.share) {
      setMessage("A abrir opções de partilha…");
      try {
        await navigator.share({ title: businessName, text: `Perfil de ${businessName}`, url: canonicalUrl });
        setMessage("Perfil partilhado.");
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          setMessage("");
          return;
        }
      }
    }
    await copyLink();
  }

  async function openQrDialog() {
    setQrError(false);
    previousOverflow.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.showModal();
    requestAnimationFrame(() => closeButtonRef.current?.focus());

    if (!qrDataUrl) {
      try {
        const QRCode = (await import("qrcode")).default;
        setQrDataUrl(await QRCode.toDataURL(canonicalUrl, {
          errorCorrectionLevel: "M",
          margin: 1,
          width: 512,
          color: { dark: "#071b42", light: "#ffffff" },
        }));
      } catch {
        setQrError(true);
      }
    }
  }

  function closeQrDialog() {
    dialogRef.current?.close();
    document.body.style.overflow = previousOverflow.current;
  }

  useEffect(() => () => {
    document.body.style.overflow = previousOverflow.current;
  }, []);

  return (
    <>
      <div className="card-actions">
        {showContact ? <ContactDownloadButton businessName={businessName} endpoint={getPiriCardPdfPath(slug)} filename={contactFilename} /> : null}
        <button type="button" onClick={shareProfile}>
          <Share2 aria-hidden="true" size={20} />
          <span>Partilhar perfil</span>
        </button>
        <button type="button" onClick={openQrDialog}>
          <QrCode aria-hidden="true" size={20} />
          <span>Mostrar QR</span>
        </button>
        {digitalCard && (
          <a href={digitalCard.path} download>
            <Download aria-hidden="true" size={20} />
            <span>Transferir cartão</span>
          </a>
        )}
      </div>
      <p className="profile-status-message" aria-live="polite">{message}</p>
      <dialog
        className="profile-dialog"
        ref={dialogRef}
        onClick={(event) => { if (event.target === dialogRef.current) closeQrDialog(); }}
        onClose={() => { document.body.style.overflow = previousOverflow.current; }}
        onCancel={(event) => { event.preventDefault(); closeQrDialog(); }}
        onKeyDown={(event) => { if (event.key === "Escape") { event.preventDefault(); closeQrDialog(); } }}
      >
        <div className="profile-dialog-header">
          <div>
            <p className="profile-dialog-kicker">{businessName}</p>
            <h2>Código QR do perfil</h2>
          </div>
          <button ref={closeButtonRef} className="profile-icon-button" type="button" aria-label="Fechar código QR" onClick={closeQrDialog}>
            <X aria-hidden="true" size={21} />
          </button>
        </div>
        {qrDataUrl ? (
          <div className="profile-qr-frame"><Image src={qrDataUrl} alt={`Código QR para o perfil de ${businessName}`} width={512} height={512} unoptimized /></div>
        ) : qrError ? (
          <p className="profile-dialog-copy" role="alert">Não foi possível gerar o código QR.</p>
        ) : (
          <p className="profile-dialog-copy">A gerar o código QR…</p>
        )}
        <p className="profile-dialog-copy">Aponte a câmara para abrir<br /><span>{canonicalUrl}</span></p>
        <button className="profile-copy-button" type="button" onClick={copyLink}>Copiar ligação</button>
        <p className="profile-status-message" aria-live="polite">{message}</p>
      </dialog>
    </>
  );
}
