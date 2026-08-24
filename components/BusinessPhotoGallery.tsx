"use client";

import Image from "next/image";
import { Camera, X } from "lucide-react";
import { useRef, useState } from "react";
import type { BusinessGalleryImage } from "@/lib/businesses";

interface BusinessPhotoGalleryProps {
  businessName: string;
  images: BusinessGalleryImage[];
}

export function BusinessPhotoGallery({ businessName, images }: BusinessPhotoGalleryProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [selectedImage, setSelectedImage] = useState<BusinessGalleryImage>();

  function openImage(image: BusinessGalleryImage, trigger: HTMLButtonElement) {
    if (!image.src) return;
    triggerRef.current = trigger;
    setSelectedImage(image);
    requestAnimationFrame(() => {
      dialogRef.current?.showModal();
      closeButtonRef.current?.focus();
    });
  }

  function closeDialog() {
    dialogRef.current?.close();
    setSelectedImage(undefined);
    requestAnimationFrame(() => triggerRef.current?.focus());
  }

  return (
    <>
      <div className="profile-gallery-grid">
        {images.map((image, index) => {
          const aspectRatio = image.aspectRatio ?? "landscape";
          if (!image.src) {
            return (
              <div className="profile-gallery-placeholder" data-aspect={aspectRatio} key={`${image.alt}-${index}`} aria-label={image.alt}>
                <Camera aria-hidden="true" size={22} />
                <span>{image.placeholderLabel ?? "Fotografia"}</span>
                <small>Fotografia em breve</small>
              </div>
            );
          }

          return (
            <button
              className="profile-gallery-image"
              data-aspect={aspectRatio}
              key={image.src}
              type="button"
              aria-label={`Ampliar fotografia: ${image.alt}`}
              onClick={(event) => openImage(image, event.currentTarget)}
            >
              <Image src={image.src} alt={image.alt} fill sizes="(max-width: 430px) calc(100vw - 40px), 390px" />
            </button>
          );
        })}
      </div>

      <dialog
        ref={dialogRef}
        className="profile-gallery-dialog"
        aria-labelledby="gallery-dialog-title"
        onClose={() => setSelectedImage(undefined)}
        onCancel={(event) => { event.preventDefault(); closeDialog(); }}
        onKeyDown={(event) => { if (event.key === "Escape") { event.preventDefault(); closeDialog(); } }}
        onClick={(event) => { if (event.target === dialogRef.current) closeDialog(); }}
      >
        <div className="profile-gallery-dialog-content">
          <div className="profile-gallery-dialog-header">
            <div>
              <p>Galeria</p>
              <h2 id="gallery-dialog-title">{businessName}</h2>
            </div>
            <button ref={closeButtonRef} type="button" aria-label="Fechar fotografia" onClick={closeDialog}>
              <X aria-hidden="true" size={24} />
            </button>
          </div>
          {selectedImage?.src ? (
            <figure>
              <div className="profile-gallery-lightbox-image">
                <Image src={selectedImage.src} alt={selectedImage.alt} fill sizes="(max-width: 430px) calc(100vw - 32px), 1120px" />
              </div>
              <figcaption>{selectedImage.alt}</figcaption>
            </figure>
          ) : null}
        </div>
      </dialog>
    </>
  );
}
