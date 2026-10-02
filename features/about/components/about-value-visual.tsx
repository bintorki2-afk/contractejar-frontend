import {
  Award,
  Building2,
  Compass,
  Eye,
  Gauge,
  ShieldCheck,
  Target,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

type AboutValueVariant = "mission" | "vision";

type Pillar = { icon: LucideIcon; label: string };

const VARIANTS: Record<
  AboutValueVariant,
  { headerIcon: LucideIcon; kicker: string; pillars: Pillar[] }
> = {
  mission: {
    headerIcon: Compass,
    kicker: "ركائز رسالتنا",
    pillars: [
      { icon: ShieldCheck, label: "حلول موثوقة ومعتمدة" },
      { icon: Gauge, label: "كفاءة وفعالية في التشغيل" },
      { icon: TrendingUp, label: "نجاح شركائنا وموظفينا" },
    ],
  },
  vision: {
    headerIcon: Eye,
    kicker: "ملامح رؤيتنا",
    pillars: [
      { icon: Award, label: "الخيار الأول في القطاع" },
      { icon: Building2, label: "قطاع المنشآت العقارية" },
      { icon: Target, label: "مستهدفات رؤية ٢٠٣٠" },
    ],
  },
};

/**
 * Content-driven visual for the About vision/mission rows — replaces the
 * meaningless logo-on-white-card with pillars drawn from the section's own
 * text. Pure CSS, theme-adaptive (light/dark).
 */
export default function AboutValueVisual({
  variant,
}: {
  variant: AboutValueVariant;
}) {
  const { headerIcon: HeaderIcon, kicker, pillars } = VARIANTS[variant];

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-brand/15 bg-gradient-to-br from-brand-background-green to-white p-7 shadow-sm md:p-8 dark:border-white/10 dark:from-[#10201b] dark:to-[#0b1512]">
      {/* decorative blurred accents */}
      <span className="pointer-events-none absolute -end-12 -top-12 size-44 rounded-full bg-brand-secondary/20 blur-3xl" />
      <span className="pointer-events-none absolute -start-16 bottom-0 size-40 rounded-full bg-brand/10 blur-3xl" />

      {/* header badge */}
      <div className="relative mb-6 flex flex-row-reverse items-center gap-3 text-right">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-brand text-white shadow-lg shadow-brand/25">
          <HeaderIcon className="size-7" aria-hidden="true" />
        </span>
        <p className="text-base font-bold text-foreground">{kicker}</p>
      </div>

      {/* pillars */}
      <div className="relative space-y-3">
        {pillars.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex flex-row-reverse items-center gap-3 rounded-2xl border border-brand/10 bg-white/70 px-4 py-3.5 text-right backdrop-blur transition-colors hover:border-brand/25 dark:border-white/10 dark:bg-white/5 dark:hover:border-brand-secondary/30"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-background-green text-brand dark:bg-brand-secondary/15 dark:text-brand-secondary">
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <span className="flex-1 text-sm font-semibold text-foreground">
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
