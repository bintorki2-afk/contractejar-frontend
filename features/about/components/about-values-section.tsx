import AboutValueVisual from "@/features/about/components/about-value-visual";
import AboutValuesItem from "@/features/about/components/about-values-item";
import type { AboutVisionMissionResolved } from "@/features/about/types/about-content";

type AboutValuesSectionProps = {
  content: AboutVisionMissionResolved;
};

export default function AboutValuesSection({
  content,
}: AboutValuesSectionProps) {
  return (
    <section className="py-16 md:py-24">
      <div className="container space-y-12 md:space-y-16">
        <header className="mx-auto max-w-3xl space-y-4 text-center">
          <h2 className="text-3xl font-extrabold leading-tight text-foreground md:text-4xl">
            {content.title}
          </h2>
          <p className="text-sm leading-8 text-muted-foreground md:text-base">
            {content.description}
          </p>
        </header>

        <AboutValuesItem
          eyebrow={content.vision.eyebrow}
          title={content.vision.title}
          description={content.vision.description}
          visual={<AboutValueVisual variant="vision" />}
        />

        <AboutValuesItem
          eyebrow={content.mission.eyebrow}
          title={content.mission.title}
          description={content.mission.description}
          reverse
          visual={<AboutValueVisual variant="mission" />}
        />
      </div>
    </section>
  );
}
