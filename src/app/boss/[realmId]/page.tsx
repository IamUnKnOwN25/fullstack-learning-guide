import { notFound } from "next/navigation";
import { getBossByRealmId } from "@/data/bosses";
import { BossBattleArena } from "@/components/BossBattleArena";

interface PageProps {
  params: Promise<{
    realmId: string;
  }>;
}

export default async function BossPage({ params }: PageProps) {
  const { realmId } = await params;
  const boss = getBossByRealmId(realmId);

  if (!boss) {
    notFound();
  }

  return <BossBattleArena realmId={boss.realmId} />;
}
