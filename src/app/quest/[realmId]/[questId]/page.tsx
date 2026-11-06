import { notFound } from "next/navigation";
import { resolveRealmAlias } from "@/data/realms";
import { getQuestById, getQuestsForRealm } from "@/data/quests";
import { QuestCodingWorkspace } from "@/components/QuestCodingWorkspace";

interface PageProps {
  params: Promise<{
    realmId: string;
    questId: string;
  }>;
}

export default async function QuestPage({ params }: PageProps) {
  const { realmId, questId } = await params;
  const normalizedRealmId = resolveRealmAlias(realmId);
  const realmQuests = getQuestsForRealm(normalizedRealmId);

  if (!realmQuests || realmQuests.length === 0) {
    notFound();
  }

  let cleanQuestId = "";
  try {
    cleanQuestId = decodeURIComponent(questId).trim();
  } catch {
    cleanQuestId = typeof questId === "string" ? questId.trim() : "";
  }

  if (!cleanQuestId) {
    notFound();
  }

  const matchedQuest = getQuestById(normalizedRealmId, cleanQuestId);

  if (!matchedQuest) {
    notFound();
  }

  return (
    <QuestCodingWorkspace
      realmId={matchedQuest.realmId || normalizedRealmId}
      questId={matchedQuest.id}
    />
  );
}
