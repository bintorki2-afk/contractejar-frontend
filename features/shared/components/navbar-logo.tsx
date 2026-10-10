export default function NavbarLogo() {
  return (
    <svg
      width="46"
      height="46"
      viewBox="-30 6 264 264"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="shrink-0"
    >
      {/* شعار عقدي — الدرع (الأمان) والعقد (من دليل الهوية) */}
      <defs>
        <linearGradient id="aqdi-mark-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0d5a50" />
          <stop offset="1" stopColor="#0db38b" />
        </linearGradient>
      </defs>
      <path
        fill="url(#aqdi-mark-gradient)"
        fillRule="evenodd"
        d="M13 38L60 34C78 31 92 22 101.5 10C111 22 125 31 143 34L190 38V135C190 175 150 220 101.5 255C53 220 13 175 13 135Z M33 59L60 55C76 52 90 45 101.5 37C113 45 127 52 143 55L170 59V135C170 165 140 200 101.5 227C63 200 33 165 33 135Z"
      />
      <g fill="url(#aqdi-mark-gradient)">
        <rect x="53" y="79" width="97" height="11" />
        <rect x="53" y="109" width="97" height="11" />
        <rect x="53" y="140" width="97" height="11" />
        <rect x="90" y="165" width="23" height="23" />
      </g>
    </svg>
  );
}
