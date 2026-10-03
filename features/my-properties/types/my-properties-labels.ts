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
  contractTypes: {
    housing: string;
    commercial: string;
  };
};
