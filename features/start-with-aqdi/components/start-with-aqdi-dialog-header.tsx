import Image from "next/image";

type StartWithAqdiDialogHeaderProps = {
  mainTitle: string;
  subtitle: string;
  ejarLogoAlt: string;
  aqdiLogoAlt: string;
};

export default function StartWithAqdiDialogHeader({
  mainTitle,
  subtitle,
  ejarLogoAlt,
  aqdiLogoAlt,
}: StartWithAqdiDialogHeaderProps) {
  return (
    <div className="space-y-4 text-center">
      <div className="flex items-center justify-center gap-4">
        <Image
          src="/images/logo.png"
          alt={aqdiLogoAlt}
          width={52}
          height={56}
          className="h-14 w-auto object-contain"
        />
        <div className="h-10 w-px bg-[#e5e5e5] dark:bg-[#262d2c]" aria-hidden="true" />
        <Image
          src="/images/ejar.png"
          alt={ejarLogoAlt}
          width={120}
          height={40}
          className="h-10 w-auto object-contain"
        />
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-bold text-brand md:text-xl">{mainTitle}</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {subtitle}
        </p>
      </div>
    </div>
  );
}
