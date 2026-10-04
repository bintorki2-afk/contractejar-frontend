"use client";

import { Building2, Check, Eye, FilePlus2, Home, Plus } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { toPropertyContractType } from "@/features/create-property/utils/contract-type";
import type { CreatePropertyLabels } from "@/features/create-property/types/create-property-labels";
import type { PropertyTypeId } from "@/features/properties/types/property-type";

type CreatePropertySuccessStepProps = {
  labels: CreatePropertyLabels["success"];
  propertyType: PropertyTypeId;
  propertyId: number;
  propertyName: string;
};

function buildViewEditHref(propertyId: number, propertyType: PropertyTypeId) {
  const type =
    propertyType === "commercial" ? "commercial" : "residential";
  return `/properties/create?type=${type}&propertyId=${propertyId}`;
}

function buildAddUnitHref(propertyId: number) {
  return `/properties/create-unit?propertyId=${propertyId}`;
}

function buildUnitsHref(propertyId: number, propertyType: PropertyTypeId) {
  const contractType = toPropertyContractType(propertyType);
  return `/properties/my-properties/units?propertyId=${propertyId}&contract_type=${contractType}`;
}

export default function CreatePropertySuccessStep({
  labels,
  propertyType,
  propertyId,
  propertyName,
}: CreatePropertySuccessStepProps) {
  const title = labels.title.replace(
    "{propertyName}",
    propertyName.trim() || "—",
  );
  const viewEditHref = buildViewEditHref(propertyId, propertyType);

  const secondaryActions = [
    {
      href: buildAddUnitHref(propertyId),
      label: labels.actions.addUnit,
      icon: (
        <span className="relative inline-flex size-5 shrink-0 items-center justify-center">
          <Building2 className="size-5" aria-hidden="true" />
          <Plus
            className="absolute -end-1 -top-1 size-3 text-brand"
            strokeWidth={3}
            aria-hidden="true"
          />
        </span>
      ),
    },
    {
      href: buildUnitsHref(propertyId, propertyType),
      label: labels.actions.createContract,
      icon: <FilePlus2 className="size-5 shrink-0" aria-hidden="true" />,
    },
  ];

  return (
    <div className="rounded-b-[28px] bg-white p-3 md:p-5 dark:bg-[#1a2421]">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="relative flex items-center justify-center">
          <div className="flex size-20 items-center justify-center rounded-full bg-brand shadow-md shadow-brand/20">
            <Check
              className="size-10 text-white"
              strokeWidth={3}
              aria-hidden="true"
            />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-extrabold leading-relaxed text-brand md:text-2xl">
            {title}
          </h2>
          <p className="mx-auto max-w-md text-sm leading-relaxed text-[#7f7f7f]">
            {labels.description}
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <Button
          type="button"
          asChild
          variant="ghost"
          className="h-11 w-full justify-center gap-3 rounded-2xl bg-brand-background-green px-4 text-sm font-semibold text-brand hover:bg-brand-background-green/80"
        >
          <a href={viewEditHref}>
            <span>{labels.actions.viewProperty}</span>
            <Eye className="size-5 shrink-0" aria-hidden="true" />
          </a>
        </Button>

        {secondaryActions.map((action) => (
          <Button
            key={action.href}
            type="button"
            asChild
            variant="ghost"
            className="h-11 w-full justify-center gap-3 rounded-2xl bg-brand-background-green px-4 text-sm font-semibold text-brand hover:bg-brand-background-green/80 dark:bg-white/[0.07] dark:text-white dark:hover:bg-white/[0.12]"
          >
            <Link href={action.href}>
              <span>{action.label}</span>
              {action.icon}
            </Link>
          </Button>
        ))}

        <Button
          type="button"
          asChild
          className="h-11 w-full justify-center gap-3 rounded-2xl bg-brand text-base font-extrabold text-white hover:opacity-90"
        >
          <Link href={labels.mainMenuHref}>
            <span>{labels.mainMenu}</span>
            <Home className="size-5 shrink-0" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
