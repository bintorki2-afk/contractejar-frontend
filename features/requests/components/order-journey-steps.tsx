import { Ban, Check, RotateCcw } from "lucide-react";

import {
  ORDER_JOURNEY_SENTENCE,
  type OrderJourneySideState,
  type OrderJourneyStep,
  type OrderJourneyStepState,
} from "@/features/requests/data/order-journey";
import { cn } from "@/lib/utils";

function formatStepDate(value: string | null) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  // Riyadh time, Latin digits, unambiguous day/month/year order — the Arabic
  // locale formatter inserts bidi marks that reorder inside an LTR span.
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Riyadh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function JourneyDot({
  state,
  index,
  neutral,
}: {
  state: OrderJourneyStepState;
  index: number;
  neutral: boolean;
}) {
  if (state === "completed") {
    return (
      <span className="relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full bg-brand text-white shadow-[0_2px_8px_rgba(11,90,60,0.25)]">
        <Check className="size-3.5" aria-hidden="true" strokeWidth={3} />
      </span>
    );
  }

  if (state === "current") {
    return (
      <span className="relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full border-2 border-[#f59e0b] bg-white text-xs font-extrabold text-[#b45309] dark:bg-[#1a2421]">
        <span
          className="absolute inset-0 animate-ping rounded-full border-2 border-[#f59e0b]/50 motion-reduce:hidden"
          aria-hidden="true"
        />
        {index + 1}
      </span>
    );
  }

  if (neutral) {
    return (
      <span className="relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full border-2 border-brand/40 bg-brand-background-green text-xs font-extrabold text-brand dark:border-[#2f403b] dark:text-[#48c0b8]">
        {index + 1}
      </span>
    );
  }

  return (
    <span className="relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full border-2 border-[#d9d9d9] bg-white text-xs font-bold text-[#b0b0b0] dark:border-[#3a4844] dark:bg-[#1a2421] dark:text-[#6f7f7a]">
      {index + 1}
    </span>
  );
}

type OrderJourneyStepsProps = {
  steps: OrderJourneyStep[];
  /** Show the journey sentence under the steps. */
  showSentence?: boolean;
  /** Sentence from the server (`journey_sentence`); falls back to the shared constant. */
  sentence?: string | null;
  /** دفعة هـ: حالة جانبية (ملغي / مسترجع) تُعرض بلون مميز بدل تقدّم الرحلة. */
  sideState?: OrderJourneySideState | null;
  /** Hide step descriptions for a denser list. */
  compact?: boolean;
  /** Explanatory mode (guide): no progress colouring, every step readable. */
  neutral?: boolean;
  className?: string;
};

/**
 * Vertical timeline of the 3 order journey steps (دفعة هـ: قيد المراجعة ←
 * مستلم من الموظف ← تم التوثيق) — used on the payment-success screen, order
 * tracking, and the order detail dialog. A side state (ملغي / مسترجع) is
 * shown as a distinct chip and the steps are dimmed.
 */
export default function OrderJourneySteps({
  steps,
  showSentence = true,
  sentence,
  sideState = null,
  compact = false,
  neutral = false,
  className,
}: OrderJourneyStepsProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {sideState ? <OrderJourneySideStateChip state={sideState} /> : null}

      <ol className={cn("relative space-y-0", sideState && "opacity-60")} aria-live="polite">
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          const nextState = isLast ? null : steps[index + 1]?.state;
          const lineClass = neutral
            ? "bg-brand/20"
            : step.state === "completed"
              ? nextState === "current"
                ? "bg-linear-to-b from-brand to-[#f59e0b]"
                : nextState === "completed"
                  ? "bg-brand"
                  : "bg-[#e8e8e8] dark:bg-[#2f403b]"
              : "bg-[#e8e8e8] dark:bg-[#2f403b]";
          const dateLabel = formatStepDate(step.at);

          return (
            <li
              key={`${step.key}-${index}`}
              className={cn("relative flex gap-3", compact ? "pb-3 last:pb-0" : "pb-5 last:pb-0")}
            >
              {!isLast ? (
                <span
                  className={cn("absolute inset-s-3 top-7 bottom-0 w-0.5", lineClass)}
                  aria-hidden="true"
                />
              ) : null}

              <JourneyDot state={step.state} index={index} neutral={neutral} />

              <div className="min-w-0 space-y-0.5 pt-1 text-start">
                <p
                  className={cn(
                    "text-sm font-extrabold leading-snug",
                    step.state === "completed" && "text-brand dark:text-[#48c0b8]",
                    step.state === "current" && "text-[#b45309] dark:text-[#fbbf24]",
                    step.state === "pending" &&
                      (neutral
                        ? "text-foreground"
                        : "text-[#9a9a9a] dark:text-[#6f7f7a]"),
                  )}
                  aria-current={step.state === "current" ? "step" : undefined}
                >
                  {step.label}
                </p>
                {!compact && step.description ? (
                  <p
                    className={cn(
                      "text-xs leading-5",
                      step.state === "current"
                        ? "font-semibold text-[#b45309] dark:text-[#fbbf24]"
                        : "text-[#8a8a8a] dark:text-[#9eb5af]",
                    )}
                  >
                    {step.description}
                  </p>
                ) : null}
                {dateLabel || step.by ? (
                  <p className="flex flex-wrap items-center gap-x-2 text-[11px] text-[#9a9a9a] dark:text-[#6f7f7a]">
                    {dateLabel ? <span dir="ltr">{dateLabel}</span> : null}
                    {step.by ? <span>· {step.by}</span> : null}
                  </p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>

      {showSentence && !sideState ? <OrderJourneySentence sentence={sentence} /> : null}
    </div>
  );
}

/** جملة الرحلة (دفعة هـ): من الخادم عند توفرها، وإلا الثابتة المشتركة. */
export function OrderJourneySentence({
  className,
  sentence,
}: {
  className?: string;
  sentence?: string | null;
}) {
  return (
    <p
      className={cn(
        "rounded-2xl border border-brand/15 bg-brand-background-green px-4 py-3 text-xs font-semibold leading-6 text-brand dark:border-[#2f403b] dark:text-[#9eb5af]",
        className,
      )}
    >
      {sentence?.trim() || ORDER_JOURNEY_SENTENCE}
    </p>
  );
}

/** شارة الحالة الجانبية: «ملغي» رمادي / «مسترجع» بنفسجي (أو لون الخادم). */
export function OrderJourneySideStateChip({ state }: { state: OrderJourneySideState }) {
  const color = state.color || (state.key === "refunded" ? "#7c3aed" : "#6b7280");
  const Icon = state.key === "refunded" ? RotateCcw : Ban;
  const dateLabel = formatStepDate(state.at);

  return (
    <div
      className="flex flex-wrap items-center gap-2 rounded-2xl border px-4 py-3"
      style={{ borderColor: `${color}55`, backgroundColor: `${color}14` }}
      data-testid="journey-side-state"
    >
      <span
        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold text-white"
        style={{ backgroundColor: color }}
      >
        <Icon className="size-3.5" aria-hidden="true" />
        {state.label}
      </span>
      {dateLabel ? (
        <span className="text-[11px] text-[#6f6f6f] dark:text-[#9eb5af]" dir="ltr">
          {dateLabel}
        </span>
      ) : null}
    </div>
  );
}
