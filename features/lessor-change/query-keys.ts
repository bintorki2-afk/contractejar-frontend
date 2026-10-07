export const lessorChangeKeys = {
  all: ["lessor-change"] as const,
  info: () => [...lessorChangeKeys.all, "info"] as const,
};
