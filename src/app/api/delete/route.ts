import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db"; // ou "@/server/db" / "@/lib/prisma" — use o seu

export async function DELETE() {
  const session = await auth();

  if (!session?.user?.id) {
    return new NextResponse("Não autenticado", { status: 401 });
  }

  // ⚠️ HARD DELETE: remove o usuário do banco
  // Se quiser soft delete, troque por update({ data: { deletedAt: new Date() } })
  await db.user.delete({
    where: { id: session.user.id },
  });

  return new NextResponse(null, { status: 204 });
}
