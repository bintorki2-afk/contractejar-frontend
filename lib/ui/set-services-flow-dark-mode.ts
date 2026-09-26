/**
 * Apply/clear the scoped shell class for services create flows
 * (property/contract/units). The `.dark` class on <html> is owned by the global
 * ThemeProvider, so this only toggles the shell element's classes — it must not
 * touch the document root, or it would fight the global theme.
 */
export function setServicesFlowDarkMode(options: {
  enabled: boolean;
  shellClass:
    | "services-dark-shell"
    | "create-property-dark-shell"
    | "create-contract-dark-shell"
    | "create-flow-dark-shell";
}) {
  const shell = document.querySelector<HTMLElement>("[data-services-layout]");

  if (options.enabled) {
    shell?.classList.add("dark", options.shellClass);
    return;
  }

  shell?.classList.remove("dark", options.shellClass);
}
