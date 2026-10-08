/**
 * «فيديوهات تعليمية» on /guide — a static list the owner edits by hand.
 * Set `videoUrl` (YouTube / MP4) once a tutorial is recorded; entries without
 * one render with a «قريباً» badge. `duration` is a display string ("3:20").
 */
export type GuideTutorial = {
  id: string;
  title: string;
  description: string;
  /** Display duration, e.g. "3:20"; empty while not recorded. */
  duration: string;
  videoUrl?: string;
};

export const GUIDE_TUTORIALS: GuideTutorial[] = [
  {
    id: "residential",
    title: "إنشاء عقد سكني",
    description: "من اختيار نوع المستند حتى الدفع والتوثيق عبر إيجار، خطوة بخطوة.",
    duration: "",
  },
  {
    id: "commercial",
    title: "إنشاء عقد تجاري",
    description: "بيانات المنشأة والسجل التجاري، والفروقات عن العقد السكني.",
    duration: "",
  },
  {
    id: "documents",
    title: "أنواع المستندات",
    description: "الصك الإلكتروني والورقي، صك الورثة والوقف، ومتى تُطبّق الرسوم الإضافية.",
    duration: "",
  },
  {
    id: "agent",
    title: "إضافة وكيل",
    description: "إضافة وكيل للمالك أو للمستأجر وإرفاق الوكالة الصحيحة.",
    duration: "",
  },
  {
    id: "track",
    title: "تتبّع الطلب",
    description: "متابعة حالة طلبك برقم الطلب ورقم الجوال بدون تسجيل دخول.",
    duration: "",
  },
  {
    id: "lessor-change",
    title: "تغيير المؤجر",
    description: "نقل العقود من صك المالك القديم إلى الصك الجديد خلال خطوتين.",
    duration: "",
  },
  {
    id: "renewal-sublease",
    title: "التجديد والإيجار من الباطن",
    description: "تجديد عقد قائم بنفس العنوان، وإنشاء عقد إيجار من الباطن.",
    duration: "",
  },
  {
    id: "app",
    title: "التطبيق",
    description: "جولة سريعة في تطبيق عقد إيجار: الطلبات، العقارات والإشعارات.",
    duration: "",
  },
];
