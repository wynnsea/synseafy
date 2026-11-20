import { Suspense } from "react";
import { AlbumDetailView } from "@/src/presentation/views/AlbumDetailView";

async function AlbumContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <AlbumDetailView slug={slug} />;
}

export default function AlbumPage({
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
      <AlbumContent params={params} />
    </Suspense>
  );
}
