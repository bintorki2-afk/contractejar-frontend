"use client";

import { Plus, X } from "lucide-react";
import { useState } from "react";

import { Input } from "@/components/ui/input";
import CreateContractFinanceAccordion from "@/features/create-contract/components/create-contract-finance-accordion";
import type { CreateContractLabels } from "@/features/create-contract/types/create-contract-labels";
import {
  getFilledOtherConditions,
  MAX_OTHER_CONDITIONS,
} from "@/features/create-contract/types/finance-step";

type CreateContractFinanceConditionsSectionProps = {
  labels: CreateContractLabels["finance"]["otherConditions"];
  enabled: boolean;
  value: string[];
  onEnabledChange: (enabled: boolean) => void;
  onChange: (value: string[]) => void;
};

function formatAddedSummary(
  count: number,
  labels: CreateContractLabels["finance"]["otherConditions"],
) {
  if (count === 1) {
    return labels.addedSummaryOne;
  }

  if (count === 2) {
    return labels.addedSummaryTwo;
  }

  if (count >= 3 && count <= 10) {
    return labels.addedSummaryFew.replace("{count}", String(count));
  }

  return labels.addedSummaryMany.replace("{count}", String(count));
}

export default function CreateContractFinanceConditionsSection({
  labels,
  enabled,
  value,
  onEnabledChange,
  onChange,
}: CreateContractFinanceConditionsSectionProps) {
  const conditions = value;
  const filledCount = getFilledOtherConditions(value).length;
  const [draft, setDraft] = useState("");
  const canAdd = filledCount < MAX_OTHER_CONDITIONS;

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      const sanitized = getFilledOtherConditions(value);
      if (sanitized.length !== value.length) {
        onChange(sanitized);
      }
      // Do not flip enabled=true on open — conditions stay optional until added.
      return;
    }

    // Collapse only — keep drafted conditions. Disable flag only if nothing filled.
    if (filledCount === 0) {
      onEnabledChange(false);
    }
  }

  function updateCondition(index: number, nextValue: string) {
    const next = [...conditions];
    next[index] = nextValue;
    onChange(next);
  }

  function commitCondition(index: number) {
    if (conditions[index]?.trim()) {
      return;
    }

    onChange(conditions.filter((_, i) => i !== index));
  }

  function addCondition() {
    const nextValue = draft.trim();
    if (!nextValue || !canAdd) {
      return;
    }

    onChange([...getFilledOtherConditions(conditions), nextValue]);
    setDraft("");
  }

  function removeCondition(index: number) {
    onChange(conditions.filter((_, i) => i !== index));
  }

  function clearConditions() {
    onChange([]);
    setDraft("");
    onEnabledChange(false);
  }

  return (
    <CreateContractFinanceAccordion
      title={labels.title}
      subtitle={labels.subtitle}
      defaultOpen={enabled && filledCount === 0}
      onOpenChange={handleOpenChange}
      collapsedSummary={
        filledCount > 0 ? (
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-secondary/40 bg-brand-background-green px-3 py-1.5 text-xs font-bold text-brand">
            {formatAddedSummary(filledCount, labels)}
            <button
              type="button"
              onClick={clearConditions}
              aria-label={labels.clearSummary}
              className="inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand hover:bg-brand/20"
            >
              <X className="size-2.5" strokeWidth={3} aria-hidden />
            </button>
          </span>
        ) : null
      }
    >
      <p className="text-xs leading-5 text-[#9a9a9a]">{labels.instruction}</p>

      <ul className="space-y-3">
        {conditions.map((condition, index) => (
          <li
            key={index}
            className="flex items-center gap-2 rounded-xl border border-[#e8e8e8] bg-white px-3 py-1"
          >
            <Input
              value={condition}
              onChange={(event) => updateCondition(index, event.target.value)}
              onBlur={() => commitCondition(index)}
              className="h-10 flex-1 border-0 bg-transparent px-1 text-sm shadow-none focus-visible:ring-0"
            />
            <button
              type="button"
              onClick={() => removeCondition(index)}
              aria-label={labels.remove}
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-[#c62828] hover:bg-[#fff0f0]"
            >
              <X className="size-4" aria-hidden />
            </button>
          </li>
        ))}

        <li className="flex items-center gap-2">
          <Input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            // QA ORDERS-COM-6: a condition typed but never «+»-ed was lost on
            // «متابعة» — leaving the field commits it.
            onBlur={addCondition}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addCondition();
              }
            }}
            placeholder={labels.placeholder}
            disabled={!canAdd}
            className="h-10 flex-1 rounded-xl border border-dashed border-[#d6d6d6] bg-white px-4 text-sm shadow-none placeholder:text-[#b0b0b0] focus-visible:border-brand focus-visible:ring-brand/20 disabled:opacity-40"
          />
          <button
            type="button"
            onClick={addCondition}
            disabled={!canAdd || draft.trim() === ""}
            aria-label={labels.add}
            className="inline-flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand-background-green text-brand disabled:opacity-40"
          >
            <Plus className="size-5" aria-hidden />
          </button>
        </li>
      </ul>
    </CreateContractFinanceAccordion>
  );
}
