"use client";

import {
  BadgePercent,
  Bell,
  CircleAlert,
  CircleCheck,
  Copy,
  Check,
  Megaphone,
  RotateCcw,
  UserCheck,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import type { AccountNotification } from "@/features/notifications/utils/to-account-notification";
import {
  formatValidUntil,
  isExpired,
  resolveNotificationKind,
  type NotificationKindKey,
  type NotificationTone,
} from "@/features/notifications/utils/notification-kinds";
import { cn } from "@/lib/utils";

const KIND_ICONS: Partial<Record<NotificationKindKey, LucideIcon>> = {
  refund: RotateCcw,
  discount_applied: BadgePercent,
  offer: BadgePercent,
  announcement: Megaphone,
  assigned: UserCheck,
  data_missing: CircleAlert,
  payment_success: CircleCheck,
  notarized: CircleCheck,
  reminder: CircleAlert,
};

const TONE_STYLES: Record<NotificationTone, { icon: string; tag: string }> = {
  brand: { icon: "bg-brand-background-green text-brand", tag: "text-brand" },
  success: {
    icon: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
    tag: "text-emerald-700 dark:text-emerald-300",
  },
  info: {
    icon: "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300",
    tag: "text-sky-700 dark:text-sky-300",
  },
  warning: {
    icon: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
    tag: "text-amber-700 dark:text-amber-300",
  },
  offer: {
    icon: "bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-950/40 dark:text-fuchsia-300",
    tag: "text-fuchsia-700 dark:text-fuchsia-300",
  },
  refund: {
    icon: "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300",
    tag: "text-violet-700 dark:text-violet-300",
  },
};

function formatAmount(amount: number) {
  return `${amount.toLocaleString("en-US", { maximumFractionDigits: 2 })} ريال`;
}

function CouponBlock({ code, validUntil }: { code: string; validUntil: string | null }) {
  const [copied, setCopied] = useState(false);
  const expired = isExpired(validUntil);
  const validLabel = formatValidUntil(validUntil);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("تم نسخ كود الخصم");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("تعذّر النسخ — انسخ الكود يدوياً");
    }
  }

  return (
    <div
      className={cn(
        "mt-2 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-dashed px-3 py-2",
        expired ? "border-border bg-muted/40" : "border-brand/40 bg-brand-background-green/40",
      )}
    >
      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground">كود الخصم</p>
        <p
          className={cn("font-mono text-base font-extrabold tracking-widest", expired ? "text-muted-foreground line-through" : "text-brand")}
          dir="ltr"
        >
          {code}
        </p>
        {validLabel ? (
          <p className={cn("text-[11px]", expired ? "text-red-600" : "text-muted-foreground")}>
            {expired ? `انتهى في ${validLabel}` : `صالح حتى ${validLabel}`}
          </p>
        ) : null}
      </div>
      {!expired ? (
        <button
          type="button"
          onClick={copy}
          className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-brand px-4 text-xs font-bold text-white transition hover:bg-brand/90"
        >
          {copied ? <Check className="size-3.5" aria-hidden="true" /> : <Copy className="size-3.5" aria-hidden="true" />}
          {copied ? "تم النسخ" : "نسخ الكود"}
        </button>
      ) : null}
    </div>
  );
}

export default function NotificationItemCard({
  item,
  dateLabel,
}: {
  item: AccountNotification;
  /** Already formatted on the client (hydration-safe). */
  dateLabel: string;
}) {
  const meta = resolveNotificationKind(item.kind);
  const Icon = KIND_ICONS[meta.key] ?? Bell;
  const tone = TONE_STYLES[meta.tone];
  const showAmount = item.amount != null && (meta.key === "refund" || meta.key === "discount_applied");

  const content = (
    <div className="flex items-start gap-3">
      <span className={cn("mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full", tone.icon)}>
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1 space-y-1 text-start">
        <p className={cn("text-[11px] font-bold", tone.tag)}>{meta.tag}</p>
        <p className="text-sm font-bold text-brand">{item.title}</p>
        {item.body ? <p className="text-xs leading-6 text-muted-foreground">{item.body}</p> : null}
        {showAmount ? (
          <p className="text-xs font-bold text-foreground">
            {meta.key === "refund" ? "المبلغ المسترجع: " : "قيمة الخصم: "}
            <span>{formatAmount(item.amount as number)}</span>
          </p>
        ) : null}
        {dateLabel ? (
          <p className="text-[11px] text-muted-foreground/80">{dateLabel}</p>
        ) : null}
      </div>
    </div>
  );

  return (
    <li
      className={cn(
        "rounded-2xl border bg-white px-4 py-4 shadow-sm dark:bg-[#1a2421]",
        item.isRead ? "border-border/60" : "border-brand/30",
      )}
    >
      {item.href ? (
        <Link href={item.href} className="block">
          {content}
        </Link>
      ) : (
        content
      )}
      {/* Outside the link: copying the code must not open the order. */}
      {item.couponCode ? (
        <div className="ps-12">
          <CouponBlock code={item.couponCode} validUntil={item.validUntil} />
        </div>
      ) : null}
    </li>
  );
}
