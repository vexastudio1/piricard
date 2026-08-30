"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import type { DirectoryBusiness } from "@/lib/businesses";

function normalize(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-PT");
}

export function filterBusinesses(businesses: DirectoryBusiness[], query: string): DirectoryBusiness[] {
  const needle = normalize(query.trim());
  if (!needle) return businesses;
  return businesses.filter((business) => normalize([
    business.name,
    business.category,
    business.city,
    business.directoryDescription,
  ].filter(Boolean).join(" ")).includes(needle));
}

export function BusinessDirectory({ businesses }: { businesses: DirectoryBusiness[] }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => filterBusinesses(businesses, query), [businesses, query]);

  return (
    <section className="directory" aria-labelledby="directory-heading">
      <div className="directory-intro">
        <p className="eyebrow">Diretório PiriCard</p>
        <h1 id="directory-heading">Negócios à distância de um toque.</h1>
        <p>Encontre negócios locais de confiança e aceda rapidamente aos contactos de que precisa.</p>
      </div>

      <div className="search-wrap">
        <label className="sr-only" htmlFor="business-search">Pesquisar por nome, categoria ou localidade</label>
        <Search aria-hidden="true" size={23} />
        <input id="business-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Pesquisar por nome, categoria ou localidade" autoComplete="off" />
        {query && <button type="button" onClick={() => setQuery("")} aria-label="Limpar pesquisa"><X aria-hidden="true" size={18} /><span>Limpar</span></button>}
      </div>

      <div className="result-summary" aria-live="polite">
        <span>{filtered.length === 1 ? "1 negócio" : `${filtered.length} negócios`}</span>
        {query && <span>para “{query}”</span>}
      </div>

      {filtered.length > 0 ? (
        <div className="business-list">
          {filtered.map((business) => (
            <article className="business-row" key={business.slug}>
              <div className="business-identifier">
                {business.logo ? (
                  business.logoOnLight ? (
                    <span className="logo-plate"><Image src={business.logo} alt="" width={190} height={115} /></span>
                  ) : (
                    <Image src={business.logo} alt="" width={190} height={115} />
                  )
                ) : (
                  <span aria-hidden="true">{business.name.slice(0, 1)}</span>
                )}
              </div>
              <div className="business-row-content">
                <h2>{business.name}</h2>
                <div className="business-meta">
                  <span>{business.category}</span>
                  {business.city && <span><MapPin aria-hidden="true" size={16} />{business.city}</span>}
                </div>
                <p>{business.directoryDescription}</p>
              </div>
              <Link className="directory-link" href={`/${business.slug}`} aria-label={`Ver perfil de ${business.name}`}>
                <span>Ver perfil</span><ArrowRight aria-hidden="true" size={21} />
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Search aria-hidden="true" size={26} />
          <h2>Nenhum negócio encontrado.</h2>
          <p>Experimente pesquisar por outro nome, categoria ou localidade.</p>
          <button type="button" onClick={() => setQuery("")}>Limpar pesquisa</button>
        </div>
      )}
    </section>
  );
}
