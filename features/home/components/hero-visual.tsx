import Image from "next/image";

type HeroVisualProps = {
  alt: string;
  imageUrl: string;
};

function isRemoteImage(src: string) {
  return src.startsWith("http://") || src.startsWith("https://");
}

export default function HeroVisual({ alt, imageUrl }: HeroVisualProps) {
  const remote = isRemoteImage(imageUrl);

  return (
    <div className="w-full animate-float">
      <div className="relative overflow-hidden rounded-3xl lg:rounded-[32px]">
        <Image
          src={imageUrl}
          alt={alt}
          width={720}
          height={640}
          className="h-auto w-full object-contain"
          sizes="(max-width: 1023px) 0px, 50vw"
          quality={75}
          priority
          unoptimized={remote}
        />
        {/* Periodic light sweep — makes the mockup feel fresh and "live". */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-linear-to-r from-transparent via-white/25 to-transparent animate-shine"
        />
      </div>
    </div>
  );
}
