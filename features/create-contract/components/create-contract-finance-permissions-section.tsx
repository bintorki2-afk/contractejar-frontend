"use client";

import { useState } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import CreateContractFinanceAccordion from "@/features/create-contract/components/create-contract-finance-accordion";
import CreateContractTenantRoleDialog from "@/features/create-contract/components/create-contract-tenant-role-dialog";
import { useTenantRoles } from "@/features/create-contract/hooks/use-tenant-roles";
import type { CreateContractLabels } from "@/features/create-contract/types/create-contract-labels";
import type { TenantRole } from "@/features/create-contract/types/tenant-role";
import { onToggleTenantRole } from "@/features/create-contract/utils/tenant-role-helpers";
import { cn } from "@/lib/utils";

type CreateContractFinancePermissionsSectionProps = {
  labels: CreateContractLabels["finance"]["tenantPermissions"];
  value: number[];
  values: Record<string, string>;
  onChange: (next: {
    selectedTenantRoleIds: number[];
    tenantRoleValues: Record<string, string>;
  }) => void;
};

export default function CreateContractFinancePermissionsSection({
  labels,
  value,
  values,
  onChange,
}: CreateContractFinancePermissionsSectionProps) {
  const { data: tenantRoles = [], isLoading, error } = useTenantRoles();
  const [openRole, setOpenRole] = useState<TenantRole | null>(null);

  function applyToggle(role: TenantRole, checked: boolean) {
    const result = onToggleTenantRole(role, checked, {
      selectedIds: value,
      values,
    });

    onChange({
      selectedTenantRoleIds: result.selectedIds,
      tenantRoleValues: result.values,
    });

    setOpenRole(result.openModal);
  }

  function handleDialogOpenChange(open: boolean) {
    if (open || !openRole) {
      return;
    }

    // Closing without confirm: role was never committed (see onToggleTenantRole).
    setOpenRole(null);
  }

  function handleConfirm(nextValue: string) {
    if (!openRole) {
      return;
    }

    const key = String(openRole.id);
    const nextValues = openRole.has_user_input
      ? { ...values, [key]: nextValue }
      : values;

    onChange({
      selectedTenantRoleIds: value.includes(openRole.id)
        ? value
        : [...value, openRole.id],
      tenantRoleValues: nextValues,
    });
    setOpenRole(null);
  }

  return (
    <>
      <CreateContractFinanceAccordion
        title={labels.title}
        subtitle={labels.subtitle}
        defaultOpen={value.length > 0}
      >
        <p className="text-xs leading-5 text-[#9a9a9a]">{labels.instruction}</p>

        {error ? (
          <p className="text-sm text-red-500">
            {error instanceof Error ? error.message : labels.optionsError}
          </p>
        ) : null}

        {isLoading ? (
          <div className="space-y-3">
            <div className="h-12 animate-pulse rounded-2xl bg-brand-background" />
            <div className="h-12 animate-pulse rounded-2xl bg-brand-background" />
          </div>
        ) : (
          <div className="space-y-3">
            {tenantRoles.map((role) => {
              const checked = value.includes(role.id);
              const savedValue = values[String(role.id)]?.trim();

              return (
                <div
                  key={role.id}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl border bg-white px-4 py-3.5",
                    checked ? "border-brand/30" : "border-[#e8e8e8]",
                  )}
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(nextValue) =>
                      applyToggle(role, nextValue === true)
                    }
                    className="size-5 rounded-[6px] border-[#c8c8c8] data-checked:border-brand data-checked:bg-brand"
                  />

                  <button
                    type="button"
                    className="-my-3.5 flex min-w-0 flex-1 items-center gap-2 py-3.5 text-start"
                    onClick={() => {
                      if (checked && role.pop) {
                        setOpenRole(role);
                        return;
                      }

                      applyToggle(role, !checked);
                    }}
                  >
                    <span className="flex-1 text-sm font-bold text-[#1a1a1a]">
                      {role.text_of_reason}
                    </span>
                    {checked && savedValue ? (
                      <span className="shrink-0 text-xs font-bold text-brand-secondary tabular-nums">
                        {/^\d+$/.test(savedValue)
                          ? Number(savedValue).toLocaleString("en-US")
                          : savedValue}
                      </span>
                    ) : null}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </CreateContractFinanceAccordion>

      <CreateContractTenantRoleDialog
        labels={labels}
        role={openRole}
        open={openRole != null}
        value={openRole ? (values[String(openRole.id)] ?? "") : ""}
        onOpenChange={handleDialogOpenChange}
        onConfirm={handleConfirm}
      />
    </>
  );
}
