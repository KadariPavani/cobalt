import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  FolderKanban,
  ListTodo,
  ArrowUpRight,
  Circle,
  Activity,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';

import Topbar from '@/components/Topbar';
import { StatCardSkeleton } from '@/components/Skeleton';
import StatusBadge from '@/components/StatusBadge';
import PriorityBadge from '@/components/PriorityBadge';
import EmptyState from '@/components/EmptyState';
import { dashboardApi } from '@/api/dashboard';
import { formatDate, fromNow, isOverdue } from '@/utils/format';
import { useAuthStore } from '@/store/authStore';

const STATUS_COLORS = {
  todo:        '#64748b',
  in_progress: '#f59e0b',
  completed:   '#10b981',
};
const PRIORITY_COLORS = {
  low:    '#3b6bf7',
  medium: '#f59e0b',
  high:   '#f43f5e',
};

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardApi.stats,
  });

  return (
    <>
      <Topbar breadcrumbs={[{ label: 'Dashboard' }]} />
      <main className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-7 max-w-[1480px] w-full mx-auto">
        <header className="flex items-end justify-between gap-4 flex-wrap">
          <div className="space-y-1.5">
            <p className="label">Overview</p>
            <h1 className="font-display text-fluid-h1 leading-[1.05] tracking-tightest text-slate-50">
              {greeting()}, {user?.name?.split(' ')[0] || 'there'}.
            </h1>
            <p className="text-[13.5px] text-slate-400 max-w-xl">
              A snapshot of every project and task across your workspace.
            </p>
          </div>
          <Link to="/projects" className="btn-secondary btn-sm">
            Manage projects <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </header>

        {/* Stat cards */}
        <section className="grid gap-3 grid-cols-2 lg:grid-cols-5">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => <StatCardSkeleton key={i} />)
          ) : (
            <>
              <StatCard label="Projects"     value={data.totalProjects}    hint={`${data.activeProjects} active`}        icon={FolderKanban} />
              <StatCard label="Total tasks"  value={data.totalTasks}       hint={`${data.completionRate}% complete`}     icon={ListTodo}     />
              <StatCard label="In progress"  value={data.inProgressTasks}  hint="Active work"                            icon={Clock}        />
              <StatCard label="Completed"    value={data.completedTasks}   hint="Across all projects"                    icon={CheckCircle2} />
              <StatCard label="Overdue"      value={data.overdueTasks}     hint={data.overdueTasks > 0 ? 'Needs attention' : 'All caught up'} icon={AlertTriangle} alert={data.overdueTasks > 0} />
            </>
          )}
        </section>

        {/* Charts */}
        <section className="grid gap-3 lg:grid-cols-3">
          <ChartCard title="Task status" subtitle="Distribution across all projects">
            {isLoading || !data ? (
              <ChartSkeleton />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'To-Do',       value: data.pendingTasks,    key: 'todo' },
                      { name: 'In Progress', value: data.inProgressTasks, key: 'in_progress' },
                      { name: 'Completed',   value: data.completedTasks,  key: 'completed' },
                    ]}
                    dataKey="value"
                    innerRadius={56}
                    outerRadius={86}
                    paddingAngle={3}
                    stroke="none"
                  >
                    {['todo', 'in_progress', 'completed'].map((k) => (
                      <Cell key={k} fill={STATUS_COLORS[k]} />
                    ))}
                  </Pie>
                  <Tooltip content={<DarkTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            )}
            {data && (
              <div className="flex justify-center gap-4 text-[11.5px] mt-1">
                {[
                  { k: 'todo', label: 'To-Do', v: data.pendingTasks },
                  { k: 'in_progress', label: 'In Progress', v: data.inProgressTasks },
                  { k: 'completed', label: 'Completed', v: data.completedTasks },
                ].map((s) => (
                  <span key={s.k} className="inline-flex items-center gap-1.5 text-slate-400">
                    <span className="h-2 w-2 rounded-sm" style={{ background: STATUS_COLORS[s.k] }} />
                    {s.label} <span className="text-slate-200 font-medium">{s.v}</span>
                  </span>
                ))}
              </div>
            )}
          </ChartCard>

          <ChartCard title="Tasks by priority" subtitle="Outstanding workload">
            {isLoading || !data ? (
              <ChartSkeleton />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={[
                    { name: 'Low',    value: data.tasksByPriority.low,    fill: PRIORITY_COLORS.low },
                    { name: 'Medium', value: data.tasksByPriority.medium, fill: PRIORITY_COLORS.medium },
                    { name: 'High',   value: data.tasksByPriority.high,   fill: PRIORITY_COLORS.high },
                  ]}
                  margin={{ top: 8, right: 8, left: -10, bottom: 0 }}
                >
                  <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" tickLine={false} axisLine={false} fontSize={11} />
                  <YAxis stroke="#64748b" tickLine={false} axisLine={false} fontSize={11} allowDecimals={false} />
                  <Tooltip content={<DarkTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          <ChartCard title="Completed (last 7 days)" subtitle="Daily throughput">
            {isLoading || !data ? (
              <ChartSkeleton />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart
                  data={data.completedLast7Days.map((d) => ({
                    day: formatDate(d.day, 'EEE'),
                    completed: d.completed,
                  }))}
                  margin={{ top: 8, right: 8, left: -10, bottom: 0 }}
                >
                  <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="day" stroke="#64748b" tickLine={false} axisLine={false} fontSize={11} />
                  <YAxis stroke="#64748b" tickLine={false} axisLine={false} fontSize={11} allowDecimals={false} />
                  <Tooltip content={<DarkTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="completed"
                    stroke="#3b6bf7"
                    strokeWidth={2}
                    dot={{ r: 3, stroke: '#3b6bf7', strokeWidth: 2, fill: '#0d1322' }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </section>

        {/* My tasks + Activity */}
        <section className="grid gap-3 lg:grid-cols-5">
          <div className="card p-5 lg:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-[15px] font-semibold tracking-tight">My tasks</h2>
                <p className="text-[12px] text-slate-500 mt-0.5">
                  Assigned to you, sorted by status and due date
                </p>
              </div>
              <Link
                to="/tasks"
                className="text-[12.5px] text-brand-400 hover:text-brand-300 inline-flex items-center gap-1"
              >
                View all <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-12 skeleton rounded-lg" />
                ))}
              </div>
            ) : data?.myTasks?.length ? (
              <ul className="divide-y divide-white/[0.04] -mx-2">
                {data.myTasks.map((t) => (
                  <li key={t.id} className="py-2.5 px-2 flex items-center gap-3 rounded-md hover:bg-white/[0.02]">
                    <Circle
                      className="h-3.5 w-3.5 shrink-0"
                      style={{ color: STATUS_COLORS[t.status] }}
                    />
                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/projects/${t.project_id}`}
                        className="text-[13.5px] font-medium hover:text-brand-300 truncate block leading-tight"
                      >
                        {t.title}
                      </Link>
                      <p className="text-[11.5px] text-slate-500 truncate mt-0.5">
                        {t.project_name}
                      </p>
                    </div>
                    <div className="hidden sm:flex items-center gap-2">
                      <PriorityBadge value={t.priority} />
                      {t.due_date && (
                        <span
                          className={`text-[11.5px] ${
                            isOverdue(t.due_date) && t.status !== 'completed'
                              ? 'text-rose-400 font-medium'
                              : 'text-slate-500'
                          }`}
                        >
                          {formatDate(t.due_date)}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                icon={ListTodo}
                title="Nothing on your plate"
                description="Tasks assigned to you will appear here."
              />
            )}
          </div>

          <div className="card p-5 lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="h-3.5 w-3.5 text-brand-400" />
              <h2 className="text-[15px] font-semibold tracking-tight">Recent activity</h2>
            </div>
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-10 skeleton rounded-lg" />
                ))}
              </div>
            ) : data?.recentActivity?.length ? (
              <ul className="space-y-3">
                {data.recentActivity.map((a) => (
                  <li key={a.id} className="flex gap-2.5 items-start">
                    <span
                      className="mt-1.5 h-1.5 w-1.5 rounded-full shrink-0"
                      style={{ background: STATUS_COLORS[a.status] }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] leading-snug">
                        <span className="text-slate-400">{a.actor_name || 'Someone'}</span>{' '}
                        updated{' '}
                        <Link
                          to={`/projects/${a.project_id}`}
                          className="font-medium text-slate-200 hover:text-brand-300"
                        >
                          {a.title}
                        </Link>{' '}
                        <span className="text-slate-500">in {a.project_name}</span>
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{fromNow(a.at)}</p>
                    </div>
                    <StatusBadge value={a.status} />
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState icon={Activity} title="No activity yet" />
            )}
          </div>
        </section>
      </main>
    </>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 5)  return 'Working late';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

const StatCard = ({ label, value, hint, icon: Icon, alert }) => (
  <div className="card card-hover p-4">
    <div className="flex items-start justify-between gap-2">
      <p className="label">{label}</p>
      <div
        className={`h-7 w-7 rounded-md grid place-items-center border ${
          alert
            ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            : 'bg-white/[0.03] border-white/[0.06] text-slate-400'
        }`}
      >
        <Icon className="h-3.5 w-3.5" />
      </div>
    </div>
    <p className="text-[28px] leading-none font-semibold tracking-tight mt-3 text-slate-50">{value}</p>
    <p className="text-[11.5px] text-slate-500 mt-1.5">{hint}</p>
  </div>
);

const ChartCard = ({ title, subtitle, children }) => (
  <div className="card p-5">
    <div className="mb-2">
      <h2 className="text-[15px] font-semibold tracking-tight">{title}</h2>
      <p className="text-[12px] text-slate-500 mt-0.5">{subtitle}</p>
    </div>
    {children}
  </div>
);

const ChartSkeleton = () => <div className="h-[220px] skeleton rounded-lg" />;

const DarkTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg bg-surface-850 border border-white/10 px-3 py-2 shadow-card text-[12px]">
      {label && <p className="text-slate-400 mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="text-slate-100 font-medium">
          {p.name || p.dataKey}: <span className="text-brand-300">{p.value}</span>
        </p>
      ))}
    </div>
  );
};
