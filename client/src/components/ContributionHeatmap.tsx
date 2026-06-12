const LEVEL_COLORS = ['#222c39', '#0e4429', '#006d32', '#26a641', '#39d353'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_LABELS: Record<number, string> = { 1: 'Mon', 3: 'Wed', 5: 'Fri' };

const CELL = 13;
const SIZE = 11;
const LEFT = 30;
const TOP = 18;

function levelFor(count: number): number {
  if (count === 0) return 0;
  if (count < 3) return 1;
  if (count < 6) return 2;
  if (count < 10) return 3;
  return 4;
}

export function ContributionHeatmap({ weeks }: { weeks: { date: string; count: number }[][] }) {
  const width = LEFT + weeks.length * CELL;
  const height = TOP + 7 * CELL;

  const monthLabels: { x: number; label: string }[] = [];
  let prevMonth = -1;
  weeks.forEach((week, i) => {
    const month = new Date(`${week[0].date}T00:00:00`).getMonth();
    if (month !== prevMonth) {
      // Skip a label that would collide with the next month's label.
      if (i < weeks.length - 3) {
        monthLabels.push({ x: LEFT + i * CELL, label: MONTHS[month] });
      }
      prevMonth = month;
    }
  });
  if (monthLabels.length > 1 && monthLabels[1].x - monthLabels[0].x < 3 * CELL) {
    monthLabels.shift();
  }

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="GitHub contribution calendar">
      {monthLabels.map((m) => (
        <text key={m.x} x={m.x} y={11} className="fill-ink-dim" fontSize={10}>
          {m.label}
        </text>
      ))}
      {Object.entries(DAY_LABELS).map(([day, label]) => (
        <text key={day} x={0} y={TOP + Number(day) * CELL + 9} className="fill-ink-dim" fontSize={10}>
          {label}
        </text>
      ))}
      {weeks.map((week, x) =>
        week.map((day, y) => (
          <rect
            key={day.date}
            x={LEFT + x * CELL}
            y={TOP + y * CELL}
            width={SIZE}
            height={SIZE}
            rx={2}
            fill={LEVEL_COLORS[levelFor(day.count)]}
          >
            <title>{`${day.date}: ${day.count} contribution${day.count === 1 ? '' : 's'}`}</title>
          </rect>
        ))
      )}
    </svg>
  );
}

export function HeatmapLegend() {
  return (
    <span className="flex items-center gap-1 text-xs text-ink-dim">
      Less
      {LEVEL_COLORS.map((c) => (
        <span key={c} className="inline-block h-2.5 w-2.5 rounded-xs" style={{ background: c }} />
      ))}
      More
    </span>
  );
}
