"use client";

import { Share2 } from "lucide-react";

type BlogShareButtonProps = {
  label: string;
};

export default function BlogShareButton({ label }: BlogShareButtonProps) {
  async function handleShare() {
    const shareData = {
      title: document.title,
      url: window.location.href,
    };

    if (typeof navigator.share === "function") {
      try {
        await navigator.share(shareData);
      } catch {
        return;
      }

      return;
    }

    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      return;
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-brand"
    >
      {label}
      <Share2 className="size-4" aria-hidden="true" />
    </button>
  );
}
