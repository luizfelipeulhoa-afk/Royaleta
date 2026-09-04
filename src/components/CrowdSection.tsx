interface CrowdCharacter {
  pompom?: string;
  sign?: string;
  face: string;
}

const CHARACTERS: CrowdCharacter[] = [
  { pompom: "🎀", face: "👧🏼" },
  { sign: "HIT 0!", face: "🦁" },
  { pompom: "📣", face: "🧑🏻" },
  { pompom: "✨", face: "👱🏽‍♀️" },
  { sign: "LET'S GO!", face: "🙋🏻‍♂️" },
  { pompom: "🎉", face: "🧑🏿‍🦱" },
];

const METER_HEIGHTS = [10, 14, 18, 13];

/**
 * Torcida da arena: balança devagar no idle e pula freneticamente
 * enquanto a roleta está girando (body.in-competition via prop `hyped`).
 */
export default function CrowdSection({ hyped }: { hyped: boolean }) {
  return (
    <section
      className={`relative w-full overflow-hidden rounded-[20px] border border-white/10 bg-gradient-to-b from-[rgba(20,28,52,0.5)] to-[rgba(10,14,28,0.95)] ${
        hyped ? "crowd-hyped" : "crowd-idle"
      }`}
      style={{ height: 96 }}
      aria-label="Torcida na arena"
    >
      <span className="absolute left-3 top-1.5 text-[10px] font-extrabold uppercase tracking-[1px] text-white/40">
        Torcida na arena
      </span>

      {/* medidor de decibéis */}
      <div className="absolute right-3 top-1.5 flex items-end gap-1">
        <span
          className={`text-[9px] font-extrabold uppercase tracking-wider transition-colors duration-300 ${
            hyped ? "text-gold" : "text-white/35"
          }`}
        >
          dB
        </span>
        <div className="flex items-end gap-[3px]">
          {METER_HEIGHTS.map((h, i) => (
            <span
              key={i}
              className={`meter-bar w-[4px] rounded-sm transition-colors duration-300 ${
                hyped ? "bg-gold shadow-[0_0_6px_rgba(255,199,44,0.8)]" : "bg-white/25"
              }`}
              style={{ height: h, animationDelay: `${i * 0.13}s` }}
            />
          ))}
        </div>
      </div>

      <div className="flex h-full items-end justify-around px-2 pb-1.5 pt-7">
        {CHARACTERS.map((c, i) => (
          <div
            key={i}
            className="crowd-char flex flex-col items-center"
            style={{ animationDelay: `${i * 0.09}s` }}
          >
            {c.sign ? (
              <span className="mb-0.5 whitespace-nowrap rounded-md border border-white bg-gold px-1.5 py-0.5 text-[9px] font-black text-black shadow-[0_2px_6px_rgba(0,0,0,0.5)]">
                {c.sign}
              </span>
            ) : (
              <span className="mb-[-5px] text-lg leading-none" aria-hidden>
                {c.pompom}
              </span>
            )}
            <span className="text-2xl leading-none" aria-hidden>
              {c.face}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
