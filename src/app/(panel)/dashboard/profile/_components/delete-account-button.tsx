"use client";

import { useTransition } from "react";
import { signOut } from "next-auth/react";
import { toast } from "sonner";

export function DeleteAccountButton() {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    const ok = confirm(
      "Tem certeza que deseja excluir sua conta? Essa ação é permanente."
    );
    if (!ok) return;

    startTransition(async () => {
      try {
        const res = await fetch("/api/account", {
          method: "DELETE",
        });

        if (!res.ok) {
          if (res.status === 401) {
            toast.error("Sua sessão expirou. Faça login novamente.");
          } else {
            toast.error("Não foi possível excluir a conta. Tente novamente.");
          }
          return;
        }

        toast.success("Conta excluída com sucesso.");
        await signOut({ callbackUrl: "/" });
      } catch (error) {
        console.error(error);
        toast.error("Erro inesperado ao excluir a conta.");
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className="rounded-md border border-red-500 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
    >
      {isPending ? "Excluindo..." : "Excluir conta"}
    </button>
  );
}
