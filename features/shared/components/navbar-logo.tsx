export default function NavbarLogo() {
  return (
    <svg
      width="46"
      height="46"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="shrink-0"
    >
      {/* عقد إيجار — وثيقة موثّقة (Contract Ejar identity mark) */}
      <rect x="13" y="9" width="30" height="40" rx="6" fill="#169963" />
      <path d="M19 20H37" stroke="white" strokeWidth="3" strokeLinecap="round" />
      <path d="M19 27H37" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
      <path d="M19 34H31" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
      <circle cx="45" cy="45" r="13" fill="#0B5A3C" stroke="white" strokeWidth="3" />
      <path
        d="M39 45l4.5 4.5 7.5-9"
        fill="none"
        stroke="white"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
