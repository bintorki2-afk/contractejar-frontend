export type MyPropertiesHowItWorksStep = {
  title: string;
  description: string;
};

export type MyPropertiesLabels = {
  backLabel: string;
  pageTitle: string;
  pageSubtitle: string;
  pageBadge: string;
  propertiesCountLabel: string;
  emptyStateTitle: string;
  emptyStateDescription: string;
  addProperty: string;
  howItWorks: {
    title: string;
    subtitle: string;
    steps: MyPropertiesHowItWorksStep[];
  };
  onboarding: {
    title: string;
    progressTemplate: string;
    back: string;
    next: string;
    start: string;
    dontShowAgain: string;
  };
  contractTypes: {
    housing: string;
    commercial: string;
  };
};
