import Script from "next/script";

/**
 * Microsoft Clarity — free session recordings + heatmaps (where users click,
 * scroll, hesitate, rage-click, and drop off).
 *
 * Env-driven: with no `NEXT_PUBLIC_CLARITY_ID` this renders nothing and loads
 * no script. Set the id (from clarity.microsoft.com → Settings → the project
 * id) in the environment to activate. Clarity masks text content by default,
 * so it stays privacy-friendly.
 */
// Clarity project id for عقد إيجار (contractejar.com). Public by design — it
// appears in the page source like any tracking id. An env var overrides it.
const DEFAULT_CLARITY_ID = "yp4isdfowh";

export default function ClarityScript() {
  const clarityId = process.env.NEXT_PUBLIC_CLARITY_ID || DEFAULT_CLARITY_ID;

  if (!clarityId) {
    return null;
  }

  return (
    <Script id="ms-clarity" strategy="afterInteractive">
      {`
        (function(c,l,a,r,i,t,y){
          c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "${clarityId}");
      `}
    </Script>
  );
}
