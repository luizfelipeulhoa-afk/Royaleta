const TWINKLES = [
  { top: "12%", left: "8%", delay: "0s", color: "#00f0ff" },
  { top: "22%", left: "88%", delay: "0.6s", color: "#ff2a85" },
  { top: "64%", left: "6%", delay: "1.1s", color: "#ffc72c" },
  { top: "78%", left: "90%", delay: "0.3s", color: "#00f0ff" },
  { top: "8%", left: "46%", delay: "1.6s", color: "#ffffff" },
  { top: "42%", left: "3%", delay: "2s", color: "#9d4edd" },
  { top: "52%", left: "96%", delay: "1.3s", color: "#ffc72c" },
  { top: "88%", left: "30%", delay: "0.9s", color: "#ff2a85" },
];

/**
 * Camadas ambiente da arena: holofotes varrendo (que intensificam
 * durante o giro via body.in-competition), strobo de câmera,
 * estrelas piscando e brilho de palco no rodapé.
 */
export default function ArenaBackground() {
  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-[1] overflow-hidden" aria-hidden>
        <div className="spotlight spotlight-1" />
        <div className="spotlight spotlight-2" />
        <div className="spotlight spotlight-3" />
      </div>

      <div className="strobe-flash pointer-events-none fixed inset-0 z-[2] bg-white" aria-hidden />

      {TWINKLES.map((t, i) => (
        <span
          key={i}
          className="animate-twinkle pointer-events-none fixed z-[3] rounded-full"
          style={{
            top: t.top,
            left: t.left,
            width: 5,
            height: 5,
            background: t.color,
            boxShadow: `0 0 10px ${t.color}`,
            animationDelay: t.delay,
          }}
          aria-hidden
        />
      ))}

      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[1] h-56 bg-[radial-gradient(ellipse_at_bottom,rgba(157,78,221,0.18),transparent_70%)]"
        aria-hidden
      />
    </>
  );
}
