// _data-access/get-info-schedule.ts
import prisma from "@/lib/prisma";

export async function getInfoSchedule({ userId }: { userId: string }) {
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      subscription: true,
      services: {
        select: {
          id: true,
          name: true,
          duration: true,
          status: true,
          price: true,
          userId: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });

  return user;
}
