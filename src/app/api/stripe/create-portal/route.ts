// src/app/api/stripe/create-portal/route.ts
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/utils/stripe";
import { getToken } from "next-auth/jwt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  // Necessário em produção para validar o token
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    return NextResponse.json(
      { error: "Não autenticado." },
      { status: 401 }
    );
  }

  // stripe_customer_id pode estar em snake_case ou camelCase
  const stripeCustomerId =
    (token as any).stripe_customer_id ||
    (token as any).stripeCustomerId;

  if (!stripeCustomerId) {
    console.error("PORTAL: token sem stripe_customer_id", { token });
    return NextResponse.json(
      { error: "Cliente Stripe não encontrado." },
      { status: 400 }
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_URL;
  if (!baseUrl) {
    console.error("PORTAL: NEXT_PUBLIC_URL não configurada.");
    return NextResponse.json(
      { error: "URL pública não configurada." },
      { status: 500 }
    );
  }

  try {
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      // rota correta da página de planos
      return_url: `${baseUrl}/dashboard/plans`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (err) {
    console.error("ERRO AO CRIAR PORTAL STRIPE:", err);
    return NextResponse.json(
      { error: "Falha ao criar portal de assinatura." },
      { status: 500 }
    );
  }
}
