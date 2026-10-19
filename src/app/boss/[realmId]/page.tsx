import { notFound } from "next/navigation";
import { BOSSES } from "@/data/bosses";
import { BossBattleArena } from "@/components/BossBattleArena";

interface PageProps {
  params: Promise<{
    realmId: string;
  }>;
}

export default async function BossPage({ params }: PageProps) {
  const { realmId } = await params;
  const boss = BOSSES[realmId];

  if (!boss) {
    notFound();
  }

  return <BossBattleArena boss={boss} realmId={realmId} />;
}
