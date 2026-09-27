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
    <div className="w-full">
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
      </div>
    </div>
  );
}
