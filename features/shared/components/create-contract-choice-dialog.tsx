"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, Home } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type ContractChoice = {
  label: string;
  description: string;
  href: string;
  icon: "residential" | "commercial";
};

/**
 * Trigger button that opens a small dialog letting the visitor pick the
 * contract type (residential / commercial) before starting. Used on the 404
 * page so "create a contract" routes to the right service page.
 */
export default function CreateContractChoiceDialog({
  triggerLabel,
  title,
  options,
}: {
  triggerLabel: string;
  title: string;
  options: ContractChoice[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-background px-6 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
        >
          {triggerLabel}
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-lg">{title}</DialogTitle>
        </DialogHeader>
        <div className="mt-2 grid gap-3">
          {options.map((option) => {
            const Icon = option.icon === "residential" ? Home : Building2;
            return (
              <Link
                key={option.href}
                href={option.href}
                onClick={() => setOpen(false)}
                className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-brand/40 hover:bg-brand-background-green"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-background-green text-brand transition-colors group-hover:bg-white">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-foreground">
                    {option.label}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {option.description}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
