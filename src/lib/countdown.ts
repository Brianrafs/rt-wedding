export function getCountdown(target: number, now: number) {
  const remaining = Math.max(0, Math.ceil((target - now) / 1000));
  return {
    days: Math.floor(remaining / 86400),
    hours: Math.floor((remaining % 86400) / 3600),
    minutes: Math.floor((remaining % 3600) / 60),
    seconds: remaining % 60,
    complete: remaining === 0,
  };
}
