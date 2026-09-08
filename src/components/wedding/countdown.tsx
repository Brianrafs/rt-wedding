"use client";

import { useEffect, useState } from "react";
import { getCountdown } from "@/lib/countdown";

const units = [
  ["days", "dias"], ["hours", "horas"], ["minutes", "minutos"], ["seconds", "segundos"],
] as const;

export function Countdown({ datetime }: { datetime: string }) {
  const [now, setNow] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const target = Date.parse(datetime);
  const countdown = now === null ? null : getCountdown(target, now);
  const complete = countdown?.complete ?? false;

  useEffect(() => {
    if (paused || complete) return;
    const update = () => setNow(Date.now());
    const initial = window.setTimeout(update, 0);
    const interval = window.setInterval(update, 1000);
    return () => {
      window.clearTimeout(initial);
      window.clearInterval(interval);
    };
  }, [paused, complete]);

  return (
    <div className="countdown">
      {countdown?.complete ? (
        <p className="countdown-complete">O nosso grande dia chegou.</p>
      ) : (
        <>
          <dl className="countdown-units" aria-label="Contagem regressiva" aria-live="off">
            {units.map(([key, label]) => (
              <div key={key}>
                <dt>{label}</dt>
                <dd>{countdown ? String(countdown[key]).padStart(2, "0") : "—"}</dd>
              </div>
            ))}
          </dl>
          {countdown && (
            <button className="countdown-control" type="button" onClick={() => setPaused(!paused)}>
              {paused ? "Retomar contagem" : "Pausar contagem"}
            </button>
          )}
          <noscript><p>A contagem regressiva precisa de JavaScript. Nosso dia será 10 de dezembro de 2026.</p></noscript>
        </>
      )}
    </div>
  );
}
