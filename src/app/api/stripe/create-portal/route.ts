import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { auth } from "@/auth";

export async function POST() {
  const session = await auth();

  if (!session?.user?.stripeCustomerId) {
    return NextResponse.json(
      { error: "Cliente Stripe não encontrado." },
      { status: 400 }
    );
  }

  const portal = await stripe.billingPortal.sessions.create({
    customer: session.user.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_URL}/planos`,
  });

  return NextResponse.json({ url: portal.url });
}
