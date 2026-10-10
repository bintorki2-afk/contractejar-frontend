import type { MyPropertyCardData } from "@/features/my-properties/types/property-card";
import type { MyPropertyActionId } from "@/features/my-properties/types/property-card";

export type MyPropertyActionIconType = "svg" | "plus" | "ejar";

export type MyPropertyActionConfig = {
  id: MyPropertyActionId;
  labelKey: MyPropertyActionId;
  iconType: MyPropertyActionIconType;
  iconSrc?: string;
};

export const MY_PROPERTY_ACTIONS_CONFIG: MyPropertyActionConfig[] = [
  {
    id: "view-edit",
    labelKey: "view-edit",
    iconType: "svg",
    iconSrc: "/icons/pencil.svg",
  },
  {
    id: "view-units",
    labelKey: "view-units",
    iconType: "svg",
    iconSrc: "/icons/grid.svg",
  },
  {
    id: "add-unit",
    labelKey: "add-unit",
    iconType: "plus",
  },
  {
    id: "create-contract",
    labelKey: "create-contract",
    iconType: "svg",
    iconSrc: "/icons/file.svg",
  },
];

export function buildPropertyActionHref(
  actionId: MyPropertyActionId,
  property: MyPropertyCardData,
) {
  const { propertyId, contractType } = property;
  const unitParams = new URLSearchParams({
    propertyId: String(propertyId),
  });
  // QA PROPS-5: properties saved before the wizard sent `contract_type` have
  // none — never put the literal «null» in the URL; the units page then shows
  // both tabs instead of a bogus type.
  const knownType = contractType === "commercial" || contractType === "housing";
  const unitsHref = knownType
    ? `/properties/my-properties/units?propertyId=${propertyId}&contract_type=${contractType}`
    : `/properties/my-properties/units?propertyId=${propertyId}`;

  switch (actionId) {
    case "view-edit":
      return `/properties/create?type=${contractType === "commercial" ? "commercial" : "residential"}&propertyId=${propertyId}`;
    case "view-units":
      return unitsHref;
    case "add-unit":
      return `/properties/create-unit?${unitParams.toString()}`;
    case "create-contract":
      return unitsHref;
    default:
      return "/properties/my-properties";
  }
}

export const MY_PROPERTY_EJAR_LOGO = "/images/ejar.png";
