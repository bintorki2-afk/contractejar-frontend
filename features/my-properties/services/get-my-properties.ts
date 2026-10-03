"use server";

import { getToken } from "@/actions/auth";
import { apiRequest } from "@/lib/api/api-request";
import type {
  RealEstateIndexApiResponse,
  RealEstateListItem,
} from "@/features/my-properties/types/real-estate-list-item";

export async function getMyProperties(): Promise<RealEstateListItem[]> {
  // No auth cookie — the caller isn't signed in, so there are no "my"
  // properties. Skip the request entirely instead of letting the backend
  // reject it with a 403.
  const token = await getToken();
  if (!token) {
    return [];
  }

  const response = await apiRequest<RealEstateIndexApiResponse>(
    "/realstate/index",
    {
      method: "GET",
      cache: "no-store",
    },
  );

  // "ليس لديك صلاحية" means the current user has no properties / isn't a
  // landlord — empty list, not a failure. The API may send this as HTTP 403,
  // body `code: 403`, or HTTP 200 with `success: false` + that message.
  // Returning here keeps the rejection from crossing the "use server" boundary
  // (which otherwise surfaces as POST 500 even when callers catch it).
  const permissionDeniedMessage = "ليس لديك صلاحية";
  const message = response.error || response.data?.message;
  const isPermissionDenied =
    response.status === 403 ||
    response.data?.code === 403 ||
    message === permissionDeniedMessage;

  if (isPermissionDenied) {
    return [];
  }

  if (!response.ok || !response.data?.success) {
    throw new Error(message || "Failed to fetch properties");
  }

  // Only show properties the customer actually finished: the name is set on the
  // final step, so a property with no name was created at the deed step and then
  // abandoned — hide those incomplete records from the list and the count.
  return response.data.data.filter(
    (property) => (property.name_real_estate ?? "").trim() !== "",
  );
}
