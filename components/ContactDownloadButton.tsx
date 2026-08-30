"use client";

import { useEffect, useRef, useState } from "react";
import { UserRoundPlus } from "lucide-react";

interface ContactDownloadButtonProps {
  businessName: string;
  endpoint: string;
  filename: string;
  className?: string;
  label?: string;
}

export function ContactDownloadButton({ businessName, endpoint, filename, className, label = "Adicionar contacto" }: ContactDownloadButtonProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const objectUrlRef = useRef<string | null>(null);
  const clearStatusRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function clearObjectUrl() {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = null;
  }

  async function downloadContact() {
    if (status === "loading") return;
    setStatus("loading");
    if (clearStatusRef.current) clearTimeout(clearStatusRef.current);

    try {
      const response = await fetch(endpoint, { headers: { Accept: "application/pdf" } });
      if (!response.ok) throw new Error("PDF unavailable");

      const content = await response.arrayBuffer();
      const file = new Blob([content], { type: "application/pdf" });
      clearObjectUrl();
      const objectUrl = URL.createObjectURL(file);
      objectUrlRef.current = objectUrl;

      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = filename;
      anchor.rel = "noopener";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      setStatus("ready");
      clearStatusRef.current = setTimeout(() => setStatus("idle"), 3600);
      setTimeout(clearObjectUrl, 15000);
    } catch {
      setStatus("error");
      clearStatusRef.current = setTimeout(() => setStatus("idle"), 4200);
    }
  }

  useEffect(() => () => {
    if (clearStatusRef.current) clearTimeout(clearStatusRef.current);
    clearObjectUrl();
  }, []);

  const message = status === "ready"
    ? "Contacto pronto para adicionar"
    : status === "error"
      ? "Não foi possível preparar o contacto"
      : "";

  return (
    <>
      <button
        className={className}
        type="button"
        onClick={downloadContact}
        disabled={status === "loading"}
        aria-label={`Adicionar ${businessName} aos contactos`}
      >
        <UserRoundPlus aria-hidden="true" size={21} />
        <span>{status === "loading" ? "A preparar…" : label}</span>
      </button>
      {message ? <div className="profile-toast" role="status" aria-live="polite">{message}</div> : null}
    </>
  );
}
