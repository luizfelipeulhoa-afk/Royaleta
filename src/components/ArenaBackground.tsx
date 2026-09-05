const TWINKLES = [
  { top: "12%", left: "8%", delay: "0s", color: "#f5c542" },
  { top: "22%", left: "88%", delay: "0.6s", color: "#9db8ff" },
  { top: "64%", left: "6%", delay: "1.1s", color: "#fde68a" },
  { top: "78%", left: "90%", delay: "0.3s", color: "#f5c542" },
  { top: "8%", left: "46%", delay: "1.6s", color: "#ffffff" },
  { top: "42%", left: "3%", delay: "2s", color: "#4a6ee0" },
  { top: "52%", left: "96%", delay: "1.3s", color: "#f5c542" },
  { top: "88%", left: "30%", delay: "0.9s", color: "#9db8ff" },
];

/**
 * Camadas ambiente do castelo: fachos de tocha varrendo (que
 * intensificam durante o giro via body.in-competition), lampejo
 * de corte, estrelas douradas e brilho do trono no rodapé.
 */
export default function ArenaBackground() {
  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-[1] overflow-hidden" aria-hidden>
        <div className="spotlight spotlight-1" />
        <div className="spotlight spotlight-2" />
        <div className="spotlight spotlight-3" />
      </div>

      <div
        className="strobe-flash pointer-events-none fixed inset-0 z-[2]"
        style={{ background: "#fff8e1" }}
        aria-hidden
      />

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
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[1] h-56 bg-[radial-gradient(ellipse_at_bottom,rgba(30,58,138,0.24),transparent_70%)]"
        aria-hidden
      />
    </>
  );
}
