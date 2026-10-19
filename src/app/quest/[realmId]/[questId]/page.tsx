import { notFound } from "next/navigation";
import { QUESTS } from "@/data/quests";
import { DualPaneWorkspace } from "@/components/DualPaneWorkspace";

interface PageProps {
  params: Promise<{
    realmId: string;
    questId: string;
  }>;
}

export default async function QuestPage({ params }: PageProps) {
  const { realmId, questId } = await params;
  const realmQuests = QUESTS[realmId];

  if (!realmQuests) {
    notFound();
  }

  const questIndex = realmQuests.findIndex((q) => q.id === questId);
  if (questIndex === -1) {
    notFound();
  }

  return (
    <DualPaneWorkspace
      realmId={realmId}
      questId={questId}
    />
  );
}
