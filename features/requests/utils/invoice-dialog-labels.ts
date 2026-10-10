import type { RequestInvoiceDialogLabels } from "@/features/requests/types/request-invoice-labels";

/**
 * تسميات حوار الفاتورة من `requests.card.invoiceDialog` — نفس المصدر الذي
 * تبنيه صفحة `/requests`. يأخذ مترجم الخادم (`getTranslations`) أو العميل،
 * لأن مساحة `requests` ليست ضمن رسائل العميل خارج `(services)` (صفحات
 * التتبّع تبنيها على الخادم وتمرّرها كخاصية).
 */
export function buildInvoiceDialogLabels(
  t: (key: string) => string,
): RequestInvoiceDialogLabels {
  return {
    close: t("close"),
    loading: t("loading"),
    retry: t("retry"),
    loadError: t("loadError"),
    customerLabel: t("customerLabel"),
    requestNumberLabel: t("requestNumberLabel"),
    contractTypeLabel: t("contractTypeLabel"),
    tableIndex: t("tableIndex"),
    tableDescription: t("tableDescription"),
    tableAmount: t("tableAmount"),
    title: t("title"),
    platformName: t("platformName"),
    platformSubtitle: t("platformSubtitle"),
    printLabel: t("printLabel"),
    totalDueLabel: t("totalDueLabel"),
    subtotalLabel: t("subtotalLabel"),
    discountLabel: t("discountLabel"),
    vatLabel: t("vatLabel"),
    unpaidStatusLabel: t("unpaidStatusLabel"),
    paidStatusLabel: t("paidStatusLabel"),
  };
}
