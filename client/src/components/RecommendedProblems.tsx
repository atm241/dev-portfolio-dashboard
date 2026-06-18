import { type Difficulty, RECOMMENDED_PROBLEMS } from '../lib/recommendedProblems';

const DIFFICULTY_COLOR: Record<Difficulty, string> = {
  Easy: 'text-green-400',
  Medium: 'text-amber-400',
  Hard: 'text-red-400',
};

/** `solvedSlugs` highlights problems the user has already completed. */
export function RecommendedProblems({ solvedSlugs }: { solvedSlugs: Set<string> }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {RECOMMENDED_PROBLEMS.map((group) => (
        <div key={group.pattern}>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-dim">{group.pattern}</h3>
          <ul className="space-y-1">
            {group.problems.map((p) => {
              const solved = solvedSlugs.has(p.slug);
              return (
                <li key={p.slug} className="flex items-baseline justify-between gap-2 text-sm">
                  <a
                    href={`https://leetcode.com/problems/${p.slug}/`}
                    target="_blank"
                    rel="noreferrer"
                    className="truncate hover:text-accent"
                  >
                    {solved && <span className="mr-1 text-green-400" title="Solved">✓</span>}
                    <span className={solved ? 'text-ink-dim line-through' : ''}>{p.title}</span>
                  </a>
                  <span className={`shrink-0 text-xs ${DIFFICULTY_COLOR[p.difficulty]}`}>{p.difficulty}</span>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
