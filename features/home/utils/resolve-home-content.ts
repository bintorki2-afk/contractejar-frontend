import type {
  AdvantageItemConfig,
  AdvantageItemTranslations,
} from "@/features/advantages/types/advantage";
import type { TrustedEntityConfig } from "@/features/home/data/trusted-entities";
import type {
  HomeContentAuthorityCard,
  HomeContentPricingCard,
  HomeContentSections,
  HomeContentTextCard,
} from "@/features/home/types/home-content-api";
import type {
  HomeAppResolved,
  HomeAuthoritiesResolved,
  HomeContactResolved,
  HomeContentResolved,
  HomeFeatureCardResolved,
  HomeFeaturesResolved,
  HomeHeroResolved,
  HomePricingPlanResolved,
  HomePricingResolved,
} from "@/features/home/types/home-content";
import { buildWhatsappHref } from "@/features/settings/utils/build-whatsapp-href";

export type HomeStaticContent = {
  hero: {
    badge: string;
    titleLine1Accent: string;
    titleLine1Main: string;
    titleLine2Main: string;
    titleLine2Accent: string;
    description: string;
    features: string[];
    residentialCta: string;
    commercialCta: string;
    mostRequested: string;
    lessorChangeCta: string;
    lessorChangeHint: string;
    whatsapp: string;
    visualAlt: string;
    imageUrl: string;
  };
  authorities: {
    badge: string;
    titlePrefix: string;
    titleAccent: string;
    description: string;
    viewLicense: string;
    entities: Record<
      string,
      { name: string; nameEn: string; description: string }
    >;
    config: TrustedEntityConfig[];
  };
  features: {
    badge: string;
    titlePrefix: string;
    titleAccent: string;
    titleSuffix: string;
    description: string;
    items: Record<string, AdvantageItemTranslations>;
    config: AdvantageItemConfig[];
  };
  pricing: {
    badge: string;
    titlePrefix: string;
    titleAccent: string;
    description: string;
    benefitsTitle: string;
    plans: HomePricingPlanResolved[];
  };
  contact: {
    eyebrow: string;
    titleLine1: string;
    titleLine2: string;
    titleLine3: string;
    description: string;
    cta: string;
    satisfaction: string;
    responseTime: string;
    imageAlt: string;
    imageUrl: string;
    whatsappHref: string;
  };
  app: {
    eyebrow: string;
    titleLine1: string;
    titleLine2: string;
    description: string;
    imageAlt: string;
    imageUrl: string;
  };
};

function textOrFallback(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() !== ""
    ? value.trim()
    : fallback;
}

function splitMainTitle(
  mainTitle: string | null | undefined,
  fallbackPrefix: string,
  fallbackAccent: string,
) {
  const title = typeof mainTitle === "string" ? mainTitle.trim() : "";
  if (!title) {
    return { titlePrefix: fallbackPrefix, titleAccent: fallbackAccent };
  }

  return { titlePrefix: title, titleAccent: "" };
}

function splitHeroTitleParts(
  mainTitle: string,
  fallback: {
    titleLine1Accent: string;
    titleLine1Main: string;
    titleLine2Main: string;
    titleLine2Accent: string;
  },
) {
  const words = mainTitle
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length < 2) {
    return fallback;
  }

  const mid = Math.ceil(words.length / 2);
  const line1 = words.slice(0, mid);
  const line2 = words.slice(mid);

  return {
    titleLine1Accent: line1[0] ?? "",
    titleLine1Main: line1.slice(1).join(" "),
    titleLine2Main:
      line2.length > 1 ? line2.slice(0, -1).join(" ") : "",
    titleLine2Accent:
      line2.length > 1
        ? (line2[line2.length - 1] ?? "")
        : (line2[0] ?? ""),
  };
}

