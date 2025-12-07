// src/app/api/clinic/appointments/route.ts
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * GET /api/clinic/appointments?date=YYYY-MM-DD
 * Retorna os agendamentos do dia para a clínica do usuário autenticado.
 */
export const GET = auth(async (request) => {
  // 1) Autorização
  if (!request.auth) {
    return NextResponse.json({ error: "Acesso não autorizado!" }, { status: 401 });
  }

  // 2) Entrada
  const dateString = request.nextUrl.searchParams.get("date"); // "YYYY-MM-DD"
  const clinicId = request.auth.user?.id;

  if (!dateString) {
    return NextResponse.json({ error: "Data não informada!" }, { status: 400 });
  }

  // Validação simples do formato YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return NextResponse.json({ error: "Data inválida. Use YYYY-MM-DD." }, { status: 400 });
  }

  if (!clinicId) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 400 });
  }

  try {
    // 3) Limites do dia em UTC (evita problemas de fuso)
    const [y, m, d] = dateString.split("-").map(Number);
    const startUTC = new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
    const endUTC   = new Date(Date.UTC(y, m - 1, d, 23, 59, 59, 999));

    // 4) Consulta no Prisma
    const appointments = await prisma.appointment.findMany({
      where: {
        userId: clinicId,
        appointmentDateTime: { gte: startUTC, lte: endUTC },
        deletedAt: null, // mantenha se estiver usando soft-delete
      },
      include: { service: true },
      orderBy: { appointmentDateTime: "asc" },
    });

    // 5) Saída
    return NextResponse.json(appointments);
  } catch (err) {
    console.error("[/api/clinic/appointments] GET error:", err);
    return NextResponse.json({ error: "Falha ao buscar agendamentos" }, { status: 400 });
  }
}) as any;
