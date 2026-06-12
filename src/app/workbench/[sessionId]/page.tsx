type WorkbenchSessionPageProps = {
  params: Promise<{
    sessionId: string;
  }>;
};

export default async function WorkbenchSessionPage({
  params
}: WorkbenchSessionPageProps) {
  await params;

  return null;
}
