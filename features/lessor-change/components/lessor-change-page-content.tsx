"use client";

import LessorChangeFlow from "@/features/lessor-change/components/lessor-change-flow";
import type { CreateContractLabels } from "@/features/create-contract/types/create-contract-labels";
import ServicesPageBackConfig from "@/features/services/components/services-page-back-config";

type LessorChangePageContentProps = {
  backLabel: string;
  deedImageLabels: CreateContractLabels["deed"]["deedImage"];
  birthDateLabels: CreateContractLabels["owner"]["birthDate"];
};

export default function LessorChangePageContent({
  backLabel,
  deedImageLabels,
  birthDateLabels,
}: LessorChangePageContentProps) {
  return (
    <>
      <ServicesPageBackConfig backLabel={backLabel} backHref="/service/lessor-change" />

      <div className="mx-auto w-full max-w-2xl">
        <div className="overflow-hidden rounded-3xl bg-white shadow-sm dark:border dark:border-[#2f403b] dark:bg-[#1a2421]">
          <LessorChangeFlow
            deedImageLabels={deedImageLabels}
            birthDateLabels={birthDateLabels}
          />
        </div>
      </div>
    </>
  );
}
