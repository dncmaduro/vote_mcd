import Image from "next/image";
import ResultsPageClient from "@/components/results/results-page";

export default function ResultsPage() {
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
      <ResultsPageClient />
    </div>
  );
}

