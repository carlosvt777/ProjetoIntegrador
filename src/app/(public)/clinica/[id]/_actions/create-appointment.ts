"use server"

import prisma from '@/lib/prisma'
import { z } from 'zod'

const formSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(1, "O telefone é obrigatório"),
  date: z.date(),  // vem Date correto do formulário
  serviceId: z.string().min(1, "O serviço é obrigatório"),
  time: z.string().min(1, "O horário é obrigatório"), // HH:mm
  clinicId: z.string().min(1, "Clínica inválida"),
})

type FormSchema = z.infer<typeof formSchema>

function combineDateAndTime(date: Date, time: string): Date {
  const [hour, minute] = time.split(":").map(Number)

  const finalDate = new Date(date)
  finalDate.setHours(hour, minute, 0, 0)

  return finalDate
}

export async function createNewAppointment(formData: FormSchema) {

  const schema = formSchema.safeParse(formData)

  if (!schema.success) {
    return { error: schema.error.issues[0].message }
  }

  try {
    const { name, email, phone, date, time, serviceId, clinicId } = formData

    const appointmentDateTime = combineDateAndTime(date, time)

    const newAppointment = await prisma.appointment.create({
      data: {
        name,
        email,
        phone,
        appointmentDateTime, // ✅ AGORA ESTÁ CERTO!
        serviceId,
        userId: clinicId,
      }
    })

    return { data: newAppointment }

  } catch (err) {
    console.error("Erro createNewAppointment:", err)
    return { error: "Erro ao cadastrar agendamento" }
  }
}
