// @ts-nocheck

import { NextResponse } from "next/server";
import getSession from "@/lib/getSession";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export async function DELETE() {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      );
    }

    // Tenta por id ou email, usando os dados da sessão
    const where =
      session.user.id
        ? { id: session.user.id }
        : session.user.email
        ? { email: session.user.email }
        : null;

    if (!where) {
      return NextResponse.json(
        { error: "Não foi possível identificar o usuário" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where,
      select: {
        id: true,
        email: true,
        stripe_customer_id: true, // ajuste o nome se no schema for diferente
      },
    });

    // Se já não existir, considera excluído
    if (!user) {
      return new NextResponse(null, { status: 204 });
    }

    const userId = user.id;

    // 1) Cancelar assinaturas do Stripe (se houver customer)
    if (user.stripe_customer_id) {
      try {
        const subs = await stripe.subscriptions.list({
          customer: user.stripe_customer_id,
          status: "all",
          limit: 100,
        });

        for (const s of subs.data) {
          try {
            await stripe.subscriptions.cancel(s.id);
          } catch (err) {
            console.error("Erro ao cancelar assinatura Stripe:", err);
          }
        }

        try {
          await stripe.customers.del(user.stripe_customer_id);
        } catch (err) {
          console.error("Erro ao apagar customer no Stripe:", err);
        }
      } catch (err) {
        console.error("Erro geral com Stripe:", err);
        // não bloqueia exclusão da conta
      }
    }

    // 2) Limpar dados de autenticação (Auth.js PrismaAdapter)
    await prisma.$transaction([
      prisma.session.deleteMany({ where: { userId } }),
      prisma.account.deleteMany({ where: { userId } }),
    ]);

    // 3) Excluir usuário
    await prisma.user.delete({
      where: { id: userId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Erro ao excluir conta:", error);
    return NextResponse.json(
      { error: "Erro ao excluir conta. Tente novamente." },
      { status: 500 }
    );
  }
}
