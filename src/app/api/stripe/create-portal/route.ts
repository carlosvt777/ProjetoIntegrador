// src/app/api/stripe/create-portal/route.ts
import { NextResponse } from "next/server";
import { stripe } from "@/utils/stripe";
import getServerSession from "next-auth"; // default export

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  // Usa a config padrão do NextAuth (sem authOptions)
  const session = await getServerSession();

  if (!session?.user) {
    return NextResponse.json(
      { error: "Não autenticado." },
      { status: 401 }
    );
  }

  // tenta ler tanto stripe_customer_id (snake_case) quanto stripeCustomerId (camelCase)
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

  const portal = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${baseUrl}/planos`,
  });

  return NextResponse.json({ url: portal.url });
}
