import { notFound } from "next/navigation";
import { QUESTS } from "@/data/quests";
import { QuestCodingWorkspace } from "@/components/QuestCodingWorkspace";

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

  let matchedQuest = realmQuests.find((q) => q.id === questId);
  if (!matchedQuest) {
    const numMatch = questId.match(/(\d+)$/);
    if (numMatch) {
      const orderNum = parseInt(numMatch[1], 10);
      matchedQuest = realmQuests.find((q) => q.order === orderNum);
    }
  }

  if (!matchedQuest) {
    notFound();
  }

  return (
    <QuestCodingWorkspace
      realmId={realmId}
      questId={matchedQuest.id}
    />
  );
}
