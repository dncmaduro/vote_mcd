import Image from "next/image";
import VotePageClient from "@/components/vote/vote-page";

export default async function VotePage({
  searchParams,
}: {
  searchParams: Promise<{ preview?: string }>;
}) {
  const { preview } = await searchParams;

  return (
    <div className="w-full relative min-h-screen">
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <Image
          src="/background.png"
          alt="Background"
          fill
          priority
          className="object-cover"
        />
      </div>
      <VotePageClient
        preview={preview === "pre" ? "pre" : preview === "live" ? "live" : null}
      />
    </div>
  );
}

