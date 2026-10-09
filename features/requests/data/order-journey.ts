/**
 * رحلة الطلب (دفعة هـ — E3) — المصدر الواحد لخطوات الرحلة **الثلاث** وجملتها.
 *
 * الخادم يعيد `journey` (مصفوفة من 3 خطوات `{key,label,description,done,current,at,by}`)
 * و`journey_side_state` (`null` أو `{key: cancelled|refunded, label, color, at}`) في مورد
 * العقد وفي `POST /contract/track`. عند غيابه نعرض القالب الثابت هنا بنفس المفاتيح،
 * وتُشتق الحالة من البيانات المتاحة. لا توجد مرحلة «إرسال المسودة» بعد الآن؛ مفاتيحها
 * القديمة (`whatsapp_draft`, `draft_reviewed`) تُهمل إن وردت من بيانات تاريخية.
 */

export type OrderJourneyStepKey =
  | "under_review"
  | "received_by_employee"
  | "ejar_authenticated";

export type OrderJourneyStepState = "completed" | "current" | "pending";

export type OrderJourneyStep = {
  key: OrderJourneyStepKey | string;
  label: string;
  description: string;
  state: OrderJourneyStepState;
  /** ISO timestamp when the step happened (server), if known. */
  at: string | null;
  /** Employee name who did the step (server), if known. */
  by?: string | null;
};

export type OrderJourneySideStateKey = "cancelled" | "refunded";

/** حالة جانبية تحل محل الرحلة: ملغي / مسترجع. */
export type OrderJourneySideState = {
  key: OrderJourneySideStateKey | string;
  label: string;
  color: string | null;
  at: string | null;
};

/** جملة الرحلة (دفعة هـ) — تُعرض أينما وُصفت الرحلة؛ الخادم يرسل `journey_sentence` بنفس المعنى. */
export const ORDER_JOURNEY_SENTENCE =
  "بعد الدفع يستلم موظفنا طلبك ويوثّق العقد في إيجار مباشرةً، وتصلك إشعارات بكل خطوة.";

/** القالب الثابت للخطوات الثلاث (بنفس ترتيب ومفاتيح الخادم). */
export const ORDER_JOURNEY_TEMPLATE: ReadonlyArray<{
  key: OrderJourneyStepKey;
  label: string;
  description: string;
}> = [
  {
    key: "under_review",
    label: "قيد المراجعة",
    description: "تم استلام دفعتك وطلبك قيد المراجعة.",
  },
  {
    key: "received_by_employee",
    label: "مستلم من الموظف",
    description: "استلم موظفنا طلبك وبدأ العمل عليه.",
  },
  {
    key: "ejar_authenticated",
    label: "تم التوثيق",
    description: "تم توثيق العقد في منصة إيجار 🎉.",
  },
];

/** مفاتيح مراحل قديمة لم تعد موجودة (E3) — تُتجاهل إن وردت في بيانات تاريخية. */
const LEGACY_DRAFT_KEYS = new Set(["whatsapp_draft", "draft_reviewed", "draft_sent"]);

/** مفاتيح من الرحلة السداسية القديمة تُدمج في الخطوة الأولى الحالية. */
const LEGACY_ALIASES: Record<string, OrderJourneyStepKey> = {
  received: "under_review",
  paid: "under_review",
  completed: "ejar_authenticated",
};

const SIDE_STATE_LABELS: Record<OrderJourneySideStateKey, string> = {
  cancelled: "ملغي",
  refunded: "مسترجع",
};

const SIDE_STATE_COLORS: Record<OrderJourneySideStateKey, string> = {
  cancelled: "#6b7280",
  refunded: "#7c3aed",
};

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
 * done and the next one current. Used when the API has no `journey`
 * (`0` = unpaid, `1` = paid and under review, `2` = received by employee, `3` = notarized).
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
    by: null,
  }));
}

