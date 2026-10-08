/**
 * رحلة الطلب (ف2) — المصدر الواحد لخطوات الرحلة الست وجملة قاعدة المسودة.
 *
 * الخادم يعيد `journey` (مصفوفة من 6 خطوات `{key,label,description,done,current,at}`)
 * في مورد العقد وفي `POST /contract/track`. عند غيابه نعرض القالب الثابت هنا
 * بنفس المفاتيح، وتُشتق الحالة من البيانات المتاحة.
 */

export type OrderJourneyStepKey =
  | "received"
  | "paid"
  | "under_review"
  | "whatsapp_draft"
  | "draft_reviewed"
  | "ejar_authenticated";

export type OrderJourneyStepState = "completed" | "current" | "pending";

export type OrderJourneyStep = {
  key: OrderJourneyStepKey | string;
  label: string;
  description: string;
  state: OrderJourneyStepState;
  /** ISO timestamp when the step happened (server), if known. */
  at: string | null;
};

/** جملة قاعدة المنتج (ف2) — تُعرض أينما وُصفت الرحلة. */
export const ORDER_JOURNEY_SENTENCE =
  "بعد الدفع نرسل لك مسودة العقد عبر واتساب للاطلاع عليها، ولا نوثّق العقد في إيجار إلا بعد اطلاعك على المسودة.";

/** القالب الثابت للخطوات الست (بنفس ترتيب ومفاتيح الخادم). */
export const ORDER_JOURNEY_TEMPLATE: ReadonlyArray<{
  key: OrderJourneyStepKey;
  label: string;
  description: string;
}> = [
  {
    key: "received",
    label: "استلام الطلب",
    description: "استلمنا طلبك وسجّلناه برقم الطلب.",
  },
  {
    key: "paid",
    label: "الدفع",
    description: "تم استلام دفعتك وبدأ فريقنا بالمراجعة.",
  },
  {
    key: "under_review",
    label: "مراجعة الفريق للبيانات",
    description: "يراجع فريقنا بيانات الطلب والمستندات.",
  },
  {
    key: "whatsapp_draft",
    label: "إرسال مسودة العقد عبر واتساب",
    description: "تصلك مسودة العقد عبر واتساب للاطلاع عليها.",
  },
  {
    key: "draft_reviewed",
    label: "اطلاعك على المسودة",
    description: "تطّلع على المسودة وتؤكد لنا صحتها.",
  },
  {
    key: "ejar_authenticated",
    label: "توثيق العقد في إيجار",
    description: "نوثّق العقد في منصة إيجار 🎉.",
  },
];

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function asLocalizedString(value: unknown) {
  if (typeof value === "string") {
    return value.trim();
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const localized = record.ar ?? record.en ?? record.ar_SA ?? record["ar-SA"];
    if (typeof localized === "string") {
      return localized.trim();
    }
  }

  return "";
}

function asBoolean(value: unknown) {
  return value === true || value === 1 || value === "1" || value === "true";
}

/**
 * Builds the journey from the template with the first `completedCount` steps
 * done and the next one current. Used when the API has no `journey`.
 */
export function buildTemplateJourney(completedCount: number): OrderJourneyStep[] {
  const done = Math.max(0, Math.min(ORDER_JOURNEY_TEMPLATE.length, completedCount));

  return ORDER_JOURNEY_TEMPLATE.map((step, index) => ({
    key: step.key,
    label: step.label,
    description: step.description,
    state:
      index < done
        ? "completed"
        : index === done && done < ORDER_JOURNEY_TEMPLATE.length
          ? "current"
          : "pending",
    at: null,
  }));
}

/**
 * Normalizes the API `journey` payload (new shape: `label/done/current/at`,
 * or the older `status_label/state`) into the shared step model. Returns
 * `null` when the payload is missing or empty so callers can fall back to
 * the template.
 */
export function normalizeOrderJourney(raw: unknown): OrderJourneyStep[] | null {
  if (!Array.isArray(raw) || raw.length === 0) {
    return null;
  }

  const steps = raw.map((item, index): OrderJourneyStep => {
    const row = (item && typeof item === "object" ? item : {}) as Record<string, unknown>;
    const key = asString(row.key) || asString(row.status) || `step-${index + 1}`;
    const template = ORDER_JOURNEY_TEMPLATE.find((step) => step.key === key);

    const explicitState = asString(row.state);
    let state: OrderJourneyStepState;
    if (explicitState === "completed" || explicitState === "current" || explicitState === "pending") {
      state = explicitState;
    } else if (asBoolean(row.current)) {
      state = "current";
    } else if (asBoolean(row.done)) {
      state = "completed";
    } else {
      state = "pending";
    }

    return {
      key,
      label:
        asLocalizedString(row.label) ||
        asLocalizedString(row.status_label) ||
        template?.label ||
        key,
      description:
        asLocalizedString(row.description) ||
        asLocalizedString(row.client_explanation) ||
        asLocalizedString(row.status_client_explanation) ||
        template?.description ||
        "",
      state,
      at: asString(row.at) || asString(row.created_at) || null,
    };
  });

  // No explicit "current" from the server: the first pending step after the
  // last completed one is the current step (keeps the timeline readable).
  if (!steps.some((step) => step.state === "current")) {
    const firstPending = steps.findIndex((step) => step.state === "pending");
    const lastCompleted = steps.map((s) => s.state).lastIndexOf("completed");
    if (firstPending !== -1 && firstPending > lastCompleted) {
      steps[firstPending] = { ...steps[firstPending], state: "current" };
    }
  }

  return steps;
}

/** All six steps with no progress — for explanatory pages (guide). */
export function buildNeutralJourney(): OrderJourneyStep[] {
  return ORDER_JOURNEY_TEMPLATE.map((step) => ({
    key: step.key,
    label: step.label,
    description: step.description,
    state: "pending",
    at: null,
  }));
}

/**
 * Journey for a client-side context where only coarse facts are known
 * (e.g. the payment-success screen): `paid` → first two steps done, the
 * review step current.
 */
export function journeyAfterPayment(): OrderJourneyStep[] {
  return buildTemplateJourney(2);
}
