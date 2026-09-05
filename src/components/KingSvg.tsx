/** Rei em êxtase com os braços para cima — SVG artesanal do modal de FULL OUT. */
export default function KingSvg() {
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
        fill="rgba(245, 197, 66, 0.16)"
        stroke="#f5c542"
        strokeWidth="3"
        strokeDasharray="8 6"
      />
      {/* confetes reais */}
      <circle cx="35" cy="40" r="5" fill="#4a6ee0" />
      <circle cx="165" cy="45" r="6" fill="#f5c542" />
      <circle cx="25" cy="140" r="4" fill="#fde68a" />
      <circle cx="170" cy="130" r="5" fill="#9db8ff" />

      {/* manto azul com barra de arminho */}
      <path d="M58 138 L142 138 L134 186 L66 186 Z" fill="#1e3a8a" stroke="#f5c542" strokeWidth="3" />
      <path d="M66 178 L134 178 L134 186 L66 186 Z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
      <circle cx="76" cy="182" r="1.4" fill="#334155" />
      <circle cx="88" cy="182" r="1.4" fill="#334155" />
      <circle cx="100" cy="182" r="1.4" fill="#334155" />
      <circle cx="112" cy="182" r="1.4" fill="#334155" />
      <circle cx="124" cy="182" r="1.4" fill="#334155" />
      {/* faixa e medalha */}
      <path d="M60 140 L104 186 L120 186 L76 140 Z" fill="#7f1d3a" opacity="0.9" />
      <circle cx="112" cy="176" r="7" fill="#f5c542" stroke="#7a5200" strokeWidth="2" />

      {/* braços para cima em pura vitória */}
      <path d="M64 138 L34 88 L19 98 L44 146 Z" fill="#1d4ed8" />
      <circle cx="23" cy="92" r="12" fill="#ffd5b5" stroke="#4a2810" strokeWidth="2" />
      <path d="M136 138 L166 88 L181 98 L156 146 Z" fill="#1d4ed8" />
      <circle cx="177" cy="92" r="12" fill="#ffd5b5" stroke="#4a2810" strokeWidth="2" />

      {/* cetro voando de felicidade */}
      <g transform="translate(158, 38) rotate(24)">
        <rect x="-2.5" y="0" width="5" height="42" rx="2.5" fill="#b8860b" stroke="#7a5200" strokeWidth="1" />
        <circle cx="0" cy="-4" r="7" fill="#4a6ee0" stroke="#f5c542" strokeWidth="2.5" />
        <circle cx="-2.2" cy="-6.2" r="1.8" fill="#cdd9ff" />
      </g>

      {/* cabeça */}
      <circle cx="100" cy="86" r="37" fill="#ffd5b5" stroke="#4a2810" strokeWidth="2.5" />
      <circle cx="63" cy="88" r="7" fill="#ffd5b5" />
      <circle cx="137" cy="88" r="7" fill="#ffd5b5" />

      {/* coroa real */}
      <path
        d="M66 62 L62 38 L80 50 L100 30 L120 50 L138 38 L134 62 Z"
        fill="#f5c542"
        stroke="#7a5200"
        strokeWidth="2.5"
      />
      <rect x="64" y="58" width="72" height="9" rx="3" fill="#fde68a" stroke="#7a5200" strokeWidth="2" />
      <circle cx="80" cy="62.5" r="2.6" fill="#1e3a8a" />
      <circle cx="100" cy="62.5" r="2.6" fill="#7f1d3a" />
      <circle cx="120" cy="62.5" r="2.6" fill="#1e3a8a" />
      <circle cx="62" cy="36" r="3.5" fill="#fde68a" stroke="#7a5200" strokeWidth="1.5" />
      <circle cx="100" cy="28" r="3.5" fill="#fde68a" stroke="#7a5200" strokeWidth="1.5" />
      <circle cx="138" cy="36" r="3.5" fill="#fde68a" stroke="#7a5200" strokeWidth="1.5" />

      {/* olhos fechados de felicidade (^ ^) */}
      <path d="M80 84 Q88 74 96 84" fill="none" stroke="#2b1810" strokeWidth="4" strokeLinecap="round" />
      <path d="M104 84 Q112 74 120 84" fill="none" stroke="#2b1810" strokeWidth="4" strokeLinecap="round" />

      {/* sorrisão aberto */}
      <path d="M82 97 Q100 126 118 97 Z" fill="#b91c1c" stroke="#4a2810" strokeWidth="2.5" />
      <path d="M90 109 Q100 101 110 109 Z" fill="#fb7185" />

      {/* bochechas + lágrima de emoção */}
      <circle cx="74" cy="95" r="7" fill="rgba(255, 100, 100, 0.4)" />
      <circle cx="126" cy="95" r="7" fill="rgba(255, 100, 100, 0.4)" />
      <path d="M140 70 Q146 78 140 84 Q134 78 140 70 Z" fill="#38bdf8" />
    </svg>
  );
}
