import { Headphones, Mail } from "lucide-react";

type FooterSupportColumnProps = {
  title: string;
  phone: string;
  phoneHref?: string | null;
  weekdaysHours: string;
  saturdayHours: string;
  email: string;
};

export default function FooterSupportColumn({
  title,
  phone,
  phoneHref,
  weekdaysHours,
  saturdayHours,
  email,
}: FooterSupportColumnProps) {
  return (
    <div className="space-y-4 lg:col-span-2">
      <h3 className="text-base font-bold text-brand">{title}</h3>

      <div className="space-y-3">
        <p className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
          <Headphones className="size-4 text-brand" aria-hidden="true" />
          {phoneHref ? (
            <a href={phoneHref} dir="ltr" className="inline-flex min-h-10 items-center transition hover:text-brand">
              {phone}
            </a>
          ) : (
            <span dir="ltr">{phone}</span>
          )}
        </p>

        <div className="space-y-2 border-b border-t py-2">
          <p className="text-sm leading-6 text-muted-foreground">
            {weekdaysHours}
          </p>
          <p className="text-sm leading-6 text-muted-foreground">
            {saturdayHours}
          </p>
        </div>

        {email && email.trim() !== "" ? (
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
            <Mail className="size-4 text-brand" aria-hidden="true" />
            <a href={`mailto:${email}`} className="inline-flex min-h-10 items-center transition hover:text-brand">
              {email}
            </a>
          </p>
        ) : null}
      </div>
    </div>
  );
}
