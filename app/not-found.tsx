import Footer from "@/features/footer/components/footer";
import NavbarShell from "@/features/shared/components/navbar-shell";
import NotFoundContent from "@/features/shared/components/not-found-content";
import { getNotFoundMetadata } from "@/features/shared/utils/not-found-metadata";

export const generateMetadata = getNotFoundMetadata;

/**
 * Root 404 — unmatched URLs anywhere on the site. Rendered outside every route
 * group layout, so it draws the site chrome itself (QA WEB-25: a mistyped link
 * used to land on a bare card with no navbar, footer or WhatsApp button).
 */
export default function NotFound() {
  return (
    <>
      <NavbarShell />
      <NotFoundContent />
      <Footer />
    </>
  );
}
