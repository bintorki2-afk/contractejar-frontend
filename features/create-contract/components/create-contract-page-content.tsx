"use client";

import { useEffect } from "react";

import CreateContractWizard from "@/features/create-contract/components/create-contract-wizard";
import ServicesPageBackConfig from "@/features/services/components/services-page-back-config";
import type { CreateContractLabels } from "@/features/create-contract/types/create-contract-labels";
import type { ContractTypeId } from "@/features/create-contract/types/contract-type";
import { useTheme } from "@/features/shared/theme/theme-provider";
import { setServicesFlowDarkMode } from "@/lib/ui/set-services-flow-dark-mode";
import { cn } from "@/lib/utils";

type CreateContractPageContentProps = {
  labels: CreateContractLabels;
  contractType: ContractTypeId;
};

export default function CreateContractPageContent({
  labels,
  contractType,
}: CreateContractPageContentProps) {
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === "dark";

  useEffect(() => {
    setServicesFlowDarkMode({
      enabled: isDarkMode,
      shellClass: "create-contract-dark-shell",
    });

    return () => {
      setServicesFlowDarkMode({
        enabled: false,
        shellClass: "create-contract-dark-shell",
      });
    };
  }, [isDarkMode]);

  return (
    <>
      <ServicesPageBackConfig
        backLabel={labels.backLabel}
        hideBack
      />

      <div className={cn("create-contract-flow", isDarkMode && "dark")}>
        <CreateContractWizard
          labels={labels}
          contractType={contractType}
          isDarkMode={isDarkMode}
          onToggleDarkMode={toggleTheme}
        />
      </div>
    </>
  );
}
