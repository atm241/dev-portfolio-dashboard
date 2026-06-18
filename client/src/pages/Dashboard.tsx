import { useQuery } from '@tanstack/react-query';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { api } from '../lib/api';
import { ContributionHeatmap, HeatmapLegend } from '../components/ContributionHeatmap';
import { RecommendedProblems } from '../components/RecommendedProblems';
import { slugFromUrl } from '../lib/recommendedProblems';
import { Card, ErrorNote, Spinner, Stat, timeAgo } from '../components/ui';

function computeStreaks(weeks: { date: string; count: number }[][]) {
  const days = weeks.flat().sort((a, b) => a.date.localeCompare(b.date));

  let longestStreak = 0;
  let run = 0;
  for (const day of days) {
    if (day.count > 0) { run++; longestStreak = Math.max(longestStreak, run); }
    else { run = 0; }
  }

  const today = new Date().toISOString().slice(0, 10);
  const reversed = [...days].reverse();
  // If today has no contributions yet, allow the streak to still be "alive" from yesterday.
  const startIdx = reversed[0]?.date === today && reversed[0].count === 0 ? 1 : 0;
  let currentStreak = 0;
  for (let i = startIdx; i < reversed.length; i++) {
    if (reversed[i].count > 0) currentStreak++;
    else break;
  }

  return { currentStreak, longestStreak };
}

const LC_COLORS = { easy: '#22c55e', medium: '#eab308', hard: '#ef4444' };

