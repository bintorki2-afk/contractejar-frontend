export const settingContractsKeys = {
  all: ["setting-contracts"] as const,
  list: () => [...settingContractsKeys.all, "list"] as const,
};
