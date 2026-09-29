import Image from "next/image";

type AboutValuesItemProps = {
  eyebrow: string;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  reverse?: boolean;
  /**
   * When true, the image is shown on its own (no white card / shadow / ring)
   * so a transparent PNG blends into the section background.
   */
  bareImage?: boolean;
};

export default function AboutValuesItem({
  eyebrow,
  title,
  description,
  imageSrc,
  imageAlt,
  reverse = false,
  bareImage = false,
}: AboutValuesItemProps) {
  const remote =
    imageSrc.startsWith("http://") || imageSrc.startsWith("https://");

  return (
    <article
      className={`grid items-center gap-8 lg:grid-cols-2 lg:gap-14 ${
        reverse ? "lg:[&>*:first-child]:order-2" : ""
      }`}
    >
      <div className="space-y-4 text-center lg:text-start">
        <p className="text-sm font-semibold text-brand">{eyebrow}</p>
        <h3 className="text-4xl font-extrabold leading-tight text-brand md:text-5xl">
          {title}
        </h3>
        <p className="max-w-md text-sm leading-8 text-muted-foreground md:text-base">
          {description}
        </p>
      </div>

      <div
        className={
          bareImage
            ? "flex justify-center"
            : "overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-black/10 ring-1 ring-black/5 dark:shadow-black/40 dark:ring-white/10"
        }
      >
        <Image
          src={imageSrc}
          alt={imageAlt}
          width={1024}
          height={768}
          className={`h-auto w-full object-contain${bareImage ? " [mask-image:linear-gradient(to_bottom,#000_62%,transparent_96%)] [-webkit-mask-image:linear-gradient(to_bottom,#000_62%,transparent_96%)]" : ""}`}
          unoptimized={remote}
        />
      </div>
    </article>
  );
}
