import { Suspense } from "react";
import { ArtistDetailView } from "@/src/presentation/views/ArtistDetailView";

async function ArtistContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ArtistDetailView slug={slug} />;
}

export default function ArtistPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-[1440px] mx-auto px-4 md:px-7 py-12">
          <div className="liquid-glass rounded-[32px] h-48 animate-pulse" />
        </div>
      }
    >
      <ArtistContent params={params} />
    </Suspense>
  );
}
