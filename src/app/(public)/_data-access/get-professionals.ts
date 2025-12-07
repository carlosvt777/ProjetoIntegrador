"use server";
import prisma from "@/lib/prisma";

export async function getProfessionals() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        image: true,
        address: true,
        status: true,
        subscription: { select: { status: true } },
      },
      orderBy: { name: "asc" },
    });

    console.log("PROFISSIONAIS =>", users);
    return users;
  } catch (e) {
    console.error("ERRO =>", e);
    return [];
  }
}
