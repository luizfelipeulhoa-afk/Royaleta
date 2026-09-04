/** Treinador pulando de felicidade — SVG artesanal do modal de FULL OUT. */
export default function CoachSvg() {
  return (
    <svg
      viewBox="0 0 200 200"
      className="h-full w-full drop-shadow-[0_10px_14px_rgba(0,0,0,0.6)]"
      aria-hidden="true"
    >
      <circle
        cx="100"
        cy="100"
        r="88"
        fill="rgba(255, 199, 44, 0.2)"
        stroke="#ffd700"
        strokeWidth="3"
        strokeDasharray="8 6"
      />
      {/* confetes */}
      <circle cx="35" cy="40" r="5" fill="#00f0ff" />
      <circle cx="165" cy="45" r="6" fill="#ff2a85" />
      <circle cx="25" cy="140" r="4" fill="#ffd700" />
      <circle cx="170" cy="130" r="5" fill="#34d399" />

      {/* corpo com camisa escrita COACH */}
      <path d="M60 140 L140 140 L130 185 L70 185 Z" fill="#0f172a" stroke="#ffd700" strokeWidth="3" />
      <text
        x="100"
        y="166"
        fontFamily="'Montserrat', sans-serif"
        fontWeight="900"
        fontSize="12"
        fill="#ffd700"
        textAnchor="middle"
      >
        COACH
      </text>

      {/* apito */}
      <path d="M85 130 Q100 152 115 130" fill="none" stroke="#ffffff" strokeWidth="2.5" />
      <path d="M96 142 L104 142 L106 148 L98 148 Z" fill="#ffd700" stroke="#000" strokeWidth="1" />

      {/* braços para cima em pura vitória */}
      <path d="M65 140 L35 90 L20 100 L45 148 Z" fill="#f87171" />
      <circle cx="24" cy="94" r="12" fill="#ffd5b5" stroke="#4a2810" strokeWidth="2" />
      <path d="M135 140 L165 90 L180 100 L155 148 Z" fill="#f87171" />
      <circle cx="176" cy="94" r="12" fill="#ffd5b5" stroke="#4a2810" strokeWidth="2" />

      {/* prancheta voando de felicidade */}
      <g transform="translate(160, 45) rotate(20)">
        <rect x="0" y="0" width="26" height="36" rx="3" fill="#8c532b" stroke="#fff" strokeWidth="1.5" />
        <rect x="7" y="-3" width="12" height="6" rx="1" fill="#cbd5e1" />
        <line x1="4" y1="8" x2="22" y2="8" stroke="#fff" strokeWidth="1.5" />
        <line x1="4" y1="14" x2="18" y2="14" stroke="#fff" strokeWidth="1.5" />
        <line x1="4" y1="20" x2="20" y2="20" stroke="#ffd700" strokeWidth="2" />
      </g>

      {/* cabeça com boné virado para trás */}
      <circle cx="100" cy="85" r="38" fill="#ffd5b5" stroke="#4a2810" strokeWidth="2.5" />
      <circle cx="62" cy="85" r="7" fill="#ffd5b5" />
      <circle cx="138" cy="85" r="7" fill="#ffd5b5" />
      <path d="M64 75 Q100 45 136 75 Z" fill="#0f172a" />
      <path d="M50 78 Q35 84 55 90 Z" fill="#ff2a85" />

      {/* olhos fechados de felicidade (^ ^) */}
      <path d="M80 82 Q88 72 96 82" fill="none" stroke="#2b1810" strokeWidth="4" strokeLinecap="round" />
      <path d="M104 82 Q112 72 120 82" fill="none" stroke="#2b1810" strokeWidth="4" strokeLinecap="round" />

      {/* sorrisão aberto */}
      <path d="M82 96 Q100 125 118 96 Z" fill="#b91c1c" stroke="#4a2810" strokeWidth="2.5" />
      <path d="M90 108 Q100 100 110 108 Z" fill="#fb7185" />

      {/* bochechas + gota de emoção */}
      <circle cx="76" cy="94" r="7" fill="rgba(255, 100, 100, 0.4)" />
      <circle cx="124" cy="94" r="7" fill="rgba(255, 100, 100, 0.4)" />
      <path d="M138 68 Q144 76 138 82 Q132 76 138 68 Z" fill="#38bdf8" />
    </svg>
  );
}
