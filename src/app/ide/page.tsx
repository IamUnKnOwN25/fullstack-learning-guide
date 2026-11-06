import { OnlineMatrixIde } from "@/components/OnlineMatrixIde";

interface PageProps {
  searchParams?: Promise<{
    quest?: string | string[];
    [key: string]: string | string[] | undefined;
  }>;
}

export default async function IdePage({ searchParams }: PageProps = {}) {
  const params = searchParams ? await searchParams : undefined;
  const rawQuest = params?.quest;
  const questCandidate = Array.isArray(rawQuest) ? rawQuest[0] : rawQuest;
  const quest =
    typeof questCandidate === "string" ? questCandidate.trim() || undefined : undefined;

  return <OnlineMatrixIde initialQuestId={quest} />;
}
