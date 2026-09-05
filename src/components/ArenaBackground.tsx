const TWINKLES = [
  { top: "14%", left: "7%", delay: "0s", color: "#fde047" },
  { top: "24%", left: "91%", delay: "0.7s", color: "#3b82f6" },
  { top: "62%", left: "4%", delay: "1.2s", color: "#f59e0b" },
  { top: "80%", left: "93%", delay: "0.4s", color: "#06b6d4" },
  { top: "9%", left: "47%", delay: "1.7s", color: "#fde047" },
  { top: "45%", left: "2%", delay: "2.1s", color: "#3b82f6" },
  { top: "55%", left: "97%", delay: "1.4s", color: "#fde047" },
  { top: "90%", left: "32%", delay: "0.9s", color: "#06b6d4" },
];

/**
 * Iluminação ambiente: mesh gradient azul-real + ouro sobre a
 * noite profunda, com orbes que derivam lentamente e poeira
 * dourada cintilando ao fundo.
 */
export default function ArenaBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      {/* mesh gradient azul + ouro */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(1100px 700px at 18% 8%, rgba(29, 78, 216, 0.2) 0%, transparent 62%)," +
            "radial-gradient(950px 650px at 85% 90%, rgba(245, 158, 11, 0.15) 0%, transparent 58%)," +
            "radial-gradient(700px 500px at 92% 12%, rgba(6, 182, 212, 0.1) 0%, transparent 60%)," +
            "linear-gradient(180deg, #070b19 0%, #050711 100%)",
        }}
      />

      {/* orbes vivos */}
      <div
        className="absolute -left-32 top-[-10%] h-[46rem] w-[46rem] rounded-full opacity-70 blur-[110px]"
        style={{
          background: "radial-gradient(circle, rgba(29,78,216,0.32), transparent 65%)",
          animation: "drift-a 30s ease-in-out infinite",
        }}
      />
      <div
        className="absolute -right-40 bottom-[-14%] h-[42rem] w-[42rem] rounded-full opacity-70 blur-[110px]"
        style={{
          background: "radial-gradient(circle, rgba(245,158,11,0.22), transparent 65%)",
          animation: "drift-b 34s ease-in-out infinite",
        }}
      />
      <div
        className="absolute left-[38%] top-[55%] h-[30rem] w-[30rem] rounded-full opacity-50 blur-[100px]"
        style={{
          background: "radial-gradient(circle, rgba(6,182,212,0.16), transparent 65%)",
          animation: "drift-a 38s ease-in-out infinite reverse",
        }}
      />

      {/* poeira real */}
      {TWINKLES.map((t, i) => (
        <span
          key={i}
          className="animate-twinkle absolute rounded-full"
          style={{
            top: t.top,
            left: t.left,
            width: 4,
            height: 4,
            background: t.color,
            boxShadow: `0 0 12px ${t.color}`,
            animationDelay: t.delay,
          }}
        />
      ))}

      {/* vinheta para foco central */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 45%, rgba(3, 5, 12, 0.55) 100%)",
        }}
      />
    </div>
  );
}
