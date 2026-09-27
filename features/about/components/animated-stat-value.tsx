"use client";

import CountUp from "@/features/shared/motion/count-up";

type AnimatedStatValueProps = {
  /** The real stat string from content, e.g. "+10,000", "98%", "24/7". */
  value: string;
  className?: string;
};

/**
 * Counts up the numeric part of a real stat while preserving any surrounding
 * text (prefix like "+", suffix like "%"). Falls back to the raw value when no
 * Western-digit number can be parsed — never fabricates or reshapes the figure.
 */
export default function AnimatedStatValue({
  value,
  className,
}: AnimatedStatValueProps) {
  const match = value.match(/^(\D*?)([\d.,]+)(.*)$/);

  if (!match) {
    return <span className={className}>{value}</span>;
  }

  const [, prefix, numStr, suffix] = match;
  const cleaned = numStr.replace(/,/g, "");
  const num = Number(cleaned);

  if (!Number.isFinite(num)) {
    return <span className={className}>{value}</span>;
  }

  const decimals = cleaned.includes(".")
    ? (cleaned.split(".")[1]?.length ?? 0)
    : 0;

  return (
    <span className={className}>
      {prefix}
      <CountUp value={num} decimals={decimals} />
      {suffix}
    </span>
  );
}
