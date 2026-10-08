"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Download, Plus, Share, X } from "lucide-react";

import { cn } from "@/lib/utils";

const DISMISS_KEY = "cj-install-dismissed";

const FLOW_PATH_PREFIXES = [
  "/create-contract",
  "/lessor-change",
  "/payment",
  "/login",
  "/track",
  "/r",
  "/properties",
];

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

/**
 * Mobile "install as an app" prompt.
 *
 *  - Android/Chromium: a real one-tap Install button (native beforeinstallprompt).
 *  - iOS Safari: an instructional card pointing at the Share button, because
 *    Apple provides no programmatic install.
 *
 * Shows immediately on mobile for visitors who haven't installed or dismissed it.
 */
export default function InstallPrompt() {
  const t = useTranslations("installPrompt");
  const pathname = usePathname() ?? "";
  const [platform, setPlatform] = useState<"none" | "android" | "ios">("none");
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [shown, setShown] = useState(false);

  useEffect(() => {
    // Already running as an installed app → never show.
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    if (standalone) return;

    // Dismissed earlier → respect that.
    try {
      if (localStorage.getItem(DISMISS_KEY)) return;
    } catch {
      /* storage blocked — carry on */
    }

    const ua = navigator.userAgent || "";
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    if (!isMobile) return;

    const isIOSDevice = /iphone|ipad|ipod/i.test(ua);
    // A2HS only works in Safari, not iOS Chrome/Firefox/Edge.
    const isIOSSafari = isIOSDevice && !/(crios|fxios|edgios|opios)/i.test(ua);

    if (isIOSSafari) {
      // Defer state out of the effect body (avoids a synchronous cascading render).
      const id = requestAnimationFrame(() => {
        setPlatform("ios");
        setShown(true);
      });
      return () => cancelAnimationFrame(id);
    }

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
      setPlatform("android");
      setShown(true);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () =>
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  function dismiss() {
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
    setShown(false);
    window.setTimeout(() => setPlatform("none"), 250);
  }

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice.catch(() => undefined);
    dismiss();
  }

  // Never over the transactional flows: on phones the fixed card sat on top of
  // the wizard's «لنبدأ / متابعة / إرسال الطلب» and payment buttons.
  const onTransactionalFlow = FLOW_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (platform === "none" || onTransactionalFlow) return null;

  return (
    <div
      className={cn(
        "fixed inset-x-3 bottom-safe-4 z-[70] mx-auto max-w-md rounded-3xl border p-4 shadow-2xl transition-all duration-300 lg:hidden",
        "border-black/10 bg-white text-foreground dark:border-white/10 dark:bg-[#0f1a17]",
        shown ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
      )}
      role="dialog"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-brand text-white">
          <Download className="size-5" aria-hidden="true" />
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-extrabold text-foreground">
            {platform === "android" ? t("titleAndroid") : t("titleIos")}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {platform === "android" ? t("subtitleAndroid") : t("subtitleIos")}
          </p>

          {platform === "android" ? (
            <button
              type="button"
              onClick={install}
              className="mt-3 inline-flex h-10 items-center gap-2 rounded-full bg-brand px-5 text-sm font-bold text-white transition hover:bg-brand/90"
            >
              <Download className="size-4" aria-hidden="true" />
              {t("install")}
            </button>
          ) : (
            <div className="mt-3 space-y-1.5 text-xs font-semibold text-foreground">
              <p className="inline-flex items-center gap-1.5">
                <span className="inline-flex size-6 items-center justify-center rounded-lg bg-brand-background text-brand">
                  <Share className="size-3.5" aria-hidden="true" />
                </span>
                {t("iosStep1")}
              </p>
              <p className="inline-flex items-center gap-1.5">
                <span className="inline-flex size-6 items-center justify-center rounded-lg bg-brand-background text-brand">
                  <Plus className="size-3.5" aria-hidden="true" />
                </span>
                {t("iosStep2")}
              </p>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={dismiss}
          aria-label={t("dismiss")}
          className="shrink-0 rounded-full p-1 text-muted-foreground transition hover:bg-black/5 dark:hover:bg-white/10"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
