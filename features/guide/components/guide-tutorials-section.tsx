import { Clock3, PlayCircle } from "lucide-react";

import { GUIDE_TUTORIALS } from "@/features/guide/tutorials";
import { cn } from "@/lib/utils";

type GuideTutorialsSectionProps = {
  labels: {
    title: string;
    subtitle: string;
    comingSoon: string;
    watch: string;
  };
};

function toEmbedUrl(url: string): string | null {
  const youtube = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/,
  );
  return youtube ? `https://www.youtube.com/embed/${youtube[1]}` : null;
}

/** Tutorial cards driven by `features/guide/tutorials.ts`. */
export default function GuideTutorialsSection({ labels }: GuideTutorialsSectionProps) {
  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h2 className="inline-flex items-center gap-2 text-2xl font-bold text-foreground">
          <PlayCircle className="size-6 text-brand" aria-hidden="true" />
          {labels.title}
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">{labels.subtitle}</p>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {GUIDE_TUTORIALS.map((tutorial) => {
          const available = Boolean(tutorial.videoUrl);
          const embedUrl = tutorial.videoUrl ? toEmbedUrl(tutorial.videoUrl) : null;

          return (
            <li
              key={tutorial.id}
              className={cn(
                "flex flex-col overflow-hidden rounded-3xl border border-border/60 bg-white shadow-sm dark:bg-white/[0.03]",
                !available && "opacity-90",
              )}
            >
              <div className="relative aspect-video bg-brand-background-green">
                {available && embedUrl ? (
                  <iframe
                    src={embedUrl}
                    title={tutorial.title}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 size-full"
                  />
                ) : available && tutorial.videoUrl ? (
                  <video
                    src={tutorial.videoUrl}
                    controls
                    preload="metadata"
                    className="absolute inset-0 size-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-brand">
                    <PlayCircle className="size-10 opacity-60" aria-hidden="true" />
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-brand shadow-sm dark:bg-[#1a2421] dark:text-[#48c0b8]">
                      {labels.comingSoon}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col gap-2 p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base font-bold text-foreground">{tutorial.title}</h3>
                  {tutorial.duration ? (
                    <span
                      dir="ltr"
                      className="inline-flex shrink-0 items-center gap-1 rounded-full bg-brand-background px-2 py-0.5 text-[11px] font-semibold text-brand"
                    >
                      <Clock3 className="size-3" aria-hidden="true" />
                      {tutorial.duration}
                    </span>
                  ) : null}
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {tutorial.description}
                </p>
                {available && tutorial.videoUrl && !embedUrl ? (
                  <a
                    href={tutorial.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto inline-flex items-center gap-1.5 text-sm font-bold text-brand"
                  >
                    <PlayCircle className="size-4" aria-hidden="true" />
                    {labels.watch}
                  </a>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
