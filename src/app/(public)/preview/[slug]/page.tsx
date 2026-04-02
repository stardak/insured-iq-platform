import { notFound } from "next/navigation";
import { getPreviewData } from "./actions";
import PreviewClient from "./preview-client";

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { data, error } = await getPreviewData(slug);

  if (error || !data) {
    notFound();
  }

  return <PreviewClient initialData={data} slug={slug} />;
}
