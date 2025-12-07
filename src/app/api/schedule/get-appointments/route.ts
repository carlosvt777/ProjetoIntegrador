// Backend /api/schedule/get-appointments
import prisma from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { format } from "date-fns"

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl

  const userId = searchParams.get("userId")
  const dateParam = searchParams.get("date") // YYYY-MM-DD

  if (!userId || !dateParam) {
    return NextResponse.json({ error: "Parâmetros inválidos." }, { status: 400 })
  }

  try {
    // ✅ PASSO 2 CORRIGIDO — Criar limites do dia em UTC
    const [year, month, day] = dateParam.split("-").map(Number)

    const startDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0))
    const endDate = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999))

    console.log("📌 Buscando entre:", startDate.toISOString(), "→", endDate.toISOString())

    const user = await prisma.user.findFirst({
      where: { id: userId },
      select: { times: true },
    })

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 })
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        userId,
        appointmentDateTime: {
          gte: startDate,
          lte: endDate,
        },
        deletedAt: null,
      },
      select: {
        appointmentDateTime: true,
        service: { select: { duration: true } },
      },
    })

    const blockedSlots = new Set<string>()

    for (const apt of appointments) {
      const duration = Math.max(30, apt.service?.duration ?? 30)
      const requiredSlots = Math.max(1, Math.ceil(duration / 30))

      const localTime = new Date(apt.appointmentDateTime)
      const timeStr = format(localTime, "HH:mm")

      const startIndex = user.times.indexOf(timeStr)
      if (startIndex !== -1) {
        for (let i = 0; i < requiredSlots; i++) {
          const slot = user.times[startIndex + i]
          if (slot) blockedSlots.add(slot)
        }
      } else {
        blockedSlots.add(timeStr)
      }
    }

    return NextResponse.json([...blockedSlots])
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Erro ao buscar agendamentos." }, { status: 500 })
  }
}
