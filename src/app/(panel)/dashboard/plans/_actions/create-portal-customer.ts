"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { stripe } from "@/utils/stripe";

type CreatePortalCustomerResponse = {
  sessionId: string;
  error?: string;
};

export async function createPortalCustomer(): Promise<CreatePortalCustomerResponse> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      sessionId: "",
      error: "Usuário não autenticado.",
    };
  }

  const user = await prisma.user.findFirst({
    where: {
      id: session.user.id,
    },
  });

  if (!user) {
    return {
      sessionId: "",
      error: "Usuário não encontrado.",
    };
  }

  // 1) Garante que temos um customerId válido na Stripe
  let customerId = user.stripe_customer_id ?? null;

  // Função auxiliar pra criar customer + salvar no Prisma
  const ensureCustomer = async () => {
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
        name: user.name ?? undefined,
      });

      customerId = customer.id;

      await prisma.user.update({
        where: { id: user.id },
        data: { stripe_customer_id: customerId },
      });
    }
  };

  await ensureCustomer();

  const baseUrl = process.env.NEXT_PUBLIC_URL;
  if (!baseUrl) {
    console.error("ERRO: NEXT_PUBLIC_URL não configurada no ambiente.");
    return {
      sessionId: "",
      error: "Configuração de URL ausente. Contate o suporte.",
    };
  }

  try {
    // 2) Tenta criar o portal com o customer atual
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId as string,
      return_url: `${baseUrl}/planos`,
    });

    return {
      sessionId: portalSession.url ?? "",
    };
  } catch (err: any) {
    console.error("ERRO AO CRIAR PORTAL (1ª tentativa):", err);

    // 3) Se o problema for "No such customer", recria o customer e tenta de novo
    if (err?.code === "resource_missing" && err?.param === "customer") {
      console.warn(
        "Customer inválido na Stripe, recriando customer e tentando novamente..."
      );

      customerId = null;
      await ensureCustomer();

      const portalSession = await stripe.billingPortal.sessions.create({
        customer: customerId as string,
        return_url: `${baseUrl}/planos`,
      });

      return {
        sessionId: portalSession.url ?? "",
      };
    }

    // 4) Qualquer outro erro
    return {
      sessionId: "",
      error: "Não foi possível abrir o portal de assinatura.",
    };
  }
}
