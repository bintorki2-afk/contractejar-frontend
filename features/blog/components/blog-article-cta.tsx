import Link from "next/link";
import { ArrowUpLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

// Conversion block rendered at the end of every article: turns readers into
// contract creators. Links straight to the (no-login) create-contract flow.
export default function BlogArticleCta() {
  return (
    <div className="rounded-3xl bg-brand px-6 py-8 text-white md:px-10 md:py-10">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-5 text-center">
        <h2 className="text-2xl font-extrabold leading-snug md:text-3xl">
          جاهز توثّق عقدك؟ أنشئ عقد إيجار موثّق في دقائق
        </h2>
        <p className="text-base leading-8 text-white/85 md:text-lg">
          بدون تسجيل دخول وبخطوات بسيطة — عقد واضح يحفظ حقّ المالك والمستأجر،
          ونتواصل معك عبر واتساب لإتمامه.
        </p>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Link href="/create-contract?id=residential" className="sm:w-auto">
            <Button className="h-12 w-full gap-3 rounded-full bg-white px-6 text-sm font-semibold text-brand dark:!text-[#005848] hover:bg-white/90 sm:w-auto">
              <span>أنشئ عقد إيجار سكني</span>
              <ArrowUpLeft className="size-4" aria-hidden="true" />
            </Button>
          </Link>
          <Link href="/create-contract?id=commercial" className="sm:w-auto">
            <Button
              variant="outline"
              className="h-12 w-full gap-3 rounded-full border-white/40 bg-transparent px-6 text-sm font-semibold text-white hover:bg-white/10 hover:text-white sm:w-auto"
            >
              <span>عقد إيجار تجاري</span>
              <ArrowUpLeft className="size-4" aria-hidden="true" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
