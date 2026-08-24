import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="site-shell">
      <div className="home-grid" style={{ gridTemplateColumns: "1fr" }}>
        <section className="home-copy">
          <div className="wordmark">PiriCard</div>
          <h1 className="home-title">Este perfil não está disponível.</h1>
          <p className="home-description">Confirme o endereço ou volte à página inicial.</p>
          <Link className="button-secondary home-cta" href="/"><ArrowLeft aria-hidden="true" size={19} /> Voltar ao início</Link>
        </section>
      </div>
    </main>
  );
}
