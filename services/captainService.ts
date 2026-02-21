import { prisma } from "../lib/db";

export async function getAllCaptains(page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const [captains, total] = await Promise.all([
    prisma.captain.findMany({
      select: {
        id: true, name: true, email: true, phone: true,
        vehicleType: true, vehiclePlate: true, vehicleModel: true, vehicleColor: true,
        isOnline: true, isVerified: true, isActive: true,
        rating: true, totalRides: true, createdAt: true,
        currentLatitude: true, currentLongitude: true,
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.captain.count(),
  ]);
  return { captains, total, pages: Math.ceil(total / limit), page };
}

export async function updateCaptainLocation(captainId: string, lat: number, lng: number) {
  return prisma.captain.update({
    where: { id: captainId },
    data: { currentLatitude: lat, currentLongitude: lng },
  });
}

export async function toggleCaptainOnlineStatus(captainId: string, isOnline: boolean) {
  return prisma.captain.update({
    where: { id: captainId },
    data: { isOnline },
  });
}

export async function getCaptainProfile(captainId: string) {
  return prisma.captain.findUnique({
    where: { id: captainId },
    select: {
      id: true, name: true, email: true, phone: true, avatar: true,
      vehicleType: true, vehiclePlate: true, vehicleModel: true, vehicleColor: true,
      isOnline: true, isVerified: true, isActive: true,
      rating: true, totalRides: true, createdAt: true,
    },
  });
}
