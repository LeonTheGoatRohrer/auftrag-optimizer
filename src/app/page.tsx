import { getLeadStats } from "@/lib/db";
import { Overview3D } from "@/components/overview-3d";

export default async function HomePage() {
  const stats = await getLeadStats();

  return (
    <main>
      <Overview3D stats={stats} />
    </main>
  );
}
