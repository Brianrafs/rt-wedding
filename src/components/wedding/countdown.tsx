"use client";

import { useEffect, useState } from "react";
import { getCountdown } from "@/lib/countdown";
import { PauseIcon, PlayIcon } from "@/components/ui/icons";

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
    <div className="mx-auto mt-10 min-h-42.5 max-w-160">
      {countdown?.complete ? (
        <p className="py-8 font-display text-3xl">O nosso grande dia chegou.</p>
      ) : (
        <>
          <dl className="grid grid-cols-2 gap-y-6 min-[430px]:grid-cols-4" aria-label="Contagem regressiva" aria-live="off">
            {units.map(([key, label]) => (
              <div className="flex flex-col-reverse gap-1 px-1 even:border-l even:border-border min-[430px]:not-first:border-l min-[430px]:not-first:border-border" key={key}>
                <dt className="text-[0.625rem] tracking-[0.08em]">{label}</dt>
                <dd className="font-display text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.2] tabular-nums">{countdown ? String(countdown[key]).padStart(2, "0") : "—"}</dd>
              </div>
            ))}
          </dl>
          <noscript><p>A contagem regressiva precisa de JavaScript. Nosso dia será 10 de dezembro de 2026.</p></noscript>
        </>
      )}
    </div>
  );
}
