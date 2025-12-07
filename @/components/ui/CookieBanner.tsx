"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const COOKIE_KEY = "odontoPro_cookie_consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    if (typeof window === "undefined") return;

    const consent = localStorage.getItem(COOKIE_KEY);
    if (!consent) setVisible(true);
  }, []);

  function setConsent(value: "accepted" | "rejected") {
    localStorage.setItem(COOKIE_KEY, value);
    document.cookie = `cookie_consent=${value}; path=/; max-age=31536000; SameSite=Lax`;
    setVisible(false);
  }

  if (!mounted || !visible) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 py-6 px-7">
        <div className="flex gap-3">
          <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
            <span className="text-xl">🍪</span>
          </div>

          <div className="flex-1">
            <h2 className="text-lg font-semibold text-slate-900">
              Nós usamos cookies
            </h2>

            <p className="mt-1 text-sm leading-relaxed text-slate-700">
              Utilizamos cookies para melhorar sua experiência no OdontoPro,
              entender como você usa a plataforma e oferecer funcionalidades
              essenciais.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={() => setConsent("rejected")}
            className="rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition"
          >
            Recusar
          </button>

          <button
            onClick={() => setConsent("accepted")}
            className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-600 transition shadow-sm"
          >
            Aceitar cookies
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
