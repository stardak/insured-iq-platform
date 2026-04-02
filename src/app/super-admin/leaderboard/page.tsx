import { requireSuperAdmin } from "../auth";
import { getLeaderboardData } from "../actions";
import { LeaderboardTable } from "./leaderboard-table";

export default async function LeaderboardPage() {
  await requireSuperAdmin();
  const data = await getLeaderboardData();

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Leaderboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Top performing tenants ranked by revenue and policies.
        </p>
      </div>
      <LeaderboardTable data={data} />
    </div>
  );
}
