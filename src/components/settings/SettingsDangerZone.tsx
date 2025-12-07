"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export default function SettingsDangerZone() {
  const router = useRouter();
  const [confirmText, setConfirmText] = useState("");
  const [pending, startTransition] = useTransition();
  const disabled = confirmText !== "EXCLUIR";

  const onDelete = () => {
    startTransition(async () => {
      const res = await fetch("/api/account", { method: "DELETE" });
      if (res.status === 204) {
        // derruba sessão (evita telas quebradas após delete)
        // se usar next-auth cliente:
        // await signOut({ callbackUrl: "/" });
        router.push("/goodbye"); // ou "/"
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data?.error ?? "Falha ao excluir conta.");
      }
    });
  };

  return (
    <div className="rounded-2xl border border-red-300 p-4 mt-8">
      <h3 className="text-lg font-semibold text-red-600">Zona de Perigo</h3>
      <p className="text-sm text-muted-foreground mt-1">
        Esta ação é irreversível. Todos os seus dados e assinaturas serão removidos.
      </p>

      <div className="mt-4 space-y-2">
        <label className="text-sm">
          Digite <span className="font-mono">EXCLUIR</span> para confirmar:
        </label>
        <input
          className="w-full rounded-lg border px-3 py-2"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="EXCLUIR"
        />
      </div>

      <button
        onClick={onDelete}
        disabled={disabled || pending}
        className="mt-4 rounded-xl px-4 py-2 border border-red-600 text-red-600 disabled:opacity-60"
      >
        {pending ? "Excluindo..." : "Excluir minha conta"}
      </button>
    </div>
  );
}
