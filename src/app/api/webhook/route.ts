// src/app/api/webhook/route.ts
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/utils/stripe'              // sua instância server-side do Stripe
import { manageSubscription } from '@/utils/manage-subscription' // sua função que faz upsert/atualiza a assinatura
import { Plan } from '@prisma/client'

/**
 * Garante execução em Node runtime (não Edge) e sem cache.
 */
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    // 1) Recupera assinatura do Stripe enviada no header
    const signature = req.headers.get('stripe-signature')
    if (!signature) {
      console.error('WEBHOOK: faltando stripe-signature')
      return new NextResponse('Missing stripe-signature', { status: 400 })
    }

    // 2) Pega o corpo bruto (raw) para verificação da assinatura
    const rawBody = await req.text()

    // 3) Segredo do webhook (whsec_...) — obrigatório
    const webhookSecret =
      process.env.STRIPE_WEBHOOK_SECRET || process.env.STRIPE_SECRET_WEBHOOK_KEY

    if (!webhookSecret) {
      console.error('WEBHOOK: STRIPE_WEBHOOK_SECRET ausente no .env')
      return new NextResponse('Missing webhook secret', { status: 500 })
    }

    // 4) Verifica autenticidade do evento
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
    } catch (err: any) {
      console.error('WEBHOOK: assinatura inválida →', err?.message)
      return new NextResponse('Bad signature', { status: 400 })
    }

    console.log('WEBHOOK recebido:', event.type)

    // 5) Lida com os tipos que interessam para billing
    switch (event.type) {
      /**
       * Quando o checkout de assinatura é concluído com sucesso.
       * Ideal para criar/ativar a assinatura no seu banco.
       */
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        const subscriptionId = session.subscription?.toString()
        const customerId = session.customer?.toString()
        const planType = (session.metadata?.type as Plan) ?? 'BASIC'

        if (!subscriptionId || !customerId) {
          console.error(
            'WEBHOOK: checkout.session.completed sem subscriptionId ou customerId'
          )
          break
        }

        // 💡 Dica: Se você cria/recupera o customer com metadata.userId no checkout,
        // dentro do manageSubscription você pode buscar o userId via:
        // const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer
        // const userId = customer.metadata?.userId

        await manageSubscription(subscriptionId, customerId, true, false, planType)
        break
      }

      /**
       * Subscription atualizada (upgrade, downgrade, troca de ciclo, etc.)
       * Bom para manter o status/plan/price atuais no banco.
       */
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        await manageSubscription(sub.id, sub.customer.toString(), false, false)
        break
      }

      /**
       * Subscription cancelada (pelo usuário, por falha de pagamento com cancelamento, etc.)
       * Marque como inativa/cancelada no seu banco.
       */
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        await manageSubscription(sub.id, sub.customer.toString(), false, true)
        break
      }

      /**
       * (Opcional) Pagamento falhou — útil para mandar aviso ao usuário ou tomar ação.
       */
      case 'invoice.payment_failed': {
        const inv = event.data.object as Stripe.Invoice
        console.warn('Pagamento falhou para customer:', inv.customer)
        break
      }

      // Outros eventos são ignorados por enquanto — log para debug:
      default:
        console.log('WEBHOOK: evento ignorado →', event.type)
        break
    }

    // 6) Resposta OK para o Stripe
    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error('WEBHOOK: erro geral →', err)
    return new NextResponse('Webhook error', { status: 500 })
  }
}