function resolveHero(
  api: HomeContentSections["hero"],
  staticContent: HomeStaticContent["hero"],
): HomeHeroResolved {
  const apiTitle =
    typeof api?.main_title === "string" && api.main_title.trim() !== ""
      ? api.main_title.trim()
      : null;

  const titleParts = apiTitle
    ? splitHeroTitleParts(apiTitle, {
        titleLine1Accent: staticContent.titleLine1Accent,
        titleLine1Main: staticContent.titleLine1Main,
        titleLine2Main: staticContent.titleLine2Main,
        titleLine2Accent: staticContent.titleLine2Accent,
      })
    : {
        titleLine1Accent: staticContent.titleLine1Accent,
        titleLine1Main: staticContent.titleLine1Main,
        titleLine2Main: staticContent.titleLine2Main,
        titleLine2Accent: staticContent.titleLine2Accent,
      };

  return {
    badge: textOrFallback(api?.badge_text, staticContent.badge),
    ...titleParts,
    description: textOrFallback(api?.description, staticContent.description),
    imageUrl: textOrFallback(api?.image_url, staticContent.imageUrl),
    residentialCta: staticContent.residentialCta,
    commercialCta: staticContent.commercialCta,
    mostRequested: staticContent.mostRequested,
    lessorChangeCta: staticContent.lessorChangeCta,
    lessorChangeHint: staticContent.lessorChangeHint,
    whatsappLabel: staticContent.whatsapp,
    whatsappHref: "https://wa.me/",
    visualAlt: staticContent.visualAlt,
    features: staticContent.features,
  };
}

function resolveAuthorities(
  api: HomeContentSections["official_authorities"],
  staticContent: HomeStaticContent["authorities"],
): HomeAuthoritiesResolved {
  const title = splitMainTitle(
    api?.main_title,
    staticContent.titlePrefix,
    staticContent.titleAccent,
  );

  const apiCards = Array.isArray(api?.cards) ? api.cards : [];
  const cards =
    apiCards.length === 0
      ? staticContent.config.map((entity) => {
          const copy = staticContent.entities[entity.id];
          return {
            id: entity.id,
            theme: entity.theme,
            logoSrc: entity.logoSrc,
            licenseUrl: entity.licenseUrl,
            name: copy?.name ?? "",
            nameEn: copy?.nameEn ?? "",
            description: copy?.description ?? "",
          };
        })
      : apiCards.map((card: HomeContentAuthorityCard, index) => {
          const fallback =
            staticContent.config[index] ??
            staticContent.config[staticContent.config.length - 1];
          const copy = fallback
            ? staticContent.entities[fallback.id]
            : undefined;

          return {
            id: fallback?.id ?? `authority-${index}`,
            theme: fallback?.theme ?? "teal",
            logoSrc: textOrFallback(card.image_url, fallback?.logoSrc ?? ""),
            licenseUrl: textOrFallback(
              card.license_file_url,
              fallback?.licenseUrl ?? "#",
            ),
            name: copy?.name ?? "",
            nameEn: copy?.nameEn ?? "",
            description: copy?.description ?? "",
          };
        });

  return {
    badge: textOrFallback(api?.badge_text, staticContent.badge),
    titlePrefix: title.titlePrefix,
    titleAccent: title.titleAccent,
    description: textOrFallback(api?.description, staticContent.description),
    viewLicense: staticContent.viewLicense,
    cards,
  };
}

function resolveFeatures(
  api: HomeContentSections["features"],
  staticContent: HomeStaticContent["features"],
): HomeFeaturesResolved {
  const title = splitMainTitle(
    api?.main_title,
    `${staticContent.titlePrefix}${staticContent.titleAccent}${staticContent.titleSuffix}`,
    "",
  );

  const apiCards = Array.isArray(api?.cards) ? api.cards : [];
  const cards: HomeFeatureCardResolved[] =
    apiCards.length === 0
      ? staticContent.config.map((item) => {
          const copy = staticContent.items[item.id];
          return {
            id: item.id,
            icon: item.icon,
            theme: item.theme,
            title: copy?.title ?? "",
            description: copy?.description ?? "",
          };
        })
      : apiCards.map((card: HomeContentTextCard, index) => {
          const fallback =
            staticContent.config[index] ??
            staticContent.config[staticContent.config.length - 1];
          const copy = fallback
            ? staticContent.items[fallback.id]
            : undefined;

          return {
            id: fallback?.id ?? `feature-${index}`,
            icon: fallback?.icon ?? "shield",
            theme: fallback?.theme ?? "teal",
            title: textOrFallback(card.title, copy?.title ?? ""),
            description: textOrFallback(
              card.description,
              copy?.description ?? "",
            ),
          };
        });

  const hasApiTitle =
    typeof api?.main_title === "string" && api.main_title.trim() !== "";

  return {
    badge: textOrFallback(api?.badge_text, staticContent.badge),
    titlePrefix: hasApiTitle
      ? title.titlePrefix
      : staticContent.titlePrefix,
    titleAccent: hasApiTitle ? "" : staticContent.titleAccent,
    titleSuffix: hasApiTitle ? "" : staticContent.titleSuffix,
    description: textOrFallback(api?.description, staticContent.description),
    cards,
  };
}

