"use client";

import Image from "next/image";
import { QrCode, X } from "lucide-react";
import { useId, useRef, useState } from "react";
import styles from "./PiriCardQrAction.module.css";

interface PiriCardQrActionProps {
  qrSrc: string;
  businessName: string;
  triggerClassName?: string;
  triggerLabel?: string;
}

export function PiriCardQrAction({ qrSrc, businessName, triggerClassName, triggerLabel = "QR Code" }: PiriCardQrActionProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const titleId = useId();
  const descriptionId = useId();

  function openDialog() {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;
    dialog.showModal();
    setIsOpen(true);
    requestAnimationFrame(() => closeButtonRef.current?.focus());
  }

  function closeDialog() {
    dialogRef.current?.close();
  }

  return (
    <>
      <button
        type="button"
        className={triggerClassName}
        onClick={openDialog}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={`Mostrar QR Code de ${businessName}`}
      >
        <QrCode aria-hidden="true" />
        <span>{triggerLabel}</span>
      </button>

      <dialog
        ref={dialogRef}
        className={styles.dialog}
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        onClose={() => setIsOpen(false)}
        onCancel={(event) => {
          event.preventDefault();
          closeDialog();
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            closeDialog();
          }
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeDialog();
        }}
      >
        <div className={styles.sheet}>
          <header className={styles.header}>
            <div>
              <span className={styles.eyebrow}>Partilhar PiriCard</span>
              <h2 id={titleId}>{businessName}</h2>
            </div>
            <button ref={closeButtonRef} type="button" className={styles.closeButton} onClick={closeDialog} aria-label="Fechar QR Code">
              <X aria-hidden="true" />
            </button>
          </header>

          <div className={styles.qrFrame}>
            <Image
              className={styles.qrImage}
              src={qrSrc}
              alt={`QR Code oficial do PiriCard de ${businessName}`}
              width={720}
              height={720}
              sizes="(max-width: 480px) 76vw, 320px"
              loading="eager"
              unoptimized
            />
          </div>
          <p id={descriptionId}>Digitaliza para abrir este PiriCard</p>
        </div>
      </dialog>
    </>
  );
}