export default function Dashboard() {
  const profile = useQuery({ queryKey: ['gh-profile'], queryFn: api.githubProfile });
  const repos = useQuery({ queryKey: ['gh-repos'], queryFn: api.githubRepos });
  const activity = useQuery({ queryKey: ['gh-activity'], queryFn: api.githubActivity });
  const leetcode = useQuery({ queryKey: ['leetcode'], queryFn: api.leetcode });
  const contributions = useQuery({ queryKey: ['gh-contributions'], queryFn: api.githubContributions });
  const lc = leetcode.data?.found ? leetcode.data : null;
  const streaks =
    contributions.data?.available ? computeStreaks(contributions.data.weeks) : null;
  // Recent accepted submissions let us tick off problems already solved.
  const solvedSlugs = new Set(
    (lc?.recent ?? []).map((s) => slugFromUrl(s.url)).filter((s): s is string => s !== null)
  );

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="lg:col-span-2">
        <Card
          title={
            contributions.data?.available
              ? `${contributions.data.total.toLocaleString()} contributions in the last year`
              : 'Contributions'
          }
          action={contributions.data?.available ? <HeatmapLegend /> : undefined}
        >
          {contributions.isPending && <Spinner />}
          {contributions.error && <ErrorNote message={contributions.error.message} />}
          {contributions.data && !contributions.data.available && (
            <p className="text-sm text-ink-dim">
              Set <code className="rounded bg-surface px-1.5 py-0.5">GITHUB_TOKEN</code> in .env to enable the
              contribution heatmap (no scopes needed for public data).
            </p>
          )}
          {contributions.data?.available && (
            <>
              <ContributionHeatmap weeks={contributions.data.weeks} />
              {streaks && (
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <Stat label="Current streak" value={`${streaks.currentStreak}d`} />
                  <Stat label="Longest streak" value={`${streaks.longestStreak}d`} />
                </div>
              )}
            </>
          )}
        </Card>
      </div>

      <Card title="GitHub Profile">
        {profile.isPending && <Spinner />}
        {profile.error && <ErrorNote message={profile.error.message} />}
        {profile.data && (
          <div>
            <div className="flex items-center gap-4">
              <img src={profile.data.avatar_url} alt="" className="h-16 w-16 rounded-full" />
              <div>
                <a href={profile.data.html_url} target="_blank" rel="noreferrer" className="text-lg font-semibold hover:text-accent">
                  {profile.data.name ?? profile.data.login}
                </a>
                <p className="text-sm text-ink-dim">@{profile.data.login}</p>
                {profile.data.bio && <p className="mt-1 text-sm text-ink-dim">{profile.data.bio}</p>}
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <Stat label="Public repos" value={profile.data.public_repos} />
              <Stat label="Followers" value={profile.data.followers} />
              <Stat label="On GitHub since" value={new Date(profile.data.created_at).getFullYear()} />
            </div>
          </div>
        )}
      </Card>

      <Card title="LeetCode Progress">
        {leetcode.isPending && <Spinner />}
        {leetcode.error && <ErrorNote message={leetcode.error.message} />}
        {leetcode.data && !leetcode.data.found && (
          <ErrorNote message={`LeetCode user "${leetcode.data.username}" not found — set LEETCODE_USERNAME in .env`} />
        )}
        {lc && (
          <div className="flex items-center gap-6">
            <div className="h-36 w-36 shrink-0">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={(['easy', 'medium', 'hard'] as const).map((d) => ({
                      name: d,
                      value: lc.solved[d].solved,
                    }))}
                    dataKey="value"
                    innerRadius={42}
                    outerRadius={62}
                    strokeWidth={0}
                  >
                    {(['easy', 'medium', 'hard'] as const).map((d) => (
                      <Cell key={d} fill={LC_COLORS[d]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1a212b', border: '1px solid #2a3442' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grow space-y-2">
              <p className="text-2xl font-bold">
                {lc.solved.all.solved}
                <span className="text-sm font-normal text-ink-dim"> / {lc.solved.all.total} solved</span>
              </p>
              {(['easy', 'medium', 'hard'] as const).map((d) => (
                <div key={d} className="flex items-center gap-2 text-sm">
                  <span className="w-16 capitalize" style={{ color: LC_COLORS[d] }}>{d}</span>
                  <div className="h-1.5 grow rounded bg-surface">
                    <div
                      className="h-1.5 rounded"
                      style={{
                        background: LC_COLORS[d],
                        width: `${(lc.solved[d].solved / Math.max(1, lc.solved[d].total)) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="w-20 text-right text-ink-dim">
                    {lc.solved[d].solved}/{lc.solved[d].total}
                  </span>
                </div>
              ))}
              <p className="text-xs text-ink-dim">Global ranking #{lc.ranking.toLocaleString()}</p>
            </div>
          </div>
        )}
      </Card>

      <div className="lg:col-span-2">
        <Card
          title="Recommended Problems"
          action={<span className="text-xs text-ink-dim">Blind 75 starter set, by pattern</span>}
        >
          <RecommendedProblems solvedSlugs={solvedSlugs} />
        </Card>
      </div>

      <Card title="Pinned Repositories">
        {repos.isPending && <Spinner />}
        {repos.error && <ErrorNote message={repos.error.message} />}
        {repos.data && (
          <ul className="space-y-3">
            {repos.data.repos.slice(0, 6).map((r) => (
              <li key={r.name} className="rounded-lg bg-surface p-3">
                <div className="flex items-baseline justify-between gap-2">
                  <a href={r.url} target="_blank" rel="noreferrer" className="font-medium hover:text-accent">
                    {r.name}
                  </a>
                  <span className="shrink-0 text-xs text-ink-dim">
                    {r.language && <span className="mr-2">{r.language}</span>}
                    ★ {r.stars} · updated {timeAgo(r.pushedAt)}
                  </span>
                </div>
                {r.description && <p className="mt-1 text-sm text-ink-dim">{r.description}</p>}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="Recent Activity">
        {activity.isPending && <Spinner />}
        {activity.error && <ErrorNote message={activity.error.message} />}
        {activity.data && activity.data.length === 0 && (
          <p className="text-sm text-ink-dim">No recent public activity.</p>
        )}
        {activity.data && (
          <ul className="space-y-2">
            {activity.data.slice(0, 10).map((e, i) => (
              <li key={i} className="flex items-baseline gap-3 text-sm">
                <span className="shrink-0 text-xs text-ink-dim">{timeAgo(e.date)}</span>
                <span>
                  <span className="font-medium">{e.summary}</span>
                  <span className="text-ink-dim"> in {e.repo}</span>
                  {e.detail && <span className="block truncate text-xs text-ink-dim">“{e.detail}”</span>}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
