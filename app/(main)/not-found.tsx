import NotFoundContent from "@/features/shared/components/not-found-content";
import { getNotFoundMetadata } from "@/features/shared/utils/not-found-metadata";

export const generateMetadata = getNotFoundMetadata;

/** notFound() inside the public pages — `(main)/layout` already draws the chrome. */
export default function MainNotFound() {
  return <NotFoundContent />;
}
