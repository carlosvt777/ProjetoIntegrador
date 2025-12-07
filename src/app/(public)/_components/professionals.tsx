"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

type Professional = {
  id: string;
  name: string | null;
  image: string | null;
  address: string | null;
  subscription?: { status: string | null } | null;
};

export function Professionals({ professionals }: { professionals: Professional[] }) {
  const [expanded, setExpanded] = useState(false);

  const items = expanded ? professionals ?? [] : (professionals ?? []).slice(0, 8);
  const empty = (professionals ?? []).length === 0;

  if (empty) {
    return <p className="text-center text-sm md:text-base">Nenhuma clínica disponível no momento.</p>;
  }

  return (
    <>
      <div
        className={`
          grid gap-6 max-w-6xl mx-auto
          grid-cols-1 sm:grid-cols-2 lg:grid-cols-4
          ${expanded ? "" : "[grid-template-rows:repeat(2,minmax(0,1fr))] overflow-hidden"}
        `}
      >
        {items.map((p) => <Card key={p.id} p={p} />)}
      </div>

      {!expanded && (professionals?.length ?? 0) > 8 && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => setExpanded(true)}
            className="px-4 h-10 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium"
          >
            Ver mais profissionais
          </button>
        </div>
      )}

      {expanded && (professionals?.length ?? 0) > 8 && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => setExpanded(false)}
            className="px-4 h-10 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-medium"
          >
            Mostrar menos
          </button>
        </div>
      )}
    </>
  );
}

function Card({ p }: { p: Professional }) {
  const verified = (p.subscription?.status ?? "").toLowerCase() === "active";

  return (
    <div className="rounded-2xl bg-white border shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
      <div className="relative h-44 w-full">
        {p.image ? (
          <Image src={p.image} alt={p.name ?? "Clínica"} fill className="object-cover" />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-5xl font-semibold text-gray-400">
            {initials(p.name)}
          </div>
        )}

        {verified && (
          <span className="absolute top-2 right-2 inline-flex items-center justify-center px-2 py-1 rounded-full bg-amber-400 text-black text-xs font-semibold shadow">
            ★
          </span>
        )}
      </div>

      <div className="p-4 flex-1">
        <h3 className="font-semibold text-[15px] leading-tight line-clamp-1">
          {p.name ?? "Clínica"}
        </h3>

        {/* 🚫 Endereço removido */}
      </div>

      <div className="px-4 pb-4">
        <Link
          href={`/clinica/${p.id}`}
          target="_blank"
          className="w-full h-10 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium tracking-tight inline-flex items-center justify-center"
        >
          Agendar horário →
        </Link>
      </div>
    </div>
  );
}

function initials(name?: string | null) {
  if (!name) return "R";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((s) => s?.[0]?.toUpperCase() ?? "").join("") || "R";
}
