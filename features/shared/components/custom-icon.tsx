"use client";

import { ReactSVG } from "react-svg";

import { cn } from "@/lib/utils";

type CustomIconProps = {
  src: string;
  size?: number;
  className?: string;
};

function injectSvgColors(svg: SVGSVGElement, size: number) {
  svg.setAttribute("width", String(size));
  svg.setAttribute("height", String(size));
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");

  svg.querySelectorAll<SVGElement>("[fill]").forEach((el) => {
    if (el.getAttribute("fill") !== "none") {
      el.setAttribute("fill", "currentColor");
    }
  });

  svg.querySelectorAll<SVGElement>("[stroke]").forEach((el) => {
    if (el.getAttribute("stroke") !== "none") {
      el.setAttribute("stroke", "currentColor");
    }
  });
}

/**
 * The riyal glyph is the only currency marker next to many amounts; without
 * a text alternative screen readers and text extraction read «400» with no
 * currency (QA PROPS-19). It gets a visually hidden «ريال».
 */
const CURRENCY_ICON_TEXT: Record<string, string> = {
  "/icons/ryal.svg": "ريال",
};

export default function CustomIcon({
  src,
  size = 24,
  className,
}: CustomIconProps) {
  const currencyText = CURRENCY_ICON_TEXT[src];
  if (currencyText) {
    return (
      <>
        <IconSvg src={src} size={size} className={className} />
        <span className="sr-only">{` ${currencyText}`}</span>
      </>
    );
  }

  return <IconSvg src={src} size={size} className={className} />;
}

function IconSvg({ src, size = 24, className }: CustomIconProps) {
  return (
    <ReactSVG
      src={src}
      beforeInjection={(svg) => injectSvgColors(svg, size)}
      wrapper="span"
      className={cn(
        "inline-flex shrink-0 items-center justify-center [&_svg]:block",
        className
      )}
    />
  );
}
