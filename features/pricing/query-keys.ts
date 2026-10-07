export const contractPricingKeys = {
  all: ["contract-pricing"] as const,
  detail: () => [...contractPricingKeys.all, "detail"] as const,
};