function resolvePricing(
  api: HomeContentSections["pricing"],
  staticContent: HomeStaticContent["pricing"],
): HomePricingResolved {
  const title = splitMainTitle(
    api?.main_title,
    staticContent.titlePrefix,
    staticContent.titleAccent,
  );

  const apiCards = Array.isArray(api?.cards) ? api.cards : [];
  const plans: HomePricingPlanResolved[] =
    apiCards.length === 0
      ? staticContent.plans
      : apiCards.map((card: HomeContentPricingCard, index) => {
          const fallback =
            staticContent.plans[index] ??
            staticContent.plans[staticContent.plans.length - 1];

          const apiFeatures = Array.isArray(card.features)
            ? card.features
                .map((feature) =>
                  typeof feature?.text === "string" ? feature.text.trim() : "",
                )
                .filter(Boolean)
            : [];

          return {
            id: fallback?.id ?? `plan-${index}`,
            icon: fallback?.icon ?? "/icons/home.svg",
            title: textOrFallback(card.title, fallback?.title ?? ""),
            description: textOrFallback(
              card.subtitle,
              fallback?.description ?? "",
            ),
            price: textOrFallback(card.price, fallback?.price ?? ""),
            period: textOrFallback(
              card.duration_label,
              fallback?.period ?? "",
            ),
            features:
              apiFeatures.length > 0
                ? apiFeatures
                : (fallback?.features ?? []),
            cta: fallback?.cta ?? "",
          };
        });

  return {
    badge: textOrFallback(api?.badge_text, staticContent.badge),
    titlePrefix: title.titlePrefix,
    titleAccent: title.titleAccent,
    description: textOrFallback(api?.description, staticContent.description),
    benefitsTitle: staticContent.benefitsTitle,
    plans,
  };
}

function resolveContact(
  api: HomeContentSections["contact"],
  staticContent: HomeStaticContent["contact"],
  settingsWhatsappNumber?: string | null,
): HomeContactResolved {
  const staticTitle = [
    staticContent.titleLine1,
    staticContent.titleLine2,
    staticContent.titleLine3,
  ]
    .filter(Boolean)
    .join(" ");

  return {
    eyebrow: textOrFallback(api?.badge_text, staticContent.eyebrow),
    title: textOrFallback(api?.main_title, staticTitle),
    description: textOrFallback(api?.description, staticContent.description),
    cta: staticContent.cta,
    satisfaction: staticContent.satisfaction,
    responseTime: staticContent.responseTime,
    imageAlt: staticContent.imageAlt,
    imageUrl: textOrFallback(api?.image_url, staticContent.imageUrl),
    whatsappHref: buildWhatsappHref(
      settingsWhatsappNumber ?? api?.contact_number,
      staticContent.whatsappHref,
    ),
  };
}

function resolveApp(
  api: HomeContentSections["app"],
  staticContent: HomeStaticContent["app"],
): HomeAppResolved {
  const hasApiTitle =
    typeof api?.main_title === "string" && api.main_title.trim() !== "";

  return {
    eyebrow: textOrFallback(api?.badge_text, staticContent.eyebrow),
    titleLine1: hasApiTitle
      ? api!.main_title!.trim()
      : staticContent.titleLine1,
    titleLine2: hasApiTitle ? "" : staticContent.titleLine2,
    description: textOrFallback(api?.description, staticContent.description),
    imageAlt: staticContent.imageAlt,
    imageUrl: textOrFallback(api?.image_url, staticContent.imageUrl),
  };
}

export function resolveHomeContent(
  api: HomeContentSections | null,
  staticContent: HomeStaticContent,
  options?: { whatsappNumber?: string | null },
): HomeContentResolved {
  const contact = resolveContact(
    api?.contact,
    staticContent.contact,
    options?.whatsappNumber,
  );
  const hero = resolveHero(api?.hero, staticContent.hero);

  return {
    hero: {
      ...hero,
      whatsappHref: contact.whatsappHref,
    },
    authorities: resolveAuthorities(
      api?.official_authorities,
      staticContent.authorities,
    ),
    features: resolveFeatures(api?.features, staticContent.features),
    pricing: resolvePricing(api?.pricing, staticContent.pricing),
    contact,
    app: resolveApp(api?.app, staticContent.app),
  };
}
