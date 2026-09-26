"use client";

import { useEffect } from "react";

import CreatePropertyWizard from "@/features/create-property/components/create-property-wizard";
import ServicesPageBackConfig from "@/features/services/components/services-page-back-config";
import type { CreatePropertyLabels } from "@/features/create-property/types/create-property-labels";
import type { PropertyTypeId } from "@/features/properties/types/property-type";
import type { PropertyEditDraftData } from "@/features/create-property/utils/map-property-api-to-draft";
import { useTheme } from "@/features/shared/theme/theme-provider";
import { setServicesFlowDarkMode } from "@/lib/ui/set-services-flow-dark-mode";
import { cn } from "@/lib/utils";

type CreatePropertyPageContentProps = {
  labels: CreatePropertyLabels;
  propertyType: PropertyTypeId;
  initialEditDraft: PropertyEditDraftData | null;
};

export default function CreatePropertyPageContent({
  labels,
  propertyType,
  initialEditDraft,
}: CreatePropertyPageContentProps) {
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === "dark";
  const isEditMode = Boolean(initialEditDraft);
  const pageTitle = isEditMode
    ? propertyType === "residential"
      ? labels.editPageTitleResidential
      : labels.editPageTitleCommercial
    : propertyType === "residential"
      ? labels.pageTitleResidential
      : labels.pageTitleCommercial;

  useEffect(() => {
    setServicesFlowDarkMode({
      enabled: isDarkMode,
      shellClass: "create-property-dark-shell",
    });

    return () => {
      setServicesFlowDarkMode({
        enabled: false,
        shellClass: "create-property-dark-shell",
      });
    };
  }, [isDarkMode]);

  return (
    <>
      <ServicesPageBackConfig
        backLabel={labels.backLabel}
        pageTitle={pageTitle}
        useRouterBack
        hideBack
      />

      <div
        className={cn(
          "create-property-flow mx-auto max-w-2xl",
          isDarkMode && "dark",
        )}
      >
        <CreatePropertyWizard
          labels={labels}
          propertyType={propertyType}
          initialEditDraft={initialEditDraft}
          isDarkMode={isDarkMode}
          onToggleDarkMode={toggleTheme}
        />
      </div>
    </>
  );
}
