export type HomeHeroResolved = {
  badge: string;
  titleLine1Accent: string;
  titleLine1Main: string;
  titleLine2Main: string;
  titleLine2Accent: string;
  description: string;
  imageUrl: string;
  residentialCta: string;
  commercialCta: string;
  mostRequested: string;
  lessorChangeCta: string;
  lessorChangeHint: string;
  whatsappLabel: string;
  whatsappHref: string;
  visualAlt: string;
  features: string[];
};

export type HomeAuthorityCardResolved = {
  id: string;
  theme: "purple" | "blue" | "teal";
  logoSrc: string;
  licenseUrl: string;
  name: string;
  nameEn: string;
  description: string;
};

export type HomeAuthoritiesResolved = {
  badge: string;
  titlePrefix: string;
  titleAccent: string;
  description: string;
  viewLicense: string;
  cards: HomeAuthorityCardResolved[];
};

export type HomeFeatureCardResolved = {
  id: string;
  icon: "shield" | "clock" | "headphones";
  theme: "teal" | "blue" | "purple";
  title: string;
  description: string;
};

export type HomeFeaturesResolved = {
  badge: string;
  titlePrefix: string;
  titleAccent: string;
  titleSuffix: string;
  description: string;
  cards: HomeFeatureCardResolved[];
};

export type HomePricingPlanResolved = {
  id: string;
  icon: string;
  title: string;
  description: string;
  price: string;
  period: string;
  features: string[];
  cta: string;
};

export type HomePricingResolved = {
  badge: string;
  titlePrefix: string;
  titleAccent: string;
  description: string;
  benefitsTitle: string;
  plans: HomePricingPlanResolved[];
};

export type HomeContactResolved = {
  eyebrow: string;
  title: string;
  description: string;
  cta: string;
  satisfaction: string;
  responseTime: string;
  imageAlt: string;
  imageUrl: string;
  whatsappHref: string;
};

export type HomeAppResolved = {
  eyebrow: string;
  titleLine1: string;
  titleLine2: string;
  description: string;
  imageAlt: string;
  imageUrl: string;
};

export type HomeContentResolved = {
  hero: HomeHeroResolved;
  authorities: HomeAuthoritiesResolved;
  features: HomeFeaturesResolved;
  pricing: HomePricingResolved;
  contact: HomeContactResolved;
  app: HomeAppResolved;
};