/**
 * Normalizes the API `journey` payload (shape: `label/done/current/at/by`,
 * or the older `status_label/state`) into the shared step model. Returns
 * `null` when the payload is missing or empty so callers can fall back to
 * the template. Legacy draft steps are dropped; legacy `received`/`paid`
 * steps collapse into «قيد المراجعة» (one row, done when any of them was).
 */
export function normalizeOrderJourney(raw: unknown): OrderJourneyStep[] | null {
  if (!Array.isArray(raw) || raw.length === 0) {
    return null;
  }

  const steps: OrderJourneyStep[] = [];

  raw.forEach((item, index) => {
    const row = (item && typeof item === "object" ? item : {}) as Record<string, unknown>;
    const rawKey = asString(row.key) || asString(row.status) || `step-${index + 1}`;
    if (LEGACY_DRAFT_KEYS.has(rawKey)) {
      return;
    }
    const key = LEGACY_ALIASES[rawKey] ?? rawKey;
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

    const step: OrderJourneyStep = {
      key,
      label:
        (template && LEGACY_ALIASES[rawKey] ? template.label : "") ||
        asLocalizedString(row.label) ||
        asLocalizedString(row.status_label) ||
        template?.label ||
        key,
      description:
        (template && LEGACY_ALIASES[rawKey] ? template.description : "") ||
        asLocalizedString(row.description) ||
        asLocalizedString(row.client_explanation) ||
        asLocalizedString(row.status_client_explanation) ||
        template?.description ||
        "",
      state,
      at: asString(row.at) || asString(row.created_at) || null,
      by: asString(row.by) || null,
    };

    // A legacy 6-step payload yields two rows for the same key: keep one.
    const existingIndex = steps.findIndex((s) => s.key === key);
    if (existingIndex === -1) {
      steps.push(step);
      return;
    }
    const existing = steps[existingIndex];
    const rank = { completed: 2, current: 1, pending: 0 } as const;
    steps[existingIndex] = {
      ...existing,
      state: rank[step.state] > rank[existing.state] ? step.state : existing.state,
      at: step.at ?? existing.at,
      by: step.by ?? existing.by,
    };
  });

  if (steps.length === 0) {
    return null;
  }

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

/**
 * Reads `journey_side_state` (ملغي / مسترجع). Accepts the server object, a
 * bare key string, or `null`. Returns `null` when the order is on the normal path.
 */
export function normalizeJourneySideState(raw: unknown): OrderJourneySideState | null {
  if (!raw) {
    return null;
  }

  if (typeof raw === "string") {
    const key = raw.trim().toLowerCase();
    if (key !== "cancelled" && key !== "refunded") {
      return null;
    }
    return { key, label: SIDE_STATE_LABELS[key], color: SIDE_STATE_COLORS[key], at: null };
  }

  if (typeof raw !== "object") {
    return null;
  }

  const row = raw as Record<string, unknown>;
  const key = asString(row.key).toLowerCase() || asString(row.status).toLowerCase();
  if (!key) {
    return null;
  }

  const known = key === "cancelled" || key === "refunded" ? (key as OrderJourneySideStateKey) : null;

  return {
    key,
    label: asLocalizedString(row.label) || (known ? SIDE_STATE_LABELS[known] : key),
    color: asString(row.color) || (known ? SIDE_STATE_COLORS[known] : null),
    at: asString(row.at) || null,
  };
}

/** All three steps with no progress — for explanatory pages (guide). */
export function buildNeutralJourney(): OrderJourneyStep[] {
  return ORDER_JOURNEY_TEMPLATE.map((step) => ({
    key: step.key,
    label: step.label,
    description: step.description,
    state: "pending",
    at: null,
    by: null,
  }));
}

/**
 * Journey for a client-side context where only coarse facts are known
 * (e.g. the payment-success screen): `paid` → «قيد المراجعة» done, the
 * employee step next.
 */
export function journeyAfterPayment(): OrderJourneyStep[] {
  return buildTemplateJourney(1);
}
