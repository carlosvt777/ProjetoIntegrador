// src/app/api/stripe/create-portal/route.ts
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/utils/stripe";
import { getToken } from "next-auth/jwt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  // Lê o token JWT da sessão (cookie do NextAuth)
  const token = await getToken({ req });

  if (!token) {
    return NextResponse.json(
      { error: "Não autenticado." },
      { status: 401 }
    );
  }

  // tenta snake_case e camelCase
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
