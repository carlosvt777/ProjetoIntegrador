"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

export const appointmentSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório"),
  email: z.string().email("O email é obrigatório"),
  phone: z.string().min(1, "O telefone é obrigatório"),
  date: z.date({ required_error: "A data é obrigatória" }),
  serviceId: z
    .string({ required_error: "O serviço é obrigatório" })
    .min(1, "O serviço é obrigatório"),
});

export type AppointmentFormData = z.infer<typeof appointmentSchema>;

export function useAppointmentForm() {
  return useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      date: undefined,       // ← não inicie com Date para não forçar seleção automática
      serviceId: undefined,  // ← NUNCA use "" aqui (quebra o <Select> do shadcn)
    },
    mode: "onChange",
  });
}
