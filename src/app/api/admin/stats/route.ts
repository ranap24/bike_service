import { NextRequest } from "next/server";
import { sql } from "@/lib/db";
import { verifyAccessToken, extractBearerToken } from "@/lib/auth";
import { successResponse, errorResponse, unauthorizedResponse } from "@/utils/response.util";

export async function GET(req: NextRequest) {
  try {
    const token = extractBearerToken(req.headers.get("authorization"));
    if (!token) return unauthorizedResponse();
    const payload = verifyAccessToken(token);
    if (payload.role !== "ADMIN") return errorResponse("Forbidden", "FORBIDDEN", 403);

    const [userCount, captainCount, rideCount, completedCount, revenueRows, recentRides] =
      await Promise.all([
        sql`SELECT COUNT(*)::int AS count FROM users WHERE role = 'RIDER'`,
        sql`SELECT COUNT(*)::int AS count FROM captains`,
        sql`SELECT COUNT(*)::int AS count FROM rides`,
        sql`SELECT COUNT(*)::int AS count FROM rides WHERE status = 'COMPLETED'`,
        sql`SELECT COALESCE(SUM(amount), 0)::float AS total FROM payments WHERE status = 'COMPLETED'`,
        sql`
          SELECT
            r.id, r.status, r.fare, r.created_at AS "createdAt",
            r.pickup_address AS "pickupAddress",
            r.drop_address AS "dropAddress",
            json_build_object('name', u.name) AS rider,
            CASE WHEN c.id IS NOT NULL THEN json_build_object('name', c.name) ELSE NULL END AS captain
          FROM rides r
          LEFT JOIN users u ON u.id = r.rider_id
          LEFT JOIN captains c ON c.id = r.captain_id
          ORDER BY r.created_at DESC
          LIMIT 10
        `,
      ]);

    const totalRides = rideCount[0]?.count ?? 0;
    const completedRides = completedCount[0]?.count ?? 0;

    return successResponse({
      stats: {
        totalUsers: userCount[0]?.count ?? 0,
        totalCaptains: captainCount[0]?.count ?? 0,
        totalRides,
        completedRides,
        totalRevenue: revenueRows[0]?.total ?? 0,
        completionRate: totalRides > 0 ? ((completedRides / totalRides) * 100).toFixed(1) : "0",
      },
      recentRides,
    });
  } catch {
    return unauthorizedResponse();
  }
}

