import { cn } from "@/lib/utils";

const L = 27,
  C = 50,
  R = 73;

const PIPS: Record<number, [number, number][]> = {
  1: [[C, C]],
  2: [
    [L, L],
    [R, R],
  ],
  3: [
    [L, L],
    [C, C],
    [R, R],
  ],
  4: [
    [L, L],
    [R, L],
    [L, R],
    [R, R],
  ],
  5: [
    [L, L],
    [R, L],
    [C, C],
    [L, R],
    [R, R],
  ],
  6: [
    [L, L],
    [R, L],
    [L, C],
    [R, C],
    [L, R],
    [R, R],
  ],
};

type DieProps = {
  value: number | null;
  keep?: boolean;
  className?: string;
};

export function Die({ value, keep = false, className }: DieProps) {
  const unknown = value === null;
  const kept = keep && !unknown;

  return (
    <svg
      viewBox="-8 -8 116 116"
      role="img"
      aria-label={
        unknown
          ? "Kostka: jeszcze nie rzucona"
          : kept
            ? `Kostka: ${value}, zatrzymana`
            : `Kostka: ${value}`
      }
      className={cn("size-16", className)}
    >
      <rect
        x="4"
        y="4"
        width="92"
        height="92"
        rx="18"
        strokeWidth="4"
        strokeDasharray={unknown ? "10 8" : undefined}
        className={cn(
          "transition-colors",
          unknown
            ? "fill-muted stroke-muted-foreground/50"
            : kept
              ? "fill-primary/10 stroke-primary"
              : "fill-card stroke-border",
        )}
      />

      {unknown ? (
        <text
          x="50"
          y="52"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="56"
          fontWeight="700"
          className="fill-muted-foreground select-none"
        >
          ?
        </text>
      ) : (
        PIPS[value]?.map(([cx, cy], i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r="9"
            className={cn(
              "transition-colors",
              kept ? "fill-primary" : "fill-foreground",
            )}
          />
        ))
      )}

      {kept && (
        <g>
          <circle
            cx="92"
            cy="8"
            r="14"
            className="fill-primary stroke-background"
            strokeWidth="3"
          />
          <path
            d="M85.5 8.5 l4.5 4.5 l8 -9"
            fill="none"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="stroke-primary-foreground"
          />
        </g>
      )}
    </svg>
  );
}
