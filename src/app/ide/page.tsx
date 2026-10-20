import { OnlineMatrixIde } from "@/components/OnlineMatrixIde";

interface PageProps {
  searchParams: Promise<{
    quest?: string;
  }>;
}

export default async function IdePage({ searchParams }: PageProps) {
  const { quest } = await searchParams;

  return <OnlineMatrixIde initialQuestId={quest} />;
}
