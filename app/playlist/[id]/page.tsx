import { Suspense } from "react";
import { PlaylistDetailView } from "@/src/presentation/views/PlaylistDetailView";

async function PlaylistContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PlaylistDetailView playlistId={id} />;
}

export default function PlaylistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-[1160px] mx-auto px-4 md:px-7 py-12">
          <div className="liquid-glass rounded-[32px] h-48 animate-pulse" />
        </div>
      }
    >
      <PlaylistContent params={params} />
    </Suspense>
  );
}
