import { db } from "@/db";

export async function trackAuthAttempt({
  email,
  userId,
  successful,
  ipAddress,
  userAgent,
}: {
  email: string;
  userId?: string;
  successful: boolean;
  ipAddress?: string;
  userAgent?: string;
}) {
  return db.authAttempt.create({
    data: {
      email,
      userId: userId ?? "",
      successful,
      ipAddress,
      userAgent,
    },
  });
}

export async function getRecentAttempts(email: string, minutes: number = 30) {
  const cutoff = new Date(Date.now() - minutes * 60 * 1000);

  return db.authAttempt.findMany({
    where: {
      email,
      createdAt: {
        gte: cutoff,
      },
      successful: false,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}
