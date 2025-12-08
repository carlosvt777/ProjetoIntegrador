// src/app/api/stripe/create-portal/route.ts
import { NextResponse } from "next/server";
import { stripe } from "@/utils/stripe"; // mesma instância usada no webhook
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // suas opções do NextAuth

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  // Busca a sessão do usuário autenticado
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json(
      { error: "Não autenticado." },
      { status: 401 }
    );
  }

  // Ajuste o nome do campo conforme está no seu JWT/session
  // Pelo seu schema Prisma é stripe_customer_id (snake_case)
  const stripeCustomerId =
    (session.user as any).stripe_customer_id ||
    (session.user as any).stripeCustomerId;

  if (!stripeCustomerId) {
    console.error(
      "PORTAL: usuário logado sem stripe_customer_id na sessão",
      { user: session.user }
    );
    return NextResponse.json(
      { error: "Cliente Stripe não encontrado." },
      { status: 400 }
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_URL;
  if (!baseUrl) {
    console.error("PORTAL: NEXT_PUBLIC_URL ausente no .env");
    return NextResponse.json(
      { error: "Configuração de URL ausente." },
      { status: 500 }
    );
  }

  // Cria sessão do portal de cobrança
  const portal = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${baseUrl}/planos`,
  });

  return NextResponse.json({ url: portal.url });
}
