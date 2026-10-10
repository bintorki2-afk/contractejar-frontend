"use client";

import { X } from "lucide-react";
import Image from "next/image";

import { cn } from "@/lib/utils";

type AppNotificationToastProps = {
  title: string;
  body: string;
  onDismiss?: () => void;
  className?: string;
};

export default function AppNotificationToast({
  title,
  body,
  onDismiss,
  className,
}: AppNotificationToastProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "w-[min(100vw-2rem,22rem)] overflow-hidden rounded-2xl border border-brand/15 bg-white",
        "shadow-[0_20px_50px_-12px_rgba(13,90,80,0.28)]",
        className,
      )}
    >
      <div className="flex items-center justify-center gap-2 bg-linear-to-r from-brand-secondary to-brand px-4 py-2.5">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">

        <Image
          src="/images/logo.png"
          alt="عقدي"
          width={24}
          height={24}
          className="size-4 shrink-0 object-contain"
        />
        </div>
        <span className="font-bold text-white">عقدي</span>
      </div>

      <div className="flex items-start gap-3 p-4">
        <div className="min-w-0 flex-1 text-start">
          <p className="text-sm font-bold leading-snug text-brand">{title}</p>
          {body ? (
            <p className="mt-1 text-xs leading-relaxed text-[#7f7f7f]">{body}</p>
          ) : null}
        </div>

        {onDismiss ? (
          <button
            type="button"
            onClick={onDismiss}
            className="flex size-7 shrink-0 items-center justify-center rounded-full text-[#bdbdbd] transition-colors hover:bg-brand-background hover:text-brand"
            aria-label="إغلاق الإشعار"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
