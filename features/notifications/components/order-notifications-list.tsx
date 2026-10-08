"use client";

import { useEffect, useState } from "react";

import NotificationItemCard from "@/features/notifications/components/notification-item-card";
import {
  ORDER_UPDATED_EVENT,
  type OrderUpdatedDetail,
} from "@/features/notifications/constants/order-updated-event";
import { getOrderNotifications } from "@/features/notifications/services/account-notifications";
import type { AccountNotification } from "@/features/notifications/utils/to-account-notification";

function formatDate(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("ar-SA-u-ca-gregory-nu-latn", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Riyadh",
  }).format(date);
}

/**
 * «إشعارات هذا الطلب» — للعميل المسجّل فقط (عروض/خصومات بالكود، الاسترجاع،
 * الاستلام، البيانات الناقصة…). زائر أو بدون إشعارات ← لا يظهر شيء.
 * `refreshKey` يعيد التحميل (مثلاً بعد وصول إشعار فوري).
 */
export default function OrderNotificationsList({
  orderNumber,
  refreshKey = 0,
  title = "إشعارات هذا الطلب",
}: {
  orderNumber: string;
  refreshKey?: number;
  title?: string;
}) {
  const [items, setItems] = useState<AccountNotification[] | null>(null);
  const [pushTick, setPushTick] = useState(0);

  // A push about this order (refund, discount…) → reload the list.
  useEffect(() => {
    function onOrderUpdated(event: Event) {
      const detail = (event as CustomEvent<OrderUpdatedDetail>).detail;
      if (!detail?.orderNumber || detail.orderNumber === orderNumber) {
        setPushTick((tick) => tick + 1);
      }
    }
    window.addEventListener(ORDER_UPDATED_EVENT, onOrderUpdated);
    return () => window.removeEventListener(ORDER_UPDATED_EVENT, onOrderUpdated);
  }, [orderNumber]);

  useEffect(() => {
    let cancelled = false;
    void getOrderNotifications(orderNumber)
      .then((result) => {
        if (!cancelled) setItems(result.ok ? result.items : []);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      });
    return () => {
      cancelled = true;
    };
  }, [orderNumber, refreshKey, pushTick]);

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <section className="space-y-2">
      <p className="text-sm font-extrabold text-foreground">{title}</p>
      <ul className="space-y-2">
        {items.slice(0, 10).map((item) => (
          <NotificationItemCard
            key={`order-${item.id}`}
            item={{ ...item, href: null }}
            dateLabel={formatDate(item.createdAt)}
          />
        ))}
      </ul>
    </section>
  );
}
